import React, { useState, useRef, useEffect, memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Project, ProjectArticle } from '../types';
import { useDebounce } from '../hooks/useDebounce';
import Icon from './Icon';

interface CompilerLeftPanelProps {
  project: Project;
  updateProject: (project: Project) => void;
  activeArticleTitle: string | null;
  onSelectArticle: (title: string) => void;
}

const CompilerLeftPanel: React.FC<CompilerLeftPanelProps> = ({
  project,
  updateProject,
  activeArticleTitle,
  onSelectArticle,
}) => {
  const { t } = useTranslation();
  const [articles, setArticles] = useState(project.articles);
  const [projectNotes, setProjectNotes] = useState(project.notes || '');
  const debouncedProjectNotes = useDebounce(projectNotes, 500);

  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);
  const listRef = useRef<HTMLUListElement>(null);
  
  useEffect(() => {
    setArticles(project.articles);
    setProjectNotes(project.notes || '');
  }, [project]);

  useEffect(() => {
    if (debouncedProjectNotes !== (project.notes || '')) {
      updateProject({ ...project, notes: debouncedProjectNotes });
    }
  }, [debouncedProjectNotes, project, updateProject]);

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setProjectNotes(e.target.value);
  };
  
  const handleSort = () => {
    if (dragItem.current === null || dragOverItem.current === null) return;
    const newArticles = [...articles];
    const draggedItemContent = newArticles.splice(dragItem.current, 1)[0];
    newArticles.splice(dragOverItem.current, 0, draggedItemContent);
    dragItem.current = null;
    dragOverItem.current = null;
    setArticles(newArticles);
    updateProject({ ...project, articles: newArticles });
  };

  const removeArticle = (index: number) => {
    // FIX: Renamed translation key to avoid duplicates.
    if (window.confirm(t('Remove Article from Compilation Confirmation', { articleTitle: articles[index].title }))) {
      const newArticles = articles.filter((_, i) => i !== index);
      setArticles(newArticles);
      updateProject({ ...project, articles: newArticles });
    }
  };

  const moveArticle = (index: number, direction: 'up' | 'down') => {
    const newArticles = [...articles];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= newArticles.length) return;

    [newArticles[index], newArticles[newIndex]] = [newArticles[newIndex], newArticles[index]];

    setArticles(newArticles);
    updateProject({ ...project, articles: newArticles });
    setTimeout(() => {
        const itemToFocus = listRef.current?.children[newIndex] as HTMLLIElement | undefined;
        itemToFocus?.focus();
    }, 0);
  };

  return (
    <div className="md:col-span-5 lg:col-span-4 overflow-y-auto border-r border-gray-200 dark:border-gray-700 pr-4">
      <div className="mb-4">
        <h2 className="text-xl font-bold mb-2">{t('Project Notes')}</h2>
        <textarea
          value={projectNotes}
          onChange={handleNotesChange}
          placeholder={t('Add your outline, scratchpad, or project notes here...')}
          className="w-full h-32 p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-accent-500 focus:border-accent-500 outline-none text-sm"
        />
      </div>
      <h2 className="text-2xl font-bold mb-4">{t('Compilation Articles')}</h2>
      {articles.length > 0 ? (
        <>
        <ul ref={listRef} className="space-y-2">
          {articles.map((article, index) => (
            <li
              key={article.title}
              tabIndex={0}
              onDragEnter={() => (dragOverItem.current = index)}
              onDragEnd={handleSort}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => onSelectArticle(article.title)}
              onKeyDown={(e) => {
                if (e.ctrlKey || e.metaKey) {
                  if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    moveArticle(index, 'up');
                  } else if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    moveArticle(index, 'down');
                  }
                }
              }}
              className={`group flex items-center justify-between p-3 rounded-lg shadow-sm transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-accent-500 ${activeArticleTitle === article.title ? 'bg-accent-100 dark:bg-accent-900/50 ring-2 ring-accent-500' : 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50'} cursor-pointer`}
            >
              <div className="flex items-center gap-3 truncate">
                <div draggable onDragStart={() => (dragItem.current = index)} className="cursor-grab active:cursor-grabbing">
                    <Icon name="grip" className="w-5 h-5 text-gray-400 flex-shrink-0 group-hover:text-gray-600 dark:group-hover:text-gray-300" title={t('Press Ctrl + Arrow Up or Down to reorder.')} />
                </div>
                <span className="font-medium truncate">{article.title}</span>
              </div>
              <div className="flex items-center flex-shrink-0">
                <button
                  onClick={(e) => { e.stopPropagation(); moveArticle(index, 'up'); }}
                  disabled={index === 0}
                  className="p-1 rounded-full text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                  aria-label={t('Move article up', { articleTitle: article.title })}
                >
                  <Icon name="arrow-up" className="w-5 h-5" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); moveArticle(index, 'down'); }}
                  disabled={index === articles.length - 1}
                  className="p-1 rounded-full text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                  aria-label={t('Move article down', { articleTitle: article.title })}
                >
                  <Icon name="arrow-down" className="w-5 h-5" />
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); removeArticle(index); }}
                  className="p-1 rounded-full text-gray-500 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/50"
                  aria-label={t('Remove article', { articleTitle: article.title })}
                >
                  <Icon name="trash" className="w-5 h-5"/>
                </button>
              </div>
            </li>
          ))}
        </ul>
        <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-4 italic">
          {t('Press Ctrl + Arrow Up or Down to reorder.')}
        </p>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center text-center text-gray-500 dark:text-gray-400 p-8 rounded-lg border-2 border-dashed dark:border-gray-700">
          <Icon name="compiler" className="w-12 h-12 mb-2"/>
          <p>{t('Your compilation is empty.')}</p>
          <p className="text-sm">{t('Go to the Library to add articles.')}</p>
        </div>
      )}
    </div>
  );
};

export default memo(CompilerLeftPanel);