import { permanentRedirect } from 'next/navigation';

type Props = { params: Promise<{ slug: string }> };

export default async function LegacyProjectPage({ params }: Props) {
  const { slug } = await params;
  permanentRedirect(`/projects/${encodeURIComponent(slug)}`);
}
