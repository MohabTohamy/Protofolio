// Experience timeline data

export interface Experience {
    id: string;
    title: string;
    company: string;
    period: string;
    description: string;
    technologies: string[];
    achievements: string[];
}

export const experiences: Experience[] = [
    {
        id: 'saudi-tech',
        title: 'Junior Software Engineer',
        company: 'Saudi-Tech — Riyadh, Saudi Arabia',
        period: 'May 2025 – Present',
        description: 'Building and maintaining React-based web applications for enterprise-scale asset and pavement management platforms used in real production environments.',
        technologies: ['React', 'TypeScript', 'ASP.NET Core', 'C#', 'REST APIs', 'Python', 'GIS Mapping', 'SQL Server'],
        achievements: [
            'Develop and ship frontend features including work orders, asset modules, quantity tables, and user management',
            'Integrate frontend components with ASP.NET Core backend APIs and database-driven services',
            'Handle async data flows, API error handling, and application state management with Redux',
            'Build Python automation scripts and standalone EXE tools that streamline engineering workflows',
            'Implement GIS-based map visualization and spatial data features as part of the application UI',
            'Collaborate with backend developers, analysts, and stakeholders to translate requirements into working software',
            'Manage application deployment and publishing to IIS production servers',
        ],
    },
    {
        id: 'irri-vision',
        title: 'Front-End Developer (Remote)',
        company: 'IRRI Vision',
        period: 'Sep 2024 – Dec 2024',
        description: 'Developed frontend modules for an Electronic Medical Record (EMR) system, focusing on scheduling, dashboards, and reusable component architecture.',
        technologies: ['React', 'TypeScript', 'REST APIs', 'Tailwind CSS'],
        achievements: [
            'Built scheduling interfaces, dashboards, and calendar-based features for an EMR system',
            'Integrated third-party libraries and REST APIs into the frontend',
            'Focused on reusable components, clean UI structure, and responsive design',
        ],
    },
    {
        id: 'route-academy',
        title: 'Front-End Developer (Internship)',
        company: 'Route Academy — Cairo, Egypt',
        period: 'Mar 2024 – Aug 2024',
        description: 'Intensive frontend development internship building real React applications from scratch, covering the full modern JavaScript development workflow.',
        technologies: ['React', 'JavaScript', 'HTML5', 'CSS3', 'REST APIs'],
        achievements: [
            'Built multiple React applications including a complete e-commerce platform',
            'Implemented authentication flows, CRUD operations, and API integrations',
            'Practiced component-based architecture, debugging, and modern JS development patterns',
        ],
    },
];

export interface Skill {
    name: string;
    level: number; // 0-100
    category: 'Frontend' | 'Backend' | 'Engineering' | 'Tools';
}

export const skills: Skill[] = [
    // Frontend
    { name: 'React.js', level: 88, category: 'Frontend' },
    { name: 'TypeScript', level: 82, category: 'Frontend' },
    { name: 'Next.js', level: 80, category: 'Frontend' },
    { name: 'Tailwind CSS', level: 90, category: 'Frontend' },

    // Backend & Data
    { name: 'ASP.NET Core / C#', level: 65, category: 'Backend' },
    { name: 'Python', level: 85, category: 'Backend' },
    { name: 'REST APIs', level: 85, category: 'Backend' },
    { name: 'SQL Server / PostgreSQL', level: 65, category: 'Backend' },

    // Automation
    { name: 'Python Automation & EXE Tools', level: 88, category: 'Engineering' },
    { name: 'Data Processing', level: 85, category: 'Engineering' },
    { name: 'GIS & Map Visualization', level: 75, category: 'Engineering' },

    // Tools
    { name: 'Git & GitHub', level: 85, category: 'Tools' },
    { name: 'IIS Deployment', level: 75, category: 'Tools' },
    { name: 'VS Code / Visual Studio', level: 90, category: 'Tools' },
];
