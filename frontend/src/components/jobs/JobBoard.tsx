import { useState } from 'react';
import {
    Search,
    MapPin,
    Briefcase,
    Clock,
    DollarSign,
    Building2,
    ChevronRight,
    Filter,
    X,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

// Demo job data
const demoJobs = [
    {
        id: '1',
        title: 'Senior Full-Stack Developer',
        company: 'TechCorp Industries',
        location: 'San Francisco, CA',
        type: 'full-time',
        salary: '$150k - $200k',
        requirements: ['React', 'Node.js', 'TypeScript', 'PostgreSQL', 'AWS'],
        preferred: ['GraphQL', 'Docker', 'Kubernetes'],
        description: 'We are looking for a Senior Full-Stack Developer to join our growing team...',
        postedAt: '2 days ago',
    },
    {
        id: '2',
        title: 'React Frontend Engineer',
        company: 'StartupXYZ',
        location: 'Remote',
        type: 'remote',
        salary: '$120k - $160k',
        requirements: ['React', 'TypeScript', 'CSS/Tailwind', 'Testing'],
        preferred: ['Next.js', 'Framer Motion'],
        description: 'Join our dynamic startup building the future of...',
        postedAt: '5 days ago',
    },
    {
        id: '3',
        title: 'Node.js Backend Developer',
        company: 'Enterprise Inc',
        location: 'New York, NY',
        type: 'full-time',
        salary: '$130k - $170k',
        requirements: ['Node.js', 'Express', 'MongoDB', 'REST APIs'],
        preferred: ['Microservices', 'Message Queues'],
        description: 'Looking for an experienced backend developer to...',
        postedAt: '1 week ago',
    },
    {
        id: '4',
        title: 'DevOps Engineer',
        company: 'CloudScale',
        location: 'Austin, TX',
        type: 'contract',
        salary: '$80/hr',
        requirements: ['AWS', 'Docker', 'Kubernetes', 'CI/CD'],
        preferred: ['Terraform', 'Ansible'],
        description: 'We need a DevOps engineer to help scale our infrastructure...',
        postedAt: '3 days ago',
    },
];

const jobTypes = ['all', 'full-time', 'part-time', 'contract', 'remote'];

export default function JobBoard() {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedType, setSelectedType] = useState('all');
    const [selectedJob, setSelectedJob] = useState<typeof demoJobs[0] | null>(null);

    const filteredJobs = demoJobs.filter((job) => {
        const matchesSearch =
            job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
            job.requirements.some((r) => r.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchesType = selectedType === 'all' || job.type === selectedType;
        return matchesSearch && matchesType;
    });

    const getTypeBadge = (type: string) => {
        const colors: Record<string, string> = {
            'full-time': 'bg-primary-500/20 text-primary-400 border-primary-500/30',
            'part-time': 'bg-accent-500/20 text-accent-400 border-accent-500/30',
            contract: 'bg-warning-500/20 text-warning-500 border-warning-500/30',
            remote: 'bg-success-500/20 text-success-500 border-success-500/30',
        };
        return `badge ${colors[type] || 'badge-primary'}`;
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-white mb-2">Job Board</h1>
                <p className="text-white/60">Find your dream role and create a learning roadmap tailored to it</p>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search by title, company, or skill..."
                        className="input-field pl-12"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Filter className="w-5 h-5 text-white/40" />
                    <div className="flex gap-2">
                        {jobTypes.map((type) => (
                            <button
                                key={type}
                                onClick={() => setSelectedType(type)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${selectedType === type
                                        ? 'bg-primary-500 text-white'
                                        : 'bg-white/5 text-white/60 hover:bg-white/10'
                                    }`}
                            >
                                {type.charAt(0).toUpperCase() + type.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-6">
                {/* Job List */}
                <div className="flex-1 space-y-4">
                    {filteredJobs.map((job) => (
                        <motion.div
                            key={job.id}
                            layout
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`glass-card-hover p-6 rounded-2xl cursor-pointer ${selectedJob?.id === job.id ? 'border-2 border-primary-500' : ''
                                }`}
                            onClick={() => setSelectedJob(job)}
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <h3 className="text-lg font-semibold text-white mb-1">{job.title}</h3>
                                    <div className="flex items-center gap-2 text-white/60">
                                        <Building2 className="w-4 h-4" />
                                        <span>{job.company}</span>
                                    </div>
                                </div>
                                <span className={getTypeBadge(job.type)}>{job.type}</span>
                            </div>

                            <div className="flex flex-wrap items-center gap-4 text-sm text-white/60 mb-4">
                                <span className="flex items-center gap-1">
                                    <MapPin className="w-4 h-4" />
                                    {job.location}
                                </span>
                                <span className="flex items-center gap-1">
                                    <DollarSign className="w-4 h-4" />
                                    {job.salary}
                                </span>
                                <span className="flex items-center gap-1">
                                    <Clock className="w-4 h-4" />
                                    {job.postedAt}
                                </span>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                {job.requirements.slice(0, 4).map((req) => (
                                    <span key={req} className="px-2 py-1 rounded-md bg-white/5 text-xs text-white/80">
                                        {req}
                                    </span>
                                ))}
                                {job.requirements.length > 4 && (
                                    <span className="px-2 py-1 rounded-md bg-white/5 text-xs text-white/40">
                                        +{job.requirements.length - 4} more
                                    </span>
                                )}
                            </div>
                        </motion.div>
                    ))}

                    {filteredJobs.length === 0 && (
                        <div className="text-center py-12">
                            <Briefcase className="w-12 h-12 mx-auto text-white/20 mb-4" />
                            <p className="text-white/60">No jobs found matching your criteria</p>
                        </div>
                    )}
                </div>

                {/* Job Details Panel */}
                <AnimatePresence mode="wait">
                    {selectedJob && (
                        <motion.div
                            key={selectedJob.id}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="lg:w-[400px] glass-card p-6 rounded-2xl h-fit lg:sticky lg:top-6"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <h2 className="text-xl font-bold text-white mb-1">{selectedJob.title}</h2>
                                    <p className="text-white/60">{selectedJob.company}</p>
                                </div>
                                <button
                                    onClick={() => setSelectedJob(null)}
                                    className="p-2 hover:bg-white/10 rounded-lg transition-colors lg:hidden"
                                >
                                    <X className="w-5 h-5 text-white/60" />
                                </button>
                            </div>

                            <div className="space-y-3 mb-6">
                                <div className="flex items-center gap-2 text-white/80">
                                    <MapPin className="w-4 h-4 text-white/40" />
                                    {selectedJob.location}
                                </div>
                                <div className="flex items-center gap-2 text-white/80">
                                    <DollarSign className="w-4 h-4 text-white/40" />
                                    {selectedJob.salary}
                                </div>
                                <div className="flex items-center gap-2 text-white/80">
                                    <Briefcase className="w-4 h-4 text-white/40" />
                                    {selectedJob.type}
                                </div>
                            </div>

                            <div className="mb-6">
                                <h3 className="font-semibold text-white mb-3">Required Skills</h3>
                                <div className="flex flex-wrap gap-2">
                                    {selectedJob.requirements.map((req) => (
                                        <span
                                            key={req}
                                            className="px-3 py-1 rounded-full bg-primary-500/20 text-primary-400 text-sm border border-primary-500/30"
                                        >
                                            {req}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div className="mb-6">
                                <h3 className="font-semibold text-white mb-3">Nice to Have</h3>
                                <div className="flex flex-wrap gap-2">
                                    {selectedJob.preferred.map((pref) => (
                                        <span
                                            key={pref}
                                            className="px-3 py-1 rounded-full bg-white/5 text-white/60 text-sm border border-white/10"
                                        >
                                            {pref}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div className="mb-6">
                                <h3 className="font-semibold text-white mb-2">Description</h3>
                                <p className="text-white/60 text-sm">{selectedJob.description}</p>
                            </div>

                            <Link
                                to={`/roadmap?job=${selectedJob.id}`}
                                className="btn-primary w-full flex items-center justify-center gap-2"
                            >
                                Create Learning Roadmap
                                <ChevronRight className="w-5 h-5" />
                            </Link>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
