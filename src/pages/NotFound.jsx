import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <main className="flex-1 flex items-center justify-center px-5">
      <div className="text-center py-20">
        <span className="inline-block text-6xl mb-4 text-black dark:text-gray-100">404</span>
        <h2 className="text-2xl font-bold text-black dark:text-gray-100">Page Not Found</h2>
        <p className="text-black/60 dark:text-gray-400 mt-2 mb-6">The page you're looking for doesn't exist.</p>
        <Link to="/home" className="inline-flex px-6 py-3 bg-gradient-to-r from-teal to-teal-dark text-white text-sm font-semibold rounded-xl hover:from-teal-dark hover:to-teal transition-all shadow-sm">
          Go Home
        </Link>
      </div>
    </main>
  );
}
