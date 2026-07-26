'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { BookOpen, ArrowRight } from 'lucide-react';

const subjects = [
  { name: 'Computer Science & AI', slug: 'computer-science', icon: '💻', color: '#2563eb', bg: '#eff6ff' },
  { name: 'Medical Sciences', slug: 'medical-sciences', icon: '🧬', color: '#dc2626', bg: '#fef2f2' },
  { name: 'Engineering & Tech', slug: 'engineering', icon: '⚙️', color: '#7c3aed', bg: '#f5f3ff' },
  { name: 'Environmental Science', slug: 'environmental-science', icon: '🌿', color: '#16a34a', bg: '#f0fdf4' },
  { name: 'Social Sciences', slug: 'social-sciences', icon: '🌐', color: '#d97706', bg: '#fffbeb' },
  { name: 'Economics & Finance', slug: 'economics', icon: '📊', color: '#0891b2', bg: '#ecfeff' },
  { name: 'Physics & Chemistry', slug: 'physics-mathematics', icon: '⚗️', color: '#9333ea', bg: '#faf5ff' },
  { name: 'Education & Psychology', slug: 'education-psychology', icon: '🎓', color: '#ea580c', bg: '#fff7ed' },
];

const years = [2026, 2025, 2024, 2023, 2022, 2021];

export default function BrowsePage() {
  const [selectedYear, setSelectedYear] = useState<number | null>(null);

  const { data: recentArticles = [] } = useQuery({
    queryKey: ['browse-recent', selectedYear],
    queryFn: async () => {
      const params = new URLSearchParams({ limit: '5' });
      if (selectedYear) params.set('year', String(selectedYear));
      const { data } = await api.get(`/articles?${params}`);
      return data.items ?? [];
    },
  });

  return (
    <>
      <div className="page-header">
        <div className="container">
          <span className="section-label">Browse</span>
          <h1>Browse Journals &amp; Archives</h1>
          <p style={{ color: 'rgba(255,255,255,0.7)', marginTop: '0.75rem' }}>
            Explore our collection by subject area, journal, or publication year.
          </p>
        </div>
      </div>

      <section style={{ background: 'var(--gray-50)' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '2.5rem', alignItems: 'start' }}>

            {/* Sidebar */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Year filter - styled pills */}
              <div className="card">
                <h4 style={{ marginBottom: '1rem' }}>Browse by Year</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {/* "All Years" */}
                  <button
                    onClick={() => setSelectedYear(null)}
                    style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: '0.625rem 0.875rem', borderRadius: 8, border: '1.5px solid',
                      cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem',
                      fontFamily: 'Inter, sans-serif', transition: 'all 0.15s',
                      background: selectedYear === null ? 'var(--navy)' : '#fff',
                      color: selectedYear === null ? '#fff' : 'var(--gray-700)',
                      borderColor: selectedYear === null ? 'var(--navy)' : 'var(--gray-200)',
                    }}
                  >
                    <span>All Years</span>
                    {selectedYear === null && <span style={{ fontSize: '0.75rem' }}>✓</span>}
                  </button>
                  {years.map((y) => (
                    <button
                      key={y}
                      onClick={() => setSelectedYear(y === selectedYear ? null : y)}
                      style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        padding: '0.625rem 0.875rem', borderRadius: 8, border: '1.5px solid',
                        cursor: 'pointer', fontWeight: 500, fontSize: '0.875rem',
                        fontFamily: 'Inter, sans-serif', transition: 'all 0.15s',
                        background: selectedYear === y ? 'var(--navy)' : '#fff',
                        color: selectedYear === y ? '#fff' : 'var(--gray-700)',
                        borderColor: selectedYear === y ? 'var(--navy)' : 'var(--gray-200)',
                      }}
                    >
                      <span>{y}</span>
                      <span style={{ fontSize: '0.75rem', color: selectedYear === y ? 'rgba(255,255,255,0.7)' : 'var(--gray-400)' }}>→</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="card">
                <h4 style={{ marginBottom: '1rem' }}>All Journals</h4>
                <Link href="/journals" className="btn btn-outline btn-sm" style={{ width: '100%', justifyContent: 'center' }}>
                  <BookOpen size={14} /> View Directory
                </Link>
              </div>
            </div>

            {/* Main content */}
            <div>
              {/* Subject grid */}
              <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>Browse by Subject</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '3rem' }}>
                {subjects.map((s) => (
                  <Link key={s.slug} href={`/search?subject=${encodeURIComponent(s.name)}`} className="card"
                    style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '1rem', borderLeft: `3px solid ${s.color}`, padding: '1.125rem 1.25rem' }}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.375rem', flexShrink: 0 }}>
                      {s.icon}
                    </div>
                    <div>
                      <h4 style={{ fontSize: '0.9375rem', marginBottom: '0.125rem', color: 'var(--navy)' }}>{s.name}</h4>
                      <span style={{ fontSize: '0.8rem', color: s.color, fontWeight: 500 }}>Browse →</span>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Recent / Year-filtered Articles */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                  <h2 style={{ fontSize: '1.5rem' }}>
                    {selectedYear ? `Articles from ${selectedYear}` : 'Recent Articles'}
                  </h2>
                  <Link href={selectedYear ? `/articles?year=${selectedYear}` : '/articles'} style={{ fontSize: '0.875rem', color: 'var(--gold)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    View all <ArrowRight size={14} />
                  </Link>
                </div>

                {recentArticles.length === 0 ? (
                  <div className="card" style={{ textAlign: 'center', padding: '2rem', color: 'var(--gray-400)' }}>
                    <p>No articles found{selectedYear ? ` for ${selectedYear}` : ''}.</p>
                    <Link href="/articles" className="btn btn-primary" style={{ marginTop: '1rem' }}>View All Articles</Link>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                    {recentArticles.map((a: any) => (
                      <Link key={a.id} href={`/articles/${a.id}`} className="card"
                        style={{ textDecoration: 'none', display: 'flex', gap: '1rem', alignItems: 'flex-start', padding: '1.125rem 1.25rem' }}>
                        <div style={{ width: 40, height: 40, borderRadius: 10, background: 'linear-gradient(135deg,#eef1fa,#dde3f5)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <BookOpen size={17} color="var(--navy)" />
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontFamily: '"Playfair Display",Georgia,serif', fontWeight: 600, fontSize: '0.9375rem', color: 'var(--navy)', lineHeight: 1.4, marginBottom: '0.25rem' }}>
                            {a.submission?.title}
                          </div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--gray-400)', display: 'flex', gap: '0.75rem' }}>
                            <span>{a.submission?.author?.name}</span>
                            <span>·</span>
                            <span style={{ color: 'var(--gold)', fontWeight: 600 }}>{a.submission?.journal?.name}</span>
                          </div>
                        </div>
                        <ArrowRight size={15} color="var(--gray-400)" style={{ flexShrink: 0, marginTop: 4 }} />
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
