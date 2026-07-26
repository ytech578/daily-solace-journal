import type { Metadata, ResolvingMetadata } from 'next';
import React from 'react';

export async function generateMetadata(
  { params }: { params: { id: string } },
  parent: ResolvingMetadata
): Promise<Metadata> {
  try {
    const id = await Promise.resolve(params.id);
    const res = await fetch(`http://localhost:4000/api/articles/${id}`, { next: { revalidate: 60 } });
    
    if (!res.ok) {
      return { title: 'Article Details - Daily Solace Journal' };
    }
    
    const article = await res.json();
    const sub = article.submission;
    const authors = [sub.author, ...(sub.coAuthors ?? [])];
    
    const scholarMeta: Record<string, string | string[]> = {
      'citation_title': sub.title,
      'citation_journal_title': sub.journal?.name || 'Daily Solace Journal',
      'citation_publication_date': article.publishedAt ? new Date(article.publishedAt).getFullYear().toString() : '',
      'citation_pdf_url': `http://localhost:3000/api/articles/${article.id}/download`,
      'citation_author': authors.map((a: any) => a.name),
    };

    if (article.doi) {
      scholarMeta['citation_doi'] = article.doi;
    }
    if (article.issue?.volume?.number) {
      scholarMeta['citation_volume'] = article.issue.volume.number.toString();
    }
    if (article.issue?.number) {
      scholarMeta['citation_issue'] = article.issue.number.toString();
    }
    if (article.pageStart) {
      scholarMeta['citation_firstpage'] = article.pageStart.toString();
      scholarMeta['citation_lastpage'] = article.pageEnd.toString();
    }

    return {
      title: `${sub.title} - ${sub.journal?.name || 'Daily Solace Journal'}`,
      description: sub.abstract.substring(0, 160) + '...',
      other: scholarMeta as any,
    };
  } catch (error) {
    return { title: 'Article Details - Daily Solace Journal' };
  }
}

export default function ArticleLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
