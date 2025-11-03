
"use client";

import dynamic from "next/dynamic";
import { useMessages } from "@/context/MessageContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, MessageSquare } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

const MosaicCanvas = dynamic(
  () => import("@/components/mood/MosaicCanvas"),
  {
    ssr: false,
    loading: () => <Skeleton className="h-full w-full rounded-lg" />,
  }
);


export function MessageWall() {
  const { messages, addSupport } = useMessages();
  const { toast } = useToast();

  const handleReplyClick = () => {
    toast({
      title: "Coming Soon!",
      description: "The ability to reply to messages is on its way.",
    });
  };

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <Card className="bg-transparent border-0 shadow-none">
        <CardContent className="p-0">
          <p className="text-center text-muted-foreground">
            Reflections shared by the community. Add your own from the "My Mosaic" page after generating an artwork.
          </p>
        </CardContent>
      </Card>
      <div className="space-y-4">
        {messages.map((message) => (
          <Card key={message.id} className="bg-card/80 backdrop-blur-sm">
            <CardContent className="p-4 flex gap-4">
               {message.mosaicState && (
                <div className="w-24 h-24 flex-shrink-0">
                   <MosaicCanvas {...message.mosaicState} size={96} />
                </div>
              )}
              <div className="flex-grow">
                <p className="font-body text-base italic text-foreground/90">"{message.text}"</p>
                <div className="mt-4 flex justify-end items-center gap-2">
                   <Button variant="ghost" size="sm" onClick={() => addSupport(message.id)}>
                     <Heart className={`mr-2 h-4 w-4 ${message.supports > 0 ? 'text-red-500 fill-current' : ''}`} />
                     {message.supports}
                   </Button>
                   <Button variant="ghost" size="sm" onClick={handleReplyClick}>
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Reply
                   </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
         {messages.length === 0 && (
          <Card className="flex items-center justify-center h-48 bg-accent/50 border-2 border-dashed">
            <p className="text-muted-foreground">The wall is empty. Be the first to share!</p>
          </Card>
        )}
      </div>
    </div>
  );
}
