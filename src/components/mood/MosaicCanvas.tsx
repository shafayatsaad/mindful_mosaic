
"use client";

import React, { useRef, useEffect } from "react";
import p5 from "p5";
import chroma from "chroma-js";
import { Delaunay } from "d3-delaunay";
import type { MosaicState } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Download, Twitter, Facebook } from "lucide-react";

import { palettes } from "@/lib/palettes";

const MosaicCanvas = (props: MosaicState & { size?: number }) => {
  const { calm, energy, mood, social, control, emotionType, palette: customPalette, sentimentScore, seed, size } = props;
  const sketchRef = useRef<HTMLDivElement>(null);
  const p5Instance = useRef<p5 | null>(null);

  useEffect(() => {
    if (!sketchRef.current || typeof window === 'undefined') return;

    const sketch = (p: p5) => {
      let canvas: p5.Renderer;
      let voronoi: d3.Voronoi<[number, number]>;
      let palette: string[];

      p.setup = () => {
        const canvasSize = size || Math.min(p.windowWidth * 0.8, 450);
        canvas = p.createCanvas(canvasSize, canvasSize);
        canvas.parent(sketchRef.current!);
        p5Instance.current = p;
        p.randomSeed(seed);
        p.noiseSeed(seed);

        const tileCount = p.floor(p.map(control, 1, 10, 80, 250));
        const clusterSize = p.map(social, 1, 10, 8, 60);
        
        const base = customPalette || palettes[emotionType]?.default || palettes['Serenity'].default;
        
        const sentimentBrightness = p.map(sentimentScore || 0.5, 0, 1, 0.8, 1.2);
        const sentimentSaturation = p.map(sentimentScore || 0.5, 0, 1, 0.7, 1.3);

        palette = chroma.scale(base).mode('lab').colors(tileCount).map(c => 
          chroma(c).brighten(sentimentBrightness - 1).saturate(sentimentSaturation - 1).hex()
        );


        const points: [number, number][] = [];
        for (let i = 0; i < tileCount; i++) {
          const cx = p.random(p.width);
          const cy = p.random(p.height);
          const centreX = cx + p.random(-clusterSize, clusterSize);
          const centreY = cy + p.random(-clusterSize, clusterSize);
          points.push([centreX, centreY]);
        }

        const delaunay = Delaunay.from(points);
        voronoi = delaunay.voronoi([0, 0, p.width, p.height]);

        p.noLoop();
        p.draw();
      };

      p.draw = () => {
        if (!voronoi) return;
        
        const noiseScale = p.map(calm, 1, 10, 0.012, 0.004);
        const hueShift = p.map(mood, 1, 10, -45, 45);

        drawMosaic(voronoi, noiseScale, hueShift, palette, p);
      };

      const drawMosaic = (
        voronoi: d3.Voronoi<[number, number]>,
        noiseScale: number,
        hueShift: number,
        palette: string[],
        p: p5
      ) => {
        p.background(250);

        const cells = voronoi.cellPolygons();
        for (const cell of cells) {
          if (!cell) continue;
          const cx = cell.reduce((a, b) => a + b[0], 0) / cell.length;
          const cy = cell.reduce((a, b) => a + b[1], 0) / cell.length;
          const n = p.noise(cx * noiseScale, cy * noiseScale);
          const idx = p.floor((n + hueShift / 360) * palette.length) % palette.length;
          const col = chroma(palette[idx]);

          const baseAlpha = p.map(calm, 1, 10, 180, 255);
          p.fill(col.alpha(baseAlpha / 255).css());
          
          p.push();
          p.drawingContext.shadowBlur = p.map(energy, 1, 10, 8, 25);
          p.drawingContext.shadowColor = col.brighten(1.5).css();
          p.noStroke();
          p.beginShape();
          cell.forEach(pt => p.vertex(pt[0], pt[1]));
          p.endShape(p.CLOSE);
          p.pop();

          if (calm < 5) {
            const grain = p.map(calm, 1, 10, 30, 5);
            p.stroke(col.darken(0.6).alpha(0.1).css());
            for (let i = 0; i < 60; i++) {
              const px = cx + p.random(-grain, grain);
              const py = cy + p.random(-grain, grain);
              if (voronoi.contains(i, px, py)) {
                 p.point(px, py);
              }
            }
          }
        }
      };
    };

    const instance = new p5(sketch);
    return () => {
      instance.remove();
      p5Instance.current = null;
    };
  }, [calm, energy, mood, social, control, emotionType, customPalette, sentimentScore, seed, size]);

  const handleDownload = () => {
    if (p5Instance.current) {
      p5Instance.current.saveCanvas('emotion-mosaic', 'png');
    }
  };


  const handleShare = async (platform: 'twitter' | 'facebook') => {
    const text = "I created this unique piece of generative art based on my emotions with Mindful Mosaic. Check it out and create your own! #MindfulMosaic #GenerativeArt #EmotionalWellness #MentalHealthArt";
    const url = window.location.href;

    if (platform === 'twitter') {
      // Twitter does not support sharing images directly via URL parameters anymore.
      // The best we can do is share the text and a link to the app.
      // Users can download the image and attach it manually.
      const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
      window.open(twitterUrl, '_blank');
      return;
    }

    if (platform === 'facebook') {
      // Facebook also requires a URL to be shared, which it will then scrape for an image.
      // Since we don't have unique pages for each mosaic, we share the app link and quote.
      const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`;
      window.open(facebookUrl, '_blank');
      return;
    }
  };


  return (
    <div className="flex flex-col items-center gap-4">
      <div
        ref={sketchRef}
        className="w-full max-w-md aspect-square rounded-lg overflow-hidden shadow-lg mx-auto"
        aria-label="Generated emotion mosaic"
      />
      {!size && (<div className="flex gap-2">
        <Button onClick={handleDownload} variant="outline">
          <Download className="mr-2" />
          Download
        </Button>
         <Button onClick={() => handleShare('twitter')} variant="outline" size="icon" aria-label="Share on Twitter">
          <Twitter />
        </Button>
         <Button onClick={() => handleShare('facebook')} variant="outline" size="icon" aria-label="Share on Facebook">
          <Facebook />
        </Button>
      </div>)}
    </div>
  );
};

export default MosaicCanvas;
