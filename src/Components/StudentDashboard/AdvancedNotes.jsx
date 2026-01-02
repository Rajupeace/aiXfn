import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getAdvancedCourses } from './branchData';
import { FaBook, FaVideo, FaCode, FaPlay, FaCopy, FaCheck, FaChartLine, FaTrophy, FaLock, FaUnlock, FaDownload, FaEye, FaFileAlt, FaExternalLinkAlt } from 'react-icons/fa';
import { apiGet } from '../../utils/apiClient';
import TestInterface from './TestInterface';
import './AdvancedLearning.css';
import '../StudentDashboard/StudentDashboard.css';

const AdvancedNotes = ({ studentData }) => {
    const navigate = useNavigate();
    const { language, section } = useParams();
    const [materials, setMaterials] = useState([]);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState(section || 'notes');
    const [selectedCode, setSelectedCode] = useState(null);
    const [copied, setCopied] = useState(false);
    const [showTestInterface, setShowTestInterface] = useState(false);
    const [courseProgress, setCourseProgress] = useState(null);

    const advancedCourses = getAdvancedCourses(studentData?.branch || 'CSE');
    const programmingLanguages = advancedCourses.filter(course => [
        'C', 'C++', 'Java', 'Python', 'JavaScript'
    ].includes(course.name));

    // Comprehensive code examples for each language (like GeeksforGeeks/W3Schools)
    const codeExamples = {
        'Python': {
            intro: `Python is a high-level, interpreted programming language known for its simplicity and readability. It's perfect for beginners and widely used in data science, web development, and automation.`,
            topics: [
                {
                    title: 'Python Syntax',
                    example: `# Hello World in Python
print("Hello, World!")

# Python uses indentation for code blocks
if True:
    print("This is indented")
    print("So is this")`,
                    explanation: `Python uses indentation (spaces or tabs) to define code blocks instead of curly braces. This makes code more readable.`,
                    output: `Hello, World!
This is indented
So is this`
                },
                {
                    title: 'Variables and Data Types',
                    example: `# Variables don't need type declaration
name = "John"          # String
age = 25               # Integer
height = 5.9           # Float
is_student = True      # Boolean

# Check type
print(type(name))      # <class 'str'>
print(type(age))       # <class 'int'>`,
                    explanation: `Python is dynamically typed. Variables can hold any type of data. Use type() to check the type of a variable.`,
                    output: `<class 'str'>
<class 'int'>`
                },
                {
                    title: 'Lists and Loops',
                    example: `# Lists (arrays)
fruits = ["apple", "banana", "orange"]
print(fruits[0])       # Output: apple

# Loop through list
for fruit in fruits:
    print(fruit)

# List comprehension
numbers = [x * 2 for x in range(5)]
print(numbers)         # [0, 2, 4, 6, 8]`,
                    explanation: `Lists are ordered collections. Use for loops to iterate. List comprehensions provide a concise way to create lists.`,
                    output: `apple
apple
banana
orange
[0, 2, 4, 6, 8]`
                },
                {
                    title: 'Functions',
                    example: `# Define a function
def greet(name):
    return f"Hello, {name}!"

# Call the function
message = greet("Python")
print(message)         # Hello, Python!

# Function with default parameters
def add(a, b=10):
    return a + b

print(add(5))          # 15
print(add(5, 20))      # 25`,
                    explanation: `Functions are defined with def keyword. You can use default parameters. f-strings allow easy string formatting.`,
                    output: `Hello, Python!
15
25`
                },
                {
                    title: 'Dictionaries',
                    example: `# Dictionaries (key-value pairs)
student = {
    "name": "John",
    "age": 25,
    "grade": "A"
}

# Access values
print(student["name"])     # John
print(student.get("age"))  # 25

# Add new key
student["city"] = "NYC"
print(student)`,
                    explanation: `Dictionaries store data as key-value pairs. Use square brackets or .get() to access values.`,
                    output: `John
25
{'name': 'John', 'age': 25, 'grade': 'A', 'city': 'NYC'}`
                }
            ]
        },
        'Java': {
            intro: `Java is an object-oriented programming language designed to be platform-independent. It's widely used in enterprise applications, Android development, and web services.`,
            topics: [
                {
                    title: 'Java Syntax',
                    example: `// Hello World in Java
public class HelloWorld {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}`,
                    explanation: `Every Java program must have a class with a main method. The main method is the entry point of the program.`,
                    output: `Hello, World!`
                },
                {
                    title: 'Variables and Data Types',
                    example: `// Variables and Data Types
String name = "John";      // String
int age = 25;              // Integer
double height = 5.9;       // Double
boolean isStudent = true;  // Boolean

System.out.println("Name: " + name);
System.out.println("Age: " + age);`,
                    explanation: `Java is statically typed. You must declare the type of variable. Use + for string concatenation.`,
                    output: `Name: John
Age: 25`
                },
                {
                    title: 'Arrays and Loops',
                    example: `// Arrays
String[] fruits = {"apple", "banana", "orange"};
System.out.println(fruits[0]); // Output: apple

// Enhanced for loop
for (String fruit : fruits) {
    System.out.println(fruit);
}`,
                    explanation: `Arrays in Java are fixed-size. Enhanced for loop (for-each) is convenient for iterating through arrays.`,
                    output: `apple
apple
banana
orange`
                }
            ]
        },
        'C': {
            intro: `C is a procedural programming language, the foundation of many modern languages.`,
            example: `/* Hello World in C */
#include <stdio.h>

int main() {
    printf("Hello, World!\\n");
    
    // Variables
    char name[] = "John";
    int age = 25;
    float height = 5.9;
    
    // Arrays
    char fruits[][10] = {"apple", "banana", "orange"};
    printf("%s\\n", fruits[0]); // Output: apple
    
    // Loops
    for (int i = 0; i < 3; i++) {
        printf("%s\\n", fruits[i]);
    }
    
    return 0;
}`,
            explanation: `C requires header files like stdio.h. It uses pointers and manual memory management. Functions must be declared before use.`
        },
        'C++': {
            intro: `C++ extends C with object-oriented features like classes and inheritance.`,
            example: `// Hello World in C++
#include <iostream>
#include <vector>
using namespace std;

int main() {
    cout << "Hello, World!" << endl;
    
    // Variables
    string name = "John";
    int age = 25;
    double height = 5.9;
    
    // Vectors (dynamic arrays)
    vector<string> fruits = {"apple", "banana", "orange"};
    cout << fruits[0] << endl; // Output: apple
    
    // Range-based for loop
    for (const auto& fruit : fruits) {
        cout << fruit << endl;
    }
    
    return 0;
}`,
            explanation: `C++ uses namespaces and the iostream library. It supports both C-style arrays and modern containers like vectors.`
        },
        'JavaScript': {
            intro: `JavaScript is a dynamic programming language used for web development.`,
            example: `// Hello World in JavaScript
console.log("Hello, World!");

// Variables (let, const, var)
let name = "John";
const age = 25;
var height = 5.9;

// Arrays
const fruits = ["apple", "banana", "orange"];
console.log(fruits[0]); // Output: apple

// Loops
fruits.forEach(fruit => {
    console.log(fruit);
});

// Arrow Functions
const greet = (name) => {
    return \`Hello, \${name}!\`;
};

console.log(greet("JavaScript"));`,
            explanation: `JavaScript is dynamically typed. It supports both traditional functions and arrow functions. Template literals use backticks.`
        }
    };

    const loadProgress = async () => {
        try {
            const userData = JSON.parse(localStorage.getItem('userData') || '{}');
            const studentId = userData.sid || userData.studentId;
            if (studentId && language) {
                const progress = await apiGet(`/api/progress/${studentId}/${language}?type=course`);
                setCourseProgress(progress);
            }
        } catch (error) {
            console.error('Error loading progress:', error);
        }
    };

    const fetchMaterials = async (lang, type) => {
        setLoading(true);
        try {
            const response = await fetch(`http://localhost:5000/api/materials?subject=${encodeURIComponent(lang)}&type=${type}`);
            const data = await response.json();
            setMaterials(data);
        } catch (error) {
            console.error('Error fetching materials:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSectionChange = (newSection) => {
        setActiveTab(newSection);
        navigate(`/advanced-materials/${language}/${newSection}`);
    };

    const copyToClipboard = (code) => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const downloadCode = (code, filename) => {
        const blob = new Blob([code], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename || `${language}_example.py`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const downloadNotes = (topic) => {
        const example = codeExamples[language];
        if (!example || !example.topics) return;
        
        const topicData = example.topics.find(t => t.title === topic);
        if (!topicData) return;

        const content = `# ${language} - ${topicData.title}\n\n` +
            `## Code Example:\n\`\`\`${language.toLowerCase()}\n${topicData.example}\n\`\`\`\n\n` +
            `## Output:\n\`\`\`\n${topicData.output || 'N/A'}\n\`\`\`\n\n` +
            `## Explanation:\n${topicData.explanation}\n`;
        
        downloadCode(content, `${language}_${topic.replace(/\s+/g, '_')}.md`);
    };

    const handleTakeTest = () => {
        if (!language) return;
        setShowTestInterface(true);
    };

    useEffect(() => {
        if (language && section) {
            fetchMaterials(language, section);
        }
        if (language) {
            loadProgress();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [language, section]);

    const renderCodeExample = () => {
        if (!language || !codeExamples[language]) return null;
        const example = codeExamples[language];
        
        // Check if it's the new format with topics array
        if (example.topics && Array.isArray(example.topics)) {
            return (
                <div style={{ marginBottom: '2rem' }}>
                    {/* Introduction */}
                    <div style={{
                        background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(139, 92, 246, 0.1))',
                        padding: '2rem',
                        borderRadius: '16px',
                        marginBottom: '2rem',
                        border: '1px solid rgba(59, 130, 246, 0.2)'
                    }}>
                        <h2 style={{ fontFamily: 'Space Grotesk', fontSize: '2rem', fontWeight: '800', color: '#1e293b', marginBottom: '1rem' }}>
                            {language} Tutorial
                        </h2>
                        <p style={{ color: '#64748b', fontSize: '1.1rem', lineHeight: '1.8' }}>
                            {example.intro}
                        </p>
                    </div>

                    {/* Topics List */}
                    {example.topics.map((topic, index) => (
                        <div key={index} style={{
                            background: 'white',
                            borderRadius: '16px',
                            padding: '2rem',
                            marginBottom: '2rem',
                            border: '1px solid #e2e8f0',
                            boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
                            transition: 'all 0.3s ease'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.boxShadow = '0 10px 20px rgba(0,0,0,0.1)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.05)';
                        }}
                        >
                            {/* Topic Header */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '2px solid #e2e8f0' }}>
                                <h3 style={{ fontFamily: 'Space Grotesk', fontSize: '1.5rem', fontWeight: '700', color: '#1e293b' }}>
                                    {index + 1}. {topic.title}
                                </h3>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button
                                        onClick={() => copyToClipboard(topic.example)}
                                        style={{
                                            padding: '0.5rem 1rem',
                                            borderRadius: '8px',
                                            border: '1px solid #e2e8f0',
                                            background: 'white',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem',
                                            fontSize: '0.85rem',
                                            fontWeight: '600',
                                            color: '#64748b',
                                            transition: 'all 0.3s ease'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.borderColor = '#3b82f6';
                                            e.currentTarget.style.color = '#3b82f6';
                                            e.currentTarget.style.background = '#eff6ff';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.borderColor = '#e2e8f0';
                                            e.currentTarget.style.color = '#64748b';
                                            e.currentTarget.style.background = 'white';
                                        }}
                                    >
                                        {copied ? <><FaCheck /> Copied!</> : <><FaCopy /> Copy</>}
                                    </button>
                                    <button
                                        onClick={() => downloadNotes(topic.title)}
                                        style={{
                                            padding: '0.5rem 1rem',
                                            borderRadius: '8px',
                                            border: '1px solid #e2e8f0',
                                            background: 'white',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem',
                                            fontSize: '0.85rem',
                                            fontWeight: '600',
                                            color: '#64748b',
                                            transition: 'all 0.3s ease'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.borderColor = '#10b981';
                                            e.currentTarget.style.color = '#10b981';
                                            e.currentTarget.style.background = '#f0fdf4';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.borderColor = '#e2e8f0';
                                            e.currentTarget.style.color = '#64748b';
                                            e.currentTarget.style.background = 'white';
                                        }}
                                    >
                                        <FaDownload /> Download
                                    </button>
                                    <button
                                        onClick={() => window.open(`https://www.geeksforgeeks.org/${language.toLowerCase()}-programming-language/`, '_blank')}
                                        style={{
                                            padding: '0.5rem 1rem',
                                            borderRadius: '8px',
                                            border: '1px solid #e2e8f0',
                                            background: 'white',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem',
                                            fontSize: '0.85rem',
                                            fontWeight: '600',
                                            color: '#64748b',
                                            transition: 'all 0.3s ease'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.borderColor = '#f59e0b';
                                            e.currentTarget.style.color = '#f59e0b';
                                            e.currentTarget.style.background = '#fffbeb';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.borderColor = '#e2e8f0';
                                            e.currentTarget.style.color = '#64748b';
                                            e.currentTarget.style.background = 'white';
                                        }}
                                    >
                                        <FaExternalLinkAlt /> View Online
                                    </button>
                                </div>
                            </div>

                            {/* Code Block */}
                            <div style={{
                                background: '#1e293b',
                                borderRadius: '12px',
                                padding: '1.5rem',
                                marginBottom: '1rem',
                                position: 'relative',
                                overflow: 'auto'
                            }}>
                                <div style={{
                                    position: 'absolute',
                                    top: '10px',
                                    right: '10px',
                                    background: 'rgba(255,255,255,0.1)',
                                    padding: '0.25rem 0.5rem',
                                    borderRadius: '4px',
                                    fontSize: '0.75rem',
                                    color: '#94a3b8',
                                    fontWeight: '600'
                                }}>
                                    {language}
                                </div>
                                <pre style={{
                                    color: '#e2e8f0',
                                    fontFamily: 'Monaco, Consolas, "Courier New", monospace',
                                    fontSize: '0.9rem',
                                    lineHeight: '1.8',
                                    margin: 0,
                                    whiteSpace: 'pre-wrap',
                                    wordWrap: 'break-word',
                                    paddingTop: '1.5rem'
                                }}>
                                    <code>{topic.example}</code>
                                </pre>
                            </div>

                            {/* Output Section */}
                            {topic.output && (
                                <div style={{
                                    background: '#0f172a',
                                    borderRadius: '12px',
                                    padding: '1.5rem',
                                    marginBottom: '1rem',
                                    border: '1px solid #1e293b'
                                }}>
                                    <div style={{ color: '#10b981', fontWeight: '700', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                                        Output:
                                    </div>
                                    <pre style={{
                                        color: '#10b981',
                                        fontFamily: 'Monaco, Consolas, monospace',
                                        fontSize: '0.9rem',
                                        lineHeight: '1.6',
                                        margin: 0,
                                        whiteSpace: 'pre-wrap'
                                    }}>
                                        {topic.output}
                                    </pre>
                                </div>
                            )}

                            {/* Explanation Section */}
                            <div style={{
                                background: '#f0fdf4',
                                border: '1px solid #bbf7d0',
                                borderRadius: '12px',
                                padding: '1.5rem',
                                marginTop: '1rem'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                                    <FaCode style={{ color: '#10b981', fontSize: '1.2rem' }} />
                                    <strong style={{ color: '#065f46', fontSize: '1rem' }}>Explanation:</strong>
                                </div>
                                <p style={{ color: '#047857', margin: 0, lineHeight: '1.8', fontSize: '0.95rem' }}>
                                    {topic.explanation}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            );
        }

        // Fallback for old format
        return (
            <div className="code-example-container" style={{
                background: 'white',
                borderRadius: '16px',
                padding: '2rem',
                marginBottom: '2rem',
                border: '1px solid #e2e8f0',
                boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3 style={{ fontFamily: 'Space Grotesk', fontSize: '1.5rem', fontWeight: '700', color: '#1e293b' }}>
                        {language} Introduction
                    </h3>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                            onClick={() => copyToClipboard(example.example)}
                            style={{
                                padding: '0.5rem 1rem',
                                borderRadius: '8px',
                                border: '1px solid #e2e8f0',
                                background: 'white',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                fontSize: '0.85rem',
                                fontWeight: '600',
                                color: '#64748b',
                                transition: 'all 0.3s ease'
                            }}
                        >
                            {copied ? <><FaCheck /> Copied!</> : <><FaCopy /> Copy</>}
                        </button>
                        <button
                            onClick={() => downloadCode(example.example, `${language}_example.txt`)}
                            style={{
                                padding: '0.5rem 1rem',
                                borderRadius: '8px',
                                border: '1px solid #e2e8f0',
                                background: 'white',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                fontSize: '0.85rem',
                                fontWeight: '600',
                                color: '#64748b',
                                transition: 'all 0.3s ease'
                            }}
                        >
                            <FaDownload /> Download
                        </button>
                    </div>
                </div>
                
                <p style={{ color: '#64748b', marginBottom: '1.5rem', lineHeight: '1.6' }}>
                    {example.intro}
                </p>

                <div style={{
                    background: '#1e293b',
                    borderRadius: '12px',
                    padding: '1.5rem',
                    marginBottom: '1rem',
                    position: 'relative',
                    overflow: 'auto'
                }}>
                    <pre style={{
                        color: '#e2e8f0',
                        fontFamily: 'Monaco, Consolas, monospace',
                        fontSize: '0.9rem',
                        lineHeight: '1.6',
                        margin: 0,
                        whiteSpace: 'pre-wrap',
                        wordWrap: 'break-word'
                    }}>
                        <code>{example.example}</code>
                    </pre>
                </div>

                <div style={{
                    background: '#f0fdf4',
                    border: '1px solid #bbf7d0',
                    borderRadius: '12px',
                    padding: '1rem',
                    marginTop: '1rem'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <FaCode style={{ color: '#10b981' }} />
                        <strong style={{ color: '#065f46' }}>Explanation:</strong>
                    </div>
                    <p style={{ color: '#047857', margin: 0, lineHeight: '1.6' }}>
                        {example.explanation}
                    </p>
                </div>
            </div>
        );
    };

    const renderContent = () => {
        if (!language) {
            return (
                <div className="advanced-notes-container" style={{ padding: '2rem 5%' }}>
                    <h1 className="mb-4" style={{ fontFamily: 'Space Grotesk', fontSize: '2.5rem', fontWeight: '800' }}>
                        Advanced Learning Resources
                    </h1>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
                        {programmingLanguages.map((course) => (
                            <div key={course.id} style={{
                                background: 'white',
                                borderRadius: '20px',
                                padding: '2rem',
                                border: '1px solid #e2e8f0',
                                boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
                                transition: 'all 0.3s ease',
                                cursor: 'pointer'
                            }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-5px)';
                                    e.currentTarget.style.boxShadow = '0 10px 20px rgba(0,0,0,0.1)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.05)';
                                }}
                                onClick={() => navigate(`/advanced-materials/${encodeURIComponent(course.name)}/notes`)}
                            >
                                <h3 style={{ fontFamily: 'Space Grotesk', fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.5rem' }}>
                                    {course.name}
                                </h3>
                                <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>{course.description}</p>
                                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); navigate(`/advanced-materials/${encodeURIComponent(course.name)}/notes`); }}
                                        style={{
                                            padding: '0.5rem 1rem',
                                            borderRadius: '8px',
                                            border: 'none',
                                            background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                                            color: 'white',
                                            fontWeight: '600',
                                            cursor: 'pointer',
                                            fontSize: '0.85rem'
                                        }}
                                    >
                                        <FaBook style={{ marginRight: '0.5rem' }} /> Notes
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); navigate(`/advanced-materials/${encodeURIComponent(course.name)}/videos`); }}
                                        style={{
                                            padding: '0.5rem 1rem',
                                            borderRadius: '8px',
                                            border: 'none',
                                            background: 'linear-gradient(135deg, #10b981, #059669)',
                                            color: 'white',
                                            fontWeight: '600',
                                            cursor: 'pointer',
                                            fontSize: '0.85rem'
                                        }}
                                    >
                                        <FaVideo style={{ marginRight: '0.5rem' }} /> Videos
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            );
        }

        return (
            <div className="advanced-notes-container" style={{ padding: '2rem 5%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <div>
                        <h2 style={{ fontFamily: 'Space Grotesk', fontSize: '2rem', fontWeight: '800', marginBottom: '0.5rem' }}>
                            {language} - {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
                        </h2>
                        <p style={{ color: '#64748b' }}>Learn {language} with code examples and explanations</p>
                    </div>
                    <button
                        onClick={() => navigate('/advanced-learning')}
                        style={{
                            padding: '0.75rem 1.5rem',
                            borderRadius: '12px',
                            border: '1px solid #e2e8f0',
                            background: 'white',
                            color: '#64748b',
                            fontWeight: '600',
                            cursor: 'pointer'
                        }}
                    >
                        ← Back
                    </button>
                </div>

                {/* Progress and Test Section */}
                {courseProgress && (
                    <div style={{
                        background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(139, 92, 246, 0.1))',
                        padding: '1.5rem',
                        borderRadius: '16px',
                        marginBottom: '2rem',
                        border: '1px solid rgba(59, 130, 246, 0.2)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                            <div>
                                <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '0.25rem' }}>Average Score</div>
                                <div style={{ fontSize: '1.5rem', fontWeight: '800', color: courseProgress.averageScore >= 70 ? '#10b981' : courseProgress.averageScore >= 50 ? '#f59e0b' : '#ef4444' }}>
                                    {courseProgress.averageScore.toFixed(0)}%
                                </div>
                            </div>
                            <div>
                                <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '0.25rem' }}>Best Score</div>
                                <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#3b82f6' }}>
                                    {courseProgress.bestScore.toFixed(0)}%
                                </div>
                            </div>
                            <div>
                                <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '0.25rem' }}>Current Level</div>
                                <div style={{ fontSize: '1rem', fontWeight: '700', color: '#1e293b', textTransform: 'capitalize' }}>
                                    {courseProgress.currentLevel}
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={handleTakeTest}
                            style={{
                                padding: '0.75rem 1.5rem',
                                borderRadius: '12px',
                                border: 'none',
                                background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                                color: 'white',
                                fontWeight: '700',
                                cursor: 'pointer',
                                fontSize: '0.9rem',
                                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
                                transition: 'all 0.3s ease'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                        >
                            🧩 Take Test
                        </button>
                    </div>
                )}

                <div style={{ marginBottom: '2rem', display: 'flex', gap: '1rem' }}>
                    <button
                        onClick={() => handleSectionChange('notes')}
                        style={{
                            padding: '0.75rem 1.5rem',
                            borderRadius: '10px',
                            border: 'none',
                            background: activeTab === 'notes' ? 'linear-gradient(135deg, #3b82f6, #2563eb)' : 'white',
                            color: activeTab === 'notes' ? 'white' : '#64748b',
                            fontWeight: '700',
                            cursor: 'pointer',
                            border: activeTab === 'notes' ? 'none' : '2px solid #e2e8f0'
                        }}
                    >
                        <FaBook style={{ marginRight: '0.5rem' }} /> Notes & Code
                    </button>
                    <button
                        onClick={() => handleSectionChange('videos')}
                        style={{
                            padding: '0.75rem 1.5rem',
                            borderRadius: '10px',
                            border: 'none',
                            background: activeTab === 'videos' ? 'linear-gradient(135deg, #10b981, #059669)' : 'white',
                            color: activeTab === 'videos' ? 'white' : '#64748b',
                            fontWeight: '700',
                            cursor: 'pointer',
                            border: activeTab === 'videos' ? 'none' : '2px solid #e2e8f0'
                        }}
                    >
                        <FaVideo style={{ marginRight: '0.5rem' }} /> Videos
                    </button>
                </div>

                {activeTab === 'notes' && renderCodeExample()}

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '3rem' }}>
                        <div className="loader"></div>
                    </div>
                ) : (
                    <>
                        {materials.length > 0 ? (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                                {Object.entries(
                                    materials.reduce((acc, material) => {
                                        const moduleName = material.module || 'General';
                                        if (!acc[moduleName]) acc[moduleName] = [];
                                        acc[moduleName].push(material);
                                        return acc;
                                    }, {})
                                ).sort((a, b) => a[0].localeCompare(b[0], undefined, { numeric: true })).map(([moduleName, moduleMaterials]) => (
                                    <div key={moduleName} style={{
                                        background: 'white',
                                        borderRadius: '16px',
                                        padding: '1.5rem',
                                        border: '1px solid #e2e8f0',
                                        boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
                                    }}>
                                        <h3 style={{ fontFamily: 'Space Grotesk', fontSize: '1.25rem', fontWeight: '700', marginBottom: '1rem', color: '#1e293b' }}>
                                            {moduleName}
                                        </h3>
                                        {moduleMaterials.map((material) => {
                                            const materialUrl = material.url?.startsWith('http') ? material.url : `http://localhost:5000${material.url}`;
                                            return (
                                                <div key={material.id} style={{
                                                    padding: '0.75rem',
                                                    marginBottom: '0.75rem',
                                                    background: '#f8fafc',
                                                    borderRadius: '8px',
                                                    border: '1px solid #e2e8f0'
                                                }}>
                                                    <div style={{ fontWeight: '600', color: '#1e293b', marginBottom: '0.5rem' }}>
                                                        {material.title}
                                                    </div>
                                                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                                        <a
                                                            href={materialUrl}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            style={{
                                                                padding: '0.4rem 0.8rem',
                                                                borderRadius: '6px',
                                                                background: '#3b82f6',
                                                                color: 'white',
                                                                textDecoration: 'none',
                                                                fontSize: '0.8rem',
                                                                fontWeight: '600',
                                                                display: 'inline-flex',
                                                                alignItems: 'center',
                                                                gap: '0.4rem',
                                                                transition: 'all 0.3s ease'
                                                            }}
                                                            onMouseEnter={(e) => {
                                                                e.currentTarget.style.background = '#2563eb';
                                                                e.currentTarget.style.transform = 'translateY(-2px)';
                                                            }}
                                                            onMouseLeave={(e) => {
                                                                e.currentTarget.style.background = '#3b82f6';
                                                                e.currentTarget.style.transform = 'translateY(0)';
                                                            }}
                                                        >
                                                            <FaEye /> View
                                                        </a>
                                                        <a
                                                            href={materialUrl}
                                                            download
                                                            style={{
                                                                padding: '0.4rem 0.8rem',
                                                                borderRadius: '6px',
                                                                background: '#10b981',
                                                                color: 'white',
                                                                textDecoration: 'none',
                                                                fontSize: '0.8rem',
                                                                fontWeight: '600',
                                                                display: 'inline-flex',
                                                                alignItems: 'center',
                                                                gap: '0.4rem',
                                                                transition: 'all 0.3s ease'
                                                            }}
                                                            onMouseEnter={(e) => {
                                                                e.currentTarget.style.background = '#059669';
                                                                e.currentTarget.style.transform = 'translateY(-2px)';
                                                            }}
                                                            onMouseLeave={(e) => {
                                                                e.currentTarget.style.background = '#10b981';
                                                                e.currentTarget.style.transform = 'translateY(0)';
                                                            }}
                                                        >
                                                            <FaDownload /> Download
                                                        </a>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div style={{ textAlign: 'center', padding: '3rem', background: 'white', borderRadius: '16px' }}>
                                <p style={{ color: '#64748b' }}>No {activeTab} available for {language} yet.</p>
                            </div>
                        )}
                    </>
                )}
            </div>
        );
    };

    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    const studentId = userData.sid || userData.studentId;

    return (
        <>
            <div className="advanced-notes-container">
                {renderContent()}
            </div>

            {/* Test Interface Modal */}
            {showTestInterface && studentId && (
                <div className="test-modal-overlay" onClick={() => setShowTestInterface(false)}>
                    <div className="test-modal-content" onClick={(e) => e.stopPropagation()}>
                        <TestInterface
                            studentId={studentId}
                            subject={null}
                            course={language}
                            onClose={() => setShowTestInterface(false)}
                            onComplete={async (result) => {
                                await loadProgress();
                            }}
                        />
                    </div>
                </div>
            )}
        </>
    );
};

export default AdvancedNotes;
