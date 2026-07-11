import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchPage, fetchServices, fetchServiceSteps } from '../data';

export default function Consulting() {
  const [page, setPage] = useState(null);
  const [services, setServices] = useState([]);
  const [steps, setSteps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetchPage('consulting').then((d) => { if (d) setPage(d); }),
      fetchServices('consulting').then(setServices),
      fetchServiceSteps().then(setSteps),
    ]).finally(() => setLoading(false));
  }, []);

  if (loading) return <main className="flex-1 flex items-center justify-center py-20"><p className="text-black/70 dark:text-gray-300 text-lg">Loading...</p></main>;

  return (
    <main className="flex-1">
      <div className="max-w-6xl mx-auto px-5 py-16">
        {page?.image && (
          <img src={page.image} alt={page.title} className="w-full h-64 sm:h-80 object-cover rounded-3xl mb-8" loading="lazy" decoding="async" />
        )}
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-black dark:text-gray-100 mb-6">{page?.title || 'Consulting'}</h1>
        {page?.content && (
          <div className="text-black/70 dark:text-gray-300 text-base sm:text-lg leading-relaxed space-y-4 mb-10" dangerouslySetInnerHTML={{ __html: page.content }} />
        )}

        <div className="flex flex-wrap gap-2 mb-10">
          <Link
            to="/book"
            className="px-6 py-3 bg-gradient-to-r from-teal to-teal-dark text-white text-sm font-semibold rounded-xl hover:from-teal-dark hover:to-teal transition-all shadow-sm"
          >
            Book a Consultation →
          </Link>
        </div>

        {services.length > 0 && (
          <>
            <h2 className="text-2xl font-bold text-black dark:text-gray-100 mb-6">Consulting Services</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-16">
              {services.map((s) => (
                <div key={s.id} className="glass-card rounded-2xl p-6 hover:shadow-lg transition-shadow">
                  {s.image ? (
                    <img src={s.image} alt={s.title} className="w-12 h-12 rounded-lg object-cover mb-3" loading="lazy" decoding="async" />
                  ) : (
                    <span className="text-3xl block mb-3">{s.icon}</span>
                  )}
                  <h3 className="text-lg font-semibold text-black dark:text-gray-100 mb-1">{s.title}</h3>
                  <p className="text-sm text-black/60 dark:text-gray-400">{s.description}</p>
                </div>
              ))}
            </div>
          </>
        )}

        {steps.length > 0 && (
          <>
            <h2 className="text-2xl font-bold text-black dark:text-gray-100 mb-6">How It Works</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-16">
              {steps.map((s) => (
                <div key={s.id} className="glass-card rounded-2xl p-6 hover:shadow-lg transition-shadow">
                  <span className="text-2xl font-bold text-teal-dark dark:text-teal-light">{String(s.step_number).padStart(2, '0')}</span>
                  <h3 className="text-lg font-semibold text-black dark:text-gray-100 mt-2 mb-1">{s.title}</h3>
                  <p className="text-sm text-black/60 dark:text-gray-400">{s.description}</p>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
