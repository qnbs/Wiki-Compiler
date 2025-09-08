import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'https://esm.sh/react-i18next@14.1.2';
import { useClickOutside } from '../hooks/useClickOutside';
import Icon from './Icon';

interface Command {
  id: string;
  label: string;
  action: () => void;
  icon: string;
}

interface CommandPaletteProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  commands: Command[];
}

const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, setIsOpen, commands }) => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const paletteRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useClickOutside(paletteRef, () => setIsOpen(false));

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    } else {
      setSearchTerm('');
      setActiveIndex(0);
    }
  }, [isOpen]);

  const filteredCommands = commands.filter(command =>
    t(command.label).toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(prev => (prev + 1) % filteredCommands.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(prev => (prev - 1 + filteredCommands.length) % filteredCommands.length);
    } else if (e.key === 'Enter') {
      if (filteredCommands[activeIndex]) {
        filteredCommands[activeIndex].action();
        setIsOpen(false);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    const commandK = (e: KeyboardEvent) => {
        if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
            e.preventDefault();
            setIsOpen(!isOpen);
        }
    }
    window.addEventListener('keydown', commandK);
    return () => window.removeEventListener('keydown', commandK);
  }, [isOpen, setIsOpen])

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-60 z-40 flex justify-center items-start pt-20">
      <div
        ref={paletteRef}
        className="w-full max-w-lg bg-white dark:bg-gray-800 rounded-xl shadow-2xl overflow-hidden"
        onKeyDown={handleKeyDown}
      >
        <div className="relative">
          <Icon name="search" className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            ref={inputRef}
            type="text"
            placeholder={t('Type a command or search...')}
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setActiveIndex(0);
            }}
            className="w-full pl-12 pr-4 py-4 bg-transparent border-b border-gray-200 dark:border-gray-700 text-lg outline-none"
          />
        </div>
        <ul className="max-h-80 overflow-y-auto p-2">
          {filteredCommands.length > 0 ? (
            filteredCommands.map((command, index) => (
              <li
                key={command.id}
                onClick={() => {
                  command.action();
                  setIsOpen(false);
                }}
                className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer text-gray-700 dark:text-gray-300 ${
                  index === activeIndex ? 'bg-blue-50 dark:bg-blue-900/50' : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <Icon name={command.icon} className="w-5 h-5 text-gray-500" />
                <span>{t(command.label)}</span>
              </li>
            ))
          ) : (
            <p className="p-4 text-center text-gray-500">No results found.</p>
          )}
        </ul>
      </div>
    </div>
  );
};

export default CommandPalette;
