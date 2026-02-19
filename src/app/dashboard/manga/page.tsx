import { Metadata } from "next";
import { MediaList } from "@/components/media/media-list";

export const metadata: Metadata = {
  title: "Manga",
  description: "Track your manga progress",
};

export default function MangaPage() {
  return <MediaList type="MANGA" title="Manga" />;
}
