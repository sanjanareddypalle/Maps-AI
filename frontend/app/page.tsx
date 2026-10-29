'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { MapPin, Sparkles } from 'lucide-react';

export default function RootPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (user) {
        router.replace('/dashboard');
      } else {
        router.replace('/login');
      }
    }
  }, [user, isLoading, router]);

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-4 text-center p-6">
        <div className="relative flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-700 via-brand-600 to-teal-500 text-white shadow-xl shadow-brand-500/25 animate-pulse">
          <MapPin className="w-7 h-7" />
          <Sparkles className="w-4 h-4 absolute -top-1 -right-1 text-yellow-300" />
        </div>
        <div>
          <h2 className="font-extrabold text-2xl text-charcoal-900 tracking-tight">
            Google Maps <span className="bg-gradient-to-r from-brand-600 to-teal-600 bg-clip-text text-transparent">AI</span>
          </h2>
          <p className="text-xs text-charcoal-500 mt-1 font-medium">
            Directing to secure authentication...
          </p>
        </div>
      </div>
    </div>
  );
}
