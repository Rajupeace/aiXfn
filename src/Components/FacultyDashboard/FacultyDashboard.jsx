import React, { useState, useMemo, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import {
  FaUniversity, FaSignOutAlt, FaEnvelope, FaLayerGroup, FaFileAlt, FaCog, FaRobot,
  FaRocket, FaTrash, FaEye, FaPlus, FaBullhorn, FaHistory, FaProjectDiagram,
  FaFingerprint, FaUserCircle, FaSyncAlt, FaShieldAlt, FaCircleNotch, FaClipboardList,
  FaChalkboardTeacher, FaCheckCircle, FaExclamationCircle
} from 'react-icons/fa';
import './FacultyDashboard.css';
import MaterialManager from './MaterialManager';
import FacultyAnalytics from './FacultyAnalytics';
import FacultyClassPulse from './FacultyClassPulse';
import FacultySettings from './FacultySettings';
import FacultyExamDashboard from './FacultyExamDashboard';
import VuAiAgent from '../VuAiAgent/VuAiAgent';
import { apiGet, apiDelete } from '../../utils/apiClient';

const FacultyDashboard = ({ facultyData, setIsAuthenticated, setIsFaculty }) => {
  const [activeContext, setActiveContext] = useState(null); // null = Home, 'exams', 'settings', 'ai-agent', or Class Object
  const [messages, setMessages] = useState([]);
  const [materialsList, setMaterialsList] = useState([]);
  const [studentsList, setStudentsList] = useState([]);
  const [syncing, setSyncing] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const displayName = facultyData.name || 'Core Instructor';
  const navigate = useNavigate();

  // --- Data Logic ---
  const refreshAll = async () => {
    setSyncing(true);
    try {
      const [mats, adminMsgs, studentsData] = await Promise.all([
        apiGet('/api/materials'),
        apiGet('/api/messages'),
        apiGet(`/api/faculty-stats/${facultyData.facultyId}/students`)
      ]);

      if (mats) setMaterialsList(mats);
      if (adminMsgs) {
        const filteredMsgs = adminMsgs.filter(m =>
          m.target === 'all' ||
          m.target === 'faculty' ||
          m.facultyId === facultyData.facultyId
        );
        setMessages(filteredMsgs.slice(0, 10));
      }
      if (Array.isArray(studentsData)) setStudentsList(studentsData);

    } catch (e) {
      console.error("Sync Failed", e);
    } finally {
      setTimeout(() => setSyncing(false), 800);
    }
  };

  useEffect(() => {
    refreshAll();
    const interval = setInterval(refreshAll, 60000);
    return () => clearInterval(interval);
  }, []);

  const myClasses = useMemo(() => {
    const grouped = {};
    const assignments = facultyData.assignments || [];
    assignments.forEach(assign => {
      const key = `${assign.year}-${assign.subject}`;
      if (!grouped[key]) {
        grouped[key] = { id: key, year: assign.year, subject: assign.subject, sections: new Set() };
      }
      grouped[key].sections.add(assign.section);
    });
    return Object.values(grouped).map(g => ({ ...g, sections: Array.from(g.sections).sort() }));
  }, [facultyData.assignments]);

  const handleLogout = () => {
    if (window.confirm('End session and logout?')) {
      localStorage.clear();
      setIsAuthenticated(false);
      setIsFaculty(false);
      navigate('/');
    }
  };

  const handleDeleteNode = async (id) => {
    if (!window.confirm("Delete this material permanently?")) return;
    try {
      await apiDelete(`/api/materials/${id}`);
      refreshAll();
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  const getFileUrl = (url) => {
    if (!url || url === '#') return '#';
    if (url.startsWith('http')) return url;
    return `http://localhost:5000${url.startsWith('/') ? '' : '/'}${url}`;
  };

  // --- Render Functions ---
  const renderSidebar = () => (
    <aside className={`fd-sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
      <div className="fd-brand">
        <div className="fd-logo-icon"><FaRocket /></div>
        <h2>Faculty<span style={{ color: 'var(--primary)' }}>Console</span></h2>
      </div>

      <nav className="fd-nav">
        <div
          className={`fd-nav-item ${!activeContext ? 'active' : ''}`}
          onClick={() => setActiveContext(null)}
        >
          <div className="fd-nav-icon"><FaUniversity /></div>
          <span className="fd-nav-label">Dashboard Home</span>
        </div>

        <div className="fd-nav-section-title">Teaching Modules</div>
        {myClasses.map((cls) => (
          <div
            key={cls.id}
            className={`fd-nav-item ${activeContext?.id === cls.id ? 'active' : ''}`}
            onClick={() => setActiveContext(cls)}
          >
            <div className="fd-nav-icon"><FaChalkboardTeacher /></div>
            <span className="fd-nav-label">{cls.subject} <small style={{ opacity: 0.6 }}>({cls.sections.length})</small></span>
          </div>
        ))}

        <div className="fd-nav-section-title">Tools</div>
        <div className={`fd-nav-item ${activeContext === 'exams' ? 'active' : ''}`} onClick={() => setActiveContext('exams')}>
          <div className="fd-nav-icon"><FaClipboardList /></div>
          <span className="fd-nav-label">Exam Manager</span>
        </div>
        <div className={`fd-nav-item ${activeContext === 'ai-agent' ? 'active' : ''}`} onClick={() => setActiveContext('ai-agent')}>
          <div className="fd-nav-icon"><FaRobot /></div>
          <span className="fd-nav-label">AI Assistant</span>
        </div>
        <div className={`fd-nav-item ${activeContext === 'settings' ? 'active' : ''}`} onClick={() => setActiveContext('settings')}>
          <div className="fd-nav-icon"><FaCog /></div>
          <span className="fd-nav-label">Settings</span>
        </div>
      </nav>

      <div className="fd-footer">
        <button className="fd-logout-btn" onClick={handleLogout}>
          <FaSignOutAlt /> {!sidebarCollapsed && 'Sign Out'}
        </button>
      </div>
    </aside>
  );

  const renderHome = () => (
    <div className="animate-fade-in">
      <div className="fd-hero">
        <h1>Welcome back, Prof. {displayName.split(' ')[0]}</h1>
        <p>
          You are managing {myClasses.length} active subjects across {myClasses.reduce((acc, c) => acc + c.sections.length, 0)} sections.
          System status is nominal.
        </p>
        <div className="fd-quick-actions">
          <button className="fd-btn primary" onClick={() => myClasses[0] && setActiveContext(myClasses[0])}>
            <FaPlus /> Deploy Material
          </button>
          <button className="fd-btn secondary" onClick={() => setActiveContext('exams')}>
            <FaClipboardList /> Manage Exams
          </button>
        </div>
      </div>

      <div className="fd-stats-grid">
        <div className="fd-stat-card">
          <div className="fd-stat-icon" style={{ background: '#e0e7ff', color: 'var(--primary)' }}><FaUserCircle /></div>
          <div className="fd-stat-info">
            <h3>{studentsList.length}</h3>
            <p>Total Students</p>
          </div>
        </div>
        <div className="fd-stat-card">
          <div className="fd-stat-icon" style={{ background: '#dbeafe', color: 'var(--accent)' }}><FaFileAlt /></div>
          <div className="fd-stat-info">
            <h3>{materialsList.filter(m => m.uploadedBy === facultyData.facultyId || m.uploadedBy === 'faculty').length}</h3>
            <p>Materials Live</p>
          </div>
        </div>
        <div className="fd-stat-card">
          <div className="fd-stat-icon" style={{ background: '#fce7f3', color: 'var(--secondary)' }}><FaBullhorn /></div>
          <div className="fd-stat-info">
            <h3>{messages.length}</h3>
            <p>Active Notices</p>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        {/* Recent Activity */}
        <div className="fd-card">
          <h3><FaHistory style={{ color: 'var(--text-muted)' }} /> Recent Deployments</h3>
          {materialsList.slice(0, 5).map(m => (
            <div key={m.id || m._id} className="fd-list-item">
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <div className="fd-nav-icon" style={{ background: 'white', borderRadius: '8px', width: '40px', height: '40px' }}>
                  {m.type === 'videos' ? <FaLayerGroup /> : <FaFileAlt />}
                </div>
                <div>
                  <div style={{ fontWeight: '700' }}>{m.title}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{m.subject} • {new Date(m.createdAt || m.uploadedAt).toLocaleDateString()}</div>
                </div>
              </div>
              <a href={getFileUrl(m.url)} target="_blank" rel="noreferrer" style={{ color: 'var(--primary)' }}><FaEye /></a>
            </div>
          ))}
          {materialsList.length === 0 && <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No recent activity.</p>}
        </div>

        {/* Notices */}
        <div className="fd-card">
          <h3><FaEnvelope style={{ color: 'var(--text-muted)' }} /> Tactical Transmissions</h3>
          {messages.map(msg => (
            <div key={msg.id} style={{ marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid #f1f5f9' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                <span>{msg.facultyId === facultyData.facultyId ? 'YOU ' : (msg.sender || 'ADMIN')}</span>
                <span>{new Date(msg.createdAt || msg.date).toLocaleDateString()}</span>
              </div>
              <div style={{ fontSize: '0.95rem', fontWeight: '500' }}>{msg.message || msg.text}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderClassView = () => (
    <div className="animate-fade-in">
      <div className="fd-card" style={{ borderLeft: '4px solid var(--primary)' }}>
        <h2 style={{ margin: 0, fontFamily: 'var(--font-head)' }}>Module: {activeContext.subject}</h2>
        <p style={{ color: 'var(--text-secondary)', margin: '0.5rem 0' }}>Year {activeContext.year} • Sections {activeContext.sections.join(', ')}</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
        <div className="fd-card">
          <h3 style={{ marginBottom: '2rem' }}>Upload & Manage Materials</h3>
          <MaterialManager
            selectedSubject={`${activeContext.subject} - Year ${activeContext.year}`}
            selectedSections={activeContext.sections}
            onUploadSuccess={refreshAll}
          />
        </div>

        <div className="fd-card">
          <h3>Existing Nodes ({materialsList.filter(m => String(m.year) === String(activeContext.year) && m.subject.includes(activeContext.subject)).length})</h3>
          <div className="glass-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', display: 'grid', gap: '1rem' }}>
            {materialsList.filter(m => String(m.year) === String(activeContext.year) && m.subject.includes(activeContext.subject)).map(node => (
              <div key={node.id || node._id} className="fd-list-item" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                  <div style={{ fontWeight: '700' }}>{node.title}</div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <a href={getFileUrl(node.url)} target="_blank" rel="noreferrer"><FaEye color="var(--primary)" /></a>
                    <FaTrash color="var(--danger)" style={{ cursor: 'pointer' }} onClick={() => handleDeleteNode(node.id || node._id)} />
                  </div>
                </div>
                <div style={{ fontSize: '0.8rem', display: 'flex', gap: '0.5rem' }}>
                  <span style={{ background: '#e0e7ff', color: 'var(--primary)', padding: '2px 8px', borderRadius: '6px', fontWeight: '700', fontSize: '0.7rem' }}>{node.type.toUpperCase()}</span>
                  {node.unit && <span style={{ background: '#f1f5f9', padding: '2px 8px', borderRadius: '6px', fontSize: '0.7rem' }}>Unit {node.unit}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fd-container">
      {renderSidebar()}

      <main className="fd-main">
        <header className="fd-header">
          <div className="fd-header-actions">
            <button className="fd-sync-btn" onClick={() => setSidebarCollapsed(!sidebarCollapsed)}>
              Menu
            </button>
          </div>

          <div className="fd-header-title">
            <h1>{activeContext?.subject || (activeContext === 'exams' ? 'Exam Manager' : activeContext === 'settings' ? 'Settings' : 'Faculty Dashboard')}</h1>
          </div>

          <div className="fd-header-actions">
            <button className="fd-sync-btn" onClick={refreshAll}>
              {syncing ? <FaSyncAlt className="spin-fast" /> : <FaSyncAlt />} {syncing ? 'Syncing...' : 'Sync'}
            </button>
            <div className="fd-user-profile" onClick={() => setShowProfile(!showProfile)}>
              <div className="fd-avatar">{displayName[0]}</div>
              <span style={{ fontWeight: '600', fontSize: '0.9rem' }}>{displayName.split(' ')[0]}</span>
            </div>
          </div>
        </header>

        <div className="fd-content-scroll">
          {!activeContext && renderHome()}
          {activeContext === 'exams' && <div className="animate-fade-in"><FacultyExamDashboard /></div>}
          {activeContext === 'ai-agent' && <div className="animate-fade-in" style={{ height: '100%' }}><VuAiAgent /></div>}
          {activeContext === 'settings' && <div className="animate-fade-in"><FacultySettings facultyData={facultyData} /></div>}
          {typeof activeContext === 'object' && activeContext !== null && renderClassView()}
        </div>
      </main>

      {/* Profile Modal */}
      {showProfile && (
        <div className="modal-overlay" onClick={() => setShowProfile(false)}>
          <div className="fd-card animate-fade-in" style={{ width: '400px', textAlign: 'center' }} onClick={e => e.stopPropagation()}>
            <div className="fd-avatar" style={{ width: '80px', height: '80px', fontSize: '2rem', margin: '0 auto 1.5rem' }}>{displayName[0]}</div>
            <h2 style={{ margin: 0, fontFamily: 'var(--font-head)' }}>{displayName}</h2>
            <p style={{ color: 'var(--primary)', fontWeight: '700', fontSize: '0.9rem' }}>FACULTY MEMBER</p>

            <div style={{ textAlign: 'left', background: '#f8fafc', padding: '1.5rem', borderRadius: '16px', margin: '2rem 0' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>DEPARTMENT</div>
              <div style={{ fontWeight: '700' }}>{facultyData.department || 'General'}</div>
              <div style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-muted)', marginBottom: '0.5rem', marginTop: '1rem' }}>EMAIL</div>
              <div style={{ fontWeight: '700' }}>{facultyData.email}</div>
            </div>

            <button className="fd-btn primary" style={{ width: '100%', justifyContent: 'center' }} onClick={() => setShowProfile(false)}>Close Profile</button>
          </div>
        </div>
      )}
    </div>
  );
};

FacultyDashboard.propTypes = {
  facultyData: PropTypes.object.isRequired,
  setIsAuthenticated: PropTypes.func.isRequired,
  setIsFaculty: PropTypes.func.isRequired,
};

export default FacultyDashboard;
