import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = { title: 'Privacy Policy — Daily Solace Journal' };

export default function PrivacyPage() {
  return (
    <>
      <div className="page-header">
        <div className="container">
          <span className="section-label">Legal</span>
          <h1>Privacy Policy</h1>
          <p style={{ color: 'rgba(255,255,255,0.7)', marginTop: '0.75rem' }}>
            How we collect, use, and protect your personal information.
          </p>
        </div>
      </div>

      <section style={{ background: 'var(--gray-50)', padding: '4rem 0' }}>
        <div className="container" style={{ maxWidth: 800 }}>
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            
            <div>
              <h3 style={{ marginBottom: '1rem', color: 'var(--navy)' }}>1. Information We Collect</h3>
              <p style={{ color: 'var(--gray-600)', lineHeight: 1.8 }}>
                We collect information you provide directly to us, such as when you create or modify your account, submit a manuscript, request support, or otherwise communicate with us. This information may include your name, email address, institutional affiliation, and academic background.
              </p>
            </div>

            <div>
              <h3 style={{ marginBottom: '1rem', color: 'var(--navy)' }}>2. How We Use Information</h3>
              <ul style={{ color: 'var(--gray-600)', lineHeight: 1.8, paddingLeft: '1.5rem' }}>
                <li>To facilitate the editorial and peer review process.</li>
                <li>To communicate with you about your submissions or reviews.</li>
                <li>To send you technical notices, updates, and security alerts.</li>
                <li>To publish your name and affiliation alongside your published articles.</li>
              </ul>
            </div>

            <div>
              <h3 style={{ marginBottom: '1rem', color: 'var(--navy)' }}>3. Information Sharing</h3>
              <p style={{ color: 'var(--gray-600)', lineHeight: 1.8 }}>
                We do not share your personal information with third parties except as described in this privacy policy. We may share information with reviewers and editors as part of the peer review process, maintaining double-blind standards where applicable.
              </p>
            </div>

            <div>
              <h3 style={{ marginBottom: '1rem', color: 'var(--navy)' }}>4. Data Security</h3>
              <p style={{ color: 'var(--gray-600)', lineHeight: 1.8 }}>
                We take reasonable measures to help protect information about you from loss, theft, misuse and unauthorized access, disclosure, alteration and destruction. Our platform uses industry-standard encryption for all data transmission.
              </p>
            </div>

            <div style={{ marginTop: '1rem', padding: '1.5rem', background: 'var(--gray-50)', borderRadius: '8px', borderLeft: '4px solid var(--gold)' }}>
              <h4 style={{ marginBottom: '0.5rem', color: 'var(--navy)' }}>Questions about Privacy?</h4>
              <p style={{ color: 'var(--gray-600)', fontSize: '0.9rem' }}>
                If you have concerns about your data, please <Link href="/contact" style={{ color: 'var(--gold)', fontWeight: 600 }}>contact our support team</Link>.
              </p>
            </div>

          </div>
        </div>
      </section>
    </>
  );
}
