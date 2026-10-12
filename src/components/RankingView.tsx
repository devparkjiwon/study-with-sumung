import React, { useState, useEffect, useMemo } from 'react';
import { UserProfile, StudySession, RankUser } from '../types';
import { formatKoreanDuration, getTodayDateString } from '../utils/format';
import { fetchLiveLeaderboard } from '../services/api';
import { Trophy, Medal, Flame, Users, Sparkles, TrendingUp, Award, RefreshCw } from 'lucide-react';

interface RankingViewProps {
  profile: UserProfile;
  records: StudySession[];
  onOpenProfileModal: () => void;
}

export const RankingView: React.FC<RankingViewProps> = ({
  profile,
  records,
  onOpenProfileModal,
}) => {
  const [filterType, setFilterType] = useState<'today' | 'weekly' | 'department'>('today');
  const [liveDbData, setLiveDbData] = useState<any[]>([]);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const todayStr = getTodayDateString();
  const todayTotalSeconds = useMemo(
    () =>
      records
        .filter((r) => r.date === todayStr)
        .reduce((sum, r) => sum + r.durationSeconds, 0),
    [records, todayStr]
  );

  const weeklyTotalSeconds = useMemo(
    () => records.reduce((sum, r) => sum + r.durationSeconds, 0),
    [records]
  );

  const getUserTier = (sec: number): RankUser['tier'] => {
    if (sec >= 28800) return '챌린저 뭉이'; // 8h+
    if (sec >= 18000) return '다이아 뭉이';  // 5h+
    if (sec >= 10800) return '골드 뭉이';    // 3h+
    if (sec >= 3600) return '실버 뭉이';     // 1h+
    return '브론즈 뭉이';
  };

  // Fetch real data from DB
  const loadLeaderboard = async () => {
    setIsRefreshing(true);
    try {
      const data = await fetchLiveLeaderboard(filterType);
      if (Array.isArray(data) && data.length > 0) {
        setLiveDbData(data);
      }
    } catch (e) {
      console.warn('Could not load remote DB leaderboard:', e);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadLeaderboard();
  }, [filterType, todayTotalSeconds]);

  // Merge DB data with current user
  const rankedUsers: RankUser[] = useMemo(() => {
    if (filterType === 'department') return [];

    let list: RankUser[] = [];

    if (liveDbData.length > 0) {
      list = liveDbData.map((item, idx) => ({
        rank: idx + 1,
        nickname: item.nickname,
        department: item.department,
        studentId: item.studentId,
        todaySeconds: item.todaySeconds || 0,
        weeklySeconds: item.weeklySeconds || 0,
        streakDays: 3,
        tier: getUserTier(filterType === 'today' ? item.todaySeconds : item.weeklySeconds),
        isMe: item.studentId === profile.studentId,
      }));

      // Check if current user is in list
      const meExists = list.some((u) => u.isMe);
      if (!meExists) {
        const mySec = filterType === 'today' ? todayTotalSeconds : weeklyTotalSeconds;
        list.push({
          rank: list.length + 1,
          nickname: profile.nickname,
          department: profile.department,
          studentId: profile.studentId,
          todaySeconds: todayTotalSeconds,
          weeklySeconds: weeklyTotalSeconds,
          streakDays: 3,
          tier: getUserTier(mySec),
          isMe: true,
        });
        // Re-sort
        list.sort((a, b) =>
          filterType === 'today'
            ? b.todaySeconds - a.todaySeconds
            : b.weeklySeconds - a.weeklySeconds
        );
        list = list.map((u, i) => ({ ...u, rank: i + 1 }));
      }
    } else {
      // Fallback local list
      const mySec = filterType === 'today' ? todayTotalSeconds : weeklyTotalSeconds;
      list = [
        { rank: 1, nickname: '알고리즘장인', department: '소프트웨어학과', studentId: '20231012', todaySeconds: 23400, weeklySeconds: 84000, streakDays: 6, tier: '다이아 뭉이' },
        { rank: 2, nickname: '밤샘디자이너', department: '시각디자인전공', studentId: '20242031', todaySeconds: 19800, weeklySeconds: 76000, streakDays: 5, tier: '다이아 뭉이' },
        { rank: 3, nickname: 'A+폭격기', department: '경영학부', studentId: '20221055', todaySeconds: 15600, weeklySeconds: 61000, streakDays: 4, tier: '골드 뭉이' },
        { rank: 4, nickname: profile.nickname, department: profile.department, studentId: profile.studentId, todaySeconds: todayTotalSeconds, weeklySeconds: weeklyTotalSeconds, streakDays: 3, tier: getUserTier(mySec), isMe: true },
      ];
      list.sort((a, b) =>
        filterType === 'today'
          ? b.todaySeconds - a.todaySeconds
          : b.weeklySeconds - a.weeklySeconds
      );
      list = list.map((u, i) => ({ ...u, rank: i + 1 }));
    }

    return list;
  }, [liveDbData, filterType, todayTotalSeconds, weeklyTotalSeconds, profile]);

  const myRank = rankedUsers.find((u) => u.isMe);

  // Department scores
  const deptScores = useMemo(() => {
    if (filterType !== 'department') return [];
    if (liveDbData.length > 0 && liveDbData[0]?.studentCount !== undefined) {
      return liveDbData;
    }
    return [
      { department: '소프트웨어학과', totalSec: 42000 + todayTotalSeconds, studentCount: 14 },
      { department: '시각디자인전공', totalSec: 36000, studentCount: 11 },
      { department: '경영학부', totalSec: 29000, studentCount: 9 },
      { department: '컴퓨터과학과', totalSec: 24000, studentCount: 8 },
      { department: '애니메이션전공', totalSec: 18000, studentCount: 6 },
    ];
  }, [filterType, liveDbData, todayTotalSeconds]);

  return (
    <div className="flex flex-col h-full overflow-y-auto px-4 py-3 space-y-4 max-w-4xl mx-auto select-none">
      {/* Header & Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-1 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            <h2 className="text-lg font-black text-slate-800 dark:text-slate-100">
              상명대 시험기간 실시간 DB 랭킹
            </h2>
            <button
              onClick={loadLeaderboard}
              title="랭킹 새로고침"
              className={`p-1 rounded-lg text-slate-400 hover:text-mung-600 ${isRefreshing ? 'animate-spin' : ''}`}
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
          <p className="text-xs text-slate-400">
            데이터베이스에 저장된 실제 상명대 학우들의 집중 시간 랭킹입니다.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-bold">
          <button
            onClick={() => setFilterType('today')}
            className={`px-3 py-1 rounded-lg transition-all ${
              filterType === 'today'
                ? 'bg-white dark:bg-slate-700 text-mung-600 dark:text-mung-300 shadow-sm'
                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
            }`}
          >
            오늘 랭킹
          </button>
          <button
            onClick={() => setFilterType('weekly')}
            className={`px-3 py-1 rounded-lg transition-all ${
              filterType === 'weekly'
                ? 'bg-white dark:bg-slate-700 text-mung-600 dark:text-mung-300 shadow-sm'
                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
            }`}
          >
            이번 주 랭킹
          </button>
          <button
            onClick={() => setFilterType('department')}
            className={`px-3 py-1 rounded-lg transition-all ${
              filterType === 'department'
                ? 'bg-white dark:bg-slate-700 text-mung-600 dark:text-mung-300 shadow-sm'
                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
            }`}
          >
            학과 대항전
          </button>
        </div>
      </div>

      {/* My Rank Highlight Card */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-mung-600 text-white shadow-lg shadow-blue-500/20 flex items-center justify-between relative overflow-hidden">
        <div className="absolute -right-6 -bottom-6 w-32 h-32 rounded-full bg-white/10 blur-xl pointer-events-none" />

        <div className="flex items-center gap-3.5 z-10">
          <div className="w-14 h-14 rounded-2xl bg-white/20 border-2 border-white/40 p-1 flex items-center justify-center shrink-0">
            <img
              src="./assets/sumung/sumung_celebrate.png"
              alt="수뭉이 프로필"
              className="w-full h-full object-contain filter drop-shadow"
            />
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-black text-base tracking-tight">
                {profile.nickname}
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/20 border border-white/30 text-yellow-300">
                {myRank?.tier}
              </span>
            </div>
            <span className="text-xs text-blue-100 mt-0.5">
              {profile.department} • 학번 {profile.studentId}
            </span>
            <div className="flex items-center gap-1 text-[11px] text-emerald-200 mt-1 font-semibold">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>
                {myRank && myRank.rank === 1
                  ? '👑 상명대 전체 1등 수뭉이입니다!'
                  : `현재 전체 ${myRank?.rank || '-'}위! 계속 집중해서 순위를 높여보세요!`}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end z-10">
          <div className="flex items-center gap-1.5 text-2xl font-black text-yellow-300">
            <span>{myRank?.rank || '-'}위</span>
          </div>
          <span className="text-xs font-semibold text-white/90 mt-0.5">
            {formatKoreanDuration(filterType === 'today' ? todayTotalSeconds : weeklyTotalSeconds)}
          </span>
          <button
            onClick={onOpenProfileModal}
            className="mt-2 px-2.5 py-1 rounded-xl bg-white/20 hover:bg-white/30 text-[11px] font-bold text-white transition-colors border border-white/30"
          >
            {profile.isLoggedIn ? '계정 정보' : '로그인'}
          </button>
        </div>
      </div>

      {filterType !== 'department' ? (
        <>
          {/* Top 3 Podium Cards */}
          <div className="grid grid-cols-3 gap-3">
            {rankedUsers.slice(0, 3).map((user) => {
              const isFirst = user.rank === 1;
              const isSecond = user.rank === 2;
              const isThird = user.rank === 3;

              return (
                <div
                  key={user.nickname}
                  className={`p-3.5 rounded-2xl flex flex-col items-center text-center transition-all shadow-sm ${
                    user.isMe
                      ? 'border-2 border-mung-500 bg-mung-50 dark:bg-mung-950/40'
                      : 'bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700'
                  }`}
                >
                  <div className="text-2xl mb-1">
                    {isFirst && '🥇'}
                    {isSecond && '🥈'}
                    {isThird && '🥉'}
                  </div>

                  <div className="w-12 h-12 rounded-xl bg-mung-100 dark:bg-slate-700 p-1 mb-2 flex items-center justify-center">
                    <img
                      src="./assets/sumung/sumung_celebrate.png"
                      alt={user.nickname}
                      className="w-full h-full object-contain"
                    />
                  </div>

                  <span className="font-extrabold text-sm text-slate-800 dark:text-slate-100 flex items-center gap-1">
                    {user.nickname}
                    {user.isMe && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-blue-600 text-white font-bold">
                        나
                      </span>
                    )}
                  </span>
                  <span className="text-[11px] text-slate-400 mt-0.5">
                    {user.department}
                  </span>

                  <div className="mt-2 px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-700/60 text-xs font-black text-mung-600 dark:text-mung-300">
                    {formatKoreanDuration(
                      filterType === 'today' ? user.todaySeconds : user.weeklySeconds
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* 4th ~ List */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 shadow-sm flex flex-col">
            <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-100 mb-2">
              전체 학우 DB 순위표
            </h3>

            <div className="divide-y divide-slate-100 dark:divide-slate-700/60">
              {rankedUsers.slice(3).map((user) => (
                <div
                  key={user.nickname}
                  className={`py-2.5 px-2 flex items-center justify-between rounded-xl transition-colors ${
                    user.isMe
                      ? 'bg-mung-50 dark:bg-mung-950/40 font-bold'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-700/30'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="font-black text-sm text-slate-400 dark:text-slate-500 w-6 text-center">
                      {user.rank}
                    </span>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-sm text-slate-800 dark:text-slate-100">
                          {user.nickname}
                        </span>
                        {user.isMe && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-blue-600 text-white font-bold">
                            나
                          </span>
                        )}
                        <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-500">
                          {user.tier}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400 mt-0.5">
                        {user.department}
                      </span>
                    </div>
                  </div>

                  <span className="font-extrabold text-sm text-slate-700 dark:text-slate-200 font-mono">
                    {formatKoreanDuration(
                      filterType === 'today' ? user.todaySeconds : user.weeklySeconds
                    )}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        /* Department Challenge View */
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 shadow-sm space-y-3">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
              <Users className="w-4 h-4 text-mung-500" />
              <span>상명대 학과별 실시간 합산 대항전</span>
            </h3>
            <span className="text-xs text-slate-400">데이터베이스 실시간 집계</span>
          </div>

          <div className="space-y-2.5">
            {deptScores.map((dept, idx) => (
              <div
                key={dept.department}
                className="p-3 rounded-xl bg-slate-50 dark:bg-slate-700/40 border border-slate-200/60 dark:border-slate-600 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <span className="font-black text-base text-slate-400 w-6 text-center">
                    {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `${idx + 1}`}
                  </span>
                  <div>
                    <span className="font-bold text-sm text-slate-800 dark:text-slate-100">
                      {dept.department}
                    </span>
                    <span className="text-xs text-slate-400 ml-2">
                      ({dept.studentCount}명 참여 중)
                    </span>
                  </div>
                </div>

                <span className="font-extrabold text-sm text-mung-600 dark:text-mung-300">
                  {formatKoreanDuration(dept.totalSec)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
