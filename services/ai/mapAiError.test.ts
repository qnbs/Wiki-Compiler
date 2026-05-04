import { describe, it, expect, vi, afterEach } from 'vitest';
import { mapAiError } from './mapAiError';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('mapAiError', () => {
  it('maps API key errors to a safe user message', () => {
    const err = new Error('API key not valid');
    const out = mapAiError(err, 'analysis');
    expect(out.message).toMatch(/API key/i);
  });

  it('maps rate limit errors', () => {
    const out = mapAiError(new Error('Rate limit exceeded'), 'editing');
    expect(out.message).toMatch(/limit reached/i);
  });

  it('maps SyntaxError for JSON parse failures', () => {
    const out = mapAiError(new SyntaxError('bad json'), 'analysis');
    expect(out.message).toMatch(/parse AI response/i);
  });
});
