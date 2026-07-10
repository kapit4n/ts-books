import React from 'react';
import { useReaderStore } from '../../hooks/useReader';
import { FitMode, ReadingMode } from '../../types/library';

interface ReaderPreferencesProps {
  onChange?: () => void;
}

const fitModes: { value: FitMode; label: string }[] = [
  { value: 'width', label: 'Fit Width' },
  { value: 'height', label: 'Fit Height' },
  { value: 'actual', label: 'Actual Size' },
];

const readingModes: { value: ReadingMode; label: string; desc: string }[] = [
  { value: 'standard', label: 'Standard', desc: 'Sidebars follow your preference' },
  { value: 'focus', label: 'Focus', desc: 'Hide everything, just read' },
  { value: 'study', label: 'Study', desc: 'Sidebars open for active learning' },
];

export const ReaderPreferencesComponent: React.FC<ReaderPreferencesProps> = ({ onChange }) => {
  const { zoom, fitMode, readingMode, setFitMode, setReadingMode, setZoom } = useReaderStore();

  return (
    <div className="reader-prefs-panel">
      <h4 className="reader-prefs-heading">Reader Preferences</h4>

      <div className="reader-pref-group">
        <label>Reading Mode</label>
        <div className="reader-pref-modes">
          {readingModes.map((m) => (
            <button
              key={m.value}
              className={`reader-pref-mode ${readingMode === m.value ? 'active' : ''}`}
              onClick={() => { setReadingMode(m.value); onChange?.(); }}
            >
              <span className="reader-pref-mode-label">{m.label}</span>
              <span className="reader-pref-mode-desc">{m.desc}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="reader-pref-group">
        <label>Zoom</label>
        <span className="reader-pref-value">{Math.round(zoom * 100)}%</span>
      </div>

      <div className="reader-pref-group">
        <label>Fit Mode</label>
        <div className="reader-pref-btns">
          {fitModes.map((m) => (
            <button
              key={m.value}
              className={fitMode === m.value ? 'active' : ''}
              onClick={() => { setFitMode(m.value); onChange?.(); }}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
