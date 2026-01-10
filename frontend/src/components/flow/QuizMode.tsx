import { useState, useCallback, useMemo, useEffect } from 'react';
import type { FC } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Stack,
  Chip,
  LinearProgress,
  Alert,
  Fade,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  PlayArrow as StartIcon,
  Replay as RestartIcon,
  CheckCircle as CorrectIcon,
  Cancel as WrongIcon,
  EmojiEvents as TrophyIcon,
  School as LearnIcon,
  ArrowForward as NextIcon,
  Help as HintIcon,
  Lightbulb as TipIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import type { Step as StepType, Character } from '../../hooks/useRealWorldExamples';
import type { MessageDefinition } from '../../hooks/useMessageDefinitions';

interface QuizModeProps {
  steps: StepType[];
  messageMap?: Map<string, MessageDefinition>;
  characters?: Record<string, Character>;
  exampleTitle: string;
  scenario?: string;
}

interface QuizState {
  currentQuestionIndex: number;
  score: number;
  totalQuestions: number;
  answered: boolean;
  selectedAnswer: string | null;
  isCorrect: boolean | null;
  showHint: boolean;
}

// Get all unique message types from the example for generating wrong answers
const getAllMessageTypes = (): string[] => [
  'pain.001', 'pain.002', 'pain.008', 'pain.013',
  'pacs.002', 'pacs.003', 'pacs.004', 'pacs.008', 'pacs.009', 'pacs.010',
  'camt.052', 'camt.053', 'camt.054', 'camt.055', 'camt.056', 'camt.057', 'camt.060',
  'acmt.001', 'acmt.002', 'acmt.003', 'acmt.007', 'acmt.022',
  'sese.023', 'sese.024', 'sese.025', 'sese.026',
  'semt.002', 'semt.003', 'semt.017', 'semt.020',
];

// Generate quiz questions from steps - now includes step 1
const generateQuestions = (steps: StepType[]) => {
  return steps.map((step, index) => {
    const prevSteps = steps.slice(0, index); // Steps before this one
    const correctAnswer = step.message_type;

    // Generate wrong answers (different message types)
    const allTypes = getAllMessageTypes();
    const wrongAnswers = allTypes
      .filter(t => t !== correctAnswer && !steps.some(s => s.message_type === t && s.step <= step.step))
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);

    // Shuffle all options
    const options = [correctAnswer, ...wrongAnswers].sort(() => Math.random() - 0.5);

    // Hint varies based on whether this is the first step
    const hint = index === 0
      ? `This is the first message in the flow, initiated by ${step.actor}.`
      : `This message is sent from ${step.actor} to ${step.target || 'the next party'} after ${prevSteps[index - 1]?.action?.toLowerCase() || 'the previous step'}.`;

    return {
      questionIndex: index,
      prevSteps,
      currentStep: step,
      correctAnswer,
      options,
      hint,
      isFirstStep: index === 0,
    };
  });
};

export const QuizMode: FC<QuizModeProps> = ({ steps, messageMap, characters = {}, exampleTitle, scenario }) => {
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizState, setQuizState] = useState<QuizState>({
    currentQuestionIndex: 0,
    score: 0,
    totalQuestions: 0,
    answered: false,
    selectedAnswer: null,
    isCorrect: null,
    showHint: false,
  });

  // Generate questions once
  const questions = useMemo(() => generateQuestions(steps), [steps]);

  // Initialize quiz
  const startQuiz = useCallback(() => {
    setQuizStarted(true);
    setQuizState({
      currentQuestionIndex: 0,
      score: 0,
      totalQuestions: questions.length,
      answered: false,
      selectedAnswer: null,
      isCorrect: null,
      showHint: false,
    });
  }, [questions.length]);

  const restartQuiz = useCallback(() => {
    setQuizStarted(false);
    setQuizState({
      currentQuestionIndex: 0,
      score: 0,
      totalQuestions: 0,
      answered: false,
      selectedAnswer: null,
      isCorrect: null,
      showHint: false,
    });
  }, []);

  // Handle answer selection
  const handleAnswer = useCallback((answer: string) => {
    if (quizState.answered) return;

    const currentQ = questions[quizState.currentQuestionIndex];
    const isCorrect = answer === currentQ.correctAnswer;

    setQuizState(prev => ({
      ...prev,
      answered: true,
      selectedAnswer: answer,
      isCorrect,
      score: isCorrect ? prev.score + 1 : prev.score,
    }));
  }, [quizState.answered, quizState.currentQuestionIndex, questions]);

  // Move to next question
  const nextQuestion = useCallback(() => {
    if (quizState.currentQuestionIndex < questions.length - 1) {
      setQuizState(prev => ({
        ...prev,
        currentQuestionIndex: prev.currentQuestionIndex + 1,
        answered: false,
        selectedAnswer: null,
        isCorrect: null,
        showHint: false,
      }));
    }
  }, [quizState.currentQuestionIndex, questions.length]);

  // Toggle hint
  const toggleHint = useCallback(() => {
    setQuizState(prev => ({ ...prev, showHint: !prev.showHint }));
  }, []);

  const currentQuestion = questions[quizState.currentQuestionIndex];
  const isQuizComplete = quizState.currentQuestionIndex >= questions.length - 1 && quizState.answered;
  const progress = ((quizState.currentQuestionIndex + (quizState.answered ? 1 : 0)) / questions.length) * 100;

  // Score rating
  const getScoreRating = (score: number, total: number) => {
    const percentage = (score / total) * 100;
    if (percentage >= 90) return { label: 'Expert!', color: '#22c55e', icon: '🏆' };
    if (percentage >= 70) return { label: 'Great Job!', color: '#60a5fa', icon: '⭐' };
    if (percentage >= 50) return { label: 'Good Effort!', color: '#fbbf24', icon: '👍' };
    return { label: 'Keep Learning!', color: '#f87171', icon: '📚' };
  };

  // Not started yet - show intro
  if (!quizStarted) {
    return (
      <Box sx={{ py: 4, textAlign: 'center' }}>
        <Paper
          sx={{
            p: 4,
            bgcolor: '#0f172a',
            border: '2px dashed',
            borderColor: '#334155',
            borderRadius: 3,
            maxWidth: 500,
            mx: 'auto',
          }}
        >
          <LearnIcon sx={{ fontSize: 48, color: '#60a5fa', mb: 2 }} />
          <Typography variant="h5" sx={{ color: '#f1f5f9', fontWeight: 700, mb: 1 }}>
            Quiz Mode
          </Typography>
          <Typography variant="body2" sx={{ color: '#94a3b8', mb: 3 }}>
            Test your knowledge of the payment flow for:
          </Typography>
          <Typography variant="subtitle1" sx={{ color: '#60a5fa', fontWeight: 600, mb: 3 }}>
            "{exampleTitle}"
          </Typography>

          <Stack spacing={1} sx={{ mb: 3 }}>
            <Chip
              label={`${questions.length} Questions`}
              sx={{ bgcolor: '#1e293b', color: '#e2e8f0' }}
            />
            <Typography variant="caption" sx={{ color: '#64748b' }}>
              Predict what message type comes next in each step
            </Typography>
          </Stack>

          <Button
            variant="contained"
            size="large"
            startIcon={<StartIcon />}
            onClick={startQuiz}
            sx={{
              bgcolor: '#3b82f6',
              '&:hover': { bgcolor: '#2563eb' },
              px: 4,
              py: 1.5,
              fontSize: '1rem',
            }}
          >
            Start Quiz
          </Button>
        </Paper>
      </Box>
    );
  }

  // Quiz complete - show results
  if (isQuizComplete) {
    const rating = getScoreRating(quizState.score, quizState.totalQuestions);

    return (
      <Box sx={{ py: 4 }}>
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        >
          <Paper
            sx={{
              p: 4,
              bgcolor: '#0f172a',
              border: '2px solid',
              borderColor: rating.color,
              borderRadius: 3,
              maxWidth: 500,
              mx: 'auto',
              textAlign: 'center',
              boxShadow: `0 0 40px ${rating.color}30`,
            }}
          >
            <Typography variant="h1" sx={{ fontSize: '4rem', mb: 1 }}>
              {rating.icon}
            </Typography>
            <Typography variant="h4" sx={{ color: rating.color, fontWeight: 700, mb: 2 }}>
              {rating.label}
            </Typography>

            <Box sx={{ bgcolor: '#1e293b', borderRadius: 2, p: 3, mb: 3 }}>
              <Typography variant="h2" sx={{ color: '#f1f5f9', fontWeight: 800 }}>
                {quizState.score} / {quizState.totalQuestions}
              </Typography>
              <Typography variant="body2" sx={{ color: '#94a3b8' }}>
                Correct Answers
              </Typography>
            </Box>

            <LinearProgress
              variant="determinate"
              value={(quizState.score / quizState.totalQuestions) * 100}
              sx={{
                height: 8,
                borderRadius: 4,
                bgcolor: '#1e293b',
                mb: 3,
                '& .MuiLinearProgress-bar': { bgcolor: rating.color },
              }}
            />

            <Stack direction="row" spacing={2} justifyContent="center">
              <Button
                variant="outlined"
                startIcon={<RestartIcon />}
                onClick={restartQuiz}
                sx={{ borderColor: '#334155', color: '#94a3b8' }}
              >
                Try Again
              </Button>
            </Stack>
          </Paper>
        </motion.div>
      </Box>
    );
  }

  // Active quiz - show question
  return (
    <Box sx={{ py: 2 }}>
      {/* Progress header */}
      <Paper sx={{ bgcolor: '#0f172a', p: 2, mb: 2, borderRadius: 2 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
          <Typography variant="body2" sx={{ color: '#94a3b8' }}>
            Question {quizState.currentQuestionIndex + 1} of {quizState.totalQuestions}
          </Typography>
          <Stack direction="row" alignItems="center" spacing={1}>
            <TrophyIcon sx={{ fontSize: 16, color: '#fbbf24' }} />
            <Typography variant="body2" sx={{ color: '#fbbf24', fontWeight: 600 }}>
              {quizState.score}
            </Typography>
          </Stack>
        </Stack>
        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{
            height: 6,
            borderRadius: 3,
            bgcolor: '#1e293b',
            '& .MuiLinearProgress-bar': { bgcolor: '#3b82f6' },
          }}
        />
      </Paper>

      {/* Context section */}
      <Paper sx={{ bgcolor: '#1e293b', p: 2, mb: 2, borderRadius: 2 }}>
        {currentQuestion.isFirstStep ? (
          // First question - show scenario context
          <>
            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, display: 'block', mb: 1 }}>
              SCENARIO
            </Typography>
            {scenario && (
              <Typography variant="body2" sx={{ color: '#e2e8f0', mb: 1.5, lineHeight: 1.6 }}>
                {scenario}
              </Typography>
            )}
            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, display: 'block', mb: 1 }}>
              PARTICIPANTS
            </Typography>
            <Stack direction="row" spacing={2} flexWrap="wrap">
              {Object.entries(characters).map(([key, char]) => (
                <Chip
                  key={key}
                  label={`${char.name} (${char.role})`}
                  size="small"
                  sx={{ bgcolor: '#334155', color: '#e2e8f0', fontSize: '0.7rem' }}
                />
              ))}
            </Stack>
          </>
        ) : (
          // Subsequent questions - show previous steps
          <>
            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, display: 'block', mb: 1 }}>
              WHAT HAPPENED SO FAR
            </Typography>
            <Stack spacing={1}>
              {currentQuestion.prevSteps.map((step, idx) => (
                <Stack key={idx} direction="row" alignItems="center" spacing={1.5}>
                  <Chip
                    label={step.step}
                    size="small"
                    sx={{ bgcolor: '#334155', color: '#e2e8f0', minWidth: 28, fontWeight: 600 }}
                  />
                  <Chip
                    label={step.message_type}
                    size="small"
                    sx={{
                      fontFamily: 'var(--font-mono)',
                      bgcolor: '#22c55e30',
                      color: '#22c55e',
                      fontWeight: 600,
                      fontSize: '0.7rem',
                    }}
                  />
                  <Typography variant="caption" sx={{ color: '#94a3b8', flex: 1 }}>
                    {step.actor} → {step.target || 'Next'}: {step.action}
                  </Typography>
                </Stack>
              ))}
            </Stack>
          </>
        )}
      </Paper>

      {/* Question */}
      <Paper
        sx={{
          bgcolor: '#0f172a',
          p: 3,
          mb: 2,
          borderRadius: 2,
          border: 2,
          borderColor: quizState.answered
            ? quizState.isCorrect ? '#22c55e' : '#ef4444'
            : '#3b82f6',
          boxShadow: quizState.answered
            ? `0 0 30px ${quizState.isCorrect ? '#22c55e' : '#ef4444'}30`
            : '0 0 30px #3b82f630',
        }}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2 }}>
          <Box>
            <Typography variant="h6" sx={{ color: '#f1f5f9', fontWeight: 700, mb: 0.5 }}>
              {currentQuestion.isFirstStep
                ? 'What message type starts this flow?'
                : 'What message comes next?'}
            </Typography>
            <Typography variant="body2" sx={{ color: '#94a3b8' }}>
              Step {currentQuestion.currentStep.step}: <strong style={{ color: '#60a5fa' }}>{currentQuestion.currentStep.actor}</strong>
              {currentQuestion.currentStep.target && (
                <> → <strong style={{ color: '#34d399' }}>{currentQuestion.currentStep.target}</strong></>
              )}
            </Typography>
            <Typography variant="body2" sx={{ color: '#e2e8f0', mt: 0.5 }}>
              Action: {currentQuestion.currentStep.action}
            </Typography>
          </Box>
          {!quizState.answered && (
            <Tooltip title={quizState.showHint ? 'Hide hint' : 'Show hint'}>
              <IconButton onClick={toggleHint} sx={{ color: '#fbbf24' }}>
                <HintIcon />
              </IconButton>
            </Tooltip>
          )}
        </Stack>

        {/* Hint */}
        <AnimatePresence>
          {quizState.showHint && !quizState.answered && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <Alert
                severity="info"
                icon={<TipIcon />}
                sx={{
                  mb: 2,
                  bgcolor: '#fbbf2420',
                  border: 1,
                  borderColor: '#fbbf2450',
                  color: '#fbbf24',
                  '& .MuiAlert-icon': { color: '#fbbf24' },
                }}
              >
                {currentQuestion.hint}
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Answer options */}
        <Stack spacing={1.5}>
          {currentQuestion.options.map((option, idx) => {
            const msgDef = messageMap?.get(option);
            const isSelected = quizState.selectedAnswer === option;
            const isCorrectOption = option === currentQuestion.correctAnswer;
            const showResult = quizState.answered;

            let bgColor = '#1e293b';
            let borderColor = '#334155';
            let textColor = '#e2e8f0';

            if (showResult) {
              if (isCorrectOption) {
                bgColor = '#22c55e20';
                borderColor = '#22c55e';
                textColor = '#22c55e';
              } else if (isSelected && !isCorrectOption) {
                bgColor = '#ef444420';
                borderColor = '#ef4444';
                textColor = '#ef4444';
              }
            } else if (isSelected) {
              borderColor = '#3b82f6';
            }

            return (
              <motion.div
                key={option}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <Paper
                  onClick={() => !quizState.answered && handleAnswer(option)}
                  sx={{
                    p: 2,
                    bgcolor: bgColor,
                    border: 2,
                    borderColor,
                    borderRadius: 2,
                    cursor: quizState.answered ? 'default' : 'pointer',
                    transition: 'all 0.2s',
                    '&:hover': !quizState.answered ? { borderColor: '#3b82f6', bgcolor: '#3b82f610' } : {},
                  }}
                >
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Chip
                      label={String.fromCharCode(65 + idx)}
                      size="small"
                      sx={{ bgcolor: borderColor, color: '#0f172a', fontWeight: 700, minWidth: 28 }}
                    />
                    <Box sx={{ flex: 1 }}>
                      <Typography
                        variant="body1"
                        sx={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: textColor }}
                      >
                        {option}
                      </Typography>
                      {msgDef && (
                        <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                          {msgDef.name}
                        </Typography>
                      )}
                    </Box>
                    {showResult && isCorrectOption && <CorrectIcon sx={{ color: '#22c55e' }} />}
                    {showResult && isSelected && !isCorrectOption && <WrongIcon sx={{ color: '#ef4444' }} />}
                  </Stack>
                </Paper>
              </motion.div>
            );
          })}
        </Stack>

        {/* Feedback after answer */}
        <AnimatePresence>
          {quizState.answered && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Alert
                severity={quizState.isCorrect ? 'success' : 'error'}
                sx={{
                  mt: 2,
                  bgcolor: quizState.isCorrect ? '#22c55e20' : '#ef444420',
                  border: 1,
                  borderColor: quizState.isCorrect ? '#22c55e50' : '#ef444450',
                  '& .MuiAlert-icon': { color: quizState.isCorrect ? '#22c55e' : '#ef4444' },
                }}
              >
                <Typography variant="body2" sx={{ color: '#e2e8f0', fontWeight: 600 }}>
                  {quizState.isCorrect ? 'Correct!' : 'Not quite right'}
                </Typography>
                <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block' }}>
                  {currentQuestion.currentStep.description}
                </Typography>
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>
      </Paper>

      {/* Navigation */}
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Button
          variant="outlined"
          onClick={restartQuiz}
          sx={{ borderColor: '#334155', color: '#94a3b8' }}
        >
          Exit Quiz
        </Button>

        {quizState.answered && quizState.currentQuestionIndex < questions.length - 1 && (
          <Button
            variant="contained"
            endIcon={<NextIcon />}
            onClick={nextQuestion}
            sx={{ bgcolor: '#3b82f6', '&:hover': { bgcolor: '#2563eb' } }}
          >
            Next Question
          </Button>
        )}
      </Stack>
    </Box>
  );
};

export default QuizMode;
