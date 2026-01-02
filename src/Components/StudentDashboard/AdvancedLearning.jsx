import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from 'react-bootstrap';
import {
    FaArrowLeft, FaBook, FaVideo, FaUserTie,
    FaJava, FaPython, FaReact, FaNodeJs, FaHtml5, FaCss3, FaJs, FaDatabase, FaCode, FaAngular, FaPhp, FaLaptopCode,
    FaMicrochip, FaWaveSquare, FaSatelliteDish, FaBolt, FaRobot, FaNetworkWired, FaCogs, FaChartLine, FaBuilding, FaFlask,
    FaChevronRight, FaChevronLeft, FaList, FaPlay, FaCheckCircle, FaCloud, FaShieldAlt, FaCubes
} from 'react-icons/fa';
import { SiDjango, SiFlask, SiMongodb, SiCplusplus, SiArduino, SiRaspberrypi } from 'react-icons/si';
import { apiGet } from '../../utils/apiClient';
import TestInterface from './TestInterface';
import { getCourseContent } from './advancedContentData';
import './AdvancedLearning.css';
import '../StudentDashboard/StudentDashboard.css';

// Branch-specific Advanced Courses
const BRANCH_COURSES = {
    // CSE, AIML, IT - Programming & Software
    CSE: {
        title: "Computer Science Engineering",
        categories: {
            "Programming Languages": ["Python", "Java", "C", "C++", "JavaScript", "Go", "Rust"],
            "Web Development & Frameworks": ["HTML/CSS", "React", "Angular", "Vue.js", "Node.js", "Express.js", "Django", "Flask"],
            "Databases & Backend": ["MongoDB", "MySQL", "PostgreSQL", "Redis", "GraphQL"],
            "Advanced Topics": ["Machine Learning", "Data Science", "Cloud Computing", "DevOps", "Docker", "Kubernetes", "Cyber Security"]
        }
    },
    AIML: {
        title: "AI & Machine Learning",
        categories: {
            "Programming Languages": ["Python", "R", "Julia", "Java"],
            "AI/ML Frameworks": ["TensorFlow", "PyTorch", "Keras", "Scikit-Learn", "OpenCV"],
            "Data Science": ["Pandas", "NumPy", "Matplotlib", "Data Visualization", "Big Data"],
            "Advanced AI": ["Deep Learning", "Natural Language Processing", "Computer Vision", "Reinforcement Learning", "Generative AI"]
        }
    },
    IT: {
        title: "Information Technology",
        categories: {
            "Programming Languages": ["Python", "Java", "JavaScript", "PHP"],
            "Web Development": ["HTML/CSS", "React", "Node.js", "WordPress", "REST APIs"],
            "Databases": ["MySQL", "MongoDB", "SQL Server"],
            "IT Skills": ["Cloud Computing", "Networking", "Cyber Security", "Linux", "DevOps"]
        }
    },
    // ECE - Electronics & Communication
    ECE: {
        title: "Electronics & Communication Engineering",
        categories: {
            "Core Electronics": ["Analog Electronics", "Digital Electronics", "Microprocessors", "Microcontrollers", "VLSI Design"],
            "Communication Systems": ["Signal Processing", "Wireless Communication", "Antenna Design", "Optical Communication", "5G Technology"],
            "Embedded Systems": ["Arduino", "Raspberry Pi", "ARM Programming", "IoT Development", "RTOS"],
            "Advanced Topics": ["FPGA Design", "PCB Design", "RF Engineering", "Satellite Communication", "Robotics"]
        }
    },
    // EEE - Electrical Engineering
    EEE: {
        title: "Electrical & Electronics Engineering",
        categories: {
            "Core Electrical": ["Power Systems", "Electrical Machines", "Control Systems", "Power Electronics"],
            "Renewable Energy": ["Solar Power Systems", "Wind Energy", "Smart Grid", "Energy Storage"],
            "Industrial Automation": ["PLC Programming", "SCADA Systems", "Industrial IoT", "Motor Drives"],
            "Advanced Topics": ["Electric Vehicles", "High Voltage Engineering", "Power Quality", "MATLAB/Simulink"]
        }
    },
    // MECH - Mechanical Engineering
    MECH: {
        title: "Mechanical Engineering",
        categories: {
            "Design & CAD": ["AutoCAD", "SolidWorks", "CATIA", "Fusion 360", "3D Printing"],
            "Manufacturing": ["CNC Programming", "Additive Manufacturing", "Lean Manufacturing", "Six Sigma"],
            "Core Mechanical": ["Thermodynamics", "Fluid Mechanics", "Strength of Materials", "Machine Design"],
            "Advanced Topics": ["Robotics", "Mechatronics", "ANSYS", "CFD Analysis", "Automotive Engineering"]
        }
    },
    // CIVIL - Civil Engineering
    CIVIL: {
        title: "Civil Engineering",
        categories: {
            "Design Software": ["AutoCAD Civil 3D", "STAAD Pro", "ETABS", "Revit", "Primavera"],
            "Structural Engineering": ["RCC Design", "Steel Structures", "Pre-stressed Concrete", "Earthquake Engineering"],
            "Construction Management": ["Project Management", "Cost Estimation", "Quality Control", "Site Management"],
            "Advanced Topics": ["Green Building", "BIM", "Geotechnical Engineering", "Transportation Engineering"]
        }
    },
    // Default for other branches
    DEFAULT: {
        title: "Advanced Learning",
        categories: {
            "Programming Basics": ["Python", "C", "Java"],
            "Web Technologies": ["HTML/CSS", "JavaScript", "React"],
            "Data Skills": ["Excel Advanced", "Data Analysis", "SQL"],
            "Professional Skills": ["Communication", "Presentation", "Project Management", "Leadership"]
        }
    }
};

const AdvancedLearning = ({ isDashboard = false }) => {
    const navigate = useNavigate();
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [branchTitle, setBranchTitle] = useState("Advanced Learning Hub");
    const [categories, setCategories] = useState({});

    // Views: 'catalog' | 'viewer'
    const [viewMode, setViewMode] = useState('catalog');

    // Viewer State
    const [activeCourse, setActiveCourse] = useState(null);
    const [activeTopics, setActiveTopics] = useState([]);
    const [currentTopicIndex, setCurrentTopicIndex] = useState(0);

    // Progress State
    const [progressData, setProgressData] = useState({});
    const [showTestInterface, setShowTestInterface] = useState(false);
    const [courseProgress, setCourseProgress] = useState({});

    useEffect(() => {
        const fetchSubjects = async () => {
            try {
                // Get student's branch from localStorage
                const userData = JSON.parse(localStorage.getItem('userData') || '{}');
                const studentBranch = (userData.branch || 'CSE').toUpperCase();

                // Get branch-specific courses
                const branchData = BRANCH_COURSES[studentBranch] || BRANCH_COURSES.DEFAULT;
                setBranchTitle(branchData.title);
                setCategories(branchData.categories);

                // Flatten all courses for the subject list
                const allCourses = Object.values(branchData.categories).flat();
                setSubjects(allCourses);

                // Generate random progress for demo
                const prog = {};
                allCourses.forEach(s => {
                    prog[s] = Math.floor(Math.random() * 40); // 0-40% started
                });
                setProgressData(prog);

                // Load real progress from API
                loadCourseProgress(allCourses);

            } catch (error) {
                console.error('Failed to load advanced learning:', error);
                const fallbackData = BRANCH_COURSES.CSE;
                setCategories(fallbackData.categories);
                setSubjects(Object.values(fallbackData.categories).flat());
            } finally {
                setLoading(false);
            }
        };

        fetchSubjects();
    }, []);

    const loadCourseProgress = async (courses) => {
        try {
            const userData = JSON.parse(localStorage.getItem('userData') || '{}');
            const studentId = userData.sid || userData.studentId;
            if (!studentId) return;

            const progressMap = {};
            for (const course of courses) {
                try {
                    const progress = await apiGet(`/api/progress/${studentId}/${course}?type=course`);
                    if (progress) {
                        progressMap[course] = progress;
                    }
                } catch (error) {
                    // Course might not have progress yet
                }
            }
            setCourseProgress(progressMap);
        } catch (error) {
            console.error('Error loading course progress:', error);
        }
    };

    const handleOpenCourse = (course) => {
        // Load content for the course
        const contentData = getCourseContent(course);
        if (contentData) {
            setActiveCourse(course);
            setActiveTopics(contentData.topics);
            setCurrentTopicIndex(0);
            setViewMode('viewer');
            window.scrollTo(0, 0);
        } else {
            // Fallback for courses without content data
            alert("Interactive content coming soon for this module! Opening catalog...");
        }
    };

    const handleTopicChange = (index) => {
        setCurrentTopicIndex(index);
        window.scrollTo(0, 0);
    };

    const handleTakeTest = (course) => {
        setActiveCourse(course);
        setShowTestInterface(true);
    };

    // Helper to get external links
    const getExternalLinks = (courseName) => {
        const normalized = courseName.toLowerCase().replace(/[^a-z0-9]/g, '');
        
        // GeekForGeeks links
        const gfgLinks = {
            python: 'https://www.geeksforgeeks.org/python-programming-language/',
            java: 'https://www.geeksforgeeks.org/java/',
            javascript: 'https://www.geeksforgeeks.org/javascript/',
            htmlcss: 'https://www.geeksforgeeks.org/html-css/',
            react: 'https://www.geeksforgeeks.org/reactjs-tutorials/',
            nodejs: 'https://www.geeksforgeeks.org/nodejs/',
            mongodb: 'https://www.geeksforgeeks.org/mongodb-tutorial/',
            mysql: 'https://www.geeksforgeeks.org/mysql-tutorial/',
            django: 'https://www.geeksforgeeks.org/django-tutorial/',
            flask: 'https://www.geeksforgeeks.org/flask-tutorial/',
            angular: 'https://www.geeksforgeeks.org/angularjs/',
            vuejs: 'https://www.geeksforgeeks.org/vue-js/',
            expressjs: 'https://www.geeksforgeeks.org/express-js/',
            cpp: 'https://www.geeksforgeeks.org/c-plus-plus/',
            c: 'https://www.geeksforgeeks.org/c-programming-language/',
            go: 'https://www.geeksforgeeks.org/go-programming-language/',
            rust: 'https://www.geeksforgeeks.org/rust-programming-language/',
            php: 'https://www.geeksforgeeks.org/php/',
            machinelearning: 'https://www.geeksforgeeks.org/machine-learning/',
            datascience: 'https://www.geeksforgeeks.org/data-science-tutorial/',
            tensorflow: 'https://www.geeksforgeeks.org/tensorflow/',
            pytorch: 'https://www.geeksforgeeks.org/pytorch/',
            opencv: 'https://www.geeksforgeeks.org/opencv-python-tutorial/',
            cloudcomputing: 'https://www.geeksforgeeks.org/cloud-computing/',
            devops: 'https://www.geeksforgeeks.org/devops-tutorial/',
            docker: 'https://www.geeksforgeeks.org/docker-tutorial/',
            kubernetes: 'https://www.geeksforgeeks.org/kubernetes-tutorial/',
            cybersecurity: 'https://www.geeksforgeeks.org/cyber-security-tutorial/',
            sql: 'https://www.geeksforgeeks.org/sql-tutorial/',
            graphql: 'https://www.geeksforgeeks.org/graphql/',
            redis: 'https://www.geeksforgeeks.org/redis-tutorial/',
            postgresql: 'https://www.geeksforgeeks.org/postgresql-tutorial/',
            arduino: 'https://www.geeksforgeeks.org/arduino/',
            raspberrypi: 'https://www.geeksforgeeks.org/raspberry-pi-tutorial/',
            armprogramming: 'https://www.geeksforgeeks.org/arm-processor/',
            iotdevelopment: 'https://www.geeksforgeeks.org/internet-of-things-iot/',
            rtos: 'https://www.geeksforgeeks.org/real-time-operating-system-rtos/',
            fpga: 'https://www.geeksforgeeks.org/fpga/',
            autocad: 'https://www.geeksforgeeks.org/autocad/',
            solidworks: 'https://www.geeksforgeeks.org/solidworks/',
            catia: 'https://www.geeksforgeeks.org/catia/',
            fusion360: 'https://www.geeksforgeeks.org/fusion-360/',
            printing3d: 'https://www.geeksforgeeks.org/3d-printing/',
            cncmachining: 'https://www.geeksforgeeks.org/cnc-machining/',
            manufacturingadditive: 'https://www.geeksforgeeks.org/additive-manufacturing/',
            sixsigma: 'https://www.geeksforgeeks.org/six-sigma/',
            thermodynamics: 'https://www.geeksforgeeks.org/thermodynamics/',
            fluidmechanics: 'https://www.geeksforgeeks.org/fluid-mechanics/',
            strengthofmaterials: 'https://www.geeksforgeeks.org/strength-of-materials/',
            machinedesign: 'https://www.geeksforgeeks.org/machine-design/',
            robotics: 'https://www.geeksforgeeks.org/robotics/',
            mechatronics: 'https://www.geeksforgeeks.org/mechatronics/',
            ansys: 'https://www.geeksforgeeks.org/ansys/',
            cfd: 'https://www.geeksforgeeks.org/computational-fluid-dynamics/',
            automotiveengineering: 'https://www.geeksforgeeks.org/automotive-engineering/',
            autocadcivil3d: 'https://www.geeksforgeeks.org/autocad-civil-3d/',
            staadpro: 'https://www.geeksforgeeks.org/staad-pro/',
            etabs: 'https://www.geeksforgeeks.org/etabs/',
            revit: 'https://www.geeksforgeeks.org/revit/',
            primavera: 'https://www.geeksforgeeks.org/primavera/',
            rcclinedesign: 'https://www.geeksforgeeks.org/rcc-design/',
            steelstructures: 'https://www.geeksforgeeks.org/steel-structures/',
            concreteprestressed: 'https://www.geeksforgeeks.org/prestressed-concrete/',
            engineeringearthquake: 'https://www.geeksforgeeks.org/earthquake-engineering/',
            managementproject: 'https://www.geeksforgeeks.org/project-management/',
            estimationcost: 'https://www.geeksforgeeks.org/cost-estimation/',
            controlquality: 'https://www.geeksforgeeks.org/quality-control/',
            managementconstruction: 'https://www.geeksforgeeks.org/construction-management/',
            buildinggreen: 'https://www.geeksforgeeks.org/green-building/',
            bim: 'https://www.geeksforgeeks.org/building-information-modeling/',
            engineeringgeotechnical: 'https://www.geeksforgeeks.org/geotechnical-engineering/',
            engineeringtransportation: 'https://www.geeksforgeeks.org/transportation-engineering/',
            powersystems: 'https://www.geeksforgeeks.org/power-systems/',
            machineselectrical: 'https://www.geeksforgeeks.org/electrical-machines/',
            controlsystems: 'https://www.geeksforgeeks.org/control-systems/',
            powerselectronics: 'https://www.geeksforgeeks.org/power-electronics/',
            energysolar: 'https://www.geeksforgeeks.org/solar-energy/',
            energywind: 'https://www.geeksforgeeks.org/wind-energy/',
            gridsmart: 'https://www.geeksforgeeks.org/smart-grid/',
            storagesenergy: 'https://www.geeksforgeeks.org/energy-storage/',
            automationindustrial: 'https://www.geeksforgeeks.org/industrial-automation/',
            plcprogramming: 'https://www.geeksforgeeks.org/plc-programming/',
            scadaindustrial: 'https://www.geeksforgeeks.org/scada/',
            iotiindustrial: 'https://www.geeksforgeeks.org/industrial-iot/',
            drivesmotor: 'https://www.geeksforgeeks.org/motor-drives/',
            vehicleelectric: 'https://www.geeksforgeeks.org/electric-vehicles/',
            engineeringhighvoltage: 'https://www.geeksforgeeks.org/high-voltage-engineering/',
            qualitypower: 'https://www.geeksforgeeks.org/power-quality/',
            simulinkmatlab: 'https://www.geeksforgeeks.org/matlab/',
            analogelectronics: 'https://www.geeksforgeeks.org/analog-electronics/',
            digitalelectronics: 'https://www.geeksforgeeks.org/digital-electronics/',
            microprocessors: 'https://www.geeksforgeeks.org/microprocessors/',
            microcontrollers: 'https://www.geeksforgeeks.org/microcontrollers/',
            vlsidesign: 'https://www.geeksforgeeks.org/vlsi-design/',
            processingdigital: 'https://www.geeksforgeeks.org/digital-signal-processing/',
            communicationwireless: 'https://www.geeksforgeeks.org/wireless-communication/',
            designantenna: 'https://www.geeksforgeeks.org/antenna-design/',
            communicationoptical: 'https://www.geeksforgeeks.org/optical-communication/',
            technology5g: 'https://www.geeksforgeeks.org/5g-technology/',
            designpcb: 'https://www.geeksforgeeks.org/pcb-design/',
            engineeringrf: 'https://www.geeksforgeeks.org/rf-engineering/',
            communicationsatellite: 'https://www.geeksforgeeks.org/satellite-communication/',
            computervision: 'https://www.geeksforgeeks.org/computer-vision/',
            learningreinforcement: 'https://www.geeksforgeeks.org/reinforcement-learning/',
            aigenerative: 'https://www.geeksforgeeks.org/generative-ai/',
            processingnaturallanguage: 'https://www.geeksforgeeks.org/natural-language-processing/',
            julia: 'https://www.geeksforgeeks.org/julia-programming-language/',
            r: 'https://www.geeksforgeeks.org/r-programming-language/',
            visualizationdata: 'https://www.geeksforgeeks.org/data-visualization/',
            bigdata: 'https://www.geeksforgeeks.org/big-data/',
            pandas: 'https://www.geeksforgeeks.org/pandas-tutorial/',
            numpy: 'https://www.geeksforgeeks.org/numpy-tutorial/',
            matplotlib: 'https://www.geeksforgeeks.org/matplotlib-tutorial/',
            scikitlearn: 'https://www.geeksforgeeks.org/scikit-learn/',
            keras: 'https://www.geeksforgeeks.org/keras/',
            deeplearning: 'https://www.geeksforgeeks.org/deep-learning-tutorial/',
            learningneural: 'https://www.geeksforgeeks.org/neural-networks/',
            wordpres: 'https://www.geeksforgeeks.org/wordpress/',
            apisrest: 'https://www.geeksforgeeks.org/rest-api/',
            linux: 'https://www.geeksforgeeks.org/linux-tutorial/',
            exceladvanced: 'https://www.geeksforgeeks.org/excel/',
            analysisdata: 'https://www.geeksforgeeks.org/data-analysis/',
            communication: 'https://www.geeksforgeeks.org/communication-skills/',
            presentation: 'https://www.geeksforgeeks.org/presentation-skills/',
            managementproject: 'https://www.geeksforgeeks.org/project-management/',
            leadership: 'https://www.geeksforgeeks.org/leadership/',
        };

        // W3Schools links
        const w3Links = {
            python: 'https://www.w3schools.com/python/',
            java: 'https://www.w3schools.com/java/',
            javascript: 'https://www.w3schools.com/js/',
            htmlcss: 'https://www.w3schools.com/html/',
            react: 'https://www.w3schools.com/react/',
            nodejs: 'https://www.w3schools.com/nodejs/',
            sql: 'https://www.w3schools.com/sql/',
            php: 'https://www.w3schools.com/php/',
            cpp: 'https://www.w3schools.com/cpp/',
            c: 'https://www.w3schools.com/c/',
            go: 'https://www.w3schools.com/go/',
            rust: 'https://www.w3schools.com/rust/',
            bootstrap: 'https://www.w3schools.com/bootstrap/',
            jquery: 'https://www.w3schools.com/jquery/',
            xml: 'https://www.w3schools.com/xml/',
            json: 'https://www.w3schools.com/js/js_json_intro.asp',
            ajax: 'https://www.w3schools.com/js/js_ajax_intro.asp',
            typescript: 'https://www.w3schools.com/typescript/',
            sass: 'https://www.w3schools.com/sass/',
            vue: 'https://www.w3schools.com/vue/',
            angular: 'https://www.w3schools.com/angular/',
            git: 'https://www.w3schools.com/git/',
            mongodb: 'https://www.w3schools.com/mongodb/',
            mysql: 'https://www.w3schools.com/mysql/',
            postgresql: 'https://www.w3schools.com/postgresql/',
            redis: 'https://www.w3schools.com/redis/',
            excel: 'https://www.w3schools.com/excel/',
            access: 'https://www.w3schools.com/msaccess/',
            powershell: 'https://www.w3schools.com/powershell/',
            bash: 'https://www.w3schools.com/bash/',
            kotlin: 'https://www.w3schools.com/kotlin/',
            swift: 'https://www.w3schools.com/swift/',
            r: 'https://www.w3schools.com/r/',
            kotlin: 'https://www.w3schools.com/kotlin/',
            matlab: 'https://www.w3schools.com/matlab/',
            statistics: 'https://www.w3schools.com/statistics/',
            datascience: 'https://www.w3schools.com/datascience/',
            machinelearning: 'https://www.w3schools.com/ai/',
            cybersecurity: 'https://www.w3schools.com/cybersecurity/',
            colors: 'https://www.w3schools.com/colors/',
            icons: 'https://www.w3schools.com/icons/',
            graphics: 'https://www.w3schools.com/graphics/',
            canvas: 'https://www.w3schools.com/graphics/canvas_intro.asp',
            svg: 'https://www.w3schools.com/graphics/svg_intro.asp',
            charsets: 'https://www.w3schools.com/charsets/',
            howto: 'https://www.w3schools.com/howto/',
        };

        const gfgKey = Object.keys(gfgLinks).find(key => normalized.includes(key)) || 'python';
        const w3Key = Object.keys(w3Links).find(key => normalized.includes(key)) || 'python';

        return {
            gfg: gfgLinks[gfgKey] || 'https://www.geeksforgeeks.org/',
            w3schools: w3Links[w3Key] || 'https://www.w3schools.com/'
        };
    };

    const getSubjectColor = (name) => {
        const n = name.toLowerCase();
        if (n.includes('react')) return 'linear-gradient(135deg, #61dafb 0%, #21a3c4 100%)';
        if (n.includes('angular')) return 'linear-gradient(135deg, #dd0031 0%, #c3002f 100%)';
        if (n.includes('vue')) return 'linear-gradient(135deg, #4fc08d 0%, #2c5f47 100%)';
        if (n.includes('python') || n.includes('django')) return 'linear-gradient(135deg, #3776ab 0%, #ffd43b 100%)';
        if (n.includes('java')) return 'linear-gradient(135deg, #ed8b00 0%, #f8981d 100%)';
        if (n.includes('javascript') || n.includes('js')) return 'linear-gradient(135deg, #f7df1e 0%, #f39c12 100%)';
        if (n.includes('html') || n.includes('css')) return 'linear-gradient(135deg, #e34f26 0%, #1572b6 100%)';
        if (n.includes('node')) return 'linear-gradient(135deg, #339933 0%, #68a063 100%)';
        if (n.includes('mongodb')) return 'linear-gradient(135deg, #47a248 0%, #2e7030 100%)';
        if (n.includes('sql') || n.includes('database')) return 'linear-gradient(135deg, #336791 0%, #1e4a6b 100%)';
        if (n.includes('machine learning') || n.includes('ml')) return 'linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)';
        if (n.includes('data science')) return 'linear-gradient(135deg, #8e44ad 0%, #6c3483 100%)';
        if (n.includes('cloud')) return 'linear-gradient(135deg, #3498db 0%, #2980b9 100%)';
        if (n.includes('devops')) return 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)';
        if (n.includes('docker')) return 'linear-gradient(135deg, #2496ed 0%, #1e7fc7 100%)';
        if (n.includes('kubernetes')) return 'linear-gradient(135deg, #326ce5 0%, #2a5cc1 100%)';
        if (n.includes('cyber security')) return 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)';
        return 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)';
    };

    // Helper to get Icon (Same as before)
    const getSubjectIcon = (name) => {
        const n = name.toLowerCase();
        if (n.includes('java') && !n.includes('script')) return <FaJava />;
        if (n.includes('python')) return <FaPython />;
        if (n.includes('react')) return <FaReact />;
        if (n.includes('node')) return <FaNodeJs />;
        if (n.includes('html')) return <FaHtml5 />;
        if (n.includes('css')) return <FaCss3 />;
        if (n.includes('javascript') || n.includes('js')) return <FaJs />;
        if (n.includes('mongo')) return <SiMongodb />;
        if (n.includes('php')) return <FaPhp />;
        if (n.includes('angular')) return <FaAngular />;
        if (n.includes('c++')) return <SiCplusplus />;
        if (n === 'c') return <FaCode />;
        if (n.includes('django')) return <SiDjango />;
        if (n.includes('flask')) return <SiFlask />;
        if (n.includes('sql') || n.includes('database')) return <FaDatabase />;
        if (n.includes('machine learning') || n.includes('ml')) return <FaRobot />;
        if (n.includes('data science')) return <FaChartLine />;
        if (n.includes('cloud')) return <FaCloud />;
        if (n.includes('devops')) return <FaCogs />;
        if (n.includes('docker')) return <FaCubes />;
        if (n.includes('kubernetes')) return <FaNetworkWired />;
        if (n.includes('cyber security')) return <FaShieldAlt />;
        return <FaLaptopCode />;
    };

    // --- RENDERERS ---

    const renderCatalog = () => (
        <main className="main-content">
            {Object.entries(categories).map(([categoryName, courses]) => (
                courses.length > 0 && (
                    <div key={categoryName} className="section-container animate-fade-up">
                        <h2 className="section-title">{categoryName}</h2>
                        <div className="card-grid">
                            {courses.map(item => {
                                const progress = progressData[item] || 0;
                                const courseProg = courseProgress[item];
                                const avgScore = courseProg?.averageScore || 0;
                                return (
                                    <div key={item} className="topic-card glass-card">
                                        <div className="topic-header" style={{ background: getSubjectColor(item) }}>
                                            <div className="header-icon-large">
                                                {getSubjectIcon(item)}
                                            </div>
                                            <h3>{item}</h3>
                                            <div className="progress-badge">
                                                {courseProg ? `${avgScore.toFixed(0)}% Score` : `${progress}% Mastered`}
                                            </div>
                                        </div>

                                        <div className="topic-body">
                                            <div className="progress-container">
                                                <div className="progress-bar" style={{ width: `${courseProg ? avgScore : progress}%`, background: getSubjectColor(item) }}></div>
                                            </div>
                                            <div className="resource-stats">
                                                {courseProg ? (
                                                    <><span><FaChartLine style={{ marginRight: 6 }} />Score: {avgScore.toFixed(0)}%</span><span>Level: {courseProg.currentLevel || 'Easy'}</span></>
                                                ) : (
                                                    <><span><FaCheckCircle style={{ marginRight: 6 }} />Beginner Friendly</span><span>⭐ 4.8</span></>
                                                )}
                                            </div>
                                        </div>

                                        <div className="topic-actions">
                                            <div className="action-buttons-row">
                                                <button onClick={() => handleOpenCourse(item)} className="action-btn notes">
                                                    <FaBook className="icon" /> Tutorials
                                                </button>
                                                <button onClick={() => handleTakeTest(item)} className="action-btn test">
                                                    <FaUserTie className="icon" /> Take Test
                                                </button>
                                            </div>
                                            <div className="external-links">
                                                <a href={getExternalLinks(item).gfg} target="_blank" rel="noopener noreferrer" className="external-link gfg">
                                                    <span>GFG</span>
                                                </a>
                                                <a href={getExternalLinks(item).w3schools} target="_blank" rel="noopener noreferrer" className="external-link w3">
                                                    <span>W3</span>
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )
            ))}
        </main>
    );

    const renderViewer = () => {
        const currentTopic = activeTopics[currentTopicIndex];
        return (
            <div className="viewer-container">
                <div className="viewer-sidebar">
                    <div className="sidebar-header">
                        <button className="back-link" onClick={() => setViewMode('catalog')}>
                            <FaArrowLeft /> Courses
                        </button>
                        <h3>{activeCourse} Tutorial</h3>
                    </div>
                    <ul className="topic-list">
                        {activeTopics.map((topic, idx) => (
                            <li
                                key={topic.id}
                                className={`topic-item ${idx === currentTopicIndex ? 'active' : ''}`}
                                onClick={() => handleTopicChange(idx)}
                            >
                                {topic.title}
                            </li>
                        ))}
                        <li className="topic-item test-item" onClick={() => setShowTestInterface(true)}>
                            <FaUserTie /> Take Certification Test
                        </li>
                    </ul>
                </div>

                <div className="viewer-content">
                    <div className="content-header">
                        <h1>{currentTopic.title}</h1>
                        <div className="nav-buttons">
                            <button
                                disabled={currentTopicIndex === 0}
                                onClick={() => handleTopicChange(currentTopicIndex - 1)}
                                className="nav-btn prev"
                            >
                                <FaChevronLeft /> Previous
                            </button>
                            <button
                                disabled={currentTopicIndex === activeTopics.length - 1}
                                onClick={() => handleTopicChange(currentTopicIndex + 1)}
                                className="nav-btn next"
                            >
                                Next <FaChevronRight />
                            </button>
                        </div>
                    </div>

                    <div className="content-body animate-fade-in" dangerouslySetInnerHTML={{ __html: currentTopic.content }} />

                    {/* External Resources */}
                    <div className="external-resources-section">
                        <h3>External Resources</h3>
                        <div className="external-links-viewer">
                            <a href={getExternalLinks(activeCourse).gfg} target="_blank" rel="noopener noreferrer" className="external-link-viewer gfg">
                                <span>📚 GeekForGeeks Tutorial</span>
                            </a>
                            <a href={getExternalLinks(activeCourse).w3schools} target="_blank" rel="noopener noreferrer" className="external-link-viewer w3">
                                <span>🌐 W3Schools Tutorial</span>
                            </a>
                        </div>
                    </div>

                    {currentTopic.code && (
                        <div className="code-block-container">
                            <div className="code-header">Example</div>
                            <pre className="code-block">
                                <code>{currentTopic.code}</code>
                            </pre>
                            <button className="try-it-btn">Try it Yourself <FaPlay size={10} /></button>
                        </div>
                    )}

                    <div className="content-footer">
                        <button
                            disabled={currentTopicIndex === activeTopics.length - 1}
                            onClick={() => handleTopicChange(currentTopicIndex + 1)}
                            className="primary-next-btn"
                        >
                            Next Step &gt;
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="advanced-learning-container center-content" style={{ padding: isDashboard ? '2rem 0' : '2rem 5%' }}>
                <div className="loader"></div>
                <p>Loading your learning path...</p>
            </div>
        );
    }

    return (
        <div className={`advanced-learning-container ${viewMode === 'viewer' ? 'viewer-mode' : ''}`} style={{ padding: viewMode === 'viewer' ? '0' : (isDashboard ? '0' : '2rem 5%'), background: isDashboard ? 'transparent' : '' }}>
            {/* Header Section (Only in Catalog) */}
            {!isDashboard && viewMode === 'catalog' && (
                <header className="page-header glass-header">
                    <Button variant="link" className="back-button" onClick={() => navigate('/dashboard')}>
                        <FaArrowLeft className="me-2" /> Back
                    </Button>
                    <div className="header-content">
                        <h1>{branchTitle} Hub</h1>
                        <p className="subtitle">Master industry-standard skills with our curated, interactive tutorials.</p>
                    </div>
                </header>
            )}

            {viewMode === 'catalog' ? renderCatalog() : renderViewer()}

            {/* Test Interface Modal */}
            {showTestInterface && activeCourse && (() => {
                const userData = JSON.parse(localStorage.getItem('userData') || '{}');
                const studentId = userData.sid || userData.studentId;
                return studentId ? (
                    <div className="test-modal-overlay">
                        <div className="test-modal-content" onClick={(e) => e.stopPropagation()}>
                            <TestInterface
                                studentId={studentId}
                                subject={null}
                                course={activeCourse}
                                onClose={() => setShowTestInterface(false)}
                                onComplete={(result) => {
                                    loadCourseProgress([activeCourse]);
                                    // Maybe auto-advance if passed?
                                }}
                            />
                        </div>
                    </div>
                ) : null;
            })()}


        </div>
    );
};

export default AdvancedLearning;
