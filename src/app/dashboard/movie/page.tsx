import { Metadata } from "next";
import { MediaList } from "@/components/media/media-list";

export const metadata: Metadata = {
  title: "Movie",
  description: "Track your movie progress",
};

export default function MoviePage() {
  return <MediaList type="MOVIE" title="Movie" />;
}
