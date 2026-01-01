import React from 'react';
import { FaChartLine, FaCheckCircle, FaClock, FaFire } from 'react-icons/fa';
import './AcademicPulse.css';

const AcademicPulse = ({ attendance = 85, completedTasks = 12, totalTasks = 15, streak = 5 }) => {
    const progress = (completedTasks / totalTasks) * 100;

    return (
        <div className="pulse-container glass-panel">
            <div className="pulse-header">
                <h3><FaChartLine /> Academic Pulse</h3>
                <span className="live-badge">LIVE METRICS</span>
            </div>

            <div className="pulse-grid">
                <div className="pulse-stat">
                    <div className="circular-progress" style={{ '--data-p': attendance }}>
                        <span className="p-val">{attendance}%</span>
                    </div>
                    <span className="p-label">Attendance</span>
                </div>

                <div className="pulse-details">
                    <div className="detail-item">
                        <div className="d-icon"><FaCheckCircle color="#10b981" /></div>
                        <div className="d-info">
                            <span className="d-val">{completedTasks}/{totalTasks}</span>
                            <span className="d-title">Tasks Finished</span>
                        </div>
                    </div>
                    <div className="detail-item">
                        <div className="d-icon"><FaFire color="#f97316" /></div>
                        <div className="d-info">
                            <span className="d-val">{streak} Days</span>
                            <span className="d-title">Study Streak</span>
                        </div>
                    </div>
                    <div className="detail-item" style={{ gridColumn: 'span 2' }}>
                        <div className="progress-bar-container">
                            <div className="pb-label">
                                <span>Curriculum Progress</span>
                                <span>{Math.round(progress)}%</span>
                            </div>
                            <div className="pb-track">
                                <div className="pb-fill" style={{ width: `${progress}%` }}></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="pulse-footer">
                <FaClock /> Last updated: Just now
            </div>
        </div>
    );
};

export default AcademicPulse;
