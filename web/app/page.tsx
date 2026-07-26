import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, BookOpen, Users, Award, Globe, Search, TrendingUp, Shield, Zap, ChevronRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Daily Solace Journal — Advancing Global Scholarship',
  description: 'Peer-reviewed, open-access multi-journal platform publishing original research across sciences, humanities, and engineering.',
};

const stats = [
  { value: '12+', label: 'Active Journals' },
  { value: '2,400+', label: 'Published Articles' },
  { value: '85+', label: 'Countries Represented' },
  { value: '48h', label: 'Avg. First Decision' },
];

const subjects = [
  { name: 'Engineering & Technology', icon: '⚙️', count: '340+ articles' },
  { name: 'Medical Sciences', icon: '🧬', count: '280+ articles' },
  { name: 'Computer Science & AI', icon: '💻', count: '420+ articles' },
  { name: 'Social Sciences', icon: '🌐', count: '190+ articles' },
  { name: 'Environmental Science', icon: '🌿', count: '150+ articles' },
  { name: 'Economics & Finance', icon: '📊', count: '210+ articles' },
  { name: 'Education & Psychology', icon: '🎓', count: '170+ articles' },
  { name: 'Physics & Chemistry', icon: '⚗️', count: '220+ articles' },
];

const whyUs = [
  { icon: Shield, title: 'Rigorous Peer Review', desc: 'Double-blind review by domain experts ensures quality and integrity of published research.' },
  { icon: Zap, title: 'Fast Track Publishing', desc: 'Get your first editorial decision within 48 hours and publish within 4–6 weeks.' },
  { icon: Globe, title: 'Open Access', desc: 'All articles freely available to readers worldwide — no paywalls, no subscriptions.' },
  { icon: Award, title: 'CrossRef DOI Registration', desc: 'Every article receives a permanent CrossRef DOI for guaranteed discoverability.' },
];

const recentArticles = [
  { title: 'Deep Learning Approaches for Early Detection of Diabetic Retinopathy', journal: 'DSJ Medical Sciences', doi: '10.12345/dsj.001', authors: 'Sharma A., Patel R.', date: 'Jul 2025' },
  { title: 'Quantum Computing Algorithms for Optimization in Supply Chain Management', journal: 'DSJ Computer Science', doi: '10.12345/dsj.002', authors: 'Chen W., Kumar V.', date: 'Jul 2025' },
  { title: 'Carbon Sequestration Potential in Tropical Mangrove Ecosystems', journal: 'DSJ Environmental Science', doi: '10.12345/dsj.003', authors: 'Nair S., Reddy P.', date: 'Jun 2025' },
];

export default function HomePage() {
  return (
    <>
      {/* ─── Hero ───────────────────────────────────────────────────────────── */}
      <section style={{
        background: 'linear-gradient(135deg, #070f2b 0%, #0B1D51 50%, #1a3a8f 100%)',
        padding: '7rem 0 5rem',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Decorative orbs */}
        <div style={{ position: 'absolute', top: '-10%', right: '-5%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle,rgba(200,151,42,0.15),transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-15%', left: '-5%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle,rgba(26,58,143,0.4),transparent 70%)', pointerEvents: 'none' }} />

        <div className="container" style={{ position: 'relative' }}>
          <div style={{ maxWidth: 760, margin: '0 auto', textAlign: 'center' }}>
            <div className="animate-fade-up">
              <span className="badge badge-gold" style={{ marginBottom: '1.5rem' }}>
                🔬 Peer-Reviewed · Open Access · CrossRef DOI
              </span>
            </div>
            <h1 className="animate-fade-up delay-100" style={{ color: '#fff', marginBottom: '1.5rem', lineHeight: 1.15 }}>
              Advancing Global Scholarship,<br />
              <span style={{ color: 'var(--gold)' }}>One Discovery at a Time</span>
            </h1>
            <p className="animate-fade-up delay-200" style={{ fontSize: '1.125rem', color: 'rgba(255,255,255,0.75)', maxWidth: 600, margin: '0 auto 2.5rem', lineHeight: 1.8 }}>
              Daily Solace Journal is a multi-discipline academic publishing platform hosting peer-reviewed, open-access journals across sciences, humanities, and engineering.
            </p>
            <div className="animate-fade-up delay-300" style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/auth/register" className="btn btn-gold btn-lg">
                Submit Your Research <ArrowRight size={18} />
              </Link>
              <Link href="/journals" className="btn btn-outline-white btn-lg">
                Browse Journals
              </Link>
            </div>
          </div>

          {/* Search bar */}
          <div className="animate-fade-up delay-400" style={{ marginTop: '3.5rem', maxWidth: 620, margin: '3.5rem auto 0' }}>
            <form action="/search" style={{ display: 'flex', background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(12px)', borderRadius: '0.75rem', border: '1px solid rgba(255,255,255,0.2)', overflow: 'hidden' }}>
              <Search size={18} style={{ margin: 'auto 0 auto 1.25rem', color: 'rgba(255,255,255,0.5)', flexShrink: 0 }} />
              <input name="q" placeholder="Search articles, authors, keywords…" style={{ flex: 1, background: 'transparent', border: 'none', padding: '1rem 1rem 1rem 0.75rem', color: '#fff', fontSize: '1rem', outline: 'none' }} />
              <button type="submit" className="btn btn-gold" style={{ borderRadius: 0, margin: 0, borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}>
                Search
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* ─── Stats ──────────────────────────────────────────────────────────── */}
      <section style={{ padding: 0, background: 'var(--white)', borderBottom: '1px solid var(--gray-100)' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', borderLeft: '1px solid var(--gray-100)' }}>
            {stats.map((s) => (
              <div key={s.label} style={{ padding: '2.5rem 2rem', textAlign: 'center', borderRight: '1px solid var(--gray-100)' }}>
                <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--navy)', fontFamily: 'Inter, sans-serif', lineHeight: 1 }}>{s.value}</div>
                <div style={{ fontSize: '0.875rem', color: 'var(--gray-500)', marginTop: '0.375rem', fontWeight: 500 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Browse by Subject ───────────────────────────────────────────────── */}
      <section style={{ background: 'var(--gray-50)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <span className="section-label">Explore</span>
            <h2>Browse by Subject Area</h2>
            <p style={{ color: 'var(--gray-500)', maxWidth: 500, margin: '0.75rem auto 0' }}>Find peer-reviewed research across all major academic disciplines</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
            {subjects.map((s) => (
              <Link key={s.name} href={`/browse?subject=${encodeURIComponent(s.name)}`} className="card" style={{ textDecoration: 'none', textAlign: 'center' }}>
                <div style={{ fontSize: '2.25rem', marginBottom: '0.75rem' }}>{s.icon}</div>
                <h4 style={{ fontSize: '0.9rem', marginBottom: '0.375rem', color: 'var(--navy)' }}>{s.name}</h4>
                <span style={{ fontSize: '0.8rem', color: 'var(--gray-400)' }}>{s.count}</span>
              </Link>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
            <Link href="/browse" className="btn btn-outline">View All Subjects <ChevronRight size={16} /></Link>
          </div>
        </div>
      </section>

      {/* ─── Why DSJ ────────────────────────────────────────────────────────── */}
      <section style={{ background: 'var(--white)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <span className="section-label">Why Choose Us</span>
            <h2>Built for Serious Researchers</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '2rem' }}>
            {whyUs.map(({ icon: Icon, title, desc }) => (
              <div key={title} style={{ textAlign: 'center' }}>
                <div style={{ width: 56, height: 56, borderRadius: 16, background: 'linear-gradient(135deg,#eef1fa,#dde3f5)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
                  <Icon size={24} color="var(--navy)" />
                </div>
                <h4 style={{ marginBottom: '0.625rem' }}>{title}</h4>
                <p style={{ fontSize: '0.875rem', color: 'var(--gray-500)', lineHeight: 1.7 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Recent Articles ─────────────────────────────────────────────────── */}
      <section style={{ background: 'var(--gray-50)' }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '2.5rem' }}>
            <div>
              <span className="section-label">Latest Research</span>
              <h2 style={{ marginTop: '0.25rem' }}>Recently Published</h2>
            </div>
            <Link href="/articles" className="btn btn-outline btn-sm">All Articles <ArrowRight size={14} /></Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {recentArticles.map((a, i) => (
              <div key={i} className="card" style={{ display: 'flex', alignItems: 'flex-start', gap: '1.5rem' }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: 'linear-gradient(135deg,#eef1fa,#dde3f5)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <BookOpen size={20} color="var(--navy)" />
                </div>
                <div style={{ flex: 1 }}>
                  <Link href={`/articles/${a.doi}`} style={{ fontWeight: 600, color: 'var(--navy)', fontSize: '1rem', textDecoration: 'none', lineHeight: 1.45, display: 'block', marginBottom: '0.375rem' }}>
                    {a.title}
                  </Link>
                  <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.8125rem', color: 'var(--gold)', fontWeight: 600 }}>{a.journal}</span>
                    <span style={{ fontSize: '0.8125rem', color: 'var(--gray-400)' }}>{a.authors}</span>
                    <span className="badge badge-gray">{a.date}</span>
                    <code style={{ fontSize: '0.75rem', color: 'var(--gray-400)' }}>DOI: {a.doi}</code>
                  </div>
                </div>
                <Link href={`/articles/${a.doi}`} className="btn btn-outline btn-sm" style={{ flexShrink: 0 }}>Read →</Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA Banner ──────────────────────────────────────────────────────── */}
      <section style={{ background: 'linear-gradient(135deg,var(--navy-dark),var(--navy))', color: '#fff', textAlign: 'center' }}>
        <div className="container" style={{ maxWidth: 700 }}>
          <h2 style={{ color: '#fff', marginBottom: '1rem' }}>Ready to Publish Your Research?</h2>
          <p style={{ color: 'rgba(255,255,255,0.75)', marginBottom: '2rem', fontSize: '1.05rem' }}>
            Join thousands of researchers from 85+ countries publishing with Daily Solace Journal.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/auth/register" className="btn btn-gold btn-lg">Create Account & Submit</Link>
            <Link href="/for-authors" className="btn btn-outline-white btn-lg">Read Author Guidelines</Link>
          </div>
        </div>
      </section>
    </>
  );
}
