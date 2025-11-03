
import { z } from "zod";

export const EmotionEnum = z.enum([
  "Joy",
  "Anxiety",
  "Anger",
  "Sadness",
  "Hope",
  "Serenity",
]);

export const QuestionnaireSchema = z.object({
  calm: z.number().min(1).max(10),
  energy: z.number().min(1).max(10),
  mood: z.number().min(1).max(10),
  social: z.number().min(1).max(10),
  control: z.number().min(1).max(10),
  emotionType: EmotionEnum,
  reflection: z.string().min(10, "Please write at least 10 characters for sentiment analysis."),
});

export type QuestionnaireState = z.infer<typeof QuestionnaireSchema>;

export type MosaicState = QuestionnaireState & {
  emotionalTrends: string;
  palette?: string[];
  sentimentScore?: number;
  seed?: number;
};

export type Message = {
  id: number;
  text: string;
  supports: number;
  mosaicState?: MosaicState;
};

export const AnalyzeSentimentInputSchema = z.object({
  reflection: z.string().describe('The user\'s reflection text to be analyzed.'),
  combinedSentimentSummary: z.string().optional().describe('A summary of the sentiment derived from both questionnaire inputs and reflection text.'),
});
export type AnalyzeSentimentInput = z.infer<typeof AnalyzeSentimentInputSchema>;

export const AnalyzeSentimentOutputSchema = z.object({
  label: z.enum(['POSITIVE', 'NEGATIVE', 'NEUTRAL']),
  score: z.number(),
});
export type AnalyzeSentimentOutput = z.infer<typeof AnalyzeSentimentOutputSchema>;

// Types for song recommendation
export const SongSchema = z.object({
  videoId: z.string(),
  title: z.string(),
  author: z.string(),
  thumbnailUrl: z.string().url().optional(),
});
export type Song = z.infer<typeof SongSchema>;

export const MoodBasedSongRecommendationInputSchema = z.object({
  emotionalTrends: z
    .string()
    .describe(
      'A summary of the user\'s emotional trends, including dominant emotions and any notable patterns.'
    ),
  dominantEmotion: EmotionEnum,
});
export type MoodBasedSongRecommendationInput = z.infer<typeof MoodBasedSongRecommendationInputSchema>;

export const MoodBasedSongRecommendationOutputSchema = z.object({
  songs: z.array(SongSchema).describe('A list of recommended songs.'),
});
export type MoodBasedSongRecommendationOutput = z.infer<typeof MoodBasedSongRecommendationOutputSchema>;


// The old AI-based questionnaire types are no longer needed.
export const QuestionnaireToMosaicInputSchema = z.object({});
export type QuestionnaireToMosaicInput = z.infer<typeof QuestionnaireToMosaicInputSchema>;
export const QuestionnaireToMosaicOutputSchema = z.object({});
export type QuestionnaireToMosaicOutput = z.infer<typeof QuestionnaireToMosaicOutputSchema>;
