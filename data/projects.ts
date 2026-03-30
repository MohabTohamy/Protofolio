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
        id: 'saudi-pavement-system',
        title: 'Saudi Arabia Pavement Management System',
        description: 'Developed a complete front-end system for a pavement and asset management platform used in Saudi Arabia. The platform includes advanced dashboards, interactive data visualizations, and modern UI architecture built with React. Focused on performance, usability, and scalable component design while integrating 3D visual elements for better data presentation.',
        longDescription: 'Comprehensive frontend engineering system for pavement and asset management in Saudi Arabia. Features include real-time data visualization, 3D visual elements, interactive dashboards, and advanced analytics tools. Demonstrates expertise in creating complex engineering platforms with modern web technologies and scalable architecture.',
        technologies: ['React', 'Next.js', 'TypeScript'],
        category: 'Frontend',
        image: '/projects/saudi-system.jpg',
        demo: 'https://pavement-system.vercel.app',
        featured: true,
    },
    {
        id: 'trimble-publisher-autoclicker',
        title: 'Trimble Publisher AI AutoClicker',
        description: 'Built an EXE automation program integrated with an AI module that operates Trimble Publisher autonomously — detecting light poles in the field data, then auto-filling all required attribute fields including pole height, lamp count, pole type, lamp type, and any recorded defects without manual input.',
        longDescription: 'A fully autonomous desktop automation tool built in Python and packaged as an EXE. The program connects to an AI detection module that identifies light poles from survey data, then drives Trimble Publisher through simulated input to populate every required field: pole height, number of lamps, pole type, lamp specifications, and defect records. Eliminated hours of repetitive manual data entry for field survey teams, reduced human error in attribute population, and significantly accelerated the data publishing workflow on infrastructure asset projects.',
        technologies: ['Python', 'PyAutoGUI', 'AI Integration', 'Win32 API', 'PyInstaller', 'Computer Vision'],
        category: 'Automation',
        image: '/projects/automation-suite.jpg',
        featured: true,
    },
    {
        id: '3d-web-designs',
        title: 'Interactive 3D Web Experiences',
        description: 'Designing and developing modern web interfaces that integrate interactive 3D elements and immersive visual experiences. Building creative front-end designs using React and Three.js to deliver engaging and visually dynamic user interfaces.',
        longDescription: 'Portfolio of interactive 3D web designs showcasing advanced frontend skills. Includes particle systems, animated geometries, interactive environments, and immersive user experiences using Three.js, React Three Fiber, and modern web technologies.',
        technologies: ['React', 'Three.js', 'React Three Fiber'],
        category: 'Frontend',
        image: '/projects/3d-designs.jpg',
        demo: '/three-lab',
        featured: true,
    },
    {
        id: 'pavement-dashboard',
        title: 'Pavement Data Visualization Dashboard',
        description: 'Real-time dashboard for analyzing pavement condition data',
        longDescription: 'Interactive dashboard displaying friction values, crack density, and structural data. Features real-time filtering, chart visualization, and data export capabilities.',
        technologies: ['React', 'Next.js', 'Recharts', 'TypeScript', 'SQL'],
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
        id: 'lcms-data-analysis',
        title: 'LCMS Data Analysis & Quality Control Tool',
        description: 'Python tool that ingests raw output from LCMS (Laser Crack Measurement System) machines, validates every record, separates correct defect data from erroneous entries, verifies area, length, and width values, counts distress occurrences, and merges large batches of files — cutting what would take days of manual review down to minutes.',
        longDescription: 'Built to handle the messy reality of LCMS machine output, this tool loads and merges large volumes of raw survey files, then runs structured validation logic to flag and separate wrong data from correct records. It checks that defect geometries (area, length, width) are physically plausible, counts distress occurrences by type and severity, and consolidates everything into clean, engineer-ready datasets. Replaced weeks of manual spreadsheet work with a single automated run. Handles edge cases specific to LCMS output formats and produces clear reports distinguishing valid from invalid records.',
        technologies: ['Python', 'Pandas', 'NumPy', 'OpenPyXL', 'Data Validation'],
        category: 'Python',
        image: '/projects/lcms.jpg',
        featured: true,
    },
    {
        id: 'lcms-file-manager',
        title: 'LCMS File Inspector & Report Extractor EXE',
        description: 'Desktop EXE tool that scans directories of LCMS survey files, identifies each file\'s recorded date, classifies files as working or failed, pinpoints their storage locations, tallies file counts by status, and exports a structured Excel report — giving engineers an instant overview of which data is usable and where it lives.',
        longDescription: 'Developed as a standalone EXE for non-technical field and office engineers who need to audit large collections of LCMS files without writing any code. The tool recursively scans target folders, reads file metadata and internal headers to extract acquisition dates, applies validation logic to classify each file as working (complete, uncorrupted, in-spec) or failed, records the exact file path and folder location, and produces a formatted Excel report with counts, status flags, and location columns. Saved engineering teams hours of manual file auditing on every project handover and helped prevent engineers from unknowingly working on corrupted or incomplete scan files.',
        technologies: ['Python', 'Pandas', 'OpenPyXL', 'OS / Pathlib', 'PyInstaller'],
        category: 'Python',
        image: '/projects/lcms.jpg',
        featured: true,
    },
    {
        id: 'python-data-engineering',
        title: 'Python Data Engineering & Processing Scripts',
        description: 'Ongoing body of Python work covering the full spectrum of engineering data challenges: splitting oversized datasets, fixing coordinate and formatting issues in GIS exports, detecting and correcting wrong or corrupted records, reorganizing file structures, converting between data formats, and implementing whatever custom data logic the project demands.',
        longDescription: 'A continuously growing collection of purpose-built Python scripts developed to solve real data problems across multiple engineering projects. Work spans data splitting and merging, coordinate system fixes, format conversions (Excel, CSV, GeoJSON, Shapefiles), duplicate and anomaly detection, field-level data correction, automated file renaming and organization, and bespoke analysis pipelines tailored to specific project requirements. Each script is built fast, targets the exact problem at hand, and is designed to be run repeatedly as new data batches arrive — replacing manual work that would otherwise consume days of an engineer\'s time.',
        technologies: ['Python', 'Pandas', 'GeoPandas', 'OpenPyXL', 'NumPy', 'JSON', 'CSV'],
        category: 'Python',
        image: '/projects/automation-suite.jpg',
        featured: false,
    },
    {
        id: 'python-automation-tools',
        title: 'Engineering Data Automation Suite',
        description: 'Designed and built automation tools using Python to process engineering data and infrastructure datasets. These tools automate complex analysis workflows, reduce manual processing time, and improve accuracy for large pavement and asset datasets. Utilized Python libraries such as Pandas and NumPy to build efficient data pipelines.',
        longDescription: 'Comprehensive suite of Python automation tools for engineering data processing. Automates complex workflows including data analysis, statistical processing, report generation, and data visualization. Reduced processing time from hours to minutes while improving accuracy and consistency across large infrastructure datasets.',
        technologies: ['Python', 'Pandas', 'NumPy'],
        category: 'Automation',
        image: '/projects/automation-suite.jpg',
        github: 'https://github.com/mohab/automation-tools',
        featured: true,
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
        id: 'pci-analyzer',
        title: 'PCI Data Analysis Tool',
        description: 'Analysis tool for Pavement Condition Index evaluation',
        longDescription: 'Calculates pavement layer moduli, performs backcalculation, and generates structural capacity reports based on PCI data.',
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
