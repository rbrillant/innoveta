import { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const CATEGORIES = [
  { name: 'Presentation', icon: '📊', img: '/images/presentation.jpg' },
  { name: 'Poster', icon: '🖼️', img: '/images/poster.jpg' },
  { name: 'Resume', icon: '📄', img: '/images/resume.jpg' },
  { name: 'Email', icon: '✉️', img: '/images/email.png' },
  { name: 'Invitation', icon: '💌', img: '/images/invitation.webp' },
  { name: 'Mobile Video', icon: '📱', img: '/images/mobile-video.png' },
  { name: 'Facebook Post', icon: '👍', img: '/images/facebook-post.jpg' },
  { name: 'Business Card', icon: '💳', img: '/images/business-card.png' },
  { name: 'Photo Collage', icon: '📸', img: '/images/photo-collage.jpg' },
  { name: 'Whiteboard', icon: '🏷️' },
  { name: 'Sheet', icon: '📋', img: '/images/budgets-excel.png' },
  { name: 'Instagram Post', icon: '📷' },
  { name: 'Instagram Story', icon: '🎞️', img: '/images/instagram-story.jpg' },
  { name: 'Landscape Video', icon: '🎥' },
  { name: 'Code', icon: '💻' },
  { name: 'Flyer', icon: '📰', img: '/images/flyer.jpg' },
  { name: 'Logo', icon: '🔤', img: '/images/logo.jpg' },
  { name: 'Brochure', icon: '📑' },
  { name: 'Menu', icon: '🍽️' },
  { name: 'Doc', icon: '📝' },
  { name: 'Websites', icon: '🌐' },
];

const PALETTE = ['#2563eb', '#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe', '#1d4ed8'];

export default function Home() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  function updateArrows() {
    const el = scrollRef.current;
    if (el) {
      setCanScrollLeft(el.scrollLeft > 4);
      setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
    }
  }

  function scroll(dir) {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: dir * 340, behavior: 'smooth' });
    }
  }

  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      updateArrows();
      el.addEventListener('scroll', updateArrows);
      return () => el.removeEventListener('scroll', updateArrows);
    }
  }, []);

  function handleSearch(e) {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  }

  return (
    <main className="flex-1">
      <div className="max-w-5xl mx-auto px-5 pt-24 pb-16 text-center">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-black dark:text-gray-100 leading-tight mb-10 animate-[fadeSlideUp_0.6s_ease-out]">
          <span className="text-teal">Templates</span>
        </h1>

        <form onSubmit={handleSearch} className="max-w-xl mx-auto mb-16 px-0 sm:px-4">
          <div className="glass-card rounded-full p-1 sm:p-1.5 pl-4 sm:pl-6 flex items-center shadow-lg shadow-teal/5">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search templates, courses, services..."
              className="flex-1 py-2 sm:py-3 bg-transparent text-sm sm:text-base focus:outline-none placeholder:text-blue-300 dark:placeholder:text-gray-500 dark:text-gray-200 min-w-0"
            />
            <button
              type="submit"
              className="px-3 sm:px-6 py-2 sm:py-2.5 bg-gradient-to-r from-teal to-teal-dark text-white text-xs sm:text-sm font-semibold rounded-full hover:from-teal-dark hover:to-teal hover:shadow-lg hover:shadow-teal/25 transition-all shadow-sm cursor-pointer shrink-0"
            >
              <span className="sm:hidden">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </span>
              <span className="hidden sm:inline">Search</span>
            </button>
          </div>
        </form>

        <div className="relative">
          <h2 className="text-xl font-semibold text-black dark:text-gray-100 mb-4 text-left">Explore Templates</h2>
          <div className="relative">
            {canScrollLeft && (
              <button onClick={() => scroll(-1)} className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-9 h-9 flex items-center justify-center rounded-full bg-white/80 dark:bg-black/80 shadow-md border border-blue-200 dark:border-white/10 text-black dark:text-gray-200 hover:bg-white dark:hover:bg-white/10 transition-all cursor-pointer -ml-3">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
              </button>
            )}
            {canScrollRight && (
              <button onClick={() => scroll(1)} className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-9 h-9 flex items-center justify-center rounded-full bg-white/80 dark:bg-black/80 shadow-md border border-blue-200 dark:border-white/10 text-black dark:text-gray-200 hover:bg-white dark:hover:bg-white/10 transition-all cursor-pointer -mr-3">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
              </button>
            )}
            <div ref={scrollRef} className="grid gap-3 overflow-x-auto pb-3 scrollbar-none snap-x snap-mandatory -mx-5 px-5 bg-transparent" style={{ gridTemplateRows: 'repeat(2, 1fr)', gridAutoFlow: 'column', gridAutoColumns: 'calc((100vw - 2.5rem) / 3 - 8px)' }}>
              {CATEGORIES.map((cat, i) => {
                const bg = PALETTE[i % PALETTE.length];
                const catSlug = cat.name.toLowerCase().replace(/\s+/g, '-');
                return (
                  <Link
                    key={cat.name}
                    to={`/templates/${catSlug}`}
                    className="group glass-card rounded-2xl p-5 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 block snap-start"
                    style={{ background: `linear-gradient(135deg, ${bg}15, ${bg}08)` }}
                  >
                    <div className="flex items-center gap-3 h-full">
                      {cat.img ? <img src={cat.img} alt={cat.name} className="w-12 h-12 object-cover rounded-lg transition-transform duration-300 group-hover:scale-110" loading="lazy" decoding="async" /> : <span className="text-2xl">{cat.icon}</span>}
                      <span className="text-sm font-semibold text-black dark:text-gray-100 leading-snug">{cat.name}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

      </div>
    </main>
  );
}
