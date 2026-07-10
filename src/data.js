import { supabase } from './supabase';

export async function fetchPaymentSettings() {
  const { data } = await supabase.from('payment_settings').select('*').maybeSingle();
  return data || null;
}

export async function updatePaymentSettings(settings) {
  const { data } = await supabase.from('payment_settings').update({ ...settings, updated_at: new Date() }).eq('id', 1).select().maybeSingle();
  return data;
}

export async function fetchBookingAnalytics() {
  const { data: bookings } = await supabase
    .from('bookings')
    .select('id, type, status, created_at');

  if (!bookings) return null;

  const total = bookings.length;
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const thisMonth = bookings.filter(b => new Date(b.created_at) >= thirtyDaysAgo).length;

  const byCategory = {};
  bookings.forEach(b => { byCategory[b.type] = (byCategory[b.type] || 0) + 1; });
  const categorySorted = Object.entries(byCategory).sort((a, b) => b[1] - a[1]);

  const byStatus = {};
  bookings.forEach(b => { byStatus[b.status] = (byStatus[b.status] || 0) + 1; });

  const dailyMap = {};
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    dailyMap[d.toISOString().slice(0, 10)] = 0;
  }
  bookings.forEach(b => {
    const key = new Date(b.created_at).toISOString().slice(0, 10);
    if (dailyMap[key] !== undefined) dailyMap[key]++;
  });
  const dailyTrend = Object.entries(dailyMap).map(([date, count]) => ({ date, count }));

  return { total, thisMonth, byCategory: categorySorted, byStatus, dailyTrend };
}

export async function fetchUserAnalytics() {
  const { data: designers } = await supabase
    .from('designers')
    .select('*');

  const count = Array.isArray(designers) ? designers.length : 0;
  return { total: count, growth: [] };
}

export async function fetchTemplates() {
  const { data } = await supabase.from('templates').select('*').order('created_at', { ascending: false });
  return data || [];
}

export async function createTemplate(template) {
    const { data } = await supabase.from('templates').insert(template);
    return data?.id ? data : null;
}

export async function updateTemplate(template) {
  await supabase.from('templates').update(template).eq('id', template.id);
}

export async function removeTemplate(id) {
  await supabase.from('templates').delete().eq('id', id);
}

export async function fetchBookings() {
  try {
    const res = await fetch(`${window.location.origin}/api/bookings-full`);
    const json = await res.json();
    return json.data || [];
  } catch {
    return [];
  }
}

export async function addBooking(booking) {
  const { data, error } = await supabase.from('bookings').insert(booking);
  if (error) { console.error('addBooking error:', error); throw error; }
  return data?.id ? data : null;
}

export async function getBooking(id) {
  const { data } = await supabase.from('bookings').select('*').eq('id', id).maybeSingle();
  return data;
}

export async function uploadPaymentProof(bookingId, file, paymentData) {
  const ext = file.name.split('.').pop();
  const path = `${bookingId}/${Date.now()}.${ext}`;
  const { error: uploadError } = await supabase.storage.from('payment-proofs').upload(path, file);
  if (uploadError) throw uploadError;
  const { data: { publicUrl } } = supabase.storage.from('payment-proofs').getPublicUrl(path);
  const { error: updateError } = await supabase.from('bookings').update({
    payment_status: 'proof_submitted',
    payment_method: paymentData.method,
    payment_reference: paymentData.reference,
    payment_proof_url: publicUrl,
  }).eq('id', bookingId);
  if (updateError) throw updateError;
  return publicUrl;
}

export async function verifyPayment(bookingId) {
  const { error } = await supabase.from('bookings').update({ payment_status: 'verified' }).eq('id', bookingId);
  if (error) throw error;
  // Auto-enroll for course bookings
  const { data: booking } = await supabase.from('bookings').select('*').eq('id', bookingId).maybeSingle();
  if (booking && booking.type === 'Online Courses' && booking.user_id && booking.message) {
    const match = booking.message.match(/Course enrollment: (.+?) \(\$[\d.]+\)/);
    if (match) {
      const { data: courses } = await supabase.from('courses').select('id').ilike('title', match[1]).limit(1);
      if (courses && courses.length > 0) {
        await supabase.from('enrollments').insert({ user_id: booking.user_id, course_id: courses[0].id });
      }
    }
  }
}

// ---- Designer Portal ----

export async function verifyDesigner(email, password) {
  const { data } = await supabase.auth.signInWithPassword({ email, password });
  if (data?.user) return { email: data.user.email, name: data.user.email, password: '' };
  if (data?.session?.user) return { email: data.session.user.email, name: data.session.user.email, password: '' };
  return null;
}

export async function updateBookingStatus(id, status) {
  const { error } = await supabase.from('bookings').update({ status }).eq('id', id);
  if (error) throw error;
}

export async function removeBooking(id) {
  const { error } = await supabase.from('bookings').delete().eq('id', id);
  if (error) throw error;
}

export async function updateDesignerPassword(email, newPassword) {
  const session = JSON.parse(localStorage.getItem('session') || '{}');
  const res = await fetch(`${window.location.origin}/api/auth/update-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session.access_token || ''}` },
    body: JSON.stringify({ currentPassword: '', newPassword }),
  });
  return await res.json();
}

// ---- CMS Pages ----

export async function fetchPage(slug) {
  const { data } = await supabase
    .from('pages')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();
  return data;
}

export async function fetchAllPages() {
  const { data } = await supabase.from('pages').select('*').order('updated_at', { ascending: false });
  return data || [];
}

export async function upsertPage(page) {
  if (page.id) {
    await supabase.from('pages').update({ title: page.title, slug: page.slug, content: page.content, image: page.image, updated_at: new Date() }).eq('id', page.id);
  } else {
    const { data } = await supabase.from('pages').insert(page);
    return data?.id ? data : null;
  }
}

export async function checkDomain(domain) {
  const { data, error } = await supabase.functions.invoke('domain-check', { body: { domain } });
  if (error) throw error;
  return data;
}

export async function checkAllDomains(name) {
  const { data, error } = await supabase.functions.invoke('domain-check-all', { body: { name } });
  if (error) throw error;
  return data;
}

export async function fetchDomainPricing() {
  const { data } = await supabase.from('domain_pricing').select('*').order('tld');
  return data || [];
}

export async function updateDomainPricing(tld, price) {
  await supabase.from('domain_pricing').upsert({ tld, price }, { onConflict: 'tld' });
}

// ---- Services (IT Integration + Consulting) ----

export async function fetchServices(type) {
  const { data } = await supabase.from('services').select('*').eq('type', type).order('sort_order');
  return data || [];
}

export async function upsertService(service) {
  if (service.id) {
    await supabase.from('services').update(service).eq('id', service.id);
  } else {
    const { data } = await supabase.from('services').insert(service);
    return data?.id ? data : null;
  }
}

export async function removeService(id) {
  await supabase.from('services').delete().eq('id', id);
}

export async function fetchServiceSteps() {
  const { data } = await supabase.from('service_steps').select('*').order('step_number');
  return data || [];
}

export async function upsertServiceStep(step) {
  if (step.id) {
    await supabase.from('service_steps').update(step).eq('id', step.id);
  } else {
    const { data } = await supabase.from('service_steps').insert(step);
    return data?.id ? data : null;
  }
}

export async function removeServiceStep(id) {
  await supabase.from('service_steps').delete().eq('id', id);
}

// ---- App Settings ----

export async function fetchSettings() {
  const { data } = await supabase.from('settings').select('*');
  const map = {};
  (data || []).forEach((s) => { map[s.key] = s.value; });
  return map;
}

export async function updateSetting(key, value) {
  const { data, error } = await supabase.from('settings').upsert({ key, value }, { onConflict: 'key' });
  return { data, error };
}

export async function fetchAllUsers() {
  const { data: bookingUsers } = await supabase
    .from('bookings')
    .select('*')
    .order('created_at', { ascending: false });

  const { data: designers } = await supabase
    .from('designers')
    .select('*');

  const seen = new Set();
  const combined = [];

  (bookingUsers || []).forEach((u) => {
    if (!seen.has(u.email)) {
      seen.add(u.email);
      combined.push({ name: u.name || '—', email: u.email, source: 'booking' });
    }
  });

  (designers || []).forEach((u) => {
    if (!seen.has(u.email)) {
      seen.add(u.email);
      combined.push({ name: u.name || '—', email: u.email, source: 'profile' });
    }
  });

  return combined;
}

// ---- Courses ----

export async function fetchCourses() {
  const { data } = await supabase.from('courses').select('*').order('created_at', { ascending: false });
  return data || [];
}

export async function fetchCourse(id) {
  const { data } = await supabase.from('courses').select('*').eq('id', id).maybeSingle();
  return data;
}

export async function upsertCourse(course) {
  if (course.id) {
    await supabase.from('courses').update({ title: course.title, description: course.description, price: course.price, image: course.image, video_url: course.video_url || '', pdf_url: course.pdf_url || '', updated_at: new Date() }).eq('id', course.id);
  } else {
    const { data } = await supabase.from('courses').insert(course);
    return data?.id ? data : null;
  }
}

export async function removeCourse(id) {
  await supabase.from('courses').delete().eq('id', id);
}

export async function fetchLessons(courseId) {
  const { data } = await supabase.from('course_lessons').select('*').eq('course_id', courseId).order('sort_order');
  return data || [];
}

export async function upsertLesson(lesson) {
  if (lesson.id) {
    await supabase.from('course_lessons').update({ title: lesson.title, description: lesson.description || '', content_type: lesson.content_type, content: lesson.content, video_url: lesson.video_url, sort_order: lesson.sort_order }).eq('id', lesson.id);
  } else {
    const { data } = await supabase.from('course_lessons').insert(lesson);
    return data?.id ? data : null;
  }
}

export async function removeLesson(id) {
  await supabase.from('course_lessons').delete().eq('id', id);
}

export async function fetchEnrollments(userId) {
  try {
    const res = await fetch(`${window.location.origin}/api/enrollments-full/${userId}`);
    const json = await res.json();
    return json.data || [];
  } catch {
    return [];
  }
}

export async function enrollCourse(userId, courseId) {
  const { data } = await supabase.from('enrollments').insert({ user_id: userId, course_id: courseId });
  return data?.id ? data : null;
}

export async function fetchLessonProgress(userId, lessonIds) {
  if (lessonIds.length === 0) return [];
  const { data } = await supabase.from('lesson_progress').select('*').eq('user_id', userId).in('lesson_id', lessonIds);
  return data || [];
}

export async function toggleLessonProgress(userId, lessonId, completed) {
  const { data: existing } = await supabase.from('lesson_progress').select('*').eq('user_id', userId).eq('lesson_id', lessonId).maybeSingle();
  if (existing) {
    await supabase.from('lesson_progress').update({ completed, completed_at: completed ? new Date() : null }).eq('id', existing.id);
  } else {
    await supabase.from('lesson_progress').insert({ user_id: userId, lesson_id: lessonId, completed, completed_at: completed ? new Date() : null });
  }
}
