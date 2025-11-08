// ✅ Sample test questions data
// This file contains sample questions used for initial testing
// Can be edited to add more sample questions

const sampleQuestions = [
  {
    id: 1,
    instructions: "Study the Series Pattern. Questions below are based on the given Series-I. The series-I satisfy a certain pattern, follow the same pattern in Series-II and answer the questions given below.",
    instructionImage: "",
    questionEn: "Series-I: 15, 31, 64, 131, 266, 537\nSeries-II: 0.5, ?, ?, ?, ?, 73\n\nIf 73 is the nth term, find the value of n.",
    questionHi: "श्रृंखला-I: 15, 31, 64, 131, 266, 537\nश्रृंखला-II: 0.5, ?, ?, ?, ?, 73\n\nयदि 73 n वाँ पद है, तो n का मान ज्ञात करें।",
    options: ["4", "5", "6", "7", "8"],
    correctAnswer: 1,
    solution: "Pattern is 2n-1. In Series II, follow the same pattern starting from 0.5. The answer is 5.",
    solutionImage: ""
  },
  {
    id: 2,
    instructions: "Data Interpretation. Following table shows the number of students enrolled in different courses at a university over 5 years.",
    instructionImage: "",
    questionEn: "What is the total number of students enrolled in Engineering in 2020 and 2021?",
    questionHi: "2020 और 2021 में इंजीनियरिंग में नामांकित छात्रों की कुल संख्या क्या है?",
    options: ["1100", "1150", "1200", "1250", "1300"],
    correctAnswer: 1,
    solution: "Engineering 2020: 550, Engineering 2021: 600. Total = 1150 students.",
    solutionImage: ""
  },
  {
    id: 3,
    instructions: "Simple Interest Problem. Read the following information carefully and answer the questions.",
    instructionImage: "",
    questionEn: "Calculate the simple interest on Rs. 10,000 at 5% per annum for 3 years.",
    questionHi: "रु. 10,000 पर 5% प्रति वर्ष की दर से 3 वर्ष के लिए साधारण ब्याज की गणना करें।",
    options: ["Rs. 1,500", "Rs. 1,800", "Rs. 2,000", "Rs. 2,500", "Rs. 3,000"],
    correctAnswer: 0,
    solution: "SI = (P × R × T) / 100 = (10000 × 5 × 3) / 100 = Rs. 1,500",
    solutionImage: ""
  },
  {
    id: 4,
    instructions: "Percentage Problem. Study the following percentage-based question.",
    instructionImage: "",
    questionEn: "If 60% of 500 students are boys, how many girls are there?",
    questionHi: "यदि 500 छात्रों में 60% लड़के हैं, तो कितनी लड़कियाँ हैं?",
    options: ["150", "200", "250", "300", "350"],
    correctAnswer: 1,
    solution: "Boys = 60% of 500 = 300. Girls = 500 - 300 = 200.",
    solutionImage: ""
  },
  {
    id: 5,
    instructions: "Ratio and Proportion. Study the ratio problem below.",
    instructionImage: "",
    questionEn: "If the ratio of two numbers is 5:6 and their sum is 66, find the smaller number.",
    questionHi: "यदि दो संख्याओं का अनुपात 5:6 है और उनका योग 66 है, तो छोटी संख्या ज्ञात करें।",
    options: ["30", "36", "42", "48", "54"],
    correctAnswer: 0,
    solution: "Let numbers be 5x and 6x. Then 5x + 6x = 66, so 11x = 66, x = 6. Smaller number = 5 × 6 = 30.",
    solutionImage: ""
  },
  {
    id: 6,
    instructions: "Time and Work. A can complete a work in 12 days. B can complete the same work in 15 days.",
    instructionImage: "",
    questionEn: "If A and B work together, in how many days will they complete the work?",
    questionHi: "यदि A और B एक साथ काम करें, तो वे काम को कितने दिनों में पूरा करेंगे?",
    options: ["6 days", "6.67 days", "7 days", "8 days", "9 days"],
    correctAnswer: 1,
    solution: "A's work = 1/12, B's work = 1/15. Combined = 1/12 + 1/15 = 9/60 = 3/20. Time = 20/3 = 6.67 days.",
    solutionImage: ""
  },
  {
    id: 7,
    instructions: "Speed, Distance and Time. A train travels at 60 km/h.",
    instructionImage: "",
    questionEn: "How much distance will it cover in 3 hours?",
    questionHi: "यह 3 घंटे में कितनी दूरी तय करेगी?",
    options: ["150 km", "160 km", "170 km", "180 km", "190 km"],
    correctAnswer: 3,
    solution: "Distance = Speed × Time = 60 × 3 = 180 km.",
    solutionImage: ""
  },
  {
    id: 8,
    instructions: "Profit and Loss. Cost Price Rs. 500, Selling Price Rs. 600",
    instructionImage: "",
    questionEn: "What is the profit percentage?",
    questionHi: "लाभ प्रतिशत क्या है?",
    options: ["15%", "20%", "25%", "30%", "35%"],
    correctAnswer: 1,
    solution: "Profit = 600 - 500 = 100. Profit % = (100/500) × 100 = 20%.",
    solutionImage: ""
  },
  {
    id: 9,
    instructions: "Average Problem. Find the average of these numbers: 10, 20, 30, 40, 50",
    instructionImage: "",
    questionEn: "Find the average of these 5 numbers.",
    questionHi: "इन 5 संख्याओं का औसत ज्ञात करें।",
    options: ["25", "30", "35", "40", "45"],
    correctAnswer: 1,
    solution: "Average = (10 + 20 + 30 + 40 + 50) / 5 = 150 / 5 = 30.",
    solutionImage: ""
  },
  {
    id: 10,
    instructions: "Compound Interest. Principal Rs. 5,000, Rate 10% per annum, Time 2 years",
    instructionImage: "",
    questionEn: "Calculate the compound interest.",
    questionHi: "चक्रवृद्धि ब्याज की गणना करें।",
    options: ["Rs. 1,000", "Rs. 1,050", "Rs. 1,100", "Rs. 1,150", "Rs. 1,200"],
    correctAnswer: 1,
    solution: "A = P(1 + R/100)^T = 5000(1 + 10/100)^2 = 5000 × 1.21 = 6050. CI = 6050 - 5000 = Rs. 1,050.",
    solutionImage: ""
  }
];

// Export for use in main.js

