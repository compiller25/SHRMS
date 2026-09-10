import { useState } from 'react';
import { useStore } from '../store/StoreContext';
import StatusBadge from '../components/StatusBadge';
import { formatTZS } from '../data/mockData';

const METHODS = ['M-Pesa', 'Tigo Pesa', 'Airtel Money', 'Bank Transfer', 'Cash'];

const Payments = () => {
  const { state, dispatch } = useStore();
  const [filter, setFilter] = useState('all');
  const [paying, setPaying] = useState(null);
  const [method, setMethod] = useState('M-Pesa');
  const [phone, setPhone] = useState('');
  const [processing, setProcessing] = useState(false);
  const [receipt, setReceipt] = useState(null);

  const payments = state.payments;
  const paid = payments.filter((p) => p.status === 'PAID');
  const pending = payments.filter((p) => p.status === 'PENDING');
  const overdue = payments.filter((p) => p.status === 'OVERDUE');
  const totalPaid = paid.reduce((s, p) => s + Number(p.amount), 0);
  const totalDue = [...pending, ...overdue].reduce((s, p) => s + Number(p.amount), 0);

  const filtered = payments.filter((p) => {
    if (filter === 'all') return true;
    return p.status === filter;
  });

  const startPay = (p) => {
    setPaying(p);
    setMethod(p.method || 'M-Pesa');
    setPhone('');
    setReceipt(null);
  };

  const confirmPay = (e) => {
    e.preventDefault();
    if (!paying) return;
    setProcessing(true);
    setTimeout(() => {
      dispatch({ type: 'PAY', payload: { id: paying.id, method } });
      setReceipt({ ...paying, method });
      setProcessing(false);
      setPaying(null);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-[#003152] mb-2">Payment Center</h1>
          <p className="text-[#003333]">Manage your rental payments and history</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-md p-5">
            <div className="text-xl sm:text-2xl font-bold text-green-700">{formatTZS(totalPaid)}</div>
            <div className="text-xs sm:text-sm text-gray-500">Total Paid</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-5">
            <div className="text-xl sm:text-2xl font-bold text-yellow-700">{formatTZS(totalDue)}</div>
            <div className="text-xs sm:text-sm text-gray-500">Outstanding</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-5">
            <div className="text-xl sm:text-2xl font-bold text-[#003152]">{pending.length}</div>
            <div className="text-xs sm:text-sm text-gray-500">Pending</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-5">
            <div className="text-xl sm:text-2xl font-bold text-red-700">{overdue.length}</div>
            <div className="text-xs sm:text-sm text-gray-500">Overdue</div>
          </div>
        </div>

        {receipt && (
          <div className="bg-green-50 border border-green-200 text-green-800 px-6 py-5 rounded-lg mb-6">
            <h3 className="font-bold text-lg mb-1">Payment successful ✅</h3>
            <p className="text-sm">
              {formatTZS(receipt.amount)} for {receipt.property} (Unit {receipt.unit}) via {receipt.method}.
              A receipt has been sent to your phone.
            </p>
          </div>
        )}

        {/* Filter tabs */}
        <div className="bg-white rounded-lg shadow-md p-2 mb-6 inline-flex flex-wrap gap-2">
          {['all', 'PENDING', 'PAID', 'OVERDUE'].map((t) => (
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

        {/* Table */}
        <div className="bg-white rounded-lg shadow-md p-6 overflow-x-auto">
          <table className="w-full text-sm min-w-[720px]">
            <thead>
              <tr className="text-left text-gray-500 border-b">
                <th className="py-2 pr-4">Property</th>
                <th className="py-2 pr-4">Amount</th>
                <th className="py-2 pr-4">Due Date</th>
                <th className="py-2 pr-4">Method</th>
                <th className="py-2 pr-4">Status</th>
                <th className="py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="py-3 pr-4">
                    <div className="font-semibold text-[#003152]">{p.property}</div>
                    <div className="text-xs text-gray-500">{p.tenant} • Unit {p.unit}</div>
                  </td>
                  <td className="py-3 pr-4 font-bold">{formatTZS(p.amount)}</td>
                  <td className="py-3 pr-4">{p.dueDate}</td>
                  <td className="py-3 pr-4">{p.method}</td>
                  <td className="py-3 pr-4"><StatusBadge status={p.status} /></td>
                  <td className="py-3">
                    {p.status !== 'PAID' ? (
                      <button
                        onClick={() => startPay(p)}
                        className="px-4 py-1.5 bg-[#99CC33] text-[#003152] font-semibold rounded-lg hover:bg-[#88BB22] text-sm"
                      >
                        Pay Now
                      </button>
                    ) : (
                      <span className="text-xs text-gray-400">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <p className="text-center text-gray-500 py-8">No payments in this category.</p>
          )}
        </div>
      </div>

      {/* Pay modal */}
      {paying && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <form onSubmit={confirmPay} className="bg-white rounded-xl shadow-2xl p-6 sm:p-8 w-full max-w-md">
            <h3 className="text-xl font-bold text-[#003152] mb-1">Pay Rent</h3>
            <p className="text-sm text-gray-500 mb-4">
              {paying.property} • Unit {paying.unit} — <span className="font-bold text-[#003152]">{formatTZS(paying.amount)}</span>
            </p>
            <label className="label">Payment method</label>
            <select value={method} onChange={(e) => setMethod(e.target.value)} className="input-field mb-4">
              {METHODS.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
            {method !== 'Cash' && method !== 'Bank Transfer' && (
              <>
                <label className="label">Mobile money number</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. +255 713 000 000"
                  className="input-field mb-4"
                />
                <p className="text-xs text-gray-500 mb-4">
                  You will receive a prompt on your phone to enter your PIN.
                </p>
              </>
            )}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setPaying(null)}
                disabled={processing}
                className="flex-1 px-4 py-2 bg-gray-200 text-[#003333] rounded-lg hover:bg-gray-300 font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={processing}
                className="flex-1 px-4 py-2 bg-[#99CC33] text-[#003152] rounded-lg hover:bg-[#88BB22] font-bold disabled:opacity-60"
              >
                {processing ? 'Processing…' : `Pay ${formatTZS(paying.amount)}`}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Payments;
