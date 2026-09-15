'use client';

import { AlertTriangle, X } from 'lucide-react';
import { useEffect, useRef } from 'react';

export default function ConfirmDialog({ open, title, description, confirmLabel = 'Delete permanently', busy = false, onCancel, onConfirm }: {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  busy?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const cancelRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!open) return;
    cancelRef.current?.focus();
    const close = (event: KeyboardEvent) => { if (event.key === 'Escape' && !busy) onCancel(); };
    window.addEventListener('keydown', close);
    return () => window.removeEventListener('keydown', close);
  }, [open, busy, onCancel]);
  if (!open) return null;
  return <div className="studio-dialog-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && !busy) onCancel(); }}>
    <section className="studio-dialog" role="alertdialog" aria-modal="true" aria-labelledby="studio-dialog-title" aria-describedby="studio-dialog-description">
      <header><span><AlertTriangle aria-hidden="true" /></span><button type="button" onClick={onCancel} disabled={busy} aria-label="Close confirmation"><X aria-hidden="true" /></button></header>
      <h2 id="studio-dialog-title">{title}</h2>
      <p id="studio-dialog-description">{description}</p>
      <footer><button ref={cancelRef} type="button" onClick={onCancel} disabled={busy}>Cancel</button><button className="danger" type="button" onClick={onConfirm} disabled={busy}>{busy ? 'Deleting…' : confirmLabel}</button></footer>
    </section>
  </div>;
}
