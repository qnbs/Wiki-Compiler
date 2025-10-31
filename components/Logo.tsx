import React from 'react';
import { useTranslation } from 'react-i18next';

interface LogoProps {
  onClick: () => void;
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ onClick, className }) => {
  const { t } = useTranslation();
  return (
    <button onClick={onClick} className={`flex items-center gap-3 group focus:outline-none focus:ring-2 focus:ring-offset-2 dark:ring-offset-gray-900 focus:ring-accent-500 rounded-lg p-1 -ml-1 ${className}`}>
      <div className="w-8 h-8 bg-accent-500 rounded-lg flex items-center justify-center group-hover:bg-accent-600 transition-colors">
        {/* Stylized 'W' icon */}
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-7 h-7 text-white">
          <path fill="currentColor" d="M6 5 L9 19 L12 9 L15 19 L18 5 L16 5 L13.5 15 L12 5 L10.5 15 L8 5 Z" />
        </svg>
      </div>
      <span className="text-xl font-bold text-gray-800 dark:text-white hidden sm:inline">{t('Wiki Compiler')}</span>
    </button>
  );
};

export default Logo;
