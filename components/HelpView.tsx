import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import Icon from './Icon';

const HelpView: React.FC = () => {
  const { t } = useTranslation();

  const helpSections = [
    {
      title: 'The Library View',
      icon: 'book',
      content: 'The Library is your starting point. Here, you can search for Wikipedia articles. As you find interesting articles, you can preview them and add them to your current project compilation. You can also use the AI Research Assistant to get a quick summary, key concepts, and potential research questions for any article.',
    },
    {
      title: 'The Compiler View',
      icon: 'compiler',
      content: 'The Compiler is where you organize your project. You can reorder the articles in your compilation, rename your project, and configure various export settings. When you\'re ready, you can export your compilation as a beautifully formatted PDF or a Markdown file.',
    },
    {
      title: 'The Archive View',
      icon: 'archive-box',
      content: 'The Archive stores every article you have ever viewed. This creates a personal, searchable knowledge base of all your research. You can view articles from the archive, add them to your current project, or delete them permanently.',
    },
    {
      title: 'Command Palette',
      icon: 'command',
      content: 'Press Ctrl+K (or Cmd+K on Mac) to open the Command Palette. This gives you quick, keyboard-driven access to navigate between views, create new projects, and toggle dark mode.',
    },
    {
      title: 'Settings',
      icon: 'settings',
      content: 'In the Settings view, you can customize the application\'s appearance, change the default view on startup, manage AI assistant settings, and configure default export options for the compiler. You can also manage your data by clearing the article cache or exporting/importing all your projects and settings.',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-8 text-center">{t('Help & Getting Started')}</h1>
      <div className="space-y-8">
        {helpSections.map((section, index) => (
          <div key={index} className="bg-white dark:bg-gray-800/50 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-semibold mb-3 flex items-center gap-3">
              <Icon name={section.icon} className="w-6 h-6 text-accent-500" />
              <span>{t(section.title)}</span>
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              {t(section.content)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default memo(HelpView);