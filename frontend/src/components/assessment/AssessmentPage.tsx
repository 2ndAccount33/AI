import { useState } from 'react';
import {
    Upload,
    Link as LinkIcon,
    FileText,
    Youtube,
    Sparkles,
    Trophy,
    Star,
    Zap,
    Check,
    X,
    Clock,
    ChevronRight,
    Swords,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

// Demo assessment data
const demoAssessment = {
    id: '1',
    title: 'React Hooks Mastery',
    description: 'Master React Hooks through interactive quests',
    totalXp: 1000,
    earnedXp: 350,
    quests: [
        {
            id: 'q1',
            title: 'useState Fundamentals',
            type: 'quiz',
            status: 'completed',
            totalPoints: 200,
            earnedPoints: 180,
            questions: [
                { id: 'q1_1', question: 'What does useState return?', options: ['A single value', 'An array with value and setter', 'An object', 'A function'], correctIndex: 1, points: 50 },
                { id: 'q1_2', question: 'When does useState trigger a re-render?', options: ['Always', 'When state changes', 'Never', 'On mount only'], correctIndex: 1, points: 50 },
            ],
        },
        {
            id: 'q2',
            title: 'useEffect Deep Dive',
            type: 'quiz',
            status: 'in_progress',
            totalPoints: 250,
            earnedPoints: 100,
            questions: [
                { id: 'q2_1', question: 'What is the cleanup function in useEffect used for?', options: ['Performance', 'Preventing memory leaks', 'Styling', 'Routing'], correctIndex: 1, points: 50 },
            ],
        },
        {
            id: 'q3',
            title: 'Build a Counter App',
            type: 'challenge',
            status: 'available',
            totalPoints: 300,
            earnedPoints: 0,
        },
        {
            id: 'boss',
            title: 'The State Management Boss',
            type: 'boss_battle',
            status: 'locked',
            totalPoints: 500,
            earnedPoints: 0,
        },
    ],
};

export default function AssessmentPage() {
    const [hasAssessment, setHasAssessment] = useState(true);
    const [activeQuest, setActiveQuest] = useState<string | null>(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
    const [showResult, setShowResult] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);

    const activeQuestData = demoAssessment.quests.find((q) => q.id === activeQuest);
    const currentQuestion = activeQuestData?.questions?.[currentQuestionIndex];

    const handleAnswerSubmit = () => {
        if (selectedAnswer === null || !currentQuestion) return;

        const correct = selectedAnswer === currentQuestion.correctIndex;
        setIsCorrect(correct);
        setShowResult(true);

        if (correct) {
            toast.success(`+${currentQuestion.points} XP!`, { icon: '🎉' });
        }
    };

    const handleNextQuestion = () => {
        setShowResult(false);
        setSelectedAnswer(null);
        if (activeQuestData?.questions && currentQuestionIndex < activeQuestData.questions.length - 1) {
            setCurrentQuestionIndex((prev) => prev + 1);
        } else {
            setActiveQuest(null);
            setCurrentQuestionIndex(0);
            toast.success('Quest completed!', { icon: '🏆' });
        }
    };

    const getQuestIcon = (type: string) => {
        switch (type) {
            case 'quiz':
                return Star;
            case 'challenge':
                return Zap;
            case 'boss_battle':
                return Swords;
            default:
                return Trophy;
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'completed':
                return <span className="badge-success"><Check className="w-3 h-3" /> Completed</span>;
            case 'in_progress':
                return <span className="badge-warning"><Clock className="w-3 h-3" /> In Progress</span>;
            case 'available':
                return <span className="badge-primary"><ChevronRight className="w-3 h-3" /> Available</span>;
            default:
                return <span className="badge bg-white/10 text-white/40">Locked</span>;
        }
    };

    if (!hasAssessment) {
        return (
            <div className="max-w-2xl mx-auto space-y-6">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold gradient-text mb-2">Generate Assessment</h1>
                    <p className="text-white/60">Upload learning content to create gamified quests</p>
                </div>

                <div className="glass-card p-6 rounded-2xl space-y-4">
                    <div className="flex items-center gap-3 mb-4">
                        <Upload className="w-5 h-5 text-primary-400" />
                        <h2 className="font-semibold text-white">Content Sources</h2>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <button className="glass-card-hover p-4 rounded-xl text-center">
                            <FileText className="w-8 h-8 mx-auto mb-2 text-primary-400" />
                            <span className="text-sm text-white">PDF</span>
                        </button>
                        <button className="glass-card-hover p-4 rounded-xl text-center">
                            <Youtube className="w-8 h-8 mx-auto mb-2 text-red-500" />
                            <span className="text-sm text-white">YouTube</span>
                        </button>
                        <button className="glass-card-hover p-4 rounded-xl text-center">
                            <LinkIcon className="w-8 h-8 mx-auto mb-2 text-accent-400" />
                            <span className="text-sm text-white">URL</span>
                        </button>
                    </div>

                    <input
                        type="text"
                        placeholder="Paste YouTube URL or article link..."
                        className="input-field"
                    />

                    <select className="input-field">
                        <option value="beginner">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Advanced</option>
                    </select>
                </div>

                <button
                    onClick={() => setHasAssessment(true)}
                    className="btn-primary w-full flex items-center justify-center gap-2"
                >
                    <Sparkles className="w-5 h-5" />
                    Generate Assessment
                </button>
            </div>
        );
    }

    // Active quest view
    if (activeQuest && currentQuestion) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-2xl mx-auto"
            >
                <div className="glass-card p-8 rounded-2xl">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-white">{activeQuestData?.title}</h2>
                        <button
                            onClick={() => {
                                setActiveQuest(null);
                                setCurrentQuestionIndex(0);
                                setSelectedAnswer(null);
                                setShowResult(false);
                            }}
                            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                        >
                            <X className="w-5 h-5 text-white/60" />
                        </button>
                    </div>

                    <div className="mb-4">
                        <div className="flex items-center justify-between text-sm text-white/60 mb-2">
                            <span>Question {currentQuestionIndex + 1} of {activeQuestData?.questions?.length}</span>
                            <span className="text-primary-400">+{currentQuestion.points} XP</span>
                        </div>
                        <div className="xp-bar">
                            <div
                                className="xp-bar-fill"
                                style={{ width: `${((currentQuestionIndex + 1) / (activeQuestData?.questions?.length || 1)) * 100}%` }}
                            />
                        </div>
                    </div>

                    <p className="text-lg text-white mb-6">{currentQuestion.question}</p>

                    <div className="space-y-3 mb-6">
                        {currentQuestion.options.map((option, index) => (
                            <button
                                key={index}
                                onClick={() => !showResult && setSelectedAnswer(index)}
                                disabled={showResult}
                                className={`w-full text-left p-4 rounded-xl border-2 transition-all ${showResult
                                        ? index === currentQuestion.correctIndex
                                            ? 'border-success-500 bg-success-500/20'
                                            : index === selectedAnswer
                                                ? 'border-danger-500 bg-danger-500/20'
                                                : 'border-white/10 bg-white/5'
                                        : selectedAnswer === index
                                            ? 'border-primary-500 bg-primary-500/20'
                                            : 'border-white/10 bg-white/5 hover:border-white/30'
                                    }`}
                            >
                                <span className="text-white">{option}</span>
                            </button>
                        ))}
                    </div>

                    <AnimatePresence mode="wait">
                        {showResult ? (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                            >
                                <div
                                    className={`p-4 rounded-xl mb-4 ${isCorrect ? 'bg-success-500/20 border border-success-500/30' : 'bg-danger-500/20 border border-danger-500/30'
                                        }`}
                                >
                                    <p className={`font-medium ${isCorrect ? 'text-success-500' : 'text-danger-500'}`}>
                                        {isCorrect ? '🎉 Correct!' : '❌ Incorrect'}
                                    </p>
                                </div>
                                <button onClick={handleNextQuestion} className="btn-primary w-full">
                                    {currentQuestionIndex < (activeQuestData?.questions?.length || 1) - 1
                                        ? 'Next Question'
                                        : 'Complete Quest'}
                                </button>
                            </motion.div>
                        ) : (
                            <motion.button
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                onClick={handleAnswerSubmit}
                                disabled={selectedAnswer === null}
                                className="btn-primary w-full"
                            >
                                Submit Answer
                            </motion.button>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        );
    }

    // Assessment overview
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">{demoAssessment.title}</h1>
                    <p className="text-white/60">{demoAssessment.description}</p>
                </div>
                <button onClick={() => setHasAssessment(false)} className="btn-secondary">
                    Create New
                </button>
            </div>

            {/* Progress */}
            <div className="glass-card p-6 rounded-2xl">
                <div className="flex items-center justify-between mb-4">
                    <span className="text-white/60">Total Progress</span>
                    <span className="text-primary-400 font-bold">
                        {demoAssessment.earnedXp} / {demoAssessment.totalXp} XP
                    </span>
                </div>
                <div className="xp-bar h-3">
                    <div
                        className="xp-bar-fill"
                        style={{ width: `${(demoAssessment.earnedXp / demoAssessment.totalXp) * 100}%` }}
                    />
                </div>
            </div>

            {/* Quests */}
            <div className="grid md:grid-cols-2 gap-4">
                {demoAssessment.quests.map((quest) => {
                    const QuestIcon = getQuestIcon(quest.type);
                    const isLocked = quest.status === 'locked';

                    return (
                        <motion.div
                            key={quest.id}
                            whileHover={!isLocked ? { scale: 1.02 } : {}}
                            className={`glass-card p-6 rounded-2xl ${isLocked ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                                } ${quest.type === 'boss_battle' ? 'md:col-span-2 border-2 border-accent-500/30' : ''}`}
                            onClick={() => !isLocked && quest.type === 'quiz' && setActiveQuest(quest.id)}
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div
                                    className={`w-12 h-12 rounded-xl flex items-center justify-center ${quest.type === 'boss_battle'
                                            ? 'bg-gradient-to-br from-accent-500 to-danger-500'
                                            : quest.type === 'challenge'
                                                ? 'bg-gradient-to-br from-warning-500 to-orange-500'
                                                : 'bg-gradient-to-br from-primary-500 to-primary-600'
                                        }`}
                                >
                                    <QuestIcon className="w-6 h-6 text-white" />
                                </div>
                                {getStatusBadge(quest.status)}
                            </div>

                            <h3 className="text-lg font-semibold text-white mb-2">{quest.title}</h3>

                            <div className="flex items-center justify-between">
                                <span className="text-sm text-white/60">
                                    {quest.earnedPoints} / {quest.totalPoints} XP
                                </span>
                                {quest.type === 'boss_battle' && (
                                    <span className="text-xs text-accent-400 font-medium">BOSS BATTLE</span>
                                )}
                            </div>

                            {quest.status !== 'locked' && (
                                <div className="mt-3 xp-bar">
                                    <div
                                        className="xp-bar-fill"
                                        style={{ width: `${(quest.earnedPoints / quest.totalPoints) * 100}%` }}
                                    />
                                </div>
                            )}
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}
