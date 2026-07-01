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

  if (loading) return <main className="flex-1 flex items-center justify-center py-20"><p className="text-blue-600/70 dark:text-gray-300 text-lg">Loading...</p></main>;
  if (error) return <main className="flex-1 flex items-center justify-center py-20"><p className="text-rose dark:text-purple-300 text-lg">{error}</p></main>;
  if (!template) return null;

  return (
    <main className="flex-1">
      <div className="max-w-4xl mx-auto px-5 py-16">
        <Link to="/templates" className="inline-flex items-center gap-1.5 text-sm text-blue-500/70 dark:text-gray-400 hover:text-blue-900 dark:hover:text-gray-200 mb-6 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
          Back to Templates
        </Link>

        <div className="glass-card rounded-3xl overflow-hidden">
          {template.image && (
            <div className="w-full h-72 sm:h-96 bg-blue-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden">
              <img src={template.image} alt={template.name} className="w-full h-full object-contain" />
            </div>
          )}

          <div className="p-6 sm:p-8 lg:p-10">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className="text-xs font-medium text-blue-700 dark:text-blue-400 bg-blue-500/15 dark:bg-blue-400/15 px-3 py-1 rounded-full">
                {template.category}
              </span>
              {template.price > 0 ? (
                <span className="text-sm font-bold text-blue-900 dark:text-gray-100 bg-blue-300/40 dark:bg-gray-700/40 px-3 py-1 rounded-full">
                  ${template.price}
                </span>
              ) : (
                <span className="text-xs font-medium text-blue-500 dark:text-blue-400 bg-blue-500/15 dark:bg-blue-400/15 px-3 py-1 rounded-full">
                  Free
                </span>
              )}
            </div>

            <h1 className="text-3xl sm:text-4xl font-bold text-blue-900 dark:text-gray-100 mb-4">{template.name}</h1>
            <p className="text-blue-600/70 dark:text-gray-300 text-base sm:text-lg leading-relaxed whitespace-pre-wrap">
              {template.description}
            </p>

            <div className="flex flex-wrap gap-4 mt-10">
              <Link
                to={`/book?template=${template.id}`}
                className="px-8 py-3.5 bg-gradient-to-r from-teal to-teal-dark text-white text-sm font-semibold rounded-xl hover:from-teal-dark hover:to-teal transition-all shadow-sm"
              >
                Book This Template ✨
              </Link>
              <Link
                to="/templates"
                className="px-8 py-3.5 border border-blue-200 dark:border-gray-700 text-blue-600/70 dark:text-gray-300 text-sm font-medium rounded-xl hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors"
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
