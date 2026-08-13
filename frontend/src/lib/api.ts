import axios from 'axios';
import { Form, FormListItem, Question, ResponseOut, QuestionStats, ResponseSubmit } from './types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8080/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('tf_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});


export const getForms = async (): Promise<FormListItem[]> => {
  const res = await api.get('/forms');
  return res.data;
};

export const getForm = async (id: string): Promise<Form> => {
  const res = await api.get(`/forms/${id}`);
  return res.data;
};

export const createForm = async (data: { title: string; description?: string }): Promise<Form> => {
  const res = await api.post('/forms', {
    ...data,
    status: 'draft',
    theme_color: '#a057bb',
    font_family: 'Inter',
    thank_you_title: 'Thank you for your time!',
    thank_you_message: 'Your response has been submitted successfully.',
    questions: [
      {
        type: 'short_text',
        title: 'What is your name?',
        description: 'Please type your full name',
        required: true,
        order: 0,
      },
    ],
  });
  return res.data;
};

export const updateForm = async (id: string, data: Partial<Form>): Promise<Form> => {
  const res = await api.put(`/forms/${id}`, data);
  return res.data;
};

export const duplicateForm = async (id: string): Promise<Form> => {
  const res = await api.post(`/forms/${id}/duplicate`);
  return res.data;
};

export const deleteForm = async (id: string): Promise<void> => {
  await api.delete(`/forms/${id}`);
};

export const syncQuestions = async (formId: string, questions: Question[]): Promise<Question[]> => {
  const res = await api.put(`/forms/${formId}/questions`, questions);
  return res.data;
};

export const submitResponse = async (formId: string, payload: ResponseSubmit): Promise<ResponseOut> => {
  const res = await api.post(`/forms/${formId}/submit`, payload);
  return res.data;
};

export const getResponses = async (formId: string): Promise<ResponseOut[]> => {
  const res = await api.get(`/forms/${formId}/responses`);
  return res.data;
};

export const getFormStats = async (formId: string): Promise<QuestionStats[]> => {
  const res = await api.get(`/forms/${formId}/stats`);
  return res.data;
};

export const getExportCsvUrl = (formId: string): string => {
  return `${API_BASE}/forms/${formId}/responses/export`;
};

// Auth API exports
export const loginUser = async (data: { email: string; password: string }) => {
  const res = await api.post('/auth/login', data);
  return res.data;
};

export const signupUser = async (data: { email: string; password: string; full_name?: string }) => {
  const res = await api.post('/auth/signup', data);
  return res.data;
};

export const fetchCurrentUser = async () => {
  const res = await api.get('/auth/me');
  return res.data;
};

