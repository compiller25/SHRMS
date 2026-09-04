import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { marketplaceAPI, rentalAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

// Property images mapped by type (same as Marketplace)
const PROPERTY_IMAGES = {
  apartment: [
    'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80',
    'https://images.unsplash.com/photo-1502672260066-6bc35f0a1bb2?w=800&q=80',
    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80',
  ],
  house: [
    'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&q=80',
    'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&q=80',
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80',
  ],
  condo: [
    'https://images.unsplash.com/photo-1567767292278-a4f21aa2d36e?w=800&q=80',
    'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80',
    'https://images.unsplash.com/photo-1613977257363-707ba9348227?w=800&q=80',
  ],
  townhouse: [
    'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80',
    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80',
    'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800&q=80',
  ],
  default: [
    'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80',
    'https://images.unsplash.com/photo-1605146769289-440113cc3d00?w=800&q=80',
  ]
};

const getPropertyImage = (property, index = 0) => {
  if (property.image_url || property.image) {
    return property.image_url || property.image;
  }
  
  const propertyType = property.property_type?.toLowerCase() || 'default';
  const images = PROPERTY_IMAGES[propertyType] || PROPERTY_IMAGES.default;
  
  return images[index % images.length];
};

const PropertyDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [property, setProperty] = useState(null);
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [applicationData, setApplicationData] = useState({
    move_in_date: '',
    lease_duration: '12', // Default 12 months
    terms_accepted: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [applicationSuccess, setApplicationSuccess] = useState(false);

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!user) {
      navigate('/login', { state: { from: `/marketplace/property/${id}` } });
      return;
    }

    // Only tenants can apply
    if (user.role !== 'TENANT') {
      setError('Only tenants can view property details and apply for rentals.');
      setLoading(false);
      return;
    }

    fetchPropertyDetails();
  }, [id, user, navigate]);

  const fetchPropertyDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch property details
      const propertyResponse = await marketplaceAPI.getPropertyById(id);
      setProperty(propertyResponse.data);

      // Fetch available units
      const unitsResponse = await marketplaceAPI.getPropertyUnits(id);
      setUnits(unitsResponse.data.filter(unit => unit.status === 'AVAILABLE'));
      
    } catch (err) {
      console.error('Error fetching property details:', err);
      setError('Failed to load property details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleUnitSelect = (unit) => {
    setSelectedUnit(unit);
    setShowApplicationForm(true);
  };

  const handleInputChange = (e) => {
    setApplicationData({
      ...applicationData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmitApplication = async (e) => {
    e.preventDefault();
    
    if (!selectedUnit) {
      alert('Please select a unit first');
      return;
    }

    if (!applicationData.terms_accepted) {
      alert('Please accept the terms and conditions');
      return;
    }

    try {
      setSubmitting(true);
      
      // Calculate end date based on lease duration
      const startDate = new Date(applicationData.move_in_date);
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + parseInt(applicationData.lease_duration));
      
      const applicationPayload = {
        house_unit: selectedUnit.id,
        start_date: applicationData.move_in_date,
        end_date: endDate.toISOString().split('T')[0],
        terms_conditions: 'I agree to the rental terms and conditions',
      };

      await rentalAPI.applyForRental(applicationPayload);
      
      setApplicationSuccess(true);
      setShowApplicationForm(false);
      
      // Show success message and redirect after delay
      setTimeout(() => {
        navigate('/tenant/applications');
      }, 3000);
      
    } catch (err) {
      console.error('Error submitting application:', err);
      const errorMessage = err.response?.data?.house_unit?.[0] 
        || err.response?.data?.error 
        || err.response?.data?.detail
        || 'Failed to submit application. Please try again.';
      alert(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#003152] mx-auto mb-4"></div>
          <p className="text-[#003333] text-lg">Loading property details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg">
            <p className="font-semibold mb-2">Error</p>
            <p>{error}</p>
            <button
              onClick={() => navigate('/marketplace')}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Back to Marketplace
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-gray-600">Property not found</p>
          <button
            onClick={() => navigate('/marketplace')}
            className="mt-4 px-4 py-2 bg-[#003152] text-white rounded-lg hover:bg-[#003333]"
          >
            Back to Marketplace
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Success Message */}
        {applicationSuccess && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-6 py-4 rounded-lg">
            <p className="font-semibold">✅ Application Submitted Successfully!</p>
            <p className="text-sm mt-1">The landlord has been notified. Redirecting to your applications...</p>
          </div>
        )}

        {/* Back Button */}
        <button
          onClick={() => navigate('/marketplace')}
          className="mb-6 flex items-center text-[#003152] hover:text-[#003333] font-medium"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Marketplace
        </button>

        {/* Property Header */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
          {/* Property Image */}
          <div className="h-96 bg-gradient-to-br from-[#ADDFF1] to-[#003152] relative">
            <img
              src={getPropertyImage(property)}
              alt={property.name}
              className="w-full h-full object-cover"
            />
            {units.length > 0 && (
              <span className="absolute top-4 right-4 bg-[#99CC33] text-[#003152] px-4 py-2 rounded-full text-lg font-semibold shadow-lg">
                {units.length} Unit{units.length !== 1 ? 's' : ''} Available
              </span>
            )}
          </div>

          {/* Property Info */}
          <div className="p-8">
            <div className="flex items-start justify-between mb-4">
              <div>
                <span className="inline-block bg-[#003152] text-white px-4 py-1 rounded-full text-sm font-semibold mb-3">
                  📍 {property.area || property.city}
                </span>
                <h1 className="text-4xl font-bold text-[#003152] mb-2">{property.name}</h1>
                <div className="flex items-center text-[#003333] mb-3">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>{property.address}</span>
                </div>
                <span className="capitalize bg-[#ADDFF1] px-3 py-1 rounded-lg text-[#003152] font-medium">
                  {property.property_type}
                </span>
              </div>
              <div className="text-right">
                <p className="text-sm text-[#003333] mb-1">Starting from</p>
                <p className="text-4xl font-bold text-[#003152]">
                  {property.min_rent?.toLocaleString()} TZS
                </p>
                <p className="text-sm text-[#003333]">per month</p>
              </div>
            </div>

            {property.description && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-xl font-bold text-[#003152] mb-3">Description</h3>
                <p className="text-gray-700 leading-relaxed">{property.description}</p>
              </div>
            )}
          </div>
        </div>

        {/* Available Units */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-6">
          <h2 className="text-2xl font-bold text-[#003152] mb-6">Available Units</h2>
          
          {units.length === 0 ? (
            <div className="text-center py-8">
              <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <p className="text-gray-600 text-lg">No units available at this time</p>
              <p className="text-gray-500 text-sm mt-2">Please check back later or contact the landlord</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {units.map((unit) => (
                <div
                  key={unit.id}
                  className={`border-2 rounded-lg p-6 transition-all ${
                    selectedUnit?.id === unit.id
                      ? 'border-[#99CC33] bg-[#99CC33] bg-opacity-10'
                      : 'border-gray-200 hover:border-[#003152]'
                  }`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-[#003152]">{unit.unit_number}</h3>
                      <p className="text-sm text-[#003333]">
                        {unit.bedrooms} Bedroom{unit.bedrooms !== 1 ? 's' : ''} • {unit.bathrooms} Bath{unit.bathrooms !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <span className="text-2xl font-bold text-[#003152]">
                      {unit.rent?.toLocaleString()} TZS
                    </span>
                  </div>

                  {unit.square_footage && (
                    <p className="text-sm text-gray-600 mb-4">
                      📏 {unit.square_footage} sq ft
                    </p>
                  )}

                  <button
                    onClick={() => handleUnitSelect(unit)}
                    disabled={submitting}
                    className="w-full px-4 py-3 bg-[#99CC33] text-[#003152] rounded-lg hover:bg-[#88BB22] transition-colors font-semibold"
                  >
                    {selectedUnit?.id === unit.id ? '✓ Selected - Apply Now' : 'Select & Apply'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Application Form */}
        {showApplicationForm && selectedUnit && (
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold text-[#003152] mb-2">Apply for {selectedUnit.unit_number}</h2>
            <p className="text-gray-600 mb-6">Fill out the form below to submit your application</p>

            <form onSubmit={handleSubmitApplication} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-[#003333] mb-2">
                    Move-in Date (Start Date) *
                  </label>
                  <input
                    type="date"
                    name="move_in_date"
                    value={applicationData.move_in_date}
                    onChange={handleInputChange}
                    min={new Date().toISOString().split('T')[0]}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#99CC33] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#003333] mb-2">
                    Lease Duration *
                  </label>
                  <select
                    name="lease_duration"
                    value={applicationData.lease_duration}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#99CC33] focus:border-transparent"
                  >
                    <option value="6">6 Months</option>
                    <option value="12">12 Months (1 Year)</option>
                    <option value="24">24 Months (2 Years)</option>
                    <option value="36">36 Months (3 Years)</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    End date will be calculated automatically
                  </p>
                </div>
              </div>

              {/* Rental Summary */}
              <div className="bg-[#ADDFF1] bg-opacity-20 rounded-lg p-4 border border-[#003152]">
                <h4 className="font-semibold text-[#003152] mb-3">Rental Summary</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[#003333]">Monthly Rent:</span>
                    <span className="font-semibold text-[#003152]">{selectedUnit.rent?.toLocaleString()} TZS</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#003333]">Security Deposit (1 month):</span>
                    <span className="font-semibold text-[#003152]">{selectedUnit.rent?.toLocaleString()} TZS</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#003333]">Lease Duration:</span>
                    <span className="font-semibold text-[#003152]">{applicationData.lease_duration} months</span>
                  </div>
                  <div className="border-t border-[#003152] pt-2 mt-2 flex justify-between">
                    <span className="font-semibold text-[#003152]">Initial Payment:</span>
                    <span className="font-bold text-[#003152] text-lg">
                      {(selectedUnit.rent * 2)?.toLocaleString()} TZS
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mt-2">
                    * First month rent + security deposit
                  </p>
                </div>
              </div>

              {/* Terms and Conditions */}
              <div className="border border-gray-300 rounded-lg p-4">
                <label className="flex items-start space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="terms_accepted"
                    checked={applicationData.terms_accepted}
                    onChange={(e) => setApplicationData({
                      ...applicationData,
                      terms_accepted: e.target.checked
                    })}
                    required
                    className="mt-1 w-5 h-5 text-[#99CC33] border-gray-300 rounded focus:ring-[#99CC33]"
                  />
                  <div className="text-sm">
                    <p className="font-medium text-[#003152] mb-1">
                      I accept the terms and conditions *
                    </p>
                    <p className="text-gray-600">
                      By checking this box, I agree to pay the monthly rent on time, 
                      maintain the property in good condition, and follow all rental 
                      agreement terms set by the landlord.
                    </p>
                  </div>
                </label>
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={submitting || !applicationData.terms_accepted}
                  className="flex-1 px-6 py-3 bg-[#99CC33] text-[#003152] rounded-lg hover:bg-[#88BB22] transition-colors font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Submitting...' : '✓ Submit Application'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowApplicationForm(false);
                    setSelectedUnit(null);
                  }}
                  disabled={submitting}
                  className="px-6 py-3 bg-gray-200 text-[#003333] rounded-lg hover:bg-gray-300 transition-colors font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default PropertyDetail;
