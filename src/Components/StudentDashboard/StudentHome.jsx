import React from 'react';
import { FaUserGraduate, FaChartPie, FaCheckCircle, FaLaptopCode, FaBell, FaCalendarCheck, FaExclamationCircle } from 'react-icons/fa';

const StudentHome = ({ studentData, stats }) => {
    return (
        <div className="animate-fade-in">
            {/* Professional Stats Grid */}
            <div className="sd-stats-grid">
                <div className="sd-stat-card">
                    <div className="sd-stat-label">Semester Attendance</div>
                    <div className="sd-stat-value" style={{ color: stats.attendance >= 75 ? 'var(--text-main)' : 'var(--danger)' }}>
                        {stats.attendance || 0}%
                    </div>
                    <div style={{ fontSize: '0.8rem', color: stats.attendance >= 75 ? 'var(--success)' : 'var(--danger)', fontWeight: '500', marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        {stats.attendance >= 75 ? <FaCheckCircle /> : <FaExclamationCircle />}
                        {stats.attendance >= 75 ? 'Good Standing' : 'Below Threshold'}
                    </div>
                </div>

                <div className="sd-stat-card">
                    <div className="sd-stat-label">Technical Score</div>
                    <div className="sd-stat-value">
                        {stats.techScore || 0}<span style={{ fontSize: '1rem', color: 'var(--text-tertiary)' }}>/100</span>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--info)', fontWeight: '500', marginTop: 'auto' }}>
                        Advanced Level
                    </div>
                </div>

                <div className="sd-stat-card">
                    <div className="sd-stat-label">Exams Completed</div>
                    <div className="sd-stat-value">
                        {stats.testsTaken || 0}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 'auto' }}>
                        Last 30 days
                    </div>
                </div>

                <div className="sd-stat-card">
                    <div className="sd-stat-label">Pending Actions</div>
                    <div className="sd-stat-value">
                        {stats.pendingTasks || 0}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--warning)', fontWeight: '500', marginTop: 'auto' }}>
                        Needs Attention
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
                <div className="sd-card">
                    <div className="sd-section-title">
                        Recent Activity
                    </div>
                    <div className="sd-material-list">
                        <div className="sd-material-item">
                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                <div style={{
                                    width: 36, height: 36, borderRadius: '50%',
                                    background: '#eff6ff', color: 'var(--primary)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}>
                                    <FaBell size={14} />
                                </div>
                                <div>
                                    <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600 }}>Mid Term Schedule Released</h4>
                                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Administration • 2 hours ago</span>
                                </div>
                            </div>
                        </div>
                        <div className="sd-material-item">
                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                <div style={{
                                    width: 36, height: 36, borderRadius: '50%',
                                    background: '#f0fdf4', color: 'var(--success)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}>
                                    <FaLaptopCode size={14} />
                                </div>
                                <div>
                                    <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600 }}>Python Module 3 Notes Available</h4>
                                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Professor Smith • Yesterday</span>
                                </div>
                            </div>
                        </div>
                        <div className="sd-material-item">
                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                <div style={{
                                    width: 36, height: 36, borderRadius: '50%',
                                    background: '#fef3c7', color: 'var(--warning)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}>
                                    <FaCalendarCheck size={14} />
                                </div>
                                <div>
                                    <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600 }}>Technical Workshop Registration Deadline</h4>
                                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>System Alert • 2 days ago</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div style={{ marginTop: '1.5rem' }}>
                        <button className="sd-btn-secondary" style={{ width: '100%' }}>View All Notifications</button>
                    </div>
                </div>

                <div className="sd-card" style={{ background: 'var(--primary)', color: 'white', border: 'none' }}>
                    <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem' }}>Quote of the Day</h3>
                    <p style={{ fontStyle: 'italic', opacity: 0.9, lineHeight: '1.6', fontSize: '1rem' }}>
                        "The beautiful thing about learning is that no one can take it away from you."
                    </p>
                    <div style={{ marginTop: '2rem', fontWeight: '600', opacity: 0.8, fontSize: '0.9rem' }}>
                        — B.B. King
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentHome;
