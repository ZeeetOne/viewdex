import { Metadata } from "next";
import { MediaList } from "@/components/media/media-list";

export const metadata: Metadata = {
  title: "Anime",
  description: "Track your anime progress",
};

export default function AnimePage() {
  return <MediaList type="ANIME" title="Anime" />;
}
