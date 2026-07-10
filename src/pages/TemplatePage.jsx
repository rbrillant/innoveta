import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchTemplates } from '../data';

export default function TemplatePage() {
  const { id } = useParams();
  const [template, setTemplate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    fetchTemplates()
      .then((list) => {
        const t = list.find((item) => item.id === id);
        if (t) setTemplate(t);
        else setError('Template not found.');
      })
      .catch(() => setError('Failed to load template.'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <main className="flex-1 flex items-center justify-center py-20"><p className="text-black/70 dark:text-gray-300 text-lg">Loading...</p></main>;
  if (error) return <main className="flex-1 flex items-center justify-center py-20"><p className="text-rose dark:text-purple-300 text-lg">{error}</p></main>;
  if (!template) return null;

  return (
    <main className="flex-1">
      <div className="max-w-4xl mx-auto px-5 py-16">
        <Link to="/templates" className="inline-flex items-center gap-1.5 text-sm text-black/60 dark:text-gray-400 hover:text-black dark:hover:text-gray-200 mb-6 transition-colors group">
          <svg className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
          Back to Templates
        </Link>

        <div className="glass-card rounded-3xl overflow-hidden">
          {template.image && (
            <div className="w-full h-80 sm:h-[28rem] bg-blue-50 dark:bg-gray-800/50 flex items-center justify-center overflow-hidden">
              <img src={template.image} alt={template.name} className="w-full h-full object-cover" />
            </div>
          )}

          <div className="p-6 sm:p-8 lg:p-10">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className="text-xs font-medium text-teal-dark dark:text-teal-light bg-teal/10 dark:bg-teal-dark/20 px-3 py-1 rounded-full">
                {template.category}
              </span>
              {template.price > 0 ? (
                <span className="text-sm font-bold text-black dark:text-gray-100">${template.price}</span>
              ) : (
                <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1 rounded-full">Free</span>
              )}
            </div>

            <h1 className="text-3xl sm:text-4xl font-bold text-black dark:text-gray-100 mb-4">{template.name}</h1>
            <p className="text-black/60 dark:text-gray-400 text-base sm:text-lg leading-relaxed">
              {template.description}
            </p>

            <div className="flex flex-wrap gap-4 mt-10">
              <Link
                to={`/book?template=${template.id}`}
                className="px-8 py-3.5 bg-gradient-to-r from-teal to-teal-dark text-white text-sm font-semibold rounded-xl hover:from-teal-dark hover:to-teal hover:shadow-lg hover:shadow-teal/25 transition-all shadow-sm"
              >
                Book This Template
              </Link>
              <Link
                to="/templates"
                className="px-8 py-3.5 border border-blue-200/50 dark:border-gray-700 text-black/70/70 dark:text-gray-300 text-sm font-medium rounded-xl hover:bg-blue-50 dark:hover:bg-gray-800 transition-colors"
              >
                Browse More
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
