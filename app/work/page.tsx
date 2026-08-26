import Link from 'next/link';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import { getProjects } from '@/lib/content';

export const dynamic = 'force-dynamic';
export default async function WorkPage() {
  const projects = await getProjects();
  return (
    <main className="inner-page">
      <SiteHeader solid />
      <section className="page-hero">
        <p className="eyebrow">Selected case studies</p>
        <h1>Work that moves<br /><span className="serif-line">ideas <em>forward.</em></span></h1>
        <p>Digital products spanning full-stack engineering, applied AI, blockchain, and research.</p>
      </section>
      <section className="work-list">
        {projects.map((project, index) => (
          <Link href={'/work/' + project.slug} className="work-row" key={project.id}>
            <span>{String(index + 1).padStart(2, '0')}</span>
            <div className="work-thumb">
              {project.imageUrl ? <img src={project.imageUrl} alt="" /> : <span>Image ready<br />for CMS upload</span>}
            </div>
            <div><p>{project.category} · {project.year}</p><h2>{project.title}</h2><p>{project.summary}</p></div>
            <b>↗</b>
          </Link>
        ))}
      </section>
      <SiteFooter />
    </main>
  );
}
