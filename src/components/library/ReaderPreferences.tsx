import React from 'react';
import { useReaderStore } from '../../hooks/useReader';

interface ReaderPreferencesProps {
  onChange?: () => void;
}

export const ReaderPreferencesComponent: React.FC<ReaderPreferencesProps> = ({ onChange }) => {
  const { zoom, setZoom, fitMode, setFitMode } = useReaderStore();

  return (
    <div className="reader-prefs-panel">
      <h4 className="reader-prefs-heading">Reader Preferences</h4>

      <div className="reader-pref-group">
        <label>Zoom</label>
        <span className="reader-pref-value">{Math.round(zoom * 100)}%</span>
      </div>

      <div className="reader-pref-group">
        <label>Fit Mode</label>
        <div className="reader-pref-btns">
          <button
            className={fitMode === 'width' ? 'active' : ''}
            onClick={() => { setFitMode('width'); onChange?.(); }}
          >
            Fit Width
          </button>
          <button
            className={fitMode === 'page' ? 'active' : ''}
            onClick={() => { setFitMode('page'); onChange?.(); }}
          >
            Fit Page
          </button>
        </div>
      </div>
    </div>
  );
};
