
import { Session, TestResult } from "../types";

// Local Analysis Engine - No API Key Required
export const generateAnalysis = async (sessions: Session[], tests: TestResult[]) => {
  // Simulate "thinking" delay for better UX
  await new Promise(resolve => setTimeout(resolve, 1500));

  // 1. Calculate Subject Performance
  const subjectStats: Record<string, { total: number, correct: number }> = {
    Physics: { total: 0, correct: 0 },
    Chemistry: { total: 0, correct: 0 },
    Maths: { total: 0, correct: 0 }
  };

  sessions.forEach(s => {
    if (subjectStats[s.subject]) {
      subjectStats[s.subject].total += (s.attempted || 0);
      subjectStats[s.subject].correct += (s.correct || 0);
    }
  });

  // 2. Identify Weakest Subject
  let weakestSubject = 'Physics';
  let minAccuracy = 101;
  let totalSolved = 0;

  Object.entries(subjectStats).forEach(([subj, stats]) => {
    totalSolved += stats.total;
    if (stats.total > 0) {
      const acc = (stats.correct / stats.total) * 100;
      if (acc < minAccuracy) {
        minAccuracy = acc;
        weakestSubject = subj;
      }
    }
  });

  // 3. Identify Top Mistake Pattern
  const mistakeCounts: Record<string, number> = {};
  sessions.forEach(s => {
    Object.entries(s.mistakes).forEach(([type, count]) => {
      mistakeCounts[type] = (mistakeCounts[type] || 0) + (count || 0);
    });
  });
  
  // Sort mistakes by frequency
  const topMistakes = Object.entries(mistakeCounts).sort((a, b) => b[1] - a[1]);
  const topMistakeName = topMistakes.length > 0 ? topMistakes[0][0] : null;

  // 4. Generate Heuristic Response
  let bottleneckTitle = "Great Start!";
  let analysis = "Keep logging more sessions to get detailed insights.";
  let actionPlan = [
    "Log at least 3 sessions per subject.",
    "Tag your mistakes honestly.",
    "Set a daily goal in the dashboard."
  ];

  if (totalSolved > 10) {
    bottleneckTitle = `Focus on ${weakestSubject}`;
    
    let mistakeText = "accuracy needs improvement";
    if (topMistakeName === 'concept') mistakeText = "conceptual gaps are the main issue";
    if (topMistakeName === 'calc') mistakeText = "calculation errors are frequent";
    if (topMistakeName === 'panic') mistakeText = "time pressure is affecting scores";
    if (topMistakeName === 'formula') mistakeText = "formula recall is a bottleneck";

    analysis = `Your ${weakestSubject} accuracy is ${Math.round(minAccuracy)}%, which is your current lowest. Data indicates that ${mistakeText}.`;

    actionPlan = [
      `Dedicate your next 2 study blocks specifically to ${weakestSubject}.`,
      topMistakeName === 'concept' ? `Review ${weakestSubject} theory before solving problems.` : `Practice 20 ${weakestSubject} questions with a focus on accuracy over speed.`,
      `Analyze your next test to see if ${topMistakeName || 'general'} errors persist.`
    ];
  }

  const temperament = tests.length > 0 ? tests[0].temperament : "Building Consistency";

  const response = {
    bottleneckTitle,
    analysis,
    temperament,
    actionPlan
  };

  return JSON.stringify(response);
};
