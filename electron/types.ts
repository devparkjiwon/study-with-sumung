export interface StudySession {
  id: string;
  startTime: string; // ISO 8601 string
  endTime: string;   // ISO 8601 string
  durationSeconds: number;
  endReason: 'mouse_movement' | 'manual_stop' | 'app_quit' | 'power_suspend';
  date: string;      // YYYY-MM-DD
}

export interface AllowedApp {
  id: string;
  name: string;
  keyword: string;
  enabled: boolean;
  iconType: string;
}

export interface UserProfile {
  studentId: string;
  nickname: string;
  department: string;
  profileIcon: string;
  isLoggedIn: boolean;
}

export interface UserSettings {
  mouseSensitivity: number;    // Movement threshold in pixels (default: 3)
  autoRestart: boolean;        // Whether to automatically start new session after silence (default: true)
  autoRestartDelay: number;    // Silence duration required in seconds (default: 5)
  soundEnabled: boolean;       // Web Audio sound effects (default: true)
  alwaysOnTop: boolean;        // Always on top window flag (default: false)
  darkMode: boolean;           // Dark theme mode (default: false)
  dailyGoalMinutes: number;    // Goal in minutes (default: 120)
  whitelistEnabled: boolean;   // Enable whitelist for allowed study apps (default: true)
  allowedApps: AllowedApp[];   // List of allowed apps and sites
}

export type StudyState = 'IDLE' | 'COUNTDOWN' | 'FOCUSING' | 'INTERRUPTED' | 'WAITING';

export interface StorageData {
  records: StudySession[];
  settings: UserSettings;
  profile: UserProfile;
}
