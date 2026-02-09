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
    Sparkles,
    AlertTriangle,
    RefreshCw,
    Target
} from 'lucide-react';

interface AgentStatus {
    id: string;
    name: string;
    role: string;
    status: 'idle' | 'thinking' | 'acting' | 'collaborating' | 'completed' | 'failed' | 'recovering';
    currentTask?: string;
    confidence?: number;
    lastAction?: string;
}

interface AgentMessage {
    id: string;
    from: string;
    to: string;
    type: 'request' | 'response' | 'decision' | 'handoff' | 'failure' | 'recovery';
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
    status: 'success' | 'failure' | 'recovery' | 'thinking';
}

const AgentOrchestrator = () => {
    const [agents, setAgents] = useState<AgentStatus[]>([
        {
            id: 'skill-gap',
            name: 'Skill-Gap Analyzer',
            role: 'Analyzes resumes and identifies job preferences',
            status: 'idle',
            confidence: 95,
            lastAction: 'Ready',
        },
        {
            id: 'job-matcher',
            name: 'Job Matcher Agent',
            role: 'Searches and matches jobs autonomously',
            status: 'idle',
            confidence: 90,
            lastAction: 'Ready',
        },
        {
            id: 'recovery',
            name: 'Recovery Engine',
            role: 'Detects failures and auto-corrects strategy',
            status: 'idle',
            confidence: 88,
            lastAction: 'Standing by',
        },
        {
            id: 'orchestrator',
            name: 'Orchestration Agent',
            role: 'Coordinates all agents without human input',
            status: 'idle',
            confidence: 92,
            lastAction: 'Ready',
        },
    ]);

    const [messages, setMessages] = useState<AgentMessage[]>([]);
    const [decisionLogs, setDecisionLogs] = useState<DecisionLog[]>([]);
    const [isOrchestrating, setIsOrchestrating] = useState(false);
    const [activeWorkflow, setActiveWorkflow] = useState<string | null>(null);
    const [recoveryTriggered, setRecoveryTriggered] = useState(false);

    const simulateDelay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    const startAutonomousWorkflow = useCallback(async () => {
        // Reset state
        setIsOrchestrating(true);
        setActiveWorkflow('autonomous-failure-recovery');
        setMessages([]);
        setDecisionLogs([]);
        setRecoveryTriggered(false);

        // Reset all agents
        setAgents(prev => prev.map(a => ({ ...a, status: 'idle' as const, currentTask: undefined })));

        await simulateDelay(500);

        // =========================================================================
        // STEP 1: Skill-Gap Agent analyzes user profile
        // =========================================================================
        setAgents(prev => prev.map(a =>
            a.id === 'skill-gap' ? { ...a, status: 'thinking' as const, currentTask: 'Analyzing user profile...' } : a
        ));

        await simulateDelay(1500);

        const log1: DecisionLog = {
            id: '1',
            agent: 'Skill-Gap Analyzer',
            decision: 'Extracted user preferences from profile',
            reasoning: [
                '📄 Resume parsed successfully',
                '🎯 Target role: Python Developer',
                '📍 Preferred location: London',
                '→ Passing to Job Matcher Agent'
            ],
            confidence: 95,
            timestamp: new Date(),
            status: 'success'
        };
        setDecisionLogs(prev => [log1, ...prev]);

        const msg1: AgentMessage = {
            id: '1',
            from: 'Skill-Gap Agent',
            to: 'Job Matcher Agent',
            type: 'handoff',
            content: 'User wants Python Developer jobs in London. Please search.',
            timestamp: new Date(),
        };
        setMessages(prev => [msg1, ...prev]);

        setAgents(prev => prev.map(a =>
            a.id === 'skill-gap' ? { ...a, status: 'completed' as const, currentTask: undefined, lastAction: 'Profile analyzed' } :
                a.id === 'job-matcher' ? { ...a, status: 'thinking' as const, currentTask: 'Searching London jobs...' } : a
        ));

        await simulateDelay(2000);

        // =========================================================================
        // STEP 2: Job Matcher searches - FAILS!
        // =========================================================================
        const log2: DecisionLog = {
            id: '2',
            agent: 'Job Matcher Agent',
            decision: '❌ SEARCH FAILED: 0 results for Python in London',
            reasoning: [
                '🔍 Query: Python Developer + London',
                '📊 Results returned: 0 jobs',
                '⚠️ FAILURE DETECTED',
                '→ Need to re-strategize...'
            ],
            confidence: 30,
            timestamp: new Date(),
            status: 'failure'
        };
        setDecisionLogs(prev => [log2, ...prev]);

        const msg2: AgentMessage = {
            id: '2',
            from: 'Job Matcher Agent',
            to: 'Self',
            type: 'failure',
            content: '❌ Search failed: 0 jobs found for Python in London. Need to adjust strategy.',
            timestamp: new Date(),
        };
        setMessages(prev => [msg2, ...prev]);

        // VISUAL FAIL STATE
        setAgents(prev => prev.map(a =>
            a.id === 'job-matcher' ? {
                ...a,
                status: 'failed' as const,
                currentTask: '⚠️ 0 Results! Re-strategizing...',
                confidence: 30
            } :
                a.id === 'recovery' ? { ...a, status: 'thinking' as const, currentTask: 'Analyzing failure...' } : a
        ));

        await simulateDelay(2500);

        // =========================================================================
        // STEP 3: THE MAGIC MOMENT - Autonomous Recovery
        // =========================================================================
        setRecoveryTriggered(true);

        const log3: DecisionLog = {
            id: '3',
            agent: '🧠 AUTONOMOUS RECOVERY',
            decision: 'Detected failure → Changing strategy WITHOUT human input',
            reasoning: [
                '🔴 Step 1: Failure condition detected (0 results)',
                '🔍 Step 2: Analyzing constraint: "London"',
                '💡 Step 3: Hypothesis - Location is too restrictive',
                '🔄 Step 4: AUTONOMOUS DECISION - Switch to "Remote"',
                '✅ Step 5: Proceeding WITHOUT human approval'
            ],
            confidence: 75,
            timestamp: new Date(),
            status: 'recovery'
        };
        setDecisionLogs(prev => [log3, ...prev]);

        const msg3: AgentMessage = {
            id: '3',
            from: 'Recovery Engine',
            to: 'Job Matcher Agent',
            type: 'recovery',
            content: '🔄 AUTONOMOUS PIVOT: Location "London" failed. Switching to "Remote" - NO human intervention required!',
            timestamp: new Date(),
        };
        setMessages(prev => [msg3, ...prev]);

        setAgents(prev => prev.map(a =>
            a.id === 'recovery' ? { ...a, status: 'completed' as const, currentTask: undefined, lastAction: 'Strategy adjusted' } :
                a.id === 'job-matcher' ? { ...a, status: 'recovering' as const, currentTask: 'Retrying with Remote...' } : a
        ));

        await simulateDelay(2000);

        // =========================================================================
        // STEP 4: Retry with new strategy - SUCCESS!
        // =========================================================================
        const log4: DecisionLog = {
            id: '4',
            agent: 'Job Matcher Agent',
            decision: '✅ SUCCESS: Found 3 jobs after autonomous recovery!',
            reasoning: [
                '🔍 New query: Python Developer + Remote',
                '📊 Results returned: 3 jobs',
                '✅ Recovery strategy VALIDATED',
                '🎯 No human intervention was needed!'
            ],
            confidence: 92,
            timestamp: new Date(),
            status: 'success'
        };
        setDecisionLogs(prev => [log4, ...prev]);

        const msg4: AgentMessage = {
            id: '4',
            from: 'Job Matcher Agent',
            to: 'User',
            type: 'decision',
            content: '✅ SUCCESS: Found 3 Python Developer jobs (Remote) after autonomous strategy adjustment!',
            timestamp: new Date(),
        };
        setMessages(prev => [msg4, ...prev]);

        setAgents(prev => prev.map(a =>
            a.id === 'job-matcher' ? {
                ...a,
                status: 'completed' as const,
                currentTask: undefined,
                lastAction: '3 jobs found',
                confidence: 92
            } :
                a.id === 'orchestrator' ? { ...a, status: 'thinking' as const, currentTask: 'Finalizing...' } : a
        ));

        await simulateDelay(1500);

        // =========================================================================
        // STEP 5: Final Summary
        // =========================================================================
        const log5: DecisionLog = {
            id: '5',
            agent: '🎯 WORKFLOW COMPLETE',
            decision: 'Autonomous Agentic Behavior Demonstrated!',
            reasoning: [
                '❌ Initial attempt: FAILED (London)',
                '🔄 Recovery triggered: YES',
                '👤 Human intervention: NONE',
                '✅ Final result: 3 jobs found',
                '🏆 "Look Ma, No Hands!" achieved!'
            ],
            confidence: 95,
            timestamp: new Date(),
            status: 'success'
        };
        setDecisionLogs(prev => [log5, ...prev]);

        setAgents(prev => prev.map(a =>
            a.id === 'orchestrator' ? {
                ...a,
                status: 'completed' as const,
                currentTask: undefined,
                lastAction: 'Demo complete!'
            } : a
        ));

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
            case 'failed': return 'bg-red-500 animate-pulse';
            case 'recovering': return 'bg-orange-500 animate-pulse';
        }
    };

    const getStatusIcon = (status: AgentStatus['status']) => {
        switch (status) {
            case 'idle': return <Clock className="w-4 h-4" />;
            case 'thinking': return <Brain className="w-4 h-4 animate-spin" />;
            case 'acting': return <Zap className="w-4 h-4" />;
            case 'collaborating': return <Network className="w-4 h-4" />;
            case 'completed': return <CheckCircle2 className="w-4 h-4" />;
            case 'failed': return <AlertTriangle className="w-4 h-4" />;
            case 'recovering': return <RefreshCw className="w-4 h-4 animate-spin" />;
        }
    };

    const getLogStatusColor = (status: DecisionLog['status']) => {
        switch (status) {
            case 'success': return 'border-green-500/50 bg-green-500/10';
            case 'failure': return 'border-red-500/50 bg-red-500/10';
            case 'recovery': return 'border-orange-500/50 bg-orange-500/10';
            case 'thinking': return 'border-amber-500/50 bg-amber-500/10';
        }
    };

    return (
        <div className="min-h-screen p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                            <Workflow className="w-8 h-8 text-sky-400" />
                            Autonomous Failure Recovery Demo
                        </h1>
                        <p className="text-slate-400 mt-1">Watch the agent fail, realize it, and self-correct without human input</p>
                    </div>

                    <button
                        onClick={startAutonomousWorkflow}
                        disabled={isOrchestrating}
                        className="btn-primary flex items-center gap-2 disabled:opacity-50 text-lg px-6 py-3"
                    >
                        {isOrchestrating ? (
                            <>
                                <Activity className="w-5 h-5 animate-spin" />
                                Running Demo...
                            </>
                        ) : (
                            <>
                                <Sparkles className="w-5 h-5" />
                                🚀 Start "Look Ma, No Hands!" Demo
                            </>
                        )}
                    </button>
                </div>

                {/* Recovery Banner */}
                {recoveryTriggered && (
                    <div className="glass-card p-4 border-orange-500/50 bg-orange-500/10 animate-pulse">
                        <div className="flex items-center gap-3">
                            <RefreshCw className="w-6 h-6 text-orange-400 animate-spin" />
                            <span className="text-orange-400 font-bold text-lg">🔄 AUTONOMOUS RECOVERY IN PROGRESS</span>
                            <span className="text-white ml-2">Agent is self-correcting without human intervention!</span>
                        </div>
                    </div>
                )}

                {/* Active Workflow Banner */}
                {activeWorkflow && !recoveryTriggered && (
                    <div className="glass-card p-4 border-sky-500/50 bg-sky-500/10">
                        <div className="flex items-center gap-3">
                            <div className="w-3 h-3 bg-sky-500 rounded-full animate-pulse" />
                            <span className="text-sky-400 font-medium">Active Demo:</span>
                            <span className="text-white">Failure Detection & Autonomous Recovery</span>
                        </div>
                    </div>
                )}

                {/* Agents Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {agents.map((agent) => (
                        <div
                            key={agent.id}
                            className={`glass-card p-5 transition-all duration-300 ${agent.status === 'failed' ? 'ring-2 ring-red-500/50' :
                                    agent.status === 'recovering' ? 'ring-2 ring-orange-500/50' :
                                        agent.status !== 'idle' ? 'ring-2 ring-sky-500/50' : ''
                                }`}
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div className={`p-2 rounded-lg ${getStatusColor(agent.status)}/20`}>
                                    <Bot className={`w-6 h-6 ${agent.status === 'idle' ? 'text-slate-400' :
                                            agent.status === 'failed' ? 'text-red-400' :
                                                agent.status === 'recovering' ? 'text-orange-400' :
                                                    agent.status === 'thinking' ? 'text-amber-400' :
                                                        agent.status === 'completed' ? 'text-green-400' :
                                                            'text-sky-400'
                                        }`} />
                                </div>
                                <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs ${getStatusColor(agent.status)}/20`}>
                                    {getStatusIcon(agent.status)}
                                    <span className={`capitalize ${agent.status === 'failed' ? 'text-red-400' :
                                            agent.status === 'recovering' ? 'text-orange-400' :
                                                'text-white'
                                        }`}>{agent.status}</span>
                                </div>
                            </div>

                            <h3 className="text-white font-semibold mb-1">{agent.name}</h3>
                            <p className="text-slate-400 text-sm mb-3">{agent.role}</p>

                            {agent.currentTask && (
                                <div className={`border rounded-lg p-2 mb-3 ${agent.status === 'failed' ? 'bg-red-500/10 border-red-500/30' :
                                        agent.status === 'recovering' ? 'bg-orange-500/10 border-orange-500/30' :
                                            'bg-sky-500/10 border-sky-500/30'
                                    }`}>
                                    <p className={`text-sm ${agent.status === 'failed' ? 'text-red-400' :
                                            agent.status === 'recovering' ? 'text-orange-400' :
                                                'text-sky-400'
                                        }`}>{agent.currentTask}</p>
                                </div>
                            )}

                            <div className="flex items-center justify-between text-sm">
                                <span className="text-slate-500">Confidence</span>
                                <span className={`${(agent.confidence || 0) < 50 ? 'text-red-400' :
                                        (agent.confidence || 0) < 80 ? 'text-amber-400' :
                                            'text-green-400'
                                    }`}>{agent.confidence}%</span>
                            </div>
                            <div className="xp-bar mt-2">
                                <div
                                    className={`xp-bar-fill ${(agent.confidence || 0) < 50 ? '!bg-red-500' :
                                            (agent.confidence || 0) < 80 ? '!bg-amber-500' :
                                                ''
                                        }`}
                                    style={{ width: `${agent.confidence}%` }}
                                />
                            </div>

                            {agent.lastAction && (
                                <p className="text-slate-500 text-xs mt-3 flex items-center gap-1">
                                    {agent.status === 'completed' ? <CheckCircle2 className="w-3 h-3 text-green-400" /> :
                                        agent.status === 'failed' ? <AlertTriangle className="w-3 h-3 text-red-400" /> :
                                            <Target className="w-3 h-3" />}
                                    {agent.lastAction}
                                </p>
                            )}
                        </div>
                    ))}
                </div>

                {/* Two Column Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Agent Messages */}
                    <div className="glass-card p-5">
                        <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                            <MessageSquare className="w-5 h-5 text-sky-400" />
                            Agent Communication
                        </h2>

                        <div className="space-y-3 max-h-96 overflow-y-auto">
                            {messages.length === 0 ? (
                                <p className="text-slate-500 text-center py-8">
                                    Click "Start Demo" to see agent communication
                                </p>
                            ) : (
                                messages.map((msg) => (
                                    <div
                                        key={msg.id}
                                        className={`p-3 rounded-lg border ${msg.type === 'failure' ? 'bg-red-500/10 border-red-500/30' :
                                                msg.type === 'recovery' ? 'bg-orange-500/10 border-orange-500/30' :
                                                    msg.type === 'handoff' ? 'bg-fuchsia-500/10 border-fuchsia-500/30' :
                                                        msg.type === 'decision' ? 'bg-green-500/10 border-green-500/30' :
                                                            'bg-sky-500/10 border-sky-500/30'
                                            }`}
                                    >
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="text-sky-400 font-medium text-sm">{msg.from}</span>
                                            <ChevronRight className="w-4 h-4 text-slate-500" />
                                            <span className="text-fuchsia-400 font-medium text-sm">{msg.to}</span>
                                            <span className={`ml-auto text-xs px-2 py-0.5 rounded font-bold ${msg.type === 'failure' ? 'bg-red-500/20 text-red-400' :
                                                    msg.type === 'recovery' ? 'bg-orange-500/20 text-orange-400' :
                                                        msg.type === 'decision' ? 'bg-green-500/20 text-green-400' :
                                                            'bg-sky-500/20 text-sky-400'
                                                }`}>
                                                {msg.type.toUpperCase()}
                                            </span>
                                        </div>
                                        <p className="text-slate-300 text-sm">{msg.content}</p>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Decision Logs */}
                    <div className="glass-card p-5">
                        <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                            <Brain className="w-5 h-5 text-fuchsia-400" />
                            Decision & Reasoning Logs
                        </h2>

                        <div className="space-y-3 max-h-96 overflow-y-auto">
                            {decisionLogs.length === 0 ? (
                                <p className="text-slate-500 text-center py-8">
                                    Agent decisions will appear here
                                </p>
                            ) : (
                                decisionLogs.map((log) => (
                                    <div key={log.id} className={`p-3 rounded-lg border ${getLogStatusColor(log.status)}`}>
                                        <div className="flex items-center justify-between mb-2">
                                            <span className={`font-medium text-sm ${log.status === 'failure' ? 'text-red-400' :
                                                    log.status === 'recovery' ? 'text-orange-400' :
                                                        'text-fuchsia-400'
                                                }`}>{log.agent}</span>
                                            <span className={`text-xs font-bold ${log.status === 'failure' ? 'text-red-400' :
                                                    log.status === 'recovery' ? 'text-orange-400' :
                                                        'text-green-400'
                                                }`}>{log.confidence}% confident</span>
                                        </div>
                                        <p className="text-white font-medium mb-2">{log.decision}</p>
                                        <ul className="space-y-1">
                                            {log.reasoning.map((reason, i) => (
                                                <li key={i} className="text-slate-400 text-sm flex items-start gap-2">
                                                    <span className={`mt-1 ${log.status === 'failure' ? 'text-red-400' :
                                                            log.status === 'recovery' ? 'text-orange-400' :
                                                                'text-sky-400'
                                                        }`}>•</span>
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
