'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { BookOpen, Eye, EyeOff, AlertCircle, CheckCircle, Loader2, Mail, ArrowRight, ArrowLeft } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';

const countries = ['India', 'United States', 'United Kingdom', 'Germany', 'France', 'Australia', 'Canada', 'Japan', 'China', 'Brazil', 'Other'];

const portalByRole: Record<string, string> = {
  AUTHOR: '/portal/author',
  REVIEWER: '/portal/reviewer',
  EDITOR: '/portal/editor',
  ADMIN: '/portal/admin',
};

export default function RegisterPage() {
  const router = useRouter();
  const { user, isLoading } = useAuthStore();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    firstName: '', middleName: '', lastName: '', email: '', password: '', confirmPassword: '', phone: '',
    institution: '', department: '', designation: '', country: '', state: '', city: '',
    orcid: '', scopusId: '', googleScholar: '', researchGate: '', linkedin: '', website: '',
    highestQualification: '', bio: '', researchInterests: '',
    agreeTerms: false, agreeOriginality: false
  });

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

  const upd = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }));

  const nextStep = () => {
    setError('');
    if (step === 1) {
      if (!form.firstName || !form.lastName || !form.email || !form.password || !form.confirmPassword) {
        setError('Please fill in all required fields.');
        return;
      }
      if (form.password !== form.confirmPassword) {
        setError('Passwords do not match.');
        return;
      }
      if (form.password.length < 8) {
        setError('Password must be at least 8 characters.');
        return;
      }
    } else if (step === 2) {
      if (!form.institution || !form.country) {
        setError('Please fill in required academic fields (Institution, Country).');
        return;
      }
    }
    setStep(s => s + 1);
  };

  const prevStep = () => {
    setError('');
    setStep(s => s - 1);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.agreeTerms || !form.agreeOriginality) {
      setError('You must agree to the terms and declarations to register.');
      return;
    }

    setLoading(true);
    try {
      const interestsArray = form.researchInterests.split(',').map(s => s.trim()).filter(Boolean);
      await api.post('/auth/register', { ...form, researchInterests: interestsArray });
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (isLoading || user) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg,#070f2b 0%,#0B1D51 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loader2 size={32} color="#C8972A" style={{ animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg,#070f2b 0%,#0B1D51 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ width: '100%', maxWidth: 640 }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{ width: 56, height: 56, background: 'linear-gradient(135deg,#C8972A,#e0b84a)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
            <BookOpen size={26} color="#fff" />
          </div>
          <h1 style={{ color: '#fff', fontSize: '1.75rem', marginBottom: '0.5rem' }}>Create Account</h1>
          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.9rem' }}>Join the Daily Solace Journal community</p>
        </div>

        <div className="card" style={{ padding: '2.5rem', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.3)', border: 'none' }}>
          {success ? (
            <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
              <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#f0fdf4', border: '2px solid #86efac', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
                <Mail size={32} color="#16a34a" />
              </div>
              <h2 style={{ color: 'var(--navy)', marginBottom: '0.5rem' }}>Account Created!</h2>
              <p style={{ color: 'var(--gray-600)', marginBottom: '1.25rem', lineHeight: 1.7 }}>
                A verification email has been sent to<br />
                <strong style={{ color: 'var(--navy)' }}>{form.email}</strong>.
              </p>
              <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: 10, padding: '0.875rem 1rem', marginBottom: '1.5rem', textAlign: 'left' }}>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                  <CheckCircle size={16} color="#0284c7" style={{ flexShrink: 0, marginTop: 2 }} />
                  <div style={{ fontSize: '0.8125rem', color: '#0369a1', lineHeight: 1.6 }}>
                    Please check your inbox (and spam folder) for the verification link. You must verify your email before logging in.
                  </div>
                </div>
              </div>
              <Link href="/auth/login" className="btn btn-gold" style={{ width: '100%', justifyContent: 'center' }}>
                Go to Login
              </Link>
            </div>
          ) : (
            <form onSubmit={submit}>
              {/* Progress Bar */}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', position: 'relative' }}>
                <div style={{ position: 'absolute', top: 12, left: 0, right: 0, height: 2, background: 'var(--gray-200)', zIndex: 0 }} />
                <div style={{ position: 'absolute', top: 12, left: 0, width: `${(step - 1) * 50}%`, height: 2, background: 'var(--gold)', zIndex: 0, transition: 'width 0.3s' }} />
                
                {[1, 2, 3].map(num => (
                  <div key={num} style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ width: 24, height: 24, borderRadius: '50%', background: step >= num ? 'var(--gold)' : '#fff', border: `2px solid ${step >= num ? 'var(--gold)' : 'var(--gray-300)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: step >= num ? '#fff' : 'var(--gray-500)', fontSize: '0.75rem', fontWeight: 600, transition: 'all 0.3s' }}>
                      {step > num ? <CheckCircle size={14} /> : num}
                    </div>
                    <span style={{ fontSize: '0.75rem', color: step >= num ? 'var(--navy)' : 'var(--gray-400)', fontWeight: step >= num ? 600 : 400 }}>
                      {num === 1 ? 'Account' : num === 2 ? 'Profile' : 'Verify'}
                    </span>
                  </div>
                ))}
              </div>

              {error && (
                <div style={{ background: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.3)', borderRadius: 8, padding: '0.75rem 1rem', display: 'flex', gap: '0.5rem', color: 'var(--error)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
                  <AlertCircle size={16} style={{ flexShrink: 0, marginTop: 1 }} /> {error}
                </div>
              )}

              {/* STEP 1 */}
              {step === 1 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                    <div className="form-group">
                      <label className="form-label">First Name *</label>
                      <input className="form-input" value={form.firstName} onChange={(e) => upd('firstName', e.target.value)} required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Middle Name</label>
                      <input className="form-input" value={form.middleName} onChange={(e) => upd('middleName', e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Last Name *</label>
                      <input className="form-input" value={form.lastName} onChange={(e) => upd('lastName', e.target.value)} required />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
                    <div className="form-group">
                      <label className="form-label">Email Address *</label>
                      <input className="form-input" type="email" value={form.email} onChange={(e) => upd('email', e.target.value)} required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Phone Number</label>
                      <input className="form-input" value={form.phone} onChange={(e) => upd('phone', e.target.value)} />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="form-group">
                      <label className="form-label">Password *</label>
                      <div style={{ position: 'relative' }}>
                        <input className="form-input" type={showPwd ? 'text' : 'password'} value={form.password} onChange={(e) => upd('password', e.target.value)} required minLength={8} />
                        <button type="button" onClick={() => setShowPwd(!showPwd)} style={{ position: 'absolute', right: '0.875rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--gray-400)', cursor: 'pointer' }}>
                          {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Confirm Password *</label>
                      <input className="form-input" type={showPwd ? 'text' : 'password'} value={form.confirmPassword} onChange={(e) => upd('confirmPassword', e.target.value)} required minLength={8} />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2 */}
              {step === 2 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Institution / University *</label>
                    <input className="form-input" value={form.institution} onChange={(e) => upd('institution', e.target.value)} required />
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="form-group">
                      <label className="form-label">Department</label>
                      <input className="form-input" value={form.department} onChange={(e) => upd('department', e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Designation / Title</label>
                      <input className="form-input" value={form.designation} onChange={(e) => upd('designation', e.target.value)} placeholder="e.g. Professor, PhD Candidate" />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                    <div className="form-group">
                      <label className="form-label">Country *</label>
                      <select className="form-input" value={form.country} onChange={(e) => upd('country', e.target.value)}>
                        <option value="">Select…</option>
                        {countries.map((c) => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">State/Province</label>
                      <input className="form-input" value={form.state} onChange={(e) => upd('state', e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">City</label>
                      <input className="form-input" value={form.city} onChange={(e) => upd('city', e.target.value)} />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="form-group">
                      <label className="form-label">ORCID iD</label>
                      <input className="form-input" value={form.orcid} onChange={(e) => upd('orcid', e.target.value)} placeholder="0000-0000-0000-0000" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Highest Qualification</label>
                      <input className="form-input" value={form.highestQualification} onChange={(e) => upd('highestQualification', e.target.value)} placeholder="e.g. PhD, MSc" />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Research Interests (comma separated)</label>
                    <input className="form-input" value={form.researchInterests} onChange={(e) => upd('researchInterests', e.target.value)} placeholder="Machine Learning, Robotics, Ethics" />
                  </div>
                </div>
              )}

              {/* STEP 3 */}
              {step === 3 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ background: '#f8f9fa', padding: '1.5rem', borderRadius: 8, border: '1px solid var(--gray-200)' }}>
                    <h3 style={{ fontSize: '1rem', marginBottom: '1rem', color: 'var(--navy)' }}>Agreements & Declarations</h3>
                    
                    <label style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', cursor: 'pointer', marginBottom: '1rem' }}>
                      <input type="checkbox" checked={form.agreeTerms} onChange={e => upd('agreeTerms', e.target.checked)} style={{ marginTop: '0.25rem' }} />
                      <span style={{ fontSize: '0.875rem', color: 'var(--gray-700)', lineHeight: 1.5 }}>
                        I agree to the <Link href="/terms" style={{ color: 'var(--gold)', textDecoration: 'underline' }}>Terms of Service</Link> and <Link href="/privacy" style={{ color: 'var(--gold)', textDecoration: 'underline' }}>Privacy Policy</Link> of Daily Solace Journal.
                      </span>
                    </label>

                    <label style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', cursor: 'pointer' }}>
                      <input type="checkbox" checked={form.agreeOriginality} onChange={e => upd('agreeOriginality', e.target.checked)} style={{ marginTop: '0.25rem' }} />
                      <span style={{ fontSize: '0.875rem', color: 'var(--gray-700)', lineHeight: 1.5 }}>
                        I declare that any manuscripts I submit will be my original work, not previously published, and not currently under consideration elsewhere.
                      </span>
                    </label>
                  </div>
                </div>
              )}

              {/* Navigation */}
              <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                {step > 1 && (
                  <button type="button" onClick={prevStep} className="btn btn-outline" style={{ flex: 1, justifyContent: 'center' }}>
                    <ArrowLeft size={16} /> Back
                  </button>
                )}
                {step < 3 ? (
                  <button type="button" onClick={nextStep} className="btn btn-gold" style={{ flex: 2, justifyContent: 'center' }}>
                    Next Step <ArrowRight size={16} />
                  </button>
                ) : (
                  <button type="submit" className="btn btn-gold" disabled={loading} style={{ flex: 2, justifyContent: 'center' }}>
                    {loading ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Creating Account…</> : 'Submit Registration'}
                  </button>
                )}
              </div>
            </form>
          )}

          {!success && (
            <p style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--gray-600)', fontSize: '0.875rem' }}>
              Already have an account?{' '}
              <Link href="/auth/login" style={{ color: 'var(--gold)', fontWeight: 600 }}>Sign in</Link>
            </p>
          )}
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div >
  );
}
