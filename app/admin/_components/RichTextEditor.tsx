'use client';

import LinkExtension from '@tiptap/extension-link';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Bold, Code2, Heading2, Heading3, Italic, Link2, List, ListOrdered, Quote, Redo2, RemoveFormatting, Undo2, X } from 'lucide-react';
import { useState } from 'react';
import type { ReactNode } from 'react';
import type { RichTextDocument } from '@/lib/blog';

type Props = {
  id: string;
  value: RichTextDocument;
  label: string;
  onChange: (value: RichTextDocument) => void;
};

export default function RichTextEditor({ id, value, label, onChange }: Props) {
  const [linkOpen, setLinkOpen] = useState(false);
  const [linkValue, setLinkValue] = useState('');
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [StarterKit, LinkExtension.configure({ openOnClick: false, autolink: true, defaultProtocol: 'https' })],
    content: value,
    editorProps: { attributes: { id, 'aria-label': label, class: 'studio-rich-surface' } },
    onUpdate: ({ editor: current }) => onChange(current.getJSON() as RichTextDocument),
  });

  if (!editor) return <div className="studio-rich-loading" aria-live="polite">Loading editor…</div>;

  const command = (action: () => void) => { action(); editor.commands.focus(); };
  const button = (title: string, active: boolean, disabled: boolean, action: () => void, icon: ReactNode) => (
    <button type="button" title={title} aria-label={title} aria-pressed={active} disabled={disabled} onClick={() => command(action)}>{icon}</button>
  );
  const applyLink = () => {
    const href = linkValue.trim();
    if (!href) editor.chain().focus().unsetLink().run();
    else editor.chain().focus().extendMarkRange('link').setLink({ href }).run();
    setLinkOpen(false);
  };

  return <div className="studio-rich-editor">
    <div className="studio-rich-toolbar" role="toolbar" aria-label={`${label} formatting`}>
      {button('Undo', false, !editor.can().undo(), () => editor.chain().undo().run(), <Undo2 />)}
      {button('Redo', false, !editor.can().redo(), () => editor.chain().redo().run(), <Redo2 />)}
      <i aria-hidden="true" />
      {button('Heading 2', editor.isActive('heading', { level: 2 }), false, () => editor.chain().toggleHeading({ level: 2 }).run(), <Heading2 />)}
      {button('Heading 3', editor.isActive('heading', { level: 3 }), false, () => editor.chain().toggleHeading({ level: 3 }).run(), <Heading3 />)}
      {button('Bold', editor.isActive('bold'), false, () => editor.chain().toggleBold().run(), <Bold />)}
      {button('Italic', editor.isActive('italic'), false, () => editor.chain().toggleItalic().run(), <Italic />)}
      {button('Bulleted list', editor.isActive('bulletList'), false, () => editor.chain().toggleBulletList().run(), <List />)}
      {button('Numbered list', editor.isActive('orderedList'), false, () => editor.chain().toggleOrderedList().run(), <ListOrdered />)}
      {button('Block quote', editor.isActive('blockquote'), false, () => editor.chain().toggleBlockquote().run(), <Quote />)}
      {button('Inline code', editor.isActive('code'), false, () => editor.chain().toggleCode().run(), <Code2 />)}
      <button type="button" title="Add or edit link" aria-label="Add or edit link" aria-pressed={linkOpen || editor.isActive('link')} onClick={() => { setLinkValue(editor.getAttributes('link').href || ''); setLinkOpen((current) => !current); }}><Link2 /></button>
      {button('Clear formatting', false, false, () => editor.chain().clearNodes().unsetAllMarks().run(), <RemoveFormatting />)}
    </div>
    {linkOpen ? <div className="studio-link-popover">
      <label htmlFor={`${id}-link`}>Link URL</label>
      <input id={`${id}-link`} type="url" value={linkValue} onChange={(event) => setLinkValue(event.target.value)} placeholder="https://example.com" onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); applyLink(); } }} />
      <button type="button" onClick={applyLink}>Apply</button>
      <button type="button" aria-label="Close link editor" onClick={() => setLinkOpen(false)}><X /></button>
    </div> : null}
    <EditorContent editor={editor} />
    <div className="studio-rich-help"><span>Select text, then use the toolbar to format or add a link.</span><span>{editor.getText().length} characters</span></div>
  </div>;
}
