'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import Link from 'next/link';
import { Upload, X, Plus, Loader2, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';



export default function SubmitPage() {
  const { user, isLoading } = useAuthStore();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: journals = [] } = useQuery({
    queryKey: ['journals'],
    queryFn: async () => (await api.get('/journals')).data,
  });

  const [form, setForm] = useState({ journalId: '', title: '', abstract: '', coverLetter: '' });
  const [keywords, setKeywords] = useState<string[]>([]);
  const [kw, setKw] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [step, setStep] = useState(1); // 1=details, 2=file, 3=done
  const [draftId, setDraftId] = useState('');

  useEffect(() => {
    if (!isLoading && !user) router.push('/auth/login');
  }, [user, isLoading, router]);

  // Step 1: Create/save draft
  const saveDraft = useMutation({
    mutationFn: async () => {
      if (draftId) {
        await api.patch(`/submissions/${draftId}`, { ...form, keywords });
        return { id: draftId };
      }
      const { data } = await api.post('/submissions', { ...form, keywords });
      return data;
    },
    onSuccess: (data) => {
      setDraftId(data.id);
      setStep(2);
    },
  });

  // Step 2: Upload file + submit
  const submitMs = useMutation({
    mutationFn: async () => {
      if (file) {
        const fd = new FormData();
        fd.append('file', file);
        await api.post(`/submissions/${draftId}/files`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      }
      await api.post(`/submissions/${draftId}/submit`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-submissions'] });
      setStep(3);
    },
  });

  const addKw = () => {
    const k = kw.trim();
    if (k && !keywords.includes(k) && keywords.length < 10) {
      setKeywords([...keywords, k]);
      setKw('');
    }
  };

  if (isLoading || !user) return null;

  return (
    <div className="portal-layout">
      <aside className="portal-sidebar">
        <div style={{ padding: '0 1.5rem 1.5rem' }}>
          <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1.125rem', color: '#fff', marginBottom: '0.75rem' }}>{user.name[0]}</div>
          <div style={{ color: '#fff', fontWeight: 600, fontSize: '0.95rem' }}>{user.name}</div>
        </div>
        <div className="sidebar-section-title">Author Portal</div>
        {[
          { href: '/portal/author', label: 'Dashboard', icon: '🏠' },
          { href: '/portal/author/submit', label: 'Submit Manuscript', icon: '📄' },
          { href: '/portal/author/submissions', label: 'My Submissions', icon: '📋' },
        ].map(l => <Link key={l.href} href={l.href} className={`sidebar-link ${l.href === '/portal/author/submit' ? 'active' : ''}`}><span>{l.icon}</span> {l.label}</Link>)}
      </aside>

      <main className="portal-content">
        <div style={{ maxWidth: 720 }}>
          <Link href="/portal/author" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', color: 'var(--gray-500)', fontSize: '0.875rem', marginBottom: '1.5rem', textDecoration: 'none' }}>
            <ArrowLeft size={14} /> Back to Dashboard
          </Link>
          <h2 style={{ fontFamily: 'Inter,sans-serif', fontWeight: 700, color: 'var(--navy)', marginBottom: '0.5rem' }}>Submit Manuscript</h2>

          {/* Progress */}
          <div style={{ display: 'flex', gap: '0', marginBottom: '2rem', background: 'var(--gray-100)', borderRadius: 10, overflow: 'hidden' }}>
            {['Manuscript Details', 'Upload & Submit', 'Confirmation'].map((s, i) => (
              <div key={s} style={{ flex: 1, padding: '0.75rem', textAlign: 'center', fontSize: '0.8125rem', fontWeight: 600, background: step > i + 1 ? 'var(--success)' : step === i + 1 ? 'var(--navy)' : 'transparent', color: step >= i + 1 ? '#fff' : 'var(--gray-400)', transition: 'all 0.2s' }}>
                {step > i + 1 ? '✓ ' : `${i + 1}. `}{s}
              </div>
            ))}
          </div>

          {/* Step 1 */}
          {step === 1 && (
            <div className="card">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div className="form-group">
                  <label className="form-label">Select Journal *</label>
                  <select className="form-input" value={form.journalId} onChange={e => setForm(f => ({ ...f, journalId: e.target.value }))} required>
                    <option value="">Choose a journal…</option>
                    {journals.map((j: any) => <option key={j.id} value={j.id}>{j.name}</option>)}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Manuscript Title *</label>
                  <input className="form-input" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Full title of your research paper" required />
                </div>

                <div className="form-group">
                  <label className="form-label">Abstract * <span style={{ color: 'var(--gray-400)', fontWeight: 400 }}>(150–300 words)</span></label>
                  <textarea className="form-input" rows={6} value={form.abstract} onChange={e => setForm(f => ({ ...f, abstract: e.target.value }))} placeholder="Structured abstract: Objective, Methods, Results, Conclusion" required style={{ minHeight: 140 }} />
                  <span style={{ fontSize: '0.75rem', color: 'var(--gray-400)' }}>{form.abstract.split(/\s+/).filter(Boolean).length} words</span>
                </div>

                <div className="form-group">
                  <label className="form-label">Keywords * <span style={{ color: 'var(--gray-400)', fontWeight: 400 }}>(3–10 keywords)</span></label>
                  <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.625rem', flexWrap: 'wrap' }}>
                    {keywords.map(k => (
                      <span key={k} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', background: 'var(--gray-100)', borderRadius: 9999, padding: '0.25rem 0.625rem', fontSize: '0.8125rem' }}>
                        {k} <button onClick={() => setKeywords(keywords.filter(x => x !== k))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gray-400)', display: 'flex' }}><X size={12} /></button>
                      </span>
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input className="form-input" value={kw} onChange={e => setKw(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addKw())} placeholder="Type keyword and press Enter or +" />
                    <button type="button" onClick={addKw} className="btn btn-outline btn-sm"><Plus size={14} /></button>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Cover Letter <span style={{ color: 'var(--gray-400)', fontWeight: 400 }}>(optional)</span></label>
                  <textarea className="form-input" rows={4} value={form.coverLetter} onChange={e => setForm(f => ({ ...f, coverLetter: e.target.value }))} placeholder="Brief message to the editor explaining the significance of your work…" />
                </div>

                {saveDraft.error && (
                  <div style={{ background: '#fee2e2', borderRadius: 8, padding: '0.75rem 1rem', color: '#b91c1c', fontSize: '0.875rem', display: 'flex', gap: '0.5rem' }}>
                    <AlertCircle size={16} style={{ flexShrink: 0 }} /> {(saveDraft.error as any)?.response?.data?.error || 'Failed to save draft'}
                  </div>
                )}

                <button className="btn btn-primary" onClick={() => saveDraft.mutate()} disabled={saveDraft.isPending || !form.journalId || !form.title || !form.abstract || keywords.length < 3}>
                  {saveDraft.isPending ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Saving…</> : 'Save & Continue →'}
                </button>
              </div>
            </div>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <div className="card">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div>
                  <h4 style={{ marginBottom: '0.5rem' }}>Upload Manuscript (PDF or DOCX)</h4>
                  <p style={{ fontSize: '0.875rem', color: 'var(--gray-500)', marginBottom: '1rem' }}>Max file size: 20 MB. Supplementary files can be added after submission.</p>
                  <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '2px dashed var(--gray-300)', borderRadius: 12, padding: '2.5rem', cursor: 'pointer', background: 'var(--gray-50)', transition: 'border-color 0.15s' }}>
                    <Upload size={32} color="var(--gray-400)" style={{ marginBottom: '0.75rem' }} />
                    {file ? (
                      <><strong>{file.name}</strong><span style={{ fontSize: '0.8rem', color: 'var(--gray-400)', marginTop: '0.25rem' }}>({(file.size / 1048576).toFixed(2)} MB)</span></>
                    ) : (
                      <><strong>Click to upload</strong> or drag and drop<span style={{ fontSize: '0.8rem', color: 'var(--gray-400)', marginTop: '0.25rem' }}>PDF, DOCX — max 20MB</span></>
                    )}
                    <input type="file" accept=".pdf,.docx" style={{ display: 'none' }} onChange={e => setFile(e.target.files?.[0] ?? null)} />
                  </label>
                </div>

                <div style={{ background: '#fef3c7', borderRadius: 8, padding: '1rem', fontSize: '0.875rem', color: '#92400e', lineHeight: 1.6 }}>
                  <strong>Before submitting:</strong> Ensure author details are removed from the manuscript (double-blind review). Check plagiarism similarity is below 20%.
                </div>

                {submitMs.error && (
                  <div style={{ background: '#fee2e2', borderRadius: 8, padding: '0.75rem 1rem', color: '#b91c1c', fontSize: '0.875rem', display: 'flex', gap: '0.5rem' }}>
                    <AlertCircle size={16} style={{ flexShrink: 0 }} /> {(submitMs.error as any)?.response?.data?.error || 'Submission failed'}
                  </div>
                )}

                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button className="btn btn-outline" onClick={() => setStep(1)}>← Back</button>
                  <button className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }} onClick={() => submitMs.mutate()} disabled={submitMs.isPending}>
                    {submitMs.isPending ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Submitting…</> : 'Submit Manuscript'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Step 3 */}
          {step === 3 && (
            <div className="card" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
              <CheckCircle size={56} color="var(--success)" style={{ margin: '0 auto 1.25rem' }} />
              <h3 style={{ marginBottom: '0.75rem', color: 'var(--navy)' }}>Manuscript Submitted!</h3>
              <p style={{ color: 'var(--gray-500)', maxWidth: 420, margin: '0 auto 2rem', lineHeight: 1.75 }}>
                Your manuscript has been received. The editor will review it and you&apos;ll receive an email notification within 48 hours.
              </p>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                <Link href="/portal/author/submissions" className="btn btn-primary">Track Submission</Link>
                <Link href="/portal/author/submit" className="btn btn-outline" onClick={() => { setStep(1); setForm({ journalId: '', title: '', abstract: '', coverLetter: '' }); setKeywords([]); setFile(null); setDraftId(''); }}>Submit Another</Link>
              </div>
            </div>
          )}
        </div>
      </main>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
