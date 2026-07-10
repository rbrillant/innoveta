import { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  const emailParam = searchParams.get('email');

  const [email, setEmail] = useState(emailParam || '');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [sending, setSending] = useState(false);

  async function handleRequestReset(e) {
    e.preventDefault();
    setError(''); setSending(true);
    try {
      const r = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const j = await r.json();
      if (j.error) { setError(j.error); setSending(false); return; }
      setSuccess('If that email exists, a reset link has been sent.');
      setSending(false);
    } catch (err) { setError(err.message); setSending(false); }
  }

  async function handleReset(e) {
    e.preventDefault();
    setError('');
    if (password !== confirm) { setError('Passwords do not match'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setSending(true);
    try {
      const r = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, token, newPassword: password }),
      });
      const j = await r.json();
      if (j.error) { setError(j.error); setSending(false); return; }
      setSuccess('Password reset successfully!');
      setTimeout(() => navigate('/auth'), 2000);
    } catch (err) { setError(err.message); setSending(false); }
  }

  return (
    <main className="flex-1 flex items-center justify-center py-20 px-5">
      <div className="glass-card rounded-2xl p-8 max-w-md w-full">
        {success ? (
          <div className="text-center">
            <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
            </div>
            <p className="text-sm text-emerald-600 dark:text-emerald-400">{success}</p>
            {!token && <Link to="/auth" className="mt-4 text-xs text-teal dark:text-teal-light hover:underline inline-block">Back to login</Link>}
          </div>
        ) : token && email ? (
          <>
            <h2 className="text-xl font-bold text-black dark:text-gray-100 mb-1">Reset Password</h2>
            <p className="text-sm text-black/60 dark:text-gray-400 mb-6">Enter your new password</p>
            <form onSubmit={handleReset} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-black/70/70 dark:text-gray-400 mb-1">New Password</label>
                <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required minLength={6} placeholder="••••••••" className="w-full px-4 py-3 bg-white/70 dark:bg-gray-800/70 border border-glass-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal/40 dark:text-gray-200" />
              </div>
              <div>
                <label className="block text-xs font-medium text-black/70/70 dark:text-gray-400 mb-1">Confirm Password</label>
                <input value={confirm} onChange={(e) => setConfirm(e.target.value)} type="password" required minLength={6} placeholder="••••••••" className="w-full px-4 py-3 bg-white/70 dark:bg-gray-800/70 border border-glass-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal/40 dark:text-gray-200" />
              </div>
              {error && <p className="text-sm text-rose dark:text-purple-300">{error}</p>}
              <button type="submit" disabled={sending} className="w-full px-6 py-3 bg-gradient-to-r from-teal to-teal-dark text-white text-sm font-semibold rounded-xl hover:from-teal-dark hover:to-teal transition-all shadow-sm disabled:opacity-60 cursor-pointer inline-flex items-center justify-center gap-2">
                {sending && <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>}{sending ? 'Resetting...' : 'Reset Password'}
              </button>
            </form>
          </>
        ) : (
          <>
            <h2 className="text-xl font-bold text-black dark:text-gray-100 mb-1">Forgot Password</h2>
            <p className="text-sm text-black/60 dark:text-gray-400 mb-6">Enter your email to receive a reset link.</p>
            <form onSubmit={handleRequestReset} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-black/70/70 dark:text-gray-400 mb-1">Email</label>
                <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required placeholder="your@email.com" className="w-full px-4 py-3 bg-white/70 dark:bg-gray-800/70 border border-glass-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal/40 dark:text-gray-200" />
              </div>
              {error && <p className="text-sm text-rose dark:text-purple-300">{error}</p>}
              <button type="submit" disabled={sending} className="w-full px-6 py-3 bg-gradient-to-r from-teal to-teal-dark text-white text-sm font-semibold rounded-xl hover:from-teal-dark hover:to-teal transition-all shadow-sm disabled:opacity-60 cursor-pointer inline-flex items-center justify-center gap-2">
                {sending && <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>}{sending ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>
            <p className="text-center text-xs text-black/60 dark:text-gray-400 mt-4">
              <Link to="/auth" className="text-teal dark:text-teal-light hover:underline">Back to login</Link>
            </p>
          </>
        )}
      </div>
    </main>
  );
}
