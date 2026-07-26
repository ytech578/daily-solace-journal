'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import Link from 'next/link';
import { ArrowRight, Globe, FileText } from 'lucide-react';

// Color-coded discipline icons and accent colors
const DISCIPLINE_THEMES: Record<string, { emoji: string; accent: string; bg: string; border: string }> = {
  'Computer Science & AI':    { emoji: '💻', accent: '#2563eb', bg: '#eff6ff', border: '#bfdbfe' },
  'Engineering & Technology': { emoji: '⚙️', accent: '#7c3aed', bg: '#f5f3ff', border: '#ddd6fe' },
  'Medical & Health':         { emoji: '🧬', accent: '#dc2626', bg: '#fef2f2', border: '#fecaca' },
  'Environmental Science':    { emoji: '🌿', accent: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0' },
  'Social Sciences':          { emoji: '🌐', accent: '#d97706', bg: '#fffbeb', border: '#fde68a' },
  'Pure Sciences':            { emoji: '⚗️', accent: '#0891b2', bg: '#ecfeff', border: '#a5f3fc' },
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

export default function JournalsPage() {
  const { data: journals = [], isLoading } = useQuery({
    queryKey: ['journals'],
    queryFn: async () => (await api.get('/journals')).data,
  });

  return (
    <>
      <div className="page-header">
        <div className="container">
          <span className="section-label">Our Publications</span>
          <h1>Journal Directory</h1>
          <p style={{ color: 'rgba(255,255,255,0.7)', marginTop: '0.75rem', maxWidth: 560 }}>
            Explore our portfolio of peer-reviewed, open-access academic journals spanning every major research discipline.
          </p>
        </div>
      </div>

      <section style={{ background: 'var(--gray-50)', minHeight: '60vh' }}>
        <div className="container">
          {isLoading ? (
            <div className="grid-2-cols" style={{ gap: '1.5rem' }}>
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="card" style={{ padding: '2rem' }}>
                  <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                    <div className="skeleton" style={{ width: 52, height: 52, borderRadius: 14 }} />
                    <div style={{ flex: 1 }}>
                      <div className="skeleton skeleton-text" style={{ width: '70%', marginBottom: '0.5rem', height: '1.1rem' }} />
                      <div className="skeleton skeleton-text" style={{ width: '50%' }} />
                    </div>
                  </div>
                  <div className="skeleton skeleton-text" style={{ width: '100%', marginBottom: '0.375rem' }} />
                  <div className="skeleton skeleton-text" style={{ width: '90%', marginBottom: '0.375rem' }} />
                  <div className="skeleton skeleton-text" style={{ width: '75%' }} />
                </div>
              ))}
            </div>
          ) : journals.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '5rem 0' }}>
              <p style={{ color: 'var(--gray-400)', fontFamily: 'Inter,sans-serif', fontWeight: 500, fontSize: '1.125rem' }}>No journals available yet</p>
            </div>
          ) : (
            <>
              <p style={{ color: 'var(--gray-500)', fontSize: '0.9rem', marginBottom: '2rem' }}>
                Showing <strong>{journals.length}</strong> active journals
              </p>
              <div className="grid-2-cols" style={{ gap: '1.5rem' }}>
                {journals.map((j: any) => {
                  const theme = getTheme(j.name);
                  return (
                    <Link key={j.id} href={`/journals/${j.slug}`} className="card" style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', gap: '1rem', padding: '2rem', borderTop: `3px solid ${theme.accent}`, transition: 'all 0.25s ease' }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                        {/* Color-coded discipline icon */}
                        <div style={{ width: 52, height: 52, borderRadius: 14, background: theme.bg, border: `1.5px solid ${theme.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '1.5rem' }}>
                          {theme.emoji}
                        </div>
                        <div style={{ flex: 1 }}>
                          <h3 style={{ fontSize: '1.05rem', marginBottom: '0.375rem', lineHeight: 1.35, color: 'var(--navy)' }}>{j.name}</h3>
                          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', fontSize: '0.75rem', color: 'var(--gray-400)' }}>
                            {j.issn && <span>ISSN: {j.issn}</span>}
                            {j.eissn && <span>eISSN: {j.eissn}</span>}
                          </div>
                        </div>
                      </div>

                      <p className="truncate-3" style={{ fontSize: '0.875rem', color: 'var(--gray-500)', lineHeight: 1.7 }}>
                        {j.description}
                      </p>

                      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        {j.subjects?.map((js: any) => (
                          <span key={js.subject?.id || js.subjectId} className="badge" style={{ fontSize: '0.6875rem', background: theme.bg, color: theme.accent, border: `1px solid ${theme.border}` }}>
                            {js.subject?.name}
                          </span>
                        ))}
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.75rem', borderTop: '1px solid var(--gray-100)' }}>
                        <div style={{ display: 'flex', gap: '1.25rem', fontSize: '0.8125rem', color: 'var(--gray-400)' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <Globe size={12} /> Open Access
                          </span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <FileText size={12} /> Peer-Reviewed
                          </span>
                          {j.apcAmount > 0 && (
                            <span>APC: ₹{(j.apcAmount / 100).toLocaleString('en-IN')}</span>
                          )}
                        </div>
                        <span style={{ color: theme.accent, fontWeight: 600, fontSize: '0.8125rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          View <ArrowRight size={13} />
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </section>
    </>
  );
}
