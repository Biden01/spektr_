import { useState } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import LandingScreen from './screens/Landing.jsx';
import LoginScreen from './screens/Login.jsx';
import DashboardScreen from './screens/Dashboard.jsx';
import TestScreen from './screens/Test.jsx';
import ResultsScreen from './screens/Results.jsx';
import AboutScreen from './screens/About.jsx';
import StudyCenterScreen from './screens/StudyCenter.jsx';
import CourseCatalogScreen from './screens/CourseCatalog.jsx';
import DocumentsScreen from './screens/Documents.jsx';
import RegisterScreen from './screens/Register.jsx';
import ForgotPasswordScreen from './screens/ForgotPassword.jsx';
import DailyStartScreen from './screens/DailyStart.jsx';
import AnnualStartScreen from './screens/AnnualStart.jsx';
import HistoryScreen from './screens/History.jsx';
import ProfileScreen from './screens/Profile.jsx';
import VideoCatalogScreen from './screens/VideoCatalog.jsx';
import VideoPlayerScreen from './screens/VideoPlayer.jsx';
import SafetyScreen from './screens/Safety.jsx';
import SafetyProtocolScreen from './screens/SafetyProtocol.jsx';
import MechanismsScreen from './screens/Mechanisms.jsx';
import MasterDashboardScreen from './screens/MasterDashboard.jsx';
import StudentDashboardScreen from './screens/StudentDashboard.jsx';
import AdminOverviewScreen from './screens/admin/AdminOverview.jsx';
import AdminUsersScreen from './screens/admin/AdminUsers.jsx';
import AdminQuestionsScreen from './screens/admin/AdminQuestions.jsx';
import AdminLessonsScreen from './screens/admin/AdminLessons.jsx';
import AdminReportsScreen from './screens/admin/AdminReports.jsx';
import AdminAlertsScreen from './screens/admin/AdminAlerts.jsx';
import AdminSettingsScreen from './screens/admin/AdminSettings.jsx';
import AdminAuditScreen from './screens/admin/AdminAudit.jsx';
import AdminProtocolsScreen from './screens/admin/AdminProtocols.jsx';
import AdminMechanismsScreen from './screens/admin/AdminMechanisms.jsx';
import AdminCoursesScreen from './screens/admin/AdminCourses.jsx';
import AdminDocumentsScreen from './screens/admin/AdminDocuments.jsx';
import AdminCategoriesScreen from './screens/admin/AdminCategories.jsx';
import { useAuth } from './context/AuthContext.jsx';
import { useTest } from './context/TestContext.jsx';

function roleHome(role) {
  if (role === 'master')  return '/master';
  if (role === 'admin')   return '/admin';
  if (role === 'student') return '/student';
  return '/dashboard';
}

// Routes that are exempt from the annual overdue auto-redirect
const ANNUAL_EXEMPT = new Set(['/annual', '/test', '/results', '/profile', '/login', '/']);

// Redirects to /login if not authenticated, or to roleHome if wrong role required.
// For employees: if annual check is overdue, forces redirect to /annual.
function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F7F9FC' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 40, height: 40, border: '3px solid #E4E8EF', borderTopColor: '#1B4B7A', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
        <p style={{ color: '#475060', fontSize: 14, fontFamily: 'Inter, sans-serif' }}>Загрузка...</p>
      </div>
    </div>
  );

  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to={roleHome(user.role)} replace />;

  // Auto-redirect employees with overdue annual check to the annual start page
  const annualOverdue = user.role === 'employee' && (user.annualDueDays ?? 999) < 0;
  if (annualOverdue && !ANNUAL_EXEMPT.has(location.pathname)) {
    return <Navigate to="/annual" replace />;
  }

  return children;
}

export default function App() {
  const { user, loading, logout } = useAuth();
  const { startTest } = useTest();
  const navigate = useNavigate();

  const [selectedLesson, setSelectedLesson] = useState(null);
  const [selectedProtocol, setSelectedProtocol] = useState(null);

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F7F9FC' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 40, height: 40, border: '3px solid #E4E8EF', borderTopColor: '#1B4B7A', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
        <p style={{ color: '#475060', fontSize: 14, fontFamily: 'Inter, sans-serif' }}>Загрузка...</p>
      </div>
    </div>
  );

  const onNav = (target) => {
    const map = {
      home:           () => navigate(roleHome(user?.role)),
      daily:          () => navigate('/daily'),
      'daily-start':  () => navigate('/daily'),
      'annual-start': () => navigate('/annual'),
      history:        () => navigate('/history'),
      results:        () => navigate('/history'),
      profile:        () => navigate('/profile'),
      video:          () => navigate('/videos'),
      safe:           () => navigate('/safety'),
      exam:           () => navigate('/exam'),
      overview:       () => navigate('/admin'),
      users:          () => navigate('/admin/users'),
      questions:      () => navigate('/admin/questions'),
      lessons:        () => navigate('/admin/lessons'),
      reports:        () => navigate('/admin/reports'),
      alerts:         () => navigate('/admin/alerts'),
      settings:       () => navigate('/admin/settings'),
      audit:          () => navigate('/admin/audit'),
      protocols:      () => navigate('/admin/protocols'),
      mechanisms:     () => navigate('/admin/mechanisms'),
      courses:        () => navigate('/admin/courses'),
      documents:      () => navigate('/admin/documents'),
      categories:     () => navigate('/admin/categories'),
    };
    (map[target] ?? (() => navigate(roleHome(user?.role))))();
  };

  const onLogoutClick = async () => { await logout(); navigate('/'); };

  const handleEnter = (loggedInUser) => {
    navigate(roleHome(loggedInUser?.role || user?.role));
  };

  const pubProps = {
    onLogin:   () => navigate('/login'),
    onStudy:   () => navigate('/register'),
    onAbout:   () => navigate('/about'),
    onCenter:  () => navigate('/study-center'),
    onCatalog: () => navigate('/catalog'),
    onDocs:    () => navigate('/docs'),
    onHome:    () => navigate('/'),
  };

  const startAndGo = async (type, opts = {}) => {
    try { await startTest(type, opts); navigate('/test'); }
    catch (e) { console.error(e); }
  };

  const emp = { onNav, onLogout: onLogoutClick };

  return (
    <Routes>
      {/* Public */}
      <Route path="/"               element={<LandingScreen     {...pubProps} />} />
      <Route path="/about"          element={<AboutScreen       {...pubProps} />} />
      <Route path="/study-center"   element={<StudyCenterScreen {...pubProps} />} />
      <Route path="/catalog"        element={<CourseCatalogScreen {...pubProps} />} />
      <Route path="/docs"           element={<DocumentsScreen   {...pubProps} />} />

      {/* Auth */}
      <Route path="/login"          element={<LoginScreen onEnter={handleEnter} onBack={() => navigate('/')} onForgotPassword={() => navigate('/forgot-password')} onRegister={() => navigate('/register')} />} />
      <Route path="/register"       element={<RegisterScreen onLogin={() => navigate('/login')} onHome={() => navigate('/')} onEnter={handleEnter} onAbout={() => navigate('/about')} onCenter={() => navigate('/study-center')} onDocs={() => navigate('/docs')} />} />
      <Route path="/forgot-password" element={<ForgotPasswordScreen onLogin={() => navigate('/login')} onHome={() => navigate('/')} onAbout={() => navigate('/about')} onCenter={() => navigate('/study-center')} onDocs={() => navigate('/docs')} />} />

      {/* Employee */}
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <DashboardScreen {...emp} onStartTest={() => startAndGo('annual')} onLogout={onLogoutClick} />
        </ProtectedRoute>
      } />
      <Route path="/daily" element={
        <ProtectedRoute>
          <DailyStartScreen {...emp} onStart={() => startAndGo('daily')} onBack={() => navigate('/dashboard')} />
        </ProtectedRoute>
      } />
      <Route path="/annual" element={
        <ProtectedRoute>
          <AnnualStartScreen {...emp} onStart={() => startAndGo('annual')} onBack={() => navigate('/dashboard')} />
        </ProtectedRoute>
      } />
      <Route path="/test" element={
        <ProtectedRoute>
          <TestScreen onFinish={() => navigate('/results')} onBack={() => navigate('/dashboard')} />
        </ProtectedRoute>
      } />
      <Route path="/results" element={
        <ProtectedRoute>
          <ResultsScreen onHome={() => navigate('/dashboard')} onRetry={(type) => {
            if (type === 'daily') navigate('/daily');
            else if (type === 'annual') navigate('/annual');
            else navigate('/dashboard');
          }} />
        </ProtectedRoute>
      } />
      <Route path="/history" element={
        <ProtectedRoute>
          <HistoryScreen {...emp} onBack={() => navigate('/dashboard')} />
        </ProtectedRoute>
      } />
      <Route path="/profile" element={
        <ProtectedRoute>
          <ProfileScreen {...emp} onBack={() => navigate('/dashboard')} />
        </ProtectedRoute>
      } />
      <Route path="/videos" element={
        <ProtectedRoute>
          <VideoCatalogScreen {...emp} onOpenLesson={(l) => { setSelectedLesson(l); navigate('/videos/watch'); }} onBack={() => navigate('/dashboard')} />
        </ProtectedRoute>
      } />
      <Route path="/videos/watch" element={
        <ProtectedRoute>
          <VideoPlayerScreen
            {...emp}
            lesson={selectedLesson}
            onSwitchLesson={(l) => setSelectedLesson(l)}
            onBack={() => navigate('/videos')}
            onStartTest={(l) => startAndGo('lesson', { category_id: l.category })}
          />
        </ProtectedRoute>
      } />
      <Route path="/safety" element={
        <ProtectedRoute>
          <SafetyScreen {...emp} onOpenProtocol={(p) => { setSelectedProtocol(p); navigate('/safety/view'); }} onBack={() => navigate('/dashboard')} />
        </ProtectedRoute>
      } />
      <Route path="/safety/view" element={
        <ProtectedRoute>
          <SafetyProtocolScreen
            {...emp}
            protocol={selectedProtocol}
            onBack={() => navigate('/safety')}
            onStartTest={(p) => startAndGo('protocol', { category: 'labour', title: p.title })}
          />
        </ProtectedRoute>
      } />
      <Route path="/exam" element={
        <ProtectedRoute>
          <MechanismsScreen {...emp} onBack={() => navigate('/dashboard')} />
        </ProtectedRoute>
      } />

      {/* Master */}
      <Route path="/master" element={
        <ProtectedRoute roles={['master']}>
          <MasterDashboardScreen onLogout={onLogoutClick} onNav={onNav} />
        </ProtectedRoute>
      } />

      {/* Student */}
      <Route path="/student" element={
        <ProtectedRoute roles={['student']}>
          <StudentDashboardScreen onLogout={onLogoutClick} onNav={onNav} />
        </ProtectedRoute>
      } />

      {/* Admin */}
      <Route path="/admin" element={
        <ProtectedRoute roles={['admin']}>
          <AdminOverviewScreen onNav={onNav} onLogout={onLogoutClick} />
        </ProtectedRoute>
      } />
      <Route path="/admin/users" element={
        <ProtectedRoute roles={['admin']}>
          <AdminUsersScreen onNav={onNav} onLogout={onLogoutClick} />
        </ProtectedRoute>
      } />
      <Route path="/admin/questions" element={
        <ProtectedRoute roles={['admin']}>
          <AdminQuestionsScreen onNav={onNav} onLogout={onLogoutClick} />
        </ProtectedRoute>
      } />
      <Route path="/admin/lessons" element={
        <ProtectedRoute roles={['admin']}>
          <AdminLessonsScreen onNav={onNav} onLogout={onLogoutClick} />
        </ProtectedRoute>
      } />
      <Route path="/admin/reports" element={
        <ProtectedRoute roles={['admin']}>
          <AdminReportsScreen onNav={onNav} onLogout={onLogoutClick} />
        </ProtectedRoute>
      } />
      <Route path="/admin/alerts" element={
        <ProtectedRoute roles={['admin']}>
          <AdminAlertsScreen onNav={onNav} onLogout={onLogoutClick} />
        </ProtectedRoute>
      } />
      <Route path="/admin/settings" element={
        <ProtectedRoute roles={['admin']}>
          <AdminSettingsScreen onNav={onNav} onLogout={onLogoutClick} />
        </ProtectedRoute>
      } />
      <Route path="/admin/audit" element={
        <ProtectedRoute roles={['admin']}>
          <AdminAuditScreen onNav={onNav} onLogout={onLogoutClick} />
        </ProtectedRoute>
      } />

      <Route path="/admin/protocols" element={
        <ProtectedRoute roles={['admin']}>
          <AdminProtocolsScreen onNav={onNav} onLogout={onLogoutClick} />
        </ProtectedRoute>
      } />
      <Route path="/admin/mechanisms" element={
        <ProtectedRoute roles={['admin']}>
          <AdminMechanismsScreen onNav={onNav} onLogout={onLogoutClick} />
        </ProtectedRoute>
      } />
      <Route path="/admin/courses" element={
        <ProtectedRoute roles={['admin']}>
          <AdminCoursesScreen onNav={onNav} onLogout={onLogoutClick} />
        </ProtectedRoute>
      } />
      <Route path="/admin/documents" element={
        <ProtectedRoute roles={['admin']}>
          <AdminDocumentsScreen onNav={onNav} onLogout={onLogoutClick} />
        </ProtectedRoute>
      } />

      <Route path="/admin/categories" element={
        <ProtectedRoute roles={['admin']}>
          <AdminCategoriesScreen onNav={onNav} onLogout={onLogoutClick} />
        </ProtectedRoute>
      } />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
