'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { BookOpen, Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { motion } from 'framer-motion';

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
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, var(--navy-dark) 0%, var(--navy) 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loader2 size={40} color="var(--gold)" style={{ animation: 'spin 1s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, var(--navy-dark) 0%, var(--navy) 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', position: 'relative', overflow: 'hidden' }}>
      {/* Decorative Background Elements */}
      <motion.div 
        animate={{ scale: [1, 1.1, 1], rotate: [0, 5, 0] }} 
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        style={{ position: 'absolute', top: '-10%', right: '-5%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(200,151,42,0.15), transparent 70%)', pointerEvents: 'none' }} 
      />
      <motion.div 
        animate={{ scale: [1, 1.15, 1], y: [0, -30, 0] }} 
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        style={{ position: 'absolute', bottom: '-15%', left: '-5%', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(59,130,246,0.1), transparent 70%)', pointerEvents: 'none' }} 
      />

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        style={{ width: '100%', maxWidth: 440, position: 'relative', zIndex: 10 }}
      >
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <motion.div whileHover={{ scale: 1.05 }} style={{ width: 64, height: 64, background: 'linear-gradient(135deg, var(--gold), var(--gold-light))', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem', boxShadow: '0 10px 25px rgba(200,151,42,0.3)' }}>
            <Link href="/"><BookOpen size={30} color="#fff" /></Link>
          </motion.div>
          <h1 style={{ color: '#fff', fontSize: '2rem', marginBottom: '0.5rem', fontFamily: '"Outfit", sans-serif' }}>Welcome Back</h1>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1rem' }}>Sign in to your Daily Solace Journal account</p>
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, duration: 0.3 }}
          className="card" style={{ padding: '2.5rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(20px)' }}
        >
          {error && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 12, padding: '1rem', display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', color: 'var(--error)', fontSize: '0.9rem', alignItems: 'center' }}>
              <AlertCircle size={18} style={{ flexShrink: 0 }} /> {error}
            </motion.div>
          )}

          <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="form-group">
              <label className="form-label" style={{ color: 'var(--navy)', fontWeight: 600 }}>Email Address</label>
              <input className="form-input" type="email" placeholder="you@university.edu" value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })} required 
                style={{ padding: '0.875rem 1rem', fontSize: '1rem', borderRadius: 12, border: '1px solid var(--gray-300)', background: '#fff' }} />
            </div>

            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                <label className="form-label" style={{ color: 'var(--navy)', fontWeight: 600, margin: 0 }}>Password</label>
                <Link href="/auth/forgot-password" style={{ fontSize: '0.85rem', color: 'var(--gold)', fontWeight: 600 }}>Forgot password?</Link>
              </div>
              <div style={{ position: 'relative' }}>
                <input className="form-input" type={showPwd ? 'text' : 'password'} placeholder="••••••••" value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })} required
                  style={{ padding: '0.875rem 2.75rem 0.875rem 1rem', fontSize: '1rem', borderRadius: 12, border: '1px solid var(--gray-300)', background: '#fff', width: '100%' }} />
                <button type="button" onClick={() => setShowPwd(!showPwd)} style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--gray-400)', cursor: 'pointer', padding: 0 }}>
                  {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" className="btn btn-gold btn-lg" disabled={loading} style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem', opacity: loading ? 0.7 : 1, padding: '0.875rem', borderRadius: 12 }}>
              {loading ? <><Loader2 size={18} style={{ animation: 'spin 1s linear infinite', marginRight: '0.5rem' }} /> Signing in…</> : 'Sign In'}
            </motion.button>
          </form>

          {/* ORCID divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', margin: '2rem 0' }}>
            <div style={{ flex: 1, height: 1, background: 'var(--gray-200)' }} />
            <span style={{ fontSize: '0.75rem', color: 'var(--gray-400)', fontWeight: 600, letterSpacing: '0.05em' }}>OR CONTINUE WITH</span>
            <div style={{ flex: 1, height: 1, background: 'var(--gray-200)' }} />
          </div>
          <motion.button
            whileHover={{ scale: 1.02, background: '#f8fafc' }} whileTap={{ scale: 0.98 }}
            type="button"
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', padding: '0.875rem 1.5rem', border: '2px solid #A6CE39', borderRadius: 12, background: '#fff', cursor: 'pointer', fontSize: '1rem', fontWeight: 600, fontFamily: 'Inter,sans-serif', color: '#333', transition: 'background 0.2s' }}
            title="ORCID authentication coming soon"
            onClick={() => alert('ORCID authentication coming soon!')}
          >
            <svg width="24" height="24" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">
              <rect width="256" height="256" rx="128" fill="#A6CE39"/>
              <path d="M86.3 186.2H70.9V79.1h15.4v107.1zM108.9 79.1h41.6c39.6 0 57 28.3 57 53.6 0 27.5-21.5 53.6-56.8 53.6h-41.8V79.1zm15.4 93.3h24.5c34.9 0 42.9-26.5 42.9-39.7C191.7 111.2 178 93 148 93h-23.7v79.4zM88.7 56.8c0 5.5-4.5 9.9-9.9 9.9-5.5 0-9.9-4.4-9.9-9.9 0-5.5 4.4-9.9 9.9-9.9 5.4 0 9.9 4.4 9.9 9.9z" fill="#fff"/>
            </svg>
            Sign in with ORCID
          </motion.button>

          <p style={{ textAlign: 'center', marginTop: '2rem', color: 'var(--gray-600)', fontSize: '0.9rem' }}>
            Don&apos;t have an account?{' '}
            <Link href="/auth/register" style={{ color: 'var(--gold)', fontWeight: 600, textDecoration: 'none' }}>Create account</Link>
          </p>
        </motion.div>
      </motion.div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
