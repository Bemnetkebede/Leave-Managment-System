'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import {
  Users,
  Layout,
  Server,
  Megaphone,
  Palette,
  Code,
  ArrowRight,
  Loader2,
  CheckCircle2
} from 'lucide-react';

const departments = [
  {
    id: 'HR',
    name: 'HR',
    description: 'People operations and management',
    icon: Users,
    color: 'bg-rose-50 text-rose-600 border-rose-100 peer-checked:bg-rose-600 peer-checked:text-white peer-checked:border-rose-600',
    iconColor: 'text-rose-600 group-hover:text-rose-700'
  },
  {
    id: 'front-end development',
    name: 'Front-end Development',
    description: 'Building beautiful user interfaces',
    icon: Layout,
    color: 'bg-sky-50 text-sky-600 border-sky-100 peer-checked:bg-sky-600 peer-checked:text-white peer-checked:border-sky-600',
    iconColor: 'text-sky-600 group-hover:text-sky-700'
  },
  {
    id: 'backend development',
    name: 'Backend Development',
    description: 'Building robust APIs and systems',
    icon: Server,
    color: 'bg-emerald-50 text-emerald-600 border-emerald-100 peer-checked:bg-emerald-600 peer-checked:text-white peer-checked:border-emerald-600',
    iconColor: 'text-emerald-600 group-hover:text-emerald-700'
  },
  {
    id: 'marketing',
    name: 'Marketing',
    description: 'Growth and digital presence',
    icon: Megaphone,
    color: 'bg-amber-50 text-amber-600 border-amber-100 peer-checked:bg-amber-600 peer-checked:text-white peer-checked:border-amber-600',
    iconColor: 'text-amber-600 group-hover:text-amber-700'
  },
  {
    id: 'Graphics designer',
    name: 'Graphics Designer',
    description: 'Visual identity and design',
    icon: Palette,
    color: 'bg-purple-50 text-purple-600 border-purple-100 peer-checked:bg-purple-600 peer-checked:text-white peer-checked:border-purple-600',
    iconColor: 'text-purple-600 group-hover:text-purple-700'
  },
  {
    id: 'Fullstack development',
    name: 'Fullstack Development',
    description: 'End-to-end product engineering',
    icon: Code,
    color: 'bg-indigo-50 text-indigo-600 border-indigo-100 peer-checked:bg-indigo-600 peer-checked:text-white peer-checked:border-indigo-600',
    iconColor: 'text-indigo-600 group-hover:text-indigo-700'
  }
];

export default function OnboardingPage() {
  const [selectedDept, setSelectedDept] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const checkUser = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      // Check if department is already set
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (profile?.user_dpt) {
        router.push('/dashboard');
      }
      setLoading(false);
    };

    checkUser();
  }, [router, supabase]);

  const handleContinue = async () => {
    if (!selectedDept) return;

    setSaving(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not found');

      const fullName = (user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0]);
      
      // Ensure full_name is strictly a string!
      const nameToSend = typeof fullName === 'string' ? fullName : '';

      // Nuclear Fix: Using atomic upsert with ignoreDuplicates: false to force recognition
      const { error: onboardingError } = await (supabase as any)
        .from('profiles')
        .upsert({
          id: user.id,
          email: user.email || '',
          full_name: nameToSend,
          user_dpt: selectedDept,
          updated_at: new Date().toISOString()
        }, { 
          onConflict: 'id',
          ignoreDuplicates: false
        });

      if (onboardingError) {
        console.error('Onboarding Error:', onboardingError);
        throw onboardingError;
      }

      window.location.href = '/dashboard';
    } catch (err: any) {
      console.error('Onboarding Error Details:', err);
      // Display more specific error if available
      const detailedError = err.message || err.details || 'Failed to update department';
      setError(detailedError);
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-white">
        <Loader2 className="h-10 w-10 animate-spin text-[#0D1A2C]" />
        <p className="mt-4 text-sm font-medium text-slate-500">Preparing your experience...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="mx-auto flex w-full flex-col justify-center max-w-4xl bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 p-6 md:p-10 border border-slate-100">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl mb-2">
            Welcome to the team
          </h1>
          <p className="text-lg text-slate-500 font-medium">
            Please select your department to start managing your leaves.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {departments.map((dept) => {
            const Icon = dept.icon;
            const isSelected = selectedDept === dept.id;

            return (
              <div
                key={dept.id}
                onClick={() => setSelectedDept(dept.id)}
                className={`group relative cursor-pointer overflow-hidden rounded-[1.5rem] border-2 p-6 transition-all duration-500 transform hover:-translate-y-1 active:scale-95 ${isSelected
                    ? 'border-[#0D1A2C] bg-white shadow-xl ring-4 ring-[#0D1A2C]/5'
                    : 'border-slate-50 bg-slate-50 hover:border-indigo-100 hover:bg-white hover:shadow-lg'
                  }`}
              >
                <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-[1rem] transition-all duration-500 ${isSelected ? 'bg-[#0D1A2C] text-white rotate-12' : 'bg-white text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 group-hover:-rotate-12 shadow-sm'
                  }`}>
                  <Icon className="h-6 w-6" />
                </div>

                <h3 className={`text-base font-black transition-colors mb-1 ${isSelected ? 'text-slate-900' : 'text-slate-900 group-hover:text-indigo-600'
                  }`}>
                  {dept.name}
                </h3>
                <p className={`text-xs leading-relaxed transition-colors ${isSelected ? 'text-slate-500' : 'text-slate-400 group-hover:text-slate-500'
                  }`}>
                  {dept.description}
                </p>

                {isSelected && (
                  <div className="absolute top-4 right-4">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#0D1A2C] text-white shadow-lg animate-in zoom-in duration-300">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {error && (
          <div className="mt-4 rounded-xl bg-red-50 p-4 border border-red-100 animate-in fade-in slide-in-from-top-2">
            <p className="text-xs font-bold text-red-600">{error}</p>
          </div>
        )}

        <div className="mt-8 flex justify-center">
          <button
            onClick={handleContinue}
            disabled={!selectedDept || saving}
            className={`group flex items-center gap-3 rounded-full px-12 py-4 text-base font-black transition-all duration-500 shadow-xl ${!selectedDept
                ? 'bg-slate-100 text-slate-300 cursor-not-allowed shadow-none'
                : 'bg-[#0D1A2C] text-white hover:bg-[#1a2b42] hover:shadow-indigo-500/20 transform hover:scale-105 active:scale-95'
              }`}
          >
            {saving ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Setting things up...
              </>
            ) : (
              <>
                Continue to Dashboard
                <ArrowRight className="h-5 w-5 group-hover:translate-x-2 transition-transform duration-300" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

