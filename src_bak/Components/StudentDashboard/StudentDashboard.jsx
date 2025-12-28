import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiGet } from '../../utils/apiClient';
import { FaSignOutAlt, FaDownload, FaCog, FaUserEdit, FaClipboardList, FaEnvelope, FaTrash, FaRobot, FaBookOpen, FaRocket, FaUserTie } from 'react-icons/fa';
import PasswordSettings from '../Settings/PasswordSettings';

import VuAiAgent from '../VuAiAgent/VuAiAgent';
import './StudentDashboard.css';


// Minimal fallback when no studentData is provided
const FALLBACK = {
    studentName: 'John Doe',
    sid: 'student001',
    branch: 'CSE',
    year: 1,
    section: 'A',
    role: 'student',
    email: 'john.doe@example.edu'
};

const SUBJECT_ALIASES = {
    'cn': ['computer networks', 'computer network'],
    'os': ['operating systems', 'operating system'],
    'dbms': ['database management systems', 'database management system'],
    'daa': ['design and analysis of algorithms', 'design & analysis of algorithms'],
    'dld': ['digital logic design'],
    'coa': ['computer organization and architecture', 'computer organization & architecture'],
    'wt': ['web technologies', 'web technology'],
    'cd': ['compiler design'],
    'ai': ['artificial intelligence'],
    'ml': ['machine learning'],
    'ds': ['data structures'],
    'se': ['software engineering'],
    'toc': ['theory of computation'],
    'cc': ['cloud computing']
};

export default function StudentDashboard({ studentData = FALLBACK, onLogout }) {
    const navigate = useNavigate();
    const data = { ...FALLBACK, ...studentData };
    const branch = String(data.branch || 'CSE').toUpperCase();


    // UI state
    const [view, setView] = useState('overview'); // overview | semester | advanced | subject | settings
    // Lock selected year to the student's registered year. Do not allow switching across years from dashboard.
    const [selectedYear] = useState(Number(data.year) || 1);
    const [serverMaterials, setServerMaterials] = useState([]);

    const [userData, setUserData] = useState(data);
    const [messages, setMessages] = useState([]);
    const [tasks, setTasks] = useState([]); // Shared Tasks
    const [showMsgModal, setShowMsgModal] = useState(false);
    const [showTaskModal, setShowTaskModal] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [showAbout, setShowAbout] = useState(false);
    const [showProfilePhotoModal, setShowProfilePhotoModal] = useState(false);
    const [extraCourses, setExtraCourses] = useState([]);

    // Fetch dynamic courses and materials from backend (with Auto-Refresh/Polling)
    useEffect(() => {
        let mounted = true;

        const fetchData = async () => {
            try {
                // Fetch Courses
                const courseData = await apiGet('/api/courses');
                if (mounted && Array.isArray(courseData)) {
                    setExtraCourses(prev => JSON.stringify(prev) !== JSON.stringify(courseData) ? courseData : prev);
                }

                // Fetch Materials
                const materialsData = await apiGet('/api/materials');
                if (mounted && Array.isArray(materialsData)) {
                    setServerMaterials(prev => JSON.stringify(prev) !== JSON.stringify(materialsData) ? materialsData : prev);
                }

                // Fetch Tasks
                const tasksData = await apiGet(`/api/todos?role=student`);
                if (mounted && Array.isArray(tasksData)) {
                    setTasks(prev => JSON.stringify(prev) !== JSON.stringify(tasksData) ? tasksData : prev);
                }
            } catch (e) {
                console.error("Failed to fetch data", e);
            }
        };

        fetchData(); // Initial load
        const interval = setInterval(fetchData, 15000); // 15s polling

        return () => {
            mounted = false;
            clearInterval(interval);
        };
    }, []);


    // Helper to generate default modules for dynamic courses
    const generateDefaultModules = (subjectId) => {
        return [1, 2, 3, 4, 5].map(m => ({
            id: `${subjectId}-m${m}`,
            name: `Module ${m}`,
            units: [1, 2].map(u => ({
                id: `${subjectId}-m${m}-u${u}`,
                name: `Unit ${u}`,
                topics: [{
                    id: `${subjectId}-m${m}-u${u}-t1`,
                    name: 'General Topics',
                    resources: {}
                }]
            }))
        }));
    };



    const yearData = useMemo(() => {
        // 1. Start with Empty Structure (No Static Data)
        const baseData = { semesters: [] };

        // 2. Clone to avoid mutating (trivial here but keeps structure)
        const semesters = baseData.semesters.map(s => ({ ...s }));

        // 3. Inject Dynamic Materials into the Hierarchy
        // This ensures new Modules/Units created by Admin uploads appear in navigation
        serverMaterials.forEach(m => {
            // Filter by Year (if specific) - Loose match
            if (m.year && String(m.year) !== 'All' && String(m.year) !== String(selectedYear)) return;

            // Find Semester? Admin uploads often don't have semester, only Subject.
            // We search ALL subjects in current year view.
            semesters.forEach(sem => {
                // Improved Matching Logic:
                // 1. Exact Name/Id/Code match
                // 2. Case-insensitive Name/Code match
                // 3. Partial Included match (e.g. 'Math' matches 'Engineering Mathematics') - ONLY if Year matches (which is already filtered above)
                const subject = sem.subjects.find(s => {
                    const uplSub = (m.subject || '').toLowerCase().trim();
                    const sName = (s.name || '').toLowerCase();
                    const sCode = (s.code || '').toLowerCase();
                    const sId = (s.id || '').toLowerCase();

                    // Check strict/partial matches
                    if (sName === uplSub || sCode === uplSub || sId === uplSub ||
                        sName.includes(uplSub) || uplSub.includes(sName)) return true;

                    // Check Aliases
                    // 1. If upload is 'cn', does sName match 'computer networks'?
                    if (SUBJECT_ALIASES[uplSub]) {
                        if (SUBJECT_ALIASES[uplSub].some(alias => sName.includes(alias))) return true;
                    }
                    // 2. If subject id is 'cn', does upload match 'computer networks'?
                    // Extract ID base if needed, but usually 'id' is simple like 'cn' or 'dld'
                    if (SUBJECT_ALIASES[sId]) {
                        if (SUBJECT_ALIASES[sId].some(alias => uplSub.includes(alias))) return true;
                    }

                    // Special manual overrides if map fails
                    if ((uplSub === 'c' && sName.includes('programming')) ||
                        (uplSub === 'java' && sName.includes('java'))) return true;

                    return false;
                });

                if (subject) {
                    // 3a. Ensure Module Exists
                    // Admin format: "1" or "Module 1"
                    const modName = String(m.module || 'General'); // "1"
                    let module = subject.modules.find(mod =>
                        mod.name === modName ||
                        mod.name === `Module ${modName}` ||
                        (mod.id && mod.id.endsWith(`-m${modName}`))
                    );

                    if (!module) {
                        module = {
                            id: `${subject.id}-m${modName.replace(/\s+/g, '')}`,
                            name: modName.startsWith('Module') ? modName : `Module ${modName}`,
                            units: []
                        };
                        subject.modules.push(module);
                        // Sort modules logic could go here, but append is fine for new ones
                    }

                    // 3b. Ensure Unit Exists
                    const unitName = String(m.unit || 'General');
                    let unit = module.units.find(u =>
                        u.name === unitName ||
                        u.name === `Unit ${unitName}` ||
                        (u.id && u.id.endsWith(`-u${unitName}`))
                    );

                    if (!unit) {
                        unit = {
                            id: `${module.id}-u${unitName.replace(/\s+/g, '')}`,
                            name: unitName.startsWith('Unit') ? unitName : `Unit ${unitName}`,
                            topics: []
                        };
                        module.units.push(unit);
                    }

                    // 3c. Ensure Topic Exists (Optional, mostly for "General Topics")
                    // If topic is specified and doesn't match existing, we add a topic node?
                    // Currently StudentDashboard mostly aggregates at Unit level or shows "General Topics".
                    // But if we want specific topics to be navigable, we add them.
                    // For now, let's ensure at least ONE topic exists in the unit.
                    if (unit.topics.length === 0) {
                        unit.topics.push({
                            id: `${unit.id}-t1`,
                            name: 'General Topics'
                        });
                    }
                    // If material has a specific topic not in list?
                    if (m.topic && m.topic !== 'General Topics') {
                        const topicExists = unit.topics.find(t => t.name === m.topic);
                        if (!topicExists) {
                            unit.topics.push({
                                id: `${unit.id}-t-${Date.now()}`, // unique enough
                                name: m.topic
                            });
                        }
                    }
                }
            });
        });

        // 4. Merge extra courses (Dynamic Courses from Admin)
        console.log('Extra courses to merge:', extraCourses);
        console.log('Current Student Context:', { branch, selectedYear });
        extraCourses.forEach(course => {
            try {
                const cBranch = (course.branch || 'Common').toLowerCase();
                const sBranch = String(branch || '').toLowerCase();

                if (String(course.year) === String(selectedYear) &&
                    (cBranch === sBranch || cBranch === 'common' || course.branch === 'All')) {

                    let sem = semesters.find(s => s.sem === Number(course.semester));
                    if (!sem) {
                        // Create semester if missing
                        sem = { sem: Number(course.semester), subjects: [] };
                        semesters.push(sem);
                        // Sort semesters
                        semesters.sort((a, b) => a.sem - b.sem);
                    }

                    // Add course if not exists
                    if (!sem.subjects.find(s => s.code === course.code)) {
                        sem.subjects.push({
                            id: course.id || `dyn-${course.code}`,
                            name: course.name,
                            code: course.code,
                            modules: course.modules && course.modules.length > 0 ? course.modules : generateDefaultModules(course.id || course.code)
                        });
                    }
                }
            } catch (e) {
                console.error("Error merging course", e);
            }
        });

        return { semesters };
    }, [branch, selectedYear, extraCourses, serverMaterials]);

    // If student has an explicit semester, show only that semester; otherwise allow both semesters of the year
    // If student has an explicit semester, show only that semester; otherwise allow both semesters of the year


    // Fetch server-provided materials (optional) for selected year/branch
    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                const qs = new URLSearchParams({ year: String(selectedYear), branch });
                const materialsData = await apiGet(`/api/materials?${qs.toString()}`);
                if (mounted && Array.isArray(materialsData)) {
                    setServerMaterials(materialsData);
                }
            } catch (e) {
                // ignore network errors
            }
        })();
        return () => { mounted = false; };
    }, [branch, selectedYear]);

    // Fetch Messages (Simulated from Admin LocalStorage + Faculty Broadcasts)
    useEffect(() => {
        const storedMsgs = JSON.parse(localStorage.getItem('adminMessages') || '[]');

        // Filter messages:
        // 1. target='all' OR target='students'
        // 2. target='students-specific' AND matches year AND matches section
        const relevantMsgs = storedMsgs.filter(m => {
            if (m.target === 'all' || m.target === 'students') return true;
            if (m.target === 'students-specific') {
                // Check Year
                if (String(m.targetYear) !== String(userData.year)) return false;
                // Check Section (if message has targetSections array, check if my section is in it)
                if (m.targetSections && Array.isArray(m.targetSections)) {
                    return m.targetSections.includes(userData.section);
                }
                return false;
            }
            return false;
        });

        // Sort by newest first
        relevantMsgs.sort((a, b) => new Date(b.date) - new Date(a.date));
        setMessages(relevantMsgs);

        // Calculate unread count based on last viewed count
        const lastReadCount = parseInt(localStorage.getItem('lastReadMsgCount') || '0', 10);
        // This is a list_dir, not replace.
        // Skipping replace. for now to verify render. If decreased (deleted), show 0 or adjust?
        // Simple logic: Unread = Total - LastRead. If Total < LastRead (deleted), reset LastRead?
        // Let's just do: Unread = Math.max(0, relevantMsgs.length - lastReadCount);
        // But better: Store timestamp of last read? No, user wants number logic.
        // "Show default notification number" usually means show NEW messages.
        const unread = Math.max(0, relevantMsgs.length - lastReadCount);
        setUnreadCount(unread);
    }, [userData.year, userData.section, showMsgModal]); // Add showMsgModal dep to re-calc if needed, though handleOpen does it.

    // Merge generated subject materials with server-provided ones


    // (Uploads are handled by faculty UI elsewhere; this component offers navigation to upload.)

    const canViewAdvanced = true; // Allow all students to access advanced learning

    // Advanced lists
    // Advanced lists

    const handleSettingsClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setView('settings');
        // Scroll to top to ensure settings are visible
        window.scrollTo(0, 0);
    };

    const handleBackFromSettings = (e) => {
        e && e.preventDefault();
        e && e.stopPropagation();
        setView('overview');
    };



    // Update user data when profile is updated
    const handleProfileUpdate = (updatedData) => {
        if (!updatedData) return;

        const finalData = {
            ...userData,
            ...updatedData,
            studentName: updatedData.studentName || updatedData.name || userData.studentName,
            sid: updatedData.sid || updatedData.studentId || userData.sid
        };

        setUserData(finalData);
        // Persist to localStorage for session continuity
        localStorage.setItem('user', JSON.stringify(finalData));
    };

    // Navigation State for Academic Browser
    const [navPath, setNavPath] = useState([]); // Array of { type, id, name, data }

    // Helper to resolve current view data
    const currentViewData = useMemo(() => {
        // Default to the student's current year if no path is set
        if (navPath.length === 0) {
            const yearToUse = selectedYear || 1;
            // Use the yearData computed from state (includes extraCourses)
            // yearData format is { semesters: [...] }
            return { type: 'year', id: yearToUse, name: `Year ${yearToUse}`, data: yearData.semesters };
        }
        return navPath[navPath.length - 1];
    }, [navPath, selectedYear, yearData]); // Added yearData dependency

    // Handlers for Navigation
    const handleNavigateTo = (item, type, data) => {
        setNavPath([...navPath, { type, id: item.id || item, name: item.name || `Year ${item}`, data }]);
    };

    const handleBreadcrumbClick = (index) => {
        setNavPath(navPath.slice(0, index + 1));
    };

    const handleBack = () => {
        setNavPath(parent => parent.slice(0, -1));
    };

    const resetNavigation = () => {
        setNavPath([]);
        setView('overview');
    };

    // Render Logic for different levels
    const renderContent = () => {
        const current = currentViewData;

        // Level 2: Semesters (inside a Year)
        if (current.type === 'year') {
            return (
                <div className="grid-container">
                    {(current.data || []).map(sem => (
                        <div key={sem.sem} className="nav-card sem-card" onClick={() => handleNavigateTo({ id: sem.sem, name: `Semester ${sem.sem}` }, 'semester', sem.subjects)}>
                            <div className="card-icon">📖</div>
                            <h3>Semester {sem.sem}</h3>
                            <p>{(sem.subjects || []).length} Subjects</p>
                        </div>
                    ))}
                </div>
            );
        }

        // Level 3: Subjects (inside a Semester)
        if (current.type === 'semester') {
            return (
                <div className="grid-container">
                    {(current.data || []).map(sub => (
                        <div key={sub.id} className="nav-card subject-card" onClick={() => handleNavigateTo(sub, 'subject', sub.modules)}>
                            <div className="card-icon">📘</div>
                            <h3>{sub.name}</h3>
                            <p>{sub.code}</p>
                        </div>
                    ))}
                </div>
            );
        }

        // Level 4: Modules (inside a Subject)
        if (current.type === 'subject') {
            return (
                <div className="modules-grid">
                    {(current.data || []).map(mod => (
                        <div key={mod.id} className="nav-item module-item" onClick={() => handleNavigateTo(mod, 'module', mod.units)}>
                            <div className="item-icon">📦</div>
                            <div className="item-details">
                                h3&gt;{mod.name}&lt;/h3
                                <span>{(mod.units || []).length} Units</span>
                            </div>
                            <div className="item-arrow">➔</div>
                        </div>
                    ))}
                </div>
            );
        }

        // Level 5: Units (inside a Module)
        if (current.type === 'module') {
            return (
                <div className="modules-grid">
                    {(current.data || []).map(unit => (
                        <div key={unit.id} className="nav-item unit-item" onClick={() => handleNavigateTo(unit, 'unit', unit.topics)}>
                            <div className="item-icon">📑</div>
                            <div className="item-details">
                                <h3>{unit.name}</h3>
                                <span>{(unit.topics || []).length} Topics</span>
                            </div>
                            <div className="item-arrow">➔</div>
                        </div>
                    ))}
                </div>
            );
        }

        // Level 6: Topics (inside a Unit)
        if (current.type === 'unit') {
            return (
                <div className="modules-grid">
                    {(current.data || []).map(topic => (
                        <div key={topic.id} className="nav-item topic-item" onClick={() => handleNavigateTo(topic, 'topic', topic.resources)}>
                            <div className="item-icon">💡</div>
                            <div className="item-details">
                                <h3>{topic.name}</h3>
                                <span>View Notes, Videos & Papers</span>
                            </div>
                            <div className="item-arrow">➔</div>
                        </div>
                    ))}
                </div>
            );
        }

        // Level 7: Resources (Notes, Videos, Papers for a Topic)
        if (current.type === 'topic') {
            const staticResources = current.data || {};

            // MERGE Logic:
            // 1. LocalStorage materials (from file-based fallback)
            const localDynamicMaterials = JSON.parse(localStorage.getItem('courseMaterials') || '[]');

            // 2. Server materials (fetched via API)
            const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';
            const apiMaterials = serverMaterials.map(m => ({
                ...m,
                url: m.url && m.url.startsWith('http') ? m.url : `${API_BASE}${m.url}`
            }));

            // Combine both sources
            const allDynamicMaterials = [...localDynamicMaterials, ...apiMaterials];

            const subjectObj = navPath.find(item => item.type === 'subject');
            const moduleObj = navPath.find(item => item.type === 'module');
            const unitObj = navPath.find(item => item.type === 'unit');

            const currentSubject = subjectObj ? subjectObj.name : '';
            const currentModule = moduleObj ? moduleObj.name.replace('Module ', '') : '';
            const currentUnit = unitObj ? unitObj.name.replace('Unit ', '') : '';
            const currentTopicName = currentViewData.name || '';

            // Filter relevant materials
            const dynamicResources = allDynamicMaterials.filter(m => {
                // Year & Section Logic
                // If material year/section is 'All', it applies. Otherwise must match.
                const matchYear = String(m.year) === 'All' || String(m.year) === String(selectedYear);
                const matchSection = m.section === 'All' || m.section === data.section;

                // Subject Match
                // Admin might use "CSE" or "Computer Science". We try exact match first.
                // Assuming exact match for now as names are from dropdown.
                const matchSubject = m.subject === currentSubject;

                // Module/Unit match
                // m.module might be "1" or "Module 1"
                const modStr = String(m.module);
                const matchModule = modStr === currentModule ||
                    modStr === `Module ${currentModule}` ||
                    (moduleObj && moduleObj.name.includes(modStr));

                const unitStr = String(m.unit);
                const matchUnit = unitStr === currentUnit ||
                    unitStr === `Unit ${currentUnit}` ||
                    (unitObj && unitObj.name.includes(unitStr));

                // Topic Match
                // If viewing "General Topics", show everything for this Unit.
                // Otherwise try to match topic name.
                let matchTopic = true;
                if (currentTopicName !== 'General Topics' && m.topic) {
                    matchTopic = (m.topic.toLowerCase() === currentTopicName.toLowerCase()) ||
                        (currentTopicName.toLowerCase().includes(m.topic.toLowerCase()));
                }

                return matchYear && matchSection && matchSubject && matchModule && matchUnit && matchTopic;
            });

            // Flatten lists
            const notes = [...(staticResources.notes || []), ...dynamicResources.filter(m => m.type === 'notes')];
            const videos = [...(staticResources.videos || []), ...dynamicResources.filter(m => m.type === 'videos')];
            const papers = [...(staticResources.modelPapers || []), ...dynamicResources.filter(m => m.type === 'modelPapers' || m.type === 'previousQuestions')];
            const syllabus = dynamicResources.filter(m => m.type === 'syllabus');

            return (
                <div className="resources-container">
                    <div className="resource-section">
                        <h4>📄 Notes</h4>
                        <div className="res-grid">
                            {notes.map((note, idx) => (
                                <div key={note.id || idx} className="res-card-wrapper" style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    <a href={note.url} target="_blank" rel="noreferrer" className="res-card note-res" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', color: '#334155' }}>
                                        <FaDownload />
                                        <span>{note.name || note.title}</span>
                                        {note.uploadedBy === 'admin' && <span className="badge-admin" style={{ fontSize: '0.7rem', background: '#e2e8f0', padding: '2px 6px', borderRadius: '10px' }}>Admin</span>}
                                    </a>
                                    <button
                                        className="btn-ask-ai"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setView('ai-assistant');
                                            // You could pre-fill the chat input via state or context if you wanted
                                            // For now, it just opens the agent
                                        }}
                                        style={{
                                            background: '#f0fdf4', border: '1px solid #10b981', color: '#10b981',
                                            borderRadius: '8px', padding: '0.4rem 0.8rem', cursor: 'pointer', fontSize: '0.85rem',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem'
                                        }}
                                    >
                                        <span style={{ fontSize: '1.1rem' }}>🤖</span> Ask AI to explain
                                    </button>
                                </div>
                            ))}

                            {notes.length === 0 && <p className="text-muted">No notes available.</p>}
                        </div>
                    </div>

                    <div className="resource-section">
                        <h4>🎥 Videos</h4>
                        <div className="res-grid">
                            {videos.map((vid, idx) => (
                                <a key={vid.id || idx} href={vid.url} target="_blank" rel="noreferrer" className="res-card video-res">
                                    <div className="play-icon">▶</div>
                                    <div className="vid-info">
                                        <div>{vid.name || vid.title}</div>
                                        {vid.duration && <span className="duration">({vid.duration})</span>}
                                    </div>
                                </a>
                            ))}
                            {videos.length === 0 && <p className="text-muted">No videos available.</p>}
                        </div>
                    </div>

                    <div className="resource-section">
                        <h4>📝 Model Papers</h4>
                        <div className="res-grid">
                            {papers.map((paper, idx) => (
                                <a key={paper.id || idx} href={paper.url} target="_blank" rel="noreferrer" className="res-card paper-res">
                                    <FaDownload /> {paper.name || paper.title}
                                </a>
                            ))}
                            {papers.length === 0 && <p className="text-muted">No model papers available.</p>}
                        </div>
                    </div>

                    {syllabus.length > 0 && (
                        <div className="resource-section">
                            <h4>📋 Syllabus</h4>
                            <div className="res-grid">
                                {syllabus.map((syl, idx) => (
                                    <a key={syl.id || idx} href={syl.url} target="_blank" rel="noreferrer" className="res-card">
                                        <FaClipboardList /> {syl.title}
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            );
        }

        return <div>Unknown View</div>;
    };

    // AI Modal State
    const [showAiModal, setShowAiModal] = useState(false);

    return (
        <div className="student-dashboard">
            {/* FLOATING ACTION BUTTON FOR AI */}
            <button
                onClick={() => setShowAiModal(true)}
                style={{
                    position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 1000,
                    width: '60px', height: '60px', borderRadius: '50%',
                    background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                    color: 'white', border: 'none', boxShadow: '0 4px 15px rgba(99, 102, 241, 0.4)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                    fontSize: '1.5rem', transition: 'transform 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                title="Ask AI Assistant"
            >
                <FaRobot />
            </button>

            {/* AI MODAL */}
            {showAiModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)',
                    zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(5px)'
                }}>
                    <div style={{ width: '90%', maxWidth: '900px', height: '80%', background: 'white', borderRadius: '16px', overflow: 'hidden', display: 'flex', flexDirection: 'column', position: 'relative' }}>
                        <button
                            onClick={() => setShowAiModal(false)}
                            style={{ position: 'absolute', top: '1rem', right: '1rem', zIndex: 10, background: 'white', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}
                        >
                            &times;
                        </button>
                        <div style={{ flex: 1, overflow: 'hidden' }}>
                            <VuAiAgent />
                        </div>
                    </div>
                </div>
            )}

            <header className="sd-header">
                <div className="sd-brand-group">
                    <FaRocket className="sd-brand-icon" />
                    <h1 className="sd-brand-name">Friendly Notebook</h1>
                </div>

                <div className="sd-text-group">
                    <h2 className="sd-title" style={{ margin: 0, fontSize: '1.4rem' }}>
                        {new Date().getHours() < 12 ? 'Good Morning' : new Date().getHours() < 18 ? 'Good Afternoon' : 'Good Evening'}, {userData.studentName.split(' ')[0]}
                    </h2>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b', fontWeight: 400 }}>
                        {tasks.filter(t => !t.completed).length > 0 ? `You have ${tasks.filter(t => !t.completed).length} tasks due!` : 'You are all caught up! 🌟'}
                    </p>

                    {/* Academic Progress Mini-Bar */}
                    <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: '#64748b' }}>
                        <span>Semester Progress: 85%</span>
                        <div style={{ width: '100px', height: '6px', background: '#e2e8f0', borderRadius: '10px', overflow: 'hidden' }}>
                            <div style={{ width: '85%', height: '100%', background: '#10b981', borderRadius: '10px' }}></div>
                        </div>
                    </div>
                </div>
                <div className="sd-actions">
                    <button onClick={handleSettingsClick} className="btn-icon" title="Settings">
                        <FaCog />
                    </button>

                    <div style={{ position: 'relative', display: 'inline-block' }}>
                        <button
                            onClick={() => setShowTaskModal(!showTaskModal)}
                            className="btn-icon"
                            title="Tasks"
                        >
                            <FaClipboardList />
                        </button>
                        {tasks.filter(t => !t.completed).length > 0 &&
                            <span className="msg-badge" style={{ background: '#f59e0b' }}>{tasks.filter(t => !t.completed).length}</span>}

                        {showTaskModal && (
                            <div className="msg-dropdown" style={{ right: '-50px' }}>
                                <div className="msg-header">
                                    <h4>My Tasks</h4>
                                    <button onClick={() => setShowTaskModal(false)}>&times;</button>
                                </div>
                                <div className="msg-list">
                                    {tasks.length > 0 ? (
                                        tasks.map((t, i) => (
                                            <div key={i} className="msg-item" style={{ borderLeft: t.completed ? '3px solid #10b981' : '3px solid #f59e0b' }}>
                                                <div className="msg-date">
                                                    {t.dueDate ? `Due: ${t.dueDate}` : 'No due date'}
                                                    {t.completed && <span style={{ marginLeft: '0.5rem', color: '#10b981' }}>✓ Done</span>}
                                                </div>
                                                <div className="msg-text" style={{ textDecoration: t.completed ? 'line-through' : 'none', color: t.completed ? '#94a3b8' : 'inherit' }}>
                                                    {t.text}
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="msg-empty">No tasks assigned</div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    <div style={{ position: 'relative', display: 'inline-block' }}>
                        <button
                            onClick={() => {
                                const newVal = !showMsgModal;
                                setShowMsgModal(newVal);
                                if (newVal) {
                                    // Opening: Mark all as read
                                    setUnreadCount(0);
                                    localStorage.setItem('lastReadMsgCount', messages.length.toString());
                                }
                            }}
                            className="btn-icon"
                            title="Messages"
                        >
                            <FaEnvelope />
                        </button>
                        {/* Only show badge if unread > 0 */}
                        {unreadCount > 0 && <span className="msg-badge">{unreadCount}</span>}

                        {/* Messages Dropdown */}
                        {showMsgModal && (
                            <div className="msg-dropdown">
                                <div className="msg-header">
                                    <h4>Messages</h4>
                                    <button onClick={() => setShowMsgModal(false)}>&times;</button>
                                </div>
                                <div className="msg-list">
                                    {messages.length > 0 ? (
                                        messages.map((m, i) => (
                                            <div key={i} className="msg-item">
                                                <div className="msg-date">
                                                    {new Date(m.date).toLocaleDateString()}
                                                    {m.sender && <span style={{ marginLeft: '0.5rem', fontWeight: 'bold', color: '#3b82f6' }}>• {m.sender}</span>}
                                                </div>
                                                <div className="msg-text">{m.text}</div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="msg-empty">No messages</div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            if (window.confirm('Are you sure you want to logout?')) {
                                if (onLogout) {
                                    onLogout();
                                } else {
                                    // Fallback if prop missing
                                    localStorage.removeItem('studentToken');
                                    localStorage.removeItem('userData');
                                    window.location.reload();
                                }
                            }
                        }}
                        className="btn-logout"
                    >
                        <FaSignOutAlt /> Logout
                    </button>
                </div>
            </header>

            {/* Overview / Home View */}
            {view === 'overview' && (
                <main className="sd-main-grid" style={{
                    display: 'grid',
                    gridTemplateColumns: '350px 1fr',
                    gap: '2rem',
                    maxWidth: '1600px',
                    margin: '2rem auto',
                    padding: '0 2rem'
                }}>

                    {/* Left Column: Profile & Stats */}
                    <div className="sd-left-col" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        <div className="glass-panel profile-card" style={{ padding: '2rem', textAlign: 'center' }}>
                            <div className="profile-avatar-container" style={{ position: 'relative', width: '100px', height: '100px', margin: '0 auto 1.5rem' }}>
                                <div className="profile-avatar" onClick={() => setShowProfilePhotoModal(true)} style={{
                                    width: '100%', height: '100%', borderRadius: '50%', overflow: 'hidden',
                                    border: '4px solid white', boxShadow: '0 10px 25px rgba(59, 130, 246, 0.2)',
                                    cursor: 'pointer'
                                }}>
                                    {userData.profilePic ? (
                                        <img src={userData.profilePic} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        <div style={{ width: '100%', height: '100%', background: '#3b82f6', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem' }}>
                                            {(userData.studentName || 'SD').substring(0, 2).toUpperCase()}
                                        </div>
                                    )}
                                </div>
                                <div style={{
                                    position: 'absolute', bottom: '5px', right: '5px', width: '20px', height: '20px',
                                    background: '#10b981', borderRadius: '50%', border: '3px solid white'
                                }}></div>
                            </div>

                            <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1e293b', marginBottom: '0.2rem' }}>{userData.studentName}</h2>
                            <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem' }}>ID: {userData.sid} • {userData.branch}</p>

                            <div className="stats-row" style={{ display: 'flex', justifyContent: 'center', gap: '2rem', borderTop: '1px solid #e2e8f0', paddingTop: '1.5rem' }}>
                                <div>
                                    <div style={{ fontSize: '1.25rem', fontWeight: '700', color: '#3b82f6' }}>85%</div>
                                    <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Attendance</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '1.25rem', fontWeight: '700', color: '#8b5cf6' }}>{tasks.length}</div>
                                    <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Tasks</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '1.25rem', fontWeight: '700', color: '#10b981' }}>{messages.length}</div>
                                    <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Msgs</div>
                                </div>
                            </div>
                        </div>

                        {/* Recent Activity / Announcements Widget */}
                        <div className="glass-panel" style={{ padding: '1.5rem' }}>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span style={{ background: '#fef3c7', padding: '4px', borderRadius: '4px' }}>🔔</span> Announcements
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {messages.slice(0, 3).map((msg, i) => (
                                    <div key={i} style={{ padding: '0.8rem', background: 'rgba(255,255,255,0.5)', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.05)' }}>
                                        <div style={{ fontSize: '0.9rem', color: '#334155' }}>{msg.message || msg.text}</div>
                                        <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.5rem' }}>{new Date(msg.timestamp || Date.now()).toLocaleDateString()}</div>
                                    </div>
                                ))}
                                {messages.length === 0 && <p style={{ color: '#94a3b8', fontSize: '0.9rem', fontStyle: 'italic' }}>No new announcements.</p>}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Main Navigation Cards */}
                    <div className="sd-right-col" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', alignContent: 'start' }}>

                        <div className="section-card" onClick={() => setView('semester')}>
                            <div className="section-icon" style={{ background: '#e0f2fe', color: '#0ea5e9', width: '60px', height: '60px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', fontSize: '1.8rem' }}>
                                <FaBookOpen />
                            </div>
                            <h3>Semester Notes</h3>
                            <p>Access comprehensive notes, video lectures, and previous year question papers.</p>
                            <button className="section-button">View Materials →</button>
                        </div>

                        <div className="section-card" onClick={() => setView('ai-assistant')}>
                            <div className="section-icon" style={{ background: '#d1fae5', color: '#10b981', width: '60px', height: '60px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', fontSize: '1.8rem' }}>
                                <FaRobot />
                            </div>
                            <h3>AI Study Buddy</h3>
                            <p>Get instant answers to your doubts. Your personal AI tutor is available 24/7.</p>
                            <button className="section-button" style={{ background: '#10b981' }}>Ask AI Now →</button>
                        </div>

                        {canViewAdvanced && (
                            <div className="section-card" onClick={() => navigate('/advanced-learning')}>
                                <div className="section-icon" style={{ background: '#f3e8ff', color: '#8b5cf6', width: '60px', height: '60px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', fontSize: '1.8rem' }}>
                                    <FaRocket />
                                </div>
                                <h3>Advanced Learning</h3>
                                <p>Master Full Stack, AI/ML, and industry skills with curated premium content.</p>
                                <button className="section-button" style={{ background: '#8b5cf6' }}>Launch Hub →</button>
                            </div>
                        )}

                        {/* New Card: Exam Prep */}
                        <div className="section-card" onClick={() => navigate('/interview-qa')}>
                            <div className="section-icon" style={{ background: '#ffedd5', color: '#f97316', width: '60px', height: '60px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', fontSize: '1.8rem' }}>
                                <FaUserTie />
                            </div>
                            <h3>Interview Prep</h3>
                            <p>Practice common interview questions and mock tests to crack your dream job.</p>
                            <button className="section-button" style={{ background: '#f97316' }}>Start Prep →</button>
                        </div>

                    </div>
                </main>
            )}

            {/* AI Assistant View */}
            {view === 'ai-assistant' && (
                <div className="animate-fade-in" style={{ padding: '0 2rem 2rem', maxWidth: '1200px', margin: '0 auto', height: 'calc(100vh - 100px)' }}>
                    <div style={{ marginBottom: '1rem' }}>
                        <button onClick={() => setView('overview')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem' }}>
                            ← Back to Dashboard
                        </button>
                    </div>
                    <VuAiAgent />
                </div>
            )}

            {/* Academic Browser (The New Navigation System) */}
            {view === 'semester' && (

                <div className="academic-browser fade-in">
                    {/* Navigation Header */}
                    <div className="nav-header">
                        <button className="btn-back-nav" onClick={navPath.length > 0 ? handleBack : resetNavigation}>
                            ← Back
                        </button>
                        <div className="breadcrumbs">
                            {/* Root is always the current Year */}
                            <span className={`crumb ${navPath.length === 0 ? 'active' : ''}`} onClick={() => setNavPath([])}>
                                {`Year ${selectedYear}`}
                            </span>

                            {navPath.map((item, index) => (
                                <React.Fragment key={index}>
                                    <span className="separator">/</span>
                                    <span
                                        className={`crumb ${index === navPath.length - 1 ? 'active' : ''}`}
                                        onClick={() => handleBreadcrumbClick(index)}
                                    >
                                        {item.name}
                                    </span>
                                </React.Fragment>
                            ))}
                        </div>
                    </div>

                    {/* Content Area */}
                    <div className="nav-content">
                        <h2>{currentViewData.name || 'Select Year'}</h2>
                        {renderContent()}
                    </div>

                    {/* Styles specifically for this view */}

                </div>
            )}

            {view === 'settings' && (
                <div className="settings-view fade-in">
                    <button className="btn-back" onClick={handleBackFromSettings}>← Back to Dashboard</button>
                    <h2>Account Settings</h2>
                    <PasswordSettings onBack={handleBackFromSettings} onProfileUpdate={handleProfileUpdate} userData={userData} />
                </div>
            )}



            {/* About Modal */}
            {showAbout && (
                <div className="modal-overlay" style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(12px)', animation: 'fadeIn 0.4s ease-out'
                }}>
                    <div className="modal-content animate-slide-up" style={{
                        background: 'rgba(255, 255, 255, 0.95)', width: '100%', maxWidth: '440px', borderRadius: '32px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', overflow: 'hidden', border: '1px solid rgba(255, 255, 255, 0.3)', display: 'flex', flexDirection: 'column', position: 'relative'
                    }}>
                        <div style={{
                            padding: '2rem 2rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                                <div style={{ background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)', width: '40px', height: '40px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                                    <FaRocket />
                                </div>
                                <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: '#1e293b', letterSpacing: '-0.5px' }}>Friendly Student</h2>
                            </div>
                            <button onClick={() => setShowAbout(false)} style={{ background: '#f1f5f9', border: 'none', width: '36px', height: '36px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', color: '#64748b', transition: 'all 0.2s' }} onMouseEnter={e => e.currentTarget.style.transform = 'rotate(90deg)'} onMouseLeave={e => e.currentTarget.style.transform = 'rotate(0deg)'}>&times;</button>
                        </div>

                        <div style={{ padding: '0 2rem 2rem', overflowY: 'auto' }}>
                            <div style={{ textAlign: 'center', marginBottom: '2.5rem', position: 'relative' }}>
                                <div style={{ width: '100px', height: '100px', margin: '0 auto 1.2rem', borderRadius: '30px', overflow: 'hidden', border: '4px solid #fff', boxShadow: '0 10px 20px rgba(0,0,0,0.1)', background: '#f8fafc' }}>
                                    {userData.profilePic ? (
                                        <img src={userData.profilePic} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', fontWeight: 'bold' }}>
                                            {(userData.studentName || 'S').substring(0, 1).toUpperCase()}
                                        </div>
                                    )}
                                </div>
                                <h3 style={{ margin: '0 0 0.3rem', color: '#1e293b', fontSize: '1.2rem', fontWeight: 700 }}>{userData.studentName}</h3>
                                <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem', fontWeight: 500 }}>{userData.sid} • Year {userData.year}</p>
                            </div>

                            <div style={{ background: 'rgba(99, 102, 241, 0.04)', borderRadius: '24px', padding: '1.5rem', border: '1px solid rgba(99, 102, 241, 0.1)' }}>
                                <h4 style={{ color: '#4f46e5', margin: '0 0 1rem 0', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>Premium Ecosystem Features</h4>
                                <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gap: '0.8rem' }}>
                                    {[
                                        { t: 'Smart Learning Hub', d: 'Personalized academic resources' },
                                        { t: 'AI Study Companion', d: '24/7 instant academic assistance' },
                                        { t: 'Task Maestro', d: 'Seamless deadline & activity tracking' },
                                        { t: 'Resource Vault', d: 'Unlimited access to notes & videos' }
                                    ].map((feat, i) => (
                                        <li key={i} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                                            <div style={{ color: '#10b981', marginTop: '3px' }}>✓</div>
                                            <div>
                                                <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#334155' }}>{feat.t}</div>
                                                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{feat.d}</div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                                <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: '0 0 0.5rem 0' }}>POWERED BY</p>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                                    <span style={{ fontSize: '1.1rem', fontWeight: 900, color: '#1e293b', letterSpacing: '-0.5px' }}>FRIENDLY NOTEBOOK</span>
                                    <div style={{ height: '4px', width: '4px', borderRadius: '50%', background: '#6366f1' }}></div>
                                    <span style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 500 }}>v2.5.0</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {/* Profile Photo Modal (WhatsApp Style) */}
            {showProfilePhotoModal && (
                <div className="modal-overlay" style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(5px)'
                }} onClick={() => setShowProfilePhotoModal(false)}>
                    <div className="modal-content" style={{
                        background: 'transparent', boxShadow: 'none', border: 'none', width: 'auto', maxWidth: 'none', padding: 0
                    }} onClick={e => e.stopPropagation()}>
                        <div style={{ position: 'relative', textAlign: 'center' }}>
                            <div style={{
                                width: '300px', height: '300px', borderRadius: '50%', overflow: 'hidden', border: '4px solid white', margin: '0 auto 2rem', background: '#333'
                            }}>
                                {userData.profilePic ? (
                                    <img src={userData.profilePic} alt="Profile Large" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '5rem', color: 'white', background: '#3b82f6' }}>
                                        {(userData.studentName || 'SD').substring(0, 2).toUpperCase()}
                                    </div>
                                )}
                            </div>

                            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                                <button
                                    className="btn-primary"
                                    onClick={() => { setShowProfilePhotoModal(false); setView('settings'); }}
                                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'white', color: '#1e293b', border: 'none', padding: '0.8rem 1.5rem', borderRadius: '50px', fontWeight: 600 }}
                                >
                                    <FaUserEdit /> Change Photo
                                </button>
                                {userData.profilePic && (
                                    <button
                                        onClick={() => {
                                            // Simulate removal
                                            if (window.confirm('Remove profile picture?')) {
                                                const updated = { ...userData, profilePic: '' };
                                                setUserData(updated);
                                                localStorage.setItem('user', JSON.stringify(updated));
                                                setShowProfilePhotoModal(false);
                                            }
                                        }}
                                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(239, 68, 68, 0.2)', color: '#fca5a5', border: '1px solid #ef4444', padding: '0.8rem 1.5rem', borderRadius: '50px', fontWeight: 600, cursor: 'pointer' }}
                                    >
                                        <FaTrash /> Remove
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}