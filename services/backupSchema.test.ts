import { describe, it, expect } from 'vitest';
import { parseBackupJson, wikiCompilerBackupSchema } from './backupSchema';

describe('parseBackupJson', () => {
  it('accepts a well-formed export payload', () => {
    const json = JSON.stringify({
      version: 4,
      exportedAt: new Date().toISOString(),
      data: {
        projects: [{ id: '1', name: 'P', articles: [], notes: '', lastActiveView: 'article' }],
        articles: [{ title: 'T', html: '<p>x</p>' }],
        settings: { language: 'en' },
        projectArticles: [],
        importedImages: [],
      },
    });
    const parsed = parseBackupJson(json);
    expect(parsed.version).toBe(4);
    expect(parsed.data.projects).toHaveLength(1);
  });

  it('rejects invalid JSON', () => {
    expect(() => parseBackupJson('not json')).toThrow(/not valid JSON/i);
  });

  it('rejects missing data envelope', () => {
    expect(() => parseBackupJson(JSON.stringify({ version: 1 }))).toThrow(/Invalid import file format/i);
  });
});

describe('wikiCompilerBackupSchema', () => {
  it('requires projects and articles arrays', () => {
    const r = wikiCompilerBackupSchema.safeParse({
      version: 1,
      exportedAt: 'x',
      data: { projects: [], articles: [] },
    });
    expect(r.success).toBe(true);
  });
});
