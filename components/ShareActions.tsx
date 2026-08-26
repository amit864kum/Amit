'use client';
import { useState } from 'react';

export default function ShareActions({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    await navigator.clipboard.writeText(location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }
  function share(network: 'linkedin' | 'x') {
    const url = encodeURIComponent(location.href);
    const text = encodeURIComponent(title);
    const target = network === 'linkedin' ? 'https://www.linkedin.com/sharing/share-offsite/?url=' + url : 'https://x.com/intent/post?url=' + url + '&text=' + text;
    open(target, '_blank', 'noopener,noreferrer');
  }
  return <div className="share-actions"><span>Share</span><button onClick={() => share('linkedin')}>in</button><button onClick={() => share('x')}>X</button><button onClick={copy}>{copied ? '✓' : '⧉'}</button></div>;
}
