"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { MediaCard } from "@/components/media/media-card";
import { MediaForm } from "@/components/media/media-form";
import { MediaDetailDialog } from "@/components/media/media-detail-dialog";
import { useMedia } from "@/hooks/use-media";
import { MediaItem } from "@prisma/client";
import { useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function RecentActivity() {
  // Use same query as StatsCards (no filters) to avoid duplicate API calls
  const { data: media, isLoading } = useMedia();
  const [showForm, setShowForm] = useState(false);
  const [editMedia, setEditMedia] = useState<MediaItem | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [detailMedia, setDetailMedia] = useState<MediaItem | null>(null);

  // Sort by updatedAt client-side and take first 6
  const recentMedia = media
    ?.slice()
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 6);

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
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Activity</CardTitle>
          {media && media.length > 6 && (
            <Link
              href="/dashboard/all"
              className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1"
            >
              View all
              <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </CardHeader>
        <CardContent>
          {recentMedia && recentMedia.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {recentMedia.map((item) => (
                <MediaCard key={item.id} media={item} onEdit={handleEdit} onViewDetail={handleViewDetail} />
              ))}
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
