import { useState, useEffect, useRef } from 'react';
import mammoth from 'mammoth';
import { fetchTemplates, createTemplate, updateTemplate, removeTemplate, fetchBookings, verifyDesigner, updateBookingStatus, removeBooking, updateDesignerPassword, fetchAllUsers, fetchBookingAnalytics, fetchUserAnalytics, fetchDomainPricing, updateDomainPricing, verifyPayment, fetchCourses, upsertCourse, removeCourse, fetchLessons, upsertLesson, removeLesson, fetchPaymentSettings, updatePaymentSettings, fetchServices, upsertService, removeService, fetchServiceSteps, upsertServiceStep, removeServiceStep, fetchAllEnrollments } from '../data';
import TemplateModal from '../components/TemplateModal';
import Logo from '../components/Logo';
import { useTheme } from '../components/ThemeProvider';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area, CartesianGrid } from 'recharts';

const TABS = ['Dashboard', 'Templates', 'IT Integration', 'Consulting', 'Bookings', 'Enrollments', 'Analytics', 'Domains', 'Courses', 'Users', 'Settings'];

export default function Studio() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [designer, setDesigner] = useState(null);
  const [tab, setTab] = useState('Dashboard');
  const [templates, setTemplates] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [users, setUsers] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [userGrowth, setUserGrowth] = useState(null);
  const [domainPrices, setDomainPrices] = useState([]);
  const [paymentSettings, setPaymentSettings] = useState(null);
  const [paymentForm, setPaymentForm] = useState({ bank_name: '', account_name: '', account_number: '', currency: 'RWF', momo_network: '', momo_number: '', momo_name: '' });

  const [loading, setLoading] = useState({ templates: false, bookings: false, enrollments: false, users: false, analytics: false });
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [passForm, setPassForm] = useState({ current: '', newPass: '' });
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [deleteBooking, setDeleteBooking] = useState(null);
  const [confirmSignOut, setConfirmSignOut] = useState(false);
  const [avatarOpen, setAvatarOpen] = useState(false);
  const avatarRef = useRef(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [courses, setCourses] = useState([]);
  const [editingCourse, setEditingCourse] = useState(null);
  const [courseForm, setCourseForm] = useState({ title: '', description: '', price: 0, image: '', video_url: '', pdf_url: '' });
  const [courseSaving, setCourseSaving] = useState(false);
  const [lessons, setLessons] = useState([]);
  const [editingLesson, setEditingLesson] = useState(null);
  const [lessonForm, setLessonForm] = useState({ title: '', description: '', content_type: 'text', content: '', video_url: '', sort_order: 0 });
  const [lessonSaving, setLessonSaving] = useState(false);
  const { dark, toggle: toggleTheme } = useTheme();
  const loginCanvasRef = useRef();

  useEffect(() => {
    const canvas = loginCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let raf;

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    const particles = [];
    for (let i = 0; i < 80; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        r: Math.random() * 4 + 1.5,
        a: Math.random() * 0.5 + 0.2,
        hue: Math.random() > 0.5 ? 172 : 43,
      });
    }

    const stars = [];
    for (let i = 0; i < 150; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 1.6 + 0.3,
        a: Math.random() * 0.7 + 0.3,
        speed: Math.random() * 0.02 + 0.005,
        offset: Math.random() * Math.PI * 2,
      });
    }

    function draw(t) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const isDark = document.documentElement.classList.contains('dark');
      ctx.fillStyle = isDark ? '#0b1120' : '#fffff0';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      stars.forEach((s) => {
        const twinkle = s.a * (0.5 + 0.5 * Math.sin(t * s.speed + s.offset));
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = isDark ? `rgba(255, 255, 255, ${twinkle})` : `rgba(100, 120, 180, ${twinkle * 0.5})`;
        ctx.fill();
      });

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 80%, 55%, ${p.a})`;
        ctx.fill();
      });

      raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
  }, []);

  useEffect(() => {
    if (!avatarOpen) return;
    function handleClick(e) {
      const dd = document.getElementById('avatar-dropdown');
      if (avatarRef.current && !avatarRef.current.contains(e.target) && dd && !dd.contains(e.target)) setAvatarOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [avatarOpen]);

  function setLoadingKey(key, val) {
    setLoading((prev) => ({ ...prev, [key]: val }));
  }

  async function refreshData() {
    setLoadingKey('templates', true);
    setTemplates(await fetchTemplates());
    setLoadingKey('templates', false);

    setLoadingKey('bookings', true);
    try { setBookings(await fetchBookings()); }
    catch (e) { setError('Failed to load bookings.'); }
    setLoadingKey('bookings', false);

    setLoadingKey('users', true);
    setUsers(await fetchAllUsers());
    setLoadingKey('users', false);

    setLoadingKey('enrollments', true);
    setEnrollments(await fetchAllEnrollments());
    setLoadingKey('enrollments', false);

    setLoadingKey('analytics', true);
    setAnalytics(await fetchBookingAnalytics());
    setUserGrowth(await fetchUserAnalytics());
    setDomainPrices(await fetchDomainPricing());
    const ps = await fetchPaymentSettings();
    if (ps) { setPaymentSettings(ps); setPaymentForm(ps); }
    setCourses(await fetchCourses());
    setLoadingKey('analytics', false);
  }

  useEffect(() => {
    if (loggedIn) refreshData();
  }, [loggedIn]);

  async function handleLogin(e) {
    e.preventDefault();
    const email = e.target.email.value;
    const pass = e.target.password.value;
    const d = await verifyDesigner(email, pass);
    if (d) {
      setDesigner(d);
      setLoggedIn(true);
      setError('');
    } else {
      setError('Invalid email or password.');
    }
  }

  function handleLogout() {
    setLoggedIn(false);
    setDesigner(null);
    setTemplates([]);
    setBookings([]);
    setUsers([]);
    setConfirmSignOut(false);
  }

  function openAdd() { setEditing(null); setModalOpen(true); }
  function openEdit(tpl) { setEditing(tpl); setModalOpen(true); }

  async function handleSave(template) {
    if (template.id) { await updateTemplate(template); }
    else { await createTemplate(template); }
    setTemplates(await fetchTemplates());
    setModalOpen(false);
    setEditing(null);
  }

  async function handleDelete(id) {
    await removeTemplate(id);
    setTemplates(await fetchTemplates());
    setConfirmDelete(null);
  }

  async function handleBookingStatus(id, status) {
    try {
      await updateBookingStatus(id, status);
      setBookings(await fetchBookings());
      setError('');
    } catch { setError('Failed to update status.'); }
  }

  async function handleDeleteBooking(id) {
    try {
      await removeBooking(id);
      setBookings(await fetchBookings());
      setDeleteBooking(null);
      setError('');
    } catch { setError('Failed to delete booking.'); }
  }

  async function handlePasswordChange(e) {
    e.preventDefault();
    if (passForm.newPass.length < 6) { setError('New password must be at least 6 characters.'); return; }

    const d = await verifyDesigner(designer.email, passForm.current);
    if (!d) { setError('Current password is incorrect.'); return; }

    await updateDesignerPassword(designer.email, passForm.newPass);
    setDesigner({ ...designer, password: passForm.newPass });
    setPassForm({ current: '', newPass: '' });
    setSuccess('Password updated.');
    setError('');
    setTimeout(() => setSuccess(''), 3000);
  }

  if (!loggedIn) {
    return (
      <main className="relative w-full min-h-screen" style={{ height: '100vh' }}>
        <canvas ref={loginCanvasRef} className="absolute inset-0 w-full h-full" />
        <div className="relative z-10 w-full h-full flex items-center justify-center px-4">
          <div className="w-full max-w-sm">
            <div className="text-center mb-8">
              <span className="inline-block text-xs font-medium text-teal-dark dark:text-teal-light bg-teal/15 dark:bg-teal-dark/20 px-4 py-1.5 rounded-full mb-3">✦ Studio</span>
              <h2 className="text-3xl font-bold text-black dark:text-gray-100">Designer Portal</h2>
              <p className="text-black/60 dark:text-gray-400 mt-1">Sign in to manage your site.</p>
            </div>
            <form onSubmit={handleLogin} className="glass-card rounded-2xl p-6 sm:p-8 space-y-4">
              <div>
              <label className="block text-sm font-medium text-black/70/70 dark:text-gray-400 mb-1">Email</label>
              <input name="email" type="email" required placeholder="admin@innovetancy.com" className="w-full px-3.5 py-2.5 bg-white/70 dark:bg-gray-900/70 border border-blue-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal/40 focus:border-teal backdrop-blur-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-black/70/70 dark:text-gray-400 mb-1">Password</label>
              <input name="password" type="password" required placeholder="••••••••" className="w-full px-3.5 py-2.5 bg-white/70 dark:bg-gray-900/70 border border-blue-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal/40 focus:border-teal backdrop-blur-sm" />
            </div>
            {error && <p className="text-sm text-rose dark:text-purple-300">{error}</p>}
            <button type="submit" className="w-full px-6 py-3 bg-gradient-to-r from-teal to-teal-dark text-white text-sm font-semibold rounded-xl hover:from-teal-dark hover:to-teal transition-all shadow-sm cursor-pointer">Sign In</button>
          </form>
          </div>
          </div>
      </main>
    );
  }

  const stats = [
    { label: 'Templates', value: templates.length, color: 'text-teal-dark dark:text-teal-light', bg: 'bg-teal/15 dark:bg-teal-dark/20' },
    { label: 'Bookings', value: bookings.length, color: 'text-black dark:text-black/60', bg: 'bg-blue-100 dark:bg-gray-800' },
    { label: 'Clients', value: users.length, color: 'text-violet-600 dark:text-violet-400', bg: 'bg-violet-100 dark:bg-gray-800' },
  ];

  const statusColors = {
    pending: 'bg-sky-100 dark:bg-gray-800 text-sky-700',
    confirmed: 'bg-blue-100 dark:bg-gray-800 text-black dark:text-black/60',
    completed: 'bg-emerald-100 dark:bg-gray-800 text-emerald-700',
    cancelled: 'bg-rose-100 text-rose-700',
  };

  const paymentStatusColors = {
    pending: 'bg-sky-100 dark:bg-gray-800 text-sky-700',
    proof_submitted: 'bg-blue-100 dark:bg-gray-800 text-black dark:text-black/60',
    verified: 'bg-emerald-100 dark:bg-gray-800 text-emerald-700',
  };

  const filteredTemplates = templates.filter(
    (t) => {
      if (categoryFilter && t.category !== categoryFilter) return false;
      if (searchTerm && !t.name?.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      return true;
    }
  );

  const filteredBookings = bookings.filter(
    (b) =>
      b.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.type?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <main className="flex-1 min-h-screen bg-ivory dark:bg-gray-950 dark:text-gray-300">
      {confirmSignOut && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30">
          <div className="glass-card rounded-2xl p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-bold text-black dark:text-gray-100 mb-2">Sign Out</h3>
            <p className="text-sm text-black/70/70 dark:text-gray-400 mb-4">Are you sure you want to sign out?</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmSignOut(false)} className="flex-1 px-4 py-2 text-sm font-medium glass-card rounded-xl hover:bg-white/80 dark:hover:bg-gray-800/80 transition-colors cursor-pointer">Cancel</button>
              <button onClick={handleLogout} className="flex-1 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-teal to-teal-dark rounded-xl hover:from-teal-dark hover:to-teal transition-all cursor-pointer">Sign Out</button>
            </div>
          </div>
        </div>
      )}

      {confirmDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30">
          <div className="glass-card rounded-2xl p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-bold text-black dark:text-gray-100 mb-2">Delete Template</h3>
            <p className="text-sm text-black/70/70 dark:text-gray-400 mb-4">Are you sure you want to delete <strong>{confirmDelete.name}</strong>? This cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDelete(null)} className="flex-1 px-4 py-2 text-sm font-medium glass-card rounded-xl hover:bg-white/80 dark:hover:bg-gray-800/80 transition-colors cursor-pointer">Cancel</button>
              <button onClick={() => handleDelete(confirmDelete.id)} className="flex-1 px-4 py-2 text-sm font-medium text-white bg-rose rounded-xl hover:bg-rose-dark transition-all cursor-pointer">Delete</button>
            </div>
          </div>
        </div>
      )}

      {deleteBooking && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30">
          <div className="glass-card rounded-2xl p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-bold text-black dark:text-gray-100 mb-2">Delete Booking</h3>
            <p className="text-sm text-black/70/70 dark:text-gray-400 mb-4">Are you sure you want to delete booking from <strong>{deleteBooking.name}</strong>? This cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteBooking(null)} className="flex-1 px-4 py-2 text-sm font-medium glass-card rounded-xl hover:bg-white/80 dark:hover:bg-gray-800/80 transition-colors cursor-pointer">Cancel</button>
              <button onClick={() => handleDeleteBooking(deleteBooking.id)} className="flex-1 px-4 py-2 text-sm font-medium text-white bg-rose rounded-xl hover:bg-rose-dark transition-all cursor-pointer">Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Top bar with logo and tabs */}
      <div className="sticky top-0 z-50 glass-card border-b border-blue-100 dark:border-gray-800 relative !overflow-visible">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-3 py-2">
            <div className="flex items-center gap-3 overflow-x-auto flex-1">
              <div className="shrink-0 mr-2">
                <Logo showStudio />
              </div>
              {TABS.map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`text-xs font-medium px-3 py-1.5 rounded-full whitespace-nowrap transition-colors cursor-pointer ${
                    tab === t ? 'bg-teal text-white shadow-sm' : 'text-black/70 dark:text-gray-300 hover:bg-white/60 dark:hover:bg-gray-700/60 hover:text-black dark:hover:text-gray-100'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
            <div className="shrink-0 flex items-center gap-1">
              <button
                onClick={toggleTheme}
                className="w-7 h-7 flex items-center justify-center rounded-full text-black/60 hover:text-black dark:text-gray-400 dark:hover:text-gray-200 hover:bg-white/60 dark:hover:bg-gray-700/60 transition-colors cursor-pointer"
                title={dark ? 'Light mode' : 'Dark mode'}
              >
                {dark ? (
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                ) : (
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
                )}
              </button>
              <button
                ref={avatarRef}
                onClick={() => setAvatarOpen((o) => !o)}
                className="w-7 h-7 rounded-full bg-gradient-to-br from-teal to-teal-dark text-white text-xs font-bold flex items-center justify-center shrink-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                title={designer?.name || designer?.email}
              >
                {(designer?.name || designer?.email || 'D').slice(0, 1).toUpperCase()}
              </button>
            </div>
          </div>
        </div>
        {/* Avatar dropdown rendered OUTSIDE the flex row so it doesn't affect scrolling */}
        {avatarOpen && (
          <div id="avatar-dropdown" className="absolute right-4 top-full mt-1 z-[100] bg-white dark:bg-gray-800 rounded-2xl p-3 shadow-lg border border-blue-100 dark:border-gray-700 w-52">
            <p className="text-sm font-semibold text-black dark:text-gray-100 truncate">{designer?.name || 'Designer'}</p>
            <p className="text-xs text-black/60 dark:text-gray-500 truncate">{designer?.email}</p>
            <hr className="my-2 border-blue-50 dark:border-gray-700" />
            <button onClick={() => { setAvatarOpen(false); setConfirmSignOut(true); }} className="w-full text-left px-3 py-2 text-sm text-rose/70 dark:text-purple-400 hover:bg-rose/10 dark:hover:bg-purple-900/20 rounded-xl transition-colors cursor-pointer">Sign Out</button>
          </div>
        )}
      </div>
      <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">
        {error && (
          <div className="mb-4 text-sm text-rose dark:text-purple-300 bg-rose/10 dark:bg-purple-900/20 rounded-xl px-4 py-2 flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError('')} className="text-rose/60 dark:text-purple-400 hover:text-rose dark:hover:text-purple-300 cursor-pointer">&times;</button>
          </div>
        )}
        {success && <div className="mb-4 text-sm text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-gray-800 rounded-xl px-4 py-2">{success}</div>}

        {tab === 'Dashboard' && (
            <div>
              <h2 className="text-2xl font-bold text-black dark:text-gray-100 mb-1">Dashboard</h2>
              <p className="text-sm text-black/60 dark:text-gray-400 mb-6">Welcome back, {designer?.name || 'Designer'}!</p>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {stats.map((s) => (
                  <div key={s.label} className="glass-card rounded-2xl p-5">
                    <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
                    <p className="text-xs text-black/60 dark:text-gray-500 mt-1">{s.label}</p>
                  </div>
                ))}
              </div>
              <div className="grid lg:grid-cols-2 gap-6">
                <div className="glass-card rounded-2xl p-5">
                  <h3 className="font-semibold text-black dark:text-gray-100 mb-3">Recent Bookings</h3>
                  {loading.bookings ? <p className="text-sm text-black/60 dark:text-gray-500">Loading...</p> : bookings.length === 0 ? <p className="text-sm text-black/60 dark:text-gray-500">No bookings yet.</p> : (
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {bookings.slice(0, 5).map((b) => (
                        <div key={b.id} className="flex items-center justify-between py-1.5 border-b border-blue-50 dark:border-gray-800 last:border-0">
                          <div className="flex items-center gap-2">
                            {b.templates?.image && (
                              <img src={b.templates.image} alt="" className="w-8 h-8 rounded-lg object-cover shrink-0" />
                            )}
                            <div>
                              <p className="text-sm font-medium text-black">{b.name}</p>
                              <p className="text-xs text-black/60 dark:text-gray-500">{b.type}{b.templates?.name ? ` — ${b.templates.name}` : ''}</p>
                            </div>
                          </div>
                          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${statusColors[b.status] || statusColors.pending}`}>{b.status}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {tab === 'Templates' && (
            <div className="flex -mx-4 sm:-mx-6 lg:-mx-8">
              <aside className="shrink-0 w-[219px] hidden md:block border-r border-blue-100 dark:border-gray-800 min-h-[calc(100vh-120px)]">
                <div className="sticky top-24 px-4 py-6">
                  <div className="space-y-1">
                    <button
                      onClick={() => setCategoryFilter('')}
                      className={`w-full text-left px-3 py-2 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
                        !categoryFilter ? 'text-black bg-blue-50 dark:bg-gray-800' : 'text-black/70 hover:bg-white/60 dark:text-gray-400 dark:hover:bg-gray-800/60'
                      }`}
                    >
                      All Templates
                    </button>
                    {['Presentation', 'Poster', 'Resume', 'Email', 'Invitation', 'Mobile Video', 'Facebook Post', 'Business Card', 'Photo Collage', 'Whiteboard', 'Sheet', 'Instagram Post', 'Instagram Story', 'Landscape Video', 'Code', 'Flyer', 'Logo', 'Brochure', 'Menu', 'Doc', 'Websites'].map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setCategoryFilter(cat)}
                        className={`w-full text-left px-3 py-2 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
                          categoryFilter === cat ? 'text-black bg-blue-50 dark:bg-gray-800' : 'text-black/70 hover:bg-white/60 dark:text-gray-400 dark:hover:bg-gray-800/60'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
              </aside>
              <div className="flex-1 min-w-0 px-5 py-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-black dark:text-gray-100">Templates</h2>
                    <p className="text-sm text-black/60 dark:text-gray-400">{filteredTemplates.length} of {templates.length} total</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="text"
                      placeholder="Search templates..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="px-3.5 py-2 bg-white/70 dark:bg-gray-900/70 border border-blue-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal/40 w-48"
                    />
                    <button onClick={openAdd} className="px-5 py-2.5 bg-gradient-to-r from-teal to-teal-dark text-white text-sm font-semibold rounded-xl hover:from-teal-dark hover:to-teal transition-all shadow-sm cursor-pointer whitespace-nowrap">+ New Template</button>
                  </div>
                </div>
                {loading.templates ? (
                  <div className="text-center py-16 text-black/60 dark:text-gray-500 glass-card rounded-2xl"><p className="text-lg">Loading...</p></div>
                ) : filteredTemplates.length === 0 ? (
                  <div className="text-center py-16 text-black/60 dark:text-gray-500 glass-card rounded-2xl">
                    <p className="text-lg">{searchTerm ? 'No templates match your search.' : 'No templates in this category yet.'}</p>
                    {!searchTerm && <button onClick={openAdd} className="mt-3 text-teal-dark font-medium hover:underline cursor-pointer">Add your first template</button>}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredTemplates.map((t) => (
                      <div key={t.id} className="glass-card rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-5">
                        <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 flex items-center justify-center text-white font-bold text-sm" style={{ background: t.image ? 'transparent' : '#d4a017' }}>
                          {t.image ? <img src={t.image} alt={t.name} className="w-full h-full object-cover" /> : t.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-black dark:text-gray-100 truncate">{t.name}</h4>
                            <span className="text-xs font-medium text-teal-dark dark:text-teal-light bg-teal/15 dark:bg-teal-dark/20 px-2 py-0.5 rounded-full shrink-0">{t.category}</span>
                          </div>
                          <p className="text-sm text-black/60 dark:text-gray-400 truncate">{t.description}</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {t.price > 0 && <span className="text-sm font-bold text-black dark:text-gray-100 bg-blue-200/50 px-2 py-1 rounded-full">${t.price}</span>}
                          <button onClick={() => openEdit(t)} className="px-3 py-1.5 text-xs font-medium glass-card rounded-lg hover:bg-white/80 dark:hover:bg-gray-800/80 transition-colors cursor-pointer">Edit</button>
                          <button onClick={() => setConfirmDelete(t)} className="px-3 py-1.5 text-xs font-medium text-rose dark:text-purple-300 bg-rose/10 dark:bg-purple-900/20 border border-rose/30 rounded-lg hover:bg-rose/20 transition-colors cursor-pointer">Delete</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {modalOpen && <TemplateModal editing={editing} onClose={() => { setModalOpen(false); setEditing(null); }} onSave={handleSave} />}
              </div>
            </div>
          )}

          {tab === 'IT Integration' && <StudioServicesTab type="it-integration" title="IT Integration" fetchServices={fetchServices} upsertService={upsertService} removeService={removeService} setError={setError} />}

          {tab === 'Consulting' && <StudioConsultingTab fetchServices={fetchServices} upsertService={upsertService} removeService={removeService} fetchServiceSteps={fetchServiceSteps} upsertServiceStep={upsertServiceStep} removeServiceStep={removeServiceStep} setError={setError} />}

          {tab === 'Bookings' && (
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-black dark:text-gray-100">Bookings</h2>
                  <p className="text-sm text-black/60 dark:text-gray-400">{bookings.length} total</p>
                </div>
                <input
                  type="text"
                  placeholder="Search bookings..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="px-3.5 py-2 bg-white/70 dark:bg-gray-900/70 border border-blue-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal/40 w-48"
                />
              </div>
              {loading.bookings ? (
                <div className="text-center py-16 text-black/60 dark:text-gray-500 glass-card rounded-2xl"><p className="text-lg">Loading...</p></div>
              ) : filteredBookings.length === 0 ? (
                <div className="text-center py-16 text-black/60 dark:text-gray-500 glass-card rounded-2xl"><p className="text-lg">{searchTerm ? 'No bookings match your search.' : 'No bookings yet.'}</p></div>
              ) : (
                <div className="space-y-3">
                  {filteredBookings.map((b) => (
                    <div key={b.id} className="glass-card rounded-2xl p-4 sm:p-5">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-3">
                        <div className="flex items-center gap-3 flex-1">
                          {b.templates?.image && (
                            <img src={b.templates.image} alt="" className="w-10 h-10 rounded-xl object-cover shrink-0" />
                          )}
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-semibold text-black dark:text-gray-100">{b.profile?.name || b.name}{b.profile?.surname ? ` ${b.profile.surname}` : ''}</p>
                              <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${statusColors[b.status] || statusColors.pending}`}>{b.status}</span>
                              {b.payment_status && (
                                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${paymentStatusColors[b.payment_status] || statusColors.pending}`}>{b.payment_status.replace('_', ' ')}</span>
                              )}
                            </div>
                            <p className="text-sm text-black/60 dark:text-gray-400">{b.email}{b.profile?.phone ? ` · ${b.profile.phone}` : b.phone ? ` · ${b.phone}` : ''} · {b.type}{b.templates?.name ? ` — ${b.templates.name}` : ''}</p>
                            {(() => {
                              const parts = (b.message || '').split('|');
                              if (parts[0] === 'COURSE_ENROLL') {
                                return <p className="text-xs text-teal-dark dark:text-teal-light font-medium mt-0.5">Course: {parts[2] || 'Unknown'} — ${parts[3] || '0'}</p>;
                              }
                              return null;
                            })()}
                            {b.payment_amount > 0 && (
                              <p className="text-xs text-black/60 dark:text-gray-500 mt-0.5">Amount: ${b.payment_amount}</p>
                            )}
                            {b.payment_method && <p className="text-xs text-black/60 dark:text-gray-500 mt-0.5">Paid via {b.payment_method} — ref: {b.payment_reference}</p>}
                            {b.payment_proof_url && (
                              <a href={b.payment_proof_url} target="_blank" rel="noopener noreferrer" className="text-xs text-teal-dark dark:text-teal-light underline hover:no-underline mt-0.5 inline-block cursor-pointer">View Proof ↗</a>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {b.payment_status === 'proof_submitted' && (
                            <button onClick={async () => { try { await verifyPayment(b.id); refreshData(); } catch (e) { alert('Failed to verify: ' + e.message); } }} className="text-[10px] font-medium px-2 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-200 dark:hover:bg-emerald-900/50 transition-colors cursor-pointer">Confirm Enrollment</button>
                          )}
                          {['pending', 'confirmed', 'completed', 'cancelled'].map((s) => (
                            <button
                              key={s}
                              onClick={() => handleBookingStatus(b.id, s)}
                              className={`text-[10px] font-medium px-2 py-1 rounded-lg transition-colors cursor-pointer ${
                                b.status === s ? 'bg-teal text-white' : 'bg-blue-50 dark:bg-gray-800 text-black/70/70 dark:text-gray-400 hover:bg-blue-100 dark:hover:bg-gray-700'
                              }`}
                            >
                              {s}
                            </button>
                          ))}
                          <button onClick={() => setDeleteBooking(b)} className="text-[10px] font-medium px-2 py-1 rounded-lg text-rose dark:text-purple-300 bg-rose/10 dark:bg-purple-900/20 hover:bg-rose/20 transition-colors cursor-pointer ml-1">Delete</button>
                        </div>
                      </div>
                      {!b.message?.startsWith('COURSE_ENROLL') && (
                        <p className="text-sm text-black/70 dark:text-gray-300 bg-white/50 rounded-xl p-3">{b.message}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === 'Enrollments' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-black dark:text-gray-100">Enrollments</h2>
                  <p className="text-sm text-black/60 dark:text-gray-400">{enrollments.length} total</p>
                </div>
              </div>
              {loading.enrollments ? (
                <div className="text-center py-16 text-black/60 dark:text-gray-500 glass-card rounded-2xl"><p className="text-lg">Loading...</p></div>
              ) : enrollments.length === 0 ? (
                <div className="text-center py-16 text-black/60 dark:text-gray-500 glass-card rounded-2xl"><p className="text-lg">No enrollments yet.</p></div>
              ) : (
                <div className="space-y-3">
                  {enrollments.map((enr) => (
                    <div key={enr.id} className="glass-card rounded-2xl p-4 sm:p-5">
                      <div className="flex items-center gap-3 mb-2">
                        {enr.course_image && (
                          <img src={enr.course_image} alt="" className="w-10 h-10 rounded-xl object-cover shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-black dark:text-gray-100">{enr.student_name || enr.student_email}{enr.student_surname ? ` ${enr.student_surname}` : ''}</p>
                            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400">Enrolled</span>
                          </div>
                          <p className="text-sm text-black/60 dark:text-gray-400">{enr.student_email}{enr.student_phone ? ` · ${enr.student_phone}` : ''}</p>
                        </div>
                      </div>
                      <div className="bg-white/50 dark:bg-gray-900/50 rounded-xl p-3">
                        <p className="text-sm text-black/70 dark:text-gray-300"><span className="font-medium">Course:</span> {enr.course_title || 'Unknown'}{enr.course_price > 0 ? ` — $${enr.course_price}` : ' — Free'}</p>
                        <p className="text-xs text-black/60 dark:text-gray-500 mt-1">Enrolled {new Date(enr.enrolled_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === 'Analytics' && (
            <div>
              <h2 className="text-2xl font-bold text-black dark:text-gray-100 mb-1">Analytics</h2>
              <p className="text-sm text-black/60 dark:text-gray-400 mb-6">Booking and user engagement overview</p>
              {loading.analytics ? (
                <div className="text-center py-16 text-black/60 dark:text-gray-500 glass-card rounded-2xl"><p className="text-lg">Loading...</p></div>
              ) : !analytics ? (
                <div className="text-center py-16 text-black/60 dark:text-gray-500 glass-card rounded-2xl"><p className="text-lg">No data yet.</p></div>
              ) : (
                <>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <div className="glass-card rounded-2xl p-5">
                      <p className="text-3xl font-bold text-teal-dark dark:text-teal-light">{analytics.total}</p>
                      <p className="text-xs text-black/60 dark:text-gray-500 mt-1">Total Bookings</p>
                    </div>
                    <div className="glass-card rounded-2xl p-5">
                      <p className="text-3xl font-bold text-black dark:text-black/60">{analytics.thisMonth}</p>
                      <p className="text-xs text-black/60 dark:text-gray-500 mt-1">Last 30 Days</p>
                    </div>
                    <div className="glass-card rounded-2xl p-5">
                      <p className="text-3xl font-bold text-violet-600 dark:text-violet-400">{userGrowth?.total || 0}</p>
                      <p className="text-xs text-black/60 dark:text-gray-500 mt-1">Registered Users</p>
                    </div>
                    <div className="glass-card rounded-2xl p-5">
                      <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{templates.length}</p>
                      <p className="text-xs text-black/60 dark:text-gray-500 mt-1">Templates</p>
                    </div>
                  </div>

                  <div className="grid lg:grid-cols-2 gap-6 mb-6">
                    <div className="glass-card rounded-2xl p-5">
                      <h3 className="font-semibold text-black dark:text-gray-100 mb-3">Bookings by Category</h3>
                      {analytics.byCategory.length === 0 ? (
                        <p className="text-sm text-black/60 dark:text-gray-500">No bookings yet.</p>
                      ) : (
                        <ResponsiveContainer width="100%" height={220}>
                          <BarChart layout="vertical" data={analytics.byCategory.map(([name, value]) => ({ name, value }))} margin={{ top: 0, right: 20, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.2)" />
                            <XAxis type="number" tick={{ fontSize: 11, fill: '#64748b' }} />
                            <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} width={80} />
                            <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', background: 'rgba(255,255,255,0.9)' }} />
                            <Bar dataKey="value" fill="url(#tealGrad)" radius={[0, 6, 6, 0]} barSize={20} />
                            <defs>
                              <linearGradient id="tealGrad" x1="0" y1="0" x2="1" y2="0">
                                <stop offset="0%" stopColor="#14b8a6" />
                                <stop offset="100%" stopColor="#0d9488" />
                              </linearGradient>
                            </defs>
                          </BarChart>
                        </ResponsiveContainer>
                      )}
                    </div>

                    <div className="glass-card rounded-2xl p-5">
                      <h3 className="font-semibold text-black dark:text-gray-100 mb-3">Bookings by Status</h3>
                      {Object.keys(analytics.byStatus).length === 0 ? (
                        <p className="text-sm text-black/60 dark:text-gray-500">No bookings yet.</p>
                      ) : (
                        <div className="flex items-center justify-center h-[220px]">
                          <ResponsiveContainer width="100%" height={200}>
                            <PieChart>
                              <Pie data={Object.entries(analytics.byStatus).map(([name, value]) => ({ name, value }))} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value">
                                {Object.entries(analytics.byStatus).map(([name], i) => {
                                  const colors = ['#f59e0b', '#3b82f6', '#10b981', '#f43f5e'];
                                  return <Cell key={name} fill={colors[i % colors.length]} />;
                                })}
                              </Pie>
                              <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', background: 'rgba(255,255,255,0.9)' }} />
                            </PieChart>
                          </ResponsiveContainer>
                          <div className="flex flex-col gap-2 text-xs shrink-0">
                            {Object.entries(analytics.byStatus).map(([name], i) => {
                              const colors = ['bg-sky-400', 'bg-blue-500', 'bg-emerald-500', 'bg-rose-400'];
                              return (
                                <div key={name} className="flex items-center gap-1.5">
                                  <span className={`w-2.5 h-2.5 rounded-full ${colors[i]}`} />
                                  <span className="text-black dark:text-gray-400 capitalize">{name}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid lg:grid-cols-2 gap-6">
                    <div className="glass-card rounded-2xl p-5">
                      <h3 className="font-semibold text-black dark:text-gray-100 mb-3">Bookings (Last 30 Days)</h3>
                      {analytics.dailyTrend.every(d => d.count === 0) ? (
                        <p className="text-sm text-black/60 dark:text-gray-500">No bookings in this period.</p>
                      ) : (
                        <ResponsiveContainer width="100%" height={200}>
                          <AreaChart data={analytics.dailyTrend.map(d => ({ ...d, label: d.date.slice(5) }))} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.2)" />
                            <XAxis dataKey="label" tick={{ fontSize: 9, fill: '#64748b' }} interval={4} />
                            <YAxis tick={{ fontSize: 10, fill: '#64748b' }} allowDecimals={false} />
                            <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', background: 'rgba(255,255,255,0.9)' }} labelFormatter={(l) => `Date: ${l}`} />
                            <Area type="monotone" dataKey="count" stroke="#14b8a6" fill="url(#areaGrad)" strokeWidth={2} />
                            <defs>
                              <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#14b8a6" stopOpacity={0.4} />
                                <stop offset="100%" stopColor="#14b8a6" stopOpacity={0.05} />
                              </linearGradient>
                            </defs>
                          </AreaChart>
                        </ResponsiveContainer>
                      )}
                    </div>

                    <div className="glass-card rounded-2xl p-5">
                      <h3 className="font-semibold text-black dark:text-gray-100 mb-3">User Growth</h3>
                      {userGrowth?.growth.length === 0 ? (
                        <p className="text-sm text-black/60 dark:text-gray-500">No registered users yet.</p>
                      ) : (
                        <ResponsiveContainer width="100%" height={200}>
                          <AreaChart data={userGrowth?.growth.map(g => ({ ...g, label: g.month.slice(2) }))} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.2)" />
                            <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#64748b' }} />
                            <YAxis tick={{ fontSize: 10, fill: '#64748b' }} allowDecimals={false} />
                            <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', background: 'rgba(255,255,255,0.9)' }} labelFormatter={(l) => `Month: ${l}`} />
                            <Area type="monotone" dataKey="total" stroke="#8b5cf6" fill="url(#violetGrad)" strokeWidth={2} />
                            <defs>
                              <linearGradient id="violetGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.4} />
                                <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.05} />
                              </linearGradient>
                            </defs>
                          </AreaChart>
                        </ResponsiveContainer>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {tab === 'Users' && (
            <div>
              <h2 className="text-2xl font-bold text-black dark:text-gray-100 mb-1">Clients</h2>
              <p className="text-sm text-black/60 dark:text-gray-400 mb-6">{users.length} unique clients</p>
              {loading.users ? <p className="text-sm text-black/60 dark:text-gray-500">Loading...</p> : users.length === 0 ? <p className="text-sm text-black/60 dark:text-gray-500">No client data yet.</p> : (
                <div className="glass-card rounded-2xl overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-blue-100 dark:border-gray-800">
                        <th className="text-left px-5 py-3 font-semibold text-black dark:text-black/60">Name</th>
                        <th className="text-left px-5 py-3 font-semibold text-black dark:text-black/60">Email</th>
                        <th className="text-left px-5 py-3 font-semibold text-black dark:text-black/60">Source</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((u, i) => (
                        <tr key={i} className="border-b border-blue-50 dark:border-gray-800 last:border-0">
                          <td className="px-5 py-3 text-black dark:text-gray-100">{u.name}</td>
                          <td className="px-5 py-3 text-black/70/70 dark:text-gray-400">{u.email}</td>
                          <td className="px-5 py-3 text-black/60 dark:text-gray-500 text-xs">{u.source}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {tab === 'Domains' && (
            <div className="max-w-lg">
              <h2 className="text-2xl font-bold text-black dark:text-gray-100 mb-1">Domain Pricing</h2>
              <p className="text-sm text-black/60 dark:text-gray-400 mb-6">Set prices per TLD for domain registration.</p>
              <div className="glass-card rounded-2xl p-6">
                {domainPrices.length === 0 ? (
                  <p className="text-sm text-black/60 dark:text-gray-500">No pricing data yet.</p>
                ) : (
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-black/60 dark:text-gray-500">
                        <th className="pb-2 pr-4">TLD</th>
                        <th className="pb-2 pr-4">Price ($)</th>
                        <th className="pb-2"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {domainPrices.map((row) => (
                        <DomainPriceRow key={row.id} row={row} onSave={async (tld, price) => { await updateDomainPricing(tld, price); setDomainPrices(await fetchDomainPricing()); }} />
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {tab === 'Courses' && (
            <div className="max-w-4xl">
              <h2 className="text-2xl font-bold text-black dark:text-gray-100 mb-1">Courses</h2>
              <p className="text-sm text-black/60 dark:text-gray-400 mb-6">Manage online courses and lessons.</p>

              {editingCourse ? (
                <div className="glass-card rounded-2xl p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-black dark:text-gray-100">{editingCourse.id ? 'Edit' : 'New'} Course</h3>
                    <button onClick={() => { setEditingCourse(null); setLessons([]); }} className="text-xs px-3 py-1.5 bg-blue-100 dark:bg-gray-700 text-black/70 dark:text-gray-300 rounded-lg hover:bg-blue-200 dark:hover:bg-gray-600 transition cursor-pointer">Back</button>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-black/70/70 dark:text-gray-400 mb-1">Title</label>
                    <input value={courseForm.title} onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })} className="w-full px-3.5 py-2.5 bg-white/70 dark:bg-gray-900/70 border border-blue-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal/40" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-black/70/70 dark:text-gray-400 mb-1">Description</label>
                    <textarea value={courseForm.description} onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })} rows={3} className="w-full px-3.5 py-2.5 bg-white/70 dark:bg-gray-900/70 border border-blue-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal/40" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-black/70/70 dark:text-gray-400 mb-1">Price ($)</label>
                      <input value={courseForm.price} onChange={(e) => setCourseForm({ ...courseForm, price: parseFloat(e.target.value) || 0 })} type="number" min="0" step="0.01" className="w-full px-3.5 py-2.5 bg-white/70 dark:bg-gray-900/70 border border-blue-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal/40" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-black/70/70 dark:text-gray-400 mb-1">Image</label>
                      <label className="flex flex-col items-center justify-center w-full border-2 border-dashed border-blue-200 dark:border-gray-700 rounded-xl cursor-pointer hover:border-teal/50 transition-colors bg-white/70 dark:bg-gray-900/70 h-28 relative overflow-hidden">
                        {courseForm.image ? (
                          <>
                            <img src={courseForm.image} alt="" className="absolute inset-0 w-full h-full object-cover" />
                            <div className="absolute bottom-2 right-2 bg-white/80 dark:bg-gray-800 text-xs text-black/70 dark:text-gray-400 px-2.5 py-1 rounded-full shadow-sm">Change</div>
                          </>
                        ) : (
                          <div className="flex flex-col items-center gap-1 text-black/60 dark:text-gray-500">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                            <span className="text-xs">Click to upload</span>
                          </div>
                        )}
                        <input type="file" accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; if (f) { const r = new FileReader(); r.onload = (ev) => setCourseForm({ ...courseForm, image: ev.target.result }); r.readAsDataURL(f); } }} className="hidden" />
                      </label>
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-black/70/70 dark:text-gray-400 mb-1">Course Video</label>
                      <div className="space-y-2">
                        <input value={courseForm.video_url && !courseForm.video_url.startsWith('data:') ? courseForm.video_url : ''} onChange={(e) => setCourseForm({ ...courseForm, video_url: e.target.value })} placeholder="YouTube embed URL (or upload a video file below)" className="w-full px-3.5 py-2.5 bg-white/70 dark:bg-gray-900/70 border border-blue-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal/40" />
                        <label className="flex items-center gap-2 px-3.5 py-2.5 border-2 border-dashed border-blue-200 dark:border-gray-700 rounded-xl cursor-pointer hover:border-teal/50 transition-colors bg-white/70 dark:bg-gray-900/70">
                          {courseForm.video_url && courseForm.video_url.startsWith('data:') ? (
                            <span className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                              Video uploaded — Click to change
                            </span>
                          ) : (
                            <span className="text-xs text-black/60 dark:text-gray-500 flex items-center gap-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                              Upload a video from your device
                            </span>
                          )}
                          <input type="file" accept="video/*" onChange={(e) => { const f = e.target.files?.[0]; if (f) { const r = new FileReader(); r.onload = (ev) => setCourseForm({ ...courseForm, video_url: ev.target.result }); r.readAsDataURL(f); } }} className="hidden" />
                        </label>
                      </div>
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-black/70/70 dark:text-gray-400 mb-1">Course PDF (full course material for offline learning)</label>
                      <label className="flex flex-col items-center justify-center w-full border-2 border-dashed border-blue-200 dark:border-gray-700 rounded-xl cursor-pointer hover:border-teal/50 transition-colors bg-white/70 dark:bg-gray-900/70 h-24 relative overflow-hidden">
                        {courseForm.pdf_url ? (
                          <div className="flex flex-col items-center gap-1 text-emerald-600 dark:text-emerald-400">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                            <span className="text-xs">PDF uploaded — Click to change</span>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center gap-1 text-black/60 dark:text-gray-500">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                            <span className="text-xs">Upload PDF</span>
                          </div>
                        )}
                        <input type="file" accept=".pdf" onChange={(e) => { const f = e.target.files?.[0]; if (f) { const r = new FileReader(); r.onload = (ev) => setCourseForm({ ...courseForm, pdf_url: ev.target.result }); r.readAsDataURL(f); } }} className="hidden" />
                      </label>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button onClick={async () => {
                      setCourseSaving(true);
                      try {
                        const saved = await upsertCourse({ ...courseForm, id: editingCourse.id, category: 'Online Courses' });
                        if (!editingCourse.id && saved) setEditingCourse(saved);
                        else setEditingCourse({ ...editingCourse, ...courseForm });
                        setCourses(await fetchCourses());
                      } catch (e) { setError(e.message); }
                      setCourseSaving(false);
                    }} disabled={courseSaving} className="px-6 py-2.5 bg-gradient-to-r from-teal to-teal-dark text-white text-sm font-semibold rounded-xl hover:from-teal-dark hover:to-teal transition-all shadow-sm disabled:opacity-60 cursor-pointer inline-flex items-center gap-2">
                      {courseSaving && <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>}{courseSaving ? 'Saving...' : 'Save Course'}
                    </button>
                    <button onClick={() => { setEditingCourse(null); setLessons([]); }} className="px-6 py-2.5 bg-blue-100 dark:bg-gray-700 text-black/70 dark:text-gray-300 text-sm font-semibold rounded-xl hover:bg-blue-200 dark:hover:bg-gray-600 transition cursor-pointer">Cancel</button>
                  </div>
                  {error && <p className="text-sm text-rose dark:text-purple-300">{error}</p>}

                  {/* Lessons section */}
                  {editingCourse?.id && (
                    <div className="border-t border-blue-100 dark:border-gray-800 pt-6 mt-6">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-bold text-black dark:text-gray-100">Lessons</h4>
                        <button onClick={() => setEditingLesson({ course_id: editingCourse.id, title: '', description: '', content_type: 'text', content: '', video_url: '', sort_order: lessons.length })} className="text-xs px-3 py-1.5 bg-teal text-white rounded-lg hover:bg-teal-dark transition cursor-pointer">+ Add Lesson</button>
                      </div>

                      {editingLesson ? (
                        <div className="bg-blue-50/50 dark:bg-gray-900/50 rounded-xl p-4 space-y-3 mb-4">
                          <div className="flex items-center justify-between">
                            <h5 className="text-sm font-medium text-black dark:text-gray-100">{editingLesson.id ? 'Edit' : 'New'} Lesson</h5>
                            <button onClick={() => setEditingLesson(null)} className="text-xs text-black/60 hover:text-black cursor-pointer">Cancel</button>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-black/70/70 dark:text-gray-400 mb-1">Title</label>
                            <input value={lessonForm.title} onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })} className="w-full px-3 py-2 bg-white/70 dark:bg-gray-900/70 border border-blue-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal/40" />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-black/70/70 dark:text-gray-400 mb-1">Description (shown in sidebar)</label>
                            <textarea value={lessonForm.description} onChange={(e) => setLessonForm({ ...lessonForm, description: e.target.value })} rows={2} className="w-full px-3 py-2 bg-white/70 dark:bg-gray-900/70 border border-blue-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal/40 resize-none" />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-black/70/70 dark:text-gray-400 mb-1">Type</label>
                            <select value={lessonForm.content_type} onChange={(e) => setLessonForm({ ...lessonForm, content_type: e.target.value })} className="w-full px-3 py-2 bg-white/70 dark:bg-gray-900/70 border border-blue-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal/40 cursor-pointer">
                              <option value="text">Text</option>
                              <option value="video">Video</option>
                              <option value="notes">Notes</option>
                            </select>
                          </div>
                          {lessonForm.content_type === 'video' && (
                            <div>
                              <label className="block text-xs font-medium text-black/70/70 dark:text-gray-400 mb-1">Video URL (YouTube embed)</label>
                              <input value={lessonForm.video_url} onChange={(e) => setLessonForm({ ...lessonForm, video_url: e.target.value })} placeholder="https://www.youtube.com/embed/..." className="w-full px-3 py-2 bg-white/70 dark:bg-gray-900/70 border border-blue-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal/40" />
                            </div>
                          )}
                          {(lessonForm.content_type === 'text' || lessonForm.content_type === 'notes') && (
                            <div>
                              <label className="block text-xs font-medium text-black/70/70 dark:text-gray-400 mb-1">Content (HTML)</label>
                              <textarea value={lessonForm.content} onChange={(e) => setLessonForm({ ...lessonForm, content: e.target.value })} rows={6} className="w-full px-3 py-2 bg-white/70 dark:bg-gray-900/70 border border-blue-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal/40 font-mono" />
                              <label className="flex items-center gap-2 mt-2 px-3 py-2 border-2 border-dashed border-blue-200 dark:border-gray-700 rounded-xl cursor-pointer hover:border-teal/50 transition-colors bg-white/70 dark:bg-gray-900/70">
                                <svg className="w-4 h-4 text-black/60 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                <span className="text-xs text-black/60 dark:text-gray-500">Upload Word document (.docx) to extract content automatically</span>
                                <input type="file" accept=".docx" onChange={(e) => { const f = e.target.files?.[0]; if (f) { const r = new FileReader(); r.onload = (ev) => { const arr = new Uint8Array(ev.target.result); mammoth.convertToHtml({ arrayBuffer: arr }).then((r) => setLessonForm({ ...lessonForm, content: r.value })).catch(() => {}); }; r.readAsArrayBuffer(f); } }} className="hidden" />
                              </label>
                            </div>
                          )}
                          <div>
                            <label className="block text-xs font-medium text-black/70/70 dark:text-gray-400 mb-1">Order</label>
                            <input value={lessonForm.sort_order} onChange={(e) => setLessonForm({ ...lessonForm, sort_order: parseInt(e.target.value) || 0 })} type="number" min="0" className="w-24 px-3 py-2 bg-white/70 dark:bg-gray-900/70 border border-blue-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal/40" />
                          </div>
                          <button onClick={async () => {
                            setLessonSaving(true);
                            try {
                              await upsertLesson({ ...lessonForm, id: editingLesson.id });
                              setEditingLesson(null);
                              setLessons(await fetchLessons(editingCourse.id));
                            } catch (e) { setError(e.message); }
                            setLessonSaving(false);
                          }} disabled={lessonSaving} className="px-4 py-2 bg-teal text-white text-xs font-semibold rounded-xl hover:bg-teal-dark transition disabled:opacity-60 cursor-pointer inline-flex items-center gap-2">
                            {lessonSaving && <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>}{lessonSaving ? 'Saving...' : 'Save Lesson'}
                          </button>
                        </div>
                      ) : null}

                      {lessons.length === 0 ? (
                        <p className="text-sm text-black/60 dark:text-gray-500">No lessons yet. Add your first lesson above.</p>
                      ) : (
                        <div className="space-y-2">
                          {lessons.map((l) => (
                            <div key={l.id} className="flex items-center gap-3 bg-white/50 dark:bg-gray-900/50 rounded-xl px-4 py-3">
                              <span className="text-xs font-bold text-black/60 dark:text-gray-500 w-6">{l.sort_order}</span>
                              <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                                l.content_type === 'video' ? 'text-purple-600 bg-purple-100 dark:bg-purple-900/30 dark:text-purple-400'
                                : l.content_type === 'notes' ? 'text-sky-600 bg-sky-100 dark:bg-sky-900/30 dark:text-sky-400'
                                : 'text-black bg-blue-100 dark:bg-gray-700 dark:text-black/60'
                              }`}>{l.content_type}</span>
                              <span className="flex-1 text-sm text-black dark:text-gray-100">{l.title}</span>
                              <button onClick={() => { setEditingLesson(l); setLessonForm({ title: l.title, description: l.description || '', content_type: l.content_type, content: l.content || '', video_url: l.video_url || '', sort_order: l.sort_order }); }} className="text-xs px-2 py-1 bg-blue-100 dark:bg-gray-700 text-black/70 dark:text-gray-300 rounded-lg hover:bg-blue-200 dark:hover:bg-gray-600 transition cursor-pointer">Edit</button>
                              <button onClick={async () => { await removeLesson(l.id); setLessons(await fetchLessons(editingCourse.id)); }} className="text-xs px-2 py-1 bg-rose/10 text-rose dark:text-purple-300 rounded-lg hover:bg-rose/20 transition cursor-pointer">Del</button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex justify-end mb-2">
                    <button onClick={() => { setEditingCourse({}); setCourseForm({ title: '', description: '', price: 0, image: '', video_url: '', pdf_url: '' }); setLessons([]); }} className="px-4 py-2 bg-gradient-to-r from-teal to-teal-dark text-white text-sm font-semibold rounded-xl hover:from-teal-dark hover:to-teal transition-all shadow-sm cursor-pointer">+ New Course</button>
                  </div>
                  {courses.length === 0 ? (
                    <p className="text-sm text-black/60 dark:text-gray-500">No courses yet.</p>
                  ) : (
                    courses.map((c) => (
                      <div key={c.id} className="glass-card rounded-2xl p-5">
                        <div className="flex items-start gap-4">
                          {c.image && <img src={c.image} alt="" className="w-20 h-16 rounded-xl object-cover shrink-0" />}
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-black dark:text-gray-100">{c.title}</h3>
                            <p className="text-xs text-black/60 dark:text-gray-500">${c.price} — {c.category}</p>
                            <p className="text-sm text-black/70 dark:text-gray-300 mt-1 line-clamp-2">{c.description}</p>
                          </div>
                          <div className="flex gap-2 shrink-0">
                            <button onClick={async () => {
                              setEditingCourse(c);
                              setCourseForm({ title: c.title, description: c.description, price: c.price, image: c.image || '', video_url: c.video_url || '', pdf_url: c.pdf_url || '' });
                              setLessons(await fetchLessons(c.id));
                            }} className="px-3 py-1.5 bg-teal/10 text-teal-dark dark:text-teal-light text-xs font-medium rounded-lg hover:bg-teal/20 transition cursor-pointer">Manage</button>
                            <button onClick={async () => { await removeCourse(c.id); setCourses(await fetchCourses()); }} className="px-3 py-1.5 bg-rose/10 text-rose dark:text-purple-300 text-xs font-medium rounded-lg hover:bg-rose/20 transition cursor-pointer">Delete</button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )}

          {tab === 'Settings' && (
            <div className="max-w-md">
              <h2 className="text-2xl font-bold text-black dark:text-gray-100 mb-1">Settings</h2>
              <p className="text-sm text-black/60 dark:text-gray-400 mb-6">Change your studio password.</p>
              {success && <p className="text-sm text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-gray-800 rounded-xl px-4 py-2 mb-4">{success}</p>}
              <form onSubmit={handlePasswordChange} className="glass-card rounded-2xl p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-black/70/70 dark:text-gray-400 mb-1">Current Password</label>
                  <input value={passForm.current} onChange={(e) => setPassForm({ ...passForm, current: e.target.value })} type="password" required className="w-full px-3.5 py-2.5 bg-white/70 dark:bg-gray-900/70 border border-blue-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal/40" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-black/70/70 dark:text-gray-400 mb-1">New Password</label>
                  <input value={passForm.newPass} onChange={(e) => setPassForm({ ...passForm, newPass: e.target.value })} type="password" required className="w-full px-3.5 py-2.5 bg-white/70 dark:bg-gray-900/70 border border-blue-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal/40" />
                </div>
                {error && <p className="text-sm text-rose dark:text-purple-300">{error}</p>}
                <button type="submit" className="w-full px-6 py-3 bg-gradient-to-r from-teal to-teal-dark text-white text-sm font-semibold rounded-xl hover:from-teal-dark hover:to-teal transition-all shadow-sm cursor-pointer">Update Password</button>
              </form>

              {/* Payment Settings */}
              <h2 className="text-2xl font-bold text-black dark:text-gray-100 mb-1 mt-10">Payment Details</h2>
              <p className="text-sm text-black/60 dark:text-gray-400 mb-6">Bank and mobile money details shown to clients on the payment page.</p>
              <div className="glass-card rounded-2xl p-6">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-black/60 dark:text-gray-500 mb-1">Bank Name</label>
                    <input value={paymentForm.bank_name} onChange={(e) => setPaymentForm({ ...paymentForm, bank_name: e.target.value })} className="w-full px-3 py-2 bg-white/70 dark:bg-gray-900/70 border border-blue-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal/40" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-black/60 dark:text-gray-500 mb-1">Account Name</label>
                    <input value={paymentForm.account_name} onChange={(e) => setPaymentForm({ ...paymentForm, account_name: e.target.value })} className="w-full px-3 py-2 bg-white/70 dark:bg-gray-900/70 border border-blue-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal/40" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-black/60 dark:text-gray-500 mb-1">Account Number</label>
                    <input value={paymentForm.account_number} onChange={(e) => setPaymentForm({ ...paymentForm, account_number: e.target.value })} className="w-full px-3 py-2 bg-white/70 dark:bg-gray-900/70 border border-blue-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal/40" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-black/60 dark:text-gray-500 mb-1">Currency</label>
                    <input value={paymentForm.currency} onChange={(e) => setPaymentForm({ ...paymentForm, currency: e.target.value })} className="w-full px-3 py-2 bg-white/70 dark:bg-gray-900/70 border border-blue-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal/40" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-black/60 dark:text-gray-500 mb-1">Mobile Money Network</label>
                    <input value={paymentForm.momo_network} onChange={(e) => setPaymentForm({ ...paymentForm, momo_network: e.target.value })} className="w-full px-3 py-2 bg-white/70 dark:bg-gray-900/70 border border-blue-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal/40" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-black/60 dark:text-gray-500 mb-1">Mobile Money Number</label>
                    <input value={paymentForm.momo_number} onChange={(e) => setPaymentForm({ ...paymentForm, momo_number: e.target.value })} className="w-full px-3 py-2 bg-white/70 dark:bg-gray-900/70 border border-blue-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal/40" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-black/60 dark:text-gray-500 mb-1">Mobile Money Name</label>
                    <input value={paymentForm.momo_name} onChange={(e) => setPaymentForm({ ...paymentForm, momo_name: e.target.value })} className="w-full px-3 py-2 bg-white/70 dark:bg-gray-900/70 border border-blue-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal/40" />
                  </div>
                  <div className="flex items-end">
                    <button onClick={async () => { const d = await updatePaymentSettings(paymentForm); if (d) { setPaymentSettings(d); setSuccess('Payment details updated.'); } else { setError('Failed to update.'); } }} className="w-full px-4 py-2 bg-gradient-to-r from-teal to-teal-dark text-white text-sm font-semibold rounded-xl hover:from-teal-dark hover:to-teal transition-all shadow-sm cursor-pointer">Save Payment Details</button>
                  </div>
                </div>
              </div>
          </div>
        )}
      </div>
    </main>
  );
}

function StudioServicesTab({ type, title, fetchServices, upsertService, removeService, setError }) {
  const [services, setServices] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ icon: '', title: '', description: '', image: '', price: 0, sort_order: 0 });
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchServices(type).then(setServices); }, [type, fetchServices]);

  async function handleSave() {
    setSaving(true);
    try {
      await upsertService({ ...form, type, id: editing?.id });
      setEditing(null);
      setForm({ icon: '', title: '', description: '', image: '', price: 0, sort_order: 0 });
      setServices(await fetchServices(type));
    } catch (e) { setError(e.message); }
    setSaving(false);
  }

  function handleEdit(s) {
    setEditing(s);
    setForm({ icon: s.icon, title: s.title, description: s.description, image: s.image || '', price: s.price, sort_order: s.sort_order });
  }

  function handleDelete(id) {
    removeService(id).then(async () => setServices(await fetchServices(type)));
  }

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-black dark:text-gray-100">{title}</h2>
          <p className="text-sm text-black/60 dark:text-gray-400">Manage service offerings.</p>
        </div>
        <button onClick={() => { setEditing({}); setForm({ icon: '', title: '', description: '', image: '', price: 0, sort_order: services.length }); }} className="px-4 py-2 bg-gradient-to-r from-teal to-teal-dark text-white text-sm font-semibold rounded-xl hover:from-teal-dark hover:to-teal transition-all shadow-sm cursor-pointer">+ Add Service</button>
      </div>

      {editing && (
        <div className="glass-card rounded-2xl p-6 space-y-4 mb-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-black dark:text-gray-100">{editing.id ? 'Edit' : 'New'} Service</h3>
            <button onClick={() => setEditing(null)} className="text-xs px-3 py-1.5 bg-blue-100 dark:bg-gray-700 text-black/70 dark:text-gray-300 rounded-lg hover:bg-blue-200 dark:hover:bg-gray-600 transition cursor-pointer">Cancel</button>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-black/70/70 dark:text-gray-400 mb-1">Icon (emoji)</label>
              <input value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} placeholder="🔗" className="w-full px-3.5 py-2.5 bg-white/70 dark:bg-gray-900/70 border border-blue-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal/40" />
            </div>
            <div>
              <label className="block text-sm font-medium text-black/70/70 dark:text-gray-400 mb-1">Title</label>
              <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full px-3.5 py-2.5 bg-white/70 dark:bg-gray-900/70 border border-blue-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal/40" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-black/70/70 dark:text-gray-400 mb-1">Description</label>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className="w-full px-3.5 py-2.5 bg-white/70 dark:bg-gray-900/70 border border-blue-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal/40" />
            </div>
            <div>
              <label className="block text-sm font-medium text-black/70/70 dark:text-gray-400 mb-1">Price ($)</label>
              <input value={form.price} onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) || 0 })} type="number" min="0" step="0.01" className="w-full px-3.5 py-2.5 bg-white/70 dark:bg-gray-900/70 border border-blue-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal/40" />
            </div>
            <div>
              <label className="block text-sm font-medium text-black/70/70 dark:text-gray-400 mb-1">Sort Order</label>
              <input value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })} type="number" min="0" className="w-full px-3.5 py-2.5 bg-white/70 dark:bg-gray-900/70 border border-blue-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal/40" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-black/70/70 dark:text-gray-400 mb-1">Image</label>
              <div className="flex items-center gap-3">
                <label className="px-4 py-2 bg-white/70 dark:bg-gray-900/70 border border-blue-200 dark:border-gray-700 rounded-xl text-sm cursor-pointer hover:bg-white dark:hover:bg-gray-900 transition">
                  Choose File
                  <input type="file" accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; if (f) { const r = new FileReader(); r.onload = (ev) => setForm({ ...form, image: ev.target.result }); r.readAsDataURL(f); } }} className="hidden" />
                </label>
                {form.image && <span className="text-xs text-black/60 dark:text-gray-400 truncate max-w-[200px]">Image selected</span>}
              </div>
            </div>
          </div>
          <button onClick={handleSave} disabled={saving} className="px-6 py-2.5 bg-gradient-to-r from-teal to-teal-dark text-white text-sm font-semibold rounded-xl hover:from-teal-dark hover:to-teal transition-all shadow-sm disabled:opacity-60 cursor-pointer">
            {saving && <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>}{saving ? 'Saving...' : 'Save Service'}
          </button>
        </div>
      )}

      <div className="space-y-3">
        {services.length === 0 ? (
          <p className="text-sm text-black/60 dark:text-gray-500">No services yet. Add your first one above.</p>
        ) : (
          services.map((s) => (
            <div key={s.id} className="glass-card rounded-2xl p-4 sm:p-5 flex items-center gap-4">
              {s.image ? (
                <img src={s.image} alt={s.title} className="w-10 h-10 rounded-lg object-cover shrink-0" />
              ) : (
                <span className="text-2xl shrink-0">{s.icon}</span>
              )}
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-black dark:text-gray-100">{s.title}</h4>
                <p className="text-sm text-black/60 dark:text-gray-400 truncate">{s.description}</p>
              </div>
              {s.price > 0 && <span className="text-sm font-bold text-teal-dark dark:text-teal-light shrink-0">${s.price}</span>}
              <div className="flex gap-2 shrink-0">
                <button onClick={() => handleEdit(s)} className="px-3 py-1.5 text-xs font-medium bg-blue-100 dark:bg-gray-700 text-black/70 dark:text-gray-300 rounded-lg hover:bg-blue-200 dark:hover:bg-gray-600 transition cursor-pointer">Edit</button>
                <button onClick={() => handleDelete(s.id)} className="px-3 py-1.5 text-xs font-medium bg-rose/10 text-rose dark:text-purple-300 rounded-lg hover:bg-rose/20 transition cursor-pointer">Delete</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function StudioConsultingTab({ fetchServices, upsertService, removeService, fetchServiceSteps, upsertServiceStep, removeServiceStep, setError }) {
  const [services, setServices] = useState([]);
  const [steps, setSteps] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ icon: '', title: '', description: '', image: '', price: 0, sort_order: 0 });
  const [saving, setSaving] = useState(false);
  const [stepEditing, setStepEditing] = useState(null);
  const [stepForm, setStepForm] = useState({ step_number: 0, title: '', description: '' });
  const [stepSaving, setStepSaving] = useState(false);

  useEffect(() => {
    fetchServices('consulting').then(setServices);
    fetchServiceSteps().then(setSteps);
  }, [fetchServices, fetchServiceSteps]);

  async function handleSave() {
    setSaving(true);
    try {
      await upsertService({ ...form, type: 'consulting', id: editing?.id });
      setEditing(null);
      setForm({ icon: '', title: '', description: '', image: '', price: 0, sort_order: 0 });
      setServices(await fetchServices('consulting'));
    } catch (e) { setError(e.message); }
    setSaving(false);
  }

  function handleEdit(s) {
    setEditing(s);
    setForm({ icon: s.icon, title: s.title, description: s.description, image: s.image || '', price: s.price, sort_order: s.sort_order });
  }

  async function handleStepSave() {
    setStepSaving(true);
    try {
      await upsertServiceStep({ ...stepForm, id: stepEditing?.id });
      setStepEditing(null);
      setStepForm({ step_number: steps.length + 1, title: '', description: '' });
      setSteps(await fetchServiceSteps());
    } catch (e) { setError(e.message); }
    setStepSaving(false);
  }

  return (
    <div className="max-w-4xl">
      <h2 className="text-2xl font-bold text-black dark:text-gray-100 mb-1">Consulting</h2>
      <p className="text-sm text-black/60 dark:text-gray-400 mb-6">Manage consulting services and process steps.</p>

      {/* Services */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-black dark:text-gray-100">Services</h3>
        <button onClick={() => { setEditing({}); setForm({ icon: '', title: '', description: '', image: '', price: 0, sort_order: services.length }); }} className="px-4 py-2 bg-gradient-to-r from-teal to-teal-dark text-white text-sm font-semibold rounded-xl hover:from-teal-dark hover:to-teal transition-all shadow-sm cursor-pointer">+ Add Service</button>
      </div>

      {editing && (
        <div className="glass-card rounded-2xl p-6 space-y-4 mb-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-black dark:text-gray-100">{editing.id ? 'Edit' : 'New'} Service</h3>
            <button onClick={() => setEditing(null)} className="text-xs px-3 py-1.5 bg-blue-100 dark:bg-gray-700 text-black/70 dark:text-gray-300 rounded-lg hover:bg-blue-200 dark:hover:bg-gray-600 transition cursor-pointer">Cancel</button>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-black/70/70 dark:text-gray-400 mb-1">Icon (emoji)</label>
              <input value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} placeholder="🔍" className="w-full px-3.5 py-2.5 bg-white/70 dark:bg-gray-900/70 border border-blue-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal/40" />
            </div>
            <div>
              <label className="block text-sm font-medium text-black/70/70 dark:text-gray-400 mb-1">Title</label>
              <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full px-3.5 py-2.5 bg-white/70 dark:bg-gray-900/70 border border-blue-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal/40" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-black/70/70 dark:text-gray-400 mb-1">Description</label>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className="w-full px-3.5 py-2.5 bg-white/70 dark:bg-gray-900/70 border border-blue-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal/40" />
            </div>
            <div>
              <label className="block text-sm font-medium text-black/70/70 dark:text-gray-400 mb-1">Price ($)</label>
              <input value={form.price} onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) || 0 })} type="number" min="0" step="0.01" className="w-full px-3.5 py-2.5 bg-white/70 dark:bg-gray-900/70 border border-blue-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal/40" />
            </div>
            <div>
              <label className="block text-sm font-medium text-black/70/70 dark:text-gray-400 mb-1">Sort Order</label>
              <input value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })} type="number" min="0" className="w-full px-3.5 py-2.5 bg-white/70 dark:bg-gray-900/70 border border-blue-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal/40" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-black/70/70 dark:text-gray-400 mb-1">Image</label>
              <div className="flex items-center gap-3">
                <label className="px-4 py-2 bg-white/70 dark:bg-gray-900/70 border border-blue-200 dark:border-gray-700 rounded-xl text-sm cursor-pointer hover:bg-white dark:hover:bg-gray-900 transition">
                  Choose File
                  <input type="file" accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; if (f) { const r = new FileReader(); r.onload = (ev) => setForm({ ...form, image: ev.target.result }); r.readAsDataURL(f); } }} className="hidden" />
                </label>
                {form.image && <span className="text-xs text-black/60 dark:text-gray-400 truncate max-w-[200px]">Image selected</span>}
              </div>
            </div>
          </div>
          <button onClick={handleSave} disabled={saving} className="px-6 py-2.5 bg-gradient-to-r from-teal to-teal-dark text-white text-sm font-semibold rounded-xl hover:from-teal-dark hover:to-teal transition-all shadow-sm disabled:opacity-60 cursor-pointer">
            {saving && <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>}{saving ? 'Saving...' : 'Save Service'}
          </button>
        </div>
      )}

      <div className="space-y-3 mb-10">
        {services.length === 0 ? (
          <p className="text-sm text-black/60 dark:text-gray-500">No services yet.</p>
        ) : (
          services.map((s) => (
            <div key={s.id} className="glass-card rounded-2xl p-4 sm:p-5 flex items-center gap-4">
              {s.image ? (
                <img src={s.image} alt={s.title} className="w-10 h-10 rounded-lg object-cover shrink-0" />
              ) : (
                <span className="text-2xl shrink-0">{s.icon}</span>
              )}
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-black dark:text-gray-100">{s.title}</h4>
                <p className="text-sm text-black/60 dark:text-gray-400 truncate">{s.description}</p>
              </div>
              <div className="flex gap-2 shrink-0">
                <button onClick={() => handleEdit(s)} className="px-3 py-1.5 text-xs font-medium bg-blue-100 dark:bg-gray-700 text-black/70 dark:text-gray-300 rounded-lg hover:bg-blue-200 dark:hover:bg-gray-600 transition cursor-pointer">Edit</button>
                <button onClick={() => removeService(s.id).then(async () => setServices(await fetchServices('consulting')))} className="px-3 py-1.5 text-xs font-medium bg-rose/10 text-rose dark:text-purple-300 rounded-lg hover:bg-rose/20 transition cursor-pointer">Delete</button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Process Steps */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-black dark:text-gray-100">Process Steps</h3>
        <button onClick={() => { setStepEditing({}); setStepForm({ step_number: steps.length + 1, title: '', description: '' }); }} className="px-4 py-2 bg-gradient-to-r from-teal to-teal-dark text-white text-sm font-semibold rounded-xl hover:from-teal-dark hover:to-teal transition-all shadow-sm cursor-pointer">+ Add Step</button>
      </div>

      {stepEditing && (
        <div className="glass-card rounded-2xl p-6 space-y-4 mb-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-black dark:text-gray-100">{stepEditing.id ? 'Edit' : 'New'} Step</h3>
            <button onClick={() => setStepEditing(null)} className="text-xs px-3 py-1.5 bg-blue-100 dark:bg-gray-700 text-black/70 dark:text-gray-300 rounded-lg hover:bg-blue-200 dark:hover:bg-gray-600 transition cursor-pointer">Cancel</button>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-black/70/70 dark:text-gray-400 mb-1">Step Number</label>
              <input value={stepForm.step_number} onChange={(e) => setStepForm({ ...stepForm, step_number: parseInt(e.target.value) || 0 })} type="number" min="1" className="w-full px-3.5 py-2.5 bg-white/70 dark:bg-gray-900/70 border border-blue-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal/40" />
            </div>
            <div>
              <label className="block text-sm font-medium text-black/70/70 dark:text-gray-400 mb-1">Title</label>
              <input value={stepForm.title} onChange={(e) => setStepForm({ ...stepForm, title: e.target.value })} className="w-full px-3.5 py-2.5 bg-white/70 dark:bg-gray-900/70 border border-blue-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal/40" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-black/70/70 dark:text-gray-400 mb-1">Description</label>
              <textarea value={stepForm.description} onChange={(e) => setStepForm({ ...stepForm, description: e.target.value })} rows={3} className="w-full px-3.5 py-2.5 bg-white/70 dark:bg-gray-900/70 border border-blue-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal/40" />
            </div>
          </div>
          <button onClick={handleStepSave} disabled={stepSaving} className="px-6 py-2.5 bg-gradient-to-r from-teal to-teal-dark text-white text-sm font-semibold rounded-xl hover:from-teal-dark hover:to-teal transition-all shadow-sm disabled:opacity-60 cursor-pointer inline-flex items-center gap-2">
            {stepSaving && <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>}{stepSaving ? 'Saving...' : 'Save Step'}
          </button>
        </div>
      )}

      <div className="space-y-3">
        {steps.length === 0 ? (
          <p className="text-sm text-black/60 dark:text-gray-500">No process steps yet.</p>
        ) : (
          steps.map((s) => (
            <div key={s.id} className="glass-card rounded-2xl p-4 sm:p-5 flex items-center gap-4">
              <span className="text-lg font-bold text-teal-dark dark:text-teal-light shrink-0 w-8">{String(s.step_number).padStart(2, '0')}</span>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-black dark:text-gray-100">{s.title}</h4>
                <p className="text-sm text-black/60 dark:text-gray-400 truncate">{s.description}</p>
              </div>
              <div className="flex gap-2 shrink-0">
                <button onClick={() => { setStepEditing(s); setStepForm({ step_number: s.step_number, title: s.title, description: s.description }); }} className="px-3 py-1.5 text-xs font-medium bg-blue-100 dark:bg-gray-700 text-black/70 dark:text-gray-300 rounded-lg hover:bg-blue-200 dark:hover:bg-gray-600 transition cursor-pointer">Edit</button>
                <button onClick={() => removeServiceStep(s.id).then(async () => setSteps(await fetchServiceSteps()))} className="px-3 py-1.5 text-xs font-medium bg-rose/10 text-rose dark:text-purple-300 rounded-lg hover:bg-rose/20 transition cursor-pointer">Delete</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function DomainPriceRow({ row, onSave }) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(row.price);
  const handleSave = async () => {
    if (val !== row.price && val > 0) {
      await onSave(row.tld, val);
    }
    setEditing(false);
  };
  return (
    <tr className="border-t border-blue-100 dark:border-gray-800">
      <td className="py-2 pr-4 font-medium text-black dark:text-gray-200">.{row.tld}</td>
      <td className="py-2 pr-4">
        {editing ? (
          <input value={val} onChange={(e) => setVal(parseFloat(e.target.value) || 0)} type="number" step="0.01" min="0" className="w-24 px-2 py-1 bg-white/70 dark:bg-gray-900/70 border border-blue-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal/40" />
        ) : (
          <span className="text-black dark:text-gray-200">${row.price.toFixed(2)}</span>
        )}
      </td>
      <td className="py-2">
        {editing ? (
          <div className="flex gap-1">
            <button onClick={handleSave} className="px-2 py-1 bg-teal text-white text-xs rounded-lg hover:bg-teal-dark transition cursor-pointer">Save</button>
            <button onClick={() => { setEditing(false); setVal(row.price); }} className="px-2 py-1 bg-blue-100 dark:bg-gray-700 text-black/70 dark:text-gray-300 text-xs rounded-lg hover:bg-blue-200 dark:hover:bg-gray-600 transition cursor-pointer">Cancel</button>
          </div>
        ) : (
          <button onClick={() => setEditing(true)} className="px-2 py-1 bg-blue-100 dark:bg-gray-700 text-black/70 dark:text-gray-300 text-xs rounded-lg hover:bg-blue-200 dark:hover:bg-gray-600 transition cursor-pointer">Edit</button>
        )}
      </td>
    </tr>
  );
}
