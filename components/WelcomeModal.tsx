import React from 'react';
import { useTranslation } from 'react-i18next';
import Modal from './Modal';
import Icon from './Icon';

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const WelcomeModal: React.FC<WelcomeModalProps> = ({ isOpen, onClose }) => {
  const { t } = useTranslation();

  const handleGetStarted = () => {
    localStorage.setItem('wiki-compiler-onboarded', 'true');
    onClose();
  };

  const sections = [
    {
      title: 'welcome_library_title',
      icon: 'book',
      content: 'welcome_library_p',
    },
    {
      title: 'welcome_compiler_title',
      icon: 'compiler',
      content: 'welcome_compiler_p',
    },
    {
      title: 'welcome_archive_title',
      icon: 'archive-box',
      content: 'welcome_archive_p',
    },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleGetStarted}
      title={t('Welcome to Wiki Compiler')}
      actions={
        <button onClick={handleGetStarted} className="px-4 py-2 text-sm font-medium text-white bg-accent-600 rounded-lg hover:bg-accent-700">
          {t('Get Started')}
        </button>
      }
    >
      <div className="space-y-6">
        <p className="text-gray-600 dark:text-gray-300">
          {t('welcome_p1')}
        </p>
        <div className="space-y-4">
          {sections.map(section => (
            <div key={section.title} className="flex items-start gap-4">
              <div className="flex-shrink-0 mt-1 p-2 bg-accent-100 dark:bg-accent-900/50 rounded-full">
                <Icon name={section.icon} className="w-5 h-5 text-accent-600 dark:text-accent-400" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-800 dark:text-gray-200">{t(section.title)}</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t(section.content)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Modal>
  );
};

export default WelcomeModal;