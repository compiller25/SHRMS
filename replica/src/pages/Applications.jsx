import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../store/StoreContext';
import StatusBadge from '../components/StatusBadge';
import { formatTZS } from '../data/mockData';

const tabs = ['all', 'APPLIED', 'APPROVED', 'REJECTED', 'ACTIVE'];

const Applications = () => {
  const { state, dispatch } = useStore();
  const [filter, setFilter] = useState('all');

  const list = state.applications.filter((a) => filter === 'all' || a.status === filter);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-[#003152] mb-2">My Applications</h1>
          <p className="text-[#003333]">Track your rental application status</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-2 mb-6 inline-flex flex-wrap gap-2">
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={`px-4 py-2 rounded-md font-medium transition-colors capitalize ${
                filter === t ? 'bg-[#003152] text-white' : 'text-[#003333] hover:bg-gray-100'
              }`}
            >
              {t === 'all' ? 'All' : t.charAt(0) + t.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        {list.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <h3 className="text-2xl font-semibold text-[#003333] mb-2">No applications</h3>
            <p className="text-gray-500 mb-6">You have no applications in this category yet.</p>
            <Link
              to="/marketplace"
              className="inline-block px-6 py-3 bg-[#99CC33] text-[#003152] font-semibold rounded-lg hover:bg-[#88BB22]"
            >
              Browse Properties
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {list.map((app) => (
              <div key={app.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-lg font-bold text-[#003152]">{app.property}</h3>
                    <p className="text-sm text-gray-500">
                      Unit {app.unit} • Applied {app.date}
                    </p>
                  </div>
                  <StatusBadge status={app.status} />
                </div>
                <div className="text-sm text-[#003333] space-y-1 mb-4">
                  <p><span className="font-medium">Applicant:</span> {app.applicant}</p>
                  <p><span className="font-medium">Move-in:</span> {app.moveInDate} • {app.leaseDuration} months</p>
                  <p className="text-xl font-bold text-[#003152]">
                    {formatTZS(app.rent)}<span className="text-sm font-normal">/mo</span>
                  </p>
                  {app.status === 'REJECTED' && app.reason && (
                    <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded px-3 py-2">
                      Reason: {app.reason}
                    </p>
                  )}
                </div>
                <div className="flex gap-3">
                  {app.status === 'APPLIED' && (
                    <button
                      onClick={() => dispatch({ type: 'WITHDRAW', payload: { id: app.id } })}
                      className="px-4 py-2 bg-gray-200 text-[#003333] rounded-lg hover:bg-gray-300 font-medium text-sm"
                    >
                      Withdraw
                    </button>
                  )}
                  {app.status === 'ACTIVE' && (
                    <Link
                      to="/tenant/rentals"
                      className="px-4 py-2 bg-[#003152] text-white rounded-lg hover:bg-[#003333] font-medium text-sm"
                    >
                      View Rental
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Applications;
