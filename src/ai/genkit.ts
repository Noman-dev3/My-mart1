
import { genkit, configureGenkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';
import { getApiKey } from '@/lib/settings-actions';

// Note: We are using a dynamic initialization pattern here.
// The global `ai` object is initialized async and then exported.
// This allows us to fetch the API key from the database before configuring Genkit.

let aiInstance: any;

async function initializeGenkit() {
  if (aiInstance) {
    return aiInstance;
  }
  
  const geminiApiKey = await getApiKey('geminiApiKey');

  // If a key is found in the DB, use it. Otherwise, Google AI will look for GOOGLE_API_KEY env var.
  const googleAiPlugin = geminiApiKey ? googleAI({ apiKey: geminiApiKey }) : googleAI();
  
  aiInstance = genkit({
    plugins: [googleAiPlugin],
    model: 'googleai/gemini-2.5-flash',
  });
  
  return aiInstance;
}

// We export a promise that resolves to the configured `ai` object.
// This ensures that any file importing `ai` will wait for initialization.
export const ai = (async () => await initializeGenkit())();

    