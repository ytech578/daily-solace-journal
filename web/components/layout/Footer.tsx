'use client';

import Link from 'next/link';
import { BookOpen, Mail, Globe } from 'lucide-react';

const footerLinks = {
  Journals: [
    { label: 'All Journals', href: '/journals' },
    { label: 'Browse by Subject', href: '/browse' },
    { label: 'Current Issues', href: '/browse?tab=current' },
    { label: 'Archive', href: '/browse?tab=archive' },
  ],
  Authors: [
    { label: 'Submit Manuscript', href: '/portal/author/submit' },
    { label: 'Author Guidelines', href: '/for-authors' },
    { label: 'Publication Ethics', href: '/about' },
    { label: 'Article Processing Charges', href: '/for-authors#apc' },
  ],
  Reviewers: [
    { label: 'Reviewer Guidelines', href: '/for-reviewers' },
    { label: 'Review Portal', href: '/portal/reviewer' },
    { label: 'Editorial Board', href: '/about' },
  ],
  Journal: [
    { label: 'About DSJ', href: '/about' },
    { label: 'Editorial Team', href: '/about#team' },
    { label: 'Contact', href: '/contact' },
    { label: 'Privacy Policy', href: '/privacy' },
  ],
};

export function Footer() {
  return (
    <footer style={{ background: 'var(--navy-dark)', color: 'rgba(255,255,255,0.75)', marginTop: 'auto' }}>
      {/* Main footer */}
      <div className="container" style={{ padding: '4rem 1.5rem 3rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', gap: '3rem' }}>
          {/* Brand */}
          <div>
            <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '1.25rem', textDecoration: 'none' }}>
              <div style={{ width: 40, height: 40, background: 'linear-gradient(135deg,#C8972A,#e0b84a)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <BookOpen size={20} color="#fff" />
              </div>
              <div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', lineHeight: 1.2 }}>Daily Solace Journal</div>
                <div style={{ fontSize: '0.625rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Academic Publishing</div>
              </div>
            </Link>
            <p style={{ fontSize: '0.875rem', lineHeight: 1.75, maxWidth: 300, color: 'rgba(255,255,255,0.6)' }}>
              A peer-reviewed, open-access multi-journal directory committed to advancing global scholarship across all disciplines.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1.5rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem' }}><Mail size={13} /> editor@dailysolacejournal.com</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem' }}><Globe size={13} /> dailysolacejournal.com</span>
            </div>
            {/* Socials */}
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.25rem' }}>
              {[
                { href: 'https://twitter.com/dailysolacejournal', label: 'Twitter/X', svg: <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.741l7.73-8.835L1.254 2.25H8.08l4.259 5.631zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg> },
                { href: 'https://linkedin.com/company/dailysolacejournal', label: 'LinkedIn', svg: <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z"/><circle cx="4" cy="4" r="2"/></svg> },
                { href: 'https://researchgate.net', label: 'ResearchGate', svg: <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><text x="2" y="18" fontSize="16" fontWeight="bold">RG</text></svg> },
              ].map((s) => (
                <a key={s.href} href={s.href} target="_blank" rel="noopener noreferrer" title={s.label}
                  style={{ width: 34, height: 34, borderRadius: 8, background: 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.6)', transition: 'background 0.15s', textDecoration: 'none' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(200,151,42,0.3)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.08)')}
                >
                  {s.svg}
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 style={{ color: '#fff', fontFamily: 'Inter, sans-serif', fontSize: '0.8125rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '1rem' }}>{title}</h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                {links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.6)', textDecoration: 'none', transition: 'color 0.15s' }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = '#C8972A')}
                      onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.6)')}>
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="container" style={{ padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
          <p style={{ fontSize: '0.8125rem', color: 'rgba(255,255,255,0.4)' }}>
            © <span suppressHydrationWarning>{new Date().getFullYear()}</span> Daily Solace Journal. All rights reserved. ISSN: 2XXX-XXXX (Online)
          </p>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            {['Terms', 'Privacy', 'Cookies'].map((t) => (
              <Link key={t} href={`/${t.toLowerCase()}`} style={{ fontSize: '0.8125rem', color: 'rgba(255,255,255,0.4)' }}>{t}</Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
