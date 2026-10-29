'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { api } from '@/lib/api';
import { UserPreferences } from '@/lib/types';
import {
  Sparkles,
  Compass,
  DollarSign,
  Car,
  Clock,
  Heart,
  ArrowRight,
  SkipForward,
  Check,
  Mountain,
  Trees,
  Landmark,
  Users,
  UtensilsCrossed,
  SunMedium,
} from 'lucide-react';

export default function OnboardingPage() {
  const router = useRouter();
  const { user, updatePreferences } = useAuth();

  const [tripType, setTripType] = useState<UserPreferences['trip_type']>('historical');
  const [budget, setBudget] = useState<UserPreferences['budget']>('moderate');
  const [transportation, setTransportation] = useState<UserPreferences['transportation']>('driving');
  const [durationDays, setDurationDays] = useState(3);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([
    'Scenic views',
    'Historical monuments',
    'Local authentic cuisine',
  ]);

  const [saving, setSaving] = useState(false);

  const tripTypes = [
    { id: 'historical', label: 'Historical & Heritage', icon: <Landmark className="w-5 h-5" />, desc: 'Temples, forts, ruins & ancient landmarks' },
    { id: 'nature', label: 'Nature & Scenic', icon: <Trees className="w-5 h-5" />, desc: 'Mountains, lakes, viewpoints & landscapes' },
    { id: 'adventure', label: 'Adventure & Thrills', icon: <Mountain className="w-5 h-5" />, desc: 'Treks, wildlife, off-roading & outdoors' },
    { id: 'food', label: 'Food & Culinary', icon: <UtensilsCrossed className="w-5 h-5" />, desc: 'Highway diners, local delicacies & street eats' },
    { id: 'relaxation', label: 'Relaxation & Leisure', icon: <SunMedium className="w-5 h-5" />, desc: 'Quiet retreats, resorts, beaches & peace' },
    { id: 'family', label: 'Family Friendly', icon: <Users className="w-5 h-5" />, desc: 'Safe stops, parks, entertainment & comfort' },
  ];

  const budgetTiers = [
    { id: 'budget', label: 'Budget-Conscious', desc: 'Affordable stays, budget highway meals, free attractions' },
    { id: 'moderate', label: 'Comfortable / Moderate', desc: 'Balanced 3-4 star stays, popular local dining, paid entries' },
    { id: 'premium', label: 'Premium & Luxury', desc: 'Boutique heritage stays, fine dining, private experiences' },
  ];

  const availableInterests = [
    'Scenic views',
    'Historical monuments',
    'Local authentic cuisine',
    'Highway cafes',
    'Sunset viewpoints',
    'Photography spots',
    'Craft markets',
    'Religious shrines',
    'Wildlife & parks',
    'Lakes & rivers',
  ];

  const toggleInterest = (interest: string) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter((i) => i !== interest));
    } else {
      setSelectedInterests([...selectedInterests, interest]);
    }
  };

  const handleSavePreferences = async (skip: boolean = false) => {
    setSaving(true);
    const prefs: UserPreferences = {
      trip_type: tripType,
      budget: budget,
      transportation: transportation,
      duration_days: durationDays,
      interests: skip ? [] : selectedInterests,
    };

    try {
      if (!skip) {
        await api.updatePreferences(prefs).catch(() => {});
      }
      updatePreferences(prefs);
    } finally {
      setSaving(false);
      router.push('/dashboard');
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 py-10 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-3xl w-full bg-white rounded-3xl border border-slate-200/90 shadow-xl p-6 sm:p-10 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Step 1 of 1: Personalize Your AI</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-charcoal-900 tracking-tight">
              Welcome, {user?.full_name?.split(' ')[0] || 'Traveler'}!
            </h1>
            <p className="text-sm text-charcoal-500 mt-1">
              Tell us how you like to travel so Google Maps AI can craft the right recommendations.
            </p>
          </div>

          <button
            onClick={() => handleSavePreferences(true)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-charcoal-400 hover:text-charcoal-700 py-1 px-3 rounded-lg hover:bg-slate-100 transition self-start sm:self-auto"
          >
            <span>Skip for now</span>
            <SkipForward className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Section 1: Trip Type */}
        <div className="space-y-3">
          <label className="block text-xs font-bold text-charcoal-800 uppercase tracking-wider">
            1. What is your preferred travel vibe?
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {tripTypes.map((type) => {
              const selected = tripType === type.id;
              return (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => setTripType(type.id as any)}
                  className={`p-4 rounded-2xl border text-left transition flex flex-col justify-between ${
                    selected
                      ? 'border-brand-600 bg-brand-50/60 ring-2 ring-brand-500/20'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className={`p-2 rounded-xl ${selected ? 'bg-brand-600 text-white' : 'bg-slate-100 text-charcoal-600'}`}>
                      {type.icon}
                    </div>
                    {selected && <Check className="w-4 h-4 text-brand-600" />}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-charcoal-900">{type.label}</h4>
                    <p className="text-xs text-charcoal-500 mt-0.5 leading-snug">{type.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Section 2: Budget */}
        <div className="space-y-3 pt-2">
          <label className="block text-xs font-bold text-charcoal-800 uppercase tracking-wider">
            2. What is your target budget?
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {budgetTiers.map((b) => {
              const selected = budget === b.id;
              return (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => setBudget(b.id as any)}
                  className={`p-4 rounded-2xl border text-left transition ${
                    selected
                      ? 'border-brand-600 bg-brand-50/60 ring-2 ring-brand-500/20'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-bold text-sm text-charcoal-900">{b.label}</h4>
                    {selected && <Check className="w-4 h-4 text-brand-600" />}
                  </div>
                  <p className="text-xs text-charcoal-500 mt-1 leading-snug">{b.desc}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Section 3: Interests */}
        <div className="space-y-3 pt-2">
          <label className="block text-xs font-bold text-charcoal-800 uppercase tracking-wider">
            3. Select specific trip interests
          </label>
          <div className="flex flex-wrap gap-2">
            {availableInterests.map((interest) => {
              const selected = selectedInterests.includes(interest);
              return (
                <button
                  key={interest}
                  type="button"
                  onClick={() => toggleInterest(interest)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition flex items-center gap-1.5 ${
                    selected
                      ? 'bg-brand-600 text-white shadow-sm'
                      : 'bg-slate-100 text-charcoal-700 hover:bg-slate-200'
                  }`}
                >
                  {selected && <Check className="w-3.5 h-3.5" />}
                  <span>{interest}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
          <button
            type="button"
            disabled={saving}
            onClick={() => handleSavePreferences(false)}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-sm text-white bg-brand-600 hover:bg-brand-700 active:scale-95 shadow-md shadow-brand-500/20 transition flex items-center justify-center gap-2"
          >
            {saving ? (
              <span>Saving Preferences...</span>
            ) : (
              <>
                <span>Complete Onboarding & Enter Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
