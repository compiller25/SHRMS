const tones = {
  APPLIED: 'bg-yellow-100 text-yellow-800',
  PENDING: 'bg-yellow-100 text-yellow-800',
  APPROVED: 'bg-blue-100 text-blue-800',
  REJECTED: 'bg-red-100 text-red-800',
  ACTIVE: 'bg-green-100 text-green-800',
  PAID: 'bg-green-100 text-green-800',
  OVERDUE: 'bg-red-100 text-red-800',
  TERMINATED: 'bg-gray-200 text-gray-700',
  AVAILABLE: 'bg-green-100 text-green-800',
  OCCUPIED: 'bg-gray-200 text-gray-700',
};

const StatusBadge = ({ status }) => (
  <span
    className={`inline-block text-xs font-semibold px-3 py-1 rounded-full ${tones[status] || 'bg-gray-100 text-gray-700'}`}
  >
    {status}
  </span>
);

export default StatusBadge;
