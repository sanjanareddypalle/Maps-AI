'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { api } from '@/lib/api';
import { UserPreferences } from '@/lib/types';
import {
  User,
  Settings as SettingsIcon,
  Shield,
  Save,
  Trash2,
  LogOut,
  Sparkles,
  Check,
  AlertCircle,
  Mail,
  Car,
  Clock,
  DollarSign,
  Heart,
} from 'lucide-react';

export default function SettingsPage() {
  const router = useRouter();
  const { user, preferences, updateUser, updatePreferences, logout, isLoading } = useAuth();

  const [fullName, setFullName] = useState(user?.full_name || '');
  const [tripType, setTripType] = useState<UserPreferences['trip_type']>(preferences?.trip_type || 'historical');
  const [budget, setBudget] = useState<UserPreferences['budget']>(preferences?.budget || 'moderate');
  const [transportation, setTransportation] = useState<UserPreferences['transportation']>(preferences?.transportation || 'driving');
  const [durationDays, setDurationDays] = useState(preferences?.duration_days || 3);
  const [selectedInterests, setSelectedInterests] = useState<string[]>(
    preferences?.interests || ['Scenic views', 'Historical monuments', 'Local authentic cuisine']
  );

  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [savingPrefs, setSavingPrefs] = useState(false);
  const [prefsSuccess, setPrefsSuccess] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
    if (user) {
      setFullName(user.full_name);
    }
    if (preferences) {
      setTripType(preferences.trip_type);
      setBudget(preferences.budget);
      setTransportation(preferences.transportation);
      setDurationDays(preferences.duration_days);
      if (preferences.interests) setSelectedInterests(preferences.interests);
    }
  }, [user, preferences, isLoading, router]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setError(null);
    try {
      await api.updateProfile({ full_name: fullName.trim() });
      updateUser({ full_name: fullName.trim() });
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to update profile.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleUpdatePreferences = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingPrefs(true);
    setError(null);
    const newPrefs: UserPreferences = {
      trip_type: tripType,
      budget: budget,
      transportation: transportation,
      duration_days: durationDays,
      interests: selectedInterests,
    };
    try {
      await api.updatePreferences(newPrefs);
      updatePreferences(newPrefs);
      setPrefsSuccess(true);
      setTimeout(() => setPrefsSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to update travel preferences.');
    } finally {
      setSavingPrefs(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeletingAccount(true);
    try {
      await api.request('/api/user/account', { method: 'DELETE' });
      logout();
      router.push('/');
    } catch (err: any) {
      setError(err.message || 'Failed to delete account.');
      setDeletingAccount(false);
    }
  };

  if (isLoading || !user) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-3 border-brand-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const allInterests = [
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

  const toggleInterest = (item: string) => {
    if (selectedInterests.includes(item)) {
      setSelectedInterests(selectedInterests.filter((i) => i !== item));
    } else {
      setSelectedInterests([...selectedInterests, item]);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Page Title */}
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-semibold mb-2">
            <SettingsIcon className="w-3.5 h-3.5 text-brand-600" />
            <span>Account & Preferences</span>
          </div>
          <h1 className="text-3xl font-extrabold text-charcoal-900 tracking-tight">
            Settings & Travel Profile
          </h1>
          <p className="text-sm text-charcoal-500 mt-1">
            Customize your account identity, default travel preferences, and security options.
          </p>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Section 1: Personal Profile */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="p-2.5 rounded-xl bg-brand-50 text-brand-600">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-charcoal-900">Personal Information</h2>
              <p className="text-xs text-charcoal-500">Your profile details displayed in the app</p>
            </div>
          </div>

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-charcoal-700 mb-1.5">Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-charcoal-700 mb-1.5">Email Address</label>
                <div className="relative">
                  <input
                    type="email"
                    disabled
                    value={user.email}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-charcoal-500 bg-slate-50 cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              {profileSuccess && (
                <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                  <Check className="w-4 h-4" /> Name updated successfully
                </span>
              )}
              <button
                type="submit"
                disabled={savingProfile}
                className="ml-auto px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{savingProfile ? 'Saving...' : 'Save Profile'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Section 2: AI Travel Preferences */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="p-2.5 rounded-xl bg-teal-50 text-teal-600">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-charcoal-900">Default Travel Preferences</h2>
              <p className="text-xs text-charcoal-500">
                These defaults guide the Google ADK Agent during one-click road trip generation
              </p>
            </div>
          </div>

          <form onSubmit={handleUpdatePreferences} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-charcoal-700 mb-1.5">Travel Vibe</label>
                <select
                  value={tripType}
                  onChange={(e) => setTripType(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="historical">Historical & Heritage</option>
                  <option value="nature">Nature & Scenic</option>
                  <option value="adventure">Adventure & Outdoors</option>
                  <option value="food">Food & Culinary</option>
                  <option value="relaxation">Relaxation & Leisure</option>
                  <option value="family">Family Friendly</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-charcoal-700 mb-1.5">Budget Preference</label>
                <select
                  value={budget}
                  onChange={(e) => setBudget(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="budget">Budget-Conscious</option>
                  <option value="moderate">Moderate / Balanced</option>
                  <option value="premium">Premium & Luxury</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-charcoal-700 mb-1.5">Preferred Mode</label>
                <select
                  value={transportation}
                  onChange={(e) => setTransportation(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="driving">Driving (Car / SUV)</option>
                  <option value="transit">Public Transit</option>
                  <option value="bicycling">Bicycling</option>
                  <option value="walking">Walking</option>
                </select>
              </div>
            </div>

            {/* Interests Pills */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-charcoal-700">Specific Interests</label>
              <div className="flex flex-wrap gap-2">
                {allInterests.map((interest) => {
                  const selected = selectedInterests.includes(interest);
                  return (
                    <button
                      key={interest}
                      type="button"
                      onClick={() => toggleInterest(interest)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold transition flex items-center gap-1.5 ${
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

            <div className="flex items-center justify-between pt-2">
              {prefsSuccess && (
                <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                  <Check className="w-4 h-4" /> Preferences updated successfully
                </span>
              )}
              <button
                type="submit"
                disabled={savingPrefs}
                className="ml-auto px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{savingPrefs ? 'Saving...' : 'Update Preferences'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Section 3: Security & Danger Zone */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="p-2.5 rounded-xl bg-red-50 text-red-600">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-charcoal-900">Security & Account Management</h2>
              <p className="text-xs text-charcoal-500">Sign out or permanently delete your account</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <div>
              <h4 className="font-bold text-charcoal-900 text-sm">Sign Out</h4>
              <p className="text-xs text-charcoal-500">End your current session on this device</p>
            </div>
            <button
              onClick={() => {
                logout();
                router.push('/');
              }}
              className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-charcoal-700 hover:bg-slate-100 flex items-center gap-2 shadow-sm"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-red-50/50 border border-red-200">
            <div>
              <h4 className="font-bold text-red-900 text-sm">Delete Account</h4>
              <p className="text-xs text-red-700">Permanently remove your profile and all saved trips</p>
            </div>
            <button
              onClick={() => setDeleteModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-xs font-bold text-white flex items-center gap-2 shadow-sm transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Account</span>
            </button>
          </div>
        </div>
      </div>

      {/* Delete Account Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-lg font-bold text-charcoal-900">Confirm Account Deletion</h3>
            <p className="text-xs text-charcoal-600 leading-relaxed">
              Are you sure you want to permanently delete your account? All your trips, saved places, and travel preferences will be erased immediately.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-charcoal-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deletingAccount}
                onClick={handleDeleteAccount}
                className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-sm"
              >
                {deletingAccount ? 'Deleting...' : 'Yes, Delete My Account'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
