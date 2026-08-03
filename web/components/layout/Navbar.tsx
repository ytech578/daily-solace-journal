'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { BookOpen, ChevronDown, Menu, X, Search, LogOut, User, Settings, LayoutDashboard } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

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
  AUTHOR:   { bg: 'rgba(59,130,246,0.1)', color: '#3b82f6' },
  REVIEWER: { bg: 'rgba(245,158,11,0.1)', color: '#f59e0b' },
  EDITOR:   { bg: 'rgba(16,185,129,0.1)', color: '#10b981' },
  ADMIN:    { bg: 'rgba(239,68,68,0.1)', color: '#ef4444' },
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
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [dropdownOpen]);

  useEffect(() => { setDropdownOpen(false); setMobileOpen(false); }, [pathname]);

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  const links = user ? portalLinks[user.role] ?? [] : [];
  const roleBadge = user ? roleBadgeColors[user.role] : null;

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: scrolled ? 'rgba(7, 15, 43, 0.85)' : 'var(--navy)',
        backdropFilter: scrolled ? 'blur(24px)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(24px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(255,255,255,0.05)' : '1px solid transparent',
        boxShadow: scrolled ? '0 10px 40px -10px rgba(0,0,0,0.5)' : 'none',
        transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        height: 'var(--header-h)',
      }}>
      <div className="container mobile-gap-4" style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1.5rem' }}>

        {/* Logo */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#fff', textDecoration: 'none' }}>
          <motion.div 
            whileHover={{ scale: 1.05, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
            style={{ width: 40, height: 40, background: 'linear-gradient(135deg, var(--gold), var(--gold-light))', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 15px rgba(200,151,42,0.3)' }}
          >
            <BookOpen size={20} color="#fff" strokeWidth={2.5} />
          </motion.div>
          <div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff', lineHeight: 1.1, letterSpacing: '-0.02em', fontFamily: '"Outfit", sans-serif' }}>Daily Solace</div>
            <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 600 }}>Journal</div>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, justifyContent: 'center' }} className="desktop-nav">
          {navLinks.map((l) => {
            const isActive = pathname.startsWith(l.href);
            return (
              <Link key={l.href} href={l.href} style={{ position: 'relative', textDecoration: 'none' }}>
                <motion.div
                  whileHover={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
                  style={{
                    padding: '0.5rem 1rem',
                    borderRadius: '99px',
                    fontSize: '0.9rem',
                    fontWeight: 500,
                    color: isActive ? '#fff' : 'rgba(255,255,255,0.7)',
                    background: isActive ? 'rgba(255,255,255,0.15)' : 'transparent',
                    transition: 'color 0.2s ease',
                  }}
                >
                  {l.label}
                </motion.div>
              </Link>
            );
          })}
        </nav>

        {/* Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link href="/search" style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.9)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <Search size={18} />
            </Link>
          </motion.div>

          {isLoading ? null : user ? (
            <div ref={dropdownRef} style={{ position: 'relative' }}>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setDropdownOpen(!dropdownOpen)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                  background: dropdownOpen ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.1)',
                  border: '1px solid rgba(255,255,255,0.15)', borderRadius: 99,
                  padding: '0.35rem 0.75rem 0.35rem 0.35rem', color: '#fff', cursor: 'pointer',
                  transition: 'background 0.2s',
                }}>
                <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'linear-gradient(135deg, var(--gold), var(--gold-light))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 700, color: '#fff' }}>
                  {user.name[0].toUpperCase()}
                </div>
                <ChevronDown size={14} style={{ transition: 'transform 0.3s ease', transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)' }} />
              </motion.button>

              <AnimatePresence>
                {dropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    style={{
                      position: 'absolute', right: 0, top: 'calc(100% + 12px)',
                      background: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(20px)',
                      borderRadius: '1.25rem', boxShadow: '0 20px 60px rgba(0,0,0,0.15)', minWidth: 260,
                      zIndex: 100, border: '1px solid rgba(255,255,255,1)', overflow: 'hidden',
                    }}>

                    <div style={{ padding: '1.25rem', background: 'linear-gradient(135deg, var(--navy-dark), var(--navy))', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg, var(--gold), var(--gold-light))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', fontWeight: 700, color: '#fff', flexShrink: 0, boxShadow: '0 4px 10px rgba(200,151,42,0.3)' }}>
                          {user.name[0].toUpperCase()}
                        </div>
                        <div style={{ overflow: 'hidden' }}>
                          <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.95rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.email}</div>
                          {roleBadge && (
                            <span style={{
                              display: 'inline-block', marginTop: '0.4rem',
                              fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em',
                              background: roleBadge.bg, color: roleBadge.color,
                              padding: '0.2rem 0.6rem', borderRadius: 9999, border: `1px solid ${roleBadge.color}30`
                            }}>
                              {user.role}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div style={{ padding: '0.5rem' }}>
                      {links.map((l) => {
                        const Icon = l.icon;
                        return (
                          <Link key={l.href} href={l.href} onClick={() => setDropdownOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', borderRadius: '0.75rem', color: 'var(--gray-700)', fontSize: '0.9rem', fontWeight: 500, textDecoration: 'none', transition: 'all 0.2s' }} onMouseEnter={e => { e.currentTarget.style.background = 'var(--gray-50)'; e.currentTarget.style.color = 'var(--navy)'; }} onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--gray-700)'; }}>
                            <Icon size={16} color="var(--gold)" /> {l.label}
                          </Link>
                        );
                      })}
                      <Link href="/portal/profile" onClick={() => setDropdownOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', borderRadius: '0.75rem', color: 'var(--gray-700)', fontSize: '0.9rem', fontWeight: 500, textDecoration: 'none', transition: 'all 0.2s' }} onMouseEnter={e => { e.currentTarget.style.background = 'var(--gray-50)'; e.currentTarget.style.color = 'var(--navy)'; }} onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--gray-700)'; }}>
                        <Settings size={16} color="var(--gray-400)" /> Edit Profile
                      </Link>
                    </div>

                    <div style={{ height: 1, background: 'var(--gray-100)', margin: '0 1rem' }} />

                    <div style={{ padding: '0.5rem' }}>
                      <button onClick={handleLogout} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', borderRadius: '0.75rem', color: 'var(--error)', fontSize: '0.9rem', fontWeight: 500, background: 'none', border: 'none', cursor: 'pointer', transition: 'all 0.2s', textAlign: 'left' }} onMouseEnter={e => { e.currentTarget.style.background = '#fef2f2'; }} onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}>
                        <LogOut size={16} /> Sign Out
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <div className="desktop-actions" style={{ display: 'flex', gap: '0.75rem' }}>
              <Link href="/auth/login" className="btn btn-outline-white btn-sm">Sign In</Link>
              <Link href="/auth/register" className="btn btn-gold btn-sm">Submit Paper</Link>
            </div>
          )}

          <button onClick={() => setMobileOpen(!mobileOpen)} style={{ display: 'none', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 8, padding: 8, color: '#fff', cursor: 'pointer' }} className="mobile-toggle">
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }} 
            animate={{ opacity: 1, height: 'auto' }} 
            exit={{ opacity: 0, height: 0 }}
            style={{ background: 'var(--navy-dark)', overflow: 'hidden', borderTop: '1px solid rgba(255,255,255,0.05)' }}
          >
            <div style={{ padding: '1.5rem' }}>
              {user && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '1rem', marginBottom: '1rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg, var(--gold), var(--gold-light))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                    {user.name[0].toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, color: '#fff', fontSize: '0.95rem' }}>{user.name}</div>
                    <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>{user.role}</div>
                  </div>
                </div>
              )}
              {navLinks.map((l) => (
                <Link key={l.href} href={l.href} onClick={() => setMobileOpen(false)} style={{ display: 'block', padding: '1rem 0', color: 'rgba(255,255,255,0.8)', fontSize: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)', textDecoration: 'none' }}>{l.label}</Link>
              ))}
              {user ? (
                <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {links.map((l) => (
                    <Link key={l.href} href={l.href} onClick={() => setMobileOpen(false)} className="btn btn-outline-white btn-sm" style={{ justifyContent: 'center' }}>{l.label}</Link>
                  ))}
                  <Link href="/portal/profile" onClick={() => setMobileOpen(false)} className="btn btn-outline-white btn-sm" style={{ justifyContent: 'center' }}>Edit Profile</Link>
                  <button onClick={handleLogout} className="btn btn-sm" style={{ background: 'rgba(239,68,68,0.15)', color: '#fca5a5', border: '1px solid rgba(239,68,68,0.3)', justifyContent: 'center' }}>Sign Out</button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1.5rem' }}>
                  <Link href="/auth/login" className="btn btn-outline-white btn-sm" style={{ justifyContent: 'center' }}>Sign In</Link>
                  <Link href="/auth/register" className="btn btn-gold btn-sm" style={{ justifyContent: 'center' }}>Submit Paper</Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @media (max-width: 900px) {
          .desktop-nav { display: none !important; }
          .desktop-actions { display: none !important; }
          .mobile-toggle { display: flex !important; }
        }
      `}</style>
    </motion.header>
  );
}
