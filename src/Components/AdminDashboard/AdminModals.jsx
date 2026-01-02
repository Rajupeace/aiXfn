import React, { useState } from 'react';
import { FaUpload, FaCloudUploadAlt } from 'react-icons/fa';
import api from '../../utils/apiClient';

export const AdminModal = ({ type, onClose, onSave, editItem }) => {
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const formData = new FormData(e.target);
        try {
            await onSave(type, formData);
        } catch (error) {
            console.error(error);
            alert(error.message || 'Operation failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="ad-modal-overlay">
            <div className="ad-modal">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem' }}>
                    <h2 style={{ fontFamily: 'var(--font-head)', margin: 0, fontSize: '1.25rem' }}>
                        {type === 'student' && (editItem ? 'Edit Student' : 'Add New Student')}
                        {type === 'faculty' && (editItem ? 'Edit Faculty' : 'Add Faculty Member')}
                        {type === 'course' && 'Manage Course'}
                        {type === 'material' && 'Upload Learning Material'}
                        {type === 'message' && 'Send Announcement'}
                    </h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#64748b' }}>×</button>
                </div>

                <form onSubmit={handleSubmit}>
                    {/* STUDENT FORM */}
                    {type === 'student' && (
                        <>
                            <div className="ad-form-group">
                                <label>Student ID (SID)</label>
                                <input name="sid" defaultValue={editItem?.sid} required />
                            </div>
                            <div className="ad-form-group">
                                <label>Full Name</label>
                                <input name="studentName" defaultValue={editItem?.studentName} required />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div className="ad-form-group">
                                    <label>Branch</label>
                                    <select name="branch" defaultValue={editItem?.branch || 'CSE'}>
                                        <option value="CSE">CSE</option>
                                        <option value="ECE">ECE</option>
                                        <option value="EEE">EEE</option>
                                        <option value="MECH">MECH</option>
                                        <option value="CIVIL">CIVIL</option>
                                        <option value="IT">IT</option>
                                        <option value="AIML">AIML</option>
                                    </select>
                                </div>
                                <div className="ad-form-group">
                                    <label>Year</label>
                                    <select name="year" defaultValue={editItem?.year || '1'}>
                                        <option value="1">1st Year</option>
                                        <option value="2">2nd Year</option>
                                        <option value="3">3rd Year</option>
                                        <option value="4">4th Year</option>
                                    </select>
                                </div>
                            </div>
                            <div className="ad-form-group">
                                <label>Section</label>
                                <input name="section" defaultValue={editItem?.section || 'A'} maxLength="1" />
                            </div>
                            <div className="ad-form-group">
                                <label>Email</label>
                                <input name="email" type="email" defaultValue={editItem?.email} />
                            </div>
                        </>
                    )}

                    {/* FACULTY FORM */}
                    {type === 'faculty' && (
                        <>
                            <div className="ad-form-group">
                                <label>Faculty ID</label>
                                <input name="facultyId" defaultValue={editItem?.facultyId} required />
                            </div>
                            <div className="ad-form-group">
                                <label>Name</label>
                                <input name="name" defaultValue={editItem?.name} required />
                            </div>
                            <div className="ad-form-group">
                                <label>Department</label>
                                <select name="department" defaultValue={editItem?.department || 'CSE'}>
                                    <option value="CSE">CSE</option>
                                    <option value="ECE">ECE</option>
                                    <option value="EEE">EEE</option>
                                    <option value="MECH">MECH</option>
                                    <option value="CIVIL">CIVIL</option>
                                    <option value="IT">IT</option>
                                    <option value="AIML">AIML</option>
                                    <option value="Humanities">Humanities</option>
                                </select>
                            </div>
                            <div className="ad-form-group">
                                <label>Email</label>
                                <input name="email" type="email" defaultValue={editItem?.email} required />
                            </div>
                        </>
                    )}

                    {/* COURSE FORM */}
                    {type === 'course' && (
                        <>
                            <div className="ad-form-group">
                                <label>Course Code</label>
                                <input name="code" defaultValue={editItem?.code} required placeholder="e.g. CS101" />
                            </div>
                            <div className="ad-form-group">
                                <label>Course Name</label>
                                <input name="name" defaultValue={editItem?.name} required placeholder="e.g. Data Structures" />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                                <div className="ad-form-group">
                                    <label>Credits</label>
                                    <input name="credits" type="number" defaultValue={editItem?.credits || 3} min="1" max="6" />
                                </div>
                                <div className="ad-form-group">
                                    <label>Year</label>
                                    <select name="year" defaultValue={editItem?.year || '1'}>
                                        <option value="1">1</option><option value="2">2</option><option value="3">3</option><option value="4">4</option>
                                    </select>
                                </div>
                                <div className="ad-form-group">
                                    <label>Semester</label>
                                    <select name="semester" defaultValue={editItem?.semester || '1'}>
                                        {[1, 2, 3, 4, 5, 6, 7, 8].map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="ad-form-group">
                                <label>Branch</label>
                                <select name="branch" defaultValue={editItem?.branch || 'CSE'}>
                                    <option value="CSE">CSE</option><option value="ECE">ECE</option><option value="EEE">EEE</option>
                                    <option value="MECH">MECH</option><option value="CIVIL">CIVIL</option><option value="IT">IT</option>
                                    <option value="AIML">AIML</option>
                                </select>
                            </div>
                        </>
                    )}

                    {/* MATERIAL FORM */}
                    {type === 'material' && (
                        <>
                            <div className="ad-form-group">
                                <label>Title</label>
                                <input name="title" required placeholder="e.g. Unit 1 Notes" />
                            </div>
                            <div className="ad-form-group">
                                <label>Subject</label>
                                <input name="subject" required placeholder="Subject Name" />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div className="ad-form-group">
                                    <label>Type</label>
                                    <select name="type">
                                        <option value="notes">Notes (PDF/Doc)</option>
                                        <option value="syllabus">Syllabus</option>
                                        <option value="video">Video Link</option>
                                        <option value="assignment">Assignment</option>
                                        <option value="lab">Lab Manual</option>
                                    </select>
                                </div>
                                <div className="ad-form-group">
                                    <label>Year</label>
                                    <select name="year">
                                        <option value="1">Year 1</option>
                                        <option value="2">Year 2</option>
                                        <option value="3">Year 3</option>
                                        <option value="4">Year 4</option>
                                    </select>
                                </div>
                            </div>
                            <div className="ad-form-group">
                                <label>File Upload (or URL)</label>
                                <div style={{ border: '2px dashed #cbd5e1', padding: '1.5rem', borderRadius: '12px', textAlign: 'center', cursor: 'pointer', position: 'relative' }}>
                                    <FaCloudUploadAlt size={32} color="#64748b" />
                                    <p style={{ margin: '0.5rem 0', fontSize: '0.8rem', color: '#64748b' }}>Drag file here or click to browse</p>
                                    <input type="file" name="file" style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }} />
                                </div>
                                <input name="url" placeholder="Or paste external URL..." style={{ marginTop: '0.5rem', width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #ddd' }} />
                            </div>
                        </>
                    )}

                    {/* MESSAGE FORM */}
                    {type === 'message' && (
                        <>
                            <div className="ad-form-group">
                                <label>Target Audience</label>
                                <select name="target">
                                    <option value="all">All Users</option>
                                    <option value="students">All Students</option>
                                    <option value="faculty">All Faculty</option>
                                </select>
                            </div>
                            <div className="ad-form-group">
                                <label>Announcement Message</label>
                                <textarea name="message" rows="4" required placeholder="Type your message here..." style={{ width: '100%', padding: '0.85rem', borderRadius: '10px', border: '1px solid #cbd5e1' }}></textarea>
                            </div>
                        </>
                    )}

                    <button
                        type="submit"
                        className="ad-btn-primary"
                        style={{ width: '100%', justifyContent: 'center', marginTop: '1rem' }}
                        disabled={loading}
                    >
                        {loading ? 'Processing...' : 'Confirm & Save'}
                    </button>
                </form>
            </div>
        </div>
    );
};
