import type { Metadata } from 'next';
import Link from 'next/link';
import { CheckCircle, Upload, Users, BookOpen, DollarSign, Shield } from 'lucide-react';

export const metadata: Metadata = { title: 'For Authors — Submission Guidelines' };

const steps = [
  { num: '01', title: 'Prepare Your Manuscript', desc: 'Follow our author guidelines. Manuscripts should be submitted in PDF or Microsoft Word (.docx) format. Ensure proper formatting, citations (APA/IEEE/MLA), and a structured abstract.' },
  { num: '02', title: 'Register & Submit', desc: 'Create a free author account. Choose the appropriate journal, fill in the submission form, upload your manuscript and any supplementary files.' },
  { num: '03', title: 'Peer Review', desc: 'Your submission undergoes double-blind peer review by 2–3 domain experts. You will receive the first decision within 48 hours of editor assessment.' },
  { num: '04', title: 'Revision (if required)', desc: 'If revisions are requested, submit your revised manuscript along with a detailed response-to-reviewers document addressing all comments.' },
  { num: '05', title: 'Acceptance & APC', desc: 'Upon acceptance, an Article Processing Charge (APC) may apply based on the journal. Payment can be made via Razorpay (UPI, cards, netbanking).' },
  { num: '06', title: 'Publication & DOI', desc: 'Your article is published with a permanent CrossRef DOI, indexed in Google Scholar, and freely accessible worldwide as open access.' },
];

const requirements = [
  'Original, previously unpublished research',
  'Structured abstract (Objective, Methods, Results, Conclusion)',
  'Minimum 3 and maximum 10 keywords',
  'All authors listed with affiliations and email',
  'ORCID iD recommended for all authors',
  'References formatted in APA, IEEE, or MLA style',
  'Tables and figures with captions',
  'Ethical approval statement (for clinical/human studies)',
];

export default function ForAuthorsPage() {
  return (
    <>
      <div className="page-header">
        <div className="container">
          <span className="section-label">Submit Research</span>
          <h1>Author Guidelines</h1>
          <p style={{ maxWidth: 560, marginTop: '0.75rem' }}>Everything you need to know about submitting your research to Daily Solace Journal.</p>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1.75rem', flexWrap: 'wrap' }}>
            <Link href="/auth/register" className="btn btn-gold btn-lg">Submit a Manuscript</Link>
            <Link href="/auth/login" className="btn btn-outline-white">Sign In to Portal</Link>
          </div>
        </div>
      </div>

      {/* Submission process */}
      <section style={{ background: '#fff' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <span className="section-label">Process</span>
            <h2>Submission Process</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem' }}>
            {steps.map((s) => (
              <div key={s.num} className="card">
                <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--gold)', fontFamily: 'Inter,sans-serif', lineHeight: 1, marginBottom: '0.75rem' }}>{s.num}</div>
                <h4 style={{ marginBottom: '0.625rem' }}>{s.title}</h4>
                <p style={{ fontSize: '0.875rem', color: 'var(--gray-500)', lineHeight: 1.75 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Requirements */}
      <section style={{ background: 'var(--gray-50)' }}>
        <div className="container" style={{ maxWidth: 860, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'center' }}>
          <div>
            <span className="section-label">Requirements</span>
            <h2 style={{ marginBottom: '1.5rem' }}>Manuscript Requirements</h2>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {requirements.map((r) => (
                <li key={r} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.625rem', fontSize: '0.9rem', color: 'var(--gray-700)' }}>
                  <CheckCircle size={16} color="var(--success)" style={{ flexShrink: 0, marginTop: 2 }} /> {r}
                </li>
              ))}
            </ul>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {[
              { icon: Upload, title: 'File Formats', desc: 'PDF or Microsoft Word (.docx). Max file size: 20MB.' },
              { icon: DollarSign, title: 'Article Processing Charge', id: 'apc', desc: 'APCs vary by journal (₹3,000 – ₹8,000). Fee waiver available for low-income countries.' },
              { icon: Shield, title: 'Plagiarism Policy', desc: 'Manuscripts are checked for plagiarism. Similarity index must be below 20%.' },
            ].map(({ icon: Icon, title, id, desc }) => (
              <div key={title} id={id} className="card" style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: 'linear-gradient(135deg,#eef1fa,#dde3f5)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={18} color="var(--navy)" />
                </div>
                <div>
                  <h4 style={{ fontSize: '0.9375rem', marginBottom: '0.25rem' }}>{title}</h4>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--gray-500)', lineHeight: 1.7 }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: 'linear-gradient(135deg,var(--navy-dark),var(--navy))', textAlign: 'center', color: '#fff' }}>
        <div className="container" style={{ maxWidth: 600 }}>
          <h2 style={{ color: '#fff', marginBottom: '1rem' }}>Ready to Submit?</h2>
          <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '2rem' }}>Create your free author account and submit your research in minutes.</p>
          <Link href="/auth/register" className="btn btn-gold btn-lg">Get Started — It&apos;s Free</Link>
        </div>
      </section>
    </>
  );
}
