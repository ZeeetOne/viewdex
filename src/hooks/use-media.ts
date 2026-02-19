"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MediaItem, MediaType, TrackStatus } from "@prisma/client";
import { toast } from "sonner";
import { CreateMediaInput, UpdateMediaInput } from "@/lib/validations";

interface MediaFilters {
  type?: MediaType;
  status?: TrackStatus;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export function useMedia(filters?: MediaFilters) {
  const queryParams = new URLSearchParams();

  if (filters?.type) queryParams.set("type", filters.type);
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
      toast.success("Title added successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useUpdateMedia() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdateMediaInput;
    }): Promise<MediaItem> => {
      const response = await fetch(`/api/media/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update media");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["media"] });
      toast.success("Title updated!");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useUpdateProgress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      progress,
    }: {
      id: string;
      progress: number;
    }): Promise<MediaItem> => {
      const response = await fetch(`/api/media/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ progress }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update progress");
      }

      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["media"] });
      if (data.status === "COMPLETED") {
        toast.success("Completed! Great job!");
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
    mutationFn: async (id: string): Promise<void> => {
      const response = await fetch(`/api/media/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete media");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["media"] });
      toast.success("Title deleted");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
