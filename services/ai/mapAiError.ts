export type AiErrorContext = 'analysis' | 'editing';

/**
 * Maps transport/provider errors to user-safe messages (no key material).
 */
export function mapAiError(error: unknown, context: AiErrorContext): Error {
  console.error(`Error during AI ${context}:`, error);

  if (error instanceof SyntaxError) {
    return new Error('Failed to parse AI response. The format might be invalid.');
  }

  if (error instanceof Error) {
    const message = error.message.toLowerCase();

    if (message.includes('api key') || message.includes('credential')) {
      return new Error('Invalid or missing API key. Please check your configuration.');
    }
    if (message.includes('quota') || message.includes('rate limit')) {
      return new Error('API request limit reached. Please try again later.');
    }
    if (message.includes('safety') || message.includes('filtered')) {
      return new Error('The response was blocked due to safety concerns. Please adjust your prompt.');
    }
    if (message.includes('400') || message.includes('invalid argument')) {
      return new Error('Invalid request. The provided text might be too long or malformed.');
    }
    if (message.includes('503') || message.includes('unavailable')) {
      return new Error('The AI service is temporarily unavailable. Please try again later.');
    }
    return new Error(`AI service error: ${error.message}`);
  }

  const defaultMessage = `Could not ${
    context === 'analysis' ? 'generate insights' : 'perform AI edit'
  } at this time. An unknown error occurred.`;
  return new Error(defaultMessage);
}
