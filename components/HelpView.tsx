import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import Icon from './Icon';

const HelpView: React.FC = () => {
  const { t } = useTranslation();

  const helpSections = [
    {
      title: 'help_library_title',
      icon: 'book',
      content: 'help_library_content',
    },
    {
      title: 'help_compiler_title',
      icon: 'compiler',
      content: 'help_compiler_content',
    },
    {
      title: 'help_archive_title',
      icon: 'archive-box',
      content: 'help_archive_content',
    },
    {
      title: 'help_importers_title',
      icon: 'upload',
      content: 'help_importers_content',
    },
    {
      title: 'help_command_palette_title',
      icon: 'command',
      content: 'help_command_palette_content',
    },
    {
      title: 'help_settings_title',
      icon: 'settings',
      content: 'help_settings_content',
    },
    {
      title: 'help_power_tips_title',
      icon: 'sparkles',
      content: 'help_power_tips_content',
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