import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = { title: 'Terms of Service — Daily Solace Journal' };

export default function TermsPage() {
  return (
    <>
      <div className="page-header">
        <div className="container">
          <span className="section-label">Legal</span>
          <h1>Terms of Service</h1>
          <p style={{ color: 'rgba(255,255,255,0.7)', marginTop: '0.75rem' }}>
            Please read these terms carefully before using our platform.
          </p>
        </div>
      </div>

      <section style={{ background: 'var(--gray-50)', padding: '4rem 0' }}>
        <div className="container" style={{ maxWidth: 800 }}>
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            
            <div>
              <h3 style={{ marginBottom: '1rem', color: 'var(--navy)' }}>1. Acceptance of Terms</h3>
              <p style={{ color: 'var(--gray-600)', lineHeight: 1.8 }}>
                By accessing and using the Daily Solace Journal platform, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by these terms, please do not use this service.
              </p>
            </div>

            <div>
              <h3 style={{ marginBottom: '1rem', color: 'var(--navy)' }}>2. Author Responsibilities</h3>
              <p style={{ color: 'var(--gray-600)', lineHeight: 1.8 }}>
                Authors submitting manuscripts must ensure that their work is original, has not been published elsewhere, and does not infringe upon any copyright or intellectual property rights. Plagiarism in any form is unacceptable and will result in immediate rejection.
              </p>
            </div>

            <div>
              <h3 style={{ marginBottom: '1rem', color: 'var(--navy)' }}>3. Open Access Policy</h3>
              <p style={{ color: 'var(--gray-600)', lineHeight: 1.8 }}>
                All articles published by Daily Solace Journal are made immediately available worldwide under an open access license. This means everyone has free and unlimited access to the full text of all articles, and everyone is free to copy, distribute, and display the work.
              </p>
            </div>

            <div>
              <h3 style={{ marginBottom: '1rem', color: 'var(--navy)' }}>4. Article Processing Charges (APC)</h3>
              <p style={{ color: 'var(--gray-600)', lineHeight: 1.8 }}>
                Upon acceptance of a manuscript, an Article Processing Charge (APC) is required to cover the costs of peer review administration and management, professional production of articles, website hosting, and dissemination of published papers. There are no submission fees.
              </p>
            </div>

            <div style={{ marginTop: '1rem', padding: '1.5rem', background: 'var(--gray-50)', borderRadius: '8px', borderLeft: '4px solid var(--gold)' }}>
              <h4 style={{ marginBottom: '0.5rem', color: 'var(--navy)' }}>Questions?</h4>
              <p style={{ color: 'var(--gray-600)', fontSize: '0.9rem' }}>
                If you have any questions about these Terms, please <Link href="/contact" style={{ color: 'var(--gold)', fontWeight: 600 }}>contact us</Link>.
              </p>
            </div>

          </div>
        </div>
      </section>
    </>
  );
}
