import React, { useState, useEffect } from 'react';
import { FaLaptopCode, FaArrowLeft, FaPlay, FaChevronLeft, FaChevronRight, FaTerminal, FaCode } from 'react-icons/fa';
import { getCourseContent } from './advancedContentData';
import TestInterface from './TestInterface';

// Branch Data (Simplified)
const BRANCH_COURSES = {
    CSE: {
        title: "Computer Science",
        categories: {
            "Core Programming": ["Python", "Java", "C++", "JavaScript"],
            "Web Stack": ["React", "Node.js", "HTML/CSS", "MongoDB"],
            "Advanced Tech": ["Machine Learning", "Cloud Computing", "Cyber Security"]
        }
    },
    ECE: {
        title: "Electronics & Comm.",
        categories: {
            "Core Electronics": ["Analog Electronics", "Digital Electronics", "Microcontrollers"],
            "Communication": ["Wireless Comm", "Signal Processing", "IoT"]
        }
    },
    DEFAULT: {
        title: "General Engineering",
        categories: {
            "Foundation": ["Python", "C Programming", "Java"],
            "Professional": ["Communication", "Project Management"]
        }
    }
};

const StudentTechnical = ({ studentData }) => {
    const [view, setView] = useState('catalog');
    const [courses, setCourses] = useState({});
    const [activeCourse, setActiveCourse] = useState(null);
    const [topicIndex, setTopicIndex] = useState(0);
    const [topics, setTopics] = useState([]);

    useEffect(() => {
        const branch = studentData.branch || 'CSE';
        const data = BRANCH_COURSES[branch] || BRANCH_COURSES.DEFAULT;
        setCourses(data.categories);
    }, [studentData.branch]);

    const handleOpenCourse = (course) => {
        const content = getCourseContent(course);
        if (content && content.topics) {
            setActiveCourse(course);
            setTopics(content.topics);
            setTopicIndex(0);
            setView('viewer');
        } else {
            alert("Content module initialization...");
        }
    }

    const renderCatalog = () => (
        <div className="animate-fade-in">
            {Object.entries(courses).map(([category, list]) => (
                <div key={category} className="sd-card">
                    <h3 className="sd-section-title" style={{ fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)' }}>
                        {category}
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
                        {list.map(course => (
                            <div key={course} style={{
                                border: '1px solid var(--border-subtle)',
                                borderRadius: 'var(--radius-md)',
                                padding: '1.5rem',
                                background: 'var(--surface)',
                                transition: 'all 0.15s ease'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                    <div style={{ padding: '0.5rem', borderRadius: '6px', background: '#eff6ff', color: 'var(--primary)' }}>
                                        <FaCode size={18} />
                                    </div>
                                    <span style={{ fontSize: '0.75rem', fontWeight: 600, background: '#f3f4f6', padding: '2px 8px', borderRadius: '4px', color: 'var(--text-secondary)' }}>MODULE</span>
                                </div>
                                <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-main)', fontSize: '1.1rem' }}>{course}</h4>
                                <p style={{ margin: '0 0 1.5rem 0', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                    Comprehensive module covering core concepts and advanced patterns.
                                </p>
                                <button onClick={() => handleOpenCourse(course)} className="sd-btn-secondary" style={{ width: '100%', justifyContent: 'center' }}>
                                    Launch Course
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );

    const renderViewer = () => (
        <div className="sd-card animate-fade-in" style={{ padding: 0, height: 'calc(100vh - 140px)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {/* Viewer Header */}
            <div style={{
                height: 60, borderBottom: '1px solid var(--border-subtle)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: '1.5rem', background: 'white', padding: '0 1.5rem'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <button onClick={() => setView('catalog')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                        <FaArrowLeft />
                    </button>
                    <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{activeCourse}</span>
                    <span style={{ color: 'var(--border-strong)' }}>/</span>
                    <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{topics[topicIndex]?.title}</span>
                </div>
                <button onClick={() => setView('test')} className="sd-btn-primary">
                    Take Assessment
                </button>
            </div>

            <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
                {/* Sidebar Navigation */}
                <div style={{ width: 280, borderRight: '1px solid var(--border-subtle)', background: '#f9fafb', overflowY: 'auto' }}>
                    <div style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-tertiary)' }}>
                        Course Outline
                    </div>
                    {topics.map((t, idx) => (
                        <div
                            key={idx}
                            onClick={() => setTopicIndex(idx)}
                            style={{
                                padding: '0.75rem 1rem',
                                cursor: 'pointer',
                                background: idx === topicIndex ? 'white' : 'transparent',
                                color: idx === topicIndex ? 'var(--primary)' : 'var(--text-secondary)',
                                borderLeft: idx === topicIndex ? '3px solid var(--primary)' : '3px solid transparent',
                                fontWeight: idx === topicIndex ? 500 : 400,
                                borderBottom: '1px solid var(--border-subtle)'
                            }}
                        >
                            {t.title}
                        </div>
                    ))}
                </div>

                {/* Content Area */}
                <div style={{ flex: 1, padding: '3rem', overflowY: 'auto', background: 'white' }}>
                    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                        {topics[topicIndex] && (
                            <>
                                <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '2rem', color: 'var(--text-main)' }}>{topics[topicIndex].title}</h1>
                                <div style={{ fontSize: '1.1rem', lineHeight: 1.7, color: 'var(--text-secondary)', marginBottom: '3rem' }} dangerouslySetInnerHTML={{ __html: topics[topicIndex].content }} />

                                {topics[topicIndex].code && (
                                    <div style={{ border: '1px solid var(--border-subtle)', borderRadius: '8px', overflow: 'hidden', marginBottom: '3rem' }}>
                                        <div style={{ background: '#f3f4f6', padding: '0.5rem 1rem', borderBottom: '1px solid var(--border-subtle)', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                            <FaTerminal size={12} color="var(--text-tertiary)" />
                                            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Code Example</span>
                                        </div>
                                        <div style={{ background: '#0f172a', padding: '1.5rem', overflowX: 'auto' }}>
                                            <pre style={{ margin: 0, fontFamily: 'monospace', fontSize: '0.9rem', color: '#e2e8f0' }}><code>{topics[topicIndex].code}</code></pre>
                                        </div>
                                    </div>
                                )}

                                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '2rem', borderTop: '1px solid var(--border-subtle)' }}>
                                    <button
                                        disabled={topicIndex === 0}
                                        onClick={() => setTopicIndex(i => i - 1)}
                                        className="sd-btn-secondary"
                                        style={{ opacity: topicIndex === 0 ? 0.5 : 1 }}
                                    >
                                        <FaChevronLeft style={{ marginRight: '6px' }} /> Previous
                                    </button>
                                    <button
                                        disabled={topicIndex === topics.length - 1}
                                        onClick={() => setTopicIndex(i => i + 1)}
                                        className="sd-btn-primary"
                                    >
                                        Next Lesson <FaChevronRight style={{ marginLeft: '6px' }} />
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="animate-fade-in">
            {view === 'catalog' && renderCatalog()}
            {view === 'viewer' && renderViewer()}
            {view === 'test' && (
                <div className="sd-card">
                    <button onClick={() => setView('viewer')} className="sd-btn-secondary" style={{ marginBottom: '1.5rem' }}>
                        <FaArrowLeft style={{ marginRight: '6px' }} /> Return to Course
                    </button>
                    <TestInterface
                        studentId={studentData.sid}
                        course={activeCourse}
                        onClose={() => setView('viewer')}
                        onComplete={() => alert('Assessment recorded.')}
                    />
                </div>
            )}
        </div>
    );
};

export default StudentTechnical;
