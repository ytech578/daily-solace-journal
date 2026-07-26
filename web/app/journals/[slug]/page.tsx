'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { BookOpen, FileText, Users, ExternalLink, Calendar, ArrowLeft, Globe, Award } from 'lucide-react';

export default function JournalDetailPage() {
  const { slug } = useParams<{ slug: string }>();

  const { data: journal, isLoading } = useQuery({
    queryKey: ['journal', slug],
    queryFn: async () => (await api.get(`/journals/${slug}`)).data,
    enabled: !!slug,
  });

  if (isLoading) {
    return (
      <>
        <div className="page-header"><div className="container"><div className="skeleton" style={{ width: 300, height: 40, borderRadius: 8 }} /></div></div>
        <section style={{ background: 'var(--gray-50)', padding: '4rem 0' }}><div className="container" style={{ textAlign: 'center', color: 'var(--gray-400)' }}>Loading journal details…</div></section>
      </>
    );
  }

  if (!journal) {
    return (
      <div style={{ padding: '6rem', textAlign: 'center' }}>
        <h2>Journal not found</h2>
        <p style={{ color: 'var(--gray-500)', margin: '0.75rem 0 1.5rem' }}>The journal you're looking for doesn't exist or has been removed.</p>
        <Link href="/journals" className="btn btn-primary">View All Journals</Link>
      </div>
    );
  }

  const frequency = 'Quarterly (4 issues/year)';

  return (
    <>
      <div className="page-header">
        <div className="container">
          <Link href="/journals" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', color: 'rgba(255,255,255,0.5)', fontSize: '0.875rem', marginBottom: '1.5rem', textDecoration: 'none' }}>
            <ArrowLeft size={14} /> All Journals
          </Link>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.25rem' }}>
            <div style={{ width: 64, height: 64, borderRadius: 16, background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <BookOpen size={28} color="var(--gold)" />
            </div>
            <div>
              <h1 style={{ marginBottom: '0.5rem' }}>{journal.name}</h1>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', fontSize: '0.875rem', color: 'rgba(255,255,255,0.6)' }}>
                {journal.issn && <span>ISSN: {journal.issn}</span>}
                {journal.eissn && <span>eISSN: {journal.eissn}</span>}
                <span>{frequency}</span>
                <span className="badge badge-green">Open Access</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <section style={{ background: 'var(--gray-50)' }}>
        <div className="container journal-detail-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '2rem', alignItems: 'start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Aims & Scope */}
            <div className="card">
              <h3 style={{ marginBottom: '1rem' }}>Aims &amp; Scope</h3>
              <p style={{ lineHeight: 1.85, color: 'var(--gray-600)', fontSize: '0.95rem' }}>{journal.scope || journal.description}</p>
            </div>

            {/* Subject Areas */}
            {journal.subjects?.length > 0 && (
              <div className="card">
                <h3 style={{ marginBottom: '1rem' }}>Subject Areas</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {journal.subjects.map((js: any) => (
                    <span key={js.subject?.id || js.subjectId} className="badge badge-navy" style={{ fontSize: '0.875rem', padding: '0.375rem 0.875rem' }}>
                      {js.subject?.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Editorial Board */}
            {journal.boardMembers?.length > 0 && (
              <div className="card">
                <h3 style={{ marginBottom: '1.25rem' }}>Editorial Board</h3>
                <div className="grid-2-cols" style={{ gap: '1rem' }}>
                  {journal.boardMembers.map((bm: any) => (
                    <div key={bm.id} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                      <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg,var(--navy),var(--navy-light))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                        {bm.name?.[0]}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--gray-800)' }}>{bm.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--gold)', fontWeight: 600 }}>{bm.boardRole}</div>
                        {bm.institution && <div style={{ fontSize: '0.75rem', color: 'var(--gray-400)' }}>{bm.institution}{bm.country ? `, ${bm.country}` : ''}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Submit CTA */}
            <div className="card" style={{ textAlign: 'center', padding: '2.5rem', background: 'linear-gradient(135deg,#eef1fa,#dde3f5)' }}>
              <h3 style={{ color: 'var(--navy)', marginBottom: '0.75rem' }}>Submit to This Journal</h3>
              <p style={{ color: 'var(--gray-600)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                APC: ₹{journal.apcAmount ? (journal.apcAmount / 100).toLocaleString('en-IN') : '—'} · Double-blind peer review · Fast decision (48h)
              </p>
              <Link href="/portal/author/submit" className="btn btn-primary">Submit Manuscript</Link>
            </div>
          </div>

          {/* Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="card">
              <h4 style={{ marginBottom: '1rem' }}>Journal Info</h4>
              {[
                { label: 'ISSN (Print)', value: journal.issn || '—' },
                { label: 'eISSN (Online)', value: journal.eissn || '—' },
                { label: 'APC', value: journal.apcAmount ? `₹${(journal.apcAmount / 100).toLocaleString('en-IN')}` : 'Free' },
                { label: 'Frequency', value: frequency },
                { label: 'Access', value: 'Open Access' },
                { label: 'Review', value: 'Double-blind' },
                { label: 'Language', value: 'English' },
                { label: 'Publisher', value: 'Daily Solace Publications' },
              ].map(({ label, value }) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', borderBottom: '1px solid var(--gray-100)', paddingBottom: '0.625rem', marginBottom: '0.625rem' }}>
                  <span style={{ color: 'var(--gray-400)', fontWeight: 600 }}>{label}</span>
                  <span style={{ color: 'var(--gray-700)' }}>{value}</span>
                </div>
              ))}
            </div>

            <div className="card">
              <h4 style={{ marginBottom: '1rem' }}>Journal Metrics</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', borderBottom: '1px solid var(--gray-100)', paddingBottom: '0.5rem' }}>
                  <span style={{ color: 'var(--gray-400)', fontWeight: 600 }}>Impact Factor</span>
                  <span style={{ color: 'var(--gold)', fontWeight: 700 }}>3.456</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', borderBottom: '1px solid var(--gray-100)', paddingBottom: '0.5rem' }}>
                  <span style={{ color: 'var(--gray-400)', fontWeight: 600 }}>CiteScore</span>
                  <span style={{ color: 'var(--gray-700)' }}>4.2</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', borderBottom: '1px solid var(--gray-100)', paddingBottom: '0.5rem' }}>
                  <span style={{ color: 'var(--gray-400)', fontWeight: 600 }}>h-index</span>
                  <span style={{ color: 'var(--gray-700)' }}>24</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', borderBottom: '1px solid var(--gray-100)', paddingBottom: '0.5rem' }}>
                  <span style={{ color: 'var(--gray-400)', fontWeight: 600 }}>Acceptance Rate</span>
                  <span style={{ color: 'var(--gray-700)' }}>22%</span>
                </div>
              </div>
            </div>

            <div className="card">
              <h4 style={{ marginBottom: '1rem' }}>Indexing &amp; Abstracting</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {['CrossRef', 'Google Scholar', 'DOAJ', 'Semantic Scholar', 'BASE'].map((idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', color: 'var(--gray-600)' }}>
                    <Award size={12} color="var(--gold)" /> {idx}
                  </div>
                ))}
              </div>
            </div>

            <div className="card">
              <h4 style={{ marginBottom: '1rem' }}>Quick Links</h4>
              {[
                { label: 'Submit Manuscript', href: '/portal/author/submit' },
                { label: 'Author Guidelines', href: '/for-authors' },
                { label: 'Article Processing Charges', href: '/for-authors#apc' },
                { label: 'All Articles', href: `/articles` },
              ].map((l) => (
                <Link key={l.href} href={l.href} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', borderBottom: '1px solid var(--gray-100)', color: 'var(--navy)', fontSize: '0.875rem', textDecoration: 'none' }}>
                  {l.label} <ExternalLink size={12} color="var(--gray-400)" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
