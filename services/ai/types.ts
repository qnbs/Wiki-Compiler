import type { AppSettings, ArticleInsights } from '../../types';

/** Which backend is active (extensible: openai, proxy, …). */
export type AiProviderId = 'gemini' | 'none';

export type AiAnalysisFocus = AppSettings['library']['aiAssistant']['focus'];

/**
 * Provider-agnostic AI surface. Implementations must not leak raw API keys in errors.
 */
export interface AiProvider {
  readonly id: AiProviderId;
  isConfigured(): boolean;
  getArticleInsights(
    text: string,
    systemInstruction: string | undefined,
    focus: AiAnalysisFocus,
    enableThinking?: boolean
  ): Promise<ArticleInsights>;
  editTextWithAi(instruction: string, textToEdit: string): Promise<string>;
}
