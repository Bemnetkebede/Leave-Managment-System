import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';

export default async function LandingPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // If user is authenticated, they go to dashboard. Otherwise, they go to signup.
  const primaryAction = user ? "/dashboard" : "/signup";

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] px-4 py-16 md:py-24 bg-white">
      <div className="text-center max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-1000">
        <h1 className="text-5xl md:text-7xl font-black text-[#0D1A2C] tracking-tighter leading-[1.1]">
          Modern <span className="text-indigo-500">Leave Management</span> for your team
        </h1>
        <p className="mt-8 text-lg md:text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed">
          Streamline time-off requests, track balances, and manage your team&apos;s
          availability all in one place with our intuitive Leave Management System.
        </p>
        <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            href={primaryAction}
            className="px-10 py-4 rounded-full bg-[#0D1A2C] text-white font-bold hover:bg-slate-800 hover:shadow-xl hover:shadow-slate-100 transition-all duration-300 transform hover:-translate-y-1 w-full sm:w-auto text-center"
          >
            Get Started
          </Link>
          <Link
            href={primaryAction}
            className="px-10 py-4 rounded-full bg-white text-[#0D1A2C] border-2 border-slate-100 font-bold hover:border-indigo-100 hover:bg-indigo-50/30 transition-all duration-300 w-full sm:w-auto text-center"
          >
            View Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
