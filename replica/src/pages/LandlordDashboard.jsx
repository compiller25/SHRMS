import { Link } from 'react-router-dom';
import { useStore, availableUnits } from '../store/StoreContext';
import StatusBadge from '../components/StatusBadge';
import { formatTZS } from '../data/mockData';

const LandlordDashboard = () => {
  const { state } = useStore();
  const { properties, applications, payments } = state;

  const totalUnits = properties.reduce((s, p) => s + p.units.length, 0);
  const vacantUnits = properties.reduce((s, p) => s + availableUnits(p).length, 0);
  const occupiedUnits = totalUnits - vacantUnits;
  const occupancyRate = totalUnits > 0 ? ((occupiedUnits / totalUnits) * 100).toFixed(1) : 0;
  const pendingApps = applications.filter((a) => a.status === 'APPLIED');
  const activeAgreements = applications.filter((a) => a.status === 'ACTIVE');
  const monthlyRevenue = activeAgreements.reduce((s, a) => s + Number(a.rent), 0);
  const overdue = payments.filter((p) => p.status === 'OVERDUE');

  const stats = [
    { label: 'Properties', value: properties.length, icon: '🏠' },
    { label: 'Total Units', value: totalUnits, icon: '🚪' },
    { label: 'Occupancy', value: `${occupancyRate}%`, icon: '📊' },
    { label: 'Pending Applications', value: pendingApps.length, icon: '📝' },
    { label: 'Active Agreements', value: activeAgreements.length, icon: '📄' },
    { label: 'Monthly Revenue', value: formatTZS(monthlyRevenue), icon: '💰' },
    { label: 'Overdue Payments', value: overdue.length, icon: '⚠️' },
    { label: 'Vacant Units', value: vacantUnits, icon: '🔑' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex flex-wrap justify-between items-end gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-[#003152] mb-2">Landlord Dashboard</h1>
            <p className="text-[#003333]">Portfolio performance and recent activity</p>
          </div>
          <Link
            to="/landlord/properties"
            className="px-5 py-2.5 bg-[#99CC33] text-[#003152] font-semibold rounded-lg hover:bg-[#88BB22]"
          >
            + Add Property
          </Link>
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
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-[#003152]">Recent Applications</h2>
              <Link to="/landlord/agreements" className="text-sm text-[#99CC33] font-semibold">Manage →</Link>
            </div>
            <div className="space-y-3">
              {applications.slice(0, 4).map((a) => (
                <div key={a.id} className="flex justify-between items-center border-b pb-3 last:border-0">
                  <div>
                    <div className="font-semibold text-[#003152]">{a.applicant}</div>
                    <div className="text-sm text-gray-500">{a.property} • Unit {a.unit}</div>
                  </div>
                  <StatusBadge status={a.status} />
                </div>
              ))}
              {applications.length === 0 && <p className="text-gray-500 text-sm">No applications yet.</p>}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-[#003152]">Recent Payments</h2>
              <Link to="/admin" className="text-sm text-[#99CC33] font-semibold">Reports →</Link>
            </div>
            <div className="space-y-3">
              {payments.slice(0, 4).map((p) => (
                <div key={p.id} className="flex justify-between items-center border-b pb-3 last:border-0">
                  <div>
                    <div className="font-semibold text-[#003152]">{formatTZS(p.amount)}</div>
                    <div className="text-sm text-gray-500">{p.tenant} • {p.method}</div>
                  </div>
                  <StatusBadge status={p.status} />
                </div>
              ))}
              {payments.length === 0 && <p className="text-gray-500 text-sm">No payments yet.</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandlordDashboard;
