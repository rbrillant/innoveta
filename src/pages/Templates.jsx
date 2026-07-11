import { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import TemplateCard from '../components/TemplateCard';
import { fetchTemplates } from '../data';

const CATEGORIES = [
  'Presentation', 'Poster', 'Resume', 'Email', 'Invitation', 'Mobile Video',
  'Facebook Post', 'Business Card', 'Photo Collage', 'Whiteboard', 'Sheet',
  'Instagram Post', 'Instagram Story', 'Landscape Video', 'Code', 'Flyer',
  'Logo', 'Brochure', 'Menu', 'Doc', 'Websites',
];

export default function Templates() {
  const { category } = useParams();
  const navigate = useNavigate();
  const active = category ? CATEGORIES.find((c) => c.toLowerCase().replace(/\s+/g, '-') === category.toLowerCase()) || 'All' : 'All';
  const [templates, setTemplates] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const sidebarRef = useRef(null);
  const [indicatorStyle, setIndicatorStyle] = useState({ top: 0, height: 0 });

  useEffect(() => {
    fetchTemplates().then(setTemplates);
  }, []);

  useLayoutEffect(() => {
    const el = sidebarRef.current;
    if (!el) return;
    const activeBtn = el.querySelector('[data-active="true"]');
    if (activeBtn) {
      const parentRect = el.getBoundingClientRect();
      const btnRect = activeBtn.getBoundingClientRect();
      setIndicatorStyle({ top: btnRect.top - parentRect.top, height: btnRect.height });
    }
  }, [active]);

  function handleCategoryClick(cat) {
    if (cat === 'All') {
      navigate('/templates');
    } else {
      navigate(`/templates/${cat.toLowerCase().replace(/\s+/g, '-')}`);
    }
    setSidebarOpen(false);
  }

  const filtered = active === 'All' ? templates : templates.filter((t) => t.category === active);

  const sidebarContent = (
    <div ref={sidebarRef} className="relative max-h-[calc(100vh-8rem)] overflow-y-auto scrollbar-none">
      <div
        className="absolute left-0 right-0 rounded-xl pointer-events-none nav-active"
        style={{
          top: indicatorStyle.top,
          height: indicatorStyle.height,
          transition: 'top 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), height 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
      />
      <div className="relative space-y-1">
        <button
          onClick={() => handleCategoryClick('All')}
          data-active={active === 'All' || undefined}
          className={`w-full text-left px-3 py-2 rounded-xl text-sm font-medium transition-colors cursor-pointer relative z-10 ${
            active === 'All' ? 'text-black' : 'text-black/70 hover:bg-white/60 dark:text-gray-400 dark:hover:bg-white/5'
          }`}
        >
          All Templates
        </button>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => handleCategoryClick(cat)}
            data-active={active === cat || undefined}
            className={`w-full text-left px-3 py-2 rounded-xl text-sm font-medium transition-colors cursor-pointer relative z-10 ${
              active === cat ? 'text-black' : 'text-black/70 hover:bg-white/60 dark:text-gray-400 dark:hover:bg-white/5'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <main className="flex-1">
      <div className="flex">
        <aside className="shrink-0 w-[220.5px] hidden md:block border-r border-blue-100 dark:border-white/5 min-h-[calc(100vh-57px)]">
          <div className="sticky top-20 px-4 py-6">
            {sidebarContent}
          </div>
        </aside>

        {/* Mobile filter toggle */}
        <div className="md:hidden fixed bottom-6 right-6 z-50">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-14 h-14 rounded-full bg-gradient-to-br from-teal to-teal-dark text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center justify-center cursor-pointer"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div className="md:hidden fixed inset-0 z-40">
            <div className="absolute inset-0 bg-black/40" onClick={() => setSidebarOpen(false)} />
            <div className="absolute left-0 top-0 bottom-0 w-64 bg-white/95 dark:bg-black/95 backdrop-blur-md shadow-xl p-5 pt-6 overflow-y-auto">
              <div className="flex items-center justify-between mb-5">
                <span className="text-sm font-semibold text-black dark:text-gray-100">Categories</span>
                <button onClick={() => setSidebarOpen(false)} className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer">
                  <svg className="w-4 h-4 text-black/60 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              {sidebarContent}
            </div>
          </div>
        )}

        <div className="flex-1 min-w-0 max-w-6xl mx-auto px-5 py-8">
          {filtered.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-black/60 dark:text-gray-400 text-lg">No templates in this category yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
              {filtered.map((t) => (
                <TemplateCard key={t.id} template={t} />
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
