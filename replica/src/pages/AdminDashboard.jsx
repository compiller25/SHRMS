import { Link } from 'react-router-dom';
import { useStore, availableUnits } from '../store/StoreContext';
import StatusBadge from '../components/StatusBadge';
import { USERS, formatTZS } from '../data/mockData';

const AdminDashboard = () => {
  const { state, dispatch } = useStore();
  const { properties, applications, payments } = state;

  const totalUnits = properties.reduce((s, p) => s + p.units.length, 0);
  const occupied = totalUnits - properties.reduce((s, p) => s + availableUnits(p).length, 0);
  const revenue = applications
    .filter((a) => a.status === 'ACTIVE')
    .reduce((s, a) => s + Number(a.rent), 0);
  const collected = payments.filter((p) => p.status === 'PAID').reduce((s, p) => s + Number(p.amount), 0);

  const stats = [
    { label: 'Registered Users', value: USERS.length, icon: '👥' },
    { label: 'Properties', value: properties.length, icon: '🏠' },
    { label: 'Units', value: totalUnits, icon: '🚪' },
    { label: 'Occupancy', value: totalUnits ? `${((occupied / totalUnits) * 100).toFixed(1)}%` : '—', icon: '📊' },
    { label: 'Active Leases', value: applications.filter((a) => a.status === 'ACTIVE').length, icon: '📄' },
    { label: 'Monthly Revenue', value: formatTZS(revenue), icon: '💰' },
    { label: 'Collected to Date', value: formatTZS(collected), icon: '✅' },
    { label: 'Pending Applications', value: applications.filter((a) => a.status === 'APPLIED').length, icon: '📝' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex flex-wrap justify-between items-end gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-[#003152] mb-2">Admin Dashboard</h1>
            <p className="text-[#003333]">Platform-wide oversight and reports</p>
          </div>
          <button
            onClick={() => {
              if (window.confirm('Reset all data back to the original sample dataset?')) {
                dispatch({ type: 'RESET' });
              }
            }}
            className="px-4 py-2 bg-gray-200 text-[#003333] text-sm rounded-lg hover:bg-gray-300 font-medium"
          >
            Reset sample data
          </button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((s) => (
            <div key={s.label} className="bg-white rounded-lg shadow-md p-5">
              <div className="text-2xl mb-1">{s.icon}</div>
              <div className="text-xl sm:text-2xl font-bold text-[#003152]">{s.value}</div>
              <div className="text-xs sm:text-sm text-gray-500">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Users */}
          <div className="bg-white rounded-lg shadow-md p-6 overflow-x-auto">
            <h2 className="text-xl font-bold text-[#003152] mb-4">Users</h2>
            <table className="w-full text-sm min-w-[420px]">
              <thead>
                <tr className="text-left text-gray-500 border-b">
                  <th className="py-2 pr-4">Name</th>
                  <th className="py-2 pr-4">Contact</th>
                  <th className="py-2">Role</th>
                </tr>
              </thead>
              <tbody>
                {USERS.map((u) => (
                  <tr key={u.id} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="py-2.5 pr-4 font-semibold text-[#003152]">{u.name}</td>
                    <td className="py-2.5 pr-4 text-xs text-gray-500">{u.email}<br />{u.phone}</td>
                    <td className="py-2.5"><StatusBadge status={u.role} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Properties */}
          <div className="bg-white rounded-lg shadow-md p-6 overflow-x-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-[#003152]">All Properties</h2>
              <Link to="/landlord/properties" className="text-sm text-[#99CC33] font-semibold">Manage →</Link>
            </div>
            <table className="w-full text-sm min-w-[420px]">
              <thead>
                <tr className="text-left text-gray-500 border-b">
                  <th className="py-2 pr-4">Property</th>
                  <th className="py-2 pr-4">Units</th>
                  <th className="py-2">Occupancy</th>
                </tr>
              </thead>
              <tbody>
                {properties.map((p) => {
                  const occ = p.units.length - availableUnits(p).length;
                  return (
                    <tr key={p.id} className="border-b last:border-0 hover:bg-gray-50">
                      <td className="py-2.5 pr-4">
                        <Link to={`/marketplace/property/${p.id}`} className="font-semibold text-[#003152] hover:text-[#99CC33]">
                          {p.name}
                        </Link>
                        <div className="text-xs text-gray-500">{p.area}</div>
                      </td>
                      <td className="py-2.5 pr-4">{p.units.length}</td>
                      <td className="py-2.5">{occ}/{p.units.length}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Latest payments */}
        <div className="bg-white rounded-lg shadow-md p-6 mt-8 overflow-x-auto">
          <h2 className="text-xl font-bold text-[#003152] mb-4">Latest Payments</h2>
          <table className="w-full text-sm min-w-[640px]">
            <thead>
              <tr className="text-left text-gray-500 border-b">
                <th className="py-2 pr-4">Tenant</th>
                <th className="py-2 pr-4">Property</th>
                <th className="py-2 pr-4">Amount</th>
                <th className="py-2 pr-4">Due</th>
                <th className="py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {payments.slice(0, 8).map((p) => (
                <tr key={p.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="py-2.5 pr-4 font-medium">{p.tenant}</td>
                  <td className="py-2.5 pr-4">{p.property} • {p.unit}</td>
                  <td className="py-2.5 pr-4 font-bold">{formatTZS(p.amount)}</td>
                  <td className="py-2.5 pr-4">{p.dueDate}</td>
                  <td className="py-2.5"><StatusBadge status={p.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
