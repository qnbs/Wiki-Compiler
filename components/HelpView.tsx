import React from 'react';
import { useTranslation } from 'https://esm.sh/react-i18next@14.1.2';
import Icon from './Icon';

const HelpView: React.FC = () => {
  const { t } = useTranslation();

  const HelpSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="bg-white dark:bg-gray-800/50 p-6 rounded-lg shadow-sm">
      <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-200">{t(title)}</h2>
      <div className="prose prose-lg dark:prose-invert max-w-none">
        {children}
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-10">
        <Icon name="help" className="w-16 h-16 mx-auto text-blue-500 mb-4" />
        <h1 className="text-4xl font-bold">{t('How can we help?')}</h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 mt-2">{t('Welcome to Wiki Compiler!')}</p>
        <p className="text-gray-500 dark:text-gray-400">{t('This guide will walk you through the main features of the application.')}</p>
      </div>

      <div className="space-y-8">
        <HelpSection title="The Library View">
            <p>{t('The Library is your starting point for research. Here you can:')}</p>
            <ul>
                <li>{t('Search for Wikipedia articles using the search bar.')}</li>
                <li>{t('Preview articles by clicking on them in the search results.')}</li>
                <li>{t('Generate AI-powered summaries of articles for a quick overview.')}</li>
                <li>{t('Add articles to your current compilation project.')}</li>
            </ul>
        </HelpSection>

        <HelpSection title="The Compiler View">
            <p>{t('The Compiler is where you assemble and customize your knowledge compilation. In this view, you can:')}</p>
            <ul>
                <li>{t('View all articles in your compilation.')}</li>
                <li>{t('Reorder articles by dragging and dropping them.')}</li>
                <li>{t('Remove articles you no longer need.')}</li>
                <li>{t('Customize export settings like paper size, layout, and fonts.')}</li>
                <li>{t('Export your final compilation as a professional-looking PDF or a flexible Markdown file.')}</li>
            </ul>
        </HelpSection>
        
        <HelpSection title="Managing Projects">
            <p>{t('You can work on multiple compilations. Use the project dropdown in the header to:')}</p>
            <ul>
                <li>{t('Create new projects.')}</li>
                <li>{t('Switch between existing projects.')}</li>
                <li>{t('Delete projects.')}</li>
            </ul>
        </HelpSection>

        <HelpSection title="Command Palette">
          <p>{t('For quick navigation and actions, use the Command Palette.')} <span className="font-semibold">{t('Press')} <kbd className="px-2 py-1.5 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg dark:bg-gray-600 dark:text-gray-100 dark:border-gray-500">⌘K</kbd> {t('or')} <kbd className="px-2 py-1.5 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg dark:bg-gray-600 dark:text-gray-100 dark:border-gray-500">Ctrl+K</kbd> {t('to open it.')}</span></p>
          <p>{t('From there, you can type to find actions like switching views, creating projects, or exporting.')}</p>
        </HelpSection>
      </div>
    </div>
  );
};

export default HelpView;
