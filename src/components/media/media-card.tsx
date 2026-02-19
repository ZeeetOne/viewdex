"use client";

import Image from "next/image";
import { MediaItem } from "@prisma/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { MoreVertical, Plus, Pencil, Trash2, Star, Image as ImageIcon, Loader2 } from "lucide-react";
import {
  getProgressLabel,
  getStatusLabel,
  getMediaTypeLabel,
  calculateProgress,
  isWatchType,
  formatRelativeTime,
} from "@/lib/media-utils";
import { useUpdateProgress, useDeleteMedia } from "@/hooks/use-media";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface MediaCardProps {
  media: MediaItem;
  onEdit?: (media: MediaItem) => void;
}

export function MediaCard({ media, onEdit }: MediaCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const updateProgress = useUpdateProgress();
  const deleteMedia = useDeleteMedia();

  const progressPercent = calculateProgress(media.progress, media.totalUnits);
  const progressLabel = getProgressLabel(media.type);
  const isCompleted = media.status === "COMPLETED";
  const canIncrement =
    !isCompleted && (!media.totalUnits || media.progress < media.totalUnits);

  const handleIncrement = () => {
    if (canIncrement) {
      updateProgress.mutate({
        id: media.id,
        progress: media.progress + 1,
      });
    }
  };

  const handleDelete = () => {
    deleteMedia.mutate(media.id);
    setShowDeleteDialog(false);
  };

  return (
    <>
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="flex gap-3 p-3">
            {/* Image */}
            <div className="relative h-24 w-16 flex-shrink-0 overflow-hidden rounded-md bg-muted">
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
                  <ImageIcon className="h-6 w-6 text-muted-foreground" />
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex flex-1 flex-col justify-between overflow-hidden">
              <div className="space-y-1">
                <h3 className="font-medium leading-tight line-clamp-2">
                  {media.title}
                </h3>
                <div className="flex flex-wrap items-center gap-1.5">
                  <Badge variant="secondary" className="text-xs">
                    {getMediaTypeLabel(media.type)}
                  </Badge>
                  <Badge
                    variant={isCompleted ? "default" : "outline"}
                    className={cn(
                      "text-xs",
                      isCompleted && "bg-green-500 hover:bg-green-500/80"
                    )}
                  >
                    {getStatusLabel(media.status, media.type)}
                  </Badge>
                </div>
              </div>

              {/* Progress */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>
                    {progressLabel} {media.progress}
                    {media.totalUnits ? `/${media.totalUnits}` : ""}
                  </span>
                  {media.rating && (
                    <span className="flex items-center gap-0.5">
                      <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                      {media.rating}/10
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between gap-2">
                  <Progress value={progressPercent} className="h-1.5 flex-1" />
                  <span className="text-[10px] text-muted-foreground shrink-0">
                    {formatRelativeTime(media.updatedAt)}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col items-end justify-between">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                    <span className="sr-only">Open menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onEdit?.(media)}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onClick={() => setShowDeleteDialog(true)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {canIncrement && (
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={handleIncrement}
                  disabled={updateProgress.isPending}
                >
                  {updateProgress.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Plus className="h-4 w-4" />
                  )}
                  <span className="sr-only">
                    Add {isWatchType(media.type) ? "episode" : "chapter"}
                  </span>
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this title?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{media.title}&quot;? This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMedia.isPending}>Cancel</AlertDialogCancel>
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
