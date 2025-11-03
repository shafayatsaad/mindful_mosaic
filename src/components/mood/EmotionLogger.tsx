"use client";

import * as React from "react";
import type { MosaicState } from "@/lib/types";
import { EmotionQuestionnaire } from "./EmotionQuestionnaire";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface EmotionLoggerProps {
  onGenerate: (state: MosaicState, insight: string) => void;
}

export default function EmotionLogger({ onGenerate }: EmotionLoggerProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Your Mosaic</CardTitle>
        <CardDescription>Answer a few questions to generate a unique piece of art based on your mood.</CardDescription>
      </CardHeader>
      <CardContent>
        <EmotionQuestionnaire onGenerate={onGenerate} />
      </CardContent>
    </Card>
  );
}
