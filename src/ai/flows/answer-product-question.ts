'use server';

/**
 * @fileOverview Provides AI-powered answers to product questions.
 *
 * - getProductQuestionAnswer - A function that takes product details and a question and returns a suggested answer.
 * - ProductQuestionAnswerInput - The input type for the getProductQuestionAnswer function.
 * - ProductQuestionAnswerOutput - The return type for the getProductQuestionAnswer function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { type Product } from '@/lib/product-actions';


const ProductQuestionAnswerInputSchema = z.object({
  product: z.object({
    name: z.string(),
    description: z.string(),
    category: z.string(),
    brand: z.string(),
    specifications: z.record(z.string()),
  }),
  question: z.string().describe("The user's question about the product."),
});
export type ProductQuestionAnswerInput = z.infer<typeof ProductQuestionAnswerInputSchema>;

const ProductQuestionAnswerOutputSchema = z.object({
  answer: z.string().describe('A helpful and concise answer to the question based on the provided product details. If the information is not available, politely say so.'),
});
export type ProductQuestionAnswerOutput = z.infer<typeof ProductQuestionAnswerOutputSchema>;


export async function getProductQuestionAnswer(input: ProductQuestionAnswerInput): Promise<ProductQuestionAnswerOutput> {
  return answerProductQuestionFlow(input);
}


const prompt = ai.definePrompt({
  name: 'productQuestionAnswerPrompt',
  input: { schema: ProductQuestionAnswerInputSchema },
  output: { schema: ProductQuestionAnswerOutputSchema },
  prompt: `You are a friendly and knowledgeable customer support assistant for an e-commerce store called "My Mart".
Your goal is to answer customer questions about a product accurately based *only* on the information provided.

Do not make up information. If the answer cannot be found in the product details, politely state that the information is not available and suggest contacting customer support for more specific queries.

Here is the product information:
- **Product Name:** {{product.name}}
- **Brand:** {{product.brand}}
- **Category:** {{product.category}}
- **Description:** {{product.description}}
- **Specifications:**
{{#each product.specifications}}
  - **{{@key}}**: {{this}}
{{/each}}

Here is the customer's question:
"{{question}}"

Please provide a clear and helpful answer.
`,
});

const answerProductQuestionFlow = ai.defineFlow(
  {
    name: 'answerProductQuestionFlow',
    inputSchema: ProductQuestionAnswerInputSchema,
    outputSchema: ProductQuestionAnswerOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
