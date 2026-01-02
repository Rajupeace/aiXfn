import React, { useState } from 'react';
import { FaLock, FaUser, FaEnvelope, FaIdCard, FaBuilding } from 'react-icons/fa';
import './FacultyDashboard.css';

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

    const handleProfileChange = (e) => {
        setProfile({ ...profile, [e.target.name]: e.target.value });
    };

    const handlePassChange = (e) => {
        setPasswords({ ...passwords, [e.target.name]: e.target.value });
    };

    const saveProfile = async (e) => {
        e.preventDefault();
        alert("Profile update simulation: Saved!");
    };

    const changePassword = async (e) => {
        e.preventDefault();
        if (passwords.new !== passwords.confirm) {
            alert("New passwords do not match");
            return;
        }
        alert("Password change simulation: Success!");
        setPasswords({ current: '', new: '', confirm: '' });
    };

    return (
        <div className="animate-fade-in" style={{ paddingBottom: '4rem' }}>
            <div style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.8rem', color: 'var(--text-primary)', fontFamily: 'var(--font-head)', margin: '0 0 0.5rem 0' }}>Settings</h2>
                <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Manage your faculty profile and security preferences.</p>
            </div>

            <div className="fd-card" style={{ padding: '0', overflow: 'hidden' }}>
                <div style={{ display: 'flex', borderBottom: '1px solid rgba(226, 232, 240, 0.8)' }}>
                    <button
                        onClick={() => setActiveTab('profile')}
                        style={{
                            flex: 1,
                            padding: '1.5rem',
                            border: 'none',
                            background: activeTab === 'profile' ? 'white' : '#f9fafb',
                            color: activeTab === 'profile' ? 'var(--primary)' : 'var(--text-muted)',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.8rem',
                            fontFamily: 'var(--font-main)',
                            borderBottom: activeTab === 'profile' ? '3px solid var(--primary)' : '3px solid transparent'
                        }}
                    >
                        <FaUser /> Faculty Identity
                    </button>
                    <button
                        onClick={() => setActiveTab('password')}
                        style={{
                            flex: 1,
                            padding: '1.5rem',
                            border: 'none',
                            background: activeTab === 'password' ? 'white' : '#f9fafb',
                            color: activeTab === 'password' ? 'var(--primary)' : 'var(--text-muted)',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.8rem',
                            fontFamily: 'var(--font-main)',
                            borderBottom: activeTab === 'password' ? '3px solid var(--primary)' : '3px solid transparent'
                        }}
                    >
                        <FaLock /> Security
                    </button>
                </div>

                <div style={{ padding: '3rem' }}>
                    {activeTab === 'profile' ? (
                        <form onSubmit={saveProfile}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                                <div>
                                    <label style={labelStyle}>Full Name</label>
                                    <input style={inputStyle} name="name" value={profile.name} onChange={handleProfileChange} />
                                </div>
                                <div>
                                    <label style={labelStyle}>Faculty ID</label>
                                    <input style={{ ...inputStyle, background: '#f1f5f9', color: '#94a3b8' }} name="facultyId" value={profile.facultyId} disabled />
                                </div>
                                <div>
                                    <label style={labelStyle}>Email Address</label>
                                    <input style={inputStyle} name="email" value={profile.email} onChange={handleProfileChange} />
                                </div>
                                <div>
                                    <label style={labelStyle}>Department</label>
                                    <input style={{ ...inputStyle, background: '#f1f5f9', color: '#94a3b8' }} name="department" value={profile.department} disabled />
                                </div>
                            </div>
                            <div style={{ marginTop: '3rem', textAlign: 'right', borderTop: '1px solid #f1f5f9', paddingTop: '2rem' }}>
                                <button type="submit" className="fd-btn primary" style={{ marginLeft: 'auto' }}>Save Changes</button>
                            </div>
                        </form>
                    ) : (
                        <form onSubmit={changePassword} style={{ maxWidth: '500px', margin: '0 auto' }}>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={labelStyle}>Current Password</label>
                                <input type="password" style={inputStyle} name="current" value={passwords.current} onChange={handlePassChange} placeholder="••••••••" />
                            </div>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={labelStyle}>New Password</label>
                                <input type="password" style={inputStyle} name="new" value={passwords.new} onChange={handlePassChange} placeholder="Strong password" />
                            </div>
                            <div style={{ marginBottom: '2.5rem' }}>
                                <label style={labelStyle}>Confirm Password</label>
                                <input type="password" style={inputStyle} name="confirm" value={passwords.confirm} onChange={handlePassChange} placeholder="Repeat password" />
                            </div>
                            <button type="submit" className="fd-btn primary" style={{ width: '100%', justifyContent: 'center' }}>
                                Update Password
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

const labelStyle = {
    display: 'block',
    fontSize: '0.8rem',
    fontWeight: '700',
    color: 'var(--text-secondary)',
    marginBottom: '0.5rem',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
};

const inputStyle = {
    padding: '0.85rem',
    borderRadius: '12px',
    border: '1px solid #cbd5e1',
    width: '100%',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
    outline: 'none',
    transition: 'all 0.2s',
    background: '#fff',
    fontSize: '1rem'
};

export default FacultySettings;
