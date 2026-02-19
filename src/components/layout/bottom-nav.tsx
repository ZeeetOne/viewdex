"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Home, Tv, BookOpen, Settings } from "lucide-react";

const navItems = [
  {
    title: "Home",
    href: "/dashboard",
    icon: Home,
  },
  {
    title: "Watch",
    href: "/dashboard/watch",
    icon: Tv,
    matchPaths: ["/dashboard/watch", "/dashboard/anime", "/dashboard/donghua"],
  },
  {
    title: "Read",
    href: "/dashboard/read",
    icon: BookOpen,
    matchPaths: ["/dashboard/read", "/dashboard/manga", "/dashboard/manhwa"],
  },
  {
    title: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
  },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background md:hidden">
      <div className="flex h-16 items-center justify-around px-4 pb-safe">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.matchPaths &&
              item.matchPaths.some((path) => pathname.startsWith(path)));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 px-3 py-2 text-xs font-medium transition-colors",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.title}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
