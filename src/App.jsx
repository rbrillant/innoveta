import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import CategoryBar from './components/CategoryBar';
import AuthGuard from './components/AuthGuard';
import Footer from './components/Footer';
import SplashPage from './pages/SplashPage';
import AuthPage from './pages/AuthPage';
import Home from './pages/Home';
import Templates from './pages/Templates';
import TemplatePage from './pages/TemplatePage';
import SearchPage from './pages/SearchPage';
import Website from './pages/Website';
import DomainHosting from './pages/DomainHosting';
import OnlineCourses from './pages/OnlineCourses';
import ITIntegration from './pages/ITIntegration';
import Consulting from './pages/Consulting';
import CourseDetail from './pages/CourseDetail';
import MyCourses from './pages/MyCourses';
import Book from './pages/Book';
import PaymentPage from './pages/PaymentPage';
import BookingDone from './pages/BookingDone';
import Studio from './pages/Studio';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<><Navbar hideSearch /><SplashPage /></>} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/studio" element={<Studio />} />
        <Route path="/admin" element={<Studio />} />
        <Route path="/*" element={
          <>
            <CategoryBar />
            <Routes>
              <Route path="home" element={<Home />} />
              <Route path="templates" element={<Templates />} />
              <Route path="template/:id" element={<TemplatePage />} />
              <Route path="website" element={<Website />} />
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
            <Footer />
          </>
        } />
      </Routes>
    </>
  );
}
