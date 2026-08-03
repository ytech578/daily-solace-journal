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
    fullText: string;
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
      fullText: `1. Introduction
Unplanned downtime from induction motor failure imposes significant cost on manufacturing operations, particularly when a failure propagates to connected machinery before it is detected. Traditional maintenance strategies rely on either fixed-interval servicing or threshold-based vibration alarms, and both have real limits: fixed intervals waste service life on motors that are still healthy, while threshold alarms typically only trigger once a fault has already progressed substantially. This study investigates whether supervised machine learning models trained on vibration-signal features can detect developing faults earlier than conventional threshold monitoring, using only the tri-axial accelerometers already common in industrial settings rather than specialized diagnostic hardware.

2. Related Work
Prior work on motor fault diagnosis has largely split into two camps: signal-processing techniques such as envelope analysis and wavelet decomposition, and deep learning approaches applied directly to raw vibration waveforms. Deep learning methods often report high accuracy but typically require large labeled fault datasets that are impractical to collect in real operating environments, where faults are comparatively rare and maintenance teams intervene well before full failure. Feature-based classical machine learning, by contrast, can be trained on smaller labeled datasets augmented with domain-informed features, making it more practical for deployment in facilities without extensive historical fault records.

3. Methodology
Vibration data were collected from 42 induction motors (7.5-75 kW) across three manufacturing facilities using tri-axial accelerometers sampled at 10 kHz, recorded in 2-minute intervals every 6 hours over a 14-month period. Twenty-three time- and frequency-domain features were extracted per axis, including RMS, kurtosis, crest factor, and spectral energy in bearing-fault-characteristic frequency bands. Maintenance logs provided ground-truth fault labels, time-stamped to the nearest day. Four classifiers were trained and compared using stratified 5-fold cross-validation: random forest, gradient boosting, a support vector machine with an RBF kernel, and a shallow feedforward neural network with two hidden layers. Models were evaluated on lead time to detection relative to a documented fault event, and on false-positive rate against healthy-motor holdout data.

4. Results
The gradient boosting model achieved the highest fault-detection accuracy (0.94 F1-score on held-out fault events) and the longest median lead time, correctly flagging developing bearing faults a median of 11 days before conventional threshold-based alarms triggered on the same motors. Random forest performed comparably on accuracy but with a shorter median lead time of 7 days. The neural network showed higher variance across facilities, likely reflecting greater sensitivity to differences in motor mounting and baseline vibration profile between sites. False-positive rates across a 3-month healthy-motor holdout period were 4.1% for gradient boosting, compared with 9.8% for simple threshold monitoring over the same period.

5. Discussion
The extended lead time observed for tree-based ensemble methods likely reflects their ability to combine subtle, non-linear combinations of features such as a simultaneous small increase in kurtosis alongside a specific sideband frequency that individually fall below conventional alarm thresholds. The higher variance of the neural network across facilities suggests feature-based ensemble methods may generalize more robustly across different physical installations without site-specific retraining, an important practical consideration for facilities seeking to deploy one model across multiple production lines. Limitations include the relatively small number of documented fault events (31 across the study period) and reliance on maintenance-log fault timing, which may itself lag true fault onset.

6. Conclusion
Vibration-based machine learning models, particularly gradient-boosted ensembles trained on domain-informed features, can meaningfully extend the early-warning window for common induction motor faults compared to standard threshold monitoring, without requiring specialized sensing hardware. This supports a practical path toward condition-based maintenance scheduling using vibration monitoring equipment many facilities already have installed. Future work should validate these findings across a larger multi-facility fault dataset and examine how well-trained models transfer to previously unseen motor types.`,
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
      fullText: `1. Introduction
Glycemic control in type 2 diabetes is shaped by a wide range of behavioral factors beyond diet and physical activity, and sleep has increasingly drawn attention as one such factor. Short sleep duration has been linked in prior general-population research to insulin resistance and altered appetite-regulating hormones, but its relationship to glycemic control specifically within an existing type 2 diabetes population where medication regimen and disease duration already vary widely is less well characterized. This study examines that relationship directly in a clinical outpatient population.

2. Related Work
Sleep and metabolic health have been linked through several proposed mechanisms, including sympathetic nervous system activation, elevated cortisol, and disrupted leptin/ghrelin balance under sleep restriction. Most existing evidence comes from general-population cohorts rather than populations already managing diagnosed type 2 diabetes, where the relationship between sleep and glycemic control may be confounded or moderated by medication type, diabetes duration, and comorbidities not present in a general population sample.

3. Methodology
A cross-sectional survey was administered to 316 adults with a confirmed type 2 diabetes diagnosis attending outpatient endocrinology clinics across two hospital sites. Sleep duration was self-reported via a single validated item asking typical nightly sleep hours over the preceding month, and categorized as short (<6 hours), adequate (6-8 hours), or long (>8 hours). The most recent HbA1c value on record (within the prior 3 months) was extracted from clinical charts. Multivariate linear regression was used to assess the association between sleep category and HbA1c, adjusting for age, BMI, diabetes duration, and current medication regimen (metformin-only vs. combination therapy vs. insulin-inclusive).

4. Results
Mean HbA1c was 8.4% among participants reporting short sleep duration, compared with 7.1% among those reporting adequate sleep and 7.3% among those reporting long sleep. The difference between short and adequate sleep groups remained statistically significant after adjustment for age, BMI, diabetes duration, and medication regimen. No significant difference in HbA1c was observed between the adequate and long sleep groups. The association between short sleep and elevated HbA1c was somewhat stronger among participants on insulin-inclusive regimens than among those on metformin-only regimens, though this subgroup difference did not reach statistical significance given the smaller subgroup sizes.

5. Discussion
The persistence of the short-sleep association after adjusting for medication regimen and diabetes duration suggests the relationship is not simply explained by more severe or longer-standing disease driving both poorer sleep and poorer control. Reverse causality remains a plausible alternative explanation and the cross-sectional design cannot fully separate these directions. The absence of a difference between adequate and long sleep groups is consistent with a threshold effect below roughly 6 hours, rather than a purely linear dose-response relationship across the full range of sleep duration.

6. Conclusion
Short self-reported sleep duration is independently associated with poorer glycemic control in adults with type 2 diabetes, even after accounting for age, BMI, diabetes duration, and medication regimen. These findings suggest that a brief sleep assessment may be a useful and low-cost addition to routine diabetes management discussions, and that longitudinal research is warranted to clarify the direction of causality between sleep duration and glycemic control in this population.`,
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
      fullText: `1. Introduction
Running summarization models directly on a mobile device, rather than sending text to a remote server, offers clear privacy and offline-availability advantages but full-size transformer summarization models are typically too large and too slow for real-time use on mobile hardware. This work investigates whether knowledge distillation can compress a large pretrained summarization model into a form small and fast enough for on-device inference, without an unacceptable loss in summary quality.

2. Related Work
Model compression for transformers has been approached through pruning, quantization, and knowledge distillation, each with different trade-offs between compression ratio, implementation complexity, and quality retention. Distillation — training a smaller student model to mimic a larger teacher model's outputs — has shown strong results for classification tasks, but its effectiveness for generative summarization is comparatively less studied, particularly under the constraint of real mobile hardware.

3. Methodology
A pretrained sequence-to-sequence summarization model served as the teacher. A compressed student architecture with roughly one-eighth the parameter count was trained using a combination of standard sequence loss against reference summaries and a distillation loss encouraging the student's output distribution to match the teacher's. Training used three public summarization datasets spanning news articles, scientific abstracts, and forum-style text, to encourage generalization across domains. The resulting student model was compared against the full-size teacher and two existing lightweight summarization baselines on held-out test sets, measuring ROUGE-1/2/L scores for quality, and inference latency and peak memory usage measured directly on a mid-range mobile processor.

4. Results
The distilled student model retained 92.3% of the teacher model's ROUGE-L score averaged across the three test sets, while reducing on-device inference latency by 71% and peak memory usage by 68% relative to running the full teacher model on the same hardware. Compared to the two existing lightweight baselines of similar parameter count, the distilled model scored higher on all three ROUGE variants, though the gap was narrower on the scientific-abstract dataset than on the news dataset.

5. Discussion
The narrower quality gap on scientific-abstract summarization may reflect the more specialized vocabulary and denser information content of that domain, which could benefit from domain-specific distillation data beyond the general-purpose corpus used here. The consistent latency and memory improvements across all three datasets are primarily a function of the reduced architecture size rather than dataset characteristics, and should be expected to hold for other text domains not tested directly in this study.

6. Conclusion
Teacher-student distillation can produce transformer-based summarization models suitable for real-time on-device use, retaining the large majority of full-model summary quality while substantially reducing latency and memory footprint on real mobile hardware. This supports practical, privacy-preserving, offline-capable summarization as a viable mobile application.`,
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
      fullText: `1. Introduction
Urban freshwater lakes increasingly receive attention as understudied reservoirs of microplastic pollution, distinct from the marine environments where most microplastic research has historically focused. Because urban lakes are typically embedded in a mix of stormwater infrastructure, residential runoff, and varying degrees of industrial proximity, they offer a useful setting to examine which specific urban land-use factors are most strongly associated with microplastic accumulation.

2. Related Work
Marine microplastic research has established general patterns linking plastic accumulation to proximity to population centers and river outflows, but urban freshwater lakes differ meaningfully in hydrology, retention time, and pollution sources from marine coastal environments. A smaller body of freshwater-focused work has examined individual lakes or rivers, but comparative studies examining multiple urban lakes with varying, quantifiable proximity to specific discharge types remain comparatively limited.

3. Methodology
Surface water samples (n=6 per lake per sampling period) were collected from eight urban lakes across two metropolitan regions, selected to represent a range of distances from known stormwater discharge points (0-1,200 meters) and varying surrounding land use. Sampling was conducted across four periods spanning wet and dry seasons. Microplastic particles were isolated from samples via density separation followed by vacuum filtration, then visually sorted by size class and confirmed/classified by polymer type using FTIR spectroscopy.

4. Results
Lakes located within 500 meters of a stormwater discharge point showed microplastic concentrations on average 3.2 times higher than lakes with no discharge point within 1,200 meters, a difference consistent across all four sampling periods. Polyethylene and polypropylene fragments were the most common polymer types identified across all lakes, together accounting for just over 60% of classified particles. Microplastic concentration also correlated positively with surrounding impervious surface coverage (r=0.71), independent of discharge-point proximity.

5. Discussion
The independent contribution of impervious surface coverage alongside discharge-point proximity suggests two distinct pathways for microplastic entry into these lakes: concentrated point-source discharge, and more diffuse surface runoff across paved urban surfaces during rain events. This has practical implications for mitigation — interventions targeting only discharge points would likely miss a meaningful share of total microplastic input from diffuse runoff.

6. Conclusion
Both proximity to stormwater discharge points and surrounding impervious surface coverage are significant, independent predictors of microplastic accumulation in the urban freshwater lakes studied. Reducing microplastic pollution in urban lakes likely requires combining point-source interventions with broader stormwater management addressing diffuse runoff across paved surfaces.`,
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
      fullText: `1. Introduction
Small businesses in emerging markets faced acute liquidity pressure during the COVID-19 pandemic, often with limited access to formal credit or cash reserves to bridge revenue disruption. Digital financial services — mobile payments, digital credit, and related tools — expanded rapidly across several emerging markets in the years prior to the pandemic, creating a natural setting to examine whether businesses with pre-existing access to these tools fared better through the shock than businesses without such access.

2. Related Work
Existing research links financial inclusion generally to improved small-business outcomes such as investment capacity and formalization, largely studied under stable economic conditions. Less evidence exists on whether these same financial-inclusion channels provide measurable resilience specifically during an acute, widespread economic shock, when liquidity constraints bind more severely and uniformly across a broader population of businesses than in typical non-crisis periods.

3. Methodology
Panel survey data were collected from 1,240 small businesses across four emerging market economies, surveyed at three points: immediately pre-pandemic, at 12 months, and at 24 months following pandemic onset. Businesses were classified by whether they had access to digital financial services (mobile payments and/or digital credit) prior to the pandemic. Outcomes measured were business survival (still operating at 24 months) and time to recovery of pre-pandemic revenue levels. Regression models controlled for business size (employee count), sector, and pre-pandemic revenue level.

4. Results
Businesses with pre-pandemic access to digital financial services were significantly more likely to remain operational at 24 months (87% survival) compared to businesses without such access (74% survival), controlling for size, sector, and pre-pandemic revenue. Among surviving businesses, those with digital financial access recovered pre-pandemic revenue levels roughly five months faster on average. The effect on both survival and recovery speed was strongest among microenterprises, where the survival gap between businesses with and without digital financial access was widest (85% vs. 68%).

5. Discussion
The stronger effect among microenterprises is consistent with these businesses typically having the least access to formal banking relationships or cash reserves prior to the pandemic, meaning digital financial tools likely substituted for financial buffers that larger small businesses were more likely to already have through other means. The revenue-recovery speed advantage, distinct from the survival effect, suggests digital financial access may have supported ongoing operational flexibility during the recovery period itself.

6. Conclusion
Access to digital financial services was associated with meaningfully better small business survival and faster revenue recovery through the two years following pandemic onset, with the strongest effects concentrated among microenterprises. These findings support continued policy and private-sector investment in digital financial infrastructure in emerging markets as a resilience-building measure.`,
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

    const alreadySeeded = await prisma.article.findUnique({ where: { publicUrl }, include: { submission: { select: { fullText: true } } } });
    if (alreadySeeded) {
      // Update fullText if it wasn't set during the original seed
      if (!alreadySeeded.submission?.fullText) {
        const existingSub = await prisma.submission.findFirst({ where: { title: entry.article.title } });
        if (existingSub) {
          await prisma.submission.update({ where: { id: existingSub.id }, data: { fullText: entry.article.fullText } });
          console.log(`Updated fullText for: ${entry.article.title}`);
        }
      }
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
        fullText: entry.article.fullText,
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
