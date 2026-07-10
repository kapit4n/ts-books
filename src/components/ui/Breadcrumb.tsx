import React from 'react';
import { ChevronRight } from 'lucide-react';
import './Breadcrumb.css';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ items }) => {
  return (
    <nav className="breadcrumb" aria-label="Breadcrumb">
      {items.map((item, index) => (
        <React.Fragment key={index}>
          {index > 0 && <ChevronRight size={14} className="breadcrumb-separator" />}
          {item.href ? (
            <a href={item.href} className="breadcrumb-link">
              {item.label}
            </a>
          ) : (
            <span className="breadcrumb-current">{item.label}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};
