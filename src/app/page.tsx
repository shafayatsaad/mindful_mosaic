
"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import type { MosaicState } from "@/lib/types";
import { DailyTheme } from "@/components/mood/DailyTheme";
import { SongRecommendation } from "@/components/mood/PlaylistRecommendation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Info, Share2 } from "lucide-react";
import { useBackgroundColor } from "@/context/BackgroundColorContext";
import { useMessages } from "@/context/MessageContext";
import { useToast } from "@/hooks/use-toast";
import chroma from "chroma-js";


const EmotionLogger = dynamic(
  () => import("@/components/mood/EmotionLogger"),
  {
    ssr: false,
    loading: () => <Card>
      <CardHeader>
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-full" />
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          <div className="space-y-2">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-5 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-5 w-full" />
          </div>
           <div className="space-y-2">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-5 w-full" />
          </div>
          <Skeleton className="h-11 w-full" />
        </div>
      </CardContent>
    </Card>,
  }
);


const MosaicCanvas = dynamic(
  () => import("@/components/mood/MosaicCanvas"),
  {
    ssr: false,
    loading: () => <Skeleton className="h-[450px] w-full max-w-md rounded-lg" />,
  }
);

export default function Home() {
  const [mosaicState, setMosaicState] = useState<MosaicState | null>(null);
  const [sentimentInsight, setSentimentInsight] = useState<string | null>(null);
  const { setBackgroundColor } = useBackgroundColor();
  const { addMessage } = useMessages();
  const { toast } = useToast();


  const handleGenerate = (state: MosaicState, insight: string) => {
    setMosaicState(state);
    setSentimentInsight(insight);
    if (state.palette && state.palette.length > 0) {
      const baseColor = chroma(state.palette[0]);
      // Generate a very light, desaturated version of the palette's base color for the background
      const newBgColor = baseColor.desaturate(2).brighten(2.5).hex();
      setBackgroundColor(newBgColor);
    } else {
      setBackgroundColor(''); // Reset if no palette
    }
  };

  const handleShareToWall = () => {
    if (mosaicState?.reflection) {
      addMessage({
        text: mosaicState.reflection,
        mosaicState: mosaicState,
      });
      toast({
        title: "Reflection Shared",
        description: "Your message and mosaic have been posted to the community wall.",
      });
    }
  };


  return (
    <div className="flex flex-col gap-8">
      <DailyTheme />
       <Alert className="bg-yellow-100/50 dark:bg-yellow-900/30 border-yellow-200/80 dark:border-yellow-800/60 text-yellow-800 dark:text-yellow-200">
        <Info className="h-4 w-4 !text-yellow-600 dark:!text-yellow-400" />
        <AlertDescription>
          <strong>Safety Note:</strong> This is for self-reflection only, not professional advice. In crisis, please contact a local mental health provider.
        </AlertDescription>
      </Alert>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <EmotionLogger onGenerate={handleGenerate} />
        </div>

        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>Your Emotion Mosaic</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center gap-6">
              {mosaicState ? (
                <>
                  <div id="mosaic-container" className="flex flex-col items-center gap-4">
                    <MosaicCanvas {...mosaicState} />
                  </div>
                  {sentimentInsight && (
                     <p className="text-sm text-muted-foreground italic text-center">{sentimentInsight}</p>
                  )}
                   <Button variant="secondary" onClick={handleShareToWall} className="w-full">
                    <Share2 className="mr-2 h-4 w-4" />
                    Share Reflection to Message Wall
                  </Button>
                  <Separator />
                  <SongRecommendation
                    emotionalTrends={mosaicState.emotionalTrends}
                    dominantEmotion={mosaicState.emotionType}
                  />
                </>
              ) : (
                <div className="flex aspect-square w-full max-w-md flex-col items-center justify-center rounded-lg border-2 border-dashed bg-accent/50 p-8 text-center text-muted-foreground">
                  <p className="font-headline text-lg">Your mosaic will appear here.</p>
                  <p className="text-sm">
                    Answer the questions to generate your unique artwork.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
