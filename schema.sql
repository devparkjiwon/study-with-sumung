-- ========================================================
-- 스터디윗뭉 (Study with Mung) — PostgreSQL / Supabase / Neon DB Schema
-- ========================================================

-- 1. 사용자(학생) 테이블
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(64) PRIMARY KEY,
  student_id VARCHAR(32) UNIQUE NOT NULL,       -- 상명대학교 학번 (예: 20241001)
  nickname VARCHAR(50) NOT NULL,               -- 닉네임 (예: 열공수뭉이)
  department VARCHAR(60) NOT NULL,             -- 소속 학과 (예: 소프트웨어학과)
  password_hash VARCHAR(128) NOT NULL,         -- 비밀번호 해시
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  today_seconds INTEGER DEFAULT 0,             -- 오늘 누적 집중 시간(초)
  weekly_seconds INTEGER DEFAULT 0,            -- 이번 주 누적 집중 시간(초)
  total_seconds INTEGER DEFAULT 0,             -- 전체 누적 집중 시간(초)
  last_active_date DATE DEFAULT CURRENT_DATE   -- 최근 접속일자
);

-- 2. 집중 세션 기록 테이블
CREATE TABLE IF NOT EXISTS study_sessions (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_seconds INTEGER NOT NULL,
  end_reason VARCHAR(32) NOT NULL,             -- mouse_movement, manual_stop 등
  date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. 초기 시드 데이터 (상명대 실제 학과 및 모의 학우 랭킹 데이터)
INSERT INTO users (id, student_id, nickname, department, password_hash, today_seconds, weekly_seconds, total_seconds)
VALUES 
  ('usr-1', '20231012', '알고리즘장인', '소프트웨어학과', 'sha256_mock_hash', 23400, 84000, 150000),
  ('usr-2', '20242031', '밤샘디자이너', '시각디자인전공', 'sha256_mock_hash', 19800, 76000, 134000),
  ('usr-3', '20221055', 'A+폭격기', '경영학부', 'sha256_mock_hash', 15600, 61000, 110000),
  ('usr-4', '20241088', '풀스택꿈나무', '컴퓨터과학과', 'sha256_mock_hash', 12600, 52000, 95000),
  ('usr-5', '20233012', '드로잉머신', '애니메이션전공', 'sha256_mock_hash', 9600, 43000, 78000),
  ('usr-6', '20241102', '수뭉이지킴이', '글로벌경영학과', 'sha256_mock_hash', 7200, 36000, 62000),
  ('usr-7', '20231502', '중간고사만점', '문화예술경영학과', 'sha256_mock_hash', 5400, 28000, 50000)
ON CONFLICT (student_id) DO NOTHING;

-- 4. 랭킹 조회를 위한 성능 인덱스
CREATE INDEX IF NOT EXISTS idx_users_today ON users(today_seconds DESC);
CREATE INDEX IF NOT EXISTS idx_users_weekly ON users(weekly_seconds DESC);
CREATE INDEX IF NOT EXISTS idx_sessions_user_date ON study_sessions(user_id, date);
