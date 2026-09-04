import { useState, useEffect } from 'react';
import { rentalsAPI } from '../../services/api';

const Applications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // all, applied, approved, rejected

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await rentalsAPI.getMyApplications();
      const applicationsData = Array.isArray(response.data) ? response.data : response.data.results || [];
      setApplications(applicationsData);
    } catch (err) {
      setError('Failed to load applications. Please try again later.');
      console.error('Error fetching applications:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
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

  const filteredApplications = applications.filter(app => {
    if (filter === 'all') return true;
    if (filter === 'applied') return app.status.toLowerCase() === 'applied' || app.status.toLowerCase() === 'pending';
    return app.status.toLowerCase() === filter;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#003152] mx-auto mb-4"></div>
          <p className="text-[#003333] text-lg">Loading applications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-[#003152] mb-2">
            My Applications
          </h1>
          <p className="text-[#003333]">Track your rental application status</p>
        </div>

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
            All ({applications.length})
          </button>
          <button
            onClick={() => setFilter('applied')}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              filter === 'applied'
                ? 'bg-[#003152] text-white'
                : 'text-[#003333] hover:bg-gray-100'
            }`}
          >
            Pending ({applications.filter(a => a.status.toLowerCase() === 'applied' || a.status.toLowerCase() === 'pending').length})
          </button>
          <button
            onClick={() => setFilter('approved')}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              filter === 'approved'
                ? 'bg-[#003152] text-white'
                : 'text-[#003333] hover:bg-gray-100'
            }`}
          >
            Approved ({applications.filter(a => a.status.toLowerCase() === 'approved').length})
          </button>
          <button
            onClick={() => setFilter('rejected')}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              filter === 'rejected'
                ? 'bg-[#003152] text-white'
                : 'text-[#003333] hover:bg-gray-100'
            }`}
          >
            Rejected ({applications.filter(a => a.status.toLowerCase() === 'rejected').length})
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Applications List */}
        {filteredApplications.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <svg className="w-20 h-20 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-xl font-semibold text-[#003333] mb-2">
              {filter === 'all' ? 'No applications yet' : `No ${filter} applications`}
            </h3>
            <p className="text-gray-500 mb-6">
              {filter === 'all' 
                ? 'Start exploring properties in the marketplace'
                : `You don't have any ${filter} applications at the moment`
              }
            </p>
            {filter === 'all' && (
              <a
                href="/tenant/marketplace"
                className="inline-block px-6 py-3 bg-[#99CC33] text-[#003152] font-semibold rounded-lg hover:bg-[#88BB22] transition-colors"
              >
                Browse Properties
              </a>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {filteredApplications.map((application) => (
              <ApplicationCard
                key={application.id}
                application={application}
                onUpdate={fetchApplications}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const ApplicationCard = ({ application, onUpdate }) => {
  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
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
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="p-6">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-4">
          <div className="flex-1 mb-4 md:mb-0">
            <div className="flex items-start justify-between mb-2">
              <h3 className="text-xl font-bold text-[#003152] mb-1">
                {application.house_unit?.property_name || 'Property Name'}
              </h3>
              <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${getStatusColor(application.status)}`}>
                {application.status}
              </span>
            </div>
            
            <div className="space-y-2 text-[#003333]">
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2 text-[#99CC33]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <span>Unit: {application.house_unit?.unit_number || 'N/A'}</span>
              </div>
              
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2 text-[#99CC33]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>{application.house_unit?.property_address || 'Address not available'}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
          <div>
            <p className="text-sm text-[#003333] mb-1">Monthly Rent</p>
            <p className="text-lg font-bold text-[#003152]">
              {application.monthly_rent || 'N/A'} TZS
            </p>
          </div>
          <div>
            <p className="text-sm text-[#003333] mb-1">Start Date</p>
            <p className="text-lg font-bold text-[#003152]">
              {application.start_date ? formatDate(application.start_date) : 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-sm text-[#003333] mb-1">Applied On</p>
            <p className="text-lg font-bold text-[#003152]">
              {application.created_at ? formatDate(application.created_at) : 'N/A'}
            </p>
          </div>
        </div>

        {(application.status.toLowerCase() === 'applied' || application.status.toLowerCase() === 'pending') && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
            <div className="flex">
              <svg className="w-5 h-5 text-yellow-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <p className="text-sm text-yellow-700">
                Your application is being reviewed by the landlord. You'll be notified once a decision is made.
              </p>
            </div>
          </div>
        )}

        {application.status.toLowerCase() === 'approved' && (
          <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-4">
            <div className="flex">
              <svg className="w-5 h-5 text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <p className="text-sm text-green-700">
                Congratulations! Your application has been approved. The landlord will contact you for next steps.
              </p>
            </div>
          </div>
        )}

        {application.status.toLowerCase() === 'rejected' && application.rejection_reason && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
            <div className="flex">
              <svg className="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <div className="text-sm text-red-700">
                <p className="font-semibold mb-1">Application Rejected</p>
                <p>{application.rejection_reason}</p>
              </div>
            </div>
          </div>
        )}

        {application.notes && (
          <div className="mt-4 p-4 bg-[#ADDFF1] bg-opacity-20 rounded-lg">
            <p className="text-sm font-semibold text-[#003152] mb-1">Notes:</p>
            <p className="text-sm text-[#003333]">{application.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Applications;
