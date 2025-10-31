import React, { useEffect } from 'react';
import { useGame } from '../../contexts/GameContext';

const ThemeManager: React.FC = () => {
  const { settings } = useGame();

  useEffect(() => {
    // Set the data-theme attribute on the root html element
    document.documentElement.setAttribute('data-theme', settings.theme);
    
    // Optional: Add/remove a class for font changes if they aren't handled by CSS variables
    if (settings.theme === 'retro') {
      document.body.style.fontFamily = "var(--font-body)";
    } else {
      document.body.style.fontFamily = "var(--font-body)";
    }

  }, [settings.theme]);

  // This component does not render anything itself
  return null;
};

export default ThemeManager;
