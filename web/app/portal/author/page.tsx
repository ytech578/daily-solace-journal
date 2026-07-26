'use client';

import { useAuthStore } from '@/store/auth.store';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { FileText, PlusCircle, Clock, CheckCircle, XCircle, RotateCcw, Eye, Bell } from 'lucide-react';

const statusMeta: Record<string, { label: string; color: string; badge: string }> = {
  DRAFT:          { label: 'Draft',         color: 'var(--gray-400)', badge: 'badge-gray'   },
  SUBMITTED:      { label: 'Submitted',     color: 'var(--info)',     badge: 'badge-navy'   },
  UNDER_REVIEW:   { label: 'Under Review',  color: 'var(--warning)',  badge: 'badge-yellow' },
  WITH_EDITOR:    { label: 'With Editor',   color: 'var(--warning)',  badge: 'badge-yellow' },
  REVISION_NEEDED:{ label: 'Revise & Resubmit', color: 'var(--warning)', badge: 'badge-yellow' },
  REVISED:        { label: 'Revised',       color: 'var(--info)',     badge: 'badge-navy'   },
  ACCEPTED:       { label: 'Accepted',      color: 'var(--success)',  badge: 'badge-green'  },
  REJECTED:       { label: 'Rejected',      color: 'var(--error)',    badge: 'badge-red'    },
  PUBLISHED:      { label: 'Published',     color: 'var(--success)',  badge: 'badge-green'  },
};

export default function AuthorDashboard() {
  const { user, isLoading } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) router.push('/auth/login');
  }, [user, isLoading, router]);

  const { data: submissions = [] } = useQuery({
    queryKey: ['my-submissions'],
    queryFn: async () => (await api.get('/submissions/mine')).data,
    enabled: !!user,
  });

  const { data: notifications } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => (await api.get('/notifications')).data,
    enabled: !!user,
  });

  if (isLoading || !user) return <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--gray-400)' }}>Loading…</div>;

  const draft = submissions.filter((s: any) => s.status === 'DRAFT').length;
  const active = submissions.filter((s: any) => !['DRAFT','PUBLISHED','REJECTED'].includes(s.status)).length;
  const published = submissions.filter((s: any) => s.status === 'PUBLISHED').length;

  return (
    <div className="portal-layout">
      {/* Sidebar */}
      <aside className="portal-sidebar">
        <div style={{ padding: '0 1.5rem 1.5rem' }}>
          <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1.125rem', color: '#fff', marginBottom: '0.75rem' }}>
            {user.name[0]}
          </div>
          <div style={{ color: '#fff', fontWeight: 600, fontSize: '0.95rem' }}>{user.name}</div>
          <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem', marginTop: '0.125rem' }}>{user.email}</div>
        </div>
        <div className="sidebar-section-title">Author Portal</div>
        {[
          { href: '/portal/author', label: 'Dashboard', icon: '🏠' },
          { href: '/portal/author/submit', label: 'Submit Manuscript', icon: '📄' },
          { href: '/portal/author/submissions', label: 'My Submissions', icon: '📋' },
          { href: '/portal/author/profile', label: 'My Profile', icon: '👤' },
        ].map((l) => (
          <Link key={l.href} href={l.href} className="sidebar-link">
            <span>{l.icon}</span> {l.label}
          </Link>
        ))}
      </aside>

      {/* Content */}
      <main className="portal-content">
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontFamily: 'Inter,sans-serif', fontWeight: 700, color: 'var(--navy)', marginBottom: '0.25rem' }}>Welcome back, {user.name.split(' ')[0]} 👋</h2>
          <p style={{ color: 'var(--gray-500)', fontSize: '0.9rem' }}>Manage your manuscripts and track their progress.</p>
        </div>

        {/* Stats */}
        <div className="grid-4-cols" style={{ gap: '1rem', marginBottom: '2rem' }}>
          {[
            { label: 'Total Submissions', value: submissions.length, icon: FileText, color: 'var(--navy)' },
            { label: 'In Progress', value: active, icon: Clock, color: 'var(--warning)' },
            { label: 'Published', value: published, icon: CheckCircle, color: 'var(--success)' },
            { label: 'Unread Alerts', value: notifications?.unread ?? 0, icon: Bell, color: 'var(--info)' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="card" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</span>
                <Icon size={18} color={color} />
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color, fontFamily: 'Inter,sans-serif' }}>{value}</div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
          <Link href="/portal/author/submit" className="btn btn-primary">
            <PlusCircle size={16} /> Submit New Manuscript
          </Link>
        </div>

        {/* Submissions table */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--gray-100)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h4>My Manuscripts</h4>
            <Link href="/portal/author/submissions" style={{ fontSize: '0.8125rem', color: 'var(--navy)', fontWeight: 600 }}>View All</Link>
          </div>
          {submissions.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--gray-400)' }}>
              <FileText size={32} style={{ margin: '0 auto 0.75rem' }} />
              <p>No submissions yet. <Link href="/portal/author/submit" style={{ color: 'var(--navy)', fontWeight: 600 }}>Submit your first paper →</Link></p>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Journal</th>
                  <th>Status</th>
                  <th>Submitted</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {submissions.slice(0, 8).map((s: any) => {
                  const meta = statusMeta[s.status] ?? statusMeta.DRAFT;
                  return (
                    <tr key={s.id}>
                      <td style={{ maxWidth: 280 }}>
                        <span className="truncate-2" style={{ fontWeight: 500, color: 'var(--gray-800)', fontSize: '0.875rem' }}>{s.title}</span>
                      </td>
                      <td style={{ fontSize: '0.8125rem', color: 'var(--gray-500)', whiteSpace: 'nowrap' }}>{s.journal?.name}</td>
                      <td><span className={`badge ${meta.badge}`}>{meta.label}</span></td>
                      <td style={{ fontSize: '0.8125rem', color: 'var(--gray-400)', whiteSpace: 'nowrap' }}>{s.submittedAt ? new Date(s.submittedAt).toLocaleDateString() : '—'}</td>
                      <td>
                        <Link href={`/portal/author/submissions/${s.id}`} className="btn btn-outline btn-sm">
                          <Eye size={13} /> View
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
}
