import React, { useState, useEffect } from 'react';
import apiClient from '../../utils/apiClient';
import './AdminDashboard.css'; // Reusing admin styles

const AdminExamStats = () => {
    const [activeTab, setActiveTab] = useState('exams'); // 'exams' or 'advanced'
    const [results, setResults] = useState([]);
    const [advancedResults, setAdvancedResults] = useState([]);
    const [filters, setFilters] = useState({
        year: '',
        branch: '',
        section: '',
        subject: ''
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (activeTab === 'exams') {
            fetchStats();
        } else {
            fetchAdvancedStats();
        }
    }, [activeTab]);

    const fetchStats = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (filters.year) params.append('year', filters.year);
            if (filters.branch) params.append('branch', filters.branch);
            if (filters.section) params.append('section', filters.section);
            if (filters.subject) params.append('subject', filters.subject);

            const data = await apiClient.apiGet(`/api/exams/admin/stats?${params.toString()}`);
            setResults(data);
        } catch (err) {
            console.error("Failed to fetch stats", err);
        } finally {
            setLoading(false);
        }
    };

    const fetchAdvancedStats = async () => {
        setLoading(true);
        try {
            const data = await apiClient.apiGet('/api/admin/all-progress');
            // Flatten the test history for display
            const flattened = [];
            if (Array.isArray(data)) {
                data.forEach(record => {
                    const student = record.studentId || {};
                    if (record.testHistory && record.testHistory.length > 0) {
                        record.testHistory.forEach(test => {
                            flattened.push({
                                _id: test._id || test.testId,
                                studentName: student.name || 'Unknown',
                                studentId: student.sid || 'N/A',
                                branch: student.branch || 'N/A',
                                year: student.year || 'N/A',
                                section: student.section || 'N/A',
                                subject: record.course || record.subject || 'Advanced Topic',
                                title: `Level: ${test.difficulty}`,
                                score: test.score,
                                totalMarks: test.total,
                                isPassed: test.percentage >= 60, // Assuming 60% pass for advanced
                                date: test.date
                            });
                        });
                    }
                });
            }
            // Filter locally for advanced stats since endpoint returns all
            let filtered = flattened;
            if (filters.branch) filtered = filtered.filter(r => r.branch === filters.branch);
            if (filters.year) filtered = filtered.filter(r => String(r.year) === String(filters.year));
            if (filters.section) filtered = filtered.filter(r => r.section.toLowerCase().includes(filters.section.toLowerCase()));
            if (filters.subject) filtered = filtered.filter(r => r.subject.toLowerCase().includes(filters.subject.toLowerCase()));

            setAdvancedResults(filtered);
        } catch (err) {
            console.error("Failed to fetch advanced stats", err);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    const handleApplyFilter = () => {
        if (activeTab === 'exams') fetchStats();
        else fetchAdvancedStats();
    };

    return (
        <div className="admin-exam-stats" style={{ padding: '0 0 2rem 0' }}>

            <div className="tabs" style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid #e2e8f0' }}>
                <button
                    onClick={() => setActiveTab('exams')}
                    style={{
                        padding: '1rem 2rem',
                        background: 'none',
                        border: 'none',
                        borderBottom: activeTab === 'exams' ? '3px solid var(--primary)' : '3px solid transparent',
                        color: activeTab === 'exams' ? 'var(--primary)' : 'var(--text-secondary)',
                        fontWeight: '700',
                        cursor: 'pointer',
                        fontSize: '1rem',
                        transition: 'all 0.2s'
                    }}
                >
                    Faculty Exams
                </button>
                <button
                    onClick={() => setActiveTab('advanced')}
                    style={{
                        padding: '1rem 2rem',
                        background: 'none',
                        border: 'none',
                        borderBottom: activeTab === 'advanced' ? '3px solid var(--primary)' : '3px solid transparent',
                        color: activeTab === 'advanced' ? 'var(--primary)' : 'var(--text-secondary)',
                        fontWeight: '700',
                        cursor: 'pointer',
                        fontSize: '1rem',
                        transition: 'all 0.2s'
                    }}
                >
                    Advanced Hub Results
                </button>
            </div>

            <div className="ad-section-card" style={{ padding: '2rem', marginBottom: '2rem' }}>
                <h3 style={{ marginBottom: '1.5rem', color: 'var(--text-primary)', fontSize: '1.5rem', marginTop: 0 }}>
                    {activeTab === 'exams' ? 'Exam Result Analytics' : 'Advanced Course Progress'}
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', alignItems: 'end' }}>
                    <div>
                        <label style={labelStyle}>Year</label>
                        <select style={inputStyle} name="year" value={filters.year} onChange={handleFilterChange}>
                            <option value="">All Years</option>
                            <option value="1">Year 1</option>
                            <option value="2">Year 2</option>
                            <option value="3">Year 3</option>
                            <option value="4">Year 4</option>
                        </select>
                    </div>
                    <div>
                        <label style={labelStyle}>Branch</label>
                        <select style={inputStyle} name="branch" value={filters.branch} onChange={handleFilterChange}>
                            <option value="">All Branches</option>
                            <option value="CSE">CSE</option><option value="ECE">ECE</option><option value="EEE">EEE</option><option value="MECH">MECH</option><option value="CIVIL">CIVIL</option><option value="IT">IT</option><option value="AIML">AIML</option>
                        </select>
                    </div>
                    <div>
                        <label style={labelStyle}>Section</label>
                        <input style={inputStyle} name="section" placeholder="e.g. A" value={filters.section} onChange={handleFilterChange} />
                    </div>
                    <div>
                        <label style={labelStyle}>Subject/Topic</label>
                        <input style={inputStyle} name="subject" placeholder="Filter by Subject" value={filters.subject} onChange={handleFilterChange} />
                    </div>
                    <button onClick={handleApplyFilter} style={buttonStyle}>
                        {loading ? 'Loading...' : 'Filter Results'}
                    </button>
                </div>
            </div>

            <div className="ad-section-card" style={{ padding: '0', overflow: 'hidden' }}>
                <table className="ad-table">
                    <thead>
                        <tr>
                            <th>Student Name</th>
                            <th>ID</th>
                            <th>Branch/Year</th>
                            <th>{activeTab === 'exams' ? 'Exam Subject' : 'Course Topic'}</th>
                            <th>{activeTab === 'exams' ? 'Exam Title' : 'Level'}</th>
                            <th>Marks</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {(activeTab === 'exams' ? results : advancedResults).length > 0 ? (activeTab === 'exams' ? results : advancedResults).map((res, i) => (
                            <tr key={res._id || i}>
                                <td>{res.studentName || 'Unknown'}</td>
                                <td>{res.studentId}</td>
                                <td>{res.branch} - {res.year}</td>
                                <td>{activeTab === 'exams' ? (res.examId?.subject || 'N/A') : res.subject}</td>
                                <td>{activeTab === 'exams' ? (res.examId?.title || 'N/A') : res.title}</td>
                                <td>
                                    <span style={{ fontWeight: 'bold' }}>{res.score}</span> / {res.totalMarks}
                                </td>
                                <td>
                                    <span style={{
                                        padding: '0.25rem 0.5rem',
                                        borderRadius: '4px',
                                        background: res.isPassed ? '#dcfce7' : '#fee2e2',
                                        color: res.isPassed ? '#166534' : '#991b1b',
                                        fontSize: '0.75rem',
                                        fontWeight: '700',
                                        textTransform: 'uppercase'
                                    }}>
                                        {res.isPassed ? 'PASS' : 'FAIL'}
                                    </span>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>No results found match criteria.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const labelStyle = {
    display: 'block',
    fontSize: '0.8rem',
    marginBottom: '0.5rem',
    color: 'var(--text-secondary)',
    fontWeight: '700'
};

const inputStyle = {
    width: '100%',
    padding: '0.75rem',
    borderRadius: '10px',
    border: '1px solid #cbd5e1',
    background: '#fff',
    color: 'var(--text-primary)',
    outline: 'none',
    fontFamily: 'inherit',
    boxSizing: 'border-box'
};

const buttonStyle = {
    width: '100%',
    padding: '0.75rem',
    borderRadius: '10px',
    border: 'none',
    background: 'var(--primary)',
    color: 'white',
    cursor: 'pointer',
    fontWeight: '700',
    transition: 'all 0.2s'
};

export default AdminExamStats;
