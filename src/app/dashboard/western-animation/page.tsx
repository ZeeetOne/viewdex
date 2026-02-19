import { Metadata } from "next";
import { MediaList } from "@/components/media/media-list";

export const metadata: Metadata = {
  title: "Western Animation",
  description: "Track your western animation progress",
};

export default function WesternAnimationPage() {
  return <MediaList type="WESTERN_ANIMATION" title="Western Animation" />;
}
