
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
  prompt: `You are an AI assistant that rewrites real estate descriptions into professional, attractive Arabic marketing copy.
Your task is to analyze the provided image and the current description, then generate a new, improved description in Arabic.
The new description must be under 500 characters.
Your response MUST ONLY contain the JSON object with the 'improvedDescription' field. Do not add any greetings, explanations, or extra text outside of the JSON structure.

Current Description: '{{{currentDescription}}}'

Analyze the following image for visual cues:
{{media url=imageDataUri}}

Generate the improved Arabic description.`,
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
