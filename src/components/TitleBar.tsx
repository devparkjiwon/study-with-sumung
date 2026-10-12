import React from 'react';
import { TabType, UserSettings, UserProfile } from '../types';
import { Clock, BarChart3, Settings, Trophy, Pin, Minus, Square, X, User, ShieldCheck } from 'lucide-react';

interface TitleBarProps {
  currentTab: TabType;
  onTabChange: (tab: TabType) => void;
  settings: UserSettings;
  profile: UserProfile;
  onOpenProfile: () => void;
  onToggleAlwaysOnTop: () => void;
}

export const TitleBar: React.FC<TitleBarProps> = ({
  currentTab,
  onTabChange,
  settings,
  profile,
  onOpenProfile,
  onToggleAlwaysOnTop,
}) => {
  const isElectron = typeof window !== 'undefined' && 'electronAPI' in window;

  const handleMinimize = () => {
    if (isElectron) {
      (window as any).electronAPI.minimize();
    }
  };

  const handleMaximize = () => {
    if (isElectron) {
      (window as any).electronAPI.maximize();
    }
  };

  const handleClose = () => {
    if (isElectron) {
      (window as any).electronAPI.close();
    }
  };

  return (
    <header
      style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
      className="h-12 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-mung-100 dark:border-slate-800 flex items-center justify-between px-3 select-none z-50 transition-colors"
    >
      {/* Brand & Mascot Title */}
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-mung-600 to-mung-400 p-0.5 flex items-center justify-center shadow-sm shadow-mung-400/30 shrink-0">
          <img
            src="./assets/sumung/sumung_celebrate.png"
            alt="수뭉이"
            className="w-full h-full object-contain"
          />
        </div>
        <div className="flex items-center gap-1.5">
          <span className="font-extrabold text-sm tracking-tight text-slate-800 dark:text-white">
            스터디윗뭉
          </span>
          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-mung-100 dark:bg-mung-950 text-mung-700 dark:text-mung-300">
            상명대
          </span>
        </div>
      </div>

      {/* Tabs (non-draggable) */}
      <nav
        style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
        className="flex items-center bg-slate-100 dark:bg-slate-800/80 p-0.5 rounded-xl border border-slate-200/60 dark:border-slate-700/60"
      >
        <button
          onClick={() => onTabChange('timer')}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
            currentTab === 'timer'
              ? 'bg-white dark:bg-slate-700 text-mung-600 dark:text-mung-300 shadow-sm'
              : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>타이머</span>
        </button>

        <button
          onClick={() => onTabChange('stats')}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
            currentTab === 'stats'
              ? 'bg-white dark:bg-slate-700 text-mung-600 dark:text-mung-300 shadow-sm'
              : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          <span>통계</span>
        </button>

        <button
          onClick={() => onTabChange('ranking')}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
            currentTab === 'ranking'
              ? 'bg-white dark:bg-slate-700 text-amber-600 dark:text-amber-400 shadow-sm'
              : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          <Trophy className="w-3.5 h-3.5 text-amber-500" />
          <span>랭킹</span>
        </button>

        <button
          onClick={() => onTabChange('settings')}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
            currentTab === 'settings'
              ? 'bg-white dark:bg-slate-700 text-mung-600 dark:text-mung-300 shadow-sm'
              : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          <Settings className="w-3.5 h-3.5" />
          <span>설정</span>
        </button>
      </nav>

      {/* User Profile & Window Controls (non-draggable) */}
      <div
        style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
        className="flex items-center gap-1.5"
      >
        {/* Whitelist status badge */}
        {settings.whitelistEnabled && (
          <span
            title="특정 앱 허용(화이트리스트) 모드 동작 중"
            className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
          >
            <ShieldCheck className="w-3 h-3 text-emerald-500" />
            <span>앱허용 켜짐</span>
          </span>
        )}

        {/* User Profile Pill Button */}
        <button
          onClick={onOpenProfile}
          title="로그인 및 프로필 관리"
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 transition-colors border border-slate-200/80 dark:border-slate-700"
        >
          <div className="w-4 h-4 rounded-full bg-blue-500 text-white flex items-center justify-center text-[10px]">
            <User className="w-2.5 h-2.5" />
          </div>
          <span className="max-w-[70px] truncate">{profile.nickname}</span>
        </button>

        {/* Always on top toggle */}
        <button
          onClick={onToggleAlwaysOnTop}
          title={settings.alwaysOnTop ? '항상 위에 표시 켜짐' : '항상 위에 표시 끄기'}
          className={`p-1.5 rounded-lg text-xs transition-colors ${
            settings.alwaysOnTop
              ? 'bg-mung-100 dark:bg-mung-900 text-mung-600 dark:text-mung-300'
              : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Pin className={`w-3.5 h-3.5 ${settings.alwaysOnTop ? 'fill-current' : ''}`} />
        </button>

        {/* Minimize */}
        <button
          onClick={handleMinimize}
          title="최소화"
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <Minus className="w-3.5 h-3.5" />
        </button>

        {/* Maximize */}
        <button
          onClick={handleMaximize}
          title="최대화"
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <Square className="w-3 h-3" />
        </button>

        {/* Close */}
        <button
          onClick={handleClose}
          title="닫기"
          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </header>
  );
};
