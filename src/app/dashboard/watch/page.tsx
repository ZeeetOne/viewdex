import { Metadata } from "next";
import { MediaList } from "@/components/media/media-list";

export const metadata: Metadata = {
  title: "Watch",
  description: "Track your anime, donghua, aeni, and western animation progress",
};

export default function WatchPage() {
  return <MediaList types={["ANIME", "DONGHUA", "AENI", "WESTERN_ANIMATION"]} title="Watch" />;
}
