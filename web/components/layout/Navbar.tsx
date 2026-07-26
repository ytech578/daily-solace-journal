'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { BookOpen, ChevronDown, Menu, X, Search, LogOut, User, Settings, LayoutDashboard } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { useRouter } from 'next/navigation';

const navLinks = [
  { label: 'Journals', href: '/journals' },
  { label: 'Articles', href: '/articles' },
  { label: 'Browse', href: '/browse' },
  { label: 'For Authors', href: '/for-authors' },
  { label: 'About', href: '/about' },
];

const portalLinks: Record<string, { label: string; href: string; icon: any }[]> = {
  AUTHOR:   [
    { label: 'My Dashboard', href: '/portal/author', icon: LayoutDashboard },
    { label: 'Submit Manuscript', href: '/portal/author/submit', icon: User },
  ],
  REVIEWER: [{ label: 'My Reviews', href: '/portal/reviewer', icon: LayoutDashboard }],
  EDITOR:   [{ label: 'Editorial Dashboard', href: '/portal/editor', icon: LayoutDashboard }],
  ADMIN:    [{ label: 'Admin Panel', href: '/portal/admin', icon: LayoutDashboard }],
};

const roleBadgeColors: Record<string, { bg: string; color: string }> = {
  AUTHOR:   { bg: '#e8f0fe', color: '#1a56db' },
  REVIEWER: { bg: '#fef3c7', color: '#92400e' },
  EDITOR:   { bg: '#d1fae5', color: '#065f46' },
  ADMIN:    { bg: '#fee2e2', color: '#991b1b' },
};

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoading, fetchMe, logout } = useAuthStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => { fetchMe(); }, [fetchMe]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [dropdownOpen]);

  // Close dropdown on route change
  useEffect(() => { setDropdownOpen(false); setMobileOpen(false); }, [pathname]);

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  const links = user ? portalLinks[user.role] ?? [] : [];
  const roleBadge = user ? roleBadgeColors[user.role] : null;

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
            <div ref={dropdownRef} style={{ position: 'relative' }}>
              {/* User button */}
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                aria-expanded={dropdownOpen}
                aria-haspopup="true"
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                  background: dropdownOpen ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.1)',
                  border: 'none', borderRadius: 8,
                  padding: '0.4rem 0.75rem', color: '#fff', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 500,
                  transition: 'background 0.15s',
                }}>
                <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'linear-gradient(135deg,#C8972A,#e0b84a)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                  {user.name[0].toUpperCase()}
                </div>
                <span className="desktop-nav">{user.name.split(' ')[0]}</span>
                <ChevronDown
                  size={14}
                  style={{
                    transition: 'transform 0.2s ease',
                    transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                  }}
                />
              </button>

              {/* Dropdown */}
              {dropdownOpen && (
                <div style={{
                  position: 'absolute', right: 0, top: 'calc(100% + 8px)',
                  background: '#fff', borderRadius: 12,
                  boxShadow: '0 20px 60px rgba(0,0,0,0.2)', minWidth: 240,
                  zIndex: 100, border: '1px solid var(--gray-200)',
                  overflow: 'hidden',
                  animation: 'dropdownFadeIn 0.15s ease',
                }}>

                  {/* User info header */}
                  <div style={{ padding: '1rem 1.125rem', background: 'linear-gradient(135deg,#070f2b,#0B1D51)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ width: 42, height: 42, borderRadius: '50%', background: 'linear-gradient(135deg,#C8972A,#e0b84a)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                        {user.name[0].toUpperCase()}
                      </div>
                      <div style={{ overflow: 'hidden' }}>
                        <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.email}</div>
                        {roleBadge && (
                          <span style={{
                            display: 'inline-block', marginTop: '0.25rem',
                            fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em',
                            background: roleBadge.bg, color: roleBadge.color,
                            padding: '0.15rem 0.5rem', borderRadius: 9999,
                          }}>
                            {user.role}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Portal links */}
                  <div style={{ padding: '0.375rem' }}>
                    {links.map((l) => {
                      const Icon = l.icon;
                      return (
                        <Link
                          key={l.href}
                          href={l.href}
                          onClick={() => setDropdownOpen(false)}
                          style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', padding: '0.625rem 0.875rem', borderRadius: 8, color: 'var(--gray-700)', fontSize: '0.875rem', textDecoration: 'none', transition: 'background 0.1s' }}
                          onMouseEnter={e => (e.currentTarget.style.background = 'var(--gray-50)')}
                          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                        >
                          <Icon size={15} color="var(--navy)" /> {l.label}
                        </Link>
                      );
                    })}

                    {/* Edit Profile */}
                    <Link
                      href="/portal/profile"
                      onClick={() => setDropdownOpen(false)}
                      style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', padding: '0.625rem 0.875rem', borderRadius: 8, color: 'var(--gray-700)', fontSize: '0.875rem', textDecoration: 'none', transition: 'background 0.1s' }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'var(--gray-50)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      <Settings size={15} color="var(--gray-500)" /> Edit Profile
                    </Link>
                  </div>

                  <div style={{ height: 1, background: 'var(--gray-100)', margin: '0 0.375rem' }} />

                  {/* Sign out */}
                  <div style={{ padding: '0.375rem' }}>
                    <button
                      onClick={handleLogout}
                      style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.625rem', padding: '0.625rem 0.875rem', borderRadius: 8, color: '#dc2626', fontSize: '0.875rem', background: 'none', border: 'none', cursor: 'pointer', transition: 'background 0.1s', textAlign: 'left' }}
                      onMouseEnter={e => (e.currentTarget.style.background = '#fff1f1')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      <LogOut size={15} /> Sign Out
                    </button>
                  </div>
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
          {user && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', background: 'rgba(255,255,255,0.06)', borderRadius: 10, marginBottom: '0.75rem' }}>
              <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'linear-gradient(135deg,#C8972A,#e0b84a)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.875rem', fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                {user.name[0].toUpperCase()}
              </div>
              <div>
                <div style={{ fontWeight: 600, color: '#fff', fontSize: '0.875rem' }}>{user.name}</div>
                <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>{user.role}</div>
              </div>
            </div>
          )}
          {navLinks.map((l) => (
            <Link key={l.href} href={l.href} onClick={() => setMobileOpen(false)} style={{ display: 'block', padding: '0.75rem 0', color: 'rgba(255,255,255,0.8)', fontSize: '0.95rem', borderBottom: '1px solid rgba(255,255,255,0.06)', textDecoration: 'none' }}>{l.label}</Link>
          ))}
          {user ? (
            <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {links.map((l) => (
                <Link key={l.href} href={l.href} onClick={() => setMobileOpen(false)} className="btn btn-outline-white btn-sm" style={{ justifyContent: 'center' }}>{l.label}</Link>
              ))}
              <Link href="/portal/profile" onClick={() => setMobileOpen(false)} className="btn btn-outline-white btn-sm" style={{ justifyContent: 'center' }}>Edit Profile</Link>
              <button onClick={handleLogout} className="btn btn-sm" style={{ background: 'rgba(220,38,38,0.2)', color: '#fca5a5', border: '1px solid rgba(220,38,38,0.4)', justifyContent: 'center' }}>Sign Out</button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
              <Link href="/auth/login" className="btn btn-outline-white btn-sm" style={{ flex: 1, justifyContent: 'center' }}>Sign In</Link>
              <Link href="/auth/register" className="btn btn-gold btn-sm" style={{ flex: 1, justifyContent: 'center' }}>Submit</Link>
            </div>
          )}
        </div>
      )}

      <style>{`
        @media (max-width: 900px) {
          .desktop-nav { display: none !important; }
          .desktop-actions { display: none !important; }
          .mobile-toggle { display: flex !important; }
        }
        @keyframes dropdownFadeIn {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </header>
  );
}
