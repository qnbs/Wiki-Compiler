import { GoogleGenAI, Type } from "@google/genai";
import { ArticleInsights } from '../types';

const API_KEY = process.env.API_KEY;

let ai: GoogleGenAI | null = null;
if (API_KEY) {
    ai = new GoogleGenAI({ apiKey: API_KEY });
} else {
    console.warn("API_KEY is not set. AI features will be disabled.");
}

const insightsSchema = {
    type: Type.OBJECT,
    properties: {
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
    },
    required: ['summary', 'keyConcepts', 'researchQuestions', 'readingTimeMinutes']
};


export const getArticleInsights = async (text: string, systemInstruction?: string): Promise<ArticleInsights> => {
    if (!ai) {
        throw new Error("AI Service is not configured. Please set your API key.");
    }

    // Limit text size to avoid overly large requests
    const truncatedText = text.length > 30000 ? text.substring(0, 30000) : text;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Analyze the following Wikipedia article text and provide a structured set of insights. Based on the text, generate a summary, key concepts, potential research questions, and an estimated reading time. TEXT: "${truncatedText}"`,
            config: {
                responseMimeType: "application/json",
                responseSchema: insightsSchema,
                ...(systemInstruction && { systemInstruction }),
            },
        });
        
        const jsonText = response.text.trim();
        return JSON.parse(jsonText) as ArticleInsights;

    } catch (error) {
        console.error("Error getting insights from Gemini API:", error);
        if (error instanceof SyntaxError) {
             throw new Error("Failed to parse AI response. The format might be invalid.");
        }
        if (error instanceof Error && error.message.toLowerCase().includes('api key')) {
            throw new Error("Invalid or missing API Key for Gemini. Please check your configuration.");
        }
        throw new Error("Could not generate insights at this time. The service may be unavailable.");
    }
};
