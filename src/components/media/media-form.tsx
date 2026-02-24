"use client";

import { useState, useMemo } from "react";
import { MediaItem, MediaType, MediaCategory, TrackStatus } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateMedia, useUpdateMedia } from "@/hooks/use-media";
import {
  getMediaTypeLabel,
  getStatusOptions,
  getCategoryFromType,
  getTypesByCategory,
  isWatchCategory,
  WATCH_TYPES,
  READ_TYPES,
} from "@/lib/media-utils";
import { CreateMediaInput } from "@/lib/validations";
import { Loader2 } from "lucide-react";

interface MediaFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editMedia?: MediaItem | null;
  filterCategory?: MediaCategory; // Optional: filter types by category
}

const ALL_MEDIA_TYPES: MediaType[] = [
  "ANIME",
  "DONGHUA",
  "AENI",
  "WESTERN_ANIMATION",
  "MANGA",
  "MANHWA",
  "MANHUA",
  "WESTERN_COMIC",
  "OTHER",
];

function getInitialFormData(editMedia?: MediaItem | null, filterCategory?: MediaCategory): CreateMediaInput {
  if (editMedia) {
    return {
      title: editMedia.title,
      type: editMedia.type,
      category: editMedia.category,
      imageUrl: editMedia.imageUrl || "",
      totalUnits: editMedia.totalUnits,
      status: editMedia.status,
      progress: editMedia.progress,
      rating: editMedia.rating,
      notes: editMedia.notes || "",
    };
  }

  // Default type based on filter category
  const defaultType: MediaType = filterCategory === "READ" ? "MANGA" : "ANIME";
  const defaultCategory: MediaCategory = filterCategory || getCategoryFromType(defaultType);

  return {
    title: "",
    type: defaultType,
    category: defaultCategory,
    imageUrl: "",
    totalUnits: null,
    status: "PLANNED",
    progress: 0,
    rating: null,
    notes: "",
  };
}

function MediaFormContent({
  editMedia,
  onOpenChange,
  filterCategory,
}: Omit<MediaFormProps, "open">) {
  const createMedia = useCreateMedia();
  const updateMedia = useUpdateMedia();
  const isEditing = !!editMedia;

  const [formData, setFormData] = useState<CreateMediaInput>(() =>
    getInitialFormData(editMedia, filterCategory)
  );

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Get available types based on filter
  const availableTypes = useMemo(() => {
    if (filterCategory) {
      return getTypesByCategory(filterCategory);
    }
    return ALL_MEDIA_TYPES;
  }, [filterCategory]);

  const handleTypeChange = (value: MediaType) => {
    const newCategory = getCategoryFromType(value);
    setFormData((prev) => ({
      ...prev,
      type: value,
      category: newCategory,
      // Reset status to PLANNED when category changes (only for new media)
      status: isEditing ? prev.status : "PLANNED",
    }));
  };

  const statusOptions = useMemo(
    () => getStatusOptions(formData.category),
    [formData.category]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Basic validation
    if (!formData.title.trim()) {
      setErrors({ title: "Title is required" });
      return;
    }

    try {
      if (isEditing) {
        await updateMedia.mutateAsync({
          id: editMedia.id,
          data: formData,
        });
      } else {
        await createMedia.mutateAsync(formData);
      }
      onOpenChange(false);
    } catch {
      // Error is handled by the mutation
    }
  };

  const isLoading = createMedia.isPending || updateMedia.isPending;
  const isWatch = isWatchCategory(formData.category);

  return (
    <form onSubmit={handleSubmit}>
      <DialogHeader>
        <DialogTitle>
          {isEditing ? "Edit Entry" : "Track New Entry"}
        </DialogTitle>
        <DialogDescription>
          {isEditing
            ? "Update the details of this entry."
            : "Add a new anime, manga, or comic to track."}
        </DialogDescription>
      </DialogHeader>

      <div className="grid gap-4 py-4">
        {/* Title */}
        <div className="grid gap-2">
          <Label htmlFor="title">Title *</Label>
          <Input
            id="title"
            placeholder="Enter title"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            disabled={isLoading}
          />
          {errors.title && (
            <p className="text-sm text-destructive">{errors.title}</p>
          )}
        </div>

        {/* Type and Status */}
        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="type">Type</Label>
            <Select
              value={formData.type}
              onValueChange={handleTypeChange}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {availableTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {getMediaTypeLabel(type)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value: TrackStatus) =>
                setFormData({ ...formData, status: value })
              }
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Progress and Total */}
        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="progress">
              {isWatch ? "Episodes" : "Chapters"} Watched/Read
            </Label>
            <Input
              id="progress"
              type="number"
              min={0}
              value={formData.progress}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  progress: parseInt(e.target.value) || 0,
                })
              }
              disabled={isLoading}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="totalUnits">
              Total {isWatch ? "Episodes" : "Chapters"}
            </Label>
            <Input
              id="totalUnits"
              type="number"
              min={1}
              placeholder="Unknown"
              value={formData.totalUnits ?? ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  totalUnits: e.target.value
                    ? parseInt(e.target.value)
                    : null,
                })
              }
              disabled={isLoading}
            />
          </div>
        </div>

        {/* Rating */}
        <div className="grid gap-2">
          <Label htmlFor="rating">Rating (1-10)</Label>
          <Input
            id="rating"
            type="number"
            min={1}
            max={10}
            placeholder="Not rated"
            value={formData.rating ?? ""}
            onChange={(e) =>
              setFormData({
                ...formData,
                rating: e.target.value ? parseInt(e.target.value) : null,
              })
            }
            disabled={isLoading}
          />
        </div>

        {/* Image URL */}
        <div className="grid gap-2">
          <Label htmlFor="imageUrl">Cover Image URL</Label>
          <Input
            id="imageUrl"
            type="url"
            placeholder="https://..."
            value={formData.imageUrl || ""}
            onChange={(e) =>
              setFormData({ ...formData, imageUrl: e.target.value })
            }
            disabled={isLoading}
          />
        </div>

        {/* Notes */}
        <div className="grid gap-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            placeholder="Add your notes..."
            value={formData.notes || ""}
            onChange={(e) =>
              setFormData({ ...formData, notes: e.target.value })
            }
            disabled={isLoading}
            rows={3}
          />
        </div>
      </div>

      <DialogFooter>
        <Button
          type="button"
          variant="outline"
          onClick={() => onOpenChange(false)}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : isEditing ? (
            "Save Changes"
          ) : (
            "Add"
          )}
        </Button>
      </DialogFooter>
    </form>
  );
}

export function MediaForm({ open, onOpenChange, editMedia, filterCategory }: MediaFormProps) {
  // Use key to reset form state when editMedia changes or dialog opens
  const formKey = editMedia?.id ?? "new";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[425px]">
        <MediaFormContent
          key={`${formKey}-${open}-${filterCategory}`}
          editMedia={editMedia}
          onOpenChange={onOpenChange}
          filterCategory={filterCategory}
        />
      </DialogContent>
    </Dialog>
  );
}
