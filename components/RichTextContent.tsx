import type { ReactNode } from 'react';
import type { RichTextDocument, RichTextNode } from '@/lib/blog';

function renderChildren(node: RichTextNode, key: string): ReactNode {
  const children = node.type === 'text'
    ? node.text || ''
    : node.content?.map((child, index) => renderNode(child, `${key}-${index}`));
  return (node.marks || []).reduce<ReactNode>((content, mark, index) => {
    if (mark.type === 'bold') return <strong key={`${key}-bold-${index}`}>{content}</strong>;
    if (mark.type === 'italic') return <em key={`${key}-italic-${index}`}>{content}</em>;
    if (mark.type === 'code') return <code key={`${key}-code-${index}`}>{content}</code>;
    if (mark.type === 'link') {
      const href = typeof mark.attrs?.href === 'string' ? mark.attrs.href : '';
      if (/^(https?:|mailto:)/i.test(href)) return <a key={`${key}-link-${index}`} href={href} target={href.startsWith('http') ? '_blank' : undefined} rel={href.startsWith('http') ? 'noreferrer' : undefined}>{content}</a>;
    }
    return content;
  }, children);
}

function renderNode(node: RichTextNode, key: string): ReactNode {
  const children = renderChildren(node, key);
  if (node.type === 'paragraph') return <p key={key}>{children}</p>;
  if (node.type === 'heading') return Number(node.attrs?.level) === 3 ? <h3 key={key}>{children}</h3> : <h2 key={key}>{children}</h2>;
  if (node.type === 'bulletList') return <ul key={key}>{children}</ul>;
  if (node.type === 'orderedList') return <ol key={key}>{children}</ol>;
  if (node.type === 'listItem') return <li key={key}>{children}</li>;
  if (node.type === 'blockquote') return <blockquote key={key}>{children}</blockquote>;
  if (node.type === 'codeBlock') return <pre key={key}><code>{node.content?.map((child) => child.text || '').join('')}</code></pre>;
  if (node.type === 'hardBreak') return <br key={key} />;
  if (node.type === 'horizontalRule') return <hr key={key} />;
  return <span key={key}>{children}</span>;
}

export default function RichTextContent({ document }: { document: RichTextDocument }) {
  return <div className="structured-rich-text">{document.content?.map((node, index) => renderNode(node, `rich-${index}`))}</div>;
}
