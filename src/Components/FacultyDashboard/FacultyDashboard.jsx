import React, { useState, useMemo, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import {
  FaUniversity, FaSignOutAlt, FaEnvelope, FaLayerGroup, FaFileAlt, FaCog, FaRobot,
  FaRocket, FaTrash, FaEye, FaPlus, FaBullhorn, FaHistory, FaProjectDiagram,
  FaFingerprint, FaUserCircle, FaSyncAlt, FaShieldAlt, FaCircleNotch
} from 'react-icons/fa';
import './FacultyDashboard.css';
import MaterialManager from './MaterialManager';
import FacultyAnalytics from './FacultyAnalytics';
import FacultyClassPulse from './FacultyClassPulse';
import FacultySettings from './FacultySettings';
import VuAiAgent from '../VuAiAgent/VuAiAgent';
import { apiGet, apiDelete } from '../../utils/apiClient';

const FacultyDashboard = ({ facultyData, setIsAuthenticated, setIsFaculty }) => {
  const [activeContext, setActiveContext] = useState(null);
  const [selectedSections, setSelectedSections] = useState([]);
  const [showSendModal, setShowSendModal] = useState(false);
  const [msgTarget, setMsgTarget] = useState(null);
  const [messages, setMessages] = useState([]);
  const [materialsList, setMaterialsList] = useState([]);
  const [studentsList, setStudentsList] = useState([]);
  const [showProfile, setShowProfile] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [bootSequence, setBootSequence] = useState(true);

  const displayName = facultyData.name || 'Core Instructor';
  const facultyToken = localStorage.getItem('facultyToken');
  const navigate = useNavigate();

  const refreshAll = async () => {
    setSyncing(true);
    try {
      const mats = await apiGet('/api/materials');
      if (mats) setMaterialsList(mats);

      const adminMsgs = await apiGet('/api/messages');
      if (adminMsgs) {
        // Filter for: Admin messages to Faculty/All OR messages sent BY this faculty
        const filteredMsgs = adminMsgs.filter(m =>
          m.target === 'all' ||
          m.target === 'faculty' ||
          m.facultyId === facultyData.facultyId
        );
        setMessages(filteredMsgs.slice(0, 10));
      }

      const studentsData = await apiGet(`/api/faculty-stats/${facultyData.facultyId}/students`);
      if (Array.isArray(studentsData)) setStudentsList(studentsData);

      setTimeout(() => setSyncing(false), 800);
    } catch (e) {
      console.error("Mesh Synchronization Failed", e);
      setSyncing(false);
    }
  };

  useEffect(() => {
    refreshAll();
    const timer = setTimeout(() => setBootSequence(false), 1500);
    const interval = setInterval(refreshAll, 30000); // 30s auto-refresh
    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
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
    if (window.confirm('Initiate terminal shutdown and logout?')) {
      localStorage.clear();
      setIsAuthenticated(false);
      setIsFaculty(false);
      navigate('/');
    }
  };

  const getFileUrl = (url) => {
    if (!url || url === '#') return '#';
    if (url.startsWith('http')) return url;
    return `http://localhost:5000${url.startsWith('/') ? '' : '/'}${url}`;
  };

  const handleDeleteNode = async (id) => {
    if (!window.confirm("Purge data node from central buffer?")) return;
    try {
      await apiDelete(`/api/materials/${id}`);
      refreshAll();
    } catch (err) {
      alert("System Conflict: " + err.message);
    }
  };

  if (bootSequence) {
    return (
      <div className="faculty-dashboard-v2" style={{ justifyContent: 'center', alignItems: 'center', background: '#f8fafc' }}>
        <div style={{ textAlign: 'center' }}>
          <FaUserCircle style={{ fontSize: '4rem', color: 'var(--accent-primary)', animation: 'pulse 1s infinite' }} />
          <h2 className="brand-shimmer" style={{ marginTop: '1.5rem' }}>Securing Faculty Console...</h2>
          <div style={{ width: '200px', height: '3px', background: 'rgba(99, 102, 241, 0.1)', margin: '1rem auto', borderRadius: '10px', overflow: 'hidden' }}>
            <div style={{ width: '60%', height: '100%', background: 'var(--accent-primary)', animation: 'meshFlow 2s infinite' }}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="faculty-dashboard-v2">
      {/* CYBER SIDEBAR */}
      <aside className="sidebar-v2">
        <div className="sidebar-header-v2" style={{ padding: '2.5rem 1.8rem' }}>
          <div className="icon-box" style={{ background: 'var(--accent-primary)', color: 'white', margin: '0 0 1rem', width: '42px', height: '42px' }}>
            <FaRocket />
          </div>
          <h2 className="brand-shimmer">friendlyNotebook</h2>
          <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 800, letterSpacing: '1px', opacity: 0.8 }}>FACULTY CONSOLE V2.0</p>
        </div>

        <nav style={{ flex: 1, overflowY: 'auto' }}>
          <button className={`nav-link-v2 ${!activeContext ? 'active' : ''}`} onClick={() => setActiveContext(null)}>
            <div className="icon-box"><FaUniversity /></div>
            <span>Dashboard Home</span>
          </button>

          <button className={`nav-link-v2 ${activeContext === 'ai-agent' ? 'active' : ''}`} onClick={() => setActiveContext('ai-agent')}>
            <div className="icon-box"><FaRobot /></div>
            <span>AI Assistant</span>
          </button>

          <div style={{ padding: '2rem 1.8rem 0.8rem', fontSize: '0.65rem', fontWeight: 900, color: 'var(--text-muted)', letterSpacing: '1.5px', textTransform: 'uppercase' }}>Teaching Sections</div>
          {myClasses.map((cls) => {
            const subjectStudents = studentsList.filter(s =>
              String(s.year) === String(cls.year) &&
              cls.sections.some(sec => String(sec).toUpperCase() === String(s.section).toUpperCase())
            ).length;

            return (
              <button key={cls.id} className={`nav-link-v2 ${activeContext?.id === cls.id ? 'active' : ''}`} onClick={() => setActiveContext(cls)}>
                <div className="icon-box"><FaProjectDiagram /></div>
                <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: activeContext?.id === cls.id ? 'var(--accent-primary)' : 'inherit' }}>{cls.subject}</span>
                  <span style={{ fontSize: '0.65rem', opacity: 0.7 }}>{cls.sections.length} Sections • {subjectStudents} Students</span>
                </div>
              </button>
            );
          })}

          <button className={`nav-link-v2 ${activeContext === 'settings' ? 'active' : ''}`} onClick={() => setActiveContext('settings')} style={{ marginTop: '2rem' }}>
            <div className="icon-box"><FaCog /></div>
            <span>Settings</span>
          </button>
        </nav>

        <div style={{ padding: '1.2rem', borderTop: '1px solid var(--pearl-border)' }}>
          <button className="nav-link-v2" onClick={handleLogout} style={{ color: '#ef4444', background: 'rgba(239, 68, 68, 0.05)', margin: 0, width: '100%', borderRadius: '16px' }}>
            <FaSignOutAlt />
            <span>Terminate Access</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT STAGE */}
      <main className="main-stage">
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
            <div className="icon-box" style={{ background: 'linear-gradient(135deg, #0ea5e9, #22d3ee)', color: 'white' }}><FaShieldAlt /></div>
            <div>
              <div style={{ fontSize: '0.7rem', color: '#0ea5e9', fontWeight: 900, letterSpacing: '1.5px' }}>SECURE FACULTY NODE</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.5px' }}>{activeContext ? activeContext.subject : 'Main Systems Aggregate'}</div>
            </div>
          </div>

          <button className="cyber-btn primary" onClick={refreshAll} style={{ padding: '0.7rem 1.5rem', fontSize: '0.85rem' }}>
            {syncing ? <FaSyncAlt className="spin-fast" /> : <FaSyncAlt />}
            {syncing ? 'SYNCING DATA...' : 'REFRESH DATABASE'}
          </button>
        </header>

        {activeContext === 'ai-agent' ? (
          <div className="glass-card animate-fade-in" style={{ height: 'calc(100% - 100px)', padding: 0, overflow: 'hidden', border: '1px solid var(--cyber-cyan)' }}>
            <VuAiAgent />
          </div>
        ) : activeContext === 'settings' ? (
          <div className="animate-fade-in"><FacultySettings facultyData={facultyData} /></div>
        ) : (
          <div className="animate-fade-in">
            {/* LARGE HERO SECTION */}
            <section className="hero-banner">
              <div style={{ position: 'relative', zIndex: 2 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.6rem',
                    padding: '0.5rem 1rem',
                    background: 'rgba(16, 185, 129, 0.08)',
                    borderRadius: '50px',
                    border: '1px solid rgba(16, 185, 129, 0.2)',
                    color: '#059669',
                    fontSize: '0.7rem',
                    fontWeight: 900,
                    letterSpacing: '1px'
                  }}>
                    <div style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: '#10b981',
                      boxShadow: '0 0 10px #10b981',
                      animation: 'pulse 2s infinite'
                    }}></div>
                    SYSTEM SECURE
                  </div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.6rem',
                    padding: '0.5rem 1rem',
                    background: 'rgba(99, 102, 241, 0.08)',
                    borderRadius: '50px',
                    border: '1px solid rgba(99, 102, 241, 0.2)',
                    color: 'var(--accent-primary)',
                    fontSize: '0.7rem',
                    fontWeight: 900,
                    letterSpacing: '1px'
                  }}>
                    <FaSyncAlt className={syncing ? 'spin-fast' : ''} style={{ fontSize: '0.8rem' }} />
                    {syncing ? 'DATA SYNC ACTIVE' : 'MESH SYNCHRONIZED'}
                  </div>
                </div>
                <h1>Welcome back,<br />Prof. {displayName}</h1>
                <p style={{ fontSize: '1.2rem', color: 'var(--text-dim)', maxWidth: '600px', marginTop: '1.5rem' }}>
                  {activeContext ? `Managing deployment for ${activeContext.subject}. All nodes synchronized across ${activeContext.sections.join(', ')} sections.` : 'Global dashboard active. Overviewing material deployment, student affinity, and system transmissions.'}
                </p>

                <div style={{ display: 'flex', gap: '1.5rem', marginTop: '3.5rem' }}>
                  <div className="cyber-btn primary" onClick={() => setActiveContext(myClasses[0])} style={{ background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))', padding: '1.2rem 2.8rem' }}>
                    <FaPlus /> Deploy Node Material
                  </div>
                  <div className="cyber-btn" style={{ background: 'white', color: 'var(--text-main)', border: '1px solid var(--pearl-border)', padding: '1.2rem 2.8rem' }} onClick={() => setShowProfile(true)}>
                    <FaUserCircle style={{ color: 'var(--accent-vibrant)' }} /> My Identity Mesh
                  </div>
                </div>
              </div>
            </section>

            {!activeContext ? (
              <div className="dashboard-v2-grid">
                <FacultyClassPulse
                  studentsCount={studentsList.length}
                  materialsCount={materialsList.length}
                />
                <FacultyAnalytics myClasses={myClasses} materialsList={materialsList} facultyId={facultyData.facultyId} />

                <div className="glass-grid" style={{ marginTop: '2.5rem' }}>
                  {/* SYSTEM INTEL / NEW FEATURES */}
                  <div className="glass-card" style={{ borderLeft: '6px solid var(--accent-secondary)', background: 'linear-gradient(135deg, white 0%, rgba(168, 85, 247, 0.05) 100%)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                      <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.8rem', fontSize: '1.1rem' }}><FaShieldAlt color="var(--accent-secondary)" /> System Intelligence</h3>
                      <span style={{ fontSize: '0.6rem', fontWeight: 900, color: 'var(--accent-secondary)', background: 'rgba(168, 85, 247, 0.1)', padding: '0.3rem 0.6rem', borderRadius: '8px' }}>FACULTY ONLY</span>
                    </div>
                    <div style={{ background: 'white', padding: '1.5rem', borderRadius: '20px', border: '1px solid var(--pearl-border)', boxShadow: 'var(--soft-shadow)' }}>
                      <div style={{ fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.5rem' }}>Update: Version 2.0 Terminal Active</div>
                      <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
                        The new Faculty Broadcast system is now online. You can now dispatch urgent messages directly to your sections via the Deployment Hub.
                      </p>
                    </div>
                  </div>

                  {/* ACTIVITY FEED */}
                  <div className="glass-card" style={{ borderLeft: '6px solid var(--accent-primary)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                      <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.8rem', fontSize: '1.2rem' }}><FaHistory color="var(--accent-primary)" /> Deployment Logs</h3>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      {materialsList.slice(0, 5).map((m, i) => (
                        <div key={m.id || m._id} className="feed-item" style={{ padding: '1.2rem', borderRadius: '24px', display: 'flex', alignItems: 'center', gap: '1.2rem', background: '#f8fafc', border: '1px solid var(--pearl-border)' }}>
                          <div className="icon-box" style={{ background: 'white', color: 'var(--accent-primary)', border: '1px solid var(--pearl-border)' }}>
                            {m.type === 'videos' ? <FaLayerGroup /> : <FaFileAlt />}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-main)' }}>{m.title}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>{m.subject} • {new Date(m.createdAt || m.uploadedAt).toLocaleDateString()}</div>
                          </div>
                          <a href={getFileUrl(m.url)} target="_blank" rel="noreferrer" style={{ color: 'var(--accent-primary)', fontSize: '1.1rem' }}><FaEye /></a>
                        </div>
                      ))}
                      {materialsList.length === 0 && <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>No recent deployments detected.</p>}
                    </div>
                  </div>

                  {/* TRANSMISSIONS */}
                  <div className="glass-card" style={{ borderLeft: '6px solid #f43f5e' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                      <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.8rem', fontSize: '1.2rem' }}><FaBullhorn color="#f43f5e" /> Tactical Transmissions</h3>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                      {messages.map((msg, i) => (
                        <div key={msg.id} style={{ borderLeft: '3px solid #f43f5e', paddingLeft: '1.5rem', position: 'relative' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                            <div style={{ fontSize: '0.65rem', fontWeight: 900, color: '#f43f5e', textTransform: 'uppercase' }}>
                              {msg.facultyId === facultyData.facultyId ? 'SENT BY YOU' : (msg.sender || 'ADMIN CENTER')}
                            </div>
                            {msg.type && (
                              <span style={{
                                fontSize: '0.6rem',
                                fontWeight: 900,
                                background: 'rgba(244, 63, 94, 0.1)',
                                color: '#f43f5e',
                                padding: '0.2rem 0.5rem',
                                borderRadius: '4px',
                                textTransform: 'uppercase'
                              }}>
                                {msg.type}
                              </span>
                            )}
                          </div>
                          <p style={{ margin: 0, fontSize: '0.9rem', lineHeight: '1.5', color: 'var(--text-main)', fontWeight: 600 }}>{msg.message || msg.text}</p>
                          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                            {new Date(msg.createdAt || msg.date).toLocaleString()}
                            {msg.sections && ` • To Section: ${msg.sections.join(', ')}`}
                          </div>
                        </div>
                      ))}
                      {messages.length === 0 && <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>No active transmissions.</p>}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="animate-fade-in">
                <div className="glass-card" style={{ marginBottom: '2.5rem', background: 'var(--nebula-glow)', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <MaterialManager
                    selectedSubject={`${activeContext.subject} - Year ${activeContext.year}`}
                    selectedSections={activeContext.sections}
                    onUploadSuccess={refreshAll}
                  />
                </div>

                <div className="glass-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                    <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '1rem' }}><FaLayerGroup color="var(--cyber-cyan)" /> Managed Node Data</h2>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.7rem', fontWeight: 800, opacity: 0.4 }}>YEAR {activeContext.year} AGGREGATE</span>
                      <div style={{ padding: '0.4rem 1rem', background: 'rgba(34, 211, 238, 0.1)', color: 'var(--cyber-cyan)', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 900 }}>{materialsList.filter(m => String(m.year) === String(activeContext.year) && m.subject.includes(activeContext.subject)).length} NODES</div>
                    </div>
                  </div>

                  <div className="glass-grid">
                    {materialsList.filter(m => String(m.year) === String(activeContext.year) && m.subject.includes(activeContext.subject)).map(node => (
                      <div key={node.id || node._id} className="glass-card" style={{ padding: '2rem', background: '#f8fafc', border: '1px solid var(--pearl-border)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                          <div className="icon-box" style={{ background: 'white', color: 'var(--accent-primary)' }}>
                            {node.type === 'videos' ? <FaLayerGroup /> : <FaFileAlt />}
                          </div>
                          <div style={{ display: 'flex', gap: '0.6rem' }}>
                            <a href={getFileUrl(node.url)} target="_blank" rel="noreferrer" className="icon-box" style={{ width: '36px', height: '36px', background: 'white' }}><FaEye /></a>
                            <button onClick={() => handleDeleteNode(node.id || node._id)} className="icon-box" style={{ width: '36px', height: '36px', color: '#ef4444', border: 'none', background: 'rgba(239, 68, 68, 0.05)', cursor: 'pointer' }}><FaTrash /></button>
                          </div>
                        </div>
                        <h4 style={{ margin: '0 0 0.8rem', fontSize: '1.1rem', color: 'var(--text-main)' }}>{node.title}</h4>
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.65rem', padding: '0.3rem 0.6rem', borderRadius: '8px', background: 'rgba(99, 102, 241, 0.08)', color: 'var(--accent-primary)', fontWeight: 800 }}>{node.type.toUpperCase()}</span>
                          <span style={{ fontSize: '0.65rem', padding: '0.3rem 0.6rem', borderRadius: '8px', background: '#f1f5f9', color: 'var(--text-muted)', fontWeight: 800 }}>U{node.unit || 1}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* IDENTITY MODAL */}
      {showProfile && (
        <div className="modal-overlay" onClick={() => setShowProfile(false)}>
          <div className="glass-card animate-fade-in" style={{ width: '400px', textAlign: 'center', padding: '4rem' }} onClick={e => e.stopPropagation()}>
            <div style={{ width: '120px', height: '120px', borderRadius: '40px', background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))', margin: '0 auto 2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '3.5rem', fontWeight: 800, boxShadow: '0 10px 30px rgba(99, 102, 241, 0.3)' }}>
              {displayName[0]}
            </div>
            <h1 style={{ margin: 0, fontSize: '1.8rem', color: 'var(--text-main)' }}>{displayName}</h1>
            <div style={{ fontSize: '0.75rem', color: 'var(--accent-primary)', fontWeight: 800, letterSpacing: '1px', marginTop: '0.6rem' }}>ACADEMIC PROFESSOR</div>

            <div style={{ marginTop: '2.5rem', padding: '1.5rem', background: '#f8fafc', borderRadius: '20px', textAlign: 'left', border: '1px solid var(--pearl-border)' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '0.5rem' }}>FACULTY BRANCH</div>
              <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{facultyData.department || 'CORE DEPARTMENT'}</div>
            </div>

            <button className="cyber-btn primary" style={{ width: '100%', marginTop: '2.5rem', justifyContent: 'center' }} onClick={() => setShowProfile(false)}>Close Interface</button>
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
