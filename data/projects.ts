// Project data for portfolio

export interface Project {
    id: string;
    title: string;
    description: string;
    longDescription: string;
    technologies: string[];
    category: 'Frontend' | 'GIS' | 'Automation' | 'Engineering' | 'Python';
    image: string;
    github?: string;
    demo?: string;
    featured: boolean;
}

export const projects: Project[] = [
    {
        id: 'cft-processing',
        title: 'CFT Data Processing Automation',
        description: 'Building full system for pavement and assets analytics for the whole Saudi Arabia',
        longDescription: 'Built a comprehensive automation system that processes raw CFT data, performs statistical analysis, generates reports, and creates visualizations. Reduced processing time from 4 hours to 15 minutes.',
        technologies: ['Python', 'Pandas', 'NumPy', 'Matplotlib', 'Excel'],
        category: 'Automation',
        image: '/projects/cft-automation.jpg',
        github: 'https://github.com/mohab/cft-automation',
        featured: true,
    },
    {
        id: 'excel-row-split',
        title: 'Excel Row Split Tool',
        description: 'Automation of all pavement and assets data by Python and its libraries (not only CFT)',
        longDescription: 'Web-based tool that allows engineers to input length values and automatically split them into equal segments. Used daily by the pavement analysis team.',
        technologies: ['React', 'TypeScript', 'Next.js', 'TailwindCSS'],
        category: 'Frontend',
        image: '/projects/excel-tool.jpg',
        demo: 'https://excel-split-tool.vercel.app',
        featured: true,
    },
    {
        id: 'coordinate-matching',
        title: 'Coordinate Matching Automation',
        description: 'Excel tools built with Python, converted to .exe files to make them easier for all company employees to use',
        longDescription: 'Python script that reads coordinate data from Excel and shapefiles, performs spatial joins, and outputs matched results with section codes. Handles 10,000+ points in seconds.',
        technologies: ['Python', 'GeoPandas', 'Shapely', 'QGIS'],
        category: 'GIS',
        image: '/projects/coordinate-matching.jpg',
        github: 'https://github.com/mohab/coordinate-matcher',
        featured: true,
    },
    {
        id: 'pavement-dashboard',
        title: 'Pavement Data Visualization Dashboard',
        description: 'Real-time dashboard for analyzing pavement condition data',
        longDescription: 'Interactive dashboard displaying friction values, crack density, and structural data. Features real-time filtering, chart visualization, and data export capabilities.',
        technologies: ['React', 'Next.js', 'Recharts', 'TypeScript', 'PostgreSQL'],
        category: 'Frontend',
        image: '/projects/dashboard.jpg',
        demo: 'https://pavement-dashboard.vercel.app',
        featured: true,
    },
    {
        id: 'gis-viewer',
        title: 'Infrastructure GIS Viewer',
        description: 'Interactive map for visualizing infrastructure survey data',
        longDescription: 'Web-based GIS platform with layer management, spatial queries, and data visualization. Supports multiple data formats and real-time updates.',
        technologies: ['React', 'MapboxGL', 'Next.js', 'TypeScript'],
        category: 'GIS',
        image: '/projects/gis-viewer.jpg',
        demo: 'https://infra-gis.vercel.app',
        featured: false,
    },
    {
        id: 'lcms-processor',
        title: 'LCMS Data Processor',
        description: 'Automated pipeline for Laser Crack Measurement System data',
        longDescription: 'Processes raw LCMS data, extracts crack patterns, calculates density metrics, and generates detailed reports with visualization.',
        technologies: ['Python', 'OpenCV', 'Pandas', 'SciPy'],
        category: 'Engineering',
        image: '/projects/lcms.jpg',
        github: 'https://github.com/mohab/lcms-processor',
        featured: false,
    },
    {
        id: 'fwd-analyzer',
        title: 'FWD Data Analysis Tool',
        description: 'Analysis tool for Falling Weight Deflectometer structural evaluation',
        longDescription: 'Calculates pavement layer moduli, performs backcalculation, and generates structural capacity reports based on FWD deflection data.',
        technologies: ['Python', 'NumPy', 'SciPy', 'Matplotlib'],
        category: 'Engineering',
        image: '/projects/fwd.jpg',
        featured: false,
    },
    {
        id: 'survey-automation',
        title: 'Survey Report Generator',
        description: 'Automated report generation from multiple survey data sources',
        longDescription: 'Consolidates data from LCMS, CFT, FWD, and GPR systems into comprehensive engineering reports with charts, maps, and analysis.',
        technologies: ['Python', 'Pandas', 'ReportLab', 'Jinja2'],
        category: 'Automation',
        image: '/projects/reports.jpg',
        github: 'https://github.com/mohab/survey-automation',
        featured: false,
    },
];

export const categories = ['All', 'Frontend', 'GIS', 'Automation', 'Engineering', 'Python'];
