import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
  className?: string;
}

const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', className = '', ...props }) => {
  const baseStyle = 'px-6 py-3 font-bold rounded-lg transition-all duration-200 focus:outline-none focus:ring-4 text-base';
  const variantStyles = {
    primary: 'bg-accent text-white hover:bg-accent/80 focus:ring-accent/50 shadow-glow-accent',
    secondary: 'bg-secondary text-text-main hover:bg-primary focus:ring-accent/50 border border-border-color',
  };

  return (
    <button className={`${baseStyle} ${variantStyles[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};

export default Button;
