import React from 'react';
import { useTranslation } from 'react-i18next';
import Icon from './Icon';

interface CompilerExportSettingsProps {
  onGenerateMarkdown: () => void;
  onGenerateJson: () => void;
  onGenerateDocx: () => void;
  onGenerateOdt: () => void;
}

const ExportOption: React.FC<{icon: string, title: string, description: string, onClick: () => void}> = ({ icon, title, description, onClick }) => (
    <button onClick={onClick} className="flex flex-col items-start text-left p-4 border dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors focus:outline-none focus:ring-2 focus:ring-accent-500">
        <div className="flex items-center gap-3">
            <Icon name={icon} className="w-6 h-6 text-accent-500" />
            <h3 className="font-semibold text-lg">{title}</h3>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{description}</p>
    </button>
);


const CompilerExportSettings: React.FC<CompilerExportSettingsProps> = ({
  onGenerateMarkdown,
  onGenerateJson,
  onGenerateDocx,
  onGenerateOdt,
}) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-8">
      <h2 className="text-xl font-semibold mb-6 pb-2 border-b dark:border-gray-600">{t('Export Project')}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        
        <ExportOption
          icon="document"
          title="DOCX"
          description={t('Export as a Microsoft Word document, best for professional reports.')}
          onClick={onGenerateDocx}
        />

        <ExportOption
          icon="document"
          title="Markdown"
          description={t('Export as a plain text Markdown file, ideal for web or developers.')}
          onClick={onGenerateMarkdown}
        />

        <ExportOption
          icon="document"
          title="JSON"
          description={t('Export project data as a JSON file, useful for backups or integration.')}
          onClick={onGenerateJson}
        />

         <ExportOption
          icon="document"
          title="ODT"
          description={t('Export as an OpenDocument Text file for use in LibreOffice, etc.')}
          onClick={onGenerateOdt}
        />

      </div>
    </div>
  );
};

export default CompilerExportSettings;
