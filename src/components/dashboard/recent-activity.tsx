"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { MediaCard } from "@/components/media/media-card";
import { MediaForm } from "@/components/media/media-form";
import { MediaDetailDialog } from "@/components/media/media-detail-dialog";
import { useMedia } from "@/hooks/use-media";
import { MediaItem } from "@prisma/client";
import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Search, X } from "lucide-react";

export function RecentActivity() {
  // Use same query as StatsCards (no filters) to avoid duplicate API calls
  const { data: media, isLoading } = useMedia();
  const [showForm, setShowForm] = useState(false);
  const [editMedia, setEditMedia] = useState<MediaItem | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [detailMedia, setDetailMedia] = useState<MediaItem | null>(null);
  const [search, setSearch] = useState("");

  const query = search.trim().toLowerCase();
  const isSearching = query.length > 0;

  // Sort by updatedAt client-side; filter the already-loaded list when searching
  // (no extra API call), otherwise take the first 6
  const sortedMedia = media
    ?.slice()
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  const recentMedia = isSearching
    ? sortedMedia?.filter(
        (item) =>
          item.title.toLowerCase().includes(query) ||
          item.notes?.toLowerCase().includes(query)
      )
    : sortedMedia?.slice(0, 6);

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

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="space-y-4">
          <div className="flex flex-row items-center justify-between">
            <CardTitle>
              {isSearching ? `Search Results (${recentMedia?.length ?? 0})` : "Recent Activity"}
            </CardTitle>
            {!isSearching && media && media.length > 6 && (
              <Link
                href="/dashboard/all"
                className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1"
              >
                View all
                <ArrowRight className="h-4 w-4" />
              </Link>
            )}
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search title or notes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-9"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {recentMedia && recentMedia.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {recentMedia.map((item) => (
                <MediaCard key={item.id} media={item} onEdit={handleEdit} onViewDetail={handleViewDetail} />
              ))}
            </div>
          ) : isSearching ? (
            <div className="py-8 text-center text-muted-foreground">
              <p>No entries match &quot;{search.trim()}&quot;</p>
              <p className="text-sm">Try a different keyword</p>
            </div>
          ) : (
            <div className="py-8 text-center text-muted-foreground">
              <p>No recent activity</p>
              <p className="text-sm">Add your first entry to start tracking!</p>
            </div>
          )}
        </CardContent>
      </Card>

      <MediaForm
        open={showForm}
        onOpenChange={handleCloseForm}
        editMedia={editMedia}
      />

      <MediaDetailDialog
        media={detailMedia}
        open={showDetail}
        onOpenChange={handleCloseDetail}
        onEdit={handleEdit}
      />
    </>
  );
}
