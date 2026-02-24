"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MediaItem, MediaType, MediaCategory, TrackStatus } from "@prisma/client";
import { toast } from "sonner";
import { CreateMediaInput, UpdateMediaInput } from "@/lib/validations";

interface MediaFilters {
  type?: MediaType;
  category?: MediaCategory;
  status?: TrackStatus;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export function useMedia(filters?: MediaFilters) {
  const queryParams = new URLSearchParams();

  if (filters?.type) queryParams.set("type", filters.type);
  if (filters?.category) queryParams.set("category", filters.category);
  if (filters?.status) queryParams.set("status", filters.status);
  if (filters?.search) queryParams.set("search", filters.search);
  if (filters?.sortBy) queryParams.set("sortBy", filters.sortBy);
  if (filters?.sortOrder) queryParams.set("sortOrder", filters.sortOrder);

  const queryString = queryParams.toString();
  const url = `/api/media${queryString ? `?${queryString}` : ""}`;

  return useQuery({
    queryKey: ["media", filters],
    queryFn: async (): Promise<MediaItem[]> => {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Failed to fetch media");
      }
      return response.json();
    },
  });
}

export function useMediaItem(id: string) {
  return useQuery({
    queryKey: ["media", id],
    queryFn: async (): Promise<MediaItem> => {
      const response = await fetch(`/api/media/${id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch media");
      }
      return response.json();
    },
    enabled: !!id,
  });
}

export function useCreateMedia() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["createMedia"],
    mutationFn: async (data: CreateMediaInput): Promise<MediaItem> => {
      const response = await fetch("/api/media", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create media");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["media"] });
      toast.success("Added to tracking!");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useUpdateMedia() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["updateMedia"],
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdateMediaInput;
    }): Promise<{ item: MediaItem; updatedFields: string[] }> => {
      const response = await fetch(`/api/media/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update media");
      }

      const item = await response.json();
      const updatedFields = Object.keys(data);
      return { item, updatedFields };
    },
    onSuccess: ({ item, updatedFields }) => {
      queryClient.invalidateQueries({ queryKey: ["media"] });
      if (updatedFields.length === 1) {
        const fieldLabels: Record<string, string> = {
          title: "Title",
          status: "Status",
          rating: "Rating",
          notes: "Notes",
          totalUnits: "Total episodes",
          imageUrl: "Image",
          type: "Type",
        };
        const fieldName = fieldLabels[updatedFields[0]] || updatedFields[0];
        toast.success(`${fieldName} on "${item.title}" updated`);
      } else {
        toast.success(`"${item.title}" updated`);
      }
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useUpdateProgress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["updateProgress"],
    mutationFn: async ({
      id,
      progress,
    }: {
      id: string;
      progress: number;
    }): Promise<MediaItem> => {
      // Add minimum delay so users can see feedback
      const [response] = await Promise.all([
        fetch(`/api/media/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ progress }),
        }),
        new Promise((resolve) => setTimeout(resolve, 300)),
      ]);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update progress");
      }

      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["media"] });
      if (data.status === "COMPLETED") {
        toast.success(`"${data.title}" completed! Great job!`);
      } else {
        toast.success(`Progress on "${data.title}" updated to ${data.progress}`);
      }
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useDeleteMedia() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["deleteMedia"],
    mutationFn: async ({ id, title }: { id: string; title: string }): Promise<string> => {
      const response = await fetch(`/api/media/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete media");
      }
      return title;
    },
    onSuccess: (title) => {
      queryClient.invalidateQueries({ queryKey: ["media"] });
      toast.success(`"${title}" removed from tracking`);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
