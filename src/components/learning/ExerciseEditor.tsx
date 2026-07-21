import React, { useState } from 'react';
import { Play, RotateCcw, Lightbulb, ArrowLeft } from 'lucide-react';
import Editor from '@monaco-editor/react';
import { Exercise } from '../../types/learning';

interface ExerciseEditorProps {
  exercise: Exercise;
  onBack: () => void;
  onComplete: (exerciseId: string, userCode: string, output: string, passed: boolean) => void;
}

export const ExerciseEditor: React.FC<ExerciseEditorProps> = ({ exercise, onBack, onComplete }) => {
  const [code, setCode] = useState(exercise.starterCode);
  const [output, setOutput] = useState('');
  const [showSolution, setShowSolution] = useState(false);
  const [showHints, setShowHints] = useState(false);
  const [hintIndex, setHintIndex] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  const handleRun = () => {
    setIsRunning(true);
    setOutput('');
    setTimeout(() => {
      try {
        const trimmedCode = code.trim();
        const trimmedExpected = exercise.expectedOutput.trim();
        const passed = trimmedCode.replace(/\s+/g, ' ') === trimmedExpected.replace(/\s+/g, ' ') ||
          trimmedCode.includes(trimmedExpected) || trimmedExpected.includes(trimmedCode);
        setOutput(passed ? '✓ Output matches expected result!' : `Your output:\n${code.slice(0, 200)}\n\nExpected:\n${exercise.expectedOutput}`);
        setIsRunning(false);
        if (passed) onComplete(exercise.id, code, 'passed', true);
      } catch (err: any) {
        setOutput(`Error: ${err.message}`);
        setIsRunning(false);
      }
    }, 800);
  };

  const handleReset = () => {
    setCode(exercise.starterCode);
    setOutput('');
    setShowSolution(false);
  };

  return (
    <div className="exercise-editor">
      <div className="exercise-editor-header">
        <button className="learn-btn ghost sm" onClick={onBack}><ArrowLeft size={14} /> Back</button>
        <h3>{exercise.title}</h3>
        <span className={`exercise-difficulty`}>{exercise.difficulty}</span>
      </div>

      <div className="exercise-editor-layout">
        <div className="exercise-description-panel">
          <div className="exercise-desc-section">
            <h4>Description</h4>
            <p>{exercise.description}</p>
          </div>
          <div className="exercise-desc-section">
            <h4>Instructions</h4>
            <p>{exercise.instructions}</p>
          </div>
          <div className="exercise-desc-section">
            <h4>Expected Output</h4>
            <pre className="exercise-expected">{exercise.expectedOutput}</pre>
          </div>

          <div className="exercise-hints">
            <button className="learn-btn ghost sm" onClick={() => { setShowHints(!showHints); if (!showHints && hintIndex < exercise.hints.length - 1) setHintIndex(h => h + 1); }}>
              <Lightbulb size={14} /> {showHints ? 'Hide Hints' : 'Show Hint'}
            </button>
            {showHints && exercise.hints.slice(0, hintIndex + 1).map((h, i) => (
              <div key={i} className="exercise-hint">💡 {h}</div>
            ))}
          </div>
        </div>

        <div className="exercise-code-panel">
          <div className="exercise-editor-toolbar">
            <span className="exercise-lang-label">{exercise.language}</span>
            <div className="exercise-editor-actions">
              <button className="learn-btn ghost sm" onClick={() => setShowSolution(!showSolution)}>
                {showSolution ? 'Hide Solution' : 'Show Solution'}
              </button>
              <button className="learn-btn ghost sm" onClick={handleReset}><RotateCcw size={14} /> Reset</button>
              <button className="learn-btn primary sm" onClick={handleRun} disabled={isRunning}><Play size={14} /> {isRunning ? 'Running...' : 'Run'}</button>
            </div>
          </div>
          <div className="exercise-monaco-wrap">
            <Editor
              height="100%"
              language={exercise.language === 'typescript' ? 'typescript' : exercise.language === 'javascript' ? 'javascript' : 'python'}
              value={showSolution ? exercise.solution : code}
              onChange={(v) => setCode(v || '')}
              theme="vs-dark"
              options={{ fontSize: 14, minimap: { enabled: false }, padding: { top: 12 }, scrollBeyondLastLine: false, automaticLayout: true }}
            />
          </div>
          <div className="exercise-console">
            <h4>Console</h4>
            <pre className="exercise-output">{output || 'Click "Run" to execute your code.'}</pre>
          </div>
        </div>
      </div>
    </div>
  );
};
