'use client';

import Link from 'next/link';
import { ArrowRight, BookOpen, Users, Award, Globe, Search, TrendingUp, Shield, Zap, ChevronRight, PlayCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const stats = [
  { value: '12+', label: 'Active Journals' },
  { value: '2,400+', label: 'Published Articles' },
  { value: '85+', label: 'Countries Represented' },
  { value: '48h', label: 'Avg. First Decision' },
];

const subjects = [
  { name: 'Engineering & Technology', slug: 'engineering-technology', icon: '⚙️' },
  { name: 'Medical & Clinical Sciences', slug: 'medical-clinical-sciences', icon: '🧬' },
  { name: 'Computer Science & AI', slug: 'computer-science-ai', icon: '💻' },
  { name: 'Social Sciences', slug: 'social-sciences', icon: '🌐' },
  { name: 'Environmental Science', slug: 'environmental-sustainability-science', icon: '🌿' },
  { name: 'Economics & Finance', slug: 'economics-business-finance', icon: '📊' },
  { name: 'Education & Psychology', slug: 'education-psychology', icon: '🎓' },
  { name: 'Physics & Chemistry', slug: 'physics-chemistry', icon: '⚗️' },
];

const whyUs = [
  { icon: Shield, title: 'Rigorous Peer Review', desc: 'Double-blind review by domain experts ensures quality and integrity of published research.' },
  { icon: Zap, title: 'Fast Track Publishing', desc: 'Get your first editorial decision within 48 hours and publish within 4–6 weeks.' },
  { icon: Globe, title: 'Open Access', desc: 'All articles freely available to readers worldwide — no paywalls, no subscriptions.' },
  { icon: Award, title: 'CrossRef DOI Registration', desc: 'Every article receives a permanent CrossRef DOI for guaranteed discoverability.' },
];

const containerVariants: any = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants: any = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 300, damping: 24 } }
};

export default function HomePage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const { data: recentArticles } = useQuery({
    queryKey: ['recent-articles'],
    queryFn: async () => (await api.get('/articles?limit=3')).data.items,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <>
      {/* ─── Premium Hero Section ───────────────────────────────────────────── */}
      <section style={{
        background: 'linear-gradient(135deg, var(--navy-dark) 0%, var(--navy) 40%, #1e3a8a 100%)',
        padding: '9rem 0 7rem',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Animated Orbs */}
        <motion.div 
          animate={{ scale: [1, 1.2, 1], rotate: [0, 45, 0] }} 
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          style={{ position: 'absolute', top: '-10%', right: '-5%', width: 700, height: 700, borderRadius: '50%', background: 'radial-gradient(circle,rgba(200,151,42,0.15),transparent 60%)', pointerEvents: 'none' }} 
        />
        <motion.div 
          animate={{ scale: [1, 1.3, 1], x: [0, -40, 0] }} 
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          style={{ position: 'absolute', bottom: '-15%', left: '-10%', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle,rgba(59,130,246,0.12),transparent 60%)', pointerEvents: 'none' }} 
        />

        <div className="container" style={{ position: 'relative', zIndex: 10 }}>
          <motion.div 
            initial="hidden" animate="visible" variants={containerVariants}
            style={{ maxWidth: 880, margin: '0 auto', textAlign: 'center' }}
          >
            <motion.div variants={itemVariants}>
              <span className="badge" style={{ marginBottom: '2rem', padding: '0.6rem 1.5rem', fontSize: '0.85rem', background: 'rgba(255,255,255,0.1)', color: 'var(--gold)', border: '1px solid rgba(200,151,42,0.3)', backdropFilter: 'blur(10px)' }}>
                <Award size={14} style={{ marginRight: 6 }} /> Premium Open Access Publisher
              </span>
            </motion.div>
            
            <motion.h1 variants={itemVariants} style={{ color: '#fff', marginBottom: '1.5rem', lineHeight: 1.15, fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', textShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
              Advancing Global Scholarship,<br />
              <span style={{ color: 'var(--gold)' }}>One Discovery at a Time</span>
            </motion.h1>
            
            <motion.p variants={itemVariants} style={{ fontSize: '1.25rem', color: 'rgba(255,255,255,0.85)', maxWidth: 720, margin: '0 auto 3.5rem', lineHeight: 1.7, fontWeight: 300 }}>
              Daily Solace Journal is a multi-discipline academic publishing platform hosting peer-reviewed, open-access journals across sciences, humanities, and engineering.
            </motion.p>
            
            <motion.div variants={itemVariants} style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/auth/register" className="btn" style={{ padding: '1.1rem 2.5rem', fontSize: '1.1rem', background: 'var(--gold)', color: '#fff', border: 'none', boxShadow: '0 10px 30px rgba(200,151,42,0.3)', borderRadius: 999 }}>
                Submit Your Research <ArrowRight size={20} />
              </Link>
              <Link href="/journals" className="btn btn-outline-white" style={{ padding: '1.1rem 2.5rem', fontSize: '1.1rem', borderRadius: 999, backdropFilter: 'blur(5px)' }}>
                Browse Journals <ChevronRight size={20} />
              </Link>
            </motion.div>
          </motion.div>

          {/* Search bar (Glassmorphism) */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6, duration: 0.6 }}
            style={{ marginTop: '5rem', maxWidth: 720, margin: '5rem auto 0' }}
          >
            <form onSubmit={handleSearch} style={{ display: 'flex', background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderRadius: '99px', border: '1px solid rgba(255,255,255,0.2)', padding: '0.4rem', boxShadow: '0 15px 40px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.1)' }}>
              <div style={{ display: 'flex', alignItems: 'center', padding: '0 1.25rem', color: 'var(--gold)' }}>
                <Search size={22} />
              </div>
              <input 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search articles, authors, DOIs, or keywords…" 
                style={{ flex: 1, background: 'transparent', border: 'none', padding: '0.8rem 0', color: '#fff', fontSize: '1.1rem', outline: 'none', fontFamily: '"Outfit", sans-serif' }} 
              />
              <button type="submit" className="btn" style={{ borderRadius: '99px', padding: '0.8rem 2.5rem', fontSize: '1.05rem', background: 'var(--gold)', color: '#fff', border: 'none' }}>
                Search
              </button>
            </form>
          </motion.div>
        </div>
      </section>

      {/* ─── Premium Stats ──────────────────────────────────────────────────── */}
      <section style={{ padding: '2rem 0', background: 'var(--white)', position: 'relative', zIndex: 20, marginTop: '-3rem' }}>
        <div className="container">
          <div className="grid-4-cols" style={{ padding: '2.5rem 2rem', gap: '2rem', boxShadow: '0 25px 50px rgba(11,29,81,0.08)', borderRadius: '1.5rem', border: '1px solid rgba(11,29,81,0.05)', background: '#fff' }}>
            {stats.map((s, i) => (
              <motion.div 
                key={s.label} 
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                style={{ textAlign: 'center', position: 'relative' }}
              >
                <div style={{ fontSize: '3.2rem', fontWeight: 800, background: 'linear-gradient(135deg, var(--navy), var(--gold))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontFamily: 'Inter, sans-serif', lineHeight: 1.1, letterSpacing: '-0.03em' }}>{s.value}</div>
                <div style={{ fontSize: '0.9rem', color: 'var(--gray-500)', marginTop: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</div>
                {i < stats.length - 1 && <div style={{ position: 'absolute', right: '-1rem', top: '15%', height: '70%', width: 1, background: 'var(--gray-100)' }} className="hide-on-mobile" />}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Browse by Subject ───────────────────────────────────────────────── */}
      <section style={{ background: '#f8fafc', padding: '6rem 0' }}>
        <div className="container">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={containerVariants}>
            <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
              <span className="section-label" style={{ color: 'var(--gold)', background: 'rgba(200,151,42,0.1)' }}>Explore</span>
              <h2 style={{ fontSize: '3rem', color: 'var(--navy)' }}>Browse by Subject Area</h2>
              <p style={{ color: 'var(--gray-500)', maxWidth: 600, margin: '1rem auto 0', fontSize: '1.15rem' }}>Find peer-reviewed research across all major academic disciplines</p>
            </div>
            
            <div className="grid-4-cols" style={{ gap: '1.5rem' }}>
              {subjects.map((s) => (
                <motion.div key={s.name} variants={itemVariants} whileHover={{ y: -5 }} style={{ transition: 'all 0.3s ease' }}>
                  <Link href={`/articles?subject=${s.slug}`} className="card" style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', height: '100%', padding: '2.5rem 1.5rem', background: '#fff', border: '1px solid var(--gray-100)', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', borderRadius: '1.25rem' }}>
                    <div style={{ fontSize: '3.5rem', marginBottom: '1.5rem', background: 'linear-gradient(135deg, #f0f4f8, #fff)', width: 90, height: 90, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.02), 0 10px 25px rgba(11,29,81,0.05)' }}>{s.icon}</div>
                    <h4 style={{ fontSize: '1.15rem', marginBottom: '0.5rem', color: 'var(--navy)' }}>{s.name}</h4>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── Recent Articles (Dynamic) ───────────────────────────────────────── */}
      <section style={{ padding: '6rem 0', background: 'var(--white)' }}>
        <div className="container">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={containerVariants}>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '3rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <span className="section-label" style={{ color: 'var(--gold)', background: 'rgba(200,151,42,0.1)' }}>Latest Research</span>
                <h2 style={{ marginTop: '0.25rem', fontSize: '2.5rem', color: 'var(--navy)' }}>Recently Published</h2>
              </div>
              <Link href="/articles" className="btn btn-outline" style={{ borderRadius: 999 }}>All Articles <ArrowRight size={16} /></Link>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {!recentArticles ? (
                 <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
                   <div className="skeleton" style={{ width: 40, height: 40, borderRadius: '50%' }} />
                 </div>
              ) : recentArticles.map((a: any, i: number) => (
                <motion.div key={a.id} variants={itemVariants} className="card" style={{ display: 'flex', alignItems: 'flex-start', gap: '1.5rem', padding: '2rem', border: '1px solid var(--gray-100)', boxShadow: '0 10px 30px rgba(0,0,0,0.03)', borderRadius: '1.25rem', transition: 'all 0.3s ease' }} whileHover={{ y: -3, boxShadow: '0 15px 40px rgba(0,0,0,0.06)' }}>
                  <div style={{ width: 60, height: 60, borderRadius: '1.25rem', background: 'linear-gradient(135deg, rgba(200,151,42,0.1), rgba(200,151,42,0.05))', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <BookOpen size={26} color="var(--gold)" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <Link href={`/articles/${a.id}`} style={{ fontWeight: 600, color: 'var(--navy)', fontSize: '1.25rem', textDecoration: 'none', lineHeight: 1.4, display: 'block', marginBottom: '0.75rem', fontFamily: '"Playfair Display", serif' }}>
                      {a.submission?.title}
                    </Link>
                    <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.85rem', color: 'var(--navy)', fontWeight: 600 }}>{a.submission?.journal?.name}</span>
                      <span style={{ fontSize: '0.85rem', color: 'var(--gray-500)' }}>{a.submission?.author?.name}</span>
                      <span className="badge" style={{ background: 'var(--gray-50)', color: 'var(--gray-600)' }}>{a.publishedAt ? new Date(a.publishedAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) : '—'}</span>
                    </div>
                  </div>
                  <Link href={`/articles/${a.id}`} className="btn btn-outline btn-sm hide-on-mobile" style={{ flexShrink: 0, borderRadius: 999 }}>Read Article →</Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── Why DSJ ────────────────────────────────────────────────────────── */}
      <section style={{ background: 'var(--gray-50)', position: 'relative', overflow: 'hidden', padding: '6rem 0' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '100%', background: 'radial-gradient(circle at 100% 100%, rgba(200,151,42,0.08), transparent 50%)', pointerEvents: 'none' }} />
        <div className="container">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={containerVariants}>
            <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
              <span className="section-label" style={{ color: 'var(--gold)', background: 'rgba(200,151,42,0.1)' }}>Why Choose Us</span>
              <h2 style={{ fontSize: '3rem', color: 'var(--navy)' }}>Built for Serious Researchers</h2>
            </div>
            
            <div className="grid-4-cols" style={{ gap: '2.5rem' }}>
              {whyUs.map(({ icon: Icon, title, desc }) => (
                <motion.div key={title} variants={itemVariants} style={{ textAlign: 'center', padding: '1.5rem' }} whileHover={{ y: -5 }}>
                  <div style={{ width: 80, height: 80, borderRadius: '1.5rem', background: 'linear-gradient(135deg, var(--navy-light), var(--navy))', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', color: '#fff', boxShadow: '0 15px 35px rgba(11,29,81,0.2)' }}>
                    <Icon size={36} />
                  </div>
                  <h4 style={{ marginBottom: '1rem', fontSize: '1.2rem', color: 'var(--navy)' }}>{title}</h4>
                  <p style={{ fontSize: '0.95rem', color: 'var(--gray-500)', lineHeight: 1.7 }}>{desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── Premium CTA Banner ────────────────────────────────────────────── */}
      <section style={{ padding: '7rem 0', background: 'linear-gradient(135deg, var(--navy-dark), var(--navy))', color: '#fff', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at center, rgba(200,151,42,0.2), transparent 70%)', pointerEvents: 'none' }} />
        <div className="container" style={{ maxWidth: 850, position: 'relative', zIndex: 10 }}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <h2 style={{ color: '#fff', marginBottom: '1.5rem', fontSize: '3.5rem', lineHeight: 1.2 }}>Ready to Publish Your Research?</h2>
            <p style={{ color: 'rgba(255,255,255,0.85)', marginBottom: '3.5rem', fontSize: '1.3rem', fontWeight: 300, lineHeight: 1.6 }}>
              Join thousands of researchers from 85+ countries publishing with Daily Solace Journal. Experience rapid, rigorous, and open-access publishing.
            </p>
            <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/auth/register" className="btn" style={{ background: 'var(--gold)', color: '#fff', border: 'none', padding: '1.1rem 2.5rem', borderRadius: 999, fontSize: '1.1rem', boxShadow: '0 10px 30px rgba(200,151,42,0.3)' }}>Create Account & Submit</Link>
              <Link href="/for-authors" className="btn btn-outline-white" style={{ padding: '1.1rem 2.5rem', borderRadius: 999, fontSize: '1.1rem' }}>Read Author Guidelines</Link>
            </div>
          </motion.div>
        </div>
      </section>

      <style>{`
        @media (max-width: 600px) {
          .hide-on-mobile { display: none !important; }
        }
      `}</style>
    </>
  );
}
