import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';

export default async function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-slate-100 sticky top-0 bg-white/80 backdrop-blur-md z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link href="/" className="font-black text-2xl text-[#0D1A2C] tracking-tighter flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg"></div>
            LMS
          </Link>
          <nav className="flex items-center space-x-6">
            {user ? (
              <Link href="/dashboard" className="transition-transform hover:scale-105 active:scale-95">
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center border-2 border-indigo-50 shadow-sm">
                  <span className="text-indigo-700 font-black text-sm">
                    {(user.user_metadata?.full_name || user.email || "U")
                      .split(" ")
                      .map((n: string) => n[0])
                      .join("")
                      .toUpperCase()
                      .substring(0, 2)}
                  </span>
                </div>
              </Link>
            ) : (
              <>
                <Link 
                  href="/signin" 
                  className="text-[#0D1A2C] hover:text-indigo-600 font-bold text-sm transition-colors uppercase tracking-wider"
                >
                  Sign in
                </Link>
                <Link 
                  href="/signup" 
                  className="px-6 py-2.5 rounded-full bg-[#0D1A2C] text-white text-sm font-bold hover:bg-slate-800 transition-all uppercase tracking-wider shadow-lg shadow-slate-100"
                >
                  Sign Up
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>
      
      <main>
        {children}
      </main>
    </div>
  );
}
