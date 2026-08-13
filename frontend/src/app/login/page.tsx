'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Play, Pause, Globe } from 'lucide-react';
import { loginUser } from '@/lib/api';


/* ── Carousel slide data ─────────────────────────────────────────────── */
const SLIDES = [
  {
    eyebrow: 'Powerful features',
    heading: 'Continue exploring powerful features that make data collection effortless',
    card: (
      <div className="relative w-full max-w-[400px] rounded-2xl overflow-hidden shadow-2xl border border-white/10">
        <div className="bg-gradient-to-br from-tf-purple/80 to-tf-neutral-1000 p-6 text-center space-y-2">
          <p className="text-[10px] uppercase tracking-widest text-tf-neutral-300 font-bold">Manage your audience</p>
          <h4 className="font-bold text-white text-sm">Enrich and segment contacts automatically</h4>
        </div>
        <div className="bg-tf-neutral-1000/90 p-5 space-y-2">
          <div className="flex items-center space-x-3 p-2.5 bg-white/5 border border-white/10 rounded-xl">
            <span className="w-6 h-6 rounded-full bg-blue-500 text-white text-[10px] flex items-center justify-center font-bold">👤</span>
            <div className="text-left">
              <p className="text-[10px] font-bold text-white">Enrich contact data</p>
              <p className="text-[8px] text-gray-400">Auto-fill profile details</p>
            </div>
          </div>
          <div className="flex items-center space-x-3 p-2.5 bg-white/5 border border-white/10 rounded-xl">
            <span className="w-6 h-6 rounded-full bg-emerald-500 text-white text-[10px] flex items-center justify-center font-bold">+</span>
            <div className="text-left">
              <p className="text-[10px] font-bold text-white">Add new contact</p>
              <p className="text-[8px] text-gray-400">@typeform.com</p>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    eyebrow: 'Research Flow',
    heading: 'Run thousands of AI-moderated interviews simultaneously',
    card: (
      <div className="relative w-full max-w-[400px] rounded-2xl overflow-hidden shadow-2xl border border-white/10">
        <div className="bg-gradient-to-br from-amber-500/60 to-tf-neutral-1000 p-6 text-center space-y-2">
          <p className="text-[10px] uppercase tracking-widest text-tf-neutral-300 font-bold">Research Flow</p>
          <h4 className="font-bold text-white text-sm">Deep insights in hours, not weeks</h4>
        </div>
        <div className="bg-tf-neutral-1000/90 p-5 space-y-2">
          <div className="flex items-center space-x-3 p-2.5 bg-white/5 border border-white/10 rounded-xl">
            <div className="w-6 h-6 bg-amber-400 rounded-lg flex items-center justify-center text-white text-[10px] font-bold">⚡</div>
            <p className="text-[10px] font-bold text-white">Share your email to get a free class</p>
          </div>
          <div className="flex items-center space-x-3 p-2.5 bg-white/5 border border-white/10 rounded-xl">
            <div className="w-6 h-6 bg-purple-500 rounded-lg flex items-center justify-center text-white text-[10px] font-bold">🔬</div>
            <p className="text-[10px] font-bold text-white">AI analysis of 1,000+ interviews</p>
          </div>
          <div className="mx-auto w-20 py-1.5 bg-emerald-500 text-white text-[9px] font-bold rounded-lg text-center mt-2">Submit</div>
        </div>
      </div>
    ),
  },
  {
    eyebrow: 'Growth Flow',
    heading: 'Drive revenue growth with automated workflows',
    card: (
      <div className="relative w-full max-w-[400px] rounded-2xl overflow-hidden shadow-2xl border border-white/10">
        <div className="bg-gradient-to-br from-emerald-500/60 to-tf-neutral-1000 p-6 text-center space-y-2">
          <p className="text-[10px] uppercase tracking-widest text-tf-neutral-300 font-bold">Growth Flow</p>
          <h4 className="font-bold text-white text-sm">Convert leads on autopilot</h4>
        </div>
        <div className="bg-tf-neutral-1000/90 p-5 space-y-2">
          <div className="flex items-center space-x-3 p-2.5 bg-white/5 border border-white/10 rounded-xl">
            <div className="w-6 h-6 bg-blue-500 rounded-lg flex items-center justify-center text-white text-[10px] font-bold">📊</div>
            <p className="text-[10px] font-bold text-white">Segment audiences automatically</p>
          </div>
          <div className="flex items-center space-x-3 p-2.5 bg-white/5 border border-white/10 rounded-xl">
            <div className="w-6 h-6 bg-tf-purple rounded-lg flex items-center justify-center text-white text-[10px] font-bold">✉</div>
            <p className="text-[10px] font-bold text-white">Personalised outreach at scale</p>
          </div>
        </div>
      </div>
    ),
  },
];

/* ── Icon helpers ─────────────────────────────────────────────────────── */
const GoogleIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.07 5.07 0 0 1-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A11 11 0 0 0 1 12c0 1.78.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
  </svg>
);
const MicrosoftIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 23 23" fill="none">
    <path fill="#F25022" d="M0 0h11v11H0z" />
    <path fill="#7FBA00" d="M12 0h11v11H12z" />
    <path fill="#00A4EF" d="M0 12h11v11H0z" />
    <path fill="#FFB900" d="M12 12h11v11H12z" />
  </svg>
);

/* ═══════════════════════════════════════════════════════════════════════
   COMPONENT
   ═══════════════════════════════════════════════════════════════════════ */
export default function LoginPage() {
  const [slide, setSlide] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!playing) return;
    const t = setInterval(() => setSlide((p) => (p + 1) % SLIDES.length), 6000);
    return () => clearInterval(t);
  }, [playing]);

  const prev = () => setSlide((p) => (p - 1 + SLIDES.length) % SLIDES.length);
  const next = () => setSlide((p) => (p + 1) % SLIDES.length);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in both email and password.');
      return;
    }
    try {
      setLoading(true);
      setError('');
      const res = await loginUser({ email, password });
      if (res.access_token) {
        localStorage.setItem('tf_token', res.access_token);
        localStorage.setItem('tf_user', JSON.stringify(res.user));
        window.location.href = '/dashboard';
      }
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'Failed to log in. Please check your credentials.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex font-twklausanne text-tf-neutral-1000 bg-white">
      {/* ─── LEFT: Login form ───────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col justify-between p-6 sm:p-10">
        {/* top bar with logo */}
        <div className="flex justify-between items-center">
          <Link href="/" className="flex items-center space-x-2 text-tf-neutral-1000 hover:opacity-80 transition-opacity">
            <svg className="w-7 h-5" viewBox="0 0 43 24" fill="currentColor">
              <path fillRule="evenodd" clipRule="evenodd" d="M0 5.42456C0 1.8517 1.40765 0 3.78009 0C6.15215 0 7.56018 1.8517 7.56018 5.42456V16.2479C7.56018 19.8208 6.15252 21.6725 3.78009 21.6725C1.40765 21.6725 0 19.8208 0 16.2479V5.42456ZM25.4643 0H17.6512C10.6419 0 10.0894 3.027 10.0894 7.06301L10.0802 14.599C10.0802 18.8069 10.6082 21.6725 17.6784 21.6725H25.4643C32.4961 21.6725 33.0128 18.656 33.0128 14.62V7.07352C33.0128 3.027 32.4736 0 25.4643 0Z" />
            </svg>
            <span className="font-bold text-lg tracking-tight">Typeform</span>
          </Link>
          <div className="flex items-center space-x-4 text-xs font-semibold">
            <span className="text-gray-500 hidden sm:inline">Have a question?</span>
            <button className="text-tf-neutral-1000 underline underline-offset-2 hover:no-underline cursor-pointer">Contact us</button>
            <button className="flex items-center space-x-1.5 px-3 py-1.5 border border-tf-gray-border rounded-xl text-gray-600 hover:bg-gray-50 cursor-pointer transition-colors">
              <Globe className="w-3.5 h-3.5" />
              <span>English</span>
            </button>
          </div>
        </div>

        {/* form area */}
        <div className="max-w-[380px] w-full mx-auto space-y-7">
          {/* heading */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-tf-neutral-1000 tracking-tight">Log in</h1>
            <p className="text-sm text-gray-500 leading-relaxed">
              Build forms, gather responses, and automate your workflows.
            </p>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-semibold">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* email field */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-tf-purple focus:border-transparent placeholder:text-gray-400 transition-all"
              />
            </div>

            {/* password field */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">Password</label>
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-tf-purple focus:border-transparent placeholder:text-gray-400 transition-all"
              />
            </div>

            {/* CTA */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 flex items-center justify-center px-4 py-3.5 bg-tf-neutral-1000 hover:bg-tf-neutral-800 text-white rounded-xl font-semibold text-sm transition-colors cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Logging in...' : 'Log in to Typeform →'}
            </button>
          </form>

          {/* Sign-up redirect */}
          <div className="text-center text-sm text-gray-500">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="font-bold text-tf-neutral-1000 underline underline-offset-4 hover:no-underline">
              Sign up
            </Link>
          </div>
        </div>

        {/* spacer */}
        <div />
      </div>


      {/* ─── RIGHT: Feature carousel ────────────────────────────────────── */}
      <div className="hidden lg:flex w-[48%] bg-tf-neutral-1000 flex-col justify-between relative text-white overflow-hidden">
        {/* subtle glow */}
        <div className="absolute inset-0 pointer-events-none opacity-15">
          <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-tf-purple rounded-full blur-[120px]" />
          <div className="absolute top-[10%] left-[20%] w-[300px] h-[300px] bg-amber-500 rounded-full blur-[100px]" />
        </div>

        {/* heading */}
        <div className="relative z-10 max-w-md mx-auto text-center pt-20 px-8">
          <p className="text-[11px] font-bold uppercase tracking-widest text-tf-neutral-300">{SLIDES[slide].eyebrow}</p>
          <h2 className="text-2xl sm:text-3xl font-tobias text-white mt-2 leading-tight">{SLIDES[slide].heading}</h2>
        </div>

        {/* card */}
        <div className="relative z-10 flex-1 flex items-center justify-center px-8">
          <AnimatePresence mode="wait">
            <motion.div key={slide} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -14 }} transition={{ duration: 0.35 }} className="w-full flex justify-center">
              {SLIDES[slide].card}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* controls */}
        <div className="relative z-10 flex items-center justify-center space-x-5 pb-12 px-8">
          <button onClick={prev} className="p-1.5 hover:bg-white/10 rounded-full transition-colors text-tf-neutral-300 hover:text-white cursor-pointer"><ChevronLeft className="w-5 h-5" /></button>
          <button onClick={() => setPlaying(!playing)} className="p-1.5 hover:bg-white/10 rounded-full transition-colors text-tf-neutral-300 hover:text-white cursor-pointer">
            {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>
          <div className="flex space-x-2">
            {SLIDES.map((_, i) => (
              <button key={i} onClick={() => setSlide(i)} className={`w-2 h-2 rounded-full transition-colors cursor-pointer ${i === slide ? 'bg-white' : 'bg-white/30'}`} />
            ))}
          </div>
          <button onClick={next} className="p-1.5 hover:bg-white/10 rounded-full transition-colors text-tf-neutral-300 hover:text-white cursor-pointer"><ChevronRight className="w-5 h-5" /></button>
        </div>
      </div>
    </div>
  );
}
