'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search as SearchIcon, BookOpen, Filter, X } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

const subjects = ['All', 'Computer Science', 'Medical Sciences', 'Engineering', 'Environmental Science', 'Social Sciences', 'Economics', 'Physics', 'Education'];

export default function SearchPage() {
  const [q, setQ] = useState('');
  const [subject, setSubject] = useState('All');
  const [page, setPage] = useState(1);
  const [submitted, setSubmitted] = useState('');

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['search', submitted, subject, page],
    queryFn: async () => {
      const params = new URLSearchParams({ q: submitted, page: String(page) });
      if (subject !== 'All') params.set('subject', subject);
      const { data } = await api.get(`/search?${params}`);
      return data;
    },
    enabled: submitted.length > 0 || subject !== 'All',
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setSubmitted(q);
  };

  return (
    <>
      {/* Search header */}
      <div style={{ background: 'linear-gradient(135deg,#070f2b,#0B1D51)', padding: '3.5rem 0 2.5rem' }}>
        <div className="container" style={{ maxWidth: 700 }}>
          <h1 style={{ color: '#fff', marginBottom: '1.5rem', textAlign: 'center', fontSize: '2rem' }}>Search Articles</h1>
          <form onSubmit={handleSearch} style={{ display: 'flex', background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(12px)', borderRadius: '0.75rem', border: '1px solid rgba(255,255,255,0.2)', overflow: 'hidden' }}>
            <SearchIcon size={18} style={{ margin: 'auto 0 auto 1.25rem', color: 'rgba(255,255,255,0.5)', flexShrink: 0 }} />
            <input placeholder="Search title, abstract, keywords, authors…" value={q} onChange={(e) => setQ(e.target.value)}
              style={{ flex: 1, background: 'transparent', border: 'none', padding: '1rem 0.75rem', color: '#fff', fontSize: '1rem', outline: 'none' }} />
            {q && <button type="button" onClick={() => { setQ(''); setSubmitted(''); }} style={{ background: 'none', border: 'none', padding: '0 0.75rem', color: 'rgba(255,255,255,0.5)', cursor: 'pointer' }}><X size={16} /></button>}
            <button type="submit" className="btn btn-gold" style={{ borderRadius: 0, margin: 0 }}>Search</button>
          </form>
        </div>
      </div>

      <section style={{ background: 'var(--gray-50)', minHeight: '60vh' }}>
        <div className="container">
          {/* Subject filter pills */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
            <Filter size={15} style={{ margin: 'auto 0.25rem auto 0', color: 'var(--gray-400)' }} />
            {subjects.map((s) => (
              <button key={s} onClick={() => { setSubject(s); setPage(1); }}
                style={{ padding: '0.375rem 0.875rem', borderRadius: 9999, fontSize: '0.8125rem', fontWeight: 500, border: '1.5px solid', cursor: 'pointer', transition: 'all 0.15s', background: subject === s ? 'var(--navy)' : '#fff', color: subject === s ? '#fff' : 'var(--gray-600)', borderColor: subject === s ? 'var(--navy)' : 'var(--gray-200)' }}>
                {s}
              </button>
            ))}
          </div>

          {/* Results */}
          {isLoading || isFetching ? (
            <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--gray-400)' }}>Searching…</div>
          ) : !data ? (
            <div style={{ textAlign: 'center', padding: '4rem' }}>
              <SearchIcon size={48} color="var(--gray-300)" style={{ margin: '0 auto 1rem' }} />
              <h3 style={{ color: 'var(--gray-400)', fontFamily: 'Inter,sans-serif', fontWeight: 500 }}>Enter a search term to find articles</h3>
            </div>
          ) : data.total === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem' }}>
              <h3 style={{ color: 'var(--gray-500)', fontFamily: 'Inter,sans-serif' }}>No results found for &quot;{submitted}&quot;</h3>
              <p style={{ color: 'var(--gray-400)', marginTop: '0.5rem' }}>Try different keywords or browse by subject</p>
            </div>
          ) : (
            <>
              <p style={{ fontSize: '0.9rem', color: 'var(--gray-500)', marginBottom: '1.5rem' }}>
                <strong style={{ color: 'var(--navy)' }}>{data.total}</strong> results for &quot;<strong>{submitted}</strong>&quot;
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {data.items.map((a: any) => (
                  <div key={a.id} className="card">
                    <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start' }}>
                      <div style={{ width: 44, height: 44, borderRadius: 10, background: 'linear-gradient(135deg,#eef1fa,#dde3f5)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <BookOpen size={19} color="var(--navy)" />
                      </div>
                      <div style={{ flex: 1 }}>
                        <Link href={`/articles/${a.id}`} style={{ fontFamily: '"Playfair Display",Georgia,serif', fontWeight: 600, fontSize: '1rem', color: 'var(--navy)', textDecoration: 'none', lineHeight: 1.4, display: 'block', marginBottom: '0.375rem' }}>
                          {a.submission.title}
                        </Link>
                        <p className="truncate-2" style={{ fontSize: '0.8125rem', color: 'var(--gray-500)', lineHeight: 1.65, marginBottom: '0.625rem' }}>{a.submission.abstract}</p>
                        <div style={{ display: 'flex', gap: '0.875rem', flexWrap: 'wrap', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--gold)' }}>{a.submission.journal.name}</span>
                          <span style={{ fontSize: '0.8125rem', color: 'var(--gray-400)' }}>{a.submission.author.name}</span>
                          {a.subject && <span className="badge badge-navy">{a.subject.name}</span>}
                          {a.doi && <code style={{ fontSize: '0.75rem', color: 'var(--gray-400)' }}>DOI: {a.doi}</code>}
                        </div>
                      </div>
                      <Link href={`/articles/${a.id}`} className="btn btn-outline btn-sm" style={{ flexShrink: 0 }}>View →</Link>
                    </div>
                  </div>
                ))}
              </div>
              {/* Pagination */}
              {data.pageCount > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '2.5rem' }}>
                  {Array.from({ length: data.pageCount }, (_, i) => (
                    <button key={i} onClick={() => setPage(i + 1)} style={{ width: 36, height: 36, borderRadius: 8, border: '1.5px solid', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem', background: page === i + 1 ? 'var(--navy)' : '#fff', color: page === i + 1 ? '#fff' : 'var(--gray-600)', borderColor: page === i + 1 ? 'var(--navy)' : 'var(--gray-200)' }}>
                      {i + 1}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </>
  );
}
