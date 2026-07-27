'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import Link from 'next/link';

function AcceptInvitationContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const router = useRouter();
  const { fetchMe } = useAuthStore();
  
  const [form, setForm] = useState({ password: '', confirmPassword: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  if (!token) {
    return (
      <div className="auth-card" style={{ textAlign: 'center', padding: '2rem' }}>
        <AlertCircle size={48} color="var(--error)" style={{ margin: '0 auto 1rem' }} />
        <h2 style={{ fontFamily: 'Inter,sans-serif', color: 'var(--error)' }}>Invalid Link</h2>
        <p style={{ color: 'var(--gray-600)', marginBottom: '2rem' }}>This invitation link is missing or invalid.</p>
        <Link href="/auth/login" className="btn btn-outline">Back to Login</Link>
      </div>
    );
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      setError("Passwords don't match");
      return;
    }
    if (form.password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setError('');
    setLoading(true);
    try {
      await api.post('/auth/accept-invitation', { token, password: form.password, confirmPassword: form.confirmPassword });
      await fetchMe();
      setSuccess(true);
      setTimeout(() => {
        router.push('/auth/login');
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to accept invitation. Link may be expired.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="auth-card" style={{ textAlign: 'center', padding: '2rem' }}>
        <CheckCircle size={64} color="var(--success)" style={{ margin: '0 auto 1rem' }} />
        <h2 style={{ fontFamily: 'Inter,sans-serif', marginBottom: '0.5rem', color: 'var(--success)' }}>Account Setup Complete!</h2>
        <p style={{ color: 'var(--gray-600)', marginBottom: '2rem' }}>Your account is active. Redirecting you...</p>
      </div>
    );
  }

  return (
    <div className="auth-card">
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontFamily: 'Inter,sans-serif', fontSize: '1.75rem', fontWeight: 700, color: 'var(--navy)', marginBottom: '0.5rem' }}>
          Set Your Password
        </h1>
        <p style={{ color: 'var(--gray-500)', fontSize: '0.95rem' }}>
          Please set a password to activate your account.
        </p>
      </div>

      {error && (
        <div style={{ background: '#fef2f2', color: '#dc2626', padding: '0.75rem', borderRadius: 8, fontSize: '0.875rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <AlertCircle size={16} /> {error}
        </div>
      )}

      <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div className="form-group">
          <label className="form-label">New Password</label>
          <div style={{ position: 'relative' }}>
            <input
              type={showPwd ? 'text' : 'password'}
              className="form-input"
              value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              placeholder="••••••••"
              required
              minLength={8}
            />
            <button
              type="button"
              onClick={() => setShowPwd(!showPwd)}
              style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gray-400)' }}
            >
              {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Confirm Password</label>
          <input
            type={showPwd ? 'text' : 'password'}
            className="form-input"
            value={form.confirmPassword}
            onChange={e => setForm(f => ({ ...f, confirmPassword: e.target.value }))}
            placeholder="••••••••"
            required
          />
        </div>

        <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem', padding: '0.875rem' }} disabled={loading}>
          {loading ? <><Loader2 size={18} style={{ animation: 'spin 1s linear infinite', marginRight: 8, display: 'inline' }} /> Saving...</> : 'Set Password & Activate'}
        </button>
      </form>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export default function AcceptInvitationPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#f8f8fa' }}>
      <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <Suspense fallback={<div>Loading...</div>}>
          <AcceptInvitationContent />
        </Suspense>
      </main>
    </div>
  );
}
