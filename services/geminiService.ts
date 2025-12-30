import { GoogleGenAI, Type } from "@google/genai";
import { Session, TestResult } from "../types";

export const generateAnalysis = async (sessions: Session[], tests: TestResult[]) => {
  const apiKey = process.env.API_KEY;

  // Initialize client only when needed to avoid startup crashes
  // Guidelines: API key must be obtained from process.env.API_KEY
  const ai = new GoogleGenAI({ apiKey });

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
    
    Output JSON Schema:
    {
      "bottleneckTitle": "Short title of the biggest weakness (e.g., 'Weak Calculus Foundation')",
      "analysis": "2 concise sentences analyzing the trend and root cause.",
      "temperament": "One word or short phrase describing their test mindset (e.g., 'Anxious', 'Steady').",
      "actionPlan": ["Step 1", "Step 2", "Step 3"]
    }
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
            bottleneckTitle: { type: Type.STRING },
            analysis: { type: Type.STRING },
            temperament: { type: Type.STRING },
            actionPlan: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
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