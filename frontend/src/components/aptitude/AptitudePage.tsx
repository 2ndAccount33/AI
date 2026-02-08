import { useState, useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import {
    Brain,
    Play,
    Send,
    Clock,
    Lightbulb,
    TrendingUp,
    TrendingDown,
    CheckCircle,
    XCircle,
    Loader2,
    BarChart3,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

// Demo questions
const demoQuestions = [
    {
        id: '1',
        question: 'Explain how the JavaScript event loop works and why it\'s important for async operations.',
        questionType: 'conceptual',
        difficulty: 5,
    },
    {
        id: '2',
        question: 'Write a function that debounces another function. It should delay the execution until after a specified wait time has passed since the last call.',
        questionType: 'coding',
        difficulty: 6,
        codeTemplate: `function debounce(func, wait) {
  // Your implementation here
}

// Example usage:
// const debouncedFn = debounce(() => console.log('Called!'), 300);`,
    },
    {
        id: '3',
        question: 'You\'re building a real-time chat application. How would you handle message delivery guarantees and what happens when a user goes offline?',
        questionType: 'scenario',
        difficulty: 7,
    },
];

interface Message {
    id: string;
    type: 'question' | 'answer' | 'evaluation' | 'system';
    content: string;
    code?: string;
    evaluation?: { score: number; feedback: string };
    difficulty?: number;
    questionType?: string;
}

export default function AptitudePage() {
    const [isSessionActive, setIsSessionActive] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [currentResponse, setCurrentResponse] = useState('');
    const [currentCode, setCurrentCode] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [showAnalysis, setShowAnalysis] = useState(false);
    const [sessionTime, setSessionTime] = useState(0);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isSessionActive && !showAnalysis) {
            interval = setInterval(() => setSessionTime((t) => t + 1), 1000);
        }
        return () => clearInterval(interval);
    }, [isSessionActive, showAnalysis]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const startSession = () => {
        setIsSessionActive(true);
        setMessages([
            {
                id: 'welcome',
                type: 'system',
                content: 'Welcome to your aptitude assessment! I\'ll ask you a series of questions to evaluate your skills. The difficulty will adapt based on your responses. Let\'s begin!',
            },
        ]);

        // First question after delay
        setTimeout(() => {
            const firstQ = demoQuestions[0];
            setMessages((prev) => [
                ...prev,
                {
                    id: firstQ.id,
                    type: 'question',
                    content: firstQ.question,
                    difficulty: firstQ.difficulty,
                    questionType: firstQ.questionType,
                    code: firstQ.codeTemplate,
                },
            ]);
            if (firstQ.codeTemplate) {
                setCurrentCode(firstQ.codeTemplate);
            }
        }, 1500);
    };

    const submitResponse = () => {
        if (!currentResponse.trim() && !currentCode.trim()) {
            toast.error('Please provide a response');
            return;
        }

        const currentQ = demoQuestions[currentQuestionIndex];

        // Add user's answer to messages
        setMessages((prev) => [
            ...prev,
            {
                id: `answer-${currentQ.id}`,
                type: 'answer',
                content: currentResponse,
                code: currentQ.questionType === 'coding' ? currentCode : undefined,
            },
        ]);

        setCurrentResponse('');
        setIsTyping(true);

        // Simulate AI evaluation
        setTimeout(() => {
            const score = Math.floor(Math.random() * 4) + 6; // 6-9 score
            const feedback = score >= 7
                ? 'Great explanation! You demonstrated solid understanding of the concept.'
                : 'Good attempt, but there are some areas that could be improved.';

            setMessages((prev) => [
                ...prev,
                {
                    id: `eval-${currentQ.id}`,
                    type: 'evaluation',
                    content: feedback,
                    evaluation: { score, feedback },
                },
            ]);

            // Next question or finish
            if (currentQuestionIndex < demoQuestions.length - 1) {
                setTimeout(() => {
                    const nextQ = demoQuestions[currentQuestionIndex + 1];
                    setCurrentQuestionIndex((prev) => prev + 1);
                    setMessages((prev) => [
                        ...prev,
                        {
                            id: nextQ.id,
                            type: 'question',
                            content: nextQ.question,
                            difficulty: nextQ.difficulty,
                            questionType: nextQ.questionType,
                            code: nextQ.codeTemplate,
                        },
                    ]);
                    if (nextQ.codeTemplate) {
                        setCurrentCode(nextQ.codeTemplate);
                    } else {
                        setCurrentCode('');
                    }
                    setIsTyping(false);
                }, 1500);
            } else {
                setIsTyping(false);
                setTimeout(() => {
                    setShowAnalysis(true);
                }, 1000);
            }
        }, 2000);
    };

    const getDifficultyColor = (diff: number) => {
        if (diff <= 4) return 'text-success-500';
        if (diff <= 6) return 'text-warning-500';
        return 'text-danger-500';
    };

    if (showAnalysis) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-3xl mx-auto space-y-6"
            >
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold gradient-text mb-2">Assessment Complete!</h1>
                    <p className="text-white/60">Here's your comprehensive analysis</p>
                </div>

                <div className="glass-card p-8 rounded-2xl">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                                <BarChart3 className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-white">Overall Score</h2>
                                <p className="text-white/60">Based on {demoQuestions.length} questions</p>
                            </div>
                        </div>
                        <div className="text-4xl font-bold text-primary-400">78%</div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <h3 className="flex items-center gap-2 font-semibold text-success-500 mb-3">
                                <TrendingUp className="w-5 h-5" /> Strengths
                            </h3>
                            <ul className="space-y-2">
                                <li className="flex items-center gap-2 text-white/80">
                                    <CheckCircle className="w-4 h-4 text-success-500" />
                                    JavaScript fundamentals
                                </li>
                                <li className="flex items-center gap-2 text-white/80">
                                    <CheckCircle className="w-4 h-4 text-success-500" />
                                    Problem-solving approach
                                </li>
                                <li className="flex items-center gap-2 text-white/80">
                                    <CheckCircle className="w-4 h-4 text-success-500" />
                                    Code organization
                                </li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="flex items-center gap-2 font-semibold text-warning-500 mb-3">
                                <TrendingDown className="w-5 h-5" /> Areas to Improve
                            </h3>
                            <ul className="space-y-2">
                                <li className="flex items-center gap-2 text-white/80">
                                    <XCircle className="w-4 h-4 text-warning-500" />
                                    System design patterns
                                </li>
                                <li className="flex items-center gap-2 text-white/80">
                                    <XCircle className="w-4 h-4 text-warning-500" />
                                    Edge case handling
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div className="mt-6 p-4 rounded-xl bg-primary-500/10 border border-primary-500/20">
                        <h3 className="font-semibold text-primary-400 mb-2">🎯 Recommendation</h3>
                        <p className="text-white/80">
                            Your roadmap has been updated with new resources focusing on System Design and edge case handling. Check your Learning Path for the updated content!
                        </p>
                    </div>

                    <div className="flex gap-4 mt-6">
                        <button
                            onClick={() => {
                                setShowAnalysis(false);
                                setIsSessionActive(false);
                                setMessages([]);
                                setCurrentQuestionIndex(0);
                                setSessionTime(0);
                            }}
                            className="btn-secondary flex-1"
                        >
                            Start New Session
                        </button>
                        <button className="btn-primary flex-1">View Updated Roadmap</button>
                    </div>
                </div>
            </motion.div>
        );
    }

    if (!isSessionActive) {
        return (
            <div className="max-w-2xl mx-auto text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-card p-12 rounded-2xl"
                >
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center mx-auto mb-6">
                        <Brain className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold gradient-text mb-4">AI Aptitude Assessment</h1>
                    <p className="text-white/60 mb-8 max-w-md mx-auto">
                        Take an adaptive interview where AI evaluates your responses in real-time and adjusts question difficulty based on your performance.
                    </p>

                    <div className="grid grid-cols-3 gap-4 mb-8">
                        <div className="glass-card p-4 rounded-xl">
                            <p className="text-2xl font-bold text-primary-400">5-10</p>
                            <p className="text-xs text-white/40">Questions</p>
                        </div>
                        <div className="glass-card p-4 rounded-xl">
                            <p className="text-2xl font-bold text-accent-400">Adaptive</p>
                            <p className="text-xs text-white/40">Difficulty</p>
                        </div>
                        <div className="glass-card p-4 rounded-xl">
                            <p className="text-2xl font-bold text-success-500">Real-time</p>
                            <p className="text-xs text-white/40">Feedback</p>
                        </div>
                    </div>

                    <div className="mb-6">
                        <label className="block text-sm text-white/60 mb-2">Target Role</label>
                        <select className="input-field max-w-xs mx-auto">
                            <option>Full-Stack Developer</option>
                            <option>Frontend Engineer</option>
                            <option>Backend Engineer</option>
                            <option>DevOps Engineer</option>
                        </select>
                    </div>

                    <button onClick={startSession} className="btn-primary inline-flex items-center gap-2">
                        <Play className="w-5 h-5" />
                        Start Assessment
                    </button>
                </motion.div>
            </div>
        );
    }

    const currentQ = demoQuestions[currentQuestionIndex];
    const isCodingQuestion = currentQ?.questionType === 'coding';

    return (
        <div className="h-[calc(100vh-8rem)] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <Brain className="w-5 h-5 text-primary-400" />
                        <span className="font-semibold text-white">Aptitude Assessment</span>
                    </div>
                    <span className="badge-primary">
                        <Clock className="w-3 h-3" />
                        {formatTime(sessionTime)}
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-sm text-white/60">
                        Question {currentQuestionIndex + 1} / {demoQuestions.length}
                    </span>
                </div>
            </div>

            {/* Main area */}
            <div className={`flex-1 flex ${isCodingQuestion ? 'flex-row gap-4' : 'flex-col'} min-h-0`}>
                {/* Chat area */}
                <div className={`glass-card rounded-2xl flex flex-col ${isCodingQuestion ? 'w-1/2' : 'flex-1'}`}>
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {messages.map((msg) => (
                            <motion.div
                                key={msg.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`${msg.type === 'answer' ? 'ml-auto max-w-[80%]' : 'max-w-[90%]'}`}
                            >
                                {msg.type === 'system' && (
                                    <div className="p-4 rounded-xl bg-primary-500/10 border border-primary-500/20 text-white/80">
                                        {msg.content}
                                    </div>
                                )}

                                {msg.type === 'question' && (
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 text-xs">
                                            <span className={`badge ${getDifficultyColor(msg.difficulty || 5)}`}>
                                                Difficulty: {msg.difficulty}/10
                                            </span>
                                            <span className="text-white/40">{msg.questionType}</span>
                                        </div>
                                        <div className="p-4 rounded-xl bg-white/5 text-white">
                                            {msg.content}
                                        </div>
                                    </div>
                                )}

                                {msg.type === 'answer' && (
                                    <div className="p-4 rounded-xl bg-primary-500/20 text-white">
                                        {msg.content}
                                        {msg.code && (
                                            <pre className="mt-2 p-2 rounded bg-black/30 text-xs overflow-x-auto">
                                                {msg.code}
                                            </pre>
                                        )}
                                    </div>
                                )}

                                {msg.type === 'evaluation' && (
                                    <div className="p-4 rounded-xl bg-accent-500/10 border border-accent-500/20">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="text-accent-400 font-semibold">
                                                Score: {msg.evaluation?.score}/10
                                            </span>
                                        </div>
                                        <p className="text-white/80">{msg.content}</p>
                                    </div>
                                )}
                            </motion.div>
                        ))}

                        {isTyping && (
                            <div className="flex items-center gap-2 text-white/40">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                AI is evaluating...
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input area */}
                    <div className="p-4 border-t border-white/10">
                        <div className="flex gap-2">
                            <button className="btn-secondary p-3">
                                <Lightbulb className="w-5 h-5" />
                            </button>
                            <input
                                type="text"
                                value={currentResponse}
                                onChange={(e) => setCurrentResponse(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && submitResponse()}
                                placeholder="Type your response..."
                                className="input-field flex-1"
                                disabled={isTyping}
                            />
                            <button
                                onClick={submitResponse}
                                disabled={isTyping || (!currentResponse.trim() && !currentCode.trim())}
                                className="btn-primary p-3"
                            >
                                <Send className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Code editor (for coding questions) */}
                {isCodingQuestion && (
                    <div className="w-1/2 glass-card rounded-2xl overflow-hidden">
                        <div className="h-full">
                            <Editor
                                height="100%"
                                defaultLanguage="javascript"
                                theme="vs-dark"
                                value={currentCode}
                                onChange={(value) => setCurrentCode(value || '')}
                                options={{
                                    minimap: { enabled: false },
                                    fontSize: 14,
                                    padding: { top: 16 },
                                }}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
