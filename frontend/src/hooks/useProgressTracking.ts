import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'mx-error-guide-progress';

interface QuizScore {
  score: number;
  total: number;
  date: string;
}

interface Progress {
  viewedExamples: string[];
  quizScores: Record<string, QuizScore>;
  lastStepPerExample: Record<string, number>;
  lastVisited: Record<string, string>; // exampleId -> ISO date string
}

interface UseProgressTrackingReturn {
  progress: Progress;
  markViewed: (exampleId: string) => void;
  saveQuizScore: (exampleId: string, score: number, total: number) => void;
  saveLastStep: (exampleId: string, step: number) => void;
  getLastStep: (exampleId: string) => number | undefined;
  isViewed: (exampleId: string) => boolean;
  getQuizScore: (exampleId: string) => QuizScore | undefined;
  getCompletionPercentage: (totalExamples: number) => number;
  clearProgress: () => void;
}

const getInitialProgress = (): Progress => {
  if (typeof window === 'undefined') {
    return {
      viewedExamples: [],
      quizScores: {},
      lastStepPerExample: {},
      lastVisited: {},
    };
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (err) {
    console.error('Failed to load progress from localStorage:', err);
  }

  return {
    viewedExamples: [],
    quizScores: {},
    lastStepPerExample: {},
    lastVisited: {},
  };
};

export function useProgressTracking(): UseProgressTrackingReturn {
  const [progress, setProgress] = useState<Progress>(getInitialProgress);

  // Persist to localStorage whenever progress changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch (err) {
      console.error('Failed to save progress to localStorage:', err);
    }
  }, [progress]);

  const markViewed = useCallback((exampleId: string) => {
    setProgress(prev => {
      if (prev.viewedExamples.includes(exampleId)) {
        // Update lastVisited even if already viewed
        return {
          ...prev,
          lastVisited: {
            ...prev.lastVisited,
            [exampleId]: new Date().toISOString(),
          },
        };
      }
      return {
        ...prev,
        viewedExamples: [...prev.viewedExamples, exampleId],
        lastVisited: {
          ...prev.lastVisited,
          [exampleId]: new Date().toISOString(),
        },
      };
    });
  }, []);

  const saveQuizScore = useCallback((exampleId: string, score: number, total: number) => {
    setProgress(prev => ({
      ...prev,
      quizScores: {
        ...prev.quizScores,
        [exampleId]: {
          score,
          total,
          date: new Date().toISOString(),
        },
      },
    }));
  }, []);

  const saveLastStep = useCallback((exampleId: string, step: number) => {
    setProgress(prev => ({
      ...prev,
      lastStepPerExample: {
        ...prev.lastStepPerExample,
        [exampleId]: step,
      },
    }));
  }, []);

  const getLastStep = useCallback((exampleId: string): number | undefined => {
    return progress.lastStepPerExample[exampleId];
  }, [progress.lastStepPerExample]);

  const isViewed = useCallback((exampleId: string): boolean => {
    return progress.viewedExamples.includes(exampleId);
  }, [progress.viewedExamples]);

  const getQuizScore = useCallback((exampleId: string): QuizScore | undefined => {
    return progress.quizScores[exampleId];
  }, [progress.quizScores]);

  const getCompletionPercentage = useCallback((totalExamples: number): number => {
    if (totalExamples === 0) return 0;
    return Math.round((progress.viewedExamples.length / totalExamples) * 100);
  }, [progress.viewedExamples.length]);

  const clearProgress = useCallback(() => {
    setProgress({
      viewedExamples: [],
      quizScores: {},
      lastStepPerExample: {},
      lastVisited: {},
    });
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return {
    progress,
    markViewed,
    saveQuizScore,
    saveLastStep,
    getLastStep,
    isViewed,
    getQuizScore,
    getCompletionPercentage,
    clearProgress,
  };
}
