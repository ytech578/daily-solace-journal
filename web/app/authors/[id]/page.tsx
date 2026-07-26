'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { User, MapPin, Building2, BookOpen, Eye, Download, Calendar } from 'lucide-react';

export default function AuthorProfilePage() {
  const { id } = useParams<{ id: string }>();

  const { data: author, isLoading, error } = useQuery({
    queryKey: ['author', id],
    queryFn: async () => (await api.get(`/users/${id}`)).data,
    enabled: !!id,
  });

  if (isLoading) return <div style={{ padding: '6rem', textAlign: 'center', color: 'var(--gray-400)' }}>Loading profile…</div>;
  if (error || !author) return <div style={{ padding: '6rem', textAlign: 'center' }}><h3>Author not found</h3></div>;

  return (
    <div style={{ background: 'var(--gray-50)', minHeight: '100vh', padding: '4rem 0' }}>
      <div className="container" style={{ maxWidth: 800 }}>
        
        {/* Profile Header */}
        <div className="card" style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start', marginBottom: '2rem', borderTop: '4px solid var(--gold)' }}>
          <div style={{ width: 100, height: 100, borderRadius: '50%', background: 'var(--navy)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', fontWeight: 600, flexShrink: 0, overflow: 'hidden' }}>
            {author.profileImageUrl ? (
              <img src={author.profileImageUrl.startsWith('http') ? author.profileImageUrl : `http://localhost:4000${author.profileImageUrl}`} alt={author.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              author.name.charAt(0)
            )}
          </div>
          <div style={{ flex: 1 }}>
            <h1 style={{ margin: '0 0 0.5rem 0', color: 'var(--navy)', fontSize: '2rem' }}>{author.name}</h1>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', color: 'var(--gray-500)', fontSize: '0.9rem', marginBottom: '1rem' }}>
              {author.institution && <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}><Building2 size={16} /> {author.institution}</span>}
              {author.country && <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}><MapPin size={16} /> {author.country}</span>}
              {author.orcid && <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}><img src="https://orcid.org/assets/vectors/orcid.logo.icon.svg" width={16} alt="ORCID" /> {author.orcid}</span>}
            </div>
            {author.bio && <p style={{ color: 'var(--gray-700)', lineHeight: 1.6, margin: 0 }}>{author.bio}</p>}
          </div>
        </div>

        {/* Publications */}
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', color: 'var(--navy)' }}>
          <BookOpen size={20} /> Published Articles ({author.articles?.length || 0})
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {author.articles?.length > 0 ? author.articles.map((article: any) => (
            <div key={article.id} className="card" style={{ padding: '1.5rem' }}>
              <Link href={`/articles/${article.id}`} style={{ textDecoration: 'none' }}>
                <h4 style={{ color: 'var(--navy)', fontSize: '1.25rem', marginBottom: '0.75rem', lineHeight: 1.4 }}>
                  {article.submission.title}
                </h4>
              </Link>
              
              <div style={{ fontSize: '0.9rem', color: 'var(--gray-600)', marginBottom: '1rem' }}>
                {article.submission.author.name}
                {article.submission.coAuthors?.length > 0 && `, ${article.submission.coAuthors.map((a: any) => a.name).join(', ')}`}
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', fontSize: '0.8125rem', color: 'var(--gray-500)', borderTop: '1px solid var(--gray-100)', paddingTop: '1rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}><BookOpen size={14} /> {article.submission.journal.name}</span>
                {article.publishedAt && <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}><Calendar size={14} /> {new Date(article.publishedAt).getFullYear()}</span>}
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}><Eye size={14} /> {article.viewCount} views</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}><Download size={14} /> {article.downloadCount} downloads</span>
              </div>
            </div>
          )) : (
            <div className="card" style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--gray-500)' }}>
              No published articles found for this author.
            </div>
          )}
        </div>
        
      </div>
    </div>
  );
}
