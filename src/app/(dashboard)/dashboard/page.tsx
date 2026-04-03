export default function DashboardPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard Overview</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <h2 className="text-sm font-medium text-gray-500">Available Leaves</h2>
          <p className="text-3xl font-bold mt-2 text-indigo-600">14</p>
          <p className="text-sm text-gray-400 mt-1">Days remaining this year</p>
        </div>
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <h2 className="text-sm font-medium text-gray-500">Pending Requests</h2>
          <p className="text-3xl font-bold mt-2 text-amber-500">2</p>
          <p className="text-sm text-gray-400 mt-1">Awaiting manager approval</p>
        </div>
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <h2 className="text-sm font-medium text-gray-500">Team Out Today</h2>
          <p className="text-3xl font-bold mt-2 text-gray-900">0</p>
          <p className="text-sm text-gray-400 mt-1">Everyone is present</p>
        </div>
      </div>
    </div>
  );
}
