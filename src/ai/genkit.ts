
import { config } from 'dotenv';
config(); // Ensure environment variables are loaded.

import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';


export const ai = genkit({
  plugins: [
    process.env.GEMINI_API_KEY
      ? googleAI({ apiKey: process.env.GEMINI_API_KEY })
      : googleAI(),
  ],
  model: 'googleai/gemini-pro',
});
