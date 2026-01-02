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
import RocketSplash from './Components/RocketSplash/RocketSplash';
import ThemeToggle from './Components/ThemeToggle/ThemeToggle';
import AnnouncementTicker from './Components/AnnouncementTicker/AnnouncementTicker';

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);
    const [showSplash, setShowSplash] = useState(true);
    const [studentData, setStudentData] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [isFaculty, setIsFaculty] = useState(false);
    const [facultyData, setFacultyData] = useState(null);


    const userRole = isAdmin ? 'admin' : isFaculty ? 'faculty' : 'student';
    const currentUser = studentData || facultyData || { studentName: 'Administrator' };

    // Restore session from localStorage on mount
    useEffect(() => {
        const restoreSession = () => {
            const storedUserData = localStorage.getItem('userData');
            if (storedUserData) {
                try {
                    const user = JSON.parse(storedUserData);
                    if (user.role === 'admin') {
                        const token = localStorage.getItem('adminToken');
                        if (token) {
                            setIsAdmin(true);
                            setIsAuthenticated(true);
                        } else {
                            console.warn('Session restore failed: Admin token missing');
                            localStorage.removeItem('userData'); // Incomplete session
                        }
                    } else if (user.role === 'faculty') {
                        const token = localStorage.getItem('facultyToken');
                        if (token) {
                            setIsFaculty(true);
                            setFacultyData(user);
                            setIsAuthenticated(true);
                        } else {
                            console.warn('Session restore failed: Faculty token missing');
                            localStorage.removeItem('userData');
                        }
                    } else if (user.role === 'student') {
                        const token = localStorage.getItem('studentToken');
                        if (token) {
                            setStudentData(user);
                            setIsAuthenticated(true);
                        } else {
                            console.warn('Session restore failed: Student token missing');
                            localStorage.removeItem('userData');
                        }
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

    useEffect(() => {
        if (isInitialized) {
            // We no longer auto-hide splash. User must touch it.
            // But we can add a small safety timeout if needed.
        }
    }, [isInitialized]);

    console.log('App State:', { isInitialized, isAuthenticated, studentData }); // Debug log

    // Pre-mount Login/App behind Splash to fix lag
    return (
        <>
            {showSplash && <RocketSplash onFinish={() => setShowSplash(false)} />}

            {!isAuthenticated ? (
                <LoginRegister
                    setIsAuthenticated={setIsAuthenticated}
                    setStudentData={setStudentData}
                    setIsAdmin={setIsAdmin}
                    setIsFaculty={setIsFaculty}
                    setFacultyData={setFacultyData}
                />
            ) : null}

            {isAuthenticated && (
                <Router>
                    <div className="app-container">
                        <ThemeToggle />
                        <Routes>
                            {/* Root Route: Redirect based on role */}
                            <Route path="/" element={<Navigate to={
                                userRole === 'admin' ? "/admin-dashboard" :
                                    userRole === 'faculty' ? "/faculty-dashboard" :
                                        "/student-dashboard"
                            } replace />} />

                            {/* Student Routes */}
                            <Route path="/student-dashboard" element={<StudentDashboard
                                studentData={currentUser}
                                onLogout={() => {
                                    localStorage.clear();
                                    setIsAuthenticated(false);
                                    setStudentData(null);
                                }}
                            />} />
                            <Route path="/semester-notes" element={<SemesterNotes studentData={currentUser} />} />
                            <Route path="/advanced-notes" element={<AdvancedNotes studentData={currentUser} />} />
                            <Route path="/advanced-learning" element={<AdvancedLearning studentData={currentUser} />} />
                            <Route path="/advanced-videos" element={<AdvancedVideos studentData={currentUser} />} />
                            <Route path="/interview-qa" element={<InterviewQA studentData={currentUser} />} />
                            <Route path="/advanced-course-materials" element={<AdvancedCourseMaterials studentData={currentUser} />} />

                            {/* Admin Routes */}
                            <Route path="/admin-dashboard" element={
                                isAdmin ? <AdminDashboard
                                    setIsAdmin={setIsAdmin}
                                    setIsAuthenticated={setIsAuthenticated}
                                    setStudentData={setStudentData}
                                /> : <Navigate to="/" replace />
                            } />

                            {/* Faculty Routes */}
                            <Route path="/faculty-dashboard" element={
                                <FacultyDashboard
                                    facultyData={currentUser}
                                    setIsAuthenticated={setIsAuthenticated}
                                    setIsFaculty={setIsFaculty}
                                />
                            } />

                            {/* Fallback */}
                            <Route path="*" element={<Navigate to="/" replace />} />
                        </Routes>
                    </div>
                </Router>
            )}
        </>
    );

}

export default App;
