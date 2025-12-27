import React, { useState, useEffect } from 'react';
import { FaLock, FaUser, FaEnvelope, FaIdCard, FaBuilding, FaUserTie } from 'react-icons/fa';
import { apiPost, apiGet } from '../../utils/apiClient';
import './FacultyDashboard.css'; // Reuse faculty styles

const FacultySettings = ({ facultyData }) => {
    const [activeTab, setActiveTab] = useState('profile');
    const [profile, setProfile] = useState({
        name: facultyData.name || '',
        email: facultyData.email || '',
        facultyId: facultyData.facultyId || '',
        department: facultyData.department || 'CSE',
        designation: facultyData.designation || 'Faculty'
    });

    const [passwords, setPasswords] = useState({
        current: '',
        new: '',
        confirm: ''
    });

    const [isLoading, setIsLoading] = useState(false);

    const handleProfileChange = (e) => {
        setProfile({ ...profile, [e.target.name]: e.target.value });
    };

    const handlePassChange = (e) => {
        setPasswords({ ...passwords, [e.target.name]: e.target.value });
    };

    const saveProfile = async (e) => {
        e.preventDefault();
        // In a real app, call API to update profile
        alert("Profile update simulation: Saved!");
    };

    const changePassword = async (e) => {
        e.preventDefault();
        if (passwords.new !== passwords.confirm) {
            alert("New passwords do not match");
            return;
        }
        // Call API to change password
        // For now, mock it or use a placeholder endpoint
        alert("Password change simulation: Success!");
        setPasswords({ current: '', new: '', confirm: '' });
    };

    return (
        <div className="settings-container animate-fade-in" style={{ padding: '2rem', maxWidth: '1000px' }}>
            <div style={{ marginBottom: '2.5rem' }}>
                <h2 style={{ fontSize: '1.8rem', color: '#1e293b', fontWeight: 800, margin: '0 0 0.5rem 0' }}>Account Settings</h2>
                <p style={{ color: '#64748b', margin: 0 }}>Manage your profile information and security preferences</p>
            </div>

            <div className="glass-panel-light" style={{ padding: '0', overflow: 'hidden', border: '1px solid #e2e8f0', borderRadius: '20px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)' }}>
                <div className="settings-tabs" style={{ display: 'flex', background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                    <button
                        className={`tab-pill ${activeTab === 'profile' ? 'active' : ''}`}
                        onClick={() => setActiveTab('profile')}
                        style={{
                            flex: 1,
                            padding: '1.25rem',
                            border: 'none',
                            background: activeTab === 'profile' ? 'white' : 'transparent',
                            color: activeTab === 'profile' ? '#4f46e5' : '#64748b',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.75rem',
                            transition: 'all 0.2s',
                            borderBottom: activeTab === 'profile' ? '3px solid #4f46e5' : '3px solid transparent'
                        }}
                    >
                        <FaUser /> Profile Details
                    </button>
                    <button
                        className={`tab-pill ${activeTab === 'password' ? 'active' : ''}`}
                        onClick={() => setActiveTab('password')}
                        style={{
                            flex: 1,
                            padding: '1.25rem',
                            border: 'none',
                            background: activeTab === 'password' ? 'white' : 'transparent',
                            color: activeTab === 'password' ? '#4f46e5' : '#64748b',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.75rem',
                            transition: 'all 0.2s',
                            borderBottom: activeTab === 'password' ? '3px solid #4f46e5' : '3px solid transparent'
                        }}
                    >
                        <FaLock /> Security & Password
                    </button>
                </div>

                <div style={{ padding: '3rem', background: 'white' }}>
                    {activeTab === 'profile' ? (
                        <form onSubmit={saveProfile}>
                            <div className="inputs-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                                <div className="form-group">
                                    <label className="input-label"><FaUser /> Full Name</label>
                                    <input className="glass-input" name="name" value={profile.name} onChange={handleProfileChange} placeholder="Enter your full name" />
                                </div>
                                <div className="form-group">
                                    <label className="input-label"><FaIdCard /> Faculty ID</label>
                                    <input className="glass-input" name="facultyId" value={profile.facultyId} disabled style={{ background: '#f1f5f9', color: '#94a3b8' }} />
                                    <small style={{ color: '#94a3b8', marginTop: '0.4rem', display: 'block' }}>ID cannot be changed</small>
                                </div>
                                <div className="form-group">
                                    <label className="input-label"><FaEnvelope /> Email Address</label>
                                    <input className="glass-input" name="email" value={profile.email} onChange={handleProfileChange} placeholder="email@example.com" />
                                </div>
                                <div className="form-group">
                                    <label className="input-label"><FaBuilding /> Department</label>
                                    <input className="glass-input" name="department" value={profile.department} disabled style={{ background: '#f1f5f9', color: '#94a3b8' }} />
                                </div>
                            </div>
                            <div style={{ marginTop: '2.5rem', borderTop: '1px solid #f1f5f9', paddingTop: '2rem', textAlign: 'right' }}>
                                <button type="submit" className="btn-primary-glass" style={{ padding: '0.8rem 2.5rem' }}>Save Changes</button>
                            </div>
                        </form>
                    ) : (
                        <form onSubmit={changePassword} style={{ maxWidth: '500px', margin: '0 auto' }}>
                            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                                <label className="input-label">Current Password</label>
                                <input
                                    type="password"
                                    className="glass-input"
                                    name="current"
                                    value={passwords.current}
                                    onChange={handlePassChange}
                                    placeholder="••••••••"
                                />
                            </div>
                            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                                <label className="input-label">New Password</label>
                                <input
                                    type="password"
                                    className="glass-input"
                                    name="new"
                                    value={passwords.new}
                                    onChange={handlePassChange}
                                    placeholder="Create a strong password"
                                />
                            </div>
                            <div className="form-group" style={{ marginBottom: '2rem' }}>
                                <label className="input-label">Confirm New Password</label>
                                <input
                                    type="password"
                                    className="glass-input"
                                    name="confirm"
                                    value={passwords.confirm}
                                    onChange={handlePassChange}
                                    placeholder="Repeat new password"
                                />
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <button type="submit" className="btn-primary-glass" style={{ width: '100%', padding: '1rem' }}>
                                    Update Security Credentials
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FacultySettings;
