import React, { useState, useEffect } from 'react';
import { FaCloudUploadAlt, FaLink, FaHistory, FaFileAlt, FaVideo, FaClipboardList, FaQuestionCircle, FaLayerGroup, FaCalendarAlt, FaPaperPlane, FaEye } from 'react-icons/fa';
import { apiUpload, apiPost, apiGet } from '../../utils/apiClient';

const MaterialManager = ({ selectedSubject, selectedSections, onUploadSuccess }) => {
    const [uploadType, setUploadType] = useState('notes');
    const [materials, setMaterials] = useState({
        notes: null,
        videos: null,
        modelPapers: null,
        syllabus: null,
        assignments: null,
        importantQuestions: null
    });
    const [assignmentDetails, setAssignmentDetails] = useState({ dueDate: '', message: '' });
    const [activeTab, setActiveTab] = useState('upload');
    const [globalResources, setGlobalResources] = useState([]);
    const [broadcastMsg, setBroadcastMsg] = useState('');
    const [broadcastType, setBroadcastType] = useState('announcement');

    useEffect(() => {
        if (selectedSubject && selectedSections.length > 0) {
            fetchGlobalResources();
        }
    }, [selectedSubject, selectedSections]);

    const fetchGlobalResources = async () => {
        if (!selectedSubject) return;
        const parts = selectedSubject.split(' - Year ');
        const subject = parts[parts.length - 2] || 'General';
        const year = parts[parts.length - 1] || '1';

        try {
            const data = await apiGet(`/api/materials?year=${year}&subject=${encodeURIComponent(subject)}`);
            if (data) {
                setGlobalResources(data.filter(m => String(m.year) === String(year)));
            }
        } catch (err) {
            console.error("Error fetching materials:", err);
        }
    };

    const handleFileChange = (e) => {
        const { name, files } = e.target;
        if (files.length > 0) {
            setMaterials(prev => ({ ...prev, [name]: files[0] }));
        }
    };

    const getContext = () => {
        const parts = selectedSubject.split(' - Year ');
        const year = parts[parts.length - 1] || '1';
        const subject = parts.slice(0, parts.length - 1).join(' - Year ') || 'General';
        return { subject, year };
    };

    const handleUpload = async () => {
        if (selectedSections.length === 0) {
            alert('Alert: Select at least one active section target.');
            return;
        }

        const { subject, year } = getContext();
        const file = materials[uploadType];
        if (!file) return alert('Input Required: No file selected.');

        const module = document.getElementById(`mod-${uploadType}`)?.value || '1';
        const unit = document.getElementById(`uni-${uploadType}`)?.value || '1';
        const topic = document.getElementById(`top-${uploadType}`)?.value || '';

        try {
            for (const section of selectedSections) {
                const formData = new FormData();
                formData.append('file', file);
                formData.append('year', year);
                formData.append('section', section);
                formData.append('subject', subject);
                formData.append('type', uploadType);
                formData.append('title', file.name);
                formData.append('module', module);
                formData.append('unit', unit);
                if (topic) formData.append('topic', topic);

                if (uploadType === 'assignments') {
                    formData.append('dueDate', assignmentDetails.dueDate);
                    formData.append('message', assignmentDetails.message);
                }
                await apiUpload('/api/materials', formData);
            }
            alert('✅ Upload Successful');
            setMaterials(prev => ({ ...prev, [uploadType]: null }));
            if (onUploadSuccess) onUploadSuccess();
            fetchGlobalResources();
        } catch (error) {
            alert(`Upload Failed: ${error.message}`);
        }
    };

    return (
        <div className="animate-fade-in">
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', paddingBottom: '1rem', borderBottom: '1px solid #e2e8f0' }}>
                <button className={`fd-btn ${activeTab === 'upload' ? 'primary' : 'secondary'}`} onClick={() => setActiveTab('upload')}>
                    <FaCloudUploadAlt /> New Upload
                </button>
                <button className={`fd-btn ${activeTab === 'links' ? 'primary' : 'secondary'}`} onClick={() => setActiveTab('links')}>
                    <FaLink /> Links
                </button>
                <button className={`fd-btn ${activeTab === 'broadcast' ? 'primary' : 'secondary'}`} onClick={() => setActiveTab('broadcast')}>
                    <FaPaperPlane /> Broadcast
                </button>
                <button className={`fd-btn ${activeTab === 'resources' ? 'primary' : 'secondary'}`} onClick={() => setActiveTab('resources')}>
                    <FaHistory /> History
                </button>
            </div>

            <div>
                {activeTab === 'upload' && (
                    <div className="animate-fade-in">
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                            {[
                                { id: 'notes', label: 'Notes', icon: <FaFileAlt /> },
                                { id: 'videos', label: 'Video', icon: <FaVideo /> },
                                { id: 'assignments', label: 'Task', icon: <FaClipboardList /> },
                                { id: 'modelPapers', label: 'Paper', icon: <FaLayerGroup /> },
                                { id: 'importantQuestions', label: 'Q&A', icon: <FaQuestionCircle /> }
                            ].map(t => (
                                <button
                                    key={t.id}
                                    className={`fd-stat-card ${uploadType === t.id ? 'active' : ''}`}
                                    onClick={() => setUploadType(t.id)}
                                    style={{
                                        cursor: 'pointer',
                                        border: uploadType === t.id ? '2px solid var(--primary)' : '1px solid #e2e8f0',
                                        flexDirection: 'column', // override stat card default
                                        gap: '0.5rem',
                                        justifyContent: 'center',
                                        textAlign: 'center',
                                        boxShadow: uploadType === t.id ? '0 10px 20px rgba(139, 92, 246, 0.1)' : 'none'
                                    }}
                                >
                                    <div style={{ fontSize: '1.5rem', color: uploadType === t.id ? 'var(--primary)' : 'var(--text-muted)' }}>{t.icon}</div>
                                    <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{t.label}</span>
                                </button>
                            ))}
                        </div>

                        <div onClick={() => document.getElementById(uploadType).click()} style={{
                            border: '2px dashed #cbd5e1',
                            borderRadius: '24px',
                            padding: '3rem',
                            textAlign: 'center',
                            cursor: 'pointer',
                            background: materials[uploadType] ? '#f0fdf4' : '#f8fafc',
                            transition: 'all 0.2s'
                        }}>
                            <input type="file" id={uploadType} name={uploadType} style={{ display: 'none' }} onChange={handleFileChange} accept={uploadType === 'videos' ? 'video/*' : '.pdf,.doc,.docx,.txt'} />
                            <div style={{ fontSize: '3rem', color: materials[uploadType] ? '#10b981' : '#cbd5e1', marginBottom: '1rem' }}>
                                <FaCloudUploadAlt />
                            </div>
                            <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>
                                {materials[uploadType] ? materials[uploadType].name : `Select ${uploadType.toUpperCase()} file`}
                            </h3>
                            <p style={{ color: 'var(--text-secondary)' }}>Click to browse or drag file here</p>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginTop: '2rem' }}>
                            <div>
                                <label style={labelStyle}>Module</label>
                                <select id={`mod-${uploadType}`} style={inputStyle}>
                                    {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>Module {n}</option>)}
                                </select>
                            </div>
                            <div>
                                <label style={labelStyle}>Unit</label>
                                <select id={`uni-${uploadType}`} style={inputStyle}>
                                    {[1, 2, 3, 4].map(n => <option key={n} value={n}>Unit {n}</option>)}
                                </select>
                            </div>
                            <div style={{ gridColumn: 'span 2' }}>
                                <label style={labelStyle}>Topic Name</label>
                                <input id={`top-${uploadType}`} placeholder="e.g. Intro to Logic" style={inputStyle} />
                            </div>

                            {uploadType === 'assignments' && (
                                <div style={{ gridColumn: 'span 2', background: '#fff7ed', padding: '1.5rem', borderRadius: '12px' }}>
                                    <label style={labelStyle}><FaCalendarAlt /> Due Date</label>
                                    <input type="datetime-local" style={inputStyle} value={assignmentDetails.dueDate} onChange={(e) => setAssignmentDetails({ ...assignmentDetails, dueDate: e.target.value })} />
                                    <div style={{ marginTop: '1rem' }}></div>
                                    <label style={labelStyle}>Instructions</label>
                                    <textarea style={inputStyle} placeholder="Instructions..." rows="3" value={assignmentDetails.message} onChange={(e) => setAssignmentDetails({ ...assignmentDetails, message: e.target.value })} />
                                </div>
                            )}
                        </div>

                        <button className="fd-btn primary" style={{ width: '100%', marginTop: '2rem', justifyContent: 'center' }} onClick={handleUpload}>
                            <FaPaperPlane /> Upload to {selectedSections.length} Sections
                        </button>
                    </div>
                )}

                {activeTab === 'broadcast' && (
                    <div className="animate-fade-in" style={{ padding: '2rem', background: '#f8fafc', borderRadius: '16px' }}>
                        <h3>Send Announcement</h3>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Target: Sections {selectedSections.join(', ')}</p>

                        <div style={{ marginBottom: '1rem' }}>
                            <label style={labelStyle}>Type</label>
                            <select style={inputStyle} value={broadcastType} onChange={(e) => setBroadcastType(e.target.value)}>
                                <option value="announcement">General Announcement</option>
                                <option value="urgent">Urgent</option>
                            </select>
                        </div>
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={labelStyle}>Message</label>
                            <textarea
                                style={inputStyle}
                                rows="5"
                                value={broadcastMsg}
                                onChange={(e) => setBroadcastMsg(e.target.value)}
                                placeholder="Type your message..."
                            />
                        </div>
                        <button className="fd-btn primary" style={{ width: '100%', justifyContent: 'center' }} onClick={async () => {
                            if (!broadcastMsg) return alert('Message empty.');
                            const { subject, year } = getContext();
                            try {
                                await apiPost('/api/faculty/messages', {
                                    message: broadcastMsg,
                                    type: broadcastType,
                                    year,
                                    sections: selectedSections,
                                    subject
                                });
                                alert('✅ Sent Successfully');
                                setBroadcastMsg('');
                            } catch (e) {
                                alert(`Failed: ${e.message}`);
                            }
                        }}>
                            Send Broadcast
                        </button>
                    </div>
                )}
            </div>
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

export default MaterialManager;
