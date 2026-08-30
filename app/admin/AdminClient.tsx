'use client';
import Link from 'next/link';
import { useRef, useState, type ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import type { Post, Project } from '@/lib/content';

export type AdminMessage = { id: number; name: string; email: string; service: string; budget: string | null; message: string; createdAt: string; status: string };
const emptyProject: Project = { id: 0, slug: '', title: '', category: '', summary: '', body: '', contentJson: null, tech: '', year: new Date().getFullYear().toString(), imageUrl: '', projectUrl: '', githubUrl: '', featured: 0, displayOrder: 0 };
const emptyPost: Post = { id: 0, slug: '', title: '', excerpt: '', body: '', category: 'Engineering', imageUrl: '', featured: 0, publishedAt: new Date().toISOString().slice(0,10), published: 1 };

export default function AdminClient({ projects, posts, messages }: { projects: Project[]; posts: Post[]; messages: AdminMessage[] }) {
  const router = useRouter();
  const [tab, setTab] = useState<'projects'|'posts'|'messages'>('projects');
  const [project, setProject] = useState<Project>(emptyProject);
  const [post, setPost] = useState<Post>(emptyPost);
  const [status, setStatus] = useState('');
  const [inlineUploadBusy, setInlineUploadBusy] = useState(false);
  const articleBodyRef = useRef<HTMLTextAreaElement>(null);

  async function uploadImage(file: File | undefined, currentUrl?: string | null) {
    if (!file || !file.size) return currentUrl || null;
    const body = new FormData(); body.set('file', file);
    const response = await fetch('/api/admin/upload', { method: 'POST', body });
    if (!response.ok) throw new Error('Upload failed');
    return ((await response.json()) as { url: string }).url;
  }
  async function saveProject(form: FormData) {
    setStatus('Saving project…');
    try {
      const imageUrl = await uploadImage(form.get('image') as File, project.imageUrl);
      const body = Object.fromEntries(form.entries()); delete body.image;
      const response = await fetch('/api/admin/projects', { method: project.id ? 'PATCH' : 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ ...body, id: project.id, imageUrl, featured: form.get('featured') ? 1 : 0 }) });
      if (!response.ok) throw new Error('Save failed');
      setProject(emptyProject); setStatus('Project saved.'); router.refresh();
    } catch { setStatus('Could not save the project.'); }
  }
  async function savePost(form: FormData) {
    setStatus('Saving post…');
    try {
      const imageUrl = form.get('removeImage') ? null : await uploadImage(form.get('image') as File, post.imageUrl);
      const body = Object.fromEntries(form.entries()); delete body.image; delete body.removeImage;
      const response = await fetch('/api/admin/posts', { method: post.id ? 'PATCH' : 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ ...body, id: post.id, imageUrl, featured: form.get('featured') ? 1 : 0, published: form.get('published') ? 1 : 0 }) });
      if (!response.ok) throw new Error('Save failed');
      setPost(emptyPost); setStatus('Post saved.'); router.refresh();
    } catch { setStatus('Could not save the post.'); }
  }
  async function insertArticleImages(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files || []);
    event.target.value = '';
    const textarea = articleBodyRef.current;
    if (!files.length || !textarea) return;
    setInlineUploadBusy(true);
    setStatus(files.length === 1 ? 'Uploading article image…' : `Uploading ${files.length} article images…`);
    try {
      const snippets: string[] = [];
      for (const file of files) {
        const url = await uploadImage(file);
        if (!url) continue;
        const alt = file.name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ').replace(/[\[\]()]/g, '').trim() || 'Article image';
        snippets.push(`![${alt}](${url})`);
      }
      const start = textarea.selectionStart ?? textarea.value.length;
      const end = textarea.selectionEnd ?? start;
      textarea.setRangeText(`\n\n${snippets.join('\n\n')}\n\n`, start, end, 'end');
      textarea.focus();
      setStatus(`${snippets.length} inline ${snippets.length === 1 ? 'image' : 'images'} inserted. Save the post to publish.`);
    } catch { setStatus('Could not upload the inline image.'); }
    finally { setInlineUploadBusy(false); }
  }
  async function remove(kind: 'projects'|'posts', id: number) {
    if (!confirm('Delete this item?')) return;
    await fetch('/api/admin/' + kind, { method: 'DELETE', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ id }) });
    router.refresh();
  }

  return (
    <div className="admin-shell">
      <aside><div className="admin-brand">AK<span>Studio CMS</span></div>
        <button className={tab === 'projects' ? 'active' : ''} onClick={() => setTab('projects')}>Projects <span>{projects.length}</span></button>
        <button className={tab === 'posts' ? 'active' : ''} onClick={() => setTab('posts')}>Blog <span>{posts.length}</span></button>
        <button className={tab === 'messages' ? 'active' : ''} onClick={() => setTab('messages')}>Enquiries <span>{messages.length}</span></button>
        <div className="admin-aside-actions"><Link href="/">View portfolio ↗</Link><form action="/api/admin/logout" method="post"><button>Log out</button></form></div>
      </aside>
      <section className="admin-content">
        <header><div><p>Portfolio management</p><h1>{tab === 'projects' ? 'Projects' : tab === 'posts' ? 'Blog posts' : 'Enquiries'}</h1></div><span className="admin-status">{status}</span></header>
        {tab === 'projects' && <div className="admin-grid">
          <div className="admin-list">{projects.map((item) => <article key={item.id}><div><small>{item.category} · {item.year}</small><h3>{item.title}</h3></div><div><button onClick={() => setProject({ ...item, imageUrl: item.imageUrl || '' })}>Edit</button><button onClick={() => remove('projects', item.id)}>Delete</button></div></article>)}</div>
          <form className="admin-form" action={saveProject} key={project.id}><h2>{project.id ? 'Edit project' : 'Add project'}</h2>
            <label>Title<input name="title" required defaultValue={project.title} /></label>
            <label>Slug<input name="slug" required defaultValue={project.slug} pattern="[a-z0-9-]+" /></label>
            <div className="split"><label>Category<input name="category" required defaultValue={project.category} /></label><label>Year<input name="year" required defaultValue={project.year} /></label></div>
            <label>Summary<textarea name="summary" required rows={3} defaultValue={project.summary} /></label>
            <label>Case study<textarea name="body" required rows={6} defaultValue={project.body} /></label>
            <label>Technology<input name="tech" required defaultValue={project.tech} /></label>
            <label>Live URL<input name="projectUrl" type="url" defaultValue={project.projectUrl || ''} /></label>
            <label>GitHub URL<input name="githubUrl" type="url" defaultValue={project.githubUrl || ''} /></label>
            <label>Project screenshot<input name="image" type="file" accept="image/png,image/jpeg,image/webp" /></label>
            <label className="check"><input name="featured" type="checkbox" defaultChecked={Boolean(project.featured)} /> Featured on homepage</label>
            <div className="admin-form-actions"><button className="admin-primary">Save project</button>{project.id ? <button type="button" onClick={() => setProject(emptyProject)}>Cancel</button> : null}</div>
          </form>
        </div>}
        {tab === 'posts' && <div className="admin-grid">
          <div className="admin-list">{posts.map((item) => <article key={item.id}><div><small>{item.publishedAt} · {item.published ? 'Published' : 'Draft'}</small><h3>{item.title}</h3></div><div><button onClick={() => setPost(item)}>Edit</button><button onClick={() => remove('posts', item.id)}>Delete</button></div></article>)}</div>
          <form className="admin-form" action={savePost} key={post.id}><h2>{post.id ? 'Edit post' : 'Add post'}</h2>
            <label>Title<input name="title" required defaultValue={post.title} /></label><label>Slug<input name="slug" required defaultValue={post.slug} pattern="[a-z0-9-]+" /></label>
            <label>Category<input name="category" required defaultValue={post.category} /></label>
            <label>Excerpt<textarea name="excerpt" required rows={3} defaultValue={post.excerpt} /></label>
            <label>Article<textarea ref={articleBodyRef} name="body" required rows={14} defaultValue={post.body} /><small>Use “## Heading” for sections. Place the cursor where an image should appear, then upload it below.</small></label>
            <div className="admin-inline-media" aria-busy={inlineUploadBusy}><label>Inline article images (optional)<input type="file" accept="image/png,image/jpeg,image/webp" multiple disabled={inlineUploadBusy} onChange={insertArticleImages} /></label><p>Uploaded images are inserted at the cursor. Edit the text in square brackets to change the caption.</p></div>
            <label>Cover image (optional)<input name="image" type="file" accept="image/png,image/jpeg,image/webp" /></label>
            {post.imageUrl ? <label className="check"><input name="removeImage" type="checkbox" /> Remove current cover image</label> : null}
            <label>Publish date<input name="publishedAt" type="date" required defaultValue={post.publishedAt} /></label>
            <label className="check"><input name="featured" type="checkbox" defaultChecked={Boolean(post.featured)} /> Featured article</label>
            <label className="check"><input name="published" type="checkbox" defaultChecked={Boolean(post.published)} /> Published</label>
            <div className="admin-form-actions"><button className="admin-primary" disabled={inlineUploadBusy}>Save post</button>{post.id ? <button type="button" onClick={() => setPost(emptyPost)}>Cancel</button> : null}</div>
          </form>
        </div>}
        {tab === 'messages' && <div className="message-list">{messages.length ? messages.map((item) => <article key={item.id}><header><div><h3>{item.name}</h3><a href={'mailto:' + item.email}>{item.email}</a></div><time>{new Date(item.createdAt).toLocaleString('en-IN')}</time></header><p><strong>{item.service}</strong>{item.budget ? ' · ' + item.budget : ''}</p><p>{item.message}</p></article>) : <p>No enquiries yet.</p>}</div>}
      </section>
    </div>
  );
}
