import type { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';
import { db } from './db';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Content-Type': 'application/json',
};

export const handler: Handler = async (event: HandlerEvent, _context: HandlerContext) => {
  // Handle preflight OPTIONS
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: '',
    };
  }

  const path = event.path.replace(/^\/\.netlify\/functions\/api/, '').replace(/^\/api/, '');
  const method = event.httpMethod;

  try {
    // 1. Auth: Register
    if (method === 'POST' && path === '/auth/register') {
      const body = JSON.parse(event.body || '{}');
      const { studentId, nickname, department, password } = body;

      if (!studentId || !nickname || !department || !password) {
        return {
          statusCode: 400,
          headers: CORS_HEADERS,
          body: JSON.stringify({ error: '모든 필드를 올바르게 입력해 주세요.' }),
        };
      }

      const res = db.registerUser(studentId, nickname, department, password);
      if (res.error) {
        return {
          statusCode: 400,
          headers: CORS_HEADERS,
          body: JSON.stringify({ error: res.error }),
        };
      }

      const { passwordHash, ...safeUser } = res.user!;
      return {
        statusCode: 201,
        headers: CORS_HEADERS,
        body: JSON.stringify({ message: '회원가입 성공', user: safeUser }),
      };
    }

    // 2. Auth: Login
    if (method === 'POST' && path === '/auth/login') {
      const body = JSON.parse(event.body || '{}');
      const { studentId, password } = body;

      if (!studentId || !password) {
        return {
          statusCode: 400,
          headers: CORS_HEADERS,
          body: JSON.stringify({ error: '학번과 비밀번호를 입력해 주세요.' }),
        };
      }

      const res = db.loginUser(studentId, password);
      if (res.error) {
        return {
          statusCode: 401,
          headers: CORS_HEADERS,
          body: JSON.stringify({ error: res.error }),
        };
      }

      const { passwordHash, ...safeUser } = res.user!;
      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify({ message: '로그인 성공', user: safeUser }),
      };
    }

    // 3. Leaderboard
    if (method === 'GET' && path === '/leaderboard') {
      const type = (event.queryStringParameters?.type as 'today' | 'weekly' | 'department') || 'today';
      const leaderboard = db.getLeaderboard(type);
      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify({ type, data: leaderboard }),
      };
    }

    // 4. Record Study Session
    if (method === 'POST' && path === '/sessions') {
      const body = JSON.parse(event.body || '{}');
      const { userId, durationSeconds, startTime, endTime, endReason } = body;

      if (!userId || typeof durationSeconds !== 'number') {
        return {
          statusCode: 400,
          headers: CORS_HEADERS,
          body: JSON.stringify({ error: '세션 정보가 올바르지 않습니다.' }),
        };
      }

      const res = db.addSession(
        userId,
        durationSeconds,
        startTime || new Date().toISOString(),
        endTime || new Date().toISOString(),
        endReason || 'mouse_movement'
      );

      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify({ session: res.session, user: res.user }),
      };
    }

    // 5. Get User Info
    if (method === 'GET' && path === '/user') {
      const studentId = event.queryStringParameters?.studentId;
      if (!studentId) {
        return {
          statusCode: 400,
          headers: CORS_HEADERS,
          body: JSON.stringify({ error: 'studentId가 필요합니다.' }),
        };
      }
      const user = db.getUserByStudentId(studentId);
      if (!user) {
        return {
          statusCode: 404,
          headers: CORS_HEADERS,
          body: JSON.stringify({ error: '사용자를 찾을 수 없습니다.' }),
        };
      }
      const { passwordHash, ...safeUser } = user;
      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify({ user: safeUser }),
      };
    }

    return {
      statusCode: 404,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: `Not Found: ${path}` }),
    };
  } catch (err: any) {
    console.error('API Error:', err);
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: '서버 내부 오류가 발생했습니다.' }),
    };
  }
};
