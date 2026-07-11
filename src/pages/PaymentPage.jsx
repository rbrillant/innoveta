import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import { getBooking, uploadPaymentProof, fetchPaymentSettings } from '../data';

const BANKS = [
  { name: 'Bank of Kigali', code: 'BOK', color: '#1a4b8c', short: 'BK' },
  { name: 'Equity Bank', code: 'EQY', color: '#7d0d0d', short: 'EQ' },
  { name: 'I&M Bank', code: 'IMB', color: '#003366', short: 'IM' },
  { name: 'Access Bank', code: 'ACB', color: '#ed1c24', short: 'AC' },
  { name: 'COGEBANQUE', code: 'COG', color: '#0066a1', short: 'CG' },
  { name: 'KCB Bank', code: 'KCB', color: '#006747', short: 'KC' },
];

function generateAccount(code) {
  const n = Math.floor(Math.random() * 9000000000 + 1000000000);
  return `${code}${n}`;
}

function getOrGenerateAccounts() {
  const stored = sessionStorage.getItem('payment_accounts');
  if (stored) return JSON.parse(stored);
  const accounts = BANKS.map((b) => ({ ...b, account: generateAccount(b.code) }));
  sessionStorage.setItem('payment_accounts', JSON.stringify(accounts));
  return accounts;
}

export default function PaymentPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [method, setMethod] = useState('bank');
  const [file, setFile] = useState(null);
  const [reference, setReference] = useState('');
  const [uploading, setUploading] = useState(false);
  const [proofError, setProofError] = useState('');
  const [success, setSuccess] = useState(false);
  const [userId, setUserId] = useState(null);
  const banks = getOrGenerateAccounts();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUserId(data?.session?.user?.id || null);
    });
    Promise.all([
      getBooking(id),
      fetchPaymentSettings(),
    ]).then(([b, s]) => {
      if (b) setBooking(b);
      if (s) setSettings(s);
      setLoading(false);
    }).catch(() => {
      setError('Failed to load payment details.');
      setLoading(false);
    });
  }, [id]);

  async function handleProofSubmit(e) {
    e.preventDefault();
    if (!userId) { setProofError('You must be signed in.'); return; }
    setUploading(true);
    setProofError('');

    const fd = new FormData(e.target);
    const file = fd.get('proof');
    if (!file || file.size === 0) { setProofError('Please select a payment receipt/screenshot.'); setUploading(false); return; }
    if (file.size > 5 * 1024 * 1024) { setProofError('File too large. Max 5MB.'); setUploading(false); return; }

    try {
      await uploadPaymentProof(id, file, {
        method: fd.get('method'),
        reference: fd.get('reference'),
      });
      setSuccess(true);
    } catch (err) {
      setProofError(err.message || 'Upload failed. Try again.');
    } finally {
      setUploading(false);
    }
  }

  if (loading) return <main className="flex-1 flex items-center justify-center py-20"><p className="text-black/70 dark:text-gray-300 text-lg">Loading...</p></main>;
  if (error && !booking) return <main className="flex-1 flex items-center justify-center py-20"><p className="text-rose dark:text-purple-300 text-lg">{error}</p></main>;

  if (success) {
    return (
      <main className="flex-1">
        <div className="max-w-2xl mx-auto px-5 py-20 text-center">
          <div className="text-6xl mb-6">&#9989;</div>
          <h1 className="text-3xl font-bold text-black dark:text-gray-100 mb-3">Payment Proof Submitted</h1>
          <p className="text-black/70 dark:text-gray-300 mb-8">We'll review your payment and get back to you within 24 hours. You'll receive a confirmation email once verified.</p>
          <Link to="/home" className="inline-block px-6 py-3 bg-gradient-to-r from-teal to-teal-dark text-white text-sm font-semibold rounded-xl hover:from-teal-dark hover:to-teal transition-all shadow-sm cursor-pointer">Back to Home</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 h-[calc(100vh-57px)] overflow-hidden">
      <div className="h-full flex flex-col lg:flex-row">
        {/* Left: Payment Methods */}
        <div className="lg:w-3/5 h-full overflow-y-auto px-5 py-6 lg:py-8">
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center gap-3 mb-5">
              <span className="text-xs font-medium text-teal-dark dark:text-teal-light bg-white/70 dark:bg-gray-900/70 px-3 py-1 rounded-full border border-white/40 dark:border-gray-700">
                &#128179; Payment
              </span>
              {booking?.payment_amount > 0 && (
                <span className="text-lg font-bold text-teal-dark dark:text-teal-light">${booking.payment_amount}</span>
              )}
            </div>

            {/* MTN MoMo */}
            <div className="glass-card rounded-2xl overflow-hidden border border-yellow-200/50 dark:border-yellow-900/30 mb-3">
              <div className="bg-gradient-to-r from-yellow-50 to-yellow-100/50 dark:from-yellow-900/10 dark:to-yellow-900/5 px-4 py-3 border-b border-yellow-200/30 dark:border-yellow-900/20">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-yellow-400 flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-sm">MTN</div>
                  <div>
                    <h4 className="font-semibold text-black dark:text-gray-100 text-sm">MTN Mobile Money</h4>
                  </div>
                </div>
              </div>
              <div className="px-4 py-3 flex items-center gap-4">
                <div className="bg-yellow-50/50 dark:bg-yellow-900/5 rounded-xl px-4 py-3 text-center border border-dashed border-yellow-300/50 dark:border-yellow-700/30 shrink-0">
                  <p className="text-[10px] text-black/50 dark:text-gray-500 mb-0.5">Dial:</p>
                  <p className="text-lg font-bold font-mono text-black dark:text-gray-100 tracking-wider">*182*8*1*000000#</p>
                </div>
                <div className="text-xs text-black/70 dark:text-gray-300 leading-snug">
                  <p><span className="text-black/50 dark:text-gray-500">Number:</span> <span className="font-mono font-medium">{settings?.momo_number || '+250 788 000 000'}</span></p>
                  <p><span className="text-black/50 dark:text-gray-500">Name:</span> {settings?.momo_name || settings?.account_name || 'Innovetancy Design Studio'}</p>
                </div>
              </div>
            </div>

            {/* Bank Transfer */}
            <div className="glass-card rounded-2xl overflow-hidden border border-blue-200/50 dark:border-blue-900/30">
              <div className="bg-gradient-to-r from-blue-50 to-blue-100/50 dark:from-blue-900/10 dark:to-blue-900/5 px-4 py-3 border-b border-blue-200/30 dark:border-blue-900/20">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-sm">&#127974;</div>
                  <h4 className="font-semibold text-black dark:text-gray-100 text-sm">Bank Transfer</h4>
                </div>
              </div>
              <div className="px-4 py-3">
                <div className="grid grid-cols-2 gap-2">
                  {banks.map((bank) => (
                    <div key={bank.code} className="rounded-xl border border-blue-100 dark:border-gray-700 p-2.5 bg-white/50 dark:bg-gray-900/30">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-6 h-6 rounded-lg flex items-center justify-center text-white text-[9px] font-bold shrink-0 shadow-sm" style={{ backgroundColor: bank.color }}>{bank.short}</div>
                        <span className="text-xs font-medium text-black dark:text-gray-100 truncate">{bank.name}</span>
                      </div>
                      <p className="text-[10px] text-black/50 dark:text-gray-500">Account</p>
                      <p className="text-xs font-mono font-bold text-black dark:text-gray-100 tracking-wide truncate">{bank.account}</p>
                    </div>
                  ))}
                </div>
                <p className="mt-2 text-[10px] text-black/50 dark:text-gray-500 text-center">Name: {settings?.account_name || 'Innovetancy Design Studio'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Summary + Proof Upload */}
        <div className="lg:w-2/5 h-full overflow-y-auto border-t lg:border-t-0 lg:border-l border-blue-100 dark:border-gray-800 px-5 py-6 lg:py-8 bg-white/40 dark:bg-gray-950/40">
          <div className="max-w-lg mx-auto">
            {/* Summary */}
            <div className="glass-card rounded-2xl p-4 mb-4">
              <h3 className="text-sm font-semibold text-black dark:text-gray-100 mb-2">Summary</h3>
              <div className="text-xs text-black/70 dark:text-gray-300 space-y-0.5">
                <p><span className="text-black/50 dark:text-gray-500">Name:</span> {booking?.name}</p>
                <p><span className="text-black/50 dark:text-gray-500">Email:</span> {booking?.email}</p>
                <p><span className="text-black/50 dark:text-gray-500">Type:</span> {booking?.type}</p>
                {booking?.payment_amount > 0 && <p><span className="text-black/50 dark:text-gray-500">Amount:</span> <span className="font-bold text-teal-dark">${booking.payment_amount}</span></p>}
                <p><span className="text-black/50 dark:text-gray-500">Status:</span> <span className="text-sky-600 dark:text-sky-400 font-medium">Awaiting Payment</span></p>
              </div>
            </div>

            {/* Proof Upload */}
            <div className="glass-card rounded-2xl p-4">
              <h3 className="text-sm font-semibold text-black dark:text-gray-100 mb-1">Submit Proof</h3>
              <p className="text-xs text-black/50 dark:text-gray-400 mb-3">Upload receipt after paying.</p>
              <form onSubmit={handleProofSubmit} className="space-y-3">
                <div>
                  <select name="method" required className="w-full px-3 py-2 bg-white/70 dark:bg-gray-900/70 border border-blue-200 dark:border-gray-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-teal/40 cursor-pointer">
                    <option value="">Payment method</option>
                    <option value="mtn">MTN Mobile Money</option>
                    <option value="bank">Bank Transfer</option>
                  </select>
                </div>
                <div>
                  <input name="reference" required placeholder="Transaction reference" className="w-full px-3 py-2 bg-white/70 dark:bg-gray-900/70 border border-blue-200 dark:border-gray-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-teal/40" />
                </div>
                <div>
                  <input name="proof" type="file" accept="image/*,.pdf" required className="w-full text-xs text-black dark:text-gray-300 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-teal/10 file:text-teal-dark dark:file:text-teal-light hover:file:bg-teal/20 file:cursor-pointer cursor-pointer" />
                </div>
                {proofError && <p className="text-xs text-rose dark:text-purple-300 bg-rose/10 dark:bg-purple-900/20 rounded-xl px-3 py-1.5">{proofError}</p>}
                <button type="submit" disabled={uploading} className="w-full py-2.5 bg-gradient-to-r from-teal to-teal-dark text-white text-xs font-semibold rounded-xl hover:from-teal-dark hover:to-teal transition-all shadow-sm disabled:opacity-60 cursor-pointer inline-flex items-center justify-center gap-2">
                  {uploading && <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>}{uploading ? 'Uploading...' : 'Submit Payment Proof'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
