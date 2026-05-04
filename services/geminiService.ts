/**
 * Back-compat facade: all AI calls go through the provider-agnostic layer in `./ai/`.
 * Do not add parallel Gemini clients here — see `.cursor/rules/100-gemini-idb-integration.mdc`.
 */
export { getArticleInsights, editTextWithAi, isAiConfigured } from './ai/client';
