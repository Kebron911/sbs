import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useGame } from '../../contexts/GameContext';
import { HomeIcon, ShieldCheckIcon, ClipboardListIcon, ShoppingBagIcon, BookOpenIcon, CogIcon, UsersIcon, ChartBarIcon, TargetIcon } from '../../screens/lib/icons';
import ProgressBar from '../ui/ProgressBar';
import DynamicAvatar from '../character/DynamicAvatar';

const Sidebar: React.FC = () => {
  const { character, tutorialStep, advanceTutorial } = useGame();

  const navItems = [
    { path: '/', label: 'Dashboard', icon: <HomeIcon /> },
    { path: '/habits', label: 'Habits & Skills', icon: <ShieldCheckIcon />, tourId: 'habits-link' },
    { path: '/quests', label: 'Quests', icon: <ClipboardListIcon /> },
    { path: '/goals', label: 'Goals', icon: <TargetIcon /> },
    { path: '/chronicle', label: 'The Chronicle', icon: <BookOpenIcon /> },
    { path: '/oracles-chamber', label: "Oracle's Chamber", icon: <ChartBarIcon /> },
    { path: '/marketplace', label: 'Marketplace', icon: <ShoppingBagIcon /> },
    { path: '/community', label: 'Community', icon: <UsersIcon /> },
    { path: '/game-rules', label: 'Game Rules', icon: <CogIcon /> },
  ];

  const NavItem = ({ path, label, icon, tourId }: { path: string; label: string; icon: React.ReactNode; tourId?: string }) => (
    <NavLink
      to={path}
      end
      data-tour-id={tourId}
      onClick={() => {
        if (tourId === 'habits-link' && tutorialStep === 1) {
          advanceTutorial();
        }
      }}
      className={({ isActive }) =>
        `flex items-center p-3 my-1 rounded-lg transition-all duration-200 ${
          isActive
            ? 'bg-accent text-accent-contrast shadow-glow-accent'
            : 'text-text-secondary hover:bg-secondary hover:text-accent-contrast'
        }`
      }
    >
      <span className="w-6 h-6 mr-3">{icon}</span>
      <span>{label}</span>
    </NavLink>
  );

  return (
    <aside className="w-64 bg-secondary flex flex-col p-4 border-r border-border-color">
      <div className="flex items-center mb-8">
        <h1 className="font-display text-2xl text-accent">LifeOS</h1>
      </div>

      <Link to="/character" className="block p-2 rounded-lg hover:bg-primary/50 transition-colors">
        <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-full border-2 border-accent bg-primary flex-shrink-0 overflow-hidden">
               <DynamicAvatar appearance={character.appearance} equipment={character.equipment} />
            </div>
            <div>
            <h2 className="font-bold text-lg text-white">{character.name}</h2>
            <p className="text-sm text-text-secondary">Level {character.level} {character.class}</p>
            </div>
        </div>
      </Link>
      
      <div className="space-y-3 my-8">
        <ProgressBar value={character.hp} maxValue={character.maxHp} color="bg-hp" label="HP" />
        <ProgressBar value={character.xp} maxValue={character.xpToNextLevel} color="bg-xp" label="XP" />
      </div>

      <nav className="flex-1">
        {navItems.map(item => <NavItem key={item.path} {...item} />)}
      </nav>

      <div className="mt-auto text-center text-xs text-text-secondary">
        <p>&copy; 2023 SBS Gaming</p>
      </div>
    </aside>
  );
};

export default Sidebar;