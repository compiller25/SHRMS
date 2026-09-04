import { useState, useEffect } from 'react';
import { rentalsAPI } from '../../services/api';

const Agreements = () => {
  const [applications, setApplications] = useState([]);
  const [activeAgreements, setActiveAgreements] = useState([]);
  const [filter, setFilter] = useState('applied'); // applied, approved, rejected, active
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAgreements();
  }, []);

  const fetchAgreements = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await rentalsAPI.getAll();
      const agreements = Array.isArray(response.data) ? response.data : response.data.results || [];

      setApplications(agreements.filter(a => ['applied', 'approved', 'rejected'].includes(a.status?.toLowerCase())));
      setActiveAgreements(agreements.filter(a => a.status?.toLowerCase() === 'active'));
    } catch (err) {
      setError('Failed to load agreements. Please try again later.');
      console.error('Error fetching agreements:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleProcessApplication = async (applicationId, action, reason = '') => {
    try {
      await rentalsAPI.processApplication(applicationId, action, reason);
      await fetchAgreements();
    } catch (err) {
      alert(`Failed to ${action} application. Please try again.`);
      console.error(`Error ${action}ing application:`, err);
    }
  };

  const getFilteredApplications = () => {
    if (filter === 'active') return activeAgreements;
    return applications.filter(app => app.status?.toLowerCase() === filter);
  };

  const filteredData = getFilteredApplications();

  const appliedCount = applications.filter(a => a.status?.toLowerCase() === 'applied').length;
  const approvedCount = applications.filter(a => a.status?.toLowerCase() === 'approved').length;
  const rejectedCount = applications.filter(a => a.status?.toLowerCase() === 'rejected').length;
  const activeCount = activeAgreements.length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#003152] mx-auto mb-4"></div>
          <p className="text-[#003333] text-lg">Loading agreements...</p>
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
            Rental Agreements
          </h1>
          <p className="text-[#003333]">Manage applications and active agreements</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Pending Applications Alert */}
        {appliedCount > 0 && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-lg mb-6">
            <div className="flex items-center">
              <svg className="w-6 h-6 text-yellow-600 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <div>
                <h3 className="text-lg font-semibold text-yellow-800">
                  {appliedCount} Application{appliedCount !== 1 ? 's' : ''} Awaiting Review
                </h3>
                <p className="text-sm text-yellow-700">Please review and respond to tenant applications</p>
              </div>
            </div>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="bg-white rounded-lg shadow-md p-2 mb-6 inline-flex gap-2">
          <button
            onClick={() => setFilter('applied')}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              filter === 'applied'
                ? 'bg-[#003152] text-white'
                : 'text-[#003333] hover:bg-gray-100'
            }`}
          >
            New Applications ({appliedCount})
          </button>
          <button
            onClick={() => setFilter('approved')}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              filter === 'approved'
                ? 'bg-[#003152] text-white'
                : 'text-[#003333] hover:bg-gray-100'
            }`}
          >
            Approved ({approvedCount})
          </button>
          <button
            onClick={() => setFilter('active')}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              filter === 'active'
                ? 'bg-[#003152] text-white'
                : 'text-[#003333] hover:bg-gray-100'
            }`}
          >
            Active ({activeCount})
          </button>
          <button
            onClick={() => setFilter('rejected')}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              filter === 'rejected'
                ? 'bg-[#003152] text-white'
                : 'text-[#003333] hover:bg-gray-100'
            }`}
          >
            Rejected ({rejectedCount})
          </button>
        </div>

        {/* Agreements List */}
        {filteredData.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <svg className="w-20 h-20 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-xl font-semibold text-[#003333] mb-2">
              No {filter} {filter === 'active' ? 'agreements' : 'applications'}
            </h3>
            <p className="text-gray-500">
              {filter === 'applied' 
                ? 'New applications will appear here when tenants apply for your properties'
                : `You don't have any ${filter} ${filter === 'active' ? 'agreements' : 'applications'} at the moment`
              }
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredData.map((agreement) => (
              <AgreementCard
                key={agreement.id}
                agreement={agreement}
                onProcess={handleProcessApplication}
                onUpdate={fetchAgreements}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const AgreementCard = ({ agreement, onProcess, onUpdate }) => {
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [processing, setProcessing] = useState(false);

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'applied':
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'active':
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

  const handleApprove = async () => {
    if (!window.confirm('Are you sure you want to approve this application?')) return;
    
    setProcessing(true);
    await onProcess(agreement.id, 'approve');
    setProcessing(false);
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }

    setProcessing(true);
    await onProcess(agreement.id, 'reject', rejectReason);
    setProcessing(false);
    setShowRejectModal(false);
    setRejectReason('');
  };

  const isPending = agreement.status?.toLowerCase() === 'applied' || agreement.status?.toLowerCase() === 'pending';

  return (
    <>
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
        <div className="p-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-4">
            <div className="flex-1 mb-4 md:mb-0">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-xl font-bold text-[#003152] mb-1">
                    {agreement.house_unit?.property?.name || 'Property Name'}
                  </h3>
                  <p className="text-sm text-[#003333]">
                    Unit {agreement.house_unit?.unit_number || 'N/A'}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${getStatusColor(agreement.status)}`}>
                  {agreement.status}
                </span>
              </div>

              {/* Tenant Information */}
              <div className="bg-[#ADDFF1] bg-opacity-20 p-4 rounded-lg mb-4">
                <h4 className="font-semibold text-[#003152] mb-3">Applicant Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-[#99CC33] mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <div>
                      <p className="text-xs text-[#003333]">Name</p>
                      <p className="font-semibold text-[#003152]">
                        {agreement.tenant?.first_name} {agreement.tenant?.last_name}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-[#99CC33] mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <div>
                      <p className="text-xs text-[#003333]">Email</p>
                      <p className="font-semibold text-[#003152]">{agreement.tenant?.email || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-[#99CC33] mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <div>
                      <p className="text-xs text-[#003333]">Phone</p>
                      <p className="font-semibold text-[#003152]">{agreement.tenant?.phone || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-[#99CC33] mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <div>
                      <p className="text-xs text-[#003333]">Applied On</p>
                      <p className="font-semibold text-[#003152]">{formatDate(agreement.created_at)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Agreement Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-[#003333] mb-1">Monthly Rent</p>
              <p className="text-2xl font-bold text-[#003152]">
                {agreement.monthly_rent || agreement.house_unit?.rent_amount || 'N/A'} TZS
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-[#003333] mb-1">Start Date</p>
              <p className="text-lg font-bold text-[#003152]">
                {formatDate(agreement.start_date)}
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-[#003333] mb-1">End Date</p>
              <p className="text-lg font-bold text-[#003152]">
                {formatDate(agreement.end_date)}
              </p>
            </div>
          </div>

          {/* Terms and Conditions */}
          {agreement.terms_conditions && (
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <p className="text-sm font-semibold text-[#003152] mb-2">Terms & Conditions</p>
              <p className="text-sm text-[#003333] whitespace-pre-line">{agreement.terms_conditions}</p>
            </div>
          )}

          {/* Rejection Reason (if rejected) */}
          {agreement.status?.toLowerCase() === 'rejected' && agreement.rejection_reason && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
              <p className="text-sm font-semibold text-red-800 mb-1">Rejection Reason:</p>
              <p className="text-sm text-red-700">{agreement.rejection_reason}</p>
            </div>
          )}

          {/* Action Buttons (only for pending applications) */}
          {isPending && (
            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <button
                onClick={handleApprove}
                disabled={processing}
                className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-colors ${
                  processing
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-[#99CC33] text-[#003152] hover:bg-[#88BB22]'
                }`}
              >
                {processing ? 'Processing...' : '✓ Approve Application'}
              </button>
              <button
                onClick={() => setShowRejectModal(true)}
                disabled={processing}
                className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-colors ${
                  processing
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-red-500 text-white hover:bg-red-600'
                }`}
              >
                ✗ Reject Application
              </button>
            </div>
          )}

          {/* Info for approved/active agreements */}
          {(agreement.status?.toLowerCase() === 'approved' || agreement.status?.toLowerCase() === 'active') && (
            <div className="bg-green-50 border-l-4 border-green-400 p-4 mt-4">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <p className="text-sm text-green-700">
                  {agreement.status?.toLowerCase() === 'active' 
                    ? 'This is an active rental agreement. Payments are being tracked.'
                    : 'Application approved. Waiting for agreement to become active.'
                  }
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="bg-gradient-to-r from-red-500 to-red-600 p-6">
              <h2 className="text-2xl font-bold text-white">Reject Application</h2>
            </div>
            
            <div className="p-6">
              <p className="text-[#003333] mb-4">
                Please provide a reason for rejecting this application. This will be sent to the applicant.
              </p>
              
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent mb-4"
                placeholder="e.g., Unit no longer available, Requirements not met, etc."
              />

              <div className="flex gap-3">
                <button
                  onClick={handleReject}
                  disabled={processing || !rejectReason.trim()}
                  className={`flex-1 py-3 rounded-lg font-semibold transition-colors ${
                    processing || !rejectReason.trim()
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-red-500 text-white hover:bg-red-600'
                  }`}
                >
                  {processing ? 'Rejecting...' : 'Confirm Rejection'}
                </button>
                <button
                  onClick={() => {
                    setShowRejectModal(false);
                    setRejectReason('');
                  }}
                  disabled={processing}
                  className="flex-1 py-3 bg-gray-200 text-[#003333] rounded-lg hover:bg-gray-300 font-semibold transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Agreements;
