import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { StudyState, StudySession, UserSettings } from '../types';
import { SumungCharacter } from './SumungCharacter';
import { formatTimeHMS, formatKoreanDuration, getTodayDateString } from '../utils/format';
import { Play, Square, RotateCcw, AlertTriangle, Flame, Clock, Award, CheckCircle2 } from 'lucide-react';

interface TimerViewProps {
  state: StudyState;
  elapsedSeconds: number;
  countdownNumber: number;
  lastSavedDuration: number;
  silenceRemainingSeconds: number;
  records: StudySession[];
  settings: UserSettings;
  isCelebrating: boolean;
  allowedAppToast?: string | null;
  onStart: () => void;
  onStop: () => void;
  onCancelWaiting: () => void;
}

export const TimerView: React.FC<TimerViewProps> = ({
  state,
  elapsedSeconds,
  countdownNumber,
  lastSavedDuration,
  silenceRemainingSeconds,
  records,
  settings,
  isCelebrating,
  allowedAppToast,
  onStart,
  onStop,
  onCancelWaiting,
}) => {
  // Calculate today stats
  const todayStr = getTodayDateString();
  const todayRecords = records.filter((r) => r.date === todayStr);
  const todayTotalSeconds = todayRecords.reduce((acc, cur) => acc + cur.durationSeconds, 0);
  const todaySessionCount = todayRecords.length;
  const todayMaxSeconds = todayRecords.reduce((max, cur) => Math.max(max, cur.durationSeconds), 0);

  // Daily goal calculation
  const goalSeconds = (settings.dailyGoalMinutes || 120) * 60;
  const goalPercent = Math.min(100, Math.round((todayTotalSeconds / goalSeconds) * 100));

  // State badge styling and label
  const getStateBadge = () => {
    switch (state) {
      case 'FOCUSING':
        return {
          text: '집중 중 — 마우스 손 떼기! 👀',
          color: 'bg-blue-500 text-white shadow-blue-300/50',
          dot: 'bg-emerald-300 animate-ping',
        };
      case 'COUNTDOWN':
        return {
          text: `시작 카운트다운 (${countdownNumber})`,
          color: 'bg-indigo-500 text-white shadow-indigo-300/50',
          dot: 'bg-yellow-300 animate-pulse',
        };
      case 'INTERRUPTED':
        return {
          text: '마우스 움직임 감지!',
          color: 'bg-rose-500 text-white shadow-rose-300/50',
          dot: 'bg-white animate-bounce',
        };
      case 'WAITING':
        return {
          text: `다음 집중 대기 중 (${silenceRemainingSeconds}초)`,
          color: 'bg-amber-500 text-white shadow-amber-300/50',
          dot: 'bg-amber-200 animate-pulse',
        };
      case 'IDLE':
      default:
        return {
          text: '공부 준비 완료',
          color: 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200',
          dot: 'bg-slate-400',
        };
    }
  };

  const badge = getStateBadge();

  return (
    <div className="flex flex-col items-center justify-between h-full px-4 py-2 max-w-2xl mx-auto select-none">
      {/* Top Banner & Concept Disclaimer */}
      <div className="w-full flex flex-col items-center gap-1.5 mt-1">
        {/* Concept Notice Disclaimer */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-mung-50 dark:bg-slate-800/80 border border-mung-200/80 dark:border-slate-700 text-[11px] font-medium text-mung-800 dark:text-mung-300">
          <AlertTriangle className="w-3.5 h-3.5 text-mung-600 dark:text-mung-400 shrink-0" />
          <span>마우스를 움직이지 않은 집중 도전 시간을 기록합니다.</span>
        </div>

        {/* Goal Mini Progress Bar */}
        <div className="w-full flex items-center justify-between text-xs px-2 text-slate-500 dark:text-slate-400 mt-1">
          <div className="flex items-center gap-1 font-semibold">
            <Flame className="w-3.5 h-3.5 text-amber-500" />
            <span>오늘 목표 {settings.dailyGoalMinutes / 60}시간</span>
          </div>
          <span className="font-bold text-mung-600 dark:text-mung-300">{goalPercent}% 달성</span>
        </div>
        <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-mung-400 to-mung-600 rounded-full transition-all duration-500"
            style={{ width: `${goalPercent}%` }}
          />
        </div>
      </div>

      {/* Mascot Character & Countdown Area */}
      <div className="relative my-auto flex flex-col items-center justify-center">
        {/* Countdown Large Visual Effect */}
        <AnimatePresence>
          {state === 'COUNTDOWN' && (
            <motion.div
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.4, opacity: 0 }}
              key={countdownNumber}
              className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none"
            >
              <div className="w-32 h-32 rounded-full bg-blue-600/90 text-white font-black text-6xl flex items-center justify-center shadow-2xl backdrop-blur-md border-4 border-white">
                {countdownNumber}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <SumungCharacter
          state={state}
          elapsedSeconds={elapsedSeconds}
          lastRecordDuration={lastSavedDuration}
          silenceRemainingSeconds={silenceRemainingSeconds}
          isCelebrating={isCelebrating}
        />
      </div>

      {/* Main Digital Clock & State Badge */}
      <div className="flex flex-col items-center gap-2 mb-2">
        {/* Status Pill */}
        <div
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold shadow-sm transition-all duration-300 ${badge.color}`}
        >
          <span className={`w-2 h-2 rounded-full ${badge.dot}`} />
          <span>{badge.text}</span>
        </div>

        {/* Allowed App Active Feedback Toast */}
        <AnimatePresence>
          {allowedAppToast && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: -4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -4 }}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/90 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 text-xs font-bold shadow-sm"
            >
              <span>{allowedAppToast}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Big Digital Clock */}
        <div className="text-5xl md:text-6xl font-black font-mono tracking-wider text-slate-800 dark:text-slate-100 drop-shadow-sm">
          {formatTimeHMS(elapsedSeconds)}
        </div>

        {/* Last Saved Record Info Notice */}
        <AnimatePresence>
          {lastSavedDuration > 0 && (state === 'INTERRUPTED' || state === 'WAITING' || state === 'IDLE') && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold text-emerald-700 dark:text-emerald-300"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>방금 집중 기록: {formatKoreanDuration(lastSavedDuration)} (저장 완료)</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Control Action Buttons */}
      <div className="flex items-center justify-center gap-3 w-full mb-3">
        {state === 'IDLE' && (
          <button
            onClick={onStart}
            className="flex items-center justify-center gap-2 w-56 py-3.5 rounded-2xl bg-gradient-to-r from-mung-500 to-mung-600 hover:from-mung-600 hover:to-mung-700 text-white font-extrabold text-base shadow-lg shadow-mung-500/30 hover:shadow-mung-500/40 transform active:scale-95 transition-all"
          >
            <Play className="w-5 h-5 fill-current" />
            <span>공부 시작하기</span>
          </button>
        )}

        {state === 'COUNTDOWN' && (
          <button
            disabled
            className="flex items-center justify-center gap-2 w-56 py-3.5 rounded-2xl bg-indigo-400 text-white font-bold text-base shadow-md cursor-not-allowed opacity-90"
          >
            <span>마우스에서 손 떼기...</span>
          </button>
        )}

        {state === 'FOCUSING' && (
          <button
            onClick={onStop}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-sm border border-slate-300/80 dark:border-slate-700 shadow-sm active:scale-95 transition-all"
          >
            <Square className="w-4 h-4 fill-current text-rose-500" />
            <span>수동 공부 종료</span>
          </button>
        )}

        {(state === 'INTERRUPTED' || state === 'WAITING') && (
          <div className="flex items-center gap-2.5">
            <button
              onClick={onStart}
              className="flex items-center justify-center gap-1.5 px-5 py-3 rounded-2xl bg-mung-500 hover:bg-mung-600 text-white font-bold text-sm shadow-md shadow-mung-500/30 active:scale-95 transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              <span>지금 바로 재시작</span>
            </button>
            <button
              onClick={onCancelWaiting}
              className="px-4 py-3 rounded-2xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-sm active:scale-95 transition-all"
            >
              대기 취소
            </button>
          </div>
        )}
      </div>

      {/* Bottom Mini Today KPI Cards */}
      <div className="grid grid-cols-3 gap-2.5 w-full mt-1">
        {/* Today Total */}
        <div className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 shadow-sm">
          <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-400 dark:text-slate-500 mb-0.5">
            <Clock className="w-3 h-3 text-mung-500" />
            <span>오늘 총 집중</span>
          </div>
          <span className="font-extrabold text-sm text-slate-800 dark:text-slate-100">
            {formatKoreanDuration(todayTotalSeconds)}
          </span>
        </div>

        {/* Today Sessions */}
        <div className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 shadow-sm">
          <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-400 dark:text-slate-500 mb-0.5">
            <Award className="w-3 h-3 text-indigo-500" />
            <span>집중 세션 수</span>
          </div>
          <span className="font-extrabold text-sm text-slate-800 dark:text-slate-100">
            {todaySessionCount}회
          </span>
        </div>

        {/* Today Max Continuous Streak */}
        <div className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 shadow-sm">
          <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-400 dark:text-slate-500 mb-0.5">
            <Flame className="w-3 h-3 text-rose-500" />
            <span>최장 연속 집중</span>
          </div>
          <span className="font-extrabold text-sm text-slate-800 dark:text-slate-100">
            {formatKoreanDuration(todayMaxSeconds)}
          </span>
        </div>
      </div>
    </div>
  );
};
