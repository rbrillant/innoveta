import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchPage, fetchAllServices } from '../data';

const SECTIONS = [
  {
    id: 'network-security',
    type: 'network-security',
    label: 'Network & Security',
    subtitle: 'We deliver end-to-end security solutions across all generations of technology from PSTN to All-IP Backbone and LTE',
    icon: '🛡️',
  },
  {
    id: 'it-consulting',
    type: 'it-consulting',
    label: 'IT Consulting',
    subtitle: 'We offer IT consulting services regarding the following',
    icon: '💡',
  },
  {
    id: 'cctv',
    type: 'cctv',
    label: 'Surveillance CCTV',
    subtitle: 'AOS Surveillance Systems enhances perceptions of safety and security through an Integrated Video Surveillance System deployed in a network of high performance IP CCTV.',
    icon: '📹',
  },
];

export default function ServicesPage() {
  const [page, setPage] = useState(null);
  const [grouped, setGrouped] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetchPage('services').then((d) => { if (d) setPage(d); }),
      fetchAllServices().then((all) => {
        const map = {};
        all.forEach((s) => {
          if (!map[s.type]) map[s.type] = [];
          map[s.type].push(s);
        });
        setGrouped(map);
      }),
    ]).finally(() => setLoading(false));
  }, []);

  if (loading) return <main className="flex-1 flex items-center justify-center py-20"><p className="text-black/70 dark:text-gray-300 text-lg">Loading...</p></main>;

  return (
    <main className="flex-1">
      <div className="relative overflow-hidden bg-gradient-to-br from-teal-dark/90 via-teal/80 to-blue-900/90 dark:from-black dark:via-teal-dark/40 dark:to-blue-900/60">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
        <div className="max-w-6xl mx-auto px-5 py-20 sm:py-28 relative z-10">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4">{page?.title || 'IT Integration & Consulting'}</h1>
          {page?.content ? (
            <div className="text-white/80 text-base sm:text-lg leading-relaxed max-w-3xl" dangerouslySetInnerHTML={{ __html: page.content }} />
          ) : (
            <p className="text-white/80 text-base sm:text-lg leading-relaxed max-w-3xl">
              End-to-end technology solutions that connect, secure, and transform your business. From network infrastructure to strategic IT consulting, we deliver innovation that drives results.
            </p>
          )}
          <div className="flex flex-wrap gap-3 mt-8">
            <Link to="/book" className="px-8 py-3.5 bg-white text-teal-dark font-semibold rounded-xl hover:bg-white/90 transition-all shadow-lg text-sm sm:text-base">Get Started →</Link>
            <a href={`#${SECTIONS[0].id}`} className="px-8 py-3.5 bg-white/10 text-white font-semibold rounded-xl hover:bg-white/20 transition-all border border-white/20 text-sm sm:text-base">Explore Services</a>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-5 py-16">
        {SECTIONS.map((sec) => {
          const services = grouped[sec.type] || [];
          if (services.length === 0) return null;
          return (
            <section key={sec.id} id={sec.id} className="mb-20">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-1 h-8 bg-teal-dark rounded-full" />
                <h2 className="text-2xl sm:text-3xl font-bold text-black dark:text-gray-100">{sec.label}</h2>
              </div>
              <p className="text-black/60 dark:text-gray-400 text-base mb-8 ml-4">{sec.subtitle}</p>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {services.map((s) => (
                  <Link
                    key={s.id}
                    to={`/book?service=${encodeURIComponent(s.title)}&type=${s.type}`}
                    className="group relative glass-card rounded-2xl p-7 hover:shadow-lg transition-all hover:-translate-y-1 block"
                  >
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-teal/20 to-teal-dark/20 dark:from-teal/10 dark:to-teal-dark/30 flex items-center justify-center text-2xl shrink-0 group-hover:scale-110 transition-transform">
                        {s.icon || sec.icon}
                      </div>
                      <h3 className="text-lg font-semibold text-black dark:text-gray-100 leading-snug">{s.title}</h3>
                    </div>
                    <p className="text-sm text-black/60 dark:text-gray-400 leading-relaxed mb-4">{s.description}</p>
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-teal-dark dark:text-teal-light group-hover:gap-2 transition-all">
                      Request Service →
                    </span>
                    <div className="absolute bottom-0 left-7 right-7 h-0.5 bg-gradient-to-r from-teal/0 via-teal/40 to-teal-dark/40 scale-x-0 group-hover:scale-x-100 transition-transform origin-left rounded-full" />
                  </Link>
                ))}
              </div>
            </section>
          );
        })}

        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-teal-dark/90 via-teal to-blue-900/80 dark:from-black dark:via-teal-dark/60 dark:to-blue-900/80 p-10 sm:p-14 text-center">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
          <div className="relative z-10">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Ready to Transform Your Business?</h2>
            <p className="text-white/80 text-base sm:text-lg max-w-2xl mx-auto mb-8">
              Let's discuss how our IT solutions and consulting services can help you achieve your goals.
            </p>
            <Link to="/book" className="inline-block px-10 py-4 bg-white text-teal-dark font-semibold rounded-xl hover:bg-white/90 transition-all shadow-lg text-sm sm:text-base">Book a Consultation</Link>
          </div>
        </section>
      </div>
    </main>
  );
}
