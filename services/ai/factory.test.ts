import { describe, it, expect, vi, afterEach } from 'vitest';
import { createAiProvider } from './factory';

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('createAiProvider', () => {
  it('uses DisabledAiProvider when AI_PROVIDER=none', () => {
    vi.stubEnv('AI_PROVIDER', 'none');
    const p = createAiProvider();
    expect(p.id).toBe('none');
    expect(p.isConfigured()).toBe(false);
  });

  it('uses Gemini adapter when AI_PROVIDER=gemini', () => {
    vi.stubEnv('AI_PROVIDER', 'gemini');
    const p = createAiProvider();
    expect(p.id).toBe('gemini');
  });
});
