
"use client";

import React, { useEffect } from "react";
import { usePathname } from 'next/navigation';
import {
  SidebarProvider,
  Sidebar,
  SidebarInset,
  SidebarTrigger,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { SidebarNav } from "./SidebarNav";
import { Paintbrush } from "lucide-react";
import Image from "next/image";
import { useBackgroundColor } from "@/context/BackgroundColorContext";


export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { backgroundColor, setBackgroundColor } = useBackgroundColor();
  const pathname = usePathname();
  
  useEffect(() => {
    const defaultBgColor = ''; // Or get it from a CSS variable if needed

    document.body.style.transition = 'background-color 0.8s ease';
    
    // If we are not on the homepage, always reset the color.
    if (pathname !== '/') {
      if (document.body.style.backgroundColor !== defaultBgColor) {
        document.body.style.backgroundColor = defaultBgColor;
      }
       // Also reset the context state when leaving the homepage
      if (backgroundColor !== '') {
        setBackgroundColor('');
      }
    } else {
       // Only apply color if we are on the homepage
       document.body.style.backgroundColor = backgroundColor;
    }

    // A cleanup function to reset when the component unmounts.
    return () => {
      document.body.style.backgroundColor = defaultBgColor;
      document.body.style.transition = '';
    };
  }, [backgroundColor, pathname, setBackgroundColor]);
  
  return (
    <div>
      <SidebarProvider>
        <Sidebar>
          <SidebarHeader>
            <div className="flex items-center gap-2 p-2">
              <Image src="/icon.png" alt="Mindful Mosaic Logo" width={32} height={32} />
              <h2 className="font-headline text-lg font-semibold tracking-tight">
                Mindful Mosaic
              </h2>
            </div>
          </SidebarHeader>
          <SidebarNav />
        </Sidebar>
        <SidebarInset>
          <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm sm:px-6 md:hidden">
            <SidebarTrigger />
            <div className="flex items-center gap-2">
              <Image src="/icon.png" alt="Mindful Mosaic Logo" width={24} height={24} />
              <h2 className="font-headline text-lg font-semibold tracking-tight">
                Mindful Mosaic
              </h2>
            </div>
          </header>
          <main className="flex-1 p-4 sm:p-6">{children}</main>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
