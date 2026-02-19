"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Home,
  Tv,
  BookOpen,
  Film,
  Library,
  List,
  Clapperboard,
  Globe,
  BookMarked,
  FileText,
} from "lucide-react";

const navItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: Home,
  },
  // Watch types
  {
    title: "Anime",
    href: "/dashboard/anime",
    icon: Tv,
  },
  {
    title: "Donghua",
    href: "/dashboard/donghua",
    icon: Film,
  },
  {
    title: "Aeni",
    href: "/dashboard/aeni",
    icon: Clapperboard,
  },
  {
    title: "Western Animation",
    href: "/dashboard/western-animation",
    icon: Globe,
  },
  // Read types
  {
    title: "Manga",
    href: "/dashboard/manga",
    icon: BookOpen,
  },
  {
    title: "Manhwa",
    href: "/dashboard/manhwa",
    icon: Library,
  },
  {
    title: "Manhua",
    href: "/dashboard/manhua",
    icon: BookMarked,
  },
  {
    title: "Western Comic",
    href: "/dashboard/western-comic",
    icon: FileText,
  },
  {
    title: "All Titles",
    href: "/dashboard/all",
    icon: List,
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex h-full w-64 flex-col border-r bg-background">
      <nav className="flex-1 space-y-1 p-4">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.title}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
