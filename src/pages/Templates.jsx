import { useState, useEffect } from 'react';
import TemplateCard from '../components/TemplateCard';
import { fetchTemplates } from '../data';

const CATEGORIES = ['All', 'Websites', 'Online Courses', 'IT Integration', 'Consulting'];

export default function Templates() {
  const [templates, setTemplates] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');

  useEffect(() => {
    fetchTemplates().then(setTemplates);
  }, []);

  const filtered = activeCategory === 'All' ? templates : templates.filter((t) => t.category === activeCategory);

  return (
    <main className="flex-1">
      <div className="max-w-6xl mx-auto px-5 py-16">
        <div className="text-center mb-10">
          <span className="inline-block text-xs font-medium text-teal-dark dark:text-teal-light bg-white/70 dark:bg-gray-900/70 backdrop-blur-md px-4 py-1.5 rounded-full mb-3 shadow-sm border border-white/40 dark:border-gray-700">
            ✦ Portfolio
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-warm-dark dark:text-gray-100">All Templates</h2>
          <p className="text-warm-gray dark:text-gray-300 mt-2 max-w-lg mx-auto">
            Every template is designed with love and attention to detail.
            Pick one that speaks to you.
          </p>
        </div>

        {/* Category filter */}
        <div className="flex justify-center gap-2 mb-8">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`text-xs font-medium px-4 py-1.5 rounded-full transition-colors cursor-pointer ${
                activeCategory === cat
                  ? 'bg-teal text-white shadow-sm'
                  : 'bg-white/70 dark:bg-gray-900/70 text-blue-600/70 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800 border border-blue-200/50 dark:border-gray-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-warm-gray dark:text-gray-300 text-lg">No templates in this category yet.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((t) => (
              <TemplateCard key={t.id} template={t} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
