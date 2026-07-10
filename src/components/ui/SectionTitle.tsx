import React from 'react';
import './SectionTitle.css';

interface SectionTitleProps {
  title: string;
  subtitle?: string;
  alignment?: 'left' | 'center';
}

export const SectionTitle: React.FC<SectionTitleProps> = ({
  title,
  subtitle,
  alignment = 'left',
}) => {
  return (
    <div className={`section-title section-title-${alignment}`}>
      <h2 className="section-title-text">{title}</h2>
      {subtitle && <p className="section-title-subtitle">{subtitle}</p>}
    </div>
  );
};
