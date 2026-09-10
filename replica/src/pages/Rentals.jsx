import { Link } from 'react-router-dom';
import { useStore } from '../store/StoreContext';
import StatusBadge from '../components/StatusBadge';
import { formatTZS } from '../data/mockData';

const Rentals = () => {
  const { state } = useStore();
  const rentals = state.applications.filter((a) => ['ACTIVE', 'APPROVED'].includes(a.status));

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-[#003152] mb-2">My Rentals</h1>
          <p className="text-[#003333]">Your approved homes and active leases</p>
        </div>

        {rentals.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <h3 className="text-2xl font-semibold text-[#003333] mb-2">No rentals yet</h3>
            <p className="text-gray-500 mb-6">
              Approved applications and active leases will appear here.
            </p>
            <Link
              to="/marketplace"
              className="inline-block px-6 py-3 bg-[#99CC33] text-[#003152] font-semibold rounded-lg hover:bg-[#88BB22]"
            >
              Find a Home
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {rentals.map((r) => {
              const property = state.properties.find((p) => p.id === r.propertyId);
              return (
                <div key={r.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                  {property && (
                    <img src={property.image} alt={r.property} className="w-full h-44 object-cover" />
                  )}
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="text-lg font-bold text-[#003152]">{r.property}</h3>
                        <p className="text-sm text-gray-500">Unit {r.unit}</p>
                      </div>
                      <StatusBadge status={r.status} />
                    </div>
                    <div className="text-sm text-[#003333] space-y-1 mb-4">
                      <p><span className="font-medium">Tenant:</span> {r.applicant}</p>
                      <p><span className="font-medium">Lease:</span> {r.moveInDate} • {r.leaseDuration} months</p>
                      <p className="text-xl font-bold text-[#003152]">
                        {formatTZS(r.rent)}<span className="text-sm font-normal">/mo</span>
                      </p>
                    </div>
                    <div className="flex gap-3">
                      <Link
                        to="/tenant/payments"
                        className="px-4 py-2 bg-[#003152] text-white rounded-lg hover:bg-[#003333] font-medium text-sm"
                      >
                        Pay Rent
                      </Link>
                      {property && (
                        <Link
                          to={`/marketplace/property/${property.id}`}
                          className="px-4 py-2 bg-gray-200 text-[#003333] rounded-lg hover:bg-gray-300 font-medium text-sm"
                        >
                          View Property
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Rentals;
