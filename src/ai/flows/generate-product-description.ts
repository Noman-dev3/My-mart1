'use server';
/**
 * @fileOverview Generates a product description based on the product name.
 *
 * - generateProductDescription - A function that takes a product name and returns a suggested description.
 * - GenerateProductDescriptionInput - The input type for the generateProductDescription function.
 * - GenerateProductDescriptionOutput - The return type for the generateProductDescription function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateProductDescriptionInputSchema = z.object({
  productName: z.string().describe('The name of the product.'),
});
export type GenerateProductDescriptionInput = z.infer<typeof GenerateProductDescriptionInputSchema>;

const GenerateProductDescriptionOutputSchema = z.object({
  description: z.string().describe('A well-written, engaging, and SEO-friendly product description for an e-commerce store called "My Mart". The description should be around 2-3 paragraphs.'),
});
export type GenerateProductDescriptionOutput = z.infer<typeof GenerateProductDescriptionOutputSchema>;

export async function generateProductDescription(input: GenerateProductDescriptionInput): Promise<GenerateProductDescriptionOutput> {
  return generateProductDescriptionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateProductDescriptionPrompt',
  input: { schema: GenerateProductDescriptionInputSchema },
  output: { schema: GenerateProductDescriptionOutputSchema },
  prompt: `You are an expert copywriter for an e-commerce store named "My Mart".
Your task is to write a compelling, engaging, and SEO-friendly product description for the following product.

Product Name: "{{productName}}"

The description should be 2-3 paragraphs long. Highlight the key benefits and features in a way that entices customers to make a purchase. Do not use markdown.
`,
});

const generateProductDescriptionFlow = ai.defineFlow(
  {
    name: 'generateProductDescriptionFlow',
    inputSchema: GenerateProductDescriptionInputSchema,
    outputSchema: GenerateProductDescriptionOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
