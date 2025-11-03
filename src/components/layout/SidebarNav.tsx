"use client";

import React from "react";
import { usePathname } from "next/navigation";
import NextLink from "next/link";
import {
  SidebarContent,
  SidebarGroup,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { LayoutGrid, MessageSquare, Palette } from "lucide-react";

const menuItems = [
  {
    href: "/",
    label: "My Mosaic",
    icon: Palette,
  },
  {
    href: "/gallery",
    label: "Community Gallery",
    icon: LayoutGrid,
  },
  {
    href: "/messages",
    label: "Message Wall",
    icon: MessageSquare,
  },
];

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <SidebarContent>
      <SidebarGroup>
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                isActive={pathname === item.href}
                tooltip={{ children: item.label, side: "right" }}
              >
                <NextLink href={item.href}>
                  <item.icon />
                  <span>{item.label}</span>
                </NextLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroup>
    </SidebarContent>
  );
}
