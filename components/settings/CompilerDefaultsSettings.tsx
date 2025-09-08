import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSettings } from '../../hooks/useSettingsContext';
import PdfOptionsForm from './PdfOptionsForm';

const CompilerDefaultsSettings: React.FC = () => {
    const { t } = useTranslation();
    const { settings, updateSettings } = useSettings();
    
    if (!settings) return null;
    
    const pdfOptions = settings.compiler.defaultPdfOptions;

    const set = (path: string, value: any) => {
        const keys = `compiler.defaultPdfOptions.${path}`.split('.');
        const newSettings = JSON.parse(JSON.stringify(settings)); // deep copy
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
          <PdfOptionsForm options={pdfOptions} onOptionChange={set} />
        </div>
      </div>
    );
};

export default CompilerDefaultsSettings;