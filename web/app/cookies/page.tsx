import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = { title: 'Cookie Policy — Daily Solace Journal' };

export default function CookiesPage() {
  return (
    <>
      <div className="page-header">
        <div className="container">
          <span className="section-label">Legal</span>
          <h1>Cookie Policy</h1>
          <p style={{ color: 'rgba(255,255,255,0.7)', marginTop: '0.75rem' }}>
            Understanding how and why we use cookies on our platform.
          </p>
        </div>
      </div>

      <section style={{ background: 'var(--gray-50)', padding: '4rem 0' }}>
        <div className="container" style={{ maxWidth: 800 }}>
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            
            <div>
              <h3 style={{ marginBottom: '1rem', color: 'var(--navy)' }}>What Are Cookies?</h3>
              <p style={{ color: 'var(--gray-600)', lineHeight: 1.8 }}>
                Cookies are small text files that are placed on your computer or mobile device when you visit our website. They are widely used to make websites work more efficiently and provide information to the owners of the site.
              </p>
            </div>

            <div>
              <h3 style={{ marginBottom: '1rem', color: 'var(--navy)' }}>How We Use Cookies</h3>
              <p style={{ color: 'var(--gray-600)', lineHeight: 1.8, marginBottom: '1rem' }}>
                We use cookies for the following purposes:
              </p>
              <ul style={{ color: 'var(--gray-600)', lineHeight: 1.8, paddingLeft: '1.5rem' }}>
                <li><strong>Essential Cookies:</strong> Required for the operation of our platform, such as keeping you logged in to the author or reviewer portal.</li>
                <li><strong>Analytical Cookies:</strong> Help us understand how visitors interact with our website by collecting and reporting information anonymously (e.g., article view counts).</li>
                <li><strong>Functional Cookies:</strong> Allow the website to remember choices you make (such as your preferred language or region) and provide enhanced features.</li>
              </ul>
            </div>

            <div>
              <h3 style={{ marginBottom: '1rem', color: 'var(--navy)' }}>Managing Cookies</h3>
              <p style={{ color: 'var(--gray-600)', lineHeight: 1.8 }}>
                Most web browsers allow some control of most cookies through the browser settings. To find out more about cookies, including how to see what cookies have been set and how to manage and delete them, visit <a href="https://www.aboutcookies.org" target="_blank" rel="noreferrer" style={{ color: 'var(--gold)', textDecoration: 'underline' }}>aboutcookies.org</a>.
              </p>
              <p style={{ color: 'var(--gray-600)', lineHeight: 1.8, marginTop: '0.5rem' }}>
                Please note that blocking essential cookies may prevent you from using our submission and peer review portals.
              </p>
            </div>

          </div>
        </div>
      </section>
    </>
  );
}
