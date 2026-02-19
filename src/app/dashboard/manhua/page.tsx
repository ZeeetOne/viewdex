import { Metadata } from "next";
import { MediaList } from "@/components/media/media-list";

export const metadata: Metadata = {
  title: "Manhua",
  description: "Track your manhua progress",
};

export default function ManhuaPage() {
  return <MediaList type="MANHUA" title="Manhua" />;
}
