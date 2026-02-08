import { useState, useCallback } from 'react';
import {
    Brain,
    Network,
    Zap,
    MessageSquare,
    CheckCircle2,
    Clock,
    ChevronRight,
    Activity,
    Bot,
    Workflow,
    Sparkles
} from 'lucide-react';

interface AgentStatus {
    id: string;
    name: string;
    role: string;
    status: 'idle' | 'thinking' | 'acting' | 'collaborating' | 'completed';
    currentTask?: string;
    confidence?: number;
    lastAction?: string;
    reasoning?: string[];
}

interface AgentMessage {
    id: string;
    from: string;
    to: string;
    type: 'request' | 'response' | 'decision' | 'handoff';
    content: string;
    timestamp: Date;
}

interface DecisionLog {
    id: string;
    agent: string;
    decision: string;
    reasoning: string[];
    confidence: number;
    timestamp: Date;
    outcome?: string;
}

const AgentOrchestrator = () => {
    const [agents, setAgents] = useState<AgentStatus[]>([
        {
            id: 'skill-gap',
            name: 'Skill-Gap Analyzer',
            role: 'Analyzes resumes and identifies learning paths',
            status: 'idle',
            confidence: 95,
            lastAction: 'Analyzed 3 skill gaps',
        },
        {
            id: 'assessment',
            name: 'Assessment Generator',
            role: 'Creates gamified quizzes and challenges',
            status: 'idle',
            confidence: 92,
            lastAction: 'Generated 15 quiz questions',
        },
        {
            id: 'aptitude',
            name: 'Career Aptitude AI',
            role: 'Conducts adaptive interviews',
            status: 'idle',
            confidence: 88,
            lastAction: 'Completed interview session',
        },
        {
            id: 'job-matcher',
            name: 'Job Matcher',
            role: 'Autonomously matches skills to opportunities',
            status: 'idle',
            confidence: 90,
            lastAction: 'Found 5 matching jobs',
        },
    ]);

    const [messages, setMessages] = useState<AgentMessage[]>([]);
    const [decisionLogs, setDecisionLogs] = useState<DecisionLog[]>([]);
    const [isOrchestrating, setIsOrchestrating] = useState(false);
    const [activeWorkflow, setActiveWorkflow] = useState<string | null>(null);

    const simulateDelay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    const startAutonomousWorkflow = useCallback(async () => {
        setIsOrchestrating(true);
        setActiveWorkflow('full-career-analysis');

        setAgents(prev => prev.map(a =>
            a.id === 'skill-gap' ? { ...a, status: 'thinking' as const, currentTask: 'Analyzing resume...' } : a
        ));

        await simulateDelay(1500);

        const reasoning1: DecisionLog = {
            id: '1',
            agent: 'Skill-Gap Analyzer',
            decision: 'Identified 5 key skill gaps for target role',
            reasoning: [
                'Resume shows strong JavaScript fundamentals',
                'Missing cloud infrastructure experience (AWS/GCP)',
                'Need to add system design knowledge',
                'Recommend focusing on distributed systems',
                'Priority: Cloud → System Design → DSA'
            ],
            confidence: 94,
            timestamp: new Date(),
        };
        setDecisionLogs(prev => [reasoning1, ...prev]);

        const msg1: AgentMessage = {
            id: '1',
            from: 'Skill-Gap Analyzer',
            to: 'Assessment Generator',
            type: 'handoff',
            content: 'Skill gaps identified. Please generate assessments for: Cloud Computing, System Design, Distributed Systems',
            timestamp: new Date(),
        };
        setMessages(prev => [msg1, ...prev]);

        setAgents(prev => prev.map(a =>
            a.id === 'skill-gap' ? { ...a, status: 'completed' as const, currentTask: undefined, lastAction: 'Identified 5 skill gaps' } :
                a.id === 'assessment' ? { ...a, status: 'thinking' as const, currentTask: 'Generating assessments...' } : a
        ));

        await simulateDelay(2000);

        const reasoning2: DecisionLog = {
            id: '2',
            agent: 'Assessment Generator',
            decision: 'Created adaptive assessment plan',
            reasoning: [
                'Generating 3 difficulty levels per topic',
                'Including hands-on coding challenges',
                'Adding real-world scenario questions',
                'Boss battle: Full system design challenge',
                'Estimated completion: 2-3 hours'
            ],
            confidence: 91,
            timestamp: new Date(),
        };
        setDecisionLogs(prev => [reasoning2, ...prev]);

        const msg2: AgentMessage = {
            id: '2',
            from: 'Assessment Generator',
            to: 'Job Matcher',
            type: 'request',
            content: 'Assessment ready. Can you find jobs that match current skill level + growth trajectory?',
            timestamp: new Date(),
        };
        setMessages(prev => [msg2, ...prev]);

        setAgents(prev => prev.map(a =>
            a.id === 'assessment' ? { ...a, status: 'completed' as const, currentTask: undefined, lastAction: 'Created 20 assessments' } :
                a.id === 'job-matcher' ? { ...a, status: 'thinking' as const, currentTask: 'Scanning job market...' } : a
        ));

        await simulateDelay(1800);

        const reasoning3: DecisionLog = {
            id: '3',
            agent: 'Job Matcher',
            decision: 'Found 8 suitable job opportunities',
            reasoning: [
                'Scanned 500+ job listings across platforms',
                'Applied skill-match algorithm',
                'Filtered by salary expectations',
                'Prioritized growth-oriented companies',
                'Selected top 8 with 80%+ match score'
            ],
            confidence: 87,
            timestamp: new Date(),
        };
        setDecisionLogs(prev => [reasoning3, ...prev]);

        const msg3: AgentMessage = {
            id: '3',
            from: 'Job Matcher',
            to: 'Aptitude AI',
            type: 'handoff',
            content: '8 jobs matched. Prepare interview simulations for top 3 positions.',
            timestamp: new Date(),
        };
        setMessages(prev => [msg3, ...prev]);

        setAgents(prev => prev.map(a =>
            a.id === 'job-matcher' ? { ...a, status: 'completed' as const, currentTask: undefined, lastAction: 'Matched 8 jobs' } :
                a.id === 'aptitude' ? { ...a, status: 'collaborating' as const, currentTask: 'Preparing interview sim...' } : a
        ));

        await simulateDelay(1500);

        const reasoning4: DecisionLog = {
            id: '4',
            agent: 'Multi-Agent Consensus',
            decision: 'Generated personalized career acceleration plan',
            reasoning: [
                '✓ All 4 agents reached consensus',
                '✓ 30-day intensive learning path created',
                '✓ 8 job applications ready to submit',
                '✓ Mock interview schedule prepared',
                '✓ Success probability: 78%'
            ],
            confidence: 89,
            timestamp: new Date(),
        };
        setDecisionLogs(prev => [reasoning4, ...prev]);

        setAgents(prev => prev.map(a => ({ ...a, status: 'idle' as const, currentTask: undefined })));
        setIsOrchestrating(false);
        setActiveWorkflow(null);

    }, []);

    const getStatusColor = (status: AgentStatus['status']) => {
        switch (status) {
            case 'idle': return 'bg-slate-500';
            case 'thinking': return 'bg-amber-500 animate-pulse';
            case 'acting': return 'bg-sky-500 animate-pulse';
            case 'collaborating': return 'bg-fuchsia-500 animate-pulse';
            case 'completed': return 'bg-green-500';
        }
    };

    const getStatusIcon = (status: AgentStatus['status']) => {
        switch (status) {
            case 'idle': return <Clock className="w-4 h-4" />;
            case 'thinking': return <Brain className="w-4 h-4 animate-spin" />;
            case 'acting': return <Zap className="w-4 h-4" />;
            case 'collaborating': return <Network className="w-4 h-4" />;
            case 'completed': return <CheckCircle2 className="w-4 h-4" />;
        }
    };

    return (
        <div className="min-h-screen p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                            <Workflow className="w-8 h-8 text-sky-400" />
                            Agent Orchestration Center
                        </h1>
                        <p className="text-slate-400 mt-1">Real-time AI agent collaboration and decision making</p>
                    </div>

                    <button
                        onClick={startAutonomousWorkflow}
                        disabled={isOrchestrating}
                        className="btn-primary flex items-center gap-2 disabled:opacity-50"
                    >
                        {isOrchestrating ? (
                            <>
                                <Activity className="w-5 h-5 animate-spin" />
                                Orchestrating...
                            </>
                        ) : (
                            <>
                                <Sparkles className="w-5 h-5" />
                                Start Autonomous Workflow
                            </>
                        )}
                    </button>
                </div>

                {activeWorkflow && (
                    <div className="glass-card p-4 border-sky-500/50 bg-sky-500/10">
                        <div className="flex items-center gap-3">
                            <div className="w-3 h-3 bg-sky-500 rounded-full animate-pulse" />
                            <span className="text-sky-400 font-medium">Active Workflow:</span>
                            <span className="text-white">Full Career Analysis Pipeline</span>
                            <div className="ml-auto flex items-center gap-2 text-slate-400 text-sm">
                                <Activity className="w-4 h-4" />
                                Agents collaborating...
                            </div>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {agents.map((agent) => (
                        <div
                            key={agent.id}
                            className={`glass-card p-5 transition-all duration-300 ${agent.status !== 'idle' ? 'ring-2 ring-sky-500/50' : ''
                                }`}
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div className={`p-2 rounded-lg ${getStatusColor(agent.status)}/20`}>
                                    <Bot className={`w-6 h-6 ${agent.status === 'idle' ? 'text-slate-400' :
                                            agent.status === 'thinking' ? 'text-amber-400' :
                                                agent.status === 'collaborating' ? 'text-fuchsia-400' :
                                                    'text-sky-400'
                                        }`} />
                                </div>
                                <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs ${getStatusColor(agent.status)}/20`}>
                                    {getStatusIcon(agent.status)}
                                    <span className="capitalize text-white">{agent.status}</span>
                                </div>
                            </div>

                            <h3 className="text-white font-semibold mb-1">{agent.name}</h3>
                            <p className="text-slate-400 text-sm mb-3">{agent.role}</p>

                            {agent.currentTask && (
                                <div className="bg-sky-500/10 border border-sky-500/30 rounded-lg p-2 mb-3">
                                    <p className="text-sky-400 text-sm">{agent.currentTask}</p>
                                </div>
                            )}

                            <div className="flex items-center justify-between text-sm">
                                <span className="text-slate-500">Confidence</span>
                                <span className="text-green-400">{agent.confidence}%</span>
                            </div>
                            <div className="xp-bar mt-2">
                                <div className="xp-bar-fill" style={{ width: `${agent.confidence}%` }} />
                            </div>

                            {agent.lastAction && (
                                <p className="text-slate-500 text-xs mt-3 flex items-center gap-1">
                                    <CheckCircle2 className="w-3 h-3" />
                                    {agent.lastAction}
                                </p>
                            )}
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="glass-card p-5">
                        <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                            <MessageSquare className="w-5 h-5 text-sky-400" />
                            Agent Communication
                        </h2>

                        <div className="space-y-3 max-h-80 overflow-y-auto">
                            {messages.length === 0 ? (
                                <p className="text-slate-500 text-center py-8">
                                    Start a workflow to see agent communication
                                </p>
                            ) : (
                                messages.map((msg) => (
                                    <div
                                        key={msg.id}
                                        className={`p-3 rounded-lg border ${msg.type === 'handoff' ? 'bg-fuchsia-500/10 border-fuchsia-500/30' :
                                                msg.type === 'decision' ? 'bg-green-500/10 border-green-500/30' :
                                                    'bg-sky-500/10 border-sky-500/30'
                                            }`}
                                    >
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="text-sky-400 font-medium text-sm">{msg.from}</span>
                                            <ChevronRight className="w-4 h-4 text-slate-500" />
                                            <span className="text-fuchsia-400 font-medium text-sm">{msg.to}</span>
                                            <span className={`ml-auto text-xs px-2 py-0.5 rounded ${msg.type === 'handoff' ? 'bg-fuchsia-500/20 text-fuchsia-400' :
                                                    msg.type === 'decision' ? 'bg-green-500/20 text-green-400' :
                                                        'bg-sky-500/20 text-sky-400'
                                                }`}>
                                                {msg.type}
                                            </span>
                                        </div>
                                        <p className="text-slate-300 text-sm">{msg.content}</p>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    <div className="glass-card p-5">
                        <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                            <Brain className="w-5 h-5 text-fuchsia-400" />
                            Decision & Reasoning Logs
                        </h2>

                        <div className="space-y-3 max-h-80 overflow-y-auto">
                            {decisionLogs.length === 0 ? (
                                <p className="text-slate-500 text-center py-8">
                                    Agent decisions will appear here
                                </p>
                            ) : (
                                decisionLogs.map((log) => (
                                    <div key={log.id} className="p-3 rounded-lg bg-slate-800/50 border border-slate-700">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-fuchsia-400 font-medium text-sm">{log.agent}</span>
                                            <span className="text-xs text-green-400">{log.confidence}% confident</span>
                                        </div>
                                        <p className="text-white font-medium mb-2">{log.decision}</p>
                                        <ul className="space-y-1">
                                            {log.reasoning.map((reason, i) => (
                                                <li key={i} className="text-slate-400 text-sm flex items-start gap-2">
                                                    <span className="text-sky-400 mt-1">•</span>
                                                    {reason}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AgentOrchestrator;
