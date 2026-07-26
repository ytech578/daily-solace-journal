'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { BookOpen, ChevronDown, Menu, X, Search, LogOut, User } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { useRouter } from 'next/navigation';

const navLinks = [
  { label: 'Journals', href: '/journals' },
  { label: 'Articles', href: '/articles' },
  { label: 'Browse', href: '/browse' },
  { label: 'For Authors', href: '/for-authors' },
  { label: 'About', href: '/about' },
];

const portalLinks: Record<string, { label: string; href: string }[]> = {
  AUTHOR:   [{ label: 'My Dashboard', href: '/portal/author' }, { label: 'Submit Manuscript', href: '/portal/author/submit' }],
  REVIEWER: [{ label: 'My Reviews', href: '/portal/reviewer' }],
  EDITOR:   [{ label: 'Editorial Dashboard', href: '/portal/editor' }],
  ADMIN:    [{ label: 'Admin Panel', href: '/portal/admin' }],
};

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoading, fetchMe, logout } = useAuthStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => { fetchMe(); }, [fetchMe]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  const links = user ? portalLinks[user.role] ?? [] : [];

  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 50,
      background: scrolled ? 'rgba(7,15,43,0.97)' : '#0B1D51',
      backdropFilter: 'blur(12px)',
      boxShadow: scrolled ? '0 4px 24px rgba(0,0,0,0.3)' : 'none',
      transition: 'all 0.3s ease',
      height: 'var(--header-h)',
    }}>
      <div className="container" style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1.5rem' }}>

        {/* Logo */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', color: '#fff', textDecoration: 'none' }}>
          <div style={{ width: 36, height: 36, background: 'linear-gradient(135deg,#C8972A,#e0b84a)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <BookOpen size={18} color="#fff" />
          </div>
          <div>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: '#fff', lineHeight: 1.2, letterSpacing: '-0.01em' }}>Daily Solace</div>
            <div style={{ fontSize: '0.625rem', color: 'rgba(255,255,255,0.55)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>Journal</div>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', flex: 1, justifyContent: 'center' }} className="desktop-nav">
          {navLinks.map((l) => (
            <Link key={l.href} href={l.href} style={{
              padding: '0.5rem 0.875rem',
              borderRadius: '0.5rem',
              fontSize: '0.9rem',
              fontWeight: 500,
              color: pathname.startsWith(l.href) ? '#fff' : 'rgba(255,255,255,0.7)',
              background: pathname.startsWith(l.href) ? 'rgba(255,255,255,0.12)' : 'transparent',
              transition: 'all 0.15s',
              textDecoration: 'none',
            }}>{l.label}</Link>
          ))}
        </nav>

        {/* Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          
          <Link href="/search" style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.8)' }}>
            <Search size={16} />
          </Link>

          {isLoading ? null : user ? (
            <div style={{ position: 'relative' }}>
              <button onClick={() => setDropdownOpen(!dropdownOpen)} style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 8,
                padding: '0.4rem 0.75rem', color: '#fff', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 500,
              }}>
                <div style={{ width: 26, height: 26, borderRadius: '50%', background: '#C8972A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700 }}>
                  {user.name[0]}
                </div>
                {user.name.split(' ')[0]}
                <ChevronDown size={14} />
              </button>

              {dropdownOpen && (
                <div style={{ position: 'absolute', right: 0, top: '110%', background: 'var(--white)', borderRadius: 10, boxShadow: '0 16px 48px rgba(0,0,0,0.18)', minWidth: 200, padding: '0.5rem', zIndex: 100, border: '1px solid var(--gray-200)' }}>
                  {links.map((l) => (
                    <Link key={l.href} href={l.href} onClick={() => setDropdownOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.625rem 0.875rem', borderRadius: 6, color: 'var(--gray-800)', fontSize: '0.9rem', textDecoration: 'none' }}>
                      <User size={15} /> {l.label}
                    </Link>
                  ))}
                  <hr style={{ margin: '0.375rem 0', border: 'none', borderTop: '1px solid var(--gray-200)' }} />
                  <button onClick={handleLogout} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.625rem 0.875rem', borderRadius: 6, color: '#dc2626', fontSize: '0.9rem', background: 'none', border: 'none', cursor: 'pointer' }}>
                    <LogOut size={15} /> Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="desktop-actions" style={{ display: 'flex', gap: '0.625rem' }}>
              <Link href="/auth/login" className="btn btn-outline-white btn-sm">Sign In</Link>
              <Link href="/auth/register" className="btn btn-gold btn-sm">Submit Paper</Link>
            </div>
          )}

          {/* Mobile toggle */}
          <button onClick={() => setMobileOpen(!mobileOpen)} style={{ display: 'none', background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }} className="mobile-toggle">
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div style={{ background: '#070f2b', padding: '1rem 1.5rem 1.5rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          {navLinks.map((l) => (
            <Link key={l.href} href={l.href} onClick={() => setMobileOpen(false)} style={{ display: 'block', padding: '0.75rem 0', color: 'rgba(255,255,255,0.8)', fontSize: '0.95rem', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>{l.label}</Link>
          ))}
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
            <Link href="/auth/login" className="btn btn-outline-white btn-sm" style={{ flex: 1, justifyContent: 'center' }}>Sign In</Link>
            <Link href="/auth/register" className="btn btn-gold btn-sm" style={{ flex: 1, justifyContent: 'center' }}>Submit</Link>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 900px) {
          .desktop-nav { display: none !important; }
          .desktop-actions { display: none !important; }
          .mobile-toggle { display: flex !important; }
        }
      `}</style>
    </header>
  );
}
