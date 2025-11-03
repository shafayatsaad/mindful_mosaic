'use server';

/**
 * @fileOverview A flow to analyze the sentiment of a user's reflection text.
 *
 * - analyzeSentiment - A function that calls the Gemini API via a Genkit prompt.
 */

import { ai } from '@/ai/genkit';
import {
  AnalyzeSentimentInput,
  AnalyzeSentimentInputSchema,
  AnalyzeSentimentOutput,
  AnalyzeSentimentOutputSchema,
} from '@/lib/types';
import { z } from 'zod';

const sentimentCache = new Map<string, AnalyzeSentimentOutput>();

export async function analyzeSentiment(
  input: AnalyzeSentimentInput
): Promise<AnalyzeSentimentOutput> {
  const { reflection } = input;

  // Check cache first
  if (sentimentCache.has(reflection)) {
    return sentimentCache.get(reflection)!;
  }

  const result = await analyzeSentimentFlow(input);

  // Store result in cache
  sentimentCache.set(reflection, result);

  return result;
}

const sentimentAnalysisPrompt = ai.definePrompt(
  {
    name: 'sentimentAnalysisPrompt',
    input: { schema: AnalyzeSentimentInputSchema },
    output: { schema: AnalyzeSentimentOutputSchema },
            prompt: `Analyze the overall sentiment based on the following user input.
            
            Your task is to classify the overall sentiment as POSITIVE, NEGATIVE, or NEUTRAL, considering all provided information.
            
            {{#if combinedSentimentSummary}}
            Here is a pre-analyzed summary of the combined sentiment from both questionnaire inputs and reflection text: {{combinedSentimentSummary}} Use this summary as the primary indicator for the overall sentiment.
            {{/if}}
        
            Reflection Text (for context, if not fully captured in summary): "{{reflection}}"
            
            Provide a confidence score between 0 and 1. A score of 0.5 is neutral. A score above 0.8 is strongly positive or negative.
            
            Example Negative Input:
            combinedSentimentSummary: "Based on self-reported metrics (Calmness: 3/10, Energy: 2/10, Mood: 1/10, Social Connection: 2/10, Control: 3/10, Dominant Emotion: Sadness) and reflection text, the overall combined sentiment is NEGATIVE with a score of -0.8."
            Reflection Text: "I feel completely lost and hopeless."
            Example Negative Output: { "label": "NEGATIVE", "score": 0.9 }
            
            Example Positive Input:
            combinedSentimentSummary: "Based on self-reported metrics (Calmness: 9/10, Energy: 8/10, Mood: 10/10, Social Connection: 9/10, Control: 9/10, Dominant Emotion: Joy) and reflection text, the overall combined sentiment is POSITIVE with a score of 0.9."
            Reflection Text: "I feel absolutely fantastic and full of joy!"
            Example Positive Output: { "label": "POSITIVE", "score": 0.95 }
        
            Example Neutral Input:
            combinedSentimentSummary: "Based on self-reported metrics (Calmness: 5/10, Energy: 6/10, Mood: 7/10, Social Connection: 5/10, Control: 6/10, Dominant Emotion: Serenity) and reflection text, the overall combined sentiment is NEUTRAL with a score of 0.1."
            Reflection Text: "Just a normal day, nothing special to report."
            Example Neutral Output: { "label": "NEUTRAL", "score": 0.6 }
            
            Respond only with a JSON object in the format: { "label": "[POSITIVE|NEGATIVE|NEUTRAL]", "score": [0-1] }`,    config: {
      temperature: 0.2, // Lower temperature for more deterministic classification
    },
  },
);

const analyzeSentimentFlow = ai.defineFlow(
  {
    name: 'analyzeSentimentFlow',
    inputSchema: AnalyzeSentimentInputSchema,
    outputSchema: AnalyzeSentimentOutputSchema,
  },
  async ({ calm, energy, mood, social, control, emotionType, reflection, questionnaireSentimentSummary }) => {
    try {
      const { output } = await sentimentAnalysisPrompt({
        calm,
        energy,
        mood,
        social,
        control,
        emotionType,
        reflection,
        questionnaireSentimentSummary,
      });
      
      if (!output) {
         console.warn('Sentiment analysis did not return an output.');
         return { label: 'NEUTRAL', score: 0.5 }; // Fallback
      }

      return output;
      
    } catch (error) {
      console.error('Sentiment Analysis Flow Error:', error);
      // Fallback to neutral if the AI call fails
      return { label: 'NEUTRAL', score: 0.5 };
    }
  }
);
