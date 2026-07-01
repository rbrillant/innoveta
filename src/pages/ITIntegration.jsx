import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchPage } from '../data';

const SERVICES = [
  { icon: '🔗', title: 'API Integration', desc: 'Connect your apps with REST, GraphQL, and webhook APIs. Secure, documented, and monitored.' },
  { icon: '💳', title: 'Payment Gateways', desc: 'Integrate Stripe, PayPal, Flutterwave, M-Pesa, and more. PCI-compliant with webhook support.' },
  { icon: '📊', title: 'CRM Setup', desc: 'Deploy and customize Salesforce, HubSpot, or Zoho. Sync contacts, deals, and workflows.' },
  { icon: '📧', title: 'Email Systems', desc: 'SMTP setup, transactional email (SendGrid, Postmark), and automated marketing sequences.' },
  { icon: '☁️', title: 'Cloud Migration', desc: 'Move infrastructure to AWS, GCP, or Azure. Containerization, CI/CD, and cost optimization.' },
  { icon: '🛠️', title: 'Custom Integration', desc: 'Bespoke middleware, event-driven pipelines, and system-to-system automation.' },
];

const PRICING = [
  { tier: 'Standard', price: '$499', desc: 'Single integration, up to 5 endpoints', features: ['API setup', 'Basic auth', 'Documentation', 'Email support'] },
  { tier: 'Professional', price: '$1,299', desc: 'Multi-system integration with middleware', features: ['Up to 20 endpoints', 'OAuth / SSO', 'Error handling', 'Monitoring dashboard', 'Priority support'] },
  { tier: 'Enterprise', price: 'Custom', desc: 'Full enterprise integration suite', features: ['Unlimited endpoints', 'Custom middleware', 'SLA guarantee', 'Dedicated engineer', '24/7 support'] },
];

export default function ITIntegration() {
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPage('it-integration').then((d) => { if (d) setPage(d); }).finally(() => setLoading(false));
  }, []);

  if (loading) return <main className="flex-1 flex items-center justify-center py-20"><p className="text-blue-600/70 dark:text-gray-300 text-lg">Loading...</p></main>;

  return (
    <main className="flex-1">
      <div className="max-w-6xl mx-auto px-5 py-16">
        {page?.image && (
          <img src={page.image} alt={page.title} className="w-full h-64 sm:h-80 object-cover rounded-3xl mb-8" />
        )}
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-blue-900 dark:text-gray-100 mb-6">{page?.title || 'IT Integration'}</h1>
        {page?.content && (
          <div className="text-blue-600/70 dark:text-gray-300 text-base sm:text-lg leading-relaxed space-y-4 mb-10" dangerouslySetInnerHTML={{ __html: page.content }} />
        )}

        <div className="flex flex-wrap gap-2 mb-10">
          <Link
            to="/book"
            className="px-6 py-3 bg-gradient-to-r from-teal to-teal-dark text-white text-sm font-semibold rounded-xl hover:from-teal-dark hover:to-teal transition-all shadow-sm"
          >
            Request Integration →
          </Link>
        </div>

        <h2 className="text-2xl font-bold text-blue-900 dark:text-gray-100 mb-6">Integration Services</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-16">
          {SERVICES.map((s, i) => (
            <div key={i} className="glass-card rounded-2xl p-6 hover:shadow-lg transition-shadow">
              <span className="text-3xl block mb-3">{s.icon}</span>
              <h3 className="text-lg font-semibold text-blue-900 dark:text-gray-100 mb-1">{s.title}</h3>
              <p className="text-sm text-blue-500/60 dark:text-gray-400">{s.desc}</p>
            </div>
          ))}
        </div>

        <h2 className="text-2xl font-bold text-blue-900 dark:text-gray-100 mb-6">Pricing</h2>
        <div className="grid sm:grid-cols-3 gap-5 mb-16">
          {PRICING.map((p, i) => (
            <div key={i} className="glass-card rounded-2xl p-6 hover:shadow-lg transition-shadow flex flex-col">
              <h3 className="text-lg font-semibold text-blue-900 dark:text-gray-100">{p.tier}</h3>
              <p className="text-3xl font-bold text-teal-dark dark:text-teal-light mt-2">{p.price}</p>
              <p className="text-xs text-blue-400/60 dark:text-gray-400 mt-1 mb-4">{p.desc}</p>
              <ul className="space-y-2 text-sm text-blue-600/70 dark:text-gray-300 flex-1">
                {p.features.map((f, j) => <li key={j} className="flex items-center gap-2"><span className="text-teal-dark dark:text-teal-light">✓</span>{f}</li>)}
              </ul>
              <Link
                to="/book"
                className="mt-4 w-full text-center px-4 py-2.5 bg-gradient-to-r from-teal to-teal-dark text-white text-sm font-semibold rounded-xl hover:from-teal-dark hover:to-teal transition-all shadow-sm"
              >
                Get Started
              </Link>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
