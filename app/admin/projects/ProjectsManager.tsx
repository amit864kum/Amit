'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ArrowDown, ArrowUp, Edit3, ExternalLink, Heading2, ImagePlus, Pilcrow, Plus, Star, Trash2, UploadCloud } from 'lucide-react';
import { useState, type ChangeEvent } from 'react';
import type { Project } from '@/lib/content';
import { articleBlocks, type ArticleBlock } from '@/lib/blog';
import { toProjectSlug } from '@/lib/slug';
import { projectDetails, type ProjectDetailSettings } from '@/lib/project-details';
import { useUnsavedChanges } from '@/app/admin/_components/useUnsavedChanges';

const blank: Project = { id: 0, slug: '', title: '', category: '', summary: '', body: '', contentJson: null, tech: '', year: new Date().getFullYear().toString(), imageUrl: '', projectUrl: '', githubUrl: '', featured: 0, destination: 'case_study', published: 1, showOnProjects: 1, detailJson: null, displayOrder: 0 };

function blockId() { return crypto.randomUUID(); }
function destinationHref(item: Project) {
  if (!item.published) return null;
  if (item.destination === 'live') return item.projectUrl;
  if (item.destination === 'github') return item.githubUrl;
  return `/projects/${toProjectSlug(item.slug || item.title)}`;
}
const formText = (form: FormData, name: string) => String(form.get(name) || '').trim();
function detailSettingsFromForm(form: FormData): ProjectDetailSettings {
  return {
    contextHeading: formText(form, 'detailContextHeading'), contextAccent: formText(form, 'detailContextAccent'), contextDescription: formText(form, 'detailContextDescription'), designIntent: formText(form, 'detailDesignIntent'),
    walkthroughHeading: formText(form, 'detailWalkthroughHeading'), walkthroughAccent: formText(form, 'detailWalkthroughAccent'), walkthroughDescription: formText(form, 'detailWalkthroughDescription'),
    systemHeading: formText(form, 'detailSystemHeading'), systemAccent: formText(form, 'detailSystemAccent'), systemDescription: formText(form, 'detailSystemDescription'),
    systemSteps: Array.from({ length: 3 }, (_, index) => ({ label: formText(form, `detailStepLabel${index}`), title: formText(form, `detailStepTitle${index}`), description: formText(form, `detailStepDescription${index}`) })),
    principles: Array.from({ length: 3 }, (_, index) => ({ title: formText(form, `detailPrincipleTitle${index}`), description: formText(form, `detailPrincipleDescription${index}`) })),
    ctaEyebrow: formText(form, 'detailCtaEyebrow'), ctaHeading: formText(form, 'detailCtaHeading'), ctaAccent: formText(form, 'detailCtaAccent'),
  };
}
function starterBlocks(): ArticleBlock[] {
  return [
    { id: 'draft-project-heading', type: 'heading', heading: '' },
    { id: 'draft-project-paragraph', type: 'paragraph', text: '' },
  ];
}

export default function ProjectsManager({ projects }: { projects: Project[] }) {
  const router = useRouter();
  const [project, setProject] = useState<Project>(blank);
  const [blocks, setBlocks] = useState<ArticleBlock[]>(starterBlocks);
  const [status, setStatus] = useState('');
  const [uploadingBlock, setUploadingBlock] = useState<string | null>(null);
  const [editorVersion, setEditorVersion] = useState(0);
  const [dirty, setDirty] = useState(false);
  const [orderedProjects, setOrderedProjects] = useState(projects);
  const [orderStatus, setOrderStatus] = useState('Use the arrows to set the public display order.');
  const [orderPending, setOrderPending] = useState(false);
  const featured = orderedProjects.filter((item) => item.featured).length;
  const categories = new Set(orderedProjects.map((item) => item.category)).size;
  const detailSettings = projectDetails(project.detailJson);

  async function upload(file: File | null | undefined, current?: string | null) {
    if (!file?.size) return current || null;
    const body = new FormData();
    body.set('file', file);
    const response = await fetch('/api/admin/upload', { method: 'POST', body });
    if (!response.ok) throw new Error('Upload failed');
    return ((await response.json()) as { url: string }).url;
  }

  useUnsavedChanges(dirty);
  function markDirty() { setDirty(true); setStatus(''); }

  function resetEditor(force = false) {
    if (!force && dirty && !confirm('Discard the unsaved project changes?')) return;
    setProject(blank);
    setBlocks(starterBlocks());
    setStatus('');
    setDirty(false);
    setEditorVersion((current) => current + 1);
  }

  function editProject(item: Project) {
    if (dirty && !confirm('Discard the unsaved project changes and open another project?')) return;
    setProject({ ...item, slug: toProjectSlug(item.slug || item.title), imageUrl: item.imageUrl || '' });
    setBlocks(item.contentJson ? articleBlocks(item.contentJson, '') : []);
    setStatus('');
    setDirty(false);
    setEditorVersion((current) => current + 1);
    document.getElementById('project-editor')?.scrollIntoView({ behavior: 'smooth' });
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
    setStatus('Uploading project screenshot…');
    try {
      const imageUrl = await upload(file);
      updateBlock(block.id, { imageUrl: imageUrl || '', alt: block.alt || file.name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ') });
      setStatus('Screenshot added. Add its heading, details, and alt text.');
    } catch {
      setStatus('Could not upload this screenshot. Use a PNG, JPEG, or WebP under 8 MB.');
    } finally {
      setUploadingBlock(null);
    }
  }

  async function save(formData: FormData) {
    const incompleteBlock = blocks.find((block) =>
      (block.type === 'heading' && !block.heading?.trim())
      || (block.type === 'paragraph' && !block.text?.trim())
      || (block.type === 'image' && (!block.imageUrl || !block.alt?.trim())),
    );
    if (incompleteBlock) {
      setStatus(incompleteBlock.type === 'image' ? 'Every screenshot needs an uploaded image and descriptive alt text.' : 'Complete or remove every empty content block.');
      document.getElementById(`project-block-${incompleteBlock.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    if (blocks.length && !blocks.some((block) => block.type === 'heading')) {
      setStatus('Add at least one section heading, or remove the optional content blocks.');
      return;
    }
    setStatus('Saving project…');
    try {
      const imageUrl = formData.get('removeImage') ? null : await upload(formData.get('image') as File, project.imageUrl);
      const fields = Object.fromEntries(formData.entries());
      delete fields.image;
      delete fields.removeImage;
      fields.slug = toProjectSlug(String(fields.slug || fields.title || ''));
      const response = await fetch('/api/admin/projects', {
        method: project.id ? 'PATCH' : 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          ...fields,
          id: project.id,
          contentJson: blocks.length ? JSON.stringify(blocks) : null,
          detailJson: JSON.stringify(detailSettingsFromForm(formData)),
          imageUrl,
          featured: formData.get('featured') ? 1 : 0,
          published: formData.get('published') ? 1 : 0,
          showOnProjects: formData.get('showOnProjects') ? 1 : 0,
        }),
      });
      if (!response.ok) throw new Error('Save failed');
      resetEditor(true);
      setStatus('Project and content sections saved successfully.');
      router.refresh();
    } catch {
      setStatus('Could not save this project.');
    }
  }

  async function remove(id: number) {
    if (!confirm('Delete this project permanently?')) return;
    const response = await fetch('/api/admin/projects', { method: 'DELETE', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ id }) });
    if (response.ok) { if (project.id === id) resetEditor(true); setStatus('Project deleted.'); router.refresh(); }
    else setStatus('Could not delete this project. Please try again.');
  }

  async function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= orderedProjects.length || orderPending) return;
    const previous = orderedProjects;
    const next = [...orderedProjects];
    [next[index], next[target]] = [next[target], next[index]];
    setOrderedProjects(next);
    setOrderPending(true);
    setOrderStatus('Saving display order…');
    try {
      const response = await fetch('/api/admin/projects', { method: 'PUT', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ ids: next.map((item) => item.id) }) });
      if (!response.ok) throw new Error('Reorder failed');
      setOrderStatus('Display order saved.');
      router.refresh();
    } catch {
      setOrderedProjects(previous);
      setOrderStatus('Could not save the order. Please try again.');
    } finally { setOrderPending(false); }
  }

  return <>
    <section className="studio-mini-stats" aria-label="Project statistics"><article><span>Total projects</span><strong>{orderedProjects.length}</strong></article><article><span>Homepage features</span><strong>{featured}</strong></article><article><span>Disciplines covered</span><strong>{categories}</strong></article><article><span>Portfolio coverage</span><strong>{orderedProjects.length ? Math.round(featured / orderedProjects.length * 100) : 0}%</strong></article></section>
    <div className="studio-manager-grid studio-project-manager">
      <section className="studio-records" aria-label="Projects"><div className="studio-section-title"><div><small>Portfolio inventory</small><h2>Published work</h2></div><span>{orderedProjects.length} records</span></div>
        <div className="studio-order-help"><div><strong>Public display order</strong><p>Position 01 appears first in the project collection.</p></div><span aria-live="polite">{orderStatus}</span></div>
        <div className="studio-record-list">{orderedProjects.map((item, index) => { const href = destinationHref(item); return <article key={item.id}><span className="studio-record-index">{String(index + 1).padStart(2, '0')}</span><div className="studio-record-copy"><div><small>{item.category} · {item.year} · {item.published ? item.destination.replace('_', ' ') : 'draft'}</small>{item.featured ? <b><Star /> Featured</b> : null}</div><h3>{item.title}</h3><p>{item.summary}</p><div className="studio-tech-preview">{item.tech.split(',').slice(0, 3).map((tech) => <span key={tech}>{tech.trim()}</span>)}</div></div><div className="studio-order-controls" aria-label={`Change display position for ${item.title}`}><button type="button" onClick={() => move(index, -1)} disabled={index === 0 || orderPending} aria-label={`Move ${item.title} up`} title="Move up"><ArrowUp /></button><button type="button" onClick={() => move(index, 1)} disabled={index === orderedProjects.length - 1 || orderPending} aria-label={`Move ${item.title} down`} title="Move down"><ArrowDown /></button></div><div className="studio-record-actions">{href ? <a href={href} target="_blank" rel="noreferrer" aria-label={`View ${item.title}`}><ExternalLink /></a> : null}<button type="button" onClick={() => editProject(item)} aria-label={`Edit ${item.title}`}><Edit3 /></button><button type="button" className="danger" onClick={() => remove(item.id)} aria-label={`Delete ${item.title}`}><Trash2 /></button></div></article>; })}</div>
      </section>

      <form id="project-editor" className="studio-editor studio-post-editor" action={save} onChange={markDirty} key={`${project.id}-${editorVersion}`}>
        <div className="studio-section-title"><div><small>{project.id ? 'Editing record' : 'New record'}</small><h2>{project.id ? project.title : 'Build a project story'}</h2></div>{project.id ? <button type="button" onClick={resetEditor}>Clear</button> : <ImagePlus />}</div>
        <div className="studio-form-grid studio-post-meta">
          <label className="full">Project title<input name="title" required defaultValue={project.title} /></label>
          <label>URL slug<input name="slug" required defaultValue={project.slug} placeholder="thermal-fluid-and-transport-laboratory" autoCapitalize="none" /><small>Spaces and capital letters are converted automatically.</small></label>
          <label>Year<input name="year" required defaultValue={project.year} /></label>
          <label className="full">Category<input name="category" required defaultValue={project.category} /></label>
          <label className="full">Short summary<textarea name="summary" required rows={3} defaultValue={project.summary} /></label>
          <label className="full">Case study overview<textarea name="body" required rows={7} defaultValue={project.body} /><small>This introductory narrative appears before the structured content sections below.</small></label>
          <label className="full">Technology stack<input name="tech" required defaultValue={project.tech} /></label>
          <label>Live URL<input name="projectUrl" type="url" defaultValue={project.projectUrl || ''} /></label>
          <label>GitHub URL<input name="githubUrl" type="url" defaultValue={project.githubUrl || ''} /></label>
          <label className="full">Project destination<select name="destination" defaultValue={project.destination}><option value="case_study">Dedicated case-study page</option><option value="live">Redirect to live URL</option><option value="github">Redirect to GitHub URL</option></select><small>The project card follows this destination. External destinations disable the dedicated public page.</small></label>
        </div>

        <section className="studio-block-builder" aria-labelledby="project-content-builder-title">
          <header><div><small>Project narrative</small><h3 id="project-content-builder-title">Content sections</h3><p>Arrange headings, paragraphs, and screenshots in the exact order they should appear on the public project page.</p></div><span>{blocks.length} blocks</span></header>
          <div className="studio-block-toolbar" aria-label="Add project content block">
            <button type="button" onClick={() => addBlock('heading')}><Heading2 /> Add heading</button>
            <button type="button" onClick={() => addBlock('paragraph')}><Pilcrow /> Add paragraph</button>
            <button type="button" onClick={() => addBlock('image')}><ImagePlus /> Add screenshot</button>
          </div>
          <div className="studio-block-list">
            {blocks.map((block, index) => <article id={`project-block-${block.id}`} className={`studio-content-block type-${block.type}`} key={block.id}>
              <header><div><span>{String(index + 1).padStart(2, '0')}</span><b>{block.type === 'heading' ? 'Section heading' : block.type === 'paragraph' ? 'Paragraph' : 'Project screenshot'}</b></div><div><button type="button" onClick={() => moveBlock(index, -1)} disabled={index === 0} aria-label={`Move content block ${index + 1} up`}><ArrowUp /></button><button type="button" onClick={() => moveBlock(index, 1)} disabled={index === blocks.length - 1} aria-label={`Move content block ${index + 1} down`}><ArrowDown /></button><button type="button" className="danger" onClick={() => { if (confirm(`Delete content block ${index + 1}?`)) { setBlocks((current) => current.filter((item) => item.id !== block.id)); markDirty(); } }} aria-label={`Delete content block ${index + 1}`}><Trash2 /></button></div></header>
              {block.type === 'heading' ? <label htmlFor={`project-heading-${block.id}`}>Heading<input id={`project-heading-${block.id}`} required value={block.heading || ''} onChange={(event) => updateBlock(block.id, { heading: event.target.value })} placeholder="A clear section heading" /></label> : null}
              {block.type === 'paragraph' ? <label htmlFor={`project-paragraph-${block.id}`}>Paragraph<textarea id={`project-paragraph-${block.id}`} required rows={6} value={block.text || ''} onChange={(event) => updateBlock(block.id, { text: event.target.value })} placeholder="Explain this part of the project…" /></label> : null}
              {block.type === 'image' ? <div className="studio-image-block">
                <div className={`studio-image-preview${block.imageUrl ? ' has-image' : ''}`}>{block.imageUrl ? <Image src={block.imageUrl} alt="" fill sizes="(max-width: 1180px) 100vw, 420px" unoptimized={block.imageUrl.startsWith('/api/media/')} /> : <><ImagePlus /><span>No screenshot uploaded</span></>}</div>
                <div className="studio-image-fields">
                  <label className="studio-block-upload"><span>{uploadingBlock === block.id ? 'Uploading…' : block.imageUrl ? 'Replace screenshot' : 'Upload screenshot'}</span><input type="file" accept="image/png,image/jpeg,image/webp" disabled={Boolean(uploadingBlock)} onChange={(event) => uploadBlockImage(block, event)} /><UploadCloud /></label>
                  <label htmlFor={`project-image-heading-${block.id}`}>Screenshot heading <small>Optional</small><input id={`project-image-heading-${block.id}`} value={block.imageHeading || ''} onChange={(event) => updateBlock(block.id, { imageHeading: event.target.value })} placeholder="What should viewers notice?" /></label>
                  <label htmlFor={`project-image-description-${block.id}`}>Details <small>Optional</small><textarea id={`project-image-description-${block.id}`} rows={3} value={block.imageDescription || ''} onChange={(event) => updateBlock(block.id, { imageDescription: event.target.value })} placeholder="Explain the workflow or decision shown here." /></label>
                  <label htmlFor={`project-image-alt-${block.id}`}>Alt text <small>Required</small><input id={`project-image-alt-${block.id}`} required value={block.alt || ''} onChange={(event) => updateBlock(block.id, { alt: event.target.value })} placeholder="Describe the screenshot for screen readers" /></label>
                </div>
              </div> : null}
            </article>)}
          </div>
          <button className="studio-add-block" type="button" onClick={() => addBlock('paragraph')}><Plus /> Continue with a paragraph</button>
        </section>

        <section className="studio-block-builder studio-detail-builder" aria-labelledby="project-detail-settings-title">
          <header><div><small>Case-study page</small><h3 id="project-detail-settings-title">Page-specific narrative</h3><p>Customize the fixed editorial sections for this project. Leave optional text empty to hide it.</p></div></header>
          <div className="studio-detail-grid">
            <fieldset><legend>Context section</legend><label>Heading<input name="detailContextHeading" defaultValue={detailSettings.contextHeading} /></label><label>Accent heading<input name="detailContextAccent" defaultValue={detailSettings.contextAccent} /></label><label>Description<textarea name="detailContextDescription" rows={3} defaultValue={detailSettings.contextDescription} /></label><label>Design intent<textarea name="detailDesignIntent" rows={3} defaultValue={detailSettings.designIntent} /></label></fieldset>
            <fieldset><legend>Walkthrough introduction</legend><label>Heading<input name="detailWalkthroughHeading" defaultValue={detailSettings.walkthroughHeading} /></label><label>Accent heading<input name="detailWalkthroughAccent" defaultValue={detailSettings.walkthroughAccent} /></label><label>Description<textarea name="detailWalkthroughDescription" rows={3} defaultValue={detailSettings.walkthroughDescription} /></label></fieldset>
            <fieldset><legend>System introduction</legend><label>Heading<input name="detailSystemHeading" defaultValue={detailSettings.systemHeading} /></label><label>Accent heading<input name="detailSystemAccent" defaultValue={detailSettings.systemAccent} /></label><label>Description<textarea name="detailSystemDescription" rows={3} defaultValue={detailSettings.systemDescription} /></label></fieldset>
            <fieldset className="full"><legend>Architecture steps</legend><div className="studio-repeat-grid">{detailSettings.systemSteps.map((step, index) => <section key={`detail-step-${index}`}><b>Step {index + 1}</b><label>Label<input name={`detailStepLabel${index}`} defaultValue={step.label} /></label><label>Title<input name={`detailStepTitle${index}`} defaultValue={step.title} /></label><label>Description<textarea name={`detailStepDescription${index}`} rows={3} defaultValue={step.description} /></label></section>)}</div></fieldset>
            <fieldset className="full"><legend>Engineering principles</legend><div className="studio-repeat-grid">{detailSettings.principles.map((principle, index) => <section key={`detail-principle-${index}`}><b>Principle {index + 1}</b><label>Title<input name={`detailPrincipleTitle${index}`} defaultValue={principle.title} /></label><label>Description<textarea name={`detailPrincipleDescription${index}`} rows={3} defaultValue={principle.description} /></label></section>)}</div></fieldset>
            <fieldset className="full"><legend>Closing call to action</legend><div className="studio-form-grid"><label className="full">Eyebrow<input name="detailCtaEyebrow" defaultValue={detailSettings.ctaEyebrow} /></label><label>Heading<input name="detailCtaHeading" defaultValue={detailSettings.ctaHeading} /></label><label>Accent heading<input name="detailCtaAccent" defaultValue={detailSettings.ctaAccent} /></label></div></fieldset>
          </div>
        </section>

        <div className="studio-form-grid studio-post-settings">
          <label className="full studio-file-field"><span>Main project screenshot</span><input name="image" type="file" accept="image/png,image/jpeg,image/webp" /><small>Optional cover-style screenshot shown near the top of the project page.</small></label>
          {project.imageUrl ? <label className="studio-check full"><input name="removeImage" type="checkbox" /> Remove current main screenshot</label> : null}
          <label className="studio-switch full"><input name="featured" type="checkbox" defaultChecked={Boolean(project.featured)} /><span /><div><strong>Feature on homepage</strong><small>Give this project priority in the public portfolio.</small></div></label>
          <label className="studio-switch full"><input name="showOnProjects" type="checkbox" defaultChecked={Boolean(project.showOnProjects)} /><span /><div><strong>Show on Projects page</strong><small>Display this card in the public project collection.</small></div></label>
          <label className="studio-switch full"><input name="published" type="checkbox" defaultChecked={Boolean(project.published)} /><span /><div><strong>Published</strong><small>Draft projects remain available only inside the admin panel.</small></div></label>
        </div>
        <div className="studio-editor-foot"><span aria-live="polite">{status || (dirty ? 'Unsaved changes' : 'All changes saved')}</span><button className="studio-save" type="submit" disabled={Boolean(uploadingBlock)}>{project.id ? 'Update project' : 'Publish project'}</button></div>
      </form>
    </div>
  </>;
}
