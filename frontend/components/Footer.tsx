import React from 'react';
import Link from 'next/link';
import { MapPin, Sparkles, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-white border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-700 to-teal-500 text-white shadow-md shadow-brand-500/20">
                <MapPin className="w-5 h-5" />
              </div>
              <span className="font-bold text-lg text-charcoal-900 tracking-tight">
                Google Maps <span className="text-brand-600">AI</span>
              </span>
            </Link>
            <p className="text-sm text-charcoal-500 leading-relaxed max-w-sm">
              The intelligent, next-generation road trip planner and destination discovery platform. Seamlessly unifying Google Maps Platform, Google ADK intelligence, and tailored itineraries.
            </p>
            <div className="flex items-center gap-2 text-xs text-charcoal-400">
              <span>Powered by Google ADK & Google Maps</span>
              <Sparkles className="w-3.5 h-3.5 text-brand-500" />
            </div>
          </div>

          {/* Navigation Links */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-charcoal-900 mb-3">Explore</h3>
            <ul className="space-y-2 text-sm text-charcoal-600">
              <li><Link href="/explore" className="hover:text-brand-600 transition-colors">Popular Destinations</Link></li>
              <li><Link href="/planner" className="hover:text-brand-600 transition-colors">AI Route Planner</Link></li>
              <li><Link href="/explore?category=restaurants" className="hover:text-brand-600 transition-colors">Food & Dining</Link></li>
              <li><Link href="/explore?category=scenic" className="hover:text-brand-600 transition-colors">Scenic Drives</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-charcoal-900 mb-3">Platform</h3>
            <ul className="space-y-2 text-sm text-charcoal-600">
              <li><Link href="/#features" className="hover:text-brand-600 transition-colors">Features</Link></li>
              <li><Link href="/#how-it-works" className="hover:text-brand-600 transition-colors">How It Works</Link></li>
              <li><Link href="/dashboard" className="hover:text-brand-600 transition-colors">Dashboard</Link></li>
              <li><Link href="/trips" className="hover:text-brand-600 transition-colors">My Trips</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-charcoal-900 mb-3">Legal & Trust</h3>
            <ul className="space-y-2 text-sm text-charcoal-600">
              <li><a href="#privacy" className="hover:text-brand-600 transition-colors">Privacy Policy</a></li>
              <li><a href="#terms" className="hover:text-brand-600 transition-colors">Terms of Service</a></li>
              <li><a href="#security" className="hover:text-brand-600 transition-colors">Security & MCP Safety</a></li>
              <li><a href="#contact" className="hover:text-brand-600 transition-colors">Contact Support</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-charcoal-400">
          <p>© {new Date().getFullYear()} Google Maps AI Travel Planner. All rights reserved.</p>
          <div className="flex items-center gap-1">
            <span>Crafted with</span>
            <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" />
            <span>for intelligent road trips</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
