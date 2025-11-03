import { GalleryGrid } from "@/components/gallery/GalleryGrid";

export default function GalleryPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="font-headline text-3xl font-bold tracking-tight">
          Community Gallery
        </h1>
        <p className="text-lg text-muted-foreground">
          Explore a collection of anonymous mosaics, each a unique emotional fingerprint.
        </p>
      </header>
      <GalleryGrid />
    </div>
  );
}
