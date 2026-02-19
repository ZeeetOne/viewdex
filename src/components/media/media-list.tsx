"use client";

import { useState } from "react";
import { MediaItem, MediaType, TrackStatus } from "@prisma/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { MediaCard } from "./media-card";
import { MediaForm } from "./media-form";
import { FAB } from "@/components/layout/fab";
import { useMedia } from "@/hooks/use-media";
import { Search, Plus, ArrowUpDown, BookOpen, Tv } from "lucide-react";

interface MediaListProps {
  type?: MediaType;
  types?: MediaType[];
  title?: string;
}

const STATUS_FILTERS: { value: TrackStatus | "ALL"; label: string }[] = [
  { value: "ALL", label: "All" },
  { value: "WATCHING", label: "Watching" },
  { value: "READING", label: "Reading" },
  { value: "COMPLETED", label: "Completed" },
  { value: "ON_HOLD", label: "On Hold" },
  { value: "DROPPED", label: "Dropped" },
  { value: "PLAN_TO_WATCH", label: "Plan to Watch" },
  { value: "PLAN_TO_READ", label: "Plan to Read" },
];

const SORT_OPTIONS = [
  { value: "updatedAt", label: "Recently Updated" },
  { value: "createdAt", label: "Date Added" },
  { value: "title", label: "Title" },
  { value: "rating", label: "Rating" },
  { value: "progress", label: "Progress" },
];

const TYPE_FILTERS: { value: MediaType | "ALL"; label: string }[] = [
  { value: "ALL", label: "All Types" },
  { value: "ANIME", label: "Anime" },
  { value: "DONGHUA", label: "Donghua" },
  { value: "AENI", label: "Aeni" },
  { value: "WESTERN_ANIMATION", label: "Western Animation" },
  { value: "MANGA", label: "Manga" },
  { value: "MANHWA", label: "Manhwa" },
  { value: "MANHUA", label: "Manhua" },
  { value: "WESTERN_COMIC", label: "Western Comic" },
];

export function MediaList({ type, types, title }: MediaListProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<TrackStatus | "ALL">("ALL");
  const [typeFilter, setTypeFilter] = useState<MediaType | "ALL">("ALL");
  const [sortBy, setSortBy] = useState("updatedAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [showForm, setShowForm] = useState(false);
  const [editMedia, setEditMedia] = useState<MediaItem | null>(null);

  // Show type filter on pages that show multiple types (not on single-type pages like /anime)
  const showTypeFilter = !type;

  // Filter type options based on the types prop
  const availableTypeFilters = types
    ? TYPE_FILTERS.filter((f) => f.value === "ALL" || types.includes(f.value as MediaType))
    : TYPE_FILTERS;

  // Build filters
  const filters = {
    type: type || (typeFilter !== "ALL" ? typeFilter : undefined),
    status: statusFilter !== "ALL" ? statusFilter : undefined,
    search: search || undefined,
    sortBy,
    sortOrder,
  };

  const { data: allMedia, isLoading } = useMedia(filters);

  // If types array is provided and no specific type filter selected, filter client-side
  const media = types && typeFilter === "ALL"
    ? allMedia?.filter((m) => types.includes(m.type))
    : allMedia;

  const handleEdit = (item: MediaItem) => {
    setEditMedia(item);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditMedia(null);
  };

  const toggleSortOrder = () => {
    setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
  };

  // Get relevant status filters based on type(s)
  const watchTypes = ["ANIME", "DONGHUA", "AENI", "WESTERN_ANIMATION"];
  const readTypes = ["MANGA", "MANHWA", "MANHUA", "WESTERN_COMIC"];
  const isWatchSection = (type && watchTypes.includes(type)) ||
    (types && types.every(t => watchTypes.includes(t)));
  const isReadSection = (type && readTypes.includes(type)) ||
    (types && types.every(t => readTypes.includes(t)));

  const relevantFilters = STATUS_FILTERS.filter((f) => {
    if (f.value === "ALL") return true;
    if (isWatchSection) {
      return !["READING", "PLAN_TO_READ"].includes(f.value);
    }
    if (isReadSection) {
      return !["WATCHING", "PLAN_TO_WATCH"].includes(f.value);
    }
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">{title || "My List"}</h1>
          <p className="text-sm text-muted-foreground">
            {media?.length || 0} items
          </p>
        </div>
        <Button
          onClick={() => setShowForm(true)}
          className="hidden sm:inline-flex"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Title
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Status, Type, and Sort */}
        <div className="flex flex-wrap gap-3">
          <Select
            value={statusFilter}
            onValueChange={(v) => setStatusFilter(v as TrackStatus | "ALL")}
          >
            <SelectTrigger className="w-[140px] md:w-[160px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              {relevantFilters.map((filter) => (
                <SelectItem key={filter.value} value={filter.value}>
                  {filter.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {showTypeFilter && (
            <Select
              value={typeFilter}
              onValueChange={(v) => setTypeFilter(v as MediaType | "ALL")}
            >
              <SelectTrigger className="w-[140px] md:w-[160px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                {availableTypeFilters.map((filter) => (
                  <SelectItem key={filter.value} value={filter.value}>
                    {filter.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[140px] md:w-[160px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button variant="outline" size="icon" onClick={toggleSortOrder}>
            <ArrowUpDown
              className={`h-4 w-4 transition-transform ${
                sortOrder === "asc" ? "rotate-180" : ""
              }`}
            />
          </Button>
        </div>
      </div>

      {/* Media Grid */}
      {isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      ) : media && media.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {media.map((item) => (
            <MediaCard key={item.id} media={item} onEdit={handleEdit} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          {isWatchSection ? (
            <Tv className="h-12 w-12 text-muted-foreground/50" />
          ) : isReadSection ? (
            <BookOpen className="h-12 w-12 text-muted-foreground/50" />
          ) : (
            <BookOpen className="h-12 w-12 text-muted-foreground/50" />
          )}
          <h3 className="mt-4 text-lg font-semibold">No titles found</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {search
              ? "Try adjusting your search or filters"
              : "Add your first title to get started!"}
          </p>
          {!search && (
            <Button onClick={() => setShowForm(true)} className="mt-4">
              <Plus className="mr-2 h-4 w-4" />
              Add Title
            </Button>
          )}
        </div>
      )}

      {/* FAB for mobile */}
      <FAB onClick={() => setShowForm(true)} />

      {/* Media Form Dialog */}
      <MediaForm
        open={showForm}
        onOpenChange={handleCloseForm}
        editMedia={editMedia}
      />
    </div>
  );
}
