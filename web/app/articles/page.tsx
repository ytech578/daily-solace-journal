'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import Link from 'next/link';
import { BookOpen, Download, Eye, Calendar, Search, Filter, ChevronRight, FileText } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const SUBJECT_FILTERS = [
  { label: 'All', value: '' },
  { label: '💻 Computer Science', value: 'computer-science-ai' },
  { label: '⚙️ Engineering', value: 'engineering-technology' },
  { label: '🧬 Medical Sciences', value: 'medical-clinical-sciences' },
  { label: '🌿 Environmental', value: 'environmental-sustainability-science' },
  { label: '🌐 Social Sciences', value: 'social-sciences' },
  { label: '⚗️ Pure Sciences', value: 'physics-chemistry' },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};
const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } }
};

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
      <div style={{ background: 'linear-gradient(135deg, var(--navy-dark) 0%, var(--navy) 100%)', padding: '6rem 0 4rem', color: '#fff', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at top right, rgba(200,151,42,0.15), transparent 50%)', pointerEvents: 'none' }} />
        <div className="container" style={{ position: 'relative', zIndex: 10 }}>
          <span className="badge" style={{ marginBottom: '1.5rem', background: 'rgba(255,255,255,0.1)', color: 'var(--gold)', border: '1px solid rgba(255,255,255,0.2)', padding: '0.4rem 1rem' }}>Open Access</span>
          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', marginBottom: '1rem', lineHeight: 1.15, textShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>Published Articles</h1>
          <p style={{ color: 'rgba(255,255,255,0.8)', marginTop: '0.75rem', maxWidth: 600, fontSize: '1.15rem', lineHeight: 1.6, fontWeight: 300 }}>
            Browse peer-reviewed research freely available to readers worldwide.
          </p>
          <Link href="/search" className="btn" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginTop: '2rem', color: '#fff', background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 999, padding: '0.75rem 1.5rem', fontSize: '0.95rem' }}>
            <Search size={16} /> Advanced Search
          </Link>
        </div>
      </div>

      <section style={{ background: '#f8fafc', minHeight: '60vh', padding: '4rem 0' }}>
        <div className="container">

          {/* Subject Filter Pills */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '2.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--gray-200)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.9rem', color: 'var(--gray-500)', fontWeight: 600, marginRight: '0.5rem' }}>
              <Filter size={16} /> Filter by Subject:
            </span>
            {SUBJECT_FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => handleFilter(f.value)}
                style={{
                  padding: '0.45rem 1.25rem',
                  borderRadius: 9999,
                  fontSize: '0.85rem',
                  fontWeight: 500,
                  border: '1px solid',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  fontFamily: 'Inter, sans-serif',
                  background: subjectSlug === f.value ? 'var(--navy)' : '#fff',
                  color: subjectSlug === f.value ? '#fff' : 'var(--gray-600)',
                  borderColor: subjectSlug === f.value ? 'var(--navy)' : 'var(--gray-200)',
                  boxShadow: subjectSlug === f.value ? '0 4px 10px rgba(11,29,81,0.15)' : '0 2px 5px rgba(0,0,0,0.02)'
                }}
              >
                {f.label}
              </button>
            ))}
          </div>

          {isLoading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {[1, 2, 3].map(i => (
                <div key={i} className="card mobile-flex-col mobile-p-4 mobile-gap-4 mobile-items-start" style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start', padding: '2rem', borderRadius: '1.25rem', border: '1px solid var(--gray-100)' }}>
                  <div className="skeleton" style={{ width: 64, height: 64, borderRadius: '1rem', flexShrink: 0 }} />
                  <div className="mobile-w-full" style={{ flex: 1 }}>
                    <div className="skeleton skeleton-text" style={{ width: '80%', marginBottom: '0.875rem', height: '1.25rem' }} />
                    <div className="skeleton skeleton-text" style={{ width: '100%', marginBottom: '0.5rem' }} />
                    <div className="skeleton skeleton-text" style={{ width: '70%' }} />
                  </div>
                </div>
              ))}
            </div>
          ) : !data?.items?.length ? (
            <div style={{ textAlign: 'center', padding: '5rem', background: '#fff', borderRadius: '1.25rem', border: '1px dashed var(--gray-300)' }}>
              <FileText size={48} color="var(--gray-300)" style={{ margin: '0 auto 1.5rem' }} />
              <h3 style={{ color: 'var(--navy)', fontFamily: 'Inter,sans-serif', fontWeight: 600, fontSize: '1.25rem' }}>
                {subjectSlug ? 'No articles found in this subject' : 'No articles published yet'}
              </h3>
              <p style={{ color: 'var(--gray-500)', marginTop: '0.75rem' }}>Check back later or submit your own research to be featured here.</p>
              <Link href="/auth/register" className="btn btn-primary" style={{ marginTop: '2rem', borderRadius: 999 }}>Submit Manuscript</Link>
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <p style={{ color: 'var(--gray-500)', fontSize: '0.95rem' }}>
                  Showing <strong style={{ color: 'var(--navy)' }}>{data.items.length}</strong> of <strong style={{ color: 'var(--navy)' }}>{data.total}</strong> articles
                  {subjectSlug && <span style={{ color: 'var(--gold)', marginLeft: '0.5rem' }}>in selected subject</span>}
                </p>
              </div>

              <motion.div initial="hidden" animate="visible" variants={containerVariants} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <AnimatePresence>
                  {data.items.map((a: any) => (
                    <motion.div key={a.id} variants={itemVariants} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.2 }} className="card mobile-flex-col mobile-p-4 mobile-gap-4 mobile-items-start" style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start', padding: '2rem', borderRadius: '1.25rem', border: '1px solid var(--gray-100)', boxShadow: '0 4px 15px rgba(0,0,0,0.02)', position: 'relative', overflow: 'hidden' }}>
                      <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, background: 'linear-gradient(to bottom, var(--navy), var(--gold))' }} />
                      
                      <div style={{ width: 56, height: 56, borderRadius: '1rem', background: 'linear-gradient(135deg, rgba(11,29,81,0.05), rgba(11,29,81,0.02))', border: '1px solid var(--gray-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <BookOpen size={24} color="var(--navy)" />
                      </div>
                      
                      <div className="mobile-w-full" style={{ flex: 1 }}>
                        <Link href={`/articles/${a.id}`} style={{ fontFamily: '"Playfair Display",Georgia,serif', fontWeight: 700, fontSize: '1.35rem', color: 'var(--navy)', textDecoration: 'none', lineHeight: 1.4, display: 'block', marginBottom: '0.5rem', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--gold)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--navy)'}>
                          {a.submission?.title}
                        </Link>
                        
                        <p style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', fontSize: '0.95rem', color: 'var(--gray-600)', lineHeight: 1.7, marginBottom: '1rem' }}>
                          {a.submission?.abstract}
                        </p>
                        
                        <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--navy)' }}>{a.submission?.journal?.name}</span>
                          <span style={{ fontSize: '0.85rem', color: 'var(--gray-500)', fontWeight: 500 }}>{a.submission?.author?.name}</span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.85rem', color: 'var(--gray-500)' }}>
                            <Calendar size={14} /> {a.publishedAt ? new Date(a.publishedAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'short' }) : '—'}
                          </span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.85rem', color: 'var(--gray-500)' }}>
                            <Eye size={14} /> {a.viewCount ?? 0} views
                          </span>
                          {a.doi && <code style={{ fontSize: '0.75rem', color: 'var(--gray-500)', background: 'var(--gray-50)', padding: '0.2rem 0.5rem', borderRadius: 4, border: '1px solid var(--gray-200)' }}>DOI: {a.doi}</code>}
                        </div>
                      </div>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', flexShrink: 0, alignSelf: 'center' }}>
                        <Link href={`/articles/${a.id}`} className="btn btn-outline" style={{ borderRadius: 999, padding: '0.5rem 1.25rem', fontSize: '0.9rem' }}>Read <ChevronRight size={14} /></Link>
                        <a href={`/api/articles/${a.id}/download`} download className="btn btn-primary" style={{ borderRadius: 999, padding: '0.5rem 1.25rem', fontSize: '0.9rem' }} target="_blank" rel="noreferrer">
                          <Download size={14} style={{ marginRight: 6 }} /> PDF
                        </a>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
              
              {/* Pagination */}
              {data.pageCount > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginTop: '3.5rem' }}>
                  <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn btn-outline" style={{ borderRadius: 999, padding: '0.5rem 1.25rem' }}>← Prev</button>
                  <span style={{ fontSize: '0.9rem', color: 'var(--gray-600)', fontWeight: 500 }}>Page {page} of {data.pageCount}</span>
                  <button onClick={() => setPage(p => Math.min(data.pageCount, p + 1))} disabled={page === data.pageCount} className="btn btn-outline" style={{ borderRadius: 999, padding: '0.5rem 1.25rem' }}>Next →</button>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </>
  );
}
