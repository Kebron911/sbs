import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';
import { useGame } from '../../contexts/GameContext';
import RewardModal from '../quests/RewardModal';
import BattleAnimation from '../habits/BattleAnimation';
import BadgeNotification from '../ui/BadgeNotification';
import DailyBriefingModal from '../ui/DailyBriefingModal';
import ToastNotification from '../ui/ToastNotification';
import BossFightView from '../quests/BossFightView';
import BossFightVictoryAnimation from '../quests/BossFightVictoryAnimation';
import GuidedTour from '../ui/GuidedTour';
import AICompanionFAB from '../ai/AICompanionFAB';
import AICompanionOverlay from '../ai/AICompanionOverlay';

const MainLayout: React.FC = () => {
  const { rewardModalData, battleAnimationData, badgeNotification, dailyBriefing, toasts, activeBossFight, bossFightVictoryData, tutorialStep, quests } = useGame();
  
  return (
    <div className="flex h-screen bg-background text-text-main">
      {/* Sidebar for medium screens and up */}
      <div className="hidden md:flex">
        <Sidebar />
      </div>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto pb-16 md:pb-0">
        <div className="p-4 md:p-8">
          <Outlet />
        </div>
      </main>

      {/* Bottom navigation for small screens */}
      <div className="md:hidden">
        <BottomNav />
      </div>

      {/* Global Modals & Animations */}
      {rewardModalData && <RewardModal reward={rewardModalData} />}
      {battleAnimationData && <BattleAnimation hpLoss={battleAnimationData.hpLoss} />}
      {badgeNotification && <BadgeNotification badge={badgeNotification} />}
      {dailyBriefing?.visible && <DailyBriefingModal />}
      {activeBossFight && <BossFightView quests={quests} />}
      {bossFightVictoryData && <BossFightVictoryAnimation reward={bossFightVictoryData} />}
      <ToastNotification toasts={toasts} />
      {tutorialStep > 0 && <GuidedTour />}

      {/* AI Companion UI */}
      <AICompanionOverlay />
      <AICompanionFAB />
    </div>
  );
};

export default MainLayout;