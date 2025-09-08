import React from 'react';
import { useTranslation } from 'react-i18next';
import Icon from '../Icon';

const AboutSettings: React.FC = () => {
    const { t } = useTranslation();
    return (
        <div className="space-y-8">
            <h2 className="text-xl font-semibold mb-6 pb-2 border-b dark:border-gray-600 text-gray-800 dark:text-gray-200">{t('About Wiki Compiler')}</h2>
            
            <div className="space-y-4 text-gray-600 dark:text-gray-400">
                <p>{t('about_p1')}</p>
                <p>{t('about_p2')}</p>
            </div>

            <div className="p-4 bg-gray-50 dark:bg-gray-900/40 rounded-lg border dark:border-gray-700">
                <h3 className="font-semibold text-lg flex items-center gap-2 text-gray-800 dark:text-gray-200">
                    <Icon name="sparkles" className="w-5 h-5 text-purple-500" />
                    {t('about_ai_title')}
                </h3>
                <div className="mt-2 space-y-3 text-sm text-gray-600 dark:text-gray-400">
                    <p>{t('about_ai_p1')}</p>
                    <p>{t('about_ai_p2')}</p>
                </div>
            </div>

            <div className="space-y-2 text-sm">
                <div>
                    <span className="font-semibold text-gray-700 dark:text-gray-300">{t('Version')}:</span> 1.1.0
                </div>
                 <div>
                    <a href="https://ai.studio/apps/drive/1yyz5W0rD85UmlKj6X2vkwrX-SGMrQQmZ" target="_blank" rel="noopener noreferrer" className="font-semibold text-accent-600 dark:text-accent-400 hover:underline flex items-center gap-1.5">
                        {t('Learn more about AI Studio')}
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4">
                           <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                        </svg>
                    </a>
                </div>
            </div>
        </div>
    );
};

export default AboutSettings;