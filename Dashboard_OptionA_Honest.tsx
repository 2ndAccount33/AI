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
    AlertCircle,
} from 'lucide-react';
import { motion } from 'framer-motion';

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

    // ACTUAL DATA from user object
    const actualStats = [
        { 
            label: 'Current Level', 
            value: user?.level || 1, 
            icon: Trophy, 
            color: 'from-purple-500 to-pink-500',
            isReal: true 
        },
        { 
            label: 'Total XP', 
            value: user?.xp || 0, 
            icon: Star, 
            color: 'from-yellow-500 to-orange-500',
            isReal: true 
        },
        { 
            label: 'Badges Earned', 
            value: user?.badges?.length || 0, 
            icon: Trophy, 
            color: 'from-green-500 to-emerald-500',
            isReal: true 
        },
        { 
            label: 'Modules Done', 
            value: user?.completedModules?.length || 0, 
            icon: Target, 
            color: 'from-blue-500 to-cyan-500',
            isReal: true 
        },
    ];

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
                            Ready to continue your learning journey?
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

            {/* Quick Stats - REAL DATA ONLY */}
            <motion.div variants={item} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {actualStats.map((stat) => (
                    <div key={stat.label} className="glass-card-hover p-4 rounded-xl">
                        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center mb-3`}>
                            <stat.icon className="w-5 h-5 text-white" />
                        </div>
                        <p className="text-2xl font-bold text-white">{stat.value}</p>
                        <p className="text-sm text-white/60">{stat.label}</p>
                    </div>
                ))}
            </motion.div>

            {/* Main Action Cards */}
            <motion.div variants={item} className="grid md:grid-cols-3 gap-4">
                {/* Learning Roadmap Card */}
                <Link to="/roadmap" className="glass-card-hover p-6 rounded-2xl group">
                    <div className="flex items-start justify-between mb-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                            <BookOpen className="w-6 h-6 text-white" />
                        </div>
                        <ChevronRight className="w-5 h-5 text-white/40 group-hover:text-white/80 transition-colors" />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">Learning Roadmap</h3>
                    <p className="text-sm text-white/60 mb-4">
                        Continue your personalized path
                    </p>
                    <div className="w-full bg-white/10 rounded-full h-2 mb-2">
                        <div 
                            className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"
                            style={{ width: '0%' }}
                        />
                    </div>
                    <p className="text-xs text-white/40">No roadmap created yet</p>
                </Link>

                {/* Gamified Quests Card */}
                <Link to="/assessments" className="glass-card-hover p-6 rounded-2xl group">
                    <div className="flex items-start justify-between mb-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center">
                            <Trophy className="w-6 h-6 text-white" />
                        </div>
                        <ChevronRight className="w-5 h-5 text-white/40 group-hover:text-white/80 transition-colors" />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">Gamified Quests</h3>
                    <p className="text-sm text-white/60 mb-4">
                        Take on challenges and earn XP
                    </p>
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-500/20 border border-purple-500/30 rounded-lg w-fit">
                        <Sparkles className="w-4 h-4 text-purple-400" />
                        <span className="text-sm text-purple-300">No active quests</span>
                    </div>
                </Link>

                {/* Aptitude Test Card */}
                <Link to="/aptitude" className="glass-card-hover p-6 rounded-2xl group">
                    <div className="flex items-start justify-between mb-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-teal-500 flex items-center justify-center">
                            <Brain className="w-6 h-6 text-white" />
                        </div>
                        <ChevronRight className="w-5 h-5 text-white/40 group-hover:text-white/80 transition-colors" />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">Aptitude Test</h3>
                    <p className="text-sm text-white/60 mb-4">
                        AI-powered skill assessment
                    </p>
                    <div className="px-3 py-1.5 bg-green-500/20 border border-green-500/30 rounded-lg w-fit">
                        <span className="text-sm text-green-300">Ready to start</span>
                    </div>
                </Link>
            </motion.div>

            {/* Recent Activity - Only show if there's actual activity */}
            <motion.div variants={item} className="glass-card p-6 rounded-2xl">
                <h2 className="text-xl font-bold text-white mb-4">Recent Activity</h2>
                
                {user?.xp === 0 && (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                            <AlertCircle className="w-8 h-8 text-white/40" />
                        </div>
                        <p className="text-white/60 mb-2">No activity yet</p>
                        <p className="text-sm text-white/40 mb-4">
                            Start your learning journey to see your progress here
                        </p>
                        <Link 
                            to="/roadmap"
                            className="px-4 py-2 bg-primary-500 hover:bg-primary-600 rounded-lg text-white text-sm font-medium transition-colors"
                        >
                            Create Learning Roadmap
                        </Link>
                    </div>
                )}

                {user?.xp > 0 && user.badges && user.badges.length > 0 && (
                    <div className="space-y-3">
                        {user.badges.slice(0, 3).map((badge, index) => (
                            <div key={badge.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors">
                                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center flex-shrink-0">
                                    <Trophy className="w-5 h-5 text-white" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-white font-medium">{badge.name}</p>
                                    <p className="text-sm text-white/60">{badge.description}</p>
                                </div>
                                <span className="text-xs text-white/40">
                                    {new Date(badge.earnedAt).toLocaleDateString()}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </motion.div>

            {/* Getting Started Guide - For new users */}
            {user?.xp === 0 && (
                <motion.div variants={item} className="glass-card p-6 rounded-2xl border border-primary-500/20">
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                            <Sparkles className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white mb-2">Getting Started</h3>
                            <p className="text-white/60 mb-4">
                                Welcome to AgentX AI! Here's how to begin your learning journey:
                            </p>
                            <ol className="space-y-2 text-sm text-white/80 list-decimal list-inside">
                                <li>Create your personalized learning roadmap</li>
                                <li>Complete quests and assessments to earn XP</li>
                                <li>Take aptitude tests to identify skill gaps</li>
                                <li>Track your progress and earn badges</li>
                            </ol>
                        </div>
                    </div>
                </motion.div>
            )}
        </motion.div>
    );
}
