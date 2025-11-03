import { MessageWall } from "@/components/messages/MessageWall";

export default function MessagesPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="font-headline text-3xl font-bold tracking-tight">
          Anonymous Message Wall
        </h1>
        <p className="text-lg text-muted-foreground">
          Share a supportive thought or read messages from the community.
        </p>
      </header>
      <MessageWall />
    </div>
  );
}
