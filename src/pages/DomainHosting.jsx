import { useState, useEffect } from 'react';
import { fetchPage, checkDomain } from '../data';
import { Link } from 'react-router-dom';

const TLD_LIST = ['.com', '.org', '.net', '.io', '.co', '.app', '.dev', '.me', '.info', '.biz'];

const TLD_NAMES = {
  com: 'Commercial',
  org: 'Organization',
  net: 'Network',
  io: 'British Indian Ocean Territory',
  co: 'Company',
  app: 'Apps',
  dev: 'Development',
  me: 'Personal',
  info: 'Information',
  biz: 'Business',
};

export default function DomainHosting() {
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [name, setName] = useState('');
  const [tld, setTld] = useState('.com');
  const [checking, setChecking] = useState(false);
  const [results, setResults] = useState(null);
  const [resultError, setResultError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    fetchPage('domain-hosting')
      .then((d) => { if (!d) setError('Page not found.'); else setPage(d); })
      .catch(() => setError('Failed to load page.'))
      .finally(() => setLoading(false));
  }, []);

  async function handleSearch(e) {
    e.preventDefault();
    if (!name.trim()) return;
    setChecking(true);
    setResultError('');
    setResults(null);
    try {
      const data = await checkDomain(name.trim().toLowerCase() + tld);
      setResults(Array.isArray(data) ? data : [data]);
    } catch {
      setResultError('Lookup failed. Please try again.');
    } finally {
      setChecking(false);
    }
  }

  function getColor(available) {
    if (available === true) return { bg: 'bg-emerald-50 dark:bg-emerald-900/20', text: 'text-emerald-700 dark:text-emerald-400', badge: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600' };
    if (available === false) return { bg: 'bg-rose-50 dark:bg-rose-900/20', text: 'text-rose-700 dark:text-rose-400', badge: 'bg-rose-100 dark:bg-rose-900/30 text-rose-600' };
    return { bg: 'bg-amber-50 dark:bg-amber-900/20', text: 'text-amber-700 dark:text-amber-400', badge: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600' };
  }

  if (loading) return <main className="flex-1 flex items-center justify-center py-20"><p className="text-blue-600/70 dark:text-gray-300 text-lg">Loading...</p></main>;
  if (error) return <main className="flex-1 flex items-center justify-center py-20"><p className="text-rose dark:text-purple-300 text-lg">{error}</p></main>;

  return (
    <main className="flex-1">
      <div className="max-w-4xl mx-auto px-5 py-16">
        {page.image && (
          <img src={page.image} alt={page.title} className="w-full h-64 sm:h-80 object-cover rounded-3xl mb-8" />
        )}
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-blue-900 dark:text-gray-100 mb-6">{page.title}</h1>
        <div
          className="text-blue-600/70 dark:text-gray-300 text-base sm:text-lg leading-relaxed space-y-4 mb-10"
          dangerouslySetInnerHTML={{ __html: page.content }}
        />

        {/* Domain Search */}
        <div className="glass-card rounded-3xl p-6 sm:p-8">
          <h2 className="text-2xl font-bold text-blue-900 dark:text-gray-100 mb-2">Search Available Domains</h2>
          <p className="text-sm text-blue-500/60 dark:text-gray-400 mb-6">Check if your dream domain is available</p>

          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
            <div className="flex flex-1 rounded-xl border border-blue-200 dark:border-gray-700 overflow-hidden bg-white/70 dark:bg-gray-800/70">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="yourdomain"
                className="flex-1 px-4 py-3 bg-transparent text-sm focus:outline-none dark:text-gray-200"
              />
              <select
                value={tld}
                onChange={(e) => setTld(e.target.value)}
                className="px-3 py-3 bg-blue-50 dark:bg-gray-700 text-sm font-medium text-blue-700 dark:text-gray-200 focus:outline-none cursor-pointer border-l border-blue-200 dark:border-gray-700"
              >
                {TLD_LIST.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <button
              type="submit"
              disabled={checking || !name.trim()}
              className="px-6 py-3 bg-gradient-to-r from-teal to-teal-dark text-white text-sm font-semibold rounded-xl hover:from-teal-dark hover:to-teal transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shrink-0"
            >
              {checking ? 'Checking...' : 'Check'}
            </button>
          </form>

          {resultError && <p className="mt-4 text-sm text-rose dark:text-purple-300">{resultError}</p>}

          {results && results.length > 0 && (
            <div className="mt-6 space-y-3">
              {results.map((r, i) => {
                const c = getColor(r.available);
                return (
                  <div key={i} className={`rounded-2xl p-5 ${c.bg} border border-blue-100 dark:border-gray-700`}>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${c.badge}`}>
                          {r.available === true ? 'Available' : r.available === false ? 'Taken' : 'Unknown'}
                        </span>
                        <span className="text-lg font-bold text-blue-900 dark:text-gray-100">{r.domain}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        {r.available === true && (
                          <>
                            <span className="text-sm font-bold text-teal-dark dark:text-teal-light">${r.price}/yr</span>
                            <Link
                              to={`/book?domain=${encodeURIComponent(r.domain)}`}
                              className="px-4 py-2 bg-gradient-to-r from-teal to-teal-dark text-white text-xs font-semibold rounded-xl hover:from-teal-dark hover:to-teal transition-all shadow-sm"
                            >
                              Register
                            </Link>
                          </>
                        )}
                        {r.available === false && r.tld && (
                          <span className="text-xs text-blue-400/60 dark:text-gray-500">{TLD_NAMES[r.tld] || r.tld.toUpperCase()}</span>
                        )}
                      </div>
                    </div>
                    {r.available === false && r.creationDate && (
                      <p className="text-xs text-blue-400/60 dark:text-gray-500 mt-2">Registered since {r.creationDate}</p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
