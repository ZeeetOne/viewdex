"use client";

import Image from "next/image";
import { MediaItem } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Plus,
  Minus,
  Pencil,
  Trash2,
  Star,
  Image as ImageIcon,
  Loader2,
  Calendar,
  Clock,
} from "lucide-react";
import {
  getProgressLabel,
  getStatusLabel,
  getMediaTypeLabel,
  calculateProgress,
  isWatchCategory,
  formatRelativeTime,
} from "@/lib/media-utils";
import { useUpdateProgress, useDeleteMedia, useMediaItem } from "@/hooks/use-media";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface MediaDetailDialogProps {
  media: MediaItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: (media: MediaItem) => void;
}

export function MediaDetailDialog({
  media: initialMedia,
  open,
  onOpenChange,
  onEdit,
}: MediaDetailDialogProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const updateProgress = useUpdateProgress();
  const deleteMedia = useDeleteMedia();

  // Only fetch live data when dialog is open
  const { data: liveMedia } = useMediaItem(open && initialMedia?.id ? initialMedia.id : "");
  const media = liveMedia || initialMedia;

  if (!media) return null;

  const progressPercent = calculateProgress(media.progress, media.totalUnits);
  const progressLabel = getProgressLabel(media.category);
  const unitLabel = isWatchCategory(media.category) ? "episode" : "chapter";
  const isCompleted = media.status === "COMPLETED";
  const canIncrement =
    !isCompleted && (!media.totalUnits || media.progress < media.totalUnits);
  const canDecrement = media.progress > 0;

  const handleIncrement = () => {
    if (canIncrement) {
      updateProgress.mutate({
        id: media.id,
        progress: media.progress + 1,
      });
    }
  };

  const handleDecrement = () => {
    if (canDecrement) {
      updateProgress.mutate({
        id: media.id,
        progress: media.progress - 1,
      });
    }
  };

  const handleDelete = () => {
    deleteMedia.mutate({ id: media.id, title: media.title });
    setShowDeleteDialog(false);
    onOpenChange(false);
  };

  const handleEdit = () => {
    onEdit?.(media);
    onOpenChange(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="pr-8">{media.title}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Image and Badges */}
            <div className="flex gap-4">
              <div className="relative h-40 w-28 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
                {media.imageUrl ? (
                  <Image
                    src={media.imageUrl}
                    alt={media.title}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <ImageIcon className="h-10 w-10 text-muted-foreground" />
                  </div>
                )}
              </div>

              <div className="flex flex-1 flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">
                      {getMediaTypeLabel(media.type)}
                    </Badge>
                    <Badge
                      variant={isCompleted ? "default" : "outline"}
                      className={cn(
                        isCompleted && "bg-green-500 hover:bg-green-500/80"
                      )}
                    >
                      {getStatusLabel(media.status, media.category)}
                    </Badge>
                  </div>

                  {media.rating && (
                    <div className="flex items-center gap-1 text-sm">
                      <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                      <span className="font-medium">{media.rating}/10</span>
                    </div>
                  )}
                </div>

                <div className="space-y-1 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>Added {formatRelativeTime(media.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" />
                    <span>Updated {formatRelativeTime(media.updatedAt)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Progress Section */}
            <div className="space-y-3 rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Progress</span>
                <span className="text-sm text-muted-foreground">
                  {progressLabel} {media.progress}
                  {media.totalUnits ? ` / ${media.totalUnits}` : ""}
                </span>
              </div>

              <Progress value={progressPercent} className="h-2" />

              <div className="flex items-center justify-center gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleDecrement}
                  disabled={!canDecrement || updateProgress.isPending}
                >
                  {updateProgress.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Minus className="h-4 w-4" />
                  )}
                </Button>
                <span className="min-w-[80px] text-center text-lg font-semibold">
                  {media.progress} {unitLabel}
                  {media.progress !== 1 ? "s" : ""}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleIncrement}
                  disabled={!canIncrement || updateProgress.isPending}
                >
                  {updateProgress.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Plus className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            {/* Notes */}
            {media.notes && (
              <div className="space-y-2">
                <span className="text-sm font-medium">Notes</span>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap rounded-lg border p-3">
                  {media.notes}
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              <Button variant="outline" className="flex-1" onClick={handleEdit}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </Button>
              <Button
                variant="outline"
                className="flex-1 text-destructive hover:text-destructive"
                onClick={() => setShowDeleteDialog(true)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete &quot;{media.title}&quot;?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{media.title}&quot;? This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMedia.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteMedia.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMedia.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
