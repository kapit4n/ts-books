import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Lightbulb, Code, FileText, HelpCircle, Layers, CheckCircle, Terminal,
  ChevronDown, Sparkles,
} from 'lucide-react';
import { PROMPT_TEMPLATES, AIPromptTemplate } from '../../types/ai';
import './PromptToolbar.css';

interface PromptToolbarProps {
  selectedText: string;
  onApplyTemplate: (template: AIPromptTemplate, text: string) => void;
  onClose: () => void;
}

const ICON_MAP: Record<string, React.ReactNode> = {
  'lightbulb': <Lightbulb size={14} />,
  'code': <Code size={14} />,
  'file-text': <FileText size={14} />,
  'help-circle': <HelpCircle size={14} />,
  'layers': <Layers size={14} />,
  'check-circle': <CheckCircle size={14} />,
  'terminal': <Terminal size={14} />,
};

export const PromptToolbar: React.FC<PromptToolbarProps> = ({
  selectedText,
  onApplyTemplate,
  onClose,
}) => {
  const [showAll, setShowAll] = useState(false);

  const quickTemplates = PROMPT_TEMPLATES.filter((t) => t.requiresSelection).slice(0, 4);
  const allTemplates = showAll ? PROMPT_TEMPLATES : quickTemplates;

  const handleApply = useCallback((template: AIPromptTemplate) => {
    onApplyTemplate(template, selectedText);
    onClose();
  }, [selectedText, onApplyTemplate, onClose]);

  return (
    <motion.div
      className="prompt-toolbar"
      initial={{ opacity: 0, y: -8, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.95 }}
      transition={{ duration: 0.15 }}
    >
      <div className="prompt-toolbar-header">
        <Sparkles size={14} />
        <span>Ask AI about selected text</span>
      </div>
      <div className="prompt-toolbar-actions">
        {allTemplates.map((template) => (
          <button
            key={template.id}
            className="prompt-toolbar-btn"
            onClick={() => handleApply(template)}
            title={template.description}
          >
            {ICON_MAP[template.icon] || <Sparkles size={14} />}
            <span>{template.name}</span>
          </button>
        ))}
      </div>
      {!showAll && PROMPT_TEMPLATES.length > quickTemplates.length && (
        <button className="prompt-toolbar-more" onClick={() => setShowAll(true)}>
          <ChevronDown size={12} />
          <span>More actions</span>
        </button>
      )}
    </motion.div>
  );
};
