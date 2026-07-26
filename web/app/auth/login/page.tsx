'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { BookOpen, Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';

const portalByRole: Record<string, string> = {
  AUTHOR:   '/portal/author',
  REVIEWER: '/portal/reviewer',
  EDITOR:   '/portal/editor',
  ADMIN:    '/portal/admin',
};

export default function LoginPage() {
  const router = useRouter();
  const { login, user, isLoading } = useAuthStore();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // If user is already logged in, redirect them to their dashboard
  useEffect(() => {
    if (!isLoading && user) {
      router.replace(portalByRole[user.role] ?? '/portal/author');
    }
  }, [user, isLoading, router]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.password);
      // After login, user will be set in the store — the useEffect above handles redirect
    } catch (err: any) {
      setError(err.response?.data?.error || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  // Show nothing while checking auth status or if already logged in
  if (isLoading || user) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg,#070f2b 0%,#0B1D51 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loader2 size={32} color="#C8972A" style={{ animation: 'spin 1s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg,#070f2b 0%,#0B1D51 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ width: '100%', maxWidth: 440 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{ width: 56, height: 56, background: 'linear-gradient(135deg,#C8972A,#e0b84a)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
            <BookOpen size={26} color="#fff" />
          </div>
          <h1 style={{ color: '#fff', fontSize: '1.75rem', marginBottom: '0.5rem' }}>Welcome Back</h1>
          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.9rem' }}>Sign in to your Daily Solace Journal account</p>
        </div>

        <div className="card" style={{ padding: '2.5rem', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.3)', border: 'none' }}>
          {error && (
            <div style={{ background: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.3)', borderRadius: 8, padding: '0.75rem 1rem', display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', color: 'var(--error)', fontSize: '0.875rem' }}>
              <AlertCircle size={16} style={{ flexShrink: 0, marginTop: 1 }} /> {error}
            </div>
          )}

          <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '1.125rem' }}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input className="form-input" type="email" placeholder="you@university.edu" value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            </div>

            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <label className="form-label">Password</label>
                <Link href="/auth/forgot-password" style={{ fontSize: '0.8125rem', color: 'var(--gold)', fontWeight: 500 }}>Forgot password?</Link>
              </div>
              <div style={{ position: 'relative' }}>
                <input className="form-input" type={showPwd ? 'text' : 'password'} placeholder="••••••••" value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })} required
                  style={{ paddingRight: '2.75rem' }} />
                <button type="button" onClick={() => setShowPwd(!showPwd)} style={{ position: 'absolute', right: '0.875rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--gray-400)', cursor: 'pointer' }}>
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn btn-gold" disabled={loading} style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem', opacity: loading ? 0.7 : 1 }}>
              {loading ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Signing in…</> : 'Sign In'}
            </button>
          </form>

          {/* ORCID divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', margin: '1.5rem 0' }}>
            <div style={{ flex: 1, height: 1, background: 'var(--gray-200)' }} />
            <span style={{ fontSize: '0.75rem', color: 'var(--gray-400)', fontWeight: 500, whiteSpace: 'nowrap' }}>OR CONTINUE WITH</span>
            <div style={{ flex: 1, height: 1, background: 'var(--gray-200)' }} />
          </div>
          <button
            type="button"
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.625rem', padding: '0.6875rem 1.5rem', border: '1.5px solid #A6CE39', borderRadius: '0.5rem', background: '#fff', cursor: 'pointer', fontSize: '0.9375rem', fontWeight: 600, fontFamily: 'Inter,sans-serif', color: '#333', transition: 'background 0.15s' }}
            title="ORCID authentication coming soon"
            onClick={() => alert('ORCID authentication coming soon!')}
          >
            <svg width="22" height="22" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">
              <rect width="256" height="256" rx="128" fill="#A6CE39"/>
              <path d="M86.3 186.2H70.9V79.1h15.4v107.1zM108.9 79.1h41.6c39.6 0 57 28.3 57 53.6 0 27.5-21.5 53.6-56.8 53.6h-41.8V79.1zm15.4 93.3h24.5c34.9 0 42.9-26.5 42.9-39.7C191.7 111.2 178 93 148 93h-23.7v79.4zM88.7 56.8c0 5.5-4.5 9.9-9.9 9.9-5.5 0-9.9-4.4-9.9-9.9 0-5.5 4.4-9.9 9.9-9.9 5.4 0 9.9 4.4 9.9 9.9z" fill="#fff"/>
            </svg>
            Sign in with ORCID
          </button>

          <p style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--gray-600)', fontSize: '0.875rem' }}>
            Don&apos;t have an account?{' '}
            <Link href="/auth/register" style={{ color: 'var(--gold)', fontWeight: 600 }}>Create account</Link>
          </p>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
