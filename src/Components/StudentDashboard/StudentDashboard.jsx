import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    FaHome, FaBookOpen, FaLaptopCode, FaChartBar, FaRobot, FaCog, FaSignOutAlt,
    FaBell, FaSearch, FaUserCircle, FaBars
} from 'react-icons/fa';
import './StudentDashboard.css';
import { apiGet } from '../../utils/apiClient';

// Components - Re-importing to ensure they pick up new styles
import StudentHome from './StudentHome';
import StudentAcademics from './StudentAcademics';
import StudentTechnical from './StudentTechnical';
import StudentResults from './StudentResults';
import PasswordSettings from '../Settings/PasswordSettings';
import VuAiAgent from '../VuAiAgent/VuAiAgent';

const StudentDashboard = ({ studentData, onLogout }) => {
    const navigate = useNavigate();
    const [activeView, setActiveView] = useState('home');
    const [isSidebarOpen, setSidebarOpen] = useState(true); // Default open for desktop
    const [showWhatsNew, setShowWhatsNew] = useState(true);
    const [stats, setStats] = useState({
        attendance: 0,
        techScore: 0,
        testsTaken: 0,
        pendingTasks: 0
    });

    // Ensure studentData has defaults
    const user = {
        studentName: 'Student User',
        sid: 'UNKNOWN',
        branch: 'CSE',
        year: '1',
        section: 'A',
        ...studentData
    };

    useEffect(() => {
        const loadStats = async () => {
            try {
                const res = await apiGet(`/api/students/${user.sid}/data`);
                if (res && res.stats) {
                    setStats({
                        attendance: (typeof res.attendance === 'object' ? res.attendance.overall : res.attendance) || 85,
                        techScore: res.stats.techScore || 75,
                        testsTaken: res.stats.testsTaken || 4,
                        pendingTasks: 3
                    });
                }
            } catch (e) {
                console.error("Stats load failed", e);
            }
        };
        loadStats();
    }, [user.sid]);

    const handleLogout = () => {
        if (window.confirm('Are you sure you want to sign out?')) {
            if (onLogout) onLogout();
            else navigate('/login');
        }
    };

    const renderHeader = () => (
        <header className="sd-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <button
                    onClick={() => setSidebarOpen(!isSidebarOpen)}
                    style={{ background: 'none', border: 'none', fontSize: '1.1rem', cursor: 'pointer', color: 'var(--text-secondary)' }}
                >
                    <FaBars />
                </button>
                <div className="sd-welcome">
                    <h1>Dashboard</h1>
                    {/* Breadcrumbs style info */}
                    <span style={{ border: 'none', padding: 0, marginLeft: 0 }}>
                        / {user.studentName} / {user.branch}
                    </span>
                </div>
            </div>

            <div className="sd-actions">
                <div className="sd-icon-btn">
                    <FaSearch />
                </div>
                <div className="sd-icon-btn">
                    <FaBell />
                    <span className="sd-badge">2</span>
                </div>
                <div className="sd-icon-btn" style={{ background: '#eff6ff', padding: '0.4rem 0.8rem', borderRadius: '6px', color: 'var(--primary)' }}>
                    <FaUserCircle size={18} />
                    <span style={{ fontSize: '0.85rem', fontWeight: '600' }}>{user.sid}</span>
                </div>
            </div>
        </header>
    );

    const renderSidebar = () => (
        <aside className="sd-sidebar" style={{ width: isSidebarOpen ? '240px' : '0px', padding: isSidebarOpen ? '1.5rem 1rem' : '0', overflow: 'hidden' }}>
            <div className="sd-brand">
                <div className="sd-brand-icon">S</div>
                <h2>StudentHub</h2>
            </div>

            <nav className="sd-nav">
                <SidebarItem id="home" icon={<FaHome />} label="Overview" />
                <SidebarItem id="academics" icon={<FaBookOpen />} label="Academics" />
                <SidebarItem id="technical" icon={<FaLaptopCode />} label="Technical Skills" />
                <SidebarItem id="results" icon={<FaChartBar />} label="Performance" />
                <SidebarItem id="ai" icon={<FaRobot />} label="AI Assistant" />
                <SidebarItem id="settings" icon={<FaCog />} label="Settings" />
            </nav>

            <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)' }}>
                <button
                    onClick={handleLogout}
                    className="sd-nav-item"
                    style={{ color: 'var(--text-secondary)' }}
                >
                    <div className="sd-nav-icon"><FaSignOutAlt /></div>
                    <span>Sign Out</span>
                </button>
            </div>
        </aside>
    );

    const SidebarItem = ({ id, icon, label }) => (
        <button
            onClick={() => setActiveView(id)}
            className={`sd-nav-item ${activeView === id ? 'active' : ''}`}
        >
            <div className="sd-nav-icon">{icon}</div>
            <span>{label}</span>
        </button>
    );

    return (
        <div className="sd-container">
            {renderSidebar()}
            <main className="sd-main">
                {renderHeader()}
                <div className="sd-content">
                    {activeView === 'home' && (
                        <>
                            {showWhatsNew && (
                                <div className="sd-card whats-new">
                                    <div className="whats-new-header">
                                        <h4>What's New</h4>
                                        <button onClick={() => setShowWhatsNew(false)}>✕</button>
                                    </div>
                                    <p>Welcome to the new and improved Student Dashboard! We've updated the UI for a cleaner look and added new animations for a more dynamic experience.</p>
                                </div>
                            )}
                            <StudentHome studentData={user} stats={stats} />
                        </>
                    )}
                    {activeView === 'academics' && <StudentAcademics studentData={user} />}
                    {activeView === 'technical' && <StudentTechnical studentData={user} />}
                    {activeView === 'results' && <StudentResults studentData={user} />}
                    {activeView === 'ai' && (
                        <div className="sd-card" style={{ height: 'calc(100vh - 140px)', padding: 0, overflow: 'hidden', border: 'none', background: 'transparent', boxShadow: 'none' }}>
                            <VuAiAgent userRole="student" />
                        </div>
                    )}
                    {activeView === 'settings' && (
                        <div className="sd-card">
                            <h2 className="sd-section-title">Account Settings</h2>
                            <PasswordSettings userRole="student" userId={user.sid} />
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default StudentDashboard;