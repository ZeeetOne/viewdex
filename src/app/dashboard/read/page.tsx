import { Metadata } from "next";
import { MediaList } from "@/components/media/media-list";

export const metadata: Metadata = {
  title: "Read",
  description: "Track your manga and manhwa progress",
};

export default function ReadPage() {
  return <MediaList types={["MANGA", "MANHWA"]} title="Read" />;
}
