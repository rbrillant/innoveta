import { Link } from 'react-router-dom';
import Logo from './Logo';

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-blue-200/50 dark:border-white/5 glass-card">
      <div className="max-w-6xl mx-auto px-5 py-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <Logo className="text-xs" />
            <div className="flex flex-wrap gap-x-2 gap-y-1 text-[11px] text-black/70 dark:text-gray-400">
              <Link to="/home" className="hover:text-teal-dark dark:hover:text-teal-light transition-colors">Home</Link>
              <Link to="/templates" className="hover:text-teal-dark dark:hover:text-teal-light transition-colors">Templates</Link>
              <Link to="/domain-hosting" className="hover:text-teal-dark dark:hover:text-teal-light transition-colors">Domain</Link>
              <Link to="/online-courses" className="hover:text-teal-dark dark:hover:text-teal-light transition-colors">Courses</Link>
              <Link to="/services" className="hover:text-teal-dark dark:hover:text-teal-light transition-colors">Services</Link>
              <Link to="/book" className="hover:text-teal-dark dark:hover:text-teal-light transition-colors">Book</Link>
              <Link to="/my-courses" className="hover:text-teal-dark dark:hover:text-teal-light transition-colors">My Courses</Link>
            </div>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-black/70 dark:text-gray-400">
            <a href="mailto:hello@innovetancy.com" className="hover:text-teal-dark dark:hover:text-teal-light transition-colors">hello@innovetancy.com</a>
            <span className="text-blue-300 dark:text-gray-600">|</span>
            <span>&copy; 2026 Innovetancy</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
