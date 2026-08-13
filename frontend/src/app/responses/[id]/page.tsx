'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import Navbar from '@/components/ui/Navbar';
import { Form, ResponseOut, QuestionStats } from '@/lib/types';
import { getForm, getResponses, getFormStats, getExportCsvUrl } from '@/lib/api';
import {
  ArrowLeft,
  Download,
  BarChart2,
  List,
  Clock,
  CheckCircle2,
  Calendar,
  Eye,
  Star,
  Hash,
  Sparkles,
  ChevronRight,
  X
} from 'lucide-react';

export default function ResponsesPage() {
  const params = useParams();
  const formId = params.id as string;

  const [form, setForm] = useState<Form | null>(null);
  const [responses, setResponses] = useState<ResponseOut[]>([]);
  const [stats, setStats] = useState<QuestionStats[]>([]);
  const [activeTab, setActiveTab] = useState<'summary' | 'table'>('summary');
  const [selectedResponse, setSelectedResponse] = useState<ResponseOut | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchResults = async () => {
    try {
      setLoading(true);
      const [formData, respData, statsData] = await Promise.all([
        getForm(formId),
        getResponses(formId),
        getFormStats(formId),
      ]);
      setForm(formData);
      setResponses(respData);
      setStats(statsData);
    } catch (err) {
      console.error('Failed to load form responses', err);
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
      fetchResults();
    }
  }, [formId]);


  if (loading || !form) {
    return (
      <div className="min-h-screen bg-[#F9F9F8] flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-tf-purple border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-gray-500 font-semibold text-sm">Loading Results & Analytics...</p>
        </div>
      </div>
    );
  }

  const avgCompletionTime =
    responses.length > 0
      ? Math.round(
          responses.reduce((acc, r) => acc + (r.completion_time_seconds || 0), 0) / responses.length
        )
      : 0;

  return (
    <div className="min-h-screen bg-[#F9F9F8] flex flex-col font-sans">
      <Navbar />

      {/* Header Bar */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center space-x-3">
              <Link
                href={`/builder/${formId}`}
                className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <div className="flex items-center space-x-2">
                  <h1 className="text-2xl font-bold text-gray-900">{form.title}</h1>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      form.status === 'published'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {form.status}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-0.5">Results & Analytics Overview</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Link
                href={`/builder/${formId}`}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-semibold transition-colors"
              >
                Edit Builder
              </Link>

              <a
                href={getExportCsvUrl(formId)}
                download
                className="px-4 py-2 bg-tf-purple hover:bg-tf-purple-hover text-white rounded-xl text-sm font-semibold shadow-sm transition-all flex items-center space-x-2 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Export CSV</span>
              </a>
            </div>
          </div>

          {/* Sub Navigation Tabs */}
          <div className="flex items-center space-x-4 mt-6 border-b border-gray-100">
            <button
              onClick={() => setActiveTab('summary')}
              className={`pb-3 font-bold text-sm border-b-2 transition-colors flex items-center space-x-2 ${
                activeTab === 'summary'
                  ? 'border-tf-purple text-tf-purple'
                  : 'border-transparent text-gray-500 hover:text-gray-900'
              }`}
            >
              <BarChart2 className="w-4 h-4" />
              <span>Summary Stats</span>
            </button>
            <button
              onClick={() => setActiveTab('table')}
              className={`pb-3 font-bold text-sm border-b-2 transition-colors flex items-center space-x-2 ${
                activeTab === 'table'
                  ? 'border-tf-purple text-tf-purple'
                  : 'border-transparent text-gray-500 hover:text-gray-900'
              }`}
            >
              <List className="w-4 h-4" />
              <span>Responses Table ({responses.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-tf-purple-light text-tf-purple flex items-center justify-center border border-tf-purple-light">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Total Submissions
              </p>
              <p className="text-2xl font-bold text-gray-900">{responses.length}</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Avg. Completion Time
              </p>
              <p className="text-2xl font-bold text-gray-900">{avgCompletionTime} seconds</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Completion Rate
              </p>
              <p className="text-2xl font-bold text-emerald-600">100%</p>
            </div>
          </div>
        </div>

        {/* Tab 1: Summary Analytics */}
        {activeTab === 'summary' && (
          <div className="space-y-6">
            {stats.map((stat, idx) => (
              <div key={stat.question_id} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <span className="w-6 h-6 rounded-md bg-tf-purple-light text-tf-purple font-bold text-xs flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <h3 className="font-bold text-gray-900 text-base">{stat.title}</h3>
                  </div>
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider px-2.5 py-1 bg-gray-100 rounded-md">
                    {stat.type.replace('_', ' ')}
                  </span>
                </div>

                {/* Multiple Choice / Dropdown / Yes-No Stats */}
                {stat.choice_counts && (
                  <div className="space-y-3 pt-2">
                    {Object.entries(stat.choice_counts).map(([choice, count]) => {
                      const pct = stat.total_answers > 0 ? Math.round((count / stat.total_answers) * 100) : 0;
                      return (
                        <div key={choice} className="space-y-1">
                          <div className="flex justify-between text-xs font-semibold text-gray-700">
                            <span>{choice}</span>
                            <span>
                              {count} answers ({pct}%)
                            </span>
                          </div>
                          <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
                            <div
                              className="bg-tf-purple h-full rounded-full transition-all duration-500"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Rating Stats */}
                {stat.average_rating !== null && stat.average_rating !== undefined && (
                  <div className="flex items-center space-x-4 pt-2">
                    <div className="bg-purple-50 border border-purple-100 p-4 rounded-xl flex items-center space-x-3">
                      <Star className="w-8 h-8 fill-yellow-400 stroke-yellow-500" />
                      <div>
                        <span className="block text-2xl font-extrabold text-tf-purple">
                          {stat.average_rating} / 5.0
                        </span>
                        <span className="text-xs text-gray-500 font-semibold">Average Rating</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Number Stats */}
                {stat.numeric_stats && (
                  <div className="grid grid-cols-3 gap-4 pt-2 max-w-md">
                    <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 text-center">
                      <span className="block text-xs font-semibold text-gray-400">Average</span>
                      <span className="text-lg font-bold text-gray-900">{stat.numeric_stats.avg}</span>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 text-center">
                      <span className="block text-xs font-semibold text-gray-400">Min</span>
                      <span className="text-lg font-bold text-gray-900">{stat.numeric_stats.min}</span>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 text-center">
                      <span className="block text-xs font-semibold text-gray-400">Max</span>
                      <span className="text-lg font-bold text-gray-900">{stat.numeric_stats.max}</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Tab 2: Individual Responses Table */}
        {activeTab === 'table' && (
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-700">
                <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-200">
                  <tr>
                    <th className="p-4">Submission Time</th>
                    <th className="p-4">Duration</th>
                    <th className="p-4">Answers Preview</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-medium">
                  {responses.map((resp) => (
                    <tr
                      key={resp.id}
                      onClick={() => setSelectedResponse(resp)}
                      className="hover:bg-purple-50/50 cursor-pointer transition-colors"
                    >
                      <td className="p-4 font-semibold text-gray-900">
                        {new Date(resp.submitted_at).toLocaleString()}
                      </td>
                      <td className="p-4 text-gray-500">{resp.completion_time_seconds}s</td>
                      <td className="p-4 text-gray-600 max-w-md truncate">
                        {resp.answers.map((a) => String(a.value)).join(' • ')}
                      </td>
                      <td className="p-4 text-right">
                        <button className="text-tf-purple font-semibold text-xs inline-flex items-center space-x-1 hover:underline">
                          <span>View Full</span>
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Individual Response Drawer / Modal */}
      {selectedResponse && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex justify-end z-50 animate-fade-in">
          <div className="bg-white w-full max-w-xl h-full p-6 shadow-2xl overflow-y-auto flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Response Detail</h2>
                  <p className="text-xs text-gray-500 mt-1">
                    Submitted on {new Date(selectedResponse.submitted_at).toLocaleString()}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedResponse(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg text-gray-500"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-6">
                {form.questions.map((q, idx) => {
                  const ans = selectedResponse.answers.find((a) => a.question_id === q.id);
                  return (
                    <div key={q.id} className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                      <div className="flex items-center space-x-2 text-xs font-bold text-gray-400 mb-1">
                        <span>Q{idx + 1}</span>
                        <span>•</span>
                        <span>{q.type}</span>
                      </div>
                      <p className="font-bold text-gray-900 text-sm mb-2">{q.title}</p>
                      <div className="bg-white p-3 rounded-lg border border-gray-200 text-sm font-semibold text-tf-purple">
                        {ans ? String(ans.value) : <span className="text-gray-400 italic">No answer provided</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pt-6 border-t border-gray-100 flex justify-end">
              <button
                onClick={() => setSelectedResponse(null)}
                className="px-5 py-2 bg-gray-900 text-white rounded-xl font-bold text-sm"
              >
                Close Drawer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
