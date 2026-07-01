-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard/project/qqkijnzadjxttchxjsff/sql/new)

-- 1. Profiles (extends Supabase Auth)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  surname TEXT NOT NULL,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Templates
CREATE TABLE templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category = 'Websites'),
  description TEXT NOT NULL,
  image TEXT,
  price NUMERIC(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Bookings
CREATE TABLE bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  template_id UUID REFERENCES templates(id),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT DEFAULT '',
  type TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Seed templates
INSERT INTO templates (name, category, description, price, image) VALUES
  ('Portfolio Pro', 'Websites', 'A sleek one-page portfolio with smooth scroll and dark mode support.', 49, '/images/portfolio-pro.jpg'),
  ('ShopKit', 'Websites', 'Minimal e-commerce template with cart and checkout flows.', 79, '/images/shopkit.jpg'),
  ('DashView', 'Websites', 'Admin dashboard template with charts, tables, and dark sidebar.', 59, '/images/dash-view.jpg'),
  ('Bloom Restaurant', 'Websites', 'Elegant restaurant website template with menu sections and reservation form.', 34, '/images/bloom.jpg');

-- 5. Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Profiles: users manage their own
CREATE POLICY "Users can read own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Templates: public read, all operations allowed for admin context (Studio portal auth)
CREATE POLICY "Templates public read" ON templates FOR SELECT USING (true);
CREATE POLICY "Admin insert templates" ON templates FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin update templates" ON templates FOR UPDATE USING (true);
CREATE POLICY "Admin delete templates" ON templates FOR DELETE USING (true);

-- Bookings: users manage their own; designers see all
CREATE POLICY "Users read own bookings" ON bookings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own bookings" ON bookings FOR INSERT WITH CHECK (auth.uid() = user_id);
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending';
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS payment_method TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS payment_amount NUMERIC(10,2);
ALTER TABLE bookings ADD IF NOT EXISTS payment_reference TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS payment_proof_url TEXT;

CREATE POLICY "Users update own bookings" ON bookings FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own bookings" ON bookings FOR DELETE USING (auth.uid() = user_id);
-- Admin/designer full access (no auth required — accessed via Studio portal)
CREATE POLICY "Admin read all bookings" ON bookings FOR SELECT USING (true);
CREATE POLICY "Admin update all bookings" ON bookings FOR UPDATE USING (true);
CREATE POLICY "Admin delete all bookings" ON bookings FOR DELETE USING (true);

-- ============================================================
-- 6. Designer Portal
-- ============================================================
CREATE TABLE designers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  name TEXT NOT NULL DEFAULT 'Designer',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE designer_contacts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  password TEXT NOT NULL,
  name TEXT,
  surname TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE designers ENABLE ROW LEVEL SECURITY;
ALTER TABLE designer_contacts ENABLE ROW LEVEL SECURITY;

-- Allow public reads on designers (for login check)
CREATE POLICY "Allow public read designers" ON designers FOR SELECT USING (true);
-- Designer contacts: full access
CREATE POLICY "Allow all read designer_contacts" ON designer_contacts FOR SELECT USING (true);
CREATE POLICY "Allow all insert designer_contacts" ON designer_contacts FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all delete designer_contacts" ON designer_contacts FOR DELETE USING (true);

-- Seed default designer (password: create123)
INSERT INTO designers (email, password, name) VALUES ('admin@innoveta.com', 'create123', 'Designer');

-- ============================================================
-- 7. CMS Pages (Website, Domain & Hosting, Online Courses)
-- ============================================================
CREATE TABLE pages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  image TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE pages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Pages public read" ON pages FOR SELECT USING (true);
CREATE POLICY "Admin insert pages" ON pages FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin update pages" ON pages FOR UPDATE USING (true);
CREATE POLICY "Admin delete pages" ON pages FOR DELETE USING (true);

INSERT INTO pages (slug, title, content, image) VALUES
  ('website', 'Website Templates', '<p>Browse our collection of premium website templates. From one-page portfolios to full e-commerce stores, each template is designed to be modern, responsive, and easy to customize.</p><p>Our website templates include features like dark mode support, smooth animations, SEO-friendly structure, and one-click deployment. Pick your favorite and book it today.</p>', NULL),
  ('domain-hosting', 'Domain & Hosting', '<p>Secure your online identity with our domain registration and hosting services. We offer reliable, fast, and secure hosting solutions for your website.</p><p>Services include domain name registration, SSL certificates, email hosting, and 24/7 technical support.</p>', NULL),
  ('online-courses', 'Online Courses', '<p>Learn design, development, and digital skills with our online courses. Our curated curriculum is designed for beginners and professionals alike.</p><p>Course topics include web design, graphic design, UI/UX, front-end development, and digital marketing.</p>', NULL),
  ('it-integration', 'IT Integration', '<p>We help businesses connect, automate, and scale with seamless IT integrations. From API connections to full system architecture, we bridge the gap between your tools and your goals.</p>', 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800'),
  ('consulting', 'Consulting', '<p>Expert technology consulting to help you make the right decisions. We provide clear, actionable recommendations for startups, design studios, and growing businesses.</p>', 'https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?w=800')
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- 8. Domain Pricing
-- ============================================================
CREATE TABLE domain_pricing (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tld TEXT UNIQUE NOT NULL,
  price NUMERIC(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE domain_pricing ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Domain pricing public read" ON domain_pricing FOR SELECT USING (true);
CREATE POLICY "Admin manage domain pricing" ON domain_pricing FOR ALL USING (true);

INSERT INTO domain_pricing (tld, price) VALUES
  ('com', 14.00),
  ('org', 12.00),
  ('net', 13.00),
  ('io', 29.00),
  ('co', 22.00),
  ('app', 18.00),
  ('dev', 16.00),
  ('me', 20.00),
  ('info', 10.00),
  ('biz', 11.00)
ON CONFLICT (tld) DO NOTHING;

-- ============================================================
-- 9. Storage bucket for payment proofs
-- ============================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('payment-proofs', 'payment-proofs', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Anyone read payment-proofs" ON storage.objects FOR SELECT USING (bucket_id = 'payment-proofs');
CREATE POLICY "Auth upload payment-proofs" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'payment-proofs' AND auth.role() = 'authenticated');
CREATE POLICY "Admin all payment-proofs" ON storage.objects FOR ALL USING (bucket_id = 'payment-proofs' AND EXISTS (SELECT 1 FROM designers WHERE email = auth.email()));

-- ============================================================
-- 10. Online Courses System
-- ============================================================
CREATE TABLE IF NOT EXISTS courses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  price NUMERIC(10,2) DEFAULT 0,
  image TEXT,
  category TEXT NOT NULL DEFAULT 'Online Courses',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS course_lessons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content_type TEXT NOT NULL CHECK (content_type IN ('text', 'video', 'notes')),
  content TEXT NOT NULL DEFAULT '',
  video_url TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS enrollments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  progress REAL DEFAULT 0,
  enrolled_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, course_id)
);

CREATE TABLE IF NOT EXISTS lesson_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES course_lessons(id) ON DELETE CASCADE,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  UNIQUE(user_id, lesson_id)
);

ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Courses public read" ON courses FOR SELECT USING (true);
CREATE POLICY "Admin all courses" ON courses FOR ALL USING (true);
CREATE POLICY "Lessons public read" ON course_lessons FOR SELECT USING (true);
CREATE POLICY "Admin all lessons" ON course_lessons FOR ALL USING (true);
CREATE POLICY "Enrollments user own" ON enrollments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Enrollments insert own" ON enrollments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Enrollments admin all" ON enrollments FOR ALL USING (true);
CREATE POLICY "Lesson progress user own" ON lesson_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Lesson progress insert own" ON lesson_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Lesson progress update own" ON lesson_progress FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Lesson progress admin all" ON lesson_progress FOR ALL USING (true);

INSERT INTO courses (title, description, price, image, category) VALUES
  ('Web Design Fundamentals', 'Learn the basics of web design — color theory, typography, layout, and responsive design. Perfect for beginners.', 49.00, 'https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?w=800', 'Online Courses'),
  ('UI/UX Masterclass', 'Master user interface and user experience design. Covers wireframing, prototyping, usability testing, and Figma.', 79.00, 'https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=800', 'Online Courses')
ON CONFLICT DO NOTHING;

-- Seed lessons for Web Design Fundamentals
INSERT INTO course_lessons (course_id, title, content_type, content, video_url, sort_order)
SELECT c.id, 'Introduction to Web Design', 'text', '<p>Welcome to Web Design Fundamentals! This lesson covers the basic principles of web design including layout, color theory, and typography.</p><p>Web design combines creativity with technical skills to produce digital experiences that are both beautiful and functional.</p><h3>Key Principles</h3><ul><li><strong>Hierarchy</strong> — Guide the user''s eye through the page</li><li><strong>Balance</strong> — Distribute elements evenly</li><li><strong>Contrast</strong> — Make important elements stand out</li><li><strong>Consistency</strong> — Keep a uniform look and feel</li></ul>', NULL, 1
FROM courses c WHERE c.title = 'Web Design Fundamentals'
ON CONFLICT DO NOTHING;

INSERT INTO course_lessons (course_id, title, content_type, content, video_url, sort_order)
SELECT c.id, 'Color Theory', 'video', '', 'https://www.youtube.com/embed/_O3B0WcCwto', 2
FROM courses c WHERE c.title = 'Web Design Fundamentals'
ON CONFLICT DO NOTHING;

INSERT INTO course_lessons (course_id, title, content_type, content, video_url, sort_order)
SELECT c.id, 'Typography Basics', 'notes', '<h3>Typography Cheat Sheet</h3><ul><li><strong>Serif</strong> — Traditional, formal (Times New Roman, Georgia)</li><li><strong>Sans-serif</strong> — Modern, clean (Helvetica, Inter, Roboto)</li><li><strong>Display</strong> — Decorative, headlines only</li><li><strong>Body text</strong>: 16px minimum, 1.5 line height</li><li><strong>Pairing</strong>: Max 2 fonts per design</li></ul>', NULL, 3
FROM courses c WHERE c.title = 'Web Design Fundamentals'
ON CONFLICT DO NOTHING;

INSERT INTO course_lessons (course_id, title, content_type, content, video_url, sort_order)
SELECT c.id, 'Introduction to UI/UX', 'text', '<p>Welcome to UI/UX Masterclass! This course teaches you to design interfaces that are both beautiful and intuitive.</p><p>UI focuses on visual elements — buttons, icons, spacing, colors. UX focuses on the overall feel and flow of the product.</p>', NULL, 1
FROM courses c WHERE c.title = 'UI/UX Masterclass'
ON CONFLICT DO NOTHING;
