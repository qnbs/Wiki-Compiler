import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Modal from './Modal';
import Icon from './Icon';
import Spinner from './Spinner';

interface AIEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRunAiEdit: (prompt: string) => void;
  isEditing: boolean;
  error: string | null;
  selectedText?: string;
}

const AIEditorModal: React.FC<AIEditorModalProps> = ({ isOpen, onClose, onRunAiEdit, isEditing, error, selectedText }) => {
  const { t } = useTranslation();
  const [prompt, setPrompt] = useState('');

  const quickActions = [
    { label: 'Improve Writing', prompt: 'Improve the writing. Make it clearer, more concise, and more professional without changing the core meaning.' },
    { label: 'Summarize', prompt: 'Summarize the following text into one or two key sentences.' },
    { label: 'Fix Spelling & Grammar', prompt: 'Correct any spelling mistakes and grammatical errors.' },
    { label: 'Change Tone to Academic', prompt: 'Rewrite the text in a formal, academic tone.' },
  ];

  const handleRun = () => {
    if (prompt.trim()) {
      onRunAiEdit(prompt);
    }
  };

  const handleQuickAction = (actionPrompt: string) => {
    setPrompt(actionPrompt);
    onRunAiEdit(actionPrompt);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('Edit with AI')}
      actions={
        <button
          onClick={handleRun}
          disabled={isEditing || !prompt.trim()}
          className="px-4 py-2 text-sm font-medium text-white bg-accent-600 rounded-lg hover:bg-accent-700 disabled:bg-gray-400 flex items-center justify-center gap-2"
        >
          {isEditing ? <Spinner light /> : <Icon name="sparkles" className="w-4 h-4" />}
          {isEditing ? t('Editing...') : t('Run Edit')}
        </button>
      }
    >
      <div className="space-y-4">
        {selectedText && (
          <div className="max-h-24 overflow-y-auto p-2 border rounded-md bg-gray-50 dark:bg-gray-700/50 dark:border-gray-600">
            <p className="text-xs text-gray-500 dark:text-gray-400 italic line-clamp-4">{selectedText}</p>
          </div>
        )}
        <div>
          <label htmlFor="ai-prompt" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('Your Instruction')}</label>
          <textarea
            id="ai-prompt"
            rows={3}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                    handleRun();
                }
            }}
            placeholder={t('e.g., "Make this paragraph more concise."')}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-accent-500"
          />
           <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t('Tip: Press Ctrl+Enter to run.')}</p>
        </div>
        <div>
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('Quick Actions')}</h4>
          <div className="flex flex-wrap gap-2">
            {quickActions.map(action => (
              <button
                key={action.label}
                onClick={() => handleQuickAction(action.prompt)}
                disabled={isEditing}
                className="px-3 py-1.5 text-xs font-semibold text-accent-700 dark:text-accent-300 bg-accent-100 dark:bg-accent-900/50 rounded-full hover:bg-accent-200 dark:hover:bg-accent-900 disabled:opacity-50"
              >
                {t(action.label)}
              </button>
            ))}
          </div>
        </div>
        {error && <p className="text-sm text-red-500">{error}</p>}
      </div>
    </Modal>
  );
};

export default AIEditorModal;
