'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams } from 'next/navigation';
import confetti from 'canvas-confetti';
import { Form, Question, AnswerInput } from '@/lib/types';
import { getForm, submitResponse } from '@/lib/api';
import {
  ChevronUp,
  ChevronDown,
  Check,
  Star,
  AlertCircle,
  Sparkles,
  ArrowRight,
  RotateCcw
} from 'lucide-react';

export default function RespondentPage() {
  const params = useParams();
  const formId = params.id as string;

  const [form, setForm] = useState<Form | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [showWelcome, setShowWelcome] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [startTime] = useState<number>(Date.now());
  const [loading, setLoading] = useState(true);
  const [animKey, setAnimKey] = useState(0);

  const currentQ = questions[currentIndex];

  const fetchForm = async () => {
    try {
      setLoading(true);
      const data = await getForm(formId);
      if (data.status !== 'published') {
        setForm(null);
        return;
      }
      setForm(data);
      const sortedQ = [...data.questions].sort((a, b) => a.order - b.order);
      setQuestions(sortedQ);
    } catch (err) {
      console.error('Failed to load public form', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (formId) {
      fetchForm();
    }
  }, [formId]);

  // Trigger re-animation when question index changes
  useEffect(() => {
    setAnimKey((k) => k + 1);
  }, [currentIndex]);

  // Keyboard navigation listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Welcome screen: Enter to start
      if (showWelcome) {
        if (e.key === 'Enter') {
          e.preventDefault();
          setShowWelcome(false);
        }
        return;
      }

      if (isCompleted || !currentQ) return;

      // Enter key -> Advance
      if (e.key === 'Enter' && !e.shiftKey) {
        // Prevent default enter on textarea
        if (currentQ.type === 'long_text') return;
        e.preventDefault();
        handleNext();
      }

      // Shift + Enter or ArrowUp -> Back
      if ((e.key === 'Enter' && e.shiftKey) || e.key === 'ArrowUp') {
        e.preventDefault();
        handlePrev();
      }

      // ArrowDown -> Next
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        handleNext();
      }

      // Multiple choice keyboard shortcuts (A-Z or 1-9)
      if (currentQ.type === 'multiple_choice' && currentQ.choices) {
        const charCode = e.key.toUpperCase().charCodeAt(0);
        if (e.key.length === 1 && charCode >= 65 && charCode < 65 + currentQ.choices.length) {
          const choiceIndex = charCode - 65;
          handleAnswer(currentQ.choices[choiceIndex]);
          setTimeout(() => handleNext(currentQ.choices![choiceIndex]), 200);
        }
      }

      // Yes/No keyboard shortcuts (Y / N)
      if (currentQ.type === 'yes_no') {
        if (e.key.toLowerCase() === 'y') {
          handleAnswer('Yes');
          setTimeout(() => handleNext('Yes'), 200);
        } else if (e.key.toLowerCase() === 'n') {
          handleAnswer('No');
          setTimeout(() => handleNext('No'), 200);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, questions, answers, isCompleted, currentQ, showWelcome]);

  const validateCurrentQuestion = (overrideVal?: any): boolean => {
    if (!currentQ) return true;
    const val = overrideVal !== undefined ? overrideVal : answers[currentQ.id];

    // Required check
    if (currentQ.required) {
      if (val === undefined || val === null || val === '') {
        setErrorMsg('Please fill out this required field before advancing.');
        return false;
      }
    }

    // Email format validation
    if (currentQ.type === 'email' && val) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(String(val))) {
        setErrorMsg('Please enter a valid email address.');
        return false;
      }
    }

    // Number validation
    if (currentQ.type === 'number' && val !== undefined && val !== '') {
      if (isNaN(Number(val))) {
        setErrorMsg('Please enter a valid numeric value.');
        return false;
      }
    }

    setErrorMsg(null);
    return true;
  };

  const handleAnswer = (val: any) => {
    if (!currentQ) return;
    setAnswers((prev) => ({ ...prev, [currentQ.id]: val }));
    setErrorMsg(null);
  };

  const handleNext = async (overrideVal?: any) => {
    if (!validateCurrentQuestion(overrideVal)) return;

    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      // Submit response
      await handleSubmitFinal();
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setErrorMsg(null);
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleSubmitFinal = async () => {
    try {
      setIsSubmitting(true);
      const completionSeconds = Math.round((Date.now() - startTime) / 1000);
      const payloadAnswers: AnswerInput[] = Object.entries(answers).map(([qId, val]) => ({
        question_id: qId,
        value: val,
      }));

      await submitResponse(formId, {
        answers: payloadAnswers,
        completion_time_seconds: completionSeconds,
      });

      setIsCompleted(true);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch (err) {
      console.error('Failed to submit response', err);
      setErrorMsg('An error occurred submitting your response. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#191919] flex items-center justify-center text-white">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm font-semibold text-gray-400">Loading Typeform experience...</p>
        </div>
      </div>
    );
  }

  if (!form || questions.length === 0) {
    return (
      <div className="min-h-screen bg-[#191919] flex items-center justify-center p-4 text-white">
        <div className="bg-[#262626] border border-gray-800 rounded-3xl p-8 max-w-md text-center space-y-4 shadow-2xl">
          <div className="w-14 h-14 bg-purple-900/40 text-purple-400 rounded-2xl flex items-center justify-center mx-auto border border-purple-500/20">
            <Sparkles className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold">Form Unavailable</h1>
          <p className="text-gray-400 text-sm">
            This typeform is either unpublished or does not exist. Please contact the form creator.
          </p>
        </div>
      </div>
    );
  }

  // Calculate percentage
  const progressPercent = Math.round(((currentIndex + 1) / questions.length) * 100);
  const themeColor = form.theme_color || '#a057bb';

  return (
    <div
      className="min-h-screen bg-tf-neutral-1000 text-white flex flex-col justify-between select-none overflow-hidden h-screen font-sans relative"
      style={{ fontFamily: form.font_family || 'Inter' }}
    >
      {/* Top Brand Bar */}
      <header className="p-6 flex items-center justify-between z-20">
        <div className="flex items-center space-x-2 opacity-80 hover:opacity-100 transition-opacity">
          <svg className="w-6 h-6" style={{ color: themeColor }} viewBox="0 0 43 24" fill="currentColor">
            <path fillRule="evenodd" clipRule="evenodd" d="M0 5.42456C0 1.8517 1.40765 0 3.78009 0C6.15215 0 7.56018 1.8517 7.56018 5.42456V16.2479C7.56018 19.8208 6.15252 21.6725 3.78009 21.6725C1.40765 21.6725 0 19.8208 0 16.2479V5.42456ZM25.4643 0H17.6512C10.6419 0 10.0894 3.027 10.0894 7.06301L10.0802 14.599C10.0802 18.8069 10.6082 21.6725 17.6784 21.6725H25.4643C32.4961 21.6725 33.0128 18.656 33.0128 14.62V7.07352C33.0128 3.027 32.4736 0 25.4643 0Z" />
          </svg>
          <span className="font-bold text-sm tracking-tight text-gray-300">typeform</span>
        </div>
      </header>

      {/* Main Form Fill Experience */}
      {showWelcome ? (
        /* Welcome / Intro Screen */
        <main className="flex-1 flex items-center justify-center p-6 md:p-12 z-20">
          <div className="max-w-2xl w-full space-y-8 animate-slide-up">
            <div className="space-y-4">
              <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-white leading-tight">
                {form.title}
              </h1>
              {form.description && (
                <p className="text-lg text-gray-400 font-normal leading-relaxed max-w-lg">
                  {form.description}
                </p>
              )}
            </div>

            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <span className="flex items-center space-x-1.5">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{questions.length} questions</span>
              </span>
              <span>•</span>
              <span className="flex items-center space-x-1.5">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Takes about {Math.max(1, Math.ceil(questions.length * 0.5))} min</span>
              </span>
            </div>

            <button
              onClick={() => setShowWelcome(false)}
              className="text-white font-bold text-base px-8 py-4 rounded-2xl shadow-xl transition-all duration-200 hover:brightness-110 active:scale-95 flex items-center space-x-3"
              style={{ backgroundColor: themeColor }}
            >
              <span>Start</span>
              <ArrowRight className="w-5 h-5" />
            </button>

            <p className="text-xs text-gray-600">
              press <span className="font-bold text-gray-400">Enter ↵</span>
            </p>
          </div>
        </main>
      ) : !isCompleted ? (
        <main className="flex-1 flex items-center justify-center p-6 md:p-12 z-20">
          <div key={animKey} className="max-w-2xl w-full space-y-6 animate-slide-up">
            {/* Question Counter Header */}
            <div className="flex items-center space-x-2 font-bold text-sm" style={{ color: themeColor }}>
              <span>{currentIndex + 1}</span>
              <span>→</span>
              {currentQ.required && (
                <span className="text-red-400 text-xs font-semibold">* Required</span>
              )}
            </div>

            {/* Question Title & Description */}
            <div>
              <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-white leading-tight">
                {currentQ.title}
              </h1>
              {currentQ.description && (
                <p className="text-base text-gray-400 mt-2 font-normal leading-relaxed">
                  {currentQ.description}
                </p>
              )}
            </div>

            {/* Error Message Callout */}
            {errorMsg && (
              <div className="flex items-center space-x-2 text-red-400 bg-red-950/40 border border-red-800/50 p-3 rounded-xl text-sm font-semibold animate-fade-in">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Question Input Controls */}
            <div className="pt-4">
              {currentQ.type === 'short_text' && (
                <div className="border-b-2 border-white/20 focus-within:border-purple-500 transition-colors pb-2">
                  <input
                    type="text"
                    value={answers[currentQ.id] || ''}
                    onChange={(e) => handleAnswer(e.target.value)}
                    placeholder="Type your answer here..."
                    className="bg-transparent text-xl sm:text-2xl text-white placeholder-gray-600 focus:outline-none w-full"
                    autoFocus
                  />
                </div>
              )}

              {currentQ.type === 'long_text' && (
                <div className="border-2 border-white/10 focus-within:border-purple-500 rounded-2xl p-4 bg-white/5 transition-all">
                  <textarea
                    rows={4}
                    value={answers[currentQ.id] || ''}
                    onChange={(e) => handleAnswer(e.target.value)}
                    placeholder="Type your paragraph response here... (Press Shift+Enter for new line)"
                    className="bg-transparent text-lg text-white placeholder-gray-600 focus:outline-none w-full resize-none"
                    autoFocus
                  />
                </div>
              )}

              {currentQ.type === 'multiple_choice' && (
                <div className="space-y-3">
                  {(currentQ.choices || []).map((choice, idx) => {
                    const isSelected = answers[currentQ.id] === choice;
                    return (
                      <div
                        key={idx}
                        onClick={() => {
                          handleAnswer(choice);
                          setTimeout(() => handleNext(choice), 200);
                        }}
                        className={`flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer font-semibold ${
                          isSelected
                            ? 'bg-purple-600/30 border-purple-500 text-white shadow-lg shadow-purple-900/20'
                            : 'bg-white/5 hover:bg-white/10 border-white/10 text-gray-200 hover:border-white/20'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <span className="w-7 h-7 rounded-lg bg-white/10 text-white font-bold text-xs flex items-center justify-center border border-white/10">
                            {String.fromCharCode(65 + idx)}
                          </span>
                          <span className="text-base">{choice}</span>
                        </div>
                        {isSelected && <Check className="w-5 h-5 text-purple-400" />}
                      </div>
                    );
                  })}
                </div>
              )}

              {currentQ.type === 'dropdown' && (
                <div className="relative">
                  <select
                    value={answers[currentQ.id] || ''}
                    onChange={(e) => handleAnswer(e.target.value)}
                    className="w-full bg-white/10 border border-white/20 rounded-2xl p-4 text-lg text-white appearance-none focus:outline-none focus:border-purple-500 cursor-pointer"
                  >
                    <option value="" className="bg-[#191919] text-gray-400">
                      Select an option...
                    </option>
                    {(currentQ.choices || []).map((c, idx) => (
                      <option key={idx} value={c} className="bg-[#191919] text-white">
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {currentQ.type === 'email' && (
                <div className="border-b-2 border-white/20 focus-within:border-purple-500 transition-colors pb-2">
                  <input
                    type="email"
                    value={answers[currentQ.id] || ''}
                    onChange={(e) => handleAnswer(e.target.value)}
                    placeholder="name@example.com"
                    className="bg-transparent text-xl sm:text-2xl text-white placeholder-gray-600 focus:outline-none w-full"
                    autoFocus
                  />
                </div>
              )}

              {currentQ.type === 'number' && (
                <div className="border-b-2 border-white/20 focus-within:border-purple-500 transition-colors pb-2 max-w-sm">
                  <input
                    type="number"
                    value={answers[currentQ.id] !== undefined ? answers[currentQ.id] : ''}
                    onChange={(e) => handleAnswer(e.target.value)}
                    placeholder="0"
                    className="bg-transparent text-2xl sm:text-3xl text-white placeholder-gray-600 focus:outline-none w-full"
                    autoFocus
                  />
                </div>
              )}

              {currentQ.type === 'yes_no' && (
                <div className="flex items-center space-x-4">
                  {['Yes', 'No'].map((opt) => {
                    const isSelected = answers[currentQ.id] === opt;
                    return (
                      <button
                        key={opt}
                        onClick={() => {
                          handleAnswer(opt);
                          setTimeout(() => handleNext(opt), 200);
                        }}
                        className={`flex-1 p-5 rounded-2xl border font-bold text-lg transition-all flex items-center justify-center space-x-3 ${
                          isSelected
                            ? 'bg-purple-600/30 border-purple-500 text-white shadow-lg'
                            : 'bg-white/5 hover:bg-white/10 border-white/10 text-gray-200'
                        }`}
                      >
                        <span className="text-xs px-2 py-0.5 rounded bg-white/10 text-gray-300">
                          {opt[0]}
                        </span>
                        <span>{opt}</span>
                      </button>
                    );
                  })}
                </div>
              )}

              {currentQ.type === 'rating' && (
                <div className="flex items-center space-x-3">
                  {Array.from({ length: currentQ.max_val || 5 }).map((_, idx) => {
                    const score = idx + 1;
                    const isSelected = answers[currentQ.id] >= score;
                    return (
                      <button
                        key={score}
                        onClick={() => {
                          handleAnswer(score);
                          setTimeout(() => handleNext(score), 200);
                        }}
                        className={`p-4 rounded-2xl border transition-all ${
                          isSelected
                            ? 'bg-purple-600/30 border-purple-500 text-yellow-400 scale-105'
                            : 'bg-white/5 hover:bg-white/10 border-white/10 text-gray-500'
                        }`}
                      >
                        <Star
                          className={`w-7 h-7 ${
                            isSelected ? 'fill-yellow-400 stroke-yellow-400' : 'stroke-gray-500'
                          }`}
                        />
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* OK Advance Button */}
            <div className="pt-6 flex items-center space-x-4">
              <button
                onClick={() => handleNext()}
                disabled={isSubmitting}
                className="text-white font-bold text-base px-7 py-3 rounded-2xl shadow-xl transition-transform active:scale-95 flex items-center space-x-2"
                style={{ backgroundColor: themeColor }}
              >
                <span>{currentIndex === questions.length - 1 ? 'Submit' : 'OK'}</span>
                <Check className="w-4 h-4" />
              </button>
              <span className="text-xs text-gray-400 hidden sm:inline">
                press <span className="font-bold text-gray-200">Enter ↵</span>
              </span>
            </div>
          </div>
        </main>
      ) : (
        /* Thank You Screen */
        <main className="flex-1 flex items-center justify-center p-6 z-20 animate-fade-in">
          <div className="max-w-md w-full bg-[#262626] border border-gray-800 rounded-3xl p-8 text-center space-y-6 shadow-2xl">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto text-white shadow-lg"
              style={{ backgroundColor: themeColor }}
            >
              <Check className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl font-bold text-white">
                {form.thank_you_title || 'Thank you!'}
              </h1>
              <p className="text-sm text-gray-400">
                {form.thank_you_message || 'Your response has been submitted successfully.'}
              </p>
            </div>

            <div className="pt-4 border-t border-gray-800 flex justify-center">
              <button
                onClick={() => {
                  setAnswers({});
                  setCurrentIndex(0);
                  setIsCompleted(false);
                  setShowWelcome(true);
                }}
                className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl font-semibold text-sm transition-colors inline-flex items-center space-x-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Submit another response</span>
              </button>
            </div>
          </div>
        </main>
      )}

      {/* Bottom Bar Navigation & Progress */}
      <footer className="p-4 bg-[#191919]/90 backdrop-blur-md border-t border-white/5 flex items-center justify-between text-xs z-20">
        <div className="flex items-center space-x-3">
          <div className="w-32 sm:w-48 bg-white/10 h-2 rounded-full overflow-hidden">
            <div
              className="h-full transition-all duration-500 ease-out rounded-full"
              style={{ width: showWelcome ? '0%' : `${progressPercent}%`, backgroundColor: themeColor }}
            />
          </div>
          <span className="text-gray-400 font-semibold">
            {showWelcome ? '0' : progressPercent}% completed
          </span>
        </div>

        {!isCompleted && !showWelcome && (
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-xl text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronUp className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleNext()}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-xl text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
        )}
      </footer>
    </div>
  );
}
