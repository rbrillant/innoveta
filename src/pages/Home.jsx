import { useState, useEffect } from 'react';
import TemplateCard from '../components/TemplateCard';
import { fetchTemplates } from '../data';

export default function Home() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    fetchTemplates()
      .then(setTemplates)
      .catch(() => setError('Failed to load templates. Please try again.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="flex-1">
      <div className="max-w-6xl mx-auto px-5 py-16">
        <div className="text-center mb-12">
            <span className="inline-block text-xs font-medium text-teal-dark dark:text-teal-light bg-white/70 dark:bg-gray-900/70 backdrop-blur-md px-4 py-1.5 rounded-full mb-4 shadow-sm border border-white/40 dark:border-gray-700">
              ✦ <span className="text-teal">Inno</span><span className="text-teal-dark dark:text-teal-light">veta</span>
            </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-blue-900 dark:text-gray-100 leading-tight">
            Design Templates
            <br />
            <span className="text-teal">That Speak Volumes</span>
          </h1>
          <p className="text-blue-600/70 dark:text-gray-300 mt-4 max-w-xl mx-auto text-base sm:text-lg">
            Browse premium website templates and book your design today.
          </p>
        </div>

        {loading ? (
          <div className="text-center py-16">
            <p className="text-blue-600/70 dark:text-gray-300 text-lg">Loading templates...</p>
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <p className="text-rose dark:text-purple-300 text-lg">{error}</p>
            <button onClick={() => window.location.reload()} className="mt-3 text-teal-dark dark:text-teal-light font-medium hover:underline cursor-pointer">Retry</button>
          </div>
        ) : templates.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-blue-600/70 dark:text-gray-300 text-lg">No templates yet. Check back soon!</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((t) => (
              <TemplateCard key={t.id} template={t} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
