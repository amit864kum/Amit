export function readingTime(body: string) {
  const words = body.trim().split(/\s+/).filter(Boolean).length;
  return { words, minutes: Math.max(1, Math.ceil(words / 210)) };
}
export function headingId(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-');
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
