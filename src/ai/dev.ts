'use server';

import { config } from 'dotenv';
config();

import '@/ai/flows/product-recommendations.ts';
import '@/ai/flows/newsletter-subscription.ts';
import '@/ai/flows/answer-product-question.ts';
