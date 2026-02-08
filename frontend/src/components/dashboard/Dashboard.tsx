import { useAuthStore } from '@/store/authStore';
import { Link } from 'react-router-dom';
import {
    Trophy,
    Target,
    BookOpen,
    Brain,
    TrendingUp,
    Clock,
    Star,
    ChevronRight,
    Sparkles,
} from 'lucide-react';
import { motion } from 'framer-motion';

// Mock data for demo
const recentActivity = [
    { id: 1, type: 'xp', description: 'Completed React Basics Quiz', xp: 150, time: '2 hours ago' },
    { id: 2, type: 'badge', description: 'Earned "Quick Learner" badge', time: '5 hours ago' },
    { id: 3, type: 'milestone', description: 'Unlocked Stage 2: Advanced Hooks', time: '1 day ago' },
];

const quickStats = [
    { label: 'Learning Streak', value: '7 days', icon: TrendingUp, color: 'from-orange-500 to-red-500' },
    { label: 'Skills Mastered', value: '12', icon: Star, color: 'from-yellow-500 to-orange-500' },
    { label: 'Study Time', value: '42h', icon: Clock, color: 'from-green-500 to-emerald-500' },
    { label: 'Quests Done', value: '28', icon: Target, color: 'from-blue-500 to-cyan-500' },
];

const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: { staggerChildren: 0.1 },
    },
};

const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
};

export default function Dashboard() {
    const { user } = useAuthStore();

    const xpForNextLevel = (user?.level || 1) * 1000;
    const xpProgress = ((user?.xp || 0) % 1000) / 10;

    return (
        <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="space-y-6"
        >
            {/* Welcome Header */}
            <motion.div variants={item} className="glass-card p-6 rounded-2xl">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
                            Welcome back, <span className="gradient-text">{user?.profile?.name || 'Developer'}</span>! 👋
                        </h1>
                        <p className="text-white/60">
                            You're on a {7}-day learning streak. Keep it up!
                        </p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-right">
                            <p className="text-sm text-white/60">Level {user?.level || 1}</p>
                            <p className="text-lg font-bold text-primary-400">{user?.xp || 0} XP</p>
                        </div>
                        <div className="relative w-16 h-16">
                            <svg className="w-16 h-16 transform -rotate-90">
                                <circle
                                    cx="32"
                                    cy="32"
                                    r="28"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                    fill="transparent"
                                    className="text-white/10"
                                />
                                <circle
                                    cx="32"
                                    cy="32"
                                    r="28"
                                    stroke="url(#gradient)"
                                    strokeWidth="4"
                                    fill="transparent"
                                    strokeDasharray={`${xpProgress * 1.76} 176`}
                                    strokeLinecap="round"
                                />
                                <defs>
                                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                        <stop offset="0%" stopColor="#0ea5e9" />
                                        <stop offset="100%" stopColor="#d946ef" />
                                    </linearGradient>
                                </defs>
                            </svg>
                            <span className="absolute inset-0 flex items-center justify-center text-sm font-bold">
                                {Math.round(xpProgress)}%
                            </span>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Quick Stats */}
            <motion.div variants={item} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {quickStats.map((stat) => (
                    <div key={stat.label} className="glass-card-hover p-4 rounded-xl">
                        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center mb-3`}>
                            <stat.icon className="w-5 h-5 text-white" />
                        </div>
                        <p className="text-2xl font-bold text-white">{stat.value}</p>
                        <p className="text-sm text-white/60">{stat.label}</p>
                    </div>
                ))}
            </motion.div>

            {/* Quick Actions */}
            <motion.div variants={item} className="grid md:grid-cols-3 gap-4">
                <Link to="/roadmap" className="glass-card-hover p-6 rounded-xl group">
                    <div className="flex items-start justify-between mb-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
                            <BookOpen className="w-6 h-6 text-white" />
                        </div>
                        <ChevronRight className="w-5 h-5 text-white/40 group-hover:text-white group-hover:translate-x-1 transition-all" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-1">Learning Roadmap</h3>
                    <p className="text-sm text-white/60">Continue your personalized path</p>
                    <div className="mt-4">
                        <div className="xp-bar">
                            <div className="xp-bar-fill" style={{ width: '45%' }} />
                        </div>
                        <p className="text-xs text-white/40 mt-1">45% complete</p>
                    </div>
                </Link>

                <Link to="/assessment" className="glass-card-hover p-6 rounded-xl group">
                    <div className="flex items-start justify-between mb-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent-500 to-accent-600 flex items-center justify-center">
                            <Trophy className="w-6 h-6 text-white" />
                        </div>
                        <ChevronRight className="w-5 h-5 text-white/40 group-hover:text-white group-hover:translate-x-1 transition-all" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-1">Gamified Quests</h3>
                    <p className="text-sm text-white/60">Take on challenges and earn XP</p>
                    <div className="flex items-center gap-2 mt-4">
                        <span className="badge-primary">
                            <Sparkles className="w-3 h-3" />
                            3 new quests
                        </span>
                    </div>
                </Link>

                <Link to="/aptitude" className="glass-card-hover p-6 rounded-xl group">
                    <div className="flex items-start justify-between mb-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-success-500 to-success-600 flex items-center justify-center">
                            <Brain className="w-6 h-6 text-white" />
                        </div>
                        <ChevronRight className="w-5 h-5 text-white/40 group-hover:text-white group-hover:translate-x-1 transition-all" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-1">Aptitude Test</h3>
                    <p className="text-sm text-white/60">AI-powered skill assessment</p>
                    <div className="flex items-center gap-2 mt-4">
                        <span className="badge-success">Ready to start</span>
                    </div>
                </Link>
            </motion.div>

            {/* Recent Activity */}
            <motion.div variants={item} className="glass-card p-6 rounded-2xl">
                <h2 className="text-lg font-semibold text-white mb-4">Recent Activity</h2>
                <div className="space-y-4">
                    {recentActivity.map((activity) => (
                        <div
                            key={activity.id}
                            className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <div
                                    className={`w-10 h-10 rounded-lg flex items-center justify-center ${activity.type === 'xp'
                                            ? 'bg-primary-500/20 text-primary-400'
                                            : activity.type === 'badge'
                                                ? 'bg-accent-500/20 text-accent-400'
                                                : 'bg-success-500/20 text-success-500'
                                        }`}
                                >
                                    {activity.type === 'xp' ? (
                                        <TrendingUp className="w-5 h-5" />
                                    ) : activity.type === 'badge' ? (
                                        <Star className="w-5 h-5" />
                                    ) : (
                                        <Target className="w-5 h-5" />
                                    )}
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-white">{activity.description}</p>
                                    <p className="text-xs text-white/40">{activity.time}</p>
                                </div>
                            </div>
                            {activity.xp && (
                                <span className="text-primary-400 font-semibold">+{activity.xp} XP</span>
                            )}
                        </div>
                    ))}
                </div>
            </motion.div>
        </motion.div>
    );
}
