import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from 'react-bootstrap';
import {
    FaArrowLeft, FaBook, FaVideo, FaUserTie,
    FaJava, FaPython, FaReact, FaNodeJs, FaHtml5, FaCss3, FaJs, FaDatabase, FaCode, FaAngular, FaPhp, FaLaptopCode
} from 'react-icons/fa';
import { SiDjango, SiFlask, SiMongodb, SiCplusplus } from 'react-icons/si';
import { apiGet } from '../../utils/apiClient';
import './AdvancedLearning.css';

const AdvancedLearning = () => {
    const navigate = useNavigate();
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(true);

    // Initial Progress State (Mock Data for "New Feature")
    const [progressData, setProgressData] = useState({});

    useEffect(() => {
        const fetchSubjects = async () => {
            try {
                const materials = await apiGet('/api/materials');

                // Comprehensive list of advanced learning topics
                const advancedTopics = [
                    "Python", "Java", "C", "C++",
                    "JavaScript", "HTML/CSS", "Node.js",
                    "React", "Angular", "Vue.js",
                    "Django", "Flask", "Express.js",
                    "MongoDB", "MySQL", "PostgreSQL",
                    "PHP", "Ruby", "Go",
                    "Machine Learning", "Data Science",
                    "Artificial Intelligence", "Cyber Security",
                    "Cloud Computing", "DevOps", "Docker", "Kubernetes"
                ];

                // Get unique subjects from materials
                const materialSubjects = [...new Set(materials.map(m => m.subject))];

                // Combine material subjects with advanced topics, remove duplicates
                const allSubjects = [...new Set([...advancedTopics, ...materialSubjects])];

                // Filter to keep only programming/tech subjects (exclude academic subjects)
                const academicSubjects = [
                    'Basic Electrical Engineering', 'Engineering Mathematics',
                    'Engineering Chemistry', 'Engineering Physics',
                    'Digital Logic Design', 'Computer Organization & Architecture',
                    'Operating Systems', 'Database Management Systems',
                    'Computer Networks', 'Software Engineering'
                ];

                const finalSubjects = allSubjects.filter(subject =>
                    !academicSubjects.some(academic => subject.includes(academic))
                ).sort();

                setSubjects(finalSubjects.length > 0 ? finalSubjects : advancedTopics);

                // Generate random progress for demo
                const prog = {};
                (finalSubjects.length > 0 ? finalSubjects : advancedTopics).forEach(s => {
                    prog[s] = Math.floor(Math.random() * 40); // 0-40% started
                });
                setProgressData(prog);

            } catch (error) {
                console.error('Failed to fetch subjects:', error);
                // Comprehensive fallback list
                const fallback = [
                    "Python", "Java", "C", "C++",
                    "JavaScript", "HTML/CSS", "Node.js",
                    "React", "Angular", "Vue.js",
                    "Django", "Flask", "Express.js",
                    "MongoDB", "MySQL", "PHP",
                    "Machine Learning", "Data Science",
                    "Artificial Intelligence", "Cloud Computing", "DevOps"
                ];
                setSubjects(fallback);

                const prog = {};
                fallback.forEach(s => prog[s] = Math.floor(Math.random() * 30));
                setProgressData(prog);
            } finally {
                setLoading(false);
            }
        };

        fetchSubjects();
    }, []);

    const handleNavigate = (course, type) => {
        navigate(`/advanced-materials/${encodeURIComponent(course)}/${type}`);
    };

    // Helper to get Icon
    const getSubjectIcon = (name) => {
        const n = name.toLowerCase();
        if (n.includes('java') && !n.includes('script')) return <FaJava />;
        if (n.includes('python')) return <FaPython />;
        if (n.includes('react')) return <FaReact />;
        if (n.includes('node')) return <FaNodeJs />;
        if (n.includes('html')) return <FaHtml5 />;
        if (n.includes('css')) return <FaCss3 />;
        if (n.includes('javascript') || n.includes('js')) return <FaJs />;
        if (n.includes('mongo')) return <SiMongodb />; // Using Si icon or Fa if imported
        if (n.includes('php')) return <FaPhp />;
        if (n.includes('angular')) return <FaAngular />;
        if (n.includes('c++')) return <SiCplusplus />; // Using Si icon
        if (n === 'c') return <FaCode />;
        if (n.includes('django')) return <SiDjango />;
        if (n.includes('flask')) return <SiFlask />;
        if (n.includes('sql') || n.includes('data')) return <FaDatabase />;
        return <FaLaptopCode />;
    };

    // Helper to get Color
    const getSubjectColor = (name) => {
        const n = name.toLowerCase();
        if (n.includes('react')) return 'linear-gradient(135deg, #00c6ff 0%, #0072ff 100%)';
        if (n.includes('angular')) return 'linear-gradient(135deg, #e52d27 0%, #b31217 100%)';
        if (n.includes('vue')) return 'linear-gradient(135deg, #42b883 0%, #35495e 100%)';
        if (n.includes('python') || n.includes('django')) return 'linear-gradient(135deg, #f2994a 0%, #f2c94c 100%)';
        if (n.includes('java')) return 'linear-gradient(135deg, #e55d87 0%, #5fc3e4 100%)';
        if (n.includes('js') || n.includes('node')) return 'linear-gradient(135deg, #f09819 0%, #edde5d 100%)';
        return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    };

    const renderSection = (title, items) => (
        <div className="section-container animate-fade-up">
            <h2 className="section-title">{title}</h2>
            <div className="card-grid">
                {items.map(item => {
                    const progress = progressData[item] || 0;
                    return (
                        <div key={item} className="topic-card glass-card">
                            <div className="topic-header" style={{ background: getSubjectColor(item) }}>
                                <div className="header-icon-large">
                                    {getSubjectIcon(item)}
                                </div>
                                <h3>{item}</h3>
                                <div className="progress-badge">
                                    {progress}% Mastered
                                </div>
                            </div>

                            <div className="topic-body">
                                <div className="progress-container">
                                    <div className="progress-bar" style={{ width: `${progress}%`, background: getSubjectColor(item) }}></div>
                                </div>
                                <div className="resource-stats">
                                    <span>Top Rated Course</span>
                                    <span>⭐ 4.8</span>
                                </div>
                            </div>

                            <div className="topic-actions">
                                <button
                                    onClick={() => handleNavigate(item, 'notes')}
                                    className="action-btn notes"
                                >
                                    <FaBook className="icon" /> Notes
                                </button>
                                <button
                                    onClick={() => handleNavigate(item, 'videos')}
                                    className="action-btn videos"
                                >
                                    <FaVideo className="icon" /> Videos
                                </button>
                                <button
                                    onClick={() => handleNavigate(item, 'interview')}
                                    className="action-btn interview"
                                >
                                    <FaUserTie className="icon" /> Q&A
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );

    if (loading) {
        return (
            <div className="advanced-learning-container center-content">
                <div className="loader"></div>
                <p>Loading your learning path...</p>
            </div>
        );
    }

    // Group subjects into categories
    const programmingLanguages = subjects.filter(s =>
        ['C', 'C++', 'Java', 'Python', 'JavaScript', 'PHP', 'Ruby', 'Go'].includes(s)
    );

    const webTechnologies = subjects.filter(s =>
        ['HTML/CSS', 'React', 'Angular', 'Vue.js', 'Node.js', 'Express.js', 'Django', 'Flask'].includes(s)
    );

    const databases = subjects.filter(s =>
        ['MongoDB', 'MySQL', 'PostgreSQL', 'SQL'].includes(s)
    );

    const advancedTopics = subjects.filter(s =>
        !programmingLanguages.includes(s) &&
        !webTechnologies.includes(s) &&
        !databases.includes(s)
    );

    return (
        <div className="advanced-learning-container">
            {/* Header Section */}
            <header className="page-header glass-header">
                <Button
                    variant="link"
                    className="back-button"
                    onClick={() => navigate('/dashboard')}
                >
                    <FaArrowLeft className="me-2" /> Back
                </Button>
                <div className="header-content">
                    <h1>Advanced Learning Hub</h1>
                    <p className="subtitle">
                        Master industry-standard skills with our curated, premium course materials.
                    </p>
                </div>
            </header>

            <main className="main-content">
                {programmingLanguages.length > 0 && renderSection("Programming Languages", programmingLanguages)}
                {webTechnologies.length > 0 && renderSection("Web Development & Frameworks", webTechnologies)}
                {databases.length > 0 && renderSection("Databases & Backend", databases)}
                {advancedTopics.length > 0 && renderSection("Advanced Topics", advancedTopics)}

                {subjects.length === 0 && !loading && (
                    <div className="empty-state glass-card">
                        <h3>Coming Soon</h3>
                        <p>We are curating high-quality content for you.</p>
                    </div>
                )}
            </main>

            <style jsx>{`
                .advanced-learning-container {
                    min-height: 100vh;
                    background: #f0f4f8; /* Soft blue-grey background */
                    background-image: radial-gradient(#e2e8f0 1px, transparent 1px);
                    background-size: 20px 20px;
                    padding: 2rem 5%;
                    font-family: 'Inter', sans-serif;
                }
                
                .center-content {
                    display: flex; 
                    flex-direction: column;
                    justify-content: center; 
                    align-items: center; 
                    min-height: 100vh;
                }

                .glass-header {
                    background: rgba(255, 255, 255, 0.7);
                    backdrop-filter: blur(10px);
                    border-radius: 16px;
                    padding: 2rem;
                    margin-bottom: 3rem;
                    border: 1px solid rgba(255, 255, 255, 0.5);
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
                    position: relative;
                }

                .back-button {
                    position: absolute;
                    left: 20px;
                    top: 20px;
                    color: #64748b;
                    font-weight: 600;
                    text-decoration: none;
                }

                .header-content h1 {
                    font-size: 2.5rem;
                    font-weight: 800;
                    background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    margin-bottom: 0.5rem;
                }

                .subtitle {
                    color: #64748b;
                    font-size: 1.1rem;
                }

                .section-title {
                    font-size: 1.5rem;
                    color: #1e293b;
                    margin-bottom: 1.5rem;
                    font-weight: 700;
                    display: flex;
                    align-items: center;
                }
                .section-title:before {
                    content: '';
                    display: block;
                    width: 6px;
                    height: 24px;
                    background: #3b82f6;
                    border-radius: 4px;
                    margin-right: 12px;
                }

                .card-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
                    gap: 2rem;
                    margin-bottom: 4rem;
                }

                .glass-card {
                    background: rgba(255, 255, 255, 0.9);
                    border-radius: 16px;
                    border: 1px solid rgba(255, 255, 255, 0.5);
                    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
                    transition: all 0.3s ease;
                    overflow: hidden;
                    display: flex;
                    flex-direction: column;
                }

                .glass-card:hover {
                    transform: translateY(-8px);
                    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
                }

                .topic-header {
                    padding: 1.5rem;
                    color: white;
                    position: relative;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    height: 140px;
                }

                .header-icon-large {
                    font-size: 3rem;
                    margin-bottom: 0.5rem;
                    filter: drop-shadow(0 4px 6px rgba(0,0,0,0.2));
                }

                .progress-badge {
                    position: absolute;
                    top: 10px;
                    right: 10px;
                    background: rgba(0,0,0,0.2);
                    padding: 4px 8px;
                    border-radius: 20px;
                    font-size: 0.7rem;
                    font-weight: 600;
                    backdrop-filter: blur(4px);
                }

                .topic-body {
                    padding: 1.5rem 1.5rem 0.5rem;
                }

                .progress-container {
                    width: 100%;
                    height: 6px;
                    background: #e2e8f0;
                    border-radius: 10px;
                    overflow: hidden;
                    margin-bottom: 0.5rem;
                }
                
                .resource-stats {
                    display: flex;
                    justify-content: space-between;
                    font-size: 0.8rem;
                    color: #94a3b8;
                    margin-bottom: 1rem;
                }

                .topic-actions {
                    padding: 1rem 1.5rem 1.5rem;
                    display: grid;
                    grid-template-columns: 1fr 1fr 1fr;
                    gap: 0.5rem;
                }

                .action-btn {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 0.6rem;
                    border: 1px solid #e2e8f0;
                    background: white;
                    border-radius: 10px;
                    font-size: 0.8rem;
                    color: #475569;
                    cursor: pointer;
                    transition: all 0.2s;
                    gap: 5px;
                }

                .action-btn .icon {
                    font-size: 1.1rem;
                }

                .action-btn:hover {
                    background: #f8fafc;
                    border-color: #cbd5e1;
                    color: #3b82f6;
                }

                .action-btn.notes:hover { color: #2563eb; background: #eff6ff; border-color: #bfdbfe; }
                .action-btn.videos:hover { color: #16a34a; background: #f0fdf4; border-color: #bbf7d0; }
                .action-btn.interview:hover { color: #d97706; background: #fffbeb; border-color: #fde68a; }

                .loader {
                    width: 48px;
                    height: 48px;
                    border: 5px solid #FFF;
                    border-bottom-color: #3b82f6;
                    border-radius: 50%;
                    display: inline-block;
                    box-sizing: border-box;
                    animation: rotation 1s linear infinite;
                }

                @keyframes rotation {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }

                @keyframes fadeUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                .animate-fade-up {
                    animation: fadeUp 0.5s ease forwards;
                }
            `}</style>
        </div>
    );
};

export default AdvancedLearning;
