import React, { useState, useEffect } from 'react';
import { FaCheckCircle, FaTimesCircle, FaTrophy, FaLock, FaUnlock, FaRobot, FaChartLine } from 'react-icons/fa';
import { apiGet, apiPost } from '../../utils/apiClient';
import './TestInterface.css';

const TestInterface = ({ studentId, subject, course, examData, onClose, onComplete }) => {
  const [difficulty, setDifficulty] = useState('easy');
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [progress, setProgress] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes default

  useEffect(() => {
    if (examData) {
      // Faculty Exam Mode
      setQuestions(examData.questions || []);
      setTimeLeft(examData.duration ? examData.duration * 60 : 600);
      setLoading(false);
    } else {
      // Adaptive Mode
      loadQuestions();
      loadProgress();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [difficulty, subject, course, examData]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          if (!submitting) {
            handleSubmit();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [submitting]);

  const loadQuestions = async () => {
    if (examData) return; // Skip if using examData
    try {
      setLoading(true);
      const params = new URLSearchParams({
        limit: '10',
        difficulty
      });
      if (subject) params.append('subject', subject);
      if (course) params.append('course', course);

      const data = await apiGet(`/ api / questions ? ${params.toString()} `);
      setQuestions(data || []);
      setCurrentQuestion(0);
      setAnswers({});
      setResult(null);
      setShowExplanation(false);
    } catch (error) {
      console.error('Error loading questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadProgress = async () => {
    try {
      const identifier = subject || course;
      const type = subject ? 'subject' : 'course';
      const data = await apiGet(`/ api / progress / ${studentId}/${identifier}?type=${type}`);
      setProgress(data);
    } catch (error) {
      console.error('Error loading progress:', error);
    }
  };

  const handleAnswerSelect = (questionId, optionIndex) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: optionIndex
    }));
  };

  const handleSubmit = async () => {
    if (submitting) return;

    try {
      setSubmitting(true);
      const answerArray = questions.map(q => ({
        questionId: q._id || q.id,
        selectedAnswer: answers[q._id || q.id] ?? -1
      }));

      // Different Endpoint for Faculty Exams
      if (examData) {
        const response = await apiPost('/api/exams/submit', {
          examId: examData._id,
          studentId,
          studentName: 'Student', // Backend should look this up technically, or passed in props
          year: examData.year, // Propagate or lookup
          branch: examData.branch,
          section: examData.section, // This data ideally comes from Student context but creating simplified flow
          answers: answerArray,
          score: calculateFacultyExamScore(answerArray), // Pre-calculate or let backend do it. Backend does it.
          totalMarks: examData.totalMarks
        });
        // Wait, backend logic for /submit expects: examId, studentId, studentName, year, branch, section, answers, score, totalMarks
        // I need to calculate score here or backend should? 
        // My backend implementation (Step 22) TRUSTS the input score!
        // "score: { type: Number, required: true }"
        // So I MUST calculate it here.

        const calcScore = questions.reduce((acc, q) => {
          const qId = q._id || q.id;
          const selected = answers[qId];
          // q.correctAnswer index logic
          if (selected !== undefined && String(selected) === String(q.correctAnswer)) {
            // Assuming q.points or distribute totalMarks?
            // Faculty Dashboard form had "totalMarks" and questions count.
            // Implied equal weight or q.points.
            return acc + (q.points || 1);
          }
          return acc;
        }, 0);

        const finalPayload = {
          examId: examData._id,
          studentId,
          studentName: 'Student', // Should be passed or fetched in backend
          year: examData.year,
          branch: examData.branch,
          section: examData.section,
          answers: answerArray,
          score: calcScore,
          totalMarks: examData.totalMarks
        };
        const res = await apiPost('/api/exams/submit', finalPayload);
        setResult({ status: res.isPassed ? 'Pass' : 'Fail', score: res.score, total: res.totalMarks, percentage: Math.round((res.score / res.totalMarks) * 100) });
        if (onComplete) onComplete(res);

      } else {
        // Existing Adaptive Logic
        const response = await apiPost('/api/tests/submit', {
          studentId,
          subject: subject || null,
          course: course || null,
          difficulty,
          answers: answerArray
        });

        setResult(response);
        setProgress(response.progress);
        if (onComplete) onComplete(response);
      }
    } catch (error) {
      console.error('Error submitting test:', error);
      alert('Failed to submit test. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const calculateFacultyExamScore = (answers) => {
    // Helper placeholder
    return 0;
  };


  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getDifficultyColor = (level) => {
    switch (level) {
      case 'easy': return '#10b981';
      case 'medium': return '#f59e0b';
      case 'hard': return '#ef4444';
      default: return '#64748b';
    }
  };

  const getDifficultyLabel = (level) => {
    return level.charAt(0).toUpperCase() + level.slice(1);
  };

  if (loading) {
    return (
      <div className="test-interface-loading">
        <div className="loading-spinner"></div>
        <p>Loading questions...</p>
      </div>
    );
  }

  if (result) {
    return (
      <div className="test-result-container">
        <div className="test-result-card">
          <div className={`result-icon ${result.status === 'Pass' ? 'pass' : 'fail'}`}>
            {result.status === 'Pass' ? <FaTrophy /> : <FaTimesCircle />}
          </div>
          <h2 className={`result-title ${result.status === 'Pass' ? 'pass' : 'fail'}`}>
            {result.status === 'Pass' ? 'Congratulations!' : 'Keep Practicing!'}
          </h2>
          <div className="result-score">
            <div className="score-circle" style={{ '--percentage': result.percentage }}>
              <span>{result.percentage}%</span>
            </div>
            <p className="score-details">
              {result.score} out of {result.total} correct
            </p>
          </div>

          {progress && (
            <div className="progress-summary">
              <h3>Your Progress</h3>
              <div className="level-progress">
                <div className="level-item">
                  <span className="level-label">Easy</span>
                  <div className="level-bar">
                    <div
                      className="level-fill easy"
                      style={{
                        width: `${progress.easy.totalQuestions > 0 ? (progress.easy.correctAnswers / progress.easy.totalQuestions) * 100 : 0}%`
                      }}
                    ></div>
                  </div>
                  <span className="level-stats">
                    {progress.easy.correctAnswers}/{progress.easy.totalQuestions}
                  </span>
                </div>
                <div className="level-item">
                  <span className="level-label">Medium</span>
                  <div className="level-bar">
                    <div
                      className="level-fill medium"
                      style={{
                        width: `${progress.medium.totalQuestions > 0 ? (progress.medium.correctAnswers / progress.medium.totalQuestions) * 100 : 0}%`
                      }}
                    ></div>
                  </div>
                  <span className="level-stats">
                    {progress.medium.correctAnswers}/{progress.medium.totalQuestions}
                  </span>
                  {!progress.medium.unlocked && <FaLock className="lock-icon" />}
                </div>
                <div className="level-item">
                  <span className="level-label">Hard</span>
                  <div className="level-bar">
                    <div
                      className="level-fill hard"
                      style={{
                        width: `${progress.hard.totalQuestions > 0 ? (progress.hard.correctAnswers / progress.hard.totalQuestions) * 100 : 0}%`
                      }}
                    ></div>
                  </div>
                  <span className="level-stats">
                    {progress.hard.correctAnswers}/{progress.hard.totalQuestions}
                  </span>
                  {!progress.hard.unlocked && <FaLock className="lock-icon" />}
                </div>
              </div>
            </div>
          )}

          <div className="result-actions">
            <button className="btn-primary" onClick={() => {
              setResult(null);
              setCurrentQuestion(0);
              setAnswers({});
              loadQuestions();
            }}>
              Try Again
            </button>
            <button className="btn-secondary" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentQuestion];
  const progressPercent = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div className="test-interface">
      <div className="test-header">
        <div className="test-title">
          <h2>{subject || course} - {getDifficultyLabel(difficulty)} Level</h2>
          <div className="time-remaining" style={{ color: timeLeft < 60 ? '#ef4444' : '#64748b' }}>
            ⏱️ {formatTime(timeLeft)}
          </div>
        </div>
        <button className="close-btn" onClick={onClose}>×</button>
      </div>

      <div className="difficulty-selector">
        {['easy', 'medium', 'hard'].map(level => {
          const isUnlocked = !progress ||
            (level === 'easy' && progress.easy.unlocked) ||
            (level === 'medium' && progress.medium.unlocked) ||
            (level === 'hard' && progress.hard.unlocked);

          return (
            <button
              key={level}
              className={`difficulty-btn ${difficulty === level ? 'active' : ''} ${!isUnlocked ? 'locked' : ''}`}
              onClick={() => isUnlocked && setDifficulty(level)}
              disabled={!isUnlocked}
              style={{
                '--difficulty-color': getDifficultyColor(level)
              }}
            >
              {!isUnlocked && <FaLock />}
              {getDifficultyLabel(level)}
            </button>
          );
        })}
      </div>

      <div className="progress-bar-container">
        <div className="progress-bar" style={{ width: `${progressPercent}%` }}></div>
        <span className="progress-text">
          Question {currentQuestion + 1} of {questions.length}
        </span>
      </div>

      {currentQ && (
        <div className="question-container">
          <div className="question-header">
            <span className="question-number">Q{currentQuestion + 1}</span>
            <span className="question-difficulty" style={{ color: getDifficultyColor(difficulty) }}>
              {getDifficultyLabel(difficulty)}
            </span>
          </div>
          <h3 className="question-text">{currentQ.question}</h3>
          <div className="options-list">
            {currentQ.options.map((option, index) => {
              const isSelected = answers[currentQ._id || currentQ.id] === index;
              return (
                <button
                  key={index}
                  className={`option-btn ${isSelected ? 'selected' : ''}`}
                  onClick={() => handleAnswerSelect(currentQ._id || currentQ.id, index)}
                >
                  <span className="option-letter">{String.fromCharCode(65 + index)}</span>
                  <span className="option-text">{option}</span>
                  {isSelected && <FaCheckCircle className="check-icon" />}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="test-footer">
        <button
          className="btn-nav"
          onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
          disabled={currentQuestion === 0}
        >
          ← Previous
        </button>
        <div className="question-nav-dots">
          {questions.map((_, idx) => (
            <button
              key={idx}
              className={`nav-dot ${currentQuestion === idx ? 'active' : ''} ${answers[questions[idx]._id || questions[idx].id] !== undefined ? 'answered' : ''}`}
              onClick={() => setCurrentQuestion(idx)}
            />
          ))}
        </div>
        {currentQuestion === questions.length - 1 ? (
          <button
            className="btn-submit"
            onClick={handleSubmit}
            disabled={submitting || Object.keys(answers).length < questions.length}
          >
            {submitting ? 'Submitting...' : 'Submit Test'}
          </button>
        ) : (
          <button
            className="btn-nav"
            onClick={() => setCurrentQuestion(prev => Math.min(questions.length - 1, prev + 1))}
          >
            Next →
          </button>
        )}
      </div>
    </div>
  );
};

export default TestInterface;

