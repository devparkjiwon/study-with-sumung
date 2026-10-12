import React, { useState } from 'react';
import { UserSettings, AllowedApp } from '../types';
import { playTick, playStart, playInterrupted, playMilestone } from '../utils/sound';
import {
  MousePointer,
  RotateCcw,
  Volume2,
  VolumeX,
  Target,
  Pin,
  Moon,
  Sun,
  ShieldCheck,
  Plus,
  Trash2,
  Code,
  FileText,
  BookOpen,
  GraduationCap,
  Bot,
  Video,
  File,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

interface SettingsViewProps {
  settings: UserSettings;
  onUpdateSettings: (settings: Partial<UserSettings>) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onUpdateSettings,
}) => {
  const [testMousePos, setTestMousePos] = useState<{ x: number; y: number } | null>(null);
  const [testDelta, setTestDelta] = useState<number>(0);
  const [testTriggered, setTestTriggered] = useState<boolean>(false);

  // New Allowed App input state
  const [newAppName, setNewAppName] = useState<string>('');
  const [newAppKeyword, setNewAppKeyword] = useState<string>('');

  const handleTestBoxMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!testMousePos) {
      setTestMousePos({ x: e.clientX, y: e.clientY });
      return;
    }
    const dist = Math.hypot(e.clientX - testMousePos.x, e.clientY - testMousePos.y);
    setTestDelta(Math.round(dist * 10) / 10);
    setTestMousePos({ x: e.clientX, y: e.clientY });

    if (dist >= settings.mouseSensitivity) {
      setTestTriggered(true);
      setTimeout(() => setTestTriggered(false), 400);
    }
  };

  // Toggle specific app in whitelist
  const handleToggleApp = (id: string, enabled: boolean) => {
    const updated = settings.allowedApps.map((app) =>
      app.id === id ? { ...app, enabled } : app
    );
    onUpdateSettings({ allowedApps: updated });
  };

  // Delete allowed app
  const handleDeleteApp = (id: string) => {
    const updated = settings.allowedApps.filter((app) => app.id !== id);
    onUpdateSettings({ allowedApps: updated });
  };

  // Add new allowed app
  const handleAddApp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAppName.trim() || !newAppKeyword.trim()) return;

    const newApp: AllowedApp = {
      id: `custom-${Date.now()}`,
      name: newAppName.trim(),
      keyword: newAppKeyword.trim().toLowerCase(),
      enabled: true,
      iconType: 'custom',
    };

    onUpdateSettings({ allowedApps: [...settings.allowedApps, newApp] });
    setNewAppName('');
    setNewAppKeyword('');
  };

  const getAppIcon = (iconType: string) => {
    switch (iconType) {
      case 'code':
        return <Code className="w-4 h-4 text-blue-500" />;
      case 'file-text':
        return <FileText className="w-4 h-4 text-slate-600 dark:text-slate-300" />;
      case 'book-open':
        return <BookOpen className="w-4 h-4 text-rose-500" />;
      case 'graduation-cap':
        return <GraduationCap className="w-4 h-4 text-emerald-500" />;
      case 'bot':
        return <Bot className="w-4 h-4 text-purple-500" />;
      case 'video':
        return <Video className="w-4 h-4 text-sky-500" />;
      default:
        return <File className="w-4 h-4 text-amber-500" />;
    }
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto px-4 py-3 space-y-4 max-w-3xl mx-auto select-none">
      <div className="flex items-center justify-between pb-1 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <h2 className="text-lg font-black text-slate-800 dark:text-slate-100">
            환경 설정
          </h2>
          <p className="text-xs text-slate-400">
            스터디윗뭉의 마우스 감지, 허용 앱 및 학습 편의 기능을 맞춤 설정하세요.
          </p>
        </div>
      </div>

      {/* 1. Whitelist Allowed Apps & Sites (NEW) */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-100">
                특정 앱 / 웹사이트 허용 (화이트리스트 모드)
              </h3>
              <p className="text-xs text-slate-400">
                허용된 프로그램 창을 사용할 때 마우스를 움직여도 집중 타이머를 유지합니다.
              </p>
            </div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.whitelistEnabled}
              onChange={(e) => onUpdateSettings({ whitelistEnabled: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500" />
          </label>
        </div>

        {settings.whitelistEnabled && (
          <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-700">
            {/* Allowed Apps List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {settings.allowedApps.map((app) => (
                <div
                  key={app.id}
                  className={`p-2.5 rounded-xl border flex items-center justify-between transition-colors ${
                    app.enabled
                      ? 'bg-slate-50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600'
                      : 'bg-slate-100/50 dark:bg-slate-800/50 border-slate-200/50 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-white dark:bg-slate-800 flex items-center justify-center shadow-xs">
                      {getAppIcon(app.iconType)}
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-100">
                        {app.name}
                      </span>
                      <span className="block text-[10px] text-slate-400">
                        키워드: {app.keyword}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={app.enabled}
                      onChange={(e) => handleToggleApp(app.id, e.target.checked)}
                      className="accent-emerald-500 w-4 h-4 cursor-pointer"
                    />
                    {app.id.startsWith('custom-') && (
                      <button
                        onClick={() => handleDeleteApp(app.id)}
                        className="text-slate-300 hover:text-rose-500 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Add Custom App / Site Form */}
            <form onSubmit={handleAddApp} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 flex flex-wrap items-center gap-2">
              <input
                type="text"
                placeholder="허용할 앱/사이트명 (예: Overleaf)"
                value={newAppName}
                onChange={(e) => setNewAppName(e.target.value)}
                className="flex-1 min-w-[140px] px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
              <input
                type="text"
                placeholder="창 이름 키워드 (예: overleaf)"
                value={newAppKeyword}
                onChange={(e) => setNewAppKeyword(e.target.value)}
                className="flex-1 min-w-[140px] px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
              <button
                type="submit"
                className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-sm flex items-center gap-1 shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>추가</span>
              </button>
            </form>
          </div>
        )}
      </div>

      {/* 2. Mouse Sensitivity Section */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <MousePointer className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-100">
                마우스 움직임 감지 민감도
              </h3>
              <p className="text-xs text-slate-400">
                현재 임계값: <span className="font-extrabold text-blue-600 dark:text-blue-400">{settings.mouseSensitivity}px</span>
              </p>
            </div>
          </div>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
            기본 권장: 3px
          </span>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-xs text-slate-400">초민감 (1px)</span>
          <input
            type="range"
            min="1"
            max="20"
            step="1"
            value={settings.mouseSensitivity}
            onChange={(e) => onUpdateSettings({ mouseSensitivity: Number(e.target.value) })}
            className="flex-1 accent-mung-500 cursor-pointer"
          />
          <span className="text-xs text-slate-400">둔감 (20px)</span>
        </div>

        {/* Live Test Sandbox */}
        <div
          onMouseMove={handleTestBoxMouseMove}
          onMouseLeave={() => setTestMousePos(null)}
          className={`relative p-3 rounded-xl border-2 border-dashed transition-all cursor-crosshair text-center ${
            testTriggered
              ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400'
              : 'border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/40 text-slate-500'
          }`}
        >
          <p className="text-xs font-bold">
            {testTriggered
              ? `⚡ 움직임 감지 성공! (변위 ${testDelta}px ≥ 기준 ${settings.mouseSensitivity}px)`
              : `🖱️ 이 박스 안에서 마우스를 흔들어 테스트해 보세요 (최근 이동: ${testDelta}px)`}
          </p>
        </div>
      </div>

      {/* 3. Auto-Restart Settings */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <RotateCcw className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-100">
                마우스 정지 시 자동 재시작
              </h3>
              <p className="text-xs text-slate-400">
                마우스가 {settings.autoRestartDelay}초 동안 움직이지 않으면 새로운 세션을 시작합니다.
              </p>
            </div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.autoRestart}
              onChange={(e) => onUpdateSettings({ autoRestart: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-mung-500" />
          </label>
        </div>

        {settings.autoRestart && (
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-700/60 text-xs">
            <span className="text-slate-500 dark:text-slate-400 font-medium">
              자동 재시작 정지 감지 대기 시간:
            </span>
            <div className="flex items-center gap-1.5">
              {[3, 5, 7, 10].map((sec) => (
                <button
                  key={sec}
                  onClick={() => onUpdateSettings({ autoRestartDelay: sec })}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                    settings.autoRestartDelay === sec
                      ? 'bg-mung-500 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  {sec}초
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 4. Daily Study Goal */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <Target className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-100">
                하루 목표 공부 시간
              </h3>
              <p className="text-xs text-slate-400">
                현재 목표: <span className="font-extrabold text-indigo-600 dark:text-indigo-400">{settings.dailyGoalMinutes / 60}시간 ({settings.dailyGoalMinutes}분)</span>
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {[60, 120, 240, 360, 480].map((mins) => (
            <button
              key={mins}
              onClick={() => onUpdateSettings({ dailyGoalMinutes: mins })}
              className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all ${
                settings.dailyGoalMinutes === mins
                  ? 'bg-indigo-500 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              {mins / 60}시간
            </button>
          ))}
        </div>
      </div>

      {/* 5. Sound & Theme Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Sound Effects */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-purple-100 dark:bg-purple-950 flex items-center justify-center text-purple-600 dark:text-purple-400">
                {settings.soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </div>
              <span className="font-bold text-sm text-slate-800 dark:text-slate-100">
                효과음 사용
              </span>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.soundEnabled}
                onChange={(e) => onUpdateSettings({ soundEnabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-mung-500" />
            </label>
          </div>

          <div className="flex items-center gap-1.5 pt-2">
            <button
              onClick={() => playTick(true)}
              className="flex-1 py-1 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-[11px] font-bold hover:bg-slate-200"
            >
              틱 🔔
            </button>
            <button
              onClick={() => playStart(true)}
              className="flex-1 py-1 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-[11px] font-bold hover:bg-slate-200"
            >
              시작 🚀
            </button>
            <button
              onClick={() => playInterrupted(true)}
              className="flex-1 py-1 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-[11px] font-bold hover:bg-slate-200"
            >
              감지 앗! ⚡
            </button>
            <button
              onClick={() => playMilestone(true)}
              className="flex-1 py-1 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-[11px] font-bold hover:bg-slate-200"
            >
              축하 🎉
            </button>
          </div>
        </div>

        {/* Window & Theme */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Pin className="w-4 h-4 text-mung-500" />
              <span className="font-bold text-xs text-slate-700 dark:text-slate-200">
                항상 위에 표시 (Always on Top)
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.alwaysOnTop}
                onChange={(e) => onUpdateSettings({ alwaysOnTop: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-mung-500" />
            </label>
          </div>

          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2">
              {settings.darkMode ? <Moon className="w-4 h-4 text-indigo-400" /> : <Sun className="w-4 h-4 text-amber-500" />}
              <span className="font-bold text-xs text-slate-700 dark:text-slate-200">
                다크 모드
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.darkMode}
                onChange={(e) => onUpdateSettings({ darkMode: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-mung-500" />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};
