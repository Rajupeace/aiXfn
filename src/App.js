import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginRegister from './Components/LoginRegister/LoginRegister';
import StudentDashboard from './Components/StudentDashboard/StudentDashboard';
import SemesterNotes from './Components/StudentDashboard/SemesterNotes';
import AdvancedNotes from './Components/StudentDashboard/AdvancedNotes';
import AdminDashboard from './Components/AdminDashboard/AdminDashboard';
import FacultyDashboard from './Components/FacultyDashboard/FacultyDashboard';
import AdvancedLearning from './Components/StudentDashboard/AdvancedLearning';
import AdvancedVideos from './Components/StudentDashboard/AdvancedVideos';
import InterviewQA from './Components/StudentDashboard/InterviewQA';
import AdvancedCourseMaterials from './Components/StudentDashboard/AdvancedCourseMaterials';
import './App.css';

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false); // New state to track auth check
    const [studentData, setStudentData] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [isFaculty, setIsFaculty] = useState(false);
    const [facultyData, setFacultyData] = useState(null);

    // Restore session from localStorage on mount
    useEffect(() => {
        const restoreSession = () => {
            const storedUserData = localStorage.getItem('userData');
            if (storedUserData) {
                try {
                    const user = JSON.parse(storedUserData);
                    if (user.role === 'admin') {
                        setIsAdmin(true);
                        setIsAuthenticated(true);
                    } else if (user.role === 'faculty') {
                        setIsFaculty(true);
                        setFacultyData(user);
                        setIsAuthenticated(true);
                    } else if (user.role === 'student') {
                        setStudentData(user);
                        setIsAuthenticated(true);
                    }
                } catch (e) {
                    console.error("Failed to restore session", e);
                    localStorage.removeItem('userData'); // Clear corrupted data
                }
            }
            setIsInitialized(true); // Mark init as done regardless of result
        };

        restoreSession();
    }, []);

    console.log('App State:', { isInitialized, isAuthenticated, studentData }); // Debug log

    // Prevent routing until we have checked for an existing session
    if (!isInitialized) {
        return <div className="app-loader" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#0f172a', color: 'white' }}>
            <div className="loader-spinner" style={{ width: '40px', height: '40px', border: '3px solid rgba(255,255,255,0.1)', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            <div style={{ fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', fontSize: '0.8rem', opacity: 0.8 }}>Initializing Friendly Notebook</div>
        </div>;
    }

    const rootElement = (() => {
        if (!isAuthenticated) return (
            <LoginRegister
                setIsAuthenticated={setIsAuthenticated}
                setStudentData={setStudentData}
                setIsAdmin={setIsAdmin}
                setIsFaculty={setIsFaculty}
                setFacultyData={setFacultyData}
            />
        );
        if (isAdmin) return <Navigate to="/admin" replace />;
        if (isFaculty) return <Navigate to="/faculty" replace />;
        return <Navigate to="/dashboard" replace />;
    })();

    return (
        <Router>
            <div className="App">
                <Routes>
                    <Route path="/" element={rootElement} />
                    <Route
                        path="/dashboard"
                        element={
                            isAuthenticated && studentData && !isAdmin ?
                                <StudentDashboard
                                    studentData={studentData}
                                    onLogout={() => {
                                        setIsAuthenticated(false);
                                        setStudentData(null);
                                        localStorage.removeItem('studentToken');
                                        localStorage.removeItem('userData');
                                    }}
                                /> :
                                <Navigate to="/" replace />
                        }
                    />
                    <Route
                        path="/semester-notes"
                        element={
                            isAuthenticated && studentData && !isAdmin ?
                                <SemesterNotes /> :
                                <Navigate to="/" replace />
                        }
                    />
                    <Route
                        path="/advanced-learning"
                        element={
                            isAuthenticated && studentData && !isAdmin ?
                                <AdvancedLearning /> :
                                <Navigate to="/" replace />
                        }
                    />
                    <Route
                        path="/advanced-notes"
                        element={
                            isAuthenticated && studentData && !isAdmin ?
                                <AdvancedNotes /> :
                                <Navigate to="/" replace />
                        }
                    />
                    <Route
                        path="/advanced-materials/:courseName/:type"
                        element={
                            isAuthenticated && studentData && !isAdmin ?
                                <AdvancedCourseMaterials studentData={studentData} /> :
                                <Navigate to="/" replace />
                        }
                    />
                    <Route
                        path="/advanced-videos"
                        element={
                            isAuthenticated && studentData && !isAdmin ?
                                <AdvancedVideos /> :
                                <Navigate to="/" replace />
                        }
                    />
                    <Route
                        path="/interview-qa"
                        element={
                            isAuthenticated && studentData && !isAdmin ?
                                <InterviewQA /> :
                                <Navigate to="/" replace />
                        }
                    />
                    <Route
                        path="/admin"
                        element={
                            isAuthenticated && isAdmin ?
                                <AdminDashboard
                                    setIsAuthenticated={setIsAuthenticated}
                                    setIsAdmin={setIsAdmin}
                                    setStudentData={setStudentData}
                                /> :
                                <Navigate to="/" replace />
                        }
                    />
                    {/* Catch all route */}
                    <Route
                        path="/faculty"
                        element={
                            isAuthenticated && isFaculty ?
                                <FacultyDashboard
                                    facultyData={facultyData}
                                    setIsAuthenticated={setIsAuthenticated}
                                    setIsFaculty={setIsFaculty}
                                /> :
                                <Navigate to="/" replace />
                        }
                    />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;
