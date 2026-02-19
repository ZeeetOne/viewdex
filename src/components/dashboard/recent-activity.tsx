"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { MediaCard } from "@/components/media/media-card";
import { MediaForm } from "@/components/media/media-form";
import { useMedia } from "@/hooks/use-media";
import { MediaItem } from "@prisma/client";
import { useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function RecentActivity() {
  const { data: media, isLoading } = useMedia({
    sortBy: "updatedAt",
    sortOrder: "desc",
  });
  const [showForm, setShowForm] = useState(false);
  const [editMedia, setEditMedia] = useState<MediaItem | null>(null);

  const recentMedia = media?.slice(0, 6);

  const handleEdit = (item: MediaItem) => {
    setEditMedia(item);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditMedia(null);
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
                <MediaCard key={item.id} media={item} onEdit={handleEdit} />
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-muted-foreground">
              <p>No recent activity</p>
              <p className="text-sm">Add some media to get started!</p>
            </div>
          )}
        </CardContent>
      </Card>

      <MediaForm
        open={showForm}
        onOpenChange={handleCloseForm}
        editMedia={editMedia}
      />
    </>
  );
}
