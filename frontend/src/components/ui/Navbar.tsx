'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ChevronDown, Sliders, Palette, HelpCircle, LogOut } from 'lucide-react';

interface NavbarProps {
  onCreateForm?: () => void;
}

export default function Navbar({ onCreateForm }: NavbarProps) {
  const [user, setUser] = useState<{ email?: string; full_name?: string } | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('tf_user');
      if (stored) {
        try {
          setUser(JSON.parse(stored));
        } catch (e) {}
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('tf_token');
    localStorage.removeItem('tf_user');
    window.location.href = '/login';
  };

  const displayName = user?.full_name || user?.email?.split('@')[0] || 'harshmishra110804';
  const avatarInitials = (displayName.slice(0, 2) || 'HM').toUpperCase();

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-30 font-sans text-sm text-gray-700">
      <div className="w-full px-4 flex items-center justify-between h-13">
        {/* Left: User Account Selector */}
        <div className="flex items-center space-x-3">
          <div className="relative group">
            <button className="flex items-center space-x-2 px-2 py-1 rounded-lg hover:bg-gray-100 transition-colors font-medium text-gray-800 cursor-pointer">
              <div className="w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center text-xs font-bold">
                {avatarInitials[0]}
              </div>
              <span className="text-sm font-semibold text-gray-900">{displayName}</span>
              <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
            </button>
            <div className="absolute left-0 mt-1 w-48 bg-white border border-gray-200 rounded-xl shadow-lg py-1 hidden group-hover:block z-40">
              <div className="px-4 py-2 border-b border-gray-100 text-xs text-gray-500">
                Logged in as <br /><span className="font-bold text-gray-800">{user?.email || 'harshmishra'}</span>
              </div>
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 flex items-center space-x-2 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log out</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Actions & Utilities */}
        <div className="flex items-center space-x-5 text-gray-600 font-medium text-xs sm:text-sm">
          <button className="flex items-center space-x-1.5 hover:text-gray-900 transition-colors cursor-pointer">
            <Sliders className="w-4 h-4 text-gray-500" />
            <span>Integrations</span>
          </button>

          <button className="flex items-center space-x-1.5 hover:text-gray-900 transition-colors cursor-pointer">
            <Palette className="w-4 h-4 text-gray-500" />
            <span>Brand kit</span>
          </button>

          <button className="bg-[#007054] hover:bg-[#005a43] text-white px-3.5 py-1.5 rounded-full font-semibold text-xs transition-colors cursor-pointer shadow-xs">
            View plans
          </button>

          <button className="p-1 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer">
            <HelpCircle className="w-4 h-4" />
          </button>

          <div className="w-7 h-7 rounded-full bg-purple-100 text-purple-800 font-bold flex items-center justify-center text-xs border border-purple-200 cursor-pointer">
            {avatarInitials}
          </div>
        </div>
      </div>
    </header>
  );
}


