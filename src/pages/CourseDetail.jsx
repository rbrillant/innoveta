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
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setUserId(session.user.id);
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
    fetchLessons(course.id).then((l) => {
      setLessons(l);
      if (l.length > 0) setActiveLesson(l[0]);
    });
  }, [course]);

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
    if (!userId || lessons.length === 0) return;
    fetchLessonProgress(userId, lessons.map((l) => l.id)).then((lp) => {
      const map = {};
      lp.forEach((p) => { map[p.lesson_id] = p.completed; });
      setProgress(map);
    });
  }, [userId, lessons]);

  async function handleEnroll() {
    if (!userId) return;
    if (!course.price || course.price <= 0) {
      setEnrolling(true);
      const enr = await enrollCourse(userId, course.id);
      if (enr) { setEnrolled(true); setEnrollment(enr); }
      setEnrolling(false);
    } else {
      const booking = await addBooking({
        user_id: userId,
        name: 'Course Enrollment',
        email: (await supabase.auth.getUser()).data.user?.email || '',
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

  if (loading) return <main className="flex-1 flex items-center justify-center py-20"><p className="text-blue-600/70 dark:text-gray-300 text-lg">Loading...</p></main>;
  if (!course) return <main className="flex-1 flex items-center justify-center py-20"><p className="text-rose dark:text-purple-300 text-lg">Course not found.</p></main>;

  const completedCount = lessons.filter((l) => progress[l.id]).length;
  const progressPercent = lessons.length > 0 ? Math.round((completedCount / lessons.length) * 100) : 0;

  return (
    <main className="flex-1">
      <div className="max-w-5xl mx-auto px-5 py-16">
        {/* Header */}
        {course.image && (
          <img src={course.image} alt={course.title} className="w-full h-56 sm:h-72 object-cover rounded-3xl mb-8" />
        )}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-blue-900 dark:text-gray-100">{course.title}</h1>
            <p className="text-blue-600/70 dark:text-gray-300 mt-2 max-w-xl">{course.description}</p>
            <div className="flex items-center gap-3 mt-3">
              <span className="text-xs font-medium text-teal-dark dark:text-teal-light bg-teal/15 dark:bg-amber-900/20 px-3 py-1 rounded-full">{course.category}</span>
              {course.price > 0 && <span className="text-sm font-bold text-blue-900 dark:text-gray-100">${course.price}</span>}
              {enrolled && (
                <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30 px-3 py-1 rounded-full flex items-center gap-1">✓ Enrolled</span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            {enrolled ? (
              <Link to="/my-courses" className="px-5 py-2.5 bg-gradient-to-r from-teal to-teal-dark text-white text-sm font-semibold rounded-xl hover:from-teal-dark hover:to-teal transition-all shadow-sm cursor-pointer">My Courses →</Link>
            ) : (
              <button onClick={handleEnroll} disabled={enrolling || !userId} className="px-5 py-2.5 bg-gradient-to-r from-teal to-teal-dark text-white text-sm font-semibold rounded-xl hover:from-teal-dark hover:to-teal transition-all shadow-sm disabled:opacity-60 cursor-pointer">
                {enrolling ? 'Enrolling...' : 'Enroll Now'}
              </button>
            )}
            {!userId && <p className="text-xs text-amber-600 dark:text-amber-400">Sign in to enroll</p>}
          </div>
        </div>

        {/* Progress bar for enrolled */}
        {enrolled && lessons.length > 0 && (
          <div className="glass-card rounded-2xl p-5 mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-blue-900 dark:text-gray-100">Progress</span>
              <span className="text-sm font-bold text-teal-dark dark:text-teal-light">{completedCount}/{lessons.length} lessons ({progressPercent}%)</span>
            </div>
            <div className="w-full h-2.5 bg-blue-100 dark:bg-gray-800 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-teal to-teal-dark rounded-full transition-all duration-500" style={{ width: `${progressPercent}%` }} />
            </div>
          </div>
        )}

        {/* Two-column: lesson list + active lesson content */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Lesson sidebar */}
          <div className="glass-card rounded-2xl p-4 lg:col-span-1">
            <h3 className="text-sm font-bold text-blue-900 dark:text-gray-100 mb-3">Lessons</h3>
            {lessons.length === 0 ? (
              <p className="text-sm text-blue-400/60 dark:text-gray-500">No lessons yet.</p>
            ) : (
              <div className="space-y-1">
                {lessons.map((lesson, i) => (
                  <button
                    key={lesson.id}
                    onClick={() => setActiveLesson(lesson)}
                    className={`w-full text-left px-3 py-2.5 rounded-xl text-sm transition-colors cursor-pointer flex items-center gap-2 ${
                      activeLesson?.id === lesson.id
                        ? 'bg-teal/10 dark:bg-teal/20 text-teal-dark dark:text-teal-light font-medium'
                        : 'text-blue-600/70 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-800'
                    }`}
                  >
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                      progress[lesson.id]
                        ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                        : 'bg-blue-100 dark:bg-gray-700 text-blue-500 dark:text-gray-300'
                    }`}>
                      {progress[lesson.id] ? '✓' : i + 1}
                    </span>
                    <span className="truncate flex-1">{lesson.title}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded shrink-0 ${
                      lesson.content_type === 'video'
                        ? 'text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/30'
                        : lesson.content_type === 'notes'
                        ? 'text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30'
                        : 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-gray-700'
                    }`}>{lesson.content_type}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Active lesson content */}
          <div className="lg:col-span-2">
            {activeLesson ? (
              <div className="glass-card rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-blue-900 dark:text-gray-100">{activeLesson.title}</h3>
                  {enrolled && (
                    <button
                      onClick={() => handleToggleComplete(activeLesson.id)}
                      className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                        progress[activeLesson.id]
                          ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                          : 'bg-blue-50 dark:bg-gray-800 text-blue-500/70 dark:text-gray-400 hover:bg-blue-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      {progress[activeLesson.id] ? '✓ Completed' : 'Mark Complete'}
                    </button>
                  )}
                </div>

                {activeLesson.content_type === 'video' && activeLesson.video_url ? (
                  <div className="aspect-video rounded-xl overflow-hidden mb-4">
                    <iframe src={activeLesson.video_url} title={activeLesson.title} className="w-full h-full" allowFullScreen />
                  </div>
                ) : null}

                {activeLesson.content_type === 'notes' && (
                  <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200/50 dark:border-amber-900/30 rounded-xl p-4 mb-4 flex items-center gap-2">
                    <span className="text-lg">📝</span>
                    <span className="text-sm text-amber-700 dark:text-amber-400">Notes — reference material</span>
                  </div>
                )}

                {activeLesson.content && (
                  <div className="prose prose-sm max-w-none text-blue-600/70 dark:text-gray-300 [&_h1]:text-blue-900 [&_h2]:text-blue-900 [&_h3]:text-blue-900 dark:[&_h1]:text-gray-100 dark:[&_h2]:text-gray-100 dark:[&_h3]:text-gray-100 [&_strong]:text-blue-900 dark:[&_strong]:text-gray-100 [&_li]:text-blue-600/70 dark:[&_li]:text-gray-300" dangerouslySetInnerHTML={{ __html: activeLesson.content }} />
                )}
              </div>
            ) : (
              <div className="glass-card rounded-2xl p-6 text-center">
                <p className="text-blue-400/60 dark:text-gray-500">Select a lesson to begin.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
