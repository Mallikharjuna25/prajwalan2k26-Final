import { Routes, Route, Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

// Common
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import ProtectedRoute from './components/common/ProtectedRoute';

// Public Pages
import LandingPage from './pages/public/LandingPage';
import EventsPage from './pages/public/EventsPage';
import EventDetails from './pages/public/EventDetails';
import VerifyPass from './pages/public/VerifyPass';
import CalendarPage from './pages/public/CalendarPage';
import AboutPage from './pages/public/AboutPage';
import ContactPage from './pages/public/ContactPage';

// Auth Pages
import StudentLogin from './pages/auth/StudentLogin';
import StudentSignup from './pages/auth/StudentSignup';
import OrganizerLogin from './pages/auth/OrganizerLogin';
import OrganizerSignup from './pages/auth/OrganizerSignup';
import AdminLogin from './pages/auth/AdminLogin';
import ReviewPending from './pages/auth/ReviewPending';

// Student Dashboard
import StudentDashboard from './pages/student/StudentDashboard';
import StudentEvents from './pages/student/StudentEvents';
import StudentMyEvents from './pages/student/StudentMyEvents';
import StudentCalendar from './pages/student/StudentCalendar';
import StudentAnalytics from './pages/student/StudentAnalytics';
import StudentProfile from './pages/student/StudentProfile';

// Organizer Dashboard
import OrganizerDashboard from './pages/organizer/OrganizerDashboard';
import OrganizerEvents from './pages/organizer/OrganizerEvents';
import CreateEvent from './pages/organizer/CreateEvent';
import EditEvent from './pages/organizer/EditEvent';
import EventParticipants from './pages/organizer/EventParticipants';
import ScanQRPage from './pages/organizer/ScanQRPage';
import OrganizerProfile from './pages/organizer/OrganizerProfile';

// Admin Dashboard
import AdminDashboard from './pages/admin/AdminDashboard';
import StudentReviews from './pages/admin/StudentReviews';
import OrganizerReviews from './pages/admin/OrganizerReviews';

const PublicLayout = () => {
  return (
    <>
      <Navbar />
      <Outlet />
      <Footer />
    </>
  );
};

const AuthLayout = () => {
  // Simple layout without global navbar/footer for cleaner auth experience, 
  // or you could just use empty fragments.
  return <Outlet />;
};

function App() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* PUBLIC ROUTES (with Navbar & Footer) */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/events/:id" element={<EventDetails />} />
          <Route path="/verify/:registrationId" element={<VerifyPass />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
        </Route>

        {/* AUTH ROUTES (Clean Layout) */}
        <Route element={<AuthLayout />}>
          <Route path="/student/login" element={<StudentLogin />} />
          <Route path="/student/signup" element={<StudentSignup />} />
          <Route path="/organizer/login" element={<OrganizerLogin />} />
          <Route path="/organizer/signup" element={<OrganizerSignup />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/review-pending" element={<ReviewPending />} />
        </Route>

        {/* STUDENT DASHBOARD ROUTES */}
        <Route
          path="/student/dashboard"
          element={<ProtectedRoute requiredRole="student"><StudentDashboard /></ProtectedRoute>}
        >
          <Route index element={<StudentEvents />} />
          <Route path="my-events" element={<StudentMyEvents />} />
          <Route path="calendar" element={<StudentCalendar />} />
          <Route path="analytics" element={<StudentAnalytics />} />
          <Route path="profile" element={<StudentProfile />} />
        </Route>

        {/* ORGANIZER DASHBOARD ROUTES */}
        <Route
          path="/organizer/dashboard"
          element={<ProtectedRoute requiredRole="organizer"><OrganizerDashboard /></ProtectedRoute>}
        >
          <Route index element={<OrganizerEvents />} />
          <Route path="create" element={<CreateEvent />} />
          <Route path="edit/:id" element={<EditEvent />} />
          <Route path="participants/:id" element={<EventParticipants />} />
          <Route path="scan/:id" element={<ScanQRPage />} />
          <Route path="profile" element={<OrganizerProfile />} />
        </Route>

        {/* ADMIN DASHBOARD ROUTES */}
        <Route
          path="/admin/dashboard"
          element={<ProtectedRoute requiredRole="admin"><AdminDashboard /></ProtectedRoute>}
        >
          <Route index element={<StudentReviews />} />
          <Route path="students" element={<StudentReviews />} />
          <Route path="organizers" element={<OrganizerReviews />} />
        </Route>

        {/* 404 CATCH-ALL */}
        <Route path="*" element={
          <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
            <h1 className="text-8xl font-bold text-gradient mb-4">404</h1>
            <p className="text-xl text-gray-400 mb-8">Oops! The page you're looking for doesn't exist.</p>
            <a href="/" className="btn-primary">Return to Home</a>
          </div>
        } />
      </Routes>
    </AnimatePresence>
  );
}

export default App;
