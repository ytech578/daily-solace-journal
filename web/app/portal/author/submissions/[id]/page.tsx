'use client';

import { useAuthStore } from '@/store/auth.store';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import Link from 'next/link';
import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, FileText, Clock, User, BookOpen, CreditCard, CheckCircle } from 'lucide-react';

const STATUS_META: Record<string, { label: string; badge: string; desc: string }> = {
  DRAFT:           { label: 'Draft',            badge: 'badge-gray',   desc: 'Manuscript is not yet submitted.' },
  SUBMITTED:       { label: 'Submitted',         badge: 'badge-navy',   desc: 'Your manuscript is with the editorial team.' },
  UNDER_REVIEW:    { label: 'Under Review',      badge: 'badge-yellow', desc: 'Your manuscript is being reviewed by experts.' },
  WITH_EDITOR:     { label: 'With Editor',       badge: 'badge-yellow', desc: 'The editor is reviewing reviewer reports.' },
  REVISION_NEEDED: { label: 'Revise & Resubmit', badge: 'badge-yellow', desc: 'Revisions required. Please review the comments and resubmit.' },
  REVISED:         { label: 'Revised',           badge: 'badge-navy',   desc: 'Revised manuscript is under review.' },
  ACCEPTED:        { label: 'Accepted ✓',        badge: 'badge-green',  desc: 'Congratulations! Your manuscript has been accepted for publication.' },
  REJECTED:        { label: 'Rejected',          badge: 'badge-red',    desc: 'Your manuscript was not accepted in this round.' },
  PUBLISHED:       { label: 'Published ✓',       badge: 'badge-green',  desc: 'Your article is now live and open access.' },
};

const TimelineStepTracker = ({ status }: { status: string }) => {
  const steps = [
    { id: 'SUBMITTED', label: 'Submitted' },
    { id: 'UNDER_REVIEW', label: 'Under Review' },
    { id: 'DECISION', label: 'Decision' },
    { id: 'PUBLISHED', label: 'Published' },
  ];

  let currentStepIndex = 0;
  if (['UNDER_REVIEW', 'WITH_EDITOR', 'REVISION_NEEDED', 'REVISED'].includes(status)) currentStepIndex = 1;
  else if (['ACCEPTED', 'REJECTED'].includes(status)) currentStepIndex = 2;
  else if (status === 'PUBLISHED') currentStepIndex = 3;

  return (
    <div className="card" style={{ marginBottom: '0', padding: '1.5rem', width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative' }}>
        <div style={{ position: 'absolute', top: 12, left: '12%', right: '12%', height: 2, background: 'var(--gray-200)', zIndex: 0 }} />
        <div style={{ position: 'absolute', top: 12, left: '12%', width: `${currentStepIndex * 33.33}%`, height: 2, background: 'var(--navy)', zIndex: 0, transition: 'all 0.3s ease' }} />
        {steps.map((step, idx) => {
          const isCompleted = idx <= currentStepIndex;
          const isActive = idx === currentStepIndex;
          return (
            <div key={step.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1, flex: 1 }}>
              <div style={{
                width: 24, height: 24, borderRadius: '50%',
                background: isCompleted ? 'var(--navy)' : '#fff',
                border: `2px solid ${isCompleted ? 'var(--navy)' : 'var(--gray-300)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: isCompleted ? '#fff' : 'var(--gray-400)',
                fontSize: '0.75rem', fontWeight: 700,
                marginBottom: '0.5rem',
                boxShadow: isActive ? '0 0 0 4px rgba(10, 37, 64, 0.1)' : 'none'
              }}>
                {isCompleted ? '✓' : (idx + 1)}
              </div>
              <div style={{ fontSize: '0.8125rem', fontWeight: isActive ? 700 : 500, color: isActive ? 'var(--navy)' : 'var(--gray-500)', textAlign: 'center' }}>
                {step.label}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default function SubmissionDetailPage() {
  const { user, isLoading } = useAuthStore();
  const router = useRouter();
  const { id } = useParams<{ id: string }>();

  useEffect(() => { if (!isLoading && !user) router.push('/auth/login'); }, [user, isLoading, router]);

  const { data: submission, isLoading: loading } = useQuery({
    queryKey: ['submission', id],
    queryFn: async () => (await api.get(`/submissions/${id}`)).data,
    enabled: !!user && !!id,
  });

  if (isLoading || !user || loading) return <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--gray-400)' }}>Loading…</div>;
  if (!submission) return <div style={{ padding: '4rem', textAlign: 'center' }}><h3>Submission not found</h3></div>;

  const meta = STATUS_META[submission.status] ?? STATUS_META.DRAFT;

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
        ].map(l => <Link key={l.href} href={l.href} className="sidebar-link"><span>{l.icon}</span> {l.label}</Link>)}
      </aside>

      <main className="portal-content">
        <Link href="/portal/author/submissions" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', color: 'var(--gray-500)', fontSize: '0.875rem', marginBottom: '1.5rem', textDecoration: 'none' }}>
          <ArrowLeft size={14} /> All Submissions
        </Link>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '1.5rem', alignItems: 'start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <TimelineStepTracker status={submission.status} />

            {/* Status card */}
            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
                <span className={`badge ${meta.badge}`} style={{ fontSize: '0.875rem', padding: '0.375rem 1rem' }}>{meta.label}</span>
                <span style={{ fontSize: '0.8125rem', color: 'var(--gray-400)' }}>Ref: #{id.slice(0, 8).toUpperCase()}</span>
              </div>
              <p style={{ fontSize: '0.9rem', color: 'var(--gray-600)', lineHeight: 1.7 }}>{meta.desc}</p>
            </div>

            {/* Details */}
            <div className="card">
              <h4 style={{ marginBottom: '1.25rem' }}>Manuscript Details</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.375rem' }}>Title</div>
                  <div style={{ fontFamily: '"Playfair Display",Georgia,serif', fontWeight: 600, color: 'var(--navy)', lineHeight: 1.4 }}>{submission.title}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.375rem' }}>Abstract</div>
                  <p style={{ fontSize: '0.875rem', color: 'var(--gray-600)', lineHeight: 1.75 }}>{submission.abstract}</p>
                </div>
                {submission.keywords?.length > 0 && (
                  <div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>Keywords</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
                      {submission.keywords.map((k: string) => <span key={k} className="badge badge-navy">{k}</span>)}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* APC section for accepted */}
            {submission.status === 'ACCEPTED' && !submission.payment && (
              <div className="card" style={{ border: '1.5px solid var(--gold)', background: '#fffbeb' }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                  <CreditCard size={22} color="var(--gold)" style={{ flexShrink: 0, marginTop: 2 }} />
                  <div>
                    <h4 style={{ color: 'var(--navy)', marginBottom: '0.5rem' }}>Article Processing Charge Due</h4>
                    <p style={{ fontSize: '0.875rem', color: 'var(--gray-600)', lineHeight: 1.7, marginBottom: '1rem' }}>
                      Your manuscript has been accepted! Please pay the Article Processing Charge (APC) to proceed to publication.
                    </p>
                    <button className="btn btn-gold" onClick={async () => {
                      const { data } = await api.post(`/submissions/${id}/create-payment`);
                      // In production, trigger Razorpay checkout here
                      alert(`Order created: ${data.orderId}. Integrate Razorpay checkout to complete payment.`);
                    }}>
                      <CreditCard size={16} /> Pay APC Now
                    </button>
                  </div>
                </div>
              </div>
            )}

            {submission.payment?.status === 'PAID' && (
              <div className="card" style={{ border: '1.5px solid var(--success)', background: '#f0fdf4' }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <CheckCircle size={22} color="var(--success)" />
                  <div>
                    <h4 style={{ color: 'var(--success)', marginBottom: '0.25rem' }}>APC Payment Received</h4>
                    <p style={{ fontSize: '0.8125rem', color: 'var(--gray-500)' }}>Amount: ₹{submission.payment.amount?.toLocaleString('en-IN')} · {new Date(submission.payment.paidAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="card">
              <h4 style={{ marginBottom: '1rem' }}>Timeline</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {submission.events?.map((e: any, i: number) => (
                  <div key={i} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--navy)', flexShrink: 0, marginTop: 5 }} />
                    <div>
                      <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--gray-700)' }}>{e.type.replace(/_/g, ' ')}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--gray-400)' }}>{new Date(e.createdAt).toLocaleDateString()}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card">
              <h4 style={{ marginBottom: '1rem' }}>Submission Info</h4>
              {[
                { label: 'Journal', value: submission.journal?.name },
                { label: 'Submitted', value: submission.submittedAt ? new Date(submission.submittedAt).toLocaleDateString('en-IN') : 'Not submitted' },
                { label: 'Last Updated', value: new Date(submission.updatedAt).toLocaleDateString('en-IN') },
              ].map(({ label, value }) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', borderBottom: '1px solid var(--gray-100)', paddingBottom: '0.625rem', marginBottom: '0.625rem' }}>
                  <span style={{ color: 'var(--gray-400)', fontWeight: 600 }}>{label}</span>
                  <span style={{ color: 'var(--gray-700)', textAlign: 'right', maxWidth: 150 }}>{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
