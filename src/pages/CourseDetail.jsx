import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import { fetchCourse, fetchLessons, enrollCourse, fetchLessonProgress, toggleLessonProgress, fetchEnrollments, addBooking } from '../data';

export default function CourseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [progress, setProgress] = useState({});
  const [enrolled, setEnrolled] = useState(false);
  const [enrollment, setEnrollment] = useState(null);
  const [userId, setUserId] = useState(null);
  const [activeLesson, setActiveLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then((result) => {
      const session = result?.data?.session;
      if (session) setUserId(session.user?.id);
    });
  }, []);

  useEffect(() => {
    fetchCourse(id).then((d) => {
      if (d) setCourse(d);
      setLoading(false);
    });
  }, [id]);

  useEffect(() => {
    if (!course) return;
    if (enrolled) {
      fetchLessons(course.id).then((l) => {
        setLessons(l);
      });
    }
  }, [course, enrolled]);

  useEffect(() => {
    if (!userId || !course) return;
    fetchEnrollments(userId).then((enrs) => {
      const match = enrs.find((e) => e.course_id === course.id);
      if (match) {
        setEnrolled(true);
        setEnrollment(match);
      }
    });
  }, [userId, course]);

  useEffect(() => {
    if (!userId || lessons.length === 0 || !enrolled) return;
    fetchLessonProgress(userId, lessons.map((l) => l.id)).then((lp) => {
      const map = {};
      lp.forEach((p) => { map[p.lesson_id] = p.completed; });
      setProgress(map);
    });
  }, [userId, lessons]);

  // Auto-resume: set active to first incomplete lesson
  useEffect(() => {
    if (lessons.length === 0) return;
    if (Object.keys(progress).length === 0) {
      setActiveLesson(lessons[0]);
      return;
    }
    const next = lessons.find((l) => !progress[l.id]);
    setActiveLesson(next || lessons[lessons.length - 1]);
  }, [lessons, progress]);

  async function handleEnroll() {
    if (!userId) return;
    if (!course.price || course.price <= 0) {
      setEnrolling(true);
      const enr = await enrollCourse(userId, course.id);
      if (enr) { setEnrolled(true); setEnrollment(enr); }
      setEnrolling(false);
    } else {
      let userEmail = '';
      try { const u = await supabase.auth.getUser(); userEmail = u?.data?.user?.email || ''; } catch {}
      const booking = await addBooking({
        user_id: userId,
        name: 'Course Enrollment',
        email: userEmail,
        phone: '',
        type: 'Online Courses',
        message: `Course enrollment: ${course.title} ($${course.price})`,
        payment_amount: course.price,
      });
      if (booking) navigate(`/payment/${booking.id}`);
    }
  }

  async function handleToggleComplete(lessonId) {
    const newVal = !progress[lessonId];
    setProgress((p) => ({ ...p, [lessonId]: newVal }));
    await toggleLessonProgress(userId, lessonId, newVal);
  }

  if (loading) return <main className="flex-1 flex items-center justify-center py-20"><p className="text-black/70 dark:text-gray-300 text-lg">Loading...</p></main>;
  if (!course) return <main className="flex-1 flex items-center justify-center py-20"><p className="text-rose dark:text-purple-300 text-lg">Course not found.</p></main>;

  const completedCount = lessons.filter((l) => progress[l.id]).length;
  const progressPercent = lessons.length > 0 ? Math.round((completedCount / lessons.length) * 100) : 0;

  return (
    <main className="flex-1">
      <div className="max-w-5xl mx-auto px-5 py-16">
        {/* Course video (only visible after enrollment) */}
        {enrolled && course.video_url && (
          <div className="aspect-video rounded-3xl overflow-hidden mb-8 shadow-lg bg-black/10 dark:bg-black/30 flex items-center justify-center">
            {course.video_url.startsWith('data:') || course.video_url.startsWith('blob:') ? (
              <video src={course.video_url} controls className="w-full h-full object-contain" />
            ) : (
              <iframe src={course.video_url} title={course.title} className="w-full h-full" allowFullScreen />
            )}
          </div>
        )}

        {/* Header */}
        {!course.video_url && course.image && enrolled && (
          <img src={course.image} alt={course.title} className="w-full h-56 sm:h-72 object-cover rounded-3xl mb-8" />
        )}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-black dark:text-gray-100">{course.title}</h1>
            <p className="text-black/70 dark:text-gray-300 mt-2 max-w-xl">{course.description}</p>
            <div className="flex items-center gap-3 mt-3">
              <span className="text-xs font-medium text-teal-dark dark:text-teal-light bg-teal/15 dark:bg-teal-dark/20 px-3 py-1 rounded-full">{course.category}</span>
              {course.price > 0 && <span className="text-sm font-bold text-black dark:text-gray-100">${course.price}</span>}
              {enrolled && (
                <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30 px-3 py-1 rounded-full flex items-center gap-1">Enrolled</span>
              )}
            </div>
            {enrolled && course.pdf_url && (
              <a
                href={course.pdf_url}
                download={`${course.title.replace(/\s+/g, '_')}.pdf`}
                className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 bg-gradient-to-r from-teal to-teal-dark text-white text-sm font-semibold rounded-xl hover:from-teal-dark hover:to-teal transition-all shadow-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                Download Course PDF (Offline)
              </a>
            )}
          </div>
          <div className="flex items-center gap-3">
            {enrolled ? (
              <Link to="/my-courses" className="px-5 py-2.5 bg-gradient-to-r from-teal to-teal-dark text-white text-sm font-semibold rounded-xl hover:from-teal-dark hover:to-teal transition-all shadow-sm cursor-pointer">My Courses</Link>
            ) : (
              <button onClick={handleEnroll} disabled={enrolling || !userId} className="px-5 py-2.5 bg-gradient-to-r from-teal to-teal-dark text-white text-sm font-semibold rounded-xl hover:from-teal-dark hover:to-teal transition-all shadow-sm disabled:opacity-60 cursor-pointer inline-flex items-center gap-2">
                {enrolling && <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>}{enrolling ? 'Enrolling...' : 'Enroll Now'}
              </button>
            )}
            {!userId && <p className="text-xs text-sky-600 dark:text-sky-400">Sign in to enroll</p>}
          </div>
        </div>

        {enrolled && lessons.length > 0 && (
          <div className="glass-card rounded-2xl p-4 mb-8">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-medium text-black dark:text-gray-100">Your Progress</span>
                  <span className="text-xs font-bold text-teal-dark dark:text-teal-light">{completedCount}/{lessons.length} ({progressPercent}%)</span>
                </div>
                <div className="w-full h-2 bg-blue-100 dark:bg-gray-800 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-teal to-teal-dark rounded-full transition-all duration-500" style={{ width: `${progressPercent}%` }} />
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <button onClick={() => {
                  const next = lessons.find((l) => !progress[l.id]);
                  if (next) setActiveLesson(next);
                }} className="px-4 py-1.5 bg-gradient-to-r from-teal to-teal-dark text-white text-xs font-semibold rounded-lg hover:from-teal-dark hover:to-teal transition-all shadow-sm cursor-pointer">
                  {progressPercent === 100 ? 'Completed' : 'Continue \u2192'}
                </button>
              </div>
            </div>
          </div>
        )}

        {enrolled ? (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Lesson sidebar */}
          <div className="lg:col-span-1">
            <div className="glass-card rounded-2xl p-4">
              <h3 className="text-sm font-bold text-black dark:text-gray-100 mb-3">Lessons</h3>
              {lessons.length === 0 ? (
                <p className="text-sm text-black/60 dark:text-gray-500">No lessons yet.</p>
              ) : (
                <div className="space-y-1">
                  {lessons.map((lesson, i) => {
                    const isActive = activeLesson?.id === lesson.id;
                    return (
                      <button
                        key={lesson.id}
                        onClick={() => setActiveLesson(lesson)}
                        className={`w-full text-left px-3 py-2 rounded-xl text-sm transition-colors cursor-pointer flex items-center gap-2 ${
                          isActive
                            ? 'bg-teal/10 dark:bg-teal/20 text-teal-dark dark:text-teal-light font-medium'
                            : progress[lesson.id]
                            ? 'text-black/60 dark:text-gray-400'
                            : 'text-black/70 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-800'
                        }`}
                      >
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                          progress[lesson.id]
                            ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                            : isActive
                            ? 'bg-teal text-white'
                            : 'bg-blue-100 dark:bg-gray-700 text-black/70 dark:text-gray-300'
                        }`}>
                          {progress[lesson.id] ? '\u2713' : i + 1}
                        </span>
                        <span className="truncate">{lesson.title}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Active lesson content */}
          <div className="lg:col-span-2">
            {activeLesson ? (
              <div className="glass-card rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-black dark:text-gray-100">{activeLesson.title}</h3>
                  {enrolled && (
                    <button
                      onClick={() => handleToggleComplete(activeLesson.id)}
                      className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                        progress[activeLesson.id]
                          ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                          : 'bg-blue-50 dark:bg-gray-800 text-black/70/70 dark:text-gray-400 hover:bg-blue-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      {progress[activeLesson.id] ? '\u2713 Completed' : 'Mark Complete'}
                    </button>
                  )}
                </div>

                {activeLesson.content_type === 'video' && activeLesson.video_url ? (
                  <div className="aspect-video rounded-xl overflow-hidden mb-4">
                    <iframe src={activeLesson.video_url} title={activeLesson.title} className="w-full h-full" allowFullScreen />
                  </div>
                ) : null}

                {activeLesson.content_type === 'notes' && (
                  <div className="bg-sky-50 dark:bg-sky-900/10 border border-sky-200/50 dark:border-sky-900/30 rounded-xl p-4 mb-4 flex items-center gap-2">
                    <span className="text-lg">Notes</span>
                    <span className="text-sm text-sky-700 dark:text-sky-400">reference material</span>
                  </div>
                )}

                {activeLesson.content && (
                  <div className="prose prose-sm max-w-none text-black/70 dark:text-gray-300 [&_h1]:text-black [&_h2]:text-black [&_h3]:text-black dark:[&_h1]:text-gray-100 dark:[&_h2]:text-gray-100 dark:[&_h3]:text-gray-100 [&_strong]:text-black dark:[&_strong]:text-gray-100 [&_li]:text-black/70 dark:[&_li]:text-gray-300" dangerouslySetInnerHTML={{ __html: activeLesson.content }} />
                )}
              </div>
            ) : (
              <div className="glass-card rounded-2xl p-6 text-center">
                <p className="text-black/60 dark:text-gray-500">Select a lesson to begin.</p>
              </div>
            )}
          </div>
        </div>
        ) : (
          <div className="glass-card rounded-2xl p-8 text-center">
            <div className="text-5xl mb-4">{'\uD83D\uDD12'}</div>
            <h3 className="text-xl font-bold text-black dark:text-gray-100 mb-2">Course Locked</h3>
            <p className="text-black/60 dark:text-gray-400 max-w-md mx-auto mb-6">Enroll in this course to access all lessons, track your progress, and learn at your own pace.</p>
            {userId ? (
              <button onClick={handleEnroll} disabled={enrolling} className="px-6 py-3 bg-gradient-to-r from-teal to-teal-dark text-white text-sm font-semibold rounded-xl hover:from-teal-dark hover:to-teal transition-all shadow-sm disabled:opacity-60 cursor-pointer inline-flex items-center gap-2">
                {enrolling && <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>}{enrolling ? 'Enrolling...' : course.price > 0 ? `Enroll Now - $${course.price}` : 'Enroll Now - Free'}
              </button>
            ) : (
              <Link to="/auth?mode=signin" className="inline-block px-6 py-3 bg-gradient-to-r from-teal to-teal-dark text-white text-sm font-semibold rounded-xl hover:from-teal-dark hover:to-teal transition-all shadow-sm">Sign in to Enroll</Link>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
