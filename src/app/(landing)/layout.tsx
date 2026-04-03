export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white">
      {/* Header Placeholder */}
      <header className="border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="font-bold text-xl text-indigo-600">LMS</div>
          <nav className="flex space-x-4">
            <a href="/login" className="text-gray-600 hover:text-gray-900">Sign in</a>
          </nav>
        </div>
      </header>
      
      <main>
        {children}
      </main>
    </div>
  );
}
