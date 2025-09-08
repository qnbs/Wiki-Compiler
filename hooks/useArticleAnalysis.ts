import { useState, useCallback } from 'react';
import { ArticleContent, ArticleInsights, AppSettings } from '../types';
import { getArticleInsights } from '../services/geminiService';

export const useArticleAnalysis = (
    article: ArticleContent | null,
    settings: AppSettings
) => {
    const [insights, setInsights] = useState<ArticleInsights | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisError, setAnalysisError] = useState<string | null>(null);

    const analyze = useCallback(async () => {
        if (!article || !settings.library.aiAssistant.enabled) return;

        setIsAnalyzing(true);
        setInsights(null);
        setAnalysisError(null);

        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = article.html;
        const textContent = tempDiv.textContent || tempDiv.innerText || "";

        try {
            const resultInsights = await getArticleInsights(textContent, settings.library.aiAssistant.systemInstruction);
            setInsights(resultInsights);
        } catch (error) {
            console.error("Analysis failed:", error);
            setAnalysisError(error instanceof Error ? error.message : String(error));
        } finally {
            setIsAnalyzing(false);
        }
    }, [article, settings]);

    const clearAnalysis = useCallback(() => {
        setInsights(null);
        setAnalysisError(null);
        setIsAnalyzing(false);
    }, []);

    return {
        insights,
        isAnalyzing,
        analysisError,
        analyze,
        clearAnalysis,
    };
};
