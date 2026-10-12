import React, { useState, useMemo } from 'react';
import { StudySession, UserSettings } from '../types';
import {
  formatKoreanDuration,
  formatDateKorean,
  formatTimestampTime,
  getTodayDateString,
} from '../utils/format';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import {
  Clock,
  Flame,
  Award,
  Calendar,
  Trash2,
  MousePointer,
  Square,
  Power,
  ChevronDown,
  Filter,
} from 'lucide-react';

interface StatsViewProps {
  records: StudySession[];
  settings: UserSettings;
  onDeleteRecord: (id: string) => void;
  onClearAll: () => void;
}

export const StatsView: React.FC<StatsViewProps> = ({
  records,
  settings,
  onDeleteRecord,
  onClearAll,
}) => {
  const [selectedDateFilter, setSelectedDateFilter] = useState<string>('all');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState<boolean>(false);

  const todayStr = getTodayDateString();

  // Aggregate statistics
  const todayRecords = useMemo(() => records.filter((r) => r.date === todayStr), [records, todayStr]);
  const todayTotalSec = useMemo(
    () => todayRecords.reduce((acc, cur) => acc + cur.durationSeconds, 0),
    [todayRecords]
  );
  const todayMaxSec = useMemo(
    () => todayRecords.reduce((max, cur) => Math.max(max, cur.durationSeconds), 0),
    [todayRecords]
  );
  const allTimeTotalSec = useMemo(
    () => records.reduce((acc, cur) => acc + cur.durationSeconds, 0),
    [records]
  );
  const allTimeSessionCount = records.length;

  // Generate 7-day chart data
  const chartData = useMemo(() => {
    const days: { date: string; displayDate: string; minutes: number }[] = [];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const y = d.getFullYear();
      const m = (d.getMonth() + 1).toString().padStart(2, '0');
      const day = d.getDate().toString().padStart(2, '0');
      const dateStr = `${y}-${m}-${day}`;
      const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
      const displayDate = `${m}/${day} (${dayNames[d.getDay()]})`;

      const daySec = records
        .filter((r) => r.date === dateStr)
        .reduce((sum, r) => sum + r.durationSeconds, 0);

      days.push({
        date: dateStr,
        displayDate,
        minutes: Math.round((daySec / 60) * 10) / 10,
      });
    }

    return days;
  }, [records]);

  // Unique dates for filter dropdown
  const uniqueDates = useMemo(() => {
    const dates = Array.from(new Set(records.map((r) => r.date)));
    return dates.sort((a, b) => b.localeCompare(a));
  }, [records]);

  // Filtered records
  const filteredRecords = useMemo(() => {
    if (selectedDateFilter === 'all') return records;
    if (selectedDateFilter === 'today') return records.filter((r) => r.date === todayStr);
    return records.filter((r) => r.date === selectedDateFilter);
  }, [records, selectedDateFilter, todayStr]);

  // Reason badge renderer
  const renderReasonBadge = (reason: StudySession['endReason']) => {
    switch (reason) {
      case 'mouse_movement':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200 dark:border-rose-800">
            <MousePointer className="w-3 h-3" />
            마우스 이동
          </span>
        );
      case 'manual_stop':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            <Square className="w-3 h-3 text-slate-500" />
            수동 종료
          </span>
        );
      case 'power_suspend':
      case 'app_quit':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
            <Power className="w-3 h-3" />
            절전 / 종료
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto px-4 py-3 space-y-4 max-w-4xl mx-auto select-none">
      {/* Top 4 KPI Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* Today Total */}
        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 shadow-sm flex flex-col justify-between">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 dark:text-slate-500 mb-1">
            <Clock className="w-3.5 h-3.5 text-mung-500" />
            <span>오늘 총 집중 시간</span>
          </div>
          <span className="text-xl font-black text-slate-800 dark:text-slate-100">
            {formatKoreanDuration(todayTotalSec)}
          </span>
          <span className="text-[11px] text-slate-400 mt-1">오늘 {todayRecords.length}개 세션</span>
        </div>

        {/* Today Max Streak */}
        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 shadow-sm flex flex-col justify-between">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 dark:text-slate-500 mb-1">
            <Flame className="w-3.5 h-3.5 text-rose-500" />
            <span>오늘 최장 연속 집중</span>
          </div>
          <span className="text-xl font-black text-slate-800 dark:text-slate-100">
            {formatKoreanDuration(todayMaxSec)}
          </span>
          <span className="text-[11px] text-slate-400 mt-1">마우스 무빙 없는 기록</span>
        </div>

        {/* All-Time Total */}
        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 shadow-sm flex flex-col justify-between">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 dark:text-slate-500 mb-1">
            <Award className="w-3.5 h-3.5 text-indigo-500" />
            <span>전체 누적 집중 시간</span>
          </div>
          <span className="text-xl font-black text-slate-800 dark:text-slate-100">
            {formatKoreanDuration(allTimeTotalSec)}
          </span>
          <span className="text-[11px] text-slate-400 mt-1">총 {allTimeSessionCount}개 세션 합산</span>
        </div>

        {/* Daily Goal Ratio */}
        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 shadow-sm flex flex-col justify-between">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 dark:text-slate-500 mb-1">
            <Calendar className="w-3.5 h-3.5 text-emerald-500" />
            <span>일일 목표 달성</span>
          </div>
          <span className="text-xl font-black text-mung-600 dark:text-mung-400">
            {Math.min(100, Math.round((todayTotalSec / ((settings.dailyGoalMinutes || 120) * 60)) * 100))}%
          </span>
          <span className="text-[11px] text-slate-400 mt-1">목표: {settings.dailyGoalMinutes / 60}시간</span>
        </div>
      </div>

      {/* 7-Day Study Chart Card */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-mung-500" />
            <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-100">
              최근 7일간 공부 시간 (분)
            </h3>
          </div>
          <span className="text-xs text-slate-400">일자별 집중 시간 합산</span>
        </div>

        <div className="w-full h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.6} />
              <XAxis dataKey="displayDate" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
              <Tooltip
                formatter={(val: any) => [`${val} 분`, '집중 시간']}
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '12px',
                  border: '1px solid #E2E8F0',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  fontSize: '12px',
                  fontWeight: '600',
                }}
              />
              <Bar dataKey="minutes" fill="#38A3F6" radius={[6, 6, 0, 0]} maxBarSize={38} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Session History List */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 shadow-sm flex flex-col flex-1">
        {/* Header & Filter Controls */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-100">
              집중 세션 기록 목록
            </h3>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
              {filteredRecords.length}개
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Date Filter */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-700/60 text-xs text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600">
              <Filter className="w-3 h-3 text-slate-400" />
              <select
                value={selectedDateFilter}
                onChange={(e) => setSelectedDateFilter(e.target.value)}
                className="bg-transparent font-semibold focus:outline-none cursor-pointer"
              >
                <option value="all">전체 날짜</option>
                <option value="today">오늘만 ({todayStr})</option>
                {uniqueDates
                  .filter((d) => d !== todayStr)
                  .map((d) => (
                    <option key={d} value={d}>
                      {formatDateKorean(d)}
                    </option>
                  ))}
              </select>
            </div>

            {/* Clear All Button */}
            {records.length > 0 && (
              <button
                onClick={() => setShowClearConfirm(true)}
                className="px-2.5 py-1 rounded-xl text-xs font-bold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-900 transition-colors"
              >
                기록 전체 삭제
              </button>
            )}
          </div>
        </div>

        {/* Records Table / List */}
        {filteredRecords.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-slate-400 dark:text-slate-500 text-sm">
            <Clock className="w-10 h-10 mb-2 opacity-30" />
            <p className="font-semibold">저장된 집중 세션 기록이 없습니다.</p>
            <p className="text-xs mt-0.5">타이머에서 공부를 시작해 보세요!</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-700/60 max-h-72 overflow-y-auto">
            {filteredRecords.map((session) => (
              <div
                key={session.id}
                className="py-2.5 px-1.5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/30 rounded-xl transition-colors text-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-mung-100 dark:bg-mung-950 flex items-center justify-center text-mung-600 dark:text-mung-400 font-bold shrink-0">
                    ⏱️
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm text-slate-800 dark:text-slate-100">
                        {formatKoreanDuration(session.durationSeconds)}
                      </span>
                      {renderReasonBadge(session.endReason)}
                    </div>
                    <span className="text-[11px] text-slate-400 mt-0.5">
                      {formatDateKorean(session.date)} • {formatTimestampTime(session.startTime)} ~{' '}
                      {formatTimestampTime(session.endTime)}
                    </span>
                  </div>
                </div>

                {/* Delete Record Button */}
                <button
                  onClick={() => setDeleteConfirmId(session.id)}
                  title="세션 기록 삭제"
                  className="p-1.5 rounded-lg text-slate-300 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-xs rounded-2xl bg-white dark:bg-slate-800 p-5 shadow-2xl border border-slate-200 dark:border-slate-700 text-center select-none">
            <h4 className="text-base font-extrabold text-slate-800 dark:text-slate-100 mb-1">
              기록을 삭제할까요?
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              삭제된 집중 세션은 복구할 수 없습니다.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 py-2 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs"
              >
                취소
              </button>
              <button
                onClick={() => {
                  onDeleteRecord(deleteConfirmId);
                  setDeleteConfirmId(null);
                }}
                className="flex-1 py-2 rounded-xl bg-rose-500 text-white font-bold text-xs shadow-md shadow-rose-500/30"
              >
                삭제하기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clear All Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-slate-800 p-5 shadow-2xl border border-slate-200 dark:border-slate-700 text-center select-none">
            <h4 className="text-base font-extrabold text-slate-800 dark:text-slate-100 mb-1">
              모든 공부 기록을 삭제할까요?
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              지금까지 누적된 모든 세션 및 통계 데이터가 초기화됩니다.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 py-2 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs"
              >
                취소
              </button>
              <button
                onClick={() => {
                  onClearAll();
                  setShowClearConfirm(false);
                }}
                className="flex-1 py-2 rounded-xl bg-rose-600 text-white font-bold text-xs shadow-md shadow-rose-600/30"
              >
                전체 초기화
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
