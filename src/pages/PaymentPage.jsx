import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import { getBooking, uploadPaymentProof, fetchPaymentSettings } from '../data';

export default function PaymentPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [method, setMethod] = useState('bank');
  const [file, setFile] = useState(null);
  const [reference, setReference] = useState('');
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    Promise.all([
      getBooking(id),
      fetchPaymentSettings(),
    ]).then(([b, s]) => {
      if (b) setBooking(b);
      if (s) setSettings(s);
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
  if (error) return <main className="flex-1 flex items-center justify-center py-20"><p className="text-rose dark:text-purple-300 text-lg">{error}</p></main>;

  if (success) {
    return (
      <main className="flex-1">
        <div className="max-w-2xl mx-auto px-5 py-20 text-center">
          <div className="text-6xl mb-6">✅</div>
          <h1 className="text-3xl font-bold text-black dark:text-gray-100 mb-3">Payment Proof Submitted</h1>
          <p className="text-black/70 dark:text-gray-300 mb-8">We'll review your payment and get back to you within 24 hours. You'll receive a confirmation email once verified.</p>
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
          <p className="text-black dark:text-gray-300 mt-2 max-w-lg mx-auto">
            {isDomain ? `Pay to register ${booking.message?.split('\n')[0]?.replace('Domain booking: ', '') || 'your domain'}` : 'Submit payment to confirm your booking.'}
          </p>
        </div>

        {/* Booking Summary */}
        <div className="glass-card rounded-2xl p-5 mb-6">
          <h3 className="font-semibold text-black dark:text-gray-100 mb-3">Booking Summary</h3>
          <div className="text-sm text-black/70 dark:text-gray-300 space-y-1">
            <p><span className="text-black/60 dark:text-gray-500">Name:</span> {booking.name}</p>
            <p><span className="text-black/60 dark:text-gray-500">Email:</span> {booking.email}</p>
            <p><span className="text-black/60 dark:text-gray-500">Type:</span> {booking.type}</p>
            {booking.message && <p className="whitespace-pre-wrap"><span className="text-black/60 dark:text-gray-500">Details:</span> {booking.message}</p>}
            <p><span className="text-black/60 dark:text-gray-500">Status:</span> <span className="text-sky-600 dark:text-sky-400 font-medium">Awaiting Payment</span></p>
          </div>
        </div>

        {/* Payment Instructions */}
        <div className="grid sm:grid-cols-2 gap-4 mb-6">
          <div className="glass-card rounded-2xl p-5">
            <h3 className="font-semibold text-black dark:text-gray-100 mb-3 flex items-center gap-2">🏦 Bank Transfer</h3>
            <div className="bg-white/50 dark:bg-gray-900/50 rounded-xl p-4 text-sm space-y-1.5">
              <p><span className="text-black/60 dark:text-gray-500">Bank:</span> {settings?.bank_name || 'Bank of Kigali'}</p>
              <p><span className="text-black/60 dark:text-gray-500">Account Name:</span> {settings?.account_name || 'Innovetancy Design Studio'}</p>
              <p><span className="text-black/60 dark:text-gray-500">Account No:</span> <span className="font-mono font-bold text-black dark:text-gray-100">{settings?.account_number || '0001-2345678-01'}</span></p>
            </div>
          </div>
          <div className="glass-card rounded-2xl p-5">
            <h3 className="font-semibold text-black dark:text-gray-100 mb-3 flex items-center gap-2">📱 Mobile Money</h3>
            <div className="text-sm text-black/70 dark:text-gray-300 space-y-1.5">
              <p><span className="text-black/60 dark:text-gray-500">Network:</span> {settings?.momo_network || 'MTN Rwanda'}</p>
              <p><span className="text-black/60 dark:text-gray-500">Number:</span> <span className="font-mono font-bold text-black dark:text-gray-100">{settings?.momo_number || '+250 788 000 000'}</span></p>
              <p><span className="text-black/60 dark:text-gray-500">Name:</span> {settings?.momo_name || 'Innovetancy Design Studio'}</p>
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
              <select name="method" required className="w-full px-3.5 py-2.5 bg-white/70 dark:bg-gray-900/70 border border-glass-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal/40 focus:border-teal backdrop-blur-sm cursor-pointer">
                <option value="">Select method</option>
                <option value="bank">Bank Transfer</option>
                <option value="momо">Mobile Money</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-black dark:text-gray-300 mb-1">Transaction Reference</label>
              <input name="reference" required placeholder="e.g. MTN transaction ID or bank ref" className="w-full px-3.5 py-2.5 bg-white/70 dark:bg-gray-900/70 border border-glass-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal/40 focus:border-teal backdrop-blur-sm" />
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
