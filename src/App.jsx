import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import CategoryBar from './components/CategoryBar';
import AuthGuard from './components/AuthGuard';
import ErrorBoundary from './components/ErrorBoundary';
import Footer from './components/Footer';
const SplashPage = lazy(() => import('./pages/SplashPage'));
const AuthPage = lazy(() => import('./pages/AuthPage'));
const Home = lazy(() => import('./pages/Home'));
const Templates = lazy(() => import('./pages/Templates'));
const TemplatePage = lazy(() => import('./pages/TemplatePage'));
const SearchPage = lazy(() => import('./pages/SearchPage'));
const DomainHosting = lazy(() => import('./pages/DomainHosting'));
const OnlineCourses = lazy(() => import('./pages/OnlineCourses'));
const ITIntegration = lazy(() => import('./pages/ITIntegration'));
const Consulting = lazy(() => import('./pages/Consulting'));
const CourseDetail = lazy(() => import('./pages/CourseDetail'));
const MyCourses = lazy(() => import('./pages/MyCourses'));
const Book = lazy(() => import('./pages/Book'));
const PaymentPage = lazy(() => import('./pages/PaymentPage'));
const BookingDone = lazy(() => import('./pages/BookingDone'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const Studio = lazy(() => import('./pages/Studio'));
const NotFound = lazy(() => import('./pages/NotFound'));

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<ErrorBoundary><Suspense fallback={<div className="min-h-screen bg-[#fffff0]" />}><SplashPage /></Suspense></ErrorBoundary>} />
        <Route path="/auth" element={<ErrorBoundary><Suspense fallback={<div className="min-h-screen bg-[#fffff0]" />}><AuthPage /></Suspense></ErrorBoundary>} />
        <Route path="/reset-password" element={<ErrorBoundary><Suspense fallback={<div className="min-h-screen bg-[#fffff0]" />}><ResetPassword /></Suspense></ErrorBoundary>} />
        <Route path="/studio" element={<ErrorBoundary><Suspense fallback={<div className="min-h-screen bg-[#fffff0]" />}><Studio /></Suspense></ErrorBoundary>} />
        <Route path="/admin" element={<ErrorBoundary><Suspense fallback={<div className="min-h-screen bg-[#fffff0]" />}><Studio /></Suspense></ErrorBoundary>} />
        <Route path="/*" element={
          <>
            <CategoryBar />
            <div className="pt-[57px] min-h-screen flex flex-col">
            <div className="flex-1 flex flex-col">
            <ErrorBoundary>
            <Suspense fallback={<div className="flex-1 flex items-center justify-center py-20"><p className="text-black/70 dark:text-gray-300">Loading...</p></div>}>
            <Routes>
              <Route path="home" element={<Home />} />
              <Route path="templates" element={<Templates />} />
              <Route path="templates/:category" element={<Templates />} />
              <Route path="template/:id" element={<TemplatePage />} />
              <Route path="domain-hosting" element={<DomainHosting />} />
              <Route path="online-courses" element={<OnlineCourses />} />
              <Route path="it-integration" element={<ITIntegration />} />
              <Route path="consulting" element={<Consulting />} />
              <Route path="course/:id" element={<CourseDetail />} />
              <Route path="my-courses" element={<AuthGuard><MyCourses /></AuthGuard>} />
              <Route path="search" element={<SearchPage />} />
              <Route path="book" element={<AuthGuard><Book /></AuthGuard>} />
              <Route path="payment/:id" element={<AuthGuard><PaymentPage /></AuthGuard>} />
              <Route path="book/done" element={<AuthGuard><BookingDone /></AuthGuard>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            </Suspense>
            </ErrorBoundary>
            </div>
            <Footer />
            </div>
          </>
        } />
      </Routes>
    </>
  );
}
