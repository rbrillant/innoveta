import { Link } from 'react-router-dom';

export default function Logo({ to = '/home', showStudio = false, className = '' }) {
  return (
    <Link to={to} className={`inline-flex items-center gap-2 shrink-0 cursor-pointer group ${className}`}>
      <span className="relative w-8 h-8 flex items-center justify-center">
        <svg viewBox="0 0 32 32" className="w-8 h-8">
          <defs>
            <linearGradient id="logoGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#14b8a6" />
              <stop offset="100%" stopColor="#0d9488" />
            </linearGradient>
          </defs>
          <rect x="2" y="2" width="28" height="28" rx="8" fill="url(#logoGrad)" className="group-hover:scale-105 transition-transform origin-center" />
          <path d="M16 8l7 12-7-4-7 4z" fill="white" opacity="0.9" />
          <circle cx="16" cy="8" r="2" fill="white" />
          <path d="M16 20l-7-4 7 12 7-12z" fill="white" opacity="0.6" />
        </svg>
      </span>
      <span className="font-semibold tracking-tight">
        <span className="text-blue-900 dark:text-gray-100">Inno</span><span className="text-teal">veta</span>
      </span>
      {showStudio && <span className="text-[10px] font-normal text-blue-400/60 dark:text-gray-500 -ml-1">Studio</span>}
    </Link>
  );
}
