import { useState, useEffect } from 'react';
import { fetchPage, fetchDomainPricing, checkAllDomains } from '../data';
import { Link } from 'react-router-dom';

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
  xyz: 'Generic',
  online: 'Online',
  store: 'Store',
  tech: 'Tech',
};

export default function DomainHosting() {
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [checking, setChecking] = useState(false);
  const [results, setResults] = useState(null);
  const [resultError, setResultError] = useState('');
  const [domainPrices, setDomainPrices] = useState([]);

  useEffect(() => {
    Promise.all([
      fetchPage('domain-hosting'),
      fetchDomainPricing(),
    ]).then(([p, prices]) => {
      if (p) setPage(p);
      setDomainPrices(prices || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  async function handleSearch(e) {
    e.preventDefault();
    if (!name.trim()) return;
    setChecking(true);
    setResultError('');
    setResults(null);
    try {
      const data = await checkAllDomains(name.trim());
      setResults(Array.isArray(data) ? data : []);
    } catch {
      setResultError('Lookup failed. Please try again.');
    } finally {
      setChecking(false);
    }
  }

  function getColor(available) {
    if (available === true) return { bg: 'bg-emerald-50 dark:bg-emerald-900/20', text: 'text-emerald-700 dark:text-emerald-400', badge: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600' };
    if (available === false) return { bg: 'bg-rose-50 dark:bg-rose-900/20', text: 'text-rose-700 dark:text-rose-400', badge: 'bg-rose-100 dark:bg-rose-900/30 text-rose-600' };
    return { bg: 'bg-sky-50 dark:bg-sky-900/20', text: 'text-sky-700 dark:text-sky-400', badge: 'bg-sky-100 dark:bg-sky-900/30 text-sky-600' };
  }

  if (loading) return <main className="flex-1 flex items-center justify-center py-20"><p className="text-black/70 dark:text-gray-300 text-lg">Loading...</p></main>;

  return (
    <main className="flex-1">
      <div className="max-w-5xl mx-auto px-5 py-16">
        {page?.image && (
          <img src={page.image} alt={page.title} className="w-full h-64 sm:h-80 object-cover rounded-3xl mb-8" loading="lazy" decoding="async" />
        )}
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-black dark:text-gray-100 mb-6">{page?.title || 'Domain & Hosting'}</h1>
        {page?.content && (
          <div
            className="text-black/70 dark:text-gray-300 text-base sm:text-lg leading-relaxed space-y-4 mb-10"
            dangerouslySetInnerHTML={{ __html: page.content }}
          />
        )}

        {/* Domain Search */}
        <div className="glass-card rounded-3xl p-6 sm:p-8 mb-10">
          <h2 className="text-2xl font-bold text-black dark:text-gray-100 mb-2">Search Available Domains</h2>
          <p className="text-sm text-black/60 dark:text-gray-400 mb-6">Check availability across all extensions</p>

          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
            <div className="flex flex-1 rounded-xl border border-blue-200 dark:border-white/10 overflow-hidden bg-white/70 dark:bg-black/70">
              <span className="flex items-center pl-4 text-sm text-black/50 dark:text-gray-500 font-medium">https://</span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="yourdomain"
                className="flex-1 px-2 py-3 bg-transparent text-sm focus:outline-none dark:text-gray-200 font-mono"
              />
            </div>
            <button
              type="submit"
              disabled={checking || !name.trim()}
              className="px-8 py-3 bg-gradient-to-r from-teal to-teal-dark text-white text-sm font-semibold rounded-xl hover:from-teal-dark hover:to-teal transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shrink-0"
            >
              {checking ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" strokeDasharray="32" strokeLinecap="round" /></svg>
                  Checking...
                </span>
              ) : 'Search'}
            </button>
          </form>

          {resultError && <p className="mt-4 text-sm text-rose dark:text-purple-300">{resultError}</p>}
        </div>

        {/* Pricing Table */}
        {!results && domainPrices.length > 0 && (
          <div className="glass-card rounded-3xl p-6 sm:p-8">
            <h2 className="text-xl font-bold text-black dark:text-gray-100 mb-6">Domain Pricing</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {domainPrices.map(({ tld, price }) => (
                <div key={tld} className="rounded-2xl border border-blue-100 dark:border-white/10 p-4 flex items-center justify-between hover:border-teal/40 hover:shadow-sm transition-all">
                  <div>
                    <p className="text-base font-bold text-black dark:text-gray-100">{tld}</p>
                    <p className="text-xs text-black/50 dark:text-gray-500">{TLD_NAMES[tld.replace('.', '')] || 'Generic'}</p>
                  </div>
                  <p className="text-sm font-semibold text-teal-dark dark:text-teal-light">${price}/<span className="text-xs font-normal text-black/50 dark:text-gray-500">yr</span></p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Search Results */}
        {results && results.length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-black dark:text-gray-100 mb-2">Results for <span className="text-teal-dark dark:text-teal-light">{name.trim().toLowerCase().replace(/[^a-z0-9-]/g, '')}</span></h2>
            <p className="text-sm text-black/60 dark:text-gray-400 mb-6">{results.filter((r) => r.available === true).length} available</p>
            <div className="grid gap-3">
              {results.map((r, i) => {
                const c = getColor(r.available);
                return (
                  <div key={i} className={`rounded-2xl p-4 sm:p-5 ${c.bg} border border-blue-100 dark:border-white/10`}>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${c.badge}`}>
                          {r.available === true ? 'Available' : r.available === false ? 'Taken' : 'Checking...'}
                        </span>
                        <span className="text-lg font-bold font-mono text-black dark:text-gray-100">{r.domain}</span>
                        <span className="text-xs text-black/50 dark:text-gray-500 bg-white/50 dark:bg-black/80/50 px-2 py-0.5 rounded-full">{TLD_NAMES[r.tld.replace('.', '')] || 'Generic'}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-teal-dark dark:text-teal-light">${r.price}/yr</span>
                        {r.available === true ? (
                          <Link
                            to={`/book?domain=${encodeURIComponent(r.domain)}`}
                            className="px-4 py-2 bg-gradient-to-r from-teal to-teal-dark text-white text-xs font-semibold rounded-xl hover:from-teal-dark hover:to-teal transition-all shadow-sm"
                          >
                            Register
                          </Link>
                        ) : r.available === false ? (
                          <span className="text-xs text-black/40 dark:text-gray-500 italic">Unavailable</span>
                        ) : (
                          <span className="text-xs text-black/40 dark:text-gray-500 animate-pulse">Checking...</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* No results state */}
        {results && results.length === 0 && (
          <div className="glass-card rounded-3xl p-8 text-center">
            <p className="text-black/60 dark:text-gray-400 text-lg">No domain extensions found in pricing database.</p>
          </div>
        )}
      </div>
    </main>
  );
}
