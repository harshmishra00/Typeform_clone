'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/ui/Navbar';
import { FormListItem } from '@/lib/types';
import { getForms, createForm, duplicateForm, deleteForm, updateForm } from '@/lib/api';
import {
  Plus,
  Search,
  ChevronDown,
  List,
  Grid,
  MoreHorizontal,
  Sparkles,
  Users,
  Zap,
  TestTube2,
  Calendar,
  Mic,
  Send,
  Minimize2,
  Maximize2,
  ExternalLink,
  Edit,
  Copy,
  Trash2,
  Globe,
  BarChart2
} from 'lucide-react';

export default function Dashboard() {
  const [forms, setForms] = useState<FormListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [creating, setCreating] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'forms' | 'contacts' | 'automations' | 'research'>('forms');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [aiPanelOpen, setAiPanelOpen] = useState(true);
  const [aiPrompt, setAiPrompt] = useState('');

  const fetchForms = async () => {
    try {
      setLoading(true);
      const data = await getForms();
      setForms(data);
    } catch (err) {
      console.error('Failed to load forms', err);
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
    fetchForms();
  }, []);


  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    try {
      setCreating(true);
      const created = await createForm({ title: newTitle, description: newDesc });
      setShowCreateModal(false);
      setNewTitle('');
      setNewDesc('');
      window.location.href = `/builder/${created.id}`;
    } catch (err) {
      console.error('Error creating form', err);
    } finally {
      setCreating(false);
    }
  };

  const handleDuplicate = async (id: string) => {
    try {
      await duplicateForm(id);
      setActiveMenuId(null);
      fetchForms();
    } catch (err) {
      console.error('Failed to duplicate form', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this form? All responses will be deleted.')) return;
    try {
      await deleteForm(id);
      setActiveMenuId(null);
      fetchForms();
    } catch (err) {
      console.error('Failed to delete form', err);
    }
  };

  const handleTogglePublish = async (form: FormListItem) => {
    try {
      const nextStatus = form.status === 'published' ? 'draft' : 'published';
      await updateForm(form.id, { status: nextStatus });
      setActiveMenuId(null);
      fetchForms();
    } catch (err) {
      console.error('Failed to update status', err);
    }
  };

  const filteredForms = forms.filter(
    (f) =>
      f.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalResponses = forms.reduce((acc, f) => acc + f.response_count, 0);
  const publishedCount = forms.filter((f) => f.status === 'published').length;

  return (
    <div className="min-h-screen bg-[#F5F4F5] flex flex-col font-sans text-gray-900 select-none">
      {/* Top Main Navbar */}
      <Navbar onCreateForm={() => setShowCreateModal(true)} />

      {/* Main Container Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT COLUMN: Typeform AI Drawer */}
        {aiPanelOpen ? (
          <aside className="w-80 bg-white border-r border-gray-200 flex flex-col justify-between p-4 transition-all duration-300 relative flex-shrink-0">
            <div>
              {/* Header */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-1.5">
                  <Sparkles className="w-4 h-4 text-purple-600" />
                  <span className="font-bold text-xs text-gray-900">Typeform AI</span>
                  <span className="bg-purple-100 text-purple-700 text-[10px] font-bold px-1.5 py-0.5 rounded-md uppercase">
                    Beta
                  </span>
                </div>
                <button
                  onClick={() => setAiPanelOpen(false)}
                  className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
                  title="Collapse Panel"
                >
                  <Minimize2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Main Card */}
              <div className="flex flex-col items-center text-center px-3 py-10">
                <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 leading-snug mb-3">
                  What do you want to achieve?
                </h2>
                <p className="text-xs text-gray-500 leading-relaxed mb-6">
                  Tell Typeform AI your business goal. It can help you build forms, manage contacts, and create automations to get you there.
                </p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="w-full max-w-[200px] border border-gray-200 hover:border-gray-300 text-gray-700 text-xs font-semibold py-2 px-4 rounded-lg bg-white shadow-2xs hover:bg-gray-50 transition-all cursor-pointer"
                >
                  Help me get started
                </button>
              </div>
            </div>

            {/* Bottom Prompt Bar */}
            <div className="mt-auto">
              <div className="border border-purple-200 rounded-xl p-2.5 bg-purple-50/40 shadow-2xs focus-within:ring-2 focus-within:ring-purple-500 focus-within:bg-white transition-all">
                <input
                  type="text"
                  placeholder="Ask Typeform AI"
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  className="w-full bg-transparent text-xs text-gray-800 focus:outline-none placeholder-gray-400 mb-2"
                />
                <div className="flex items-center justify-between text-gray-400 pt-1">
                  <div className="flex items-center space-x-2">
                    <button className="hover:text-gray-600 transition-colors">
                      <Mic className="w-3.5 h-3.5" />
                    </button>
                    <button className="hover:text-gray-600 transition-colors">
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                    <button className="hover:text-gray-600 transition-colors text-[11px] font-medium">
                      ...
                    </button>
                  </div>
                  <button className="p-1 rounded-lg bg-purple-100 text-purple-600 hover:bg-purple-600 hover:text-white transition-colors">
                    <Send className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          </aside>
        ) : (
          <button
            onClick={() => setAiPanelOpen(true)}
            className="h-full border-r border-gray-200 bg-white hover:bg-gray-50 px-2 py-4 flex flex-col items-center justify-start text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
            title="Expand AI Panel"
          >
            <Maximize2 className="w-4 h-4 mb-3" />
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest rotate-90 origin-center mt-6">
              AI Panel
            </span>
          </button>
        )}

        {/* MIDDLE COLUMN: Workspace Sidebar Navigation */}
        <aside className="w-64 bg-[#F5F4F5] border-r border-gray-200/80 flex flex-col justify-between p-4 flex-shrink-0">
          <div>
            {/* Create Form Button */}
            <button
              onClick={() => setShowCreateModal(true)}
              className="w-full bg-[#262627] hover:bg-[#181819] text-white py-2.5 px-4 rounded-xl text-xs font-semibold flex items-center justify-center space-x-2 shadow-sm transition-all mb-4 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create form</span>
            </button>

            {/* Search */}
            <div className="relative mb-6">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-lg pl-9 pr-3 py-1.5 text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-all shadow-2xs"
              />
            </div>

            {/* Workspaces List Section */}
            <div>
              <div className="flex items-center justify-between mb-2 text-xs font-semibold text-gray-500">
                <div className="flex items-center space-x-2">
                  <Grid className="w-3.5 h-3.5" />
                  <span>Workspaces</span>
                </div>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="w-5 h-5 rounded-md hover:bg-gray-200/70 flex items-center justify-center text-gray-500 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Accordion list */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs text-gray-600 font-medium px-2 py-1.5 rounded-lg hover:bg-gray-200/50 cursor-pointer">
                  <span>Private</span>
                  <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                </div>
                <div className="flex items-center justify-between text-xs text-gray-900 font-semibold px-2 py-2 rounded-lg bg-gray-200/70 cursor-pointer">
                  <span>My workspace</span>
                  <span className="text-[11px] text-gray-500 font-bold">{forms.length}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Usage Limit Widget */}
          <div className="bg-white/60 rounded-xl p-3 border border-gray-200/60 shadow-2xs">
            <div className="text-xs font-semibold text-gray-600 mb-1.5">Responses collected</div>
            <div className="text-xs font-bold text-gray-900 mb-2">0 / 10</div>
            <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden mb-3">
              <div className="bg-purple-600 h-full w-[0%]"></div>
            </div>
            <button className="text-[11px] font-semibold text-gray-600 hover:text-gray-900 underline transition-colors cursor-pointer">
              Increase response limit
            </button>
          </div>
        </aside>

        {/* RIGHT COLUMN: Workspace Content Area */}
        <main className="flex-1 bg-white overflow-y-auto flex flex-col">
          {/* Workspace Secondary Navbar Tabs */}
          <div className="border-b border-gray-200 px-6 pt-4 flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <button
                onClick={() => setActiveTab('forms')}
                className={`pb-3 text-xs font-semibold flex items-center space-x-2 border-b-2 transition-colors cursor-pointer ${
                  activeTab === 'forms'
                    ? 'border-gray-900 text-gray-900'
                    : 'border-transparent text-gray-500 hover:text-gray-800'
                }`}
              >
                <Grid className="w-3.5 h-3.5" />
                <span>Forms</span>
              </button>

              <button
                onClick={() => setActiveTab('contacts')}
                className={`pb-3 text-xs font-semibold flex items-center space-x-2 border-b-2 transition-colors cursor-pointer ${
                  activeTab === 'contacts'
                    ? 'border-gray-900 text-gray-900'
                    : 'border-transparent text-gray-500 hover:text-gray-800'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Contacts</span>
              </button>

              <button
                onClick={() => setActiveTab('automations')}
                className={`pb-3 text-xs font-semibold flex items-center space-x-2 border-b-2 transition-colors cursor-pointer ${
                  activeTab === 'automations'
                    ? 'border-gray-900 text-gray-900'
                    : 'border-transparent text-gray-500 hover:text-gray-800'
                }`}
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Automations</span>
              </button>

              <button
                onClick={() => setActiveTab('research')}
                className={`pb-3 text-xs font-semibold flex items-center space-x-2 border-b-2 transition-colors cursor-pointer ${
                  activeTab === 'research'
                    ? 'border-gray-900 text-gray-900'
                    : 'border-transparent text-gray-500 hover:text-gray-800'
                }`}
              >
                <TestTube2 className="w-3.5 h-3.5" />
                <span>Research Flow</span>
                <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  Demo
                </span>
              </button>
            </div>
          </div>

          {/* Main Content Body */}
          <div className="p-8 max-w-6xl w-full">
            {/* Title & Action Line */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-3">
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">My workspace</h1>
                <button className="text-gray-400 hover:text-gray-600 transition-colors">
                  <MoreHorizontal className="w-4 h-4" />
                </button>
                <button className="flex items-center space-x-1.5 px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs font-medium text-gray-700 transition-colors cursor-pointer">
                  <Users className="w-3.5 h-3.5 text-gray-500" />
                  <span>Invite</span>
                </button>
                <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold border border-emerald-200">
                  💎
                </div>
              </div>

              {/* Sort & Filter Controls */}
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <button className="flex items-center space-x-2 border border-gray-200 hover:border-gray-300 rounded-lg px-3 py-1.5 text-xs font-medium text-gray-700 bg-white shadow-2xs transition-all cursor-pointer">
                    <Calendar className="w-3.5 h-3.5 text-gray-500" />
                    <span>Date created</span>
                    <ChevronDown className="w-3 h-3 text-gray-400" />
                  </button>
                </div>

                <div className="flex items-center bg-gray-100 p-0.5 rounded-lg border border-gray-200">
                  <button
                    onClick={() => setViewMode('list')}
                    className={`flex items-center space-x-1 px-2.5 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
                      viewMode === 'list' ? 'bg-white text-gray-900 shadow-2xs' : 'text-gray-500 hover:text-gray-800'
                    }`}
                  >
                    <List className="w-3.5 h-3.5" />
                    <span>List</span>
                  </button>
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`flex items-center space-x-1 px-2.5 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
                      viewMode === 'grid' ? 'bg-white text-gray-900 shadow-2xs' : 'text-gray-500 hover:text-gray-800'
                    }`}
                  >
                    <Grid className="w-3.5 h-3.5" />
                    <span>Grid</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Form Table List / Cards */}
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse"></div>
                ))}
              </div>
            ) : filteredForms.length === 0 ? (
              <div className="border border-dashed border-gray-300 rounded-2xl p-12 text-center max-w-md mx-auto my-12">
                <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center mx-auto mb-3">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-gray-900 mb-1">No typeforms yet</h3>
                <p className="text-xs text-gray-500 mb-5">
                  {searchQuery ? 'No forms match your search query.' : 'Create your first form to start collecting responses.'}
                </p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl text-xs font-semibold transition-all inline-flex items-center space-x-2 shadow-sm cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create form</span>
                </button>
              </div>
            ) : viewMode === 'list' ? (
              <div className="w-full">
                {/* Table Header */}
                <div className="grid grid-cols-12 px-4 py-2 text-xs font-semibold text-gray-400 border-b border-gray-100 mb-1">
                  <div className="col-span-6">Name</div>
                  <div className="col-span-1 text-center">Responses</div>
                  <div className="col-span-2 text-center">Completed</div>
                  <div className="col-span-2 text-center">Updated</div>
                  <div className="col-span-1 text-right">Integrations</div>
                </div>

                {/* Table Rows */}
                <div className="divide-y divide-gray-100">
                  {filteredForms.map((form) => (
                    <div
                      key={form.id}
                      className="grid grid-cols-12 px-4 py-3.5 items-center hover:bg-gray-50/80 rounded-xl transition-colors group relative"
                    >
                      {/* Name & Icon */}
                      <div className="col-span-6 flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-lg bg-purple-500 text-white flex items-center justify-center flex-shrink-0 shadow-2xs">
                          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
                          </svg>
                        </div>
                        <Link
                          href={`/builder/${form.id}`}
                          className="text-xs font-medium text-gray-900 hover:text-purple-600 transition-colors line-clamp-1"
                        >
                          {form.title}
                        </Link>
                      </div>

                      {/* Responses */}
                      <div className="col-span-1 text-center text-xs text-gray-400 font-medium">
                        {form.response_count > 0 ? form.response_count : '-'}
                      </div>

                      {/* Completed */}
                      <div className="col-span-2 text-center text-xs text-gray-400 font-medium">
                        -
                      </div>

                      {/* Updated */}
                      <div className="col-span-2 text-center text-xs text-gray-400 font-medium">
                        {new Date(form.updated_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </div>

                      {/* Integrations & Menu */}
                      <div className="col-span-1 flex items-center justify-end space-x-2">
                        <button className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-200/50 transition-colors cursor-pointer">
                          <Grid className="w-3.5 h-3.5" />
                        </button>
                        <div className="relative">
                          <button
                            onClick={() => setActiveMenuId(activeMenuId === form.id ? null : form.id)}
                            className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-200/50 transition-colors cursor-pointer"
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </button>

                          {activeMenuId === form.id && (
                            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-lg py-1 z-30 text-xs">
                              <Link
                                href={`/builder/${form.id}`}
                                className="flex items-center px-4 py-2 text-gray-700 hover:bg-purple-50 hover:text-purple-600"
                              >
                                <Edit className="w-3.5 h-3.5 mr-2 text-gray-400" />
                                Edit Builder
                              </Link>
                              <Link
                                href={`/responses/${form.id}`}
                                className="flex items-center px-4 py-2 text-gray-700 hover:bg-purple-50 hover:text-purple-600"
                              >
                                <BarChart2 className="w-3.5 h-3.5 mr-2 text-gray-400" />
                                Results & Stats
                              </Link>
                              {form.status === 'published' && (
                                <a
                                  href={`/to/${form.id}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="flex items-center px-4 py-2 text-gray-700 hover:bg-purple-50 hover:text-purple-600"
                                >
                                  <ExternalLink className="w-3.5 h-3.5 mr-2 text-gray-400" />
                                  View Public Link
                                </a>
                              )}
                              <button
                                onClick={() => handleTogglePublish(form)}
                                className="w-full text-left flex items-center px-4 py-2 text-gray-700 hover:bg-purple-50 hover:text-purple-600"
                              >
                                <Globe className="w-3.5 h-3.5 mr-2 text-gray-400" />
                                {form.status === 'published' ? 'Unpublish' : 'Publish Form'}
                              </button>
                              <button
                                onClick={() => handleDuplicate(form.id)}
                                className="w-full text-left flex items-center px-4 py-2 text-gray-700 hover:bg-purple-50 hover:text-purple-600"
                              >
                                <Copy className="w-3.5 h-3.5 mr-2 text-gray-400" />
                                Duplicate
                              </button>
                              <div className="border-t border-gray-100 my-1"></div>
                              <button
                                onClick={() => handleDelete(form.id)}
                                className="w-full text-left flex items-center px-4 py-2 text-red-600 hover:bg-red-50"
                              >
                                <Trash2 className="w-3.5 h-3.5 mr-2 text-red-500" />
                                Delete Form
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredForms.map((form) => (
                  <div
                    key={form.id}
                    className="border border-gray-200 hover:border-purple-300 rounded-xl p-4 bg-white shadow-2xs hover:shadow-sm transition-all flex flex-col justify-between"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-8 h-8 rounded-lg bg-purple-500 text-white flex items-center justify-center flex-shrink-0 shadow-2xs">
                        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                          <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
                        </svg>
                      </div>
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                        {form.status}
                      </span>
                    </div>

                    <div>
                      <Link href={`/builder/${form.id}`} className="block">
                        <h3 className="text-xs font-bold text-gray-900 hover:text-purple-600 transition-colors mb-1">
                          {form.title}
                        </h3>
                      </Link>
                      <p className="text-[11px] text-gray-500 line-clamp-2 min-h-[2rem]">
                        {form.description || 'No description provided.'}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400">
                      <span>{form.response_count} responses</span>
                      <Link
                        href={`/builder/${form.id}`}
                        className="text-purple-600 font-semibold hover:underline"
                      >
                        Edit →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Create Form Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 mb-1">Create new typeform</h2>
            <p className="text-xs text-gray-500 mb-6">
              Give your new form a name and description to get started.
            </p>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Form Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Customer Feedback Survey 2026"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Description / Goal (Optional)
                </label>
                <textarea
                  placeholder="e.g. Share feedback to help improve user experience"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating || !newTitle.trim()}
                  className="px-4 py-2 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-xl shadow-xs transition-all disabled:opacity-50 cursor-pointer"
                >
                  {creating ? 'Creating...' : 'Continue to Builder →'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

