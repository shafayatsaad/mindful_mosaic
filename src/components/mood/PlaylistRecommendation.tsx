"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import type { Song, EmotionEnum } from "@/lib/types";
import { getMoodBasedSongRecommendation } from "@/ai/flows/mood-based-playlist-recommendation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Youtube } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "../ui/skeleton";

interface SongRecommendationProps {
  emotionalTrends: string;
  dominantEmotion: EmotionEnum;
}

export function SongRecommendation({ emotionalTrends, dominantEmotion }: SongRecommendationProps) {
  const [isPending, startTransition] = useTransition();
  const [recommendations, setRecommendations] = useState<Song[]>([]);
  const { toast } = useToast();

  const handleGetRecommendation = () => {
    startTransition(async () => {
      try {
        const result = await getMoodBasedSongRecommendation({ emotionalTrends, dominantEmotion });
        setRecommendations(result.songs);
      } catch (error) {
        console.error("Failed to get song recommendation:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Could not fetch song recommendations. Please try again.",
        });
      }
    });
  };

  return (
    <div className="w-full">
      {recommendations.length > 0 ? (
        <Card className="bg-accent/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Youtube />
              Mood-Based Sounds
            </CardTitle>
            <CardDescription>A few YouTube sound suggestions to match your current vibe.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {recommendations.map((song) => (
              <a
                key={song.videoId}
                href={`https://youtube.com/watch?v=${song.videoId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 rounded-lg p-2 transition-colors hover:bg-accent"
              >
                {song.thumbnailUrl && (
                  <Image
                    src={song.thumbnailUrl}
                    alt={`Thumbnail for ${song.title}`}
                    width={120}
                    height={68}
                    className="rounded-md object-cover"
                  />
                )}
                <div>
                  <p className="font-semibold text-primary">{song.title}</p>
                  <p className="text-sm text-muted-foreground">{song.author}</p>
                </div>
              </a>
            ))}
          </CardContent>
        </Card>
      ) : (
         isPending ? (
            <div className="w-full space-y-4">
                 <Skeleton className="h-8 w-48" />
                 <Skeleton className="h-4 w-full" />
                <div className="flex items-center gap-4 p-2">
                    <Skeleton className="h-[68px] w-[120px] rounded-md" />
                    <div className="flex-1 space-y-2">
                        <Skeleton className="h-5 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                    </div>
                </div>
                 <div className="flex items-center gap-4 p-2">
                    <Skeleton className="h-[68px] w-[120px] rounded-md" />
                    <div className="flex-1 space-y-2">
                        <Skeleton className="h-5 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                    </div>
                </div>
            </div>
         ) : (
            <Button
            onClick={handleGetRecommendation}
            disabled={isPending}
            className="w-full"
            variant="secondary"
            >
            <Sparkles className="mr-2 h-4 w-4" />
            Get Sound Recommendations
            </Button>
         )
      )}
    </div>
  );
}
