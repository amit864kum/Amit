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

  useEffect(() => {
    if (!isOpen) return;

    const trigger = triggerRef.current;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
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
              <Image src={src} alt={alt} fill sizes="100vw" priority />
            </div>
          </div>
        </div>,
        document.body,
      ) : null}
    </>
  );
}
