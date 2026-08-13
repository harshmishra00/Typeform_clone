'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Form, Question, QuestionType } from '@/lib/types';
import { getForm, updateForm, syncQuestions } from '@/lib/api';
import {
  ArrowLeft,
  Plus,
  Trash2,
  MoveUp,
  MoveDown,
  Eye,
  Share2,
  BarChart2,
  Check,
  Globe,
  Settings,
  Type,
  AlignLeft,
  List,
  ChevronDown,
  Mail,
  Hash,
  ToggleLeft,
  Star,
  Sparkles
} from 'lucide-react';

const QUESTION_TYPES: { type: QuestionType; label: string; icon: any; desc: string }[] = [
  { type: 'short_text', label: 'Short Text', icon: Type, desc: 'Single-line text answer' },
  { type: 'long_text', label: 'Long Text', icon: AlignLeft, desc: 'Multi-line paragraph answer' },
  { type: 'multiple_choice', label: 'Multiple Choice', icon: List, desc: 'Choose from option cards' },
  { type: 'dropdown', label: 'Dropdown', icon: ChevronDown, desc: 'Select from a drop-down menu' },
  { type: 'email', label: 'Email', icon: Mail, desc: 'Email address validation' },
  { type: 'number', label: 'Number', icon: Hash, desc: 'Numeric response' },
  { type: 'yes_no', label: 'Yes / No', icon: ToggleLeft, desc: 'Simple Yes or No choice' },
  { type: 'rating', label: 'Rating', icon: Star, desc: 'Star score rating' },
];

export default function FormBuilderPage() {
  const params = useParams();
  const router = useRouter();
  const formId = params.id as string;

  const [form, setForm] = useState<Form | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [activeQuestionId, setActiveQuestionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [showAddMenu, setShowAddMenu] = useState(false);

  const fetchFormData = async () => {
    try {
      setLoading(true);
      const data = await getForm(formId);
      setForm(data);
      const sortedQ = [...data.questions].sort((a, b) => a.order - b.order);
      setQuestions(sortedQ);
      if (sortedQ.length > 0 && !activeQuestionId) {
        setActiveQuestionId(sortedQ[0].id);
      }
    } catch (err) {
      console.error('Failed to load form builder', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('tf_token');
      if (!token) {
        window.location.href = '/login';
        return;
      }
    }
    if (formId) {
      fetchFormData();
    }
  }, [formId]);


  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSaveAll = async (newFormState?: Partial<Form>, newQuestionsState?: Question[]) => {
    try {
      setSaving(true);
      const qToSave = newQuestionsState || questions;
      const updatedQ = await syncQuestions(formId, qToSave);
      setQuestions(updatedQ);

      if (newFormState || form) {
        const formPayload = newFormState || {
          title: form?.title,
          description: form?.description,
          status: form?.status,
          theme_color: form?.theme_color,
          font_family: form?.font_family,
          thank_you_title: form?.thank_you_title,
          thank_you_message: form?.thank_you_message,
        };
        const updatedForm = await updateForm(formId, formPayload);
        setForm(updatedForm);
      }
      showToast('All changes saved to database');
    } catch (err) {
      console.error('Error saving form', err);
      showToast('Error saving changes');
    } finally {
      setSaving(false);
    }
  };

  const activeQuestion = questions.find((q) => q.id === activeQuestionId) || questions[0];

  const handleAddQuestion = (type: QuestionType) => {
    const newQ: Question = {
      id: `temp-${Date.now()}`,
      type,
      title: `Untitled ${QUESTION_TYPES.find((t) => t.type === type)?.label || 'Question'}`,
      description: '',
      required: false,
      order: questions.length,
      choices: type === 'multiple_choice' || type === 'dropdown' ? ['Option 1', 'Option 2', 'Option 3'] : [],
      min_val: 1,
      max_val: 5,
    };
    const nextQ = [...questions, newQ];
    setQuestions(nextQ);
    setActiveQuestionId(newQ.id);
    setShowAddMenu(false);
    handleSaveAll(undefined, nextQ);
  };

  const handleDeleteQuestion = (id: string) => {
    if (questions.length <= 1) {
      alert('A form must have at least 1 question.');
      return;
    }
    const nextQ = questions.filter((q) => q.id !== id).map((q, idx) => ({ ...q, order: idx }));
    setQuestions(nextQ);
    if (activeQuestionId === id) {
      setActiveQuestionId(nextQ[0].id);
    }
    handleSaveAll(undefined, nextQ);
  };

  const handleMoveQuestion = (index: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === questions.length - 1)) {
      return;
    }
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const nextQ = [...questions];
    const temp = nextQ[index];
    nextQ[index] = nextQ[targetIndex];
    nextQ[targetIndex] = temp;
    const reordered = nextQ.map((q, idx) => ({ ...q, order: idx }));
    setQuestions(reordered);
    handleSaveAll(undefined, reordered);
  };

  const handleUpdateActiveQuestion = (field: keyof Question, value: any) => {
    if (!activeQuestion) return;
    const updated = questions.map((q) => {
      if (q.id === activeQuestion.id) {
        return { ...q, [field]: value };
      }
      return q;
    });
    setQuestions(updated);
  };

  const handleChoiceChange = (choiceIdx: number, val: string) => {
    if (!activeQuestion || !activeQuestion.choices) return;
    const nextChoices = [...activeQuestion.choices];
    nextChoices[choiceIdx] = val;
    handleUpdateActiveQuestion('choices', nextChoices);
  };

  const handleAddChoice = () => {
    if (!activeQuestion) return;
    const currentChoices = activeQuestion.choices || [];
    const nextChoices = [...currentChoices, `Option ${currentChoices.length + 1}`];
    handleUpdateActiveQuestion('choices', nextChoices);
  };

  const handleDeleteChoice = (choiceIdx: number) => {
    if (!activeQuestion || !activeQuestion.choices) return;
    const nextChoices = activeQuestion.choices.filter((_, idx) => idx !== choiceIdx);
    handleUpdateActiveQuestion('choices', nextChoices);
  };

  const handleCopyShareLink = () => {
    const url = `${window.location.origin}/to/${formId}`;
    navigator.clipboard.writeText(url);
    showToast('Shareable public link copied to clipboard!');
  };

  if (loading || !form) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-tf-purple border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-gray-500 font-semibold text-sm">Loading Typeform Builder...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F3F3F1] flex flex-col font-sans select-none overflow-hidden h-screen">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 right-4 bg-gray-900 text-white px-4 py-2.5 rounded-xl shadow-xl z-50 text-sm font-semibold flex items-center space-x-2 animate-slide-up">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header Bar */}
      <header className="bg-white border-b border-gray-200 h-14 px-4 flex items-center justify-between shrink-0 z-30 shadow-2xs">
        <div className="flex items-center space-x-4">
          <Link
            href="/"
            className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>

          <div>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              onBlur={() => handleSaveAll()}
              className="font-bold text-gray-900 bg-transparent text-sm hover:bg-gray-100 focus:bg-white px-2 py-0.5 rounded-md focus:outline-none focus:ring-2 focus:ring-tf-purple transition-all"
            />
          </div>
        </div>

        {/* Center Builder / Results Tabs */}
        <div className="flex items-center space-x-1 bg-gray-100 p-1 rounded-xl">
          <button className="px-4 py-1.5 bg-white text-tf-purple font-bold text-xs rounded-lg shadow-xs">
            Create / Edit
          </button>
          <Link
            href={`/responses/${formId}`}
            className="px-4 py-1.5 text-gray-600 hover:text-gray-900 font-semibold text-xs rounded-lg transition-colors flex items-center space-x-1.5"
          >
            <BarChart2 className="w-3.5 h-3.5" />
            <span>Results & Stats</span>
          </Link>
        </div>

        {/* Right Actions */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowThemeModal(true)}
            className="p-2 text-gray-600 hover:text-tf-purple hover:bg-tf-purple-light rounded-lg transition-colors flex items-center space-x-1.5 text-xs font-semibold"
          >
            <Settings className="w-4 h-4" />
            <span className="hidden sm:inline">Theme</span>
          </button>

          <button
            onClick={handleCopyShareLink}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors flex items-center space-x-1.5 text-xs font-semibold"
          >
            <Share2 className="w-4 h-4" />
            <span className="hidden sm:inline">Share</span>
          </button>

          <a
            href={`/to/${formId}`}
            target="_blank"
            rel="noreferrer"
            className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-xs rounded-lg transition-colors flex items-center space-x-1.5"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Preview</span>
          </a>

          <button
            onClick={() => {
              const nextStatus: 'draft' | 'published' = form.status === 'published' ? 'draft' : 'published';
              const updated: Form = { ...form, status: nextStatus };
              setForm(updated);
              handleSaveAll(updated);
            }}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all shadow-xs flex items-center space-x-1.5 ${
              form.status === 'published'
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                : 'bg-tf-purple hover:bg-tf-purple-hover text-white'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>{form.status === 'published' ? 'Published' : 'Publish'}</span>
          </button>
        </div>
      </header>

      {/* Main 3-Column Studio Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Column: Questions List Navigation */}
        <aside className="w-72 bg-white border-r border-gray-200 flex flex-col shrink-0">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Questions ({questions.length})
            </span>
            <div className="relative">
              <button
                onClick={() => setShowAddMenu(!showAddMenu)}
                className="flex items-center space-x-1 bg-tf-purple-light hover:bg-tf-purple/20 text-tf-purple px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Question</span>
              </button>

              {/* Add Question Menu */}
              {showAddMenu && (
                <div className="absolute left-0 mt-2 w-64 bg-white border border-gray-200 rounded-2xl shadow-xl p-2 z-40 text-sm max-h-96 overflow-y-auto">
                  <p className="px-3 py-1.5 text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Select Question Type
                  </p>
                  {QUESTION_TYPES.map((t) => {
                    const IconComp = t.icon;
                    return (
                      <button
                        key={t.type}
                        onClick={() => handleAddQuestion(t.type)}
                        className="w-full text-left flex items-start space-x-3 p-2.5 hover:bg-purple-50 rounded-xl transition-colors group"
                      >
                        <div className="p-2 bg-gray-100 group-hover:bg-tf-purple-light text-gray-700 group-hover:text-tf-purple rounded-lg">
                          <IconComp className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 text-xs">{t.label}</p>
                          <p className="text-[11px] text-gray-500">{t.desc}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {questions.map((q, idx) => {
              const isActive = q.id === activeQuestionId;
              const QIcon = QUESTION_TYPES.find((t) => t.type === q.type)?.icon || Type;

              return (
                <div
                  key={q.id}
                  onClick={() => setActiveQuestionId(q.id)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between group ${
                      isActive
                       ? 'bg-tf-purple-light border-tf-purple shadow-xs'
                       : 'bg-white border-gray-200 hover:border-tf-purple-light hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center space-x-3 overflow-hidden">
                    <span className="text-xs font-bold text-gray-400 w-4 text-center">{idx + 1}</span>
                    <div
                      className={`p-1.5 rounded-md ${
                        isActive ? 'bg-tf-purple text-white' : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      <QIcon className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-semibold text-gray-900 truncate max-w-[110px]">
                      {q.title || 'Untitled Question'}
                    </span>
                  </div>

                  <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMoveQuestion(idx, 'up');
                      }}
                      disabled={idx === 0}
                      className="p-1 hover:bg-gray-200 rounded text-gray-500 disabled:opacity-30"
                    >
                      <MoveUp className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMoveQuestion(idx, 'down');
                      }}
                      disabled={idx === questions.length - 1}
                      className="p-1 hover:bg-gray-200 rounded text-gray-500 disabled:opacity-30"
                    >
                      <MoveDown className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteQuestion(q.id);
                      }}
                      className="p-1 hover:bg-red-100 rounded text-red-500"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </aside>

        {/* Center Column: Question Property Editor */}
        {activeQuestion && (
          <div className="w-96 bg-white border-r border-gray-200 flex flex-col overflow-y-auto p-6 space-y-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-purple-700 bg-purple-100 px-2.5 py-1 rounded-md">
                Question Settings
              </span>
              <h2 className="text-lg font-bold text-gray-900 mt-2">Edit Question</h2>
            </div>

            {/* Title */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                Question Statement
              </label>
              <input
                type="text"
                value={activeQuestion.title}
                onChange={(e) => handleUpdateActiveQuestion('title', e.target.value)}
                onBlur={() => handleSaveAll()}
                className="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-tf-purple"
                placeholder="What is your question?"
              />
            </div>

            {/* Description / Help text */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                Description / Help Text (Optional)
              </label>
              <textarea
                value={activeQuestion.description || ''}
                onChange={(e) => handleUpdateActiveQuestion('description', e.target.value)}
                onBlur={() => handleSaveAll()}
                rows={2}
                className="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-tf-purple"
                placeholder="Add secondary context for the respondent"
              />
            </div>

            {/* Required Switch */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-200">
              <div>
                <p className="text-xs font-bold text-gray-900">Required Question</p>
                <p className="text-[11px] text-gray-500">Respondent must answer before advancing</p>
              </div>
              <input
                type="checkbox"
                checked={activeQuestion.required}
                onChange={(e) => {
                  handleUpdateActiveQuestion('required', e.target.checked);
                  handleSaveAll();
                }}
                className="w-4 h-4 text-tf-purple focus:ring-tf-purple rounded"
              />
            </div>

            {/* Choices Configuration for Multiple Choice & Dropdown */}
            {(activeQuestion.type === 'multiple_choice' || activeQuestion.type === 'dropdown') && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-700">
                    Option Choices
                  </label>
                  <button
                    onClick={handleAddChoice}
                    className="text-xs font-bold text-tf-purple hover:underline"
                  >
                    + Add Choice
                  </button>
                </div>

                <div className="space-y-2">
                  {(activeQuestion.choices || []).map((choice, cIdx) => (
                    <div key={cIdx} className="flex items-center space-x-2">
                      <span className="w-5 text-center text-xs font-bold text-gray-400">
                        {String.fromCharCode(65 + cIdx)}
                      </span>
                      <input
                        type="text"
                        value={choice}
                        onChange={(e) => handleChoiceChange(cIdx, e.target.value)}
                        onBlur={() => handleSaveAll()}
                        className="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-tf-purple"
                      />
                      <button
                        onClick={() => handleDeleteChoice(cIdx)}
                        className="p-1 text-gray-400 hover:text-red-500 rounded"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Rating Max Star Selection */}
            {activeQuestion.type === 'rating' && (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                  Scale Range (Stars)
                </label>
                <select
                  value={activeQuestion.max_val || 5}
                  onChange={(e) => {
                    handleUpdateActiveQuestion('max_val', parseInt(e.target.value));
                    handleSaveAll();
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-tf-purple"
                >
                  <option value={3}>3 Stars</option>
                  <option value={5}>5 Stars</option>
                  <option value={10}>10 Stars</option>
                </select>
              </div>
            )}
          </div>
        )}

        {/* Right Column: Live Typeform Preview Pane */}
        <div className="flex-1 bg-[#191919] p-8 flex items-center justify-center relative overflow-hidden">
          <div className="absolute top-4 left-4 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-bold text-white flex items-center space-x-2 border border-white/10">
            <Eye className="w-3.5 h-3.5 text-purple-400" />
            <span>Live Typeform Respondent Preview</span>
          </div>

          {activeQuestion && (
            <div className="max-w-xl w-full text-white space-y-6 animate-slide-up">
              {/* Question Number Badge */}
              <div className="flex items-center space-x-2 text-purple-400 font-bold text-sm">
                <span>{questions.findIndex((q) => q.id === activeQuestion.id) + 1}</span>
                <span>→</span>
                {activeQuestion.required && <span className="text-red-400 text-xs">* Required</span>}
              </div>

              {/* Title & Description */}
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                  {activeQuestion.title || 'Untitled Question'}
                </h1>
                {activeQuestion.description && (
                  <p className="text-sm text-gray-400 mt-2 font-normal">
                    {activeQuestion.description}
                  </p>
                )}
              </div>

              {/* Input Control Previews */}
              <div className="pt-4">
                {activeQuestion.type === 'short_text' && (
                  <div className="border-b-2 border-purple-500 pb-2">
                    <input
                      type="text"
                      disabled
                      placeholder="Type your answer here..."
                      className="bg-transparent text-xl text-white placeholder-gray-500 focus:outline-none w-full cursor-not-allowed"
                    />
                  </div>
                )}

                {activeQuestion.type === 'long_text' && (
                  <div className="border-2 border-purple-500/50 rounded-xl p-3 bg-white/5">
                    <textarea
                      disabled
                      rows={3}
                      placeholder="Type your paragraph response here..."
                      className="bg-transparent text-base text-white placeholder-gray-500 focus:outline-none w-full resize-none cursor-not-allowed"
                    />
                  </div>
                )}

                {activeQuestion.type === 'multiple_choice' && (
                  <div className="space-y-2.5">
                    {(activeQuestion.choices || ['Option 1', 'Option 2', 'Option 3']).map((choice, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3.5 bg-white/10 hover:bg-white/20 border border-white/15 rounded-xl text-sm font-semibold transition-all cursor-pointer"
                      >
                        <div className="flex items-center space-x-3">
                          <span className="w-6 h-6 rounded-md bg-purple-600/60 text-white font-bold text-xs flex items-center justify-center border border-purple-400/40">
                            {String.fromCharCode(65 + idx)}
                          </span>
                          <span>{choice}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {activeQuestion.type === 'dropdown' && (
                  <div className="p-3.5 bg-white/10 border border-white/15 rounded-xl text-sm font-semibold flex items-center justify-between text-gray-300">
                    <span>Select an option...</span>
                    <ChevronDown className="w-4 h-4" />
                  </div>
                )}

                {activeQuestion.type === 'email' && (
                  <div className="border-b-2 border-purple-500 pb-2">
                    <input
                      type="email"
                      disabled
                      placeholder="name@example.com"
                      className="bg-transparent text-xl text-white placeholder-gray-500 focus:outline-none w-full cursor-not-allowed"
                    />
                  </div>
                )}

                {activeQuestion.type === 'number' && (
                  <div className="border-b-2 border-purple-500 pb-2 max-w-xs">
                    <input
                      type="number"
                      disabled
                      placeholder="0"
                      className="bg-transparent text-2xl text-white placeholder-gray-500 focus:outline-none w-full cursor-not-allowed"
                    />
                  </div>
                )}

                {activeQuestion.type === 'yes_no' && (
                  <div className="flex items-center space-x-4">
                    <div className="flex-1 p-4 bg-white/10 hover:bg-white/20 border border-white/15 rounded-2xl font-bold text-center cursor-pointer">
                      Y — Yes
                    </div>
                    <div className="flex-1 p-4 bg-white/10 hover:bg-white/20 border border-white/15 rounded-2xl font-bold text-center cursor-pointer">
                      N — No
                    </div>
                  </div>
                )}

                {activeQuestion.type === 'rating' && (
                  <div className="flex items-center space-x-2">
                    {Array.from({ length: activeQuestion.max_val || 5 }).map((_, idx) => (
                      <button
                        key={idx}
                        disabled
                        className="p-3 bg-white/10 hover:bg-purple-600/50 border border-white/15 rounded-xl text-yellow-400 transition-all cursor-not-allowed"
                      >
                        <Star className="w-6 h-6 fill-yellow-400/20 stroke-yellow-400" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Bottom OK button simulation */}
              <div className="pt-4 flex items-center space-x-3">
                <button
                  disabled
                  className="bg-tf-purple text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg opacity-80"
                >
                  OK ✓
                </button>
                <span className="text-xs text-gray-500">press Enter ↵</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Theme Settings Modal */}
      {showThemeModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Form Theme & Settings</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                  Accent Color
                </label>
                <div className="flex items-center space-x-3">
                  {['#a057bb', '#00A86B', '#3B82F6', '#EF4444', '#F59E0B'].map((color) => (
                    <button
                      key={color}
                      onClick={() => setForm({ ...form, theme_color: color })}
                      className={`w-8 h-8 rounded-full border-2 transition-transform ${
                        form.theme_color === color ? 'border-gray-900 scale-110' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                  Thank You Title
                </label>
                <input
                  type="text"
                  value={form.thank_you_title}
                  onChange={(e) => setForm({ ...form, thank_you_title: e.target.value })}
                  className="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-tf-purple"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                  Thank You Message
                </label>
                <textarea
                  value={form.thank_you_message}
                  onChange={(e) => setForm({ ...form, thank_you_message: e.target.value })}
                  rows={2}
                  className="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-tf-purple"
                />
              </div>
            </div>

            <div className="flex justify-end mt-6 pt-4 border-t border-gray-100">
              <button
                onClick={() => {
                  setShowThemeModal(false);
                  handleSaveAll();
                }}
                className="px-5 py-2 bg-tf-purple text-white font-bold text-sm rounded-xl cursor-pointer"
              >
                Save Theme
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
