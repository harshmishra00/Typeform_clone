'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  motion,
  useScroll,
  useTransform,
  useInView,
  AnimatePresence
} from 'framer-motion';
import {
  ChevronDown,
  ArrowRight,
  TrendingUp,
  Play,
  Check,
  Video as VideoIcon,
  BarChart2,
  Globe,
  Star,
  Users,
  Compass,
  ArrowUpRight,
  Menu,
  X,
  Sparkles,
  MousePointerClick,
  ChevronUp,

} from 'lucide-react';

// Custom X (Twitter) icon
const TwitterIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

// Typeform Logo SVG
const TypeformLogo = ({ className = 'w-8 h-8', color = 'currentColor' }: { className?: string; color?: string }) => (
  <svg className={className} viewBox="0 0 43 24" fill={color}>
    <path fillRule="evenodd" clipRule="evenodd" d="M0 5.42456C0 1.8517 1.40765 0 3.78009 0C6.15215 0 7.56018 1.8517 7.56018 5.42456V16.2479C7.56018 19.8208 6.15252 21.6725 3.78009 21.6725C1.40765 21.6725 0 19.8208 0 16.2479V5.42456ZM25.4643 0H17.6512C10.6419 0 10.0894 3.027 10.0894 7.06301L10.0802 14.599C10.0802 18.8069 10.6082 21.6725 17.6784 21.6725H25.4643C32.4961 21.6725 33.0128 18.656 33.0128 14.62V7.07352C33.0128 3.027 32.4736 0 25.4643 0Z" />
  </svg>
);

// Typewriter Simulation Component
function TypewriterInput({ trigger }: { trigger: boolean }) {
  const [text, setText] = useState('');
  const fullText = "Build a feedback form for my client...";

  useEffect(() => {
    if (!trigger) {
      setText('');
      return;
    }
    let idx = 0;
    const interval = setInterval(() => {
      setText(fullText.substring(0, idx + 1));
      idx++;
      if (idx >= fullText.length) {
        clearInterval(interval);
      }
    }, 85);
    return () => clearInterval(interval);
  }, [trigger]);


  return (
    <div className="flex items-center space-x-1 min-h-[20px]">
      <span className="text-gray-800 text-xs sm:text-sm font-medium">{text}</span>
      <span className="w-1 h-3.5 bg-purple-600 animate-pulse" />
    </div>
  );
}

export default function HomePage() {
  // const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'ask' | 'act' | 'learn'>('ask');
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  // Parallax Scroll Tracking for Hero
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: heroScrollProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });

  const heroOpacity = useTransform(heroScrollProgress, [0, 0.5], [1, 0]);
  const heroScale = useTransform(heroScrollProgress, [0, 0.5], [1, 0.95]);

  // Differential parallax Y translation for absolute pills in Hero
  const pillYBg = useTransform(heroScrollProgress, [0, 1], [0, 180]);
  const pillYFg = useTransform(heroScrollProgress, [0, 1], [0, -80]);

  // Scroll tracking for Section 1 perspective rotation
  const s1Ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress: s1Progress } = useScroll({
    target: s1Ref,
    offset: ["start end", "end start"]
  });
  const rotateY1 = useTransform(s1Progress, [0, 0.45], [-15, 0]);
  const rotateX1 = useTransform(s1Progress, [0, 0.45], [5, 0]);
  const isS1InView = useInView(s1Ref, { once: false, amount: 0.3 });

  // Scroll tracking for Section 2 (Growth Flow) Media Card
  const s2Ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress: s2Progress } = useScroll({
    target: s2Ref,
    offset: ["start end", "end start"]
  });
  const s2CardScale = useTransform(s2Progress, [0, 0.45], [0.9, 1.0]);
  const s2CardRotate = useTransform(s2Progress, [0, 0.45], [-4, 0]);

  // Scroll tracking for Section 5 (Footer CTA) Scale & Corner Zoom
  const ctaRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: ctaProgress } = useScroll({
    target: ctaRef,
    offset: ["start end", "end end"]
  });
  const ctaScale = useTransform(ctaProgress, [0, 0.85], [0.92, 1.0]);
  const ctaRadius = useTransform(ctaProgress, [0, 0.85], ["24px", "0px"]);

  // Auto transition tabs/carousel for showcase dynamic demo
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveTab((prev) => {
        if (prev === 'ask') return 'act';
        if (prev === 'act') return 'learn';
        return 'ask';
      });
    }, 7000);
    return () => clearInterval(timer);
  }, []);

  const logoPartners = [
    {
      name: 'Webflow', svg: (
        <svg className="h-6 opacity-60 hover:opacity-100 transition-opacity" fill="currentColor" viewBox="0 0 100 24">
          <path d="M96.06 12L100 0h-3.94l-2.07 7.21L91.93 0h-3.94l3.94 12v6h4.13v-6zM80.24 6h4.13v12h-4.13zM67.88 6c-3.15 0-5.74 2.54-5.74 5.68s2.59 5.68 5.74 5.68 5.74-2.54 5.74-5.68-2.59-5.68-5.74-5.68zm0 7.74c-1.12 0-2.03-.92-2.03-2.06s.92-2.06 2.03-2.06 2.03.92 2.03 2.06-.92 2.06-2.03 2.06zm-17.7 0c-1.12 0-2.03-.92-2.03-2.06s.92-2.06 2.03-2.06 2.03.92 2.03 2.06-.92 2.06-2.03 2.06zm0-7.74c-3.15 0-5.74 2.54-5.74 5.68s2.59 5.68 5.74 5.68 5.74-2.54 5.74-5.68-2.59-5.68-5.74-5.68zM31.25 6h4.13v12h-4.13zM15.42 6h4.13v12h-4.13zM3.78 6C.63 6-1.96 8.54-1.96 11.68S.63 17.36 3.78 17.36s5.74-2.54 5.74-5.68S6.93 6 3.78 6zm0 7.74c-1.12 0-2.03-.92-2.03-2.06s.92-2.06 2.03-2.06 2.03.92 2.03 2.06-.92 2.06-2.03 2.06z" />
        </svg>
      )
    },
    {
      name: 'Zapier', svg: (
        <svg className="h-6 opacity-60 hover:opacity-100 transition-opacity" fill="currentColor" viewBox="0 0 100 24">
          <path d="M5.4 0h12v3.6H9v6h7.2v3.6H9v10.8H5.4V0zm19.2 16.8h10.8V24H24.6V0H30v20.4h5.4v-3.6zM46.2 6h10.8v3.6H46.2v6h7.2v3.6h-7.2V24H40.8V0H46.2v6zm21.6 10.8H78.6V24H67.8V0H73.2v20.4h5.4v-3.6zM89.4 0h5.4v24h-5.4V0z" />
        </svg>
      )
    },
    {
      name: 'HubSpot', svg: (
        <svg className="h-6 opacity-60 hover:opacity-100 transition-opacity" fill="currentColor" viewBox="0 0 100 24">
          <path d="M4.5 12a7.5 7.5 0 1115 0 7.5 7.5 0 01-15 0zm7.5-4.5a4.5 4.5 0 100 9 4.5 4.5 0 000-9zM31 6h5v12h-5V6zm12 0h5v12h-5V6zm12 0h5v12h-5V6zm12 0h5v12h-5V6zm12 0h5v12h-5V6z" />
        </svg>
      )
    },
    {
      name: 'Slack', svg: (
        <svg className="h-6 opacity-60 hover:opacity-100 transition-opacity" fill="currentColor" viewBox="0 0 100 24">
          <path d="M9.1 8c0-1.8-1.5-3.3-3.3-3.3S2.5 6.2 2.5 8s1.5 3.3 3.3 3.3H9.1V8zm0 2.2v4.8c0 1.8-1.5 3.3-3.3 3.3S2.5 16.8 2.5 15s1.5-3.3 3.3-3.3h3.3v.5zM16 9.1c1.8 0 3.3-1.5 3.3-3.3S17.8 2.5 16 2.5s-3.3 1.5-3.3 3.3v3.3H16zm-2.2 0H9.1c-1.8 0-3.3 1.5-3.3 3.3s1.5 3.3 3.3 3.3h4.8V9.1z" />
        </svg>
      )
    },
    {
      name: 'Stripe', svg: (
        <svg className="h-6 opacity-60 hover:opacity-100 transition-opacity" fill="currentColor" viewBox="0 0 100 24">
          <path d="M43 14.5c0 3-2.5 5.5-5.5 5.5H30v-10h7.5c3 0 5.5 2.5 5.5 5.5zm-8-2h-3v4h3c1.1 0 2-.9 2-2s-.9-2-2-2zM21 14.5c0 3-2.5 5.5-5.5 5.5H8v-10h7.5c3 0 5.5 2.5 5.5 5.5zm-8-2h-3v4h3c1.1 0 2-.9 2-2s-.9-2-2-2z" />
        </svg>
      )
    }
  ];

  const testimonialCards = [
    {
      logo: 'SmartBug.',
      quote: 'SmartBug Media increased sales leads by 40% with one form',
      bg: 'bg-[#F3EBF9] text-[#191919]',
      avatar: '/assets/images/avatar-1.jpg',
      initials: 'SM'
    },
    {
      logo: 'Double Denim',
      quote: 'Double Denim Marketing drove $3.67 million in sales',
      bg: 'bg-[#EAF6FF] text-[#191919]',
      avatar: '/assets/images/avatar-2.jpg',
      initials: 'DD'
    },
    {
      logo: 'Viva',
      quote: 'Viva scaled talent sourcing, decreasing time to hire by 50%',
      bg: 'bg-[#F9EBEB] text-[#191919]',
      avatar: '/assets/images/avatar-3.jpg',
      initials: 'V'
    }
  ];

  const [platformOpen, setPlatformOpen] = useState(false);
  const [solutionsOpen, setSolutionsOpen] = useState(false);
  const [resourcesOpen, setResourcesOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-tf-neutral-1000 text-tf-neutral-25 font-twklausanne overflow-x-hidden selection:bg-tf-purple selection:text-white relative">

      {/* ─── AMBIENT GLOW COMPONENT ──────────────────────────────────────────── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 90, 0]
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-[-20%] left-[-20%] w-[1000px] h-[1000px] bg-gradient-radial from-tf-purple/25 via-transparent to-transparent opacity-70 blur-[150px]"
        />
        <motion.div
          animate={{
            scale: [1, 1.15, 1],
            rotate: [0, -60, 0]
          }}
          transition={{
            duration: 16,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute bottom-[-20%] right-[-20%] w-[800px] h-[800px] bg-gradient-radial from-[#c084fc]/15 via-transparent to-transparent opacity-50 blur-[120px]"
        />
      </div>

      {/* ─── NAVIGATION BAR ─────────────────────────────────────────────────── */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 bg-tf-neutral-1000/90 backdrop-blur-md border-b border-white/5"
        onMouseLeave={() => setPlatformOpen(false)}
      >
        <div className="max-w-[1400px] mx-auto px-6 md:px-0 py-4 flex items-center justify-between">

          {/* LEFT SIDE */}
          <div className="flex items-center space-x-8">

            {/* LOGO */}
            <Link
              href="/"
              className="flex items-center space-x-2 text-white shrink-0"
            >
              <TypeformLogo
                className="w-7 h-[18px]"
                color="white"
              />

              <span className="font-bold text-lg tracking-tight font-twklausanne">
                Typeform
              </span>
            </Link>


            {/* DESKTOP NAV */}
            <div className="hidden lg:flex items-center space-x-6 text-sm text-gray-300 font-medium">

              {/* ================= PLATFORM ================= */}
              <div
                className="relative"
                onMouseEnter={() => setPlatformOpen(true)}
              >
                <button
                  className={`
              hover:text-white
              transition-colors
              flex
              items-center
              gap-1
              py-2
              ${platformOpen ? "text-white" : ""}
            `}
                >
                  <span>Platform</span>

                  {platformOpen ? (
                    <ChevronUp className="w-3 h-3" />
                  ) : (
                    <ChevronDown className="w-3 h-3" />
                  )}
                </button>
              </div>


              {/* ================= SOLUTIONS ================= */}
              <div
                className="relative"
                onMouseEnter={() => {
                  setSolutionsOpen(true);
                  setPlatformOpen(false);
                  setResourcesOpen(false);
                }}
              >
                <button
                  className={`hover:text-white transition-colors flex items-center gap-1 ${solutionsOpen ? "text-white" : ""
                    }`}
                >
                  <span>Solutions</span>

                  {solutionsOpen ? (
                    <ChevronUp className="w-3 h-3" />
                  ) : (
                    <ChevronDown className="w-3 h-3" />
                  )}
                </button>
              </div>


              {/* ================= RESOURCES ================= */}
              <div
                className="relative"
                onMouseEnter={() => {
                  setResourcesOpen(true);
                  setPlatformOpen(false);
                  setSolutionsOpen(false);
                }}
              >
                <button
                  className={`hover:text-white transition-colors flex items-center gap-1 ${resourcesOpen ? "text-white" : ""
                    }`}
                >
                  <span>Resources</span>

                  {resourcesOpen ? (
                    <ChevronUp className="w-3 h-3" />
                  ) : (
                    <ChevronDown className="w-3 h-3" />
                  )}
                </button>
              </div>


              {/* ================= PRICING ================= */}
              <Link
                href="/pricing"
                className="hover:text-white transition-colors"
              >
                Pricing
              </Link>

            </div>
          </div>


          {/* RIGHT SIDE */}
          <div className="hidden md:flex items-center space-x-4">

            <Link
              href="/login"
              className="text-sm font-semibold text-gray-300 hover:text-white transition-colors px-3 py-2"
            >
              Log in
            </Link>

            <button
              className="
          border
          border-white/20
          hover:border-white/40
          hover:bg-white/5
          text-white
          text-sm
          font-semibold
          px-4
          py-2.5
          rounded-xl
          transition-all
          cursor-pointer
        "
            >
              Contact sales
            </button>

            <Link
              href="/signup"
              className="
          bg-tf-neutral-25
          hover:bg-tf-neutral-100
          text-tf-neutral-1000
          text-sm
          font-bold
          px-4
          py-2.5
          rounded-xl
          transition-all
          shadow-tf-sm-inset
          font-twklausanne
        "
            >
              Sign up
            </Link>

          </div>


          {/* MOBILE BUTTON */}
          <button
            className="lg:hidden text-white"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>


          {/* MOBILE MENU */}
          {mobileMenuOpen && (
            <div className="absolute top-full left-0 right-0 bg-tf-neutral-1000 border-b border-white/10 p-6 flex flex-col space-y-4 lg:hidden">

              <button className="text-left font-medium text-lg text-gray-200">
                Platform
              </button>

              <button className="text-left font-medium text-lg text-gray-200">
                Solutions
              </button>

              <button className="text-left font-medium text-lg text-gray-200">
                Resources
              </button>

              <Link
                href="/pricing"
                className="font-medium text-lg text-gray-200"
              >
                Pricing
              </Link>

              <hr className="border-white/10" />

              <Link
                href="/login"
                className="text-center font-bold py-3 border border-white/20 rounded-xl"
              >
                Log in
              </Link>

              <Link
                href="/signup"
                className="text-center bg-tf-neutral-25 text-tf-neutral-1000 font-bold py-3 rounded-xl"
              >
                Sign up
              </Link>

            </div>
          )}
        </div>


        {/* ========================================================= */}
        {/* PLATFORM MEGA MENU */}
        {/* ========================================================= */}

        {platformOpen && (
          <div
            className="
        absolute
        top-full
        left-0
        right-0
        bg-[#29232d]
        border-t
        border-white/5
        shadow-2xl
      "
            onMouseEnter={() => setPlatformOpen(true)}
            onMouseLeave={() => setPlatformOpen(false)}
          >

            <div className="max-w-[1400px] mx-auto px-6 md:px-10 py-10">

              <div className="grid grid-cols-12 gap-8">


                {/* ================================================= */}
                {/* PLATFORM COLUMN */}
                {/* ================================================= */}

                <div className="col-span-4 pr-8 border-r border-white/15">

                  <div className="flex items-center gap-3 mb-8">

                    <div className="text-gray-400">
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                      >
                        <rect x="4" y="4" width="6" height="6" />
                        <rect x="14" y="4" width="6" height="6" />
                        <rect x="4" y="14" width="6" height="6" />
                        <rect x="14" y="14" width="6" height="6" />
                      </svg>
                    </div>

                    <span className="text-sm text-gray-300 tracking-wide">
                      PLATFORM
                    </span>

                  </div>


                  <div className="space-y-6">

                    <MegaMenuItem
                      title="Platform overview"
                      description="What is Typeform?"
                    />

                    <MegaMenuItem
                      title="Typeform AI"
                      description="Your AI know-pilot"
                    />

                    <MegaMenuItem
                      title="Growth Flow"
                      description="Automated workflows for GTM teams"
                      badge="NEW"
                    />

                    <MegaMenuItem
                      title="Research Flow"
                      description="AI-moderated research studies"
                      badge="NEW"
                    />

                    <MegaMenuItem
                      title="Contacts & Automations"
                      description="Automated workflows to grow your business"
                    />

                    <MegaMenuItem
                      title="Video engagement"
                      description="Interactive video forms"
                    />

                    <MegaMenuItem
                      title="Analytics and reporting"
                      description="Answers you can act on"
                    />

                    <MegaMenuItem
                      title="Integrations"
                      description="Connect all your apps"
                    />

                  </div>
                </div>


                {/* ================================================= */}
                {/* TOOLS COLUMN */}
                {/* ================================================= */}

                <div className="col-span-4 px-1 pr-8 border-r border-white/15">

                  <div className="flex items-center gap-3 mb-8">

                    <div className="text-gray-400">
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                      >
                        <rect x="5" y="8" width="14" height="12" rx="2" />
                        <path d="M8 8V5h8v3" />
                      </svg>
                    </div>

                    <span className="text-sm text-gray-300 tracking-wide">
                      TOOLS
                    </span>

                  </div>


                  <div className="space-y-6">

                    {[
                      "Form builder",
                      "Survey maker",
                      "Quiz maker",
                      "Test maker",
                      "Poll builder",
                      "Application form builder",
                      "Landing page builder",
                      "NPS form builder",
                      "Registration form builder",
                      "Short form builder",
                    ].map((item) => (
                      <Link
                        key={item}
                        href="#"
                        className="
                    block
                    text-[17px]
                    text-gray-100
                    hover:text-white
                    transition-colors
                  "
                      >
                        {item}
                      </Link>
                    ))}

                  </div>

                </div>


                {/* ================================================= */}
                {/* PROMOTIONAL COLUMN */}
                {/* ================================================= */}

                <div className="col-span-4 pl-1">

                  <div className="flex items-center gap-3 mb-6">

                    <div className="text-gray-400">
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                      >
                        <rect x="4" y="5" width="16" height="14" rx="2" />
                        <path d="M8 9h8M8 13h5" />
                      </svg>
                    </div>

                    <span className="text-sm text-gray-300 tracking-wide">
                      TEMPLATES
                    </span>

                  </div>


                  {/* TEMPLATE CARD */}
                  <Link
                    href="#"
                    className="group block"
                  >

                    <div className="relative h-[170px] flex items-center justify-center overflow-hidden rounded-xl">

                      <div
                        className="
                    absolute
                    w-[150px]
                    h-[120px]
                    bg-purple-400/20
                    blur-3xl
                  "
                      />

                      <div
                        className="
                    relative
                    w-[190px]
                    h-[120px]
                    bg-[#f6edff]
                    rounded-md
                    shadow-xl
                    rotate-[-2deg]
                    transition-transform
                    duration-300
                    group-hover:scale-105
                    group-hover:rotate-0
                  "
                      >

                        <div className="p-4">

                          <div className="text-[8px] text-purple-700 font-bold">
                            ZoDigital
                          </div>

                          <div className="mt-5 text-[8px] text-gray-600">
                            What's the best
                            <br />
                            email to reach
                            <br />
                            you on?
                          </div>

                          <button className="mt-2 text-[7px] px-2 py-1 bg-purple-500 text-white">
                            Submit
                          </button>

                        </div>

                      </div>

                    </div>


                    <div className="mt-3">

                      <p className="text-[15px] text-gray-200">
                        Free form, survey, and quiz templates
                      </p>

                      <span
                        className="
                    inline-block
                    mt-2
                    text-sm
                    text-white
                    border-b
                    border-white
                    pb-1
                  "
                      >
                        Choose one →
                      </span>

                    </div>

                  </Link>


                  {/* RESEARCH FLOW */}
                  <div className="mt-12">

                    <div className="flex items-center gap-3 mb-5">

                      <span className="text-gray-400">
                        ☆
                      </span>

                      <span className="text-sm text-gray-300 tracking-wide">
                        RESEARCH FLOW
                      </span>

                    </div>


                    <Link
                      href="#"
                      className="group block"
                    >

                      <div className="relative h-[180px] flex items-center justify-center overflow-hidden">

                        <div
                          className="
                      absolute
                      w-[140px]
                      h-[100px]
                      bg-purple-500/20
                      blur-3xl
                    "
                        />

                        <div
                          className="
                      relative
                      w-[180px]
                      h-[120px]
                      rounded-lg
                      bg-purple-200
                      rotate-[8deg]
                      transition-transform
                      duration-300
                      group-hover:rotate-0
                      group-hover:scale-105
                    "
                        >

                          <div className="absolute inset-4 bg-white/70 rounded-md p-3">

                            <div className="w-12 h-2 bg-gray-400 rounded mb-3" />

                            <div className="text-[8px] text-gray-600">
                              How familiar
                              <br />
                              are you with
                              <br />
                              Typeform?
                            </div>

                          </div>

                        </div>

                      </div>


                      <p className="text-[15px] text-gray-200 leading-relaxed">
                        Run in-depth AI-moderated studies in hours
                      </p>

                      <span
                        className="
                    inline-block
                    mt-2
                    text-sm
                    text-white
                    border-b
                    border-white
                    pb-1
                  "
                      >
                        Learn more →
                      </span>

                    </Link>

                  </div>

                </div>

              </div>

            </div>

          </div>
        )}

        {solutionsOpen && (
          <div
            className="
      absolute
      top-full
      left-0
      right-0
      bg-[#29232d]
      border-t
      border-white/5
      shadow-2xl
    "
            onMouseEnter={() => setSolutionsOpen(true)}
            onMouseLeave={() => setSolutionsOpen(false)}
          >
            <div className="max-w-[1400px] mx-auto px-6 md:px-10 py-10">

              <div className="grid grid-cols-12 gap-8">

                {/* ================= TEAMS ================= */}

                <div className="col-span-4 pr-8 border-r border-white/15">

                  <div className="flex items-center gap-3 mb-8">
                    <div className="text-gray-400">
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                      >
                        <circle cx="12" cy="8" r="3" />
                        <path d="M5 20c0-3.5 3-6 7-6s7 2.5 7 6" />
                      </svg>
                    </div>

                    <span className="text-sm text-gray-300 tracking-wide">
                      TEAMS
                    </span>
                  </div>

                  <div className="space-y-8">

                    <MegaMenuItem
                      title="Marketing"
                      description="For B2B and B2C marketing"
                    />

                    <MegaMenuItem
                      title="Product"
                      description="For product, UX, and research"
                    />

                    <MegaMenuItem
                      title="Human resources"
                      description="For HR, ops, and talent"
                    />

                    <MegaMenuItem
                      title="Customer success"
                      description="For CS and education"
                    />

                  </div>
                </div>


                {/* ================= USE CASES ================= */}

                <div className="col-span-4 px-1 pr-8 border-r border-white/15">

                  <div className="flex items-center gap-3 mb-8">

                    <div className="text-gray-400">
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                      >
                        <path d="M4 20V10" />
                        <path d="M10 20V6" />
                        <path d="M16 20V3" />
                        <path d="M22 20H2" />
                      </svg>
                    </div>

                    <span className="text-sm text-gray-300 tracking-wide">
                      USE CASES
                    </span>

                  </div>

                  <div className="space-y-7">

                    {[
                      "Lead generation",
                      "Employee onboarding",
                      "Employee satisfaction",
                      "Employee engagement",
                      "Customer feedback",
                    ].map((item) => (
                      <Link
                        key={item}
                        href="#"
                        className="
                  block
                  text-[17px]
                  text-gray-100
                  hover:text-white
                  transition-colors
                "
                      >
                        {item}
                      </Link>
                    ))}

                    <Link
                      href="#"
                      className="
                inline-block
                text-[16px]
                text-white
                border-b
                border-white
                pb-1
                mt-1
              "
                    >
                      View all use cases →
                    </Link>

                  </div>
                </div>


                {/* ================= PLANS ================= */}

                <div className="col-span-4 pl-1">

                  <div className="flex items-center gap-3 mb-8">

                    <div className="text-gray-400">
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                      >
                        <rect x="4" y="4" width="6" height="6" />
                        <rect x="14" y="4" width="6" height="6" />
                        <rect x="4" y="14" width="6" height="6" />
                        <rect x="14" y="14" width="6" height="6" />
                      </svg>
                    </div>

                    <span className="text-sm text-gray-300 tracking-wide">
                      PLANS
                    </span>

                  </div>

                  <div className="space-y-8">

                    <MegaMenuItem
                      title="Core"
                      description="Plans for everyone"
                    />

                    <MegaMenuItem
                      title="Growth"
                      description="Plans for GTM teams"
                      badge="NEW"
                    />

                    <MegaMenuItem
                      title="Research Flow"
                      description="Plans for research teams"
                      badge="NEW"
                    />

                    <MegaMenuItem
                      title="Talent"
                      description="Plans for HR and people teams"
                    />

                    <MegaMenuItem
                      title="Enterprise"
                      description="Plans for larger orgs"
                    />

                  </div>
                </div>

              </div>
            </div>
          </div>
        )}

        {resourcesOpen && (
          <div
            className="
      absolute
      top-full
      left-0
      right-0
      bg-[#29232d]
      border-t
      border-white/5
      shadow-2xl
    "
            onMouseEnter={() => setResourcesOpen(true)}
            onMouseLeave={() => setResourcesOpen(false)}
          >

            <div className="max-w-[1400px] mx-auto px-6 md:px-10 py-10">

              <div className="grid grid-cols-12 gap-8">

                {/* ================= SUPPORT ================= */}

                <div className="col-span-4 pr-8 border-r border-white/15">

                  <div className="flex items-center gap-3 mb-8">

                    <div className="text-gray-400">
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                      >
                        <path d="M4 13a8 8 0 0 1 16 0" />
                        <path d="M4 13v4a2 2 0 0 0 2 2h1v-6H4Z" />
                        <path d="M20 13v4a2 2 0 0 1-2 2h-1v-6h3Z" />
                      </svg>
                    </div>

                    <span className="text-sm text-gray-300 tracking-wide">
                      SUPPORT
                    </span>

                  </div>

                  <div className="space-y-8">

                    <MegaMenuItem
                      title="Help center"
                      description="Find quick answers"
                    />

                    <MegaMenuItem
                      title="Community"
                      description="Share and interact"
                    />

                    <MegaMenuItem
                      title="Contact us"
                      description="Speak to our team"
                    />

                  </div>

                </div>


                {/* ================= COMPANY ================= */}

                <div className="col-span-4 px-1 pr-8 border-r border-white/15">

                  <div className="flex items-center gap-3 mb-8">

                    <div className="text-gray-400">
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                      >
                        <rect x="5" y="5" width="14" height="15" />
                        <path d="M9 20V9h6v11" />
                        <path d="M2 20h20" />
                      </svg>
                    </div>

                    <span className="text-sm text-gray-300 tracking-wide">
                      COMPANY
                    </span>

                  </div>

                  <div className="space-y-8">

                    <MegaMenuItem
                      title="Partners"
                      description="Browse or join"
                    />

                    <MegaMenuItem
                      title="Careers"
                      description="Join our team"
                    />

                    <MegaMenuItem
                      title="Webinars"
                      description="Learn and get inspired"
                    />

                  </div>

                </div>


                {/* ================= BLOG ================= */}

                <div className="col-span-4 pl-1">

                  <div className="flex items-center gap-3 mb-8">

                    <div className="text-gray-400">
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                      >
                        <path d="M5 5h4v14H5z" />
                        <path d="M11 5h8v14h-8" />
                        <path d="M14 8h3" />
                        <path d="M14 11h3" />
                      </svg>
                    </div>

                    <span className="text-sm text-gray-300 tracking-wide">
                      BLOG
                    </span>

                  </div>


                  {/* BLOG IMAGE */}

                  <Link href="#" className="group block">

                    <div
                      className="
                w-full
                max-w-[310px]
                h-[200px]
                overflow-hidden
                mb-6
              "
                    >

                      <div
                        className="
                  relative
                  w-full
                  h-full
                  bg-[#f8f6f8]
                  transition-transform
                  duration-300
                  group-hover:scale-[1.02]
                "
                      >

                        {/* Fake blog artwork */}
                        <div className="absolute inset-3 bg-white">

                          <div className="absolute left-3 top-3 w-[60px] h-[170px] bg-gray-100 rounded" />

                          <div className="absolute left-[82px] top-4 w-[15px] h-[15px] rounded-full bg-purple-800" />

                          <div className="absolute left-[108px] top-5 w-[55px] h-[4px] bg-gray-300 rounded" />

                          <div className="absolute left-[108px] top-12 w-[35px] h-[4px] bg-gray-200 rounded" />

                          <div className="absolute left-[82px] top-[55px] w-[180px] h-[95px] bg-purple-100">

                            <div className="absolute right-4 top-4 w-[70px] h-[65px] bg-purple-300/60 rounded" />

                            <div className="absolute left-5 top-6 w-[50px] h-[5px] bg-purple-300 rounded" />
                            <div className="absolute left-5 top-9 w-[40px] h-[5px] bg-purple-200 rounded" />
                            <div className="absolute left-5 top-12 w-[45px] h-[5px] bg-purple-200 rounded" />

                          </div>

                        </div>

                      </div>

                    </div>


                    <p className="text-[17px] text-gray-100 mb-2">
                      Our guides, latest news, and more.
                    </p>

                    <span
                      className="
                inline-block
                text-[16px]
                text-white
                border-b
                border-white
                pb-1
              "
                    >
                      Browse blog →
                    </span>

                  </Link>

                </div>

              </div>

            </div>
          </div>
        )}
      </nav>

      {/* ─── HERO SECTION ───────────────────────────────────────────────────── */}
      <section
        ref={heroRef}
        className="pt-32 pb-16 px-6 text-center max-w-[1400px] mx-auto relative z-10 min-h-[510px] flex flex-col justify-center items-center">
        <motion.div style={{ opacity: heroOpacity, scale: heroScale, y: pillYFg }} className="w-full transform-gpu flex flex-col items-center">
          <p className="text-xs font-bold uppercase tracking-widest text-[#D3A2FF] mb-4">AI FORMS & AUTOMATION</p>
          <h1 className="w-full max-w-[1000px] text-5xl sm:text-6xl md:text-7xl lg:text-[76px] font-serif text-white tracking-[-0.04em] leading-[0.98] mb-6">
            Your favorite forms.<br />
            Now with AI automation.
          </h1>
          <p className="text-base md:text-lg text-gray-300 max-w-[760px] mx-auto mb-8 font-light leading-relaxed">
            Combine AI forms and automated workflows to drive revenue growth. Run in-depth research and manage the entire customer lifecycle. All in Typeform.
          </p>
          <Link
            href="/dashboard"
            className="inline-block bg-tf-neutral-25 hover:bg-tf-neutral-100 text-tf-neutral-1000 font-bold text-sm md:text-base px-6 py-3.5 rounded-xl shadow-tf-md transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] font-twklausanne cursor-pointer"
          >
            Get started—it's free
          </Link>
        </motion.div>
      </section>

      {/* ─── TABS & PREVIEW SHOWCASE ────────────────────────────────────────── */}
      <section className="px-6 md:px-0 max-w-[1400px] mx-auto mb-24 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 mb-4">
          {/* ASK */}
          <div
            onClick={() => setActiveTab('ask')}
            className={`p-5 rounded-2xl border cursor-pointer transition-all duration-300 ${activeTab === 'ask' ? 'border-[#D3A2FF] bg-white/[0.03] shadow-lg shadow-purple-950/20' : 'border-white/5 bg-transparent hover:bg-white/[0.01]'}`}
          >
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">ASK</p>
            <h3 className="text-[21px] font-medium text-white mb-2">Intelligent Forms</h3>
            <p className="text-[15px] text-gray-300 leading-relaxed">
              Build forms that adapt to every respondent and then analyze your data for rich insights.
            </p>
            <div className="h-1 bg-white/10 mt-5 rounded-full overflow-hidden">
              <div className={`h-full bg-purple-500 transition-all duration-[7000ms] ease-linear ${activeTab === 'ask' ? 'w-[45%]' : 'w-0'}`} />
            </div>
          </div>

          {/* ACT */}
          <div
            onClick={() => setActiveTab('act')}
            className={`p-5 rounded-2xl border cursor-pointer transition-all duration-300 ${activeTab === 'act' ? 'border-[#D3A2FF] bg-white/[0.03] shadow-lg shadow-purple-950/20' : 'border-white/5 bg-transparent hover:bg-white/[0.01]'}`}
          >
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">ACT</p>
            <div className="flex items-center space-x-2 mb-2">
              <h3 className="text-[21px] font-medium text-white">Growth Flow</h3>
              <span className="bg-[#D3A2FF]/20 text-[#D3A2FF] text-[10px] font-bold px-2 py-0.5 rounded-full">NEW</span>
            </div>
            <p className="text-[15px] text-gray-300 leading-relaxed">
              Convert and keep customers with automated AI segmentation and follow-ups.
            </p>
            <div className="h-1 bg-white/10 mt-5 rounded-full overflow-hidden">
              <div className={`h-full bg-purple-500 transition-all duration-[7000ms] ease-linear ${activeTab === 'act' ? 'w-[45%]' : 'w-0'}`} />
            </div>
          </div>

          {/* LEARN */}
          <div
            onClick={() => setActiveTab('learn')}
            className={`p-5 rounded-2xl border cursor-pointer transition-all duration-300 ${activeTab === 'learn' ? 'border-[#D3A2FF] bg-white/[0.03] shadow-lg shadow-purple-950/20' : 'border-white/5 bg-transparent hover:bg-white/[0.01]'}`}
          >
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">LEARN</p>
            <div className="flex items-center space-x-2 mb-2">
              <h3 className="text-[21px] font-medium text-white">Research Flow</h3>
              <span className="bg-[#D3A2FF]/20 text-[#D3A2FF] text-[10px] font-bold px-2 py-0.5 rounded-full">NEW</span>
            </div>
            <p className="text-[15px] text-gray-300 leading-relaxed">
              Make confident business decisions fast with AI-moderated studies and automated reports.
            </p>
            <div className="h-1 bg-white/10 mt-5 rounded-full overflow-hidden">
              <div className={`h-full bg-purple-500 transition-all duration-[7000ms] ease-linear ${activeTab === 'learn' ? 'w-[45%]' : 'w-0'}`} />
            </div>
          </div>
        </div>

        {/* Preview screen frame panel layout */}
        <div className="relative aspect-[16/9] w-full rounded-[24px] overflow-hidden bg-[#2D1B36] border border-white/10 flex items-center justify-center p-8 sm:p-16 mt-4">
          <iframe
            src="https://fast.wistia.net/embed/iframe/t7cmlcvvv1?autoPlay=true&muted=true"
            className="absolute inset-0 w-full h-full border-0 z-0"
            allow="autoplay; fullscreen"
            allowFullScreen
            title="Typeform video"
          />
        </div>
      </section>

      {/* ─── SECTION 1: INTELLIGENT FORMS (SCREENSHOT 3 & 4) ──────────────────── */}
      <section
        ref={s1Ref}
        className="bg-white text-[#191919] pt-[125px] pb-[105px] px-6 md:px-0 relative z-10"
      >
        <div className="max-w-[1060px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-[420px_600px] gap-[35px] items-center mb-[70px]">

            {/* Feature introduction */}
            <div className="space-y-[24px]">
              <p className="text-[12px] font-bold text-[#A855F7] uppercase tracking-[0.08em]">
                INTELLIGENT FORMS
              </p>
              <h2 className="text-[55px] leading-[1.08] tracking-[-0.025em] font-sans font-normal text-[#191919]">
                Build forms at the<br />
                drop of a prompt
              </h2>
              <p className="text-[16px] text-[#34303A] leading-[1.45] max-w-[430px]">
                With over 48 million responses collected monthly, Typeform AI builds best-in-class forms proven to get 3.5x more data. Brand easily, customize everything.
              </p>
              <button className="bg-[#191919] hover:bg-gray-800 text-white font-semibold text-[14px] px-[25px] py-[13px] rounded-[10px] transition-all">
                Explore forms
              </button>
            </div>


            {/* 3D Isometric Preview Frame Card panel */}
            <motion.div
              style={{
                perspective: 1000,
                rotateY: rotateY1,
                rotateX: rotateX1,
                transformStyle: "preserve-3d",
              }}
              className="relative w-full h-[400px] rounded-[22px] overflow-hidden bg-[#EEF4EF] border border-[#E5E5E5] shadow-[0_12px_30px_rgba(0,0,0,0.10)] transform-gpu"
            >
              <iframe
                src="https://fast.wistia.net/embed/iframe/jmjt5sn622"
                title="Intelligent Forms"
                allow="autoplay; fullscreen"
                allowFullScreen
                className="absolute inset-0 w-full h-full border-0"
              />
            </motion.div>
          </div>

          {/* Staggered lists components grid */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: { staggerChildren: 0.15 }
              }
            }}
            className="grid grid-cols-1 md:grid-cols-3 gap-[55px] pt-[42px] border-t border-[#EEEEEE]"
          >
            {[
              {
                icon: <TrendingUp className="w-5 h-5 text-[#191919]" />,
                title: 'High Response Rate',
                desc: 'Build forms people actually fill out with beautiful design and conversational logic that adapts to every response, doubling the completion rate vs. traditional forms.'
              },
              {
                icon: <VideoIcon className="w-5 h-5 text-[#191919]" />,
                title: 'Deeper Insights',
                desc: 'Get rich answers with video and audio responses, plus extra context from AI-generated follow-up questions that adapt as people complete your form.'
              },
              {
                icon: <BarChart2 className="w-5 h-5 text-[#191919]" />,
                title: 'Advanced Analytics',
                desc: 'Dig into both qualitative and quantitative data with topic and sentiment analysis, respondent comparison, and form drop-off analysis.'
              }
            ].map((feature, i) => (
              <motion.div
                key={i}
                variants={{
                  hidden: { opacity: 0, y: 30 },
                  visible: { opacity: 1, y: 0 }
                }}
                className="flex items-start gap-[14px]"
              >
                <div className="w-[44px] h-[44px] bg-[#F3E8FF] text-[#A855F7] rounded-[10px] flex items-center justify-center flex-shrink-0">
                  {feature.icon}
                </div>
                <div>
                  <h4 className="text-[23px] font-semibold text-[#191919] mb-1">{feature.title}</h4>
                  <p className="text-s text-black tracking-tighter">{feature.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section >



      {/* ─── SECTION 2: GROWTH FLOW (SCREENSHOT 4 & 5) ───────────────────────── */}
      < section ref={s2Ref} className="bg-[#1C1622] py-32 px-6 md:px-12 border-t border-white/5 relative z-10" >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-24">
            <h2 className="text-5xl sm:text-7xl font-serif text-white tracking-tight">
              When the form ends,<br />the flow begins...
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-24">

            {/* Left media / Wistia video */}
            <motion.div
              style={{ scale: s2CardScale, rotate: s2CardRotate }}
              className="relative aspect-video rounded-3xl overflow-hidden border border-white/10 shadow-2xl transform-gpu bg-[#2D2336]"
            >
              <iframe
                src="https://fast.wistia.net/embed/iframe/yinhk73d2e"
                title="Growth Flow"
                allow="autoplay; fullscreen"
                allowFullScreen
                className="absolute inset-0 w-full h-full border-0"
              />
            </motion.div>

            {/* Right text layout column */}
            <div className="space-y-6">
              <p className="text-xs font-bold text-[#D3A2FF] uppercase tracking-widest flex items-center space-x-2">
                <span>GROWTH FLOW</span>
                <span className="bg-[#D3A2FF]/20 text-[#D3A2FF] text-[9px] font-bold px-2 py-0.5 rounded-full">NEW</span>
              </p>
              <h3 className="text-3xl sm:text-5xl font-semibold text-white leading-tight">
                Be proactive with<br />customer data
              </h3>
              <p className="text-base text-gray-400 leading-relaxed">
                Set up automations that convert and keep customers for you. As opportunities arise, Growth Flow steps in to enrich leads, create segments, and send personalized messages.
              </p>
              <button className="bg-tf-neutral-25 hover:bg-tf-neutral-100 text-tf-neutral-1000 font-bold px-6 py-3 rounded-xl transition-all cursor-pointer font-twklausanne shadow-tf-sm-inset">
                Explore Growth Flow
              </button>
            </div>
          </div>

          {/* Three Feature Badges */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-12 border-t border-white/5">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-white/5 border border-white/10 text-[#D3A2FF] rounded-xl flex items-center justify-center flex-shrink-0">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-base font-bold text-white mb-1">Instant Lead Capture</h4>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Close deals directly in your forms. Capture e-signatures, schedule meetings with Google Calendar and Calendly, and accept payments with Stripe and Paypal.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-white/5 border border-white/10 text-[#D3A2FF] rounded-xl flex items-center justify-center flex-shrink-0">
                <Compass className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-base font-bold text-white mb-1">Data Enrichment</h4>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Enrich data to complete customer profiles, with industry-leading match rates of up to 92% for B2B companies and 71% for B2C companies.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-white/5 border border-white/10 text-[#D3A2FF] rounded-xl flex items-center justify-center flex-shrink-0">
                <Globe className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-base font-bold text-white mb-1">Customer Engagement</h4>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Follow up instantly across email, SMS, and your favorite tools. Trigger personalized workflows from any form submission or contact update.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section >

      {/* ─── SECTION 3: RESEARCH FLOW (SCREENSHOT 6) ─────────────────────────── */}
      < section className="bg-[#18121E] py-32 px-6 md:px-12 border-t border-white/5 relative z-10" >
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-24">

            {/* Left Column Text details */}
            <div className="space-y-6">
              <p className="text-xs font-bold text-[#D3A2FF] uppercase tracking-widest flex items-center space-x-2">
                <span>RESEARCH FLOW</span>
                <span className="bg-[#D3A2FF]/20 text-[#D3A2FF] text-[9px] font-bold px-2 py-0.5 rounded-full">NEW</span>
              </p>
              <h3 className="text-4xl sm:text-5xl font-serif text-white">
                Run fast research,<br />moderated by AI
              </h3>
              <p className="text-base text-gray-400 leading-relaxed">
                Make data-backed business decisions with Research Flow. It builds your research study, conducts 1000s of AI-moderated interviews at once, and analyzes the findings. Fast.
              </p>
              <button className="bg-tf-neutral-25 hover:bg-tf-neutral-100 text-tf-neutral-1000 font-bold px-6 py-3 rounded-xl transition-all cursor-pointer font-twklausanne shadow-tf-sm-inset">
                Explore Research Flow
              </button>
            </div>

            <div className="relative aspect-video rounded-3xl bg-[#231A2A] border border-white/10 overflow-hidden shadow-2xl">
              <iframe
                src="https://fast.wistia.net/embed/iframe/g8ze4tncn4"
                title="Research Flow"
                allow="autoplay; fullscreen"
                allowFullScreen
                className="absolute inset-0 w-full h-full border-0"
              />
            </div>
          </div>

          {/* Three Feature Badges */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-12 border-t border-white/5">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-white/5 border border-white/10 text-[#D3A2FF] rounded-xl flex items-center justify-center flex-shrink-0">
                <Compass className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-base font-bold text-white mb-1">Fast Insights</h4>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Get insights in hours, not weeks. AI handles recruiting, moderating, and synthesizing research studies from start to finish, so you uncover deep insights at light speed.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-white/5 border border-white/10 text-[#D3A2FF] rounded-xl flex items-center justify-center flex-shrink-0">
                <VideoIcon className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-base font-bold text-white mb-1">Qualitative & Quantitative</h4>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Run AI-moderated text, video, and voice interviews at survey scale and in one platform. Capture tone, hesitation, and the reasoning behind every answer.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-white/5 border border-white/10 text-[#D3A2FF] rounded-xl flex items-center justify-center flex-shrink-0">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-base font-bold text-white mb-1">Verified Panel Recruitment</h4>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Get the best possible insights. Use 400+ targeting criteria to reach the right audience, with built-in incentive management so you need fewer tools.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section >

      {/* ─── SECTION 4: PARTNERS & TESTIMONIALS (SCREENSHOT 7 & 8) ───────────── */}
      < section className="bg-white text-[#191919] py-32 px-6 md:px-12 text-center relative z-10" >
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-serif text-gray-900 mb-16">
            Join 150,000+ businesses driving revenue with Typeform
          </h2>

          {/* Continuous Infinite Brand Logo Marquee Track */}
          <div className="relative overflow-hidden w-full py-8 border-y border-gray-100 mb-20">
            <div className="flex space-x-16 items-center justify-around w-max animate-marquee">
              {[...logoPartners, ...logoPartners].map((partner, idx) => (
                <div key={idx} className="flex-shrink-0 px-4">
                  {partner.svg}
                </div>
              ))}
            </div>
          </div>

          {/* Focus-Scale Testimonial Carousel Deck */}
          <div className="relative w-full overflow-hidden py-10">
            <div className="flex flex-col md:flex-row items-center justify-center gap-6">
              {testimonialCards.map((card, idx) => {
                const isActive = activeTestimonial === idx;
                return (
                  <motion.div
                    key={idx}
                    onClick={() => setActiveTestimonial(idx)}
                    animate={{
                      scale: isActive ? 1.0 : 0.88,
                      opacity: isActive ? 1.0 : 0.45
                    }}
                    transition={{ duration: 0.4, ease: "easeInOut" }}
                    className={`p-8 rounded-3xl ${card.bg} flex flex-col justify-between aspect-square w-full max-w-sm text-left cursor-pointer transition-all duration-300 shadow-xl ${isActive ? 'ring-2 ring-purple-500/20 shadow-purple-950/20' : ''}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold tracking-wider text-sm">{card.logo}</span>
                      <div className="w-8 h-8 rounded-full bg-black/10 flex items-center justify-center text-[10px] font-bold">
                        {card.initials}
                      </div>
                    </div>
                    <h4 className="text-2xl font-serif font-medium leading-snug">{card.quote}</h4>
                  </motion.div>
                );
              })}
            </div>
            {/* Indicator dots navigation */}
            <div className="flex justify-center space-x-2 mt-8">
              {testimonialCards.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveTestimonial(i)}
                  className={`w-2.5 h-2.5 rounded-full transition-all ${activeTestimonial === i ? 'bg-purple-600 w-6' : 'bg-gray-300'}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section >

      {/* ─── SECTION 5: FOOTER CTA TRANSITION (SCREENSHOT 8 & 9) ──────────────── */}
      < motion.section
        ref={ctaRef}
        style={{ scale: ctaScale, borderRadius: ctaRadius }
        }
        className="bg-tf-neutral-1000 py-32 px-6 md:px-12 text-center relative overflow-hidden transform-gpu"
      >
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-tf-purple/10 rounded-full blur-[100px]" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto space-y-8">
          <h2 className="text-5xl sm:text-6xl md:text-7xl font-serif text-white tracking-tight leading-tight">
            AI forms and automation.<br />All in Typeform.
          </h2>
          <Link href="/dashboard" className="inline-block bg-tf-neutral-25 hover:bg-tf-neutral-100 text-tf-neutral-1000 font-bold text-base px-8 py-4 rounded-xl shadow-tf-md transition-all hover:scale-[1.02] active:scale-[0.98] font-twklausanne cursor-pointer">
            Get started—it's free
          </Link>
        </div>
      </motion.section >

      {/* ─── FOOTER NAV LINKS ────────────────────────────────────────────────── */}
      < footer className="bg-tf-neutral-1000/95 border-t border-white/5 py-20 px-6 md:px-12 text-gray-400 text-sm relative z-10 font-twklausanne" >
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-5 gap-8 mb-16">
          <div className="space-y-4">
            <p className="text-xs font-bold text-white uppercase tracking-wider">PRODUCT</p>
            <ul className="space-y-2">
              <li><Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
              <li><button className="hover:text-white transition-colors flex items-center space-x-1"><span>Enterprise</span><ChevronDown className="w-3 h-3" /></button></li>
            </ul>
          </div>

          <div className="space-y-4">
            <p className="text-xs font-bold text-white uppercase tracking-wider">TEMPLATES</p>
            <ul className="space-y-2">
              <li><button className="hover:text-white transition-colors flex items-center space-x-1"><span>Popular templates</span><ChevronDown className="w-3 h-3" /></button></li>
              <li><button className="hover:text-white transition-colors flex items-center space-x-1"><span>Recent templates</span><ChevronDown className="w-3 h-3" /></button></li>
              <li><button className="hover:text-white transition-colors flex items-center space-x-1"><span>Popular categories</span><ChevronDown className="w-3 h-3" /></button></li>
              <li><button className="hover:text-white transition-colors flex items-center space-x-1"><span>Recent categories</span><ChevronDown className="w-3 h-3" /></button></li>
            </ul>
          </div>

          <div className="space-y-4">
            <p className="text-xs font-bold text-white uppercase tracking-wider">INTEGRATIONS</p>
            <ul className="space-y-2">
              <li><button className="hover:text-white transition-colors flex items-center space-x-1"><span>Popular integration apps</span><ChevronDown className="w-3 h-3" /></button></li>
              <li><button className="hover:text-white transition-colors flex items-center space-x-1"><span>More integration apps</span><ChevronDown className="w-3 h-3" /></button></li>
              <li><button className="hover:text-white transition-colors flex items-center space-x-1"><span>Popular app categories</span><ChevronDown className="w-3 h-3" /></button></li>
              <li><button className="hover:text-white transition-colors flex items-center space-x-1"><span>More app categories</span><ChevronDown className="w-3 h-3" /></button></li>
            </ul>
          </div>

          <div className="space-y-4">
            <p className="text-xs font-bold text-white uppercase tracking-wider">RESOURCES</p>
            <ul className="space-y-2">
              <li><Link href="/blog" className="hover:text-white transition-colors">Blog</Link></li>
              <li><Link href="/guides" className="hover:text-white transition-colors">Guides</Link></li>
              <li><Link href="/help" className="hover:text-white transition-colors">Help center</Link></li>
              <li><Link href="/community" className="hover:text-white transition-colors">Community</Link></li>
              <li><Link href="/tutorials" className="hover:text-white transition-colors">Tutorials</Link></li>
              <li><Link href="/faqs" className="hover:text-white transition-colors">FAQs</Link></li>
              <li><button className="hover:text-white transition-colors flex items-center space-x-1"><span>Why Typeform?</span><ChevronDown className="w-3 h-3" /></button></li>
              <li><Link href="/referral" className="hover:text-white transition-colors">Referral program</Link></li>
              <li><button className="hover:text-white transition-colors flex items-center space-x-1"><span>Partners</span><ChevronDown className="w-3 h-3" /></button></li>
              <li><Link href="/status" className="hover:text-white transition-colors">System status</Link></li>
            </ul>
          </div>

          <div className="space-y-4">
            <p className="text-xs font-bold text-white uppercase tracking-wider">GET TO KNOW US</p>
            <ul className="space-y-2">
              <li><Link href="/about" className="hover:text-white transition-colors">About us</Link></li>
              <li><Link href="/brand" className="hover:text-white transition-colors">Brand</Link></li>
              <li><Link href="/careers" className="hover:text-white transition-colors">Careers</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors">Contact sales</Link></li>
              <li><Link href="/legal" className="hover:text-white transition-colors">Legal</Link></li>
              <li><Link href="/newsletter" className="hover:text-white transition-colors">Newsletter</Link></li>
            </ul>
            <div className="flex items-center space-x-3 pt-6 text-gray-500 font-semibold">
              <Link href="#" className="hover:text-white transition-colors text-xs">FB</Link>
              <Link href="#" className="hover:text-white transition-colors"><TwitterIcon /></Link>
              <Link href="#" className="hover:text-white transition-colors text-xs">IG</Link>
              <Link href="#" className="hover:text-white transition-colors text-xs">YT</Link>
              <Link href="#" className="hover:text-white transition-colors text-xs">LN</Link>
            </div>
          </div>
        </div>
        <p>This website is a clone created by Harsh Mishra for educational and demonstration purposes. Since this is a clone, some features and functionality of the original website may not work as intended.
</p>
      </footer >
    </div >
  );
}

function MegaMenuItem({
  title,
  description,
  badge,
}: {
  title: string;
  description: string;
  badge?: string;
}) {
  return (
    <a
      href="#"
      className="group block transition-all"
    >
      <div className="flex items-center gap-2">
        <span className="text-[17px] text-gray-100 group-hover:text-white transition-colors">
          {title}
        </span>

        {badge && (
          <span
            className="
              text-[11px]
              font-semibold
              px-2
              py-[2px]
              rounded-full
              bg-purple-500
              text-white
              shadow-[0_0_15px_rgba(168,85,247,0.6)]
            "
          >
            {badge}
          </span>
        )}
      </div>

      <p className="text-[13px] text-gray-400 group-hover:text-gray-300 mt-0.5 transition-colors">
        {description}
      </p>
    </a>
  );
}
