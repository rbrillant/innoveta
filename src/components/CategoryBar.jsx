import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import { supabase } from '../supabase';
import { fetchEnrollments } from '../data';
import { useTheme } from './ThemeProvider';
import Logo from './Logo';

const BASE_LINKS = [
  { to: '/home', label: 'Home' },
  { to: '/templates', label: 'Template' },
  { to: '/website', label: 'Website' },
  { to: '/domain-hosting', label: 'Domain & Hosting' },
  { to: '/online-courses', label: 'Online Courses' },
  { to: '/it-integration', label: 'IT Integration' },
  { to: '/consulting', label: 'Consulting' },
  { to: '/book', label: 'Book' },
];

export default function CategoryBar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { dark, toggle: toggleTheme } = useTheme();
  const [profileOpen, setProfileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [session, setSession] = useState(null);
  const [hasEnrollments, setHasEnrollments] = useState(false);
  const [search, setSearch] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const btnRef = useRef(null);
  const searchRef = useRef(null);
  const navLinks = hasEnrollments ? [...BASE_LINKS, { to: '/my-courses', label: 'My Courses' }] : BASE_LINKS;

  function handleSearch(e) {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/search?q=${encodeURIComponent(search.trim())}`);
      setSearch('');
    }
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      if (s?.user?.id) {
        fetchEnrollments(s.user.id).then((enrs) => setHasEnrollments(enrs.length > 0));
      }
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      if (s?.user?.id) {
        fetchEnrollments(s.user.id).then((enrs) => setHasEnrollments(enrs.length > 0));
      } else {
        setHasEnrollments(false);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!profileOpen) return;
    function handleClickOutside(e) {
      if (btnRef.current && !btnRef.current.contains(e.target) && !e.target.closest('.profile-dropdown')) {
        setProfileOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [profileOpen]);

  useEffect(() => {
    if (!searchOpen) return;
    function handleClickOutside(e) {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSearchOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [searchOpen]);

  async function handleSignOut() {
    await supabase.auth.signOut();
    setSession(null);
    setProfileOpen(false);
  }

  return (
    <>
      <div className="sticky top-0 z-50 glass-card border-b border-glass-border">
        <div className="max-w-6xl mx-auto px-3 sm:px-5">
          <div className="flex items-center gap-2 py-2.5">
            <Logo className="text-base sm:text-lg shrink-0" />
            <div ref={searchRef} className={`flex max-md:hidden items-center border border-glass-border rounded-full transition-all duration-200 ${searchOpen ? 'w-[180px]' : 'w-8'}`}>
              <form onSubmit={handleSearch} className="flex items-center flex-1 min-w-0">
                <input
                  ref={(el) => el && searchOpen && el.focus()}
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search..."
                  className={`bg-transparent text-xs focus:outline-none placeholder:text-blue-300 dark:placeholder:text-gray-500 dark:text-gray-200 transition-all duration-200 ${searchOpen ? 'w-full pl-3 pr-1 py-1.5' : 'w-0 p-0'}`}
                />
              </form>
              <button
                type="button"
                onClick={() => { if (searchOpen && search.trim()) { handleSearch({ preventDefault: () => {} }); } else { setSearchOpen((o) => !o); } }}
                className="shrink-0 w-7 h-7 flex items-center justify-center rounded-full text-blue-600/70 hover:text-blue-900 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-white/60 dark:hover:bg-gray-700/60 transition-colors cursor-pointer mr-0.5"
                title="Search"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </button>
            </div>

            <div className="flex max-md:hidden items-center gap-1 overflow-x-auto scrollbar-none">
              {navLinks.map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  className={`text-xs font-medium px-3 py-1.5 rounded-full transition-colors whitespace-nowrap ${
                    pathname === l.to
                      ? 'bg-teal text-white'
                      : 'text-blue-600/70 hover:text-blue-900 hover:bg-white/60 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700/60'
                  }`}
                >
                  {l.label}
                </Link>
              ))}
            </div>

            <div className="ml-auto flex items-center gap-1" ref={btnRef}>
              <button
                onClick={toggleTheme}
                className="shrink-0 w-8 h-8 flex items-center justify-center rounded-full text-blue-600/70 hover:text-blue-900 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-white/60 dark:hover:bg-gray-700/60 transition-colors cursor-pointer"
                title={dark ? 'Light mode' : 'Dark mode'}
              >
                {dark ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
                )}
              </button>
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex max-sm:hidden items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-blue-600/70 hover:text-blue-900 hover:bg-white/60 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700/60 transition-colors cursor-pointer whitespace-nowrap"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                Profile
              </button>
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex sm:hidden w-8 h-8 items-center justify-center rounded-full text-blue-600/70 hover:text-blue-900 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-white/60 dark:hover:bg-gray-700/60 transition-colors cursor-pointer"
                title="Profile"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
              </button>
              <button
                type="button"
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex md:hidden w-9 h-9 items-center justify-center rounded-full text-blue-600/70 hover:text-blue-900 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-white/60 dark:hover:bg-gray-700/60 transition-colors cursor-pointer active:scale-95"
                aria-label="Menu"
              >
                {menuOpen ? (
                  <svg className="w-4 h-4 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                ) : (
                  <svg className="w-4 h-4 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
                )}
              </button>
            </div>
          </div>

          {menuOpen && (
            <div className="flex md:hidden border-t border-glass-border pb-3 pt-2 flex-wrap gap-1.5 px-1">
              {navLinks.map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  onClick={() => setMenuOpen(false)}
                  className={`text-xs font-medium px-3 py-1.5 rounded-full transition-colors whitespace-nowrap ${
                    pathname === l.to
                      ? 'bg-teal text-white'
                      : 'text-blue-600/70 hover:text-blue-900 hover:bg-white/60 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700/60'
                  }`}
                >
                  {l.label}
                </Link>
              ))}
              <form onSubmit={handleSearch} className="w-full mt-2 relative">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search..."
                  className="w-full px-3 py-1.5 bg-white/70 dark:bg-gray-800/70 border border-glass-border rounded-full text-xs focus:outline-none focus:ring-2 focus:ring-teal/40 placeholder:text-blue-300 dark:placeholder:text-gray-500 dark:text-gray-200"
                />
              </form>
            </div>
          )}
        </div>
      </div>

      {profileOpen && (
        <div className="fixed inset-x-0 top-[57px] z-[100] flex justify-end profile-dropdown" style={{ paddingRight: 'calc((100vw - 1216px) / 2 + 20px)' }}>
          <div className="bg-white rounded-2xl p-2 shadow-lg border border-blue-200 w-48 dark:bg-gray-800 dark:border-gray-700">
            {session ? (
              <>
                <div className="px-3 py-2 text-sm text-blue-900 font-medium truncate border-b border-blue-100 mb-1 dark:text-gray-200 dark:border-gray-700">
                  {session.user.email}
                </div>
                <button
                  onClick={handleSignOut}
                  className="w-full text-left px-3 py-2 text-sm text-blue-500 hover:bg-blue-50 rounded-xl transition-colors cursor-pointer dark:text-gray-400 dark:hover:bg-gray-700"
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/auth?mode=signin"
                  onClick={() => setProfileOpen(false)}
                  className="block px-3 py-2 text-sm text-blue-900 hover:bg-blue-50 rounded-xl transition-colors dark:text-gray-200 dark:hover:bg-gray-700"
                >
                  Sign In
                </Link>
                <Link
                  to="/auth?mode=signup"
                  onClick={() => setProfileOpen(false)}
                  className="block px-3 py-2 text-sm text-blue-700 font-medium hover:bg-blue-50 rounded-xl transition-colors dark:text-blue-400 dark:hover:bg-gray-700"
                >
                  Create Account
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
