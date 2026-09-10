import { Link } from 'react-router-dom';
import { useStore, minRent } from '../store/StoreContext';
import { formatTZS } from '../data/mockData';

const TenantDashboard = () => {
  const { state } = useStore();
  const activeRentals = state.applications.filter((a) => a.status === 'ACTIVE');
  const pendingApps = state.applications.filter((a) => a.status === 'APPLIED');
  const paid = state.payments.filter((p) => p.status === 'PAID');
  const due = state.payments.filter((p) => p.status !== 'PAID');
  const totalPaid = paid.reduce((s, p) => s + Number(p.amount), 0);
  const totalDue = due.reduce((s, p) => s + Number(p.amount), 0);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-[#003152] mb-2">Tenant Dashboard</h1>
          <p className="text-[#003333]">Your rentals, applications, and payments at a glance</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-md p-5">
            <div className="text-2xl mb-1">🏠</div>
            <div className="text-xl sm:text-2xl font-bold text-[#003152]">{activeRentals.length}</div>
            <div className="text-xs sm:text-sm text-gray-500">Active Rentals</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-5">
            <div className="text-2xl mb-1">📝</div>
            <div className="text-xl sm:text-2xl font-bold text-[#003152]">{pendingApps.length}</div>
            <div className="text-xs sm:text-sm text-gray-500">Pending Applications</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-5">
            <div className="text-2xl mb-1">💰</div>
            <div className="text-xl sm:text-2xl font-bold text-green-700">{formatTZS(totalPaid)}</div>
            <div className="text-xs sm:text-sm text-gray-500">Total Paid</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-5">
            <div className="text-2xl mb-1">⏰</div>
            <div className="text-xl sm:text-2xl font-bold text-yellow-700">{formatTZS(totalDue)}</div>
            <div className="text-xs sm:text-sm text-gray-500">Amount Due</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-[#003152]">Current Rentals</h2>
              <Link to="/tenant/rentals" className="text-sm text-[#99CC33] font-semibold">View all →</Link>
            </div>
            {activeRentals.length === 0 ? (
              <p className="text-gray-500 text-sm">No active rentals. <Link to="/marketplace" className="text-[#99CC33] font-semibold">Find a home</Link>.</p>
            ) : (
              <div className="space-y-3">
                {activeRentals.slice(0, 3).map((r) => (
                  <div key={r.id} className="flex justify-between items-center border-b pb-3 last:border-0">
                    <div>
                      <div className="font-semibold text-[#003152]">{r.property} • Unit {r.unit}</div>
                      <div className="text-sm text-gray-500">{r.moveInDate} • {r.leaseDuration} months</div>
                    </div>
                    <div className="font-bold text-[#003152]">{formatTZS(r.rent)}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-[#003152]">Upcoming Payments</h2>
              <Link to="/tenant/payments" className="text-sm text-[#99CC33] font-semibold">Payment Center →</Link>
            </div>
            {due.length === 0 ? (
              <p className="text-gray-500 text-sm">All clear — no outstanding payments.</p>
            ) : (
              <div className="space-y-3">
                {due.slice(0, 3).map((p) => (
                  <div key={p.id} className="flex justify-between items-center border-b pb-3 last:border-0">
                    <div>
                      <div className="font-semibold text-[#003152]">{formatTZS(p.amount)}</div>
                      <div className="text-sm text-gray-500">{p.property} • due {p.dueDate}</div>
                    </div>
                    <Link
                      to="/tenant/payments"
                      className="px-4 py-1.5 bg-[#99CC33] text-[#003152] font-semibold rounded-lg hover:bg-[#88BB22] text-sm"
                    >
                      Pay
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <h2 className="text-xl font-bold text-[#003152] mb-4">Recommended for you</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {state.properties.slice(0, 3).map((p) => (
            <Link
              key={p.id}
              to={`/marketplace/property/${p.id}`}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow"
            >
              <img src={p.image} alt={p.name} className="w-full h-40 object-cover" loading="lazy" />
              <div className="p-4">
                <div className="font-bold text-[#003152]">{p.name}</div>
                <div className="text-sm text-gray-500 mb-2">📍 {p.area}</div>
                <div className="font-bold text-[#003152]">
                  {formatTZS(minRent(p))}<span className="text-sm font-normal">/mo</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TenantDashboard;
