import { Link } from 'react-router-dom';

export default function BookingDone() {
  return (
    <main className="flex-1 flex items-center justify-center px-5 py-20">
      <div className="glass-card rounded-3xl p-10 sm:p-14 text-center max-w-md">
        <span className="text-5xl block mb-4">🎉</span>
        <h2 className="text-2xl sm:text-3xl font-bold text-warm-dark dark:text-gray-100">You're all set!</h2>
        <p className="text-warm-gray dark:text-gray-300 mt-3 leading-relaxed">
          Thanks for reaching out! I'll review your request and get back to
          you within 24 hours. Keep an eye on your inbox.
        </p>
        <Link
          to="/templates"
          className="inline-block mt-6 px-6 py-3 bg-gradient-to-r from-teal to-teal-dark text-white text-sm font-semibold rounded-xl hover:from-teal-dark hover:to-teal transition-all shadow-sm"
        >
          Browse More Templates
        </Link>
      </div>
    </main>
  );
}
