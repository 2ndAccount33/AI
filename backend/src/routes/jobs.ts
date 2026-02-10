import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import axios from 'axios';

const router = Router();

// Adzuna API configuration
const ADZUNA_APP_ID = process.env.ADZUNA_APP_ID;
const ADZUNA_API_KEY = process.env.ADZUNA_API_KEY;

// Demo jobs fallback (used when Adzuna API is not configured)
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

// Helper: extract likely skills from job description text
function extractSkillsFromDescription(description: string): string[] {
    const knownSkills = [
        'javascript', 'typescript', 'react', 'angular', 'vue', 'node.js', 'nodejs',
        'python', 'django', 'flask', 'java', 'spring', 'go', 'golang', 'rust',
        'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'terraform',
        'sql', 'postgresql', 'mongodb', 'redis', 'graphql', 'rest',
        'git', 'ci/cd', 'agile', 'scrum', 'linux', 'html', 'css',
        'machine learning', 'deep learning', 'tensorflow', 'pytorch',
        'c++', 'c#', '.net', 'swift', 'kotlin', 'ruby', 'php', 'laravel'
    ];
    const descLower = description.toLowerCase();
    return knownSkills.filter(skill => descLower.includes(skill));
}

// ============================================================
// REAL JOB SEARCH via Adzuna API (with fallback to demo data)
// ============================================================
router.get('/search', authenticate, async (req, res, next) => {
    try {
        const { skills, location = 'us', page = '1' } = req.query;
        const query = (skills as string) || 'developer';

        // If Adzuna API keys are configured, use real API
        if (ADZUNA_APP_ID && ADZUNA_API_KEY) {
            try {
                const country = (location as string).toLowerCase() === 'remote' ? 'us' : (location as string).toLowerCase();
                const url = `https://api.adzuna.com/v1/api/jobs/${country}/search/${page}`;

                const response = await axios.get(url, {
                    params: {
                        app_id: ADZUNA_APP_ID,
                        app_key: ADZUNA_API_KEY,
                        results_per_page: 20,
                        what: query,
                        'content-type': 'application/json'
                    }
                });

                // Transform Adzuna response to our format
                const jobs = response.data.results.map((job: any) => ({
                    id: String(job.id),
                    title: job.title,
                    company: job.company?.display_name || 'Unknown Company',
                    location: job.location?.display_name || 'Remote',
                    type: job.contract_time === 'full_time' ? 'full-time'
                        : job.contract_time === 'part_time' ? 'part-time'
                            : job.contract_type === 'contract' ? 'contract' : 'full-time',
                    salary: job.salary_min && job.salary_max
                        ? `$${Math.round(job.salary_min / 1000)}k - $${Math.round(job.salary_max / 1000)}k`
                        : 'Not specified',
                    requirements: extractSkillsFromDescription(job.description || ''),
                    preferred: [],
                    description: job.description?.substring(0, 500) || '',
                    url: job.redirect_url,
                    postedAt: job.created,
                }));

                console.log(`✅ Adzuna API returned ${jobs.length} jobs for query: "${query}"`);

                return res.json({
                    success: true,
                    data: {
                        items: jobs,
                        total: response.data.count || jobs.length,
                        page: parseInt(page as string, 10),
                        pageSize: 20,
                        totalPages: Math.ceil((response.data.count || jobs.length) / 20),
                        source: 'adzuna',
                    },
                });
            } catch (apiError: any) {
                console.warn(`⚠️ Adzuna API failed: ${apiError.message}. Falling back to demo data.`);
                // Fall through to demo data below
            }
        }

        // Fallback: filter demo jobs by skills
        console.log(`ℹ️ Using demo job data (Adzuna API not configured or failed)`);
        const queryLower = query.toLowerCase();
        const matchingJobs = demoJobs.filter(job =>
            job.title.toLowerCase().includes(queryLower) ||
            job.requirements.some(r => r.toLowerCase().includes(queryLower)) ||
            job.description.toLowerCase().includes(queryLower)
        );

        // Return matches, or all demo jobs if no match
        const results = matchingJobs.length > 0 ? matchingJobs : demoJobs;

        res.json({
            success: true,
            data: {
                items: results,
                total: results.length,
                page: 1,
                pageSize: 20,
                totalPages: 1,
                source: 'demo',
            },
        });
    } catch (error) {
        next(error);
    }
});

// Get jobs with filtering and pagination (original route, kept for backward compatibility)
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
