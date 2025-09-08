import React from 'react';
import { useTranslation } from 'https://esm.sh/react-i18next@14.1.2';
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
        <input id={id} name={name} type="radio" value={value} checked={checked} onChange={onChange} className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"/>
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
        <input id={id} type="checkbox" checked={checked} onChange={onChange} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"/>
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
    isGenerating: boolean;
    canGenerate: boolean;
}

const CompilerSettings: React.FC<CompilerSettingsProps> = ({
    projectName,
    onProjectNameChange,
    onProjectNameBlur,
    pdfOptions,
    setPdfOptions,
    onGeneratePdf,
    onGenerateMarkdown,
    isGenerating,
    canGenerate
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
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
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
                          <label htmlFor="fontSize" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('Base Font Size')}</label>
                          <input type="number" id="fontSize" value={pdfOptions.typography.fontSize} onChange={e => setPdfOptions({...pdfOptions, typography: {...pdfOptions.typography, fontSize: parseInt(e.target.value, 10)}})} className="w-24 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"/>
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
                                  <button className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:underline" onClick={() => alert('This would connect to your Zotero/Mendeley account.')}>
                                      <Icon name="link" className="w-4 h-4" />
                                      {t('Connect to Zotero...')}
                                  </button>
                              </div>
                          )}
                      </div>
                   </div>
                </fieldset>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 mt-8">
                <button
                onClick={onGeneratePdf}
                disabled={isGenerating || !canGenerate}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed"
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
            </div>
        </div>
    );
};

export default CompilerSettings;
