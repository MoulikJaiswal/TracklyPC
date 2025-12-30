
import { GoogleGenAI, Type } from "@google/genai";
import { Session, TestResult } from "../types";

// Initialize the client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateAnalysis = async (sessions: Session[], tests: TestResult[]) => {
  // Prepare data summary
  const totalQs = sessions.reduce((acc, s) => acc + s.attempted, 0);
  const subjectBreakdown = sessions.reduce((acc, s) => {
    acc[s.subject] = (acc[s.subject] || 0) + s.attempted;
    return acc;
  }, {} as Record<string, number>);
  
  const mistakeSummary = sessions.reduce((acc, s) => {
    Object.entries(s.mistakes).forEach(([type, count]) => {
      acc[type] = (acc[type] || 0) + (count || 0);
    });
    return acc;
  }, {} as Record<string, number>);

  const recentTests = tests.slice(0, 3).map(t => `${t.name}: ${t.marks}/${t.total} (${t.temperament})`).join(', ');

  const prompt = `
    Role: You are an elite JEE (Joint Entrance Exam) tutor and data analyst using Trackly.
    
    Data:
    - Total Questions Solved: ${totalQs}
    - Subject Distribution: ${JSON.stringify(subjectBreakdown)}
    - Mistake Patterns: ${JSON.stringify(mistakeSummary)}
    - Recent Tests: ${recentTests || "No tests taken yet"}
    
    Task:
    Analyze the student's performance trends based on the data above.
    1. Identify the single biggest bottleneck (e.g. "Weak Foundation in Physics", "Calculation Errors", "Test Anxiety").
    2. Provide a brief but incisive analysis of their current state.
    3. Analyze their test temperament if data exists, otherwise infer from mistake patterns (e.g. panic mistakes).
    4. Provide exactly 3 strict, actionable steps for the next week.
    
    Output Format: JSON
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            bottleneckTitle: { type: Type.STRING, description: "Title of the main weakness, e.g., 'Concept Gap'" },
            analysis: { type: Type.STRING, description: "2-3 sentences analyzing the trend." },
            temperament: { type: Type.STRING, description: "Analysis of test mindset." },
            actionPlan: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "3 specific actionable steps."
            }
          }
        }
      }
    });
    return response.text;
  } catch (error) {
    console.error("AI Analysis Failed:", error);
    throw error;
  }
};
