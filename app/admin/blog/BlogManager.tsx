'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ArrowDown, ArrowUp, Edit3, ExternalLink, Heading2, ImagePlus, Pilcrow, Plus, Search, Star, Trash2, UploadCloud } from 'lucide-react';
import { useMemo, useState, type ChangeEvent } from 'react';
import type { Post } from '@/lib/content';
import { articleBlocks, blocksToBody, type ArticleBlock } from '@/lib/blog';
import { useUnsavedChanges } from '@/app/admin/_components/useUnsavedChanges';
import { uploadAdminFile } from '@/lib/admin-upload-client';

const blank: Post = { id: 0, slug: '', title: '', excerpt: '', body: '', contentJson: null, category: 'Engineering', imageUrl: '', featured: 0, publishedAt: new Date().toISOString().slice(0, 10), published: 1 };

function blockId() { return crypto.randomUUID(); }
function starterBlocks(): ArticleBlock[] {
  return [
    { id: 'draft-heading', type: 'heading', heading: '' },
    { id: 'draft-paragraph', type: 'paragraph', text: '' },
  ];
}

export default function BlogManager({ posts }: { posts: Post[] }) {
  const router = useRouter();
  const [post, setPost] = useState<Post>(blank);
  const [blocks, setBlocks] = useState<ArticleBlock[]>(starterBlocks);
  const [status, setStatus] = useState('');
  const [uploadingBlock, setUploadingBlock] = useState<string | null>(null);
  const [editorVersion, setEditorVersion] = useState(0);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [query, setQuery] = useState('');
  const published = posts.filter((item) => item.published).length;
  const categories = new Set(posts.map((item) => item.category)).size;
  const visiblePosts = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return posts;
    return posts.filter((item) => `${item.title} ${item.category} ${item.excerpt} ${item.publishedAt}`.toLowerCase().includes(term));
  }, [posts, query]);

  useUnsavedChanges(dirty);
  function markDirty() { setDirty(true); setStatus(''); }

  function resetEditor(force = false) {
    if (!force && dirty && !confirm('Discard the unsaved article changes?')) return;
    setPost(blank);
    setBlocks(starterBlocks());
    setStatus('');
    setDirty(false);
    setEditorVersion((current) => current + 1);
  }

  function editPost(item: Post) {
    if (dirty && !confirm('Discard the unsaved article changes and open another article?')) return;
    setPost(item);
    setBlocks(articleBlocks(item.contentJson, item.body));
    setStatus('');
    setDirty(false);
    setEditorVersion((current) => current + 1);
    document.getElementById('post-editor')?.scrollIntoView({ behavior: 'smooth' });
  }

  function addBlock(type: ArticleBlock['type']) {
    const block: ArticleBlock = type === 'heading'
      ? { id: blockId(), type, heading: '' }
      : type === 'paragraph'
        ? { id: blockId(), type, text: '' }
        : { id: blockId(), type, imageUrl: '', imageHeading: '', imageDescription: '', alt: '' };
    setBlocks((current) => [...current, block]);
    markDirty();
  }

  function updateBlock(id: string, updates: Partial<ArticleBlock>) {
    setBlocks((current) => current.map((block) => block.id === id ? { ...block, ...updates } : block));
    markDirty();
  }

  function moveBlock(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= blocks.length) return;
    setBlocks((current) => {
      const next = [...current];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
    markDirty();
  }

  async function uploadBlockImage(block: ArticleBlock, event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    setUploadingBlock(block.id);
    setStatus('Uploading image…');
    try {
      const imageUrl = await uploadAdminFile(file);
      updateBlock(block.id, { imageUrl: imageUrl || '', alt: block.alt || file.name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ') });
      setStatus('Image added to the article.');
    } catch {
      setStatus('Could not upload this image. Use a PNG, JPEG, or WebP under 8 MB.');
    } finally {
      setUploadingBlock(null);
    }
  }

  async function save(formData: FormData) {
    const incompleteImage = blocks.find((block) => block.type === 'image' && (!block.imageUrl || !block.alt?.trim()));
    if (incompleteImage) {
      setStatus('Every image block needs an uploaded image and descriptive alt text.');
      document.getElementById(`block-${incompleteImage.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    if (!blocks.some((block) => block.type !== 'image' && (block.heading || block.text)?.trim())) {
      setStatus('Add at least one heading or paragraph before saving.');
      return;
    }
    setSaving(true);
    setStatus('Saving article…');
    try {
      const imageUrl = formData.get('removeImage') ? null : await uploadAdminFile(formData.get('image') as File, post.imageUrl);
      const fields = Object.fromEntries(formData.entries());
      delete fields.image;
      delete fields.removeImage;
      const response = await fetch('/api/admin/posts', {
        method: post.id ? 'PATCH' : 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          ...fields,
          id: post.id,
          body: blocksToBody(blocks),
          contentJson: JSON.stringify(blocks),
          imageUrl,
          featured: formData.get('featured') ? 1 : 0,
          published: formData.get('published') ? 1 : 0,
        }),
      });
      if (!response.ok) throw new Error();
      resetEditor(true);
      setStatus('Article saved successfully.');
      router.refresh();
    } catch {
      setStatus('Could not save this article.');
    } finally { setSaving(false); }
  }

  async function remove(id: number) {
    if (!confirm('Delete this article permanently?')) return;
    const response = await fetch('/api/admin/posts', { method: 'DELETE', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ id }) });
    if (response.ok) { if (post.id === id) resetEditor(true); setStatus('Article deleted.'); router.refresh(); }
    else setStatus('Could not delete this article. Please try again.');
  }

  return <>
    <section className="studio-mini-stats"><article><span>Total articles</span><strong>{posts.length}</strong></article><article><span>Published</span><strong>{published}</strong></article><article><span>Drafts</span><strong>{posts.length - published}</strong></article><article><span>Topics covered</span><strong>{categories}</strong></article></section>
    <div className="studio-manager-grid studio-blog-manager">
      <section className="studio-records"><div className="studio-section-title"><div><small>Editorial library</small><h2>Articles</h2></div><span>{published} live</span></div><div className="studio-library-tools"><label><Search aria-hidden="true" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search articles" aria-label="Search articles" /></label><span>{visiblePosts.length} shown</span></div><div className="studio-record-list">{visiblePosts.length ? visiblePosts.map((item) => { const index = posts.findIndex((postItem) => postItem.id === item.id); return <article key={item.id} className={post.id === item.id ? 'is-selected' : ''}><span className="studio-record-index">{String(index + 1).padStart(2, '0')}</span><div className="studio-record-copy"><div><small>{item.publishedAt} · {item.published ? 'Published' : 'Draft'}</small>{item.featured ? <b><Star /> Featured</b> : null}</div><h3>{item.title}</h3><p>{item.excerpt}</p><div className="studio-tech-preview"><span>{item.category}</span></div></div><div className="studio-record-actions"><a href={`/blog/${item.slug}`} target="_blank" rel="noreferrer" aria-label={`View ${item.title}`}><ExternalLink /></a><button type="button" onClick={() => editPost(item)} aria-label={`Edit ${item.title}`}><Edit3 /></button><button type="button" className="danger" onClick={() => remove(item.id)} aria-label={`Delete ${item.title}`}><Trash2 /></button></div></article>; }) : <div className="studio-library-empty"><Search aria-hidden="true" /><strong>No matching articles</strong><p>Try a title, topic, excerpt, or publication date.</p><button type="button" onClick={() => setQuery('')}>Clear search</button></div>}</div></section>

      <form id="post-editor" className="studio-editor studio-post-editor" action={save} onChange={markDirty} key={`${post.id}-${editorVersion}`}>
        <div className="studio-section-title"><div><small>{post.id ? 'Editing article' : 'New article'}</small><h2>{post.id ? post.title : 'Compose an article'}</h2></div>{post.id ? <button type="button" onClick={() => resetEditor()}>Clear</button> : <ImagePlus />}</div>
        <div className="studio-form-grid studio-post-meta">
          <label className="full">Article title<input name="title" required defaultValue={post.title} /></label>
          <label>URL slug<input name="slug" required defaultValue={post.slug} pattern="[a-z0-9-]+" /></label>
          <label>Category<input name="category" required defaultValue={post.category} /></label>
          <label className="full">Excerpt<textarea name="excerpt" required rows={3} defaultValue={post.excerpt} /></label>
        </div>

        <section className="studio-block-builder" aria-labelledby="content-builder-title">
          <header><div><small>Article structure</small><h3 id="content-builder-title">Content blocks</h3><p>Add blocks in reading order. Use the arrow controls to place images between the correct paragraphs.</p></div><span>{blocks.length} blocks</span></header>
          <div className="studio-block-toolbar" aria-label="Add content block">
            <button type="button" onClick={() => addBlock('heading')}><Heading2 /> Add heading</button>
            <button type="button" onClick={() => addBlock('paragraph')}><Pilcrow /> Add paragraph</button>
            <button type="button" onClick={() => addBlock('image')}><ImagePlus /> Add image</button>
          </div>
          <div className="studio-block-list">
            {blocks.map((block, index) => <article id={`block-${block.id}`} className={`studio-content-block type-${block.type}`} key={block.id}>
              <header><div><span>{String(index + 1).padStart(2, '0')}</span><b>{block.type === 'heading' ? 'Section heading' : block.type === 'paragraph' ? 'Paragraph' : 'Article image'}</b></div><div><button type="button" onClick={() => moveBlock(index, -1)} disabled={index === 0} aria-label={`Move block ${index + 1} up`}><ArrowUp /></button><button type="button" onClick={() => moveBlock(index, 1)} disabled={index === blocks.length - 1} aria-label={`Move block ${index + 1} down`}><ArrowDown /></button><button type="button" className="danger" onClick={() => { if (confirm(`Delete block ${index + 1}?`)) { setBlocks((current) => current.filter((item) => item.id !== block.id)); markDirty(); } }} aria-label={`Delete block ${index + 1}`}><Trash2 /></button></div></header>
              {block.type === 'heading' ? <label htmlFor={`heading-${block.id}`}>Heading<input id={`heading-${block.id}`} required value={block.heading || ''} onChange={(event) => updateBlock(block.id, { heading: event.target.value })} placeholder="A clear section heading" /></label> : null}
              {block.type === 'paragraph' ? <label htmlFor={`paragraph-${block.id}`}>Paragraph<textarea id={`paragraph-${block.id}`} required rows={6} value={block.text || ''} onChange={(event) => updateBlock(block.id, { text: event.target.value })} placeholder="Write this part of the article…" /></label> : null}
              {block.type === 'image' ? <div className="studio-image-block">
                <div className={`studio-image-preview${block.imageUrl ? ' has-image' : ''}`}>{block.imageUrl ? <Image src={block.imageUrl} alt="" fill sizes="(max-width: 1180px) 100vw, 420px" unoptimized={block.imageUrl.startsWith('/api/media/')} style={{ objectFit: 'contain', objectPosition: 'center' }} /> : <><ImagePlus /><span>No image uploaded</span></>}</div>
                <div className="studio-image-fields">
                  <label className="studio-block-upload"><span>{uploadingBlock === block.id ? 'Uploading…' : block.imageUrl ? 'Replace image' : 'Upload image'}</span><input type="file" accept="image/png,image/jpeg,image/webp" disabled={Boolean(uploadingBlock)} onChange={(event) => uploadBlockImage(block, event)} /><UploadCloud /></label>
                  <label htmlFor={`image-heading-${block.id}`}>Image heading <small>Optional</small><input id={`image-heading-${block.id}`} value={block.imageHeading || ''} onChange={(event) => updateBlock(block.id, { imageHeading: event.target.value })} placeholder="What should readers notice?" /></label>
                  <label htmlFor={`image-description-${block.id}`}>Description <small>Optional</small><textarea id={`image-description-${block.id}`} rows={3} value={block.imageDescription || ''} onChange={(event) => updateBlock(block.id, { imageDescription: event.target.value })} placeholder="Explain why this visual matters here." /></label>
                  <label htmlFor={`image-alt-${block.id}`}>Alt text <small>Required</small><input id={`image-alt-${block.id}`} required value={block.alt || ''} onChange={(event) => updateBlock(block.id, { alt: event.target.value })} placeholder="Describe the image for screen readers" /></label>
                </div>
              </div> : null}
            </article>)}
          </div>
          <button className="studio-add-block" type="button" onClick={() => addBlock('paragraph')}><Plus /> Continue with a paragraph</button>
        </section>

        <div className="studio-form-grid studio-post-settings">
          <label className="studio-file-field"><span>Cover image</span><input name="image" type="file" accept="image/png,image/jpeg,image/webp" /></label>
          <label>Publish date<input name="publishedAt" type="date" required defaultValue={post.publishedAt} /></label>
          {post.imageUrl ? <label className="studio-check"><input name="removeImage" type="checkbox" /> Remove current cover</label> : <span />}
          <label className="studio-switch full"><input name="featured" type="checkbox" defaultChecked={Boolean(post.featured)} /><span /><div><strong>Featured article</strong><small>Use this article as the blog lead.</small></div></label>
          <label className="studio-switch full"><input name="published" type="checkbox" defaultChecked={Boolean(post.published)} /><span /><div><strong>Published</strong><small>Turn off to keep this article as a private draft.</small></div></label>
        </div>
        <div className="studio-editor-foot"><span className={status.startsWith('Could not') || status.startsWith('Every') || status.startsWith('Add at') ? 'is-error' : ''} role="status" aria-live="polite">{status || (dirty ? 'Unsaved changes' : 'All changes saved')}</span><button className="studio-save" type="submit" disabled={Boolean(uploadingBlock) || saving} aria-busy={saving}>{saving ? 'Saving…' : post.id ? 'Update article' : 'Publish article'}</button></div>
      </form>
    </div>
  </>;
}
