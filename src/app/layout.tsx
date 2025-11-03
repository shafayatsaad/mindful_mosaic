
import type { Metadata } from "next";
import { Toaster } from "@/components/ui/toaster";
import AppLayout from "@/components/layout/AppLayout";
import { BackgroundColorProvider } from "@/context/BackgroundColorContext";
import { MessageProvider } from "@/context/MessageContext";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mindful Mosaic",
  description: "Transform your emotions into beautiful, abstract generative art.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Literata:opsz,wght@7..72,400;7..72,700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased">
        <BackgroundColorProvider>
          <MessageProvider>
            <AppLayout>
              {children}
            </AppLayout>
          </MessageProvider>
        </BackgroundColorProvider>
        <Toaster />
      </body>
    </html>
  );
}
