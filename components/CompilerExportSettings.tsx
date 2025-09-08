import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Project } from '../types';
import { useDebounce } from '../../hooks/useDebounce';
import { useClickOutside } from '../../hooks/useClickOutside';
import Icon from './Icon';
import Spinner from './Spinner';

interface CompilerExportSettingsProps {
    project: Project;
    updateProject: (project: Project) => void;
    onGenerateMarkdown: () => void;
    onGenerateHtml: () => void;
    onGeneratePlainText: () => void;
    onGenerateJson: () => void;
    onGenerateDocx: () => void;
    onGenerateOdt: () => void;
    isGeneratingMarkdown: boolean;
    isGeneratingHtml: boolean;
    isGeneratingPlainText: boolean;
    isGeneratingJson: boolean;
    isGeneratingDocx: boolean;
    isGeneratingOdt: boolean;
}

const CompilerExportSettings: React.FC<CompilerExportSettingsProps> = ({ 
    project, 
    updateProject, 
    onGenerateMarkdown, 
    onGenerateHtml,
    onGeneratePlainText,
    onGenerateJson,
    onGenerateDocx,
    onGenerateOdt,
    isGeneratingMarkdown,
    isGeneratingHtml,
    isGeneratingPlainText,
    isGeneratingJson,
    isGeneratingDocx,
    isGeneratingOdt,
}) => {
    const { t } = useTranslation();
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

    const isExporting = isGeneratingMarkdown || isGeneratingHtml || isGeneratingPlainText || isGeneratingJson || isGeneratingDocx || isGeneratingOdt;

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
        
        <div className="border-t dark:border-gray-700 pt-6 space-y-4">
            <div className="flex gap-4">
                <button onClick={onGenerateDocx} disabled={isExporting} className="flex-1 flex items-center justify-center gap-2 bg-accent-600 text-white px-4 py-2 rounded-lg hover:bg-accent-700 transition-colors font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed">
                    {isGeneratingDocx ? <Spinner light /> : <Icon name="download" className="w-5 h-5" />}
                    {isGeneratingDocx ? t('Exporting DOCX...') : t('Export DOCX')}
                </button>
                <div className="relative" ref={exportMenuRef}>
                    <button 
                        onClick={() => setIsExportMenuOpen(p => !p)} 
                        disabled={isExporting} 
                        className="w-full h-full flex items-center justify-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                        <span>{t('Export As...')}</span>
                        <Icon name="chevron-down" className={`w-4 h-4 transition-transform ${isExportMenuOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {isExportMenuOpen && (
                        <div className="absolute bottom-full mb-2 w-full bg-white dark:bg-gray-700 rounded-lg shadow-lg border dark:border-gray-600 z-10">
                            <ul className="py-1 text-sm text-gray-700 dark:text-gray-200">
                                <li onClick={!isExporting ? () => { onGenerateMarkdown(); setIsExportMenuOpen(false); } : undefined} className={`flex justify-between items-center px-4 py-2 ${isExporting ? 'cursor-not-allowed opacity-50' : 'hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer'}`}>
                                    {t('Markdown (.md)')} {isGeneratingMarkdown && <Spinner />}
                                </li>
                                <li onClick={!isExporting ? () => { onGenerateOdt(); setIsExportMenuOpen(false); } : undefined} className={`flex justify-between items-center px-4 py-2 ${isExporting ? 'cursor-not-allowed opacity-50' : 'hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer'}`}>
                                    {t('ODT (.odt)')} {isGeneratingOdt && <Spinner />}
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