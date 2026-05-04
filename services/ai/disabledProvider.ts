import type { ArticleInsights } from '../../types';
import type { AiProvider } from './types';

/** Explicitly disables AI (e.g. `AI_PROVIDER=none`). */
export class DisabledAiProvider implements AiProvider {
  readonly id = 'none' as const;

  isConfigured(): boolean {
    return false;
  }

  async getArticleInsights(): Promise<ArticleInsights> {
    throw new Error('AI Service is not configured. Set AI_PROVIDER=gemini and GEMINI_API_KEY, or use a backend proxy.');
  }

  async editTextWithAi(): Promise<string> {
    throw new Error('AI Service is not configured. Set AI_PROVIDER=gemini and GEMINI_API_KEY, or use a backend proxy.');
  }
}
