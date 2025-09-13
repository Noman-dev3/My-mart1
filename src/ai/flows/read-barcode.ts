'use server';

/**
 * @fileOverview Provides AI-powered barcode reading from an image.
 *
 * - readBarcodeFromImage - A function that takes an image data URI and returns the detected barcode.
 * - ReadBarcodeInput - The input type for the readBarcodeFromImage function.
 * - ReadBarcodeOutput - The return type for the readBarcodeFromImage function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ReadBarcodeInputSchema = z.object({
  imageDataUri: z
    .string()
    .describe(
      "A photo of a product's barcode, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type ReadBarcodeInput = z.infer<typeof ReadBarcodeInputSchema>;

const ReadBarcodeOutputSchema = z.object({
  barcode: z.string().describe('The numerical or alphanumerical code extracted from the barcode image. Return only the code.'),
});
export type ReadBarcodeOutput = z.infer<typeof ReadBarcodeOutputSchema>;


export async function readBarcodeFromImage(input: ReadBarcodeInput): Promise<ReadBarcodeOutput> {
  return readBarcodeFlow(input);
}


const prompt = ai.definePrompt({
  name: 'readBarcodePrompt',
  input: { schema: ReadBarcodeInputSchema },
  output: { schema: ReadBarcodeOutputSchema },
  prompt: `You are a highly accurate barcode scanner. Analyze the provided image and extract the numerical or alphanumerical code from the barcode.

Respond with only the extracted code. Do not include any explanatory text, labels, or additional characters.

Image: {{media url=imageDataUri}}`,
});

const readBarcodeFlow = ai.defineFlow(
  {
    name: 'readBarcodeFlow',
    inputSchema: ReadBarcodeInputSchema,
    outputSchema: ReadBarcodeOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
