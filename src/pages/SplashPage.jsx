import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

export default function SplashPage() {
  const canvasRef = useRef();

  useEffect(() => {
    const canvas = canvasRef.current;
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
        r: Math.random() * 3 + 1,
        a: Math.random() * 0.4 + 0.1,
        hue: Math.random() > 0.5 ? 212 : 43,
      });
    }

    function draw(t) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const isDark = document.documentElement.classList.contains('dark');
      ctx.fillStyle = isDark ? '#0b1120' : '#fffff0';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 70%, 55%, ${p.a})`;
        ctx.fill();
      });

      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      for (let i = 0; i < 3; i++) {
        const r = 80 + i * 60 + Math.sin(t * 0.0005 + i) * 30;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.strokeStyle = i === 1 ? `rgba(212, 160, 23, ${0.06 + Math.sin(t * 0.0008 + i) * 0.03})` : `rgba(37, 99, 235, ${0.04 + Math.sin(t * 0.0006 + i) * 0.02})`;
        ctx.lineWidth = i === 0 ? 1 : 1.5;
        ctx.stroke();
      }

      raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
  }, []);

  return (
    <main className="relative w-full overflow-hidden" style={{ height: 'calc(100vh - 64px)' }}>
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      <div className="relative z-10 flex flex-col h-full px-0 pt-2 pb-2" style={{ paddingRight: '50px' }}>
        {/* Top section: two main divs — 68% of height */}
        <div className="relative flex" style={{ height: '68%' }}>
          <div
            className="glass-card flex items-center"
            style={{ flex: '0 0 70%', borderRight: '2px solid rgba(212,160,23,0.4)', position: 'relative', zIndex: 1 }}
          >
            <div className="px-6 sm:px-10 lg:px-14 w-full py-4">
              <div className="animate-fade-down">
                <span className="inline-block text-xs font-medium text-teal-dark dark:text-teal-light bg-white/80 dark:bg-gray-900/80 backdrop-blur-md px-3 py-1 rounded-full mb-3 shadow-sm border border-teal/20">
                  ✦ Welcome to
                </span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold text-blue-900 dark:text-gray-100 leading-tight animate-fade-up" style={{ animationDelay: '0.2s', animationFillMode: 'both' }}>
                <span className="text-blue-900 dark:text-gray-100">Inno</span><span className="text-teal">veta</span>
              </h1>

              <p className="text-blue-600/70 dark:text-gray-400 mt-2 max-w-md text-xs sm:text-sm animate-fade-up" style={{ animationDelay: '0.4s', animationFillMode: 'both' }}>
                Premium design templates — websites, flyers, CVs, menus, banners and more.
              </p>

              <div className="mt-4 animate-fade-up" style={{ animationDelay: '0.6s', animationFillMode: 'both' }}>
                <Link
                  to="/home"
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-teal to-teal-dark text-white text-sm font-semibold rounded-xl hover:from-teal-dark hover:to-teal transition-all shadow-md hover:shadow-lg hover:scale-105 active:scale-95"
                >
                  Let's Go
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>

          <div
            className="relative overflow-hidden"
            style={{
              flex: '0 0 30%',
              borderLeft: '2px solid rgba(212,160,23,0.4)',
              position: 'relative', zIndex: 1,
              background: 'var(--bg-glass)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              borderTopRightRadius: '2rem', borderBottomRightRadius: '2rem',
              borderTop: '1px solid rgba(212,160,23,0.15)',
              borderBottom: '1px solid rgba(212,160,23,0.15)',
              borderRight: '1px solid rgba(212,160,23,0.15)',
            }}
          >
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-blue-400/60 text-xs sm:text-sm font-light tracking-[0.3em] animate-word-fade" style={{ animationDelay: '0s', animationDuration: '2s' }}>We</span>
              <span className="text-teal font-bold text-3xl sm:text-5xl lg:text-6xl animate-word-slide" style={{ animationDelay: '0.5s', animationDuration: '2s' }}>Create</span>
            </div>
            <span className="absolute top-1/3 left-2 text-blue-500/50 text-[11px] sm:text-sm font-light tracking-wider animate-word-rise" style={{ animationDelay: '0.7s', animationDuration: '2.5s' }}>Innovate</span>
            <span className="absolute top-1/3 right-2 text-blue-400/50 text-[11px] sm:text-sm font-light animate-word-fade" style={{ animationDelay: '0.9s', animationDuration: '2.3s' }}>Dream</span>
            <span className="absolute bottom-14 right-3 text-blue-500/50 text-sm sm:text-base font-light tracking-wider animate-word-scale" style={{ animationDelay: '1.1s', animationDuration: '2s' }}>Design</span>
            <span className="absolute bottom-14 left-3 text-teal-dark/50 text-[11px] sm:text-sm font-light italic animate-word-rise" style={{ animationDelay: '1.3s', animationDuration: '2.4s' }}>Shape</span>
            <span className="absolute bottom-2 left-1/2 -translate-x-1/2 text-teal-dark/50 text-sm sm:text-base font-light italic animate-word-fade" style={{ animationDelay: '1.5s', animationDuration: '2s' }}>Inspire</span>
            <span className="absolute bottom-2 right-3 text-blue-400/50 text-[11px] sm:text-sm font-light animate-word-slide" style={{ animationDelay: '1.7s', animationDuration: '2.6s' }}>Craft</span>
            <span className="absolute top-1/2 right-2 text-blue-300/40 text-[9px] sm:text-[11px] font-light tracking-wider animate-word-scale" style={{ animationDelay: '0.2s', animationDuration: '3s' }}>Vision</span>
            <span className="absolute top-1/2 left-2 text-blue-300/40 text-[9px] sm:text-[11px] font-light animate-word-fade" style={{ animationDelay: '0.6s', animationDuration: '2.8s' }}>Art</span>
          </div>

          <img
            src="/images/splash-art.png"
            alt=""
            className="absolute bottom-0 w-auto object-contain pointer-events-none z-20"
            style={{
              left: '70%', transform: 'translate(-50%, 0)',
              maxHeight: 'min(45vh, 320px)',
              maxWidth: 'min(40vw, 280px)',
              height: 'auto',
            }}
          />
        </div>

        {/* Bottom section: 3 horizontal cards — remaining height */}
        <div className="flex gap-3 w-full mt-2 animate-fade-up" style={{ flex: 1, animationDelay: '0.9s', animationFillMode: 'both' }}>
          {[
            { label: 'Websites', sub: 'Landing pages & more', desc: 'Responsive designs for your brand' },
            { label: 'Flyers', sub: 'Brochures & print', desc: 'Eye-catching layouts for events' },
            { label: 'Branding', sub: 'Social & identity', desc: 'Consistent look across platforms' },
          ].map((item, i) => (
            <div
              key={i}
              className="glass-card rounded-2xl px-3 py-2 flex-1 flex flex-col justify-center animate-fade-up"
              style={{ animationDelay: `${0.9 + i * 0.15}s`, animationFillMode: 'both' }}
            >
              <div className="w-6 h-6 rounded-md bg-teal/15 dark:bg-amber-900/20 flex items-center justify-center text-teal-dark dark:text-teal-light font-bold text-xs mb-1.5">
                {i + 1}
              </div>
              <span className="text-xs font-bold text-blue-900 dark:text-gray-100">{item.label}</span>
              <p className="text-[11px] text-blue-500/60 dark:text-gray-400 mt-0.5">{item.sub}</p>
              <p className="text-[11px] text-blue-400/50 dark:text-gray-500 mt-1 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* Dots */}
        <div className="flex justify-center mt-1 animate-fade-up" style={{ animationDelay: '1.4s', animationFillMode: 'both' }}>
          <div className="flex gap-1.5">
            {[0, 1, 2].map((i) => (
              <div key={i} className="w-1.5 h-1.5 rounded-full bg-teal/40 animate-pulse" style={{ animationDelay: `${i * 0.3}s` }} />
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeDown {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes wordFade {
          0% { opacity: 0; transform: translateX(-30px); }
          20% { opacity: 1; transform: translateX(0); }
          80% { opacity: 1; transform: translateX(0); }
          100% { opacity: 0; transform: translateX(30px); }
        }
        @keyframes wordSlide {
          0% { opacity: 0; transform: translateY(40px) scale(0.8); }
          20% { opacity: 1; transform: translateY(0) scale(1); }
          80% { opacity: 1; transform: translateY(0) scale(1); }
          100% { opacity: 0; transform: translateY(-40px) scale(0.8); }
        }
        @keyframes wordScale {
          0% { opacity: 0; transform: scale(0) rotate(-10deg); }
          20% { opacity: 1; transform: scale(1) rotate(0); }
          80% { opacity: 1; transform: scale(1) rotate(0); }
          100% { opacity: 0; transform: scale(0) rotate(10deg); }
        }
        @keyframes wordRise {
          0% { opacity: 0; transform: translateY(20px); }
          30% { opacity: 1; transform: translateY(-4px); }
          50% { transform: translateY(0); }
          80% { opacity: 1; }
          100% { opacity: 0; transform: translateY(-30px); }
        }
        .animate-fade-down { animation: fadeDown 0.6s ease-out both; }
        .animate-fade-up { animation: fadeUp 0.6s ease-out both; }
        .animate-word-fade { animation: wordFade 2s ease-in-out infinite; }
        .animate-word-slide { animation: wordSlide 2s ease-in-out infinite; }
        .animate-word-scale { animation: wordScale 2s ease-in-out infinite; }
        .animate-word-rise { animation: wordRise 2s ease-in-out infinite; }
      `}</style>
    </main>
  );
}
