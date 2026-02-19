import { Metadata } from "next";
import { MediaList } from "@/components/media/media-list";

export const metadata: Metadata = {
  title: "Donghua",
  description: "Track your donghua progress",
};

export default function DonghuaPage() {
  return <MediaList type="DONGHUA" title="Donghua" />;
}
