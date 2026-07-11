import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { supabase } from '../supabase';
import { addBooking, fetchTemplates, fetchDomainPricing } from '../data';

export default function Book() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [sending, setSending] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [userId, setUserId] = useState(null);
  const [template, setTemplate] = useState(null);
  const [domainPrice, setDomainPrice] = useState(null);

  const templateId = searchParams.get('template') || null;
  const domainParam = searchParams.get('domain') || null;

  useEffect(() => {
    supabase.auth.getSession().then((result) => {
      const session = result?.data?.session;
      if (session) setUserId(session.user?.id);
    });
  }, []);

  useEffect(() => {
    if (templateId) {
      fetchTemplates().then((list) => {
        const t = list.find((item) => item.id === templateId);
        if (t) setTemplate(t);
      });
    }
  }, [templateId]);

  useEffect(() => {
    if (domainParam) {
      const parts = domainParam.split('.');
      const tld = parts.length > 1 ? '.' + parts.pop() : '';
      fetchDomainPricing().then((list) => {
        const d = list.find((item) => item.tld === tld);
        if (d) setDomainPrice({ ...d, price: parseFloat(d.price) });
      });
    }
  }, [domainParam]);

  async function handleSubmit(e) {
    e.preventDefault();
    setSending(true);
    setSubmitError('');

    const fd = new FormData(e.target);

    let message;
    if (domainParam) {
      const addr = [fd.get('street'), `${fd.get('city')}, ${fd.get('state')} ${fd.get('zip')}`, fd.get('country')].filter(Boolean).join('\n');
      message = `Domain booking: ${domainParam} ($${domainPrice?.price?.toFixed(2) || '?'}/yr)\n\nRegistrant:\n${fd.get('name')}\n${fd.get('email')}\n${fd.get('phone') || ''}\n${addr}\n\nNotes: ${fd.get('message') || ''}`;
    } else {
      message = fd.get('message')?.trim() || `Booking ${template?.name || 'template'}`;
    }

    const booking = {
      user_id: userId,
      name: fd.get('name'),
      email: fd.get('email'),
      phone: fd.get('phone') || '',
      type: domainParam ? 'Domain' : (template?.category || ''),
      message,
      payment_amount: domainPrice?.price || null,
    };

    if (templateId) booking.template_id = templateId;

    try {
      const result = await addBooking(booking);
      if (result?.id) {
        navigate(`/payment/${result.id}`);
      } else {
        navigate('/book/done');
      }
    } catch (err) {
      setSubmitError(err.message || 'Failed to submit booking. Check console for details.');
      setSending(false);
    }
  }

  return (
    <main className="flex-1">
      <div className="max-w-6xl mx-auto px-5 py-16">
        <div className="text-center mb-10">
          <span className="inline-block text-xs font-medium text-teal-dark dark:text-teal-light bg-white/70 dark:bg-black/70 backdrop-blur-md px-4 py-1.5 rounded-full mb-3 shadow-sm border border-white/40 dark:border-white/10">
            {domainParam ? '✦ Register Domain' : '✦ Hire Me'}
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-warm-dark dark:text-gray-100">
            {domainParam ? 'Claim Your Domain' : "Let's Work Together"}
          </h2>
          <p className="text-black dark:text-gray-300 mt-2 max-w-lg mx-auto">
            {domainParam
              ? `Secure ${domainParam} — fill out the form and we'll handle the rest.`
              : 'Fill out the form and I\'ll get back to you within 24 hours.'}
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <form onSubmit={handleSubmit} className="lg:col-span-2 glass-card rounded-2xl p-6 sm:p-8 space-y-5">
            {domainParam ? (
              <div className="glass-card rounded-xl p-4 flex items-center gap-4 bg-gradient-to-r from-teal/5 to-teal-dark/5 dark:from-teal/10 dark:to-teal-dark/10 border border-teal/20 dark:border-teal-dark/20">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal to-teal-dark flex items-center justify-center text-white text-lg font-bold shrink-0">🌐</div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-black dark:text-gray-100">{domainParam}</p>
                  <p className="text-xs text-black/60 dark:text-gray-400">Domain Registration — {domainPrice ? `$${domainPrice.price.toFixed(2)}/yr` : 'Loading...'}</p>
                </div>
                <span className="text-[10px] font-medium text-teal-dark dark:text-teal-light bg-teal/15 dark:bg-teal-dark/20 px-2 py-1 rounded-full shrink-0">Available</span>
              </div>
            ) : template ? (
              <div className="glass-card rounded-xl p-4 flex items-center gap-4 bg-white/60 dark:bg-black/60">
                {template.image && <img src={template.image} alt={template.name} className="w-16 h-16 rounded-xl object-cover shrink-0" loading="lazy" decoding="async" />}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-black dark:text-gray-100">{template.name}</p>
                  <p className="text-xs text-black/60 dark:text-gray-400">{template.category}{template.price > 0 ? ` — $${template.price}` : ' — Free'}</p>
                </div>
                <span className="text-[10px] font-medium text-teal-dark dark:text-teal-light bg-teal/15 dark:bg-teal-dark/20 px-2 py-1 rounded-full shrink-0">Selected</span>
              </div>
            ) : (
              <div className="glass-card rounded-xl p-4 bg-sky-50/50 dark:bg-sky-900/20 border border-sky-200/50 dark:border-sky-900/30">
                <p className="text-sm text-sky-700 dark:text-sky-400">No template selected. <Link to="/home" className="underline hover:text-teal-dark dark:hover:text-teal-light">Browse templates</Link> and choose one to book.</p>
              </div>
            )}

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-black dark:text-gray-300 mb-1">Your Name</label>
                <input name="name" required placeholder="e.g. Sarah Johnson" className="w-full px-3.5 py-2.5 bg-white/70 dark:bg-black/70 border border-glass-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal/40 focus:border-teal backdrop-blur-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-black dark:text-gray-300 mb-1">Email</label>
                <input name="email" type="email" required placeholder="sarah@example.com" className="w-full px-3.5 py-2.5 bg-white/70 dark:bg-black/70 border border-glass-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal/40 focus:border-teal backdrop-blur-sm" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-black dark:text-gray-300 mb-1">Phone <span className="text-black/60 dark:text-gray-500 font-normal">(optional)</span></label>
              <input name="phone" type="tel" placeholder="+1 234 567 890" className="w-full px-3.5 py-2.5 bg-white/70 dark:bg-black/70 border border-glass-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal/40 focus:border-teal backdrop-blur-sm" />
            </div>

            {domainParam && (
              <div className="space-y-4">
                <p className="text-sm font-medium text-black dark:text-gray-300 border-b border-blue-200/50 dark:border-white/10 pb-1">Registrant Address (ICANN required)</p>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-black dark:text-gray-300 mb-1">Street Address</label>
                    <input name="street" required placeholder="123 Main St" className="w-full px-3.5 py-2.5 bg-white/70 dark:bg-black/70 border border-glass-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal/40 focus:border-teal backdrop-blur-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-black dark:text-gray-300 mb-1">City</label>
                    <input name="city" required placeholder="New York" className="w-full px-3.5 py-2.5 bg-white/70 dark:bg-black/70 border border-glass-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal/40 focus:border-teal backdrop-blur-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-black dark:text-gray-300 mb-1">State / Province</label>
                    <input name="state" required placeholder="NY" className="w-full px-3.5 py-2.5 bg-white/70 dark:bg-black/70 border border-glass-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal/40 focus:border-teal backdrop-blur-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-black dark:text-gray-300 mb-1">Postal Code</label>
                    <input name="zip" required placeholder="10001" className="w-full px-3.5 py-2.5 bg-white/70 dark:bg-black/70 border border-glass-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal/40 focus:border-teal backdrop-blur-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-black dark:text-gray-300 mb-1">Country</label>
                    <input name="country" required placeholder="United States" className="w-full px-3.5 py-2.5 bg-white/70 dark:bg-black/70 border border-glass-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal/40 focus:border-teal backdrop-blur-sm" />
                  </div>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-black dark:text-gray-300 mb-1">{domainParam ? 'Notes' : 'Message'} <span className="text-black/60 dark:text-gray-500 font-normal">(optional)</span></label>
              <textarea name="message" rows={3} placeholder={domainParam ? 'Any special requirements?' : 'Tell me about your project...'} className="w-full px-3.5 py-2.5 bg-white/70 dark:bg-black/70 border border-glass-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal/40 focus:border-teal backdrop-blur-sm" />
            </div>

            {submitError && <p className="text-sm text-rose dark:text-purple-300 bg-rose/10 dark:bg-purple-900/20 rounded-xl px-4 py-2">{submitError}</p>}

            <button
              type="submit"
              disabled={sending || (!templateId && !domainParam) || (domainParam && !domainPrice)}
              className="w-full px-6 py-3 bg-gradient-to-r from-teal to-teal-dark text-white text-sm font-semibold rounded-xl hover:from-teal-dark hover:to-teal transition-all shadow-sm disabled:opacity-60 cursor-pointer inline-flex items-center justify-center gap-2"
            >
              {sending && <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>}{sending ? 'Sending...' : domainParam ? `Register ${domainParam}` : 'Send Request ✨'}
            </button>
          </form>

          <div className="space-y-4">
            {[
              { icon: '⏱️', title: 'Fast Turnaround', desc: 'Most projects delivered within 5–7 days.' },
              { icon: '🔄', title: 'Unlimited Revisions', desc: "I don't stop until you love it." },
              { icon: '💎', title: 'Premium Quality', desc: 'Pixel-perfect, responsive, modern.' },
            ].map((item) => (
              <div key={item.title} className="glass-card rounded-2xl p-5">
                <span className="text-2xl">{item.icon}</span>
                <h4 className="font-semibold text-warm-dark dark:text-gray-100 mt-2">{item.title}</h4>
                <p className="text-sm text-black dark:text-gray-300 mt-0.5">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
