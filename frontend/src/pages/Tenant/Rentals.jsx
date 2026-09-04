import { useState, useEffect } from 'react';
import { rentalsAPI } from '../../services/api';

const Rentals = () => {
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchRentals();
  }, []);

  const fetchRentals = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await rentalsAPI.getAll({ status: 'active' });
      const rentalsData = Array.isArray(response.data) ? response.data : response.data.results || [];
      setRentals(rentalsData.filter(rental => rental.status.toLowerCase() === 'active'));
    } catch (err) {
      setError('Failed to load rentals. Please try again later.');
      console.error('Error fetching rentals:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#003152] mx-auto mb-4"></div>
          <p className="text-[#003333] text-lg">Loading rentals...</p>
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
            My Rentals
          </h1>
          <p className="text-[#003333]">Manage your active rental agreements</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Rentals List */}
        {rentals.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <svg className="w-20 h-20 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <h3 className="text-xl font-semibold text-[#003333] mb-2">No active rentals</h3>
            <p className="text-gray-500 mb-6">
              You don't have any active rental agreements at the moment
            </p>
            <a
              href="/tenant/marketplace"
              className="inline-block px-6 py-3 bg-[#99CC33] text-[#003152] font-semibold rounded-lg hover:bg-[#88BB22] transition-colors"
            >
              Browse Properties
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {rentals.map((rental) => (
              <RentalCard key={rental.id} rental={rental} onUpdate={fetchRentals} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const RentalCard = ({ rental, onUpdate }) => {
  const [showDetails, setShowDetails] = useState(false);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const calculateDaysRemaining = (endDate) => {
    if (!endDate) return null;
    const end = new Date(endDate);
    const today = new Date();
    const diffTime = end - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysRemaining = calculateDaysRemaining(rental.end_date);

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#003152] to-[#003333] p-6 text-white">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-xl font-bold">
            {rental.property_name || 'Property Name'}
          </h3>
          <span className="bg-[#99CC33] text-[#003152] px-3 py-1 rounded-full text-sm font-semibold">
            Active
          </span>
        </div>
        <div className="flex items-center text-[#ADDFF1]">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span className="text-sm">Unit {rental.unit_number || 'N/A'}</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Key Information */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-[#ADDFF1] bg-opacity-20 p-4 rounded-lg">
            <p className="text-sm text-[#003333] mb-1">Monthly Rent</p>
            <p className="text-2xl font-bold text-[#003152]">
              {rental.monthly_rent || 'N/A'} TZS
            </p>
          </div>
          <div className="bg-[#ADDFF1] bg-opacity-20 p-4 rounded-lg">
            <p className="text-sm text-[#003333] mb-1">Security Deposit</p>
            <p className="text-2xl font-bold text-[#003152]">
              {rental.security_deposit || 'N/A'} TZS
            </p>
          </div>
        </div>

        {/* Dates */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-[#99CC33] mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-sm text-[#003333]">Start Date</span>
            </div>
            <span className="font-semibold text-[#003152]">
              {formatDate(rental.start_date)}
            </span>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-[#99CC33] mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-sm text-[#003333]">End Date</span>
            </div>
            <span className="font-semibold text-[#003152]">
              {formatDate(rental.end_date)}
            </span>
          </div>
        </div>

        {/* Days Remaining Alert */}
        {daysRemaining !== null && daysRemaining > 0 && daysRemaining <= 90 && (
          <div className={`p-4 rounded-lg mb-6 ${
            daysRemaining <= 30 
              ? 'bg-red-50 border-l-4 border-red-400' 
              : 'bg-yellow-50 border-l-4 border-yellow-400'
          }`}>
            <div className="flex items-center">
              <svg className={`w-5 h-5 mr-2 ${
                daysRemaining <= 30 ? 'text-red-400' : 'text-yellow-400'
              }`} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <p className={`text-sm font-medium ${
                daysRemaining <= 30 ? 'text-red-700' : 'text-yellow-700'
              }`}>
                Your lease expires in {daysRemaining} days
              </p>
            </div>
          </div>
        )}

        {/* Landlord Information */}
        {rental.landlord && (
          <div className="border-t border-gray-200 pt-4 mb-6">
            <p className="text-sm text-[#003333] mb-2 font-semibold">Landlord Contact</p>
            <div className="space-y-2">
              <div className="flex items-center text-[#003333]">
                <svg className="w-4 h-4 mr-2 text-[#99CC33]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="text-sm">
                  {rental.landlord.first_name} {rental.landlord.last_name}
                </span>
              </div>
              <div className="flex items-center text-[#003333]">
                <svg className="w-4 h-4 mr-2 text-[#99CC33]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span className="text-sm">{rental.landlord.email}</span>
              </div>
            </div>
          </div>
        )}

        {/* Toggle Details Button */}
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="w-full py-2 text-[#003152] hover:text-[#003333] font-medium text-sm flex items-center justify-center transition-colors"
        >
          {showDetails ? 'Hide Details' : 'Show Details'}
          <svg
            className={`w-5 h-5 ml-2 transform transition-transform ${showDetails ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Additional Details */}
        {showDetails && (
          <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
            {rental.unit?.address && (
              <div className="flex items-start">
                <svg className="w-5 h-5 text-[#99CC33] mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <div>
                  <p className="text-sm font-semibold text-[#003333]">Address</p>
                  <p className="text-sm text-gray-600">{rental.unit.address}</p>
                </div>
              </div>
            )}

            {rental.terms && (
              <div className="flex items-start">
                <svg className="w-5 h-5 text-[#99CC33] mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <div>
                  <p className="text-sm font-semibold text-[#003333]">Terms & Conditions</p>
                  <p className="text-sm text-gray-600 whitespace-pre-line">{rental.terms}</p>
                </div>
              </div>
            )}

            {rental.payment_due_day && (
              <div className="flex items-center">
                <svg className="w-5 h-5 text-[#99CC33] mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-sm font-semibold text-[#003333]">
                    Payment Due: Day {rental.payment_due_day} of each month
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="mt-6 pt-4 border-t border-gray-200 flex gap-3">
          <a
            href="/tenant/payments"
            className="flex-1 py-2 px-4 bg-[#99CC33] text-[#003152] font-semibold rounded-lg hover:bg-[#88BB22] transition-colors text-center"
          >
            View Payments
          </a>
          <button
            className="flex-1 py-2 px-4 bg-gray-200 text-[#003333] font-semibold rounded-lg hover:bg-gray-300 transition-colors"
          >
            Contact Landlord
          </button>
        </div>
      </div>
    </div>
  );
};

export default Rentals;
