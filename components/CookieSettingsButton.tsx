'use client';

export default function CookieSettingsButton() {
  return <button className="footer-cookie-button" type="button" onClick={() => window.dispatchEvent(new Event('ak-open-cookie-settings'))}>Cookie settings</button>;
}
