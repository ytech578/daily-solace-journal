'use client';

import Link from 'next/link';
import { Mail, MapPin, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { api } from '@/lib/api';

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await api.post('/contact', formData);
      setSuccess(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to send message. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

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
            
            {success ? (
              <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '0.5rem', padding: '1.5rem', textAlign: 'center' }}>
                <CheckCircle size={32} color="#059669" style={{ margin: '0 auto 1rem' }} />
                <h4 style={{ color: '#065f46', marginBottom: '0.5rem' }}>Message Sent Successfully</h4>
                <p style={{ color: '#047857', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Thank you for reaching out! We will get back to you within 2 business days.</p>
                <button onClick={() => setSuccess(false)} className="btn btn-outline btn-sm">Send Another Message</button>
              </div>
            ) : (
              <form style={{ display: 'flex', flexDirection: 'column', gap: '1.125rem' }} onSubmit={handleSubmit}>
                {error && (
                  <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '0.375rem', padding: '0.75rem 1rem', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                    <AlertCircle size={16} color="#dc2626" style={{ marginTop: 2, flexShrink: 0 }} />
                    <span style={{ fontSize: '0.85rem', color: '#b91c1c', lineHeight: 1.5 }}>{error}</span>
                  </div>
                )}
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Full Name *</label>
                    <input className="form-input" required placeholder="Dr. Jane Smith" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email Address *</label>
                    <input className="form-input" type="email" required placeholder="jane@university.edu" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Subject *</label>
                  <select className="form-input" required value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})}>
                    <option value="">Select a topic…</option>
                    <option value="Submission Query">Submission Query</option>
                    <option value="Peer Review">Peer Review</option>
                    <option value="Article Processing Charge">Article Processing Charge</option>
                    <option value="Technical Issue">Technical Issue</option>
                    <option value="Editorial Inquiry">Editorial Inquiry</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Message *</label>
                  <textarea className="form-input" rows={5} required placeholder="Describe your query in detail…" style={{ minHeight: 120 }} value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})} />
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>
                  {loading ? (
                    <><span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /> Sending…</>
                  ) : (
                    <><Mail size={16} /> Send Message</>
                  )}
                </button>
              </form>
            )}
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
