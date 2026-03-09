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
        id: 'pavement-analysis',
        title: 'Pavement Data Analysis Engineer',
        company: 'Infrastructure Engineering Co.',
        period: '2022 - Present',
        description: 'Leading pavement condition assessment projects using advanced survey technologies',
        technologies: ['LCMS', 'CFT', 'FWD', 'HWD', 'GPR', 'Python', 'QGIS'],
        achievements: [
            'Automated LCMS data processing, reducing analysis time by 85%',
            'Developed CFT friction data analysis pipeline',
            'Built GIS coordinate matching system for 50,000+ survey points',
            'Created automated reporting system for multiple survey technologies',
        ],
    },
    {
        id: 'gis-developer',
        title: 'GIS & Automation Developer',
        company: 'Infrastructure Engineering Co.',
        period: '2021 - 2022',
        description: 'Developed GIS tools and automation scripts for infrastructure data management',
        technologies: ['Python', 'GeoPandas', 'QGIS', 'ArcGIS', 'PostGIS'],
        achievements: [
            'Created coordinate transformation and matching utilities',
            'Built spatial analysis tools for road network data',
            'Automated data migration from legacy systems',
            'Developed custom QGIS plugins for internal workflows',
        ],
    },
    {
        id: 'frontend-developer',
        title: 'Frontend Developer',
        company: 'Freelance',
        period: '2020 - Present',
        description: 'Building modern web applications with focus on data visualization and engineering tools',
        technologies: ['React', 'Next.js', 'TypeScript', 'TailwindCSS', 'Three.js'],
        achievements: [
            'Developed interactive dashboards for engineering data',
            'Built GIS web viewers with Mapbox/MapLibre',
            'Created data visualization platforms with Recharts',
            'Implemented 3D visualization tools with Three.js',
        ],
    },
    {
        id: 'software-engineer',
        title: 'Software Engineer',
        company: 'Engineering Solutions',
        period: '2019 - 2021',
        description: 'Worked on automation systems and engineering analysis projects',
        technologies: ['Python', 'MATLAB', 'Arduino', 'PLC', 'CAD'],
        achievements: [
            'Designed automated control systems',
            'Performed structural analysis and simulation',
            'Developed data acquisition systems',
            'Created engineering calculation tools',
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
    { name: 'React', level: 90, category: 'Frontend' },
    { name: 'Next.js', level: 88, category: 'Frontend' },
    { name: 'TypeScript', level: 85, category: 'Frontend' },
    { name: 'TailwindCSS', level: 92, category: 'Frontend' },

    // Backend & Data
    { name: 'Python', level: 50, category: 'Backend' },
    { name: 'Pandas', level: 88, category: 'Backend' },
    { name: 'GeoPandas', level: 82, category: 'Backend' },

    // Engineering
    { name: 'GIS', level: 85, category: 'Engineering' },
    { name: 'Data Analysis', level: 90, category: 'Engineering' },
    { name: 'Automation', level: 92, category: 'Engineering' },
    { name: 'LCMS', level: 88, category: 'Engineering' },
    { name: 'CFT', level: 85, category: 'Engineering' },
    { name: 'FWD/HWD', level: 80, category: 'Engineering' },

    // Tools
    { name: 'QGIS', level: 85, category: 'Tools' },
    { name: 'Git', level: 88, category: 'Tools' },
    { name: 'VS Code', level: 90, category: 'Tools' },
    { name: 'Excel/VBA', level: 85, category: 'Tools' },
];
