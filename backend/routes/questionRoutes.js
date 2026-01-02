const express = require('express');
const router = express.Router();
const Question = require('../models/Question');
const StudentProgress = require('../models/StudentProgress');
const Student = require('../models/Student');

// Get questions by subject/course and difficulty
router.get('/questions', async (req, res) => {
  try {
    const { subject, course, difficulty, limit = 10, year, branch } = req.query;

    const query = { isActive: true };

    if (subject) query.subject = subject;
    if (course) query.course = course;
    if (difficulty) query.difficulty = difficulty;
    if (year) query.year = year;
    if (branch && branch !== 'All') query.branch = { $in: [branch, 'All'] };

    let questions = await Question.find(query)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 })
      .select('-correctAnswer'); // Don't send correct answer initially

    // Fallback Mock Data if no questions found (For Advanced Hub Demo)
    if (questions.length === 0 && (course || subject)) {
      const target = course || subject;
      const mockQuestions = Array.from({ length: 5 }).map((_, i) => ({
        _id: `mock-${target}-${i}`,
        id: `mock-${target}-${i}`,
        question: `Sample ${target} Question ${i + 1}: What is a core concept of ${target}?`,
        options: [
          `It is a fundamental concept`,
          `It is unrelated`,
          `It is incorrect`,
          `None of the above`
        ],
        // Note: For mocks, we'll assume index 0 is always correct in the submit handler
      }));
      return res.json(mockQuestions);
    }

    res.json(questions);
  } catch (error) {
    console.error('Error fetching questions:', error);
    res.status(500).json({ error: 'Failed to fetch questions' });
  }
});

// Get question with answer (for checking)
router.get('/questions/:questionId/answer', async (req, res) => {
  try {
    const question = await Question.findById(req.params.questionId);
    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }
    res.json({
      correctAnswer: question.correctAnswer,
      explanation: question.explanation
    });
  } catch (error) {
    console.error('Error fetching answer:', error);
    res.status(500).json({ error: 'Failed to fetch answer' });
  }
});

// Submit test answers
router.post('/tests/submit', async (req, res) => {
  try {
    const { studentId, subject, course, difficulty, answers } = req.body;

    if (!studentId || !answers || !Array.isArray(answers)) {
      return res.status(400).json({ error: 'Invalid request data' });
    }

    // Get questions with correct answers
    const questionIds = answers.map(a => a.questionId);

    // Separate real and mock IDs
    const realIds = questionIds.filter(id => !id.startsWith('mock-'));
    const mockIds = questionIds.filter(id => id.startsWith('mock-'));

    const questions = await Question.find({ _id: { $in: realIds } });

    // Calculate score
    let score = 0;
    const results = answers.map(answer => {
      let isCorrect = false;
      let explanation = '';
      let correctAnswer = null;

      if (answer.questionId.startsWith('mock-')) {
        // Mock Logic: Index 0 is correct
        isCorrect = answer.selectedAnswer === 0;
        correctAnswer = 0;
        explanation = "This is a sample question for demonstration purposes.";
      } else {
        const question = questions.find(q => q._id.toString() === answer.questionId);
        if (question) {
          isCorrect = question.correctAnswer === answer.selectedAnswer;
          correctAnswer = question.correctAnswer;
          explanation = question.explanation;
        }
      }

      if (isCorrect) score++;

      return {
        questionId: answer.questionId,
        selectedAnswer: answer.selectedAnswer,
        isCorrect,
        correctAnswer,
        explanation
      };
    });

    const total = answers.length;
    const percentage = Math.round((score / total) * 100);

    // Update or create student progress
    let progress = await StudentProgress.findOne({
      studentId,
      $or: [
        { subject: subject || null },
        { course: course || null }
      ]
    });

    if (!progress) {
      progress = new StudentProgress({
        studentId,
        subject: subject || null,
        course: course || null,
        currentLevel: difficulty || 'easy'
      });
    }

    // Update level-specific stats
    const levelKey = difficulty || 'easy';
    progress[levelKey].totalQuestions += total;
    progress[levelKey].correctAnswers += score;
    progress[levelKey].attempts += 1;
    progress[levelKey].lastAttempt = new Date();

    // Update overall stats
    progress.totalMarks += score;
    progress.averageScore = (progress.averageScore * (progress.testHistory.length) + percentage) / (progress.testHistory.length + 1);
    if (percentage > progress.bestScore) {
      progress.bestScore = percentage;
    }

    // Add to test history
    progress.testHistory.push({
      testId: `test_${Date.now()}`,
      difficulty: difficulty || 'easy',
      score,
      total,
      percentage,
      date: new Date(),
      questions: results.map(r => ({
        questionId: r.questionId,
        selectedAnswer: r.selectedAnswer,
        isCorrect: r.isCorrect
      }))
    });

    // Update daily questions
    const today = new Date().toDateString();
    let dailyEntry = progress.dailyQuestions.find(d => new Date(d.date).toDateString() === today);
    if (!dailyEntry) {
      dailyEntry = { date: new Date(), questionsAttempted: 0, correctAnswers: 0 };
      progress.dailyQuestions.push(dailyEntry);
    }
    dailyEntry.questionsAttempted += total;
    dailyEntry.correctAnswers += score;

    // Unlock next level if criteria met
    progress.unlockNextLevel();

    await progress.save();

    // Update question statistics
    for (const result of results) {
      await Question.findByIdAndUpdate(result.questionId, {
        $inc: {
          attempts: 1,
          correctAttempts: result.isCorrect ? 1 : 0
        }
      });
    }

    // Update student test results
    const student = await Student.findOne({ sid: studentId });
    if (student) {
      student.testResults.push({
        testId: `test_${Date.now()}`,
        subject: subject || course || 'General',
        level: difficulty || 'easy',
        score,
        total,
        percentage,
        status: percentage >= 60 ? 'Pass' : 'Fail',
        date: new Date()
      });
      await student.save();
    }

    res.json({
      success: true,
      score,
      total,
      percentage,
      status: percentage >= 60 ? 'Pass' : 'Fail',
      results,
      progress: {
        currentLevel: progress.currentLevel,
        easy: {
          unlocked: progress.easy.unlocked,
          correctAnswers: progress.easy.correctAnswers,
          totalQuestions: progress.easy.totalQuestions
        },
        medium: {
          unlocked: progress.medium.unlocked,
          correctAnswers: progress.medium.correctAnswers,
          totalQuestions: progress.medium.totalQuestions
        },
        hard: {
          unlocked: progress.hard.unlocked,
          correctAnswers: progress.hard.correctAnswers,
          totalQuestions: progress.hard.totalQuestions
        },
        averageScore: progress.averageScore,
        bestScore: progress.bestScore
      }
    });
  } catch (error) {
    console.error('Error submitting test:', error);
    res.status(500).json({ error: 'Failed to submit test' });
  }
});

// Get student progress
router.get('/progress/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    const { subject, course } = req.query;

    const query = { studentId };
    if (subject) query.subject = subject;
    if (course) query.course = course;

    const progress = await StudentProgress.find(query).sort({ lastUpdated: -1 });

    res.json(progress);
  } catch (error) {
    console.error('Error fetching progress:', error);
    res.status(500).json({ error: 'Failed to fetch progress' });
  }
});

// Get student progress for a specific subject/course
router.get('/progress/:studentId/:subjectOrCourse', async (req, res) => {
  try {
    const { studentId, subjectOrCourse } = req.params;
    const isCourse = req.query.type === 'course';

    const progress = await StudentProgress.findOne({
      studentId,
      [isCourse ? 'course' : 'subject']: subjectOrCourse
    });

    if (!progress) {
      return res.json({
        studentId,
        [isCourse ? 'course' : 'subject']: subjectOrCourse,
        currentLevel: 'easy',
        easy: { unlocked: true, totalQuestions: 0, correctAnswers: 0, attempts: 0 },
        medium: { unlocked: false, totalQuestions: 0, correctAnswers: 0, attempts: 0 },
        hard: { unlocked: false, totalQuestions: 0, correctAnswers: 0, attempts: 0 },
        totalMarks: 0,
        averageScore: 0,
        bestScore: 0
      });
    }

    res.json(progress);
  } catch (error) {
    console.error('Error fetching progress:', error);
    res.status(500).json({ error: 'Failed to fetch progress' });
  }
});

// Get daily questions count
router.get('/daily/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    const today = new Date().toDateString();

    const progress = await StudentProgress.find({ studentId });
    let totalToday = 0;
    let correctToday = 0;

    progress.forEach(p => {
      const daily = p.dailyQuestions.find(d => new Date(d.date).toDateString() === today);
      if (daily) {
        totalToday += daily.questionsAttempted;
        correctToday += daily.correctAnswers;
      }
    });

    res.json({
      date: today,
      questionsAttempted: totalToday,
      correctAnswers: correctToday,
      accuracy: totalToday > 0 ? Math.round((correctToday / totalToday) * 100) : 0
    });
  } catch (error) {
    console.error('Error fetching daily stats:', error);
    res.status(500).json({ error: 'Failed to fetch daily stats' });
  }
});

// Admin: Get All Student Progress
router.get('/admin/all-progress', async (req, res) => {
  try {
    // Ideally add admin middleware check here or in index.js usage
    const allProgress = await StudentProgress.find()
      .populate('studentId', 'name sid branch year section') // Populate student details
      .sort({ lastUpdated: -1 });

    res.json(allProgress);
  } catch (error) {
    console.error('Error fetching all progress:', error);
    res.status(500).json({ error: 'Failed to fetch all progress' });
  }
});

module.exports = router;

