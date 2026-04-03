export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col md:flex-row bg-gray-50">
      <aside className="w-full md:w-64 bg-white border-r p-4 hidden md:block">
        <nav className="space-y-2">
          {/* Dashboard Navigation Placeholder */}
          <div className="font-bold text-xl mb-6 px-2 text-indigo-600">LMS</div>
          <a href="#" className="block px-3 py-2 text-sm font-medium text-gray-900 bg-gray-100 rounded-md">Overview</a>
          <a href="#" className="block px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md">My Leaves</a>
          <a href="#" className="block px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md">Team</a>
        </nav>
      </aside>
      
      <main className="flex-1 p-6 md:p-8">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
