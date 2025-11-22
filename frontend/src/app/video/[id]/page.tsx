import VideoPlayer from "@/components/VideoPlayer";
import { Suspense } from "react";

export default async function VideoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="container mx-auto px-4 py-8">
      <Suspense
        fallback={
          <div className="text-center py-12 text-slate-300">Loading video...</div>
        }
      >
        <VideoPlayer videoId={id} />
      </Suspense>
    </div>
  );
}
