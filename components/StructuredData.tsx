import { headers } from 'next/headers';

type StructuredDataValue = Record<string, unknown> | Array<Record<string, unknown>>;

export default async function StructuredData({ data }: { data: StructuredDataValue }) {
  const json = JSON.stringify(data).replace(/</g, '\\u003c');
  const nonce = (await headers()).get('x-csp-nonce') || undefined;
  return <script nonce={nonce} suppressHydrationWarning type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}
