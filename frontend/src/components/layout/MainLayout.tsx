import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import {
    LayoutDashboard,
    Map,
    Gamepad2,
    Brain,
    Briefcase,
    LogOut,
    User,
    Zap,
    Menu,
    X,
    Workflow,
    Target,
} from 'lucide-react';
import { useState } from 'react';

const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/orchestrator', icon: Workflow, label: 'Agent Orchestrator', badge: 'AI' },
    { to: '/roadmap', icon: Map, label: 'Learning Roadmap' },
    { to: '/assessment', icon: Gamepad2, label: 'Assessments' },
    { to: '/aptitude', icon: Brain, label: 'Aptitude Test' },
    { to: '/job-matcher', icon: Target, label: 'Auto Job Matcher', badge: 'NEW' },
    { to: '/jobs', icon: Briefcase, label: 'Job Board' },
];

export default function MainLayout() {
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const xpForNextLevel = (user?.level || 1) * 1000;
    const xpProgress = ((user?.xp || 0) % 1000) / 10;

    return (
        <div className="min-h-screen flex">
            {/* Sidebar - Desktop */}
            <aside className="hidden lg:flex flex-col w-72 glass-card m-4 rounded-2xl p-6">
                {/* Logo */}
                <div className="flex items-center gap-3 mb-8">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-fuchsia-500 flex items-center justify-center">
                        <Zap className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-xl font-bold gradient-text">AgentX AI</span>
                </div>

                {/* User Info */}
                <div className="glass-card p-4 rounded-xl mb-6">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-500 to-fuchsia-500 flex items-center justify-center">
                            <User className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <p className="font-medium text-white">{user?.profile?.name || 'User'}</p>
                            <p className="text-xs text-white/60">Level {user?.level || 1}</p>
                        </div>
                    </div>
                    <div className="xp-bar">
                        <div className="xp-bar-fill" style={{ width: `${xpProgress}%` }} />
                    </div>
                    <p className="text-xs text-white/40 mt-1">
                        {user?.xp || 0} / {xpForNextLevel} XP
                    </p>
                </div>

                {/* Navigation */}
                <nav className="flex-1 space-y-2">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${isActive
                                    ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                                    : 'text-white/60 hover:bg-white/5 hover:text-white'
                                }`
                            }
                        >
                            <item.icon className="w-5 h-5" />
                            <span className="font-medium flex-1">{item.label}</span>
                            {item.badge && (
                                <span className={`text-xs px-2 py-0.5 rounded-full ${item.badge === 'AI'
                                        ? 'bg-fuchsia-500/20 text-fuchsia-400'
                                        : 'bg-green-500/20 text-green-400'
                                    }`}>
                                    {item.badge}
                                </span>
                            )}
                        </NavLink>
                    ))}
                </nav>

                {/* Logout */}
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-white/60 hover:bg-red-500/20 hover:text-red-500 transition-all duration-200 mt-4"
                >
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium">Logout</span>
                </button>
            </aside>

            {/* Mobile Header */}
            <div className="lg:hidden fixed top-0 left-0 right-0 z-50 glass-card m-2 rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-500 to-fuchsia-500 flex items-center justify-center">
                        <Zap className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-bold gradient-text">AgentX AI</span>
                </div>
                <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                >
                    {isMobileMenuOpen ? <X className="w-5 h-5 text-white" /> : <Menu className="w-5 h-5 text-white" />}
                </button>
            </div>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <div className="lg:hidden fixed top-16 left-2 right-2 z-40 glass-card rounded-xl p-4">
                    <nav className="space-y-2">
                        {navItems.map((item) => (
                            <NavLink
                                key={item.to}
                                to={item.to}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={({ isActive }) =>
                                    `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive
                                        ? 'bg-sky-500/20 text-sky-400'
                                        : 'text-white/60 hover:bg-white/5'
                                    }`
                                }
                            >
                                <item.icon className="w-5 h-5" />
                                <span className="flex-1">{item.label}</span>
                                {item.badge && (
                                    <span className={`text-xs px-2 py-0.5 rounded-full ${item.badge === 'AI'
                                            ? 'bg-fuchsia-500/20 text-fuchsia-400'
                                            : 'bg-green-500/20 text-green-400'
                                        }`}>
                                        {item.badge}
                                    </span>
                                )}
                            </NavLink>
                        ))}
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-white/60 hover:bg-red-500/20 hover:text-red-500"
                        >
                            <LogOut className="w-5 h-5" />
                            <span>Logout</span>
                        </button>
                    </nav>
                </div>
            )}

            {/* Main Content */}
            <main className="flex-1 p-4 lg:p-6 lg:pl-0 pt-20 lg:pt-6 overflow-auto">
                <Outlet />
            </main>
        </div>
    );
}
