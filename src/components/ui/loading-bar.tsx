"use client";

import { useIsMutating } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export function LoadingBar() {
  const isMutating = useIsMutating();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isNavigating, setIsNavigating] = useState(false);

  useEffect(() => {
    // Show loading bar briefly when route changes
    setIsNavigating(true);
    const timeout = setTimeout(() => setIsNavigating(false), 500);
    return () => clearTimeout(timeout);
  }, [pathname, searchParams]);

  const isLoading = isMutating > 0 || isNavigating;

  if (!isLoading) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] h-1.5 bg-primary/30 overflow-hidden">
      <div
        className="h-full bg-primary"
        style={{
          width: '40%',
          animation: 'loading-slide 1s ease-in-out infinite',
        }}
      />
    </div>
  );
}
