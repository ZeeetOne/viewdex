import { Metadata } from "next";
import { MediaList } from "@/components/media/media-list";

export const metadata: Metadata = {
  title: "Read",
  description: "Track your manga, manhwa, manhua, and western comic progress",
};

export default function ReadPage() {
  return <MediaList types={["MANGA", "MANHWA", "MANHUA", "WESTERN_COMIC"]} title="Read" />;
}
