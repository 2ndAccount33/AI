import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login, isLoading, error, clearError } = useAuthStore();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        clearError();

        try {
            await login(email, password);
            toast.success('Welcome back!');
            navigate('/dashboard');
        } catch {
            toast.error(error || 'Login failed');
        }
    };

    return (
        <div className="glass-card p-8 rounded-2xl">
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-2">Welcome back</h2>
                <p className="text-white/60">Sign in to continue your learning journey</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">
                        Email Address
                    </label>
                    <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="input-field pl-12"
                            placeholder="you@example.com"
                            required
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">
                        Password
                    </label>
                    <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="input-field pl-12"
                            placeholder="••••••••"
                            required
                        />
                    </div>
                </div>

                {error && (
                    <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-danger-500 text-sm"
                    >
                        {error}
                    </motion.p>
                )}

                <button
                    type="submit"
                    disabled={isLoading}
                    className="btn-primary w-full flex items-center justify-center gap-2"
                >
                    {isLoading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                        <>
                            Sign In
                            <ArrowRight className="w-5 h-5" />
                        </>
                    )}
                </button>
            </form>

            <p className="mt-6 text-center text-white/60">
                Don't have an account?{' '}
                <Link to="/register" className="text-primary-400 hover:text-primary-300 font-medium">
                    Create one
                </Link>
            </p>
        </div>
    );
}
