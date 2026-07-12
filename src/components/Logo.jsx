import { Link } from 'react-router-dom';

export default function Logo({ to = '/home', showStudio = false, className = '' }) {
  return (
    <Link to={to} className={`inline-flex items-center gap-2 shrink-0 cursor-pointer group ${className}`}>
      <img src="/logo.png" alt="Innovetancy" className="h-8 w-auto object-contain" />
      <span className="font-semibold tracking-tight text-black dark:text-gray-100">Innovetancy</span>
      {showStudio && <span className="text-[10px] font-normal text-black/60 dark:text-gray-500 self-end pb-0.5">Studio</span>}
    </Link>
  );
}
