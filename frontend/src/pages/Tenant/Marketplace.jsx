import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { marketplaceAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

// Property images mapped by type
const PROPERTY_IMAGES = {
  apartment: [
    'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80',
    'https://images.unsplash.com/photo-1502672260066-6bc35f0a1bb2?w=800&q=80',
    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80',
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80',
  ],
  house: [
    'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&q=80',
    'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&q=80',
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80',
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80',
  ],
  room: [
    'https://images.unsplash.com/photo-1631679706909-1844bbd93d3d?w=800&q=80',
    'https://images.unsplash.com/photo-1578500494198-246f612d03b3?w=800&q=80',
    'https://images.unsplash.com/photo-1595521624512-dfe6e288a5a9?w=800&q=80',
    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80',
  ],
  default: [
    'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80',
    'https://images.unsplash.com/photo-1605146769289-440113cc3d00?w=800&q=80',
    'https://images.unsplash.com/photo-1555636222-cae831e670b3?w=800&q=80',
    'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800&q=80',
  ]
};

// Get image for property based on type and ID
const getPropertyImage = (property) => {
  if (property.image_url || property.image) {
    return property.image_url || property.image;
  }
  
  const propertyType = property.property_type?.toLowerCase() || 'default';
  const images = PROPERTY_IMAGES[propertyType] || PROPERTY_IMAGES.default;
  
  // Use property ID to consistently assign same image to same property
  const imageIndex = property.id % images.length;
  return images[imageIndex];
};

const Marketplace = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    area: '',
    min_price: '',
    max_price: '',
    bedrooms: '',
    property_type: '',
  });

  const darAreas = [
    'Magomeni',
    'Kinondoni',
    'Mikocheni',
    'Masaki',
    'Mbezi Beach',
    'Temeke',
    'Ilala',
    'Kariakoo',
    'Oysterbay',
    'Sinza',
    'Kawe',
    'Msasani',
    'Kijitonyama',
    'Upanga',
    'Posta',
  ];

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async (filterParams = {}) => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching properties with filters:', filterParams);
      const response = await marketplaceAPI.getProperties(filterParams);
      console.log('Properties response:', response.data);
      
      // Handle both array and paginated response formats
      const propertiesData = Array.isArray(response.data) ? response.data : response.data.results || [];
      setProperties(propertiesData);
    } catch (err) {
      console.error('Error fetching properties:', err);
      setError('Failed to load properties. Please try again later.');
      setProperties([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const activeFilters = Object.entries(filters).reduce((acc, [key, value]) => {
      if (value) acc[key] = value;
      return acc;
    }, {});
    fetchProperties(activeFilters);
  };

  const handleReset = () => {
    setFilters({
      search: '',
      area: '',
      min_price: '',
      max_price: '',
      bedrooms: '',
      property_type: '',
    });
    fetchProperties();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#003152] mx-auto mb-4"></div>
          <p className="text-[#003333] text-lg">Loading properties...</p>
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
            Property Marketplace
          </h1>
          <p className="text-[#003333]">Find your perfect rental home</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <form onSubmit={handleSearch}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
              {/* Search */}
              <div>
                <label className="block text-sm font-medium text-[#003333] mb-2">
                  Search
                </label>
                <input
                  type="text"
                  name="search"
                  value={filters.search}
                  onChange={handleFilterChange}
                  placeholder="Property name or address..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#99CC33] focus:border-transparent"
                />
              </div>

              {/* Area */}
              <div>
                <label className="block text-sm font-medium text-[#003333] mb-2">
                  Area in Dar es Salaam
                </label>
                <select
                  name="area"
                  value={filters.area}
                  onChange={handleFilterChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#99CC33] focus:border-transparent"
                >
                  <option value="">All Areas</option>
                  {darAreas.map(area => (
                    <option key={area} value={area}>{area}</option>
                  ))}
                </select>
              </div>

              {/* Property Type */}
              <div>
                <label className="block text-sm font-medium text-[#003333] mb-2">
                  Property Type
                </label>
                <select
                  name="property_type"
                  value={filters.property_type}
                  onChange={handleFilterChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#99CC33] focus:border-transparent"
                >
                  <option value="">All Types</option>
                  <option value="apartment">Apartment</option>
                  <option value="house">House</option>
                  <option value="room">Room</option>
                </select>
              </div>

              {/* Min Price */}
              <div>
                <label className="block text-sm font-medium text-[#003333] mb-2">
                  Min Price
                </label>
                <input
                  type="number"
                  name="min_price"
                  value={filters.min_price}
                  onChange={handleFilterChange}
                  placeholder="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#99CC33] focus:border-transparent"
                />
              </div>

              {/* Max Price */}
              <div>
                <label className="block text-sm font-medium text-[#003333] mb-2">
                  Max Price
                </label>
                <input
                  type="number"
                  name="max_price"
                  value={filters.max_price}
                  onChange={handleFilterChange}
                  placeholder="Any"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#99CC33] focus:border-transparent"
                />
              </div>

              {/* Bedrooms */}
              <div>
                <label className="block text-sm font-medium text-[#003333] mb-2">
                  Bedrooms
                </label>
                <select
                  name="bedrooms"
                  value={filters.bedrooms}
                  onChange={handleFilterChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#99CC33] focus:border-transparent"
                >
                  <option value="">Any</option>
                  <option value="1">1+</option>
                  <option value="2">2+</option>
                  <option value="3">3+</option>
                  <option value="4">4+</option>
                </select>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                type="submit"
                className="px-6 py-2 bg-[#003152] text-white rounded-lg hover:bg-[#003333] transition-colors duration-200 font-medium"
              >
                Apply Filters
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="px-6 py-2 bg-gray-200 text-[#003333] rounded-lg hover:bg-gray-300 transition-colors duration-200 font-medium"
              >
                Reset
              </button>
            </div>
          </form>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Results Count */}
        <div className="mb-4">
          <p className="text-[#003333]">
            Found <span className="font-semibold text-[#003152]">{properties.length}</span> {properties.length === 1 ? 'property' : 'properties'}
          </p>
        </div>

        {/* Property Grid */}
        {properties.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <svg className="w-24 h-24 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <h3 className="text-2xl font-semibold text-[#003333] mb-2">No Properties Found</h3>
            <p className="text-gray-500 mb-4">There are no properties available right now.</p>
            <p className="text-gray-500 text-sm">Try adjusting your filters or check back later for more listings.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {properties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const PropertyCard = ({ property }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const imageUrl = getPropertyImage(property);
  
  const handleViewDetails = (e) => {
    e.preventDefault();
    // Navigate to property detail page
    // Will redirect to login if not authenticated (handled in PropertyDetail component)
    navigate(`/marketplace/property/${property.id}`);
  };
  
  return (
    <div
      onClick={handleViewDetails}
      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 flex flex-col cursor-pointer"
    >
      {/* Property Image */}
      <div className="h-48 bg-gradient-to-br from-[#ADDFF1] to-[#003152] relative overflow-hidden">
        <img
          src={imageUrl}
          alt={property.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            // Fallback to a default image if the URL fails to load
            e.target.src = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80';
          }}
        />
        {property.available_units > 0 && (
          <span className="absolute top-3 right-3 bg-[#99CC33] text-[#003152] px-3 py-1 rounded-full text-sm font-semibold">
            {property.available_units} Available
          </span>
        )}
      </div>

      {/* Property Details */}
      <div className="p-5 flex-1 flex flex-col">
        {/* Area Badge - Prominent Display */}
        <div className="mb-2">
          <span className="inline-block bg-[#003152] text-white px-3 py-1 rounded-full text-sm font-semibold">
            📍 {property.area || property.city}
          </span>
        </div>
        
        <h3 className="text-xl font-bold text-[#003152] mb-2 line-clamp-1">
          {property.name}
        </h3>
        
        <div className="flex items-start text-[#003333] mb-3">
          <svg className="w-4 h-4 mr-1 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="text-sm line-clamp-2">{property.address}</span>
        </div>

        <div className="flex items-center gap-4 text-sm text-[#003333] mb-4">
          <span className="capitalize bg-[#ADDFF1] px-2 py-1 rounded">
            {property.property_type}
          </span>
        </div>

        {property.description && (
          <p className="text-sm text-gray-600 mb-4 line-clamp-2">
            {property.description}
          </p>
        )}

        <div className="mt-auto pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-[#003333]">Starting from</p>
              <p className="text-2xl font-bold text-[#003152]">
                {property.min_rent ? `${property.min_rent.toLocaleString()} TZS` : 'N/A'}
                <span className="text-sm font-normal text-[#003333]">/mo</span>
              </p>
            </div>
            <span className="text-[#99CC33] font-semibold hover:text-[#88BB22] transition-colors">
              View Details →
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Marketplace;
