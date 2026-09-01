'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';
import { CheckCircle2, FileText, FolderKanban, RefreshCw, UploadCloud } from 'lucide-react';
import type { ResumeSettings } from '@/lib/content';

export default function ResumeManager({ resume, projectCount }: { resume: ResumeSettings; projectCount: number }) {
  const router = useRouter();
  const fileInput = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);

  async function save(formData: FormData) {
    setBusy(true);
    setStatus('Saving résumé settings…');
    try {
      const file = formData.get('resume') as File;
      let resumeUrl = resume.resumeUrl;
      let fileName = resume.fileName;
      if (file?.size) {
        const upload = new FormData();
        upload.set('file', file);
        const uploadResponse = await fetch('/api/admin/upload', { method: 'POST', body: upload });
        if (!uploadResponse.ok) throw new Error((await uploadResponse.json() as { error?: string }).error || 'Upload failed');
        resumeUrl = (await uploadResponse.json() as { url: string }).url;
        fileName = file.name;
      }
      const response = await fetch('/api/admin/resume', {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ resumeUrl, fileName, buttonLabel: formData.get('buttonLabel') }),
      });
      if (!response.ok) throw new Error((await response.json() as { error?: string }).error || 'Save failed');
      if (fileInput.current) fileInput.current.value = '';
      setStatus('Resume section updated successfully.');
      router.refresh();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Could not update the résumé.');
    } finally {
      setBusy(false);
    }
  }

  return <section className="studio-resume-grid">
    <form className="studio-panel studio-resume-editor" action={save} aria-busy={busy}>
      <header><div><small>Resume document</small><h2>Public download</h2></div><FileText aria-hidden="true" /></header>
      <div className="studio-form-grid">
        <div className="studio-resume-current full">
          <span><FileText aria-hidden="true" /></span>
          <div><small>Current file</small><strong>{resume.fileName}</strong><a href={resume.resumeUrl} target="_blank">Open current PDF</a></div>
          <CheckCircle2 aria-label="Active resume" />
        </div>
        <label className="full studio-file-field">Replace PDF
          <input ref={fileInput} name="resume" type="file" accept="application/pdf,.pdf" />
          <small>PDF only, up to 10 MB. Leave empty to keep the current file.</small>
        </label>
        <label className="full">Download button text
          <input name="buttonLabel" required maxLength={40} defaultValue={resume.buttonLabel} />
          <small>This label appears beside the download icon on the About page.</small>
        </label>
      </div>
      <footer className="studio-editor-foot"><span role="status" aria-live="polite">{status || 'Changes appear on the About page after saving.'}</span><button className="studio-save" disabled={busy}>{busy ? 'Saving…' : 'Save resume'}</button></footer>
    </form>

    <aside className="studio-resume-side">
      <article className="studio-panel studio-resume-stat">
        <header><div><small>Automatic statistic</small><h2>Published projects</h2></div><FolderKanban aria-hidden="true" /></header>
        <div><strong>{String(projectCount).padStart(2, '0')}</strong><span><RefreshCw aria-hidden="true" />Live from Projects</span></div>
        <p>This number is counted directly from the Projects page. Add or remove a project there and the About page updates automatically—no manual entry is needed.</p>
        <Link href="/admin/projects">Manage projects</Link>
      </article>
      <article className="studio-resume-note"><UploadCloud aria-hidden="true" /><div><strong>One source of truth</strong><p>The PDF is managed here; the project total is managed by your project collection.</p></div></article>
    </aside>
  </section>;
}
