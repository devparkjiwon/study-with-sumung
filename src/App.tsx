import React, { useState } from 'react';
import { TabType } from './types';
import { useFocusManager } from './hooks/useFocusManager';
import { TitleBar } from './components/TitleBar';
import { TimerView } from './components/TimerView';
import { StatsView } from './components/StatsView';
import { RankingView } from './components/RankingView';
import { SettingsView } from './components/SettingsView';
import { MilestoneModal } from './components/MilestoneModal';
import { ProfileModal } from './components/ProfileModal';

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<TabType>('timer');
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);

  const {
    state,
    elapsedSeconds,
    countdownNumber,
    lastSavedDuration,
    silenceRemainingSeconds,
    records,
    settings,
    profile,
    allowedAppToast,
    isCelebrating,
    currentMilestone,
    startCountdown,
    manualStop,
    cancelWaiting,
    updateSettings,
    updateProfile,
    deleteRecord,
    clearAllRecords,
  } = useFocusManager();

  const handleToggleAlwaysOnTop = () => {
    updateSettings({ alwaysOnTop: !settings.alwaysOnTop });
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-[#F4F8FC] dark:bg-slate-900 text-slate-800 dark:text-slate-100 overflow-hidden font-sans select-none">
      {/* Frameless Custom Title Bar */}
      <TitleBar
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        settings={settings}
        profile={profile}
        onOpenProfile={() => setIsProfileModalOpen(true)}
        onToggleAlwaysOnTop={handleToggleAlwaysOnTop}
      />

      {/* Floating Milestone Celebration Banner */}
      <MilestoneModal milestone={currentMilestone} />

      {/* User Login & Profile Modal */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        profile={profile}
        onClose={() => setIsProfileModalOpen(false)}
        onSave={updateProfile}
      />

      {/* Main View Area */}
      <main className="flex-1 overflow-hidden relative p-2">
        {currentTab === 'timer' && (
          <TimerView
            state={state}
            elapsedSeconds={elapsedSeconds}
            countdownNumber={countdownNumber}
            lastSavedDuration={lastSavedDuration}
            silenceRemainingSeconds={silenceRemainingSeconds}
            records={records}
            settings={settings}
            isCelebrating={isCelebrating}
            allowedAppToast={allowedAppToast}
            onStart={startCountdown}
            onStop={manualStop}
            onCancelWaiting={cancelWaiting}
          />
        )}

        {currentTab === 'stats' && (
          <StatsView
            records={records}
            settings={settings}
            onDeleteRecord={deleteRecord}
            onClearAll={clearAllRecords}
          />
        )}

        {currentTab === 'ranking' && (
          <RankingView
            profile={profile}
            records={records}
            onOpenProfileModal={() => setIsProfileModalOpen(true)}
          />
        )}

        {currentTab === 'settings' && (
          <SettingsView
            settings={settings}
            onUpdateSettings={updateSettings}
          />
        )}
      </main>
    </div>
  );
};

export default App;
