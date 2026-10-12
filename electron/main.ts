import { app, BrowserWindow, ipcMain, screen, powerMonitor, shell } from 'electron';
import path from 'path';
import fs from 'fs';
import { execFile } from 'child_process';
import { StorageManager } from './storage';
import { StudySession, UserSettings, UserProfile } from './types';

let mainWindow: BrowserWindow | null = null;
let storage: StorageManager | null = null;

// Tracking state for FOCUSING phase
let mouseTrackingTimer: NodeJS.Timeout | null = null;
let mouseTrackingActive = false;
let lastCursorPoint: { x: number; y: number } | null = null;
let mouseSensitivityThreshold = 3;
let isCheckingAllowedApp = false;

// Tracking state for WAITING (silence) phase
let silenceTrackingTimer: NodeJS.Timeout | null = null;
let silenceTrackingActive = false;
let silenceLastPoint: { x: number; y: number } | null = null;
let silenceElapsedMs = 0;
let silenceTargetMs = 5000;

function createWindow() {
  storage = new StorageManager();
  const settings = storage.getSettings();

  mainWindow = new BrowserWindow({
    width: 1040,
    height: 780,
    minWidth: 880,
    minHeight: 680,
    title: '스터디윗뭉 — Study with Mung',
    frame: false,
    backgroundColor: '#F4F8FC',
    alwaysOnTop: settings.alwaysOnTop,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
    icon: path.join(__dirname, '../assets/sumung/sumung_celebrate.png'),
    show: false,
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
  });

  const devServerUrl = process.env.VITE_DEV_SERVER_URL || (process.argv.includes('--dev') ? 'http://localhost:5173' : null);

  if (devServerUrl) {
    mainWindow.loadURL(devServerUrl);
  } else if (!app.isPackaged && process.env.NODE_ENV !== 'production' && !fs.existsSync(path.join(__dirname, '../dist/index.html'))) {
    mainWindow.loadURL('http://localhost:5173');
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.on('closed', () => {
    stopMouseTracking();
    stopSilenceTracking();
    mainWindow = null;
  });

  powerMonitor.on('suspend', () => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('system:event', { type: 'suspend' });
    }
  });

  powerMonitor.on('lock-screen', () => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('system:event', { type: 'lock-screen' });
    }
  });

  powerMonitor.on('resume', () => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('system:event', { type: 'resume' });
    }
  });
}

// ---------------- Whitelist / Allowed Apps Verification ---------------- //

function checkIsAllowedAppActive(callback: (isAllowed: boolean, matchedApp?: string) => void) {
  const settings = storage?.getSettings();
  if (!settings || !settings.whitelistEnabled || !settings.allowedApps || settings.allowedApps.length === 0) {
    callback(false);
    return;
  }

  const enabledApps = settings.allowedApps.filter((a) => a.enabled);
  if (enabledApps.length === 0) {
    callback(false);
    return;
  }

  const scriptPath = path.join(__dirname, 'active_window.ps1');
  if (!fs.existsSync(scriptPath)) {
    callback(false);
    return;
  }

  execFile(
    'powershell',
    ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', scriptPath],
    { timeout: 900 },
    (err, stdout) => {
      if (err || !stdout) {
        callback(false);
        return;
      }
      const title = stdout.trim().toLowerCase();
      for (const app of enabledApps) {
        const keywords = app.keyword.toLowerCase().split('|');
        for (const kw of keywords) {
          const trimmed = kw.trim();
          if (trimmed && title.includes(trimmed)) {
            callback(true, app.name);
            return;
          }
        }
      }
      callback(false);
    }
  );
}

// ---------------- Mouse Movement Detection ---------------- //

function startMouseTracking(threshold: number) {
  stopMouseTracking();
  stopSilenceTracking();

  mouseSensitivityThreshold = Math.max(1, threshold);
  lastCursorPoint = screen.getCursorScreenPoint();
  mouseTrackingActive = true;
  isCheckingAllowedApp = false;

  mouseTrackingTimer = setInterval(() => {
    if (!mouseTrackingActive || !mainWindow || mainWindow.isDestroyed() || isCheckingAllowedApp) return;

    try {
      const current = screen.getCursorScreenPoint();
      if (!lastCursorPoint) {
        lastCursorPoint = current;
        return;
      }

      const dx = current.x - lastCursorPoint.x;
      const dy = current.y - lastCursorPoint.y;
      const distance = Math.hypot(dx, dy);

      if (distance >= mouseSensitivityThreshold) {
        // Movement detected! Check if moving inside an allowed study app
        const settings = storage?.getSettings();
        if (settings?.whitelistEnabled) {
          isCheckingAllowedApp = true;
          checkIsAllowedAppActive((isAllowed, matchedApp) => {
            isCheckingAllowedApp = false;
            if (!mouseTrackingActive || !mainWindow || mainWindow.isDestroyed()) return;

            if (isAllowed) {
              // Allowed app is active! Keep focus session running
              lastCursorPoint = screen.getCursorScreenPoint();
              mainWindow.webContents.send('mouse:allowed-app-active', {
                appName: matchedApp || '허용된 공부 앱',
                timestamp: Date.now(),
              });
            } else {
              // Interruption!
              stopMouseTracking();
              mainWindow.webContents.send('mouse:moved', {
                distance,
                current,
                last: lastCursorPoint,
                timestamp: Date.now(),
              });
            }
          });
        } else {
          // Whitelist not enabled -> Immediate interruption
          stopMouseTracking();
          mainWindow.webContents.send('mouse:moved', {
            distance,
            current,
            last: lastCursorPoint,
            timestamp: Date.now(),
          });
        }
      }
    } catch (err) {
      console.error('[MouseTracking] Error checking cursor:', err);
    }
  }, 60);
}

function stopMouseTracking() {
  mouseTrackingActive = false;
  isCheckingAllowedApp = false;
  if (mouseTrackingTimer) {
    clearInterval(mouseTrackingTimer);
    mouseTrackingTimer = null;
  }
  lastCursorPoint = null;
}

// ---------------- Silence / Inactivity Watcher (Waiting Phase) ---------------- //

function startSilenceTracking(targetDurationMs: number, threshold: number) {
  stopMouseTracking();
  stopSilenceTracking();

  silenceTargetMs = targetDurationMs;
  mouseSensitivityThreshold = Math.max(1, threshold);
  silenceLastPoint = screen.getCursorScreenPoint();
  silenceElapsedMs = 0;
  silenceTrackingActive = true;

  const checkInterval = 100;
  silenceTrackingTimer = setInterval(() => {
    if (!silenceTrackingActive || !mainWindow || mainWindow.isDestroyed()) return;

    try {
      const current = screen.getCursorScreenPoint();
      if (!silenceLastPoint) {
        silenceLastPoint = current;
        return;
      }

      const dx = current.x - silenceLastPoint.x;
      const dy = current.y - silenceLastPoint.y;
      const distance = Math.hypot(dx, dy);

      if (distance >= mouseSensitivityThreshold) {
        silenceLastPoint = current;
        silenceElapsedMs = 0;
        mainWindow.webContents.send('silence:reset', {
          distance,
          remainingMs: silenceTargetMs,
        });
      } else {
        silenceElapsedMs += checkInterval;
        const remainingMs = Math.max(0, silenceTargetMs - silenceElapsedMs);
        mainWindow.webContents.send('silence:tick', {
          remainingMs,
          elapsedMs: silenceElapsedMs,
          targetMs: silenceTargetMs,
        });

        if (silenceElapsedMs >= silenceTargetMs) {
          stopSilenceTracking();
          mainWindow.webContents.send('silence:complete');
        }
      }
    } catch (err) {
      console.error('[SilenceTracking] Error checking cursor:', err);
    }
  }, checkInterval);
}

function stopSilenceTracking() {
  silenceTrackingActive = false;
  if (silenceTrackingTimer) {
    clearInterval(silenceTrackingTimer);
    silenceTrackingTimer = null;
  }
  silenceLastPoint = null;
  silenceElapsedMs = 0;
}

// ---------------- IPC Setup ---------------- //

function registerIpcHandlers() {
  ipcMain.on('mouse:start-tracking', (_, threshold: number) => {
    startMouseTracking(threshold);
  });

  ipcMain.on('mouse:stop-tracking', () => {
    stopMouseTracking();
  });

  ipcMain.on('silence:start-tracking', (_, { targetMs, threshold }: { targetMs: number; threshold: number }) => {
    startSilenceTracking(targetMs, threshold);
  });

  ipcMain.on('silence:stop-tracking', () => {
    stopSilenceTracking();
  });

  ipcMain.handle('mouse:get-cursor-point', () => {
    try {
      return screen.getCursorScreenPoint();
    } catch (err) {
      return { x: 0, y: 0 };
    }
  });

  // Storage IPC
  ipcMain.handle('storage:get-records', () => {
    return storage?.getRecords() || [];
  });

  ipcMain.handle('storage:save-record', (_, record: StudySession) => {
    return storage?.saveRecord(record) || [];
  });

  ipcMain.handle('storage:delete-record', (_, id: string) => {
    return storage?.deleteRecord(id) || [];
  });

  ipcMain.handle('storage:clear-records', () => {
    return storage?.clearRecords() || [];
  });

  ipcMain.handle('storage:get-settings', () => {
    return storage?.getSettings();
  });

  ipcMain.handle('storage:save-settings', (_, newSettings: Partial<UserSettings>) => {
    const updated = storage?.saveSettings(newSettings);
    if (updated && mainWindow && !mainWindow.isDestroyed()) {
      if (typeof updated.alwaysOnTop === 'boolean') {
        mainWindow.setAlwaysOnTop(updated.alwaysOnTop);
      }
    }
    return updated;
  });

  ipcMain.handle('storage:get-profile', () => {
    return storage?.getProfile();
  });

  ipcMain.handle('storage:save-profile', (_, profile: Partial<UserProfile>) => {
    return storage?.saveProfile(profile);
  });

  ipcMain.handle('storage:get-path', () => {
    return storage?.getStoragePath();
  });

  // Window Controls
  ipcMain.on('window:minimize', () => {
    mainWindow?.minimize();
  });

  ipcMain.on('window:maximize', () => {
    if (mainWindow) {
      if (mainWindow.isMaximized()) {
        mainWindow.unmaximize();
      } else {
        mainWindow.maximize();
      }
    }
  });

  ipcMain.on('window:close', () => {
    mainWindow?.close();
  });

  ipcMain.on('window:set-always-on-top', (_, flag: boolean) => {
    mainWindow?.setAlwaysOnTop(flag);
  });
}

// ---------------- App Lifecycle ---------------- //

const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });

  app.whenReady().then(() => {
    registerIpcHandlers();
    createWindow();

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
      }
    });
  });

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });

  app.on('before-quit', () => {
    stopMouseTracking();
    stopSilenceTracking();
  });
}
