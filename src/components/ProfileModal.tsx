import React, { useState } from 'react';
import { UserProfile } from '../types';
import { loginStudent, registerStudent } from '../services/api';
import { X, User, GraduationCap, Lock, Check, LogOut, AlertCircle, Sparkles } from 'lucide-react';

interface ProfileModalProps {
  isOpen: boolean;
  profile: UserProfile;
  onClose: () => void;
  onSave: (profile: Partial<UserProfile>) => void;
}

const DEPARTMENTS = [
  '소프트웨어학과',
  '컴퓨터과학과',
  '휴먼지능정보공학과',
  '경영학부',
  '글로벌경영학과',
  '경제금융학부',
  '시각디자인전공',
  '애니메이션전공',
  '한일문화콘텐츠전공',
  '문화예술경영학과',
  '전자공학과',
  '화학에너지공학과',
  '사범대학 (국어/영어/수학/교육학과)',
];

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  profile,
  onClose,
  onSave,
}) => {
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [studentId, setStudentId] = useState<string>(profile.studentId || '');
  const [password, setPassword] = useState<string>('');
  const [nickname, setNickname] = useState<string>(profile.nickname || '');
  const [department, setDepartment] = useState<string>(profile.department || '소프트웨어학과');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);

    try {
      if (tab === 'login') {
        const res = await loginStudent(studentId, password);
        if (!res.success) {
          setErrorMsg(res.error || '로그인에 실패했습니다.');
          setIsLoading(false);
          return;
        }
        onSave({
          studentId: res.user.studentId,
          nickname: res.user.nickname,
          department: res.user.department,
          isLoggedIn: true,
        });
      } else {
        const res = await registerStudent(studentId, nickname, department, password);
        if (!res.success) {
          setErrorMsg(res.error || '회원가입에 실패했습니다.');
          setIsLoading(false);
          return;
        }
        onSave({
          studentId: res.user.studentId,
          nickname: res.user.nickname,
          department: res.user.department,
          isLoggedIn: true,
        });
      }
      onClose();
    } catch (err: any) {
      setErrorMsg('네트워크 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    onSave({
      studentId: '20240000',
      nickname: '게스트 수뭉이',
      department: '상명대학교',
      isLoggedIn: false,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 select-none">
      <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-slate-800 p-6 shadow-2xl border border-slate-200 dark:border-slate-700 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700 mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950 flex items-center justify-center text-blue-600">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-100">
                상명대 학생 로그인 / 랭킹 계정
              </h3>
              <p className="text-[10px] text-slate-400">
                클라우드 DB에 연동되어 전체 학우와 랭킹을 겨룹니다.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher: Login vs Register */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-700/60 p-1 rounded-xl mb-4 text-xs font-bold">
          <button
            type="button"
            onClick={() => {
              setTab('login');
              setErrorMsg(null);
            }}
            className={`flex-1 py-1.5 rounded-lg transition-all ${
              tab === 'login'
                ? 'bg-white dark:bg-slate-600 text-mung-600 dark:text-mung-300 shadow-xs'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            로그인
          </button>
          <button
            type="button"
            onClick={() => {
              setTab('register');
              setErrorMsg(null);
            }}
            className={`flex-1 py-1.5 rounded-lg transition-all ${
              tab === 'register'
                ? 'bg-white dark:bg-slate-600 text-mung-600 dark:text-mung-300 shadow-xs'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            신규 학생 등록 (회원가입)
          </button>
        </div>

        {errorMsg && (
          <div className="flex items-center gap-1.5 p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-600 dark:text-rose-400 mb-3 font-semibold">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Student ID */}
          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
              상명대 학번
            </label>
            <input
              type="text"
              required
              maxLength={10}
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              placeholder="예: 20241001"
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-700/60 border border-slate-200 dark:border-slate-600 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Nickname (Register only) */}
          {tab === 'register' && (
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                닉네임
              </label>
              <input
                type="text"
                required
                maxLength={12}
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="예: 열공수뭉이, A+기원"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-700/60 border border-slate-200 dark:border-slate-600 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          {/* Department (Register only) */}
          {tab === 'register' && (
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                소속 학과
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-700/60 border border-slate-200 dark:border-slate-600 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                {DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Password */}
          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
              비밀번호
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호를 입력하세요"
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-700/60 border border-slate-200 dark:border-slate-600 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Submit Button */}
          <div className="pt-2 flex flex-col gap-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 rounded-2xl bg-mung-500 hover:bg-mung-600 disabled:bg-mung-300 text-white font-extrabold text-xs shadow-md shadow-mung-500/30 active:scale-95 transition-all flex items-center justify-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{isLoading ? '처리 중...' : tab === 'login' ? '로그인하기' : '학생 계정 생성하기'}</span>
            </button>

            {profile.isLoggedIn && (
              <button
                type="button"
                onClick={handleLogout}
                className="w-full py-1.5 rounded-xl text-[11px] font-bold text-slate-400 hover:text-rose-500 transition-colors flex items-center justify-center gap-1"
              >
                <LogOut className="w-3 h-3" />
                <span>로그아웃 (게스트 모드로 전환)</span>
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
