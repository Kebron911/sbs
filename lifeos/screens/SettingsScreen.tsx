import React from 'react';
import Card from '../components/ui/Card';
import { useGame } from '../contexts/GameContext';
import { Settings, Theme } from '../types';
import { useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';

const GameRulesScreen: React.FC = () => {
  const { settings, updateSettings } = useGame();
  const navigate = useNavigate();

  const handleSettingChange = (key: keyof Settings, value: any) => {
    updateSettings({ [key]: value });
  };

  const SettingRow: React.FC<{ label: string, children: React.ReactNode}> = ({label, children}) => (
    <div className="flex items-center justify-between py-3 border-b border-border-color">
        <label className="text-text-main">{label}</label>
        <div>{children}</div>
    </div>
  )

  const ToggleSwitch: React.FC<{ checked: boolean, onChange: (checked: boolean) => void }> = ({ checked, onChange }) => (
     <label className="relative inline-flex items-center cursor-pointer">
        <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="sr-only peer" />
        <div className="w-11 h-6 bg-primary rounded-full peer peer-focus:ring-4 peer-focus:ring-accent/50 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
    </label>
  )

  return (
    <div className="space-y-8">
      <h1 className="font-display text-3xl md:text-4xl text-white">Game Rules</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card title="Game Configuration">
            <SettingRow label="Difficulty">
                <select 
                  value={settings.difficulty} 
                  onChange={(e) => handleSettingChange('difficulty', e.target.value)}
                  className="bg-primary border border-border-color rounded p-1 text-text-main"
                >
                    <option>Easy</option>
                    <option>Normal</option>
                    <option>Hard</option>
                </select>
            </SettingRow>
            <SettingRow label="Theme">
                 <select 
                    value={settings.theme}
                    onChange={(e) => handleSettingChange('theme', e.target.value as Theme)}
                    className="bg-primary border border-border-color rounded p-1 text-text-main"
                  >
                    <option value="dark">Dark</option>
                    <option value="retro">Retro</option>
                    <option value="cyberpunk">Cyberpunk</option>
                    <option value="solari">Solari</option>
                    <option value="grove">Grove</option>
                    <option value="oceanic">Oceanic</option>
                    <option value="crimson">Crimson</option>
                    <option value="synthwave">Synthwave</option>
                    <option value="steampunk">Steampunk</option>
                    <option value="monochrome">Monochrome</option>
                </select>
            </SettingRow>
             <SettingRow label={`XP Gain Rate (${settings.xpGainRate}%)`}>
                <input 
                  type="range" 
                  min="50" 
                  max="150" 
                  step="10"
                  value={settings.xpGainRate}
                  onChange={(e) => handleSettingChange('xpGainRate', parseInt(e.target.value, 10))}
                  className="w-24 accent-accent" 
                />
            </SettingRow>
             <div className="pt-4">
                 <Button variant="secondary" className="w-full" onClick={() => navigate('/prestige')}>
                    Manage Prestige & Upgrades
                </Button>
            </div>
        </Card>

        <Card title="Notifications">
            <SettingRow label="Daily Reminders">
                <ToggleSwitch checked={settings.dailyReminders} onChange={(v) => handleSettingChange('dailyReminders', v)} />
            </SettingRow>
            <SettingRow label="Quest Deadlines">
                 <ToggleSwitch checked={settings.questDeadlines} onChange={(v) => handleSettingChange('questDeadlines', v)} />
            </SettingRow>
            <SettingRow label="Habit Check-ins">
                 <ToggleSwitch checked={settings.habitCheckins} onChange={(v) => handleSettingChange('habitCheckins', v)} />
            </SettingRow>
            <SettingRow label="Reminder Time">
                 <input 
                  type="time" 
                  value={settings.reminderTime}
                  onChange={(e) => handleSettingChange('reminderTime', e.target.value)}
                  className="bg-primary border border-border-color rounded p-1 text-text-main" 
                />
            </SettingRow>
        </Card>

        <Card title="Account" className="md:col-span-2">
             <SettingRow label="Email">
                <input type="email" defaultValue="valerius@lifeos.game" className="bg-primary border border-border-color rounded p-1 w-64 text-text-main" />
            </SettingRow>
             <SettingRow label="Change Password">
                <button className="text-sm bg-secondary px-3 py-1 rounded hover:bg-primary text-text-main">Change</button>
            </SettingRow>
            <div className="mt-4 flex space-x-4">
                <button className="flex-1 bg-mana/80 hover:bg-mana text-white font-bold py-2 px-4 rounded-lg">Export Data</button>
                <button className="flex-1 bg-hp/80 hover:bg-hp text-white font-bold py-2 px-4 rounded-lg">Delete Account</button>
            </div>
        </Card>
      </div>

    </div>
  );
};

export default GameRulesScreen;