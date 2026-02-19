import { Metadata } from "next";
import { MediaList } from "@/components/media/media-list";

export const metadata: Metadata = {
  title: "All Media",
  description: "View all your tracked media",
};

export default function AllMediaPage() {
  return <MediaList title="All Media" />;
}
