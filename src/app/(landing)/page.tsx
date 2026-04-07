import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] px-4 py-20">
      <div className="text-center max-w-3xl">
        <h1 className="text-5xl font-extrabold text-gray-900 sm:text-6xl tracking-tight">
          Modern <span className="text-indigo-600">Leave Management</span> for your team
        </h1>
        <p className="mt-6 text-xl text-gray-500 max-w-2xl mx-auto">
          Streamline time-off requests, track balances, and manage your team's availability all in one place with our intuitive Leave Management System.
        </p>
        <div className="mt-10 flex gap-4 justify-center">
          <Link href="/signup" className="px-8 py-3 rounded-md bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-colors">
            Get Started
          </Link>
          <Link href="/dashboard" className="px-8 py-3 rounded-md bg-white text-indigo-600 border border-gray-300 font-medium hover:bg-gray-50 transition-colors">
            View Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
