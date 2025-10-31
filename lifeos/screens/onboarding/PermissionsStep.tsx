import React from 'react';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';

interface Props {
  onFinish: () => void;
}

const ToggleSwitch = ({ defaultChecked = true }: { defaultChecked?: boolean }) => (
    <label className="relative inline-flex items-center cursor-pointer">
        <input type="checkbox" defaultChecked={defaultChecked} className="sr-only peer" />
        <div className="w-11 h-6 bg-primary rounded-full peer peer-focus:ring-4 peer-focus:ring-accent/50 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
    </label>
);

const SettingRow: React.FC<{ label: string, description: string }> = ({ label, description }) => (
    <div className="flex items-center justify-between py-4 border-b border-border-color">
        <div>
            <p className="font-bold text-text-main">{label}</p>
            <p className="text-sm text-text-secondary">{description}</p>
        </div>
        <ToggleSwitch />
    </div>
);


const PermissionsStep: React.FC<Props> = ({ onFinish }) => {
  return (
    <Card title="Final Setup" className="animate-fade-in">
        <p className="text-text-secondary mb-4">
            A few final settings to optimize your journey. You can change these any time in the Settings menu.
        </p>
        <div className="space-y-2 mb-6">
            <SettingRow label="Enable Notifications" description="Get reminders for habits and quests." />
            <SettingRow label="Cloud Sync & Backup" description="Keep your progress safe across devices."/>
        </div>
        <Button onClick={onFinish} className="w-full">
            Enter the World
        </Button>
    </Card>
  );
};

export default PermissionsStep;
