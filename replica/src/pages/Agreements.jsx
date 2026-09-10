import { useState } from 'react';
import { useStore } from '../store/StoreContext';
import StatusBadge from '../components/StatusBadge';
import { formatTZS } from '../data/mockData';

const tabs = ['APPLIED', 'APPROVED', 'ACTIVE', 'REJECTED'];

const Agreements = () => {
  const { state, dispatch } = useStore();
  const [filter, setFilter] = useState('APPLIED');
  const [rejecting, setRejecting] = useState(null);
  const [reason, setReason] = useState('');

  const counts = Object.fromEntries(tabs.map((t) => [t, state.applications.filter((a) => a.status === t).length]));
  const list = state.applications.filter((a) => a.status === filter);

  const confirmReject = (e) => {
    e.preventDefault();
    if (!rejecting) return;
    dispatch({ type: 'DECIDE', payload: { id: rejecting, decision: 'REJECTED', reason } });
    setRejecting(null);
    setReason('');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-[#003152] mb-2">Rental Agreements</h1>
          <p className="text-[#003333]">Review applications and manage active leases</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-2 mb-6 inline-flex flex-wrap gap-2">
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                filter === t ? 'bg-[#003152] text-white' : 'text-[#003333] hover:bg-gray-100'
              }`}
            >
              {t.charAt(0) + t.slice(1).toLowerCase()} ({counts[t]})
            </button>
          ))}
        </div>

        {list.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <h3 className="text-xl font-semibold text-[#003333]">Nothing here</h3>
            <p className="text-gray-500">No {filter.toLowerCase()} applications right now.</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-6 overflow-x-auto">
            <table className="w-full text-sm min-w-[760px]">
              <thead>
                <tr className="text-left text-gray-500 border-b">
                  <th className="py-2 pr-4">Applicant</th>
                  <th className="py-2 pr-4">Property / Unit</th>
                  <th className="py-2 pr-4">Lease</th>
                  <th className="py-2 pr-4">Rent</th>
                  <th className="py-2 pr-4">Status</th>
                  <th className="py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {list.map((a) => (
                  <tr key={a.id} className="border-b last:border-0 hover:bg-gray-50 align-top">
                    <td className="py-3 pr-4">
                      <div className="font-semibold text-[#003152]">{a.applicant}</div>
                      <div className="text-xs text-gray-500">{a.phone} • {a.date}</div>
                    </td>
                    <td className="py-3 pr-4">
                      <div className="font-medium">{a.property}</div>
                      <div className="text-xs text-gray-500">Unit {a.unit}</div>
                    </td>
                    <td className="py-3 pr-4 text-xs">
                      {a.moveInDate}<br />{a.leaseDuration} months
                    </td>
                    <td className="py-3 pr-4 font-bold whitespace-nowrap">{formatTZS(a.rent)}</td>
                    <td className="py-3 pr-4">
                      <StatusBadge status={a.status} />
                      {a.status === 'REJECTED' && a.reason && (
                        <div className="text-xs text-red-600 mt-1 max-w-[180px]">{a.reason}</div>
                      )}
                    </td>
                    <td className="py-3">
                      <div className="flex flex-wrap gap-2">
                        {a.status === 'APPLIED' && (
                          <>
                            <button
                              onClick={() => dispatch({ type: 'DECIDE', payload: { id: a.id, decision: 'APPROVED' } })}
                              className="px-3 py-1.5 bg-[#99CC33] text-[#003152] text-xs font-bold rounded-lg hover:bg-[#88BB22]"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => { setRejecting(a.id); setReason(''); }}
                              className="px-3 py-1.5 bg-red-100 text-red-700 text-xs font-semibold rounded-lg hover:bg-red-200"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        {a.status === 'APPROVED' && (
                          <button
                            onClick={() => dispatch({ type: 'ACTIVATE', payload: { id: a.id } })}
                            className="px-3 py-1.5 bg-[#003152] text-white text-xs font-semibold rounded-lg hover:bg-[#003333]"
                          >
                            Activate Lease
                          </button>
                        )}
                        {a.status === 'ACTIVE' && (
                          <button
                            onClick={() => {
                              if (window.confirm(`Terminate the lease for ${a.applicant} (Unit ${a.unit})? The unit becomes available again.`)) {
                                dispatch({ type: 'TERMINATE', payload: { id: a.id } });
                              }
                            }}
                            className="px-3 py-1.5 bg-gray-200 text-[#003333] text-xs font-semibold rounded-lg hover:bg-gray-300"
                          >
                            Terminate
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Reject modal */}
      {rejecting && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <form onSubmit={confirmReject} className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md">
            <h3 className="text-lg font-bold text-[#003152] mb-2">Reject application</h3>
            <p className="text-sm text-gray-500 mb-4">Give the applicant a reason — it will be shown on their application.</p>
            <textarea
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              placeholder="e.g. Unit already taken, incomplete information…"
              className="input-field mb-4"
            />
            <div className="flex gap-3">
              <button type="button" onClick={() => setRejecting(null)} className="flex-1 px-4 py-2 bg-gray-200 text-[#003333] rounded-lg hover:bg-gray-300 font-medium">
                Cancel
              </button>
              <button type="submit" className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-bold">
                Reject
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Agreements;
