import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSettings } from '../../hooks/useSettingsContext';

const LibrarySettings: React.FC = () => {
    const { t } = useTranslation();
    const { settings, updateSettings } = useSettings();
    
    if (!settings) return null;

    const handleNestedChange = (path: string, value: any) => {
        const keys = path.split('.');
        const newSettings = { ...settings };
        let current: any = newSettings;
        for (let i = 0; i < keys.length - 1; i++) {
            current = current[keys[i]];
        }
        current[keys[keys.length - 1]] = value;
        updateSettings(newSettings);
    };

    const handleFocusChange = (focusKey: 'summary' | 'keyConcepts' | 'researchQuestions', value: boolean) => {
        const currentFocus = settings.library.aiAssistant.focus;
        const newFocus = { ...currentFocus, [focusKey]: value };
        
        const oneIsEnabled = Object.values(newFocus).some(v => v);
        if (!oneIsEnabled) {
            return;
        }
        handleNestedChange('library.aiAssistant.focus', newFocus);
    };

    return (
        <div className="space-y-8">
            <h2 className="text-xl font-semibold mb-6 pb-2 border-b dark:border-gray-600 text-gray-800 dark:text-gray-200">{t('Library Settings')}</h2>
            <div className="space-y-2">
                <label htmlFor="searchLimit" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('Search Result Limit')}</label>
                <p className="text-xs text-gray-500 dark:text-gray-400">{t('Set the maximum number of results to return for a Wikipedia search.')}</p>
                <input id="searchLimit" type="number" min="5" max="50" step="5" value={settings.library.searchResultLimit} onChange={e => handleNestedChange('library.searchResultLimit', parseInt(e.target.value, 10))} className="w-24 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800" />
            </div>
            <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('AI Assistant')}</label>
                <p className="text-xs text-gray-500 dark:text-gray-400">{t('Enable AI-powered summaries, key concept extraction, and research questions for articles.')}</p>
                <div className="flex items-center pt-2">
                    <input id="aiEnabled" type="checkbox" checked={settings.library.aiAssistant.enabled} onChange={e => handleNestedChange('library.aiAssistant.enabled', e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-accent-600 focus:ring-accent-500"/>
                    <label htmlFor="aiEnabled" className="ml-2 block text-sm text-gray-900 dark:text-gray-200">{t('Enable AI Research Assistant')}</label>
                </div>
                {settings.library.aiAssistant.enabled && (
                    <div className="pl-6 pt-4 space-y-6">
                        <div>
                            <label htmlFor="aiInstruction" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('AI System Instruction')}</label>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{t('Provide specific instructions to the AI to tailor its analysis style (e.g., "focus on economic impacts").')}</p>
                            <textarea id="aiInstruction" rows={3} value={settings.library.aiAssistant.systemInstruction} onChange={e => handleNestedChange('library.aiAssistant.systemInstruction', e.target.value)} className="w-full mt-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800" placeholder={t('e.g., "Analyze from the perspective of a historian."')}></textarea>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('AI Analysis Focus')}</label>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{t('Choose which insights to generate. At least one must be selected.')}</p>
                            <div className="mt-2 space-y-2">
                                <div className="flex items-center">
                                    <input id="focusSummary" type="checkbox" checked={settings.library.aiAssistant.focus.summary} onChange={e => handleFocusChange('summary', e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-accent-600 focus:ring-accent-500"/>
                                    <label htmlFor="focusSummary" className="ml-2 block text-sm text-gray-900 dark:text-gray-200">{t('Summary')}</label>
                                </div>
                                <div className="flex items-center">
                                    <input id="focusConcepts" type="checkbox" checked={settings.library.aiAssistant.focus.keyConcepts} onChange={e => handleFocusChange('keyConcepts', e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-accent-600 focus:ring-accent-500"/>
                                    <label htmlFor="focusConcepts" className="ml-2 block text-sm text-gray-900 dark:text-gray-200">{t('Key Concepts')}</label>
                                </div>
                                <div className="flex items-center">
                                    <input id="focusQuestions" type="checkbox" checked={settings.library.aiAssistant.focus.researchQuestions} onChange={e => handleFocusChange('researchQuestions', e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-accent-600 focus:ring-accent-500"/>
                                    <label htmlFor="focusQuestions" className="ml-2 block text-sm text-gray-900 dark:text-gray-200">{t('Questions to Explore')}</label>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LibrarySettings;