import { CalendarCard } from "@/components/ui/CalendarCard";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-white font-sans antialiased text-gray-900">
      {/* Left Column: Calendar Hero */}
      <div className="hidden lg:flex lg:w-[45%] items-center justify-center bg-[#F3F2F0] p-16 relative overflow-hidden">
        {/* Mood/Background subtle details */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-200/50 to-transparent"></div>
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-indigo-100 rounded-full blur-3xl opacity-50"></div>

        <div className="relative z-10 w-full max-w-xs transform scale-90 opacity-80 transition-all duration-700 hover:scale-100 hover:opacity-100">
          <CalendarCard className="relative w-full" />
        </div>

        {/* Branding/Tagline at bottom */}
        <div className="absolute bottom-12 left-12 right-12 text-center text-slate-400">
          <p className="text-xs font-semibold tracking-wider">
            Productivity & Organization
          </p>
        </div>
      </div>

      <div className="flex-1 lg:w-[55%] flex items-center justify-center px-4 py-8 sm:px-6 lg:px-8 lg:p-12">
        <div className="w-full max-w-sm">
          {children}
        </div>
      </div>
    </div>
  );
}
