'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { BookOpen, Download, Eye, Calendar, ArrowLeft, Users, FileText, Quote, Share2, Link2, Clock } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function ArticleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [readProgress, setReadProgress] = useState(0);
  const [citationFormat, setCitationFormat] = useState('APA');
  const [copied, setCopied] = useState(false);
  const [showViewer, setShowViewer] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTotal = document.documentElement.scrollHeight - window.innerHeight;
      const progress = Math.min(100, Math.max(0, (window.scrollY / scrollTotal) * 100));
      setReadProgress(progress);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const { data: article, isLoading } = useQuery({
    queryKey: ['article', id],
    queryFn: async () => (await api.get(`/articles/${id}`)).data,
    enabled: !!id,
  });

  const { data: relatedArticles = [] } = useQuery({
    queryKey: ['related-articles', article?.subject?.slug],
    queryFn: async () => {
      const { data } = await api.get(`/articles?subjectId=${article.subject.id}&limit=3`);
      return data.items.filter((a: any) => a.id !== article.id).slice(0, 2);
    },
    enabled: !!article?.subject?.id,
  });

  if (isLoading) return <div style={{ padding: '6rem', textAlign: 'center', color: 'var(--gray-400)' }}>Loading article…</div>;
  if (!article) return <div style={{ padding: '6rem', textAlign: 'center' }}><h3>Article not found</h3><Link href="/articles" className="btn btn-primary" style={{ marginTop: '1rem' }}>← Back to Articles</Link></div>;

  const sub = article.submission;
  const authors = [sub.author, ...(sub.coAuthors ?? [])];
  
  // Reading time (assume 200 wpm)
  const wordCount = sub.abstract.split(/\s+/).length;
  const readTime = Math.max(1, Math.ceil(wordCount / 200));

  // Citations
  const year = article.publishedAt ? new Date(article.publishedAt).getFullYear() : '—';
  const authorNamesAPA = authors.map((a: any) => `${a.name.split(' ').pop()}, ${a.name.split(' ')[0][0]}.`).join(', ');
  const authorNamesMLA = authors.length > 2 ? `${authors[0].name.split(' ').pop()}, ${authors[0].name.split(' ')[0]}, et al.` : authors.map((a: any) => `${a.name.split(' ').pop()}, ${a.name.split(' ')[0]}`).join(' and ');
  const doiStr = article.doi ? `https://doi.org/${article.doi}` : '';

  const citations: Record<string, string> = {
    APA: `${authorNamesAPA} (${year}). ${sub.title}. ${sub.journal?.name}${article.pageStart ? `, ${article.issue?.volume?.number}(${article.issue?.number}), ${article.pageStart}-${article.pageEnd}` : ''}. ${doiStr}`,
    MLA: `${authorNamesMLA}. "${sub.title}." ${sub.journal?.name}${article.issue?.volume?.number ? `, vol. ${article.issue.volume.number}, no. ${article.issue.number}` : ''}, ${year}${article.pageStart ? `, pp. ${article.pageStart}-${article.pageEnd}` : ''}. ${doiStr}`,
    Chicago: `${authorNamesAPA.replace(/, /g, ', and ')}. "${sub.title}." ${sub.journal?.name} ${article.issue?.volume?.number ?? ''}, no. ${article.issue?.number ?? ''} (${year})${article.pageStart ? `: ${article.pageStart}-${article.pageEnd}` : ''}. ${doiStr}`,
    IEEE: `${authors.map((a: any) => `${a.name.split(' ')[0][0]}. ${a.name.split(' ').pop()}`).join(', ')}, "${sub.title}," ${sub.journal?.name}${article.issue?.volume?.number ? `, vol. ${article.issue.volume.number}, no. ${article.issue.number}` : ''}${article.pageStart ? `, pp. ${article.pageStart}-${article.pageEnd}` : ''}, ${year}. ${doiStr}`,
    BibTeX: `@article{${authors[0]?.name?.split(' ').pop()?.toLowerCase() ?? 'author'}${year},\n  title   = {${sub.title}},\n  author  = {${authors.map((a: any) => a.name).join(' and ')}},\n  journal = {${sub.journal?.name}},\n  year    = {${year}},${article.pageStart ? `\n  pages   = {${article.pageStart}--${article.pageEnd}},` : ''}${article.doi ? `\n  doi     = {${article.doi}},\n  url     = {${doiStr}}` : ''}\n}`,
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <div className="reading-progress-container">
        <div className="reading-progress-bar" style={{ width: `${readProgress}%` }} />
      </div>

      {/* Article Header */}
      <div style={{ background: 'linear-gradient(135deg,#070f2b,#0B1D51)', padding: '3.5rem 0', color: '#fff' }}>
        <div className="container" style={{ maxWidth: 900 }}>
          <Link href="/articles" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', color: 'rgba(255,255,255,0.5)', fontSize: '0.875rem', marginBottom: '1.5rem', textDecoration: 'none' }}>
            <ArrowLeft size={14} /> All Articles
          </Link>
          {article.subject && <span className="badge badge-gold" style={{ marginBottom: '1rem' }}>{article.subject.name}</span>}
          <h1 style={{ color: '#fff', fontSize: 'clamp(1.5rem,4vw,2.25rem)', lineHeight: 1.3, marginBottom: '1.25rem' }}>{sub.title}</h1>

          {/* Authors */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.25rem' }}>
            {authors.map((a: any, i: number) => {
              const authorId = a.id || a.userId;
              const content = (
                <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>
                  {a.name}{a.institution ? ` (${a.institution})` : ''}
                </span>
              );
              return (
                <span key={i} style={{ color: 'rgba(255,255,255,0.8)' }}>
                  {authorId ? (
                    <Link href={`/authors/${authorId}`} style={{ color: 'inherit', textDecoration: 'underline', textUnderlineOffset: 2 }}>{content}</Link>
                  ) : content}
                  {i < authors.length - 1 ? ', ' : ''}
                </span>
              );
            })}
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', fontSize: '0.875rem', color: 'rgba(255,255,255,0.6)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}><BookOpen size={14} /> {sub.journal?.name}</span>
            {article.publishedAt && <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}><Calendar size={14} /> {new Date(article.publishedAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</span>}
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}><Clock size={14} /> {readTime} min read</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}><Eye size={14} /> {article.viewCount ?? 0} views</span>
            {article.doi && <span>DOI: <code style={{ color: 'var(--gold)' }}>{article.doi}</code></span>}
          </div>
        </div>
      </div>

      {/* Content */}
      <section style={{ background: 'var(--gray-50)' }}>
        <div className="container journal-detail-grid" style={{ maxWidth: 900, display: 'grid', gridTemplateColumns: '1fr 280px', gap: '2.5rem', alignItems: 'start' }}>
          
          {/* Main */}
          <div>
            {/* Abstract */}
            <div className="card" style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1.125rem' }}>Abstract</h3>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button onClick={copyLink} className="btn btn-outline btn-sm" style={{ padding: '0.375rem 0.5rem' }} title="Copy Link">
                    <Link2 size={16} /> {copied && <span style={{ fontSize: '0.75rem', marginLeft: 4 }}>Copied</span>}
                  </button>
                  <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(sub.title)}&url=${encodeURIComponent(window.location.href)}`} target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-sm" style={{ padding: '0.375rem 0.5rem', fontSize: '0.75rem', fontWeight: 600 }} title="Share on Twitter">
                    Twitter
                  </a>
                  <a href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(window.location.href)}&title=${encodeURIComponent(sub.title)}`} target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-sm" style={{ padding: '0.375rem 0.5rem', fontSize: '0.75rem', fontWeight: 600 }} title="Share on LinkedIn">
                    LinkedIn
                  </a>
                </div>
              </div>
              <p style={{ lineHeight: 1.85, color: 'var(--gray-600)', fontSize: '0.95rem' }}>{sub.abstract}</p>
            </div>

            {/* Keywords */}
            {sub.keywords?.length > 0 && (
              <div className="card" style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ marginBottom: '0.875rem' }}>Keywords</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {sub.keywords.map((k: string) => <span key={k} className="badge badge-navy">{k}</span>)}
                </div>
              </div>
            )}

            {/* Citation */}
            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Quote size={18} color="var(--navy)" />
                  <h4>How to Cite</h4>
                </div>
                <select 
                  value={citationFormat} 
                  onChange={(e) => setCitationFormat(e.target.value)}
                  className="form-input" 
                  style={{ width: 'auto', padding: '0.25rem 0.5rem', fontSize: '0.8125rem', minHeight: 'auto' }}
                >
                  <option value="APA">APA</option>
                  <option value="MLA">MLA</option>
                  <option value="Chicago">Chicago</option>
                  <option value="IEEE">IEEE</option>
                  <option value="BibTeX">BibTeX</option>
                </select>
              </div>
              {citationFormat === 'BibTeX' ? (
                <pre style={{ background: 'var(--gray-900)', borderRadius: 8, padding: '1rem', fontSize: '0.8125rem', color: '#a3e635', lineHeight: 1.75, overflowX: 'auto', fontFamily: '"Fira Code", "Courier New", monospace', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                  {citations.BibTeX}
                </pre>
              ) : (
                <div style={{ background: 'var(--gray-50)', borderRadius: 8, padding: '1rem', fontSize: '0.875rem', color: 'var(--gray-600)', lineHeight: 1.75 }}>
                  {citations[citationFormat]}
                </div>
              )}
            </div>

            {/* PDF Viewer */}
            {showViewer && (
              <div className="card" style={{ marginBottom: '1.5rem', padding: 0, overflow: 'hidden' }}>
                <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--gray-100)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h4 style={{ margin: 0 }}>Inline PDF Viewer</h4>
                  <button onClick={() => setShowViewer(false)} className="btn btn-outline btn-sm" style={{ padding: '0.25rem 0.5rem' }}>Close</button>
                </div>
                <iframe 
                  src={`/api/articles/${article.id}/download#view=FitH`} 
                  style={{ width: '100%', height: '800px', border: 'none', display: 'block' }} 
                  title="PDF Viewer"
                />
              </div>
            )}

            {/* Related Articles */}
            {relatedArticles.length > 0 && (
              <div style={{ marginTop: '2.5rem' }}>
                <h4 style={{ marginBottom: '1rem', color: 'var(--navy)', fontSize: '1.125rem' }}>Related Articles</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {relatedArticles.map((rel: any) => (
                    <Link key={rel.id} href={`/articles/${rel.id}`} className="card" style={{ padding: '1.25rem', textDecoration: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <h5 style={{ color: 'var(--navy)', fontSize: '0.95rem', lineHeight: 1.4 }}>{rel.submission.title}</h5>
                      <div style={{ fontSize: '0.8125rem', color: 'var(--gray-500)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <span>{rel.submission.author.name}</span>
                        <span>{rel.publishedAt ? new Date(rel.publishedAt).getFullYear() : ''}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="card">
              <h4 style={{ marginBottom: '1rem' }}>Full Text</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <button onClick={() => setShowViewer(!showViewer)} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                  <BookOpen size={16} /> {showViewer ? 'Hide Viewer' : 'Read Online'}
                </button>
                <a href={`/api/articles/${article.id}/download`} className="btn btn-outline" style={{ width: '100%', justifyContent: 'center' }} target="_blank" rel="noreferrer">
                  <Download size={16} /> Download PDF
                </a>
              </div>
            </div>

            <div className="card">
              <h4 style={{ marginBottom: '1rem' }}>Article Info</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {[
                  { label: 'Journal', value: sub.journal?.name },
                  { label: 'Published', value: article.publishedAt ? new Date(article.publishedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—' },
                  { label: 'Views', value: String(article.viewCount ?? 0) },
                  { label: 'Downloads', value: String(article.downloadCount ?? 0) },
                  ...(article.pageStart ? [{ label: 'Pages', value: `${article.pageStart}–${article.pageEnd}` }] : []),
                  ...(article.doi ? [{ label: 'DOI', value: article.doi }] : []),
                ].map(({ label, value }) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', borderBottom: '1px solid var(--gray-100)', paddingBottom: '0.5rem' }}>
                    <span style={{ color: 'var(--gray-400)', fontWeight: 600 }}>{label}</span>
                    <span style={{ color: 'var(--gray-700)', textAlign: 'right', maxWidth: 140 }}>{value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="card">
              <h4 style={{ marginBottom: '1rem' }}>Authors</h4>
              {authors.map((a: any, i: number) => {
                const authorId = a.id || a.userId;
                return (
                  <div key={i} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: i < authors.length - 1 ? '0.875rem' : 0 }}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg,var(--navy),var(--navy-light))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                      {a.name?.[0]}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--gray-800)' }}>
                        {authorId ? (
                          <Link href={`/authors/${authorId}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                            <span style={{ textDecoration: 'underline', textUnderlineOffset: 2 }}>{a.name}</span>
                          </Link>
                        ) : a.name}
                      </div>
                      {a.institution && <div style={{ fontSize: '0.75rem', color: 'var(--gray-400)' }}>{a.institution}</div>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
