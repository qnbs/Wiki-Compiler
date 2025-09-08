import React, { useState, useEffect, useRef, memo } from 'react';
import { useTranslation } from 'react-i18next';
import { getCacheSize, clearArticleCache, exportAllData, importAllData } from '../services/dbService';
import { AppSettings, View, AccentColor, PdfOptions, CustomCitation } from '../types';
import Icon from './Icon';

interface SettingsViewProps {
  settings: AppSettings;
  updateSettings: (settings: AppSettings) => void;
  reloadApp: () => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({ settings, updateSettings, reloadApp }) => {
  const { t } = useTranslation();
  const [activeSection, setActiveSection] = useState('general');
  const [cacheInfo, setCacheInfo] = useState({ count: 0, size: 0 });
  const [localSettings, setLocalSettings] = useState(settings);
  const importFileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  useEffect(() => {
    if (activeSection === 'storage') {
      getCacheSize().then(setCacheInfo);
    }
  }, [activeSection]);

  const handleSettingsChange = (field: keyof AppSettings, value: any) => {
    const newSettings = { ...localSettings, [field]: value };
    setLocalSettings(newSettings);
    updateSettings(newSettings);
  };

  const handleNestedChange = (path: string, value: any) => {
    const keys = path.split('.');
    const newSettings = { ...localSettings };
    let current: any = newSettings;
    for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
    }
    current[keys[keys.length - 1]] = value;
    setLocalSettings(newSettings);
    updateSettings(newSettings);
  };
  
  const handleClearCache = async () => {
    if (window.confirm(t('Are you sure you want to clear the cache?'))) {
        await clearArticleCache();
        getCacheSize().then(setCacheInfo);
        alert(t('Cache cleared successfully!'));
    }
  };

  const handleExport = async () => {
    try {
        const jsonData = await exportAllData();
        const blob = new Blob([jsonData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        const timestamp = new Date().toISOString().slice(0, 19).replace('T', '_').replace(/:/g, '-');
        link.download = `wiki_compiler_backup_${timestamp}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    } catch (error) {
        console.error("Export failed:", error);
        alert(t('Export failed.'));
    }
  };

  const handleImport = () => {
      if (importFileRef.current) {
          importFileRef.current.click();
      }
  };

  const onFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          if (window.confirm(t('Importing data will overwrite all current projects and settings. Are you sure you want to continue?'))) {
              const reader = new FileReader();
              reader.onload = async (event) => {
                  try {
                      await importAllData(event.target?.result as string);
                      alert(t('Import successful! The app will now reload.'));
                      reloadApp();
                  } catch (error) {
                      console.error("Import failed:", error);
                      alert(t('Import failed. Please check the file format.'));
                  }
              };
              reader.readAsText(file);
          }
      }
  };

  const sections = {
    general: { label: 'General', icon: 'settings' },
    library: { label: 'Library', icon: 'book' },
    compiler: { label: 'Compiler', icon: 'compiler' },
    citations: { label: 'Citations', icon: 'key' },
    storage: { label: 'Storage', icon: 'archive-box' },
    about: { label: 'About', icon: 'info' },
  };

  const renderSectionContent = () => {
    switch(activeSection) {
      case 'general': return <GeneralSettings settings={localSettings} onChange={handleSettingsChange} />;
      case 'library': return <LibrarySettings settings={localSettings} onNestedChange={handleNestedChange} />;
      case 'compiler': return <CompilerDefaults settings={localSettings.compiler.defaultPdfOptions} onNestedChange={handleNestedChange} />;
      case 'citations': return <CitationSettings settings={localSettings} onNestedChange={handleNestedChange} />;
      case 'storage': return <StorageSettings cacheInfo={cacheInfo} onClearCache={handleClearCache} onExport={handleExport} onImport={handleImport} />;
      case 'about': return <AboutSettings />;
      default: return null;
    }
  }

  return (
    <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">{t('Settings')}</h1>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <aside className="md:col-span-1">
                <nav className="space-y-1">
                    {Object.entries(sections).map(([key, {label, icon}]) => (
                        <button 
                            key={key} 
                            onClick={() => setActiveSection(key)}
                            className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${activeSection === key ? 'bg-accent-100 dark:bg-accent-900/50 text-accent-700 dark:text-accent-300' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50'}`}
                        >
                            <Icon name={icon} className="w-5 h-5"/>
                            <span>{t(label)}</span>
                        </button>
                    ))}
                </nav>
            </aside>
            <main className="md:col-span-3">
                <div className="bg-white dark:bg-gray-800/50 p-6 rounded-lg shadow-sm">
                    {renderSectionContent()}
                </div>
                <input type="file" accept=".json" ref={importFileRef} onChange={onFileSelected} className="hidden" />
            </main>
        </div>
    </div>
  );
};

const GeneralSettings = ({ settings, onChange }: { settings: AppSettings, onChange: Function }) => {
    const { t } = useTranslation();
    const accentColors: { name: AccentColor, className: string, label: string }[] = [
      { name: 'blue', className: 'bg-blue-500', label: 'Blue' },
      { name: 'purple', className: 'bg-purple-500', label: 'Purple' },
      { name: 'green', className: 'bg-green-500', label: 'Green' },
      { name: 'orange', className: 'bg-orange-500', label: 'Orange' },
    ]
    return (
        <div className="space-y-8">
            <h2 className="text-xl font-semibold mb-6 pb-2 border-b dark:border-gray-600 text-gray-800 dark:text-gray-200">{t('General')}</h2>
            <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('Accent Color')}</label>
                <p className="text-xs text-gray-500 dark:text-gray-400">{t('Customize the UI highlights, buttons, and active states throughout the application.')}</p>
                <div className="flex gap-3 pt-2">
                    {accentColors.map(color => (
                        <button key={color.name} onClick={() => onChange('accentColor', color.name)}
                            className={`w-8 h-8 rounded-full ${color.className} transition-transform hover:scale-110 ${settings.accentColor === color.name ? 'ring-2 ring-offset-2 ring-offset-white dark:ring-offset-gray-800 ring-accent-500' : ''}`}
                            aria-label={t(color.label)}
                        />
                    ))}
                </div>
            </div>
             <div className="space-y-2">
                <label htmlFor="language-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('Language')}</label>
                <p className="text-xs text-gray-500 dark:text-gray-400">{t("Choose the application's display language.")}</p>
                <select id="language-select" value={settings.language} onChange={e => onChange('language', e.target.value)} className="w-full max-w-xs px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-accent-500 focus:border-accent-500 outline-none">
                    <option value="en">English</option>
                    <option value="de">Deutsch</option>
                </select>
            </div>
            <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('Default View on Startup')}</label>
                 <p className="text-xs text-gray-500 dark:text-gray-400">{t('Choose which view the application opens to on startup.')}</p>
                <select value={settings.defaultView} onChange={e => onChange('defaultView', e.target.value)} className="w-full max-w-xs px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-accent-500 focus:border-accent-500 outline-none">
                    <option value={View.Library}>{t('Library')}</option>
                    <option value={View.Archive}>{t('Archive')}</option>
                    <option value={View.Compiler}>{t('Compiler')}</option>
                </select>
            </div>
        </div>
    );
}

const LibrarySettings = ({ settings, onNestedChange }: { settings: AppSettings, onNestedChange: Function }) => {
    const { t } = useTranslation();
    const handleFocusChange = (focusKey: 'summary' | 'keyConcepts' | 'researchQuestions', value: boolean) => {
        const currentFocus = settings.library.aiAssistant.focus;
        const newFocus = { ...currentFocus, [focusKey]: value };
        
        const oneIsEnabled = Object.values(newFocus).some(v => v);
        if (!oneIsEnabled) {
            return;
        }
        onNestedChange('library.aiAssistant.focus', newFocus);
    };

    return (
        <div className="space-y-8">
            <h2 className="text-xl font-semibold mb-6 pb-2 border-b dark:border-gray-600 text-gray-800 dark:text-gray-200">{t('Library Settings')}</h2>
            <div className="space-y-2">
                <label htmlFor="searchLimit" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('Search Result Limit')}</label>
                <p className="text-xs text-gray-500 dark:text-gray-400">{t('Set the maximum number of results to return for a Wikipedia search.')}</p>
                <input id="searchLimit" type="number" min="5" max="50" step="5" value={settings.library.searchResultLimit} onChange={e => onNestedChange('library.searchResultLimit', parseInt(e.target.value, 10))} className="w-24 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800" />
            </div>
            <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('AI Assistant')}</label>
                <p className="text-xs text-gray-500 dark:text-gray-400">{t('Enable AI-powered summaries, key concept extraction, and research questions for articles.')}</p>
                <div className="flex items-center pt-2">
                    <input id="aiEnabled" type="checkbox" checked={settings.library.aiAssistant.enabled} onChange={e => onNestedChange('library.aiAssistant.enabled', e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-accent-600 focus:ring-accent-500"/>
                    <label htmlFor="aiEnabled" className="ml-2 block text-sm text-gray-900 dark:text-gray-200">{t('Enable AI Research Assistant')}</label>
                </div>
                {settings.library.aiAssistant.enabled && (
                    <div className="pl-6 pt-4 space-y-6">
                        <div>
                            <label htmlFor="aiInstruction" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('AI System Instruction')}</label>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{t('Provide specific instructions to the AI to tailor its analysis style (e.g., "focus on economic impacts").')}</p>
                            <textarea id="aiInstruction" rows={3} value={settings.library.aiAssistant.systemInstruction} onChange={e => onNestedChange('library.aiAssistant.systemInstruction', e.target.value)} className="w-full mt-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800" placeholder={t('e.g., "Analyze from the perspective of a historian."')}></textarea>
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
    )
}

const CompilerDefaults = ({ settings, onNestedChange }: { settings: PdfOptions, onNestedChange: Function }) => {
    const { t } = useTranslation();
    const set = (path: string, value: any) => onNestedChange(`compiler.defaultPdfOptions.${path}`, value);
    
    return (
      <div className="space-y-8">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 pb-2 border-b dark:border-gray-600">{t('Compiler Settings')}</h2>
        <div>
          <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mt-4">{t('Default Export Options')}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">{t('All settings in this section apply to the default options when you create a new project.')}</p>
          
          <div className="space-y-8">
            <fieldset>
               <legend className="text-md font-semibold text-gray-800 dark:text-gray-200">{t('Layout')}</legend>
               <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">{t('Control the overall page structure of your exported PDF.')}</p>
               <div className="space-y-4 pl-2">
                   <div>
                       <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('Paper Size')}</label>
                       <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{t('Choose the page dimensions for your PDF export. Letter is standard in the US, A4 is standard elsewhere.')}</p>
                       <select value={settings.paperSize} onChange={e => set('paperSize', e.target.value)} className="w-full max-w-xs px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800">
                           <option value="letter">{t('Letter')}</option>
                           <option value="a4">{t('A4')}</option>
                       </select>
                   </div>
                    <div>
                       <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('Columns')}</label>
                       <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{t('Select a single column for traditional documents or a two-column layout for a magazine-style feel.')}</p>
                        <select value={settings.layout} onChange={e => set('layout', e.target.value)} className="w-full max-w-xs px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800">
                           <option value="single">{t('Single Column')}</option>
                           <option value="two">{t('Two Column')}</option>
                       </select>
                   </div>
               </div>
           </fieldset>

           <fieldset>
               <legend className="text-md font-semibold text-gray-800 dark:text-gray-200">{t('Page Setup')}</legend>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">{t('Fine-tune the margins, spacing, and page headers/footers.')}</p>
               <div className="space-y-4 pl-2">
                   <div>
                       <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('Margins')}</label>
                       <select value={settings.margins} onChange={e => set('margins', e.target.value)} className="w-full max-w-xs px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800">
                           <option value="normal">{t('Normal')}</option>
                           <option value="narrow">{t('Narrow')}</option>
                           <option value="wide">{t('Wide')}</option>
                       </select>
                   </div>
                    <div>
                       <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('Line Spacing')}</label>
                       <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{t('Set the spacing for the text body. 1.5 is recommended for readability.')}</p>
                       <select value={settings.lineSpacing} onChange={e => set('lineSpacing', parseFloat(e.target.value))} className="w-full max-w-xs px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800">
                           <option value="1.15">{t('Single (1.15)')}</option>
                           <option value="1.5">{t('One and a half (1.5)')}</option>
                           <option value="2.0">{t('Double (2.0)')}</option>
                       </select>
                   </div>
               </div>
           </fieldset>
           
           <fieldset>
               <legend className="text-md font-semibold text-gray-800 dark:text-gray-200">{t('Typography')}</legend>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">{t('Customize the look and feel of the text in your document.')}</p>
               <div className="space-y-4 pl-2">
                    <div>
                       <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('Font Pairing')}</label>
                       <select value={settings.typography.fontPair} onChange={e => set('typography.fontPair', e.target.value)} className="w-full max-w-xs px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800">
                            <option value="modern">{t('Modern (Inter)')}</option>
                            <option value="classic">{t('Classic (Lora)')}</option>
                        </select>
                   </div>
                   <div>
                        <label htmlFor="fontSize" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            {t('Base Font Size')}: <span className="font-bold">{settings.typography.fontSize}px</span>
                        </label>
                        <input type="range" id="fontSize" min="10" max="24" step="1" value={settings.typography.fontSize} onChange={e => set('typography.fontSize', parseInt(e.target.value, 10))} className="w-full max-w-xs h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700" />
                   </div>
               </div>
           </fieldset>
           
            <fieldset>
               <legend className="text-md font-semibold text-gray-800 dark:text-gray-200">{t('Content')}</legend>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">{t('Select which structural elements to include in your export.')}</p>
              <div className="space-y-4 pl-2">
                    <div className="flex items-center">
                        <input id="includeTOC" type="checkbox" checked={settings.includeTOC} onChange={e => set('includeTOC', e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-accent-600 focus:ring-accent-500"/>
                        <label htmlFor="includeTOC" className="ml-2 block text-sm text-gray-900 dark:text-gray-200">{t('Include Table of Contents')}</label>
                    </div>
                  <div>
                      <div className="flex items-center">
                          <input id="includeBibliography" type="checkbox" checked={settings.includeBibliography} onChange={e => set('includeBibliography', e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-accent-600 focus:ring-accent-500"/>
                          <label htmlFor="includeBibliography" className="ml-2 block text-sm text-gray-900 dark:text-gray-200">{t('Include Bibliography')}</label>
                      </div>
                      {settings.includeBibliography && (
                          <div className="pl-6 mt-2">
                               <select value={settings.citationStyle} onChange={e => set('citationStyle', e.target.value)} className="w-full max-w-xs px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800">
                                   <option value="apa">{t('APA')}</option>
                                   <option value="mla">{t('MLA')}</option>
                               </select>
                          </div>
                      )}
                  </div>
               </div>
            </fieldset>
          </div>
        </div>
      </div>
    );
};

const CitationSettings = ({ settings, onNestedChange }: { settings: AppSettings, onNestedChange: Function }) => {
    const { t } = useTranslation();
    const [citations, setCitations] = useState<CustomCitation[]>(settings.citations.customCitations);
    const [keyError, setKeyError] = useState<string | null>(null);

    useEffect(() => {
        setCitations(settings.citations.customCitations);
    }, [settings.citations.customCitations]);

    const handleUpdate = (updatedCitations: CustomCitation[]) => {
        const keys = updatedCitations.map(c => c.key);
        const uniqueKeys = new Set(keys);
        if(keys.length !== uniqueKeys.size) {
            setKeyError(t('Key must be unique.'));
        } else {
            setKeyError(null);
            onNestedChange('citations.customCitations', updatedCitations);
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

    return (
        <div className="space-y-8">
            <h2 className="text-xl font-semibold mb-2 pb-2 border-b dark:border-gray-600 text-gray-800 dark:text-gray-200">{t('Custom Citations')}</h2>
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


const StorageSettings = ({ cacheInfo, onClearCache, onExport, onImport }: { cacheInfo: {count: number, size: number}, onClearCache: ()=>void, onExport: ()=>void, onImport: ()=>void }) => {
    const { t } = useTranslation();
    const formatBytes = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    return (
        <div className="space-y-8">
            <h2 className="text-xl font-semibold mb-6 pb-2 border-b dark:border-gray-600 text-gray-800 dark:text-gray-200">{t('Data & Storage')}</h2>
            <div className="p-4 bg-gray-50 dark:bg-gray-900/40 rounded-lg">
                <h3 className="font-semibold">{t('Cache Usage')}</h3>
                <p className="text-gray-600 dark:text-gray-300">{t('{{count}} articles cached, using', { count: cacheInfo.count })} {formatBytes(cacheInfo.size)}</p>
                <button onClick={onClearCache} className="mt-2 text-sm text-red-600 hover:underline">{t('Clear Article Cache')}</button>
            </div>
            <div className="space-y-6">
                <div>
                    <h3 className="font-semibold">{t('Export All Data')}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{t('Save a backup of all your projects, cached articles, and settings to a JSON file.')}</p>
                    <button onClick={onExport} className="flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors text-sm font-semibold">
                        <Icon name="download" className="w-4 h-4" /> {t('Export...')}
                    </button>
                </div>
                 <div>
                    <h3 className="font-semibold">{t('Import Data')}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{t('Restore your application from a backup file. WARNING: This will overwrite all current projects, articles, and settings.')}</p>
                    <button onClick={onImport} className="flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors text-sm font-semibold">
                        <Icon name="upload" className="w-4 h-4" /> {t('Import...')}
                    </button>
                </div>
            </div>
        </div>
    );
};

const AboutSettings = () => {
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
                    <span className="font-semibold text-gray-700 dark:text-gray-300">{t('Version')}:</span> 1.0.0
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


export default memo(SettingsView);