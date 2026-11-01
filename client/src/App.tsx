import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Suspense, lazy } from 'react';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import BackgroundAtmosphere from './components/layout/BackgroundAtmosphere';
import LoadingSpinner from './components/ui/LoadingSpinner';

// Lazy load pages for smooth transitions
const LandingPage = lazy(() => import('./pages/LandingPage'));
const WizardPage = lazy(() => import('./pages/WizardPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const MyTripsPage = lazy(() => import('./pages/MyTripsPage'));
const AuthPage = lazy(() => import('./pages/AuthPage'));

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col bg-transparent text-[#e0e0ec] relative selection:bg-[#FF6B35]/30 selection:text-white print:bg-white print:text-gray-900">
        {/* Layered cinematic travel background atmosphere */}
        <div className="print:hidden">
          <BackgroundAtmosphere />
        </div>

        <div className="print:hidden">
          <Navbar />
        </div>

        <main className="flex-1 relative z-10 print:z-0 print:p-0">
          <Suspense fallback={<LoadingSpinner message="Igniting TripPilot Engine..." />}>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/plan" element={<WizardPage />} />
              <Route path="/dashboard/:id" element={<DashboardPage />} />
              <Route path="/trips" element={<MyTripsPage />} />
              <Route path="/login" element={<AuthPage />} />
              <Route path="/signup" element={<AuthPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </main>

        <div className="print:hidden">
          <Footer />
        </div>

        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#0d0d17',
              color: '#f4f4f8',
              border: '1px solid rgba(255, 107, 53, 0.25)',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.6), 0 0 20px rgba(255, 107, 53, 0.15)',
              borderRadius: '16px',
              padding: '14px 18px',
              fontSize: '14px',
              fontWeight: '600',
              backdropFilter: 'blur(16px)',
            },
            success: {
              iconTheme: { primary: '#00E5A0', secondary: '#050507' },
            },
            error: {
              iconTheme: { primary: '#FF4757', secondary: '#050507' },
            },
          }}
        />
      </div>
    </BrowserRouter>
  );
}

export default App;
