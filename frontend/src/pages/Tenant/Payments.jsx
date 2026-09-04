import { useState, useEffect } from 'react';
import { paymentsAPI } from '../../services/api';

const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // all, pending, paid, overdue

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await paymentsAPI.getMyPayments();

      // Handle both paginated and non-paginated responses
      const paymentsData = Array.isArray(res.data) ? res.data : res.data.results || [];

      setPayments(paymentsData);
      // Compute tenant-specific stats locally. The backend /statistics/ endpoint
      // is landlord-only, so calling it from this tenant page just produced 403s.
      setStatistics(computeStatistics(paymentsData));
    } catch (err) {
      setError('Failed to load payment information. Please try again later.');
      console.error('Error fetching payments:', err);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredPayments = () => {
    if (filter === 'all') return payments;
    const target = filter === 'paid' ? 'completed' : filter;
    return payments.filter(payment => {
      const status = payment.status.toLowerCase();
      if (filter === 'overdue') {
        return status === 'overdue' || (status === 'pending' && new Date(payment.due_date) < new Date());
      }
      return status === target;
    });
  };

  const filteredPayments = getFilteredPayments();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#003152] mx-auto mb-4"></div>
          <p className="text-[#003333] text-lg">Loading payment information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-[#003152] mb-2">
            Payment Center
          </h1>
          <p className="text-[#003333]">Manage your rental payments and history</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Statistics Cards */}
        {statistics && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Total Paid"
              value={`${Number(statistics.total_paid || 0).toLocaleString()} TZS`}
              icon="check"
              color="green"
            />
            <StatCard
              title="Pending"
              value={`${Number(statistics.total_pending || 0).toLocaleString()} TZS`}
              icon="clock"
              color="yellow"
            />
            <StatCard
              title="Overdue"
              value={`${Number(statistics.total_overdue || 0).toLocaleString()} TZS`}
              icon="alert"
              color="red"
            />
            <StatCard
              title="Next Payment"
              value={statistics.next_payment_date || 'N/A'}
              icon="calendar"
              color="blue"
            />
          </div>
        )}

        {/* Filter Tabs */}
        <div className="bg-white rounded-lg shadow-md p-2 mb-6 inline-flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              filter === 'all'
                ? 'bg-[#003152] text-white'
                : 'text-[#003333] hover:bg-gray-100'
            }`}
          >
            All ({payments.length})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              filter === 'pending'
                ? 'bg-[#003152] text-white'
                : 'text-[#003333] hover:bg-gray-100'
            }`}
          >
            Pending ({payments.filter(p => p.status.toLowerCase() === 'pending').length})
          </button>
          <button
            onClick={() => setFilter('paid')}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              filter === 'paid'
                ? 'bg-[#003152] text-white'
                : 'text-[#003333] hover:bg-gray-100'
            }`}
          >
            Paid ({payments.filter(p => p.status.toLowerCase() === 'completed').length})
          </button>
          <button
            onClick={() => setFilter('overdue')}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              filter === 'overdue'
                ? 'bg-[#003152] text-white'
                : 'text-[#003333] hover:bg-gray-100'
            }`}
          >
            Overdue ({payments.filter(p => p.status.toLowerCase() === 'overdue').length})
          </button>
        </div>

        {/* Payments List */}
        {filteredPayments.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <svg className="w-20 h-20 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <h3 className="text-xl font-semibold text-[#003333] mb-2">
              {filter === 'all' ? 'No payment records' : `No ${filter} payments`}
            </h3>
            <p className="text-gray-500">
              {filter === 'all' 
                ? 'Your payment history will appear here once you have an active rental'
                : `You don't have any ${filter} payments at the moment`
              }
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredPayments.map((payment) => (
              <PaymentCard key={payment.id} payment={payment} onUpdate={fetchData} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const computeStatistics = (payments) => {
  const today = new Date();
  const vals = {
    total_paid: 0,
    total_pending: 0,
    total_overdue: 0,
    next_payment_date: null,
  };
  let soonest = null;
  for (const p of payments) {
    const amount = Number(p.amount) || 0;
    const status = (p.status || '').toLowerCase();
    if (status === 'completed' || status === 'paid') {
      vals.total_paid += amount;
      continue;
    }
    const overdue =
      status === 'overdue' || (status === 'pending' && new Date(p.due_date) < today);
    if (overdue) {
      vals.total_overdue += amount;
    } else {
      vals.total_pending += amount;
      if (!soonest || new Date(p.due_date) < soonest) soonest = new Date(p.due_date);
    }
  }
  if (soonest) {
    vals.next_payment_date = soonest.toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric',
    });
  }
  return vals;
};

const StatCard = ({ title, value, icon, color }) => {
  const colorClasses = {
    green: 'bg-green-100 text-green-600',
    yellow: 'bg-yellow-100 text-yellow-600',
    red: 'bg-red-100 text-red-600',
    blue: 'bg-blue-100 text-blue-600',
  };

  const iconPaths = {
    check: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />,
    clock: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />,
    alert: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />,
    calendar: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />,
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-full ${colorClasses[color]}`}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {iconPaths[icon]}
          </svg>
        </div>
      </div>
      <p className="text-sm text-[#003333] mb-1">{title}</p>
      <p className="text-2xl font-bold text-[#003152]">{value}</p>
    </div>
  );
};

const PaymentCard = ({ payment, onUpdate }) => {
  const [processing, setProcessing] = useState(false);

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'paid':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'overdue':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'processing':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const isOverdue = () => {
    if (payment.status.toLowerCase() === 'completed') return false;
    return new Date(payment.due_date) < new Date();
  };

  const [pushMessage, setPushMessage] = useState('');
  const [polling, setPolling] = useState(false);

  const pollStatus = async () => {
    for (let i = 0; i < 12; i++) {
      await new Promise((r) => setTimeout(r, 5000));
      try {
        const res = await paymentsAPI.checkPaymentStatus(payment.id);
        const status = res.data.status;
        if (status === 'SUCCESS' || status === 'SETTLED') {
          setPolling(false);
          setPushMessage('Payment successful!');
          await onUpdate();
          return;
        }
        if (status === 'FAILED') {
          setPolling(false);
          setPushMessage('Payment failed. You can try again.');
          return;
        }
      } catch (err) {
        // transient polling errors — keep trying
      }
    }
    setPolling(false);
    setPushMessage('Still processing. You can refresh to check the status.');
  };

  const handleDownload = async () => {
    try {
      const res = await paymentsAPI.downloadInvoice(payment.id);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice-${payment.id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error downloading invoice:', err);
      alert('Failed to download the invoice. Please try again.');
    }
  };

  const handlePayment = async () => {
    try {
      setProcessing(true);
      const res = await paymentsAPI.initiatePayment(payment.id, {});
      setProcessing(false);
      setPushMessage(
        'USSD push sent to your phone. Check your phone and enter your PIN to complete the payment.'
      );
      setPolling(true);
      await pollStatus();
    } catch (err) {
      console.error('Error initiating payment:', err);
      setProcessing(false);
      // A 403/404 here means the payment isn't in the current user's account
      // (e.g. wrong account logged in, or a deleted/reassigned payment).
      if (err.response?.status === 403 || err.response?.status === 404) {
        alert(
          'This payment is not available to your account. It may belong to another ' +
          'account or no longer exist. Please refresh the page and make sure you are ' +
          'signed in with the correct account.'
        );
        await onUpdate();
        return;
      }
      alert(err.response?.data?.error || 'Failed to initiate payment. Please try again.');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="p-6">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-4">
          <div className="flex-1 mb-4 md:mb-0">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="text-xl font-bold text-[#003152] mb-1">
                  {payment.property_name || 'Rental Payment'}
                </h3>
                <p className="text-sm text-[#003333]">
                  Unit {payment.unit_number || 'N/A'}
                </p>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${getStatusColor(payment.status)}`}>
                {payment.status}
              </span>
            </div>
          </div>
        </div>

        {/* Payment Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="bg-[#ADDFF1] bg-opacity-20 p-4 rounded-lg">
            <p className="text-sm text-[#003333] mb-1">Amount</p>
            <p className="text-2xl font-bold text-[#003152]">
              {payment.amount} TZS
            </p>
          </div>
          <div className={`p-4 rounded-lg ${isOverdue() ? 'bg-red-50' : 'bg-gray-50'}`}>
            <p className="text-sm text-[#003333] mb-1">Due Date</p>
            <p className={`text-lg font-bold ${isOverdue() ? 'text-red-600' : 'text-[#003152]'}`}>
              {formatDate(payment.due_date)}
            </p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-[#003333] mb-1">
              {payment.status.toLowerCase() === 'completed' ? 'Paid On' : 'Period'}
            </p>
            <p className="text-lg font-bold text-[#003152]">
              {payment.payment_date 
                ? formatDate(payment.payment_date)
                : formatDate(payment.period_start)
              }
            </p>
          </div>
        </div>

        {/* Overdue Alert */}
        {isOverdue() && payment.status.toLowerCase() !== 'completed' && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <p className="text-sm text-red-700 font-semibold">
                This payment is overdue. Late fees may apply. Please pay as soon as possible.
              </p>
            </div>
          </div>
        )}

        {/* Payment Details */}
        {payment.payment_method && (
          <div className="border-t border-gray-200 pt-4 mb-4">
            <div className="flex items-center text-sm text-[#003333]">
              <svg className="w-4 h-4 mr-2 text-[#99CC33]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              <span>Payment Method: {payment.payment_method}</span>
            </div>
          </div>
        )}

        {payment.transaction_id && (
          <div className="text-xs text-gray-500 mb-4">
            Transaction ID: {payment.transaction_id}
          </div>
        )}

        {payment.notes && (
          <div className="bg-[#ADDFF1] bg-opacity-20 p-3 rounded-lg mb-4">
            <p className="text-sm font-semibold text-[#003152] mb-1">Notes:</p>
            <p className="text-sm text-[#003333]">{payment.notes}</p>
          </div>
        )}

        {/* USSD push status message */}
        {pushMessage && (
          <div className={`mt-4 p-3 rounded-lg text-sm ${
            pushMessage.includes('successful')
              ? 'bg-green-50 text-green-800'
              : pushMessage.includes('failed')
              ? 'bg-red-50 text-red-800'
              : 'bg-blue-50 text-blue-800'
          }`}>
            {pushMessage}
          </div>
        )}

        {/* Action Buttons */}
        {payment.status.toLowerCase() !== 'completed' && (
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              onClick={handlePayment}
              disabled={processing || polling}
              className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-colors ${
                processing || polling
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-[#99CC33] text-[#003152] hover:bg-[#88BB22]'
              }`}
            >
              {processing || polling ? 'Processing...' : 'Pay Now'}
            </button>
            <button
              onClick={handleDownload}
              className="flex-1 py-3 px-4 bg-white text-[#003152] border border-[#003152] rounded-lg hover:bg-gray-50 font-semibold transition-colors"
            >
              Download Invoice
            </button>
          </div>
        )}

        {payment.status.toLowerCase() === 'completed' && (
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              onClick={handleDownload}
              className="flex-1 py-3 px-4 bg-gray-200 text-[#003333] rounded-lg hover:bg-gray-300 font-semibold transition-colors"
            >
              Download Receipt
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Payments;
