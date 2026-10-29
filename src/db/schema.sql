-- =====================================================================
-- ACHIEVER ACADEMY - ENTERPRISE SUPABASE DATABASE SCHEMA & STRICT RLS
-- National-Level Online Coaching Platform with Dynamic Course, Syllabus,
-- Certificate Customization & Automated Student Management
-- =====================================================================

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================================
-- 2. PROFILES TABLE (Supabase Auth User Profiles with Multi-Role RBAC)
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone_whatsapp TEXT NOT NULL,
    class_target TEXT, -- e.g., 'Class 10 CBSE', 'Class 12 Board', 'JEE/NEET'
    parent_phone TEXT,
    role TEXT NOT NULL CHECK (role IN ('student', 'teacher', 'admin')) DEFAULT 'student',
    subject TEXT, -- For teachers: assigned academic subject e.g. 'Mathematics', 'Science', 'Physics'
    avatar_url TEXT,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'pending', 'suspended')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- =====================================================================
-- 3. BATCHES TABLE (With Dedicated thumbnail_url for Banners)
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.batches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    grade TEXT NOT NULL,
    subject TEXT NOT NULL,
    schedule_time TEXT NOT NULL DEFAULT '10:00 AM - 11:30 AM',
    room_code TEXT NOT NULL UNIQUE,
    monthly_fee NUMERIC(10,2) NOT NULL DEFAULT 2500.00,
    full_batch_price NUMERIC(10,2) NOT NULL DEFAULT 14999.00,
    description TEXT,
    thumbnail_url TEXT NOT NULL DEFAULT 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&q=80',
    duration TEXT DEFAULT '1 Year Academic Program',
    teacher_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    teacher_name TEXT,
    student_count INT DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'upcoming')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- =====================================================================
-- 4. SUBJECTS TABLE (Hierarchical Course Curriculum)
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.subjects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    batch_id UUID NOT NULL REFERENCES public.batches(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    price NUMERIC(10,2) NOT NULL DEFAULT 2800.00,
    duration TEXT DEFAULT 'Complete Syllabus',
    teacher_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    teacher_name TEXT,
    description TEXT,
    icon_name TEXT DEFAULT 'BookOpen',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- =====================================================================
-- 5. CHAPTERS TABLE (Syllabus Structure & Topics)
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.chapters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
    chapter_number INT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- =====================================================================
-- 6. ENROLLMENTS TABLE (Active Student Access)
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    batch_id UUID NOT NULL REFERENCES public.batches(id) ON DELETE CASCADE,
    subject_id UUID REFERENCES public.subjects(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'pending', 'cancelled')),
    enrolled_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (timezone('utc'::text, now()) + INTERVAL '365 days')
);

-- =====================================================================
-- 7. PAYMENTS & PURCHASES TABLE (With Pending Verification Workflow)
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    student_name TEXT NOT NULL,
    student_email TEXT NOT NULL,
    student_phone TEXT NOT NULL,
    batch_id UUID NOT NULL REFERENCES public.batches(id) ON DELETE CASCADE,
    batch_name TEXT NOT NULL,
    subject_id UUID REFERENCES public.subjects(id) ON DELETE SET NULL,
    subject_name TEXT,
    amount NUMERIC(10,2) NOT NULL,
    payment_mode TEXT NOT NULL DEFAULT 'UPI' CHECK (payment_mode IN ('UPI', 'NetBanking', 'Cash', 'Card')),
    transaction_ref TEXT NOT NULL, -- Bank UTR / UPI Ref Number
    receipt_number TEXT NOT NULL UNIQUE,
    proof_url TEXT,
    status TEXT NOT NULL DEFAULT 'pending_verification' CHECK (status IN ('pending_verification', 'approved', 'rejected')),
    rejection_reason TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    verified_at TIMESTAMPTZ,
    verified_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL
);

-- =====================================================================
-- 8. TIMETABLES TABLE (Smart Lecture Scheduling)
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.timetables (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    batch_id UUID NOT NULL REFERENCES public.batches(id) ON DELETE CASCADE,
    subject_id UUID REFERENCES public.subjects(id) ON DELETE SET NULL,
    subject_name TEXT NOT NULL,
    day_of_week TEXT NOT NULL CHECK (day_of_week IN ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday')),
    start_time TEXT NOT NULL,
    end_time TEXT NOT NULL,
    room_code TEXT NOT NULL,
    topic TEXT NOT NULL,
    teacher_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    teacher_name TEXT NOT NULL,
    color TEXT DEFAULT 'teal',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- =====================================================================
-- 9. ASSIGNMENTS TABLE
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    batch_id UUID NOT NULL REFERENCES public.batches(id) ON DELETE CASCADE,
    subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE,
    chapter_id UUID REFERENCES public.chapters(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    file_url TEXT,
    due_date TIMESTAMPTZ,
    max_marks INT DEFAULT 100,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- =====================================================================
-- 10. DOUBTS & FORUM REPLIES
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.doubts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    student_name TEXT NOT NULL,
    batch_id UUID NOT NULL REFERENCES public.batches(id) ON DELETE CASCADE,
    batch_name TEXT NOT NULL,
    subject_id UUID REFERENCES public.subjects(id) ON DELETE SET NULL,
    subject_name TEXT NOT NULL,
    chapter_name TEXT,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    photo_url TEXT,
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'answered', 'resolved')),
    upvotes INT DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.doubt_replies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    doubt_id UUID NOT NULL REFERENCES public.doubts(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    author_name TEXT NOT NULL,
    author_role TEXT NOT NULL CHECK (author_role IN ('student', 'teacher', 'admin')),
    content TEXT NOT NULL,
    is_teacher_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- =====================================================================
-- 11. CERTIFICATES TABLE (Unique Verification Code AA-FSDB-RK4579)
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.certificates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    batch_id UUID NOT NULL REFERENCES public.batches(id) ON DELETE CASCADE,
    student_name TEXT NOT NULL,
    student_roll_number TEXT,
    batch_name TEXT NOT NULL,
    course_title TEXT NOT NULL,
    issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
    grade TEXT NOT NULL DEFAULT 'A+',
    overall_score NUMERIC(5,2) NOT NULL DEFAULT 95.0,
    verification_code TEXT NOT NULL UNIQUE, -- e.g. AA-FSDB-RK4579
    verification_url TEXT NOT NULL,
    is_unlocked BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- =====================================================================
-- 12. CERTIFICATE_SETTINGS TABLE (Admin Dynamic Customization)
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.certificate_settings (
    id INT PRIMARY KEY DEFAULT 1,
    academy_name TEXT NOT NULL DEFAULT 'Achiever Academy',
    director_name TEXT NOT NULL DEFAULT 'Dr. Vikramaditya Sen',
    director_designation TEXT NOT NULL DEFAULT 'Founder & Academic Director',
    lead_instructor_name TEXT NOT NULL DEFAULT 'Sarla Sharma',
    lead_instructor_designation TEXT NOT NULL DEFAULT 'Head of Academics & Senior Faculty',
    seal_text TEXT NOT NULL DEFAULT 'OFFICIAL SEAL • ACHIEVER ACADEMY • VERIFIED EXCELLENCE',
    tagline TEXT NOT NULL DEFAULT 'Premier National-Level Online Coaching Platform',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT single_row_check CHECK (id = 1)
);

-- Seed default certificate settings if not present
INSERT INTO public.certificate_settings (
    id, academy_name, director_name, director_designation,
    lead_instructor_name, lead_instructor_designation, seal_text
)
VALUES (
    1,
    'Achiever Academy',
    'Dr. Vikramaditya Sen',
    'Founder & Academic Director',
    'Sarla Sharma',
    'Head of Academics & Senior Faculty',
    'OFFICIAL SEAL • ACHIEVER ACADEMY • VERIFIED EXCELLENCE'
)
ON CONFLICT (id) DO NOTHING;

-- =====================================================================
-- 12b. ACADEMIC_TARGETS TABLE (Admin Dynamic Classes / Exam Targets)
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.academic_targets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Seed initial standard targets
INSERT INTO public.academic_targets (name, description) VALUES
    ('Class 10 CBSE Board', 'CBSE Secondary Board Examination Master Preparation'),
    ('Class 12 Board Exam', 'Senior Secondary Board Assessment & High-Score Syllabus'),
    ('Class 9 Foundation & Olympiad', 'Strong Conceptual Base for Science & Math Olympiads'),
    ('Class 11 Science (JEE/NEET)', 'Foundation modules for National Engineering & Medical entrances'),
    ('Class 8 Comprehensive', 'Middle School Fundamentals & Mental Ability Mastery')
ON CONFLICT (name) DO NOTHING;

-- =====================================================================
-- 12c. QUIZZES TABLE (Teacher-Controlled Live Scheduled Assessments)
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.quizzes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    batch_id UUID NOT NULL REFERENCES public.batches(id) ON DELETE CASCADE,
    subject TEXT NOT NULL,
    chapter_name TEXT NOT NULL,
    title TEXT NOT NULL,
    time_limit_minutes INT NOT NULL DEFAULT 15,
    total_marks INT NOT NULL DEFAULT 20,
    pass_marks INT NOT NULL DEFAULT 10,
    is_published BOOLEAN NOT NULL DEFAULT true,
    is_live BOOLEAN NOT NULL DEFAULT false, -- Strict Rule: ONLY visible on student dashboard when teacher activates LIVE
    scheduled_date TEXT,
    scheduled_time TEXT,
    questions JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_by_teacher_name TEXT NOT NULL DEFAULT 'Sarla Sharma',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- =====================================================================
-- 12d. QUIZ_SUBMISSIONS TABLE (Instant Grading & Auto-Disappear Rule)
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.quiz_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quiz_id UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    student_name TEXT NOT NULL,
    student_roll_number TEXT,
    batch_id UUID NOT NULL REFERENCES public.batches(id) ON DELETE CASCADE,
    selected_answers JSONB NOT NULL DEFAULT '{}'::jsonb,
    score NUMERIC(6,2) NOT NULL DEFAULT 0,
    total_marks NUMERIC(6,2) NOT NULL DEFAULT 20,
    percentage NUMERIC(5,2) NOT NULL DEFAULT 0,
    is_passed BOOLEAN NOT NULL DEFAULT false,
    time_taken_seconds INT NOT NULL DEFAULT 0,
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- =====================================================================
-- 12e. BOOKMARKS TABLE (Saved Video Timestamps & Revision Notes)
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.bookmarks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('video_timestamp', 'note_page', 'chapter_topic')),
    title TEXT NOT NULL,
    batch_name TEXT NOT NULL,
    subject_name TEXT NOT NULL,
    chapter_title TEXT NOT NULL,
    target_id TEXT NOT NULL,
    timestamp TEXT,
    page_number INT,
    note_text TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- =====================================================================
-- 13. AUTOMATED AUTH PROFILES SYNC TRIGGER
-- =====================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (
        id,
        full_name,
        email,
        phone_whatsapp,
        class_target,
        parent_phone,
        role,
        subject
    )
    VALUES (
        new.id,
        COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', 'New Achiever'),
        new.email,
        COALESCE(new.raw_user_meta_data->>'phone_whatsapp', new.raw_user_meta_data->>'phone', ''),
        COALESCE(new.raw_user_meta_data->>'class_target', 'Class 10 CBSE'),
        COALESCE(new.raw_user_meta_data->>'parent_phone', ''),
        COALESCE(new.raw_user_meta_data->>'role', 'student'),
        COALESCE(new.raw_user_meta_data->>'subject', NULL)
    )
    ON CONFLICT (id) DO UPDATE SET
        full_name = EXCLUDED.full_name,
        phone_whatsapp = EXCLUDED.phone_whatsapp,
        class_target = EXCLUDED.class_target,
        parent_phone = EXCLUDED.parent_phone,
        updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attach trigger to auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================================
-- 14. ROW LEVEL SECURITY (RLS) HELPER FUNCTIONS
-- =====================================================================
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS TEXT AS $$
    SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.current_teacher_subject()
RETURNS TEXT AS $$
    SELECT subject FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- =====================================================================
-- 15. ENABLE ROW LEVEL SECURITY ON ALL TABLES
-- =====================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timetables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doubts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doubt_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificate_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academic_targets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;

-- =====================================================================
-- 16. STRICT ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================================

-- ---------------- PROFILES POLICIES ----------------
CREATE POLICY "Admins full access to all profiles"
    ON public.profiles FOR ALL
    USING (public.current_user_role() = 'admin');

CREATE POLICY "Users can view and update own profile"
    ON public.profiles FOR ALL
    USING (id = auth.uid());

CREATE POLICY "Teachers can view enrolled students in their subject batches"
    ON public.profiles FOR SELECT
    USING (
        public.current_user_role() = 'teacher' AND
        (role = 'student' OR id = auth.uid())
    );

-- ---------------- BATCHES POLICIES ----------------
CREATE POLICY "Admins full access to batches"
    ON public.batches FOR ALL
    USING (public.current_user_role() = 'admin');

CREATE POLICY "Anyone authenticated can view active batches"
    ON public.batches FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Teachers can update batches they are assigned to"
    ON public.batches FOR UPDATE
    USING (
        public.current_user_role() = 'teacher' AND
        (teacher_id = auth.uid() OR subject = public.current_teacher_subject())
    );

-- ---------------- SUBJECTS POLICIES ----------------
CREATE POLICY "Admins full access to subjects"
    ON public.subjects FOR ALL
    USING (public.current_user_role() = 'admin');

CREATE POLICY "Students and users can view subjects"
    ON public.subjects FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Teachers can manage their own subject"
    ON public.subjects FOR ALL
    USING (
        public.current_user_role() = 'teacher' AND
        (teacher_id = auth.uid() OR name = public.current_teacher_subject())
    );

-- ---------------- CHAPTERS POLICIES ----------------
CREATE POLICY "Admins full access to chapters"
    ON public.chapters FOR ALL
    USING (public.current_user_role() = 'admin');

CREATE POLICY "Students can view chapters of enrolled subjects"
    ON public.chapters FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Teachers can manage chapters belonging to their subject"
    ON public.chapters FOR ALL
    USING (
        public.current_user_role() = 'admin' OR (
            public.current_user_role() = 'teacher' AND
            EXISTS (
                SELECT 1 FROM public.subjects s
                WHERE s.id = chapters.subject_id
                AND (s.teacher_id = auth.uid() OR s.name = public.current_teacher_subject())
            )
        )
    );

-- ---------------- ENROLLMENTS POLICIES ----------------
CREATE POLICY "Admins full access to enrollments"
    ON public.enrollments FOR ALL
    USING (public.current_user_role() = 'admin');

CREATE POLICY "Students can view their own enrollments"
    ON public.enrollments FOR SELECT
    USING (student_id = auth.uid());

CREATE POLICY "Teachers can view enrollments for their subject"
    ON public.enrollments FOR SELECT
    USING (
        public.current_user_role() = 'teacher' AND
        EXISTS (
            SELECT 1 FROM public.subjects s
            WHERE s.id = enrollments.subject_id
            AND (s.teacher_id = auth.uid() OR s.name = public.current_teacher_subject())
        )
    );

-- ---------------- PAYMENTS POLICIES (STRICT FINANCIAL ISOLATION) ----------------
-- Teachers have ZERO access to financial/payment data!
CREATE POLICY "Admins master control over payments"
    ON public.payments FOR ALL
    USING (public.current_user_role() = 'admin');

CREATE POLICY "Students can view and create their own payment requests"
    ON public.payments FOR ALL
    USING (student_id = auth.uid());

-- ---------------- TIMETABLES POLICIES ----------------
CREATE POLICY "Admins full access to timetables"
    ON public.timetables FOR ALL
    USING (public.current_user_role() = 'admin');

CREATE POLICY "Users can view all timetables"
    ON public.timetables FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Teachers can manage timetables for their subject"
    ON public.timetables FOR ALL
    USING (
        public.current_user_role() = 'teacher' AND
        (teacher_id = auth.uid() OR subject_name = public.current_teacher_subject())
    );

-- ---------------- ASSIGNMENTS POLICIES ----------------
CREATE POLICY "Admins full access to assignments"
    ON public.assignments FOR ALL
    USING (public.current_user_role() = 'admin');

CREATE POLICY "Students can view assignments"
    ON public.assignments FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Teachers can manage assignments for their subject"
    ON public.assignments FOR ALL
    USING (
        public.current_user_role() = 'teacher' AND
        EXISTS (
            SELECT 1 FROM public.subjects s
            WHERE s.id = assignments.subject_id
            AND (s.teacher_id = auth.uid() OR s.name = public.current_teacher_subject())
        )
    );

-- ---------------- DOUBTS & REPLIES POLICIES ----------------
CREATE POLICY "Admins full access to doubts"
    ON public.doubts FOR ALL
    USING (public.current_user_role() = 'admin');

CREATE POLICY "Students can manage own doubts and view all doubts"
    ON public.doubts FOR ALL
    USING (
        student_id = auth.uid() OR
        (current_user_role() = 'student')
    );

CREATE POLICY "Teachers can view and answer doubts for their subject"
    ON public.doubts FOR ALL
    USING (
        public.current_user_role() = 'teacher' AND
        (subject_name = public.current_teacher_subject() OR subject_name IS NULL)
    );

CREATE POLICY "All authenticated can read doubt replies"
    ON public.doubt_replies FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Authors can create doubt replies"
    ON public.doubt_replies FOR INSERT
    WITH CHECK (author_id = auth.uid());

-- ---------------- CERTIFICATES POLICIES ----------------
CREATE POLICY "Admins master control over certificates"
    ON public.certificates FOR ALL
    USING (public.current_user_role() = 'admin');

CREATE POLICY "Students can view their own unlocked certificates"
    ON public.certificates FOR SELECT
    USING (student_id = auth.uid());

CREATE POLICY "Public certificate verification by code"
    ON public.certificates FOR SELECT
    TO anon, authenticated
    USING (true);

-- ---------------- CERTIFICATE_SETTINGS POLICIES ----------------
-- Master dynamic settings: Admins can update, everyone authenticated can view
CREATE POLICY "Admins master control over certificate settings"
    ON public.certificate_settings FOR ALL
    USING (public.current_user_role() = 'admin');

CREATE POLICY "All users can view certificate settings for rendering"
    ON public.certificate_settings FOR SELECT
    TO authenticated, anon
    USING (true);

-- ---------------- ACADEMIC_TARGETS POLICIES ----------------
CREATE POLICY "Admins full access to academic targets"
    ON public.academic_targets FOR ALL
    USING (public.current_user_role() = 'admin');

CREATE POLICY "Anyone can view academic targets"
    ON public.academic_targets FOR SELECT
    TO authenticated, anon
    USING (true);

-- ---------------- QUIZZES POLICIES ----------------
CREATE POLICY "Admins full access to quizzes"
    ON public.quizzes FOR ALL
    USING (public.current_user_role() = 'admin');

CREATE POLICY "Teachers can manage quizzes for their subject"
    ON public.quizzes FOR ALL
    USING (
        public.current_user_role() = 'teacher' AND
        (created_by = auth.uid() OR subject = public.current_teacher_subject())
    );

CREATE POLICY "Students can view live quizzes for their enrolled batches"
    ON public.quizzes FOR SELECT
    USING (
        public.current_user_role() = 'student' AND
        is_live = true AND
        EXISTS (
            SELECT 1 FROM public.enrollments e
            WHERE e.batch_id = quizzes.batch_id
            AND e.student_id = auth.uid()
            AND e.status = 'active'
        )
    );

-- ---------------- QUIZ_SUBMISSIONS POLICIES ----------------
CREATE POLICY "Admins full access to quiz submissions"
    ON public.quiz_submissions FOR ALL
    USING (public.current_user_role() = 'admin');

CREATE POLICY "Students can submit and view their own quiz attempts"
    ON public.quiz_submissions FOR ALL
    USING (student_id = auth.uid());

CREATE POLICY "Teachers can view quiz submissions for their subject"
    ON public.quiz_submissions FOR SELECT
    USING (
        public.current_user_role() = 'teacher' AND
        EXISTS (
            SELECT 1 FROM public.quizzes q
            WHERE q.id = quiz_submissions.quiz_id
            AND (q.created_by = auth.uid() OR q.subject = public.current_teacher_subject())
        )
    );

-- ---------------- BOOKMARKS POLICIES ----------------
CREATE POLICY "Admins full access to bookmarks"
    ON public.bookmarks FOR ALL
    USING (public.current_user_role() = 'admin');

CREATE POLICY "Students manage own bookmarks"
    ON public.bookmarks FOR ALL
    USING (student_id = auth.uid());

CREATE POLICY "Teachers can view bookmarks of students in their batches"
    ON public.bookmarks FOR SELECT
    USING (
        public.current_user_role() = 'teacher' AND
        EXISTS (
            SELECT 1 FROM public.batches b
            WHERE b.teacher_id = auth.uid() OR b.subject = public.current_teacher_subject()
        )
    );

-- =====================================================================
-- 17. PERFORMANCE INDEXES
-- =====================================================================
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_batches_subject ON public.batches(subject);
CREATE INDEX IF NOT EXISTS idx_subjects_batch ON public.subjects(batch_id);
CREATE INDEX IF NOT EXISTS idx_chapters_subject ON public.chapters(subject_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_student ON public.enrollments(student_id);
CREATE INDEX IF NOT EXISTS idx_payments_student ON public.payments(student_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(status);
CREATE INDEX IF NOT EXISTS idx_certificates_code ON public.certificates(verification_code);
CREATE INDEX IF NOT EXISTS idx_certificates_student ON public.certificates(student_id);
CREATE INDEX IF NOT EXISTS idx_quizzes_batch ON public.quizzes(batch_id);
CREATE INDEX IF NOT EXISTS idx_quizzes_is_live ON public.quizzes(is_live);
CREATE INDEX IF NOT EXISTS idx_quiz_subs_quiz ON public.quiz_submissions(quiz_id);
CREATE INDEX IF NOT EXISTS idx_quiz_subs_student ON public.quiz_submissions(student_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_student ON public.bookmarks(student_id);
