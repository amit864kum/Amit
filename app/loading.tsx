export default function Loading() {
  return (
    <div className="site-loader" role="status" aria-live="polite" aria-label="Loading page">
      <div className="site-loader__progress" aria-hidden="true"><i /></div>
      <div className="site-loader__shell" aria-hidden="true">
        <header className="site-loader__nav">
          <span className="site-loader__brand">AK<i /></span>
          <div><i /><i /><i /><i /></div>
          <b />
        </header>
        <main className="site-loader__hero">
          <section>
            <span className="site-loader__eyebrow" />
            <span className="site-loader__headline is-long" />
            <span className="site-loader__headline" />
            <span className="site-loader__headline is-accent" />
            <span className="site-loader__body is-long" />
            <span className="site-loader__body" />
            <span className="site-loader__button" />
          </section>
          <figure><i /></figure>
        </main>
      </div>
      <span className="sr-only">Loading page…</span>
    </div>
  );
}
