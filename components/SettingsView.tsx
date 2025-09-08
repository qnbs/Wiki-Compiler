import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { getCacheSize, clearArticleCache, exportAllData, importAllData } from '../services/dbService';
import { AppSettings, View, AccentColor, PdfOptions } from '../types';
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
    storage: { label: 'Storage', icon: 'archive-box' },
    about: { label: 'About', icon: 'info' },
  };

  const renderSectionContent = () => {
    switch(activeSection) {
      case 'general': return <GeneralSettings settings={localSettings} onChange={handleSettingsChange} onNestedChange={handleNestedChange} />;
      case 'library': return <LibrarySettings settings={localSettings} onNestedChange={handleNestedChange} />;
      case 'compiler': return <CompilerDefaults settings={localSettings.compiler.defaultPdfOptions} onNestedChange={handleNestedChange} />;
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

const GeneralSettings = ({ settings, onChange, onNestedChange }: { settings: AppSettings, onChange: Function, onNestedChange: Function }) => {
    const { t } = useTranslation();
    const themeOptions: {value: AppSettings['theme'], label: string, icon: string}[] = [
        { value: 'light', label: t('Light'), icon: 'sun'},
        { value: 'dark', label: t('Dark'), icon: 'moon'},
        { value: 'system', label: t('System'), icon: 'desktop'},
    ];
    const accentColors: { name: AccentColor, className: string, label: string }[] = [
      { name: 'blue', className: 'bg-blue-500', label: 'Blue' },
      { name: 'purple', className: 'bg-purple-500', label: 'Purple' },
      { name: 'green', className: 'bg-green-500', label: 'Green' },
      { name: 'orange', className: 'bg-orange-500', label: 'Orange' },
    ]
    return (
        <div className="space-y-8">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">{t('General')}</h2>
            <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('Theme')}</label>
                <div className="flex w-full sm:w-auto p-1 space-x-1 bg-gray-100 dark:bg-gray-700/50 rounded-lg">
                    {themeOptions.map(option => (
                        <button key={option.value} onClick={() => onChange('theme', option.value)}
                            className={`w-full flex justify-center items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-800 focus:ring-accent-500 ${settings.theme === option.value ? 'bg-white dark:bg-gray-800 text-accent-600 dark:text-accent-300 shadow-sm' : 'text-gray-600 dark:text-gray-300 hover:bg-white/60 dark:hover:bg-gray-900/20'}`}>
                            <Icon name={option.icon} className="w-5 h-5"/> {option.label}
                        </button>
                    ))}
                </div>
            </div>
            <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('Accent Color')}</label>
                <div className="flex gap-3">
                    {accentColors.map(color => (
                        <button key={color.name} onClick={() => onChange('accentColor', color.name)}
                            className={`w-8 h-8 rounded-full ${color.className} transition-transform hover:scale-110 ${settings.accentColor === color.name ? 'ring-2 ring-offset-2 ring-offset-white dark:ring-offset-gray-800 ring-accent-500' : ''}`}
                            aria-label={t(color.label)}
                        />
                    ))}
                </div>
            </div>
            <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('Default View on Startup')}</label>
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
    return (
        <div className="space-y-8">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">{t('Library Settings')}</h2>
            <div className="space-y-4">
                <label htmlFor="searchLimit" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('Search Result Limit')}</label>
                <input id="searchLimit" type="number" min="5" max="50" step="5" value={settings.library.searchResultLimit} onChange={e => onNestedChange('library.searchResultLimit', parseInt(e.target.value, 10))} className="w-24 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800" />
            </div>
            <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('AI Assistant')}</label>
                <div className="flex items-center">
                    <input id="aiEnabled" type="checkbox" checked={settings.library.aiAssistant.enabled} onChange={e => onNestedChange('library.aiAssistant.enabled', e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-accent-600 focus:ring-accent-500"/>
                    <label htmlFor="aiEnabled" className="ml-2 block text-sm text-gray-900 dark:text-gray-200">{t('Enable AI Research Assistant')}</label>
                </div>
                {settings.library.aiAssistant.enabled && (
                    <div className="pl-6">
                        <label htmlFor="aiInstruction" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mt-2">{t('AI System Instruction')}</label>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('Optional. Guide the AI with specific instructions for analysis.')}</p>
                        <textarea id="aiInstruction" rows={3} value={settings.library.aiAssistant.systemInstruction} onChange={e => onNestedChange('library.aiAssistant.systemInstruction', e.target.value)} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800" placeholder={t('e.g., "Analyze from the perspective of a historian."')}></textarea>
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
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">{t('Compiler Settings')}</h2>
        <div>
          <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">{t('Default Export Options')}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{t('These settings will be the default for new projects.')}</p>
          
          <div className="space-y-6">
            <fieldset>
               <legend className="text-md font-semibold mb-2 text-gray-800 dark:text-gray-200">{t('Layout')}</legend>
               <div className="space-y-3 pl-2">
                   <div>
                       <span className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('Paper Size')}</span>
                       <select value={settings.paperSize} onChange={e => set('paperSize', e.target.value)} className="w-full max-w-xs px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800">
                           <option value="letter">{t('Letter')}</option>
                           <option value="a4">{t('A4')}</option>
                       </select>
                   </div>
                    <div>
                       <span className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('Columns')}</span>
                        <select value={settings.layout} onChange={e => set('layout', e.target.value)} className="w-full max-w-xs px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800">
                           <option value="single">{t('Single Column')}</option>
                           <option value="two">{t('Two Column')}</option>
                       </select>
                   </div>
               </div>
           </fieldset>

           <fieldset>
               <legend className="text-md font-semibold mb-2 text-gray-800 dark:text-gray-200">{t('Page Setup')}</legend>
               <div className="space-y-3 pl-2">
                   <div>
                       <span className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('Margins')}</span>
                       <select value={settings.margins} onChange={e => set('margins', e.target.value)} className="w-full max-w-xs px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800">
                           <option value="normal">{t('Normal')}</option>
                           <option value="narrow">{t('Narrow')}</option>
                           <option value="wide">{t('Wide')}</option>
                       </select>
                   </div>
                    <div>
                       <span className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('Line Spacing')}</span>
                       <select value={settings.lineSpacing} onChange={e => set('lineSpacing', parseFloat(e.target.value))} className="w-full max-w-xs px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800">
                           <option value="1.15">{t('Single (1.15)')}</option>
                           <option value="1.5">{t('One and a half (1.5)')}</option>
                           <option value="2.0">{t('Double (2.0)')}</option>
                       </select>
                   </div>
               </div>
           </fieldset>
           
           <fieldset>
               <legend className="text-md font-semibold mb-2 text-gray-800 dark:text-gray-200">{t('Typography')}</legend>
               <div className="space-y-3 pl-2">
                    <div>
                       <span className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('Font Pairing')}</span>
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
               <legend className="text-md font-semibold mb-2 text-gray-800 dark:text-gray-200">{t('Content')}</legend>
              <div className="space-y-3 pl-2">
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
            <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">{t('Data & Storage')}</h2>
            <div className="p-4 bg-gray-50 dark:bg-gray-900/40 rounded-lg">
                <h3 className="font-semibold">{t('Cache Usage')}</h3>
                <p className="text-gray-600 dark:text-gray-300">{t('{{count}} articles cached, using', { count: cacheInfo.count })} {formatBytes(cacheInfo.size)}</p>
                <button onClick={onClearCache} className="mt-2 text-sm text-red-600 hover:underline">{t('Clear Article Cache')}</button>
            </div>
            <div className="space-y-4">
                <div>
                    <h3 className="font-semibold">{t('Export All Data')}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{t('Save a backup of all your projects, cached articles, and settings to a JSON file.')}</p>
                    <button onClick={onExport} className="flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors text-sm font-semibold">
                        <Icon name="download" className="w-4 h-4" /> {t('Export...')}
                    </button>
                </div>
                 <div>
                    <h3 className="font-semibold">{t('Import Data')}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{t('Import a backup file. This will overwrite all existing data.')}</p>
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
            <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">{t('About Wiki Compiler')}</h2>
            <p className="text-gray-600 dark:text-gray-400">{t('A premium knowledge management and research environment designed to curate, customize, and consume knowledge from Wikipedia. Transform passive reading into an active, creative act of knowledge assembly.')}</p>
            <div>
                <span className="font-semibold">{t('Version')}:</span> 1.0.0
            </div>
        </div>
    );
};


export default SettingsView;