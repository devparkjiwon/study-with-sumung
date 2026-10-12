import fs from 'fs';
import path from 'path';
import { app } from 'electron';
import { StorageData, StudySession, UserSettings, UserProfile, AllowedApp } from './types';

const DEFAULT_ALLOWED_APPS: AllowedApp[] = [
  { id: 'app-vscode', name: 'Visual Studio Code', keyword: 'code', enabled: true, iconType: 'code' },
  { id: 'app-notion', name: 'Notion (노션)', keyword: 'notion', enabled: true, iconType: 'file-text' },
  { id: 'app-pdf', name: 'Adobe Acrobat / PDF 뷰어', keyword: 'pdf', enabled: true, iconType: 'book-open' },
  { id: 'app-ecampus', name: '상명대학교 e-Campus', keyword: 'campus', enabled: true, iconType: 'graduation-cap' },
  { id: 'app-chatgpt', name: 'ChatGPT / Claude (학습 AI)', keyword: 'chatgpt', enabled: true, iconType: 'bot' },
  { id: 'app-zoom', name: 'Zoom (화상 회의/스터디)', keyword: 'zoom', enabled: true, iconType: 'video' },
  { id: 'app-word', name: '한글(HWP) / MS Word', keyword: 'word', enabled: true, iconType: 'file' },
];

const DEFAULT_PROFILE: UserProfile = {
  studentId: '20241001',
  nickname: '상명대 수뭉이',
  department: '소프트웨어학과',
  profileIcon: 'sumung_1',
  isLoggedIn: true,
};

const DEFAULT_SETTINGS: UserSettings = {
  mouseSensitivity: 3,
  autoRestart: true,
  autoRestartDelay: 5,
  soundEnabled: true,
  alwaysOnTop: false,
  darkMode: false,
  dailyGoalMinutes: 120,
  whitelistEnabled: true,
  allowedApps: DEFAULT_ALLOWED_APPS,
};

export class StorageManager {
  private filePath: string;
  private data: StorageData;

  constructor() {
    const userDataPath = app.getPath('userData');
    this.filePath = path.join(userDataPath, 'study_with_mung_data.json');
    this.data = this.loadData();
  }

  private loadData(): StorageData {
    try {
      if (fs.existsSync(this.filePath)) {
        const raw = fs.readFileSync(this.filePath, 'utf-8');
        const parsed = JSON.parse(raw);
        return {
          records: Array.isArray(parsed.records) ? parsed.records : [],
          settings: {
            ...DEFAULT_SETTINGS,
            ...(parsed.settings || {}),
            allowedApps: Array.isArray(parsed.settings?.allowedApps)
              ? parsed.settings.allowedApps
              : DEFAULT_ALLOWED_APPS,
          },
          profile: { ...DEFAULT_PROFILE, ...(parsed.profile || {}) },
        };
      }
    } catch (err) {
      console.error('[StorageManager] Error reading storage file, initializing default:', err);
    }
    return {
      records: [],
      settings: { ...DEFAULT_SETTINGS },
      profile: { ...DEFAULT_PROFILE },
    };
  }

  private persist(): void {
    try {
      const dir = path.dirname(this.filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(this.filePath, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('[StorageManager] Failed to persist data:', err);
    }
  }

  public getRecords(): StudySession[] {
    return this.data.records;
  }

  public saveRecord(record: StudySession): StudySession[] {
    const existingIndex = this.data.records.findIndex((r) => r.id === record.id);
    if (existingIndex >= 0) {
      this.data.records[existingIndex] = record;
    } else {
      this.data.records.unshift(record);
    }
    this.persist();
    return this.data.records;
  }

  public deleteRecord(id: string): StudySession[] {
    this.data.records = this.data.records.filter((r) => r.id !== id);
    this.persist();
    return this.data.records;
  }

  public clearRecords(): StudySession[] {
    this.data.records = [];
    this.persist();
    return this.data.records;
  }

  public getSettings(): UserSettings {
    return this.data.settings;
  }

  public saveSettings(settings: Partial<UserSettings>): UserSettings {
    this.data.settings = { ...this.data.settings, ...settings };
    this.persist();
    return this.data.settings;
  }

  public getProfile(): UserProfile {
    return this.data.profile;
  }

  public saveProfile(profile: Partial<UserProfile>): UserProfile {
    this.data.profile = { ...this.data.profile, ...profile };
    this.persist();
    return this.data.profile;
  }

  public getStoragePath(): string {
    return this.filePath;
  }
}
