"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { MosaicState } from "@/lib/types";
import { QuestionnaireSchema, type QuestionnaireState } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Wand2, Sparkles } from "lucide-react";
import { analyzeSentiment } from "@/ai/flows/analyze-sentiment";
import { palettes } from "@/lib/palettes";
import chroma from "chroma-js";

interface EmotionQuestionnaireProps {
  onGenerate: (state: MosaicState, insight: string) => void;
}

const emotionOptions = [
  "Joy",
  "Anxiety",
  "Anger",
  "Sadness",
  "Hope",
  "Serenity",
] as const;

// Simple hash function for string
function stringToHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0; // Convert to 32bit integer
  }
  return Math.abs(hash); // Ensure positive
}

// Basic sentiment analysis for reflection text
function getReflectionSentimentScore(text: string): number {
  if (!text) return 0; // Neutral for empty text

  const lowerText = text.toLowerCase();
  let score = 0;

  // Positive keywords
  const positiveWords = ["happy", "joy", "good", "great", "positive", "love", "excited", "hope", "calm", "peace"];
  // Negative keywords
  const negativeWords = ["sad", "lonely", "lost", "bad", "negative", "hate", "anxious", "fear", "stress", "overwhelmed"];

  positiveWords.forEach(word => {
    if (lowerText.includes(word)) score += 1;
  });

  negativeWords.forEach(word => {
    if (lowerText.includes(word)) score -= 1;
  });

  // Normalize score to -1 to 1 range (very basic, can be improved)
  if (score > 0) return Math.min(score, 1);
  if (score < 0) return Math.max(score, -1);
  return 0;
}

export function EmotionQuestionnaire({ onGenerate }: EmotionQuestionnaireProps) {
  const [isPending, startTransition] = React.useTransition();

  const form = useForm<QuestionnaireState>({
    resolver: zodResolver(QuestionnaireSchema),
    defaultValues: {
      calm: 5,
      energy: 5,
      mood: 5,
      social: 5,
      control: 5,
      emotionType: "Hope",
      reflection: "",
    },
  });

  const onSubmit = (data: QuestionnaireState) => {
    startTransition(async () => {
      const { reflection, emotionType, calm, energy, mood, social, control } = data;

      // Calculate questionnaire sentiment summary
      let qSentimentScore = 0;
      let qSentimentCount = 0;
      qSentimentScore += (mood - 5.5) / 4.5; qSentimentCount++;
      qSentimentScore += (calm - 5.5) / 4.5; qSentimentCount++;
      qSentimentScore += (energy - 5.5) / 4.5; qSentimentCount++;
      qSentimentScore += (social - 5.5) / 4.5; qSentimentCount++;
      qSentimentScore += (control - 5.5) / 4.5; qSentimentCount++;
      const avgQSentiment = qSentimentScore / qSentimentCount;

      // Get reflection sentiment score
      const reflectionSentimentScore = getReflectionSentimentScore(reflection);

      // Combine questionnaire and reflection sentiment scores (e.g., equal weighting)
      const combinedSentimentScore = (avgQSentiment + reflectionSentimentScore) / 2;

      let combinedSentimentLabel = "NEUTRAL";
      if (combinedSentimentScore > 0.3) {
        combinedSentimentLabel = "POSITIVE";
      } else if (combinedSentimentScore < -0.3) {
        combinedSentimentLabel = "NEGATIVE";
      }

      const combinedSentimentSummary = `Based on self-reported metrics (Calmness: ${calm}/10, Energy: ${energy}/10, Mood: ${mood}/10, Social Connection: ${social}/10, Control: ${control}/10, Dominant Emotion: ${emotionType}) and reflection text, the overall combined sentiment is ${combinedSentimentLabel} with a score of ${combinedSentimentScore.toFixed(2)}.`;

      const sentiment = await analyzeSentiment({
        reflection: reflection || "",
        combinedSentimentSummary, // Pass the new summary
      });
      let insight: string;

      let basePalette = palettes[emotionType]?.default || palettes.Serenity.default;
      let finalPalette = [...basePalette]; // Start with a copy of the base palette

      // Adjust palette based on sentiment
      if (sentiment.label === "POSITIVE" && sentiment.score > 0.5) {
        // Blend with Joy/Hope for positive sentiment, brighten and saturate
        const positiveBlendPalette = palettes.Joy?.default || palettes.Hope.default || [];
        finalPalette = basePalette.map((color, index) => {
          const blendColor = positiveBlendPalette[index % positiveBlendPalette.length];
          return chroma.mix(color, blendColor, sentiment.score * 0.5, 'rgb').brighten(sentiment.score * 0.7).saturate(sentiment.score * 0.7).hex();
        });
        insight = `Sentiment: Positive (${(sentiment.score * 100).toFixed(1)}%) – Blended with vibrant tones!`;
      } else if (sentiment.label === "NEGATIVE" && sentiment.score > 0.5) {
        // Blend with Anxiety/Sadness for negative sentiment, darken and desaturate
        const negativeBlendPalette = [...(palettes.Anxiety?.default || []), ...(palettes.Sadness?.default || [])];
        finalPalette = basePalette.map((color, index) => {
          const blendColor = negativeBlendPalette[index % negativeBlendPalette.length];
          return chroma.mix(color, blendColor, sentiment.score * 0.8, 'rgb').darken(sentiment.score * 0.7).desaturate(sentiment.score * 0.7).hex();
        });
        insight = `Sentiment: Negative (${(sentiment.score * 100).toFixed(1)}%) – Blended with deeper, muted tones.`;
      } else {
        // For neutral, subtle blend with Serenity or a slightly desaturated version of base
        const neutralBlendPalette = palettes.Serenity?.default || [];
        finalPalette = basePalette.map((color, index) => {
          const blendColor = neutralBlendPalette[index % neutralBlendPalette.length];
          return chroma.mix(color, blendColor, 0.3, 'rgb').desaturate(0.2).hex();
        });
        insight = `Sentiment: Neutral (${(sentiment.score * 100).toFixed(1)}%) – Subtle blend for balance.`;
      }

      const emotionalTrends = `Calmness: ${data.calm}/10, Energy: ${data.energy}/10, Mood: ${data.mood}/10, Connection: ${data.social}/10, Control: ${data.control}/10. Dominant Emotion: ${data.emotionType}. Reflection: ${data.reflection}`;
      const combinedInput = `${reflection}-${emotionType}-${calm}-${energy}-${mood}-${social}-${control}`;
      const seed = stringToHash(combinedInput);
      onGenerate(
        {
          ...data,
          emotionalTrends,
          palette: finalPalette,
          sentimentScore: sentiment.score,
          seed: seed,
        },
        insight
      );
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="calm"
          render={({ field }) => (
            <FormItem>
              <FormLabel>How tense or calm do you feel right now?</FormLabel>
              <FormControl>
                <div className="relative"> {/* Add relative positioning */}
                  <Slider
                    min={1}
                    max={10}
                    step={1}
                    defaultValue={[field.value]}
                    onValueChange={(value) => field.onChange(value[0])}
                  />
                  {/* Neutral indicator */}
                  <div className="absolute left-1/2 top-1/2 h-full w-px -translate-x-1/2 -translate-y-1/2 bg-muted-foreground/50" />
                </div>
              </FormControl>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Very Tense</span>
                <span>Completely Calm</span>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="energy"
          render={({ field }) => (
            <FormItem>
              <FormLabel>How energetic do you feel?</FormLabel>
              <FormControl>
                <div className="relative"> {/* Add relative positioning */}
                  <Slider
                    min={1}
                    max={10}
                    step={1}
                    defaultValue={[field.value]}
                    onValueChange={(value) => field.onChange(value[0])}
                  />
                  {/* Neutral indicator */}
                  <div className="absolute left-1/2 top-1/2 h-full w-px -translate-x-1/2 -translate-y-1/2 bg-muted-foreground/50" />
                </div>
              </FormControl>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Exhausted</span>
                <span>Highly Energetic</span>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="mood"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Overall mood?</FormLabel>
              <FormControl>
                <div className="relative"> {/* Add relative positioning */}
                  <Slider
                    min={1}
                    max={10}
                    step={1}
                    defaultValue={[field.value]}
                    onValueChange={(value) => field.onChange(value[0])}
                  />
                  {/* Neutral indicator */}
                  <div className="absolute left-1/2 top-1/2 h-full w-px -translate-x-1/2 -translate-y-1/2 bg-muted-foreground/50" />
                </div>
              </FormControl>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Very Negative</span>
                <span>Very Positive</span>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="social"
          render={({ field }) => (
            <FormItem>
              <FormLabel>How connected do you feel with others?</FormLabel>
              <FormControl>
                <div className="relative"> {/* Add relative positioning */}
                  <Slider
                    min={1}
                    max={10}
                    step={1}
                    defaultValue={[field.value]}
                    onValueChange={(value) => field.onChange(value[0])}
                  />
                  {/* Neutral indicator */}
                  <div className="absolute left-1/2 top-1/2 h-full w-px -translate-x-1/2 -translate-y-1/2 bg-muted-foreground/50" />
                </div>
              </FormControl>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Isolated</span>
                <span>Deeply Connected</span>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="control"
          render={({ field }) => (
            <FormItem>
              <FormLabel>How overwhelmed or in control do you feel?</FormLabel>
              <FormControl>
                <div className="relative"> {/* Add relative positioning */}
                  <Slider
                    min={1}
                    max={10}
                    step={1}
                    defaultValue={[field.value]}
                    onValueChange={(value) => field.onChange(value[0])}
                  />
                  {/* Neutral indicator */}
                  <div className="absolute left-1/2 top-1/2 h-full w-px -translate-x-1/2 -translate-y-1/2 bg-muted-foreground/50" />
                </div>
              </FormControl>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Overwhelmed</span>
                <span>Fully In Control</span>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="emotionType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Which emotion best describes your day?</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an emotion" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {emotionOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="reflection"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Your reflection (Required)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Share any thoughts or feelings... Your reflection is analyzed for sentiment to adjust the mosaic's colors."
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />


        <Button type="submit" size="lg" className="w-full" disabled={isPending}>
          {isPending ? (
            <Sparkles className="animate-spin" />
          ) : (
            <Wand2 />
          )}
          {isPending ? "Generating..." : "Generate Mosaic"}
        </Button>
      </form>
    </Form>
  );
}