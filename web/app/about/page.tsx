'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { Globe, Award, BookOpen, TrendingUp, Handshake, CheckCircle, Mail, MapPin } from 'lucide-react';

// Animated counter hook
function useCounter(target: number, duration = 1500) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const steps = 60;
          const step = target / steps;
          let current = 0;
          const timer = setInterval(() => {
            current = Math.min(current + step, target);
            setCount(Math.floor(current));
            if (current >= target) clearInterval(timer);
          }, duration / steps);
        }
      },
      { threshold: 0.3 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [target, duration]);

  return { count, ref };
}

function StatCard({ value, suffix = '', label }: { value: number; suffix?: string; label: string }) {
  const { count, ref } = useCounter(value);
  return (
    <div ref={ref} style={{ padding: '1.5rem', background: 'var(--gray-50)', borderRadius: 16, textAlign: 'center', border: '1px solid var(--gray-200)' }}>
      <div style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--navy)', fontFamily: 'Inter,sans-serif', lineHeight: 1 }}>
        {count.toLocaleString()}{suffix}
      </div>
      <div style={{ fontSize: '0.8125rem', color: 'var(--gray-500)', marginTop: '0.375rem', fontWeight: 500 }}>{label}</div>
    </div>
  );
}

const team = [
  { name: 'Prof. Arjun Sharma', role: 'Editor-in-Chief', inst: 'IIT Bombay', initials: 'AS', specialty: 'Computer Science & AI' },
  { name: 'Dr. Priya Nair', role: 'Managing Editor', inst: 'NIT Trichy', initials: 'PN', specialty: 'Electrical Engineering' },
  { name: 'Prof. David Chen', role: 'Associate Editor', inst: 'MIT, USA', initials: 'DC', specialty: 'Biomedical Engineering' },
  { name: 'Dr. Fatima Hassan', role: 'Associate Editor', inst: 'King Abdullah University', initials: 'FH', specialty: 'Environmental Science' },
  { name: 'Prof. Keiko Tanaka', role: 'Section Editor', inst: 'University of Tokyo', initials: 'KT', specialty: 'Materials Science' },
  { name: 'Dr. Oluwaseun Adesanya', role: 'Section Editor', inst: 'University of Lagos', initials: 'OA', specialty: 'Public Health' },
  { name: 'Prof. Maria Rossi', role: 'Advisory Board', inst: 'University of Bologna', initials: 'MR', specialty: 'Economics & Finance' },
  { name: 'Dr. Aleksei Petrov', role: 'Advisory Board', inst: 'Moscow State University', initials: 'AP', specialty: 'Physics & Mathematics' },
];

const AVATAR_COLORS = [
  'linear-gradient(135deg,#0B1D51,#1a3a8f)',
  'linear-gradient(135deg,#7c3aed,#a855f7)',
  'linear-gradient(135deg,#dc2626,#f87171)',
  'linear-gradient(135deg,#16a34a,#4ade80)',
  'linear-gradient(135deg,#d97706,#fbbf24)',
  'linear-gradient(135deg,#0891b2,#38bdf8)',
  'linear-gradient(135deg,#9333ea,#c084fc)',
  'linear-gradient(135deg,#ea580c,#fb923c)',
];

const values = [
  { icon: Globe, title: 'Open Access', desc: 'We believe knowledge should be free. All articles are openly accessible to readers worldwide with no subscription fees.' },
  { icon: Award, title: 'Quality First', desc: 'Rigorous double-blind peer review ensures every published article meets the highest standards of scientific integrity.' },
  { icon: TrendingUp, title: 'Impact-Driven', desc: 'We measure success by the real-world impact of published research, not just citation counts.' },
  { icon: Handshake, title: 'Collaborative', desc: 'We foster collaboration between authors, reviewers, and editors through transparent communication.' },
];

const milestones = [
  { year: '2019', title: 'Founded', desc: 'Daily Solace Journal launched with 2 flagship journals.' },
  { year: '2020', title: 'CrossRef Member', desc: 'Joined CrossRef to assign permanent DOIs to all articles.' },
  { year: '2022', title: 'DOAJ Listed', desc: 'Accepted into the Directory of Open Access Journals.' },
  { year: '2024', title: 'Global Reach', desc: 'Reached 85+ countries with 2,400+ published articles.' },
  { year: '2026', title: 'Platform Relaunch', desc: 'Launched next-gen publishing platform with AI-assisted review.' },
];

export default function AboutPage() {
  return (
    <>
      <div className="page-header">
        <div className="container">
          <span className="section-label">Our Story</span>
          <h1>About Daily Solace Journal</h1>
          <p style={{ maxWidth: 600, marginTop: '0.75rem' }}>
            Founded with a mission to democratize access to scholarly knowledge, Daily Solace Journal is
            India&apos;s premier multi-discipline open-access publishing platform.
          </p>
        </div>
      </div>

      {/* Mission section */}
      <section style={{ background: '#fff' }}>
        <div className="container" style={{ maxWidth: 1000 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5rem', alignItems: 'center' }}>
            <div>
              <span className="section-label">Mission</span>
              <h2 style={{ marginBottom: '1.25rem' }}>Advancing Knowledge, Globally</h2>
              <p style={{ color: 'var(--gray-600)', lineHeight: 1.85, marginBottom: '1rem' }}>
                Daily Solace Journal was established to provide researchers, particularly from developing nations,
                with a credible, affordable, and globally-recognized platform for publishing their discoveries.
              </p>
              <p style={{ color: 'var(--gray-600)', lineHeight: 1.85, marginBottom: '2rem' }}>
                We operate a multi-journal directory covering 12+ disciplines, with each journal overseen by an
                expert editorial board. Our CrossRef membership ensures every article receives a permanent DOI
                and is indexed across major academic databases.
              </p>
              {/* Checklist */}
              {[
                'Double-blind peer review on every submission',
                '48-hour initial editorial decision',
                'CrossRef DOI + Google Scholar indexing',
                'Open access — free to read, forever',
              ].map((item) => (
                <div key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.625rem', marginBottom: '0.625rem' }}>
                  <CheckCircle size={16} color="var(--success)" style={{ flexShrink: 0, marginTop: 2 }} />
                  <span style={{ fontSize: '0.9rem', color: 'var(--gray-700)' }}>{item}</span>
                </div>
              ))}
            </div>
            <div>
              <div style={{ background: 'linear-gradient(135deg,#eef1fa,#dde3f5)', borderRadius: 20, padding: '2.5rem 2rem', textAlign: 'center', marginBottom: '1.5rem' }}>
                <BookOpen size={64} color="var(--navy)" style={{ opacity: 0.25, margin: '0 auto 1.25rem' }} />
                <blockquote style={{ fontFamily: '"Playfair Display",Georgia,serif', fontSize: '1.15rem', color: 'var(--navy)', fontStyle: 'italic', lineHeight: 1.6 }}>
                  &ldquo;Science advances one published paper at a time. Our job is to make that process trustworthy, fast, and accessible to every researcher on Earth.&rdquo;
                </blockquote>
                <p style={{ marginTop: '1rem', fontSize: '0.875rem', color: 'var(--gray-500)', fontWeight: 600 }}>— Prof. Arjun Sharma, Editor-in-Chief</p>
              </div>

              {/* Animated Stats */}
              <div className="grid-2-cols" style={{ gap: '0.875rem' }}>
                <StatCard value={6} suffix="+" label="Active Journals" />
                <StatCard value={12} suffix="+" label="Articles Published" />
                <StatCard value={85} suffix="+" label="Countries Reached" />
                <StatCard value={2019} suffix="" label="Year Founded" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section style={{ background: 'var(--gray-50)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <span className="section-label">Our Values</span>
            <h2>What We Stand For</h2>
          </div>
          <div className="grid-4-cols" style={{ gap: '1.5rem' }}>
            {values.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="card" style={{ textAlign: 'center' }}>
                <div style={{ width: 52, height: 52, borderRadius: 14, background: 'linear-gradient(135deg,var(--navy),var(--navy-light))', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                  <Icon size={22} color="#fff" />
                </div>
                <h4 style={{ marginBottom: '0.625rem' }}>{title}</h4>
                <p style={{ fontSize: '0.875rem', color: 'var(--gray-500)', lineHeight: 1.7 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section style={{ background: '#fff' }}>
        <div className="container" style={{ maxWidth: 780 }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <span className="section-label">History</span>
            <h2>Our Milestones</h2>
          </div>
          <div style={{ position: 'relative', paddingLeft: '2rem' }}>
            <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 2, background: 'var(--gray-200)' }} />
            {milestones.map((m, i) => (
              <div key={m.year} style={{ position: 'relative', paddingLeft: '2.5rem', marginBottom: i < milestones.length - 1 ? '2rem' : 0 }}>
                <div style={{ position: 'absolute', left: -9, top: 4, width: 20, height: 20, borderRadius: '50%', background: 'var(--navy)', border: '3px solid #fff', boxShadow: '0 0 0 2px var(--navy)' }} />
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '1rem', marginBottom: '0.375rem' }}>
                  <span style={{ fontWeight: 800, fontFamily: 'Inter,sans-serif', color: 'var(--gold)', fontSize: '0.875rem' }}>{m.year}</span>
                  <h4 style={{ color: 'var(--navy)' }}>{m.title}</h4>
                </div>
                <p style={{ fontSize: '0.9rem', color: 'var(--gray-500)', lineHeight: 1.6 }}>{m.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Editorial Team */}
      <section id="team" style={{ background: 'var(--gray-50)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <span className="section-label">People</span>
            <h2>Editorial Leadership</h2>
            <p style={{ color: 'var(--gray-500)', marginTop: '0.75rem', maxWidth: 500, margin: '0.75rem auto 0' }}>
              Our editors and advisory board members are globally recognized experts in their respective fields.
            </p>
          </div>
          <div className="grid-4-cols" style={{ gap: '1.5rem' }}>
            {team.map((m, i) => (
              <div key={m.name} className="card" style={{ textAlign: 'center' }}>
                <div style={{ width: 72, height: 72, borderRadius: '50%', background: AVATAR_COLORS[i % AVATAR_COLORS.length], display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', fontSize: '1.25rem', fontWeight: 700, color: '#fff' }}>
                  {m.initials}
                </div>
                <h4 style={{ marginBottom: '0.25rem', fontSize: '0.9375rem' }}>{m.name}</h4>
                <p style={{ fontSize: '0.8125rem', color: 'var(--gold)', fontWeight: 600, marginBottom: '0.25rem' }}>{m.role}</p>
                <p style={{ fontSize: '0.775rem', color: 'var(--gray-400)', marginBottom: '0.375rem' }}>{m.inst}</p>
                <span className="badge badge-navy" style={{ fontSize: '0.625rem' }}>{m.specialty}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section style={{ background: 'linear-gradient(135deg,var(--navy-dark),var(--navy))' }}>
        <div className="container" style={{ maxWidth: 700, textAlign: 'center' }}>
          <h2 style={{ color: '#fff', marginBottom: '1rem' }}>Get In Touch</h2>
          <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '2rem' }}>
            Questions about submission, peer review, or editorial policy? Our team responds within 24 hours.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', flexWrap: 'wrap', marginBottom: '2.5rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>
              <Mail size={16} color="var(--gold)" /> editor@dailysolacejournal.com
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>
              <MapPin size={16} color="var(--gold)" /> New Delhi, India
            </span>
          </div>
          <Link href="/contact" className="btn btn-gold">Contact Us</Link>
        </div>
      </section>
    </>
  );
}
