import React, { useState, useMemo, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { FaUniversity, FaSignOutAlt, FaBookOpen, FaEnvelope, FaCog, FaRobot, FaRocket, FaClipboardList, FaLayerGroup, FaFileAlt } from 'react-icons/fa'; // Icons
import './FacultyDashboard.css';
import MaterialManager from './MaterialManager';
import FacultyAnalytics from './FacultyAnalytics';
import FacultySettings from './FacultySettings';
import VuAiAgent from '../VuAiAgent/VuAiAgent';
import { apiGet } from '../../utils/apiClient';

const FacultyDashboard = ({ facultyData, setIsAuthenticated, setIsFaculty }) => {
  const [activeContext, setActiveContext] = useState(null);
  const [selectedSections, setSelectedSections] = useState([]);
  const [showSendModal, setShowSendModal] = useState(false);
  const [msgTarget, setMsgTarget] = useState(null);
  const [messages, setMessages] = useState([]);
  const [showMsgModal, setShowMsgModal] = useState(false);
  const [materialsList, setMaterialsList] = useState([]);
  const [tasks] = useState([]);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [studentsList, setStudentsList] = useState([]);

  const refreshMaterials = async () => {
    try {
      const mats = await apiGet('/api/materials');
      if (mats) setMaterialsList(mats);

      const studentsData = await apiGet('/api/students');
      if (Array.isArray(studentsData)) setStudentsList(studentsData);
    } catch (e) {
      console.error("Failed to load materials or students", e);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      const storedMsgs = JSON.parse(localStorage.getItem('adminMessages') || '[]');
      const relevantMsgs = storedMsgs.filter(m => m.target === 'all' || m.target === 'faculty');
      relevantMsgs.sort((a, b) => new Date(b.date) - new Date(a.date));
      setMessages(relevantMsgs);
      await refreshMaterials();
    };
    fetchData();
  }, []);

  const navigate = useNavigate();

  const myClasses = useMemo(() => {
    const grouped = {};
    const assignments = facultyData.assignments || [];

    assignments.forEach(assign => {
      const sections = assign.sections || [assign.section];
      const subject = assign.subject;
      const year = assign.year;
      const key = `${year}-${subject}`;

      if (!grouped[key]) {
        grouped[key] = {
          id: key,
          year,
          subject,
          sections: new Set()
        };
      }
      sections.forEach(s => grouped[key].sections.add(s));
    });

    return Object.values(grouped).map(g => ({
      ...g,
      sections: Array.from(g.sections).sort()
    }));
  }, [facultyData.assignments]);

  const handleSendMessage = () => {
    const text = document.getElementById('facMsgText').value;
    if (!text) return alert('Please enter a message');

    const newMsg = {
      id: Date.now(),
      text: `[${msgTarget.subject}] ${text}`,
      target: 'students-specific',
      targetYear: msgTarget.year,
      targetSections: msgTarget.sections,
      sender: facultyData.name || 'Faculty Member',
      date: new Date().toISOString()
    };

    const existing = JSON.parse(localStorage.getItem('adminMessages') || '[]');
    existing.push(newMsg);
    localStorage.setItem('adminMessages', JSON.stringify(existing));

    alert('Message sent to ' + msgTarget.sections.length + ' sections.');
    setShowSendModal(false);
  };

  const handleClassSelect = (cls) => {
    setActiveContext(cls);
    setSelectedSections([]);
  };

  const toggleSection = (sec) => {
    setSelectedSections(prev =>
      prev.includes(sec) ? prev.filter(s => s !== sec) : [...prev, sec]
    );
  };

  const handleLogout = () => {
    if (window.confirm('Ready to leave the faculty lounge?')) {
      localStorage.removeItem('facultyToken');
      localStorage.removeItem('adminToken');
      localStorage.removeItem('studentToken');
      localStorage.removeItem('userData');
      setIsAuthenticated(false);
      setIsFaculty(false);
      navigate('/');
    }
  };

  const facultyToken = localStorage.getItem('facultyToken');
  const displayName = facultyData.name || 'Faculty Member';

  return (
    <div className="faculty-dashboard">
      <aside className="sidebar">
        <div className="sidebar-header">
          <FaRocket className="brand-icon" style={{ fontSize: '1.5rem', color: '#4f46e5' }} />
          <h2>Friendly Notebook</h2>
        </div>

        <nav className="class-nav">
          <div className="nav-label">MY CLASSES</div>
          <button
            className={`nav-item ${!activeContext ? 'active' : ''}`}
            onClick={() => setActiveContext(null)}
          >
            <FaUniversity className="nav-icon" />
            <div className="nav-info">
              <span className="subject">Dashboard Home</span>
            </div>
          </button>

          <div className="nav-label" style={{ marginTop: '1.5rem' }}>TOOLS</div>
          <button
            className={`nav-item ${activeContext === 'ai-assistant' ? 'active' : ''}`}
            onClick={() => setActiveContext('ai-assistant')}
            style={{ background: activeContext === 'ai-assistant' ? 'linear-gradient(135deg, #a855f7 0%, #6366f1 100%)' : '', color: activeContext === 'ai-assistant' ? 'white' : '' }}
          >
            <FaRobot className="nav-icon" style={{ color: activeContext === 'ai-assistant' ? 'white' : '#8b5cf6' }} />
            <div className="nav-info">
              <span className="subject">Vu AI Agent</span>
            </div>
          </button>

          <div className="nav-label" style={{ marginTop: '1.5rem' }}>ACCOUNT</div>
          <button
            className={`nav-item ${activeContext === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveContext('settings')}
          >
            <FaCog className="nav-icon" />
            <div className="nav-info">
              <span className="subject">Settings</span>
            </div>
          </button>

          <div className="nav-label" style={{ marginTop: '1.5rem' }}>The Classes</div>
          {myClasses.length === 0 && <div className="empty-nav">No classes assigned.</div>}
          {myClasses.map(cls => (
            <button
              key={cls.id}
              className={`nav-item ${activeContext?.id === cls.id ? 'active' : ''}`}
              onClick={() => handleClassSelect(cls)}
            >
              <FaBookOpen className="nav-icon" />
              <div className="nav-info">
                <span className="subject">{cls.subject}</span>
                <span className="meta">Year {cls.year} • {cls.sections.length} Sections</span>
              </div>
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button onClick={handleLogout} className="logout-btn">
            <FaSignOutAlt /> Logout
          </button>
        </div>
      </aside>

      <main className="faculty-main">
        {activeContext === 'ai-assistant' ? (
          <div style={{ padding: '2rem', height: '100%', boxSizing: 'border-box' }}>
            <VuAiAgent />
          </div>
        ) : activeContext === 'settings' ? (
          <FacultySettings facultyData={facultyData} />
        ) : !activeContext ? (
          <div className="dashboard-home animate-fade-in" style={{ padding: '2rem' }}>
            <header style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h1 style={{ color: '#1e293b', fontSize: '2.2rem', margin: '0 0 0.5rem 0', fontWeight: 800, letterSpacing: '-0.02em' }}>
                  {new Date().getHours() < 12 ? 'Good Morning' : new Date().getHours() < 18 ? 'Good Afternoon' : 'Good Evening'}, {displayName.split(' ')[0]} 👋
                </h1>
                <p style={{ color: '#64748b', margin: 0, fontSize: '1.1rem' }}>
                  {tasks.filter(t => !t.completed).length > 0
                    ? `You have ${tasks.filter(t => !t.completed).length} items on your todo list.`
                    : "Here's what's happening in your classes today."}
                </p>
              </div>

              <div style={{ display: 'flex', gap: '1rem', position: 'relative' }}>
                <div style={{ position: 'relative' }}>
                  <button onClick={() => setShowTaskModal(!showTaskModal)}
                    className="btn-secondary"
                    style={{ padding: '0', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '12px', width: '45px', height: '45px', background: 'white', border: '1px solid #e2e8f0' }}>
                    <FaClipboardList style={{ fontSize: '1.2rem', color: '#64748b' }} />
                    {tasks.filter(t => !t.completed).length > 0 && <span style={{ position: 'absolute', top: '8px', right: '8px', width: '10px', height: '10px', background: '#f59e0b', borderRadius: '50%', border: '2px solid #fff' }}></span>}
                  </button>
                  {showTaskModal && (
                    <div className="faculty-msg-dropdown" style={{
                      position: 'absolute', top: '55px', right: '0', width: '320px', background: 'white',
                      boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)', borderRadius: '16px', zIndex: 1000,
                      border: '1px solid #e2e8f0', overflow: 'hidden'
                    }}>
                      <div style={{ padding: '1.25rem', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', fontWeight: 'bold', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: '#1e293b' }}>Upcoming Tasks</span>
                        <span style={{ cursor: 'pointer', fontSize: '1.2rem', color: '#94a3b8' }} onClick={() => setShowTaskModal(false)}>&times;</span>
                      </div>
                      <div style={{ maxHeight: '350px', overflowY: 'auto', padding: '0.5rem' }}>
                        {tasks.length === 0 ? <p style={{ padding: '2rem', color: '#94a3b8', fontStyle: 'italic', textAlign: 'center' }}>No tasks assigned.</p> :
                          tasks.map((t, i) => (
                            <div key={i} style={{ padding: '1rem', marginBottom: '0.5rem', borderRadius: '10px', background: t.completed ? '#f8fafc' : '#fff', border: '1px solid #f1f5f9', borderLeft: t.completed ? '4px solid #10b981' : '4px solid #f59e0b' }}>
                              <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.25rem' }}>{t.dueDate ? `Due: ${t.dueDate}` : 'No due date'}</div>
                              <div style={{ fontSize: '0.95rem', fontWeight: 500, color: t.completed ? '#94a3b8' : '#334155', textDecoration: t.completed ? 'line-through' : 'none' }}>{t.text}</div>
                            </div>
                          ))
                        }
                      </div>
                    </div>
                  )}
                </div>

                <div style={{ position: 'relative' }}>
                  <button onClick={() => setShowMsgModal(!showMsgModal)}
                    className="btn-secondary"
                    style={{ padding: '0', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '12px', width: '45px', height: '45px', background: 'white', border: '1px solid #e2e8f0' }}>
                    <FaEnvelope style={{ fontSize: '1.2rem', color: '#64748b' }} />
                    {messages.length > 0 && <span style={{ position: 'absolute', top: '8px', right: '8px', width: '10px', height: '10px', background: '#ef4444', borderRadius: '50%', border: '2px solid #fff' }}></span>}
                  </button>
                  {showMsgModal && (
                    <div className="faculty-msg-dropdown" style={{
                      position: 'absolute', top: '55px', right: '0', width: '320px', background: 'white',
                      boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)', borderRadius: '16px', zIndex: 1000,
                      border: '1px solid #e2e8f0', overflow: 'hidden'
                    }}>
                      <div style={{ padding: '1.25rem', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', fontWeight: 'bold', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: '#1e293b' }}>Recent Notifications</span>
                        <span style={{ cursor: 'pointer', fontSize: '1.2rem', color: '#94a3b8' }} onClick={() => setShowMsgModal(false)}>&times;</span>
                      </div>
                      <div style={{ maxHeight: '350px', overflowY: 'auto', padding: '0.5rem' }}>
                        {messages.length === 0 ? <p style={{ padding: '2rem', color: '#94a3b8', fontStyle: 'italic', textAlign: 'center' }}>No messages yet.</p> :
                          messages.map((m, i) => (
                            <div key={i} style={{ padding: '1rem', marginBottom: '0.5rem', borderRadius: '10px', background: '#fff', border: '1px solid #f1f5f9' }}>
                              <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.25rem' }}>{new Date(m.date).toLocaleDateString()} • {new Date(m.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                              <div style={{ fontSize: '0.95rem', color: '#334155', lineHeight: '1.4' }}>{m.text}</div>
                            </div>
                          ))
                        }
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </header>

            <div
              onClick={() => setActiveContext('ai-assistant')}
              className="animate-fade-in"
              style={{
                background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 50%, #ec4899 100%)',
                borderRadius: '24px',
                padding: '2rem',
                marginBottom: '3rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                boxShadow: '0 20px 25px -5px rgba(99, 102, 241, 0.3), 0 10px 10px -5px rgba(99, 102, 241, 0.1)',
                color: 'white',
                position: 'relative',
                overflow: 'hidden'
              }}>
              <div style={{ position: 'absolute', top: '-10%', right: '-5%', width: '200px', height: '200px', background: 'rgba(255,255,255,0.1)', borderRadius: '50%', zIndex: 0 }}></div>
              <div style={{ position: 'absolute', bottom: '-20%', left: '10%', width: '150px', height: '150px', background: 'rgba(255,255,255,0.05)', borderRadius: '50%', zIndex: 0 }}></div>

              <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                  <span style={{ background: 'rgba(255,255,255,0.2)', padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>AI Powered</span>
                </div>
                <h2 style={{ margin: '0 0 0.5rem', fontSize: '1.8rem', fontWeight: 800 }}>Stuck with Lesson Planning?</h2>
                <p style={{ margin: 0, fontSize: '1rem', opacity: 0.9 }}>Ask Vu AI Agent for resources, research, or quiz questions in seconds.</p>
              </div>
              <div style={{ position: 'relative', zIndex: 1, background: 'rgba(255,255,255,0.2)', padding: '1rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FaRobot size={40} />
              </div>
            </div>

            <FacultyAnalytics myClasses={myClasses} materialsList={materialsList} facultyId={facultyData.facultyId} />

            <div className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <FaChalkboardTeacher style={{ color: '#4f46e5' }} />
              <h2 style={{ margin: 0, fontSize: '1.3rem', color: '#1e293b' }}>Active Teaching Classes</h2>
            </div>

            <div className="analytics-grid" style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '1.5rem',
              marginBottom: '3rem'
            }}>
              {myClasses.length === 0 ? (
                <div style={{
                  gridColumn: '1 / -1',
                  background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                  borderRadius: '16px',
                  padding: '2rem',
                  textAlign: 'center',
                  border: '2px dashed #f59e0b'
                }}>
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📚</div>
                  <h3 style={{ color: '#92400e', margin: '0 0 0.5rem 0' }}>No Classes Assigned Yet</h3>
                  <p style={{ color: '#78350f', margin: 0 }}>
                    Please contact the admin to assign subjects and sections to your account.
                  </p>
                </div>
              ) : (
                myClasses.map(cls => {
                  const sectionBreakdown = cls.sections.map(section => {
                    const count = studentsList.filter(s =>
                      String(s.year) === String(cls.year) &&
                      (String(s.section) === String(section) || s.section === section)
                    ).length;
                    return { section, count };
                  });

                  const totalStudents = sectionBreakdown.reduce((sum, s) => sum + s.count, 0);

                  return (
                    <div
                      key={cls.id}
                      className="info-card section-card-hover"
                      onClick={() => handleClassSelect(cls)}
                      style={{
                        background: 'white',
                        borderRadius: '16px',
                        padding: '1.5rem',
                        border: '1px solid #e2e8f0',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        minHeight: '240px',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                          <h3 style={{ margin: 0, color: '#1e293b', fontSize: '1.15rem', fontWeight: 700 }}>{cls.subject}</h3>
                          <FaBookOpen style={{ color: '#818cf8', opacity: 0.6 }} />
                        </div>

                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
                          <span className="badge-pill notes">Year {cls.year}</span>
                          <span className="badge-pill videos">{cls.sections.length} Section{cls.sections.length > 1 ? 's' : ''}</span>
                          <span className="badge-pill assignments" style={{ background: '#ecfdf5', color: '#10b981', fontWeight: 'bold' }}>
                            {totalStudents} Student{totalStudents !== 1 ? 's' : ''}
                          </span>
                        </div>

                        <div style={{
                          background: '#f8fafc',
                          borderRadius: '8px',
                          padding: '0.75rem',
                          marginBottom: '0.5rem'
                        }}>
                          <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.5rem', fontWeight: 600 }}>
                            SECTION BREAKDOWN:
                          </div>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                            {sectionBreakdown.map(({ section, count }) => (
                              <div key={section} style={{
                                background: count > 0 ? '#dbeafe' : '#f1f5f9',
                                color: count > 0 ? '#1e40af' : '#64748b',
                                padding: '0.25rem 0.5rem',
                                borderRadius: '6px',
                                fontSize: '0.75rem',
                                fontWeight: 600
                              }}>
                                Sec {section}: {count}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '1rem' }}>
                        <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 500 }}>Management Hub</span>
                        <button className="btn-secondary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', borderRadius: '6px' }}>Open Desk</button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="faculty-profile-section animate-fade-in" style={{ marginTop: '3rem', background: '#fff', borderRadius: '16px', padding: '2rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
              <h3 style={{ fontSize: '1.2rem', color: '#334155', marginBottom: '1.5rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '1rem' }}>Faculty Profile Details</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem' }}>
                <div>
                  <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Full Name</div>
                  <div style={{ fontSize: '1.1rem', color: '#1e293b', fontWeight: 600 }}>{facultyData.name}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Faculty ID</div>
                  <div style={{ fontSize: '1.1rem', color: '#1e293b', fontWeight: 600 }}>{facultyData.facultyId}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Email Address</div>
                  <div style={{ fontSize: '1.1rem', color: '#1e293b', fontWeight: 600 }}>{facultyData.email || 'N/A'}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Department</div>
                  <div style={{ fontSize: '1.1rem', color: '#1e293b', fontWeight: 600 }}>Computer Science (CSE)</div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="class-workspace animate-fade-in">
            <button className="back-btn" onClick={() => setActiveContext(null)}>
              ← Back to Dashboard
            </button>
            <header className="workspace-header-glass">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%' }}>
                <div>
                  <h1 style={{ margin: 0, fontSize: '2.2rem', fontWeight: 800, color: '#1e293b' }}>{activeContext.subject}</h1>
                  <div className="breadcrumbs" style={{ marginTop: '0.5rem', fontWeight: 500 }}>
                    <span style={{ color: '#4f46e5' }}>Year {activeContext.year}</span>
                    <span style={{ margin: '0 0.5rem', opacity: 0.3 }}>•</span>
                    <span>Sections: {activeContext.sections.join(', ')}</span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setMsgTarget({ year: activeContext.year, subject: activeContext.subject, sections: activeContext.sections });
                    setShowSendModal(true);
                  }}
                  className="btn-primary"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderRadius: '12px', padding: '0.8rem 1.5rem', boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)' }}
                >
                  <FaEnvelope /> Broadcast Message
                </button>
              </div>
            </header>

            {showSendModal && (
              <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', width: '500px', maxWidth: '95%' }}>
                  <h2>Send Message to Class</h2>
                  <p style={{ marginBottom: '1rem', color: '#64748b' }}>Target: Year {msgTarget.year} - {msgTarget.subject}</p>
                  <textarea id="facMsgText" rows="5" placeholder="Type your message here..." style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '1rem' }} />
                  <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                    <button onClick={() => setShowSendModal(false)} className="btn-secondary" style={{ padding: '0.5rem 1rem' }}>Cancel</button>
                    <button onClick={handleSendMessage} className="btn-primary" style={{ padding: '0.5rem 1rem' }}>Send Broadcast</button>
                  </div>
                </div>
              </div>
            )}

            <div className="section-selector-card animate-slide-in" style={{ marginBottom: '2.5rem', padding: '2rem', background: '#ffffff', borderRadius: '24px', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px -5px rgba(0,0,0,0.05)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                <div style={{ padding: '0.4rem', background: '#fef3c7', borderRadius: '8px', color: '#d97706', display: 'flex', alignItems: 'center' }}>
                  <FaLayerGroup size={16} />
                </div>
                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Target Audience</h3>
              </div>

              <div className="pill-group" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.8rem' }}>
                <button
                  className={`section-pill ${selectedSections.length === activeContext.sections.length ? 'active' : ''}`}
                  onClick={() => selectedSections.length === activeContext.sections.length ? setSelectedSections([]) : setSelectedSections([...activeContext.sections])}
                  style={{ padding: '0.75rem 1.5rem', borderRadius: '50px', border: '1px solid #e2e8f0', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600 }}
                >
                  🏫 All Sections
                </button>
                {activeContext.sections.map(sec => (
                  <button
                    key={sec}
                    className={`section-pill ${selectedSections.includes(sec) ? 'active' : ''}`}
                    onClick={() => toggleSection(sec)}
                    style={{ padding: '0.75rem 1.5rem', borderRadius: '50px', border: '1px solid #e2e8f0', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600 }}
                  >
                    📍 Section {sec}
                  </button>
                ))}
              </div>
            </div>

            {selectedSections.length > 0 ? (
              <div className="manager-wrapper">
                <MaterialManager
                  selectedSubject={`${activeContext.subject} - Year ${activeContext.year}`}
                  selectedSections={selectedSections}
                  facultyToken={facultyToken}
                  onUploadSuccess={refreshMaterials}
                />

                <div className="content-tree-section animate-fade-in">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                    <div style={{ padding: '0.8rem', background: '#e0e7ff', borderRadius: '12px', color: '#4338ca' }}>
                      <FaChalkboardTeacher size={24} />
                    </div>
                    <div>
                      <h2 style={{ margin: 0, fontSize: '1.5rem', color: '#1e293b' }}>Course Content Library</h2>
                      <p style={{ margin: 0, color: '#64748b' }}>Browse all uploaded materials for this subject</p>
                    </div>
                  </div>

                  {(() => {
                    const courseMaterials = materialsList.filter(m =>
                      (m.subject === activeContext.subject || m.subject.includes(activeContext.subject)) &&
                      String(m.year) === String(activeContext.year)
                    );

                    if (courseMaterials.length === 0) return <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8', fontStyle: 'italic' }}>No materials uploaded yet.</div>;

                    const grouped = courseMaterials.reduce((acc, m) => {
                      const mod = m.module ? `Module ${m.module}` : 'General Resources';
                      if (!acc[mod]) acc[mod] = {};
                      const unit = m.unit ? `Unit ${m.unit}` : 'General';
                      if (!acc[mod][unit]) acc[mod][unit] = [];
                      acc[mod][unit].push(m);
                      return acc;
                    }, {});

                    return Object.keys(grouped).sort().map(moduleName => (
                      <div key={moduleName} className="tree-module" style={{ background: '#fcfcfd', borderRadius: '16px', padding: '1.5rem', border: '1px solid #f1f5f9', marginBottom: '2.5rem' }}>
                        <div className="tree-module-header" style={{ borderBottom: '2px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700 }}>
                            <FaLayerGroup style={{ color: '#6366f1' }} />
                            {moduleName}
                          </span>
                        </div>
                        {Object.keys(grouped[moduleName]).sort().map(unitName => (
                          <div key={unitName} className="tree-unit" style={{ marginTop: '1rem' }}>
                            <div className="tree-unit-title" style={{ color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#cbd5e1' }} />
                              {unitName !== 'General' ? unitName : 'Resources'}
                            </div>
                            <div className="tree-files-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
                              {grouped[moduleName][unitName].map(file => (
                                <a
                                  key={file.id}
                                  href={file.url.startsWith('http') ? file.url : `http://localhost:5000${file.url}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="tree-file-card"
                                  style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', background: 'white', borderRadius: '12px', border: '1px solid #f1f5f9' }}
                                >
                                  <div style={{ padding: '0.6rem', background: '#f8fafc', borderRadius: '10px' }}>
                                    {file.type === 'videos' ? <FaLayerGroup style={{ color: '#10b981' }} /> : <FaFileAlt style={{ color: '#3b82f6' }} />}
                                  </div>
                                  <div style={{ overflow: 'hidden' }}>
                                    <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#334155', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{file.title}</div>
                                    <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{file.type}</div>
                                  </div>
                                </a>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    ));
                  })()}
                </div>
              </div>
            ) : (
              <div className="select-prompt" style={{ textAlign: 'center', padding: '4rem', color: '#64748b' }}>
                <p>Please select at least one section above to start managing content.</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

FacultyDashboard.propTypes = {
  facultyData: PropTypes.object.isRequired,
  setIsAuthenticated: PropTypes.func.isRequired,
  setIsFaculty: PropTypes.func.isRequired,
};

export default FacultyDashboard;
