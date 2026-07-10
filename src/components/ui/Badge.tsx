import React from 'react';
import './Badge.css';

interface BadgeProps {
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
  children: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({ variant = 'default', children }) => {
  return <span className={`badge badge-${variant}`}>{children}</span>;
};
