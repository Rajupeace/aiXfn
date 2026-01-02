import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaComments, FaUserTie, FaCheckCircle, FaLock } from 'react-icons/fa';

const InterviewQA = ({ studentData }) => {
    const navigate = useNavigate();

    // Mock categories
    const categories = [
        { id: 1, title: 'Technical Rounds', desc: 'DSA, System Design, and Core Subjects', icon: <FaUserTie />, locked: false },
        { id: 2, title: 'HR Round', desc: 'Behavioral questions and leadership skills', icon: <FaComments />, locked: false },
        { id: 3, title: 'Mock Interviews', desc: 'AI-driven mock interview simulations', icon: <FaVideo />, locked: true },
        { id: 4, title: 'Company Specific', desc: 'Google, Amazon, Microsoft patterns', icon: <FaBuilding />, locked: true },
    ];

    // Icon dummy imports to avoid crash if FaVideo/FaBuilding not imported above
    function FaVideo() { return <span>🎥</span> }
    function FaBuilding() { return <span>🏢</span> }

    return (
        <div className="interview-container">
            <div className="glass-header">
                <button className="back-btn" onClick={() => navigate('/student-dashboard')}>
                    <FaArrowLeft /> Back
                </button>
                <h1>Interview Preparation</h1>
                <p>Crack your placements with curated Q&A and AI mock tests</p>
            </div>

            <div className="content-grid">
                {categories.map(cat => (
                    <div key={cat.id} className={`qa-card ${cat.locked ? 'locked' : ''}`}>
                        <div className="card-icon">{cat.icon}</div>
                        <h3>{cat.title}</h3>
                        <p>{cat.desc}</p>
                        {cat.locked ? (
                            <button className="btn-locked"><FaLock /> Premium</button>
                        ) : (
                            <button className="btn-start">Start Practice <FaCheckCircle /></button>
                        )}
                    </div>
                ))}
            </div>

            <style jsx>{`
                .interview-container {
                    min-height: 100vh;
                    background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
                    padding: 2rem;
                    font-family: 'Space Grotesk', sans-serif;
                }

                .glass-header {
                    background: rgba(255,255,255,0.8);
                    backdrop-filter: blur(12px);
                    padding: 2rem;
                    border-radius: 24px;
                    margin-bottom: 3rem;
                    text-align: center;
                    position: relative;
                    box-shadow: 0 4px 6px rgba(0,0,0,0.05);
                }

                .back-btn {
                    position: absolute;
                    left: 20px;
                    top: 20px;
                    background: transparent;
                    border: none;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    font-weight: 600;
                    color: #4b5563;
                    cursor: pointer;
                    font-size: 1rem;
                }

                .glass-header h1 {
                    margin: 0;
                    color: #1f2937;
                    font-size: 2.5rem;
                }

                .glass-header p {
                    color: #6b7280;
                    margin-top: 0.5rem;
                }

                .content-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                    gap: 2rem;
                    max-width: 1200px;
                    margin: 0 auto;
                }

                .qa-card {
                    background: white;
                    border-radius: 20px;
                    padding: 2rem;
                    transition: all 0.3s ease;
                    border: 1px solid rgba(0,0,0,0.05);
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    text-align: center;
                    position: relative;
                    overflow: hidden;
                }

                .qa-card:hover {
                    transform: translateY(-10px);
                    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
                }

                .card-icon {
                    font-size: 3rem;
                    color: #6366f1;
                    margin-bottom: 1.5rem;
                    background: #e0e7ff;
                    width: 80px;
                    height: 80px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .qa-card h3 {
                    margin: 0 0 0.5rem 0;
                    color: #111827;
                }

                .qa-card p {
                    color: #6b7280;
                    font-size: 0.9rem;
                    margin-bottom: 2rem;
                }

                .btn-start {
                    margin-top: auto;
                    padding: 0.8rem 1.5rem;
                    background: #4f46e5;
                    color: white;
                    border: none;
                    border-radius: 12px;
                    font-weight: 600;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    transition: background 0.2s;
                }

                .btn-start:hover {
                    background: #4338ca;
                }

                .btn-locked {
                    margin-top: auto;
                    padding: 0.8rem 1.5rem;
                    background: #e5e7eb;
                    color: #9ca3af;
                    border: none;
                    border-radius: 12px;
                    font-weight: 600;
                    cursor: not-allowed;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }

                .qa-card.locked {
                    opacity: 0.8;
                }
            `}</style>
        </div>
    );
};

export default InterviewQA;
