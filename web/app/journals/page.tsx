'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import Link from 'next/link';
import { ArrowRight, Globe, FileText, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

// Color-coded discipline icons and accent colors
const DISCIPLINE_THEMES: Record<string, { emoji: string; accent: string; bg: string; border: string }> = {
  'Computer Science & AI':    { emoji: '💻', accent: '#2563eb', bg: 'linear-gradient(135deg, #eff6ff, #dbeafe)', border: '#bfdbfe' },
  'Engineering & Technology': { emoji: '⚙️', accent: '#7c3aed', bg: 'linear-gradient(135deg, #f5f3ff, #ede9fe)', border: '#ddd6fe' },
  'Medical & Health':         { emoji: '🧬', accent: '#dc2626', bg: 'linear-gradient(135deg, #fef2f2, #fee2e2)', border: '#fecaca' },
  'Environmental Science':    { emoji: '🌿', accent: '#16a34a', bg: 'linear-gradient(135deg, #f0fdf4, #dcfce7)', border: '#bbf7d0' },
  'Social Sciences':          { emoji: '🌐', accent: '#d97706', bg: 'linear-gradient(135deg, #fffbeb, #fef3c7)', border: '#fde68a' },
  'Pure Sciences':            { emoji: '⚗️', accent: '#0891b2', bg: 'linear-gradient(135deg, #ecfeff, #cffafe)', border: '#a5f3fc' },
};

function getTheme(journalName: string) {
  const lower = journalName.toLowerCase();
  if (lower.includes('computer') || lower.includes('ai') || lower.includes('artificial'))
    return DISCIPLINE_THEMES['Computer Science & AI'];
  if (lower.includes('engineering') || lower.includes('technology'))
    return DISCIPLINE_THEMES['Engineering & Technology'];
  if (lower.includes('medical') || lower.includes('health'))
    return DISCIPLINE_THEMES['Medical & Health'];
  if (lower.includes('environment') || lower.includes('earth'))
    return DISCIPLINE_THEMES['Environmental Science'];
  if (lower.includes('social') || lower.includes('humanities') || lower.includes('law'))
    return DISCIPLINE_THEMES['Social Sciences'];
  return DISCIPLINE_THEMES['Pure Sciences'];
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } }
};

export default function JournalsPage() {
  const { data: journals = [], isLoading } = useQuery({
    queryKey: ['journals'],
    queryFn: async () => (await api.get('/journals')).data,
  });

  return (
    <>
      <div style={{ background: 'linear-gradient(135deg, var(--navy-dark) 0%, var(--navy) 100%)', padding: '6rem 0 4rem', color: '#fff', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at top right, rgba(200,151,42,0.15), transparent 50%)', pointerEvents: 'none' }} />
        <div className="container" style={{ position: 'relative', zIndex: 10 }}>
          <span className="badge" style={{ marginBottom: '1.5rem', background: 'rgba(255,255,255,0.1)', color: 'var(--gold)', border: '1px solid rgba(255,255,255,0.2)', padding: '0.4rem 1rem' }}>Our Publications</span>
          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', marginBottom: '1rem', lineHeight: 1.15, textShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>Journal Directory</h1>
          <p style={{ color: 'rgba(255,255,255,0.8)', marginTop: '0.75rem', maxWidth: 600, fontSize: '1.15rem', lineHeight: 1.6, fontWeight: 300 }}>
            Explore our portfolio of peer-reviewed, open-access academic journals spanning every major research discipline.
          </p>
        </div>
      </div>

      <section style={{ background: '#f8fafc', minHeight: '60vh', padding: '4rem 0' }}>
        <div className="container">
          {isLoading ? (
            <div className="grid-2-cols" style={{ gap: '2rem' }}>
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="card" style={{ padding: '2rem', borderRadius: '1.25rem', border: '1px solid var(--gray-100)' }}>
                  <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1.5rem' }}>
                    <div className="skeleton" style={{ width: 64, height: 64, borderRadius: '1rem' }} />
                    <div style={{ flex: 1 }}>
                      <div className="skeleton skeleton-text" style={{ width: '80%', marginBottom: '0.75rem', height: '1.25rem' }} />
                      <div className="skeleton skeleton-text" style={{ width: '60%' }} />
                    </div>
                  </div>
                  <div className="skeleton skeleton-text" style={{ width: '100%', marginBottom: '0.5rem' }} />
                  <div className="skeleton skeleton-text" style={{ width: '90%', marginBottom: '0.5rem' }} />
                  <div className="skeleton skeleton-text" style={{ width: '75%' }} />
                </div>
              ))}
            </div>
          ) : journals.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '5rem 0', background: '#fff', borderRadius: '1rem', border: '1px dashed var(--gray-300)' }}>
              <p style={{ color: 'var(--gray-400)', fontFamily: 'Inter,sans-serif', fontWeight: 500, fontSize: '1.125rem' }}>No journals available yet</p>
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                <p style={{ color: 'var(--gray-500)', fontSize: '1rem' }}>
                  Showing <strong style={{ color: 'var(--navy)' }}>{journals.length}</strong> active journals
                </p>
              </div>
              
              <motion.div initial="hidden" animate="visible" variants={containerVariants} className="grid-2-cols" style={{ gap: '2rem' }}>
                {journals.map((j: any) => {
                  const theme = getTheme(j.name);
                  return (
                    <motion.div key={j.id} variants={itemVariants} whileHover={{ y: -4 }}>
                      <Link href={`/journals/${j.slug}`} className="card" style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', height: '100%', gap: '1.5rem', padding: '2.5rem', borderRadius: '1.25rem', border: '1px solid var(--gray-100)', borderTop: `4px solid ${theme.accent}`, boxShadow: '0 10px 30px rgba(0,0,0,0.03)', transition: 'all 0.3s ease', background: '#fff' }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.5rem' }}>
                          <div style={{ width: 64, height: 64, borderRadius: '1rem', background: theme.bg, border: `1px solid ${theme.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '2rem', boxShadow: 'inset 0 2px 10px rgba(255,255,255,0.5)' }}>
                            {theme.emoji}
                          </div>
                          <div style={{ flex: 1 }}>
                            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', lineHeight: 1.35, color: 'var(--navy)', fontFamily: '"Playfair Display", serif', fontWeight: 700 }}>{j.name}</h3>
                            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', fontSize: '0.8rem', color: 'var(--gray-500)', fontWeight: 500 }}>
                              {j.issn && <span>ISSN: <span style={{ color: 'var(--gray-700)' }}>{j.issn}</span></span>}
                              {j.eissn && <span>eISSN: <span style={{ color: 'var(--gray-700)' }}>{j.eissn}</span></span>}
                            </div>
                          </div>
                        </div>

                        <p className="truncate-3" style={{ fontSize: '0.95rem', color: 'var(--gray-600)', lineHeight: 1.7, flex: 1 }}>
                          {j.description}
                        </p>

                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                          {j.subjects?.map((js: any) => (
                            <span key={js.subject?.id || js.subjectId} className="badge" style={{ fontSize: '0.75rem', background: 'var(--gray-50)', color: 'var(--gray-600)', border: `1px solid var(--gray-200)` }}>
                              {js.subject?.name}
                            </span>
                          ))}
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1.25rem', borderTop: '1px solid var(--gray-100)', marginTop: 'auto' }}>
                          <div style={{ display: 'flex', gap: '1.25rem', fontSize: '0.85rem', color: 'var(--gray-500)', fontWeight: 500 }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                              <Globe size={14} color={theme.accent} /> Open Access
                            </span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                              <FileText size={14} color={theme.accent} /> Peer-Reviewed
                            </span>
                          </div>
                          <span style={{ color: theme.accent, fontWeight: 600, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.25rem', background: theme.bg, padding: '0.4rem 0.8rem', borderRadius: 999 }}>
                            Explore <ChevronRight size={14} />
                          </span>
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
              </motion.div>
            </>
          )}
        </div>
      </section>
    </>
  );
}
