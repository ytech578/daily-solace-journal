'use client';

import Link from 'next/link';
import { useState } from 'react';
import { BookOpen, AlertCircle, CheckCircle, Loader2, ArrowLeft } from 'lucide-react';
import { api } from '@/lib/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg,#070f2b 0%,#0B1D51 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{ width: 56, height: 56, background: 'linear-gradient(135deg,#C8972A,#e0b84a)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
            <BookOpen size={26} color="#fff" />
          </div>
          <h1 style={{ color: '#fff', fontSize: '1.75rem', marginBottom: '0.5rem' }}>Reset Password</h1>
          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.9rem' }}>
            Enter your email and we&apos;ll send a reset link.
          </p>
        </div>

        <div className="card" style={{ padding: '2.5rem', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.3)', border: 'none' }}>
          {sent ? (
            <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
              <CheckCircle size={48} color="#22c55e" style={{ margin: '0 auto 1rem' }} />
              <h3 style={{ color: 'var(--navy)', marginBottom: '0.75rem' }}>Check Your Email</h3>
              <p style={{ color: 'var(--gray-600)', fontSize: '0.9rem', lineHeight: 1.7 }}>
                If <strong style={{ color: 'var(--gray-800)' }}>{email}</strong> is registered, you&apos;ll receive a password reset link within a few minutes.
              </p>
              <Link href="/auth/login" className="btn btn-outline" style={{ marginTop: '1.5rem', justifyContent: 'center', width: '100%' }}>
                Back to Sign In
              </Link>
            </div>
          ) : (
            <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '1.125rem' }}>
              {error && (
                <div style={{ background: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.3)', borderRadius: 8, padding: '0.75rem 1rem', display: 'flex', gap: '0.5rem', color: 'var(--error)', fontSize: '0.875rem' }}>
                  <AlertCircle size={16} style={{ flexShrink: 0, marginTop: 1 }} /> {error}
                </div>
              )}
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input className="form-input" type="email" placeholder="you@university.edu" value={email}
                  onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <button type="submit" className="btn btn-gold" disabled={loading} style={{ width: '100%', justifyContent: 'center', opacity: loading ? 0.7 : 1 }}>
                {loading ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Sending…</> : 'Send Reset Link'}
              </button>
              <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
                <Link href="/auth/login" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', color: 'var(--gray-500)', fontSize: '0.875rem' }}>
                  <ArrowLeft size={14} /> Back to Sign In
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
