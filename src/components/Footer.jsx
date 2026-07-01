import { Link } from 'react-router-dom';
import Logo from './Logo';

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-blue-200/50 dark:border-gray-800 glass-card">
      <div className="max-w-6xl mx-auto px-5 py-10">
        <div className="grid sm:grid-cols-2 gap-8">
          <div>
            <Logo className="text-base sm:text-lg mb-4" />
            <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-blue-500 dark:text-gray-400">
              <Link to="/home" className="hover:text-teal-dark dark:hover:text-teal-light transition-colors">Home</Link>
              <Link to="/templates" className="hover:text-teal-dark dark:hover:text-teal-light transition-colors">Templates</Link>
              <Link to="/website" className="hover:text-teal-dark dark:hover:text-teal-light transition-colors">Website</Link>
              <Link to="/domain-hosting" className="hover:text-teal-dark dark:hover:text-teal-light transition-colors">Domain &amp; Hosting</Link>
              <Link to="/online-courses" className="hover:text-teal-dark dark:hover:text-teal-light transition-colors">Online Courses</Link>
              <Link to="/it-integration" className="hover:text-teal-dark dark:hover:text-teal-light transition-colors">IT Integration</Link>
              <Link to="/consulting" className="hover:text-teal-dark dark:hover:text-teal-light transition-colors">Consulting</Link>
              <Link to="/book" className="hover:text-teal-dark dark:hover:text-teal-light transition-colors">Book</Link>
              <Link to="/my-courses" className="hover:text-teal-dark dark:hover:text-teal-light transition-colors">My Courses</Link>
              <Link to="/admin" className="text-[10px] text-blue-300 dark:text-gray-500 hover:text-teal-dark dark:hover:text-teal-light transition-colors uppercase tracking-wider">Admin</Link>
            </div>
          </div>
          <div className="sm:text-right text-sm text-blue-500 dark:text-gray-400 space-y-2">
            <p className="text-blue-900 dark:text-gray-100 font-semibold">Contact</p>
            <p><a href="mailto:hello@innoveta.com" className="hover:text-teal-dark dark:hover:text-teal-light transition-colors">hello@innoveta.com</a></p>
            <p><a href="tel:+256700000000" className="hover:text-teal-dark dark:hover:text-teal-light transition-colors">+256 700 000 000</a></p>
            <p className="text-xs pt-2">&copy; 2026 Innoveta. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
