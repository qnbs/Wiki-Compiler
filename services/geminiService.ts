import { GoogleGenAI, Type } from "@google/genai";
import { ArticleInsights } from '../types';

const handleGeminiError = (error: unknown, context: 'analysis' | 'editing'): Error => {
    console.error(`Error during AI ${context}:`, error);

    if (error instanceof SyntaxError) {
        return new Error("Failed to parse AI response. The format might be invalid.");
    }

    if (error instanceof Error) {
        const message = error.message.toLowerCase();
        
        if (message.includes('api key') || message.includes('credential')) {
            return new Error("Invalid or missing API Key for Gemini. Please check your configuration.");
        }
        if (message.includes('quota') || message.includes('rate limit')) {
            return new Error("API request limit reached. Please try again later.");
        }
        if (message.includes('safety') || message.includes('filtered')) {
            return new Error("The response was blocked due to safety concerns. Please adjust your prompt.");
        }
        if (message.includes('400') || message.includes('invalid argument')) {
            return new Error("Invalid request. The provided text might be too long or malformed.");
        }
        if (message.includes('503') || message.includes('unavailable')) {
            return new Error("The AI service is temporarily unavailable. Please try again later.");
        }
        return new Error(`AI service error: ${error.message}`);
    }

    const defaultMessage = `Could not ${context === 'analysis' ? 'generate insights' : 'perform AI edit'} at this time. An unknown error occurred.`;
    return new Error(defaultMessage);
};

const API_KEY = process.env.API_KEY;

let ai: GoogleGenAI | null = null;
if (API_KEY) {
    ai = new GoogleGenAI({ apiKey: API_KEY });
} else {
    console.warn("API_KEY is not set. AI features will be disabled.");
}

export const isAiConfigured = !!ai;

interface AnalysisFocus {
  summary: boolean;
  keyConcepts: boolean;
  researchQuestions: boolean;
}

const baseInsightsSchema = {
    summary: {
        type: Type.STRING,
        description: 'A concise, 3-5 sentence summary of the article.'
    },
    keyConcepts: {
        type: Type.ARRAY,
        description: 'A list of 5-7 key concepts, people, or places mentioned in the text.',
        items: {
            type: Type.OBJECT,
            properties: {
                concept: { type: Type.STRING, description: 'The name of the concept, person, or place.' },
                explanation: { type: Type.STRING, description: 'A brief, one-sentence explanation of the concept.' }
            },
            required: ['concept', 'explanation']
        }
    },
    researchQuestions: {
        type: Type.ARRAY,
        description: 'A list of 3-4 potential research questions inspired by the article content.',
        items: {
            type: Type.STRING
        }
    },
    readingTimeMinutes: {
        type: Type.INTEGER,
        description: 'An estimated time to read the article in minutes, based on an average reading speed of 200 words per minute.'
    }
};


export const getArticleInsights = async (text: string, systemInstruction: string | undefined, focus: AnalysisFocus): Promise<ArticleInsights> => {
    if (!ai) {
        throw new Error("AI Service is not configured. Please set an API key in your environment.");
    }

    // Limit text size to avoid overly large requests
    const truncatedText = text.length > 30000 ? text.substring(0, 30000) : text;
    
    const properties: any = {};
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

    // Always include reading time, as it's a simple calculation
    properties.readingTimeMinutes = baseInsightsSchema.readingTimeMinutes;
    required.push('readingTimeMinutes');

    const dynamicSchema = {
        type: Type.OBJECT,
        properties,
        required,
    };
    
    // Join prompt parts with commas and a final "and"
    const promptFocusText = promptParts.length > 1 
        ? promptParts.slice(0, -1).join(', ') + ' and ' + promptParts.slice(-1)
        : promptParts[0] || 'insights';


    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Analyze the following Wikipedia article text and provide a structured set of insights. Based on the text, generate ${promptFocusText}, and an estimated reading time. TEXT: "${truncatedText}"`,
            config: {
                responseMimeType: "application/json",
                responseSchema: dynamicSchema,
                ...(systemInstruction && { systemInstruction }),
            },
        });
        
        const jsonText = response.text.trim();
        return JSON.parse(jsonText) as ArticleInsights;

    } catch (error) {
        throw handleGeminiError(error, 'analysis');
    }
};

export const editTextWithAi = async (instruction: string, textToEdit: string): Promise<string> => {
    if (!ai) {
        throw new Error("AI Service is not configured. Please set an API key in your environment.");
    }

    if (!textToEdit.trim()) {
        return textToEdit;
    }

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `INSTRUCTION: "${instruction}"\n\nTEXT TO EDIT: "${textToEdit}"`,
            config: {
                systemInstruction: "You are an expert academic editor. You will be given a piece of text and an instruction. You MUST return ONLY the modified text, without any preamble, explanation, or markdown formatting like ```.",
                temperature: 0.2, 
            },
        });

        return response.text.trim();

    } catch (error) {
        throw handleGeminiError(error, 'editing');
    }
};