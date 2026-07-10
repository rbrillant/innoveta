import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabase';
import { fetchEnrollments, fetchLessons, fetchLessonProgress } from '../data';

export default function MyCourses() {
  const [enrollments, setEnrollments] = useState([]);
  const [progressData, setProgressData] = useState({});
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then((result) => { const session = result?.data?.session;
      if (session) setUserId(session.user.id);
    });
  }, []);

  useEffect(() => {
    if (!userId) { setLoading(false); return; }
    fetchEnrollments(userId).then(async (enrs) => {
      setEnrollments(enrs);
      const pd = {};
      for (const enr of enrs) {
        const lessons = await fetchLessons(enr.course_id);
        const lp = await fetchLessonProgress(userId, lessons.map((l) => l.id));
        const completed = lp.filter((p) => p.completed).length;
        pd[enr.course_id] = { total: lessons.length, completed, percent: lessons.length > 0 ? Math.round((completed / lessons.length) * 100) : 0 };
      }
      setProgressData(pd);
      setLoading(false);
    });
  }, [userId]);

  return (
    <main className="flex-1">
      <div className="max-w-4xl mx-auto px-5 py-16">
        <div className="text-center mb-10">
          <span className="inline-block text-xs font-medium text-teal-dark dark:text-teal-light bg-white/70 dark:bg-gray-900/70 backdrop-blur-md px-4 py-1.5 rounded-full mb-3 shadow-sm border border-white/40 dark:border-gray-700">
            📚 My Learning
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-warm-dark dark:text-gray-100">My Courses</h2>
          <p className="text-black dark:text-gray-300 mt-2 max-w-lg mx-auto">Pick up where you left off.</p>
        </div>

        {loading ? (
          <div className="text-center py-16"><p className="text-black/60 dark:text-gray-500">Loading...</p></div>
        ) : !userId ? (
          <div className="text-center py-16">
            <p className="text-black/70 dark:text-gray-300 mb-4">Sign in to see your enrolled courses.</p>
            <Link to="/auth" className="inline-block px-6 py-3 bg-gradient-to-r from-teal to-teal-dark text-white text-sm font-semibold rounded-xl hover:from-teal-dark hover:to-teal transition-all shadow-sm cursor-pointer">Sign In</Link>
          </div>
        ) : enrollments.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-black/70 dark:text-gray-300 mb-4">You haven't enrolled in any courses yet.</p>
            <Link to="/online-courses" className="inline-block px-6 py-3 bg-gradient-to-r from-teal to-teal-dark text-white text-sm font-semibold rounded-xl hover:from-teal-dark hover:to-teal transition-all shadow-sm cursor-pointer">Browse Courses</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {enrollments.map((enr) => {
              const pd = progressData[enr.course_id] || { total: 0, completed: 0, percent: 0 };
              return (
                <div className="glass-card rounded-2xl p-5 hover:shadow-md transition-shadow">
                  <Link to={`/course/${enr.course_id}`} className="flex items-center gap-4">
                    {enr.courses?.image && (
                      <img src={enr.courses.image} alt="" className="w-16 h-16 rounded-xl object-cover shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-black dark:text-gray-100">{enr.courses?.title || 'Unknown Course'}</h3>
                      <p className="text-xs text-black/60 dark:text-gray-500">Enrolled {new Date(enr.enrolled_at).toLocaleDateString()}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex-1 h-2 bg-blue-100 dark:bg-gray-800 rounded-full overflow-hidden max-w-xs">
                          <div className="h-full bg-gradient-to-r from-teal to-teal-dark rounded-full transition-all" style={{ width: `${pd.percent}%` }} />
                        </div>
                        <span className="text-xs font-medium text-teal-dark dark:text-teal-light">{pd.completed}/{pd.total}</span>
                      </div>
                    </div>
                    <span className="text-teal-dark dark:text-teal-light text-sm">→</span>
                  </Link>
                  {enr.courses?.pdf_url && (
                    <div className="border-t border-blue-100 dark:border-gray-800 mt-3 pt-3">
                      <a
                        href={enr.courses.pdf_url}
                        download={`${(enr.courses?.title || 'course').replace(/\s+/g, '_')}.pdf`}
                        className="inline-flex items-center gap-2 text-xs font-medium text-teal-dark dark:text-teal-light hover:underline"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                        Download PDF (Offline)
                      </a>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
