import { createContext, useContext, useState, useCallback } from 'react';
import { startTest as apiStartTest, submitTest as apiSubmitTest } from '../api/tests.js';

const TestContext = createContext(null);

export const TestProvider = ({ children }) => {
  const [session, setSession] = useState(null);

  // startTest calls the real backend — stores session token + questions
  const startTest = useCallback(async (type, opts = {}) => {
    try {
      const data = await apiStartTest(type, opts);
      // data: {session_token, test_type, title, questions, time_limit_sec, pass_pct, total}
      setSession({
        token: data.session_token,
        type: data.test_type,
        title: data.title,
        questions: data.questions.map(q => ({
          id: q.id,
          text: q.text,
          options: q.options,
          imageUrl: q.image_url || null,
          category: q.category_id || opts.category_id || 'specifics',
        })),
        timeLimit: data.time_limit_sec,
        passPct: data.pass_pct,
        answers: {},
        startedAt: Date.now(),
        isFinished: false,
      });
    } catch (err) {
      console.error('startTest error:', err);
      throw err;
    }
  }, []);

  const updateAnswers = useCallback((answers) => {
    setSession(s => s ? { ...s, answers } : s);
  }, []);

  const finishTest = useCallback(async (answers) => {
    setSession(s => {
      if (!s) return s;
      const finalAnswers = answers || s.answers;
      return { ...s, answers: finalAnswers, _pendingSubmit: true, isFinished: false };
    });
  }, []);

  // Expose a combined finishAndSubmit for the Test screen to call
  const finishAndSubmit = useCallback(async (answers) => {
    if (!session) return null;
    const durationSec = Math.round((Date.now() - session.startedAt) / 1000);
    const finalAnswers = answers || session.answers;
    const apiAnswers = session.questions.map((q, i) => ({
      question_id: q.id,
      selected_index: finalAnswers[i] ?? -1,
    }));

    try {
      const result = await apiSubmitTest(session.token, apiAnswers, durationSec);
      setSession(s => s ? {
        ...s,
        answers: finalAnswers,
        isFinished: true,
        pct: result.pct,
        passed: result.passed,
        score: result.score,
        total: result.total,
        correctCount: result.score,
        durationSec,
        serverAnswers: result.answers,
        resultId: result.id,
      } : s);
      return result;
    } catch (err) {
      console.error('finishAndSubmit error:', err);
      setSession(s => s ? {
        ...s,
        answers: finalAnswers,
        isFinished: true,
        pct: 0,
        passed: false,
        score: 0,
        total: s ? s.questions.length : 0,
        correctCount: 0,
        durationSec,
      } : s);
      return null;
    }
  }, [session]);

  const reset = useCallback(() => setSession(null), []);

  return (
    <TestContext.Provider value={{ session, startTest, updateAnswers, finishTest, finishAndSubmit, reset }}>
      {children}
    </TestContext.Provider>
  );
};

export const useTest = () => {
  const ctx = useContext(TestContext);
  if (!ctx) throw new Error('useTest must be used inside TestProvider');
  return ctx;
};
