'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Play, Pause, Globe } from 'lucide-react';
import { signupUser } from '@/lib/api';


/* ── Carousel slide data ─────────────────────────────────────────────── */
const SLIDES = [
  {
    eyebrow: 'Form builder',
    heading: 'Build refreshingly different forms',
    card: (
      <div className="relative w-full max-w-[360px] aspect-[4/3] bg-white rounded-2xl p-6 shadow-2xl border border-gray-100 flex flex-col justify-between overflow-hidden">
        <div className="space-y-1 text-center">
          <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Form builder</p>
          <h4 className="font-bold text-gray-900 text-sm">Build refreshingly different forms</h4>
        </div>
        <div className="my-4 bg-purple-50/50 rounded-xl p-4 border border-purple-100 relative">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[10px] font-bold text-tf-purple bg-tf-purple-light px-2 py-0.5 rounded-full">GLOSSY LOCKS</span>
            <span className="text-xs text-gray-400 font-bold">Aa</span>
          </div>
          <p className="text-xs font-bold text-gray-800 mb-3">Rate The Shampoo</p>
          <div className="flex space-x-1.5 justify-center">
            {[1, 2, 3, 4, 5].map((s) => (
              <span key={s} className="text-gray-300 text-base">★</span>
            ))}
          </div>
        </div>
        <div className="flex justify-between items-center text-[10px] text-gray-400 font-semibold">
          <span>1 of 5</span>
          <span className="bg-gray-100 px-2 py-0.5 rounded">OK ↵</span>
        </div>
      </div>
    ),
  },
  {
    eyebrow: 'Manage your audience',
    heading: 'Enrich and segment contacts automatically',
    card: (
      <div className="relative w-full max-w-[360px] aspect-[4/3] bg-white rounded-2xl p-6 shadow-2xl border border-gray-100 flex flex-col justify-between overflow-hidden">
        <div className="space-y-1 text-center">
          <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Audience</p>
          <h4 className="font-bold text-gray-900 text-sm">Target the right groups</h4>
        </div>
        <div className="my-4 space-y-2">
          <div className="flex items-center space-x-3 p-2 bg-emerald-50 border border-emerald-100 rounded-xl">
            <span className="w-5 h-5 rounded-full bg-emerald-500 text-white text-[10px] flex items-center justify-center font-bold">✓</span>
            <div className="text-left">
              <p className="text-[10px] font-bold text-gray-900">Enriched Contact Data</p>
              <p className="text-[8px] text-gray-500">Auto-filled social bio &amp; details</p>
            </div>
          </div>
          <div className="flex items-center space-x-3 p-2 bg-purple-50 border border-purple-100 rounded-xl">
            <span className="w-5 h-5 rounded-full bg-tf-purple text-white text-[10px] flex items-center justify-center font-bold">+</span>
            <div className="text-left">
              <p className="text-[10px] font-bold text-gray-900">Add new segment</p>
              <p className="text-[8px] text-gray-500">Prospect list generated via form</p>
            </div>
          </div>
        </div>
        <div className="text-[10px] text-gray-400 font-semibold text-center">Powered by AI Workflow</div>
      </div>
    ),
  },
  {
    eyebrow: 'Growth Flow',
    heading: 'Convert and retain customers on autopilot',
    card: (
      <div className="relative w-full max-w-[360px] aspect-[4/3] bg-white rounded-2xl p-6 shadow-2xl border border-gray-100 flex flex-col justify-between overflow-hidden">
        <div className="space-y-1 text-center">
          <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Growth Flow</p>
          <h4 className="font-bold text-gray-900 text-sm">Automate your growth pipeline</h4>
        </div>
        <div className="my-4 flex flex-col space-y-2">
          <div className="flex items-center space-x-2 p-2.5 bg-amber-50 border border-amber-100 rounded-xl">
            <div className="w-6 h-6 bg-amber-400 rounded-lg flex items-center justify-center text-white text-[10px] font-bold">⚡</div>
            <p className="text-[10px] font-bold text-gray-900">Share your email to get a free class</p>
          </div>
          <div className="flex items-center space-x-2 p-2.5 bg-blue-50 border border-blue-100 rounded-xl">
            <div className="w-6 h-6 bg-blue-500 rounded-lg flex items-center justify-center text-white text-[10px] font-bold">✉</div>
            <p className="text-[10px] font-bold text-gray-900">Send personalised follow-up</p>
          </div>
          <div className="mx-auto w-16 py-1 bg-emerald-500 text-white text-[9px] font-bold rounded-md text-center mt-1">Submit</div>
        </div>
        <div className="text-[10px] text-gray-400 font-semibold text-center">Runs 24 / 7</div>
      </div>
    ),
  },
];

/* ── Google icon SVG ─────────────────────────────────────────────────── */
const GoogleIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.07 5.07 0 0 1-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A11 11 0 0 0 1 12c0 1.78.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
  </svg>
);

/* ── Microsoft icon SVG ──────────────────────────────────────────────── */
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
export default function SignupPage() {
  const [slide, setSlide] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [fullName, setFullName] = useState('');
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
      setError('Please provide an email address and password.');
      return;
    }

    // Name validation
    if (!fullName.trim() || fullName.trim().length < 2) {
      setError('Please enter your full name (minimum 2 characters).');
      return;
    }

    // Email regex validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    // Password strength validation (min 8 characters, at least 1 letter and 1 number)
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    if (!hasLetter || !hasNumber) {
      setError('Password must contain both letters and numbers.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const res = await signupUser({ email, password, full_name: fullName.trim() });
      if (res.access_token) {
        localStorage.setItem('tf_token', res.access_token);
        localStorage.setItem('tf_user', JSON.stringify(res.user));
        window.location.href = '/dashboard';
      }
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'Failed to create account. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex font-twklausanne text-tf-neutral-1000 bg-white">
      {/* ─── LEFT: Showcase carousel ────────────────────────────────────── */}
      <div className="hidden lg:flex w-[48%] bg-tf-neutral-1000 flex-col justify-between relative text-white overflow-hidden">
        {/* subtle glow */}
        <div className="absolute inset-0 pointer-events-none opacity-20">
          <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-tf-purple rounded-full blur-[120px]" />
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
        <div className="relative z-10 flex flex-col items-center space-y-6 pb-10 px-8">
          <div className="flex items-center space-x-5">
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

          <div className="w-full text-center space-y-2 pt-5 border-t border-white/10">
            <p className="text-[10px] text-tf-neutral-300 font-bold uppercase tracking-widest">Trusted by over 150,000 brands.</p>
            <div className="flex justify-center items-center space-x-8 opacity-50 text-[11px] font-semibold text-white">
              <span>Amplitude</span>
              <span>HubSpot</span>
              <span>Airbnb</span>
              <span>Mailchimp</span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── RIGHT: Sign-up form ────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col justify-between p-6 sm:p-10">
        {/* top bar */}
        <div className="flex justify-between items-center">
          <button className="flex items-center space-x-1.5 px-3 py-1.5 border border-tf-gray-border rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-50 cursor-pointer transition-colors">
            <Globe className="w-3.5 h-3.5" />
            <span>English</span>
          </button>
          <div className="flex items-center space-x-3 text-xs font-semibold">
            <span className="text-gray-500 hidden sm:inline">Already have an account?</span>
            <Link href="/login" className="px-4 py-2 border border-tf-neutral-1000 hover:bg-tf-neutral-50 rounded-xl text-tf-neutral-1000 transition-colors font-bold">Log in</Link>
          </div>
        </div>

        {/* form area */}
        <div className="max-w-[400px] w-full mx-auto space-y-6">
          {/* logo */}
          <div className="text-center space-y-3">
            <div className="flex justify-center items-center space-x-2 text-tf-neutral-1000">
              <svg className="w-9 h-6" viewBox="0 0 43 24" fill="currentColor">
                <path fillRule="evenodd" clipRule="evenodd" d="M0 5.42456C0 1.8517 1.40765 0 3.78009 0C6.15215 0 7.56018 1.8517 7.56018 5.42456V16.2479C7.56018 19.8208 6.15252 21.6725 3.78009 21.6725C1.40765 21.6725 0 19.8208 0 16.2479V5.42456ZM25.4643 0H17.6512C10.6419 0 10.0894 3.027 10.0894 7.06301L10.0802 14.599C10.0802 18.8069 10.6082 21.6725 17.6784 21.6725H25.4643C32.4961 21.6725 33.0128 18.656 33.0128 14.62V7.07352C33.0128 3.027 32.4736 0 25.4643 0Z" />
              </svg>
              <span className="font-bold text-xl tracking-tight">Typeform</span>
            </div>
            <p className="text-sm text-gray-500 font-normal leading-relaxed">
              Create a free account to build conversational forms and surveys.
            </p>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-semibold">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Jane Doe"
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-tf-purple focus:border-transparent placeholder:text-gray-400 transition-all"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">Email <span className="text-red-500">*</span></label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-tf-purple focus:border-transparent placeholder:text-gray-400 transition-all"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">Password <span className="text-red-500">*</span></label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a strong password"
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-tf-purple focus:border-transparent placeholder:text-gray-400 transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 flex items-center justify-center px-4 py-3 bg-tf-neutral-1000 hover:bg-tf-neutral-800 text-white rounded-xl font-semibold text-sm transition-colors cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Creating account...' : 'Create my free account →'}
            </button>
          </form>
        </div>

        {/* footer */}
        <p className="text-[10px] text-gray-400 text-center max-w-sm mx-auto leading-relaxed pt-4">
          By signing up, you agree to Typeform&apos;s Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
}

