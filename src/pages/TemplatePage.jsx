import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { fetchTemplate, fetchTemplateImages, addBooking } from '../data';

export default function TemplatePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [template, setTemplate] = useState(null);
  const [pages, setPages] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    Promise.all([
      fetchTemplate(id),
      fetchTemplateImages(id),
    ])
      .then(([t, imgs]) => {
        if (t) { setTemplate(t); setPages(imgs); }
        else setError('Template not found.');
      })
      .catch(() => setError('Failed to load template.'))
      .finally(() => setLoading(false));
  }, [id]);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name || !form.email) { setError('Name and email are required.'); return; }
    setSaving(true);
    setError('');
    try {
      const booking = {
        template_id: template.id,
        name: form.name,
        email: form.email,
        phone: form.phone,
        type: template.category,
        message: form.message,
        payment_amount: template.price,
        status: 'pending',
      };
      const result = await addBooking(booking);
      if (result?.id) {
        navigate(`/payment/${result.id}?template=${template.id}`);
      } else {
        setError('Failed to create booking.');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <main className="flex-1 flex items-center justify-center py-20"><p className="text-black/70 dark:text-gray-300 text-lg">Loading...</p></main>;
  if (error && !template) return <main className="flex-1 flex items-center justify-center py-20"><p className="text-rose dark:text-purple-300 text-lg">{error}</p></main>;
  if (!template) return null;

  const allImages = pages.length > 0 ? pages : (template.image ? [{ image_url: template.image, caption: template.name }] : []);
  const current = allImages[currentPage];

  return (
    <main className="flex-1">
      <div className="max-w-6xl mx-auto px-5 py-8">
        <Link to="/templates" className="inline-flex items-center gap-1.5 text-sm text-black/60 dark:text-gray-400 hover:text-black dark:hover:text-gray-200 mb-6 transition-colors group">
          <svg className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
          Back to Templates
        </Link>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left: Image viewer */}
          <div className="flex-1 min-w-0">
            <div className="glass-card rounded-3xl overflow-hidden">
              <div className="relative bg-blue-50 dark:bg-black/80/50 flex items-center justify-center" style={{ minHeight: '400px', maxHeight: '70vh' }}>
                {current && (
                  <img src={current.image_url} alt={current.caption || template.name} className="w-full h-full object-contain" style={{ maxHeight: '70vh' }} loading="lazy" decoding="async" />
                )}
              </div>
              {allImages.length > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t border-blue-100 dark:border-white/10">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                    disabled={currentPage === 0}
                    className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-blue-50 dark:hover:bg-white/10 disabled:opacity-30 transition-colors cursor-pointer"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                  </button>
                  <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
                    {allImages.map((img, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentPage(i)}
                        className={`shrink-0 w-12 h-10 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                          i === currentPage ? 'border-teal shadow-sm' : 'border-transparent opacity-60 hover:opacity-100'
                        }`}
                      >
                        <img src={img.image_url} alt={`Page ${i + 1}`} className="w-full h-full object-cover" loading="lazy" decoding="async" />
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(allImages.length - 1, p + 1))}
                    disabled={currentPage === allImages.length - 1}
                    className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-blue-50 dark:hover:bg-white/10 disabled:opacity-30 transition-colors cursor-pointer"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right: Info + Booking Form */}
          <div className="w-full lg:w-96 shrink-0">
            <div className="sticky top-24 space-y-6">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-xs font-medium text-teal-dark dark:text-teal-light bg-teal/10 dark:bg-teal-dark/20 px-3 py-1 rounded-full">{template.category}</span>
                  {template.price > 0 ? (
                    <span className="text-lg font-bold text-black dark:text-gray-100">${template.price}</span>
                  ) : (
                    <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1 rounded-full">Free</span>
                  )}
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-black dark:text-gray-100 mb-2">{template.name}</h1>
                <p className="text-sm text-black/60 dark:text-gray-400 leading-relaxed">{template.description}</p>
                {allImages.length > 1 && (
                  <p className="text-xs text-black/50 dark:text-gray-500 mt-2">{currentPage + 1} / {allImages.length} pages</p>
                )}
              </div>

              <div className="glass-card rounded-2xl p-5">
                <h3 className="text-sm font-semibold text-black dark:text-gray-100 mb-4">Book This Template</h3>
                {error && <p className="text-sm text-rose dark:text-purple-300 mb-3">{error}</p>}
                <form onSubmit={handleSubmit} className="space-y-3">
                  <div>
                    <input name="name" value={form.name} onChange={handleChange} required placeholder="Your Name" className="w-full px-3.5 py-2.5 bg-white/70 dark:bg-black/70 border border-blue-200 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal/40 dark:text-gray-200" />
                  </div>
                  <div>
                    <input name="email" type="email" value={form.email} onChange={handleChange} required placeholder="Your Email" className="w-full px-3.5 py-2.5 bg-white/70 dark:bg-black/70 border border-blue-200 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal/40 dark:text-gray-200" />
                  </div>
                  <div>
                    <input name="phone" type="tel" value={form.phone} onChange={handleChange} placeholder="Phone (optional)" className="w-full px-3.5 py-2.5 bg-white/70 dark:bg-black/70 border border-blue-200 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal/40 dark:text-gray-200" />
                  </div>
                  <div>
                    <textarea name="message" value={form.message} onChange={handleChange} rows={3} placeholder="Tell us about your project (optional)" className="w-full px-3.5 py-2.5 bg-white/70 dark:bg-black/70 border border-blue-200 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal/40 dark:text-gray-200 resize-none" />
                  </div>
                  <button
                    type="submit"
                    disabled={saving}
                    className="w-full py-3 bg-gradient-to-r from-teal to-teal-dark text-white text-sm font-semibold rounded-xl hover:from-teal-dark hover:to-teal hover:shadow-lg hover:shadow-teal/25 transition-all shadow-sm disabled:opacity-60 cursor-pointer"
                  >
                    {saving ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" strokeDasharray="32" strokeLinecap="round" /></svg>
                        Booking...
                      </span>
                    ) : template.price > 0 ? `Book Now - $${template.price}` : 'Book Now - Free'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
