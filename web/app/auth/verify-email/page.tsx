'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import Link from 'next/link';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setErrorMsg('Invalid or missing verification token.');
      return;
    }

    const verify = async () => {
      try {
        await api.post('/auth/verify-email', { token });
        setStatus('success');
      } catch (err: any) {
        setStatus('error');
        setErrorMsg(err.response?.data?.error || 'Failed to verify email.');
      }
    };
    verify();
  }, [token]);

  return (
    <div className="auth-card">
      {status === 'loading' && (
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <Loader2 size={48} color="var(--primary)" style={{ animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }} />
          <h2 style={{ fontFamily: 'Inter,sans-serif' }}>Verifying your email...</h2>
        </div>
      )}

      {status === 'success' && (
        <div style={{ textAlign: 'center', padding: '1rem' }}>
          <CheckCircle size={64} color="var(--success)" style={{ margin: '0 auto 1rem' }} />
          <h2 style={{ fontFamily: 'Inter,sans-serif', marginBottom: '0.5rem', color: 'var(--success)' }}>Email Verified!</h2>
          <p style={{ color: 'var(--gray-600)', marginBottom: '2rem' }}>Your account is now active. You can log in to access your portal.</p>
          <Link href="/auth/login" className="btn btn-primary" style={{ display: 'inline-block', width: '100%', textAlign: 'center' }}>
            Go to Login
          </Link>
        </div>
      )}

      {status === 'error' && (
        <div style={{ textAlign: 'center', padding: '1rem' }}>
          <XCircle size={64} color="var(--error)" style={{ margin: '0 auto 1rem' }} />
          <h2 style={{ fontFamily: 'Inter,sans-serif', marginBottom: '0.5rem', color: 'var(--error)' }}>Verification Failed</h2>
          <p style={{ color: 'var(--gray-600)', marginBottom: '2rem' }}>{errorMsg}</p>
          <Link href="/auth/login" className="btn btn-outline" style={{ display: 'inline-block', width: '100%', textAlign: 'center' }}>
            Back to Login
          </Link>
        </div>
      )}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#f8f8fa' }}>
      <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <Suspense fallback={<div>Loading...</div>}>
          <VerifyEmailContent />
        </Suspense>
      </main>
    </div>
  );
}
