import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchPage, fetchCourses, fetchEnrollments } from '../data';
import { supabase } from '../supabase';

export default function OnlineCourses() {
  const [page, setPage] = useState(null);
  const [courses, setCourses] = useState([]);
  const [enrolledIds, setEnrolledIds] = useState(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetchPage('online-courses'),
      fetchCourses(),
      supabase.auth.getSession().then(({ data: { session } }) => session?.user?.id || null),
    ]).then(([pageData, coursesData, userId]) => {
      if (pageData) setPage(pageData);
      setCourses(coursesData);
      if (userId) {
        fetchEnrollments(userId).then((enrs) => setEnrolledIds(new Set(enrs.map((e) => e.course_id))));
      }
      setLoading(false);
    });
  }, []);

  if (loading) return <main className="flex-1 flex items-center justify-center py-20"><p className="text-blue-600/70 dark:text-gray-300 text-lg">Loading...</p></main>;

  return (
    <main className="flex-1">
      <div className="max-w-6xl mx-auto px-5 py-16">
        {page?.image && (
          <img src={page.image} alt={page.title} className="w-full h-64 sm:h-80 object-cover rounded-3xl mb-8" />
        )}
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-blue-900 dark:text-gray-100 mb-6">{page?.title || 'Online Courses'}</h1>
        {page?.content && (
          <div className="text-blue-600/70 dark:text-gray-300 text-base sm:text-lg leading-relaxed space-y-4 mb-10" dangerouslySetInnerHTML={{ __html: page.content }} />
        )}

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.length === 0 ? (
            <div className="col-span-full text-center py-16">
              <p className="text-blue-600/70 dark:text-gray-300 text-lg">No courses available yet.</p>
            </div>
          ) : (
            courses.map((course) => {
              const enrolled = enrolledIds.has(course.id);
              return (
                <Link key={course.id} to={`/course/${course.id}`} className="glass-card rounded-2xl overflow-hidden hover:shadow-lg transition-shadow group">
                  {course.image && (
                    <img src={course.image} alt={course.title} className="w-full h-40 object-cover group-hover:scale-[1.02] transition-transform" />
                  )}
                  <div className="p-5">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[10px] font-medium text-teal-dark dark:text-teal-light bg-teal/15 dark:bg-amber-900/20 px-2 py-0.5 rounded-full">{course.category}</span>
                      {enrolled && <span className="text-[10px] font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30 px-2 py-0.5 rounded-full">Enrolled</span>}
                    </div>
                    <h3 className="font-semibold text-blue-900 dark:text-gray-100">{course.title}</h3>
                    <p className="text-sm text-blue-500/60 dark:text-gray-400 mt-1 line-clamp-2">{course.description}</p>
                    <div className="flex items-center justify-between mt-3">
                      {course.price > 0 ? (
                        <span className="text-sm font-bold text-blue-900 dark:text-gray-100">${course.price}</span>
                      ) : (
                        <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Free</span>
                      )}
                      <span className="text-xs text-teal-dark dark:text-teal-light group-hover:translate-x-1 transition-transform">Start →</span>
                    </div>
                  </div>
                </Link>
              );
            })
          )}
        </div>
      </div>
    </main>
  );
}
