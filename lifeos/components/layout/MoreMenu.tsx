import React from 'react';
import { NavLink } from 'react-router-dom';
import { BookOpenIcon, ChartBarIcon, ShoppingBagIcon, UsersIcon, CogIcon, TargetIcon } from '../../screens/lib/icons';

interface MoreMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const MoreMenu: React.FC<MoreMenuProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const menuItems = [
    { path: '/goals', label: 'Goals', icon: <TargetIcon /> },
    { path: '/chronicle', label: 'The Chronicle', icon: <BookOpenIcon /> },
    { path: '/oracles-chamber', label: "Oracle's Chamber", icon: <ChartBarIcon /> },
    { path: '/marketplace', label: 'Marketplace', icon: <ShoppingBagIcon /> },
    { path: '/community', label: 'Community', icon: <UsersIcon /> },
    { path: '/game-rules', label: 'Game Rules', icon: <CogIcon /> },
  ];

  return (
    <div
      className="fixed inset-0 bg-black/60 z-40 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="fixed bottom-16 left-0 right-0 bg-secondary border-t border-border-color rounded-t-2xl p-4"
        style={{ animation: 'slideUp 0.3s ease-out forwards' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="grid grid-cols-3 gap-4 text-center">
          {menuItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center p-2 rounded-lg transition-colors duration-200 ${
                  isActive ? 'text-accent bg-primary' : 'text-text-secondary hover:text-accent hover:bg-primary'
                }`
              }
            >
              <span className="w-7 h-7 mb-1">{item.icon}</span>
              <span className="text-xs">{item.label}</span>
            </NavLink>
          ))}
        </div>
      </div>
       <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default MoreMenu;