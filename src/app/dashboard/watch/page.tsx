import { Metadata } from "next";
import { MediaList } from "@/components/media/media-list";

export const metadata: Metadata = {
  title: "Watch",
  description: "Track your anime, donghua, and movie progress",
};

export default function WatchPage() {
  return <MediaList types={["ANIME", "DONGHUA", "MOVIE"]} category="WATCH" title="Watch" />;
}
