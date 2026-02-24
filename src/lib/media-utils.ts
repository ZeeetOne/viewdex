import { MediaType, MediaCategory, TrackStatus } from "@prisma/client";

// Type to Category mapping
const TYPE_CATEGORY_MAP: Record<MediaType, MediaCategory> = {
  ANIME: "WATCH",
  DONGHUA: "WATCH",
  AENI: "WATCH",
  WESTERN_ANIMATION: "WATCH",
  MANGA: "READ",
  MANHWA: "READ",
  MANHUA: "READ",
  WESTERN_COMIC: "READ",
  OTHER: "WATCH", // Default to WATCH for OTHER
};

// Types by category
export const WATCH_TYPES: MediaType[] = ["ANIME", "DONGHUA", "AENI", "WESTERN_ANIMATION"];
export const READ_TYPES: MediaType[] = ["MANGA", "MANHWA", "MANHUA", "WESTERN_COMIC"];

export function getCategoryFromType(type: MediaType): MediaCategory {
  return TYPE_CATEGORY_MAP[type];
}

export function isWatchType(type: MediaType): boolean {
  return TYPE_CATEGORY_MAP[type] === "WATCH";
}

export function isReadType(type: MediaType): boolean {
  return TYPE_CATEGORY_MAP[type] === "READ";
}

export function isWatchCategory(category: MediaCategory): boolean {
  return category === "WATCH";
}

export function getTypesByCategory(category: MediaCategory): MediaType[] {
  if (category === "WATCH") return WATCH_TYPES;
  if (category === "READ") return READ_TYPES;
  return [...WATCH_TYPES, ...READ_TYPES, "OTHER"];
}

export function getProgressLabel(typeOrCategory: MediaType | MediaCategory): string {
  if (typeOrCategory === "WATCH" || (typeOrCategory !== "READ" && isWatchType(typeOrCategory as MediaType))) {
    return "Episode";
  }
  return "Chapter";
}

export function getProgressLabelPlural(typeOrCategory: MediaType | MediaCategory): string {
  if (typeOrCategory === "WATCH" || (typeOrCategory !== "READ" && isWatchType(typeOrCategory as MediaType))) {
    return "Episodes";
  }
  return "Chapters";
}

export function getStatusLabel(status: TrackStatus, category: MediaCategory): string {
  const labels: Record<TrackStatus, Record<MediaCategory, string>> = {
    IN_PROGRESS: {
      WATCH: "Watching",
      READ: "Reading",
    },
    COMPLETED: {
      WATCH: "Completed",
      READ: "Completed",
    },
    ON_HOLD: {
      WATCH: "On Hold",
      READ: "On Hold",
    },
    DROPPED: {
      WATCH: "Dropped",
      READ: "Dropped",
    },
    PLANNED: {
      WATCH: "Plan to Watch",
      READ: "Plan to Read",
    },
  };
  return labels[status][category];
}

export function getMediaTypeLabel(type: MediaType): string {
  const labels: Record<MediaType, string> = {
    ANIME: "Anime",
    DONGHUA: "Donghua",
    AENI: "Aeni",
    WESTERN_ANIMATION: "Western Animation",
    MANGA: "Manga",
    MANHWA: "Manhwa",
    MANHUA: "Manhua",
    WESTERN_COMIC: "Western Comic",
    OTHER: "Other",
  };
  return labels[type];
}

export function getCategoryLabel(category: MediaCategory): string {
  return category === "WATCH" ? "Watch" : "Read";
}

export function getStatusOptions(category: MediaCategory): { value: TrackStatus; label: string }[] {
  return [
    { value: "IN_PROGRESS", label: category === "WATCH" ? "Watching" : "Reading" },
    { value: "COMPLETED", label: "Completed" },
    { value: "ON_HOLD", label: "On Hold" },
    { value: "DROPPED", label: "Dropped" },
    { value: "PLANNED", label: category === "WATCH" ? "Plan to Watch" : "Plan to Read" },
  ];
}

export function calculateProgress(current: number, total: number | null): number {
  if (!total || total === 0) return 0;
  return Math.min(Math.round((current / total) * 100), 100);
}

export function formatRelativeTime(date: Date | string): string {
  const now = new Date();
  const then = new Date(date);
  const seconds = Math.floor((now.getTime() - then.getTime()) / 1000);

  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  if (seconds < 2592000) return `${Math.floor(seconds / 604800)}w ago`;

  // After ~1 month, show date
  if (then.getFullYear() !== now.getFullYear()) {
    return then.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
  }

  return then.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}
