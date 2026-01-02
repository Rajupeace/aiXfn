import React, { useState, useEffect } from 'react';
import {
  FaUserGraduate, FaChalkboardTeacher, FaBook, FaFileAlt,
  FaClipboardList, FaEnvelope, FaSignOutAlt, FaPlus, FaTrash,
  FaEdit, FaSearch, FaHome, FaDownload, FaRocket, FaRobot,
  FaChartLine, FaCheckCircle, FaTimesCircle, FaUpload, FaBars
} from 'react-icons/fa';
import './AdminDashboard.css';
import { AdminModal } from './AdminModals';
import api from '../../utils/apiClient';
import AdminExamStats from './AdminExamStats';

// Helper for mocked API or local storage check
const USE_API = true;

export default function AdminDashboard({ setIsAuthenticated, setIsAdmin, setStudentData }) {
  const [activeSection, setActiveSection] = useState('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Data States
  const [students, setStudents] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [courses, setCourses] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [todos, setTodos] = useState([]);
  const [messages, setMessages] = useState([]);

  // Search States
  const [searchTerm, setSearchTerm] = useState('');

  // Form States
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(null);
  const [editItem, setEditItem] = useState(null);

  // Load Initial Data
  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      if (USE_API) {
        let [s, f, c, m, msg] = await Promise.all([
          api.apiGet('/api/students'),
          api.apiGet('/api/faculty'),
          api.apiGet('/api/courses'),
          api.apiGet('/api/materials'),
          api.apiGet('/api/messages')
        ]);
        setStudents(Array.isArray(s) ? s : []);
        setFaculty(Array.isArray(f) ? f : []);
        setCourses(Array.isArray(c) ? c : []);
        setMaterials(Array.isArray(m) ? m : []);
        setMessages(Array.isArray(msg) ? msg : []);
      }
    } catch (err) {
      console.error('Data load error', err);
    }
  };

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to sign out?")) {
      setIsAuthenticated(false);
      setIsAdmin(false);
      setStudentData(null);
      localStorage.removeItem('adminToken');
      window.location.href = '/';
    }
  };

  const handleDelete = async (type, id) => {
    if (!window.confirm(`Delete this ${type}?`)) return;
    try {
      if (type === 'student') {
        await api.apiDelete(`/api/students/${id}`);
        const newS = students.filter(s => s.sid !== id);
        setStudents(newS);
      } else if (type === 'faculty') {
        const fac = faculty.find(f => f.facultyId === id);
        await api.apiDelete(`/api/faculty/${fac._id || id}`);
        setFaculty(faculty.filter(f => f.facultyId !== id));
      } else if (type === 'course') {
        await api.apiDelete(`/api/courses/${id}`);
        setCourses(courses.filter(c => c.id !== id));
      } else if (type === 'material') {
        const mat = materials.find(m => m.id === id);
        await api.apiDelete(`/api/materials/${mat?._id || id}`);
        setMaterials(materials.filter(m => m.id !== id));
      }
      alert(`${type} deleted successfully`);
    } catch (e) {
      console.error(e);
      alert(`Failed to delete ${type}`);
    }
  };

  // Centralized Save Handler for Modals
  const handleModalSave = async (type, formData) => {
    // Convert FormData to plain object for JSON based endpoints where possible
    const data = {};
    formData.forEach((value, key) => data[key] = value);

    if (type === 'student') {
      if (editItem) {
        await api.apiPut(`/api/students/${editItem.sid}`, data);
        setStudents(students.map(s => s.sid === editItem.sid ? { ...s, ...data } : s));
      } else {
        const res = await api.apiPost('/api/students', data);
        if (res) setStudents([...students, res.data || res]);
        loadData(); // Reload to be safe
      }
      alert('Student saved successfully');
    }
    else if (type === 'faculty') {
      if (editItem) {
        const facId = editItem._id || editItem.facultyId;
        await api.apiPut(`/api/faculty/${facId}`, data);
        loadData();
      } else {
        const res = await api.apiPost('/api/faculty', data);
        if (res) setFaculty([...faculty, res.data || res]);
        loadData();
      }
      alert('Faculty saved successfully');
    }
    else if (type === 'course') {
      await api.apiPost('/api/courses', data);
      loadData();
      alert('Course created successfully');
    }
    else if (type === 'material') {
      const isFileUpload = formData.get('file')?.size > 0;

      let res;
      if (isFileUpload) {
        formData.append('uploadedBy', 'admin');
        res = await api.apiUpload('/api/materials', formData);
      } else {
        data.uploadedBy = 'admin';
        res = await api.apiPost('/api/materials', data);
      }

      const m = await api.apiGet('/api/materials');
      setMaterials(m || []);
      alert('Material uploaded successfully');
    }
    else if (type === 'message') {
      const payload = {
        message: data.message,
        target: data.target,
        type: 'announcement',
        date: new Date().toISOString()
      };
      await api.apiPost('/api/messages', payload);
      alert('Announcement sent');
    }

    setShowModal(false);
    setEditItem(null);
  };

  // --- Renderers ---
  const renderSidebar = () => (
    <aside className={`ad-sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
      <div className="ad-brand">
        <div className="ad-logo-icon"><FaRobot /></div>
        <h2>Admin<span style={{ color: 'var(--primary)' }}>Console</span></h2>
      </div>

      <nav className="ad-nav">
        <SidebarItem id="overview" icon={<FaHome />} label="Overview" />
        <SidebarItem id="students" icon={<FaUserGraduate />} label="Students" />
        <SidebarItem id="faculty" icon={<FaChalkboardTeacher />} label="Faculty & Staff" />
        <SidebarItem id="courses" icon={<FaBook />} label="Course Manager" />
        <SidebarItem id="materials" icon={<FaFileAlt />} label="Study Materials" />
        <SidebarItem id="exams" icon={<FaClipboardList />} label="Exam Results" />
        <SidebarItem id="messages" icon={<FaEnvelope />} label="Announcements" />
      </nav>

      <div className="ad-footer">
        <button className="ad-logout-btn" onClick={handleLogout}>
          <FaSignOutAlt /> {!sidebarCollapsed && 'Sign Out'}
        </button>
      </div>
    </aside>
  );

  const SidebarItem = ({ id, icon, label }) => (
    <div
      className={`ad-nav-item ${activeSection === id ? 'active' : ''}`}
      onClick={() => setActiveSection(id)}
    >
      <div className="ad-nav-icon">{icon}</div>
      <span className="ad-nav-label">{label}</span>
      {activeSection === id && <div className="active-pip" />}
    </div>
  );

  const StatCard = ({ icon, label, value, color }) => (
    <div className="ad-stat-card">
      <div className={`ad-stat-icon ${color}`}>{icon}</div>
      <div className="ad-stat-info">
        <h3>{value}</h3>
        <p>{label}</p>
      </div>
    </div>
  );

  const renderOverview = () => (
    <div className="animate-slide-up">
      <div className="ad-stats-grid">
        <StatCard icon={<FaUserGraduate />} label="Total Students" value={students.length} color="primary" />
        <StatCard icon={<FaChalkboardTeacher />} label="Faculty Members" value={faculty.length} color="success" />
        <StatCard icon={<FaBook />} label="Active Courses" value={courses.length} color="warning" />
        <StatCard icon={<FaChartLine />} label="System Traffic" value="98%" color="danger" />
      </div>

      <div className="ad-system-widget">
        <div className="ad-widget-header">
          <h3>System Health & Performance</h3>
          <span style={{ background: '#dcfce7', color: '#166534', padding: '4px 12px', borderRadius: '100px', fontSize: '0.8rem', fontWeight: '700' }}>
            <FaCheckCircle style={{ marginRight: '6px' }} /> All Systems Operational
          </span>
        </div>
        <div className="ad-health-grid">
          <div className="ad-health-item">
            <span style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: '600' }}>Server CPU Load</span>
            <div className="ad-prog-track"><div className="ad-prog-fill" style={{ width: '24%' }}></div></div>
            <span style={{ fontSize: '0.8rem', textAlign: 'right', fontWeight: '700' }}>24%</span>
          </div>
          <div className="ad-health-item">
            <span style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: '600' }}>Memory Usage</span>
            <div className="ad-prog-track"><div className="ad-prog-fill" style={{ width: '45%', background: '#8b5cf6' }}></div></div>
            <span style={{ fontSize: '0.8rem', textAlign: 'right', fontWeight: '700' }}>45%</span>
          </div>
          <div className="ad-health-item">
            <span style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: '600' }}>Database Connections</span>
            <div className="ad-prog-track"><div className="ad-prog-fill" style={{ width: '12%', background: '#10b981' }}></div></div>
            <span style={{ fontSize: '0.8rem', textAlign: 'right', fontWeight: '700' }}>Active</span>
          </div>
        </div>
      </div>

      <div className="ad-section-card">
        <h3>Quick Actions</h3>
        <div className="ad-quick-actions">
          <div className="ad-action-btn" onClick={() => { setModalType('student'); setShowModal(true); }}>
            <FaUserGraduate /> Add Student
          </div>
          <div className="ad-action-btn" onClick={() => { setModalType('faculty'); setShowModal(true); }}>
            <FaChalkboardTeacher /> Add Faculty
          </div>
          <div className="ad-action-btn" onClick={() => { setModalType('course'); setShowModal(true); }}>
            <FaBook /> New Course
          </div>
          <div className="ad-action-btn" onClick={() => { setModalType('message'); setShowModal(true); }}>
            <FaEnvelope /> Announcement
          </div>
        </div>
      </div>
    </div>
  );

  const renderStudentsTable = () => (
    <div className="ad-section-card animate-slide-up">
      <div className="ad-controls">
        <div className="ad-search">
          <FaSearch color="#cbd5e1" />
          <input placeholder="Search students..." onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
        <button className="ad-btn-primary" onClick={() => { setModalType('student'); setShowModal(true); }}>
          <FaPlus /> Add Student
        </button>
      </div>
      <div className="ad-table-wrapper">
        <table className="ad-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Branch</th>
              <th>Year</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {students.filter(s => s.studentName?.toLowerCase().includes(searchTerm.toLowerCase())).map(student => (
              <tr key={student.sid}>
                <td><span style={{ fontFamily: 'monospace', fontWeight: '600' }}>{student.sid}</span></td>
                <td>{student.studentName}</td>
                <td><span className="badge">{student.branch}</span></td>
                <td>{student.year}</td>
                <td>
                  <div style={{ display: 'flex' }}>
                    <FaTrash className="ad-action-icon delete" onClick={() => handleDelete('student', student.sid)} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderFacultyTable = () => (
    <div className="ad-section-card animate-slide-up">
      <div className="ad-controls">
        <div className="ad-search">
          <FaSearch color="#cbd5e1" />
          <input placeholder="Search faculty..." />
        </div>
        <button className="ad-btn-primary" onClick={() => { setModalType('faculty'); setShowModal(true); }}>
          <FaPlus /> Add Faculty
        </button>
      </div>
      <div className="ad-table-wrapper">
        <table className="ad-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Department</th>
              <th>Email</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {faculty.map(f => (
              <tr key={f.facultyId}>
                <td>{f.facultyId}</td>
                <td>{f.name}</td>
                <td>{f.department}</td>
                <td>{f.email}</td>
                <td>
                  <FaTrash className="ad-action-icon delete" onClick={() => handleDelete('faculty', f.facultyId)} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="admin-dashboard-container">
      {renderSidebar()}

      <main className="ad-main">
        <header className="ad-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              style={{
                background: 'transparent',
                border: 'none',
                fontSize: '1.4rem',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <FaBars />
            </button>
            <div className="ad-header-title">
              <h1>{activeSection.charAt(0).toUpperCase() + activeSection.slice(1)}</h1>
            </div>
          </div>
          <div className="ad-user-profile">
            <div className="ad-avatar">A</div>
            <span style={{ fontWeight: '600', fontSize: '0.9rem' }}>Administrator</span>
          </div>
        </header>

        <div className="ad-content-scroll">
          {activeSection === 'overview' && renderOverview()}
          {activeSection === 'students' && renderStudentsTable()}
          {activeSection === 'faculty' && renderFacultyTable()}
          {activeSection === 'exams' && <AdminExamStats />}
          {activeSection === 'courses' && (
            <div className="ad-section-card">
              <div className="ad-controls">
                <button className="ad-btn-primary" onClick={() => { setModalType('course'); setShowModal(true); }}>
                  <FaPlus /> Add Course
                </button>
              </div>
              <table className="ad-table">
                <thead>
                  <tr><th>Code</th><th>Name</th><th>Branch</th><th>Credits</th><th>Action</th></tr>
                </thead>
                <tbody>
                  {courses.map(c => (
                    <tr key={c.id}>
                      <td>{c.code}</td>
                      <td>{c.name}</td>
                      <td>{c.branch}</td>
                      <td>{c.credits}</td>
                      <td><FaTrash className="ad-action-icon delete" onClick={() => handleDelete('course', c.id)} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {activeSection === 'materials' && (
            <div className="ad-section-card">
              <div className="ad-controls">
                <button className="ad-btn-primary" onClick={() => { setModalType('material'); setShowModal(true); }}>
                  <FaUpload /> Upload Material
                </button>
              </div>
              <table className="ad-table">
                <thead>
                  <tr><th>Title</th><th>Subject</th><th>Type</th><th>Year</th><th>Action</th></tr>
                </thead>
                <tbody>
                  {materials.map(m => (
                    <tr key={m.id}>
                      <td>{m.title}</td>
                      <td>{m.subject}</td>
                      <td>{m.type}</td>
                      <td>{m.year}</td>
                      <td><FaTrash className="ad-action-icon delete" onClick={() => handleDelete('material', m.id)} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeSection === 'messages' && (
            <div className="ad-section-card">
              <h3>Announcements</h3>
              <div className="ad-controls">
                <button className="ad-btn-primary" onClick={() => { setModalType('message'); setShowModal(true); }}>
                  <FaPlus /> New Announcement
                </button>
              </div>
              <table className="ad-table">
                <thead>
                  <tr><th>Date</th><th>Message</th><th>Target</th></tr>
                </thead>
                <tbody>
                  {messages.map(m => (
                    <tr key={m.id || Math.random()}>
                      <td>{new Date(m.date).toLocaleDateString()}</td>
                      <td>{m.message}</td>
                      <td>{m.target}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {showModal && (
        <AdminModal
          type={modalType}
          editItem={editItem}
          onClose={() => setShowModal(false)}
          onSave={handleModalSave}
        />
      )}
    </div>
  );
}
