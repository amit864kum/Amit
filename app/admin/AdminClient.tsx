'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Post, Project } from '@/lib/content';

type Message = { id: number; name: string; email: string; service: string; budget: string | null; message: string; createdAt: string; status: string };
const emptyProject = { id: 0, slug: '', title: '', category: '', summary: '', body: '', tech: '', year: new Date().getFullYear().toString(), imageUrl: '', projectUrl: '', githubUrl: '', featured: 0 };
const emptyPost = { id: 0, slug: '', title: '', excerpt: '', body: '', publishedAt: new Date().toISOString().slice(0,10), published: 1 };

export default function AdminClient({ projects, posts, messages }: { projects: Project[]; posts: Post[]; messages: Message[] }) {
  const router = useRouter();
  const [tab, setTab] = useState<'projects'|'posts'|'messages'>('projects');
  const [project, setProject] = useState<any>(emptyProject);
  const [post, setPost] = useState<any>(emptyPost);
  const [status, setStatus] = useState('');

  async function uploadImage(file?: File) {
    if (!file || !file.size) return project.imageUrl || null;
    const body = new FormData(); body.set('file', file);
    const response = await fetch('/api/admin/upload', { method: 'POST', body });
    if (!response.ok) throw new Error('Upload failed');
    return ((await response.json()) as { url: string }).url;
  }
  async function saveProject(form: FormData) {
    setStatus('Saving project…');
    try {
      const imageUrl = await uploadImage(form.get('image') as File);
      const body = Object.fromEntries(form.entries()); delete body.image;
      const response = await fetch('/api/admin/projects', { method: project.id ? 'PATCH' : 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ ...body, id: project.id, imageUrl, featured: form.get('featured') ? 1 : 0 }) });
      if (!response.ok) throw new Error('Save failed');
      setProject(emptyProject); setStatus('Project saved.'); router.refresh();
    } catch { setStatus('Could not save the project.'); }
  }
  async function savePost(form: FormData) {
    setStatus('Saving post…');
    const body = Object.fromEntries(form.entries());
    const response = await fetch('/api/admin/posts', { method: post.id ? 'PATCH' : 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ ...body, id: post.id, published: form.get('published') ? 1 : 0 }) });
    if (response.ok) { setPost(emptyPost); setStatus('Post saved.'); router.refresh(); } else setStatus('Could not save the post.');
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
        <button className={tab === 'posts' ? 'active' : ''} onClick={() => setTab('posts')}>Journal <span>{posts.length}</span></button>
        <button className={tab === 'messages' ? 'active' : ''} onClick={() => setTab('messages')}>Enquiries <span>{messages.length}</span></button>
        <a href="/">View portfolio ↗</a>
      </aside>
      <section className="admin-content">
        <header><div><p>Portfolio management</p><h1>{tab === 'projects' ? 'Projects' : tab === 'posts' ? 'Journal posts' : 'Enquiries'}</h1></div><span className="admin-status">{status}</span></header>
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
            <label>Excerpt<textarea name="excerpt" required rows={3} defaultValue={post.excerpt} /></label><label>Article<textarea name="body" required rows={10} defaultValue={post.body} /></label>
            <label>Publish date<input name="publishedAt" type="date" required defaultValue={post.publishedAt} /></label><label className="check"><input name="published" type="checkbox" defaultChecked={Boolean(post.published)} /> Published</label>
            <div className="admin-form-actions"><button className="admin-primary">Save post</button>{post.id ? <button type="button" onClick={() => setPost(emptyPost)}>Cancel</button> : null}</div>
          </form>
        </div>}
        {tab === 'messages' && <div className="message-list">{messages.length ? messages.map((item) => <article key={item.id}><header><div><h3>{item.name}</h3><a href={'mailto:' + item.email}>{item.email}</a></div><time>{new Date(item.createdAt).toLocaleString('en-IN')}</time></header><p><strong>{item.service}</strong>{item.budget ? ' · ' + item.budget : ''}</p><p>{item.message}</p></article>) : <p>No enquiries yet.</p>}</div>}
      </section>
    </div>
  );
}
