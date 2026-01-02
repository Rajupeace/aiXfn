import React, { useState, useEffect } from 'react';
import { FaBook, FaVideo, FaFileAlt, FaDownload, FaFilter, FaInbox } from 'react-icons/fa';
import { apiGet } from '../../utils/apiClient';

const StudentAcademics = ({ studentData }) => {
    const [materials, setMaterials] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filter State
    const [filters, setFilters] = useState({
        subject: '',
        type: 'notes',
        module: '1',
        unit: '1'
    });

    const [uniqueSubjects, setUniqueSubjects] = useState([]);

    useEffect(() => {
        fetchMaterials();
    }, []);

    const fetchMaterials = async () => {
        try {
            const res = await apiGet(`/api/materials?year=${studentData.year}&branch=${studentData.branch}&section=${studentData.section}`);
            if (Array.isArray(res)) {
                setMaterials(res);
                const subjs = [...new Set(res.map(m => m.subject))];
                setUniqueSubjects(subjs);
                if (subjs.length > 0 && !filters.subject) {
                    setFilters(prev => ({ ...prev, subject: subjs[0] }));
                }
            }
        } catch (e) {
            console.error("Failed to fetch academic materials", e);
        } finally {
            setLoading(false);
        }
    };

    const filteredMaterials = materials.filter(m => {
        return (
            (!filters.subject || m.subject === filters.subject) &&
            (!filters.type || m.type === filters.type) &&
            (!filters.module || String(m.module) === String(filters.module)) &&
            (!filters.unit || String(m.unit) === String(filters.unit))
        );
    });

    return (
        <div className="animate-fade-in">
            <div className="sd-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <div className="sd-section-title" style={{ margin: 0 }}>
                        Academic Resources
                    </div>
                </div>

                <div className="sd-filters">
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Filter By:</span>

                    <select
                        className="sd-select"
                        value={filters.subject}
                        onChange={e => setFilters({ ...filters, subject: e.target.value })}
                    >
                        <option value="">All Subjects</option>
                        {uniqueSubjects.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>

                    <select
                        className="sd-select"
                        value={filters.type}
                        onChange={e => setFilters({ ...filters, type: e.target.value })}
                    >
                        <option value="notes">Lecture Notes</option>
                        <option value="videos">Video Tutorials</option>
                        <option value="syllabus">Syllabus</option>
                        <option value="assignments">Assignments</option>
                        <option value="modelPapers">Model Papers</option>
                    </select>

                    <select
                        className="sd-select"
                        value={filters.module}
                        onChange={e => setFilters({ ...filters, module: e.target.value })}
                        style={{ minWidth: '100px' }}
                    >
                        {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>Module {n}</option>)}
                    </select>

                    <select
                        className="sd-select"
                        value={filters.unit}
                        onChange={e => setFilters({ ...filters, unit: e.target.value })}
                        style={{ minWidth: '100px' }}
                    >
                        {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>Unit {n}</option>)}
                    </select>
                </div>

                {loading ? (
                    <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading resources...</div>
                ) : filteredMaterials.length > 0 ? (
                    <div className="sd-materials-grid">
                        {filteredMaterials.map((item, idx) => (
                            <div key={item._id || idx} className="sd-material-card">
                                <div className="sd-material-icon">
                                    {item.type === 'videos' ? <FaVideo /> : <FaFileAlt />}
                                </div>
                                <div className="sd-material-info">
                                    <h4 className="sd-material-title">{item.title}</h4>
                                    <p className="sd-material-topic">{item.topic || 'General'}</p>
                                </div>
                                <a
                                    href={item.link || item.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="sd-btn-primary"
                                >
                                    <FaDownload size={12} />
                                    <span>Access</span>
                                </a>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)', background: '#f9fafb', borderRadius: 'var(--radius-md)' }}>
                        <FaInbox size={32} style={{ marginBottom: '1rem', opacity: 0.2 }} />
                        <p style={{ fontSize: '0.9rem' }}>No learning materials found with the current filters.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudentAcademics;
