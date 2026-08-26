'use client';
import { useState } from 'react';

export default function ShareActions({ title }: { title: string }) {
  const [feedback, setFeedback] = useState('');

  function showFeedback(message: string) {
    setFeedback(message);
    window.setTimeout(() => setFeedback(''), 2400);
  }
  function fallbackCopy(url: string) {
    const field = document.createElement('textarea');
    field.value = url;
    field.setAttribute('readonly', '');
    field.style.position = 'fixed';
    field.style.opacity = '0';
    document.body.appendChild(field);
    field.select();
    const copied = document.execCommand('copy');
    field.remove();
    return copied;
  }
  async function copy() {
    const url = window.location.href;
    try {
      if (navigator.clipboard && window.isSecureContext) await navigator.clipboard.writeText(url);
      else if (!fallbackCopy(url)) throw new Error('Copy failed');
      showFeedback('Link copied to clipboard.');
    } catch {
      showFeedback('Could not copy the link.');
    }
  }
  async function shareArticle() {
    if (!navigator.share) return copy();
    try {
      await navigator.share({ title, url: window.location.href });
      showFeedback('Article shared.');
    } catch (error) {
      if (!(error instanceof DOMException && error.name === 'AbortError')) showFeedback('Could not open sharing.');
    }
  }
  function share(network: 'linkedin' | 'x') {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(title);
    const target = network === 'linkedin' ? 'https://www.linkedin.com/sharing/share-offsite/?url=' + url : 'https://x.com/intent/post?url=' + url + '&text=' + text;
    window.open(target, '_blank', 'noopener,noreferrer');
  }
  return <div className="share-actions"><span>Share this article</span><div className="share-action-list" role="group" aria-label="Article sharing options"><button type="button" className="share-primary" onClick={shareArticle}>Share</button><button type="button" onClick={() => share('linkedin')}>LinkedIn</button><button type="button" onClick={() => share('x')}>X</button><button type="button" onClick={copy}>Copy link</button></div><small className="share-feedback" aria-live="polite">{feedback}</small></div>;
}
