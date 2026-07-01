import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchPage } from '../data';

const SERVICES = [
  { icon: '🔍', title: 'Tech Audit', desc: 'Comprehensive review of your existing tech stack, code quality, infrastructure, and security posture.' },
  { icon: '🏛️', title: 'Architecture Review', desc: 'Evaluate system design, scalability, and maintainability. Get a clear roadmap for improvements.' },
  { icon: '🧭', title: 'Stack Strategy', desc: 'Choose the right technologies for your next project. We compare build vs. buy, cost, and trade-offs.' },
  { icon: '⚡', title: 'Performance Optimization', desc: 'Identify bottlenecks in your application or infrastructure and implement targeted performance improvements.' },
  { icon: '🔒', title: 'Security Assessment', desc: 'Vulnerability scanning, penetration testing, and security best practices tailored to your system.' },
  { icon: '🚀', title: 'Digital Transformation', desc: 'End-to-end guidance for moving your business processes online with modern tools and workflows.' },
];

const STEPS = [
  { num: '01', title: 'Discovery', desc: 'We learn about your business, goals, and current challenges through structured interviews and documentation review.' },
  { num: '02', title: 'Analysis', desc: 'Our team performs deep technical analysis, identifying gaps, risks, and opportunities in your current setup.' },
  { num: '03', title: 'Recommendations', desc: 'You receive a prioritized action plan with clear timelines, cost estimates, and expected outcomes.' },
  { num: '04', title: 'Implementation', desc: 'We work alongside your team — or handle the execution directly — to deliver measurable results.' },
];

export default function Consulting() {
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPage('consulting').then((d) => { if (d) setPage(d); }).finally(() => setLoading(false));
  }, []);

  if (loading) return <main className="flex-1 flex items-center justify-center py-20"><p className="text-blue-600/70 dark:text-gray-300 text-lg">Loading...</p></main>;

  return (
    <main className="flex-1">
      <div className="max-w-6xl mx-auto px-5 py-16">
        {page?.image && (
          <img src={page.image} alt={page.title} className="w-full h-64 sm:h-80 object-cover rounded-3xl mb-8" />
        )}
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-blue-900 dark:text-gray-100 mb-6">{page?.title || 'Consulting'}</h1>
        {page?.content && (
          <div className="text-blue-600/70 dark:text-gray-300 text-base sm:text-lg leading-relaxed space-y-4 mb-10" dangerouslySetInnerHTML={{ __html: page.content }} />
        )}

        <div className="flex flex-wrap gap-2 mb-10">
          <Link
            to="/book"
            className="px-6 py-3 bg-gradient-to-r from-teal to-teal-dark text-white text-sm font-semibold rounded-xl hover:from-teal-dark hover:to-teal transition-all shadow-sm"
          >
            Book a Consultation →
          </Link>
        </div>

        <h2 className="text-2xl font-bold text-blue-900 dark:text-gray-100 mb-6">Consulting Services</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-16">
          {SERVICES.map((s, i) => (
            <div key={i} className="glass-card rounded-2xl p-6 hover:shadow-lg transition-shadow">
              <span className="text-3xl block mb-3">{s.icon}</span>
              <h3 className="text-lg font-semibold text-blue-900 dark:text-gray-100 mb-1">{s.title}</h3>
              <p className="text-sm text-blue-500/60 dark:text-gray-400">{s.desc}</p>
            </div>
          ))}
        </div>

        <h2 className="text-2xl font-bold text-blue-900 dark:text-gray-100 mb-6">How It Works</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-16">
          {STEPS.map((s, i) => (
            <div key={i} className="glass-card rounded-2xl p-6 hover:shadow-lg transition-shadow">
              <span className="text-2xl font-bold text-teal-dark dark:text-teal-light">{s.num}</span>
              <h3 className="text-lg font-semibold text-blue-900 dark:text-gray-100 mt-2 mb-1">{s.title}</h3>
              <p className="text-sm text-blue-500/60 dark:text-gray-400">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
