import express from 'express';
import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import dns from 'dns';
import { PDFParse } from 'pdf-parse';
import rateLimit from 'express-rate-limit';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'innovetancy-local-secret-change-in-production';
const DB_DIR = path.join(__dirname, 'data');
const UPLOAD_DIR = path.join(__dirname, 'uploads');

// Ensure directories exist
if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true });
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// Database setup
const db = new Database(path.join(DB_DIR, 'database.sqlite'));
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// ─── Tables ───────────────────────────────────────────────
function initDb() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS designers (
      email TEXT PRIMARY KEY,
      password TEXT NOT NULL,
      name TEXT DEFAULT 'Designer',
      surname TEXT DEFAULT '',
      phone TEXT DEFAULT '',
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS profiles (
      id TEXT PRIMARY KEY,
      email TEXT,
      name TEXT DEFAULT '',
      surname TEXT DEFAULT '',
      phone TEXT DEFAULT '',
      dob TEXT DEFAULT '',
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS templates (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      description TEXT NOT NULL,
      image TEXT,
      video TEXT,
      price REAL DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS template_images (
      id TEXT PRIMARY KEY,
      template_id TEXT NOT NULL,
      image_url TEXT NOT NULL,
      sort_order INTEGER DEFAULT 0,
      caption TEXT DEFAULT '',
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (template_id) REFERENCES templates(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS bookings (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      template_id TEXT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT DEFAULT '',
      type TEXT NOT NULL,
      message TEXT DEFAULT '',
      payment_amount REAL,
      payment_status TEXT DEFAULT '',
      payment_method TEXT DEFAULT '',
      payment_reference TEXT DEFAULT '',
      payment_proof_url TEXT DEFAULT '',
      status TEXT DEFAULT 'pending',
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS services (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      icon TEXT DEFAULT '',
      title TEXT NOT NULL,
      description TEXT DEFAULT '',
      image TEXT DEFAULT '',
      price REAL DEFAULT 0,
      sort_order INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS service_steps (
      id TEXT PRIMARY KEY,
      step_number INTEGER DEFAULT 0,
      title TEXT NOT NULL,
      description TEXT DEFAULT ''
    );

    CREATE TABLE IF NOT EXISTS courses (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT DEFAULT '',
      price REAL DEFAULT 0,
      image TEXT,
      image_url TEXT DEFAULT '',
      video_url TEXT DEFAULT '',
      pdf_url TEXT DEFAULT '',
      category TEXT DEFAULT '',
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS course_lessons (
      id TEXT PRIMARY KEY,
      course_id TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT DEFAULT '',
      content_type TEXT NOT NULL DEFAULT 'text',
      content TEXT DEFAULT '',
      video_url TEXT DEFAULT '',
      sort_order INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS enrollments (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      course_id TEXT NOT NULL,
      enrolled_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS lesson_progress (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      lesson_id TEXT NOT NULL,
      completed INTEGER DEFAULT 0,
      completed_at TEXT
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT DEFAULT ''
    );

    CREATE TABLE IF NOT EXISTS payment_settings (
      id INTEGER PRIMARY KEY DEFAULT 1,
      bank_name TEXT DEFAULT '',
      account_name TEXT DEFAULT '',
      account_number TEXT DEFAULT '',
      currency TEXT DEFAULT '',
      momo_network TEXT DEFAULT '',
      momo_number TEXT DEFAULT '',
      momo_name TEXT DEFAULT '',
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS domain_pricing (
      tld TEXT PRIMARY KEY,
      price REAL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS password_reset_tokens (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL,
      token TEXT NOT NULL,
      expires_at TEXT NOT NULL,
      used INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS pages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT UNIQUE NOT NULL,
      title TEXT DEFAULT '',
      content TEXT DEFAULT '',
      image TEXT DEFAULT '',
      updated_at TEXT DEFAULT (datetime('now')),
      created_at TEXT DEFAULT (datetime('now'))
    );

    -- Seed default designer
    INSERT OR IGNORE INTO designers (email, password, name) VALUES
      ('admin@innovetancy.com', '$2a$10$placeholder', 'Designer');

    -- Seed settings
    INSERT OR IGNORE INTO settings (key, value) VALUES
      ('company_name', 'Innovetancy Design Studio');

    -- Seed payment settings
    INSERT OR IGNORE INTO payment_settings (id) VALUES (1);

    -- Seed domain pricing
    INSERT OR IGNORE INTO domain_pricing (tld, price) VALUES
      ('.com', 15.00), ('.net', 14.00), ('.org', 13.00),
      ('.io', 35.00), ('.co', 25.00), ('.app', 18.00),
      ('.dev', 15.00), ('.me', 20.00), ('.xyz', 10.00),
      ('.online', 12.00), ('.store', 20.00), ('.tech', 15.00);

    -- Seed courses (3 courses, 20 lessons each)
    INSERT OR IGNORE INTO courses (id, title, description, price, image, category) VALUES
      ('course-01', 'Pitch Deck Masterclass', 'Learn to create compelling presentations that win clients and investors.', 49, 'https://picsum.photos/seed/pitch-course/800/400', 'Presentation'),
      ('course-02', 'Social Media Design Pro', 'Master Instagram, Facebook, and TikTok content creation for brands.', 39, 'https://picsum.photos/seed/social-course/800/400', 'Instagram Post'),
      ('course-03', 'Logo Design Fundamentals', 'Learn professional logo design from concept to final delivery.', 59, 'https://picsum.photos/seed/logo-course/800/400', 'Logo');

    INSERT OR IGNORE INTO course_lessons (id, course_id, title, description, content_type, content, sort_order) VALUES
      -- Course 01: Brand Identity Design (20 lessons)
      ('cl-01-01', 'course-01', 'Introduction to Brand Identity', 'What is brand identity and why it matters', 'text', '<p>Brand identity is the visual and verbal expression of a brand''s personality. It encompasses everything from logos and color palettes to typography and imagery. In this lesson, we explore the fundamental concepts that make brand identity a critical component of business success.</p><p>A strong brand identity creates recognition, builds trust, and differentiates a company from its competitors. It is the visual language that communicates the brand''s values and mission to its audience.</p>', 1),
      ('cl-01-02', 'course-01', 'Research and Discovery', 'Understanding the brand before designing', 'text', '<p>Before any design work begins, thorough research is essential. This includes understanding the company''s history, mission, target audience, and competitive landscape. Discovery sessions with stakeholders help uncover the brand''s core values and personality traits.</p><p>Market analysis reveals what competitors are doing and identifies opportunities for differentiation. Audience research ensures the brand identity resonates with the people who matter most.</p>', 2),
      ('cl-01-03', 'course-01', 'Brand Strategy Fundamentals', 'Defining brand positioning and messaging', 'text', '<p>Brand strategy forms the foundation of every design decision. It defines the brand''s positioning in the market, its unique value proposition, and the key messages it needs to communicate. A well-crafted strategy ensures consistency across all touchpoints.</p><p>Key components include brand archetypes, tone of voice, and brand pillars that guide creative development. Without a solid strategy, even the most beautiful designs can fail to connect.</p>', 3),
      ('cl-01-04', 'course-01', 'Mood Boards and Visual Research', 'Gathering inspiration and setting direction', 'text', '<p>Mood boards are powerful tools for establishing the visual direction of a brand identity project. They collect imagery, colors, textures, and typography that capture the desired aesthetic and emotional tone of the brand.</p><p>Creating effective mood boards involves curating images that represent the brand''s personality, gathering competitor references, and exploring different visual approaches before committing to a direction.</p>', 4),
      ('cl-01-05', 'course-01', 'Color Theory for Branding', 'Choosing colors that communicate effectively', 'text', '<p>Color is one of the most powerful tools in a designer''s arsenal. Different colors evoke different emotions and associations. Understanding color psychology helps designers make informed choices that align with the brand''s personality and goals.</p><p>This lesson covers the color wheel, color harmonies, and how to build a cohesive brand color palette that works across print and digital applications.</p>', 5),
      ('cl-01-06', 'course-01', 'Typography Selection', 'Finding the perfect typeface for the brand', 'text', '<p>Typography plays a crucial role in brand identity. The right typeface can convey elegance, strength, playfulness, or sophistication. This lesson explores type classification, font pairing, and how to select typography that complements the brand''s visual identity.</p><p>We cover legibility considerations, licensing, and building a typographic hierarchy that works across all brand communications.</p>', 6),
      ('cl-01-07', 'course-01', 'Logo Design Principles', 'Creating memorable and timeless logos', 'text', '<p>The logo is often the most recognizable element of a brand identity. Great logos are simple, memorable, timeless, versatile, and appropriate. This lesson covers the principles of effective logo design and the different types of logos.</p><p>We explore wordmarks, lettermarks, pictorial marks, abstract marks, combination marks, and emblems. Each type has its strengths and is suited to different brand contexts.</p>', 7),
      ('cl-01-08', 'course-01', 'Logo Sketching and Conceptualization', 'From ideas to rough drafts', 'text', '<p>The logo design process begins with brainstorming and sketching. This hands-on lesson covers techniques for generating logo concepts, from mind mapping to rapid sketching. Quantity leads to quality as designers explore multiple directions.</p><p>We discuss how to evaluate concepts critically, combine ideas, and refine the strongest directions before moving to digital tools.</p>', 8),
      ('cl-01-09', 'course-01', 'Digital Logo Development', 'Vectorizing and refining logo designs', 'text', '<p>Once sketches are approved, logos are digitized using vector software. This lesson covers techniques for creating clean, scalable vector logos in industry-standard tools. We discuss anchor points, curves, and maintaining consistency.</p><p>Proper file preparation ensures logos work at any size, from business cards to billboards. We also cover color variations and responsive logo formats.</p>', 9),
      ('cl-01-10', 'course-01', 'Brand Pattern and Texture Design', 'Creating secondary brand elements', 'text', '<p>Brand patterns and textures add depth and personality to a brand identity system. These secondary elements can be used across applications to create a cohesive and distinctive brand experience.</p><p>This lesson covers techniques for developing geometric patterns, organic textures, and illustrative elements that extend the brand language beyond the primary logo.</p>', 10),
      ('cl-01-11', 'course-01', 'Stationery and Business Cards', 'Applying the brand to print materials', 'text', '<p>Business cards, letterheads, and envelopes remain important brand touchpoints. This lesson covers designing stationery that reflects the brand identity while maintaining functionality and professionalism.</p><p>We discuss paper stocks, printing techniques, finishes, and how to create templates that can be produced consistently.</p>', 11),
      ('cl-01-12', 'course-01', 'Brand Guidelines Documentation', 'Creating comprehensive brand rules', 'text', '<p>Brand guidelines ensure consistency across all applications and users. This lesson covers how to document logo usage, color specifications, typography rules, and application examples in a clear and comprehensive guide.</p><p>Well-documented guidelines empower teams and external partners to apply the brand correctly, maintaining integrity across all touchpoints.</p>', 12),
      ('cl-01-13', 'course-01', 'Digital Brand Applications', 'Applying the brand to websites and apps', 'text', '<p>Brands must work effectively in digital environments. This lesson covers adapting brand identities for websites, mobile apps, social media profiles, and email communications while maintaining consistency.</p><p>We discuss responsive logo variations, digital color considerations, and how to create templates for common digital applications.</p>', 13),
      ('cl-01-14', 'course-01', 'Packaging and Product Design', 'Extending the brand into physical products', 'text', '<p>Product packaging is a powerful brand touchpoint that consumers interact with directly. This lesson covers designing packaging that communicates brand values while meeting functional requirements.</p><p>Topics include structural design, materials selection, labeling requirements, and creating a cohesive unboxing experience.</p>', 14),
      ('cl-01-15', 'course-01', 'Environmental Branding', 'Branded spaces and signage systems', 'text', '<p>Environmental branding transforms physical spaces into brand experiences. This lesson covers designing signage systems, wayfinding, and immersive brand environments for offices, retail spaces, and events.</p><p>We explore material selection, scale considerations, and how to create cohesive experiences that extend the brand into the built environment.</p>', 15),
      ('cl-01-16', 'course-01', 'Brand Photography and Imagery', 'Defining visual style for photos', 'text', '<p>Photography style is a critical component of brand identity. This lesson covers defining guidelines for brand photography including lighting, composition, color grading, and subject matter that aligns with the brand personality.</p><p>Consistent imagery creates a recognizable visual language that strengthens brand recall across all marketing materials.</p>', 16),
      ('cl-01-17', 'course-01', 'Social Media Brand Templates', 'Consistent brand presence on social platforms', 'text', '<p>Social media requires frequent content creation, making templates essential for brand consistency. This lesson covers designing flexible social media templates that maintain brand identity while accommodating diverse content types.</p><p>We discuss platform-specific considerations, sizing, and creating systems that allow for efficient content production without sacrificing quality.</p>', 17),
      ('cl-01-18', 'course-01', 'Brand Collateral Design', 'Brochures, presentations, and more', 'text', '<p>Brand collateral includes all the supporting materials that communicate the brand. This lesson covers designing brochures, presentations, data sheets, and other collateral that extends the brand identity into specific marketing contexts.</p><p>We discuss information hierarchy, template systems, and creating adaptable frameworks for different collateral needs.</p>', 18),
      ('cl-01-19', 'course-01', 'Rebranding and Brand Evolution', 'When and how to refresh a brand', 'text', '<p>Brands evolve over time. This lesson covers the rebranding process, from audit and strategy to implementation. We discuss the difference between brand refreshes and complete rebrands, and how to manage the transition.</p><p>Case studies of successful rebrands illustrate best practices and common pitfalls to avoid during the evolution process.</p>', 19),
      ('cl-01-20', 'course-01', 'Final Project and Portfolio Review', 'Bringing it all together', 'text', '<p>The final lesson brings together everything learned in the course. Students complete a comprehensive brand identity project from research to final deliverables. We review portfolio presentation techniques and how to showcase brand identity work effectively.</p><p>This capstone project demonstrates mastery of the entire brand identity design process and serves as a valuable portfolio piece.</p>', 20),

      -- Course 02: Social Media Marketing Design (20 lessons)
      ('cl-02-01', 'course-02', 'Introduction to Social Media Design', 'The role of design in social media marketing', 'text', '<p>Social media design is about creating visuals that stop the scroll and communicate messages instantly. With billions of users across platforms, effective design is crucial for capturing attention and driving engagement.</p><p>This lesson introduces the unique challenges and opportunities of designing for social media platforms, including algorithmic considerations and platform-specific best practices.</p>', 1),
      ('cl-02-02', 'course-02', 'Platform Specifications', 'Sizes, formats, and technical requirements', 'text', '<p>Each social media platform has specific image sizes, video specifications, and format requirements. This lesson provides a comprehensive reference for creating correctly sized assets for Instagram, Facebook, Twitter, LinkedIn, TikTok, and Pinterest.</p><p>We cover aspect ratios, resolution requirements, file formats, and how to create templates that adapt across platforms efficiently.</p>', 2),
      ('cl-02-03', 'course-02', 'Visual Storytelling Principles', 'Telling stories through social visuals', 'text', '<p>Effective social media design tells a story in a split second. This lesson covers visual storytelling techniques including narrative arcs, emotional triggers, and how to structure visual content for maximum impact.</p><p>We explore how to use imagery, typography, and composition to create compelling narratives that resonate with target audiences.</p>', 3),
      ('cl-02-04', 'course-02', 'Color Psychology for Social', 'Using color to drive engagement', 'text', '<p>Color choices significantly impact how social media content is perceived and engaged with. This lesson covers color psychology principles specifically for social media contexts, including platform-specific color trends.</p><p>We discuss how to create color systems that stand out in crowded feeds while maintaining brand consistency across posts.</p>', 4),
      ('cl-02-05', 'course-02', 'Typography for Social Graphics', 'Readable and impactful text design', 'text', '<p>Typography in social media graphics must be highly readable at small sizes while still making an impact. This lesson covers font selection, sizing hierarchies, and techniques for making text stand out on any background.</p><p>We discuss accessibility considerations, mobile-first sizing, and how to pair fonts effectively for social media content.</p>', 5),
      ('cl-02-06', 'course-02', 'Photography and Image Curation', 'Sourcing and editing social imagery', 'text', '<p>Great imagery is the foundation of effective social media design. This lesson covers sourcing high-quality images, basic photo editing techniques, and creating consistent visual aesthetics using filters and presets.</p><p>We discuss stock photography resources, original photography tips, and how to maintain a cohesive feed aesthetic.</p>', 6),
      ('cl-02-07', 'course-02', 'Instagram Feed Design', 'Creating a cohesive Instagram presence', 'text', '<p>Instagram''s visual grid requires careful planning for a cohesive feed aesthetic. This lesson covers feed layout strategies, color palette planning, and content grid patterns that create a professional and engaging Instagram presence.</p><p>We discuss tools for previewing feed layouts and techniques for maintaining consistency while posting diverse content types.</p>', 7),
      ('cl-02-08', 'course-02', 'Instagram Stories and Reels', 'Designing for ephemeral content', 'text', '<p>Stories and Reels dominate Instagram engagement. This lesson covers designing for vertical, full-screen formats including interactive elements like polls, questions, and countdowns. We discuss templates for quick story creation.</p><p>Motion design basics for Reels, including text animations and transitions, help create engaging short-form video content.</p>', 8),
      ('cl-02-09', 'course-02', 'Facebook and LinkedIn Graphics', 'Professional social media design', 'text', '<p>Facebook and LinkedIn require a different design approach focused on professionalism and information delivery. This lesson covers designing shareable graphics, link previews, and carousel posts for these platforms.</p><p>We discuss how to balance visual appeal with professional credibility and optimize for each platform''s unique algorithm.</p>', 9),
      ('cl-02-10', 'course-02', 'Twitter and Thread Graphics', 'Concise visual communication', 'text', '<p>Twitter''s fast-paced environment demands concise, punchy visuals. This lesson covers designing graphics that communicate quickly, including quote tweets, thread headers, and announcement cards optimized for the platform.</p><p>We discuss how to make text-heavy content visually engaging and how to design for Twitter''s unique layout constraints.</p>', 10),
      ('cl-02-11', 'course-02', 'Video Thumbnail Design', 'Click-worthy video covers', 'text', '<p>Video thumbnails are the first thing viewers see and dramatically impact click-through rates. This lesson covers designing compelling thumbnails that generate curiosity and communicate value at a glance.</p><p>We discuss composition techniques, text overlay best practices, and how to create thumbnail templates that maintain brand consistency.</p>', 11),
      ('cl-02-12', 'course-02', 'Ad Creative Design', 'High-converting social ad graphics', 'text', '<p>Social media advertising requires designs optimized for conversion. This lesson covers creating ad creatives that capture attention and drive action, including carousel ads, collection ads, and dynamic product ads.</p><p>We discuss A/B testing visual approaches, ad platform specifications, and how to design for different campaign objectives.</p>', 12),
      ('cl-02-13', 'course-02', 'Carousel and Multi-Image Posts', 'Designing sequential content', 'text', '<p>Carousel posts allow for multi-image storytelling and significantly boost engagement. This lesson covers designing effective carousel sequences that guide viewers through a narrative or informative journey.</p><p>We discuss cover slide design, visual flow between slides, and techniques for creating carousels that drive saves and shares.</p>', 13),
      ('cl-02-14', 'course-02', 'Social Media Templates', 'Building efficient design systems', 'text', '<p>Templates streamline social media content creation while maintaining consistency. This lesson covers building flexible template systems that accommodate different content types while preserving brand identity.</p><p>We discuss master templates, content blocks, and how to create systems that enable rapid content production without sacrificing design quality.</p>', 14),
      ('cl-02-15', 'course-02', 'Animation and Motion for Social', 'Adding movement to social graphics', 'text', '<p>Animated content consistently outperforms static posts. This lesson covers basic motion design techniques for social media including text animations, logo reveals, and subtle motion effects that bring graphics to life.</p><p>We discuss tools for creating animations, file format considerations, and how to use motion strategically to increase engagement.</p>', 15),
      ('cl-02-16', 'course-02', 'Influencer and UGC Design', 'Designing for user-generated content', 'text', '<p>User-generated content and influencer collaborations require specific design approaches. This lesson covers creating templates for UGC campaigns, designing influencer briefs, and maintaining brand consistency across diverse content creators.</p><p>We discuss how to create flexible guidelines that allow for creative expression while protecting brand integrity.</p>', 16),
      ('cl-02-17', 'course-02', 'Social Analytics and Optimization', 'Using data to improve designs', 'text', '<p>Data-driven design decisions lead to better performance. This lesson covers analyzing social media metrics to understand what visual approaches work best and iterating designs based on engagement data.</p><p>We discuss tools for tracking performance, A/B testing methodologies, and how to create feedback loops that continuously improve social media design.</p>', 17),
      ('cl-02-18', 'course-02', 'Brand Consistency Across Platforms', 'Maintaining identity everywhere', 'text', '<p>Maintaining brand consistency across multiple social platforms is challenging but essential. This lesson covers creating platform-specific adaptations that preserve brand identity while optimizing for each platform''s unique requirements.</p><p>We discuss cross-platform visual audits, consistent color and typography usage, and creating platform-specific brand guidelines.</p>', 18),
      ('cl-02-19', 'course-02', 'Campaign Design and Planning', 'Designing for multi-post campaigns', 'text', '<p>Social media campaigns require coordinated visual design across multiple posts and platforms. This lesson covers planning and designing cohesive campaign visuals that tell a unified story across all touchpoints.</p><p>We discuss campaign theme development, content calendars, and creating design systems that scale across weeks or months of content.</p>', 19),
      ('cl-02-20', 'course-02', 'Final Project: Social Media Campaign', 'Creating a complete social campaign', 'text', '<p>The final project brings together everything learned in the course. Students design a complete social media campaign for a real or fictional brand, including feed posts, stories, ads, and platform-specific adaptations.</p><p>This portfolio-ready project demonstrates mastery of social media design principles and campaign planning.</p>', 20),

      -- Course 03: UI/UX Design Fundamentals (20 lessons)
      ('cl-03-01', 'course-03', 'Introduction to UI/UX Design', 'Understanding user experience and interface design', 'text', '<p>UI/UX design shapes how people interact with digital products. User Experience (UX) focuses on the overall feel and usability, while User Interface (UI) focuses on the visual design and interactive elements. Together they create products that are both beautiful and functional.</p><p>This lesson introduces the fundamental concepts of human-centered design and the role of UI/UX in product development.</p>', 1),
      ('cl-03-02', 'course-03', 'User Research Methods', 'Understanding your users through research', 'text', '<p>Great design starts with understanding users. This lesson covers qualitative and quantitative research methods including interviews, surveys, usability testing, and analytics analysis. User research reveals pain points, behaviors, and motivations that inform design decisions.</p><p>We discuss how to plan research studies, recruit participants, and synthesize findings into actionable insights.</p>', 2),
      ('cl-03-03', 'course-03', 'User Personas and Empathy Maps', 'Creating user archetypes for design guidance', 'text', '<p>Personas are fictional characters that represent your target users. This lesson covers creating data-driven personas and empathy maps that help design teams maintain user focus throughout the design process.</p><p>Well-crafted personas include goals, frustrations, behaviors, and demographics that guide feature decisions and design priorities.</p>', 3),
      ('cl-03-04', 'course-03', 'Information Architecture', 'Organizing content for usability', 'text', '<p>Information architecture (IA) is the structure behind user interfaces. This lesson covers organizing content and features in ways that make sense to users, including sitemaps, card sorting, and navigation patterns.</p><p>Good IA reduces cognitive load and helps users find what they need quickly and intuitively.</p>', 4),
      ('cl-03-05', 'course-03', 'User Flows and Journey Mapping', 'Mapping the user''s path through your product', 'text', '<p>User flows visualize the steps users take to accomplish tasks. This lesson covers creating flow diagrams and journey maps that identify friction points and opportunities for improvement in the user experience.</p><p>Understanding the complete user journey helps designers create seamless experiences that anticipate user needs.</p>', 5),
      ('cl-03-06', 'course-03', 'Wireframing Fundamentals', 'Laying out interface structure', 'text', '<p>Wireframes are low-fidelity layouts that establish structure and hierarchy before visual design begins. This lesson covers creating effective wireframes for web and mobile interfaces, focusing on layout, content priority, and functionality.</p><p>We discuss wireframing tools, techniques for rapid iteration, and how to communicate design concepts through wireframes.</p>', 6),
      ('cl-03-07', 'course-03', 'Interaction Design Principles', 'Designing intuitive interactions', 'text', '<p>Interaction design focuses on how users interact with interfaces. This lesson covers core principles including affordances, signifiers, feedback, consistency, and the golden rules of interface design that guide intuitive interaction design.</p><p>Well-designed interactions feel natural and require minimal learning, reducing user frustration and task completion time.</p>', 7),
      ('cl-03-08', 'course-03', 'Visual Hierarchy and Layout', 'Guiding attention through design', 'text', '<p>Visual hierarchy organizes elements to guide users through content in order of importance. This lesson covers techniques for establishing clear hierarchy including size, color, contrast, spacing, and positioning.</p><p>Effective layouts use grid systems, white space, and alignment to create organized, scannable interfaces.</p>', 8),
      ('cl-03-09', 'course-03', 'Color and Contrast in UI', 'Accessible and appealing color usage', 'text', '<p>Color in UI design must balance aesthetics with accessibility. This lesson covers color theory for interfaces, contrast ratios, and how to create accessible color palettes that meet WCAG guidelines while maintaining visual appeal.</p><p>We discuss semantic color usage for feedback, status indicators, and maintaining color consistency across components.</p>', 9),
      ('cl-03-10', 'course-03', 'Typography for Interfaces', 'Readable text across devices', 'text', '<p>Typography in UI design must be highly readable across devices and screen sizes. This lesson covers selecting typefaces for interfaces, establishing type hierarchies, and optimizing line length, leading, and spacing for digital reading.</p><p>We discuss responsive typography techniques and how to create type systems that scale gracefully across breakpoints.</p>', 10),
      ('cl-03-11', 'course-03', 'UI Components and Design Systems', 'Building reusable interface elements', 'text', '<p>Design systems provide a library of reusable components that ensure consistency across products. This lesson covers creating component libraries including buttons, forms, cards, navigation elements, and their states. We discuss atomic design methodology and how to document components for team use.</p><p>Well-maintained design systems speed up development and create cohesive user experiences across products.</p>', 11),
      ('cl-03-12', 'course-03', 'Responsive and Adaptive Design', 'Designing for every screen size', 'text', '<p>Users access products on a wide range of devices. This lesson covers responsive design principles including fluid grids, flexible images, and media queries that create seamless experiences across screen sizes.</p><p>We discuss mobile-first approaches, breakpoint strategies, and how to adapt complex layouts for smaller screens.</p>', 12),
      ('cl-03-13', 'course-03', 'Prototyping and User Testing', 'Validating designs before development', 'text', '<p>Prototypes bring designs to life and allow for user testing before development begins. This lesson covers creating interactive prototypes at various fidelity levels and conducting usability tests to validate design decisions.</p><p>Testing early and often saves resources by identifying issues before code is written.</p>', 13),
      ('cl-03-14', 'course-03', 'Micro-interactions and Animation', 'Delightful details that enhance UX', 'text', '<p>Micro-interactions are small, purposeful animations that provide feedback and enhance the user experience. This lesson covers designing micro-interactions for buttons, loading states, transitions, and notifications that feel natural and responsive.</p><p>Well-crafted animations guide attention, communicate status, and add personality to interfaces.</p>', 14),
      ('cl-03-15', 'course-03', 'Accessibility in Design', 'Designing for all users', 'text', '<p>Accessible design ensures products are usable by people with diverse abilities. This lesson covers WCAG guidelines, screen reader compatibility, keyboard navigation, color contrast requirements, and designing for cognitive accessibility.</p><p>Inclusive design benefits all users and is a fundamental responsibility of UI/UX designers.</p>', 15),
      ('cl-03-16', 'course-03', 'Mobile App Design Patterns', 'Platform-specific mobile design', 'text', '<p>Mobile app design follows platform-specific patterns and guidelines. This lesson covers iOS Human Interface Guidelines and Android Material Design, including navigation patterns, gesture design, and platform-specific components.</p><p>Understanding platform conventions helps create apps that feel native and intuitive to users on each platform.</p>', 16),
      ('cl-03-17', 'course-03', 'Form Design Best Practices', 'Creating usable and conversion-friendly forms', 'text', '<p>Forms are critical conversion tools but often frustrate users. This lesson covers form design best practices including field layout, input types, validation, error handling, and reducing friction to maximize completion rates.</p><p>Well-designed forms minimize cognitive load and guide users smoothly through data entry tasks.</p>', 17),
      ('cl-03-18', 'course-03', 'Design Handoff and Collaboration', 'Working effectively with developers', 'text', '<p>The design handoff is a critical phase where designs move from concept to code. This lesson covers preparing design files for development, creating specs, using collaboration tools, and maintaining effective communication with engineering teams.</p><p>Smooth handoffs reduce implementation errors and preserve design integrity in the final product.</p>', 18),
      ('cl-03-19', 'course-03', 'Portfolio and Career Development', 'Building a UI/UX design career', 'text', '<p>A strong portfolio is essential for landing UI/UX design roles. This lesson covers selecting and presenting projects, writing compelling case studies, and structuring portfolios that showcase your design process and impact.</p><p>We discuss interview preparation, design challenges, and how to continue growing as a designer.</p>', 19),
      ('cl-03-20', 'course-03', 'Capstone Project: Full App Design', 'Designing a complete application', 'text', '<p>The capstone project brings together all skills learned in the course. Students design a complete application from research through high-fidelity prototypes, including user flows, wireframes, visual design, and interactive prototypes.</p><p>This comprehensive project demonstrates mastery of the UI/UX design process and serves as a standout portfolio piece.</p>', 20);

    -- Seed IT Integration services
    INSERT OR IGNORE INTO services (id, type, icon, title, description, sort_order) VALUES
      ('svc-it-01', 'it-integration', '🔗', 'Application Integration', 'Connect disparate applications to streamline workflows and data flow across your organization.', 1),
      ('svc-it-02', 'it-integration', '📊', 'Data Integration', 'Unify data from multiple sources into a single, consistent view for better decision-making.', 2),
      ('svc-it-03', 'it-integration', '☁️', 'Cloud Integration', 'Seamlessly connect on-premise systems with cloud platforms for hybrid and multi-cloud environments.', 3),
      ('svc-it-04', 'it-integration', '⚙️', 'API Management', 'Design, secure, and scale your APIs with full lifecycle management and developer portals.', 4),
      ('svc-it-05', 'it-integration', '🔀', 'Enterprise Service Bus (ESB)', 'Centralize communication between enterprise applications with a robust ESB architecture.', 5),
      ('svc-it-06', 'it-integration', '🧩', 'Integration Platform as a Service (iPaaS)', 'Accelerate integrations with a cloud-based platform for connecting apps and data sources.', 6),
      ('svc-it-07', 'it-integration', '🤝', 'B2B / EDI Integration', 'Automate trading partner transactions with EDI standards and secure B2B integration.', 7),
      ('svc-it-08', 'it-integration', '🔄', 'Legacy System Modernization', 'Modernize legacy systems to improve performance, security, and compatibility.', 8),
      ('svc-it-09', 'it-integration', '🏭', 'IT/OT Integration', 'Bridge the gap between IT and operational technology for smarter industrial operations.', 9),
      ('svc-it-10', 'it-integration', '📡', 'IoT Integration Services', 'Connect and manage IoT devices with enterprise systems for real-time insights.', 10),
      ('svc-it-11', 'it-integration', '🧱', 'Microservices Architecture', 'Design and implement microservices-based architectures for scalable, resilient applications.', 11),
      ('svc-it-12', 'it-integration', '🛡️', 'Managed Integration Services', 'Outsource your integration needs to experts for ongoing support and maintenance.', 12);
  `);

  // Add dob column for existing databases
  try { db.prepare("ALTER TABLE profiles ADD COLUMN dob TEXT DEFAULT ''").run(); } catch {}

  // Hash default password
  const hash = bcrypt.hashSync('create123', 10);
  db.prepare('UPDATE designers SET password = ? WHERE email = ?').run(hash, 'admin@innovetancy.com');
}

initDb();

// ─── Middleware ────────────────────────────────────────────
app.use(express.json({ limit: '200mb' }));
app.use(express.static(path.join(__dirname, 'dist')));

const upload = multer({ dest: path.join(UPLOAD_DIR, 'temp') });

// Rate limiting
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 50, message: { error: 'Too many attempts, try again later' } });
const apiLimiter = rateLimit({ windowMs: 60 * 1000, max: 120 });

app.use('/api/auth', authLimiter);
app.use('/api', apiLimiter);

// Auth middleware
function authenticate(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  try {
    const token = auth.split(' ')[1];
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}

// ─── Auth Routes ──────────────────────────────────────────
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { email, password, name, surname, phone, dob } = req.body;
    const existing = db.prepare('SELECT email FROM designers WHERE email = ?').get(email);
    if (existing) return res.status(400).json({ error: 'User already exists' });

    const hash = await bcrypt.hash(password, 10);
    const id = crypto.randomUUID();
    db.prepare('INSERT INTO designers (email, password, name, surname, phone) VALUES (?, ?, ?, ?, ?)').run(email, hash, name || '', surname || '', phone || '');
    db.prepare('INSERT INTO profiles (id, email, name, surname, phone, dob) VALUES (?, ?, ?, ?, ?, ?)').run(id, email, name || '', surname || '', phone || '', dob || '');
    const token = jwt.sign({ email, name: name || '' }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ data: { user: { id, email, user_metadata: {} }, session: { access_token: token, user: { id, email } } } });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = db.prepare('SELECT * FROM designers WHERE email = ?').get(email);
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ email: user.email, name: user.name }, JWT_SECRET, { expiresIn: '7d' });
    res.json({
      data: {
        user: { id: user.email, email: user.email, user_metadata: { name: user.name } },
        session: { access_token: token, user: { id: user.email, email: user.email } }
      }
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/auth/user', authenticate, (req, res) => {
  const user = db.prepare('SELECT email, name FROM designers WHERE email = ?').get(req.user.email);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ data: { user: { id: user.email, email: user.email, user_metadata: { name: user.name } } } });
});

app.post('/api/auth/update-password', authenticate, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = db.prepare('SELECT * FROM designers WHERE email = ?').get(req.user.email);
    if (!user) return res.status(400).json({ error: 'User not found' });
    if (currentPassword) {
      const valid = await bcrypt.compare(currentPassword, user.password);
      if (!valid) return res.status(400).json({ error: 'Current password is incorrect' });
    }
    const hash = await bcrypt.hash(newPassword, 10);
    db.prepare('UPDATE designers SET password = ? WHERE email = ?').run(hash, req.user.email);
    res.json({ data: { success: true } });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ─── Password Reset ────────────────────────────────────────
app.post('/api/auth/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });
    const user = db.prepare('SELECT email FROM designers WHERE email = ?').get(email);
    // Always return success to prevent email enumeration
    if (!user) return res.json({ data: { message: 'If the email exists, a reset link has been sent.' } });
    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour
    db.prepare('INSERT INTO password_reset_tokens (email, token, expires_at) VALUES (?, ?, ?)').run(email, token, expires);
    res.json({ data: { message: 'If the email exists, a reset link has been sent.' } });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/auth/reset-password', async (req, res) => {
  try {
    const { email, token, newPassword } = req.body;
    if (!email || !token || !newPassword) return res.status(400).json({ error: 'Missing fields' });
    if (newPassword.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' });
    const row = db.prepare('SELECT * FROM password_reset_tokens WHERE email = ? AND token = ? AND used = 0 AND expires_at > datetime(\'now\')').get(email, token);
    if (!row) return res.status(400).json({ error: 'Invalid or expired reset token' });
    const hash = await bcrypt.hash(newPassword, 10);
    db.prepare('UPDATE designers SET password = ? WHERE email = ?').run(hash, email);
    db.prepare('UPDATE password_reset_tokens SET used = 1 WHERE id = ?').run(row.id);
    res.json({ data: { success: true } });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ─── Functions ────────────────────────────────────────────
app.post('/api/functions/domain-check', express.json(), (req, res) => {
  const { domain } = req.body;
  if (!domain) return res.json({ data: { available: false, error: 'No domain' } });
  const tld = '.' + domain.split('.').pop();
  const pricing = db.prepare('SELECT price FROM domain_pricing WHERE tld = ?').get(tld);
  const price = pricing?.price || 10;
  let done = false;
  dns.resolveNs(domain, (err) => {
    if (done) return;
    done = true;
    res.json({ data: { available: !!err, domain, price } });
  });
  setTimeout(() => {
    if (done) return;
    done = true;
    res.json({ data: { available: true, domain, price } });
  }, 5000);
});

app.post('/api/functions/domain-check-all', express.json(), (req, res) => {
  const { name } = req.body;
  if (!name) return res.json({ data: [] });
  const tlds = db.prepare('SELECT tld, price FROM domain_pricing ORDER BY tld').all();
  const results = [];
  let pending = tlds.length;
  function tryFinish() {
    if (--pending > 0) return;
    res.json({ data: results });
  }
  tlds.forEach(({ tld, price }) => {
    const domain = name.toLowerCase().replace(/[^a-z0-9-]/g, '') + tld;
    const entry = { domain, tld, price, available: null };
    results.push(entry);
    let done = false;
    dns.resolveNs(domain, (err) => {
      if (done) return; done = true;
      entry.available = !!err;
      tryFinish();
    });
    setTimeout(() => {
      if (done) return; done = true;
      entry.available = true;
      tryFinish();
    }, 3000);
  });
  if (tlds.length === 0) res.json({ data: [] });
});

// ─── File Upload ──────────────────────────────────────────
app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file' });
  const ext = path.extname(req.file.originalname);
  const customPath = req.body.path || '';
  const filename = customPath ? customPath.replace(/\\/g, '/') : `${crypto.randomUUID()}${ext}`;
  const destDir = path.join(UPLOAD_DIR, req.body.bucket || 'general', path.dirname(filename));
  if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
  const dest = path.join(UPLOAD_DIR, req.body.bucket || 'general', filename);
  fs.renameSync(req.file.path, dest);
  const publicPath = `/uploads/${req.body.bucket || 'general'}/${filename}`.replace(/\\/g, '/');
  res.json({ data: { publicUrl: publicPath } });
});

// ─── Special Endpoints ────────────────────────────────────
// Bookings with join
app.get('/api/bookings-full', (req, res) => {
  const rows = db.prepare(`
    SELECT b.*, t.name as template_name, t.image as template_image,
           p.name as profile_name, p.surname as profile_surname, p.phone as profile_phone
    FROM bookings b
    LEFT JOIN templates t ON b.template_id = t.id
    LEFT JOIN profiles p ON b.user_id = p.id
    ORDER BY b.created_at DESC
  `).all();
  const mapped = rows.map(r => ({
    ...r,
    templates: r.template_name ? { name: r.template_name, image: r.template_image } : null,
    profile: r.profile_name ? { name: r.profile_name, surname: r.profile_surname, phone: r.profile_phone } : null
  }));
  res.json({ data: mapped });
});

// Enrollments with courses
app.get('/api/enrollments-full/:userId', (req, res) => {
  const rows = db.prepare(`
    SELECT e.*, c.* FROM enrollments e
    JOIN courses c ON e.course_id = c.id
    WHERE e.user_id = ?
  `).all(req.params.userId);
  const mapped = rows.map(r => ({
    id: r.id,
    user_id: r.user_id,
    course_id: r.course_id,
    enrolled_at: r.enrolled_at,
    courses: { id: r.course_id, title: r.title, description: r.description, price: r.price, image: r.image, pdf_url: r.pdf_url, video_url: r.video_url }
  }));
  res.json({ data: mapped });
});

// Verify booking payment and auto-enroll for courses
app.post('/api/bookings/:id/verify', authenticate, (req, res) => {
  try {
    const booking = db.prepare('SELECT * FROM bookings WHERE id = ?').get(req.params.id);
    if (!booking) return res.status(404).json({ error: 'Booking not found' });

    db.prepare('UPDATE bookings SET payment_status = ? WHERE id = ?').run('verified', req.params.id);

    if (booking.type === 'Online Courses' && booking.user_id) {
      let courseId = null;
      const parts = (booking.message || '').split('|');
      if (parts[0] === 'COURSE_ENROLL' && parts[1]) {
        courseId = parts[1];
      } else {
        const match = booking.message.match(/Course enrollment: (.+?) \(\$[\d.]+\)/);
        if (match) {
          const row = db.prepare('SELECT id FROM courses WHERE title = ? OR title LIKE ?').get(match[1], `%${match[1]}%`);
          if (row) courseId = row.id;
        }
      }
      if (courseId) {
        const existing = db.prepare('SELECT id FROM enrollments WHERE user_id = ? AND course_id = ?').get(booking.user_id, courseId);
        if (!existing) {
          const id = crypto.randomUUID();
          db.prepare('INSERT INTO enrollments (id, user_id, course_id) VALUES (?, ?, ?)').run(id, booking.user_id, courseId);
        }
      }
    }

    res.json({ data: { message: 'Payment verified and enrollment processed' } });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// All enrollments with student and course details
app.get('/api/enrollments-all', (req, res) => {
  const rows = db.prepare(`
    SELECT e.*, p.name as student_name, p.surname as student_surname, p.email as student_email, p.phone as student_phone, p.dob as student_dob,
           c.title as course_title, c.price as course_price, c.image as course_image
    FROM enrollments e
    LEFT JOIN profiles p ON e.user_id = p.id
    LEFT JOIN courses c ON e.course_id = c.id
    ORDER BY e.enrolled_at DESC
  `).all();
  res.json({ data: rows });
});

// Lesson progress bulk
app.post('/api/lesson-progress-bulk', (req, res) => {
  const { user_id, lesson_ids } = req.body;
  if (!lesson_ids || !lesson_ids.length) return res.json({ data: [] });
  const placeholders = lesson_ids.map(() => '?').join(',');
  const rows = db.prepare(`SELECT * FROM lesson_progress WHERE user_id = ? AND lesson_id IN (${placeholders})`).all(user_id, ...lesson_ids);
  res.json({ data: rows });
});

// ─── PDF Parse ─────────────────────────────────────────────
app.post('/api/parse-pdf', upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No PDF file uploaded' });
    const buf = fs.readFileSync(req.file.path);
    const data = await PDFParse(buf);
    const text = data.text
      // Collapse line breaks within a paragraph (PDF word-wrap) - join lines that end with lowercase/word char
      .replace(/([a-z0-9,;:-])[\r\n]+([a-z0-9])/gi, '$1 $2')
      // Normalize remaining newlines
      .replace(/\r\n/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    const chapterRegex = /(?:chapter|lesson|section|module|part|unit)\s*\d+[.:\s]*/gi;
    const parts = text.split(/(?=(?:chapter|lesson|section|module|part|unit)\s*\d+[.:\s]*)/gi);
    let chapters;
    if (parts.length > 1) {
      chapters = parts.filter(Boolean).map((p) => {
        const titleMatch = p.match(/^((?:chapter|lesson|section|module|part|unit)\s*\d+[.:\s]*.*?)(?:\n|$)/i);
        const title = titleMatch ? titleMatch[1].trim() : 'Untitled';
        const body = p.replace(/^((?:chapter|lesson|section|module|part|unit)\s*\d+[.:\s]*.*?)(?:\n|$)/i, '').trim();
        const paras = body.split(/\n\n/).filter(Boolean);
        const content = paras.map(par => `<p>${par.replace(/\n/g, '<br>')}</p>`).join('') || '<p>No content</p>';
        return { title, content };
      });
    } else {
      const paragraphs = text.split(/\n\n/).filter(Boolean);
      chapters = paragraphs.map((p, i) => {
        const lines = p.trim().split('\n');
        const title = lines[0].length < 100 ? lines[0].trim() : `Section ${i + 1}`;
        const body = (lines[0].length < 100 ? lines.slice(1) : lines).join('<br>');
        return { title, content: body ? `<p>${body}</p>` : '<p>No content</p>' };
      });
    }
    try { fs.unlinkSync(req.file.path); } catch {}
    res.json({ chapters, pageCount: data.numpages });
  } catch (e) {
    try { fs.unlinkSync(req.file.path); } catch {}
    res.status(500).json({ error: e.message });
  }
});

// ─── Generic CRUD Routes ──────────────────────────────────
// GET /api/:table - list with optional filters
app.get('/api/:table', (req, res) => {
  const { table } = req.params;
  const allowed = ['templates','template_images','bookings','services','service_steps','courses','course_lessons',
    'enrollments','lesson_progress','settings','payment_settings','domain_pricing','designers','pages'];
  if (!allowed.includes(table)) return res.status(404).json({ error: 'Table not found' });

  let sql = `SELECT * FROM "${table}" WHERE 1=1`;
  const params = [];

  // Handle query params as filters
  for (const [key, val] of Object.entries(req.query)) {
    if (key === 'order' || key === 'select' || key === 'limit' || key === 'offset') continue;
    if (key === 'head') continue;
    if (key.endsWith('=eq')) {
      const col = key.slice(0, -3);
      sql += ` AND "${col}" = ?`;
      params.push(val);
    } else if (key.endsWith('=in')) {
      const col = key.slice(0, -3);
      const vals = val.split(',');
      const placeholders = vals.map(() => '?').join(',');
      sql += ` AND "${col}" IN (${placeholders})`;
      params.push(...vals);
    } else {
      sql += ` AND "${key}" = ?`;
      params.push(val);
    }
  }

  // Handle type filter specially (services?type=it-integration)
  if (req.query.type) {
    sql += ` AND type = ?`;
    params.push(req.query.type);
  }
  if (req.query.tld) {
    sql += ` AND tld = ?`;
    params.push(req.query.tld);
  }
  if (req.query.course_id) {
    sql += ` AND course_id = ?`;
    params.push(req.query.course_id);
  }
  if (req.query.user_id && table === 'enrollments') {
    sql += ` AND user_id = ?`;
    params.push(req.query.user_id);
  }
  if (req.query.lesson_id) {
    sql += ` AND lesson_id = ?`;
    params.push(req.query.lesson_id);
  }
  if (req.query.template_id) {
    sql += ` AND template_id = ?`;
    params.push(req.query.template_id);
  }

  // ilike support for title
  if (req.query.title) {
    sql += ` AND title LIKE ?`;
    params.push(`%${req.query.title}%`);
  }

  // Order
  if (req.query.order) {
    const dir = req.query.order.startsWith('-') ? 'DESC' : 'ASC';
    const col = req.query.order.replace(/^-/, '');
    sql += ` ORDER BY "${col}" ${dir}`;
  } else if (table === 'template_images') {
    sql += ' ORDER BY sort_order ASC';
  } else if (table !== 'settings' && table !== 'domain_pricing' && table !== 'payment_settings') {
    sql += ' ORDER BY created_at DESC';
  }

  // Limit
  if (req.query.limit) {
    sql += ` LIMIT ?`;
    params.push(parseInt(req.query.limit));
  }

  try {
    const stmt = db.prepare(sql);
    const rows = stmt.all(...params);
    res.json({ data: rows, error: null });
  } catch (e) {
    res.json({ data: null, error: e.message });
  }
});

function pkCol(table) {
  if (table === 'settings') return 'key';
  if (table === 'domain_pricing') return 'tld';
  return 'id';
}

// GET /api/:table with id
app.get('/api/:table/:id', (req, res) => {
  const { table, id } = req.params;
  const col = pkCol(table);
  const row = db.prepare(`SELECT * FROM "${table}" WHERE "${col}" = ?`).get(id);
  res.json({ data: row || null });
});

// POST /api/:table - insert
app.post('/api/:table', (req, res) => {
  const { table } = req.params;
  const data = { ...req.body };
  const col = pkCol(table);
  if (!data[col] && col === 'id') data.id = crypto.randomUUID();
  if (!data.created_at && table !== 'settings') data.created_at = new Date().toISOString();

  const cols = Object.keys(data);
  const vals = Object.values(data);
  const placeholders = cols.map(() => '?').join(',');
  const quotedCols = cols.map(c => `"${c}"`).join(',');

  try {
    db.prepare(`INSERT INTO "${table}" (${quotedCols}) VALUES (${placeholders})`).run(...vals);
    const inserted = db.prepare(`SELECT * FROM "${table}" WHERE "${col}" = ?`).get(data[col]);
    res.json({ data: inserted });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// PATCH /api/:table/:id - update
app.patch('/api/:table/:id', (req, res) => {
  const { table, id } = req.params;
  const data = req.body;
  const col = pkCol(table);
  const sets = Object.keys(data).map(k => `"${k}" = ?`).join(',');
  const vals = Object.values(data);
  try {
    db.prepare(`UPDATE "${table}" SET ${sets} WHERE "${col}" = ?`).run(...vals, id);
    const updated = db.prepare(`SELECT * FROM "${table}" WHERE "${col}" = ?`).get(id);
    res.json({ data: updated });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// DELETE /api/:table/:id
app.delete('/api/:table/:id', (req, res) => {
  const { table, id } = req.params;
  const col = pkCol(table);
  db.prepare(`DELETE FROM "${table}" WHERE "${col}" = ?`).run(id);
  res.json({ data: null, error: null });
});

// Serve uploaded files
app.use('/uploads', express.static(UPLOAD_DIR));

// ─── Database Viewer ──────────────────────────────────────
const ALLOWED_TABLES = ['templates','template_images','bookings','services','service_steps','courses','course_lessons',
  'enrollments','lesson_progress','settings','payment_settings','domain_pricing','designers','pages','profiles',
  'password_reset_tokens'];

app.get('/admin/db', (req, res) => {
  const tables = ALLOWED_TABLES.filter(t => {
    try { return !!db.prepare(`SELECT count(*) as c FROM "${t}"`).get(); } catch { return false; }
  });
  const t = req.query.table || tables[0];
  let rows = [];
  let cols = [];
  if (t) {
    const info = db.prepare(`SELECT * FROM "${t}" LIMIT 0`).columns();
    cols = info.map(c => c.name);
    rows = db.prepare(`SELECT * FROM "${t}" LIMIT 100`).all();
  }
  res.send(`<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>DB Viewer</title><style>
    body{font-family:system-ui,sans-serif;background:#f5f5f5;margin:0;padding:20px;color:#111}
    h1{font-size:20px;margin:0 0 20px}
    .tabs{display:flex;flex-wrap:wrap;gap:4px;margin-bottom:16px}
    .tabs a{text-decoration:none;padding:6px 14px;border-radius:8px;font-size:13px;background:#fff;color:#555;border:1px solid #ddd}
    .tabs a.on{background:#14b8a6;color:#fff;border-color:#14b8a6}
    table{border-collapse:collapse;width:100%;background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,.06)}
    th{background:#f0f0f0;font-size:12px;padding:8px 10px;text-align:left;font-weight:600;border-bottom:1px solid #ddd}
    td{font-size:12px;padding:8px 10px;border-bottom:1px solid #eee;max-width:300px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
    tr:hover td{background:#fafafa}
    code{font-size:11px;background:#f0f0f0;padding:1px 5px;border-radius:3px}
    .count{font-size:12px;color:#888;margin-bottom:10px}
  </style></head><body>
  <h1>&#128451; Database Viewer</h1>
  <div class="tabs">${tables.map(tb => `<a href="?table=${tb}" class="${tb === t ? 'on' : ''}">${tb}</a>`).join('')}</div>
  ${t ? `<div class="count">${rows.length} rows</div><table><thead><tr>${cols.map(c => `<th>${c}</th>`).join('')}</tr></thead><tbody>${
    rows.map(r => `<tr>${cols.map(c => {
      const v = r[c];
      if (v == null) return '<td><span style="color:#bbb">null</span></td>';
      const s = String(v);
      return '<td>' + (s.length > 80 ? '<code>' + s.slice(0,80).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;') + '...</code>' : s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')) + '</td>';
    }).join('')}</tr>`).join('')
  }</tbody></table>` : '<p>No tables found.</p>'}
  </body></html>`);
});

// ─── Serve Frontend ───────────────────────────────────────
app.get('/{*path}', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// ─── Start ────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Admin login: admin@innovetancy.com / create123`);
});
