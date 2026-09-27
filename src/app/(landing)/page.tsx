import Link from 'next/link';
import { DashboardPreview } from '@/components/landing/DashboardPreview';
import { FeatureGrid } from '@/components/landing/FeatureGrid';
import { WorkflowBreakdown } from '@/components/landing/WorkflowBreakdown';
import { PlayCircle } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="pb-20 overflow-hidden relative">
      
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>

      {/* HERO SECTION */}
      <section className="relative max-w-6xl mx-auto px-6 pt-24 pb-32 flex flex-col items-center text-center z-10">
        


        <h1 className="text-5xl md:text-6xl lg:text-[76px] font-black text-[#0f1b2d] leading-[1.05] tracking-tighter mb-6 max-w-4xl">
          Modern <span className="text-[#685cf5]">Leave</span> <br className="hidden md:block" />
          <span className="text-[#685cf5]">Management</span> for your
        </h1>
        
        <p className="text-lg md:text-xl text-slate-500 max-w-2xl mb-10 leading-relaxed">
          Manage employee time-off, track team availability, and streamline approvals with unprecedented speed.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4 mb-20 w-full justify-center">
          <Link href="/signup" className="w-full sm:w-auto px-8 py-3.5 bg-[#0f1b2d] text-white font-semibold rounded-full hover:bg-[#1a2b47] transition-colors shadow-sm flex items-center justify-center">
            Get Started
          </Link>
          <Link href="/demo" className="w-full sm:w-auto px-8 py-3.5 bg-white text-[#0f1b2d] font-semibold border border-slate-200 rounded-full hover:bg-slate-50 transition-colors shadow-sm flex items-center justify-center">
            View Dashboard
          </Link>
        </div>

        <div className="w-full perspective-1000">
           <DashboardPreview />
        </div>
      </section>

      {/* CORE CAPABILITIES SECTION */}
      <section id="curriculum" className="py-24 bg-slate-50/50  border-y border-slate-200/50 ">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-[#0f1b2d] mb-4">Core Leave Management Features</h2>
            <p className="text-slate-500 max-w-2xl mx-auto">Everything you need to manage time-off requests, track team availability, and generate accurate reports in a single unified workspace.</p>
          </div>
          
          <FeatureGrid />
        </div>
      </section>

      {/* WORKFLOW BREAKDOWN SECTION */}
      <section id="workflow" className="py-32">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-3xl font-bold tracking-tight text-[#0f1b2d] mb-4">Inside the Engine</h2>
            <p className="text-slate-500 max-w-2xl mx-auto">A seamless pipeline from employee request to automatic balance updates.</p>
          </div>

          <WorkflowBreakdown />
        </div>
      </section>

    </div>
  );
}
