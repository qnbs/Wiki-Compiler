import React from 'react';
import { useTranslation } from 'react-i18next';
import { ArticleInsights } from '../types';
import Icon from './Icon';
import Spinner from './Spinner';

interface ArticleInsightsViewProps {
  insights: ArticleInsights | null;
  isAnalyzing: boolean;
  analysisError: string | null;
}

const ArticleInsightsView: React.FC<ArticleInsightsViewProps> = ({ insights, isAnalyzing, analysisError }) => {
  const { t } = useTranslation();

  if (!isAnalyzing && !insights && !analysisError) {
    return null;
  }

  return (
    <div className="mb-6 p-4 border border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
      <h3 className="text-xl font-semibold flex items-center gap-2 mb-4 text-purple-800 dark:text-purple-300">
        <Icon name="beaker" className="w-6 h-6" />
        {t('AI Research Assistant')}
      </h3>
      {isAnalyzing && <div className="flex items-center gap-2 text-sm"><Spinner/> {t('Thinking...')}</div>}
      {analysisError && <p className="text-red-600 dark:text-red-400">{analysisError}</p>}
      {insights && (
          <div className="space-y-6">
              {insights.readingTimeMinutes > 0 && (
                  <div className="text-sm text-purple-700 dark:text-purple-300 font-medium">{t('Est. Reading Time')}: {insights.readingTimeMinutes} {t('min read')}</div>
              )}
              {insights.summary && (
                <div>
                   <h4 className="font-semibold text-purple-900 dark:text-purple-200 mb-2">{t('Quick Summary')}</h4>
                   <p className="prose prose-sm max-w-none dark:text-gray-300">{insights.summary}</p>
                </div>
              )}
              {insights.keyConcepts && insights.keyConcepts.length > 0 && (
                <div>
                   <h4 className="font-semibold text-purple-900 dark:text-purple-200 mb-3 flex items-center gap-2">
                       <Icon name="key" className="w-4 h-4" />
                       {t('Key Concepts')}
                   </h4>
                   <div className="flex flex-wrap gap-2">
                       {insights.keyConcepts.map(kc => (
                           <div key={kc.concept} className="bg-purple-100 dark:bg-purple-800/50 border border-purple-200 dark:border-purple-700 px-3 py-1 rounded-full text-sm group relative cursor-pointer">
                               <span className="font-medium text-purple-800 dark:text-purple-200">{kc.concept}</span>
                               <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-64 bg-gray-900 text-white text-xs rounded py-2 px-3 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-lg">
                                   {kc.explanation}
                               </div>
                           </div>
                       ))}
                   </div>
                </div>
              )}
              {insights.researchQuestions && insights.researchQuestions.length > 0 && (
                <div>
                   <h4 className="font-semibold text-purple-900 dark:text-purple-200 mb-2 flex items-center gap-2">
                        <Icon name="help" className="w-4 h-4" />
                        {t('Questions to Explore')}
                   </h4>
                   <ul className="list-disc pl-5 space-y-1 prose prose-sm max-w-none dark:text-gray-300">
                       {insights.researchQuestions.map(q => <li key={q}>{q}</li>)}
                   </ul>
                </div>
              )}
          </div>
      )}
    </div>
  );
};

export default ArticleInsightsView;