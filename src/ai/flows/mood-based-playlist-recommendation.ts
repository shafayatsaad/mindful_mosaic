'use server';

/**
 * @fileOverview A flow to recommend YouTube songs/sounds based on emotional trends.
 *
 * - getMoodBasedSongRecommendation - A function that handles the song/sound recommendation process.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import {
  MoodBasedSongRecommendationInput,
  MoodBasedSongRecommendationInputSchema,
  MoodBasedSongRecommendationOutput,
  MoodBasedSongRecommendationOutputSchema,
  SongSchema
} from '@/lib/types';

const INVIDIOUS_API = 'https://invidious.fdn.fr/api/v1';

const moodQueries = {
  POSITIVE: 'happy uplifting songs',
  NEGATIVE: 'calm sad piano music',
  NEUTRAL: 'lofi chill beats',
  Joy: 'happy uplifting songs',
  Anxiety: 'calming ambient music',
  Sadness: 'calm sad piano music',
  Anger: 'powerful epic music',
  Hope: 'upbeat instrumental music',
  Serenity: 'meditation music',
};

const getYouTubeSongsTool = ai.defineTool(
  {
    name: 'getYouTubeSongs',
    description: 'Gets a list of YouTube songs based on a mood query.',
    inputSchema: z.object({
      query: z.string().describe('The search query for songs.'),
    }),
    outputSchema: z.array(SongSchema),
  },
  async ({ query }) => {
    try {
      const res = await fetch(
        `${INVIDIOUS_API}/search?q=${encodeURIComponent(
          query
        )}&type=video&features=music&sort_by=relevance`
      );
      if (!res.ok) {
        console.error('Invidious API error:', res.statusText);
        return [];
      }
      const songs = await res.json();
      return songs.slice(0, 3).map((song: any) => ({
        videoId: song.videoId,
        title: song.title,
        author: song.author,
        thumbnailUrl: song.videoThumbnails?.find((t: any) => t.quality === 'medium')?.url || '',
      }));
    } catch (err: any) {
      console.error('Failed to fetch from Invidious API:', err.message);
      // Fallback to a predefined list of songs if the API call fails
      return [
        {
          videoId: 'jfKfPfyJRdk',
          title: 'lofi hip hop radio - beats to relax/study to',
          author: 'Lofi Girl',
          thumbnailUrl: 'https://i.ytimg.com/vi/jfKfPfyJRdk/mqdefault.jpg',
        },
        {
          videoId: '5qap5aO4i9A',
          title: 'Relaxing Jazz Music - Background Chill Out Music - Music For Relax, Study, Work',
          author: 'Relax Music',
          thumbnailUrl: 'https://i.ytimg.com/vi/5qap5aO4i9A/mqdefault.jpg',
        },
        {
          videoId: 'DWcJFNfaw9c',
          title: 'Deep Focus Music To Improve Concentration - 12 Hours of Ambient Study Music to Concentrate',
          author: 'Greenred Productions - Relaxing Music',
          thumbnailUrl: 'https://i.ytimg.com/vi/DWcJFNfaw9c/mqdefault.jpg',
        },
      ];
    }
  }
);

const moodBasedSongRecommendationPrompt = ai.definePrompt({
  name: 'moodBasedSongRecommendationPrompt',
  input: { schema: MoodBasedSongRecommendationInputSchema },
  output: { schema: MoodBasedSongRecommendationOutputSchema },
  tools: [getYouTubeSongsTool],
  prompt: ({
    dominantEmotion
  }) => {
    const moodOptions = Object.entries(moodQueries)
      .map(([emotion, query]) => `- ${emotion}: '${query}'`)
      .join('\n       ');

    return `
    You are a music recommendation assistant. Your task is to help the user find music that matches their mood.
    The user has provided their dominant emotion: ${dominantEmotion}.
    
    1. Determine the best search query based on the user's dominant emotion from the following options:
       ${moodOptions}
       - If the emotion doesn't match, use 'lofi chill beats'.

    2. Use the getYouTubeSongsTool with the selected query to find relevant songs.

    3. Return the list of songs you found.
  `;
  },
});

const moodBasedSongRecommendationFlow = ai.defineFlow(
  {
    name: 'moodBasedSongRecommendationFlow',
    inputSchema: MoodBasedSongRecommendationInputSchema,
    outputSchema: MoodBasedSongRecommendationOutputSchema,
  },
  async (input) => {
    const { output } = await moodBasedSongRecommendationPrompt(input);
    
    if (!output?.songs) {
      // Fallback or retry logic if tool doesn't return songs.
      // For now, we'll try a neutral query directly.
      const songs = await getYouTubeSongsTool({ query: moodQueries.NEUTRAL });
      return { songs };
    }
    
    return output;
  }
);

export async function getMoodBasedSongRecommendation(
  input: MoodBasedSongRecommendationInput
): Promise<MoodBasedSongRecommendationOutput> {
  return moodBasedSongRecommendationFlow(input);
}
