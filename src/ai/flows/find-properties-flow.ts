
'use server';
/**
 * @fileOverview An AI-powered property search agent.
 *
 * - findProperties - A function that handles natural language property search requests.
 * - FindPropertiesInput - The input type for the findProperties function.
 * - FindPropertiesOutput - The return type for the findProperties function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import type { Property, TransactionType, PropertyTypeEnum } from '@/types';

// Define a serializable version of the Property type
const SerializablePropertySchema = z.object({
  id: z.string(),
  userId: z.string(),
  title: z.string(),
  price: z.number(),
  transactionType: z.enum(['sale', 'rent']),
  propertyType: z.enum(['land', 'villa', 'house', 'apartment', 'office', 'warehouse', 'shop', 'other']),
  otherPropertyType: z.string().optional(),
  rooms: z.number(),
  bathrooms: z.number(),
  area: z.number().optional(),
  wilaya: z.string(),
  city: z.string(),
  neighborhood: z.string().optional(),
  address: z.string().optional(),
  phoneNumber: z.string().optional(),
  facebookUrl: z.string().optional(),
  instagramUrl: z.string().optional(),
  imageUrls: z.array(z.string()),
  description: z.string(),
  status: z.enum(['active', 'pending', 'deleted', 'archived']),
  createdAt: z.string(), // Using string for ISO date
  updatedAt: z.string(), // Using string for ISO date
  viewCount: z.number().optional(),
  googleMapsLink: z.string().optional(),
});
export type SerializableProperty = z.infer<typeof SerializablePropertySchema>;


const FindPropertiesInputSchema = z.object({
  query: z.string().describe('The user\'s natural language query for finding properties.'),
});
export type FindPropertiesInput = z.infer<typeof FindPropertiesInputSchema>;

const FindPropertiesOutputSchema = z.array(SerializablePropertySchema);
export type FindPropertiesOutput = z.infer<typeof FindPropertiesOutputSchema>;

// This is the Tool that the AI will use to search the database
const findPropertiesTool = ai.defineTool(
  {
    name: 'findPropertiesTool',
    description: 'Searches the database for properties based on specified criteria. Use this to find real estate.',
    inputSchema: z.object({
      transactionType: z.enum(['sale', 'rent']).optional().describe('The type of transaction (e.g., "for sale", "for rent").'),
      propertyType: z.enum(['land', 'villa', 'house', 'apartment', 'office', 'warehouse', 'shop', 'other']).optional().describe('The type of property (e.g., "apartment", "house").'),
      wilaya: z.string().optional().describe('The state or province (wilaya) where the property is located. This should be an Algerian wilaya name.'),
      city: z.string().optional().describe('The city where the property is located.'),
      rooms: z.number().optional().describe('The number of rooms in the property.'),
      minPrice: z.number().optional().describe('The minimum price.'),
      maxPrice: z.number().optional().describe('The maximum price.'),
    }),
    outputSchema: FindPropertiesOutputSchema,
  },
  async (input) => {
    console.log('findPropertiesTool received input:', input);
    const propertiesRef = collection(db, 'properties');
    let q = query(propertiesRef, where('status', '==', 'active'), limit(20)); // Limit results for performance

    if (input.transactionType) {
      q = query(q, where('transactionType', '==', input.transactionType));
    }
    if (input.propertyType) {
      q = query(q, where('propertyType', '==', input.propertyType));
    }
    if (input.wilaya) {
      q = query(q, where('wilaya', '==', input.wilaya));
    }
    if (input.city) {
      q = query(q, where('city', '==', input.city));
    }
    if (input.rooms) {
      q = query(q, where('rooms', '==', input.rooms));
    }
    if (input.minPrice) {
        q = query(q, where('price', '>=', input.minPrice));
    }
    if (input.maxPrice) {
        q = query(q, where('price', '<=', input.maxPrice));
    }

    const querySnapshot = await getDocs(q);
    const properties: SerializableProperty[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data() as Property;
      // Convert Timestamps to ISO strings for serialization
      properties.push({
        ...data,
        id: doc.id,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : new Date().toISOString(),
        updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : new Date().toISOString(),
      });
    });

    console.log(`Tool found ${properties.length} properties.`);
    return properties;
  }
);


const findPropertiesPrompt = ai.definePrompt({
    name: 'findPropertiesPrompt',
    input: { schema: FindPropertiesInputSchema },
    output: { schema: FindPropertiesOutputSchema },
    system: "You are a helpful real estate assistant. Your goal is to understand the user's request and use the findPropertiesTool to find matching properties from the database. If the user query is in Arabic, all string parameters for the tool (like wilaya or city) must also be in Arabic.",
    tools: [findPropertiesTool],
});


const findPropertiesFlow = ai.defineFlow(
  {
    name: 'findPropertiesFlow',
    inputSchema: FindPropertiesInputSchema,
    outputSchema: FindPropertiesOutputSchema,
  },
  async (input) => {
    console.log('findPropertiesFlow started with query:', input.query);
    const llmResponse = await findPropertiesPrompt(input);
    const toolCalls = llmResponse.toolCalls('findPropertiesTool');
    
    // If the model decides to use the tool, it will be in the response.
    if (toolCalls.length > 0) {
        console.log(`LLM decided to call findPropertiesTool with args:`, toolCalls[0].args);
        // Genkit automatically handles calling the tool and returning the result.
        // The final output of the flow will be the tool's output if it was called.
        return llmResponse.output || [];
    }

    // If the model doesn't use the tool, it might mean the query was unclear or didn't ask for properties.
    console.log('LLM did not call the findPropertiesTool. It might have responded with text instead.');
    // Check if it returned a text response instead of using the tool
    const textResponse = llmResponse.text;
    if (textResponse) {
        console.log('LLM text response:', textResponse);
    }
    return []; // Return empty array if tool was not used
  }
);


export async function findProperties(input: FindPropertiesInput): Promise<FindPropertiesOutput> {
  return findPropertiesFlow(input);
}
