import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore, availableUnits, minRent } from '../store/StoreContext';
import { AREAS, formatTZS } from '../data/mockData';

const Marketplace = () => {
  const { state } = useStore();
  const [filters, setFilters] = useState({
    search: '',
    area: '',
    min_price: '',
    max_price: '',
    bedrooms: '',
    property_type: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleReset = () => {
    setFilters({ search: '', area: '', min_price: '', max_price: '', bedrooms: '', property_type: '' });
  };

  const properties = useMemo(() => {
    return state.properties.filter((p) => {
      if (filters.search) {
        const q = filters.search.toLowerCase();
        if (!`${p.name} ${p.address} ${p.area}`.toLowerCase().includes(q)) return false;
      }
      if (filters.area && p.area !== filters.area) return false;
      if (filters.property_type && p.property_type !== filters.property_type) return false;
      const min = minRent(p);
      if (filters.min_price && min < Number(filters.min_price)) return false;
      if (filters.max_price && min > Number(filters.max_price)) return false;
      if (filters.bedrooms) {
        const minBed = Number(filters.bedrooms);
        if (!p.units.some((u) => u.bedrooms >= minBed)) return false;
      }
      return true;
    });
  }, [filters, state.properties]);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-[#003152] mb-2">
            Property Marketplace
          </h1>
          <p className="text-[#003333]">Find your perfect rental home</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-[#003333] mb-2">Search</label>
              <input
                type="text"
                name="search"
                value={filters.search}
                onChange={handleChange}
                placeholder="Property name or address..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#99CC33] focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#003333] mb-2">Area in Dar es Salaam</label>
              <select
                name="area"
                value={filters.area}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#99CC33] focus:border-transparent"
              >
                <option value="">All Areas</option>
                {AREAS.map((area) => (
                  <option key={area} value={area}>{area}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#003333] mb-2">Property Type</label>
              <select
                name="property_type"
                value={filters.property_type}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#99CC33] focus:border-transparent"
              >
                <option value="">All Types</option>
                <option value="apartment">Apartment</option>
                <option value="house">House</option>
                <option value="room">Room</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#003333] mb-2">Min Price</label>
              <input
                type="number"
                name="min_price"
                value={filters.min_price}
                onChange={handleChange}
                placeholder="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#99CC33] focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#003333] mb-2">Max Price</label>
              <input
                type="number"
                name="max_price"
                value={filters.max_price}
                onChange={handleChange}
                placeholder="Any"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#99CC33] focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#003333] mb-2">Bedrooms</label>
              <select
                name="bedrooms"
                value={filters.bedrooms}
                onChange={handleChange}
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
          <div className="flex gap-4">
            <span className="px-6 py-2 bg-[#003152] text-white rounded-lg font-medium">
              Filters apply instantly
            </span>
            <button
              type="button"
              onClick={handleReset}
              className="px-6 py-2 bg-gray-200 text-[#003333] rounded-lg hover:bg-gray-300 transition-colors duration-200 font-medium"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-4">
          <p className="text-[#003333]">
            Found <span className="font-semibold text-[#003152]">{properties.length}</span>{' '}
            {properties.length === 1 ? 'property' : 'properties'}
          </p>
        </div>

        {properties.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <h3 className="text-2xl font-semibold text-[#003333] mb-2">No Properties Found</h3>
            <p className="text-gray-500">Try adjusting your filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {properties.map((property) => {
              const avail = availableUnits(property).length;
              return (
              <Link
                key={property.id}
                to={`/marketplace/property/${property.id}`}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 flex flex-col"
              >
                <div className="h-48 relative overflow-hidden bg-gradient-to-br from-[#ADDFF1] to-[#003152]">
                  <img src={property.image} alt={property.name} className="w-full h-full object-cover" loading="lazy" />
                  {avail > 0 && (
                    <span className="absolute top-3 right-3 bg-[#99CC33] text-[#003152] px-3 py-1 rounded-full text-sm font-semibold">
                      {avail} Available
                    </span>
                  )}
                </div>
                <div className="p-5 flex-1 flex flex-col">
                  <div className="mb-2">
                    <span className="inline-block bg-[#003152] text-white px-3 py-1 rounded-full text-sm font-semibold">
                      📍 {property.area || property.city}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-[#003152] mb-2 line-clamp-1">{property.name}</h3>
                  <p className="text-sm text-[#003333] mb-3 line-clamp-2">{property.address}</p>
                  <div className="flex items-center gap-4 text-sm text-[#003333] mb-4">
                    <span className="capitalize bg-[#ADDFF1] px-2 py-1 rounded">{property.property_type}</span>
                  </div>
                  {property.description && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">{property.description}</p>
                  )}
                  <div className="mt-auto pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-[#003333]">Starting from</p>
                        <p className="text-2xl font-bold text-[#003152]">
                          {formatTZS(minRent(property))}
                          <span className="text-sm font-normal text-[#003333]">/mo</span>
                        </p>
                      </div>
                      <span className="text-[#99CC33] font-semibold">View Details →</span>
                    </div>
                  </div>
                </div>
              </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Marketplace;
