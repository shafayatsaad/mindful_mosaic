import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function GalleryGrid() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {PlaceHolderImages.map((image) => (
        <Card key={image.id} className="overflow-hidden transition-transform duration-300 hover:scale-105 hover:shadow-xl">
          <CardContent className="p-0">
            <div className="relative aspect-video">
              <Image
                src={image.imageUrl}
                alt={image.description}
                fill
                className="object-cover"
                data-ai-hint={image.imageHint}
              />
            </div>
          </CardContent>
          <CardFooter className="p-4">
            <CardDescription>{image.description}</CardDescription>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
