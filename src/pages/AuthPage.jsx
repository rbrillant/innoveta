import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { supabase } from '../supabase';

export default function AuthPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [mode, setMode] = useState(searchParams.get('mode') || 'signin');
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);
  const redirectTo = searchParams.get('redirect') || '/templates';
  const canvasRef = useRef();

  useEffect(() => {
    supabase.auth.getSession().then((result) => {
      const session = result?.data?.session;
      if (session) navigate(redirectTo, { replace: true });
    });
  }, [navigate, redirectTo]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    try {
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      let raf;

      function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }
      resize();
      window.addEventListener('resize', resize);

      const particles = [];
      for (let i = 0; i < 120; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.6,
          vy: (Math.random() - 0.5) * 0.6,
          r: Math.random() * 5 + 2,
          a: Math.random() * 0.6 + 0.3,
          hue: Math.random() > 0.5 ? 212 : 43,
        });
      }

      const stars = [];
      for (let i = 0; i < 200; i++) {
        stars.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          r: Math.random() * 1.8 + 0.3,
          a: Math.random() * 0.8 + 0.2,
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

        const cx = canvas.width / 2;
        const cy = canvas.height / 2;
        for (let i = 0; i < 3; i++) {
          const r = 80 + i * 80 + Math.sin(t * 0.0006 + i) * 40;
          ctx.beginPath();
          ctx.arc(cx, cy, r, 0, Math.PI * 2);
          ctx.strokeStyle = i === 1 ? `rgba(212, 160, 23, ${0.12 + Math.sin(t * 0.0008 + i) * 0.06})` : `rgba(37, 99, 235, ${0.08 + Math.sin(t * 0.0006 + i) * 0.04})`;
          ctx.lineWidth = i === 0 ? 1.5 : 2.5;
          ctx.stroke();
        }

        raf = requestAnimationFrame(draw);
      }
      raf = requestAnimationFrame(draw);
      return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
    } catch {}
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSending(true);
    const fd = new FormData(e.target);
    const email = fd.get('email')?.trim().toLowerCase();
    const password = fd.get('password')?.trim();

    if (!email || !password) { setSending(false); setError('Fill in all fields.'); return; }

    if (mode === 'signup') {
      const surname = fd.get('surname')?.trim();
      const name = fd.get('name')?.trim();
      const phone = fd.get('phone')?.trim();
      if (!surname || !name || !phone) { setSending(false); setError('Fill in all fields.'); return; }

      const { data, error: signUpErr } = await supabase.auth.signUp({ email, password, options: { data: { surname, name, phone } } });
      if (signUpErr) { setSending(false); setError(typeof signUpErr === 'string' ? signUpErr : signUpErr.message || 'Sign up failed'); return; }
      if (!data?.user) { setSending(false); setError('Sign up failed. Try again.'); return; }
      navigate(redirectTo, { replace: true });
    } else {
      const { error: signInErr } = await supabase.auth.signInWithPassword({ email, password });
      if (signInErr) { setSending(false); setError(typeof signInErr === 'string' ? signInErr : signInErr.message || 'Sign in failed'); return; }
      navigate(redirectTo, { replace: true });
    }
  }

  return (
    <main className="relative w-full" style={{ height: '100vh' }}>
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      <div className="relative z-10 w-full h-full flex items-center justify-center px-4">
        <div className="slide-right w-full max-w-md">
          <div className="glass-card rounded-3xl p-8 sm:p-10">
            <div className="text-center mb-8">
              <span className="inline-block text-3xl mb-3">🎨</span>
              <h2 className="text-2xl font-bold text-black dark:text-gray-100">Innovetancy</h2>
              <p className="text-sm text-black dark:text-gray-400 mt-1">{mode === 'signin' ? 'Sign in to continue' : 'Create your account'}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'signup' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-black dark:text-gray-400 mb-1">Surname</label>
                    <input name="surname" required placeholder="Doe" className="w-full px-4 py-3 bg-white/70 dark:bg-gray-800/70 border border-glass-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 dark:text-gray-200 dark:placeholder:text-gray-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-black dark:text-gray-400 mb-1">Name</label>
                    <input name="name" required placeholder="John" className="w-full px-4 py-3 bg-white/70 dark:bg-gray-800/70 border border-glass-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 dark:text-gray-200 dark:placeholder:text-gray-500" />
                  </div>
                </div>
              )}
              <div>
                <label className="block text-xs font-medium text-black dark:text-gray-400 mb-1">Email</label>
                <input name="email" type="email" required placeholder="john@email.com" className="w-full px-4 py-3 bg-white/70 dark:bg-gray-800/70 border border-glass-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 dark:text-gray-200 dark:placeholder:text-gray-500" />
              </div>
              {mode === 'signup' && (
                <div>
                  <label className="block text-xs font-medium text-black dark:text-gray-400 mb-1">Phone number</label>
                  <input name="phone" required placeholder="+27 123 456 789" className="w-full px-4 py-3 bg-white/70 dark:bg-gray-800/70 border border-glass-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 dark:text-gray-200 dark:placeholder:text-gray-500" />
                </div>
              )}
              <div>
                <label className="block text-xs font-medium text-black dark:text-gray-400 mb-1">Password</label>
                <input name="password" type="password" required placeholder="••••••••" className="w-full px-4 py-3 bg-white/70 dark:bg-gray-800/70 border border-glass-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 dark:text-gray-200 dark:placeholder:text-gray-500" />
                {mode === 'signin' && <Link to="/reset-password" className="block text-xs text-teal dark:text-teal-light hover:underline mt-1.5 text-right">Forgot password?</Link>}
              </div>
              {error && <p className="text-sm text-red-400">{error}</p>}
              <button type="submit" disabled={sending} className="w-full px-6 py-3.5 bg-gradient-to-r from-teal to-teal-dark text-white text-sm font-semibold rounded-xl hover:from-teal-dark hover:to-teal transition-all shadow-sm disabled:opacity-60 cursor-pointer inline-flex items-center justify-center gap-2">
                {sending && <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>}{sending ? (mode === 'signin' ? 'Signing In...' : 'Creating...') : (mode === 'signin' ? 'Sign In' : 'Create Account')}
              </button>
            </form>

            <p className="text-center text-xs text-black dark:text-gray-400 mt-5">
              {mode === 'signin' ? (
                <>Don't have an account? <button onClick={() => { setMode('signup'); setError(''); }} className="text-teal-dark dark:text-teal-light font-medium hover:underline cursor-pointer">Create one</button></>
              ) : (
                <>Already have an account? <button onClick={() => { setMode('signin'); setError(''); }} className="text-teal-dark dark:text-teal-light font-medium hover:underline cursor-pointer">Sign in</button></>
              )}
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slideFromRight {
          from { opacity: 0; transform: translateX(80px) scale(0.95); }
          to { opacity: 1; transform: translateX(0) scale(1); }
        }
        .slide-right { animation: slideFromRight 0.6s cubic-bezier(0.22, 0.61, 0.36, 1) both; }
      `}</style>
    </main>
  );
}
