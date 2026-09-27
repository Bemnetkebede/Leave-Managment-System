import Link from 'next/link';
import { Sprout, ArrowRight } from 'lucide-react';

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white text-[#0f1b2d] selection:bg-[#0f1b2d] selection:text-white transition-colors duration-300 font-sans">
      
      {/* Minimal Navigation Bar */}
      <header className="sticky top-0 bg-white/80 backdrop-blur-md z-50 border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="bg-[#685cf5] p-1.5 rounded-lg group-hover:scale-105 transition-transform">
              <Sprout className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold tracking-tight text-xl text-[#0f1b2d]">LMS</span>
          </Link>
          
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text font-medium text-slate-900 hover:text-[#0f1b2d]  transition-colors">Home</Link>
            <Link href="#features" className="text font-medium text-slate-900 hover:text-[#0f1b2d]  transition-colors">Features</Link>
            <Link href="#workflow" className="text font-medium text-slate-900 hover:text-[#0f1b2d]  transition-colors">Demo</Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/signin" className="px-5 py-2.5  hover:bg-[#0f1b2d] hover:text-white text-black text-sm font-semibold rounded-full shadow-sm transition-colors duration-200">
              Sign in
            </Link>
            <Link href="/signup" className="px-5 py-2.5 bg-[#0f1b2d] hover:bg-[#0f1b2d]/85 text-white text-sm font-semibold rounded-full shadow-sm transition-colors duration-200">
              Sign up
            </Link>
          </div>
        </div>
      </header>
      
      <main>
        {children}
      </main>

      {/* Action Footer */}
      <footer className="border-t border-slate-100 bg-white py-20">
        <div className="max-w-4xl mx-auto px-6 flex flex-col items-center text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to upgrade your workflow?</h2>
          <div className="flex w-full max-w-md items-center gap-2 bg-slate-50  p-2 rounded-xl border border-slate-200  focus-within:ring-2 ring-neutral-900  transition-all">
            <input 
              type="email" 
              placeholder="Enter your email to test a sandbox..." 
              className="flex-1 bg-transparent border-none outline-none px-3 text-sm"
            />
            <button className="px-4 py-2 bg-[#0f1b2d] text-white   rounded-lg text-sm font-semibold flex items-center gap-2">
              Start <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-16 flex flex-wrap justify-center gap-8 text-sm font-medium text-slate-500">
            <Link href="#" className="hover:text-[#0f1b2d]  transition-colors">Documentation</Link>
            <Link href="#" className="hover:text-[#0f1b2d]  transition-colors">API Reference</Link>
            <Link href="#" className="hover:text-[#0f1b2d]  transition-colors">Changelog</Link>
            <Link href="#" className="hover:text-[#0f1b2d]  transition-colors">System Status</Link>
          </div>
          <p className="mt-8 text-xs text-slate-400">© {new Date().getFullYear()} LMS Engine.</p>
        </div>
      </footer>
    </div>
  );
}
