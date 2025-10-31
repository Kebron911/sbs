
import React from 'react';

interface ProgressBarProps {
  value: number;
  maxValue: number;
  color: string;
  label: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ value, maxValue, color, label }) => {
  const percentage = (value / maxValue) * 100;

  return (
    <div>
      <div className="flex justify-between items-center text-xs mb-1">
        <span className="font-bold text-white">{label}</span>
        <span className="text-text-secondary">{`${value} / ${maxValue}`}</span>
      </div>
      <div className="w-full bg-primary rounded-full h-3.5 border-2 border-border-color overflow-hidden">
        <div
          className={`${color} h-full rounded-full transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
};

export default ProgressBar;
