'use client';

import { useAuthStore } from '@/store/auth.store';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import Link from 'next/link';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FileText, PlusCircle, Eye, Download } from 'lucide-react';

const STATUS_META: Record<string, { label: string; badge: string }> = {
  DRAFT:           { label: 'Draft',            badge: 'badge-gray'   },
  SUBMITTED:       { label: 'Submitted',         badge: 'badge-navy'   },
  UNDER_REVIEW:    { label: 'Under Review',      badge: 'badge-yellow' },
  WITH_EDITOR:     { label: 'With Editor',       badge: 'badge-yellow' },
  REVISION_NEEDED: { label: 'Revise & Resubmit', badge: 'badge-yellow' },
  REVISED:         { label: 'Revised',           badge: 'badge-navy'   },
  ACCEPTED:        { label: 'Accepted',          badge: 'badge-green'  },
  REJECTED:        { label: 'Rejected',          badge: 'badge-red'    },
  PUBLISHED:       { label: 'Published',         badge: 'badge-green'  },
};

export default function MySubmissionsPage() {
  const { user, isLoading } = useAuthStore();
  const router = useRouter();

  useEffect(() => { if (!isLoading && !user) router.push('/auth/login'); }, [user, isLoading, router]);

  const { data: submissions = [], isLoading: loading } = useQuery({
    queryKey: ['my-submissions'],
    queryFn: async () => (await api.get('/submissions/mine')).data,
    enabled: !!user,
  });

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
        ].map(l => <Link key={l.href} href={l.href} className={`sidebar-link ${l.href === '/portal/author/submissions' ? 'active' : ''}`}><span>{l.icon}</span> {l.label}</Link>)}
      </aside>

      <main className="portal-content">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
          <div>
            <h2 style={{ fontFamily: 'Inter,sans-serif', fontWeight: 700, color: 'var(--navy)' }}>My Submissions</h2>
            <p style={{ color: 'var(--gray-500)', fontSize: '0.9rem', marginTop: '0.25rem' }}>{submissions.length} manuscript{submissions.length !== 1 ? 's' : ''} total</p>
          </div>
          <Link href="/portal/author/submit" className="btn btn-primary btn-sm"><PlusCircle size={15} /> New Submission</Link>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--gray-400)' }}>Loading…</div>
        ) : submissions.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '3.5rem' }}>
            <FileText size={40} color="var(--gray-300)" style={{ margin: '0 auto 1rem' }} />
            <h4 style={{ color: 'var(--gray-500)', marginBottom: '0.5rem' }}>No submissions yet</h4>
            <Link href="/portal/author/submit" className="btn btn-primary" style={{ marginTop: '1rem' }}>Submit Your First Manuscript</Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {submissions.map((s: any) => {
              const meta = STATUS_META[s.status] ?? STATUS_META.DRAFT;
              return (
                <div key={s.id} className="card">
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                        <span className={`badge ${meta.badge}`}>{meta.label}</span>
                        <span style={{ fontSize: '0.8rem', color: 'var(--gray-400)' }}>Ref: #{s.id.slice(0, 8).toUpperCase()}</span>
                      </div>
                      <h4 style={{ fontFamily: '"Playfair Display",Georgia,serif', fontWeight: 600, fontSize: '1rem', color: 'var(--navy)', marginBottom: '0.375rem', lineHeight: 1.4 }}>{s.title}</h4>
                      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', fontSize: '0.8125rem', color: 'var(--gray-400)' }}>
                        <span style={{ color: 'var(--gold)', fontWeight: 600 }}>{s.journal?.name}</span>
                        {s.submittedAt && <span>Submitted: {new Date(s.submittedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>}
                        {s.updatedAt && <span>Updated: {new Date(s.updatedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>}
                      </div>
                    </div>
                    <Link href={`/portal/author/submissions/${s.id}`} className="btn btn-outline btn-sm" style={{ flexShrink: 0 }}>
                      <Eye size={13} /> View
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
