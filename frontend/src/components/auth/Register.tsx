import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { Mail, Lock, User, Briefcase, Target, ArrowRight, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

export default function Register() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        currentRole: '',
        targetRole: '',
    });
    const [step, setStep] = useState(1);
    const { register, isLoading, error, clearError } = useAuthStore();
    const navigate = useNavigate();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        clearError();

        if (step === 1) {
            if (formData.password !== formData.confirmPassword) {
                toast.error('Passwords do not match');
                return;
            }
            setStep(2);
            return;
        }

        try {
            await register({
                name: formData.name,
                email: formData.email,
                password: formData.password,
            });
            toast.success('Welcome to AI Platform!');
            navigate('/dashboard');
        } catch {
            toast.error(error || 'Registration failed');
        }
    };

    return (
        <div className="glass-card p-8 rounded-2xl">
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-2">Create your account</h2>
                <p className="text-white/60">
                    {step === 1 ? 'Enter your details to get started' : 'Tell us about your goals'}
                </p>
            </div>

            {/* Progress indicator */}
            <div className="flex gap-2 mb-8">
                <div className={`flex-1 h-1 rounded-full ${step >= 1 ? 'bg-primary-500' : 'bg-white/10'}`} />
                <div className={`flex-1 h-1 rounded-full ${step >= 2 ? 'bg-primary-500' : 'bg-white/10'}`} />
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {step === 1 ? (
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-6"
                    >
                        <div>
                            <label className="block text-sm font-medium text-white/80 mb-2">Full Name</label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="input-field pl-12"
                                    placeholder="John Doe"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-white/80 mb-2">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="input-field pl-12"
                                    placeholder="you@example.com"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-white/80 mb-2">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="input-field pl-12"
                                    placeholder="••••••••"
                                    minLength={8}
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-white/80 mb-2">Confirm Password</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    className="input-field pl-12"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-6"
                    >
                        <div>
                            <label className="block text-sm font-medium text-white/80 mb-2">Current Role</label>
                            <div className="relative">
                                <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                                <input
                                    type="text"
                                    name="currentRole"
                                    value={formData.currentRole}
                                    onChange={handleChange}
                                    className="input-field pl-12"
                                    placeholder="e.g., Junior Developer, Student"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-white/80 mb-2">Target Role</label>
                            <div className="relative">
                                <Target className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                                <input
                                    type="text"
                                    name="targetRole"
                                    value={formData.targetRole}
                                    onChange={handleChange}
                                    className="input-field pl-12"
                                    placeholder="e.g., Senior Full-Stack Developer"
                                />
                            </div>
                        </div>
                    </motion.div>
                )}

                {error && (
                    <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-danger-500 text-sm"
                    >
                        {error}
                    </motion.p>
                )}

                <div className="flex gap-3">
                    {step === 2 && (
                        <button
                            type="button"
                            onClick={() => setStep(1)}
                            className="btn-secondary flex-1"
                        >
                            Back
                        </button>
                    )}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="btn-primary flex-1 flex items-center justify-center gap-2"
                    >
                        {isLoading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <>
                                {step === 1 ? 'Continue' : 'Create Account'}
                                <ArrowRight className="w-5 h-5" />
                            </>
                        )}
                    </button>
                </div>
            </form>

            <p className="mt-6 text-center text-white/60">
                Already have an account?{' '}
                <Link to="/login" className="text-primary-400 hover:text-primary-300 font-medium">
                    Sign in
                </Link>
            </p>
        </div>
    );
}
