'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { MapPin, Sparkles, Menu, X, Compass, Route, BookmarkCheck, User, LogOut, ChevronRight } from 'lucide-react';

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Explore', href: '/explore' },
    { name: 'AI Planner', href: '/planner' },
    { name: 'How It Works', href: '/#how-it-works' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-white/90 backdrop-blur-md border-b border-slate-200/80 transition-all duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-700 via-brand-600 to-teal-500 text-white shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform duration-200">
              <MapPin className="w-5 h-5" />
              <Sparkles className="w-3 h-3 absolute -top-0.5 -right-0.5 text-yellow-300 animate-pulse" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5 font-bold text-lg text-charcoal-900 leading-tight tracking-tight">
                Google Maps <span className="bg-gradient-to-r from-brand-600 to-teal-600 bg-clip-text text-transparent">AI</span>
              </div>
              <span className="text-[10px] uppercase font-semibold text-charcoal-400 tracking-wider">Road Trip & Travel Engine</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? 'text-brand-600 bg-brand-50'
                      : 'text-charcoal-600 hover:text-charcoal-900 hover:bg-slate-100/80'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* User Auth Actions */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <Link
                  href="/dashboard"
                  className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                    pathname === '/dashboard' ? 'text-brand-600 bg-brand-50' : 'text-charcoal-700 hover:bg-slate-100'
                  }`}
                >
                  Dashboard
                </Link>
                <Link
                  href="/trips"
                  className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                    pathname === '/trips' ? 'text-brand-600 bg-brand-50' : 'text-charcoal-700 hover:bg-slate-100'
                  }`}
                >
                  My Trips
                </Link>
                <div className="h-4 w-px bg-slate-200" />
                <Link
                  href="/settings"
                  className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-charcoal-800 bg-slate-100 hover:bg-slate-200/80 rounded-lg transition-colors"
                  title="Profile & Settings"
                >
                  <div className="w-6 h-6 rounded-full bg-brand-600 text-white text-xs flex items-center justify-center font-bold">
                    {user.full_name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <span className="max-w-[100px] truncate">{user.full_name?.split(' ')[0]}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-2 text-charcoal-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm font-semibold text-charcoal-700 hover:text-charcoal-900 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-sm hover:shadow-brand-500/20 active:scale-95 transition-all duration-150"
                >
                  <span>Get Started</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-charcoal-600 hover:text-charcoal-900 hover:bg-slate-100"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile navigation panel */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-2 pb-6 space-y-3">
          <div className="flex flex-col space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 text-base font-medium rounded-lg text-charcoal-700 hover:bg-slate-50"
              >
                {link.name}
              </Link>
            ))}
          </div>

          <div className="pt-4 border-t border-slate-200">
            {user ? (
              <div className="space-y-2">
                <div className="px-3 py-2 text-sm font-semibold text-charcoal-500">
                  Signed in as <span className="text-charcoal-900 font-bold">{user.full_name}</span>
                </div>
                <Link
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-base font-medium text-charcoal-800 rounded-lg hover:bg-slate-100"
                >
                  <Compass className="w-5 h-5 text-brand-600" /> Dashboard
                </Link>
                <Link
                  href="/planner"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-base font-medium text-charcoal-800 rounded-lg hover:bg-slate-100"
                >
                  <Route className="w-5 h-5 text-brand-600" /> AI Trip Planner
                </Link>
                <Link
                  href="/trips"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-base font-medium text-charcoal-800 rounded-lg hover:bg-slate-100"
                >
                  <BookmarkCheck className="w-5 h-5 text-brand-600" /> My Trips
                </Link>
                <Link
                  href="/settings"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-base font-medium text-charcoal-800 rounded-lg hover:bg-slate-100"
                >
                  <User className="w-5 h-5 text-brand-600" /> Settings
                </Link>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-base font-medium text-red-600 rounded-lg hover:bg-red-50"
                >
                  <LogOut className="w-5 h-5" /> Sign Out
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-2.5 text-center font-medium text-charcoal-700 bg-slate-100 hover:bg-slate-200 rounded-xl"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-2.5 text-center font-medium text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-sm"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
