'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ArrowDown, ArrowUp, Edit3, ExternalLink, Heading2, ImagePlus, Pilcrow, Plus, Search, Star, Trash2, UploadCloud } from 'lucide-react';
import { useMemo, useState, type ChangeEvent } from 'react';
import type { Post } from '@/lib/content';
import { articleBlocks, blocksToBody, plainTextDocument, richTextPlainText, type ArticleBlock } from '@/lib/blog';
import { useUnsavedChanges } from '@/app/admin/_components/useUnsavedChanges';
import { uploadAdminFile } from '@/lib/admin-upload-client';
import RichTextEditor from '@/app/admin/_components/RichTextEditor';
import ConfirmDialog from '@/app/admin/_components/ConfirmDialog';
import { toProjectSlug } from '@/lib/slug';

const blank: Post = { id: 0, slug: '', title: '', excerpt: '', body: '', contentJson: null, category: 'Engineering', imageUrl: '', featured: 0, publishedAt: new Date().toISOString().slice(0, 10), published: 1 };

function blockId() { return crypto.randomUUID(); }
function starterBlocks(): ArticleBlock[] {
  return [
    { id: 'draft-heading', type: 'heading', heading: '' },
    { id: 'draft-paragraph', type: 'paragraph', text: '', richText: plainTextDocument('') },
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
  const [deleteTarget, setDeleteTarget] = useState<Post | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [activeStep, setActiveStep] = useState(1);
  const published = posts.filter((item) => item.published).length;
  const categories = new Set(posts.map((item) => item.category)).size;
  const visiblePosts = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return posts;
    return posts.filter((item) => `${item.title} ${item.category} ${item.excerpt} ${item.publishedAt}`.toLowerCase().includes(term));
  }, [posts, query]);
  const hasError = /^(Could not|Every|Add at|Invalid|This article)/.test(status);

  useUnsavedChanges(dirty);
  function markDirty() { setDirty(true); setStatus(''); }
  function goToStep(step: number, id: string) {
    setActiveStep(step);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

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
        ? { id: blockId(), type, text: '', richText: plainTextDocument('') }
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
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Could not upload this image. Use a PNG, JPEG, WebP, or AVIF file under 8 MB.');
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
    if (!blocks.some((block) => block.type !== 'image' && (block.heading?.trim() || richTextPlainText(block.richText) || block.text?.trim()))) {
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
          published: formData.get('intent') === 'draft' ? 0 : formData.get('published') ? 1 : 0,
        }),
      });
      if (!response.ok) {
        const payload = await response.json().catch(() => null) as { error?: string } | null;
        throw new Error(payload?.error || 'Could not save this article.');
      }
      resetEditor(true);
      setStatus('Article saved successfully.');
      router.refresh();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Could not save this article.');
    } finally { setSaving(false); }
  }

  async function remove(id: number) {
    setDeleting(true);
    const response = await fetch('/api/admin/posts', { method: 'DELETE', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ id }) });
    if (response.ok) { if (post.id === id) resetEditor(true); setStatus('Article deleted.'); setDeleteTarget(null); router.refresh(); }
    else setStatus('Could not delete this article. Please try again.');
    setDeleting(false);
  }

  return <>
    <section className="studio-mini-stats"><article><span>Total articles</span><strong>{posts.length}</strong></article><article><span>Published</span><strong>{published}</strong></article><article><span>Drafts</span><strong>{posts.length - published}</strong></article><article><span>Topics covered</span><strong>{categories}</strong></article></section>
    <div className="studio-manager-grid studio-blog-manager">
      <section className="studio-records"><div className="studio-section-title"><div><small>Editorial library</small><h2>Articles</h2></div><span>{published} live</span></div><div className="studio-library-tools"><label><Search aria-hidden="true" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search articles" aria-label="Search articles" /></label><span>{visiblePosts.length} shown</span></div><div className="studio-record-list">{visiblePosts.length ? visiblePosts.map((item) => { const index = posts.findIndex((postItem) => postItem.id === item.id); return <article key={item.id} className={post.id === item.id ? 'is-selected' : ''}><span className="studio-record-index">{String(index + 1).padStart(2, '0')}</span><div className="studio-record-copy"><div><small>{item.publishedAt} · {item.published ? 'Published' : 'Draft'}</small>{item.featured ? <b><Star /> Featured</b> : null}</div><h3>{item.title}</h3><p>{item.excerpt}</p><div className="studio-tech-preview"><span>{item.category}</span></div></div><div className="studio-record-actions"><a href={`/blog/${item.slug}`} target="_blank" rel="noreferrer" aria-label={`View ${item.title}`}><ExternalLink /></a><button type="button" onClick={() => editPost(item)} aria-label={`Edit ${item.title}`}><Edit3 /></button><button type="button" className="danger" onClick={() => setDeleteTarget(item)} aria-label={`Delete ${item.title}`}><Trash2 /></button></div></article>; }) : <div className="studio-library-empty"><Search aria-hidden="true" /><strong>No matching articles</strong><p>Try a title, topic, excerpt, or publication date.</p><button type="button" onClick={() => setQuery('')}>Clear search</button></div>}</div></section>

      <form id="post-editor" className="studio-editor studio-post-editor" action={save} onChange={markDirty} key={`${post.id}-${editorVersion}`}>
        <div className="studio-section-title"><div><small>{post.id ? 'Editing article' : 'New article'}</small><h2>{post.id ? post.title : 'Compose an article'}</h2></div>{post.id ? <button type="button" onClick={() => resetEditor()}>Clear</button> : <ImagePlus />}</div>
        <nav className="studio-workflow studio-workflow-three" aria-label="Article creation steps">
          {[['Essentials', 'article-essentials'], ['Write', 'content-builder-title'], ['Publish', 'article-publishing']].map(([label, id], index) => <button key={id} type="button" className={activeStep === index + 1 ? 'active' : ''} aria-current={activeStep === index + 1 ? 'step' : undefined} onClick={() => goToStep(index + 1, id)}><span>{index + 1}</span>{label}</button>)}
        </nav>
        {hasError ? <div className="studio-error-summary" role="alert" tabIndex={-1}><strong>Review the article before saving</strong><p>{status}</p></div> : null}
        <section id="article-essentials" className="studio-form-grid studio-post-meta studio-workflow-section">
          <div className="studio-workflow-heading full"><small>Step 1</small><h3>Article essentials</h3><p>Set the title, topic, URL and description readers will see before opening the article.</p></div>
          <label className="full">Article title<input name="title" required defaultValue={post.title} onBlur={(event) => { const slug = document.getElementById('article-slug') as HTMLInputElement | null; if (slug && !slug.value.trim()) slug.value = toProjectSlug(event.target.value); }} /></label>
          <label>URL slug<input id="article-slug" name="slug" required defaultValue={post.slug} pattern="[a-z0-9-]+" /><small>Generated automatically; change only when needed.</small></label>
          <label>Category<input name="category" list="article-categories" required defaultValue={post.category} /><datalist id="article-categories">{[...new Set(posts.map((item) => item.category))].filter(Boolean).map((category) => <option value={category} key={category} />)}</datalist></label>
          <label className="full">Excerpt<textarea name="excerpt" required maxLength={240} rows={3} defaultValue={post.excerpt} /><small>Keep this concise; it appears on article cards and in search previews.</small></label>
        </section>

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
              {block.type === 'paragraph' ? <div className="studio-rich-field"><span>Rich text</span><RichTextEditor id={`paragraph-${block.id}`} label={`Article content block ${index + 1}`} value={block.richText || plainTextDocument(block.text || '')} onChange={(richText) => updateBlock(block.id, { richText, text: richTextPlainText(richText) })} /></div> : null}
              {block.type === 'image' ? <div className="studio-image-block">
                <div className={`studio-image-preview${block.imageUrl ? ' has-image' : ''}`}>{block.imageUrl ? <Image src={block.imageUrl} alt="" fill sizes="(max-width: 1180px) 100vw, 420px" unoptimized={block.imageUrl.startsWith('/api/media/')} style={{ objectFit: 'contain', objectPosition: 'center' }} /> : <><ImagePlus /><span>No image uploaded</span></>}</div>
                <div className="studio-image-fields">
                  <label className="studio-block-upload"><span>{uploadingBlock === block.id ? 'Uploading…' : block.imageUrl ? 'Replace image' : 'Upload image'}</span><input type="file" accept="image/png,image/jpeg,image/webp,image/avif,.png,.jpg,.jpeg,.webp,.avif" disabled={Boolean(uploadingBlock)} onChange={(event) => uploadBlockImage(block, event)} /><UploadCloud /></label>
                  <label htmlFor={`image-heading-${block.id}`}>Image heading <small>Optional</small><input id={`image-heading-${block.id}`} value={block.imageHeading || ''} onChange={(event) => updateBlock(block.id, { imageHeading: event.target.value })} placeholder="What should readers notice?" /></label>
                  <label htmlFor={`image-description-${block.id}`}>Description <small>Optional</small><textarea id={`image-description-${block.id}`} rows={3} value={block.imageDescription || ''} onChange={(event) => updateBlock(block.id, { imageDescription: event.target.value })} placeholder="Explain why this visual matters here." /></label>
                  <label htmlFor={`image-alt-${block.id}`}>Alt text <small>Required</small><input id={`image-alt-${block.id}`} required value={block.alt || ''} onChange={(event) => updateBlock(block.id, { alt: event.target.value })} placeholder="Describe the image for screen readers" /></label>
                </div>
              </div> : null}
            </article>)}
          </div>
          <button className="studio-add-block" type="button" onClick={() => addBlock('paragraph')}><Plus /> Continue with a paragraph</button>
        </section>

        <section id="article-publishing" className="studio-form-grid studio-post-settings studio-workflow-section">
          <div className="studio-workflow-heading full"><small>Step 3</small><h3>Media and publishing</h3><p>Add an optional cover, choose the publication date, and decide whether the article is a draft or publicly available.</p></div>
          <label className="studio-file-field"><span>Cover image</span><input name="image" type="file" accept="image/png,image/jpeg,image/webp,image/avif,.png,.jpg,.jpeg,.webp,.avif" /><small>PNG, JPEG, WebP, or AVIF up to 8 MB.</small></label>
          <label>Publish date<input name="publishedAt" type="date" required defaultValue={post.publishedAt} /></label>
          {post.imageUrl ? <label className="studio-check"><input name="removeImage" type="checkbox" /> Remove current cover</label> : <span />}
          <label className="studio-switch full"><input name="featured" type="checkbox" defaultChecked={Boolean(post.featured)} /><span /><div><strong>Featured article</strong><small>Use this article as the blog lead.</small></div></label>
          <label className="studio-switch full"><input name="published" type="checkbox" defaultChecked={Boolean(post.published)} /><span /><div><strong>Published</strong><small>Turn off to keep this article as a private draft.</small></div></label>
        </section>
        <div className="studio-editor-foot"><span className={hasError ? 'is-error' : ''} role="status" aria-live="polite">{status || (dirty ? 'Unsaved changes' : 'All changes saved')}</span><div className="studio-editor-actions">{post.id ? <a href={`/blog/${post.slug}`} target="_blank" rel="noreferrer">Preview <ExternalLink /></a> : null}<button className="studio-save-draft" type="submit" name="intent" value="draft" disabled={Boolean(uploadingBlock) || saving}>Save draft</button><button className="studio-save" type="submit" name="intent" value="save" disabled={Boolean(uploadingBlock) || saving} aria-busy={saving}>{saving ? 'Saving…' : post.id ? 'Update article' : 'Save article'}</button></div></div>
      </form>
    </div>
    <ConfirmDialog open={Boolean(deleteTarget)} title={`Delete “${deleteTarget?.title || 'article'}”?`} description="This permanently removes the article and its managed images. This action cannot be undone." busy={deleting} onCancel={() => setDeleteTarget(null)} onConfirm={() => deleteTarget && remove(deleteTarget.id)} />
  </>;
}
