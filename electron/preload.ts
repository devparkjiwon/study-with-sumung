import { contextBridge, ipcRenderer } from 'electron';
import { StudySession, UserSettings, UserProfile } from './types';

export const api = {
  // Mouse Tracking
  startMouseTracking: (threshold: number) => {
    ipcRenderer.send('mouse:start-tracking', threshold);
  },
  stopMouseTracking: () => {
    ipcRenderer.send('mouse:stop-tracking');
  },
  onMouseMoved: (callback: (data: { distance: number; current: { x: number; y: number }; last: { x: number; y: number }; timestamp: number }) => void) => {
    const subscription = (_event: any, data: any) => callback(data);
    ipcRenderer.on('mouse:moved', subscription);
    return () => {
      ipcRenderer.removeListener('mouse:moved', subscription);
    };
  },
  onAllowedAppActive: (callback: (data: { appName: string; timestamp: number }) => void) => {
    const subscription = (_event: any, data: any) => callback(data);
    ipcRenderer.on('mouse:allowed-app-active', subscription);
    return () => {
      ipcRenderer.removeListener('mouse:allowed-app-active', subscription);
    };
  },
  getCursorPoint: (): Promise<{ x: number; y: number }> => {
    return ipcRenderer.invoke('mouse:get-cursor-point');
  },

  // Silence Tracking (Waiting for 5s of inactivity)
  startSilenceTracking: (targetMs: number, threshold: number) => {
    ipcRenderer.send('silence:start-tracking', { targetMs, threshold });
  },
  stopSilenceTracking: () => {
    ipcRenderer.send('silence:stop-tracking');
  },
  onSilenceTick: (callback: (data: { remainingMs: number; elapsedMs: number; targetMs: number }) => void) => {
    const subscription = (_event: any, data: any) => callback(data);
    ipcRenderer.on('silence:tick', subscription);
    return () => {
      ipcRenderer.removeListener('silence:tick', subscription);
    };
  },
  onSilenceReset: (callback: (data: { distance: number; remainingMs: number }) => void) => {
    const subscription = (_event: any, data: any) => callback(data);
    ipcRenderer.on('silence:reset', subscription);
    return () => {
      ipcRenderer.removeListener('silence:reset', subscription);
    };
  },
  onSilenceComplete: (callback: () => void) => {
    const subscription = () => callback();
    ipcRenderer.on('silence:complete', subscription);
    return () => {
      ipcRenderer.removeListener('silence:complete', subscription);
    };
  },

  // System Events (Sleep, Lock, Resume)
  onSystemEvent: (callback: (data: { type: string }) => void) => {
    const subscription = (_event: any, data: any) => callback(data);
    ipcRenderer.on('system:event', subscription);
    return () => {
      ipcRenderer.removeListener('system:event', subscription);
    };
  },

  // Storage
  getRecords: (): Promise<StudySession[]> => {
    return ipcRenderer.invoke('storage:get-records');
  },
  saveRecord: (record: StudySession): Promise<StudySession[]> => {
    return ipcRenderer.invoke('storage:save-record', record);
  },
  deleteRecord: (id: string): Promise<StudySession[]> => {
    return ipcRenderer.invoke('storage:delete-record', id);
  },
  clearRecords: (): Promise<StudySession[]> => {
    return ipcRenderer.invoke('storage:clear-records');
  },
  getSettings: (): Promise<UserSettings> => {
    return ipcRenderer.invoke('storage:get-settings');
  },
  saveSettings: (settings: Partial<UserSettings>): Promise<UserSettings> => {
    return ipcRenderer.invoke('storage:save-settings', settings);
  },
  getProfile: (): Promise<UserProfile> => {
    return ipcRenderer.invoke('storage:get-profile');
  },
  saveProfile: (profile: Partial<UserProfile>): Promise<UserProfile> => {
    return ipcRenderer.invoke('storage:save-profile', profile);
  },
  getStoragePath: (): Promise<string> => {
    return ipcRenderer.invoke('storage:get-path');
  },

  // Window Controls
  minimize: () => {
    ipcRenderer.send('window:minimize');
  },
  maximize: () => {
    ipcRenderer.send('window:maximize');
  },
  close: () => {
    ipcRenderer.send('window:close');
  },
  setAlwaysOnTop: (flag: boolean) => {
    ipcRenderer.send('window:set-always-on-top', flag);
  },
};

contextBridge.exposeInMainWorld('electronAPI', api);

export type ElectronAPI = typeof api;
