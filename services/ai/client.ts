import type { ArticleInsights } from '../../types';
import type { AiAnalysisFocus } from './types';
import { createAiProvider } from './factory';

let singleton: ReturnType<typeof createAiProvider> | undefined;

function getProvider() {
  if (!singleton) singleton = createAiProvider();
  return singleton;
}

export const isAiConfigured = (): boolean => getProvider().isConfigured();

export async function getArticleInsights(
  text: string,
  systemInstruction: string | undefined,
  focus: AiAnalysisFocus,
  enableThinking = false
): Promise<ArticleInsights> {
  return getProvider().getArticleInsights(text, systemInstruction, focus, enableThinking);
}

export async function editTextWithAi(instruction: string, textToEdit: string): Promise<string> {
  return getProvider().editTextWithAi(instruction, textToEdit);
}
