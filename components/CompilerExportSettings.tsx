import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Project, PdfOptions, AppSettings } from '../types';
import { useToasts } from '../hooks/useToasts';
import Icon from './Icon';
import Spinner from './Spinner';
import PdfOptionsForm from './settings/PdfOptionsForm';

interface CompilerExportSettingsProps {
    project: Project;
    updateProject: (project: Project) => void;
    settings: AppSettings;
    updateSettings: (settings: AppSettings) => void;
    onGeneratePdf: (options: PdfOptions) => void;
    onGenerateMarkdown: () => void;
    isGeneratingPdf: boolean;
}

const CompilerExportSettings: React.FC<CompilerExportSettingsProps> = ({ 
    project, 
    updateProject, 
    settings,
    updateSettings,
    onGeneratePdf, 
    onGenerateMarkdown, 
    isGeneratingPdf 
}) => {
    const { t } = useTranslation();
    const { addToast } = useToasts();
    const [pdfOptions, setPdfOptions] = useState<PdfOptions>(settings.compiler.defaultPdfOptions);

    const handleOptionChange = (path: string, value: any) => {
        setPdfOptions(prev => {
            const newOptions = JSON.parse(JSON.stringify(prev)); // Deep copy
            let current: any = newOptions;
            const keys = path.split('.');
            for (let i = 0; i < keys.length - 1; i++) {
                current = current[keys[i]];
            }
            current[keys[keys.length - 1]] = value;
            return newOptions;
        });
    };

    const handleSaveDefaults = () => {
        if (window.confirm(t('Are you sure you want to overwrite your default export settings with the current ones?'))) {
            const newSettings = { ...settings, compiler: { ...settings.compiler, defaultPdfOptions: pdfOptions } };
            updateSettings(newSettings);
            addToast(t('Default settings updated successfully.'), 'success');
        }
    };

    return (
      <div className="bg-white dark:bg-gray-800/50 p-6 rounded-lg shadow-sm space-y-8">
        <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('Document Title')}</label>
            <input type="text" value={project.name} onChange={e => updateProject({ ...project, name: e.target.value })} className="w-full max-w-xs px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800" />
        </div>
        
        <PdfOptionsForm options={pdfOptions} onOptionChange={handleOptionChange} />

        <div className="border-t dark:border-gray-700 pt-6 space-y-4">
            <div>
                 <button onClick={handleSaveDefaults} className="w-full text-left text-sm text-accent-600 dark:text-accent-400 hover:underline">{t('Save as Default Settings')}</button>
                 <p className="text-xs text-gray-500 dark:text-gray-400">{t('Save the current export options as the new default for all future projects.')}</p>
            </div>
            <div className="flex gap-4">
                <button onClick={() => onGeneratePdf(pdfOptions)} disabled={isGeneratingPdf} className="flex-1 flex items-center justify-center gap-2 bg-accent-600 text-white px-4 py-2 rounded-lg hover:bg-accent-700 transition-colors font-semibold disabled:bg-gray-400">
                    {isGeneratingPdf ? <Spinner light /> : <Icon name="download" className="w-5 h-5" />}
                    {isGeneratingPdf ? t('Generating PDF...') : t('Generate PDF')}
                </button>
                <button onClick={onGenerateMarkdown} disabled={isGeneratingPdf} className="flex-1 flex items-center justify-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors font-semibold disabled:bg-gray-400">
                    <Icon name="document" className="w-5 h-5" />
                    {t('Export Markdown')}
                </button>
            </div>
        </div>
      </div>
    );
};

export default CompilerExportSettings;