import React, { useState } from 'react';
import PropTypes from 'prop-types';
import './LoginRegister.css';
import api from '../../utils/apiClient';
import { FaUserGraduate, FaChalkboardTeacher, FaUserShield, FaArrowLeft, FaEye, FaEyeSlash, FaRocket, FaLock } from 'react-icons/fa';

const LoginRegister = ({ setIsAuthenticated, setStudentData, setIsAdmin, setIsFaculty, setFacultyData }) => {
  const [formToShow, setFormToShow] = useState('selection');

  // Login states
  const [loginId, setLoginId] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Password Reset State


  // Standard Section Options: A-P and 1-20
  const alphaSections = Array.from({ length: 16 }, (_, i) => String.fromCharCode(65 + i));
  const numSections = Array.from({ length: 20 }, (_, i) => String(i + 1));
  const SECTION_OPTIONS = [...alphaSections, ...numSections];
  const [showLoginPass, setShowLoginPass] = useState(false);
  const [showRegPass, setShowRegPass] = useState(false);
  const AVATAR_URL_PREFIX = 'https://api.dicebear.com/7.x/avataaars/svg?seed=';
  const [selectedAvatar, setSelectedAvatar] = useState(AVATAR_URL_PREFIX + 'Felix');

  const handleBack = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setLoginId('');
    setLoginPassword('');
    setFormToShow('selection');
  };

  const handleLogin = async (e, userType) => {
    e.preventDefault();
    try {
      if (userType === 'admin') {
        try {
          console.log('[Login] Attempting admin login...');
          const resp = await api.adminLogin(loginId, loginPassword);
          console.log('[Login] Admin login response:', { hasToken: !!resp?.token, hasData: !!resp });

          if (resp && resp.token) {
            // Save admin token to localStorage
            window.localStorage.setItem('adminToken', resp.token);
            console.log('[Login] Admin token saved to localStorage:', resp.token.substring(0, 10) + '...');

            // Save user data
            const adminData = {
              role: 'admin',
              name: resp.adminData?.name || 'Administrator',
              adminId: resp.adminData?.adminId || loginId
            };
            localStorage.setItem('userData', JSON.stringify(adminData));
            console.log('[Login] Admin userData saved:', adminData);

            // Verify token was saved
            const savedToken = window.localStorage.getItem('adminToken');
            if (savedToken === resp.token) {
              console.log('[Login] ✅ Token verified in localStorage');
            } else {
              console.error('[Login] ❌ Token verification failed!');
            }

            setIsAuthenticated(true);
            setIsAdmin(true);
            console.log('[Login] Admin authentication successful');
            return;
          }
          alert('Invalid admin credentials');
        } catch (error) {
          console.error('[Login] Admin login error:', error);
          alert(`Admin login failed: ${error.message}`);
        }
        return;
      }

      if (userType === 'faculty') {
        try {
          const resp = await api.facultyLogin(loginId, loginPassword);
          if (resp && resp.token) {
            window.localStorage.setItem('facultyToken', resp.token);
            localStorage.setItem('userData', JSON.stringify({ ...resp.facultyData, role: 'faculty' }));
            setIsAuthenticated(true);
            setIsFaculty(true);
            setFacultyData(resp.facultyData);
            return;
          }
          alert('Invalid faculty credentials');
        } catch (error) {
          console.error('Faculty login error:', error);
          alert(`Faculty login failed: ${error.message}`);
        }
        return;
      }

      if (userType === 'student') {
        const idTrim = String(loginId || '').trim();
        const passTrim = String(loginPassword || '').trim();
        try {
          const students = await api.apiGet('/api/students');
          const foundStudent = (students || []).find(s => ((s.sid && String(s.sid).trim() === idTrim) || (s.email && String(s.email).trim().toLowerCase() === idTrim.toLowerCase())) && String(s.password || '') === passTrim);
          if (foundStudent) {
            setIsAuthenticated(true);
            setStudentData(foundStudent);
            localStorage.setItem('userData', JSON.stringify({ ...foundStudent, role: 'student' }));
            return;
          }
          alert('Invalid student credentials');
        } catch (error) {
          console.error('Student login error:', error);
          alert(`Student login failed: ${error.message}`);
        }
        return;
      }

    } catch (err) {
      console.error('Login failed', err);
      alert('Login error occurred');
    }
  };

  const renderForm = () => {
    switch (formToShow) {
      case 'studentLogin':
        return (
          <form onSubmit={(e) => handleLogin(e, 'student')} className="login-form animate-slide-up">
            <button type="button" className="back-circle-btn" onClick={handleBack}><FaArrowLeft /></button>
            <div className="form-header">
              <div className="form-icon-header student"><FaUserGraduate /></div>
              <h2>Student Login</h2>
              <p>Welcome back to your learning space.</p>
            </div>
            <div className="input-group">
              <div className="glass-input-wrapper">
                <input type="text" placeholder="Student ID or Email" value={loginId} onChange={(e) => setLoginId(e.target.value)} required />
              </div>
              <div className="glass-input-wrapper">
                <input
                  type={showLoginPass ? "text" : "password"}
                  placeholder="Password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  required
                />
                <span className="pass-toggle" onClick={() => setShowLoginPass(!showLoginPass)}>
                  {showLoginPass ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>
            </div>
            <div className="form-actions">
              <span onClick={() => setFormToShow('forgotPassword')} className="forgot-link">Forgot Password?</span>
            </div>
            <button type="submit" className="btn-primary-glow">Login to Dashboard</button>
            <p className="form-footer-note">New here? <span onClick={() => setFormToShow('studentRegister')}>Create account</span></p>
          </form>
        );

      case 'facultyLogin':
        return (
          <form onSubmit={(e) => handleLogin(e, 'faculty')} className="login-form animate-slide-up">
            <button type="button" className="back-circle-btn" onClick={handleBack}><FaArrowLeft /></button>
            <div className="form-header">
              <div className="form-icon-header faculty"><FaChalkboardTeacher /></div>
              <h2>Faculty Access</h2>
              <p>Sign in to manage your students and materials.</p>
            </div>
            <div className="input-group">
              <div className="glass-input-wrapper">
                <input type="text" placeholder="Faculty ID" value={loginId} onChange={(e) => setLoginId(e.target.value)} required />
              </div>
              <div className="glass-input-wrapper">
                <input
                  type={showLoginPass ? "text" : "password"}
                  placeholder="Password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  required
                />
                <span className="pass-toggle" onClick={() => setShowLoginPass(!showLoginPass)}>
                  {showLoginPass ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>
            </div>
            <button type="submit" className="btn-primary-glow">Enter Faculty Portal</button>
          </form>
        );

      case 'adminLogin':
        return (
          <form onSubmit={(e) => handleLogin(e, 'admin')} className="login-form animate-slide-up">
            <button type="button" className="back-circle-btn" onClick={handleBack}><FaArrowLeft /></button>
            <div className="form-header">
              <div className="form-icon-header admin"><FaUserShield /></div>
              <h2>Admin Panel</h2>
              <p>System administrative access only.</p>
            </div>
            <div className="input-group">
              <div className="glass-input-wrapper">
                <input type="text" placeholder="Administrator ID" value={loginId} onChange={(e) => setLoginId(e.target.value)} required />
              </div>
              <div className="glass-input-wrapper">
                <input
                  type={showLoginPass ? "text" : "password"}
                  placeholder="Master Password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  required
                />
                <span className="pass-toggle" onClick={() => setShowLoginPass(!showLoginPass)}>
                  {showLoginPass ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>
            </div>
            <button type="submit" className="btn-primary-glow">Authorize Access</button>
          </form>
        );

      case 'studentRegister':
        const handleRegSubmit = async (ev) => {
          ev.preventDefault();
          const form = ev.target;
          const payload = {
            studentName: form.studentName.value.trim(),
            sid: form.sid.value.trim(),
            email: form.email.value.trim(),
            year: form.year.value.trim(),
            section: form.section.value.trim(),
            branch: form.branch.value.trim(),
            password: form.password.value.trim() || 'changeme',
            profilePic: selectedAvatar
          };
          try {
            const response = await api.apiPost('/api/students', payload);
            alert('Welcome! Your account is ready.');
            setIsAuthenticated(true);
            setStudentData(response);
            localStorage.setItem('userData', JSON.stringify({ ...response, role: 'student' }));
          } catch (error) {
            alert('Registration failed: ' + error.message);
          }
        };

        return (
          <form onSubmit={handleRegSubmit} className="login-form animate-slide-up wide">
            <button type="button" className="back-circle-btn" onClick={handleBack}><FaArrowLeft /></button>
            <div className="form-header">
              <h2>Join the Future</h2>
              <p>Create your modern student profile</p>
            </div>

            <div className="avatar-selection-modern">
              {['Felix', 'Aneka', 'Bob', 'Caitlyn', 'Dieter'].map(seed => (
                <img
                  key={seed}
                  src={AVATAR_URL_PREFIX + seed}
                  className={selectedAvatar === (AVATAR_URL_PREFIX + seed) ? 'active' : ''}
                  onClick={() => setSelectedAvatar(AVATAR_URL_PREFIX + seed)}
                  alt="avatar"
                />
              ))}
            </div>

            <div className="input-grid-modern">
              <input name="studentName" placeholder="Full Name" required />
              <input name="sid" placeholder="Student ID" required />
              <input name="email" placeholder="Email Address" type="email" />
              <input name="branch" placeholder="Branch (e.g. CSE)" />
              <input name="year" placeholder="Year (1-4)" />
              <select name="section" required>
                <option value="">Select Section</option>
                {SECTION_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <div className="full-width-input glass-input-wrapper">
                <input name="password" type={showRegPass ? "text" : "password"} placeholder="Choose Password" />
                <span className="pass-toggle" onClick={() => setShowRegPass(!showRegPass)}>
                  {showRegPass ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>
            </div>
            <button type="submit" className="btn-primary-glow">Get Started 🚀</button>
          </form>
        );

      case 'forgotPassword':
        return (
          <form onSubmit={(e) => { e.preventDefault(); alert("Feature coming soon!"); setFormToShow('studentLogin'); }} className="login-form animate-slide-up">
            <button type="button" className="back-circle-btn" onClick={() => setFormToShow('studentLogin')}><FaArrowLeft /></button>
            <div className="form-header">
              <div className="form-icon-header"><FaLock /></div>
              <h2>Recovery</h2>
              <p>Enter your email to reclaim access.</p>
            </div>
            <div className="input-group">
              <input type="email" placeholder="Recovery Email" required />
            </div>
            <button type="submit" className="btn-primary-glow">Send Recovery Link</button>
          </form>
        );

      default:
        return (
          <div className="selection-screen-modern animate-fade-in">
            <div className="glass-logo-box animate-slide-down">
              <FaRocket className="logo-icon" />
              <span className="logo-text">Friendly Notebook</span>
            </div>

            <h1 className="hero-title animate-blur-in">Your Friendly <br /> Academic Space</h1>
            <p className="hero-subtitle animate-fade-in-up">The premium academic ecosystem for Vignan University's brightest minds.</p>

            <div className="modern-role-grid">
              <div className="modern-role-card student animate-stagger-1" onClick={() => setFormToShow('studentLogin')}>
                <div className="role-icon-box"><FaUserGraduate /></div>
                <div className="role-content">
                  <h3>Student</h3>
                  <p>Notes, Analytics & More</p>
                </div>
              </div>

              <div className="modern-role-card faculty animate-stagger-2" onClick={() => setFormToShow('facultyLogin')}>
                <div className="role-icon-box"><FaChalkboardTeacher /></div>
                <div className="role-content">
                  <h3>Faculty</h3>
                  <p>Curriculum Management</p>
                </div>
              </div>

              <div className="modern-role-card admin animate-stagger-3" onClick={() => setFormToShow('adminLogin')}>
                <div className="role-icon-box"><FaUserShield /></div>
                <div className="role-content">
                  <h3>Admin</h3>
                  <p>Organization Control</p>
                </div>
              </div>
            </div>

            <div className="selection-footer animate-fade-in" style={{ animationDelay: '0.8s' }}>
              <p>Empowering the Next Generation of Engineers</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="modern-auth-wrapper">
      <div className="animated-mesh-bg"></div>
      <div className="floating-symbols">
        <div className="sym sym-1">📚</div>
        <div className="sym sym-2">🧪</div>
        <div className="sym sym-3">💻</div>
      </div>
      <div className={`auth-card-container ${formToShow !== 'selection' ? 'form-mode' : ''}`}>
        {renderForm()}
      </div>
    </div>
  );
};

LoginRegister.propTypes = {
  setIsAuthenticated: PropTypes.func.isRequired,
  setStudentData: PropTypes.func.isRequired,
  setIsAdmin: PropTypes.func.isRequired,
  setIsFaculty: PropTypes.func.isRequired,
  setFacultyData: PropTypes.func.isRequired,
};

export default LoginRegister;