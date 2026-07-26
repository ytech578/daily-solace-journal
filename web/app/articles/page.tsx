'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import Link from 'next/link';
import { BookOpen, Download, Eye, Calendar, Search, Filter } from 'lucide-react';
import { useState } from 'react';

const SUBJECT_FILTERS = [
  { label: 'All', value: '' },
  { label: '💻 Computer Science', value: 'computer-science' },
  { label: '⚙️ Engineering', value: 'engineering' },
  { label: '🧬 Medical Sciences', value: 'medical-sciences' },
  { label: '🌿 Environmental', value: 'environmental-science' },
  { label: '🌐 Social Sciences', value: 'social-sciences' },
  { label: '⚗️ Pure Sciences', value: 'physics-mathematics' },
];

export default function ArticlesPage() {
  const [page, setPage] = useState(1);
  const [subjectSlug, setSubjectSlug] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['articles', page, subjectSlug],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), limit: '12' });
      if (subjectSlug) params.set('subjectSlug', subjectSlug);
      const { data } = await api.get(`/articles?${params}`);
      return data;
    },
  });

  const handleFilter = (val: string) => {
    setSubjectSlug(val);
    setPage(1);
  };

  return (
    <>
      <div className="page-header">
        <div className="container">
          <span className="section-label">Open Access</span>
          <h1>Published Articles</h1>
          <p style={{ color: 'rgba(255,255,255,0.7)', marginTop: '0.75rem', maxWidth: 520 }}>
            Browse peer-reviewed research freely available to readers worldwide.
          </p>
          <Link href="/search" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginTop: '1.25rem', color: 'var(--gold)', fontWeight: 600, fontSize: '0.9rem' }}>
            <Search size={15} /> Advanced Search
          </Link>
        </div>
      </div>

      <section style={{ background: 'var(--gray-50)', minHeight: '60vh' }}>
        <div className="container">

          {/* Subject Filter Pills */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '2rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--gray-200)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8125rem', color: 'var(--gray-400)', fontWeight: 600, marginRight: '0.25rem' }}>
              <Filter size={14} /> Filter:
            </span>
            {SUBJECT_FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => handleFilter(f.value)}
                style={{
                  padding: '0.4rem 1rem',
                  borderRadius: 9999,
                  fontSize: '0.8125rem',
                  fontWeight: 500,
                  border: '1.5px solid',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                  fontFamily: 'Inter, sans-serif',
                  background: subjectSlug === f.value ? 'var(--navy)' : '#fff',
                  color: subjectSlug === f.value ? '#fff' : 'var(--gray-600)',
                  borderColor: subjectSlug === f.value ? 'var(--navy)' : 'var(--gray-200)',
                }}
              >
                {f.label}
              </button>
            ))}
          </div>

          {isLoading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {[1, 2, 3].map(i => (
                <div key={i} className="card" style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
                  <div className="skeleton" style={{ width: 48, height: 48, borderRadius: 12, flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div className="skeleton skeleton-text" style={{ width: '80%', marginBottom: '0.625rem', height: '1.1rem' }} />
                    <div className="skeleton skeleton-text" style={{ width: '100%', marginBottom: '0.375rem' }} />
                    <div className="skeleton skeleton-text" style={{ width: '70%' }} />
                  </div>
                </div>
              ))}
            </div>
          ) : !data?.items?.length ? (
            <div style={{ textAlign: 'center', padding: '5rem' }}>
              <BookOpen size={48} color="var(--gray-300)" style={{ margin: '0 auto 1rem' }} />
              <h3 style={{ color: 'var(--gray-400)', fontFamily: 'Inter,sans-serif', fontWeight: 500 }}>
                {subjectSlug ? 'No articles in this subject yet' : 'No articles published yet'}
              </h3>
              <p style={{ color: 'var(--gray-400)', marginTop: '0.5rem' }}>Be the first to submit and publish research!</p>
              <Link href="/auth/register" className="btn btn-primary" style={{ marginTop: '1.5rem' }}>Submit Manuscript</Link>
            </div>
          ) : (
            <>
              <p style={{ color: 'var(--gray-500)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
                Showing <strong>{data.items.length}</strong> of <strong>{data.total}</strong> articles
                {subjectSlug && <span style={{ color: 'var(--navy)', marginLeft: '0.5rem' }}>in selected subject</span>}
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {data.items.map((a: any) => (
                  <div key={a.id} className="card" style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
                    <div style={{ width: 48, height: 48, borderRadius: 12, background: 'linear-gradient(135deg,#eef1fa,#dde3f5)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <BookOpen size={20} color="var(--navy)" />
                    </div>
                    <div style={{ flex: 1 }}>
                      <Link href={`/articles/${a.id}`} style={{ fontFamily: '"Playfair Display",Georgia,serif', fontWeight: 600, fontSize: '1.05rem', color: 'var(--navy)', textDecoration: 'none', lineHeight: 1.4, display: 'block', marginBottom: '0.4rem' }}>
                        {a.submission?.title}
                      </Link>
                      {/* Clamped abstract — 2 lines max */}
                      <p style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', fontSize: '0.85rem', color: 'var(--gray-500)', lineHeight: 1.65, marginBottom: '0.625rem' }}>
                        {a.submission?.abstract}
                      </p>
                      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--gold)' }}>{a.submission?.journal?.name}</span>
                        <span style={{ fontSize: '0.8125rem', color: 'var(--gray-400)' }}>{a.submission?.author?.name}</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8rem', color: 'var(--gray-400)' }}>
                          <Calendar size={12} /> {a.publishedAt ? new Date(a.publishedAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'short' }) : '—'}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8rem', color: 'var(--gray-400)' }}>
                          <Eye size={12} /> {a.viewCount ?? 0} views
                        </span>
                        {a.doi && <code style={{ fontSize: '0.75rem', color: 'var(--gray-400)' }}>DOI: {a.doi}</code>}
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flexShrink: 0 }}>
                      <Link href={`/articles/${a.id}`} className="btn btn-outline btn-sm">Read</Link>
                      <Link href={`/api/articles/${a.id}/download`} className="btn btn-primary btn-sm" target="_blank">
                        <Download size={13} /> PDF
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
              {/* Pagination */}
              {data.pageCount > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '3rem' }}>
                  <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn btn-outline btn-sm">← Prev</button>
                  <span style={{ padding: '0.5rem 1rem', fontSize: '0.875rem', color: 'var(--gray-500)' }}>Page {page} of {data.pageCount}</span>
                  <button onClick={() => setPage(p => Math.min(data.pageCount, p + 1))} disabled={page === data.pageCount} className="btn btn-outline btn-sm">Next →</button>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </>
  );
}
