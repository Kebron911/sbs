
import React from 'react';

// FIX: Extend HTMLAttributes to allow passing standard div attributes like onClick.
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  title?: string;
}

const Card: React.FC<CardProps> = ({ children, className = '', title, ...props }) => {
  return (
    <div className={`bg-secondary border border-border-color rounded-lg shadow-lg p-4 md:p-6 ${className}`} {...props}>
      {title && <h3 className="font-display text-lg text-accent mb-4">{title}</h3>}
      {children}
    </div>
  );
};

export default Card;
