import React from 'react';
import { useTranslation } from 'react-i18next';
import { PdfOptions } from '../../types';
import { useSettings } from '../../hooks/useSettingsContext';

const CompilerDefaultsSettings: React.FC = () => {
    const { t } = useTranslation();
    const { settings, updateSettings } = useSettings();
    
    if (!settings) return null;
    
    const pdfOptions = settings.compiler.defaultPdfOptions;

    const set = (path: string, value: any) => {
        const keys = `compiler.defaultPdfOptions.${path}`.split('.');
        const newSettings = { ...settings };
        let current: any = newSettings;
        for (let i = 0; i < keys.length - 1; i++) {
            current = current[keys[i]];
        }
        current[keys[keys.length - 1]] = value;
        updateSettings(newSettings);
    };
    
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
                       <select value={pdfOptions.paperSize} onChange={e => set('paperSize', e.target.value)} className="w-full max-w-xs px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800">
                           <option value="letter">{t('Letter')}</option>
                           <option value="a4">{t('A4')}</option>
                       </select>
                   </div>
                    <div>
                       <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('Columns')}</label>
                       <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{t('Select a single column for traditional documents or a two-column layout for a magazine-style feel.')}</p>
                        <select value={pdfOptions.layout} onChange={e => set('layout', e.target.value)} className="w-full max-w-xs px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800">
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
                       <select value={pdfOptions.margins} onChange={e => set('margins', e.target.value)} className="w-full max-w-xs px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800">
                           <option value="normal">{t('Normal')}</option>
                           <option value="narrow">{t('Narrow')}</option>
                           <option value="wide">{t('Wide')}</option>
                       </select>
                   </div>
                    <div>
                       <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('Line Spacing')}</label>
                       <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{t('Set the spacing for the text body. 1.5 is recommended for readability.')}</p>
                       <select value={pdfOptions.lineSpacing} onChange={e => set('lineSpacing', parseFloat(e.target.value))} className="w-full max-w-xs px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800">
                           <option value="1.15">{t('Single (1.15)')}</option>
                           <option value="1.5">{t('One and a half (1.5)')}</option>
                           <option value="2.0">{t('Double (2.0)')}</option>
                       </select>
                   </div>
               </div>
           </fieldset>

           <fieldset>
                <legend className="text-md font-semibold text-gray-800 dark:text-gray-200">{t('Header Content')}</legend>
                <div className="space-y-4 pl-2 mt-2">
                    <div>
                        <select value={pdfOptions.headerContent} onChange={e => set('headerContent', e.target.value)} className="w-full max-w-xs px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800">
                            <option value="none">{t('None')}</option>
                            <option value="title">{t('Document Title')}</option>
                            <option value="custom">{t('Custom')}</option>
                        </select>
                        {pdfOptions.headerContent === 'custom' && (
                            <input type="text" value={pdfOptions.customHeaderText || ''} onChange={e => set('customHeaderText', e.target.value)} placeholder={t('Custom Header Text')} className="mt-2 w-full max-w-xs px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"/>
                        )}
                    </div>
                </div>
           </fieldset>
            
           <fieldset>
                <legend className="text-md font-semibold text-gray-800 dark:text-gray-200">{t('Footer Content')}</legend>
                <div className="space-y-4 pl-2 mt-2">
                    <div>
                        <select value={pdfOptions.footerContent} onChange={e => set('footerContent', e.target.value)} className="w-full max-w-xs px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800">
                            <option value="none">{t('None')}</option>
                            <option value="pageNumber">{t('Page Number')}</option>
                            <option value="custom">{t('Custom')}</option>
                        </select>
                        {pdfOptions.footerContent === 'custom' && (
                            <input type="text" value={pdfOptions.customFooterText || ''} onChange={e => set('customFooterText', e.target.value)} placeholder={t('Custom Footer Text')} className="mt-2 w-full max-w-xs px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"/>
                        )}
                    </div>
                </div>
           </fieldset>
           
           <fieldset>
               <legend className="text-md font-semibold text-gray-800 dark:text-gray-200">{t('Typography')}</legend>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">{t('Customize the look and feel of the text in your document.')}</p>
               <div className="space-y-4 pl-2">
                    <div>
                       <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('Font Pairing')}</label>
                       <select value={pdfOptions.typography.fontPair} onChange={e => set('typography.fontPair', e.target.value)} className="w-full max-w-xs px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800">
                            <option value="modern">{t('Modern (Inter)')}</option>
                            <option value="classic">{t('Classic (Lora)')}</option>
                        </select>
                   </div>
                   <div>
                        <label htmlFor="fontSize" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            {t('Base Font Size')}: <span className="font-bold">{pdfOptions.typography.fontSize}px</span>
                        </label>
                        <input type="range" id="fontSize" min="10" max="24" step="1" value={pdfOptions.typography.fontSize} onChange={e => set('typography.fontSize', parseInt(e.target.value, 10))} className="w-full max-w-xs h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700" />
                   </div>
               </div>
           </fieldset>
           
            <fieldset>
               <legend className="text-md font-semibold text-gray-800 dark:text-gray-200">{t('Content')}</legend>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">{t('Select which structural elements to include in your export.')}</p>
              <div className="space-y-4 pl-2">
                    <div className="flex items-center">
                        <input id="includeTOC" type="checkbox" checked={pdfOptions.includeTOC} onChange={e => set('includeTOC', e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-accent-600 focus:ring-accent-500"/>
                        <label htmlFor="includeTOC" className="ml-2 block text-sm text-gray-900 dark:text-gray-200">{t('Include Table of Contents')}</label>
                    </div>
                  <div>
                      <div className="flex items-center">
                          <input id="includeBibliography" type="checkbox" checked={pdfOptions.includeBibliography} onChange={e => set('includeBibliography', e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-accent-600 focus:ring-accent-500"/>
                          <label htmlFor="includeBibliography" className="ml-2 block text-sm text-gray-900 dark:text-gray-200">{t('Include Bibliography')}</label>
                      </div>
                      {pdfOptions.includeBibliography && (
                          <div className="pl-6 mt-2">
                               <select value={pdfOptions.citationStyle} onChange={e => set('citationStyle', e.target.value)} className="w-full max-w-xs px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800">
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

export default CompilerDefaultsSettings;