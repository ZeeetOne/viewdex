import { Metadata } from "next";
import { MediaList } from "@/components/media/media-list";

export const metadata: Metadata = {
  title: "Western Comic",
  description: "Track your western comic progress",
};

export default function WesternComicPage() {
  return <MediaList type="WESTERN_COMIC" title="Western Comic" />;
}
