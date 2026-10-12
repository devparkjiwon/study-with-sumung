export type StudyState = 'IDLE' | 'COUNTDOWN' | 'FOCUSING' | 'INTERRUPTED' | 'WAITING';

export type EndReason = 'mouse_movement' | 'manual_stop' | 'app_quit' | 'power_suspend';

export interface StudySession {
  id: string;
  startTime: string; // ISO 8601
  endTime: string;   // ISO 8601
  durationSeconds: number;
  endReason: EndReason;
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
  autoRestartDelay: number;    // Inactivity duration required in seconds (default: 5)
  soundEnabled: boolean;       // Web Audio sound effects (default: true)
  alwaysOnTop: boolean;        // Always on top window flag (default: false)
  darkMode: boolean;           // Dark theme mode (default: false)
  dailyGoalMinutes: number;    // Goal in minutes (default: 120)
  whitelistEnabled: boolean;   // Enable whitelist for allowed study apps (default: true)
  allowedApps: AllowedApp[];   // List of allowed apps and sites
}

export interface Milestone {
  seconds: number;
  label: string;
  title: string;
  message: string;
}

export type TabType = 'timer' | 'stats' | 'ranking' | 'settings';

export interface RankUser {
  rank: number;
  nickname: string;
  department: string;
  studentId: string;
  todaySeconds: number;
  weeklySeconds: number;
  streakDays: number;
  tier: '챌린저 뭉이' | '다이아 뭉이' | '골드 뭉이' | '실버 뭉이' | '브론즈 뭉이';
  isMe?: boolean;
}
