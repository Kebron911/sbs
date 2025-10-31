import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { HomeIcon, ShieldCheckIcon, ClipboardListIcon, UserIcon, MenuIcon } from '../../screens/lib/icons';
import MoreMenu from './MoreMenu';
import { useGame } from '../../contexts/GameContext';

const BottomNav: React.FC = () => {
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const { tutorialStep, advanceTutorial } = useGame();

  const navItems = [
    { path: '/', icon: <HomeIcon /> },
    { path: '/habits', icon: <ShieldCheckIcon />, tourId: 'habits-link' },
    { path: '/quests', icon: <ClipboardListIcon /> },
    { path: '/character', icon: <UserIcon /> },
  ];

  const NavItem = ({ path, icon, tourId }: { path: string; icon: React.ReactNode; tourId?: string }) => (
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
        `flex flex-col items-center justify-center w-full transition-colors duration-200 ${
          isActive ? 'text-accent' : 'text-text-secondary hover:text-accent'
        }`
      }
    >
      <span className="w-7 h-7">{icon}</span>
    </NavLink>
  );

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 h-16 bg-secondary border-t border-border-color flex items-center justify-around z-50">
        {navItems.map(item => <NavItem key={item.path} path={item.path} icon={item.icon} tourId={item.tourId} />)}
        <button
          onClick={() => setIsMoreMenuOpen(true)}
          className={`flex flex-col items-center justify-center w-full transition-colors duration-200 ${
            isMoreMenuOpen ? 'text-accent' : 'text-text-secondary hover:text-accent'
          }`}
        >
          <span className="w-7 h-7"><MenuIcon /></span>
        </button>
      </nav>
      <MoreMenu isOpen={isMoreMenuOpen} onClose={() => setIsMoreMenuOpen(false)} />
    </>
  );
};

export default BottomNav;