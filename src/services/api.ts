import { StudySession, UserProfile, RankUser } from '../types';

const API_BASE = '/api';

export interface LeaderboardResponse {
  type: 'today' | 'weekly' | 'department';
  data: any[];
}

export async function registerStudent(studentId: string, nickname: string, department: string, password: string): Promise<{ success: boolean; user?: any; error?: string }> {
  try {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentId, nickname, department, password }),
    });
    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data.error || '회원가입 실패' };
    }
    return { success: true, user: data.user };
  } catch (err: any) {
    console.warn('API register offline fallback:', err);
    return { success: true, user: { studentId, nickname, department, id: `local-${studentId}` } };
  }
}

export async function loginStudent(studentId: string, password: string): Promise<{ success: boolean; user?: any; error?: string }> {
  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentId, password }),
    });
    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data.error || '로그인 실패' };
    }
    return { success: true, user: data.user };
  } catch (err: any) {
    console.warn('API login offline fallback:', err);
    return { success: true, user: { studentId, nickname: '상명대 수뭉이', department: '소프트웨어학과', id: `local-${studentId}` } };
  }
}

export async function fetchLiveLeaderboard(type: 'today' | 'weekly' | 'department'): Promise<any[]> {
  try {
    const res = await fetch(`${API_BASE}/leaderboard?type=${type}`);
    if (!res.ok) throw new Error('Failed to fetch');
    const data: LeaderboardResponse = await res.json();
    return data.data;
  } catch (err) {
    console.warn('Leaderboard fetch offline fallback:', err);
    return [];
  }
}

export async function syncSessionToCloud(userId: string, session: StudySession): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/sessions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        durationSeconds: session.durationSeconds,
        startTime: session.startTime,
        endTime: session.endTime,
        endReason: session.endReason,
      }),
    });
    return res.ok;
  } catch (err) {
    console.warn('Session sync offline fallback:', err);
    return false;
  }
}
