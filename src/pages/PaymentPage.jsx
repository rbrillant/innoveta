import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import { getBooking, uploadPaymentProof } from '../data';

const BANK_DETAILS = {
  bank: 'Bank of Kigali',
  accountName: 'Innoveta Design Studio',
  accountNumber: '0001-2345678-01',
  currency: 'RWF',
};

const MOMO_DETAILS = {
  network: 'MTN Rwanda',
  number: '+250 788 000 000',
  name: 'Innoveta Design Studio',
};

export default function PaymentPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userId, setUserId] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [proofError, setProofError] = useState('');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setUserId(session.user.id);
    });
  }, []);

  useEffect(() => {
    getBooking(id).then((d) => {
      if (!d) setError('Booking not found.');
      else if (d.payment_status === 'verified') setSuccess(true);
      else setBooking(d);
      setLoading(false);
    }).catch(() => { setError('Failed to load booking.'); setLoading(false); });
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

  if (loading) return <main className="flex-1 flex items-center justify-center py-20"><p className="text-blue-600/70 dark:text-gray-300 text-lg">Loading...</p></main>;
  if (error) return <main className="flex-1 flex items-center justify-center py-20"><p className="text-rose dark:text-purple-300 text-lg">{error}</p></main>;

  if (success) {
    return (
      <main className="flex-1">
        <div className="max-w-2xl mx-auto px-5 py-20 text-center">
          <div className="text-6xl mb-6">✅</div>
          <h1 className="text-3xl font-bold text-blue-900 dark:text-gray-100 mb-3">Payment Proof Submitted</h1>
          <p className="text-blue-600/70 dark:text-gray-300 mb-8">We'll review your payment and get back to you within 24 hours. You'll receive a confirmation email once verified.</p>
          <Link to="/home" className="inline-block px-6 py-3 bg-gradient-to-r from-teal to-teal-dark text-white text-sm font-semibold rounded-xl hover:from-teal-dark hover:to-teal transition-all shadow-sm cursor-pointer">Back to Home</Link>
        </div>
      </main>
    );
  }

  const isDomain = booking?.type === 'Domain';

  return (
    <main className="flex-1">
      <div className="max-w-3xl mx-auto px-5 py-16">
        <div className="text-center mb-10">
          <span className="inline-block text-xs font-medium text-teal-dark dark:text-teal-light bg-white/70 dark:bg-gray-900/70 backdrop-blur-md px-4 py-1.5 rounded-full mb-3 shadow-sm border border-white/40 dark:border-gray-700">
            💳 Complete Your Payment
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-warm-dark dark:text-gray-100">Payment Required</h2>
          <p className="text-warm-gray dark:text-gray-300 mt-2 max-w-lg mx-auto">
            {isDomain ? `Pay to register ${booking.message?.split('\n')[0]?.replace('Domain booking: ', '') || 'your domain'}` : 'Submit payment to confirm your booking.'}
          </p>
        </div>

        {/* Booking Summary */}
        <div className="glass-card rounded-2xl p-5 mb-6">
          <h3 className="font-semibold text-blue-900 dark:text-gray-100 mb-3">Booking Summary</h3>
          <div className="text-sm text-blue-600/70 dark:text-gray-300 space-y-1">
            <p><span className="text-blue-400 dark:text-gray-500">Name:</span> {booking.name}</p>
            <p><span className="text-blue-400 dark:text-gray-500">Email:</span> {booking.email}</p>
            <p><span className="text-blue-400 dark:text-gray-500">Type:</span> {booking.type}</p>
            {booking.message && <p className="whitespace-pre-wrap"><span className="text-blue-400 dark:text-gray-500">Details:</span> {booking.message}</p>}
            <p><span className="text-blue-400 dark:text-gray-500">Status:</span> <span className="text-amber-600 dark:text-amber-400 font-medium">Awaiting Payment</span></p>
          </div>
        </div>

        {/* Payment Instructions */}
        <div className="grid sm:grid-cols-2 gap-4 mb-6">
          <div className="glass-card rounded-2xl p-5">
            <h3 className="font-semibold text-blue-900 dark:text-gray-100 mb-3 flex items-center gap-2">🏦 Bank Transfer</h3>
            <div className="text-sm text-blue-600/70 dark:text-gray-300 space-y-1.5">
              <p><span className="text-blue-400 dark:text-gray-500">Bank:</span> {BANK_DETAILS.bank}</p>
              <p><span className="text-blue-400 dark:text-gray-500">Account Name:</span> {BANK_DETAILS.accountName}</p>
              <p><span className="text-blue-400 dark:text-gray-500">Account No:</span> <span className="font-mono font-bold text-blue-900 dark:text-gray-100">{BANK_DETAILS.accountNumber}</span></p>
              <p><span className="text-blue-400 dark:text-gray-500">Currency:</span> {BANK_DETAILS.currency}</p>
            </div>
          </div>
          <div className="glass-card rounded-2xl p-5">
            <h3 className="font-semibold text-blue-900 dark:text-gray-100 mb-3 flex items-center gap-2">📱 Mobile Money</h3>
            <div className="text-sm text-blue-600/70 dark:text-gray-300 space-y-1.5">
              <p><span className="text-blue-400 dark:text-gray-500">Network:</span> {MOMO_DETAILS.network}</p>
              <p><span className="text-blue-400 dark:text-gray-500">Number:</span> <span className="font-mono font-bold text-blue-900 dark:text-gray-100">{MOMO_DETAILS.number}</span></p>
              <p><span className="text-blue-400 dark:text-gray-500">Name:</span> {MOMO_DETAILS.name}</p>
            </div>
          </div>
        </div>

        {/* Proof Upload */}
        <div className="glass-card rounded-2xl p-6">
          <h3 className="font-semibold text-blue-900 dark:text-gray-100 mb-1">Submit Payment Proof</h3>
          <p className="text-sm text-blue-500/60 dark:text-gray-400 mb-5">Upload a screenshot or receipt after you've made the payment.</p>
          <form onSubmit={handleProofSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-warm-gray dark:text-gray-300 mb-1">Payment Method</label>
              <select name="method" required className="w-full px-3.5 py-2.5 bg-white/70 dark:bg-gray-900/70 border border-glass-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal/40 focus:border-teal backdrop-blur-sm cursor-pointer">
                <option value="">Select method</option>
                <option value="bank">Bank Transfer</option>
                <option value="momо">Mobile Money</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-warm-gray dark:text-gray-300 mb-1">Transaction Reference</label>
              <input name="reference" required placeholder="e.g. MTN transaction ID or bank ref" className="w-full px-3.5 py-2.5 bg-white/70 dark:bg-gray-900/70 border border-glass-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal/40 focus:border-teal backdrop-blur-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-warm-gray dark:text-gray-300 mb-1">Upload Receipt / Screenshot</label>
              <input name="proof" type="file" accept="image/*,.pdf" required className="w-full text-sm text-warm-gray dark:text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-teal/10 file:text-teal-dark dark:file:text-teal-light hover:file:bg-teal/20 file:cursor-pointer cursor-pointer" />
              <p className="text-xs text-blue-400/60 dark:text-gray-500 mt-1">Max 5MB. JPG, PNG, or PDF.</p>
            </div>
            {proofError && <p className="text-sm text-rose dark:text-purple-300 bg-rose/10 dark:bg-purple-900/20 rounded-xl px-4 py-2">{proofError}</p>}
            <button type="submit" disabled={uploading} className="w-full px-6 py-3 bg-gradient-to-r from-teal to-teal-dark text-white text-sm font-semibold rounded-xl hover:from-teal-dark hover:to-teal transition-all shadow-sm disabled:opacity-60 cursor-pointer">
              {uploading ? 'Uploading...' : 'Submit Payment Proof'}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
