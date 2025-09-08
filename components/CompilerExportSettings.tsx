import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Project, PdfOptions, AppSettings } from '../types';
import { useToasts } from '../../hooks/useToasts';
import { useDebounce } from '../../hooks/useDebounce';
import { useClickOutside } from '../../hooks/useClickOutside';
import Icon from './Icon';
import Spinner from './Spinner';
import PdfOptionsForm from './settings/PdfOptionsForm';

interface CompilerExportSettingsProps {
    project: Project;
    updateProject: (project: Project) => void;
    settings: AppSettings;
    updateSettings: (settings: AppSettings) => void;
    pdfOptions: PdfOptions;
    onPdfOptionsChange: (path: string, value: any) => void;
    onGeneratePdf: (options: PdfOptions) => void;
    onGenerateMarkdown: () => void;
    onGenerateHtml: () => void;
    onGeneratePlainText: () => void;
    onGenerateJson: () => void;
    onGenerateDocx: () => void;
    isGeneratingPdf: boolean;
    isGeneratingMarkdown: boolean;
    isGeneratingHtml: boolean;
    isGeneratingPlainText: boolean;
    isGeneratingJson: boolean;
    isGeneratingDocx: boolean;
}

const CompilerExportSettings: React.FC<CompilerExportSettingsProps> = ({ 
    project, 
    updateProject, 
    settings,
    updateSettings,
    pdfOptions,
    onPdfOptionsChange,
    onGeneratePdf, 
    onGenerateMarkdown, 
    onGenerateHtml,
    onGeneratePlainText,
    onGenerateJson,
    onGenerateDocx,
    isGeneratingPdf,
    isGeneratingMarkdown,
    isGeneratingHtml,
    isGeneratingPlainText,
    isGeneratingJson,
    isGeneratingDocx,
}) => {
    const { t } = useTranslation();
    const { addToast } = useToasts();
    const [projectName, setProjectName] = useState(project.name);
    const debouncedProjectName = useDebounce(projectName, 500);
    const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
    const exportMenuRef = useRef<HTMLDivElement>(null);

    useClickOutside(exportMenuRef, () => setIsExportMenuOpen(false));

    useEffect(() => {
        setProjectName(project.name);
    }, [project.name]);

    useEffect(() => {
        if (debouncedProjectName && debouncedProjectName !== project.name) {
            updateProject({ ...project, name: debouncedProjectName });
        }
    }, [debouncedProjectName, project, updateProject]);

    const handleSaveDefaults = () => {
        if (window.confirm(t('Are you sure you want to overwrite your default export settings with the current ones?'))) {
            const newSettings = { ...settings, compiler: { ...settings.compiler, defaultPdfOptions: pdfOptions } };
            updateSettings(newSettings);
            addToast(t('Default settings updated successfully.'), 'success');
        }
    };

    const isExporting = isGeneratingPdf || isGeneratingMarkdown || isGeneratingHtml || isGeneratingPlainText || isGeneratingJson || isGeneratingDocx;

    return (
      <div className="bg-white dark:bg-gray-800/50 p-6 rounded-lg shadow-sm space-y-8">
        <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('Document Title')}</label>
            <input 
              type="text" 
              value={projectName} 
              onChange={e => setProjectName(e.target.value)} 
              className="w-full max-w-xs px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800" 
            />
        </div>
        
        <PdfOptionsForm options={pdfOptions} onOptionChange={onPdfOptionsChange} />

        <div className="border-t dark:border-gray-700 pt-6 space-y-4">
            <div>
                 <button onClick={handleSaveDefaults} disabled={isExporting} className="w-full text-left text-sm text-accent-600 dark:text-accent-400 hover:underline disabled:opacity-50 disabled:cursor-not-allowed">{t('Save as Default Settings')}</button>
                 <p className="text-xs text-gray-500 dark:text-gray-400">{t('Save the current export options as the new default for all future projects.')}</p>
            </div>
            <div className="flex gap-4">
                <button onClick={() => onGeneratePdf(pdfOptions)} disabled={isExporting} className="flex-1 flex items-center justify-center gap-2 bg-accent-600 text-white px-4 py-2 rounded-lg hover:bg-accent-700 transition-colors font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed">
                    {isGeneratingPdf ? <Spinner light /> : <Icon name="download" className="w-5 h-5" />}
                    {isGeneratingPdf ? t('Generating PDF...') : t('Generate PDF')}
                </button>
                <div className="flex-1 relative" ref={exportMenuRef}>
                    <button 
                        onClick={() => setIsExportMenuOpen(p => !p)} 
                        disabled={isExporting} 
                        className="w-full flex items-center justify-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                        <Icon name="document" className="w-5 h-5" />
                        <span>{t('Export As...')}</span>
                        <Icon name="chevron-down" className={`w-4 h-4 transition-transform ${isExportMenuOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {isExportMenuOpen && (
                        <div className="absolute bottom-full mb-2 w-full bg-white dark:bg-gray-700 rounded-lg shadow-lg border dark:border-gray-600 z-10">
                            <ul className="py-1 text-sm text-gray-700 dark:text-gray-200">
                                <li onClick={!isExporting ? () => { onGenerateMarkdown(); setIsExportMenuOpen(false); } : undefined} className={`flex justify-between items-center px-4 py-2 ${isExporting ? 'cursor-not-allowed opacity-50' : 'hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer'}`}>
                                    {t('Markdown (.md)')} {isGeneratingMarkdown && <Spinner />}
                                </li>
                                <li onClick={!isExporting ? () => { onGenerateHtml(); setIsExportMenuOpen(false); } : undefined} className={`flex justify-between items-center px-4 py-2 ${isExporting ? 'cursor-not-allowed opacity-50' : 'hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer'}`}>
                                    {t('HTML (.html)')} {isGeneratingHtml && <Spinner />}
                                </li>
                                <li onClick={!isExporting ? () => { onGeneratePlainText(); setIsExportMenuOpen(false); } : undefined} className={`flex justify-between items-center px-4 py-2 ${isExporting ? 'cursor-not-allowed opacity-50' : 'hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer'}`}>
                                    {t('Plain Text (.txt)')} {isGeneratingPlainText && <Spinner />}
                                </li>
                                <li onClick={!isExporting ? () => { onGenerateJson(); setIsExportMenuOpen(false); } : undefined} className={`flex justify-between items-center px-4 py-2 ${isExporting ? 'cursor-not-allowed opacity-50' : 'hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer'}`}>
                                    {t('JSON (.json)')} {isGeneratingJson && <Spinner />}
                                </li>
                                <li onClick={!isExporting ? () => { onGenerateDocx(); setIsExportMenuOpen(false); } : undefined} className={`flex justify-between items-center px-4 py-2 ${isExporting ? 'cursor-not-allowed opacity-50' : 'hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer'}`}>
                                    {t('DOCX (.docx)')} {isGeneratingDocx && <Spinner />}
                                </li>
                            </ul>
                        </div>
                    )}
                </div>
            </div>
        </div>
      </div>
    );
};

export default CompilerExportSettings;