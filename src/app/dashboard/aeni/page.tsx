import { Metadata } from "next";
import { MediaList } from "@/components/media/media-list";

export const metadata: Metadata = {
  title: "Aeni",
  description: "Track your aeni progress",
};

export default function AeniPage() {
  return <MediaList type="AENI" title="Aeni" />;
}
