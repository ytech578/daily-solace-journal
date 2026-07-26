'use client';

import { useAuthStore } from '@/store/auth.store';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ArrowLeft, Download, FileText, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

export default function SubmitReviewPage() {
  const { user, isLoading: authLoading } = useAuthStore();
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!authLoading && !user) router.push('/auth/login');
  }, [user, authLoading, router]);

  const { data: assignment, isLoading } = useQuery({
    queryKey: ['review-assignment', id],
    queryFn: async () => (await api.get(`/review-assignments/${id}`)).data,
    enabled: !!user && !!id,
  });

  const [recommendation, setRecommendation] = useState('ACCEPT');
  const [commentsForAuthors, setCommentsForAuthors] = useState('');
  const [commentsForEditor, setCommentsForEditor] = useState('');
  const [error, setError] = useState('');

  const submitMutation = useMutation({
    mutationFn: async () => {
      return api.post(`/review-assignments/${id}/submit`, {
        recommendation,
        commentsForAuthors,
        commentsForEditor,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['review-assignment', id] });
      queryClient.invalidateQueries({ queryKey: ['my-review-assignments'] });
      router.push('/portal/reviewer');
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'Failed to submit review');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentsForAuthors) {
      setError('Comments for authors are required.');
      return;
    }
    submitMutation.mutate();
  };

  if (authLoading || isLoading) return <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--gray-400)' }}>Loading…</div>;
  if (!assignment) return <div style={{ padding: '4rem', textAlign: 'center' }}><h3>Assignment not found</h3></div>;

  const manuscript = assignment.submission.files?.find((f: any) => f.type === 'MANUSCRIPT');

  if (assignment.status === 'COMPLETED') {
    return (
      <div className="portal-layout">
        <aside className="portal-sidebar">
          <div style={{ padding: '0 1.5rem 1.5rem' }}>
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1.125rem', color: '#fff', marginBottom: '0.75rem' }}>{user?.name[0]}</div>
            <div style={{ color: '#fff', fontWeight: 600, fontSize: '0.95rem' }}>{user?.name}</div>
            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem' }}>Reviewer</div>
          </div>
          <div className="sidebar-section-title">Reviewer Portal</div>
          <Link href="/portal/reviewer" className="sidebar-link active"><span>📋</span> My Reviews</Link>
        </aside>
        <main className="portal-content">
          <Link href="/portal/reviewer" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', color: 'var(--gray-500)', fontSize: '0.875rem', marginBottom: '1.5rem', textDecoration: 'none' }}>
            <ArrowLeft size={14} /> Back to Dashboard
          </Link>
          <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
            <CheckCircle size={48} color="var(--success)" style={{ margin: '0 auto 1.5rem' }} />
            <h2 style={{ color: 'var(--navy)', marginBottom: '1rem' }}>Review Submitted</h2>
            <p style={{ color: 'var(--gray-600)', marginBottom: '2rem' }}>Thank you for your valuable contribution to the journal.</p>
            <Link href="/portal/reviewer" className="btn btn-primary">Return to Dashboard</Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="portal-layout">
      <aside className="portal-sidebar">
        <div style={{ padding: '0 1.5rem 1.5rem' }}>
          <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1.125rem', color: '#fff', marginBottom: '0.75rem' }}>{user?.name[0]}</div>
          <div style={{ color: '#fff', fontWeight: 600, fontSize: '0.95rem' }}>{user?.name}</div>
          <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem' }}>Reviewer</div>
        </div>
        <div className="sidebar-section-title">Reviewer Portal</div>
        <Link href="/portal/reviewer" className="sidebar-link active"><span>📋</span> My Reviews</Link>
      </aside>

      <main className="portal-content">
        <Link href="/portal/reviewer" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', color: 'var(--gray-500)', fontSize: '0.875rem', marginBottom: '1.5rem', textDecoration: 'none' }}>
          <ArrowLeft size={14} /> Back to Dashboard
        </Link>

        <h2 style={{ fontFamily: 'Inter,sans-serif', fontWeight: 700, color: 'var(--navy)', marginBottom: '1.5rem' }}>Submit Review</h2>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem', alignItems: 'start' }}>
          <div>
            <form onSubmit={handleSubmit} className="card" style={{ padding: '2rem' }}>
              {error && (
                <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: '1rem', borderRadius: 8, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.875rem' }}>
                  <AlertCircle size={16} /> {error}
                </div>
              )}

              <div className="form-group" style={{ marginBottom: '2rem' }}>
                <label className="form-label">Recommendation <span style={{ color: 'var(--error)' }}>*</span></label>
                <select 
                  className="form-control" 
                  value={recommendation} 
                  onChange={(e) => setRecommendation(e.target.value)}
                  required
                >
                  <option value="ACCEPT">Accept Submission</option>
                  <option value="MINOR_REVISION">Minor Revisions Required</option>
                  <option value="MAJOR_REVISION">Major Revisions Required</option>
                  <option value="REJECT">Reject Submission</option>
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: '2rem' }}>
                <label className="form-label">Comments for Authors <span style={{ color: 'var(--error)' }}>*</span></label>
                <div style={{ fontSize: '0.8125rem', color: 'var(--gray-500)', marginBottom: '0.75rem' }}>
                  Provide a detailed, constructive critique of the manuscript. Focus on methodology, results, and significance.
                </div>
                <textarea 
                  className="form-control" 
                  rows={10} 
                  value={commentsForAuthors} 
                  onChange={(e) => setCommentsForAuthors(e.target.value)}
                  placeholder="Enter your review here..."
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: '2.5rem' }}>
                <label className="form-label">Comments for Editor (Confidential)</label>
                <div style={{ fontSize: '0.8125rem', color: 'var(--gray-500)', marginBottom: '0.75rem' }}>
                  Optional. These comments will only be seen by the handling editor.
                </div>
                <textarea 
                  className="form-control" 
                  rows={4} 
                  value={commentsForEditor} 
                  onChange={(e) => setCommentsForEditor(e.target.value)}
                  placeholder="Private remarks for the editorial team..."
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                <Link href="/portal/reviewer" className="btn btn-outline">Cancel</Link>
                <button type="submit" className="btn btn-primary" disabled={submitMutation.isPending}>
                  {submitMutation.isPending ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> : <CheckCircle size={18} />}
                  Submit Review
                </button>
              </div>
            </form>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="card">
              <h4 style={{ marginBottom: '1.25rem' }}>Manuscript Details</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.375rem' }}>Title</div>
                  <div style={{ fontFamily: '"Playfair Display",Georgia,serif', fontWeight: 600, color: 'var(--navy)', lineHeight: 1.4 }}>{assignment.submission?.title}</div>
                </div>
                
                {manuscript && (
                  <div style={{ marginTop: '0.5rem' }}>
                    <a href={`http://localhost:3001/uploads/${manuscript.storagePath.split('/').pop()}`} target="_blank" rel="noreferrer" className="btn btn-outline" style={{ width: '100%', justifyContent: 'center' }}>
                      <Download size={16} /> Download Manuscript PDF
                    </a>
                  </div>
                )}
                
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.375rem', marginTop: '0.5rem' }}>Abstract</div>
                  <p style={{ fontSize: '0.875rem', color: 'var(--gray-600)', lineHeight: 1.75 }}>{assignment.submission?.abstract}</p>
                </div>
                
                {assignment.submission?.keywords?.length > 0 && (
                  <div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>Keywords</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
                      {assignment.submission.keywords.map((k: string) => <span key={k} className="badge badge-navy">{k}</span>)}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="card" style={{ background: '#f8fafc' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', color: 'var(--navy)' }}>
                <FileText size={18} />
                <h4 style={{ margin: 0 }}>Review Guidelines</h4>
              </div>
              <ul style={{ fontSize: '0.875rem', color: 'var(--gray-600)', paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', margin: 0 }}>
                <li>Evaluate the originality and significance of the research.</li>
                <li>Check for methodological soundness and validity of results.</li>
                <li>Ensure ethical standards are met.</li>
                <li>Be constructive and professional in your feedback.</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
