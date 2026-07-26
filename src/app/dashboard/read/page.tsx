import { Metadata } from "next";
import { MediaList } from "@/components/media/media-list";

export const metadata: Metadata = {
  title: "Read",
  description: "Track your manga, manhwa, and manhua progress",
};

export default function ReadPage() {
  return <MediaList types={["MANGA", "MANHWA", "MANHUA"]} category="READ" title="Read" />;
}
