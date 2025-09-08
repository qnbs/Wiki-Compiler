import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { CustomCitation } from '../../types';
import { useSettings } from '../../hooks/useSettingsContext';
import Icon from '../Icon';

const CitationSettings: React.FC = () => {
    const { t } = useTranslation();
    const { settings, updateSettings } = useSettings();
    const [citations, setCitations] = useState<CustomCitation[]>(settings?.citations.customCitations || []);
    const [keyError, setKeyError] = useState<string | null>(null);

    useEffect(() => {
        if (settings) {
            setCitations(settings.citations.customCitations);
        }
    }, [settings]);

    const handleUpdate = (updatedCitations: CustomCitation[]) => {
        if (!settings) return;
        const keys = updatedCitations.map(c => c.key);
        const uniqueKeys = new Set(keys);
        if(keys.length !== uniqueKeys.size) {
            setKeyError(t('Key must be unique.'));
        } else {
            setKeyError(null);
            updateSettings({ ...settings, citations: { ...settings.citations, customCitations: updatedCitations } });
        }
    }

    const handleChange = (id: string, field: keyof Omit<CustomCitation, 'id'>, value: string) => {
        const updated = citations.map(c => c.id === id ? { ...c, [field]: value } : c);
        setCitations(updated);
    };

    const handleSave = () => {
        handleUpdate(citations);
    }
    
    const handleAdd = () => {
        const newCitation: CustomCitation = {
            id: crypto.randomUUID(),
            key: `Source${citations.length + 1}`,
            author: '',
            year: '',
            title: '',
            url: '',
        };
        const updated = [...citations, newCitation];
        setCitations(updated);
        handleUpdate(updated);
    };
    
    const handleDelete = (id: string) => {
        const updated = citations.filter(c => c.id !== id);
        setCitations(updated);
        handleUpdate(updated);
    };

    if (!settings) return null;

    return (
        <div className="space-y-8">
            <h2 className="text-xl font-semibold mb-2 pb-2 border-b dark:border-gray-600 text-gray-800 dark:text-gray-200">{t('Citations')}</h2>
            
             <div className="space-y-2">
                <label htmlFor="citation-style-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('Default Bibliography Style')}</label>
                <p className="text-xs text-gray-500 dark:text-gray-400">{t('Choose the citation format for generated bibliographies.')}</p>
                <select 
                    id="citation-style-select" 
                    value={settings.citations.citationStyle} 
                    onChange={e => updateSettings({ ...settings, citations: { ...settings.citations, citationStyle: e.target.value as 'apa' | 'mla' }})} 
                    className="w-full max-w-xs px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-accent-500"
                >
                    <option value="apa">{t('APA')}</option>
                    <option value="mla">{t('MLA')}</option>
                </select>
            </div>
            
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">{t('Custom Citations')}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 -mt-6">{t('Manage your custom sources for bibliographies. These can be inserted into articles in the Compiler view.')}</p>
            
            <div className="space-y-4">
                {citations.map(citation => (
                    <div key={citation.id} className="p-4 border dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900/40">
                       <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                           <div>
                               <label className="text-sm font-medium">{t('Citation Key')}</label>
                               <p className="text-xs text-gray-500 dark:text-gray-400">{t('Unique identifier (e.g., Smith2023).')}</p>
                               <input type="text" value={citation.key} onChange={e => handleChange(citation.id, 'key', e.target.value)} onBlur={handleSave} className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 dark:border-gray-600 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-accent-500"/>
                           </div>
                           <div>
                               <label className="text-sm font-medium">{t('Author')}</label>
                               <input type="text" value={citation.author} onChange={e => handleChange(citation.id, 'author', e.target.value)} onBlur={handleSave} className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 dark:border-gray-600 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-accent-500"/>
                           </div>
                           <div>
                               <label className="text-sm font-medium">{t('Year')}</label>
                               <input type="text" value={citation.year} onChange={e => handleChange(citation.id, 'year', e.target.value)} onBlur={handleSave} className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 dark:border-gray-600 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-accent-500"/>
                           </div>
                           <div>
                               <label className="text-sm font-medium">{t('Title')}</label>
                               <input type="text" value={citation.title} onChange={e => handleChange(citation.id, 'title', e.target.value)} onBlur={handleSave} className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 dark:border-gray-600 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-accent-500"/>
                           </div>
                           <div className="sm:col-span-2">
                               <label className="text-sm font-medium">{t('URL')}</label>
                               <input type="text" value={citation.url} onChange={e => handleChange(citation.id, 'url', e.target.value)} onBlur={handleSave} className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 dark:border-gray-600 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-accent-500"/>
                           </div>
                       </div>
                       <div className="flex justify-end mt-3">
                           <button onClick={() => handleDelete(citation.id)} className="flex items-center gap-1 text-sm text-red-600 hover:text-red-800">
                               <Icon name="trash" className="w-4 h-4" />{t('Delete')}
                           </button>
                       </div>
                    </div>
                ))}
            </div>
            {keyError && <p className="text-red-500 text-sm">{keyError}</p>}
             <button onClick={handleAdd} className="flex items-center gap-2 bg-accent-600 text-white px-4 py-2 rounded-lg hover:bg-accent-700 transition-colors text-sm font-semibold">
                <Icon name="plus" className="w-4 h-4" /> {t('Add Citation')}
            </button>
        </div>
    );
};

export default CitationSettings;