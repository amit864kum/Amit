'use client';

import Image from 'next/image';
import { Maximize2, X } from 'lucide-react';
import { createPortal } from 'react-dom';
import { useEffect, useRef, useState } from 'react';

type ProjectImageViewerProps = {
  src: string;
  alt: string;
};

export default function ProjectImageViewer({ src, alt }: ProjectImageViewerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const trigger = triggerRef.current;
    const page = document.getElementById('main-content');
    const previousOverflow = document.body.style.overflow;
    const wasInert = page?.hasAttribute('inert') || false;
    const previousAriaHidden = page?.getAttribute('aria-hidden');
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();
    page?.setAttribute('inert', '');
    page?.setAttribute('aria-hidden', 'true');

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false);
      if (event.key === 'Tab') {
        const focusable = Array.from(dialogRef.current?.querySelectorAll<HTMLElement>('button, a[href], input, select, textarea, [tabindex]:not([tabindex="-1"])') || []).filter((element) => !element.hasAttribute('disabled'));
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
      if (!wasInert) page?.removeAttribute('inert');
      if (previousAriaHidden === null) page?.removeAttribute('aria-hidden');
      else page?.setAttribute('aria-hidden', previousAriaHidden);
      trigger?.focus();
    };
  }, [isOpen]);

  return (
    <>
      <button
        ref={triggerRef}
        className="project-walkthrough-image-link"
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label={`Open ${alt} at full size`}
      >
        <Image
          src={src}
          alt={alt}
          fill
          sizes="(max-width: 800px) 94vw, (max-width: 1600px) 88vw, 1500px"
          loading="lazy"
          unoptimized={src.startsWith('/api/media/')}
        />
        <span><Maximize2 aria-hidden="true" /> Open full image</span>
      </button>

      {isOpen && typeof document !== 'undefined' ? createPortal(
        <div
          className="project-image-viewer-overlay"
          onMouseDown={(event) => {
            if (event.currentTarget === event.target) setIsOpen(false);
          }}
        >
          <div
            ref={dialogRef}
            className="project-image-viewer-dialog"
            role="dialog"
            aria-modal="true"
            aria-label={`Full-size view of ${alt}`}
          >
            <button
              ref={closeRef}
              className="project-image-viewer-close"
              type="button"
              onClick={() => setIsOpen(false)}
            >
              <X aria-hidden="true" /> Close
            </button>
            <div className="project-image-viewer-canvas">
              <Image src={src} alt={alt} fill sizes="100vw" priority unoptimized={src.startsWith('/api/media/')} />
            </div>
          </div>
        </div>,
        document.body,
      ) : null}
    </>
  );
}
