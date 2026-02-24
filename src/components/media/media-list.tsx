"use client";

import { useState } from "react";
import { MediaItem, MediaType, MediaCategory, TrackStatus } from "@prisma/client";
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
import { MediaDetailDialog } from "./media-detail-dialog";
import { FAB } from "@/components/layout/fab";
import { useMedia } from "@/hooks/use-media";
import { Search, Plus, ArrowUpDown, BookOpen, Tv } from "lucide-react";

interface MediaListProps {
  type?: MediaType;
  types?: MediaType[];
  category?: MediaCategory;
  title?: string;
}

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

// Status filters with category-aware labels
function getStatusFilters(category?: MediaCategory): { value: TrackStatus | "ALL"; label: string }[] {
  const isWatch = category === "WATCH";
  const isRead = category === "READ";

  return [
    { value: "ALL", label: "All" },
    { value: "IN_PROGRESS", label: isWatch ? "Watching" : isRead ? "Reading" : "In Progress" },
    { value: "COMPLETED", label: "Completed" },
    { value: "ON_HOLD", label: "On Hold" },
    { value: "DROPPED", label: "Dropped" },
    { value: "PLANNED", label: isWatch ? "Plan to Watch" : isRead ? "Plan to Read" : "Planned" },
  ];
}

export function MediaList({ type, types, category, title }: MediaListProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<TrackStatus | "ALL">("ALL");
  const [typeFilter, setTypeFilter] = useState<MediaType | "ALL">("ALL");
  const [sortBy, setSortBy] = useState("updatedAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [showForm, setShowForm] = useState(false);
  const [editMedia, setEditMedia] = useState<MediaItem | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [detailMedia, setDetailMedia] = useState<MediaItem | null>(null);

  // Determine category from props
  const watchTypes = ["ANIME", "DONGHUA", "AENI", "WESTERN_ANIMATION"];
  const readTypes = ["MANGA", "MANHWA", "MANHUA", "WESTERN_COMIC"];

  const effectiveCategory: MediaCategory | undefined =
    category ||
    (type && watchTypes.includes(type) ? "WATCH" : undefined) ||
    (type && readTypes.includes(type) ? "READ" : undefined) ||
    (types && types.every((t) => watchTypes.includes(t)) ? "WATCH" : undefined) ||
    (types && types.every((t) => readTypes.includes(t)) ? "READ" : undefined);

  // Show type filter on pages that show multiple types (not on single-type pages like /anime)
  const showTypeFilter = !type;

  // Filter type options based on the types prop
  const availableTypeFilters = types
    ? TYPE_FILTERS.filter((f) => f.value === "ALL" || types.includes(f.value as MediaType))
    : TYPE_FILTERS;

  // Build filters
  const filters = {
    type: type || (typeFilter !== "ALL" ? typeFilter : undefined),
    category: category,
    status: statusFilter !== "ALL" ? statusFilter : undefined,
    search: search || undefined,
    sortBy,
    sortOrder,
  };

  const { data: allMedia, isLoading } = useMedia(filters);

  // If types array is provided and no specific type filter selected, filter client-side
  const media =
    types && typeFilter === "ALL"
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

  const handleViewDetail = (item: MediaItem) => {
    setDetailMedia(item);
    setShowDetail(true);
  };

  const handleCloseDetail = () => {
    setShowDetail(false);
    setDetailMedia(null);
  };

  const toggleSortOrder = () => {
    setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
  };

  const isWatchSection = effectiveCategory === "WATCH";
  const isReadSection = effectiveCategory === "READ";
  const statusFilters = getStatusFilters(effectiveCategory);

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
          Track New
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
              {statusFilters.map((filter) => (
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
            <MediaCard
              key={item.id}
              media={item}
              onEdit={handleEdit}
              onViewDetail={handleViewDetail}
            />
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
          <h3 className="mt-4 text-lg font-semibold">No entries found</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {search
              ? "Try adjusting your search or filters"
              : "Add your first entry to get started!"}
          </p>
          {!search && (
            <Button onClick={() => setShowForm(true)} className="mt-4">
              <Plus className="mr-2 h-4 w-4" />
              Track New
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
        filterCategory={effectiveCategory}
      />

      {/* Media Detail Dialog */}
      <MediaDetailDialog
        media={detailMedia}
        open={showDetail}
        onOpenChange={handleCloseDetail}
        onEdit={handleEdit}
      />
    </div>
  );
}
