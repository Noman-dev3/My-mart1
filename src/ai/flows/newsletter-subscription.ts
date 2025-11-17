'use server';

/**
 * @fileOverview Handles newsletter subscription logic.
 *
 * - subscribeToNewsletter - A function that subscribes a user to the newsletter.
 * - NewsletterSubscriptionInput - The input type for the subscribeToNewsletter function.
 * - NewsletterSubscriptionOutput - The return type for the subscribeToNewsletter function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const NewsletterSubscriptionInputSchema = z.object({
  email: z.string().email().describe('The email address to subscribe.'),
});
export type NewsletterSubscriptionInput = z.infer<typeof NewsletterSubscriptionInputSchema>;

const NewsletterSubscriptionOutputSchema = z.object({
  message: z.string().describe('A confirmation message for the user.'),
});
export type NewsletterSubscriptionOutput = z.infer<typeof NewsletterSubscriptionOutputSchema>;

export async function subscribeToNewsletter(input: NewsletterSubscriptionInput): Promise<NewsletterSubscriptionOutput> {
  return newsletterSubscriptionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'newsletterSubscriptionPrompt',
  input: { schema: NewsletterSubscriptionInputSchema },
  output: { schema: NewsletterSubscriptionOutputSchema },
  prompt: `You are a witty and friendly marketing assistant for "My Mart". 
A user with the email '{{email}}' has just subscribed to the newsletter. 
Respond with a short, welcoming, and slightly humorous confirmation message. 
Confirm that they will receive the latest deals and offers.`,
});

const newsletterSubscriptionFlow = ai.defineFlow(
  {
    name: 'newsletterSubscriptionFlow',
    inputSchema: NewsletterSubscriptionInputSchema,
    outputSchema: NewsletterSubscriptionOutputSchema,
  },
  async (input) => {
    // In a real application, you would save the email to a database here.
    console.log(`New newsletter subscriber: ${input.email}`);
    
    const { output } = await prompt(input);
    return output!;
  }
);
