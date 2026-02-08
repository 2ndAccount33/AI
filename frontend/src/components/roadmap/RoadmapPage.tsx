import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import {
    ReactFlow,
    Background,
    Controls,
    MiniMap,
    useNodesState,
    useEdgesState,
    addEdge,
    Node,
    Edge,
    Connection,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import {
    Upload,
    FileText,
    Briefcase,
    Sparkles,
    Check,
    Clock,
    Lock,
    Play,
    ExternalLink,
    ChevronDown,
    ChevronUp,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

// Custom node component for roadmap stages
function StageNode({ data }: { data: any }) {
    const [isExpanded, setIsExpanded] = useState(false);

    const statusColors = {
        locked: 'border-white/20 bg-white/5',
        available: 'border-primary-500/50 bg-primary-500/10',
        in_progress: 'border-accent-500 bg-accent-500/20 animate-pulse',
        completed: 'border-success-500 bg-success-500/20',
    };

    const statusIcons = {
        locked: Lock,
        available: Play,
        in_progress: Clock,
        completed: Check,
    };

    const StatusIcon = statusIcons[data.status as keyof typeof statusIcons];

    return (
        <motion.div
            layout
            className={`w-72 rounded-xl border-2 ${statusColors[data.status as keyof typeof statusColors]} backdrop-blur-xl p-4`}
        >
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                    <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center ${data.status === 'completed'
                                ? 'bg-success-500'
                                : data.status === 'in_progress'
                                    ? 'bg-accent-500'
                                    : data.status === 'available'
                                        ? 'bg-primary-500'
                                        : 'bg-white/20'
                            }`}
                    >
                        <StatusIcon className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-xs text-white/60">Stage {data.stage}</span>
                </div>
                <span className="text-xs font-medium text-primary-400">+{data.xpReward} XP</span>
            </div>

            <h3 className="font-semibold text-white mb-2">{data.skill}</h3>

            <div className="flex items-center gap-2 text-xs text-white/60 mb-3">
                <Clock className="w-3 h-3" />
                <span>{data.estimatedHours}h estimated</span>
            </div>

            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex items-center justify-between text-sm text-white/60 hover:text-white transition-colors"
            >
                <span>{data.resources?.length || 0} resources</span>
                {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="mt-3 space-y-2">
                            {data.resources?.slice(0, 3).map((resource: any, index: number) => (
                                <a
                                    key={index}
                                    href={resource.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 text-xs text-primary-400 hover:text-primary-300 transition-colors"
                                >
                                    <ExternalLink className="w-3 h-3" />
                                    <span className="truncate">{resource.title}</span>
                                </a>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

const nodeTypes = { stageNode: StageNode };

// Demo roadmap data
const demoStages = [
    { id: '1', stage: 1, skill: 'React Fundamentals', estimatedHours: 15, xpReward: 300, status: 'completed', resources: [{ title: 'React Official Docs', url: '#' }] },
    { id: '2', stage: 2, skill: 'TypeScript Basics', estimatedHours: 10, xpReward: 250, status: 'completed', resources: [{ title: 'TypeScript Handbook', url: '#' }] },
    { id: '3', stage: 3, skill: 'Advanced React Patterns', estimatedHours: 20, xpReward: 400, status: 'in_progress', resources: [{ title: 'React Patterns', url: '#' }] },
    { id: '4', stage: 4, skill: 'Node.js & Express', estimatedHours: 18, xpReward: 350, status: 'available', resources: [{ title: 'Node.js Guide', url: '#' }] },
    { id: '5', stage: 5, skill: 'System Design', estimatedHours: 25, xpReward: 500, status: 'locked', resources: [{ title: 'System Design Primer', url: '#' }] },
];

export default function RoadmapPage() {
    const [hasRoadmap, setHasRoadmap] = useState(true); // Demo: show roadmap
    const [resumeFile, setResumeFile] = useState<File | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);

    // Convert stages to React Flow nodes
    const initialNodes: Node[] = demoStages.map((stage, index) => ({
        id: stage.id,
        type: 'stageNode',
        position: { x: 150, y: index * 180 },
        data: stage,
    }));

    const initialEdges: Edge[] = demoStages.slice(0, -1).map((stage, index) => ({
        id: `e${stage.id}-${demoStages[index + 1].id}`,
        source: stage.id,
        target: demoStages[index + 1].id,
        animated: demoStages[index + 1].status === 'in_progress',
        style: { stroke: demoStages[index].status === 'completed' ? '#22c55e' : '#ffffff20' },
    }));

    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

    const onConnect = useCallback(
        (params: Connection) => setEdges((eds) => addEdge(params, eds)),
        [setEdges]
    );

    const onDrop = useCallback((acceptedFiles: File[]) => {
        const file = acceptedFiles[0];
        if (file && file.type === 'application/pdf') {
            setResumeFile(file);
            toast.success('Resume uploaded successfully!');
        } else {
            toast.error('Please upload a PDF file');
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'application/pdf': ['.pdf'] },
        maxFiles: 1,
    });

    const handleGenerate = async () => {
        if (!resumeFile) {
            toast.error('Please upload your resume first');
            return;
        }
        setIsGenerating(true);
        // Simulate API call
        setTimeout(() => {
            setIsGenerating(false);
            setHasRoadmap(true);
            toast.success('Roadmap generated successfully!');
        }, 3000);
    };

    if (!hasRoadmap) {
        return (
            <div className="max-w-2xl mx-auto space-y-6">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold gradient-text mb-2">Create Your Learning Roadmap</h1>
                    <p className="text-white/60">Upload your resume and select a target role to generate a personalized learning path</p>
                </div>

                {/* Resume Upload */}
                <div
                    {...getRootProps()}
                    className={`glass-card p-8 rounded-2xl border-2 border-dashed cursor-pointer transition-all ${isDragActive ? 'border-primary-500 bg-primary-500/10' : 'border-white/20 hover:border-white/40'
                        }`}
                >
                    <input {...getInputProps()} />
                    <div className="text-center">
                        {resumeFile ? (
                            <div className="flex items-center justify-center gap-3">
                                <FileText className="w-8 h-8 text-success-500" />
                                <div className="text-left">
                                    <p className="font-medium text-white">{resumeFile.name}</p>
                                    <p className="text-sm text-white/60">{(resumeFile.size / 1024).toFixed(1)} KB</p>
                                </div>
                                <Check className="w-6 h-6 text-success-500" />
                            </div>
                        ) : (
                            <>
                                <Upload className="w-12 h-12 mx-auto text-white/40 mb-4" />
                                <p className="text-white mb-2">
                                    {isDragActive ? 'Drop your resume here' : 'Drag & drop your resume (PDF)'}
                                </p>
                                <p className="text-sm text-white/40">or click to browse</p>
                            </>
                        )}
                    </div>
                </div>

                {/* Job Selection */}
                <div className="glass-card p-6 rounded-2xl">
                    <div className="flex items-center gap-3 mb-4">
                        <Briefcase className="w-5 h-5 text-primary-400" />
                        <h2 className="font-semibold text-white">Target Role</h2>
                    </div>
                    <select className="input-field">
                        <option value="">Select a job from the Job Board</option>
                        <option value="1">Senior Full-Stack Developer - TechCorp</option>
                        <option value="2">React Frontend Engineer - StartupXYZ</option>
                        <option value="3">Node.js Backend Developer - Enterprise Inc</option>
                    </select>
                </div>

                <button
                    onClick={handleGenerate}
                    disabled={!resumeFile || isGenerating}
                    className="btn-primary w-full flex items-center justify-center gap-2"
                >
                    {isGenerating ? (
                        <>
                            <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                            Analyzing with AI...
                        </>
                    ) : (
                        <>
                            <Sparkles className="w-5 h-5" />
                            Generate Roadmap
                        </>
                    )}
                </button>
            </div>
        );
    }

    return (
        <div className="h-[calc(100vh-8rem)] flex flex-col">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">Your Learning Roadmap</h1>
                    <p className="text-white/60">Full-Stack Developer Path • 88 hours total</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-right">
                        <p className="text-sm text-white/60">Progress</p>
                        <p className="text-lg font-bold text-primary-400">45%</p>
                    </div>
                    <button
                        onClick={() => setHasRoadmap(false)}
                        className="btn-secondary text-sm"
                    >
                        Create New
                    </button>
                </div>
            </div>

            <div className="flex-1 glass-card rounded-2xl overflow-hidden">
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    nodeTypes={nodeTypes}
                    fitView
                    className="bg-slate-950"
                >
                    <Background color="#ffffff10" gap={20} />
                    <Controls className="bg-white/10 border-white/10 rounded-lg" />
                    <MiniMap
                        className="bg-white/5 rounded-lg"
                        nodeColor={(node) => {
                            const status = node.data.status;
                            if (status === 'completed') return '#22c55e';
                            if (status === 'in_progress') return '#d946ef';
                            if (status === 'available') return '#0ea5e9';
                            return '#ffffff20';
                        }}
                    />
                </ReactFlow>
            </div>
        </div>
    );
}
