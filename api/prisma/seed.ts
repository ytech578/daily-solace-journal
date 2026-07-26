import { PrismaClient, Role, SubmissionStatus, FileType } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding Daily Solace Journal database...\n');

  // ─── Clean existing data ─────────────────────────────────────────────────
  await prisma.notification.deleteMany();
  await prisma.review.deleteMany();
  await prisma.reviewAssignment.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.submissionEvent.deleteMany();
  await prisma.submissionFile.deleteMany();
  await prisma.submissionAuthor.deleteMany();
  await prisma.article.deleteMany();
  await prisma.submission.deleteMany();
  await prisma.issue.deleteMany();
  await prisma.volume.deleteMany();
  await prisma.editorialBoardMember.deleteMany();
  await prisma.journalSubject.deleteMany();
  await prisma.journal.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.passwordResetToken.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.user.deleteMany();

  // ─── Users ────────────────────────────────────────────────────────────────
  const passwordHash = await bcrypt.hash('password123', 10);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@dailysolace.org',
      passwordHash,
      name: 'Prof. Rajesh Kumar',
      role: 'ADMIN',
      institution: 'Indian Institute of Technology, Delhi',
      country: 'India',
      bio: 'Professor of Computer Science with 20+ years of experience in academic publishing and research administration.',
      orcid: '0000-0001-2345-6789',
    },
  });

  const editor = await prisma.user.create({
    data: {
      email: 'editor@dailysolace.org',
      passwordHash,
      name: 'Dr. Ananya Sharma',
      role: 'EDITOR',
      institution: 'National Institute of Technology, Trichy',
      country: 'India',
      bio: 'Managing Editor with expertise in multidisciplinary research evaluation and editorial workflow management.',
      orcid: '0000-0002-3456-7890',
    },
  });

  const reviewer1 = await prisma.user.create({
    data: {
      email: 'reviewer1@dailysolace.org',
      passwordHash,
      name: 'Dr. Michael Chen',
      role: 'REVIEWER',
      institution: 'Massachusetts Institute of Technology',
      country: 'United States',
      bio: 'Associate Professor specializing in artificial intelligence and machine learning applications in healthcare.',
      orcid: '0000-0003-4567-8901',
    },
  });

  const reviewer2 = await prisma.user.create({
    data: {
      email: 'reviewer2@dailysolace.org',
      passwordHash,
      name: 'Dr. Sarah Williams',
      role: 'REVIEWER',
      institution: 'University of Oxford',
      country: 'United Kingdom',
      bio: 'Senior Researcher in environmental science and sustainability policy.',
      orcid: '0000-0004-5678-9012',
    },
  });

  const author1 = await prisma.user.create({
    data: {
      email: 'author@dailysolace.org',
      passwordHash,
      name: 'Dr. Priya Nair',
      role: 'AUTHOR',
      institution: 'Indian Institute of Science, Bangalore',
      country: 'India',
      bio: 'Postdoctoral Researcher focused on quantum computing and optimization algorithms.',
      orcid: '0000-0005-6789-0123',
    },
  });

  const author2 = await prisma.user.create({
    data: {
      email: 'author2@dailysolace.org',
      passwordHash,
      name: 'Dr. David Okafor',
      role: 'AUTHOR',
      institution: 'University of Lagos',
      country: 'Nigeria',
      bio: 'Lecturer in public health and epidemiology with focus on tropical disease prevention.',
      orcid: '0000-0006-7890-1234',
    },
  });

  const author3 = await prisma.user.create({
    data: {
      email: 'author3@dailysolace.org',
      passwordHash,
      name: 'Dr. Yuki Tanaka',
      role: 'AUTHOR',
      institution: 'University of Tokyo',
      country: 'Japan',
      bio: 'Assistant Professor of mechanical engineering specializing in robotics and automation.',
      orcid: '0000-0007-8901-2345',
    },
  });

  const author4 = await prisma.user.create({
    data: {
      email: 'author4@dailysolace.org',
      passwordHash,
      name: 'Dr. Elena Petrova',
      role: 'AUTHOR',
      institution: 'Moscow State University',
      country: 'Russia',
      bio: 'Professor of Mathematics with research interests in applied statistics and data modeling.',
      orcid: '0000-0008-9012-3456',
    },
  });

  console.log('✅ Created 8 users');

  // ─── Subjects ─────────────────────────────────────────────────────────────
  const subjectsData = [
    { name: 'Computer Science & AI', slug: 'computer-science', description: 'Research in computing, algorithms, artificial intelligence, and software systems.', iconName: 'cpu' },
    { name: 'Medical Sciences', slug: 'medical-sciences', description: 'Clinical medicine, pharmacology, diagnostics, and biomedical research.', iconName: 'heart-pulse' },
    { name: 'Engineering & Technology', slug: 'engineering', description: 'Mechanical, electrical, civil, and industrial engineering disciplines.', iconName: 'settings' },
    { name: 'Environmental Science', slug: 'environmental-science', description: 'Ecology, climate change, conservation, and sustainability research.', iconName: 'leaf' },
    { name: 'Social Sciences', slug: 'social-sciences', description: 'Sociology, political science, anthropology, and cultural studies.', iconName: 'users' },
    { name: 'Economics & Business', slug: 'economics-business', description: 'Microeconomics, macroeconomics, finance, and management research.', iconName: 'bar-chart-3' },
    { name: 'Education & Psychology', slug: 'education-psychology', description: 'Learning sciences, educational technology, cognitive and behavioral psychology.', iconName: 'graduation-cap' },
    { name: 'Physics & Mathematics', slug: 'physics-mathematics', description: 'Theoretical and applied physics, pure and applied mathematics.', iconName: 'atom' },
    { name: 'Chemistry & Materials', slug: 'chemistry', description: 'Organic, inorganic, analytical chemistry, and advanced materials science.', iconName: 'flask-conical' },
    { name: 'Biotechnology & Agriculture', slug: 'biotechnology', description: 'Genetic engineering, agricultural science, and food technology.', iconName: 'dna' },
    { name: 'Law & Governance', slug: 'law', description: 'Constitutional law, international law, public policy, and governance.', iconName: 'scale' },
    { name: 'Humanities & Arts', slug: 'humanities', description: 'Literature, philosophy, history, linguistics, and creative arts.', iconName: 'book-open' },
  ];

  const subjects: Record<string, any> = {};
  for (const s of subjectsData) {
    subjects[s.slug] = await prisma.subject.create({ data: s });
  }
  console.log('✅ Created 12 subjects');

  // ─── Journals ─────────────────────────────────────────────────────────────
  const journalsData = [
    {
      name: 'DSJ Computer Science & Artificial Intelligence',
      slug: 'dsj-cs',
      issn: '2847-3901',
      eissn: '2847-3918',
      description: 'A peer-reviewed open-access journal publishing original research across all areas of computer science, artificial intelligence, machine learning, software engineering, cybersecurity, data science, and information technology.',
      scope: 'DSJ Computer Science & Artificial Intelligence (DSJ-CSAI) publishes high-quality, rigorously peer-reviewed research articles, review papers, and short communications in all branches of computer science and artificial intelligence. The journal covers, but is not limited to, the following areas: artificial intelligence and machine learning, deep learning and neural networks, natural language processing, computer vision, software engineering and architecture, database systems and big data analytics, cybersecurity and cryptography, distributed systems and cloud computing, Internet of Things (IoT), human-computer interaction, and theoretical computer science. The journal welcomes both fundamental theoretical contributions and applied research with demonstrable real-world impact.',
      doiPrefix: '10.55001',
      apcAmount: 500000,
      currency: 'INR',
      isActive: true,
      isIndexed: true,
      subjectSlugs: ['computer-science'],
    },
    {
      name: 'DSJ Medical & Health Sciences',
      slug: 'dsj-medical',
      issn: '2693-5124',
      eissn: '2693-5132',
      description: 'An open-access medical journal publishing clinical research, biomedical studies, pharmacology, public health, and healthcare technology innovations.',
      scope: 'DSJ Medical & Health Sciences is dedicated to advancing medical knowledge through the publication of original research articles, clinical studies, systematic reviews, and case reports. The journal encompasses all disciplines of medicine and health sciences, including internal medicine, surgery, pediatrics, obstetrics and gynecology, pharmacology and therapeutics, pathology, microbiology, epidemiology and public health, health informatics, nursing science, and allied health professions. We particularly encourage translational research that bridges the gap between laboratory findings and clinical practice, as well as studies addressing healthcare challenges in developing nations.',
      doiPrefix: '10.55002',
      apcAmount: 600000,
      currency: 'INR',
      isActive: true,
      isIndexed: true,
      subjectSlugs: ['medical-sciences'],
    },
    {
      name: 'DSJ Engineering & Technology',
      slug: 'dsj-engineering',
      issn: '2758-4012',
      eissn: '2758-4020',
      description: 'A multidisciplinary engineering journal covering mechanical, electrical, civil, chemical, and industrial engineering with emphasis on innovation and real-world applications.',
      scope: 'DSJ Engineering & Technology provides a platform for researchers and practitioners to share advancements across all engineering disciplines. The journal publishes original research, technical notes, and comprehensive reviews in mechanical engineering, electrical and electronics engineering, civil and structural engineering, chemical engineering, industrial and manufacturing engineering, materials science and engineering, robotics and automation, renewable energy systems, transportation engineering, and aerospace engineering. We prioritize research that demonstrates practical applicability and contributes to sustainable technological development.',
      doiPrefix: '10.55003',
      apcAmount: 450000,
      currency: 'INR',
      isActive: true,
      isIndexed: true,
      subjectSlugs: ['engineering'],
    },
    {
      name: 'DSJ Environmental & Earth Sciences',
      slug: 'dsj-env',
      issn: '2915-6374',
      eissn: '2915-6382',
      description: 'An interdisciplinary journal focused on environmental science, ecology, climate change research, and earth systems with emphasis on sustainable development.',
      scope: 'DSJ Environmental & Earth Sciences publishes peer-reviewed research addressing critical environmental challenges and earth system processes. Topics include climate change science and adaptation, biodiversity and conservation ecology, environmental pollution and remediation, water resources management, soil science and land use, renewable energy and sustainability, environmental policy and governance, geological sciences, atmospheric sciences, and oceanography. The journal encourages interdisciplinary approaches and studies that inform evidence-based environmental policy.',
      doiPrefix: '10.55004',
      apcAmount: 400000,
      currency: 'INR',
      isActive: true,
      isIndexed: true,
      subjectSlugs: ['environmental-science', 'biotechnology'],
    },
    {
      name: 'DSJ Social Sciences & Humanities',
      slug: 'dsj-social',
      issn: '2834-1905',
      eissn: '2834-1913',
      description: 'A broad-scope journal for research in sociology, psychology, education, political science, law, economics, history, philosophy, and related humanities disciplines.',
      scope: 'DSJ Social Sciences & Humanities is a multidisciplinary journal that publishes original research articles, review papers, and theoretical essays across the social sciences and humanities. Coverage includes sociology and anthropology, psychology and behavioral science, education and learning sciences, political science and international relations, law and legal studies, economics and public policy, history and philosophy, linguistics and literary studies, cultural studies and media, and gender and development studies. The journal values methodological diversity and welcomes qualitative, quantitative, and mixed-methods research.',
      doiPrefix: '10.55005',
      apcAmount: 350000,
      currency: 'INR',
      isActive: true,
      isIndexed: true,
      subjectSlugs: ['social-sciences', 'education-psychology', 'law', 'humanities'],
    },
    {
      name: 'DSJ Pure & Applied Sciences',
      slug: 'dsj-science',
      issn: '2976-4408',
      eissn: '2976-4416',
      description: 'A comprehensive journal for research in physics, chemistry, mathematics, statistics, biotechnology, and agricultural sciences.',
      scope: 'DSJ Pure & Applied Sciences publishes high-quality research spanning the fundamental and applied sciences. The journal covers physics (theoretical, experimental, and computational), mathematics (pure and applied), statistics and data science, chemistry (organic, inorganic, physical, and analytical), materials science and nanotechnology, biotechnology and genetic engineering, agricultural science and food technology, and interdisciplinary scientific research. We encourage both theoretical advances and experimental studies with clear scientific merit.',
      doiPrefix: '10.55006',
      apcAmount: 400000,
      currency: 'INR',
      isActive: true,
      isIndexed: true,
      subjectSlugs: ['physics-mathematics', 'chemistry', 'biotechnology'],
    },
  ];

  const journalRecords: Record<string, any> = {};
  for (const j of journalsData) {
    const { subjectSlugs, ...jData } = j;
    const journal = await prisma.journal.create({ data: jData });
    journalRecords[j.slug] = journal;

    // Link subjects
    for (const slug of subjectSlugs) {
      await prisma.journalSubject.create({
        data: { journalId: journal.id, subjectId: subjects[slug].id },
      });
    }
  }
  console.log('✅ Created 6 journals with subject mappings');

  // ─── Editorial Board Members ──────────────────────────────────────────────
  const boardMembers = [
    { journalSlug: 'dsj-cs', name: 'Prof. Rajesh Kumar', title: 'Ph.D. in Computer Science', institution: 'IIT Delhi', country: 'India', boardRole: 'Editor-in-Chief', order: 1, userId: admin.id },
    { journalSlug: 'dsj-cs', name: 'Dr. Michael Chen', title: 'Ph.D. in Artificial Intelligence', institution: 'MIT', country: 'United States', boardRole: 'Associate Editor', order: 2, userId: reviewer1.id },
    { journalSlug: 'dsj-cs', name: 'Prof. Hiroshi Yamamoto', title: 'Ph.D. in Software Engineering', institution: 'University of Tokyo', country: 'Japan', boardRole: 'Section Editor', order: 3 },
    { journalSlug: 'dsj-cs', name: 'Dr. Maria González', title: 'Ph.D. in Data Science', institution: 'Universidad de Barcelona', country: 'Spain', boardRole: 'Advisory Board', order: 4 },

    { journalSlug: 'dsj-medical', name: 'Prof. Sunita Verma', title: 'M.D., Ph.D.', institution: 'AIIMS New Delhi', country: 'India', boardRole: 'Editor-in-Chief', order: 1 },
    { journalSlug: 'dsj-medical', name: 'Dr. James Anderson', title: 'M.D., FRCP', institution: 'Johns Hopkins University', country: 'United States', boardRole: 'Associate Editor', order: 2 },
    { journalSlug: 'dsj-medical', name: 'Dr. Fatima Al-Hassan', title: 'Ph.D. in Pharmacology', institution: 'King Abdullah University', country: 'Saudi Arabia', boardRole: 'Section Editor', order: 3 },

    { journalSlug: 'dsj-engineering', name: 'Prof. Vikram Singh', title: 'Ph.D. in Mechanical Engineering', institution: 'IIT Bombay', country: 'India', boardRole: 'Editor-in-Chief', order: 1 },
    { journalSlug: 'dsj-engineering', name: 'Dr. Lisa Weber', title: 'Ph.D. in Civil Engineering', institution: 'ETH Zurich', country: 'Switzerland', boardRole: 'Associate Editor', order: 2 },

    { journalSlug: 'dsj-env', name: 'Dr. Sarah Williams', title: 'Ph.D. in Environmental Science', institution: 'University of Oxford', country: 'United Kingdom', boardRole: 'Editor-in-Chief', order: 1, userId: reviewer2.id },
    { journalSlug: 'dsj-env', name: 'Prof. Carlos Rivera', title: 'Ph.D. in Ecology', institution: 'UNAM Mexico', country: 'Mexico', boardRole: 'Associate Editor', order: 2 },

    { journalSlug: 'dsj-social', name: 'Prof. Amira Hassan', title: 'Ph.D. in Sociology', institution: 'Cairo University', country: 'Egypt', boardRole: 'Editor-in-Chief', order: 1 },
    { journalSlug: 'dsj-social', name: 'Dr. Thomas Mueller', title: 'Ph.D. in Political Science', institution: 'Humboldt University Berlin', country: 'Germany', boardRole: 'Associate Editor', order: 2 },

    { journalSlug: 'dsj-science', name: 'Prof. Ananya Sharma', title: 'Ph.D. in Physics', institution: 'NIT Trichy', country: 'India', boardRole: 'Editor-in-Chief', order: 1, userId: editor.id },
    { journalSlug: 'dsj-science', name: 'Dr. Robert Kim', title: 'Ph.D. in Chemistry', institution: 'Seoul National University', country: 'South Korea', boardRole: 'Associate Editor', order: 2 },
  ];

  for (const bm of boardMembers) {
    const { journalSlug, ...data } = bm;
    await prisma.editorialBoardMember.create({
      data: { ...data, journalId: journalRecords[journalSlug].id },
    });
  }
  console.log('✅ Created 15 editorial board members');

  // ─── Volumes & Issues ─────────────────────────────────────────────────────
  const volumes: Record<string, any> = {};
  const issues: Record<string, any> = {};

  for (const slug of Object.keys(journalRecords)) {
    const journal = journalRecords[slug];
    // Create Volume 1 (2025) and Volume 2 (2026)
    const v1 = await prisma.volume.create({ data: { journalId: journal.id, number: 1, year: 2025 } });
    const v2 = await prisma.volume.create({ data: { journalId: journal.id, number: 2, year: 2026 } });
    volumes[`${slug}-v1`] = v1;
    volumes[`${slug}-v2`] = v2;

    // Issues for volume 1
    const i1 = await prisma.issue.create({ data: { volumeId: v1.id, number: 1, publicationDate: new Date('2025-03-15'), isPublished: true } });
    const i2 = await prisma.issue.create({ data: { volumeId: v1.id, number: 2, publicationDate: new Date('2025-06-15'), isPublished: true } });
    const i3 = await prisma.issue.create({ data: { volumeId: v1.id, number: 3, publicationDate: new Date('2025-09-15'), isPublished: true } });
    const i4 = await prisma.issue.create({ data: { volumeId: v1.id, number: 4, publicationDate: new Date('2025-12-15'), isPublished: true } });
    issues[`${slug}-v1i1`] = i1;
    issues[`${slug}-v1i2`] = i2;
    issues[`${slug}-v1i3`] = i3;
    issues[`${slug}-v1i4`] = i4;

    // Issues for volume 2
    const i5 = await prisma.issue.create({ data: { volumeId: v2.id, number: 1, publicationDate: new Date('2026-03-15'), isPublished: true } });
    const i6 = await prisma.issue.create({ data: { volumeId: v2.id, number: 2, publicationDate: new Date('2026-06-15'), isPublished: true } });
    issues[`${slug}-v2i1`] = i5;
    issues[`${slug}-v2i2`] = i6;
  }
  console.log('✅ Created volumes & issues for all journals');

  // ─── Articles (Published Submissions) ─────────────────────────────────────
  // Each article needs: Submission → (status: PUBLISHED) → Article

  const articlesData = [
    // ── Computer Science ──
    {
      journalSlug: 'dsj-cs',
      issueKey: 'dsj-cs-v2i1',
      subjectSlug: 'computer-science',
      authorId: author1.id,
      title: 'Transformer-Based Federated Learning for Privacy-Preserving Medical Image Classification',
      abstract: 'This paper presents a novel framework integrating transformer architectures with federated learning protocols to enable privacy-preserving medical image classification across distributed hospital networks. Traditional deep learning approaches for medical imaging require centralizing sensitive patient data, raising significant privacy and regulatory concerns under frameworks such as GDPR and HIPAA. Our proposed method, FedViT (Federated Vision Transformer), addresses this challenge by training a Vision Transformer model across multiple institutional nodes without transferring raw imaging data. We introduce a differential privacy mechanism with adaptive noise calibration that preserves model utility while providing formal privacy guarantees with an epsilon value of 3.2. Extensive experiments conducted on three benchmark datasets — CheXpert (224,316 chest radiographs), ISIC 2019 (25,331 dermoscopic images), and a proprietary diabetic retinopathy dataset (18,742 fundus photographs) — demonstrate that FedViT achieves classification accuracy within 1.8% of centrally-trained models while maintaining strict data isolation. The framework supports heterogeneous data distributions across participating institutions through a novel gradient harmonization technique that mitigates the impact of non-IID data partitions. Comparative analysis against FedAvg, FedProx, and SCAFFOLD baselines shows consistent improvements in convergence speed (2.3× faster) and final model performance (F1-score improvement of 4.7%). Our results establish the viability of transformer-based federated learning as a practical solution for multi-institutional medical AI collaboration.',
      keywords: ['federated learning', 'vision transformer', 'medical imaging', 'differential privacy', 'deep learning', 'healthcare AI'],
      doi: '10.55001/dsj-cs.2026.0101',
      viewCount: 1847,
      downloadCount: 523,
      pageStart: 1,
      pageEnd: 24,
      publishedAt: new Date('2026-03-20'),
      submittedAt: new Date('2025-11-15'),
    },
    {
      journalSlug: 'dsj-cs',
      issueKey: 'dsj-cs-v2i1',
      subjectSlug: 'computer-science',
      authorId: author1.id,
      title: 'Quantum-Enhanced Reinforcement Learning for Combinatorial Optimization in Large-Scale Supply Chains',
      abstract: 'Combinatorial optimization problems in supply chain management grow exponentially in complexity as the number of decision variables increases, rendering classical algorithms computationally intractable for real-world instances. This research investigates the application of quantum-enhanced reinforcement learning (QERL) to solve large-scale vehicle routing, inventory allocation, and production scheduling problems simultaneously within integrated supply chain networks. We propose a hybrid quantum-classical architecture that leverages parameterized quantum circuits as function approximators within a proximal policy optimization framework. The quantum component exploits superposition and entanglement to explore the solution space more efficiently than classical neural network counterparts. Our approach is validated on supply chain instances involving up to 500 nodes, 2,000 product SKUs, and 30-day planning horizons, sourced from anonymized industrial datasets provided by three multinational logistics companies. Experimental results demonstrate that QERL consistently discovers solutions within 3.1% of known optima while reducing computation time by 67% compared to state-of-the-art metaheuristic solvers including genetic algorithms and simulated annealing. Furthermore, the quantum advantage becomes more pronounced as problem size increases, suggesting favorable scaling properties. Noise-aware training techniques are employed to ensure robustness on current noisy intermediate-scale quantum (NISQ) hardware. This work provides the first comprehensive empirical evidence that quantum computing can deliver practical advantages for industrial-scale supply chain optimization.',
      keywords: ['quantum computing', 'reinforcement learning', 'supply chain optimization', 'combinatorial optimization', 'NISQ', 'vehicle routing'],
      doi: '10.55001/dsj-cs.2026.0102',
      viewCount: 2341,
      downloadCount: 891,
      pageStart: 25,
      pageEnd: 52,
      publishedAt: new Date('2026-04-05'),
      submittedAt: new Date('2025-12-01'),
    },
    {
      journalSlug: 'dsj-cs',
      issueKey: 'dsj-cs-v1i4',
      subjectSlug: 'computer-science',
      authorId: author4.id,
      title: 'A Comprehensive Framework for Detecting and Mitigating Adversarial Attacks on Large Language Models',
      abstract: 'Large Language Models (LLMs) have demonstrated remarkable capabilities across natural language understanding and generation tasks, yet remain vulnerable to adversarial attacks that can manipulate their outputs in dangerous ways, including jailbreaking, prompt injection, and data extraction attacks. This paper presents SHIELD-LLM, a comprehensive multi-layered defense framework designed to detect and mitigate adversarial inputs targeting production-deployed language models. Our framework operates at three defensive layers: (1) an input sanitization module employing perplexity-based anomaly detection to identify structurally anomalous prompts, (2) a lightweight classifier trained on 847,000 adversarial and benign prompt pairs that flags potentially malicious inputs with 96.3% precision at 94.1% recall, and (3) an output validation layer that enforces semantic consistency constraints to prevent information leakage and policy violations. We evaluate SHIELD-LLM against 14 known attack categories including GCG, AutoDAN, PAIR, and novel multi-turn social engineering attacks across GPT-4, Claude, and Llama model families. Our defense reduces attack success rates from an average of 73.2% to 4.8% while imposing only 12ms additional latency per request and maintaining a false positive rate below 2.1% on legitimate queries. The framework is model-agnostic and can be deployed as middleware in existing API gateway architectures without requiring model retraining or fine-tuning.',
      keywords: ['large language models', 'adversarial attacks', 'AI safety', 'prompt injection', 'cybersecurity', 'natural language processing'],
      doi: '10.55001/dsj-cs.2025.0401',
      viewCount: 3156,
      downloadCount: 1247,
      pageStart: 1,
      pageEnd: 31,
      publishedAt: new Date('2025-12-20'),
      submittedAt: new Date('2025-08-10'),
    },

    // ── Medical Sciences ──
    {
      journalSlug: 'dsj-medical',
      issueKey: 'dsj-medical-v2i1',
      subjectSlug: 'medical-sciences',
      authorId: author2.id,
      title: 'Gut Microbiome Signatures as Early Biomarkers for Pancreatic Ductal Adenocarcinoma: A Multi-Center Prospective Cohort Study',
      abstract: 'Pancreatic ductal adenocarcinoma (PDAC) remains one of the most lethal malignancies with a five-year survival rate below 12%, primarily due to late-stage diagnosis. This multi-center prospective cohort study investigates the potential of gut microbiome compositional signatures as non-invasive biomarkers for early PDAC detection. We enrolled 1,247 participants across six tertiary hospitals in India, the United Kingdom, and the United States, including 312 histologically confirmed PDAC patients (stages I–IV), 298 patients with chronic pancreatitis, 215 patients with other gastrointestinal malignancies, and 422 healthy controls matched for age, sex, and BMI. Fecal samples were analyzed using 16S rRNA gene sequencing (V3–V4 region) and whole-genome shotgun metagenomics. Machine learning analysis of microbial composition data revealed a panel of 23 bacterial species whose relative abundances collectively discriminate early-stage PDAC (stages I–II) from healthy controls with an area under the receiver operating characteristic curve (AUC-ROC) of 0.91 (95% CI: 0.87–0.95). Notable discriminatory taxa included significant enrichment of Porphyromonas gingivalis, Fusobacterium nucleatum, and Veillonella atypica, alongside depletion of Faecalibacterium prausnitzii and Roseburia intestinalis. Integration of microbiome signatures with serum CA 19-9 levels improved diagnostic sensitivity for stage I PDAC from 47% (CA 19-9 alone) to 79% while maintaining specificity at 91%. Functional pathway analysis revealed perturbations in bile acid metabolism, short-chain fatty acid production, and lipopolysaccharide biosynthesis pathways in PDAC-associated microbiomes. This study establishes the gut microbiome as a promising complementary diagnostic modality for early pancreatic cancer screening.',
      keywords: ['pancreatic cancer', 'gut microbiome', 'biomarkers', 'early detection', 'metagenomics', 'machine learning diagnostics'],
      doi: '10.55002/dsj-med.2026.0101',
      viewCount: 2789,
      downloadCount: 945,
      pageStart: 1,
      pageEnd: 28,
      publishedAt: new Date('2026-03-25'),
      submittedAt: new Date('2025-10-20'),
    },
    {
      journalSlug: 'dsj-medical',
      issueKey: 'dsj-medical-v2i2',
      subjectSlug: 'medical-sciences',
      authorId: author2.id,
      title: 'CRISPR-Cas9 Gene Therapy for Sickle Cell Disease: Long-Term Outcomes from a Phase II Clinical Trial',
      abstract: 'Sickle cell disease (SCD) is a monogenic hemoglobinopathy caused by a point mutation in the HBB gene, affecting approximately 20 million people worldwide with disproportionate burden in sub-Saharan Africa and South Asia. This paper reports the 36-month follow-up outcomes of a Phase II, open-label, single-arm clinical trial (NCT-DSJ-04892) evaluating CRISPR-Cas9-mediated gene editing of autologous hematopoietic stem and progenitor cells (HSPCs) in 48 patients with severe SCD. The therapeutic approach targets the BCL11A erythroid-specific enhancer to reactivate fetal hemoglobin (HbF) expression, thereby ameliorating the sickling phenotype. At 36 months post-infusion, 43 of 48 evaluable patients (89.6%) achieved sustained total hemoglobin levels above 11 g/dL (mean: 13.2 ± 1.4 g/dL) with HbF constituting a mean of 42.3% of total hemoglobin. Vaso-occlusive crises (VOCs), the hallmark of SCD morbidity, were completely eliminated in 38 patients (79.2%) and reduced by more than 90% in an additional 7 patients (14.6%). No patients required red blood cell transfusions beyond six months post-treatment. Comprehensive safety monitoring revealed no evidence of off-target editing at 1,247 computationally predicted off-target sites assessed by GUIDE-seq and CIRCLE-seq analyses. Hematological reconstitution occurred within a median of 28 days, and multilineage engraftment was confirmed by serial bone marrow evaluations. These results demonstrate durable clinical remission of SCD following a single CRISPR-Cas9 gene therapy intervention, supporting advancement to Phase III registration trials.',
      keywords: ['CRISPR-Cas9', 'sickle cell disease', 'gene therapy', 'fetal hemoglobin', 'clinical trial', 'hematopoietic stem cells'],
      doi: '10.55002/dsj-med.2026.0201',
      viewCount: 4521,
      downloadCount: 1876,
      pageStart: 1,
      pageEnd: 35,
      publishedAt: new Date('2026-06-18'),
      submittedAt: new Date('2026-01-15'),
    },

    // ── Engineering ──
    {
      journalSlug: 'dsj-engineering',
      issueKey: 'dsj-engineering-v2i1',
      subjectSlug: 'engineering',
      authorId: author3.id,
      title: 'Bio-Inspired Soft Robotic Gripper with Integrated Tactile Sensing for Precision Agricultural Harvesting',
      abstract: 'The selective harvesting of delicate fruits and vegetables represents a critical challenge in agricultural robotics, requiring grippers that combine gentle manipulation with sufficient force modulation and real-time sensory feedback. This paper presents the design, fabrication, and field evaluation of a bio-inspired soft robotic gripper system incorporating embedded tactile sensing arrays for autonomous precision harvesting applications. Drawing inspiration from the compliant grasping mechanics of octopus tentacles and chameleon tongues, our gripper features three pneumatically actuated silicone fingers with variable stiffness capabilities achieved through a granular jamming mechanism integrated within each finger. Each finger incorporates 12 piezoresistive pressure sensors and 8 strain gauges arranged in a biomimetic distribution pattern, providing continuous contact force and slip detection with a sensitivity of 0.05 N and a response time of 3.2 milliseconds. A convolutional neural network trained on 24,000 grasping trials classifies fruit ripeness, estimates mass (±8g accuracy), and determines optimal grasp force in real-time. Field trials conducted across three growing seasons on strawberry, tomato, and bell pepper crops demonstrated harvest success rates of 94.7%, 97.1%, and 95.3% respectively, with fruit damage rates below 1.2% — comparable to skilled human pickers. The gripper operates at a cycle time of 4.8 seconds per pick, enabling throughput rates competitive with manual harvesting while reducing labor requirements by approximately 60%.',
      keywords: ['soft robotics', 'agricultural robotics', 'tactile sensing', 'precision harvesting', 'bio-inspired design', 'pneumatic actuators'],
      doi: '10.55003/dsj-eng.2026.0101',
      viewCount: 1534,
      downloadCount: 612,
      pageStart: 1,
      pageEnd: 26,
      publishedAt: new Date('2026-03-28'),
      submittedAt: new Date('2025-11-05'),
    },

    // ── Environmental Science ──
    {
      journalSlug: 'dsj-env',
      issueKey: 'dsj-env-v2i1',
      subjectSlug: 'environmental-science',
      authorId: reviewer2.id,
      title: 'Microplastic Contamination in Deep-Sea Hydrothermal Vent Ecosystems: Distribution, Polymer Characterization, and Trophic Transfer',
      abstract: 'While microplastic pollution has been extensively documented in surface ocean waters, coastal sediments, and shallow marine environments, its presence and ecological impacts in deep-sea hydrothermal vent ecosystems remain poorly understood. This study presents the first comprehensive assessment of microplastic contamination across four active hydrothermal vent fields in the Mid-Atlantic Ridge (TAG, Snake Pit, Lucky Strike, and Rainbow) at depths ranging from 1,700 to 3,620 meters. Over the course of three deep-sea research expeditions between 2023 and 2025, we collected and analyzed 847 sediment samples, 312 water column samples, and tissue specimens from 1,456 individuals representing 34 vent-endemic species using Fourier-transform infrared spectroscopy (FTIR) and pyrolysis gas chromatography-mass spectrometry (Py-GC-MS). Microplastics were detected in 78.3% of sediment samples at concentrations ranging from 12 to 389 particles per kilogram of dry sediment, with polyethylene terephthalate (PET, 34.2%), polyamide (PA, 28.7%), and polypropylene (PP, 18.9%) as dominant polymer types. Notably, microplastic concentrations were significantly elevated (p < 0.001) within a 200-meter radius of active vent chimneys compared to distal reference sites, suggesting that hydrothermal fluid circulation may act as a concentrating mechanism. Trophic transfer analysis revealed bioaccumulation factors of 2.8 to 7.4 across three trophic levels, with apex predators (vent crabs, Bythograea thermydron) accumulating significantly higher microplastic loads than primary consumers. Histopathological examination of contaminated organisms revealed inflammatory responses, tissue necrosis, and disrupted reproductive development, raising concerns about the long-term viability of these unique chemosynthetic ecosystems.',
      keywords: ['microplastics', 'deep-sea', 'hydrothermal vents', 'ocean pollution', 'trophic transfer', 'marine ecology'],
      doi: '10.55004/dsj-env.2026.0101',
      viewCount: 3892,
      downloadCount: 1423,
      pageStart: 1,
      pageEnd: 32,
      publishedAt: new Date('2026-04-10'),
      submittedAt: new Date('2025-12-15'),
    },

    // ── Social Sciences ──
    {
      journalSlug: 'dsj-social',
      issueKey: 'dsj-social-v2i1',
      subjectSlug: 'social-sciences',
      authorId: author4.id,
      title: 'Digital Divide 2.0: Algorithmic Literacy and Socioeconomic Stratification in the Age of Generative AI',
      abstract: 'As generative artificial intelligence systems such as ChatGPT, Gemini, and Claude become increasingly embedded in educational, professional, and civic contexts, a new dimension of digital inequality is emerging that extends beyond traditional measures of internet access and basic digital skills. This paper theorizes and empirically investigates what we term the "Digital Divide 2.0" — the stratified distribution of algorithmic literacy, defined as the capacity to effectively interact with, critically evaluate, and strategically leverage AI-powered tools for personal and professional advancement. Drawing on Pierre Bourdieu\'s theory of capital and Amartya Sen\'s capability approach, we develop a conceptual framework that positions algorithmic literacy as a form of techno-cultural capital with significant implications for socioeconomic mobility. We present findings from a mixed-methods study combining a nationally representative survey of 8,247 adults across India, the United States, and Germany with 124 in-depth qualitative interviews and 36 ethnographic observations of AI tool usage in workplace and educational settings. Our Algorithmic Literacy Index (ALI), validated through confirmatory factor analysis, reveals substantial disparities correlated with socioeconomic status (β = 0.42, p < 0.001), educational attainment (β = 0.38, p < 0.001), and geographic location (urban-rural gap: d = 0.67). Critically, we find that algorithmic literacy mediates the relationship between existing socioeconomic advantage and AI-enabled productivity gains, creating a self-reinforcing cycle of inequality. The paper concludes with evidence-based policy recommendations for equitable AI education and argues for the reconceptualization of digital inclusion frameworks to encompass algorithmic agency.',
      keywords: ['digital divide', 'algorithmic literacy', 'generative AI', 'social inequality', 'digital inclusion', 'AI education policy'],
      doi: '10.55005/dsj-soc.2026.0101',
      viewCount: 2156,
      downloadCount: 789,
      pageStart: 1,
      pageEnd: 29,
      publishedAt: new Date('2026-04-15'),
      submittedAt: new Date('2025-11-28'),
    },

    // ── Pure & Applied Sciences ──
    {
      journalSlug: 'dsj-science',
      issueKey: 'dsj-science-v2i1',
      subjectSlug: 'physics-mathematics',
      authorId: author4.id,
      title: 'Topological Quantum Error Correction with Machine-Learning-Optimized Surface Codes on 127-Qubit Processors',
      abstract: 'Achieving fault-tolerant quantum computation requires error correction protocols that can suppress physical error rates below the threshold necessary for reliable logical qubit operation. This paper demonstrates a machine-learning-optimized implementation of the surface code for topological quantum error correction on IBM\'s 127-qubit Eagle processor architecture. We develop a reinforcement learning agent that dynamically optimizes syndrome measurement circuits, decoder parameters, and qubit allocation strategies in response to real-time noise characterization of the quantum hardware. Our approach addresses the critical challenge that static error correction protocols fail to account for the spatiotemporally varying noise profiles characteristic of superconducting qubit processors. Through systematic benchmarking across 847 calibration cycles spanning 14 days of continuous operation, we demonstrate that the ML-optimized surface code achieves a logical error rate of 2.7 × 10⁻⁴ per round of error correction using distance-5 surface codes — a 4.2× improvement over conventional minimum-weight perfect matching (MWPM) decoders operating on the same hardware. The reinforcement learning agent learns to identify and exploit correlations in the noise model that static decoders cannot capture, including crosstalk-induced correlated errors and frequency-collision-driven coherent errors. We further demonstrate that our approach enables the first experimental realization of a break-even point where the logical error rate falls below the average physical error rate of constituent qubits, a critical milestone for practical quantum error correction. Our methodology is hardware-agnostic and can be adapted to other quantum computing platforms including trapped-ion and neutral-atom architectures.',
      keywords: ['quantum error correction', 'surface codes', 'machine learning', 'fault-tolerant quantum computing', 'superconducting qubits', 'reinforcement learning'],
      doi: '10.55006/dsj-sci.2026.0101',
      viewCount: 1923,
      downloadCount: 734,
      pageStart: 1,
      pageEnd: 27,
      publishedAt: new Date('2026-04-02'),
      submittedAt: new Date('2025-12-08'),
    },
    {
      journalSlug: 'dsj-science',
      issueKey: 'dsj-science-v2i2',
      subjectSlug: 'chemistry',
      authorId: author3.id,
      title: 'Self-Healing Metal-Organic Framework Membranes for Continuous Industrial CO₂ Capture Under Harsh Conditions',
      abstract: 'Carbon capture and storage (CCS) technologies are essential for achieving net-zero emission targets, yet existing membrane-based CO₂ separation systems suffer from performance degradation under industrial operating conditions involving high temperatures, acidic gases, and mechanical stress. This paper reports the development of a novel class of self-healing metal-organic framework (MOF) membranes that maintain structural integrity and separation performance over extended operation periods in realistic industrial environments. We synthesize ZIF-8/polyimide mixed-matrix membranes incorporating a dynamic covalent bond network based on Diels-Alder chemistry that enables autonomous repair of micro-defects and cracks at operating temperatures between 150°C and 250°C. The self-healing mechanism is characterized using in-situ synchrotron X-ray microtomography, revealing complete crack closure within 4 hours for defects up to 15 micrometers in width. Permeation testing under simulated post-combustion flue gas conditions (15% CO₂, 75% N₂, 5% H₂O, 500 ppm SO₂, at 200°C and 5 bar) demonstrates a CO₂ permeability of 3,847 Barrers with CO₂/N₂ selectivity of 52.3 — exceeding the 2019 Robeson upper bound by a factor of 2.1. Critically, after 5,000 hours of continuous operation with deliberate thermal cycling (10 cycles between 25°C and 250°C), the membranes retain 94.7% of initial permeability compared to 61.3% for non-self-healing controls. Techno-economic analysis indicates that the self-healing capability reduces membrane replacement frequency by 70%, translating to a 34% reduction in levelized capture cost from $65 to $43 per tonne CO₂. This work establishes self-healing MOF membranes as a commercially viable technology for next-generation industrial carbon capture.',
      keywords: ['carbon capture', 'metal-organic frameworks', 'self-healing materials', 'membrane separation', 'CO₂ sequestration', 'sustainable chemistry'],
      doi: '10.55006/dsj-sci.2026.0201',
      viewCount: 2678,
      downloadCount: 1089,
      pageStart: 1,
      pageEnd: 30,
      publishedAt: new Date('2026-06-22'),
      submittedAt: new Date('2026-02-10'),
    },

    // ── More Engineering ──
    {
      journalSlug: 'dsj-engineering',
      issueKey: 'dsj-engineering-v1i4',
      subjectSlug: 'engineering',
      authorId: author3.id,
      title: 'Perovskite-Silicon Tandem Solar Cells with 33.7% Efficiency: Defect Passivation Through Molecular Engineering of the Buried Interface',
      abstract: 'Perovskite-silicon tandem solar cells represent the most promising pathway to exceed the theoretical single-junction efficiency limit, yet performance is critically constrained by recombination losses at the buried perovskite/transport layer interfaces. This paper reports a record power conversion efficiency (PCE) of 33.7% (certified by NREL) for a monolithic two-terminal perovskite-silicon tandem cell, achieved through molecular engineering of the buried interface between the perovskite absorber and the hole transport layer. We design and synthesize a bifunctional self-assembled monolayer (SAM) molecule, designated DSJ-SAM-4, featuring a phosphonic acid anchoring group, a π-conjugated carbazole core, and a Lewis base terminal group that simultaneously passivates both undercoordinated Pb²⁺ defects on the perovskite surface and oxygen vacancy defects on the NiOₓ hole transport layer. Kelvin probe force microscopy and time-resolved photoluminescence spectroscopy confirm that DSJ-SAM-4 reduces the interface recombination velocity from 842 cm/s to 47 cm/s and increases the quasi-Fermi level splitting by 38 meV. The optimized tandem device achieves an open-circuit voltage of 1.92 V (97.4% of the thermodynamic limit), a short-circuit current density of 20.1 mA/cm², and a fill factor of 87.2%. Accelerated aging tests following IEC 61215 protocols demonstrate less than 5% relative efficiency loss after 3,000 hours of continuous operation at 85°C and 85% relative humidity, establishing commercial viability. The levelized cost of electricity is projected at $0.018/kWh for utility-scale deployment, representing a 40% reduction compared to current single-junction silicon technology.',
      keywords: ['perovskite solar cells', 'tandem photovoltaics', 'interface engineering', 'defect passivation', 'renewable energy', 'self-assembled monolayers'],
      doi: '10.55003/dsj-eng.2025.0401',
      viewCount: 5234,
      downloadCount: 2156,
      pageStart: 1,
      pageEnd: 33,
      publishedAt: new Date('2025-12-28'),
      submittedAt: new Date('2025-08-20'),
    },

    // ── More Environmental ──
    {
      journalSlug: 'dsj-env',
      issueKey: 'dsj-env-v1i3',
      subjectSlug: 'biotechnology',
      authorId: author2.id,
      title: 'CRISPR-Engineered Nitrogen-Fixing Cereals: Field Trial Results and Implications for Sustainable Agriculture in Sub-Saharan Africa',
      abstract: 'Nitrogen fertilizer production accounts for approximately 1.4% of global CO₂ emissions, while its overuse causes widespread eutrophication and soil degradation. This paper presents the results of the first multi-site field trial of CRISPR-Cas12a-engineered maize and sorghum varieties carrying a synthetic nitrogen fixation (nif) gene cluster derived from Klebsiella oxytoca, optimized for expression in cereal root cortical cells. The synthetic nif cassette, comprising 16 refactored genes organized into four synthetic operons with root-specific promoters, was stably integrated into elite maize (DTMA-3) and sorghum (Samsorg-45) cultivars using Agrobacterium-mediated transformation. Field trials were conducted across 12 sites in Kenya, Nigeria, and Tanzania over two consecutive growing seasons (2024 and 2025), encompassing diverse agroecological zones from semi-arid lowlands to sub-humid highlands. Engineered maize varieties achieved grain yields of 4.8 ± 0.6 tonnes/hectare without any nitrogen fertilizer application — statistically equivalent to conventionally fertilized controls (5.1 ± 0.7 t/ha, p = 0.31) and 47% higher than unfertilized controls (3.3 ± 0.5 t/ha, p < 0.001). ¹⁵N isotope dilution assays confirmed that 38–52% of plant nitrogen was derived from biological fixation. Comprehensive environmental risk assessments, including soil microbiome profiling through shotgun metagenomics, showed no significant perturbation of indigenous microbial communities. Economic modeling suggests that adoption of nitrogen-fixing cereals could save smallholder farmers $120–$180 per hectare annually in fertilizer costs while reducing agriculture-associated greenhouse gas emissions by 23% across the region. These results represent a transformative advance toward sustainable intensification of cereal production in resource-limited agricultural systems.',
      keywords: ['CRISPR', 'nitrogen fixation', 'sustainable agriculture', 'gene editing', 'food security', 'sub-Saharan Africa'],
      doi: '10.55004/dsj-env.2025.0301',
      viewCount: 6102,
      downloadCount: 2834,
      pageStart: 1,
      pageEnd: 36,
      publishedAt: new Date('2025-09-30'),
      submittedAt: new Date('2025-05-12'),
    },
  ];

  for (const a of articlesData) {
    // 1. Create submission (status = PUBLISHED)
    const submission = await prisma.submission.create({
      data: {
        journalId: journalRecords[a.journalSlug].id,
        title: a.title,
        abstract: a.abstract,
        keywords: a.keywords,
        status: 'PUBLISHED',
        authorId: a.authorId,
        subjectId: subjects[a.subjectSlug].id,
        submittedAt: a.submittedAt,
      },
    });

    // 2. Create article
    await prisma.article.create({
      data: {
        submissionId: submission.id,
        issueId: issues[a.issueKey].id,
        subjectId: subjects[a.subjectSlug].id,
        doi: a.doi,
        pageStart: a.pageStart,
        pageEnd: a.pageEnd,
        viewCount: a.viewCount,
        downloadCount: a.downloadCount,
        publishedAt: a.publishedAt,
      },
    });

    // 3. Create submission event
    await prisma.submissionEvent.create({
      data: {
        submissionId: submission.id,
        type: 'PUBLISHED',
        note: `Article published with DOI: ${a.doi}`,
      },
    });
  }

  console.log(`✅ Created ${articlesData.length} published articles with full metadata`);

  // ─── Summary ──────────────────────────────────────────────────────────────
  console.log('\n✨ Seed complete! Summary:');
  console.log(`   Users: 8 (admin, editor, 2 reviewers, 4 authors)`);
  console.log(`   Subjects: 12`);
  console.log(`   Journals: 6`);
  console.log(`   Editorial board members: 15`);
  console.log(`   Volumes: 12 (2 per journal)`);
  console.log(`   Issues: 36 (6 per journal)`);
  console.log(`   Published articles: ${articlesData.length}`);
  console.log('\n📧 Login credentials (all passwords: password123):');
  console.log('   Admin:    admin@dailysolace.org');
  console.log('   Editor:   editor@dailysolace.org');
  console.log('   Reviewer: reviewer1@dailysolace.org');
  console.log('   Reviewer: reviewer2@dailysolace.org');
  console.log('   Author:   author@dailysolace.org');
  console.log('   Author:   author2@dailysolace.org');
  console.log('   Author:   author3@dailysolace.org');
  console.log('   Author:   author4@dailysolace.org');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
