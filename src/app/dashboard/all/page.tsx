import { Metadata } from "next";
import { MediaList } from "@/components/media/media-list";

export const metadata: Metadata = {
  title: "All Titles",
  description: "View all your tracked titles",
};

export default function AllTitlesPage() {
  return <MediaList title="All Titles" />;
}
