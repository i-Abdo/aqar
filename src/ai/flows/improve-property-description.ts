
'use server';

/**
 * @fileOverview AI-powered tool that suggests improvements to the property description based on the images uploaded, optimizing it for search engines and user engagement.
 *
 * - improvePropertyDescription - A function that handles the property description improvement process.
 * - ImprovePropertyDescriptionInput - The input type for the improvePropertyDescription function.
 * - ImprovePropertyDescriptionOutput - The return type for the improvePropertyDescription function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import * as Sentry from "@sentry/nextjs";

const ImprovePropertyDescriptionInputSchema = z.object({
  imageDataUri: z
    .string()
    .describe(
      "A photo of the property, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  currentDescription: z.string().describe('The current property description.'),
});
export type ImprovePropertyDescriptionInput = z.infer<typeof ImprovePropertyDescriptionInputSchema>;

const ImprovePropertyDescriptionOutputSchema = z.object({
  improvedDescription: z.string().max(500, {message: "الوصف المقترح يجب ألا يتجاوز 500 حرف."}).describe('The improved property description, in Arabic, and should not exceed 500 characters.'),
});
export type ImprovePropertyDescriptionOutput = z.infer<typeof ImprovePropertyDescriptionOutputSchema>;


const ImprovePropertyDescriptionResultSchema = z.union([
  ImprovePropertyDescriptionOutputSchema,
  z.object({ error: z.string() })
]);
export type ImprovePropertyDescriptionResult = z.infer<typeof ImprovePropertyDescriptionResultSchema>;


export async function improvePropertyDescription(input: ImprovePropertyDescriptionInput): Promise<ImprovePropertyDescriptionResult> {
  if (!process.env.GOOGLE_API_KEY) {
     const errorMessage = 'مفتاح Google AI API غير مهيأ على الخادم. يرجى الاتصال بالدعم الفني.';
     console.error("ACTION_ERROR: " + errorMessage);
     Sentry.captureMessage(errorMessage, "error");
     return { error: errorMessage };
  }
  try {
    const result = await improvePropertyDescriptionFlow(input);
    return result;
  } catch (e: any) {
    console.error("Sentry Capture: Error in improvePropertyDescription wrapper:", e);
    Sentry.captureException(e);
    return { error: e.message || "An unexpected error occurred during AI description generation." };
  }
}

const prompt = ai.definePrompt({
  name: 'improvePropertyDescriptionPrompt',
  input: {schema: ImprovePropertyDescriptionInputSchema},
  output: {schema: ImprovePropertyDescriptionOutputSchema},
  prompt: `You are an expert real estate marketing copywriter.
Your one and only task is to take the provided image and current description and rewrite it into a compelling, professional, and attractive property listing description in Arabic.
The final output must be ONLY the rewritten description and nothing else.
The new description MUST be in Arabic.
The new description MUST be under 500 characters.
Analyze the image for key features (e.g., sunny, modern, spacious, type of rooms) and incorporate them.
Based on the provided details, generate an improved description.

Current Description: {{{currentDescription}}}

Image: {{media url=imageDataUri}}`,
});

const improvePropertyDescriptionFlow = ai.defineFlow(
  {
    name: 'improvePropertyDescriptionFlow',
    inputSchema: ImprovePropertyDescriptionInputSchema,
    outputSchema: ImprovePropertyDescriptionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

