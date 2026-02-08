import { useState } from 'react';
import {
    Briefcase,
    MapPin,
    DollarSign,
    Bot,
    Zap,
    CheckCircle2,
    Sparkles,
    Target,
    TrendingUp,
    Brain,
    Building2
} from 'lucide-react';

interface Job {
    id: string;
    title: string;
    company: string;
    location: string;
    salary: string;
    matchScore: number;
    skillMatch: string[];
    skillGaps: string[];
    type: 'remote' | 'hybrid' | 'onsite';
    posted: string;
    autoMatched: boolean;
    agentRecommendation?: string;
}

interface MatchingStatus {
    phase: 'idle' | 'scanning' | 'analyzing' | 'matching' | 'complete';
    progress: number;
    jobsScanned: number;
    matchesFound: number;
}

const AutonomousJobMatcher = () => {
    const [status, setStatus] = useState<MatchingStatus>({
        phase: 'idle',
        progress: 0,
        jobsScanned: 0,
        matchesFound: 0,
    });

    const [matchedJobs, setMatchedJobs] = useState<Job[]>([]);
    const [selectedJob, setSelectedJob] = useState<Job | null>(null);
    const [agentThoughts, setAgentThoughts] = useState<string[]>([]);

    const startAutonomousMatching = async () => {
        setAgentThoughts([]);
        setMatchedJobs([]);

        // Phase 1: Scanning
        setStatus({ phase: 'scanning', progress: 10, jobsScanned: 0, matchesFound: 0 });
        addThought("🔍 Starting autonomous job scan across 15+ platforms...");
        await delay(800);

        addThought("📊 Loaded user profile: JavaScript, React, Node.js, 2 years experience");
        setStatus({ phase: 'scanning', progress: 25, jobsScanned: 127, matchesFound: 0 });
        await delay(600);

        addThought("🌐 Scanning LinkedIn, Indeed, Naukri, AngelList...");
        setStatus({ phase: 'scanning', progress: 40, jobsScanned: 342, matchesFound: 0 });
        await delay(700);

        // Phase 2: Analyzing
        setStatus({ phase: 'analyzing', progress: 50, jobsScanned: 512, matchesFound: 0 });
        addThought("🧠 Analyzing job descriptions with NLP...");
        await delay(600);

        addThought("📝 Extracting required skills and experience levels...");
        setStatus({ phase: 'analyzing', progress: 65, jobsScanned: 512, matchesFound: 0 });
        await delay(500);

        // Phase 3: Matching
        setStatus({ phase: 'matching', progress: 75, jobsScanned: 512, matchesFound: 3 });
        addThought("⚡ Running skill-gap matching algorithm...");
        await delay(600);

        addThought("🎯 Found 8 high-match opportunities (>75% skill match)");
        setStatus({ phase: 'matching', progress: 90, jobsScanned: 512, matchesFound: 8 });
        await delay(500);

        // Generate matched jobs
        const jobs: Job[] = [
            {
                id: '1',
                title: 'Senior Frontend Developer',
                company: 'TechCorp India',
                location: 'Bangalore',
                salary: '₹18-25 LPA',
                matchScore: 94,
                skillMatch: ['React', 'TypeScript', 'Node.js', 'REST APIs'],
                skillGaps: ['AWS'],
                type: 'hybrid',
                posted: '2 days ago',
                autoMatched: true,
                agentRecommendation: 'Excellent match! Your React experience aligns perfectly. Consider upskilling in AWS before applying.',
            },
            {
                id: '2',
                title: 'Full Stack Developer',
                company: 'Startup Hub',
                location: 'Remote',
                salary: '₹15-22 LPA',
                matchScore: 89,
                skillMatch: ['JavaScript', 'React', 'MongoDB', 'Express'],
                skillGaps: ['Docker', 'Kubernetes'],
                type: 'remote',
                posted: '1 day ago',
                autoMatched: true,
                agentRecommendation: 'Great remote opportunity! They value practical experience over certifications.',
            },
            {
                id: '3',
                title: 'React Developer',
                company: 'FinTech Solutions',
                location: 'Mumbai',
                salary: '₹20-28 LPA',
                matchScore: 87,
                skillMatch: ['React', 'Redux', 'TypeScript'],
                skillGaps: ['GraphQL', 'Testing'],
                type: 'hybrid',
                posted: '3 days ago',
                autoMatched: true,
                agentRecommendation: 'High-paying fintech role. Recommend learning Jest/RTL before interview.',
            },
            {
                id: '4',
                title: 'JavaScript Engineer',
                company: 'Global Tech',
                location: 'Hyderabad',
                salary: '₹16-20 LPA',
                matchScore: 82,
                skillMatch: ['JavaScript', 'Node.js', 'SQL'],
                skillGaps: ['System Design'],
                type: 'onsite',
                posted: '5 days ago',
                autoMatched: true,
                agentRecommendation: 'Focus on system design prep. Company known for good work-life balance.',
            },
        ];

        setMatchedJobs(jobs);

        // Complete
        setStatus({ phase: 'complete', progress: 100, jobsScanned: 512, matchesFound: 8 });
        addThought("✅ Autonomous matching complete! 8 jobs matched, 4 highly recommended.");
        addThought("🚀 Ready to auto-generate learning paths for skill gaps.");
    };

    const addThought = (thought: string) => {
        setAgentThoughts(prev => [...prev, thought]);
    };

    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    const getMatchColor = (score: number) => {
        if (score >= 90) return 'text-green-400 bg-green-500/20';
        if (score >= 80) return 'text-sky-400 bg-sky-500/20';
        if (score >= 70) return 'text-amber-400 bg-amber-500/20';
        return 'text-slate-400 bg-slate-500/20';
    };

    const startLearningPath = (job: Job) => {
        // This would trigger the skill-gap agent
        alert(`Starting learning path for: ${job.skillGaps.join(', ')}\n\nThis will trigger the Skill-Gap Agent to create a personalized roadmap!`);
    };

    return (
        <div className="min-h-screen p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                            <Target className="w-8 h-8 text-fuchsia-400" />
                            Autonomous Job Matcher
                        </h1>
                        <p className="text-slate-400 mt-1">AI agent that finds and matches jobs with minimal input</p>
                    </div>

                    <button
                        onClick={startAutonomousMatching}
                        disabled={status.phase !== 'idle' && status.phase !== 'complete'}
                        className="btn-primary flex items-center gap-2"
                    >
                        <Sparkles className="w-5 h-5" />
                        Start Autonomous Scan
                    </button>
                </div>

                {/* Status Panel */}
                <div className="glass-card p-5">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                            <Bot className="w-5 h-5 text-sky-400" />
                            Agent Status
                        </h2>
                        <span className={`px-3 py-1 rounded-full text-sm ${status.phase === 'idle' ? 'bg-slate-500/20 text-slate-400' :
                            status.phase === 'complete' ? 'bg-green-500/20 text-green-400' :
                                'bg-sky-500/20 text-sky-400'
                            }`}>
                            {status.phase === 'idle' ? 'Ready' :
                                status.phase === 'complete' ? 'Complete' :
                                    'Working...'}
                        </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-4">
                        <div className="flex justify-between text-sm mb-2">
                            <span className="text-slate-400">Progress</span>
                            <span className="text-white">{status.progress}%</span>
                        </div>
                        <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-sky-500 to-fuchsia-500 rounded-full transition-all duration-500"
                                style={{ width: `${status.progress}%` }}
                            />
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-4">
                        <div className="text-center p-3 bg-slate-800/50 rounded-lg">
                            <p className="text-2xl font-bold text-white">{status.jobsScanned}</p>
                            <p className="text-slate-400 text-sm">Jobs Scanned</p>
                        </div>
                        <div className="text-center p-3 bg-slate-800/50 rounded-lg">
                            <p className="text-2xl font-bold text-green-400">{status.matchesFound}</p>
                            <p className="text-slate-400 text-sm">Matches Found</p>
                        </div>
                        <div className="text-center p-3 bg-slate-800/50 rounded-lg">
                            <p className="text-2xl font-bold text-fuchsia-400">
                                {matchedJobs.filter(j => j.matchScore >= 85).length}
                            </p>
                            <p className="text-slate-400 text-sm">High Match (85%+)</p>
                        </div>
                    </div>
                </div>

                {/* Two Column Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Agent Thoughts */}
                    <div className="glass-card p-5">
                        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <Brain className="w-5 h-5 text-fuchsia-400" />
                            Agent Thinking
                        </h2>

                        <div className="space-y-2 max-h-96 overflow-y-auto">
                            {agentThoughts.length === 0 ? (
                                <p className="text-slate-500 text-center py-8">
                                    Start scan to see agent thoughts
                                </p>
                            ) : (
                                agentThoughts.map((thought, i) => (
                                    <div
                                        key={i}
                                        className="p-2 bg-slate-800/50 rounded-lg text-sm text-slate-300 animate-in"
                                    >
                                        {thought}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Matched Jobs */}
                    <div className="lg:col-span-2 glass-card p-5">
                        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <Briefcase className="w-5 h-5 text-sky-400" />
                            Matched Opportunities
                        </h2>

                        <div className="space-y-3 max-h-96 overflow-y-auto">
                            {matchedJobs.length === 0 ? (
                                <p className="text-slate-500 text-center py-8">
                                    No matches yet. Start the autonomous scan!
                                </p>
                            ) : (
                                matchedJobs.map((job) => (
                                    <div
                                        key={job.id}
                                        onClick={() => setSelectedJob(job)}
                                        className={`p-4 rounded-lg border cursor-pointer transition-all ${selectedJob?.id === job.id
                                            ? 'bg-sky-500/10 border-sky-500/50'
                                            : 'bg-slate-800/50 border-slate-700 hover:border-slate-600'
                                            }`}
                                    >
                                        <div className="flex items-start justify-between mb-2">
                                            <div>
                                                <h3 className="text-white font-semibold">{job.title}</h3>
                                                <p className="text-slate-400 text-sm flex items-center gap-2">
                                                    <Building2 className="w-4 h-4" />
                                                    {job.company}
                                                </p>
                                            </div>
                                            <div className={`px-3 py-1 rounded-full text-sm font-bold ${getMatchColor(job.matchScore)}`}>
                                                {job.matchScore}% Match
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap gap-2 mb-3">
                                            <span className="text-xs px-2 py-1 bg-slate-700 rounded text-slate-300 flex items-center gap-1">
                                                <MapPin className="w-3 h-3" />
                                                {job.location}
                                            </span>
                                            <span className="text-xs px-2 py-1 bg-slate-700 rounded text-slate-300 flex items-center gap-1">
                                                <DollarSign className="w-3 h-3" />
                                                {job.salary}
                                            </span>
                                            <span className={`text-xs px-2 py-1 rounded ${job.type === 'remote' ? 'bg-green-500/20 text-green-400' :
                                                job.type === 'hybrid' ? 'bg-sky-500/20 text-sky-400' :
                                                    'bg-amber-500/20 text-amber-400'
                                                }`}>
                                                {job.type}
                                            </span>
                                        </div>

                                        {job.autoMatched && (
                                            <div className="flex items-center gap-2 text-fuchsia-400 text-xs">
                                                <Zap className="w-3 h-3" />
                                                Auto-matched by AI Agent
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Selected Job Detail */}
                {selectedJob && (
                    <div className="glass-card p-5 border-sky-500/30">
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <h2 className="text-xl font-bold text-white">{selectedJob.title}</h2>
                                <p className="text-slate-400">{selectedJob.company} • {selectedJob.location}</p>
                            </div>
                            <button
                                onClick={() => startLearningPath(selectedJob)}
                                className="btn-primary flex items-center gap-2"
                            >
                                <TrendingUp className="w-4 h-4" />
                                Start Learning Path
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                                <h3 className="text-green-400 font-medium mb-2 flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4" />
                                    Skills You Have
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {selectedJob.skillMatch.map((skill) => (
                                        <span key={skill} className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm">
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <h3 className="text-amber-400 font-medium mb-2 flex items-center gap-2">
                                    <Target className="w-4 h-4" />
                                    Skills to Learn
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {selectedJob.skillGaps.map((skill) => (
                                        <span key={skill} className="px-3 py-1 bg-amber-500/20 text-amber-400 rounded-full text-sm">
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {selectedJob.agentRecommendation && (
                            <div className="p-4 bg-fuchsia-500/10 border border-fuchsia-500/30 rounded-lg">
                                <h3 className="text-fuchsia-400 font-medium mb-2 flex items-center gap-2">
                                    <Bot className="w-4 h-4" />
                                    Agent Recommendation
                                </h3>
                                <p className="text-slate-300">{selectedJob.agentRecommendation}</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AutonomousJobMatcher;
