import { notFound } from "next/navigation";
import { Workspace } from "@/components/guiones/workspace";
import { obtenerVideo } from "@/lib/guiones/data";

export default async function VideoPage({ params }: PageProps<"/guiones/app/[id]">) {
  const { id } = await params;
  const video = await obtenerVideo(id);
  if (!video) notFound();
  return <Workspace video={video} demoSinClave={!process.env.ANTHROPIC_API_KEY} />;
}
