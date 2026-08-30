'use client';

import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { Cookie, ShieldCheck, X } from 'lucide-react';
import type { AnalyticsEventInput } from '@/lib/analytics';

type Consent = 'accepted' | 'rejected' | null;
type TrackDetail = { eventType: 'project_intent' | 'contact_intent' | 'contact_submitted'; section?: string };

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

const reasons = ['Hiring', 'Freelance project', 'Collaboration', 'Research', 'Just exploring'];

function getCookie(name: string) {
  return document.cookie.split('; ').find((row) => row.startsWith(`${name}=`))?.split('=').slice(1).join('=') || '';
}
function setCookie(name: string, value: string, days = 180) {
  document.cookie = `${name}=${encodeURIComponent(value)};path=/;max-age=${days * 86400};samesite=lax`;
}
function sourceFrom(referrer: string, params: URLSearchParams) {
  const campaignSource = params.get('utm_source');
  if (campaignSource) return campaignSource;
  if (!referrer) return 'Direct';
  try {
    const host = new URL(referrer).hostname.replace(/^www\./, '');
    if (host.includes('google.')) return 'Google';
    if (host.includes('linkedin.')) return 'LinkedIn';
    if (host.includes('github.')) return 'GitHub';
    if (host.includes('instagram.')) return 'Instagram';
    return host;
  } catch { return 'Direct'; }
}

export default function PrivacyExperience({ measurementId }: { measurementId?: string }) {
  const pathname = usePathname();
  const [consent, setConsent] = useState<Consent>(null);
  const [bannerOpen, setBannerOpen] = useState(false);
  const [reason, setReason] = useState('');

  useEffect(() => {
    const open = () => setBannerOpen(true);
    window.addEventListener('ak-open-cookie-settings', open);
    const timer = window.setTimeout(() => {
      const value = decodeURIComponent(getCookie('ak_cookie_consent'));
      const current = value === 'accepted' || value === 'rejected' ? value : null;
      setConsent(current);
      setReason(decodeURIComponent(getCookie('ak_visit_reason')));
      setBannerOpen(!current && !location.pathname.startsWith('/admin'));
    }, 0);
    return () => { window.clearTimeout(timer); window.removeEventListener('ak-open-cookie-settings', open); };
  }, []);

  const choose = useCallback(async (choice: Exclude<Consent, null>) => {
    setCookie('ak_cookie_consent', choice);
    if (reason) setCookie('ak_visit_reason', reason);
    if (choice === 'accepted' && !getCookie('ak_analytics_id')) setCookie('ak_analytics_id', crypto.randomUUID());
    if (choice === 'rejected') document.cookie = 'ak_analytics_id=;path=/;max-age=0;samesite=lax';
    setConsent(choice); setBannerOpen(false);
    window.dispatchEvent(new CustomEvent('ak-consent-change', { detail: choice }));
    fetch('/api/analytics/consent', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ choice }), keepalive: true }).catch(() => undefined);
  }, [reason]);

  useEffect(() => {
    if (consent !== 'accepted' || pathname.startsWith('/admin')) return;
    const visitorId = decodeURIComponent(getCookie('ak_analytics_id')) || crypto.randomUUID();
    if (!getCookie('ak_analytics_id')) setCookie('ak_analytics_id', visitorId);
    let sessionId = sessionStorage.getItem('ak_analytics_session');
    if (!sessionId) { sessionId = crypto.randomUUID(); sessionStorage.setItem('ak_analytics_session', sessionId); }
    const params = new URLSearchParams(location.search);
    const visitReason = decodeURIComponent(getCookie('ak_visit_reason')) || 'Not provided';
    const device = innerWidth < 640 ? 'Mobile' : innerWidth < 1024 ? 'Tablet' : 'Desktop';
    const source = sourceFrom(document.referrer, params);
    const send = (eventType: AnalyticsEventInput['eventType'], section?: string) => {
      const payload = { eventKey: crypto.randomUUID(), visitorId, sessionId, eventType, path: pathname, section, referrer: document.referrer, source, medium: params.get('utm_medium') || '', campaign: params.get('utm_campaign') || '', reason: visitReason, device };
      fetch('/api/analytics/event', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload), keepalive: true }).catch(() => undefined);
      if (measurementId && window.gtag) window.gtag('event', eventType, { page_path: pathname, section_name: section });
    };

    if (measurementId && !document.querySelector(`script[data-ga4="${measurementId}"]`)) {
      const script = document.createElement('script'); script.async = true; script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`; script.dataset.ga4 = measurementId; document.head.appendChild(script);
      window.dataLayer = window.dataLayer || []; window.gtag = (...args: unknown[]) => window.dataLayer?.push(args);
      window.gtag('js', new Date()); window.gtag('config', measurementId, { send_page_view: false, anonymize_ip: true });
    }
    send('page_view');
    const seen = new Set<string>();
    const timer = window.setTimeout(() => {
      const sections = Array.from(document.querySelectorAll<HTMLElement>('main section, main [data-track-section]'));
      const observer = new IntersectionObserver((entries) => entries.forEach((entry) => {
        if (!entry.isIntersecting || entry.intersectionRatio < .45) return;
        const element = entry.target as HTMLElement;
        const heading = element.querySelector('h1,h2,h3')?.textContent?.trim();
        const label = element.dataset.trackSection || element.getAttribute('aria-label') || element.id || heading || `Section ${sections.indexOf(element) + 1}`;
        const key = `${pathname}:${label}`;
        if (!seen.has(key)) { seen.add(key); send('section_view', label.slice(0, 120)); }
      }), { threshold: [.45] });
      sections.forEach((section) => observer.observe(section));
      (window as Window & { __akObserver?: IntersectionObserver }).__akObserver = observer;
    }, 500);
    const custom = (event: Event) => { const detail = (event as CustomEvent<TrackDetail>).detail; if (detail?.eventType) send(detail.eventType, detail.section); };
    const click = (event: MouseEvent) => {
      const anchor = (event.target as Element | null)?.closest('a');
      const href = anchor?.getAttribute('href') || '';
      if (href.startsWith('/projects/')) send('project_intent', anchor?.textContent?.trim().slice(0, 100));
      else if (href === '/contact' || href.startsWith('mailto:')) send('contact_intent', anchor?.textContent?.trim().slice(0, 100));
    };
    window.addEventListener('ak-track', custom); document.addEventListener('click', click);
    return () => { clearTimeout(timer); (window as Window & { __akObserver?: IntersectionObserver }).__akObserver?.disconnect(); window.removeEventListener('ak-track', custom); document.removeEventListener('click', click); };
  }, [consent, measurementId, pathname]);

  if (!bannerOpen || pathname.startsWith('/admin')) return null;
  return <section className="cookie-consent" role="dialog" aria-modal="true" aria-labelledby="cookie-title">
    <button className="cookie-close" type="button" onClick={() => setBannerOpen(false)} aria-label="Close cookie settings"><X /></button>
    <div className="cookie-icon"><ShieldCheck aria-hidden="true" /></div>
    <div className="cookie-copy"><span><Cookie aria-hidden="true" /> Privacy controls</span><h2 id="cookie-title">Your visit, your choice.</h2><p>Accept anonymous analytics to help Amit understand which work people value. Rejecting keeps only the essential consent cookie.</p></div>
    <fieldset><legend>What brings you here? <small>Optional</small></legend><div>{reasons.map((item) => <label key={item} className={reason === item ? 'selected' : ''}><input type="radio" name="visit-reason" value={item} checked={reason === item} onChange={() => setReason(item)} /><span>{item}</span></label>)}</div></fieldset>
    <div className="cookie-actions"><button type="button" onClick={() => choose('rejected')}>Reject non-essential</button><button type="button" className="cookie-accept" onClick={() => choose('accepted')}>Accept analytics</button></div>
  </section>;
}
