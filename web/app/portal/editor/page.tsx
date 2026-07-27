'use client';

import { useAuthStore } from '@/store/auth.store';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Users, FileText, CheckCircle, XCircle, Clock, Search, Filter, Loader2, ArrowRight } from 'lucide-react';

const STATUS_META: Record<string, { badge: string; label: string }> = {
  SUBMITTED:       { badge: 'badge-navy',   label: 'Submitted'        },
  UNDER_REVIEW:    { badge: 'badge-yellow', label: 'Under Review'     },
  WITH_EDITOR:     { badge: 'badge-yellow', label: 'With Editor'      },
  REVISION_NEEDED: { badge: 'badge-yellow', label: 'Revise & Resubmit'},
  REVISED:         { badge: 'badge-navy',   label: 'Revised'          },
  ACCEPTED:        { badge: 'badge-green',  label: 'Accepted'         },
  REJECTED:        { badge: 'badge-red',    label: 'Rejected'         },
  PUBLISHED:       { badge: 'badge-green',  label: 'Published'        },
};

const FILTER_TABS = ['ALL', 'SUBMITTED', 'UNDER_REVIEW', 'REVISION_NEEDED', 'ACCEPTED', 'PUBLISHED', 'REJECTED'];

export default function EditorDashboard() {
  const { user, isLoading } = useAuthStore();
  const router = useRouter();
  const qc = useQueryClient();
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [deciding, setDeciding] = useState<string | null>(null);
  const [decisionForm, setDecisionForm] = useState({ decision: 'ACCEPTED' as 'ACCEPTED' | 'REJECTED' | 'REVISION_NEEDED', comment: '' });

  useEffect(() => {
    if (!isLoading && !user) router.push('/auth/login');
    if (!isLoading && user && !['EDITOR', 'ADMIN'].includes(user.role)) router.push('/portal/author');
  }, [user, isLoading, router]);

  const { data: submissions = [], isLoading: loading } = useQuery({
    queryKey: ['editor-submissions', statusFilter],
    queryFn: async () => {
      const params = statusFilter !== 'ALL' ? `?status=${statusFilter}` : '';
      const { data } = await api.get(`/submissions${params}`);
      return data.items ?? data;
    },
    enabled: !!user,
  });

  const makeDecision = useMutation({
    mutationFn: async ({ id, decision, comment }: { id: string; decision: string; comment: string }) =>
      api.post(`/submissions/${id}/decision`, { decision, comment }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['editor-submissions'] }); setDeciding(null); },
  });

  const filtered = submissions.filter((s: any) =>
    !search || s.title?.toLowerCase().includes(search.toLowerCase())
  );

  if (isLoading || !user) return null;

  const total    = submissions.length;
  const pending  = submissions.filter((s: any) => s.status === 'SUBMITTED').length;
  const reviews  = submissions.filter((s: any) => s.status === 'UNDER_REVIEW').length;
  const accepted = submissions.filter((s: any) => s.status === 'ACCEPTED').length;

  return (
    <div className="portal-layout">
      <aside className="portal-sidebar">
        <div style={{ padding: '0 1.5rem 1.5rem' }}>
          <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1.125rem', color: '#fff', marginBottom: '0.75rem' }}>{user.name[0]}</div>
          <div style={{ color: '#fff', fontWeight: 600, fontSize: '0.95rem' }}>{user.name}</div>
          <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem' }}>Editor</div>
        </div>
        <div className="sidebar-section-title">Editorial</div>
        {[
          { href: '/portal/editor', label: 'All Submissions', icon: '📋' },
          { href: '/portal/editor/volumes', label: 'Volumes & Issues', icon: '📚' },
          { href: '/portal/profile', label: 'Edit Profile', icon: '👤' },
        ].map(l => <Link key={l.href} href={l.href} className="sidebar-link active"><span>{l.icon}</span> {l.label}</Link>)}
        {user.role === 'ADMIN' && <>
          <div className="sidebar-section-title">Admin</div>
          <Link href="/portal/admin" className="sidebar-link"><span>⚙️</span> Admin Panel</Link>
        </>}
      </aside>

      <main className="portal-content">
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontFamily: 'Inter,sans-serif', fontWeight: 700, color: 'var(--navy)' }}>Editorial Dashboard</h2>
          <p style={{ color: 'var(--gray-500)', fontSize: '0.9rem' }}>Review, assign, and decide on submitted manuscripts.</p>
        </div>

        {/* Stats */}
        <div className="grid-4-cols" style={{ gap: '1rem', marginBottom: '2rem' }}>
          {[
            { label: 'Total', value: total, color: 'var(--gray-700)', icon: FileText },
            { label: 'Awaiting Decision', value: pending, color: 'var(--info)', icon: Clock },
            { label: 'Under Review', value: reviews, color: 'var(--warning)', icon: Users },
            { label: 'Accepted', value: accepted, color: 'var(--success)', icon: CheckCircle },
          ].map(({ label, value, color, icon: Icon }) => (
            <div key={label} className="card" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</span>
                <Icon size={18} color={color} />
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color, fontFamily: 'Inter,sans-serif' }}>{value}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1.25rem', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
            <Search size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)' }} />
            <input className="form-input" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by title…" style={{ paddingLeft: '2.25rem', background: '#fff' }} />
          </div>
          <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
            {FILTER_TABS.map(s => (
              <button key={s} onClick={() => setStatusFilter(s)}
                style={{ padding: '0.375rem 0.75rem', borderRadius: 9999, fontSize: '0.8125rem', fontWeight: 500, border: '1.5px solid', cursor: 'pointer', background: statusFilter === s ? 'var(--navy)' : '#fff', color: statusFilter === s ? '#fff' : 'var(--gray-600)', borderColor: statusFilter === s ? 'var(--navy)' : 'var(--gray-200)' }}>
                {s.replace(/_/g, ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Submissions table */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--gray-400)' }}>Loading…</div>
        ) : filtered.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--gray-400)' }}>No submissions found.</div>
        ) : (
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <table className="data-table">
              <thead><tr><th>Title</th><th>Author</th><th>Journal</th><th>Status</th><th>Date</th><th>Actions</th></tr></thead>
              <tbody>
                {filtered.map((s: any) => {
                  const meta = STATUS_META[s.status] ?? { badge: 'badge-gray', label: s.status };
                  return (
                    <tr key={s.id}>
                      <td style={{ maxWidth: 260 }}>
                        <div className="truncate-2" style={{ fontWeight: 500, color: 'var(--gray-800)', fontSize: '0.875rem' }}>{s.title}</div>
                      </td>
                      <td style={{ fontSize: '0.8125rem', color: 'var(--gray-500)' }}>{s.author?.name}</td>
                      <td style={{ fontSize: '0.8125rem', color: 'var(--gray-500)', whiteSpace: 'nowrap' }}>{s.journal?.name}</td>
                      <td><span className={`badge ${meta.badge}`}>{meta.label}</span></td>
                      <td style={{ fontSize: '0.8125rem', color: 'var(--gray-400)', whiteSpace: 'nowrap' }}>{s.submittedAt ? new Date(s.submittedAt).toLocaleDateString() : '—'}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.375rem' }}>
                          {['SUBMITTED', 'UNDER_REVIEW', 'WITH_EDITOR', 'REVISED'].includes(s.status) && (
                            <button className="btn btn-outline btn-sm" onClick={() => setDeciding(s.id)} style={{ fontSize: '0.75rem', padding: '0.3rem 0.625rem' }}>
                              Decide
                            </button>
                          )}
                          <Link href={`/portal/editor/submissions/${s.id}`} className="btn btn-outline btn-sm" style={{ fontSize: '0.75rem', padding: '0.3rem 0.625rem' }}>
                            View
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Decision modal */}
        {deciding && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: '1.5rem' }}>
            <div className="card" style={{ width: '100%', maxWidth: 480, borderRadius: 16, boxShadow: '0 24px 64px rgba(0,0,0,0.3)' }}>
              <h3 style={{ marginBottom: '1.25rem' }}>Editorial Decision</h3>
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label">Decision</label>
                <select className="form-input" value={decisionForm.decision} onChange={e => setDecisionForm(f => ({ ...f, decision: e.target.value as any }))}>
                  <option value="ACCEPTED">Accept</option>
                  <option value="REVISION_NEEDED">Minor / Major Revision</option>
                  <option value="REJECTED">Reject</option>
                </select>
              </div>
              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label className="form-label">Decision Letter / Comments</label>
                <textarea className="form-input" rows={4} value={decisionForm.comment} onChange={e => setDecisionForm(f => ({ ...f, comment: e.target.value }))} placeholder="Detailed feedback to the author…" />
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button className="btn btn-outline" onClick={() => setDeciding(null)}>Cancel</button>
                <button className="btn btn-primary" onClick={() => makeDecision.mutate({ id: deciding, ...decisionForm })} disabled={makeDecision.isPending}>
                  {makeDecision.isPending ? <><Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> Sending…</> : 'Send Decision'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
