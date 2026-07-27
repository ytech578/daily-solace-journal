'use client';

import { useAuthStore } from '@/store/auth.store';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Users, FileText, Search, Loader2, ShieldCheck, UserX, CheckCircle, XCircle } from 'lucide-react';

const ROLES = ['AUTHOR', 'REVIEWER', 'EDITOR', 'ADMIN'];

export default function AdminPanel() {
  const { user, isLoading } = useAuthStore();
  const router = useRouter();
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'USERS' | 'APPLICATIONS' | 'STAFF'>('OVERVIEW');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteMsg, setInviteMsg] = useState('');
  
  useEffect(() => {
    if (!isLoading && !user) router.push('/auth/login');
    if (!isLoading && user && user.role !== 'ADMIN') router.push('/portal/author');
  }, [user, isLoading, router]);

  const { data: users = [], isLoading: loadingUsers } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => (await api.get('/admin/users')).data,
    enabled: !!user && (activeTab === 'USERS' || activeTab === 'OVERVIEW'),
  });

  const { data: stats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => (await api.get('/admin/stats')).data,
    enabled: !!user && activeTab === 'OVERVIEW',
  });

  const { data: applications = [], isLoading: loadingApps } = useQuery({
    queryKey: ['admin-applications'],
    queryFn: async () => (await api.get('/reviewer-applications')).data,
    enabled: !!user && activeTab === 'APPLICATIONS',
  });

  const changeRole = useMutation({
    mutationFn: async ({ id, role }: { id: string; role: string }) =>
      api.patch(`/admin/users/${id}/role`, { role }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-users'] }),
  });

  const updateApplication = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) =>
      api.patch(`/reviewer-applications/${id}`, { status }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-applications'] }),
  });

  const inviteEditor = useMutation({
    mutationFn: async (email: string) => api.post('/admin/editors', { email }),
    onSuccess: () => { setInviteMsg('Invitation sent successfully!'); setInviteEmail(''); },
    onError: (err: any) => setInviteMsg(err.response?.data?.error || 'Failed to send invitation.'),
  });

  if (isLoading || !user) return null;

  const filteredUsers = users.filter((u: any) =>
    !search || u.name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase())
  );

  const pendingApps = applications.filter((a: any) => a.status === 'PENDING');
  const processedApps = applications.filter((a: any) => a.status !== 'PENDING');

  return (
    <div className="portal-layout">
      <aside className="portal-sidebar">
        <div style={{ padding: '0 1.5rem 1.5rem' }}>
          <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1.125rem', color: '#fff', marginBottom: '0.75rem' }}>{user.name[0]}</div>
          <div style={{ color: '#fff', fontWeight: 600, fontSize: '0.95rem' }}>{user.name}</div>
          <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem' }}>Administrator</div>
        </div>
        <div className="sidebar-section-title">Admin Panel</div>
        <Link href="/portal/admin" className="sidebar-link active"><span>👥</span> Platform Management</Link>
        <Link href="/portal/editor" className="sidebar-link"><span>📋</span> Editorial Board</Link>
        <Link href="/portal/admin/journals" className="sidebar-link"><span>📚</span> Journal Management</Link>
        <Link href="/portal/profile" className="sidebar-link"><span>👤</span> Edit Profile</Link>
      </aside>

      <main className="portal-content">
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontFamily: 'Inter,sans-serif', fontWeight: 700, color: 'var(--navy)' }}>Admin Panel</h2>
          <p style={{ color: 'var(--gray-500)', fontSize: '0.9rem' }}>Platform-wide management and user control.</p>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--gray-200)', marginBottom: '2rem' }}>
          {['OVERVIEW', 'USERS', 'APPLICATIONS', 'STAFF'].map(t => (
            <button key={t} onClick={() => setActiveTab(t as any)} style={{
              padding: '0.75rem 1rem', background: 'none', border: 'none', cursor: 'pointer',
              borderBottom: activeTab === t ? '2px solid var(--navy)' : '2px solid transparent',
              color: activeTab === t ? 'var(--navy)' : 'var(--gray-500)',
              fontWeight: activeTab === t ? 600 : 500,
              fontSize: '0.875rem'
            }}>
              {t === 'STAFF' ? 'Add Staff' : t.charAt(0) + t.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        {activeTab === 'OVERVIEW' && stats && (
          <div className="grid-4-cols" style={{ gap: '1rem', marginBottom: '2rem' }}>
            {[
              { label: 'Total Users', value: stats.totalUsers, color: 'var(--navy)' },
              { label: 'Submissions', value: stats.totalSubmissions, color: 'var(--info)' },
              { label: 'Published', value: stats.publishedArticles, color: 'var(--success)' },
              { label: 'Revenue (₹)', value: stats.revenue?.toLocaleString('en-IN') ?? '0', color: 'var(--gold)' },
            ].map(({ label, value, color }) => (
              <div key={label} className="card" style={{ padding: '1.25rem' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>{label}</div>
                <div style={{ fontSize: '1.875rem', fontWeight: 800, color, fontFamily: 'Inter,sans-serif' }}>{value}</div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'USERS' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontFamily: 'Inter,sans-serif', fontWeight: 700, fontSize: '1rem', color: 'var(--navy)' }}>User Management ({users.length})</h3>
              <div style={{ position: 'relative', width: 280 }}>
                <Search size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)' }} />
                <input className="form-input" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search users…" style={{ paddingLeft: '2.25rem', background: '#fff' }} />
              </div>
            </div>

            {loadingUsers ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--gray-400)' }}>Loading…</div>
            ) : (
              <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <table className="data-table">
                  <thead><tr><th>Name</th><th>Email</th><th>Joined</th><th>Role</th><th>Actions</th></tr></thead>
                  <tbody>
                    {filteredUsers.map((u: any) => (
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
                              onClick={() => { if (confirm(`Deactivate ${u.name}?`)) api.delete(`/admin/users/${u.id}`).then(() => qc.invalidateQueries({ queryKey: ['admin-users'] })); }}>
                              <UserX size={13} /> Deactivate
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'APPLICATIONS' && (
          <div>
            <h3 style={{ fontFamily: 'Inter,sans-serif', fontWeight: 700, fontSize: '1rem', color: 'var(--navy)', marginBottom: '1.25rem' }}>Reviewer Applications</h3>
            
            {loadingApps ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--gray-400)' }}>Loading…</div>
            ) : pendingApps.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--gray-400)' }}>No pending applications.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {pendingApps.map((a: any) => (
                  <div key={a.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h4 style={{ color: 'var(--navy)', marginBottom: '0.25rem' }}>{a.firstName} {a.lastName}</h4>
                      <div style={{ fontSize: '0.875rem', color: 'var(--gray-600)', marginBottom: '0.75rem' }}>{a.email} • {a.institution} ({a.country})</div>
                      <div style={{ fontSize: '0.875rem', color: 'var(--gray-800)', marginBottom: '0.5rem' }}><strong>Areas:</strong> {a.researchAreas?.join(', ')}</div>
                      {a.bio && <div style={{ fontSize: '0.8125rem', color: 'var(--gray-500)', fontStyle: 'italic', maxWidth: 600 }}>"{a.bio}"</div>}
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                      <button className="btn btn-primary btn-sm" onClick={() => updateApplication.mutate({ id: a.id, status: 'APPROVED' })} disabled={updateApplication.isPending}>
                        <CheckCircle size={14} /> Approve
                      </button>
                      <button className="btn btn-outline btn-sm" style={{ color: 'var(--error)', borderColor: 'var(--error)' }} onClick={() => updateApplication.mutate({ id: a.id, status: 'REJECTED' })} disabled={updateApplication.isPending}>
                        <XCircle size={14} /> Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'STAFF' && (
          <div className="card" style={{ maxWidth: 500 }}>
            <h3 style={{ fontFamily: 'Inter,sans-serif', fontWeight: 700, fontSize: '1rem', color: 'var(--navy)', marginBottom: '1.25rem' }}>Invite Editor</h3>
            <p style={{ color: 'var(--gray-500)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>Send an invitation link to a user to become an Editor.</p>
            
            <form onSubmit={e => { e.preventDefault(); inviteEditor.mutate(inviteEmail); }}>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input className="form-input" type="email" required value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} />
              </div>
              <button type="submit" className="btn btn-gold" disabled={inviteEditor.isPending} style={{ marginTop: '0.5rem' }}>
                {inviteEditor.isPending ? <Loader2 size={16} className="spin" /> : 'Send Invitation'}
              </button>
            </form>

            {inviteMsg && (
              <div style={{ marginTop: '1rem', padding: '0.75rem', borderRadius: 8, fontSize: '0.875rem', background: inviteMsg.includes('success') ? '#ecfdf5' : '#fef2f2', color: inviteMsg.includes('success') ? '#047857' : '#dc2626' }}>
                {inviteMsg}
              </div>
            )}
          </div>
        )}
      </main>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } } .spin { animation: spin 1s linear infinite; }`}</style>
    </div>
  );
}
