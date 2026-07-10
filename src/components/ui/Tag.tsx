import React from 'react';
import './Tag.css';

interface TagProps {
  name: string;
}

export const Tag: React.FC<TagProps> = ({ name }) => {
  return (
    <a href={`#${name}`} className="tag">
      #{name}
    </a>
  );
};
