'use client';

import { useState } from 'react';
import Link from 'next/link';
import { BookOpen, AlertCircle, CheckCircle, Loader2, FileText, ArrowRight } from 'lucide-react';
import { api } from '@/lib/api';

const countries = ['India', 'United States', 'United Kingdom', 'Germany', 'France', 'Australia', 'Canada', 'Japan', 'China', 'Brazil', 'Other'];

export default function ApplyReviewerPage() {
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '',
    institution: '', department: '', designation: '', highestQualification: '',
    country: '', orcid: '', scopusId: '', googleScholar: '',
    researchAreas: '', bio: '', cvUrl: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const upd = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!form.researchAreas) {
      setError('Please provide your research areas.');
      return;
    }

    setLoading(true);
    try {
      const areasArray = form.researchAreas.split(',').map(s => s.trim()).filter(Boolean);
      await api.post('/reviewer-applications', { ...form, researchAreas: areasArray });
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to submit application. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header style={{ background: 'var(--navy)', padding: '2rem 1rem', color: '#fff', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2.5rem', fontFamily: 'Inter,sans-serif', marginBottom: '0.5rem' }}>Join Our Review Board</h1>
        <p style={{ color: 'rgba(255,255,255,0.7)', maxWidth: 600, margin: '0 auto' }}>
          Contribute to academic excellence by reviewing submissions in your area of expertise.
        </p>
      </header>

      <main style={{ flex: 1, padding: '3rem 1rem', background: '#f8f8fa' }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <div className="card" style={{ padding: '2.5rem' }}>
            {success ? (
              <div style={{ textAlign: 'center', padding: '2rem' }}>
                <CheckCircle size={64} color="var(--success)" style={{ margin: '0 auto 1rem' }} />
                <h2 style={{ fontFamily: 'Inter,sans-serif', color: 'var(--success)', marginBottom: '1rem' }}>Application Submitted</h2>
                <p style={{ color: 'var(--gray-600)', marginBottom: '2rem', lineHeight: 1.6 }}>
                  Thank you for your interest in becoming a reviewer for Daily Solace Journal. 
                  Our editorial board will review your application and get back to you via email.
                </p>
                <Link href="/" className="btn btn-outline">Return to Home</Link>
              </div>
            ) : (
              <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                  <FileText color="var(--primary)" size={24} />
                  <h2 style={{ fontFamily: 'Inter,sans-serif', margin: 0, fontSize: '1.25rem', color: 'var(--navy)' }}>Application Form</h2>
                </div>
                
                {error && (
                  <div style={{ background: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.3)', borderRadius: 8, padding: '1rem', display: 'flex', gap: '0.5rem', color: 'var(--error)' }}>
                    <AlertCircle size={20} style={{ flexShrink: 0 }} /> {error}
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">First Name *</label>
                    <input className="form-input" value={form.firstName} onChange={e => upd('firstName', e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Last Name *</label>
                    <input className="form-input" value={form.lastName} onChange={e => upd('lastName', e.target.value)} required />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Email Address *</label>
                  <input className="form-input" type="email" value={form.email} onChange={e => upd('email', e.target.value)} required />
                </div>

                <div className="form-group">
                  <label className="form-label">Institution / University *</label>
                  <input className="form-input" value={form.institution} onChange={e => upd('institution', e.target.value)} required />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Country *</label>
                    <select className="form-input" value={form.country} onChange={e => upd('country', e.target.value)} required>
                      <option value="">Select…</option>
                      {countries.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Department</label>
                    <input className="form-input" value={form.department} onChange={e => upd('department', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Designation</label>
                    <input className="form-input" value={form.designation} onChange={e => upd('designation', e.target.value)} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Highest Qualification</label>
                    <input className="form-input" value={form.highestQualification} onChange={e => upd('highestQualification', e.target.value)} placeholder="e.g. PhD" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">ORCID iD</label>
                    <input className="form-input" value={form.orcid} onChange={e => upd('orcid', e.target.value)} placeholder="0000-0000-..." />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Research Areas / Expertise * (comma separated)</label>
                  <input className="form-input" value={form.researchAreas} onChange={e => upd('researchAreas', e.target.value)} required placeholder="Machine Learning, Ethics, AI" />
                </div>

                <div className="form-group">
                  <label className="form-label">Short Biography</label>
                  <textarea className="form-input" rows={3} value={form.bio} onChange={e => upd('bio', e.target.value)} placeholder="Brief summary of your academic background and reviewing experience." />
                </div>

                <div className="form-group">
                  <label className="form-label">Link to CV / Academic Profile (Optional)</label>
                  <input className="form-input" type="url" value={form.cvUrl} onChange={e => upd('cvUrl', e.target.value)} placeholder="https://..." />
                </div>

                <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem', padding: '1rem' }} disabled={loading}>
                  {loading ? <><Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> Submitting...</> : 'Submit Application'}
                </button>
              </form>
            )}
          </div>
        </div>
      </main>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
