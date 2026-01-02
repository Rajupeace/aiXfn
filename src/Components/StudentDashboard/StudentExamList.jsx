import React, { useState, useEffect } from 'react';
import { apiGet } from '../../utils/apiClient';
import { FaClipboardList, FaClock, FaCheckCircle, FaChevronRight, FaCalendarAlt } from 'react-icons/fa';

const StudentExamList = ({ studentData, onTakeExam }) => {
    const [exams, setExams] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchExams();
    }, [studentData]);

    const fetchExams = async () => {
        try {
            if (!studentData) return;
            const params = new URLSearchParams({
                studentId: studentData.sid, // Use SID if API supports it specifically
                year: studentData.year,
                branch: studentData.branch,
                section: studentData.section
            });
            // Try fetching by student ID specifically first if that endpoint exists or fallback to query params
            // Using the endpoint from Dashboard: /api/exams/student/sid
            let data = [];
            try {
                data = await apiGet(`/api/exams/student/${studentData.sid}`);
            } catch (e) {
                // Fallback
                const q = new URLSearchParams({
                    year: studentData.year,
                    branch: studentData.branch,
                    section: studentData.section
                }).toString();
                data = await apiGet(`/api/exams/student?${q}`);
            }

            setExams(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Failed to fetch exams", err);
            setExams([]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="view-container animate-fade-in">
            <div className="content-header">
                <div>
                    <h1>Active Exams & Tests</h1>
                    <p className="subtitle">Assessments assigned by your faculty.</p>
                </div>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '4rem' }}>Loading exams...</div>
            ) : exams.length === 0 ? (
                <div className="glass-card" style={{ textAlign: 'center', padding: '4rem', color: '#64748b' }}>
                    <FaClipboardList style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.2 }} />
                    <p>No active exams found for you at this moment.</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '2rem' }}>
                    {exams.map(exam => {
                        const isScheduled = exam.status === 'scheduled';
                        const isLive = new Date() >= new Date(exam.startTime) && new Date() <= new Date(new Date(exam.startTime).getTime() + exam.duration * 60000);

                        return (
                            <div key={exam._id} className="glass-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem', borderLeft: '4px solid #4f46e5' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                    <div>
                                        <span style={{
                                            fontSize: '0.75rem',
                                            textTransform: 'uppercase',
                                            letterSpacing: '1px',
                                            color: '#64748b',
                                            fontWeight: '700'
                                        }}>
                                            {exam.subject}
                                        </span>
                                        <h3 style={{ margin: '0.5rem 0', fontSize: '1.25rem' }}>{exam.title}</h3>
                                    </div>
                                    <div style={{ background: '#e0e7ff', color: '#4f46e5', padding: '4px 8px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                                        {exam.totalMarks} Marks
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.9rem', color: '#64748b' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <FaClock /> {exam.duration}m
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <FaCalendarAlt /> {new Date(exam.startTime).toLocaleDateString()}
                                    </div>
                                </div>

                                {exam.topics && exam.topics.length > 0 && (
                                    <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                                        Topics: {exam.topics.slice(0, 3).join(', ')}{exam.topics.length > 3 ? '...' : ''}
                                    </div>
                                )}

                                <div style={{ marginTop: 'auto', paddingTop: '1rem' }}>
                                    <button
                                        className="primary-btn"
                                        style={{ width: '100%', justifyContent: 'center' }}
                                        onClick={() => onTakeExam(exam)}
                                        disabled={!isLive && false} // For demo purposes allowing start, usually check time
                                    >
                                        Start Exam <FaChevronRight />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default StudentExamList;
