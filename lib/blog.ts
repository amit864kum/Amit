export function readingTime(body: string) {
  const words = body.trim().split(/\s+/).filter(Boolean).length;
  return { words, minutes: Math.max(1, Math.ceil(words / 210)) };
}
export function headingId(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-');
}
export function articleImage(value: string) {
  const match = value.trim().match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
  if (!match) return null;
  const src = match[2].trim();
  if (!src.startsWith('/api/media/')) return null;
  return { src, alt: match[1].trim() || 'Article image' };
}

export type ArticleBlock = {
  id: string;
  type: 'heading' | 'paragraph' | 'image';
  heading?: string;
  text?: string;
  imageUrl?: string;
  imageHeading?: string;
  imageDescription?: string;
  alt?: string;
};

export function articleBlocks(contentJson: string | null | undefined, body: string): ArticleBlock[] {
  if (contentJson) {
    try {
      const parsed = JSON.parse(contentJson) as unknown;
      if (Array.isArray(parsed)) {
        const blocks = parsed.flatMap((value, index): ArticleBlock[] => {
          if (!value || typeof value !== 'object') return [];
          const candidate = value as Partial<ArticleBlock>;
          if (!['heading', 'paragraph', 'image'].includes(candidate.type || '')) return [];
          const id = typeof candidate.id === 'string' && candidate.id ? candidate.id : `block-${index + 1}`;
          if (candidate.type === 'heading') return [{ id, type: 'heading', heading: String(candidate.heading || '').slice(0, 160) }];
          if (candidate.type === 'paragraph') return [{ id, type: 'paragraph', text: String(candidate.text || '').slice(0, 12000) }];
          const imageUrl = String(candidate.imageUrl || '');
          if (imageUrl && !imageUrl.startsWith('/api/media/')) return [];
          return [{
            id,
            type: 'image',
            imageUrl,
            imageHeading: String(candidate.imageHeading || '').slice(0, 160),
            imageDescription: String(candidate.imageDescription || '').slice(0, 1000),
            alt: String(candidate.alt || '').slice(0, 240),
          }];
        });
        if (blocks.length) return blocks;
      }
    } catch { /* Fall back to the legacy body format. */ }
  }

  return articleSections(body).flatMap((section, sectionIndex) => {
    const blocks: ArticleBlock[] = [{ id: `legacy-heading-${sectionIndex}`, type: 'heading', heading: section.heading }];
    section.paragraphs.forEach((paragraph, paragraphIndex) => {
      const image = articleImage(paragraph);
      blocks.push(image
        ? { id: `legacy-image-${sectionIndex}-${paragraphIndex}`, type: 'image', imageUrl: image.src, alt: image.alt, imageDescription: image.alt }
        : { id: `legacy-paragraph-${sectionIndex}-${paragraphIndex}`, type: 'paragraph', text: paragraph });
    });
    return blocks;
  });
}

export function blocksToBody(blocks: ArticleBlock[]) {
  return blocks.map((block) => {
    if (block.type === 'heading') return `## ${block.heading || ''}`;
    if (block.type === 'paragraph') return block.text || '';
    return [block.imageHeading, block.imageDescription, block.alt].filter(Boolean).join(' ');
  }).filter(Boolean).join('\n\n');
}

export function blockSections(blocks: ArticleBlock[]) {
  const sections: Array<{ id: string; heading: string; blocks: ArticleBlock[] }> = [];
  let current = { id: 'the-note', heading: 'The note', blocks: [] as ArticleBlock[] };
  blocks.forEach((block) => {
    if (block.type === 'heading') {
      if (current.blocks.length || sections.length) sections.push(current);
      const heading = block.heading?.trim() || 'Untitled section';
      current = { id: headingId(heading) || `section-${sections.length + 1}`, heading, blocks: [] };
    } else {
      current.blocks.push(block);
    }
  });
  if (current.blocks.length || !sections.length) sections.push(current);
  return sections;
}
export function articleSections(body: string) {
  const sections: Array<{ heading: string; id: string; paragraphs: string[] }> = [];
  let current = { heading: 'The note', id: 'the-note', paragraphs: [] as string[] };
  let paragraph: string[] = [];
  const flushParagraph = () => {
    if (paragraph.length) current.paragraphs.push(paragraph.join(' '));
    paragraph = [];
  };
  for (const rawLine of body.split('\n')) {
    const line = rawLine.trim();
    if (line.startsWith('## ')) {
      flushParagraph();
      if (current.paragraphs.length) sections.push(current);
      const heading = line.slice(3).trim();
      current = { heading, id: headingId(heading), paragraphs: [] };
    } else if (!line) {
      flushParagraph();
    } else {
      paragraph.push(line);
    }
  }
  flushParagraph();
  if (current.paragraphs.length || !sections.length) sections.push(current);
  return sections;
}
