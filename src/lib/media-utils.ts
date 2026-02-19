import { MediaType, TrackStatus } from "@prisma/client";

const WATCH_TYPES: MediaType[] = ["ANIME", "DONGHUA"];
const READ_TYPES: MediaType[] = ["MANGA", "MANHWA"];

export function isWatchType(type: MediaType): boolean {
  return WATCH_TYPES.includes(type);
}

export function isReadType(type: MediaType): boolean {
  return READ_TYPES.includes(type);
}

export function getProgressLabel(type: MediaType): string {
  return isWatchType(type) ? "Episode" : "Chapter";
}

export function getProgressLabelPlural(type: MediaType): string {
  return isWatchType(type) ? "Episodes" : "Chapters";
}

export function getActiveStatus(type: MediaType): TrackStatus {
  if (isWatchType(type)) return "WATCHING";
  if (isReadType(type)) return "READING";
  return "WATCHING"; // Default for OTHER
}

export function getPlanStatus(type: MediaType): TrackStatus {
  if (isWatchType(type)) return "PLAN_TO_WATCH";
  if (isReadType(type)) return "PLAN_TO_READ";
  return "PLAN_TO_CONSUME";
}

export function getStatusLabel(status: TrackStatus, type?: MediaType): string {
  const labels: Record<TrackStatus, string> = {
    WATCHING: "Watching",
    READING: "Reading",
    COMPLETED: "Completed",
    DROPPED: "Dropped",
    ON_HOLD: "On Hold",
    PLAN_TO_WATCH: "Plan to Watch",
    PLAN_TO_READ: "Plan to Read",
    PLAN_TO_CONSUME: type ? (isWatchType(type) ? "Plan to Watch" : "Plan to Read") : "Planned",
  };
  return labels[status];
}

export function getMediaTypeLabel(type: MediaType): string {
  const labels: Record<MediaType, string> = {
    ANIME: "Anime",
    DONGHUA: "Donghua",
    MANGA: "Manga",
    MANHWA: "Manhwa",
    OTHER: "Other",
  };
  return labels[type];
}

export function getStatusOptions(type: MediaType): { value: TrackStatus; label: string }[] {
  if (isWatchType(type)) {
    return [
      { value: "WATCHING", label: "Watching" },
      { value: "COMPLETED", label: "Completed" },
      { value: "ON_HOLD", label: "On Hold" },
      { value: "DROPPED", label: "Dropped" },
      { value: "PLAN_TO_WATCH", label: "Plan to Watch" },
    ];
  }
  if (isReadType(type)) {
    return [
      { value: "READING", label: "Reading" },
      { value: "COMPLETED", label: "Completed" },
      { value: "ON_HOLD", label: "On Hold" },
      { value: "DROPPED", label: "Dropped" },
      { value: "PLAN_TO_READ", label: "Plan to Read" },
    ];
  }
  return [
    { value: "WATCHING", label: "In Progress" },
    { value: "COMPLETED", label: "Completed" },
    { value: "ON_HOLD", label: "On Hold" },
    { value: "DROPPED", label: "Dropped" },
    { value: "PLAN_TO_CONSUME", label: "Planned" },
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
