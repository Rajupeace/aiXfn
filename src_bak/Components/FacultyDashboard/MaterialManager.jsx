import React, { useState } from 'react';
import { apiUpload } from '../../utils/apiClient';

const MaterialManager = ({ selectedSubject, selectedSections, facultyToken, onUploadSuccess }) => {
    // Current active upload type (single selection state)
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

    const fetchGlobalResources = React.useCallback(async () => {
        if (!selectedSubject) return;
        const [subject, year] = selectedSubject.split(' - Year ');

        try {
            const res = await fetch(`http://localhost:5000/api/materials?year=${year}&subject=${encodeURIComponent(subject)}`);
            if (res.ok) {
                const data = await res.json();
                const filtered = data.filter(m => {
                    const matchYear = String(m.year) === String(year);
                    const matchSubject = m.subject.toLowerCase().includes(subject.toLowerCase()) || subject.toLowerCase().includes(m.subject.toLowerCase());
                    const matchSection = m.section === 'All' || selectedSections.includes(m.section) || selectedSections.length === 0;
                    return matchYear && matchSubject && matchSection;
                });
                setGlobalResources(filtered);
            }
        } catch (err) {
            console.error("Error fetching materials:", err);
        }
    }, [selectedSubject, selectedSections]);

    React.useEffect(() => {
        if (selectedSubject && selectedSections.length > 0) {
            fetchGlobalResources();
        }
    }, [selectedSubject, selectedSections, fetchGlobalResources]);

    const handleFileChange = (e) => {
        const { name, files } = e.target;
        if (files.length > 0) {
            setMaterials(prev => ({ ...prev, [name]: files[0] }));
        }
    };

    const getContext = () => {
        const parts = selectedSubject.split(' - Year ');
        const subject = parts[0] || 'General';
        const year = parts[1] || '1';
        return { subject, year };
    };

    const handleUpload = async () => {
        if (!selectedSubject || selectedSections.length === 0) {
            alert('Please select at least one section in the dashboard above before uploading.');
            return;
        }

        const { subject, year } = getContext();

        // Only upload the CURRENTLY selected type
        const file = materials[uploadType];
        if (!file) {
            alert(`Please select a file for ${uploadType} first.`);
            return;
        }

        const module = document.getElementById(`${uploadType}-module`)?.value || '1';
        const unit = document.getElementById(`${uploadType}-unit`)?.value || '1';
        const topic = document.getElementById(`${uploadType}-topic`)?.value || '';

        try {
            let successCount = 0;
            for (const section of selectedSections) {
                const formData = new FormData();
                formData.append('file', file);
                formData.append('year', year);
                formData.append('section', section);
                formData.append('subject', subject);
                formData.append('type', uploadType);
                formData.append('title', file.name); // Default title to filename
                formData.append('module', module);
                formData.append('unit', unit);
                if (topic) formData.append('topic', topic);

                if (uploadType === 'assignments') {
                    formData.append('dueDate', assignmentDetails.dueDate);
                    formData.append('message', assignmentDetails.message);
                }

                await apiUpload('/api/materials', formData);
                successCount++;
            }
            alert(`✅ Successfully uploaded ${uploadType} to ${successCount} section(s)!\n\nOnly students in section ${selectedSections.join(', ')} will see this material.`);

            // Cleanup
            setMaterials(prev => ({ ...prev, [uploadType]: null }));
            // Clear file input visually
            const fileInput = document.getElementById(uploadType);
            if (fileInput) fileInput.value = '';

            if (onUploadSuccess) onUploadSuccess();
            fetchGlobalResources();

        } catch (error) {
            console.error('Upload failed:', error);
            alert(`Upload failed: ${error.message || 'Server error'}`);
        }
    };

    const handleLinkAdd = async () => {
        // ... (reuse existing logic, works fine)
        const title = document.getElementById('link-title').value;
        const url = document.getElementById('link-url').value;
        const type = document.getElementById('link-type').value;

        if (!title || !url) return alert('Title and URL required');
        const { subject, year } = getContext();

        try {
            let successCount = 0;
            for (const section of selectedSections) {
                const formData = new FormData();
                formData.append('title', title);
                formData.append('year', year);
                formData.append('section', section);
                formData.append('subject', subject);
                formData.append('type', type);
                formData.append('link', url);
                formData.append('module', '1');
                formData.append('unit', '1');
                formData.append('topic', 'External Link');

                await apiUpload('/api/materials', formData);
                successCount++;
            }
            alert(`✅ Link added to ${successCount} section(s) successfully!`);
            document.getElementById('link-title').value = '';
            document.getElementById('link-url').value = '';
            if (onUploadSuccess) onUploadSuccess();
            fetchGlobalResources();
        } catch (error) {
            console.error('Failed to add link:', error);
            alert('Failed to save link.');
        }
    };

    // Modern Render Helper
    const renderModernUploadForm = () => {
        return (
            <div className="upload-area-modern animate-fade-in">
                {/* 1. Type Selector */}
                <div className="upload-type-selector">
                    {[
                        { id: 'notes', label: 'Lecture Notes', icon: '📄' },
                        { id: 'videos', label: 'Video Class', icon: '🎥' },
                        { id: 'syllabus', label: 'Syllabus', icon: '📋' },
                        { id: 'assignments', label: 'Assignment', icon: '📝' },
                        { id: 'modelPapers', label: 'Model Paper', icon: '📑' },
                        { id: 'importantQuestions', label: 'Important Questions', icon: '❓' }
                    ].map(type => (
                        <div
                            key={type.id}
                            className={`type-card ${uploadType === type.id ? 'active' : ''}`}
                            onClick={() => setUploadType(type.id)}
                        >
                            <div className="type-icon">{type.icon}</div>
                            <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#475569' }}>{type.label}</div>
                        </div>
                    ))}
                </div>

                {/* 2. Drop Zone & File Input */}
                <div className="modern-dropzone" onClick={() => document.getElementById(uploadType).click()}>
                    <input
                        type="file"
                        id={uploadType}
                        name={uploadType}
                        onChange={handleFileChange}
                        accept={uploadType === 'videos' ? 'video/*' : '.pdf,.doc,.docx,.txt'}
                    />
                    <div className="drop-icon">
                        {materials[uploadType] ? '✅' : '☁️'}
                    </div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 600, color: '#334155' }}>
                        {materials[uploadType] ? materials[uploadType].name : `Click to Upload ${uploadType.toUpperCase()} File`}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '0.5rem' }}>
                        {materials[uploadType] ? 'Ready to publish' : 'Drag and drop or browse'}
                    </div>
                </div>

                {/* 3. Metadata Form Grid */}
                <div className="modern-form-grid">
                    <div className="form-group">
                        <label className="input-label" htmlFor={`${uploadType}-module`}>Module</label>
                        <select id={`${uploadType}-module`} name={`${uploadType}-module`} className="glass-select">
                            {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>Module {n}</option>)}
                        </select>
                    </div>
                    <div className="form-group">
                        <label className="input-label" htmlFor={`${uploadType}-unit`}>Unit</label>
                        <select id={`${uploadType}-unit`} name={`${uploadType}-unit`} className="glass-select">
                            {[1, 2, 3, 4].map(n => <option key={n} value={n}>Unit {n}</option>)}
                        </select>
                    </div>
                    <div className="form-group full-width">
                        <label className="input-label" htmlFor={`${uploadType}-topic`}>Topic Name (Optional)</label>
                        <input id={`${uploadType}-topic`} name={`${uploadType}-topic`} placeholder="e.g. Introduction to Algorithms" className="glass-input" />
                    </div>

                    {uploadType === 'assignments' && (
                        <div className="form-group full-width">
                            <label className="input-label">Instructions & Due Date</label>
                            <div style={{ display: 'grid', gap: '1rem' }}>
                                <input type="datetime-local" className="glass-input" value={assignmentDetails.dueDate} onChange={(e) => setAssignmentDetails({ ...assignmentDetails, dueDate: e.target.value })} />
                                <textarea className="glass-input textarea" placeholder="Instructions..." value={assignmentDetails.message} onChange={(e) => setAssignmentDetails({ ...assignmentDetails, message: e.target.value })} />
                            </div>
                        </div>
                    )}
                </div>

                {/* 4. Action */}
                <div className="action-footer">
                    <button type="button" className="btn-primary-glass large" onClick={handleUpload} style={{ width: '100%', padding: '1rem', fontSize: '1.1rem' }}>
                        🚀 Publish {uploadType === 'modelPapers' ? 'Model Paper' : uploadType.slice(0, -1)} to {selectedSections.length} Sections
                    </button>
                </div>
            </div >
        );
    };

    return (
        <div className="upload-container animate-fade-in">
            <div className="upload-header">
                <h2>Manage Content</h2>
                <div className="material-tabs">
                    <button type="button" className={`tab-pill ${activeTab === 'upload' ? 'active' : ''}`} onClick={() => setActiveTab('upload')}>
                        Upload
                    </button>
                    <button type="button" className={`tab-pill ${activeTab === 'links' ? 'active' : ''}`} onClick={() => setActiveTab('links')}>
                        Add Links
                    </button>
                    <button type="button" className={`tab-pill ${activeTab === 'resources' ? 'active' : ''}`} onClick={() => setActiveTab('resources')}>
                        History ({globalResources.length})
                    </button>
                </div>
            </div>

            <form id="upload-form" onSubmit={(e) => e.preventDefault()}>
                {activeTab === 'resources' && (
                    <div className="glass-table-container">
                        <table className="glass-table">
                            <thead>
                                <tr>
                                    <th>Title</th>
                                    <th>Type</th>
                                    <th>Section</th>
                                    <th>Link</th>
                                </tr>
                            </thead>
                            <tbody>
                                {globalResources.length === 0 ? (
                                    <tr><td colSpan="4" style={{ textAlign: 'center', padding: '2rem' }}>No resources found for this selection.</td></tr>
                                ) : (
                                    globalResources.map((res, i) => (
                                        <tr key={i}>
                                            <td style={{ fontWeight: 500 }}>{res.title}</td>
                                            <td><span className={`badge-pill small ${res.type}`}>{res.type}</span></td>
                                            <td>{res.section}</td>
                                            <td>{res.url ? <a href={res.url} target="_blank" rel="noreferrer" className="link-text">Open</a> : '-'}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                {activeTab === 'upload' && renderModernUploadForm()}

                {activeTab === 'links' && (
                    <div className="glass-panel-light">
                        <h3 className="panel-title">Add External Resource</h3>
                        <div className="input-grid">
                            <div className="form-group full-width">
                                <label className="input-label" htmlFor="link-title">Resource Title</label>
                                <input id="link-title" placeholder="e.g. YouTube Playlist - Data Structures" className="glass-input" />
                            </div>
                            <div className="form-group full-width">
                                <label className="input-label" htmlFor="link-url">URL</label>
                                <input id="link-url" placeholder="https://" className="glass-input" />
                            </div>
                            <div className="form-group">
                                <label className="input-label" htmlFor="link-type">Resource Type</label>
                                <select id="link-type" className="glass-select">
                                    <option value="videos">Video</option>
                                    <option value="notes">Notes/Article</option>
                                    <option value="syllabus">Syllabus</option>
                                </select>
                            </div>
                        </div>
                        <div className="action-footer" style={{ marginTop: '1.5rem' }}>
                            <button type="button" className="btn-primary-glass large" onClick={handleLinkAdd}>
                                🔗 Add Link
                            </button>
                        </div>
                    </div>
                )}
            </form>
        </div>
    );
};

export default MaterialManager;
