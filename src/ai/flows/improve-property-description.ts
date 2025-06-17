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
  improvedDescription: z.string().describe('The improved property description, in Arabic.'),
});
export type ImprovePropertyDescriptionOutput = z.infer<typeof ImprovePropertyDescriptionOutputSchema>;

export async function improvePropertyDescription(input: ImprovePropertyDescriptionInput): Promise<ImprovePropertyDescriptionOutput> {
  return improvePropertyDescriptionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'improvePropertyDescriptionPrompt',
  input: {schema: ImprovePropertyDescriptionInputSchema},
  output: {schema: ImprovePropertyDescriptionOutputSchema},
  prompt: `You are an expert real estate copywriter specializing in optimizing property descriptions for search engines and user engagement.\n\nGiven the current property description and an image of the property, suggest improvements to make the description more appealing to potential renters and optimized for search engines.\n\nCurrent Description: {{{currentDescription}}}\n\nImage: {{media url=imageDataUri}}\n\nFocus on highlighting key features and benefits that are visually evident in the image, and incorporate relevant keywords to improve search visibility. The improved description should be concise, engaging, and informative, encouraging potential renters to inquire further. The improved description MUST be in Arabic.\n\nImproved Description: `,
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
