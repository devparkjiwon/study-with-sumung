import { useState, useEffect, useRef, useCallback } from 'react';
import { StudyState, StudySession, UserSettings, UserProfile, Milestone, AllowedApp } from '../types';
import { getTodayDateString } from '../utils/format';
import { playTick, playStart, playInterrupted, playMilestone, playPop } from '../utils/sound';
import { syncSessionToCloud } from '../services/api';
import confetti from 'canvas-confetti';

const MILESTONES: Milestone[] = [
  { seconds: 1500, label: '25분', title: '🍅 뽀모도로 1세트 달성!', message: '25분 동안 마우스를 전혀 건드리지 않고 집중했습니다!' },
  { seconds: 3000, label: '50분', title: '🔥 50분 집중 돌파!', message: '엄청난 집중력이에요! 상명대 수석이 눈앞에!' },
  { seconds: 3600, label: '1시간', title: '👑 1시간 연속 몰입!', message: '1시간 연속 무빙 없이 완벽하게 집중 성공!' },
  { seconds: 7200, label: '2시간', title: '🏆 2시간 집중 신화!', message: '진정한 집중의 신! 대단한 끈기입니다.' },
];

const DEFAULT_ALLOWED_APPS: AllowedApp[] = [
  { id: 'app-vscode', name: 'Visual Studio Code', keyword: 'code', enabled: true, iconType: 'code' },
  { id: 'app-notion', name: 'Notion (노션)', keyword: 'notion', enabled: true, iconType: 'file-text' },
  { id: 'app-pdf', name: 'Adobe Acrobat / PDF 뷰어', keyword: 'pdf', enabled: true, iconType: 'book-open' },
  { id: 'app-ecampus', name: '상명대학교 e-Campus', keyword: 'campus', enabled: true, iconType: 'graduation-cap' },
  { id: 'app-chatgpt', name: 'ChatGPT / Claude (학습 AI)', keyword: 'chatgpt', enabled: true, iconType: 'bot' },
  { id: 'app-zoom', name: 'Zoom (화상 회의/스터디)', keyword: 'zoom', enabled: true, iconType: 'video' },
  { id: 'app-word', name: '한글(HWP) / MS Word', keyword: 'word', enabled: true, iconType: 'file' },
];

export function useFocusManager() {
  // Settings & Records State
  const [settings, setSettings] = useState<UserSettings>({
    mouseSensitivity: 3,
    autoRestart: true,
    autoRestartDelay: 5,
    soundEnabled: true,
    alwaysOnTop: false,
    darkMode: false,
    dailyGoalMinutes: 120,
    whitelistEnabled: true,
    allowedApps: DEFAULT_ALLOWED_APPS,
  });
  const [records, setRecords] = useState<StudySession[]>([]);
  const [profile, setProfile] = useState<UserProfile>({
    studentId: '20241001',
    nickname: '상명대 수뭉이',
    department: '소프트웨어학과',
    profileIcon: 'sumung_1',
    isLoggedIn: true,
  });

  // State Machine
  const [state, setState] = useState<StudyState>('IDLE');
  const [countdownNumber, setCountdownNumber] = useState<number>(3);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [lastSavedDuration, setLastSavedDuration] = useState<number>(0);
  const [silenceRemainingSeconds, setSilenceRemainingSeconds] = useState<number>(5);

  // Allowed app active feedback toast
  const [allowedAppToast, setAllowedAppToast] = useState<string | null>(null);

  // Celebration state
  const [isCelebrating, setIsCelebrating] = useState<boolean>(false);
  const [currentMilestone, setCurrentMilestone] = useState<Milestone | null>(null);

  // Monotonic timer references
  const focusStartTimeRef = useRef<number | null>(null);
  const sessionStartIsoRef = useRef<string | null>(null);
  const timerRafRef = useRef<number | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const achievedMilestonesRef = useRef<Set<number>>(new Set());

  // Check if running inside Electron
  const isElectron = typeof window !== 'undefined' && 'electronAPI' in window;
  const electron = isElectron ? (window as any).electronAPI : null;

  // Load initial settings, profile, and records from electron storage
  useEffect(() => {
    if (electron) {
      electron.getSettings().then((res: UserSettings) => {
        if (res) setSettings(res);
      });
      electron.getRecords().then((res: StudySession[]) => {
        if (res) setRecords(res);
      });
      electron.getProfile().then((res: UserProfile) => {
        if (res) setProfile(res);
      });
    }
  }, [electron]);

  // Synchronize dark mode class to <html>
  useEffect(() => {
    if (settings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.darkMode]);

  // Save session to persistent store and update local state
  const persistSession = useCallback(
    async (durationSec: number, reason: StudySession['endReason']) => {
      if (durationSec <= 0) return;

      const now = new Date();
      const startTime = sessionStartIsoRef.current || new Date(now.getTime() - durationSec * 1000).toISOString();
      const endTime = now.toISOString();

      const newRecord: StudySession = {
        id: `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        startTime,
        endTime,
        durationSeconds: Math.floor(durationSec),
        endReason: reason,
        date: getTodayDateString(),
      };

      setLastSavedDuration(Math.floor(durationSec));

      if (electron) {
        const updated = await electron.saveRecord(newRecord);
        setRecords(updated);
      } else {
        setRecords((prev) => [newRecord, ...prev]);
      }

      // Sync with Netlify Cloud Database in background
      syncSessionToCloud(profile.studentId || '20241001', newRecord);
    },
    [electron, profile.studentId]
  );

  // Fire milestone celebration effect
  const triggerCelebration = useCallback((milestone: Milestone) => {
    setCurrentMilestone(milestone);
    setIsCelebrating(true);
    playMilestone(settings.soundEnabled);

    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#38A3F6', '#60A5FA', '#FBBF24', '#F43F5E', '#10B981'],
      });
    } catch (e) {
      // fallback
    }

    setTimeout(() => {
      setIsCelebrating(false);
      setCurrentMilestone(null);
    }, 4500);
  }, [settings.soundEnabled]);

  // Clean up animation frame timer
  const stopMonotonicTimer = useCallback(() => {
    if (timerRafRef.current) {
      cancelAnimationFrame(timerRafRef.current);
      timerRafRef.current = null;
    }
  }, []);

  // Update monotonic timer tick
  const updateFocusTick = useCallback(() => {
    if (focusStartTimeRef.current === null) return;
    const now = performance.now();
    const elapsed = (now - focusStartTimeRef.current) / 1000;
    const wholeSec = Math.floor(elapsed);

    setElapsedSeconds(wholeSec);

    for (const m of MILESTONES) {
      if (wholeSec >= m.seconds && !achievedMilestonesRef.current.has(m.seconds)) {
        achievedMilestonesRef.current.add(m.seconds);
        triggerCelebration(m);
      }
    }

    timerRafRef.current = requestAnimationFrame(updateFocusTick);
  }, [triggerCelebration]);

  // Transition to INTERRUPTED state
  const handleMouseInterrupted = useCallback(() => {
    stopMonotonicTimer();
    if (electron) {
      electron.stopMouseTracking();
    }

    let finalSeconds = 0;
    if (focusStartTimeRef.current !== null) {
      finalSeconds = (performance.now() - focusStartTimeRef.current) / 1000;
    }
    focusStartTimeRef.current = null;
    sessionStartIsoRef.current = null;

    persistSession(finalSeconds, 'mouse_movement');

    playInterrupted(settings.soundEnabled);
    setState('INTERRUPTED');
    setElapsedSeconds(0);

    setTimeout(() => {
      if (settings.autoRestart) {
        startWaitingSilence();
      } else {
        setState('IDLE');
      }
    }, 1400);
  }, [electron, stopMonotonicTimer, persistSession, settings.soundEnabled, settings.autoRestart]);

  // Transition to WAITING silence detection
  const startWaitingSilence = useCallback(() => {
    setState('WAITING');
    setSilenceRemainingSeconds(settings.autoRestartDelay);

    if (electron) {
      electron.startSilenceTracking(settings.autoRestartDelay * 1000, settings.mouseSensitivity);
    } else {
      const interval = setInterval(() => {
        setSilenceRemainingSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            startCountdown();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  }, [electron, settings.autoRestartDelay, settings.mouseSensitivity]);

  // Transition to COUNTDOWN
  const startCountdown = useCallback(() => {
    stopMonotonicTimer();
    if (electron) {
      electron.stopMouseTracking();
      electron.stopSilenceTracking();
    }

    setState('COUNTDOWN');
    setCountdownNumber(3);
    playTick(settings.soundEnabled);

    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
    }

    let count = 3;
    countdownIntervalRef.current = setInterval(() => {
      count -= 1;
      if (count > 0) {
        setCountdownNumber(count);
        playTick(settings.soundEnabled);
      } else {
        clearInterval(countdownIntervalRef.current!);
        countdownIntervalRef.current = null;
        startFocusingSession();
      }
    }, 1000);
  }, [electron, stopMonotonicTimer, settings.soundEnabled]);

  // Transition to FOCUSING
  const startFocusingSession = useCallback(() => {
    setState('FOCUSING');
    setElapsedSeconds(0);
    achievedMilestonesRef.current.clear();
    focusStartTimeRef.current = performance.now();
    sessionStartIsoRef.current = new Date().toISOString();

    playStart(settings.soundEnabled);

    timerRafRef.current = requestAnimationFrame(updateFocusTick);

    if (electron) {
      electron.startMouseTracking(settings.mouseSensitivity);
    }
  }, [electron, settings.mouseSensitivity, settings.soundEnabled, updateFocusTick]);

  // Manual stop button
  const manualStop = useCallback(() => {
    stopMonotonicTimer();
    if (electron) {
      electron.stopMouseTracking();
      electron.stopSilenceTracking();
    }
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
    }

    let finalSeconds = 0;
    if (focusStartTimeRef.current !== null) {
      finalSeconds = (performance.now() - focusStartTimeRef.current) / 1000;
    }
    focusStartTimeRef.current = null;
    sessionStartIsoRef.current = null;

    if (finalSeconds > 0) {
      persistSession(finalSeconds, 'manual_stop');
    }

    setState('IDLE');
    setElapsedSeconds(0);
  }, [electron, stopMonotonicTimer, persistSession]);

  // Cancel waiting phase and return to IDLE
  const cancelWaiting = useCallback(() => {
    if (electron) {
      electron.stopSilenceTracking();
    }
    setState('IDLE');
    setElapsedSeconds(0);
  }, [electron]);

  // Setup IPC event listeners from electron
  useEffect(() => {
    if (!electron) return;

    // When mouse moved during FOCUSING
    const unsubMoved = electron.onMouseMoved(() => {
      if (state === 'FOCUSING') {
        handleMouseInterrupted();
      }
    });

    // When allowed app is active while moving mouse!
    const unsubAllowedApp = electron.onAllowedAppActive((data: { appName: string }) => {
      if (state === 'FOCUSING') {
        setAllowedAppToast(`📝 허용된 앱 [${data.appName}] 사용 중 — 집중 유지 중!`);
        playPop(settings.soundEnabled);
        setTimeout(() => setAllowedAppToast(null), 2500);
      }
    });

    // When silence timer ticks during WAITING
    const unsubSilenceTick = electron.onSilenceTick((data: { remainingMs: number }) => {
      if (state === 'WAITING') {
        setSilenceRemainingSeconds(Math.ceil(data.remainingMs / 1000));
      }
    });

    // When mouse moved during WAITING
    const unsubSilenceReset = electron.onSilenceReset(() => {
      if (state === 'WAITING') {
        setSilenceRemainingSeconds(settings.autoRestartDelay);
      }
    });

    // When silence is successfully completed for full duration
    const unsubSilenceComplete = electron.onSilenceComplete(() => {
      if (state === 'WAITING') {
        startCountdown();
      }
    });

    // When system suspends or locks
    const unsubSystem = electron.onSystemEvent((evt: { type: string }) => {
      if (state === 'FOCUSING') {
        manualStop();
      }
    });

    return () => {
      unsubMoved?.();
      unsubAllowedApp?.();
      unsubSilenceTick?.();
      unsubSilenceReset?.();
      unsubSilenceComplete?.();
      unsubSystem?.();
    };
  }, [
    electron,
    state,
    handleMouseInterrupted,
    settings.autoRestartDelay,
    settings.soundEnabled,
    startCountdown,
    manualStop,
  ]);

  // Browser mouse movement fallback if testing without Electron
  useEffect(() => {
    if (isElectron) return;

    let lastBrowserPos: { x: number; y: number } | null = null;
    const handleMouseMove = (e: MouseEvent) => {
      if (state === 'FOCUSING') {
        if (!lastBrowserPos) {
          lastBrowserPos = { x: e.clientX, y: e.clientY };
          return;
        }
        const dist = Math.hypot(e.clientX - lastBrowserPos.x, e.clientY - lastBrowserPos.y);
        if (dist >= settings.mouseSensitivity) {
          handleMouseInterrupted();
        }
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isElectron, state, settings.mouseSensitivity, handleMouseInterrupted]);

  // Settings update handler
  const updateSettings = useCallback(
    async (partial: Partial<UserSettings>) => {
      const updated = { ...settings, ...partial };
      setSettings(updated);
      if (electron) {
        await electron.saveSettings(partial);
      }
    },
    [electron, settings]
  );

  // Profile update handler
  const updateProfile = useCallback(
    async (partial: Partial<UserProfile>) => {
      const updated = { ...profile, ...partial };
      setProfile(updated);
      if (electron) {
        await electron.saveProfile(partial);
      }
    },
    [electron, profile]
  );

  // Delete single record
  const deleteRecord = useCallback(
    async (id: string) => {
      if (electron) {
        const updated = await electron.deleteRecord(id);
        setRecords(updated);
      } else {
        setRecords((prev) => prev.filter((r) => r.id !== id));
      }
    },
    [electron]
  );

  // Clear all records
  const clearAllRecords = useCallback(async () => {
    if (electron) {
      const updated = await electron.clearRecords();
      setRecords(updated);
    } else {
      setRecords([]);
    }
  }, [electron]);

  return {
    state,
    elapsedSeconds,
    countdownNumber,
    lastSavedDuration,
    silenceRemainingSeconds,
    records,
    settings,
    profile,
    allowedAppToast,
    isCelebrating,
    currentMilestone,
    startCountdown,
    manualStop,
    cancelWaiting,
    updateSettings,
    updateProfile,
    deleteRecord,
    clearAllRecords,
  };
}
