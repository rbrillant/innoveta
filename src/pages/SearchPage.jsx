import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import TemplateCard from '../components/TemplateCard';
import { fetchTemplates } from '../data';

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!query) { setTemplates([]); setLoading(false); return; }
    setLoading(true);
    setError('');
    const q = query.toLowerCase();
    fetchTemplates()
      .then((all) => {
        setTemplates(all.filter((t) =>
          t.name.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q)
        ));
      })
      .catch(() => setError('Search failed. Please try again.'))
      .finally(() => setLoading(false));
  }, [query]);

  return (
    <main className="flex-1">
      <div className="max-w-6xl mx-auto px-5 py-16">
        <div className="text-center mb-10">
          <span className="inline-block text-xs font-medium text-teal-dark dark:text-teal-light bg-white/70 dark:bg-black/70 backdrop-blur-md px-4 py-1.5 rounded-full mb-3 shadow-sm border border-white/40 dark:border-white/10">
            🔍 Search
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-warm-dark dark:text-gray-100">
            {query ? `Results for "${query}"` : 'Search'}
          </h2>
          <p className="text-warm-gray dark:text-gray-300 mt-2 max-w-lg mx-auto">
            {templates.length} template{templates.length !== 1 ? 's' : ''} found
          </p>
        </div>

        {loading ? (
          <div className="text-center py-16">
            <p className="text-warm-gray dark:text-gray-300 text-lg">Searching...</p>
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <p className="text-rose dark:text-purple-300 text-lg">{error}</p>
          </div>
        ) : templates.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-warm-gray dark:text-gray-300 text-lg">No templates match your search.</p>
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
