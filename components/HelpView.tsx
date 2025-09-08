import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import Icon from './Icon';

const HelpView: React.FC = () => {
  const { t } = useTranslation();

  const helpSections = [
    {
      title: 'The Library View',
      icon: 'book',
      content: 'The Library is your portal to Wikipedia. Search for articles, get instant AI-powered insights, and add sources to your compilation. Use the sorting options to organize results by relevance, date, or title.',
    },
    {
      title: 'The Compiler View',
      icon: 'compiler',
      content: 'The Compiler is your workshop. Drag-and-drop articles to structure your narrative, fine-tune a wide range of PDF export settings, and preview your work in Markdown. When ready, export to a polished PDF or a clean Markdown file.',
    },
    {
      title: 'The Archive View',
      icon: 'archive-box',
      content: 'Every article you open is automatically saved in your private, offline Archive. This becomes your personal knowledge base, fully searchable and always available. You can add articles from the Archive back into any project.',
    },
    {
      title: 'Command Palette',
      icon: 'command',
      content: 'Press Ctrl+K (or Cmd+K on Mac) to open the Command Palette. It\'s the fastest way to navigate between views, create projects, and access other key functions without leaving the keyboard.',
    },
    {
      title: 'The Settings View',
      icon: 'settings',
      content: 'Customize the application\'s appearance, set default behaviors, manage AI assistant preferences, and establish default export options. You can also manage your data by clearing the cache or backing up your entire workspace.',
    },
    {
      title: 'Power Tips',
      icon: 'sparkles',
      content: 'Save your favorite export settings as defaults in the Compiler via the Settings & Export pane.\nUse the keyboard to quickly reorder articles in the Compiler (Ctrl/Cmd + Arrow Up/Down).\nBackup your entire workspace from the Settings > Storage tab to keep your work safe.',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-10 text-center">{t('Help & Getting Started')}</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {helpSections.map((section) => (
          <div key={section.title} className="bg-white dark:bg-gray-800/50 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 flex flex-col items-start transform hover:-translate-y-1 transition-transform duration-300">
             <div className="p-3 rounded-full bg-accent-100 dark:bg-accent-900/50 mb-4">
                <Icon name={section.icon} className="w-8 h-8 text-accent-600 dark:text-accent-400" />
            </div>
            <h2 className="text-xl font-bold mb-2 text-gray-900 dark:text-gray-100">
              {t(section.title)}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-sm whitespace-pre-line">
              {t(section.content)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default memo(HelpView);