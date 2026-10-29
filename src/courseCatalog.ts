import { Batch, TeacherContract, TeacherPayoutRecord, CourseEnrollment, ContentItem, RecordedVideo } from './types.ts';

// Sample pre-configured chapters with Recorded Lectures, Notes, and Model Papers
export const sampleNotes: Record<string, ContentItem[]> = {
  'math-ch1': [
    {
      id: 'note-m1',
      folderName: 'Class 10 Maths',
      subfolderName: 'Chapter 1: Real Numbers',
      title: 'Chapter 1: Real Numbers Comprehensive Revision Notes & Formula Sheet',
      fileType: 'pdf',
      fileSize: '3.4 MB',
      uploadedAt: '15 Oct 2026',
      downloads: 48,
      details: 'Complete NCERT notes with Fundamental Theorem of Arithmetic and irrationality proofs.',
      fileName: 'Ch1_Real_Numbers_Revision_Notes.pdf',
      fileUrl: '/api/storage/file/sample-notes-ch1.pdf'
    },
    {
      id: 'note-m1-mindmap',
      folderName: 'Class 10 Maths',
      subfolderName: 'Chapter 1: Real Numbers',
      title: 'Real Numbers Concept Mind-Map & Shortcut Handbook',
      fileType: 'pdf',
      fileSize: '1.8 MB',
      uploadedAt: '18 Oct 2026',
      downloads: 36,
      details: 'One-page quick recap sheet for Euclid Division Algorithm and LCM-HCF relations.',
      fileName: 'Real_Numbers_Mindmap.pdf',
      fileUrl: '/api/storage/file/sample-notes-ch1.pdf'
    }
  ],
  'math-ch8': [
    {
      id: 'note-m8',
      folderName: 'Class 10 Maths',
      subfolderName: 'Chapter 8: Trigonometry',
      title: 'Chapter 8: Trigonometry Identities, Tables & Elevation Notes',
      fileType: 'pdf',
      fileSize: '4.2 MB',
      uploadedAt: '20 Oct 2026',
      downloads: 52,
      details: 'Handwritten notes by Sarla Sharma with derivations for sin²θ + cos²θ = 1 and mnemonic rules.',
      fileName: 'Ch8_Trigonometry_Detailed_Notes.pdf',
      fileUrl: '/api/storage/file/sample-notes-ch1.pdf'
    }
  ],
  'sci-ch1': [
    {
      id: 'note-s1',
      folderName: 'Class 10 Science',
      subfolderName: 'Chapter 1: Chemical Reactions',
      title: 'Chapter 1: Chemical Reactions and Balancing Master Notes',
      fileType: 'pdf',
      fileSize: '3.9 MB',
      uploadedAt: '12 Oct 2026',
      downloads: 44,
      details: 'Types of reactions, oxidation-reduction, corrosion, and 30 balanced chemical equations.',
      fileName: 'Ch1_Chemical_Reactions_Notes.pdf',
      fileUrl: '/api/storage/file/sample-matter.pdf'
    }
  ],
  'sci-ch6': [
    {
      id: 'note-s6',
      folderName: 'Class 10 Science',
      subfolderName: 'Chapter 6: Life Processes',
      title: 'Chapter 6: Life Processes - Nutrition, Respiration & Circulation Notes',
      fileType: 'pdf',
      fileSize: '5.1 MB',
      uploadedAt: '14 Oct 2026',
      downloads: 60,
      details: 'High-yield illustrated diagrams of human heart, nephron, and double circulation system.',
      fileName: 'Ch6_Life_Processes_Illustrated_Notes.pdf',
      fileUrl: '/api/storage/file/sample-matter.pdf'
    }
  ],
  'eng-ch1': [
    {
      id: 'note-e1',
      folderName: 'Class 10 English',
      subfolderName: 'Chapter 1: First Flight',
      title: 'Chapter 1: A Letter to God - Detailed Summary, Character Sketch & Literary Devices',
      fileType: 'pdf',
      fileSize: '2.2 MB',
      uploadedAt: '10 Oct 2026',
      downloads: 38,
      details: 'Line-by-line explanation, irony of the situation, and high-scoring board question answers.',
      fileName: 'Ch1_Letter_To_God_Notes.pdf',
      fileUrl: '/api/storage/file/sample-notes-ch1.pdf'
    }
  ]
};

export const sampleModelPapers: Record<string, ContentItem[]> = {
  'math-ch1': [
    {
      id: 'mp-m1',
      folderName: 'Model Papers',
      subfolderName: 'Class 10 Mathematics',
      title: 'Real Numbers - 2026 Board Pattern Model Paper (Set A with Marking Scheme)',
      fileType: 'pdf',
      fileSize: '1.2 MB',
      uploadedAt: '21 Oct 2026',
      downloads: 50,
      details: 'Includes Section A MCQs, Assertion-Reason, Short Answer, and Case-Based problem sets.',
      fileName: 'Real_Numbers_Model_Paper_2026_SetA.pdf',
      fileUrl: '/api/storage/file/sample-quiz-ch1.pdf'
    },
    {
      id: 'mp-m1-sol',
      folderName: 'Model Papers',
      subfolderName: 'Class 10 Mathematics',
      title: 'Real Numbers Model Paper - Complete Handwritten Solutions & Step Marking',
      fileType: 'pdf',
      fileSize: '2.5 MB',
      uploadedAt: '22 Oct 2026',
      downloads: 41,
      details: 'Step-by-step solution manual explaining how to score 100% on 3-mark and 5-mark proofs.',
      fileName: 'Real_Numbers_Model_Paper_Solutions.pdf',
      fileUrl: '/api/storage/file/sample-quiz-ch1.pdf'
    }
  ],
  'math-ch8': [
    {
      id: 'mp-m8',
      folderName: 'Model Papers',
      subfolderName: 'Class 10 Mathematics',
      title: 'Trigonometry & Heights - Board Exam Practice Model Paper (Set B)',
      fileType: 'pdf',
      fileSize: '1.6 MB',
      uploadedAt: '22 Oct 2026',
      downloads: 49,
      details: 'Real-life height & distance case studies with airplane and lighthouse angles.',
      fileName: 'Trigonometry_Model_Paper_2026.pdf',
      fileUrl: '/api/storage/file/sample-assignment6.pdf'
    }
  ],
  'sci-ch1': [
    {
      id: 'mp-s1',
      folderName: 'Model Papers',
      subfolderName: 'Class 10 Science',
      title: 'Chemical Reactions - High Probability Board Exam Model Question Paper',
      fileType: 'pdf',
      fileSize: '1.4 MB',
      uploadedAt: '19 Oct 2026',
      downloads: 37,
      details: '15 MCQs, 5 Reasoning, 4 Experimental questions, and full answer key.',
      fileName: 'Chemical_Reactions_Model_Paper.pdf',
      fileUrl: '/api/storage/file/sample-quiz-ch1.pdf'
    }
  ],
  'sci-ch6': [
    {
      id: 'mp-s6',
      folderName: 'Model Papers',
      subfolderName: 'Class 10 Science',
      title: 'Life Processes Model Examination Paper with Diagram Worksheets',
      fileType: 'pdf',
      fileSize: '1.9 MB',
      uploadedAt: '20 Oct 2026',
      downloads: 45,
      details: 'Covers stomata opening/closing, nephron function, and double circulation questions.',
      fileName: 'Life_Processes_Model_Paper.pdf',
      fileUrl: '/api/storage/file/sample-quiz-ch1.pdf'
    }
  ],
  'eng-ch1': [
    {
      id: 'mp-e1',
      folderName: 'Model Papers',
      subfolderName: 'Class 10 English',
      title: 'English Language & Literature - Section C Prose Model Practice Paper',
      fileType: 'pdf',
      fileSize: '1.1 MB',
      uploadedAt: '18 Oct 2026',
      downloads: 32,
      details: 'Extract-based comprehension questions and 100-word long answer writing practice.',
      fileName: 'English_Prose_Model_Paper.pdf',
      fileUrl: '/api/storage/file/sample-notes-ch1.pdf'
    }
  ]
};

export const sampleLectures: Record<string, RecordedVideo[]> = {
  'math-ch1': [
    {
      id: 'rec-m1-1',
      title: 'Real Numbers Masterclass Part 1: Fundamental Theorem of Arithmetic & Prime Factorization',
      batchId: 'b-prarambh',
      batchName: 'Prarambh Batch (Class 10 Board Excellence)',
      subject: 'Mathematics',
      chapterName: 'Chapter 1: Real Numbers',
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      videoSource: 'youtube',
      duration: '52 mins',
      recordedDate: '17 Oct 2026',
      teacherName: 'Sarla Sharma',
      description: 'In-depth breakdown of prime decomposition, unique factor trees, and quick HCF/LCM problem-solving techniques.',
      notesAttachmentUrl: '/api/storage/file/sample-notes-ch1.pdf',
      viewsCount: 148
    },
    {
      id: 'rec-m1-2',
      title: 'Real Numbers Masterclass Part 2: Rigorous Proof of Irrationality for √2, √3 and 5 - √3',
      batchId: 'b-prarambh',
      batchName: 'Prarambh Batch (Class 10 Board Excellence)',
      subject: 'Mathematics',
      chapterName: 'Chapter 1: Real Numbers',
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      videoSource: 'youtube',
      duration: '46 mins',
      recordedDate: '18 Oct 2026',
      teacherName: 'Sarla Sharma',
      description: 'Step-by-step method of contradiction walkthrough to guarantee 3/3 marks on board examination questions.',
      notesAttachmentUrl: '/api/storage/file/sample-notes-ch1.pdf',
      viewsCount: 122
    }
  ],
  'math-ch8': [
    {
      id: 'rec-m8-1',
      title: 'Trigonometry Masterclass: Derivation of sin²θ + cos²θ = 1 and Identity Transformations',
      batchId: 'b-prarambh',
      batchName: 'Prarambh Batch (Class 10 Board Excellence)',
      subject: 'Mathematics',
      chapterName: 'Chapter 8: Introduction to Trigonometry',
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      videoSource: 'youtube',
      duration: '48 mins',
      recordedDate: '20 Oct 2026',
      teacherName: 'Sarla Sharma',
      description: 'Comprehensive derivation of the three fundamental trigonometric identities and Olympiad-level shortcuts.',
      notesAttachmentUrl: '/api/storage/file/sample-notes-ch1.pdf',
      viewsCount: 185
    }
  ],
  'sci-ch1': [
    {
      id: 'rec-s1-1',
      title: 'Chemical Reactions: Balancing Equations, Redox Reactions & Corrosion Prevention',
      batchId: 'b-prarambh',
      batchName: 'Prarambh Batch (Class 10 Board Excellence)',
      subject: 'Science',
      chapterName: 'Chapter 1: Chemical Reactions and Equations',
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      videoSource: 'youtube',
      duration: '44 mins',
      recordedDate: '16 Oct 2026',
      teacherName: 'Rajesh Verma',
      description: 'Interactive demonstration of combination, decomposition, displacement, and precipitation reactions.',
      notesAttachmentUrl: '/api/storage/file/sample-matter.pdf',
      viewsCount: 110
    }
  ],
  'sci-ch6': [
    {
      id: 'rec-s6-1',
      title: 'Life Processes Lecture: Human Circulatory System & Double Circulation Explained',
      batchId: 'b-prarambh',
      batchName: 'Prarambh Batch (Class 10 Board Excellence)',
      subject: 'Science',
      chapterName: 'Chapter 6: Life Processes',
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      videoSource: 'youtube',
      duration: '50 mins',
      recordedDate: '19 Oct 2026',
      teacherName: 'Rajesh Verma',
      description: 'Detailed 3D animated walkthrough of heart chambers, systemic vs pulmonary loops, and valves.',
      notesAttachmentUrl: '/api/storage/file/sample-matter.pdf',
      viewsCount: 135
    }
  ],
  'eng-ch1': [
    {
      id: 'rec-e1-1',
      title: 'First Flight: A Letter to God by Gregorio López Fuentes - In-Depth Literary Analysis',
      batchId: 'b-prarambh',
      batchName: 'Prarambh Batch (Class 10 Board Excellence)',
      subject: 'English',
      chapterName: 'Chapter 1: A Letter to God',
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      videoSource: 'youtube',
      duration: '38 mins',
      recordedDate: '15 Oct 2026',
      teacherName: 'Ananya Mukherjee',
      description: 'Literary symbolism, irony analysis, and character comparison between Lencho and the postmaster.',
      notesAttachmentUrl: '/api/storage/file/sample-notes-ch1.pdf',
      viewsCount: 94
    }
  ]
};

// Enriched Batches Catalog
export const defaultEnrichedBatches: Batch[] = [
  {
    id: 'b-prarambh',
    name: 'Prarambh Batch',
    grade: 'Class 10 Board Exam 2026-27',
    subject: 'All Subjects (Math, Science, English, SST, Bio)',
    studentCount: 84,
    lastClassDate: 'Today, 10:00 AM',
    scheduleTime: '10:00 AM - 01:00 PM',
    roomCode: 'PRARAMBH-10',
    nextTopic: 'Trigonometric Identities & Life Processes',
    status: 'active',
    teacherId: 't-sarla',
    teacherName: 'Sarla Sharma & Faculty Team',
    monthlyFee: 2500,
    duration: '1 Year',
    fullBatchPrice: 9999,
    coverImage: '/assets/images/prarambh_batch_cover_1792850863933.jpg',
    thumbnail_url: '/assets/images/prarambh_batch_cover_1792850863933.jpg',
    description: "Achiever Academy's premier comprehensive foundation batch for Class 10 board aspirants. Designed with meticulous syllabus coverage led by CTET & B.Ed qualified educators. Features high-yield structured notes, formula handbooks, animated visual explanations, and daily practice problem sets. Includes complete chapter-wise recorded video archives with data-saver streaming, doubt clearing sessions, and rigorous model question papers aligned with the latest CBSE/State examination pattern.",
    subjects: [
      {
        id: 'sub-p-math',
        name: 'Mathematics',
        price: 2800,
        duration: '1 Year',
        teacherName: 'Sarla Sharma (B.Ed, CTET)',
        iconName: 'Calculator',
        description: 'Comprehensive Class 10 CBSE/State Mathematics covering Real Numbers, Polynomials, Linear Equations, Trigonometry, and Statistics with NCERT Exemplar & RD Sharma problem sets.',
        chapters: [
          {
            id: 'ch-m-1',
            chapterNumber: 1,
            title: 'Chapter 1: Real Numbers',
            description: 'Fundamental Theorem of Arithmetic, irrationality proofs, HCF and LCM applications.',
            lectures: sampleLectures['math-ch1'] || [],
            notes: sampleNotes['math-ch1'] || [],
            modelPapers: sampleModelPapers['math-ch1'] || []
          },
          {
            id: 'ch-m-2',
            chapterNumber: 2,
            title: 'Chapter 2: Polynomials',
            description: 'Geometric meaning of zeroes, relationship between coefficients and zeroes of quadratic polynomials.',
            lectures: sampleLectures['math-ch1'] || [],
            notes: sampleNotes['math-ch1'] || [],
            modelPapers: sampleModelPapers['math-ch1'] || []
          },
          {
            id: 'ch-m-3',
            chapterNumber: 3,
            title: 'Chapter 3: Pair of Linear Equations',
            description: 'Graphical and algebraic methods: substitution, elimination, and real-world word problems.',
            lectures: sampleLectures['math-ch1'] || [],
            notes: sampleNotes['math-ch1'] || [],
            modelPapers: sampleModelPapers['math-ch1'] || []
          },
          {
            id: 'ch-m-8',
            chapterNumber: 8,
            title: 'Chapter 8: Introduction to Trigonometry',
            description: 'Trigonometric ratios, values of ratios for standard angles (0°, 30°, 45°, 60°, 90°), and trigonometric identities.',
            lectures: sampleLectures['math-ch8'] || [],
            notes: sampleNotes['math-ch8'] || [],
            modelPapers: sampleModelPapers['math-ch8'] || []
          }
        ]
      },
      {
        id: 'sub-p-sci',
        name: 'Science (Physics & Chemistry)',
        price: 2500,
        duration: '1 Year',
        teacherName: 'Rajesh Verma (M.Sc Physics, B.Ed)',
        iconName: 'FlaskConical',
        description: 'Complete Science preparation featuring experimental demonstrations, chemical balancing shortcuts, optics ray diagrams, and electricity numericals.',
        chapters: [
          {
            id: 'ch-s-1',
            chapterNumber: 1,
            title: 'Chapter 1: Chemical Reactions and Equations',
            description: 'Chemical equation writing, balancing techniques, types of chemical reactions, oxidation, reduction, and corrosion.',
            lectures: sampleLectures['sci-ch1'] || [],
            notes: sampleNotes['sci-ch1'] || [],
            modelPapers: sampleModelPapers['sci-ch1'] || []
          },
          {
            id: 'ch-s-6',
            chapterNumber: 6,
            title: 'Chapter 6: Life Processes',
            description: 'Basic concepts of nutrition, respiration, transport, and excretion in plants and animals.',
            lectures: sampleLectures['sci-ch6'] || [],
            notes: sampleNotes['sci-ch6'] || [],
            modelPapers: sampleModelPapers['sci-ch6'] || []
          },
          {
            id: 'ch-s-10',
            chapterNumber: 10,
            title: 'Chapter 10: Light - Reflection and Refraction',
            description: 'Spherical mirrors, image formation, mirror formula, magnification, refraction through lenses, and power of a lens.',
            lectures: sampleLectures['sci-ch1'] || [],
            notes: sampleNotes['sci-ch1'] || [],
            modelPapers: sampleModelPapers['sci-ch1'] || []
          }
        ]
      },
      {
        id: 'sub-p-eng',
        name: 'English (Language & Literature)',
        price: 2200,
        duration: '1 Year',
        teacherName: 'Ananya Mukherjee (M.A. English, CTET)',
        iconName: 'BookMarked',
        description: 'First Flight prose and poetry, Footprints Without Feet, formal letter/analytical paragraph writing, and integrated grammar drills.',
        chapters: [
          {
            id: 'ch-e-1',
            chapterNumber: 1,
            title: 'Chapter 1: A Letter to God',
            description: 'Story analysis, theme of blind faith versus human goodness, character sketches, and board examination question solutions.',
            lectures: sampleLectures['eng-ch1'] || [],
            notes: sampleNotes['eng-ch1'] || [],
            modelPapers: sampleModelPapers['eng-ch1'] || []
          },
          {
            id: 'ch-e-2',
            chapterNumber: 2,
            title: 'Chapter 2: Nelson Mandela - Long Walk to Freedom',
            description: 'Historical apartheid context, ideals of freedom and courage, stylistic prose analysis, and extract-based questions.',
            lectures: sampleLectures['eng-ch1'] || [],
            notes: sampleNotes['eng-ch1'] || [],
            modelPapers: sampleModelPapers['eng-ch1'] || []
          },
          {
            id: 'ch-e-3',
            chapterNumber: 3,
            title: 'Grammar: Tenses, Modals & Active/Passive Voice',
            description: 'Comprehensive rules for board error-correction, gap-filling, reported speech, and sentence transformation.',
            lectures: sampleLectures['eng-ch1'] || [],
            notes: sampleNotes['eng-ch1'] || [],
            modelPapers: sampleModelPapers['eng-ch1'] || []
          }
        ]
      },
      {
        id: 'sub-p-sst',
        name: 'Social Science (History, Geo, Pol Sci, Eco)',
        price: 2200,
        duration: '1 Year',
        teacherName: 'Pradeep Joshi (B.Tech, CTET Qualified)',
        iconName: 'Globe2',
        description: 'Complete syllabus coverage of Rise of Nationalism, Resources, Federalism, Money and Credit with map skills and assertion-reason bank.',
        chapters: [
          {
            id: 'ch-sst-1',
            chapterNumber: 1,
            title: 'History Ch 1: The Rise of Nationalism in Europe',
            description: 'French Revolution ideas, Napoleon Civil Code, unification of Italy and Germany, visual symbols, and nationalism.',
            lectures: sampleLectures['eng-ch1'] || [],
            notes: sampleNotes['eng-ch1'] || [],
            modelPapers: sampleModelPapers['eng-ch1'] || []
          },
          {
            id: 'ch-sst-2',
            chapterNumber: 2,
            title: 'Geography Ch 1: Resources and Development',
            description: 'Types of resources, land degradation, conservation, soil classification of India, and map plotting practice.',
            lectures: sampleLectures['eng-ch1'] || [],
            notes: sampleNotes['eng-ch1'] || [],
            modelPapers: sampleModelPapers['eng-ch1'] || []
          }
        ]
      },
      {
        id: 'sub-p-bio',
        name: 'Biology & Environmental Science',
        price: 2000,
        duration: '1 Year',
        teacherName: 'Sarla Sharma (B.Ed, CTET)',
        iconName: 'Dna',
        description: 'Control & coordination in organisms, reproduction, heredity, environment, and ecosystem balance with diagram practice.',
        chapters: [
          {
            id: 'ch-b-1',
            chapterNumber: 1,
            title: 'Chapter 7: Control and Coordination',
            description: 'Nervous system in animals, reflex arc, human brain structure, and plant tropic and nastic movements.',
            lectures: sampleLectures['sci-ch6'] || [],
            notes: sampleNotes['sci-ch6'] || [],
            modelPapers: sampleModelPapers['sci-ch6'] || []
          },
          {
            id: 'ch-b-2',
            chapterNumber: 2,
            title: 'Chapter 13: Our Environment',
            description: 'Ecosystem trophic levels, food chains, biological magnification, and ozone layer depletion.',
            lectures: sampleLectures['sci-ch6'] || [],
            notes: sampleNotes['sci-ch6'] || [],
            modelPapers: sampleModelPapers['sci-ch6'] || []
          }
        ]
      }
    ]
  },
  {
    id: 'b-abhyas',
    name: 'Abhyas Batch',
    grade: 'Class 9 Foundation & Olympiad 2026-27',
    subject: 'Science, Mathematics, English, Social Studies',
    studentCount: 52,
    lastClassDate: 'Today, 11:30 AM',
    scheduleTime: '11:30 AM - 02:00 PM',
    roomCode: 'ABHYAS-09',
    nextTopic: 'Gravitation & Number Systems',
    status: 'active',
    teacherId: 't-rajesh',
    teacherName: 'Rajesh Verma & Faculty Team',
    monthlyFee: 2200,
    duration: '1 Year',
    fullBatchPrice: 8499,
    coverImage: '/assets/images/abhyas_batch_cover_1792850865258.jpg',
    thumbnail_url: '/assets/images/abhyas_batch_cover_1792850865258.jpg',
    description: "Achiever Academy's rigorous foundation and Olympiad excellence program for Class 9 students. Guided by experienced educators with deep expertise in conceptual sciences and competitive mathematics. Provides top-tier structured revision notes, formula cheat sheets, illustrative diagrams, and daily practice problem sets. Features full chapter-wise recorded lectures with low-data streaming, interactive doubt-clearing sessions, and authentic model test papers designed for school board exams and national Olympiads.",
    subjects: [
      {
        id: 'sub-a-sci',
        name: 'Science & Physics',
        price: 2500,
        duration: '1 Year',
        teacherName: 'Rajesh Verma (M.Sc Physics, B.Ed)',
        iconName: 'Atom',
        description: 'Motion, Force, Laws of Motion, Gravitation, Work & Energy, and Matter in our Surroundings with concept quizzes.',
        chapters: [
          {
            id: 'ch-as-1',
            chapterNumber: 1,
            title: 'Chapter 1: Matter in Our Surroundings',
            description: 'Physical nature of matter, characteristics of particles, states of matter, and evaporation factors.',
            lectures: sampleLectures['sci-ch1'] || [],
            notes: sampleNotes['sci-ch1'] || [],
            modelPapers: sampleModelPapers['sci-ch1'] || []
          },
          {
            id: 'ch-as-10',
            chapterNumber: 10,
            title: 'Chapter 10: Gravitation & Kepler Laws',
            description: 'Universal law of gravitation, free fall, acceleration due to gravity, mass vs weight, and Archimedes principle.',
            lectures: sampleLectures['sci-ch1'] || [],
            notes: sampleNotes['sci-ch1'] || [],
            modelPapers: sampleModelPapers['sci-ch1'] || []
          }
        ]
      },
      {
        id: 'sub-a-math',
        name: 'Mathematics',
        price: 2400,
        duration: '1 Year',
        teacherName: 'Sarla Sharma (B.Ed, CTET)',
        iconName: 'Compass',
        description: 'Number Systems, Polynomials, Coordinate Geometry, Lines and Angles, Triangles, and Surface Areas.',
        chapters: [
          {
            id: 'ch-am-1',
            chapterNumber: 1,
            title: 'Chapter 1: Number Systems',
            description: 'Rational numbers, irrational numbers on number line, real numbers operations, and laws of exponents.',
            lectures: sampleLectures['math-ch1'] || [],
            notes: sampleNotes['math-ch1'] || [],
            modelPapers: sampleModelPapers['math-ch1'] || []
          }
        ]
      },
      {
        id: 'sub-a-eng',
        name: 'English Grammar & Literature',
        price: 2000,
        duration: '1 Year',
        teacherName: 'Ananya Mukherjee (M.A. English, CTET)',
        iconName: 'BookOpen',
        description: 'Beehive prose/poetry, Moments supplementary reader, descriptive paragraph writing, and diary entry format.',
        chapters: [
          {
            id: 'ch-ae-1',
            chapterNumber: 1,
            title: 'Chapter 1: The Fun They Had by Isaac Asimov',
            description: 'Futuristic schools, robotic teachers, paper books nostalgia, vocabulary building, and character analysis.',
            lectures: sampleLectures['eng-ch1'] || [],
            notes: sampleNotes['eng-ch1'] || [],
            modelPapers: sampleModelPapers['eng-ch1'] || []
          }
        ]
      }
    ]
  },
  {
    id: 'b-sankalp',
    name: 'Sankalp Batch',
    grade: 'Class 8 Comprehensive Foundation',
    subject: 'Mathematics, Science, English, Social Science',
    studentCount: 38,
    lastClassDate: 'Yesterday, 04:00 PM',
    scheduleTime: '04:00 PM - 06:30 PM',
    roomCode: 'SANKALP-08',
    nextTopic: 'Rational Numbers & Crop Management',
    status: 'active',
    teacherId: 't-ananya',
    teacherName: 'Ananya Mukherjee & Faculty Team',
    monthlyFee: 2000,
    duration: '1 Year',
    fullBatchPrice: 6999,
    coverImage: '/assets/images/sankalp_batch_cover_1792850865329.jpg',
    thumbnail_url: '/assets/images/sankalp_batch_cover_1792850865329.jpg',
    description: "Achiever Academy's specialized middle-school mastery batch for Class 8 students transitioning to senior academics. Formulated by passionate CTET & B.Ed teachers to cultivate strong foundations in Mathematics, Science, and English. Incorporates comprehensive chapter-wise study notes, curated formula handbooks, and step-by-step problem-solving worksheets. Delivers unlimited 1-year access to high-definition recorded archives, teacher-verified doubt resolutions, and practice model question papers aligned with the latest syllabus.",
    subjects: [
      {
        id: 'sub-sk-math',
        name: 'Mathematics',
        price: 2200,
        duration: '1 Year',
        teacherName: 'Sarla Sharma (B.Ed, CTET)',
        iconName: 'Layers',
        description: 'Rational numbers, Linear equations, Understanding quadrilaterals, Data handling, and Mensuration.',
        chapters: [
          {
            id: 'ch-skm-1',
            chapterNumber: 1,
            title: 'Chapter 1: Rational Numbers',
            description: 'Properties of rational numbers: closure, commutativity, associativity, and representation on number line.',
            lectures: sampleLectures['math-ch1'] || [],
            notes: sampleNotes['math-ch1'] || [],
            modelPapers: sampleModelPapers['math-ch1'] || []
          }
        ]
      },
      {
        id: 'sub-sk-sci',
        name: 'Science & Nature Studies',
        price: 2200,
        duration: '1 Year',
        teacherName: 'Rajesh Verma (M.Sc Physics, B.Ed)',
        iconName: 'Sparkles',
        description: 'Crop production, Microorganisms, Coal & petroleum, Combustion, and Reproduction in animals.',
        chapters: [
          {
            id: 'ch-sks-1',
            chapterNumber: 1,
            title: 'Chapter 1: Crop Production and Management',
            description: 'Agricultural practices: preparation of soil, sowing, manures, fertilizers, irrigation, and storage.',
            lectures: sampleLectures['sci-ch1'] || [],
            notes: sampleNotes['sci-ch1'] || [],
            modelPapers: sampleModelPapers['sci-ch1'] || []
          }
        ]
      },
      {
        id: 'sub-sk-eng',
        name: 'English Grammar & Composition',
        price: 1800,
        duration: '1 Year',
        teacherName: 'Ananya Mukherjee (M.A. English, CTET)',
        iconName: 'FileEdit',
        description: 'Honeydew reader, It So Happened supplementary, story writing, letter writing, and speech delivery.',
        chapters: [
          {
            id: 'ch-ske-1',
            chapterNumber: 1,
            title: 'Chapter 1: The Best Christmas Present in the World',
            description: 'World War I truce letter, themes of peace, compassion, Mrs. Macpherson character breakdown.',
            lectures: sampleLectures['eng-ch1'] || [],
            notes: sampleNotes['eng-ch1'] || [],
            modelPapers: sampleModelPapers['eng-ch1'] || []
          }
        ]
      }
    ]
  }
];

// Initial Teacher Contracts
export const defaultTeacherContracts: TeacherContract[] = [
  {
    teacherId: 't-sarla',
    teacherName: 'Sarla Sharma',
    model: 'revenue_share',
    revenueSharePercent: 35,
    fixedMonthlySalary: 0,
    assignedSubjects: ['Mathematics (Class 10)', 'Science & Biology (Class 10)'],
    terms: '35% revenue share from all direct enrolled students in Mathematics & Science batches. Monthly payout reconciled by 5th of each calendar month.',
    effectiveDate: '01 Apr 2026',
    renewalDate: '31 Mar 2027',
    totalPaid: 84000,
    pendingDue: 14200,
    payoutHistory: [
      {
        id: 'pay-s1',
        teacherId: 't-sarla',
        teacherName: 'Sarla Sharma',
        amount: 42000,
        date: '05 Sep 2026',
        paymentMode: 'Bank Transfer',
        transactionRef: 'NEFT-SBIN26090511849',
        notes: 'August 2026 course revenue share payout',
        status: 'completed'
      },
      {
        id: 'pay-s2',
        teacherId: 't-sarla',
        teacherName: 'Sarla Sharma',
        amount: 42000,
        date: '05 Oct 2026',
        paymentMode: 'Bank Transfer',
        transactionRef: 'NEFT-SBIN26100599104',
        notes: 'September 2026 course revenue share payout',
        status: 'completed'
      }
    ]
  },
  {
    teacherId: 't-rajesh',
    teacherName: 'Rajesh Verma',
    model: 'hybrid',
    revenueSharePercent: 15,
    fixedMonthlySalary: 38000,
    assignedSubjects: ['Science & Physics (Class 9 & 10)'],
    terms: 'Fixed monthly retainer of ₹38,000 + 15% revenue share on physics masterclass enrollments. Covers live sessions and lab demonstration recordings.',
    effectiveDate: '01 May 2026',
    renewalDate: '30 Apr 2027',
    totalPaid: 76000,
    pendingDue: 8500,
    payoutHistory: [
      {
        id: 'pay-r1',
        teacherId: 't-rajesh',
        teacherName: 'Rajesh Verma',
        amount: 38000,
        date: '04 Sep 2026',
        paymentMode: 'UPI',
        transactionRef: 'UPI-HDFC881920192',
        notes: 'August 2026 fixed retainer payout',
        status: 'completed'
      },
      {
        id: 'pay-r2',
        teacherId: 't-rajesh',
        teacherName: 'Rajesh Verma',
        amount: 38000,
        date: '04 Oct 2026',
        paymentMode: 'UPI',
        transactionRef: 'UPI-HDFC991029314',
        notes: 'September 2026 fixed retainer payout',
        status: 'completed'
      }
    ]
  },
  {
    teacherId: 't-ananya',
    teacherName: 'Ananya Mukherjee',
    model: 'revenue_share',
    revenueSharePercent: 30,
    fixedMonthlySalary: 0,
    assignedSubjects: ['English Literature & Grammar (Class 8 & 10)'],
    terms: '30% revenue share from all English language course enrollments and model test paper reviews.',
    effectiveDate: '01 Jun 2026',
    renewalDate: '31 May 2027',
    totalPaid: 48000,
    pendingDue: 6200,
    payoutHistory: [
      {
        id: 'pay-a1',
        teacherId: 't-ananya',
        teacherName: 'Ananya Mukherjee',
        amount: 24000,
        date: '05 Sep 2026',
        paymentMode: 'Bank Transfer',
        transactionRef: 'NEFT-ICIC26090533211',
        notes: 'August 2026 English faculty compensation',
        status: 'completed'
      },
      {
        id: 'pay-a2',
        teacherId: 't-ananya',
        teacherName: 'Ananya Mukherjee',
        amount: 24000,
        date: '05 Oct 2026',
        paymentMode: 'Bank Transfer',
        transactionRef: 'NEFT-ICIC26100588492',
        notes: 'September 2026 English faculty compensation',
        status: 'completed'
      }
    ]
  },
  {
    teacherId: 't-pradeep',
    teacherName: 'Pradeep Joshi',
    model: 'fixed_salary',
    revenueSharePercent: 0,
    fixedMonthlySalary: 30000,
    assignedSubjects: ['Social Science & Olympiad Foundation'],
    terms: 'Fixed monthly fee of ₹30,000 for SST curriculum creation, model questions, and Olympiad problem setting.',
    effectiveDate: '01 Jul 2026',
    renewalDate: '30 Jun 2027',
    totalPaid: 60000,
    pendingDue: 5000,
    payoutHistory: [
      {
        id: 'pay-p1',
        teacherId: 't-pradeep',
        teacherName: 'Pradeep Joshi',
        amount: 30000,
        date: '06 Sep 2026',
        paymentMode: 'UPI',
        transactionRef: 'UPI-AXIS260906112',
        notes: 'August 2026 curriculum development compensation',
        status: 'completed'
      },
      {
        id: 'pay-p2',
        teacherId: 't-pradeep',
        teacherName: 'Pradeep Joshi',
        amount: 30000,
        date: '06 Oct 2026',
        paymentMode: 'UPI',
        transactionRef: 'UPI-AXIS261006994',
        notes: 'September 2026 curriculum development compensation',
        status: 'completed'
      }
    ]
  }
];

// Initial Course Enrollments / Transaction Logs
export const defaultEnrollments: CourseEnrollment[] = [
  {
    id: 'enr-1',
    studentId: 's-1',
    studentName: 'Rahul Verma',
    studentEmail: 'rahul.v@anushree.edu',
    studentPhone: '+91 98201 11001',
    batchId: 'b-prarambh',
    batchName: 'Prarambh Batch',
    subjectId: 'sub-p-math',
    subjectName: 'Mathematics',
    pricePaid: 2800,
    paymentMode: 'UPI',
    transactionRef: 'UPI-UTR-428819011299',
    enrolledAt: '10 Sep 2026',
    expiresAt: '10 Sep 2027',
    status: 'active'
  },
  {
    id: 'enr-2',
    studentId: 's-1',
    studentName: 'Rahul Verma',
    studentEmail: 'rahul.v@anushree.edu',
    studentPhone: '+91 98201 11001',
    batchId: 'b-prarambh',
    batchName: 'Prarambh Batch',
    subjectId: 'sub-p-sci',
    subjectName: 'Science (Physics & Chemistry)',
    pricePaid: 2500,
    paymentMode: 'UPI',
    transactionRef: 'UPI-UTR-428819011300',
    enrolledAt: '12 Sep 2026',
    expiresAt: '12 Sep 2027',
    status: 'active'
  },
  {
    id: 'enr-3',
    studentId: 's-2',
    studentName: 'Priya Patel',
    studentEmail: 'priya.p@anushree.edu',
    studentPhone: '+91 98201 11002',
    batchId: 'b-prarambh',
    batchName: 'Prarambh Batch',
    subjectId: 'sub-p-math',
    subjectName: 'Mathematics',
    pricePaid: 2800,
    paymentMode: 'UPI',
    transactionRef: 'UPI-UTR-428820993411',
    enrolledAt: '14 Sep 2026',
    expiresAt: '14 Sep 2027',
    status: 'active'
  },
  {
    id: 'enr-4',
    studentId: 's-4',
    studentName: 'Sneha Roy',
    studentEmail: 'sneha.r@anushree.edu',
    studentPhone: '+91 98201 11004',
    batchId: 'b-prarambh',
    batchName: 'Prarambh Batch',
    pricePaid: 9999,
    paymentMode: 'UPI',
    transactionRef: 'UPI-UTR-428899120034',
    enrolledAt: '18 Sep 2026',
    expiresAt: '18 Sep 2027',
    status: 'active'
  },
  {
    id: 'enr-5',
    studentId: 's-9',
    studentName: 'Aryan Joshi',
    studentEmail: 'aryan.j@anushree.edu',
    studentPhone: '+91 98201 22001',
    batchId: 'b-abhyas',
    batchName: 'Abhyas Batch',
    subjectId: 'sub-a-sci',
    subjectName: 'Science & Physics',
    pricePaid: 2500,
    paymentMode: 'UPI',
    transactionRef: 'UPI-UTR-428911004921',
    enrolledAt: '26 Sep 2026',
    expiresAt: '26 Sep 2027',
    status: 'active'
  },
  {
    id: 'enr-6',
    studentId: 's-12',
    studentName: 'Ishita Nair',
    studentEmail: 'ishita.n@anushree.edu',
    studentPhone: '+91 98201 33001',
    batchId: 'b-sankalp',
    batchName: 'Sankalp Batch',
    subjectId: 'sub-sk-math',
    subjectName: 'Mathematics',
    pricePaid: 2200,
    paymentMode: 'UPI',
    transactionRef: 'UPI-UTR-429001449102',
    enrolledAt: '01 Oct 2026',
    expiresAt: '01 Oct 2027',
    status: 'active'
  }
];
