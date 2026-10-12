import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export interface DbUser {
  id: string;
  studentId: string;
  nickname: string;
  department: string;
  passwordHash: string;
  createdAt: string;
  todaySeconds: number;
  weeklySeconds: number;
  totalSeconds: number;
  lastActiveDate: string;
}

export interface DbSession {
  id: string;
  userId: string;
  startTime: string;
  endTime: string;
  durationSeconds: number;
  endReason: string;
  date: string;
  createdAt: string;
}

export interface DatabaseState {
  users: DbUser[];
  sessions: DbSession[];
}

function getTodayString(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = (now.getMonth() + 1).toString().padStart(2, '0');
  const d = now.getDate().toString().padStart(2, '0');
  return `${y}-${m}-${d}`;
}

const INITIAL_USERS: DbUser[] = [
  {
    id: 'usr-1',
    studentId: '20231012',
    nickname: '알고리즘장인',
    department: '소프트웨어학과',
    passwordHash: crypto.createHash('sha256').update('1234').digest('hex'),
    createdAt: new Date().toISOString(),
    todaySeconds: 23400,
    weeklySeconds: 84000,
    totalSeconds: 150000,
    lastActiveDate: getTodayString(),
  },
  {
    id: 'usr-2',
    studentId: '20242031',
    nickname: '밤샘디자이너',
    department: '시각디자인전공',
    passwordHash: crypto.createHash('sha256').update('1234').digest('hex'),
    createdAt: new Date().toISOString(),
    todaySeconds: 19800,
    weeklySeconds: 76000,
    totalSeconds: 134000,
    lastActiveDate: getTodayString(),
  },
  {
    id: 'usr-3',
    studentId: '20221055',
    nickname: 'A+폭격기',
    department: '경영학부',
    passwordHash: crypto.createHash('sha256').update('1234').digest('hex'),
    createdAt: new Date().toISOString(),
    todaySeconds: 15600,
    weeklySeconds: 61000,
    totalSeconds: 110000,
    lastActiveDate: getTodayString(),
  },
  {
    id: 'usr-4',
    studentId: '20241088',
    nickname: '풀스택꿈나무',
    department: '컴퓨터과학과',
    passwordHash: crypto.createHash('sha256').update('1234').digest('hex'),
    createdAt: new Date().toISOString(),
    todaySeconds: 12600,
    weeklySeconds: 52000,
    totalSeconds: 95000,
    lastActiveDate: getTodayString(),
  },
  {
    id: 'usr-5',
    studentId: '20233012',
    nickname: '드로잉머신',
    department: '애니메이션전공',
    passwordHash: crypto.createHash('sha256').update('1234').digest('hex'),
    createdAt: new Date().toISOString(),
    todaySeconds: 9600,
    weeklySeconds: 43000,
    totalSeconds: 78000,
    lastActiveDate: getTodayString(),
  },
  {
    id: 'usr-6',
    studentId: '20241102',
    nickname: '수뭉이지킴이',
    department: '글로벌경영학과',
    passwordHash: crypto.createHash('sha256').update('1234').digest('hex'),
    createdAt: new Date().toISOString(),
    todaySeconds: 7200,
    weeklySeconds: 36000,
    totalSeconds: 62000,
    lastActiveDate: getTodayString(),
  },
  {
    id: 'usr-7',
    studentId: '20231502',
    nickname: '중간고사만점',
    department: '문화예술경영학과',
    passwordHash: crypto.createHash('sha256').update('1234').digest('hex'),
    createdAt: new Date().toISOString(),
    todaySeconds: 5400,
    weeklySeconds: 28000,
    totalSeconds: 50000,
    lastActiveDate: getTodayString(),
  },
];

class StudyDatabase {
  private filePath: string;
  private state: DatabaseState;

  constructor() {
    // In Netlify serverless environment, /tmp is writable
    const dir = process.env.LAMBDA_TASK_ROOT || process.env.NETLIFY ? '/tmp' : path.join(process.cwd(), 'data');
    if (!fs.existsSync(dir)) {
      try {
        fs.mkdirSync(dir, { recursive: true });
      } catch {}
    }
    this.filePath = path.join(dir, 'study_mung_database.json');
    this.state = this.load();
  }

  private load(): DatabaseState {
    try {
      if (fs.existsSync(this.filePath)) {
        const raw = fs.readFileSync(this.filePath, 'utf-8');
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed.users) && Array.isArray(parsed.sessions)) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Initializing default DB state:', e);
    }
    return {
      users: [...INITIAL_USERS],
      sessions: [],
    };
  }

  private save(): void {
    try {
      fs.writeFileSync(this.filePath, JSON.stringify(this.state, null, 2), 'utf-8');
    } catch (e) {
      console.error('Failed to save DB state:', e);
    }
  }

  // --- Auth methods ---
  public hashPassword(pw: string): string {
    return crypto.createHash('sha256').update(pw).digest('hex');
  }

  public registerUser(studentId: string, nickname: string, department: string, passwordPlain: string): { user?: DbUser; error?: string } {
    const existing = this.state.users.find((u) => u.studentId === studentId);
    if (existing) {
      return { error: '이미 등록된 학번입니다.' };
    }

    const newUser: DbUser = {
      id: `usr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      studentId,
      nickname,
      department,
      passwordHash: this.hashPassword(passwordPlain),
      createdAt: new Date().toISOString(),
      todaySeconds: 0,
      weeklySeconds: 0,
      totalSeconds: 0,
      lastActiveDate: getTodayString(),
    };

    this.state.users.push(newUser);
    this.save();
    return { user: newUser };
  }

  public loginUser(studentId: string, passwordPlain: string): { user?: DbUser; error?: string } {
    const user = this.state.users.find((u) => u.studentId === studentId);
    if (!user) {
      return { error: '학번이 일치하는 사용자를 찾을 수 없습니다.' };
    }
    const hash = this.hashPassword(passwordPlain);
    if (user.passwordHash !== hash) {
      return { error: '비밀번호가 올바르지 않습니다.' };
    }
    return { user };
  }

  public getUserById(id: string): DbUser | undefined {
    return this.state.users.find((u) => u.id === id);
  }

  public getUserByStudentId(studentId: string): DbUser | undefined {
    return this.state.users.find((u) => u.studentId === studentId);
  }

  // --- Session & Stats ---
  public addSession(userId: string, durationSeconds: number, startTime: string, endTime: string, endReason: string): { session: DbSession; user: DbUser } {
    let user = this.state.users.find((u) => u.id === userId);
    if (!user) {
      // Create guest/fallback user if not found
      user = {
        id: userId,
        studentId: '20241001',
        nickname: '상명대 수뭉이',
        department: '소프트웨어학과',
        passwordHash: this.hashPassword('1234'),
        createdAt: new Date().toISOString(),
        todaySeconds: 0,
        weeklySeconds: 0,
        totalSeconds: 0,
        lastActiveDate: getTodayString(),
      };
      this.state.users.push(user);
    }

    const today = getTodayString();
    if (user.lastActiveDate !== today) {
      user.todaySeconds = 0;
      user.lastActiveDate = today;
    }

    const newSession: DbSession = {
      id: `sess-${Date.now()}`,
      userId: user.id,
      startTime,
      endTime,
      durationSeconds,
      endReason,
      date: today,
      createdAt: new Date().toISOString(),
    };

    this.state.sessions.unshift(newSession);

    // Increment user totals
    user.todaySeconds += durationSeconds;
    user.weeklySeconds += durationSeconds;
    user.totalSeconds += durationSeconds;

    this.save();
    return { session: newSession, user };
  }

  // --- Leaderboard ---
  public getLeaderboard(type: 'today' | 'weekly' | 'department'): any[] {
    const today = getTodayString();

    if (type === 'department') {
      const map: Record<string, { department: string; totalSec: number; studentCount: number }> = {};
      this.state.users.forEach((u) => {
        if (!map[u.department]) {
          map[u.department] = { department: u.department, totalSec: 0, studentCount: 0 };
        }
        map[u.department].totalSec += u.todaySeconds;
        map[u.department].studentCount += 1;
      });

      return Object.values(map).sort((a, b) => b.totalSec - a.totalSec);
    }

    // Sort users
    const sorted = [...this.state.users].sort((a, b) => {
      if (type === 'today') {
        const aSec = a.lastActiveDate === today ? a.todaySeconds : 0;
        const bSec = b.lastActiveDate === today ? b.todaySeconds : 0;
        return bSec - aSec;
      }
      return b.weeklySeconds - a.weeklySeconds;
    });

    return sorted.map((u, idx) => ({
      rank: idx + 1,
      id: u.id,
      studentId: u.studentId,
      nickname: u.nickname,
      department: u.department,
      todaySeconds: u.lastActiveDate === today ? u.todaySeconds : 0,
      weeklySeconds: u.weeklySeconds,
      totalSeconds: u.totalSeconds,
    }));
  }
}

export const db = new StudyDatabase();
