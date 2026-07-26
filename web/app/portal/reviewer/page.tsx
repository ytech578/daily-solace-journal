'use client';

import { useAuthStore } from '@/store/auth.store';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import Link from 'next/link';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ClipboardList, CheckCircle, XCircle, Clock, AlertCircle, Loader2 } from 'lucide-react';

export default function ReviewerPortal() {
  const { user, isLoading } = useAuthStore();
  const router = useRouter();
  const queryClient = useQueryClient();

  useEffect(() => { if (!isLoading && !user) router.push('/auth/login'); }, [user, isLoading, router]);

  const { data: assignments = [], isLoading: loading } = useQuery({
    queryKey: ['my-review-assignments'],
    queryFn: async () => (await api.get('/review-assignments/mine')).data,
    enabled: !!user,
  });

  const respond = useMutation({
    mutationFn: async ({ id, action }: { id: string; action: 'accept' | 'decline' }) =>
      api.post(`/review-assignments/${id}/${action}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['my-review-assignments'] }),
  });

  if (isLoading || !user) return null;

  const pending   = assignments.filter((a: any) => a.status === 'PENDING');
  const accepted  = assignments.filter((a: any) => a.status === 'ACCEPTED' && !a.submittedAt);
  const completed = assignments.filter((a: any) => a.submittedAt);

  return (
    <div className="portal-layout">
      <aside className="portal-sidebar">
        <div style={{ padding: '0 1.5rem 1.5rem' }}>
          <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1.125rem', color: '#fff', marginBottom: '0.75rem' }}>{user.name[0]}</div>
          <div style={{ color: '#fff', fontWeight: 600, fontSize: '0.95rem' }}>{user.name}</div>
          <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem' }}>Reviewer</div>
        </div>
        <div className="sidebar-section-title">Reviewer Portal</div>
        <Link href="/portal/reviewer" className="sidebar-link active"><span>📋</span> My Reviews</Link>
      </aside>

      <main className="portal-content">
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontFamily: 'Inter,sans-serif', fontWeight: 700, color: 'var(--navy)' }}>Reviewer Dashboard</h2>
          <p style={{ color: 'var(--gray-500)', fontSize: '0.9rem' }}>Manage your review assignments.</p>
        </div>

        {/* Stats */}
        <div className="grid-3-cols" style={{ gap: '1rem', marginBottom: '2rem' }}>
          {[
            { label: 'Pending Invitations', value: pending.length, color: 'var(--warning)', icon: Clock },
            { label: 'In Progress', value: accepted.length, color: 'var(--navy)', icon: ClipboardList },
            { label: 'Completed', value: completed.length, color: 'var(--success)', icon: CheckCircle },
          ].map(({ label, value, color, icon: Icon }) => (
            <div key={label} className="card" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</span>
                <Icon size={18} color={color} />
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color, fontFamily: 'Inter,sans-serif' }}>{value}</div>
            </div>
          ))}
        </div>

        {/* Pending invitations */}
        {pending.length > 0 && (
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ fontFamily: 'Inter,sans-serif', fontSize: '1rem', fontWeight: 700, color: 'var(--navy)', marginBottom: '1rem' }}>Pending Invitations</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              {pending.map((a: any) => (
                <div key={a.id} className="card" style={{ borderLeft: '4px solid var(--warning)' }}>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ color: 'var(--navy)', marginBottom: '0.375rem', lineHeight: 1.4 }}>{a.submission?.title}</h4>
                      <div style={{ fontSize: '0.8125rem', color: 'var(--gray-400)' }}>
                        Invited: {new Date(a.assignedAt).toLocaleDateString()} · Deadline: {a.dueDate ? new Date(a.dueDate).toLocaleDateString() : 'TBD'}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                      <button className="btn btn-primary btn-sm" onClick={() => respond.mutate({ id: a.id, action: 'accept' })} disabled={respond.isPending}>
                        {respond.isPending ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <CheckCircle size={14} />} Accept
                      </button>
                      <button className="btn btn-outline btn-sm" style={{ color: 'var(--error)', borderColor: 'var(--error)' }} onClick={() => respond.mutate({ id: a.id, action: 'decline' })} disabled={respond.isPending}>
                        <XCircle size={14} /> Decline
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* In-progress */}
        {accepted.length > 0 && (
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ fontFamily: 'Inter,sans-serif', fontSize: '1rem', fontWeight: 700, color: 'var(--navy)', marginBottom: '1rem' }}>In Progress</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              {accepted.map((a: any) => (
                <div key={a.id} className="card" style={{ borderLeft: '4px solid var(--navy)' }}>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ color: 'var(--navy)', marginBottom: '0.375rem', lineHeight: 1.4 }}>{a.submission?.title}</h4>
                      <div style={{ fontSize: '0.8125rem', color: 'var(--gray-400)' }}>
                        Due: {a.dueDate ? new Date(a.dueDate).toLocaleDateString() : 'TBD'}
                      </div>
                    </div>
                    <Link href={`/portal/reviewer/review/${a.id}`} className="btn btn-primary btn-sm" style={{ flexShrink: 0 }}>
                      Write Review →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Completed */}
        {completed.length > 0 && (
          <div>
            <h3 style={{ fontFamily: 'Inter,sans-serif', fontSize: '1rem', fontWeight: 700, color: 'var(--navy)', marginBottom: '1rem' }}>Completed</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              {completed.map((a: any) => (
                <div key={a.id} className="card" style={{ borderLeft: '4px solid var(--success)', opacity: 0.8 }}>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <CheckCircle size={20} color="var(--success)" />
                    <div style={{ flex: 1 }}>
                      <h4 style={{ color: 'var(--gray-700)', fontSize: '0.9375rem' }}>{a.submission?.title}</h4>
                      <span style={{ fontSize: '0.8rem', color: 'var(--gray-400)' }}>Submitted: {new Date(a.submittedAt).toLocaleDateString()}</span>
                    </div>
                    <span className="badge badge-green">Completed</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {assignments.length === 0 && !loading && (
          <div className="card" style={{ textAlign: 'center', padding: '3.5rem' }}>
            <ClipboardList size={40} color="var(--gray-300)" style={{ margin: '0 auto 1rem' }} />
            <h4 style={{ color: 'var(--gray-500)' }}>No review assignments yet</h4>
            <p style={{ color: 'var(--gray-400)', fontSize: '0.875rem', marginTop: '0.5rem' }}>You&apos;ll receive an email when you&apos;re assigned to review a manuscript.</p>
          </div>
        )}
      </main>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
