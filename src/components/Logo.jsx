import { Link } from 'react-router-dom';

export default function Logo({ to = '/home', showStudio = false, className = '' }) {
  return (
    <Link to={to} className={`inline-flex flex-col shrink-0 cursor-pointer group leading-tight ${className}`}>
      <span className="font-semibold tracking-tight">
        <span className="text-black dark:text-gray-100">Innoventancy</span>
      </span>
      {showStudio && <span className="text-[10px] font-normal text-black/60 dark:text-gray-500">Studio</span>}
    </Link>
  );
}
