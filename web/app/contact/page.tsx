'use client';

import Link from 'next/link';
import { Mail, MapPin, Clock } from 'lucide-react';

export default function ContactPage() {
  return (
    <>
      <div className="page-header">
        <div className="container">
          <span className="section-label">Get in Touch</span>
          <h1>Contact Us</h1>
          <p style={{ color: 'rgba(255,255,255,0.7)', marginTop: '0.75rem' }}>
            Have questions about submission, peer review, or publication? Our editorial team is here to help.
          </p>
        </div>
      </div>

      <section style={{ background: 'var(--gray-50)' }}>
        <div className="container" style={{ maxWidth: 900, display: 'grid', gridTemplateColumns: '1fr 360px', gap: '3rem', alignItems: 'start' }}>

          {/* Contact form */}
          <div className="card">
            <h3 style={{ marginBottom: '1.5rem' }}>Send a Message</h3>
            <form style={{ display: 'flex', flexDirection: 'column', gap: '1.125rem' }}
              onSubmit={e => { e.preventDefault(); alert('Message sent! We will reply within 2 business days.'); }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input className="form-input" required placeholder="Dr. Jane Smith" />
                </div>
                <div className="form-group">
                  <label className="form-label">Email Address *</label>
                  <input className="form-input" type="email" required placeholder="jane@university.edu" />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Subject *</label>
                <select className="form-input" required>
                  <option value="">Select a topic…</option>
                  <option>Submission Query</option>
                  <option>Peer Review</option>
                  <option>Article Processing Charge</option>
                  <option>Technical Issue</option>
                  <option>Editorial Inquiry</option>
                  <option>Other</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Message *</label>
                <textarea className="form-input" rows={5} required placeholder="Describe your query in detail…" style={{ minHeight: 120 }} />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                <Mail size={16} /> Send Message
              </button>
            </form>
          </div>

          {/* Contact info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {[
              { icon: Mail, title: 'Email', lines: ['editorial@dailysolacejournal.com', 'support@dailysolacejournal.com'] },
              { icon: MapPin, title: 'Address', lines: ['Daily Solace Journal', 'Hyderabad, Telangana 500032', 'India'] },
              { icon: Clock, title: 'Response Time', lines: ['General Inquiries: 1–2 business days', 'Submission Queries: 48 hours'] },
            ].map(({ icon: Icon, title, lines }) => (
              <div key={title} className="card" style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg,#eef1fa,#dde3f5)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={20} color="var(--navy)" />
                </div>
                <div>
                  <h4 style={{ marginBottom: '0.375rem' }}>{title}</h4>
                  {lines.map((l, i) => <p key={i} style={{ fontSize: '0.875rem', color: 'var(--gray-500)', lineHeight: 1.65 }}>{l}</p>)}
                </div>
              </div>
            ))}

            <div className="card" style={{ background: 'linear-gradient(135deg,var(--navy-dark),var(--navy))', color: '#fff' }}>
              <h4 style={{ color: '#fff', marginBottom: '0.75rem' }}>Editorial Board</h4>
              <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.7, marginBottom: '1rem' }}>
                Interested in joining our editorial board as a reviewer or associate editor?
              </p>
              <Link href="/about#team" className="btn btn-gold btn-sm">View Editorial Team</Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
