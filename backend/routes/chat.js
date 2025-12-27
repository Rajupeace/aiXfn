const express = require('express');
const OpenAI = require('openai');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const router = express.Router();

// Import role-specific knowledge bases
const studentKnowledge = require('../knowledge/studentKnowledge');
const facultyKnowledge = require('../knowledge/facultyKnowledge');
const adminKnowledge = require('../knowledge/adminKnowledge');

console.log('✅ Chat routes initialized with role-specific knowledge bases');

const dataDir = path.join(__dirname, '..', 'data');
const chatHistoryPath = path.join(dataDir, 'chatHistory.json');

function ensureChatHistoryStore() {
    try {
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }
        if (!fs.existsSync(chatHistoryPath)) {
            fs.writeFileSync(chatHistoryPath, JSON.stringify([]));
        }
    } catch (err) {
        console.error('[VuAiAgent] Failed to initialize chat history store:', err.message);
    }
}

function readChatHistory() {
    try {
        ensureChatHistoryStore();
        const raw = fs.readFileSync(chatHistoryPath, 'utf8') || '[]';
        return JSON.parse(raw);
    } catch (err) {
        console.error('[VuAiAgent] Failed to read chat history:', err.message);
        return [];
    }
}

function writeChatHistory(history) {
    try {
        ensureChatHistoryStore();
        fs.writeFileSync(chatHistoryPath, JSON.stringify(history, null, 2));
    } catch (err) {
        console.error('[VuAiAgent] Failed to write chat history:', err.message);
    }
}

function appendChatEntry(entry) {
    const history = readChatHistory();
    history.push(entry);
    // Keep the file from growing indefinitely (retain latest 500 conversations)
    const MAX_ENTRIES = 500;
    const trimmed = history.length > MAX_ENTRIES ? history.slice(history.length - MAX_ENTRIES) : history;
    writeChatHistory(trimmed);
}

// Helper function to find matching knowledge
function findKnowledgeMatch(userMessage, knowledgeBase, context) {
    const lowerMessage = userMessage.toLowerCase();

    // Check each knowledge category
    for (const [category, data] of Object.entries(knowledgeBase)) {
        if (category === 'default') continue; // Skip default for now

        if (data.keywords) {
            // Check if any keyword matches
            const hasMatch = data.keywords.some(keyword =>
                lowerMessage.includes(keyword.toLowerCase())
            );

            if (hasMatch) {
                // Return the response (call it if it's a function)
                return typeof data.response === 'function'
                    ? data.response(context)
                    : data.response;
            }
        }
    }

    // Return default response if no match found
    return typeof knowledgeBase.default.response === 'function'
        ? knowledgeBase.default.response(userMessage)
        : knowledgeBase.default.response;
}

// Get appropriate knowledge base based on role
function getKnowledgeBase(role) {
    const normalizedRole = (role || 'student').toLowerCase();

    if (normalizedRole === 'admin' || normalizedRole === 'administrator') {
        return adminKnowledge;
    } else if (normalizedRole === 'faculty' || normalizedRole === 'teacher' || normalizedRole === 'professor') {
        return facultyKnowledge;
    } else {
        return studentKnowledge;
    }
}

// Retrieve stored chat history
router.get('/history', (req, res) => {
    try {
        const { userId, role, limit } = req.query;
        const history = readChatHistory();
        let filtered = history;

        if (userId) {
            filtered = filtered.filter(entry => String(entry.userId || 'guest') === String(userId));
        }
        if (role) {
            filtered = filtered.filter(entry => (entry.role || 'student').toLowerCase() === role.toLowerCase());
        }

        const cap = Math.max(1, Math.min(parseInt(limit, 10) || 50, 200));
        const result = filtered.slice(-cap);
        res.json(result);
    } catch (error) {
        console.error('[VuAiAgent] Failed to fetch history:', error);
        res.status(500).json({ message: 'Unable to fetch chat history', error: error.message });
    }
});

router.post('/', async (req, res) => {
    console.log('🤖 Received VuAiAgent request:', req.body);

    try {
        // Destructure the payload sent from VuAiAgent.jsx
        const { prompt, query, userId, role, context } = req.body;
        const rawMessage = prompt || query || '';
        const userMessage = rawMessage.trim();

        console.log(`[VuAiAgent] Request from ${role || 'student'} (${userId || 'guest'}): ${rawMessage}`);

        // Get the appropriate knowledge base for the user's role
        const knowledgeBase = getKnowledgeBase(role);
        console.log(`[VuAiAgent] Using ${role || 'student'} knowledge base`);

        let reply = "";

        // 1. Try OpenAI API if Key is present
        if (process.env.OPENAI_API_KEY) {
            try {
                const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

                // Build role-specific system context
                let systemContext = '';
                if (role === 'admin') {
                    systemContext = `You are VuAiAgent, a helpful university administrative assistant.
            You are speaking with an Administrator.
            Help them with system management, user administration, and oversight tasks.
            Be professional and efficient.`;
                } else if (role === 'faculty') {
                    systemContext = `You are VuAiAgent, a helpful university assistant for faculty.
            You are speaking with a Faculty Member.
            Help them with student management, material uploads, and teaching tasks.
            Be respectful and supportive.`;
                } else {
                    systemContext = `You are VuAiAgent, a friendly university assistant for students.
            You are speaking with a Year ${context?.year || 'N/A'} student in ${context?.branch || 'Engineering'}, Section ${context?.section || 'N/A'}.
            Help them with studies, schedules, and academic queries.
            Be encouraging and helpful.`;
                }

                const completion = await openai.chat.completions.create({
                    messages: [
                        { role: "system", content: systemContext },
                        { role: "user", content: rawMessage }
                    ],
                    model: "gpt-3.5-turbo",
                    temperature: 0.7,
                    max_tokens: 200
                });

                reply = completion.choices[0].message.content;
                console.log('[VuAiAgent] Response from OpenAI');
            } catch (aiError) {
                console.error("[VuAiAgent] OpenAI API Error (Falling back to other models):", aiError.message);
            }
        }

        // 1.5. Try Google Gemini if API Key is present
        if (!reply && process.env.GOOGLE_API_KEY) {
            try {
                console.log('[VuAiAgent] Attempting Google Gemini...');
                const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
                const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

                let systemContext = '';
                if (role === 'admin') {
                    systemContext = `You are VuAiAgent, a helpful university administrative assistant for an Administrator. Help with system management and oversight.`;
                } else if (role === 'faculty') {
                    systemContext = `You are VuAiAgent, a helpful university assistant for faculty members. Help with teaching and student management.`;
                } else {
                    systemContext = `You are VuAiAgent, a friendly university assistant for students. Help with studies and schedules for a Year ${context?.year || 'N/A'} student.`;
                }

                const promptWithContext = `${systemContext}\n\nUser Message: ${userMessage}`;
                const result = await model.generateContent(promptWithContext);
                reply = result.response.text();
                console.log('[VuAiAgent] Response from Google Gemini');
            } catch (geminiError) {
                console.error("[VuAiAgent] Google Gemini Error:", geminiError.message);
            }
        }

        // 2. Fallback: Use role-specific knowledge base
        if (!reply) {
            reply = findKnowledgeMatch(userMessage, knowledgeBase, context);
            console.log('[VuAiAgent] Response from knowledge base');
        }

        // 3. Return the response in the format expected by the frontend
        const responsePayload = {
            response: reply,
            timestamp: new Date().toISOString(),
            role: role || 'student'
        };

        appendChatEntry({
            id: uuidv4(),
            userId: userId || 'guest',
            role: role || 'student',
            message: userMessage,
            response: reply,
            context: context || {},
            timestamp: responsePayload.timestamp
        });

        res.status(200).json(responsePayload);

    } catch (error) {
        console.error("[VuAiAgent] Backend Error:", error);
        res.status(500).json({
            message: "I'm having trouble processing your request right now. Please try again in a moment!",
            error: error.message
        });
    }
});

module.exports = router;
