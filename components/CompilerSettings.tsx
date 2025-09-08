import React from 'react';
import { useTranslation } from 'react-i18next';
import { PdfOptions } from '../types';
import Icon from './Icon';
import Spinner from './Spinner';

interface RadioOptionProps {
    id: string;
    name: string;
    value: string;
    checked: boolean;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    label: string;
}

const RadioOption: React.FC<RadioOptionProps> = ({ id, name, value, checked, onChange, label }) => (
    <div className="flex items-center">
        <input id={id} name={name} type="radio" value={value} checked={checked} onChange={onChange} className="h-4 w-4 border-gray-300 text-accent-600 focus:ring-accent-500 dark:bg-gray-700 dark:border-gray-600"/>
        <label htmlFor={id} className="ml-2 block text-sm text-gray-900 dark:text-gray-200">{label}</label>
    </div>
);

interface CheckboxOptionProps {
    id: string;
    checked: boolean;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    label: string;
}

const CheckboxOption: React.FC<CheckboxOptionProps> = ({ id, checked, onChange, label }) => (
    <div className="flex items-center">
        <input id={id} type="checkbox" checked={checked} onChange={onChange} className="h-4 w-4 rounded border-gray-300 text-accent-600 focus:ring-accent-500 dark:bg-gray-700 dark:border-gray-600"/>
        <label htmlFor={id} className="ml-2 block text-sm text-gray-900 dark:text-gray-200">{label}</label>
    </div>
);

interface CompilerSettingsProps {
    projectName: string;
    onProjectNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onProjectNameBlur: () => void;
    pdfOptions: PdfOptions;
    setPdfOptions: React.Dispatch<React.SetStateAction<PdfOptions>>;
    onGeneratePdf: () => void;
    onGenerateMarkdown: () => void;
    onAnalyze: () => void;
    onSaveDefaults: () => void;
    isGenerating: boolean;
    isAnalyzing: boolean;
    canGenerate: boolean;
    isArticleSelected: boolean;
}

const CompilerSettings: React.FC<CompilerSettingsProps> = ({
    projectName,
    onProjectNameChange,
    onProjectNameBlur,
    pdfOptions,
    setPdfOptions,
    onGeneratePdf,
    onGenerateMarkdown,
    onAnalyze,
    onSaveDefaults,
    isGenerating,
    isAnalyzing,
    canGenerate,
    isArticleSelected
}) => {
    const { t } = useTranslation();

    return (
        <div className="space-y-6">
            <div>
              <label htmlFor="projectName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('Document Title')}
              </label>
              <input
                type="text"
                id="projectName"
                value={projectName}
                onChange={onProjectNameChange}
                onBlur={onProjectNameBlur}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-accent-500 focus:border-accent-500 outline-none"
              />
            </div>
        
            <div className="space-y-8">
               <fieldset>
                   <legend className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200 border-b dark:border-gray-600 pb-2">{t('Layout')}</legend>
                   <div className="space-y-4">
                       <div>
                           <span className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('Paper Size')}</span>
                           <div className="flex gap-4">
                               <RadioOption id="letter" name="paperSize" value="letter" checked={pdfOptions.paperSize === 'letter'} onChange={e => setPdfOptions({...pdfOptions, paperSize: e.target.value as 'letter' | 'a4'})} label={t('Letter')}/>
                               <RadioOption id="a4" name="paperSize" value="a4" checked={pdfOptions.paperSize === 'a4'} onChange={e => setPdfOptions({...pdfOptions, paperSize: e.target.value as 'letter' | 'a4'})} label={t('A4')}/>
                           </div>
                       </div>
                        <div>
                           <span className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('Columns')}</span>
                           <div className="flex gap-4">
                               <RadioOption id="single" name="layout" value="single" checked={pdfOptions.layout === 'single'} onChange={e => setPdfOptions({...pdfOptions, layout: e.target.value as 'single' | 'two'})} label={t('Single Column')}/>
                               <RadioOption id="two" name="layout" value="two" checked={pdfOptions.layout === 'two'} onChange={e => setPdfOptions({...pdfOptions, layout: e.target.value as 'single' | 'two'})} label={t('Two Column')}/>
                           </div>
                       </div>
                   </div>
               </fieldset>

               <fieldset>
                   <legend className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200 border-b dark:border-gray-600 pb-2">{t('Page Setup')}</legend>
                   <div className="space-y-4">
                       <div>
                           <span className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('Margins')}</span>
                           <div className="flex gap-4">
                               <RadioOption id="margin-normal" name="margins" value="normal" checked={pdfOptions.margins === 'normal'} onChange={e => setPdfOptions({...pdfOptions, margins: e.target.value as 'normal' | 'narrow' | 'wide'})} label={t('Normal')}/>
                               <RadioOption id="margin-narrow" name="margins" value="narrow" checked={pdfOptions.margins === 'narrow'} onChange={e => setPdfOptions({...pdfOptions, margins: e.target.value as 'normal' | 'narrow' | 'wide'})} label={t('Narrow')}/>
                               <RadioOption id="margin-wide" name="margins" value="wide" checked={pdfOptions.margins === 'wide'} onChange={e => setPdfOptions({...pdfOptions, margins: e.target.value as 'normal' | 'narrow' | 'wide'})} label={t('Wide')}/>
                           </div>
                       </div>
                        <div>
                           <span className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('Line Spacing')}</span>
                           <div className="flex gap-4">
                               <RadioOption id="ls-115" name="lineSpacing" value="1.15" checked={pdfOptions.lineSpacing === 1.15} onChange={e => setPdfOptions({...pdfOptions, lineSpacing: parseFloat(e.target.value)})} label={t('Single (1.15)')}/>
                               <RadioOption id="ls-15" name="lineSpacing" value="1.5" checked={pdfOptions.lineSpacing === 1.5} onChange={e => setPdfOptions({...pdfOptions, lineSpacing: parseFloat(e.target.value)})} label={t('One and a half (1.5)')}/>
                               <RadioOption id="ls-20" name="lineSpacing" value="2.0" checked={pdfOptions.lineSpacing === 2.0} onChange={e => setPdfOptions({...pdfOptions, lineSpacing: parseFloat(e.target.value)})} label={t('Double (2.0)')}/>
                           </div>
                       </div>
                       <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                           <div>
                                <label htmlFor="headerContent" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('Header Content')}</label>
                                <select id="headerContent" value={pdfOptions.headerContent} onChange={e => setPdfOptions({...pdfOptions, headerContent: e.target.value as 'title' | 'custom' | 'none'})} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-accent-500 focus:border-accent-500 outline-none">
                                    <option value="none">{t('None')}</option>
                                    <option value="title">{t('Document Title')}</option>
                                    <option value="custom">{t('Custom')}</option>
                                </select>
                                {pdfOptions.headerContent === 'custom' && (
                                    <input type="text" placeholder={t('Custom Header Text')} value={pdfOptions.customHeaderText} onChange={e => setPdfOptions({...pdfOptions, customHeaderText: e.target.value})} className="mt-2 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"/>
                                )}
                           </div>
                           <div>
                                <label htmlFor="footerContent" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('Footer Content')}</label>
                                <select id="footerContent" value={pdfOptions.footerContent} onChange={e => setPdfOptions({...pdfOptions, footerContent: e.target.value as 'pageNumber' | 'custom' | 'none'})} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-accent-500 focus:border-accent-500 outline-none">
                                    <option value="none">{t('None')}</option>
                                    <option value="pageNumber">{t('Page Number')}</option>
                                    <option value="custom">{t('Custom')}</option>
                                </select>
                                {pdfOptions.footerContent === 'custom' && (
                                    <input type="text" placeholder={t('Custom Footer Text')} value={pdfOptions.customFooterText} onChange={e => setPdfOptions({...pdfOptions, customFooterText: e.target.value})} className="mt-2 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"/>
                                )}
                           </div>
                       </div>
                   </div>
               </fieldset>
               
               <fieldset>
                   <legend className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200 border-b dark:border-gray-600 pb-2">{t('Typography')}</legend>
                   <div className="space-y-4">
                        <div>
                           <span className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('Font Pairing')}</span>
                           <div className="flex gap-4">
                               <RadioOption id="modern" name="fontPair" value="modern" checked={pdfOptions.typography.fontPair === 'modern'} onChange={() => setPdfOptions({...pdfOptions, typography: {...pdfOptions.typography, fontPair: 'modern'}})} label={t('Modern (Inter)')}/>
                               <RadioOption id="classic" name="fontPair" value="classic" checked={pdfOptions.typography.fontPair === 'classic'} onChange={() => setPdfOptions({...pdfOptions, typography: {...pdfOptions.typography, fontPair: 'classic'}})} label={t('Classic (Lora)')}/>
                           </div>
                       </div>
                       <div>
                            <label htmlFor="fontSize" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                {t('Base Font Size')}: <span className="font-bold">{pdfOptions.typography.fontSize}px</span>
                            </label>
                            <input 
                                type="range" 
                                id="fontSize" 
                                min="10" 
                                max="24" 
                                step="1"
                                value={pdfOptions.typography.fontSize} 
                                onChange={e => setPdfOptions({...pdfOptions, typography: {...pdfOptions.typography, fontSize: parseInt(e.target.value, 10)}})} 
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-accent-500"
                            />
                       </div>
                   </div>
               </fieldset>
               
                <fieldset>
                   <legend className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200 border-b dark:border-gray-600 pb-2">{t('Content')}</legend>
                  <div className="space-y-4">
                      <div className="flex flex-col gap-2">
                          <CheckboxOption id="includeTOC" checked={pdfOptions.includeTOC} onChange={e => setPdfOptions({...pdfOptions, includeTOC: e.target.checked})} label={t('Include Table of Contents')}/>
                      </div>
                      <div>
                          <CheckboxOption id="includeBibliography" checked={pdfOptions.includeBibliography} onChange={e => setPdfOptions({...pdfOptions, includeBibliography: e.target.checked})} label={t('Include Bibliography')}/>
                          {pdfOptions.includeBibliography && (
                              <div className="pl-6 mt-2 space-y-2">
                                   <div className="flex gap-4">
                                       <RadioOption id="apa" name="citationStyle" value="apa" checked={pdfOptions.citationStyle === 'apa'} onChange={() => setPdfOptions({...pdfOptions, citationStyle: 'apa'})} label={t('APA')}/>
                                       <RadioOption id="mla" name="citationStyle" value="mla" checked={pdfOptions.citationStyle === 'mla'} onChange={() => setPdfOptions({...pdfOptions, citationStyle: 'mla'})} label={t('MLA')}/>
                                   </div>
                                  <button className="flex items-center gap-2 text-sm text-accent-600 dark:text-accent-400 hover:underline" onClick={() => alert('This would connect to your Zotero/Mendeley account.')}>
                                      <Icon name="link" className="w-4 h-4" />
                                      {t('Connect to Zotero...')}
                                  </button>
                              </div>
                          )}
                      </div>
                   </div>
                </fieldset>

                <fieldset>
                   <legend className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200 border-b dark:border-gray-600 pb-2">{t('Default Settings')}</legend>
                   <div className="space-y-2">
                        <p className="text-sm text-gray-600 dark:text-gray-400">{t('Save the current export options as the new default for all future projects.')}</p>
                        <button onClick={onSaveDefaults} className="flex items-center gap-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-sm font-semibold">
                            <Icon name="archive-box" className="w-4 h-4" />
                            {t('Save as Default Settings')}
                        </button>
                   </div>
                </fieldset>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 mt-8">
                <button
                onClick={onGeneratePdf}
                disabled={isGenerating || !canGenerate}
                className="w-full flex items-center justify-center gap-2 bg-accent-600 text-white px-4 py-3 rounded-lg hover:bg-accent-700 transition-colors font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                {isGenerating ? (
                    <>
                    <Spinner light /> {t('Generating PDF...')}
                    </>
                ) : (
                    <>
                        <Icon name="download" className="w-5 h-5"/>
                        {t('Generate PDF')}
                    </>
                )}
                </button>
                <button
                    onClick={onGenerateMarkdown}
                    disabled={isGenerating || !canGenerate}
                    className="w-full flex items-center justify-center gap-2 bg-gray-700 dark:bg-gray-600 text-white px-4 py-3 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-700 transition-colors font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                {isGenerating ? (
                    <>
                    <Spinner light /> {t('Exporting...')}
                    </>
                ) : (
                    <>
                        <Icon name="document" className="w-5 h-5"/>
                        {t('Export Markdown')}
                    </>
                )}
                </button>
                <button
                    onClick={onAnalyze}
                    disabled={isGenerating || isAnalyzing || !isArticleSelected}
                    className="w-full flex items-center justify-center gap-2 bg-purple-600 text-white px-4 py-3 rounded-lg hover:bg-purple-700 transition-colors font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                    {isAnalyzing ? (
                        <>
                        <Spinner light /> {t('Analyzing Article...')}
                        </>
                    ) : (
                        <>
                            <Icon name="beaker" className="w-5 h-5"/>
                            {t('Analyze Article')}
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};

export default CompilerSettings;