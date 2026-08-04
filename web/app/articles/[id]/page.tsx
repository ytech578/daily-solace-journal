'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { BookOpen, Download, Eye, Calendar, ArrowLeft, Quote, Link2, Clock, ChevronDown, ChevronUp, CheckCircle } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Parse a structured abstract into labelled sections */
function parseAbstract(text: string): { label: string | null; body: string }[] {
  const LABELS = ['Objective', 'Background', 'Methods', 'Results', 'Conclusion', 'Introduction', 'Discussion'];
  // Use non-capturing (?:) so split() does not emit the label name as a spurious standalone array element
  const pattern = new RegExp(`(?=(?:${LABELS.join('|')}):)`, 'i');
  const parts = text.split(pattern).filter(s => s.trim());

  // Check if any LABEL exists
  const hasStructure = LABELS.some(l => new RegExp(`\\b${l}:`, 'i').test(text));
  if (!hasStructure) return [{ label: null, body: text }];

  const sections: { label: string | null; body: string }[] = [];
  for (const part of parts) {
    const m = part.match(/^(\w+):([\s\S]*)/);
    if (m && LABELS.some(l => l.toLowerCase() === m[1].toLowerCase())) {
      sections.push({ label: m[1], body: m[2].trim() });
    } else if (part.trim()) {
      sections.push({ label: null, body: part.trim() });
    }
  }
  return sections.length ? sections : [{ label: null, body: text }];
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function ArticleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [readProgress, setReadProgress] = useState(0);
  const [citationFormat, setCitationFormat] = useState('APA');
  const [copied, setCopied] = useState(false);
  const [showReader, setShowReader] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [downloadDone, setDownloadDone] = useState(false);

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

  // Trigger download by direct navigation so IDM / browser download managers handle it natively
  const handleDownload = useCallback(() => {
    if (!article) return;
    setDownloading(true);
    
    // Using window.location.href or a hidden iframe allows IDM and browsers to handle the
    // attachment natively. fetch() + Blob gets intercepted and aborted by IDM causing errors.
    const downloadUrl = `/api/articles/${article.id}/download`;
    
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = ''; // Let the server headers determine the filename
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    // Simulate a brief loading state for UX
    setTimeout(() => {
      setDownloading(false);
      setDownloadDone(true);
      setTimeout(() => setDownloadDone(false), 3000);
    }, 800);
  }, [article]);

  if (isLoading) return (
    <div style={{ padding: '6rem', textAlign: 'center', color: 'var(--gray-400)' }}>
      <div style={{ width: 40, height: 40, border: '3px solid var(--gray-200)', borderTopColor: 'var(--navy)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 1rem' }} />
      Loading article…
    </div>
  );

  if (!article) return (
    <div style={{ padding: '6rem', textAlign: 'center' }}>
      <h3>Article not found</h3>
      <Link href="/articles" className="btn btn-primary" style={{ marginTop: '1rem' }}>← Back to Articles</Link>
    </div>
  );

  const sub = article.submission;
  
  // Deduplicate authors by name to prevent double entries (since sub.author might also be in sub.coAuthors)
  const allAuthors = [sub.author, ...(sub.coAuthors ?? [])];
  const uniqueAuthors: any[] = [];
  const seenNames = new Set();
  for (const a of allAuthors) {
    if (!seenNames.has(a.name)) {
      seenNames.add(a.name);
      uniqueAuthors.push(a);
    }
  }
  const authors = uniqueAuthors;

  // Reading time (200 wpm)
  const wordCount = sub.abstract.split(/\s+/).length;
  const readTime = Math.max(1, Math.ceil(wordCount / 200));

  // Parse abstract sections
  const abstractSections = parseAbstract(sub.abstract);

  // Parse full text sections if available
  const fullTextSections: { heading: string; body: string }[] = [];
  if (sub.fullText) {
    const parts = sub.fullText.split(/(?=\n\d+\.\s+[A-Z])/);
    for (const part of parts) {
      const match = part.match(/^\n?(\d+\.\s+.*?)\n([\s\S]*)/);
      if (match) {
        fullTextSections.push({ heading: match[1].trim(), body: match[2].trim() });
      } else {
        fullTextSections.push({ heading: '', body: part.trim() });
      }
    }
  }

  // Citations
  const year = article.publishedAt ? new Date(article.publishedAt).getFullYear() : '—';
  const authorNamesAPA = authors.map((a: any) => `${a.name.split(' ').pop()}, ${a.name.split(' ')[0][0]}.`).join(', ');
  const authorNamesMLA = authors.length > 2
    ? `${authors[0].name.split(' ').pop()}, ${authors[0].name.split(' ')[0]}, et al.`
    : authors.map((a: any) => `${a.name.split(' ').pop()}, ${a.name.split(' ')[0]}`).join(' and ');
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
      {/* Reading progress bar */}
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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <h3 style={{ fontSize: '1.125rem', margin: 0 }}>Abstract</h3>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button onClick={copyLink} className="btn btn-outline btn-sm" style={{ padding: '0.375rem 0.625rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }} title="Copy link">
                    <Link2 size={14} /> {copied ? 'Copied!' : 'Copy Link'}
                  </button>
                  <a
                    href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(sub.title)}&url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`}
                    target="_blank" rel="noopener noreferrer"
                    className="btn btn-outline btn-sm"
                    style={{ padding: '0.375rem 0.625rem', fontSize: '0.8rem' }}
                  >Twitter</a>
                  <a
                    href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}&title=${encodeURIComponent(sub.title)}`}
                    target="_blank" rel="noopener noreferrer"
                    className="btn btn-outline btn-sm"
                    style={{ padding: '0.375rem 0.625rem', fontSize: '0.8rem' }}
                  >LinkedIn</a>
                </div>
              </div>

              {/* Structured abstract renderer */}
              {abstractSections.map((section, i) => (
                <div key={i} style={{ marginBottom: i < abstractSections.length - 1 ? '0.875rem' : 0 }}>
                  {section.label && (
                    <span style={{ fontWeight: 700, color: 'var(--navy)', fontSize: '0.95rem' }}>
                      {section.label}:{' '}
                    </span>
                  )}
                  <span style={{ lineHeight: 1.85, color: 'var(--gray-600)', fontSize: '0.95rem' }}>
                    {section.body}
                  </span>
                </div>
              ))}
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

            {/* In-page Article Reader */}
            <div className="card" style={{ marginBottom: '1.5rem', padding: 0, overflow: 'hidden', border: '2px solid var(--navy)' }}>
              <button
                onClick={() => setShowReader(!showReader)}
                style={{
                  width: '100%', padding: '1rem 1.5rem', background: 'var(--navy)', color: '#fff',
                  border: 'none', cursor: 'pointer', display: 'flex', justifyContent: 'space-between',
                  alignItems: 'center', fontFamily: 'Inter,sans-serif', fontWeight: 600, fontSize: '0.95rem'
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <BookOpen size={18} /> Read Full Article Online
                </span>
                {showReader ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </button>

              {showReader && (
                <div style={{ padding: '2.5rem', background: '#fff' }}>
                  {/* Article reader header */}
                  <div style={{ borderBottom: '3px solid var(--gold)', paddingBottom: '1.5rem', marginBottom: '2rem' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--gray-400)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>
                      {sub.journal?.name}
                    </div>
                    <h2 style={{ fontSize: '1.5rem', lineHeight: 1.35, color: 'var(--navy)', fontFamily: '"Playfair Display",Georgia,serif', marginBottom: '1rem' }}>
                      {sub.title}
                    </h2>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', fontSize: '0.875rem', color: 'var(--gray-600)' }}>
                      {authors.map((a: any, i: number) => (
                        <span key={i}>{a.name}{a.institution ? ` (${a.institution})` : ''}{i < authors.length - 1 ? ',' : ''}{' '}</span>
                      ))}
                    </div>
                    {article.publishedAt && (
                      <div style={{ fontSize: '0.8rem', color: 'var(--gray-400)', marginTop: '0.5rem' }}>
                        Published: {new Date(article.publishedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}
                        {article.doi && <span style={{ marginLeft: '1rem' }}>DOI: {article.doi}</span>}
                      </div>
                    )}
                  </div>

                  {/* Abstract sections */}
                  <div style={{ marginBottom: '2rem' }}>
                    <h3 style={{ fontSize: '1.125rem', color: 'var(--navy)', marginBottom: '1rem', fontFamily: '"Playfair Display",Georgia,serif' }}>Abstract</h3>
                    {abstractSections.map((section, i) => (
                      <p key={i} style={{ lineHeight: 1.9, color: '#333', fontSize: '1rem', marginBottom: '0.75rem', textAlign: 'justify' }}>
                        {section.label && (
                          <strong style={{ color: 'var(--navy)' }}>{section.label}: </strong>
                        )}
                        {section.body}
                      </p>
                    ))}
                  </div>

                  {/* Keywords */}
                  {sub.keywords?.length > 0 && (
                    <div style={{ marginBottom: '2rem', paddingTop: '1.25rem', borderTop: '1px solid var(--gray-100)' }}>
                      <strong style={{ color: 'var(--navy)', fontSize: '0.9rem' }}>Keywords: </strong>
                      <span style={{ fontStyle: 'italic', color: 'var(--gray-600)', fontSize: '0.9rem' }}>
                        {sub.keywords.join(', ')}
                      </span>
                    </div>
                  )}

                  {/* Full Text Sections */}
                  {fullTextSections.length > 0 && (
                    <div style={{ marginBottom: '2rem', paddingTop: '2rem', borderTop: '2px solid var(--gray-100)' }}>
                      {fullTextSections.map((section, i) => (
                        <div key={i} style={{ marginBottom: '2rem' }}>
                          {section.heading && (
                            <h3 style={{ fontSize: '1.25rem', color: 'var(--navy)', marginBottom: '1rem', fontFamily: '"Playfair Display",Georgia,serif' }}>
                              {section.heading}
                            </h3>
                          )}
                          <p style={{ lineHeight: 1.9, color: '#333', fontSize: '1.05rem', textAlign: 'justify', whiteSpace: 'pre-wrap' }}>
                            {section.body}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Note about full text */}
                  <div style={{ background: 'linear-gradient(135deg, #eff6ff, #dbeafe)', border: '1px solid #bfdbfe', borderRadius: '0.75rem', padding: '1.25rem', display: 'flex', gap: '0.875rem', alignItems: 'flex-start' }}>
                    <Download size={20} color="#2563eb" style={{ flexShrink: 0, marginTop: 2 }} />
                    <div>
                      <div style={{ fontWeight: 600, color: '#1e40af', fontSize: '0.9rem', marginBottom: '0.25rem' }}>Download PDF for Full Text</div>
                      <div style={{ color: '#3b82f6', fontSize: '0.85rem', lineHeight: 1.6 }}>
                        The complete formatted article including all figures, tables, and references is available as a PDF. Click "Download PDF" in the sidebar to save a copy.
                      </div>
                    </div>
                  </div>

                  {/* Open Access badge */}
                  <div style={{ marginTop: '1.5rem', padding: '0.875rem 1rem', background: 'var(--gray-50)', borderRadius: '0.5rem', fontSize: '0.8rem', color: 'var(--gray-500)', textAlign: 'center', borderTop: '1px solid var(--gray-200)' }}>
                    © {year} {sub.journal?.name}. Open Access article under CC BY 4.0 International License.
                  </div>
                </div>
              )}
            </div>

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
                <pre style={{ background: 'var(--gray-900)', borderRadius: 8, padding: '1rem', fontSize: '0.8125rem', color: '#a3e635', lineHeight: 1.75, overflowX: 'auto', fontFamily: '"Fira Code","Courier New",monospace', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                  {citations.BibTeX}
                </pre>
              ) : (
                <div style={{ background: 'var(--gray-50)', borderRadius: 8, padding: '1rem', fontSize: '0.875rem', color: 'var(--gray-600)', lineHeight: 1.75 }}>
                  {citations[citationFormat]}
                </div>
              )}
            </div>

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
                <button
                  onClick={() => setShowReader(!showReader)}
                  className="btn btn-primary"
                  style={{ width: '100%', justifyContent: 'center', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                  <BookOpen size={16} /> {showReader ? 'Hide Article' : 'Read Online'}
                </button>
                <button
                  onClick={handleDownload}
                  disabled={downloading}
                  className="btn btn-outline"
                  style={{ width: '100%', justifyContent: 'center', display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: downloading ? 0.7 : 1, cursor: downloading ? 'not-allowed' : 'pointer' }}
                >
                  {downloadDone
                    ? <><CheckCircle size={16} color="green" /> Downloaded!</>
                    : downloading
                      ? <><span style={{ width: 16, height: 16, border: '2px solid var(--gray-300)', borderTopColor: 'var(--navy)', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} /> Preparing…</>
                      : <><Download size={16} /> Download PDF</>
                  }
                </button>
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--gray-400)', marginTop: '0.875rem', lineHeight: 1.6 }}>
                Open access · Free to read and download · CC BY 4.0
              </p>
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
