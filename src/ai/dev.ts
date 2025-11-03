import { config } from 'dotenv';
config({ path: '.env.local' });

import '@/ai/flows/mood-based-playlist-recommendation.ts';
import '@/ai/flows/questionnaire-to-mosaic.ts';
import '@/ai/flows/analyze-sentiment';
