import React, { useState, useEffect } from 'react';
import apiClient from '../../utils/apiClient';
import './FacultyDashboard.css';

const FacultyExamDashboard = () => {
    const [activeTab, setActiveTab] = useState('create'); // create, list, results
    const [exams, setExams] = useState([]);
    const [selectedExamResults, setSelectedExamResults] = useState(null);

    // Form State
    const [formData, setFormData] = useState({
        title: '',
        subject: '',
        year: '1',
        branch: 'CSE',
        section: 'A',
        duration: 20,
        totalMarks: 20,
        unit: '1',
        topics: '',
        questions: []
    });

    const [currentQuestion, setCurrentQuestion] = useState({
        question: '',
        options: ['', '', '', ''],
        correctAnswer: 0,
        difficulty: 'medium'
    });

    useEffect(() => {
        fetchExams();
    }, []);

    const fetchExams = async () => {
        try {
            const u = JSON.parse(localStorage.getItem('facultyData') || '{}');
            if (u && u.facultyId) {
                const data = await apiClient.apiGet(`/api/exams/faculty/${u.facultyId}`);
                setExams(data || []);
            }
        } catch (err) {
            console.error("Failed to fetch exams", err);
        }
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleQuestionChange = (e) => {
        setCurrentQuestion({ ...currentQuestion, [e.target.name]: e.target.value });
    };

    const handleOptionChange = (index, value) => {
        const newOptions = [...currentQuestion.options];
        newOptions[index] = value;
        setCurrentQuestion({ ...currentQuestion, options: newOptions });
    };

    const addQuestion = () => {
        if (!currentQuestion.question) return;
        setFormData({
            ...formData,
            questions: [...formData.questions, currentQuestion]
        });
        // Reset current question
        setCurrentQuestion({
            question: '',
            options: ['', '', '', ''],
            correctAnswer: 0,
            difficulty: 'medium'
        });
    };

    const handleSubmitExam = async () => {
        try {
            const u = JSON.parse(localStorage.getItem('facultyData') || '{}');
            const payload = {
                ...formData,
                facultyId: u.facultyId || 'unknown',
                topics: formData.topics.split(',').map(t => t.trim())
            };

            await apiClient.apiPost('/api/exams/create', payload);
            alert('Exam Created Successfully!');
            setFormData({
                title: '', subject: '', year: '1', branch: 'CSE', section: 'A', duration: 20, totalMarks: 20, unit: '1', topics: '', questions: []
            });
            setActiveTab('list');
            fetchExams();
        } catch (err) {
            alert('Failed to create exam: ' + err.message);
        }
    };

    const copyLink = (link) => {
        const fullLink = `${window.location.origin}${link}`;
        navigator.clipboard.writeText(fullLink);
        alert('Link copied: ' + fullLink);
    };

    const viewResults = async (examId) => {
        try {
            const res = await apiClient.apiGet(`/api/exams/results/exam/${examId}`);
            setSelectedExamResults(res);
            setActiveTab('results');
        } catch (err) {
            alert("Failed to fetch results");
        }
    }

    return (
        <div className="animate-fade-in">
            <h2 style={{ fontSize: '1.8rem', marginBottom: '1.5rem', fontFamily: 'var(--font-head)', color: 'var(--text-primary)' }}>Exams Dashboard</h2>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                <button
                    onClick={() => setActiveTab('create')}
                    className={`fd-btn ${activeTab === 'create' ? 'primary' : 'secondary'}`}
                >
                    Create Exam
                </button>
                <button
                    onClick={() => { setActiveTab('list'); fetchExams(); }}
                    className={`fd-btn ${activeTab === 'list' ? 'primary' : 'secondary'}`}
                >
                    Active Exams
                </button>
            </div>

            {activeTab === 'create' && (
                <div className="fd-card">
                    <h3>Create New Test</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
                        <div className="form-group">
                            <label style={labelStyle}>Exam Title</label>
                            <input style={inputStyle} name="title" placeholder="e.g. Mid Term" value={formData.title} onChange={handleInputChange} />
                        </div>
                        <div className="form-group">
                            <label style={labelStyle}>Subject</label>
                            <input style={inputStyle} name="subject" value={formData.subject} onChange={handleInputChange} />
                        </div>

                        <div className="form-group">
                            <label style={labelStyle}>Year & Branch</label>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <select style={inputStyle} name="year" value={formData.year} onChange={handleInputChange}>
                                    <option value="1">1</option><option value="2">2</option><option value="3">3</option><option value="4">4</option>
                                </select>
                                <select style={inputStyle} name="branch" value={formData.branch} onChange={handleInputChange}>
                                    <option value="CSE">CSE</option><option value="ECE">ECE</option><option value="EEE">EEE</option><option value="MECH">MECH</option><option value="CIVIL">CIVIL</option><option value="IT">IT</option><option value="AIML">AIML</option>
                                </select>
                            </div>
                        </div>

                        <div className="form-group"><label style={labelStyle}>Section</label><input style={inputStyle} name="section" placeholder="e.g. A" value={formData.section} onChange={handleInputChange} /></div>
                        <div className="form-group"><label style={labelStyle}>Unit</label><input style={inputStyle} name="unit" placeholder="e.g. 1" value={formData.unit} onChange={handleInputChange} /></div>
                        <div className="form-group"><label style={labelStyle}>Topics</label><input style={inputStyle} name="topics" placeholder="Comma separated" value={formData.topics} onChange={handleInputChange} /></div>
                        <div className="form-group"><label style={labelStyle}>Duration (mins)</label><input style={inputStyle} type="number" name="duration" value={formData.duration} onChange={handleInputChange} /></div>
                        <div className="form-group"><label style={labelStyle}>Total Marks</label><input style={inputStyle} type="number" name="totalMarks" value={formData.totalMarks} onChange={handleInputChange} /></div>
                    </div>

                    <div style={{ marginTop: '2rem', borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
                        <h4>Add Questions</h4>
                        <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '16px', marginTop: '0.5rem', border: '1px solid #e2e8f0' }}>
                            <div className="form-group" style={{ marginBottom: '1rem' }}>
                                <label style={labelStyle}>Question Text</label>
                                <input style={{ ...inputStyle, width: '100%' }} placeholder="Enter question..." name="question" value={currentQuestion.question} onChange={handleQuestionChange} />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                                {currentQuestion.options.map((opt, idx) => (
                                    <input key={idx} style={inputStyle} placeholder={`Option ${idx + 1}`} value={opt} onChange={(e) => handleOptionChange(idx, e.target.value)} />
                                ))}
                            </div>

                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                <select style={{ ...inputStyle, width: '200px' }} name="correctAnswer" value={currentQuestion.correctAnswer} onChange={handleQuestionChange}>
                                    {currentQuestion.options.map((_, idx) => <option key={idx} value={idx}>Correct Option: {idx + 1}</option>)}
                                </select>
                                <select style={{ ...inputStyle, width: '200px' }} name="difficulty" value={currentQuestion.difficulty} onChange={handleQuestionChange}>
                                    <option value="easy">Easy</option>
                                    <option value="medium">Medium</option>
                                    <option value="hard">Hard</option>
                                </select>
                                <button onClick={addQuestion} className="fd-btn secondary">Add Question</button>
                            </div>
                        </div>

                        <div style={{ marginTop: '1.5rem' }}>
                            <h5>Questions Added: {formData.questions.length}</h5>
                            <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
                                {formData.questions.map((q, i) => (
                                    <div key={i} style={{ padding: '0.8rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between' }}>
                                        <span><strong>{i + 1}.</strong> {q.question}</span>
                                        <span style={{ fontSize: '0.8rem', background: '#e2e8f0', padding: '2px 6px', borderRadius: '4px' }}>{q.difficulty}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <button onClick={handleSubmitExam} className="fd-btn primary" style={{ width: '100%', justifyContent: 'center', marginTop: '2rem' }}>Publish Exam & Generate Link</button>
                </div>
            )}

            {activeTab === 'list' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                    {exams.map(exam => (
                        <div key={exam._id} className="fd-card" style={{ margin: 0, padding: '1.5rem' }}>
                            <h3 style={{ marginBottom: '0.5rem' }}>{exam.title}</h3>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: '0 0 1rem' }}>{exam.subject} ({exam.branch}-Y{exam.year})</p>

                            <div style={{ display: 'flex', gap: '1rem', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                                <span>{exam.duration} mins</span>
                                <span>{exam.totalMarks} Marks</span>
                            </div>

                            <div style={{ display: 'flex', gap: '0.8rem' }}>
                                <button onClick={() => copyLink(exam.generatedLink)} className="fd-btn secondary" style={{ fontSize: '0.8rem', padding: '0.6rem 1rem' }}>Copy Link</button>
                                <button onClick={() => viewResults(exam._id)} className="fd-btn primary" style={{ fontSize: '0.8rem', padding: '0.6rem 1rem' }}>Results</button>
                            </div>
                        </div>
                    ))}
                    {exams.length === 0 && <p>No exams found.</p>}
                </div>
            )}

            {activeTab === 'results' && selectedExamResults && (
                <div className="fd-card">
                    <button onClick={() => setActiveTab('list')} className="fd-btn secondary" style={{ marginBottom: '1.5rem' }}>← Back to List</button>
                    <h3>Results Summary</h3>
                    <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
                        <thead>
                            <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                                <th style={thStyle}>Student Name</th>
                                <th style={thStyle}>ID</th>
                                <th style={thStyle}>Score</th>
                                <th style={thStyle}>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {selectedExamResults.map(res => (
                                <tr key={res._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                    <td style={tdStyle}>{res.studentName || 'N/A'}</td>
                                    <td style={tdStyle}>{res.studentId}</td>
                                    <td style={{ ...tdStyle, color: res.isPassed ? 'var(--success)' : 'var(--danger)', fontWeight: '700' }}>
                                        {res.score} / {res.totalMarks}
                                    </td>
                                    <td style={tdStyle}>{new Date(res.submittedAt).toLocaleDateString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

const labelStyle = {
    display: 'block',
    fontSize: '0.8rem',
    fontWeight: '700',
    color: 'var(--text-secondary)',
    marginBottom: '0.4rem',
    textTransform: 'uppercase'
};

const inputStyle = {
    padding: '0.75rem',
    borderRadius: '10px',
    border: '1px solid #cbd5e1',
    width: '100%',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
    outline: 'none',
    transition: 'all 0.2s',
    background: '#fff'
};

const thStyle = { textAlign: 'left', padding: '1rem', color: 'var(--text-muted)', fontSize: '0.85rem' };
const tdStyle = { padding: '1rem', color: 'var(--text-primary)' };

export default FacultyExamDashboard;
