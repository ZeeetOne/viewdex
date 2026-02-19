import { Metadata } from "next";
import { MediaList } from "@/components/media/media-list";

export const metadata: Metadata = {
  title: "Manhwa",
  description: "Track your manhwa progress",
};

export default function ManhwaPage() {
  return <MediaList type="MANHWA" title="Manhwa" />;
}
