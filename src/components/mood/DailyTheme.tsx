"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const themes = [
  { title: "Hope", description: "What does hope feel like to you today? Let its color fill your mosaic." },
  { title: "Patience", description: "Reflect on a moment of patience. What colors represent this feeling?" },
  { title: "Growth", description: "Consider your personal growth. Visualize it with colors and shapes." },
  { title: "Resilience", description: "Think about your strength. How would you paint your resilience?" },
  { title: "Gratitude", description: "What are you thankful for? Let gratitude color your canvas." },
  { title: "Calm", description: "Find a moment of peace. What shades represent your inner tranquility?" },
  { title: "Courage", description: "Channel your inner bravery. What colors does courage wear?" },
];

export function DailyTheme() {
  const [dailyTheme, setDailyTheme] = useState({ title: '', description: '' });

  useEffect(() => {
    // Select a theme based on the day of the year
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
    setDailyTheme(themes[dayOfYear % themes.length]);
  }, []);

  if (!dailyTheme.title) return null;

  return (
    <Card className="bg-gradient-to-br from-card to-accent/50">
      <CardHeader>
        <CardTitle className="font-headline text-2xl tracking-wide">
          Today's Theme: {dailyTheme.title}
        </CardTitle>
        <CardDescription className="text-foreground/80 text-base">
          {dailyTheme.description}
        </CardDescription>
      </CardHeader>
    </Card>
  );
}
