'use server';

import { config } from 'dotenv';
config();

import '@/ai/flows/product-recommendations.ts';
import '@/ai/flows/newsletter-subscription.ts';
import '@/ai/flows/answer-product-question.ts';
import '@/ai/flows/read-barcode.ts';
import '@/ai/flows/generate-product-description.ts';
