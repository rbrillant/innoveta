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
    <main className="flex-1">
      <div className="max-w-4xl mx-auto px-5 py-16">
        <div className="text-center mb-10">
          <span className="inline-block text-xs font-medium text-teal-dark dark:text-teal-light bg-white/70 dark:bg-gray-900/70 backdrop-blur-md px-4 py-1.5 rounded-full mb-3 shadow-sm border border-white/40 dark:border-gray-700">
            &#128179; Complete Your Payment
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-black dark:text-gray-100">Payment Required</h2>
          <p className="text-black/70 dark:text-gray-300 mt-2 max-w-lg mx-auto">
            {booking?.type === 'Domain' ? `Pay to register your domain` : 'Submit payment to confirm your booking.'}
          </p>
        </div>

        {/* Booking Summary */}
        <div className="glass-card rounded-2xl p-5 mb-8">
          <h3 className="font-semibold text-black dark:text-gray-100 mb-3">Booking Summary</h3>
          <div className="text-sm text-black/70 dark:text-gray-300 space-y-1">
            <p><span className="text-black/60 dark:text-gray-500">Name:</span> {booking?.name}</p>
            <p><span className="text-black/60 dark:text-gray-500">Email:</span> {booking?.email}</p>
            <p><span className="text-black/60 dark:text-gray-500">Type:</span> {booking?.type}</p>
            {booking?.payment_amount > 0 && <p><span className="text-black/60 dark:text-gray-500">Amount:</span> <span className="text-lg font-bold text-teal-dark dark:text-teal-light">${booking.payment_amount}</span></p>}
            {booking?.message && <p className="whitespace-pre-wrap"><span className="text-black/60 dark:text-gray-500">Details:</span> {booking.message}</p>}
            <p><span className="text-black/60 dark:text-gray-500">Status:</span> <span className="text-sky-600 dark:text-sky-400 font-medium">Awaiting Payment</span></p>
          </div>
        </div>

        {/* Payment Methods */}
        <h3 className="text-lg font-bold text-black dark:text-gray-100 mb-4">Choose a payment method</h3>

        <div className="grid gap-4 mb-8">
          {/* Mobile Money */}
          <div className="glass-card rounded-2xl overflow-hidden border border-yellow-200/50 dark:border-yellow-900/30">
            <div className="bg-gradient-to-r from-yellow-50 to-yellow-100/50 dark:from-yellow-900/10 dark:to-yellow-900/5 px-5 py-4 border-b border-yellow-200/30 dark:border-yellow-900/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-yellow-400 flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-sm">MTN</div>
                <div>
                  <h4 className="font-semibold text-black dark:text-gray-100 text-sm">MTN Mobile Money</h4>
                  <p className="text-xs text-black/60 dark:text-gray-400">Pay with MTN MoMo</p>
                </div>
              </div>
            </div>
            <div className="px-5 py-4 space-y-3">
              <div className="bg-yellow-50/50 dark:bg-yellow-900/5 rounded-xl p-4 text-center border border-dashed border-yellow-300/50 dark:border-yellow-700/30">
                <p className="text-xs text-black/60 dark:text-gray-500 mb-1.5">Dial this code to pay:</p>
                <p className="text-xl sm:text-2xl font-bold font-mono text-black dark:text-gray-100 tracking-wider">*182*8*1*000000#</p>
              </div>
              <div className="text-sm text-black/70 dark:text-gray-300 space-y-1">
                <p><span className="text-black/60 dark:text-gray-500">Number:</span> <span className="font-mono font-bold text-black dark:text-gray-100">{settings?.momo_number || '+250 788 000 000'}</span></p>
                <p><span className="text-black/60 dark:text-gray-500">Name:</span> {settings?.momo_name || settings?.account_name || 'Innovetancy Design Studio'}</p>
              </div>
            </div>
          </div>

          {/* Bank Transfer */}
          <div className="glass-card rounded-2xl overflow-hidden border border-blue-200/50 dark:border-blue-900/30">
            <div className="bg-gradient-to-r from-blue-50 to-blue-100/50 dark:from-blue-900/10 dark:to-blue-900/5 px-5 py-4 border-b border-blue-200/30 dark:border-blue-900/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-sm">&#127974;</div>
                <div>
                  <h4 className="font-semibold text-black dark:text-gray-100 text-sm">Bank Transfer</h4>
                  <p className="text-xs text-black/60 dark:text-gray-400">Transfer to any of our accounts</p>
                </div>
              </div>
            </div>
            <div className="px-5 py-4">
              <div className="grid sm:grid-cols-2 gap-3">
                {banks.map((bank) => (
                  <div key={bank.code} className="rounded-xl border border-blue-100 dark:border-gray-700 p-3.5 bg-white/50 dark:bg-gray-900/30 hover:border-blue-200 dark:hover:border-gray-600 transition-colors">
                    <div className="flex items-center gap-2.5 mb-2">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-[10px] font-bold shrink-0 shadow-sm"
                        style={{ backgroundColor: bank.color }}
                      >
                        {bank.short}
                      </div>
                      <span className="text-sm font-medium text-black dark:text-gray-100">{bank.name}</span>
                    </div>
                    <p className="text-xs text-black/50 dark:text-gray-500 mb-0.5">Account Number</p>
                    <p className="text-sm font-mono font-bold text-black dark:text-gray-100 tracking-wide">{bank.account}</p>
                  </div>
                ))}
              </div>
              <div className="mt-3 text-xs text-black/50 dark:text-gray-500 text-center">
                Account Name: <span className="font-medium text-black/70 dark:text-gray-400">{settings?.account_name || 'Innovetancy Design Studio'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Proof Upload */}
        <div className="glass-card rounded-2xl p-6">
          <h3 className="font-semibold text-black dark:text-gray-100 mb-1">Submit Payment Proof</h3>
          <p className="text-sm text-black/60 dark:text-gray-400 mb-5">Upload a screenshot or receipt after you've made the payment.</p>
          <form onSubmit={handleProofSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-black dark:text-gray-300 mb-1">Payment Method</label>
              <select name="method" required className="w-full px-3.5 py-2.5 bg-white/70 dark:bg-gray-900/70 border border-blue-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal/40 cursor-pointer">
                <option value="">Select method</option>
                <option value="mtn">MTN Mobile Money</option>
                <option value="bank">Bank Transfer</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-black dark:text-gray-300 mb-1">Transaction Reference</label>
              <input name="reference" required placeholder="e.g. MTN transaction ID or bank ref" className="w-full px-3.5 py-2.5 bg-white/70 dark:bg-gray-900/70 border border-blue-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal/40" />
            </div>
            <div>
              <label className="block text-sm font-medium text-black dark:text-gray-300 mb-1">Upload Receipt / Screenshot</label>
              <input name="proof" type="file" accept="image/*,.pdf" required className="w-full text-sm text-black dark:text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-teal/10 file:text-teal-dark dark:file:text-teal-light hover:file:bg-teal/20 file:cursor-pointer cursor-pointer" />
              <p className="text-xs text-black/60 dark:text-gray-500 mt-1">Max 5MB. JPG, PNG, or PDF.</p>
            </div>
            {proofError && <p className="text-sm text-rose dark:text-purple-300 bg-rose/10 dark:bg-purple-900/20 rounded-xl px-4 py-2">{proofError}</p>}
            <button type="submit" disabled={uploading} className="w-full px-6 py-3 bg-gradient-to-r from-teal to-teal-dark text-white text-sm font-semibold rounded-xl hover:from-teal-dark hover:to-teal transition-all shadow-sm disabled:opacity-60 cursor-pointer inline-flex items-center justify-center gap-2">
              {uploading && <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>}{uploading ? 'Uploading...' : 'Submit Payment Proof'}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
