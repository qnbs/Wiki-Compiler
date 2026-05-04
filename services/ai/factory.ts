import type { AiProvider } from './types';
import { DisabledAiProvider } from './disabledProvider';
import { GeminiAiProvider } from './geminiProvider';

function readProviderMode(): string {
  if (typeof process === 'undefined' || !process.env) return 'gemini';
  return (process.env.AI_PROVIDER || 'gemini').toLowerCase().trim();
}

/**
 * Selects the active {@link AiProvider} from environment (Vite-injected at build time).
 * - `gemini` (default): Google Gemini with `GEMINI_API_KEY`
 * - `none`: no client-side AI (BYOK / proxy only in future)
 */
export function createAiProvider(): AiProvider {
  const mode = readProviderMode();
  if (mode === 'none' || mode === 'off' || mode === 'disabled') {
    return new DisabledAiProvider();
  }
  if (mode === 'gemini') {
    return new GeminiAiProvider();
  }
  console.warn(`Unknown AI_PROVIDER="${mode}", falling back to Gemini adapter.`);
  return new GeminiAiProvider();
}
