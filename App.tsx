import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { GameProvider, useGame } from './contexts/GameContext';
import MainLayout from './components/layout/MainLayout';
import DashboardScreen from './screens/DashboardScreen';
import HabitsScreen from './screens/HabitsScreen';
import QuestsScreen from './screens/QuestsScreen';
import MarketplaceScreen from './screens/MarketplaceScreen';
import GameRulesScreen from './screens/GameRulesScreen';
import OnboardingFlow from './screens/onboarding/OnboardingFlow';
import CommunityScreen from './screens/CommunityScreen';
import CharacterScreen from './screens/CharacterScreen';
import ThemeManager from './components/layout/ThemeManager';
import ChronicleScreen from './screens/ChronicleScreen';
import OraclesChamberScreen from './screens/OraclesChamberScreen';
import QuestTemplateLibraryScreen from './screens/QuestTemplateLibraryScreen';
import GoalsScreen from './screens/GoalsScreen';
import PrestigeScreen from './screens/PrestigeScreen';

const AppRoutes: React.FC = () => {
  const { isOnboarded } = useGame();

  if (!isOnboarded) {
    return (
      <Routes>
        <Route path="*" element={<OnboardingFlow />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<DashboardScreen />} />
        <Route path="habits" element={<HabitsScreen />} />
        <Route path="quests" element={<QuestsScreen />} />
        <Route path="quest-templates" element={<QuestTemplateLibraryScreen />} />
        <Route path="goals" element={<GoalsScreen />} />
        <Route path="chronicle" element={<ChronicleScreen />} />
        <Route path="oracles-chamber" element={<OraclesChamberScreen />} />
        <Route path="marketplace" element={<MarketplaceScreen />} />
        <Route path="community" element={<CommunityScreen />} />
        <Route path="character" element={<CharacterScreen />} />
        <Route path="game-rules" element={<GameRulesScreen />} />
        <Route path="prestige" element={<PrestigeScreen />} />
      </Route>
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <GameProvider>
      <ThemeManager />
      <HashRouter>
        <AppRoutes />
      </HashRouter>
    </GameProvider>
  );
};

export default App;