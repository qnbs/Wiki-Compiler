import { z } from 'zod';

/**
 * Validates Wiki Compiler full JSON export before destructive import.
 * Kept intentionally permissive on record shapes; version drives future migrations.
 */
export const wikiCompilerBackupSchema = z.object({
  version: z.number().int().nonnegative(),
  exportedAt: z.string().min(1),
  data: z.object({
    projects: z.array(z.record(z.string(), z.unknown())),
    articles: z.array(z.record(z.string(), z.unknown())),
    settings: z.unknown().optional().nullable(),
    projectArticles: z.array(z.record(z.string(), z.unknown())).optional(),
    importedImages: z.array(z.record(z.string(), z.unknown())).optional(),
  }),
});

export type WikiCompilerBackup = z.infer<typeof wikiCompilerBackupSchema>;

export function parseBackupJson(jsonString: string): WikiCompilerBackup {
  let raw: unknown;
  try {
    raw = JSON.parse(jsonString);
  } catch {
    throw new Error('Invalid import file: not valid JSON.');
  }
  const result = wikiCompilerBackupSchema.safeParse(raw);
  if (!result.success) {
    const msg = result.error.issues.map((i) => i.message).join('; ');
    throw new Error(`Invalid import file format: ${msg}`);
  }
  return result.data;
}
