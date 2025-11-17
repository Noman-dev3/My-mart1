
'use server';

/**
 * @fileOverview Provides AI-powered product recommendations.
 *
 * - getProductRecommendations - A function that takes a product ID and returns a list of recommended product IDs.
 * - ProductRecommendationsInput - The input type for the getProductRecommendations function.
 * - ProductRecommendationsOutput - The return type for the getProductRecommendations function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ProductRecommendationsInputSchema = z.object({
  productId: z.string().describe('The ID of the product to get recommendations for.'),
  browsingHistory: z.array(z.string()).optional().describe('The user browsing history product IDs.'),
});
export type ProductRecommendationsInput = z.infer<typeof ProductRecommendationsInputSchema>;

const ProductRecommendationsOutputSchema = z.object({
  recommendedProductIds: z.array(z.string()).describe('A list of recommended product IDs.'),
});
export type ProductRecommendationsOutput = z.infer<typeof ProductRecommendationsOutputSchema>;

export async function getProductRecommendations(input: ProductRecommendationsInput): Promise<ProductRecommendationsOutput> {
  return productRecommendationsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'productRecommendationsPrompt',
  input: {schema: ProductRecommendationsInputSchema},
  output: {schema: ProductRecommendationsOutputSchema},
  prompt: `You are an expert shopping assistant.

You will recommend products related to a product the user is viewing.

Product ID: {{{productId}}}

{{#if browsingHistory}}
Browsing History:
{{#each browsingHistory}}
- {{{this}}}
{{/each}}
{{/if}}

Recommend products that a user may also be interested in. Only return the product IDs in a JSON array.
`,
});

const productRecommendationsFlow = ai.defineFlow(
  {
    name: 'productRecommendationsFlow',
    inputSchema: ProductRecommendationsInputSchema,
    outputSchema: ProductRecommendationsOutputSchema,
  },
  async input => {
    try {
        const {output} = await prompt(input);
        return output!;
    } catch (error) {
        console.error("Error in product recommendations flow:", error);
        // If the AI service fails, return an empty array to allow the frontend to use its own fallback.
        return { recommendedProductIds: [] };
    }
  }
);
