import type { Metadata } from 'next';
import Link from 'next/link';
import { CheckCircle, BookOpen, Users, Star } from 'lucide-react';

export const metadata: Metadata = { title: 'For Reviewers — Daily Solace Journal' };

const benefits = [
  { title: 'Professional Recognition', desc: 'Receive a formal certificate of peer review contribution and build your academic profile.' },
  { title: 'CPD Credits', desc: 'Peer review activities count towards Continuing Professional Development in many institutions.' },
  { title: 'Editorial Board Opportunity', desc: 'Outstanding reviewers are invited to join our editorial board.' },
  { title: 'First Look at Research', desc: 'Access cutting-edge research in your field before it is published.' },
];

const steps = [
  { num: '01', title: 'Register as a Reviewer', desc: 'Create an account and select your areas of expertise. Upload your CV and a brief bio.' },
  { num: '02', title: 'Receive Invitations', desc: 'When a manuscript in your area is submitted, you\'ll receive an email invitation to review.' },
  { num: '03', title: 'Accept & Download', desc: 'Accept the invitation within 5 days and download the anonymous manuscript.' },
  { num: '04', title: 'Submit Your Review', desc: 'Provide a detailed review with scores on originality, methodology, clarity, and significance within the deadline (usually 3 weeks).' },
];

export default function ForReviewersPage() {
  return (
    <>
      <div className="page-header">
        <div className="container">
          <span className="section-label">Join Us</span>
          <h1>For Reviewers</h1>
          <p style={{ color: 'rgba(255,255,255,0.7)', marginTop: '0.75rem', maxWidth: 520 }}>
            Shape the future of research by becoming a peer reviewer for Daily Solace Journal.
          </p>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1.75rem' }}>
            <Link href="/auth/register" className="btn btn-gold btn-lg">Become a Reviewer</Link>
            <Link href="/portal/reviewer" className="btn btn-outline-white">Reviewer Login</Link>
          </div>
        </div>
      </div>

      {/* Process */}
      <section style={{ background: '#fff' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <span className="section-label">Process</span>
            <h2>How Peer Review Works</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '1.5rem' }}>
            {steps.map(s => (
              <div key={s.num} className="card">
                <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--gold)', fontFamily: 'Inter,sans-serif', marginBottom: '0.75rem' }}>{s.num}</div>
                <h4 style={{ marginBottom: '0.625rem' }}>{s.title}</h4>
                <p style={{ fontSize: '0.875rem', color: 'var(--gray-500)', lineHeight: 1.75 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section style={{ background: 'var(--gray-50)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <span className="section-label">Why Review?</span>
            <h2>Benefits of Peer Review</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '1.5rem', maxWidth: 800, margin: '0 auto' }}>
            {benefits.map(b => (
              <div key={b.title} className="card" style={{ display: 'flex', gap: '1rem' }}>
                <CheckCircle size={22} color="var(--success)" style={{ flexShrink: 0, marginTop: 2 }} />
                <div>
                  <h4 style={{ marginBottom: '0.375rem' }}>{b.title}</h4>
                  <p style={{ fontSize: '0.875rem', color: 'var(--gray-500)', lineHeight: 1.7 }}>{b.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: 'linear-gradient(135deg,var(--navy-dark),var(--navy))', textAlign: 'center', color: '#fff' }}>
        <div className="container" style={{ maxWidth: 600 }}>
          <h2 style={{ color: '#fff', marginBottom: '1rem' }}>Ready to Contribute?</h2>
          <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '2rem' }}>
            Register today and help maintain the quality of scholarly publishing.
          </p>
          <Link href="/auth/register" className="btn btn-gold btn-lg">Join as Reviewer</Link>
        </div>
      </section>
    </>
  );
}
