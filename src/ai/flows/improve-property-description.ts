
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
     return { error: errorMessage };
  }
  try {
    const result = await improvePropertyDescriptionFlow(input);
    return result;
  } catch (e: any) {
    console.error("Error in improvePropertyDescription wrapper:", e);
    return { error: e.message || "An unexpected error occurred during AI description generation." };
  }
}

const prompt = ai.definePrompt({
  name: 'improvePropertyDescriptionPrompt',
  input: {schema: ImprovePropertyDescriptionInputSchema},
  output: {schema: ImprovePropertyDescriptionOutputSchema},
  prompt: `You are an expert real estate copywriter. Your task is to rewrite the following property description to be more engaging for potential buyers or renters, using details from the provided image. The new description must be in Arabic and under 500 characters. DO NOT give advice or instructions, only provide the rewritten, improved description in the final output.

Current Description: {{{currentDescription}}}

Image: {{media url=imageDataUri}}

Improved Arabic Description:`,
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
