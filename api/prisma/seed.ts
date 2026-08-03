import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// ─────────────────────────────────────────────────────────────────────────
// Part 1: bootstrap the first admin
// ─────────────────────────────────────────────────────────────────────────
// Solves the bootstrap problem: registration always creates an AUTHOR, so
// without this there'd be no way to ever reach an ADMIN-only endpoint on a
// fresh database. Idempotent — safe to run more than once.
async function ensureAdmin() {
  const email = process.env.ADMIN_EMAIL ?? 'admin@daily-solace.local';
  const password = process.env.ADMIN_PASSWORD ?? 'change-me-now';

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log(`Admin user already exists: ${email} (role: ${existing.role})`);
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.user.create({
    data: { name: 'Admin', email, passwordHash, role: 'ADMIN' },
  });

  console.log(`Created admin user — log in with:`);
  console.log(`  email:    ${email}`);
  console.log(`  password: ${password}`);
  console.log('There is no change-password endpoint yet — use Prisma Studio if you need to rotate it.');
}

// ─────────────────────────────────────────────────────────────────────────
// Part 2: seed 5 real-looking journals + published articles
// ─────────────────────────────────────────────────────────────────────────
// All seeded author accounts share this password, purely so you can log in
// as one of them while testing if you want to. Change it, or ignore it —
// these are demo accounts, not real people.
const DEMO_PASSWORD = 'Demo@1234';

interface SeedPerson {
  name: string;
  email: string;
  affiliation: string;
}

interface SeedEntry {
  journal: {
    name: string;
    slug: string;
    description: string;
    scope: string;
  };
  article: {
    title: string;
    keywords: string[];
    correspondingAuthor: SeedPerson;
    coAuthors: SeedPerson[];
    abstract: string;
    publishedAt: Date;
  };
}

// Every abstract below is original content written for this seed script —
// none of it reproduces a real published paper. Titles, findings, and
// numbers are fictional but written to read like real research so your
// pages don't look like obvious placeholder text.
const SEED_DATA: SeedEntry[] = [
  {
    journal: {
      name: 'Journal of Applied Engineering & Technology',
      slug: 'applied-engineering-technology',
      description:
        'Peer-reviewed research on applied engineering solutions, industrial systems, and emerging technology.',
      scope: 'Mechanical, electrical, civil, and industrial engineering; applied technology and systems design.',
    },
    article: {
      title:
        'Predictive Maintenance of Industrial Induction Motors Using Vibration-Based Machine Learning Models',
      keywords: [
        'predictive maintenance',
        'induction motors',
        'vibration analysis',
        'machine learning',
        'fault detection',
      ],
      correspondingAuthor: {
        name: 'Ravi Iyer',
        email: 'ravi.iyer@example.edu',
        affiliation: 'Department of Mechanical Engineering, Sharda Institute of Technology',
      },
      coAuthors: [
        {
          name: 'Karen Fernandes',
          email: 'karen.fernandes@example.edu',
          affiliation: 'Department of Mechanical Engineering, Sharda Institute of Technology',
        },
      ],
      abstract:
        'Objective: This study evaluates whether vibration-signal features combined with supervised machine learning can reliably predict early-stage bearing and rotor faults in industrial induction motors before failure occurs. Methods: Vibration data were collected from 42 induction motors across three manufacturing facilities using tri-axial accelerometers over a 14-month period. Time- and frequency-domain features were extracted and used to train and compare four classifiers: random forest, gradient boosting, support vector machine, and a shallow neural network. Results: The gradient boosting model achieved the highest fault-detection accuracy, correctly identifying developing bearing faults a median of 11 days before conventional threshold-based alarms triggered, with a lower false-positive rate than the other tested models. Conclusion: Vibration-based machine learning models can meaningfully extend the early-warning window for common motor faults compared to standard threshold monitoring, supporting a shift toward condition-based maintenance scheduling in industrial settings.',
      publishedAt: new Date('2026-02-14'),
    },
  },
  {
    journal: {
      name: 'Journal of Medical & Clinical Sciences',
      slug: 'medical-clinical-sciences',
      description: 'Peer-reviewed clinical and biomedical research advancing patient care and public health.',
      scope: 'Clinical medicine, public health, epidemiology, and biomedical sciences.',
    },
    article: {
      title:
        'Association Between Self-Reported Sleep Duration and Glycemic Control in Adults with Type 2 Diabetes: A Cross-Sectional Study',
      keywords: ['type 2 diabetes', 'sleep duration', 'glycemic control', 'HbA1c', 'cross-sectional study'],
      correspondingAuthor: {
        name: 'Aditi Sharma',
        email: 'aditi.sharma@example.edu',
        affiliation: 'Department of Endocrinology, Lakeview Medical College',
      },
      coAuthors: [
        {
          name: 'Priya Menon',
          email: 'priya.menon@example.edu',
          affiliation: 'Department of Public Health, Lakeview Medical College',
        },
      ],
      abstract:
        'Objective: To examine whether self-reported nightly sleep duration is associated with glycemic control, measured by HbA1c, among adults with type 2 diabetes. Methods: A cross-sectional survey and clinical record review were conducted with 316 adults with type 2 diabetes attending outpatient clinics. Sleep duration was self-reported and categorized as short (<6 hours), adequate (6-8 hours), or long (>8 hours); HbA1c values were extracted from recent clinical records. Associations were assessed using multivariate regression adjusting for age, BMI, and medication regimen. Results: Participants reporting short sleep duration had significantly higher mean HbA1c (8.4%) compared to those reporting adequate sleep (7.1%), an association that remained significant after adjustment for covariates. No significant difference was observed between adequate and long sleep groups. Conclusion: Short self-reported sleep duration is independently associated with poorer glycemic control in adults with type 2 diabetes, suggesting sleep assessment may be a useful addition to routine diabetes management discussions.',
      publishedAt: new Date('2026-03-02'),
    },
  },
  {
    journal: {
      name: 'Journal of Computer Science & Artificial Intelligence',
      slug: 'computer-science-ai',
      description: 'Peer-reviewed research in computing, machine learning, and artificial intelligence.',
      scope: 'Algorithms, machine learning, systems, and applied AI.',
    },
    article: {
      title: 'Lightweight Transformer Architectures for On-Device Text Summarization',
      keywords: [
        'transformer models',
        'model compression',
        'text summarization',
        'on-device inference',
        'natural language processing',
      ],
      correspondingAuthor: {
        name: 'Wei Chen',
        email: 'wei.chen@example.edu',
        affiliation: 'School of Computing, Meridian University',
      },
      coAuthors: [
        { name: 'Vikram Kumar', email: 'vikram.kumar@example.edu', affiliation: 'School of Computing, Meridian University' },
      ],
      abstract:
        "Objective: This work investigates whether a distilled transformer architecture can achieve competitive text summarization quality while meeting the memory and latency constraints of on-device mobile inference. Methods: A teacher-student distillation approach was applied to a pretrained sequence-to-sequence summarization model, producing a compressed student model with roughly one-eighth the parameter count. The student model was evaluated against the full-size teacher and two existing lightweight baselines on three public summarization benchmarks, measuring ROUGE scores, inference latency, and peak memory usage on a mid-range mobile processor. Results: The distilled model retained over 92% of the teacher model's ROUGE-L score while reducing inference latency by 71% and peak memory usage by 68%, outperforming both lightweight baselines on quality metrics. Conclusion: Teacher-student distillation can produce transformer summarization models suitable for real-time on-device use with limited quality loss, supporting privacy-preserving, offline-capable summarization applications.",
      publishedAt: new Date('2026-01-20'),
    },
  },
  {
    journal: {
      name: 'Journal of Environmental & Sustainability Science',
      slug: 'environmental-sustainability-science',
      description: 'Peer-reviewed research on environmental systems, sustainability, and ecological science.',
      scope: 'Environmental science, ecology, climate, and sustainability studies.',
    },
    article: {
      title: 'Microplastic Accumulation Patterns in Urban Freshwater Lakes: A Comparative Regional Study',
      keywords: [
        'microplastics',
        'freshwater ecosystems',
        'urban pollution',
        'environmental monitoring',
        'water quality',
      ],
      correspondingAuthor: {
        name: 'Sneha Nair',
        email: 'sneha.nair@example.edu',
        affiliation: 'Department of Environmental Science, Coastal Research Institute',
      },
      coAuthors: [
        {
          name: 'Devika Verma',
          email: 'devika.verma@example.edu',
          affiliation: 'Department of Environmental Science, Coastal Research Institute',
        },
      ],
      abstract:
        'Objective: To characterize and compare microplastic concentrations across urban freshwater lakes with differing proximity to industrial and residential discharge points. Methods: Surface water samples were collected from eight urban lakes across two metropolitan regions over four sampling periods. Microplastic particles were isolated via density separation and filtration, then quantified and classified by polymer type using FTIR spectroscopy. Concentrations were analyzed against distance from known discharge points and surrounding land use. Results: Lakes located within 500 meters of stormwater discharge points showed microplastic concentrations on average 3.2 times higher than lakes without nearby discharge points, with polyethylene and polypropylene fragments the most common polymer types identified. Concentrations also correlated positively with surrounding impervious surface coverage. Conclusion: Proximity to stormwater discharge and surrounding urban land use are significant predictors of microplastic accumulation in urban freshwater lakes, highlighting stormwater management as a potential intervention point for reducing microplastic pollution.',
      publishedAt: new Date('2026-04-11'),
    },
  },
  {
    journal: {
      name: 'Journal of Economics, Business & Finance',
      slug: 'economics-business-finance',
      description: 'Peer-reviewed research in economics, finance, and business management.',
      scope: 'Micro/macroeconomics, finance, business strategy, and development economics.',
    },
    article: {
      title:
        'Financial Inclusion and Small Business Resilience: Evidence from Post-Pandemic Recovery in Emerging Markets',
      keywords: [
        'financial inclusion',
        'small business resilience',
        'emerging markets',
        'digital finance',
        'economic recovery',
      ],
      correspondingAuthor: {
        name: 'Rohan Gupta',
        email: 'rohan.gupta@example.edu',
        affiliation: 'Department of Economics, Ashford School of Business',
      },
      coAuthors: [
        {
          name: 'Chidi Okafor',
          email: 'chidi.okafor@example.edu',
          affiliation: 'Department of Economics, Ashford School of Business',
        },
      ],
      abstract:
        'Objective: This study examines whether access to digital financial services was associated with small business survival and recovery in the two years following the COVID-19 pandemic in emerging market economies. Methods: Panel survey data from 1,240 small businesses across four emerging market economies were analyzed, comparing survival and revenue-recovery outcomes between businesses with and without access to digital financial services such as mobile payments and digital credit. Regression models controlled for business size, sector, and pre-pandemic revenue. Results: Businesses with access to digital financial services were significantly more likely to remain operational two years post-onset of the pandemic and recovered pre-pandemic revenue levels roughly five months faster on average than businesses without such access. Effects were strongest among microenterprises. Conclusion: Digital financial inclusion appears to meaningfully strengthen small business resilience during economic shocks, supporting continued policy investment in digital financial infrastructure in emerging markets.',
      publishedAt: new Date('2026-05-06'),
    },
  },
];

function slugify(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

async function seedJournalsAndArticles() {
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 12);

  for (const entry of SEED_DATA) {
    const publicUrl = slugify(entry.article.title);

    const alreadySeeded = await prisma.article.findUnique({ where: { publicUrl } });
    if (alreadySeeded) {
      console.log(`Skipping (already seeded): ${entry.article.title}`);
      continue;
    }

    const journal = await prisma.journal.upsert({
      where: { slug: entry.journal.slug },
      update: { isActive: true, isIndexed: true },
      create: { ...entry.journal, isActive: true, isIndexed: true },
    });

    const correspondingUser = await prisma.user.upsert({
      where: { email: entry.article.correspondingAuthor.email },
      update: {},
      create: {
        name: entry.article.correspondingAuthor.name,
        email: entry.article.correspondingAuthor.email,
        passwordHash,
        role: 'AUTHOR',
      },
    });

    const submission = await prisma.submission.create({
      data: {
        journalId: journal.id,
        authorId: correspondingUser.id,
        title: entry.article.title,
        abstract: entry.article.abstract,
        keywords: entry.article.keywords,
        status: 'PUBLISHED',
        submittedAt: entry.article.publishedAt,
        coAuthors: {
          create: [
            {
              name: entry.article.correspondingAuthor.name,
              email: entry.article.correspondingAuthor.email,
              institution: entry.article.correspondingAuthor.affiliation,
              userId: correspondingUser.id,
              order: 1,
            },
            ...entry.article.coAuthors.map((coAuthor, index) => ({
              name: coAuthor.name,
              email: coAuthor.email,
              institution: coAuthor.affiliation,
              order: index + 2,
            })),
          ],
        },
      },
    });

    await prisma.article.create({
      data: {
        submissionId: submission.id,
        journalId: journal.id,
        title: entry.article.title,
        abstract: entry.article.abstract,
        publicUrl,
        publishedAt: entry.article.publishedAt,
      },
    });

    console.log(`Seeded: ${entry.article.title}`);
  }
}

async function main() {
  await ensureAdmin();
  await seedJournalsAndArticles();
}

main()
  .catch((err) => {
    console.error('Seed failed:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
