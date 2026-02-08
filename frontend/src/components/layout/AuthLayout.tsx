import { Outlet, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { Zap } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AuthLayout() {
    const { isAuthenticated, isLoading } = useAuthStore();

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
            </div>
        );
    }

    if (isAuthenticated) {
        return <Navigate to="/dashboard" replace />;
    }

    return (
        <div className="min-h-screen flex">
            {/* Left side - Branding */}
            <div className="hidden lg:flex flex-1 items-center justify-center p-12 relative overflow-hidden">
                {/* Animated background */}
                <div className="absolute inset-0">
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl animate-pulse-slow" />
                    <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent-500/20 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="relative z-10 text-center max-w-lg"
                >
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-primary-500/30">
                        <Zap className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-4xl font-bold gradient-text mb-4">
                        AI Automation Platform
                    </h1>
                    <p className="text-lg text-white/60 mb-8">
                        Transform your career with AI-powered skill analysis, personalized learning paths, and gamified assessments.
                    </p>
                    <div className="grid grid-cols-3 gap-4 text-center">
                        <div className="glass-card p-4 rounded-xl">
                            <p className="text-2xl font-bold text-primary-400">3</p>
                            <p className="text-xs text-white/40">AI Agents</p>
                        </div>
                        <div className="glass-card p-4 rounded-xl">
                            <p className="text-2xl font-bold text-accent-400">100+</p>
                            <p className="text-xs text-white/40">Skills Tracked</p>
                        </div>
                        <div className="glass-card p-4 rounded-xl">
                            <p className="text-2xl font-bold text-success-500">Live</p>
                            <p className="text-xs text-white/40">Resources</p>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Right side - Auth Form */}
            <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4 }}
                    className="w-full max-w-md"
                >
                    {/* Mobile logo */}
                    <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                            <Zap className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-2xl font-bold gradient-text">AI Platform</span>
                    </div>

                    <Outlet />
                </motion.div>
            </div>
        </div>
    );
}
