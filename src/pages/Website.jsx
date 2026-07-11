import { useState, useEffect } from 'react';
import { fetchPage } from '../data';

export default function Website() {
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    fetchPage('website')
      .then((d) => { if (!d) setError('Page not found.'); else setPage(d); })
      .catch(() => setError('Failed to load page.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <main className="flex-1 flex items-center justify-center py-20"><p className="text-black/70 dark:text-gray-300 text-lg">Loading...</p></main>;
  if (error) return <main className="flex-1 flex items-center justify-center py-20"><p className="text-rose dark:text-purple-300 text-lg">{error}</p></main>;

  return (
    <main className="flex-1">
      <div className="max-w-4xl mx-auto px-5 py-16">
        {page.image && (
          <img src={page.image} alt={page.title} className="w-full h-64 sm:h-80 object-cover rounded-3xl mb-8" loading="lazy" decoding="async" />
        )}
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-black dark:text-gray-100 mb-6">{page.title}</h1>
        <div
          className="text-black/70 dark:text-gray-300 text-base sm:text-lg leading-relaxed space-y-4 prose-headings:text-black dark:prose-headings:text-gray-100"
          dangerouslySetInnerHTML={{ __html: page.content }}
        />
      </div>
    </main>
  );
}
