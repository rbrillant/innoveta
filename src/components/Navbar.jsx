import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useTheme } from './ThemeProvider';
import Logo from './Logo';

export default function Navbar({ hideSearch }) {
  const navigate = useNavigate();
  const { dark, toggle: toggleTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  function handleSearch(e) {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/search?q=${encodeURIComponent(search.trim())}`);
      setSearch('');
      setOpen(false);
    }
  }

  return (
    <nav className="sticky top-0 z-50 glass-card border-b border-glass-border">
      <div className="max-w-6xl mx-auto px-5">
        <div className="h-16 flex items-center justify-between gap-4 relative z-10">
          <Logo />

          {!hideSearch && (
            <form onSubmit={handleSearch} className="flex max-md:hidden flex-1 max-w-md relative">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search templates..."
                className="w-full px-4 py-2 bg-white/80 dark:bg-gray-800/80 border border-glass-border rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-teal/40 focus:border-teal placeholder:text-warm-light dark:placeholder:text-gray-500 dark:text-gray-200"
              />
              <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-warm-light dark:text-gray-500 hover:text-teal-dark transition-colors cursor-pointer">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </button>
            </form>
          )}

          <div className="flex items-center gap-2">
            {!hideSearch && (
              <button
                onClick={toggleTheme}
                className="w-9 h-9 flex items-center justify-center rounded-full text-warm-light dark:text-gray-400 hover:text-teal-dark dark:hover:text-gray-200 hover:bg-white/60 dark:hover:bg-gray-700/60 transition-colors cursor-pointer"
                title={dark ? 'Light mode' : 'Dark mode'}
              >
                {dark ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
                )}
              </button>
            )}
            {!hideSearch && (
              <button
                className="md:hidden text-xl text-warm-dark dark:text-gray-200 relative z-10"
                onClick={() => setOpen(!open)}
                aria-label="Toggle menu"
              >
                {open ? '✕' : '☰'}
              </button>
            )}
          </div>
        </div>
      </div>

      {!hideSearch && open && (
        <div className="md:hidden border-t border-glass-border bg-white/70 dark:bg-gray-900/70 backdrop-blur-md px-5 pb-4 pt-2 flex flex-col gap-3 relative z-10">
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search templates..."
              className="w-full px-4 py-2 bg-white/80 dark:bg-gray-800/80 border border-glass-border rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-teal/40 focus:border-teal placeholder:text-warm-light dark:placeholder:text-gray-500 dark:text-gray-200"
            />
            <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-warm-light dark:text-gray-500 cursor-pointer">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </button>
          </form>
        </div>
      )}
    </nav>
  );
}
