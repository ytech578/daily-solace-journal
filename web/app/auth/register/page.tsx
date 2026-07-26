'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { BookOpen, Eye, EyeOff, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';

const countries = ['India', 'United States', 'United Kingdom', 'Germany', 'France', 'Australia', 'Canada', 'Japan', 'China', 'Brazil', 'Other'];

const portalByRole: Record<string, string> = {
  AUTHOR:   '/portal/author',
  REVIEWER: '/portal/reviewer',
  EDITOR:   '/portal/editor',
  ADMIN:    '/portal/admin',
};

export default function RegisterPage() {
  const router = useRouter();
  const { user, isLoading } = useAuthStore();
  const [form, setForm] = useState({ name: '', email: '', password: '', institution: '', country: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  // If user is already logged in, redirect them to their dashboard
  useEffect(() => {
    if (!isLoading && user) {
      router.replace(portalByRole[user.role] ?? '/portal/author');
    }
  }, [user, isLoading, router]);

  const upd = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 8) { setError('Password must be at least 8 characters'); return; }
    setLoading(true);
    try {
      await api.post('/auth/register', form);
      setSuccess(true);
      setTimeout(() => router.push('/auth/login'), 2500);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
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
      <div style={{ width: '100%', maxWidth: 500 }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{ width: 56, height: 56, background: 'linear-gradient(135deg,#C8972A,#e0b84a)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
            <BookOpen size={26} color="#fff" />
          </div>
          <h1 style={{ color: '#fff', fontSize: '1.75rem', marginBottom: '0.5rem' }}>Create Account</h1>
          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.9rem' }}>Join the Daily Solace Journal community</p>
        </div>

        <div className="card" style={{ padding: '2.5rem', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.3)', border: 'none' }}>
          {success ? (
            <div style={{ textAlign: 'center', padding: '2rem 0' }}>
              <CheckCircle size={48} color="#22c55e" style={{ margin: '0 auto 1rem' }} />
              <h3 style={{ color: 'var(--navy)', marginBottom: '0.5rem' }}>Account Created!</h3>
              <p style={{ color: 'var(--gray-500)' }}>Redirecting you to sign in…</p>
            </div>
          ) : (
            <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {error && (
                <div style={{ background: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.3)', borderRadius: 8, padding: '0.75rem 1rem', display: 'flex', gap: '0.5rem', color: 'var(--error)', fontSize: '0.875rem' }}>
                  <AlertCircle size={16} style={{ flexShrink: 0, marginTop: 1 }} /> {error}
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input className="form-input" value={form.name} onChange={(e) => upd('name', e.target.value)} placeholder="Dr. Jane Smith" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Country</label>
                  <select className="form-input" value={form.country} onChange={(e) => upd('country', e.target.value)}
                    style={{ color: form.country ? 'var(--gray-800)' : 'var(--gray-400)' }}>
                    <option value="">Select…</option>
                    {countries.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Email Address *</label>
                <input className="form-input" type="email" value={form.email} onChange={(e) => upd('email', e.target.value)} placeholder="you@university.edu" required />
              </div>

              <div className="form-group">
                <label className="form-label">Institution / Affiliation</label>
                <input className="form-input" value={form.institution} onChange={(e) => upd('institution', e.target.value)} placeholder="University of Technology" />
              </div>

              <div className="form-group">
                <label className="form-label">Password *</label>
                <div style={{ position: 'relative' }}>
                  <input className="form-input" type={showPwd ? 'text' : 'password'} value={form.password} onChange={(e) => upd('password', e.target.value)}
                    placeholder="Min. 8 characters" required style={{ paddingRight: '2.75rem' }} />
                  <button type="button" onClick={() => setShowPwd(!showPwd)} style={{ position: 'absolute', right: '0.875rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--gray-400)', cursor: 'pointer' }}>
                    {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button type="submit" className="btn btn-gold" disabled={loading} style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem', opacity: loading ? 0.7 : 1 }}>
                {loading ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Creating Account…</> : 'Create Account'}
              </button>

              <p style={{ textAlign: 'center', marginTop: '0.5rem', fontSize: '0.8125rem', color: 'var(--gray-500)' }}>
                By registering, you agree to our <Link href="/terms" style={{ color: 'var(--gold)', textDecoration: 'underline' }}>Terms</Link> and <Link href="/privacy" style={{ color: 'var(--gold)', textDecoration: 'underline' }}>Privacy Policy</Link>.
              </p>
            </form>
          )}

          <p style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--gray-600)', fontSize: '0.875rem' }}>
            Already have an account?{' '}
            <Link href="/auth/login" style={{ color: 'var(--gold)', fontWeight: 600 }}>Sign in</Link>
          </p>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
