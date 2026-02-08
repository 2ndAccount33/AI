import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

// Layouts
import MainLayout from '@/components/layout/MainLayout';
import AuthLayout from '@/components/layout/AuthLayout';

// Pages
import Login from '@/components/auth/Login';
import Register from '@/components/auth/Register';
import Dashboard from '@/components/dashboard/Dashboard';
import RoadmapPage from '@/components/roadmap/RoadmapPage';
import AssessmentPage from '@/components/assessment/AssessmentPage';
import AptitudePage from '@/components/aptitude/AptitudePage';
import JobBoard from '@/components/jobs/JobBoard';
import AgentOrchestrator from '@/components/orchestrator/AgentOrchestrator';
import AutonomousJobMatcher from '@/components/jobs/AutonomousJobMatcher';

// Protected Route wrapper
function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, isLoading } = useAuthStore();

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-500"></div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return <>{children}</>;
}

function App() {
    return (
        <Routes>
            {/* Auth Routes */}
            <Route element={<AuthLayout />}>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
            </Route>

            {/* Protected Routes */}
            <Route
                element={
                    <ProtectedRoute>
                        <MainLayout />
                    </ProtectedRoute>
                }
            >
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/orchestrator" element={<AgentOrchestrator />} />
                <Route path="/roadmap" element={<RoadmapPage />} />
                <Route path="/roadmap/:id" element={<RoadmapPage />} />
                <Route path="/assessment" element={<AssessmentPage />} />
                <Route path="/assessment/:id" element={<AssessmentPage />} />
                <Route path="/aptitude" element={<AptitudePage />} />
                <Route path="/jobs" element={<JobBoard />} />
                <Route path="/job-matcher" element={<AutonomousJobMatcher />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}

export default App;
