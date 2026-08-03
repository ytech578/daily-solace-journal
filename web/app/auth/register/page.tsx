'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { BookOpen, Eye, EyeOff, AlertCircle, CheckCircle, Loader2, Mail, ArrowRight, ArrowLeft } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import { motion, AnimatePresence } from 'framer-motion';

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
    // Step 3 is optional links, so no strict validation
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
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, var(--navy-dark) 0%, var(--navy) 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loader2 size={40} color="var(--gold)" style={{ animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  const slideVariants: any = {
    initial: (direction: number) => ({ x: direction > 0 ? 50 : -50, opacity: 0 }),
    animate: { x: 0, opacity: 1, transition: { type: 'spring', stiffness: 300, damping: 30 } },
    exit: (direction: number) => ({ x: direction < 0 ? 50 : -50, opacity: 0, transition: { duration: 0.2 } })
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, var(--navy-dark) 0%, var(--navy) 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', position: 'relative', overflow: 'hidden' }}>
      
      {/* Decorative Background Elements */}
      <motion.div 
        animate={{ scale: [1, 1.1, 1], rotate: [0, 5, 0] }} 
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        style={{ position: 'absolute', top: '-10%', left: '-5%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(200,151,42,0.12), transparent 70%)', pointerEvents: 'none' }} 
      />
      <motion.div 
        animate={{ scale: [1, 1.15, 1], y: [0, -30, 0] }} 
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        style={{ position: 'absolute', bottom: '-15%', right: '-5%', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(59,130,246,0.1), transparent 70%)', pointerEvents: 'none' }} 
      />

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        style={{ width: '100%', maxWidth: 700, position: 'relative', zIndex: 10 }}
      >
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <motion.div whileHover={{ scale: 1.05 }} style={{ width: 64, height: 64, background: 'linear-gradient(135deg, var(--gold), var(--gold-light))', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem', boxShadow: '0 10px 25px rgba(200,151,42,0.3)' }}>
            <Link href="/"><BookOpen size={30} color="#fff" /></Link>
          </motion.div>
          <h1 style={{ color: '#fff', fontSize: '2rem', marginBottom: '0.5rem', fontFamily: '"Outfit", sans-serif' }}>Create Account</h1>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1rem' }}>Join the Daily Solace Journal community</p>
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, duration: 0.3 }}
          className="card" style={{ padding: '2.5rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(20px)' }}
        >
          {success ? (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} style={{ textAlign: 'center', padding: '1.5rem 0' }}>
              <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#f0fdf4', border: '3px solid #86efac', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', boxShadow: '0 10px 25px rgba(22, 163, 74, 0.2)' }}>
                <Mail size={36} color="#16a34a" />
              </div>
              <h2 style={{ color: 'var(--navy)', marginBottom: '0.75rem', fontSize: '1.75rem' }}>Account Created!</h2>
              <p style={{ color: 'var(--gray-600)', marginBottom: '1.5rem', lineHeight: 1.7, fontSize: '1.05rem' }}>
                A verification email has been sent to<br />
                <strong style={{ color: 'var(--navy)' }}>{form.email}</strong>.
              </p>
              <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: 12, padding: '1rem 1.25rem', marginBottom: '2rem', textAlign: 'left' }}>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                  <CheckCircle size={20} color="#0284c7" style={{ flexShrink: 0, marginTop: 2 }} />
                  <div style={{ fontSize: '0.9rem', color: '#0369a1', lineHeight: 1.6 }}>
                    Please check your inbox (and spam folder) for the verification link. You must verify your email before logging in.
                  </div>
                </div>
              </div>
              <Link href="/auth/login" className="btn btn-gold btn-lg" style={{ width: '100%', justifyContent: 'center' }}>
                Go to Login
              </Link>
            </motion.div>
          ) : (
            <form onSubmit={submit}>
              {/* Progress Bar */}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2.5rem', position: 'relative', padding: '0 1rem' }}>
                <div style={{ position: 'absolute', top: 16, left: 24, right: 24, height: 3, background: 'var(--gray-200)', zIndex: 0, borderRadius: 3 }} />
                <div style={{ position: 'absolute', top: 16, left: 24, width: `calc(${(step - 1) * 33.33}% - 12px)`, height: 3, background: 'var(--gold)', zIndex: 0, transition: 'width 0.4s ease', borderRadius: 3 }} />
                
                {[1, 2, 3, 4].map(num => (
                  <div key={num} style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                    <motion.div 
                      animate={step >= num ? { scale: [1, 1.1, 1] } : {}}
                      style={{ width: 32, height: 32, borderRadius: '50%', background: step >= num ? 'var(--gold)' : '#fff', border: `3px solid ${step >= num ? 'var(--gold)' : 'var(--gray-300)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: step >= num ? '#fff' : 'var(--gray-500)', fontSize: '0.85rem', fontWeight: 700, transition: 'all 0.3s ease', boxShadow: step >= num ? '0 4px 10px rgba(200,151,42,0.3)' : 'none' }}
                    >
                      {step > num ? <CheckCircle size={16} /> : num}
                    </motion.div>
                    <span style={{ fontSize: '0.8rem', color: step >= num ? 'var(--navy)' : 'var(--gray-400)', fontWeight: step >= num ? 700 : 500 }}>
                      {num === 1 ? 'Account' : num === 2 ? 'Academic' : num === 3 ? 'Profiles' : 'Verify'}
                    </span>
                  </div>
                ))}
              </div>

              <AnimatePresence mode="wait">
                {error && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 12, padding: '1rem', display: 'flex', gap: '0.75rem', color: 'var(--error)', fontSize: '0.9rem', marginBottom: '1.5rem', alignItems: 'center' }}>
                    <AlertCircle size={18} style={{ flexShrink: 0 }} /> {error}
                  </motion.div>
                )}
              </AnimatePresence>

              <div style={{ position: 'relative', minHeight: 300 }}>
                <AnimatePresence mode="wait" custom={1}>
                  {/* STEP 1 */}
                  {step === 1 && (
                    <motion.div key="step1" custom={1} variants={slideVariants} initial="initial" animate="animate" exit="exit" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.25rem' }}>
                        <div className="form-group">
                          <label className="form-label" style={{ fontWeight: 600 }}>First Name *</label>
                          <input className="form-input" style={{ borderRadius: 10 }} value={form.firstName} onChange={(e) => upd('firstName', e.target.value)} required />
                        </div>
                        <div className="form-group">
                          <label className="form-label" style={{ fontWeight: 600 }}>Middle Name</label>
                          <input className="form-input" style={{ borderRadius: 10 }} value={form.middleName} onChange={(e) => upd('middleName', e.target.value)} />
                        </div>
                        <div className="form-group">
                          <label className="form-label" style={{ fontWeight: 600 }}>Last Name *</label>
                          <input className="form-input" style={{ borderRadius: 10 }} value={form.lastName} onChange={(e) => upd('lastName', e.target.value)} required />
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
                        <div className="form-group">
                          <label className="form-label" style={{ fontWeight: 600 }}>Email Address *</label>
                          <input className="form-input" style={{ borderRadius: 10 }} type="email" value={form.email} onChange={(e) => upd('email', e.target.value)} required />
                        </div>
                        <div className="form-group">
                          <label className="form-label" style={{ fontWeight: 600 }}>Phone Number</label>
                          <input className="form-input" style={{ borderRadius: 10 }} value={form.phone} onChange={(e) => upd('phone', e.target.value)} />
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
                        <div className="form-group">
                          <label className="form-label" style={{ fontWeight: 600 }}>Password *</label>
                          <div style={{ position: 'relative' }}>
                            <input className="form-input" style={{ borderRadius: 10, paddingRight: '2.5rem' }} type={showPwd ? 'text' : 'password'} value={form.password} onChange={(e) => upd('password', e.target.value)} required minLength={8} />
                            <button type="button" onClick={() => setShowPwd(!showPwd)} style={{ position: 'absolute', right: '0.875rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--gray-400)', cursor: 'pointer', padding: 0 }}>
                              {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                          </div>
                        </div>
                        <div className="form-group">
                          <label className="form-label" style={{ fontWeight: 600 }}>Confirm Password *</label>
                          <input className="form-input" style={{ borderRadius: 10 }} type={showPwd ? 'text' : 'password'} value={form.confirmPassword} onChange={(e) => upd('confirmPassword', e.target.value)} required minLength={8} />
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* STEP 2 */}
                  {step === 2 && (
                    <motion.div key="step2" custom={1} variants={slideVariants} initial="initial" animate="animate" exit="exit" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                      <div className="form-group">
                        <label className="form-label" style={{ fontWeight: 600 }}>Institution / University *</label>
                        <input className="form-input" style={{ borderRadius: 10 }} value={form.institution} onChange={(e) => upd('institution', e.target.value)} required />
                      </div>
                      
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
                        <div className="form-group">
                          <label className="form-label" style={{ fontWeight: 600 }}>Department</label>
                          <input className="form-input" style={{ borderRadius: 10 }} value={form.department} onChange={(e) => upd('department', e.target.value)} />
                        </div>
                        <div className="form-group">
                          <label className="form-label" style={{ fontWeight: 600 }}>Designation / Title</label>
                          <input className="form-input" style={{ borderRadius: 10 }} value={form.designation} onChange={(e) => upd('designation', e.target.value)} placeholder="e.g. Professor, PhD Candidate" />
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.25rem' }}>
                        <div className="form-group">
                          <label className="form-label" style={{ fontWeight: 600 }}>Country *</label>
                          <select className="form-input" style={{ borderRadius: 10 }} value={form.country} onChange={(e) => upd('country', e.target.value)}>
                            <option value="">Select…</option>
                            {countries.map((c) => <option key={c} value={c}>{c}</option>)}
                          </select>
                        </div>
                        <div className="form-group">
                          <label className="form-label" style={{ fontWeight: 600 }}>State/Province</label>
                          <input className="form-input" style={{ borderRadius: 10 }} value={form.state} onChange={(e) => upd('state', e.target.value)} />
                        </div>
                        <div className="form-group">
                          <label className="form-label" style={{ fontWeight: 600 }}>City</label>
                          <input className="form-input" style={{ borderRadius: 10 }} value={form.city} onChange={(e) => upd('city', e.target.value)} />
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
                        <div className="form-group">
                          <label className="form-label" style={{ fontWeight: 600 }}>Highest Qualification</label>
                          <input className="form-input" style={{ borderRadius: 10 }} value={form.highestQualification} onChange={(e) => upd('highestQualification', e.target.value)} placeholder="e.g. PhD, MSc" />
                        </div>
                        <div className="form-group">
                          <label className="form-label" style={{ fontWeight: 600 }}>Research Interests (comma separated)</label>
                          <input className="form-input" style={{ borderRadius: 10 }} value={form.researchInterests} onChange={(e) => upd('researchInterests', e.target.value)} placeholder="Machine Learning, Robotics" />
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* STEP 3 - Links and Bios */}
                  {step === 3 && (
                    <motion.div key="step3" custom={1} variants={slideVariants} initial="initial" animate="animate" exit="exit" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                      <div className="form-group">
                        <label className="form-label" style={{ fontWeight: 600 }}>Bio / Short Summary</label>
                        <textarea className="form-input" style={{ borderRadius: 10, minHeight: 80, resize: 'vertical' }} value={form.bio} onChange={(e) => upd('bio', e.target.value)} placeholder="A brief description of your research and background..." />
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
                        <div className="form-group">
                          <label className="form-label" style={{ fontWeight: 600 }}>ORCID iD</label>
                          <input className="form-input" style={{ borderRadius: 10 }} value={form.orcid} onChange={(e) => upd('orcid', e.target.value)} placeholder="0000-0000-0000-0000" />
                        </div>
                        <div className="form-group">
                          <label className="form-label" style={{ fontWeight: 600 }}>Scopus ID</label>
                          <input className="form-input" style={{ borderRadius: 10 }} value={form.scopusId} onChange={(e) => upd('scopusId', e.target.value)} placeholder="" />
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
                        <div className="form-group">
                          <label className="form-label" style={{ fontWeight: 600 }}>Google Scholar Link</label>
                          <input className="form-input" style={{ borderRadius: 10 }} value={form.googleScholar} onChange={(e) => upd('googleScholar', e.target.value)} placeholder="https://scholar.google.com/..." />
                        </div>
                        <div className="form-group">
                          <label className="form-label" style={{ fontWeight: 600 }}>ResearchGate Link</label>
                          <input className="form-input" style={{ borderRadius: 10 }} value={form.researchGate} onChange={(e) => upd('researchGate', e.target.value)} placeholder="https://researchgate.net/..." />
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
                        <div className="form-group">
                          <label className="form-label" style={{ fontWeight: 600 }}>LinkedIn Profile</label>
                          <input className="form-input" style={{ borderRadius: 10 }} value={form.linkedin} onChange={(e) => upd('linkedin', e.target.value)} placeholder="https://linkedin.com/in/..." />
                        </div>
                        <div className="form-group">
                          <label className="form-label" style={{ fontWeight: 600 }}>Personal Website</label>
                          <input className="form-input" style={{ borderRadius: 10 }} value={form.website} onChange={(e) => upd('website', e.target.value)} placeholder="https://..." />
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* STEP 4 */}
                  {step === 4 && (
                    <motion.div key="step4" custom={1} variants={slideVariants} initial="initial" animate="animate" exit="exit" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                      <div style={{ background: '#f8f9fa', padding: '2rem', borderRadius: 12, border: '1px solid var(--gray-200)', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)' }}>
                        <h3 style={{ fontSize: '1.15rem', marginBottom: '1.5rem', color: 'var(--navy)' }}>Agreements & Declarations</h3>
                        
                        <label style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', cursor: 'pointer', marginBottom: '1.25rem', padding: '0.75rem', borderRadius: 8, transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = '#fff'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                          <input type="checkbox" checked={form.agreeTerms} onChange={e => upd('agreeTerms', e.target.checked)} style={{ marginTop: '0.25rem', width: 18, height: 18, accentColor: 'var(--gold)' }} />
                          <span style={{ fontSize: '0.95rem', color: 'var(--gray-700)', lineHeight: 1.6 }}>
                            I agree to the <Link href="/terms" style={{ color: 'var(--gold)', textDecoration: 'none', fontWeight: 600 }}>Terms of Service</Link> and <Link href="/privacy" style={{ color: 'var(--gold)', textDecoration: 'none', fontWeight: 600 }}>Privacy Policy</Link> of Daily Solace Journal.
                          </span>
                        </label>

                        <label style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', cursor: 'pointer', padding: '0.75rem', borderRadius: 8, transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = '#fff'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                          <input type="checkbox" checked={form.agreeOriginality} onChange={e => upd('agreeOriginality', e.target.checked)} style={{ marginTop: '0.25rem', width: 18, height: 18, accentColor: 'var(--gold)' }} />
                          <span style={{ fontSize: '0.95rem', color: 'var(--gray-700)', lineHeight: 1.6 }}>
                            I declare that any manuscripts I submit will be my original work, not previously published, and not currently under consideration elsewhere.
                          </span>
                        </label>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Navigation */}
              <div style={{ display: 'flex', gap: '1rem', marginTop: '2.5rem' }}>
                {step > 1 && (
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="button" onClick={prevStep} className="btn btn-outline btn-lg" style={{ flex: 1, justifyContent: 'center', borderRadius: 12 }}>
                    <ArrowLeft size={18} /> Back
                  </motion.button>
                )}
                {step < 4 ? (
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="button" onClick={nextStep} className="btn btn-gold btn-lg" style={{ flex: 2, justifyContent: 'center', borderRadius: 12 }}>
                    Next Step <ArrowRight size={18} />
                  </motion.button>
                ) : (
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" className="btn btn-gold btn-lg" disabled={loading} style={{ flex: 2, justifyContent: 'center', borderRadius: 12, opacity: loading ? 0.7 : 1 }}>
                    {loading ? <><Loader2 size={18} style={{ animation: 'spin 1s linear infinite', marginRight: '0.5rem' }} /> Creating Account…</> : 'Submit Registration'}
                  </motion.button>
                )}
              </div>
            </form>
          )}

          {!success && (
            <p style={{ textAlign: 'center', marginTop: '2rem', color: 'var(--gray-600)', fontSize: '0.9rem' }}>
              Already have an account?{' '}
              <Link href="/auth/login" style={{ color: 'var(--gold)', fontWeight: 600, textDecoration: 'none' }}>Sign in</Link>
            </p>
          )}
        </motion.div>
      </motion.div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div >
  );
}
