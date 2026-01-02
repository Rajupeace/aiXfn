export const advancedContent = {
    "Python": {
        title: "Python Programming Tutorial",
        topics: [
            {
                id: "intro",
                title: "Python Introduction",
                content: "Python is a high-level, interpreted programming language known for its simplicity and readability.",
                code: null
            }
        ]
    },
    "Java": {
        title: "Java Programming Tutorial",
        topics: [
            {
                id: "intro",
                title: "Java Introduction",
                content: "Java is a high-level, object-oriented programming language developed by Sun Microsystems in 1995.",
                code: null
            }
        ]
    }
};

export const getCourseContent = (courseName) => {
    const key = Object.keys(advancedContent).find(k => courseName.toLowerCase().includes(k.toLowerCase()));
    return advancedContent[key] || advancedContent["Python"];
};
