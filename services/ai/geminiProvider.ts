import { GoogleGenAI, Type } from '@google/genai';
import type { ArticleInsights } from '../../types';
import type { AiAnalysisFocus, AiProvider } from './types';
import { mapAiError } from './mapAiError';

const baseInsightsSchema = {
  summary: {
    type: Type.STRING,
    description: 'A concise, 3-5 sentence summary of the article.',
  },
  keyConcepts: {
    type: Type.ARRAY,
    description:
      'A list of 5-7 key concepts, people, or places mentioned in the text.',
    items: {
      type: Type.OBJECT,
      properties: {
        concept: { type: Type.STRING, description: 'The name of the concept, person, or place.' },
        explanation: { type: Type.STRING, description: 'A brief, one-sentence explanation of the concept.' },
      },
      required: ['concept', 'explanation'],
    },
  },
  researchQuestions: {
    type: Type.ARRAY,
    description: 'A list of 3-4 potential research questions inspired by the article content.',
    items: {
      type: Type.STRING,
    },
  },
  readingTimeMinutes: {
    type: Type.INTEGER,
    description:
      'An estimated time to read the article in minutes, based on an average reading speed of 200 words per minute.',
  },
} as const;

/**
 * Google Gemini via `@google/genai`. API key from `GEMINI_API_KEY` / `process.env.API_KEY` (Vite inject).
 */
export class GeminiAiProvider implements AiProvider {
  readonly id = 'gemini' as const;

  private readonly client: GoogleGenAI | null;

  constructor() {
    const apiKey =
      typeof process !== 'undefined' && process.env ? process.env.API_KEY : undefined;
    this.client = apiKey ? new GoogleGenAI({ apiKey }) : null;
    if (!this.client) {
      console.warn('API_KEY is not set. AI features will be disabled.');
    }
  }

  isConfigured(): boolean {
    return this.client !== null;
  }

  async getArticleInsights(
    text: string,
    systemInstruction: string | undefined,
    focus: AiAnalysisFocus,
    enableThinking = false
  ): Promise<ArticleInsights> {
    if (!this.client) {
      throw new Error('AI Service is not configured. Please set an API key in your environment.');
    }

    const truncatedText = text.length > 30000 ? text.substring(0, 30000) : text;

    const properties: Record<string, unknown> = {};
    const required: string[] = [];
    const promptParts: string[] = [];

    if (focus.summary) {
      properties.summary = baseInsightsSchema.summary;
      required.push('summary');
      promptParts.push('a summary');
    }
    if (focus.keyConcepts) {
      properties.keyConcepts = baseInsightsSchema.keyConcepts;
      required.push('keyConcepts');
      promptParts.push('key concepts');
    }
    if (focus.researchQuestions) {
      properties.researchQuestions = baseInsightsSchema.researchQuestions;
      required.push('researchQuestions');
      promptParts.push('potential research questions');
    }

    properties.readingTimeMinutes = baseInsightsSchema.readingTimeMinutes;
    required.push('readingTimeMinutes');

    const dynamicSchema = {
      type: Type.OBJECT,
      properties,
      required,
    };

    const promptFocusText =
      promptParts.length > 1
        ? promptParts.slice(0, -1).join(', ') + ' and ' + promptParts.slice(-1)
        : promptParts[0] || 'insights';

    const thinkingConfig = enableThinking ? { thinkingBudget: 2048 } : undefined;

    try {
      const response = await this.client.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Analyze the following Wikipedia article text and provide a structured set of insights. Based on the text, generate ${promptFocusText}, and an estimated reading time. TEXT: "${truncatedText}"`,
        config: {
          responseMimeType: 'application/json',
          responseSchema: dynamicSchema,
          ...(systemInstruction && { systemInstruction }),
          ...(thinkingConfig && { thinkingConfig }),
        },
      });

      const jsonText = (response.text ?? '').trim();
      return JSON.parse(jsonText) as ArticleInsights;
    } catch (error) {
      throw mapAiError(error, 'analysis');
    }
  }

  async editTextWithAi(instruction: string, textToEdit: string): Promise<string> {
    if (!this.client) {
      throw new Error('AI Service is not configured. Please set an API key in your environment.');
    }

    if (!textToEdit.trim()) {
      return textToEdit;
    }

    try {
      const response = await this.client.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `INSTRUCTION: "${instruction}"\n\nTEXT TO EDIT: "${textToEdit}"`,
        config: {
          systemInstruction:
            'You are an expert academic editor. You will be given a piece of text and an instruction. You MUST return ONLY the modified text, without any preamble, explanation, or markdown formatting like ```.',
          temperature: 0.2,
        },
      });

      return (response.text ?? '').trim();
    } catch (error) {
      throw mapAiError(error, 'editing');
    }
  }
}
