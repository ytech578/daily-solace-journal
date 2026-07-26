import axios from 'axios';
import { env } from '../config/env';
import { prisma } from '../lib/prisma';

const CROSSREF_DEPOSIT_URL = 'https://doi.crossref.org/servlet/deposit';

// ─── Build CrossRef XML deposit payload ──────────────────────────────────────

function buildDepositXml(opts: {
  doi: string;
  title: string;
  authors: { name: string }[];
  journal: { name: string; issn?: string | null; eissn?: string | null };
  volume: number;
  issue: number;
  year: number;
  pageStart?: number | null;
  pageEnd?: number | null;
  publishedAt: Date;
  depositorEmail: string;
  depositorName: string;
}) {
  const timestamp = Date.now();
  const authorXml = opts.authors
    .map((a, i) => {
      const [given = '', surname = ''] = a.name.split(' ');
      return `<person_name sequence="${i === 0 ? 'first' : 'additional'}" contributor_role="author">
        <given_name>${given}</given_name>
        <surname>${surname}</surname>
      </person_name>`;
    })
    .join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<doi_batch xmlns="http://www.crossref.org/schema/5.3.1"
           xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
           xsi:schemaLocation="http://www.crossref.org/schema/5.3.1 https://www.crossref.org/schemas/crossref5.3.1.xsd"
           version="5.3.1">
  <head>
    <doi_batch_id>batch-${timestamp}</doi_batch_id>
    <timestamp>${timestamp}</timestamp>
    <depositor>
      <depositor_name>${opts.depositorName}</depositor_name>
      <email_address>${opts.depositorEmail}</email_address>
    </depositor>
    <registrant>${opts.depositorName}</registrant>
  </head>
  <body>
    <journal>
      <journal_metadata language="en">
        <full_title>${opts.journal.name}</full_title>
        ${opts.journal.issn ? `<issn media_type="print">${opts.journal.issn}</issn>` : ''}
        ${opts.journal.eissn ? `<issn media_type="electronic">${opts.journal.eissn}</issn>` : ''}
      </journal_metadata>
      <journal_issue>
        <publication_date media_type="online">
          <year>${opts.year}</year>
        </publication_date>
        <journal_volume><volume>${opts.volume}</volume></journal_volume>
        <issue>${opts.issue}</issue>
      </journal_issue>
      <journal_article publication_type="full_text">
        <titles><title>${opts.title}</title></titles>
        <contributors>${authorXml}</contributors>
        <publication_date media_type="online">
          <year>${opts.publishedAt.getFullYear()}</year>
          <month>${String(opts.publishedAt.getMonth() + 1).padStart(2, '0')}</month>
          <day>${String(opts.publishedAt.getDate()).padStart(2, '0')}</day>
        </publication_date>
        ${opts.pageStart ? `<pages><first_page>${opts.pageStart}</first_page>${opts.pageEnd ? `<last_page>${opts.pageEnd}</last_page>` : ''}</pages>` : ''}
        <doi_data>
          <doi>${opts.doi}</doi>
          <resource>https://dailysolacejournal.com/articles/${opts.doi.split('/').pop()}</resource>
        </doi_data>
      </journal_article>
    </journal>
  </body>
</doi_batch>`;
}

// ─── Register DOI with CrossRef ───────────────────────────────────────────────

export async function registerDoi(articleId: string) {
  const article = await prisma.article.findUnique({
    where: { id: articleId },
    include: {
      submission: {
        include: {
          coAuthors: true,
          journal: true,
        },
      },
      issue: { include: { volume: true } },
    },
  });

  if (!article) throw new Error('Article not found');
  if (!article.doi) throw new Error('Article has no DOI assigned');
  if (!article.issue) throw new Error('Article must be assigned to an issue before DOI registration');

  const xml = buildDepositXml({
    doi: article.doi,
    title: article.submission.title,
    authors: article.submission.coAuthors.map((a) => ({ name: a.name })),
    journal: article.submission.journal,
    volume: article.issue.volume.number,
    issue: article.issue.number,
    year: article.issue.volume.year,
    pageStart: article.pageStart,
    pageEnd: article.pageEnd,
    publishedAt: article.publishedAt ?? new Date(),
    depositorEmail: env.CROSSREF_DEPOSITOR_EMAIL,
    depositorName: env.CROSSREF_DEPOSITOR_NAME,
  });

  const form = new FormData();
  form.append('login_id', env.CROSSREF_USER);
  form.append('login_passwd', env.CROSSREF_PASSWORD);
  form.append('fname', new Blob([xml], { type: 'application/xml' }), 'deposit.xml');

  await axios.post(CROSSREF_DEPOSIT_URL, form);

  await prisma.article.update({
    where: { id: articleId },
    data: { crossrefDepositedAt: new Date() },
  });
}

// ─── Generate a DOI string ────────────────────────────────────────────────────

export function generateDoi(journal: { doiPrefix: string }, articleId: string) {
  // e.g. "10.12345/dsj.cm1abc2def"
  return `${journal.doiPrefix}/dsj.${articleId.slice(-10)}`;
}
