'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, Mail, Building, Globe, BookOpen, Save, Loader2, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth.store';
import { api } from '@/lib/api';

const countries = ['India', 'United States', 'United Kingdom', 'Germany', 'France', 'Australia', 'Canada', 'Japan', 'China', 'Brazil', 'Other'];

const portalByRole: Record<string, string> = {
  AUTHOR:   '/portal/author',
  REVIEWER: '/portal/reviewer',
  EDITOR:   '/portal/editor',
  ADMIN:    '/portal/admin',
};

const roleBadgeColors: Record<string, { bg: string; color: string }> = {
  AUTHOR:   { bg: '#e8f0fe', color: '#1a56db' },
  REVIEWER: { bg: '#fef3c7', color: '#92400e' },
  EDITOR:   { bg: '#d1fae5', color: '#065f46' },
  ADMIN:    { bg: '#fee2e2', color: '#991b1b' },
};

export default function ProfilePage() {
  const router = useRouter();
  const { user, isLoading, fetchMe } = useAuthStore();
  const [form, setForm] = useState({ name: '', bio: '', institution: '', country: '', orcid: '' });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [profileData, setProfileData] = useState<any>(null);

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/auth/login');
      return;
    }
    if (user) {
      // Fetch full profile with extra fields
      api.get('/users/me').then((res) => {
        const d = res.data;
        setProfileData(d);
        setForm({
          name: d.name || '',
          bio: d.bio || '',
          institution: d.institution || '',
          country: d.country || '',
          orcid: d.orcid || '',
        });
      }).catch(() => {
        // Fallback to store user data
        setForm({ name: user.name, bio: '', institution: '', country: '', orcid: '' });
      });
    }
  }, [user, isLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setSaving(true);
    try {
      const payload: any = { name: form.name };
      if (form.bio !== undefined) payload.bio = form.bio;
      if (form.institution !== undefined) payload.institution = form.institution;
      if (form.country !== undefined) payload.country = form.country;
      if (form.orcid !== undefined) payload.orcid = form.orcid;

      await api.patch('/users/me', payload);
      await fetchMe(); // Refresh auth store so navbar updates
      setSuccess(true);
      setTimeout(() => setSuccess(false), 4000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (isLoading || !user) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loader2 size={32} color="var(--navy)" style={{ animation: 'spin 1s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const roleBadge = roleBadgeColors[user.role];
  const dashboardHref = portalByRole[user.role] ?? '/portal/author';

  return (
    <>
      <div className="page-header" style={{ paddingTop: '2.5rem', paddingBottom: '2.5rem' }}>
        <div className="container">
          <Link href={dashboardHref} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', color: 'rgba(255,255,255,0.7)', fontSize: '0.875rem', textDecoration: 'none', marginBottom: '1rem' }}>
            <ArrowLeft size={14} /> Back to Dashboard
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'linear-gradient(135deg,#C8972A,#e0b84a)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 700, color: '#fff', flexShrink: 0 }}>
              {user.name[0].toUpperCase()}
            </div>
            <div>
              <h1 style={{ color: '#fff', marginBottom: '0.25rem' }}>Edit Profile</h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                <span style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.875rem' }}>{user.email}</span>
                <span style={{
                  fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em',
                  background: roleBadge.bg, color: roleBadge.color,
                  padding: '0.2rem 0.6rem', borderRadius: 9999,
                }}>
                  {user.role}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <section style={{ background: 'var(--gray-50)', minHeight: '60vh' }}>
        <div className="container" style={{ maxWidth: 760 }}>

          {/* Success banner */}
          {success && (
            <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 10, padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', animation: 'fadeUp 0.3s ease' }}>
              <CheckCircle size={20} color="#16a34a" />
              <div>
                <div style={{ fontWeight: 600, color: '#15803d', fontSize: '0.9rem' }}>Profile updated successfully!</div>
                <div style={{ fontSize: '0.8125rem', color: '#166534' }}>Your changes have been saved.</div>
              </div>
            </div>
          )}

          {/* Error banner */}
          {error && (
            <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 10, padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <AlertCircle size={20} color="#dc2626" />
              <div style={{ fontSize: '0.875rem', color: '#dc2626' }}>{error}</div>
            </div>
          )}

          <div className="card" style={{ padding: '2rem' }}>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

              {/* Read-only account info */}
              <div style={{ background: 'var(--gray-50)', borderRadius: 10, padding: '1rem 1.25rem', border: '1px solid var(--gray-200)', marginBottom: '0.5rem' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--gray-400)', marginBottom: '0.75rem' }}>Account Information (read-only)</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)', fontWeight: 500, marginBottom: '0.25rem' }}>Email</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.9rem', color: 'var(--gray-700)' }}>
                      <Mail size={14} color="var(--gray-400)" />
                      {user.email}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)', fontWeight: 500, marginBottom: '0.25rem' }}>Role</div>
                    <span style={{
                      display: 'inline-block', fontSize: '0.75rem', fontWeight: 700,
                      textTransform: 'uppercase', letterSpacing: '0.06em',
                      background: roleBadge.bg, color: roleBadge.color,
                      padding: '0.2rem 0.6rem', borderRadius: 9999,
                    }}>
                      {user.role}
                    </span>
                  </div>
                </div>
              </div>

              {/* Editable fields */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                      <User size={14} /> Full Name *
                    </span>
                  </label>
                  <input
                    className="form-input"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Dr. Jane Smith"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                      <Globe size={14} /> Country
                    </span>
                  </label>
                  <select
                    className="form-input"
                    value={form.country}
                    onChange={(e) => setForm({ ...form, country: e.target.value })}
                    style={{ color: form.country ? 'var(--gray-800)' : 'var(--gray-400)' }}
                  >
                    <option value="">Select country…</option>
                    {countries.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                    <Building size={14} /> Institution / Affiliation
                  </span>
                </label>
                <input
                  className="form-input"
                  value={form.institution}
                  onChange={(e) => setForm({ ...form, institution: e.target.value })}
                  placeholder="University of Technology"
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                    <BookOpen size={14} /> ORCID iD
                  </span>
                </label>
                <input
                  className="form-input"
                  value={form.orcid}
                  onChange={(e) => setForm({ ...form, orcid: e.target.value })}
                  placeholder="0000-0000-0000-0000"
                />
                <span style={{ fontSize: '0.75rem', color: 'var(--gray-400)', marginTop: '0.25rem' }}>Format: 0000-0000-0000-0000</span>
              </div>

              <div className="form-group">
                <label className="form-label">Bio / Short Description</label>
                <textarea
                  className="form-input"
                  value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  placeholder="A brief description about your research interests, expertise, and work…"
                  rows={4}
                  style={{ resize: 'vertical', minHeight: 100 }}
                />
                <span style={{ fontSize: '0.75rem', color: 'var(--gray-400)', marginTop: '0.25rem' }}>{form.bio.length}/1000 characters</span>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={saving}
                  style={{ opacity: saving ? 0.75 : 1, display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                  {saving ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Saving…</> : <><Save size={16} /> Save Changes</>}
                </button>
                <Link href={dashboardHref} className="btn btn-outline">Cancel</Link>
              </div>
            </form>
          </div>
        </div>
      </section>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </>
  );
}
