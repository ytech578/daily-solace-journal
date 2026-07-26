'use client';

import { useAuthStore } from '@/store/auth.store';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Users, FileText, Search, Loader2, ShieldCheck, UserX } from 'lucide-react';

const ROLES = ['AUTHOR', 'REVIEWER', 'EDITOR', 'ADMIN'];

export default function AdminPanel() {
  const { user, isLoading } = useAuthStore();
  const router = useRouter();
  const qc = useQueryClient();
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!isLoading && !user) router.push('/auth/login');
    if (!isLoading && user && user.role !== 'ADMIN') router.push('/portal/author');
  }, [user, isLoading, router]);

  const { data: users = [], isLoading: loading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => (await api.get('/admin/users')).data,
    enabled: !!user,
  });

  const { data: stats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => (await api.get('/admin/stats')).data,
    enabled: !!user,
  });

  const changeRole = useMutation({
    mutationFn: async ({ id, role }: { id: string; role: string }) =>
      api.patch(`/admin/users/${id}/role`, { role }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-users'] }),
  });

  if (isLoading || !user) return null;

  const filtered = users.filter((u: any) =>
    !search || u.name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="portal-layout">
      <aside className="portal-sidebar">
        <div style={{ padding: '0 1.5rem 1.5rem' }}>
          <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1.125rem', color: '#fff', marginBottom: '0.75rem' }}>{user.name[0]}</div>
          <div style={{ color: '#fff', fontWeight: 600, fontSize: '0.95rem' }}>{user.name}</div>
          <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem' }}>Administrator</div>
        </div>
        <div className="sidebar-section-title">Admin Panel</div>
        {[
          { href: '/portal/admin', label: 'User Management', icon: '👥' },
          { href: '/portal/editor', label: 'Editorial Board', icon: '📋' },
          { href: '/portal/admin/journals', label: 'Journal Management', icon: '📚' },
        ].map(l => <Link key={l.href} href={l.href} className={`sidebar-link ${l.href === '/portal/admin' ? 'active' : ''}`}><span>{l.icon}</span> {l.label}</Link>)}
      </aside>

      <main className="portal-content">
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontFamily: 'Inter,sans-serif', fontWeight: 700, color: 'var(--navy)' }}>Admin Panel</h2>
          <p style={{ color: 'var(--gray-500)', fontSize: '0.9rem' }}>Platform-wide management and user control.</p>
        </div>

        {/* Platform stats */}
        {stats && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '1rem', marginBottom: '2rem' }}>
            {[
              { label: 'Total Users', value: stats.totalUsers, color: 'var(--navy)' },
              { label: 'Submissions', value: stats.totalSubmissions, color: 'var(--info)' },
              { label: 'Published', value: stats.totalPublished, color: 'var(--success)' },
              { label: 'Revenue (₹)', value: stats.totalRevenue?.toLocaleString('en-IN') ?? '—', color: 'var(--gold)' },
            ].map(({ label, value, color }) => (
              <div key={label} className="card" style={{ padding: '1.25rem' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>{label}</div>
                <div style={{ fontSize: '1.875rem', fontWeight: 800, color, fontFamily: 'Inter,sans-serif' }}>{value}</div>
              </div>
            ))}
          </div>
        )}

        {/* User management */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h3 style={{ fontFamily: 'Inter,sans-serif', fontWeight: 700, fontSize: '1rem', color: 'var(--navy)' }}>User Management ({users.length})</h3>
          <div style={{ position: 'relative', width: 280 }}>
            <Search size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)' }} />
            <input className="form-input" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search users…" style={{ paddingLeft: '2.25rem', background: '#fff' }} />
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--gray-400)' }}>Loading…</div>
        ) : (
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <table className="data-table">
              <thead><tr><th>Name</th><th>Email</th><th>Joined</th><th>Role</th><th>Actions</th></tr></thead>
              <tbody>
                {filtered.map((u: any) => (
                  <tr key={u.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,var(--navy),var(--navy-light))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8125rem', fontWeight: 700, color: '#fff', flexShrink: 0 }}>{u.name?.[0]}</div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--gray-800)' }}>{u.name}</div>
                          {u.institution && <div style={{ fontSize: '0.75rem', color: 'var(--gray-400)' }}>{u.institution}</div>}
                        </div>
                      </div>
                    </td>
                    <td style={{ fontSize: '0.8125rem', color: 'var(--gray-500)' }}>{u.email}</td>
                    <td style={{ fontSize: '0.8125rem', color: 'var(--gray-400)' }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td>
                      <select
                        value={u.role}
                        onChange={e => changeRole.mutate({ id: u.id, role: e.target.value })}
                        style={{ padding: '0.3rem 0.5rem', borderRadius: 6, border: '1.5px solid var(--gray-200)', fontSize: '0.8125rem', background: '#fff', cursor: 'pointer', color: 'var(--gray-700)' }}
                        disabled={u.id === user.id}
                      >
                        {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                      </select>
                    </td>
                    <td>
                      {u.id !== user.id && (
                        <button className="btn btn-outline btn-sm" style={{ color: 'var(--error)', borderColor: 'var(--error)', fontSize: '0.75rem' }}
                          onClick={() => { if (confirm(`Remove ${u.name}?`)) api.delete(`/admin/users/${u.id}`).then(() => qc.invalidateQueries({ queryKey: ['admin-users'] })); }}>
                          <UserX size={13} /> Remove
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
