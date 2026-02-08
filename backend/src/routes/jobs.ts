import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// Demo jobs data (in production, this would come from a database or external API)
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
        description: 'We are looking for a Senior Full-Stack Developer to join our growing team. You will be responsible for building and maintaining our core platform.',
        postedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
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
        description: 'Join our dynamic startup building the future of productivity tools.',
        postedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
        id: '3',
        title: 'Node.js Backend Developer',
        company: 'Enterprise Inc',
        location: 'New York, NY',
        type: 'full-time',
        salary: '$130k - $170k',
        requirements: ['Node.js', 'Express', 'MongoDB', 'REST APIs'],
        preferred: ['Microservices', 'Message Queues', 'Redis'],
        description: 'Looking for an experienced backend developer to scale our services.',
        postedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
        id: '4',
        title: 'DevOps Engineer',
        company: 'CloudScale',
        location: 'Austin, TX',
        type: 'contract',
        salary: '$80/hr',
        requirements: ['AWS', 'Docker', 'Kubernetes', 'CI/CD'],
        preferred: ['Terraform', 'Ansible', 'Monitoring'],
        description: 'We need a DevOps engineer to help scale our infrastructure.',
        postedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    },
];

// Get jobs with filtering and pagination
router.get('/', authenticate, async (req, res, next) => {
    try {
        const { page = '1', pageSize = '10', search, type, location } = req.query;

        let filteredJobs = [...demoJobs];

        // Apply filters
        if (search && typeof search === 'string') {
            const searchLower = search.toLowerCase();
            filteredJobs = filteredJobs.filter(
                (job) =>
                    job.title.toLowerCase().includes(searchLower) ||
                    job.company.toLowerCase().includes(searchLower) ||
                    job.requirements.some((r) => r.toLowerCase().includes(searchLower))
            );
        }

        if (type && typeof type === 'string' && type !== 'all') {
            filteredJobs = filteredJobs.filter((job) => job.type === type);
        }

        if (location && typeof location === 'string') {
            filteredJobs = filteredJobs.filter((job) =>
                job.location.toLowerCase().includes(location.toLowerCase())
            );
        }

        // Pagination
        const pageNum = parseInt(page as string, 10);
        const size = parseInt(pageSize as string, 10);
        const startIndex = (pageNum - 1) * size;
        const paginatedJobs = filteredJobs.slice(startIndex, startIndex + size);

        res.json({
            success: true,
            data: {
                items: paginatedJobs,
                total: filteredJobs.length,
                page: pageNum,
                pageSize: size,
                totalPages: Math.ceil(filteredJobs.length / size),
            },
        });
    } catch (error) {
        next(error);
    }
});

// Get single job
router.get('/:id', authenticate, async (req, res, next) => {
    try {
        const job = demoJobs.find((j) => j.id === req.params.id);

        if (!job) {
            return res.status(404).json({
                success: false,
                message: 'Job not found',
            });
        }

        res.json({ success: true, data: job });
    } catch (error) {
        next(error);
    }
});

export default router;
