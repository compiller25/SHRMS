import { useState, useEffect } from 'react';
import { propertiesAPI, unitsAPI } from '../../services/api';

const Properties = () => {
  const [properties, setProperties] = useState([]);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPropertyModal, setShowPropertyModal] = useState(false);
  const [showUnitModal, setShowUnitModal] = useState(false);

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await propertiesAPI.getAll();
      const propertiesData = Array.isArray(response.data) ? response.data : response.data.results || [];
      setProperties(propertiesData);
    } catch (err) {
      setError('Failed to load properties. Please try again later.');
      console.error('Error fetching properties:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnits = async (propertyId) => {
    try {
      const response = await unitsAPI.getAll({ property: propertyId });
      const unitsData = Array.isArray(response.data) ? response.data : response.data.results || [];
      setUnits(unitsData);
    } catch (err) {
      console.error('Error fetching units:', err);
    }
  };

  const handlePropertySelect = (property) => {
    setSelectedProperty(property);
    fetchUnits(property.id);
  };

  const handleDeleteProperty = async (propertyId) => {
    if (!window.confirm('Are you sure you want to delete this property?')) return;
    
    try {
      await propertiesAPI.delete(propertyId);
      await fetchProperties();
      if (selectedProperty?.id === propertyId) {
        setSelectedProperty(null);
        setUnits([]);
      }
    } catch (err) {
      alert('Failed to delete property. It may have active rentals.');
    }
  };

  const handleDeleteUnit = async (unitId) => {
    if (!window.confirm('Are you sure you want to delete this unit?')) return;
    
    try {
      await unitsAPI.delete(unitId);
      fetchUnits(selectedProperty.id);
      await fetchProperties();
    } catch (err) {
      alert('Failed to delete unit. It may have an active rental.');
    }
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
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-[#003152] mb-2">
              My Properties
            </h1>
            <p className="text-[#003333]">Manage your properties and units</p>
          </div>
          <button
            onClick={() => setShowPropertyModal(true)}
            className="px-6 py-3 bg-[#99CC33] text-[#003152] font-semibold rounded-lg hover:bg-[#88BB22] transition-colors shadow-md"
          >
            + Add Property
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Properties List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="bg-gradient-to-r from-[#003152] to-[#003333] p-4">
                <h2 className="text-lg font-bold text-white">Properties ({properties.length})</h2>
              </div>
              <div className="divide-y divide-gray-200 max-h-[600px] overflow-y-auto">
                {properties.length === 0 ? (
                  <div className="p-8 text-center">
                    <svg className="w-16 h-16 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    <p className="text-gray-500 text-sm">No properties yet</p>
                  </div>
                ) : (
                  properties.map((property) => (
                    <PropertyListItem
                      key={property.id}
                      property={property}
                      isSelected={selectedProperty?.id === property.id}
                      onSelect={() => handlePropertySelect(property)}
                      onDelete={() => handleDeleteProperty(property.id)}
                    />
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Units Display */}
          <div className="lg:col-span-2">
            {selectedProperty ? (
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="bg-gradient-to-r from-[#003152] to-[#003333] p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-white mb-2">
                        {selectedProperty.name}
                      </h2>
                      <p className="text-[#ADDFF1] text-sm">
                        {selectedProperty.address}, {selectedProperty.city}
                      </p>
                    </div>
                    <button
                      onClick={() => setShowUnitModal(true)}
                      className="px-4 py-2 bg-[#99CC33] text-[#003152] font-semibold rounded-lg hover:bg-[#88BB22] transition-colors"
                    >
                      + Add Unit
                    </button>
                  </div>
                </div>

                <div className="p-6">
                  {/* Property Stats */}
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="bg-[#ADDFF1] bg-opacity-20 p-4 rounded-lg">
                      <p className="text-sm text-[#003333] mb-1">Total Units</p>
                      <p className="text-2xl font-bold text-[#003152]">
                        {selectedProperty.total_units || 0}
                      </p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <p className="text-sm text-[#003333] mb-1">Occupied</p>
                      <p className="text-2xl font-bold text-green-600">
                        {(selectedProperty.total_units || 0) - (selectedProperty.available_units || 0)}
                      </p>
                    </div>
                    <div className="bg-yellow-50 p-4 rounded-lg">
                      <p className="text-sm text-[#003333] mb-1">Vacant</p>
                      <p className="text-2xl font-bold text-yellow-600">
                        {selectedProperty.available_units || 0}
                      </p>
                    </div>
                  </div>

                  {/* Units Grid */}
                  <h3 className="text-lg font-bold text-[#003152] mb-4">Units</h3>
                  {units.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-lg">
                      <svg className="w-16 h-16 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                      <p className="text-gray-500 mb-4">No units in this property</p>
                      <button
                        onClick={() => setShowUnitModal(true)}
                        className="px-4 py-2 bg-[#99CC33] text-[#003152] font-semibold rounded-lg hover:bg-[#88BB22] transition-colors"
                      >
                        Add First Unit
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {units.map((unit) => (
                        <UnitCard
                          key={unit.id}
                          unit={unit}
                          onDelete={() => handleDeleteUnit(unit.id)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <svg className="w-24 h-24 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <h3 className="text-xl font-semibold text-[#003333] mb-2">
                  Select a property
                </h3>
                <p className="text-gray-500">
                  Choose a property from the list to view and manage its units
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Modals */}
        {showPropertyModal && (
          <PropertyModal
            onClose={() => setShowPropertyModal(false)}
            onSuccess={() => {
              setShowPropertyModal(false);
              fetchProperties();
            }}
          />
        )}

        {showUnitModal && selectedProperty && (
          <UnitModal
            propertyId={selectedProperty.id}
            onClose={() => setShowUnitModal(false)}
            onSuccess={() => {
              setShowUnitModal(false);
              fetchUnits(selectedProperty.id);
              fetchProperties();
            }}
          />
        )}
      </div>
    </div>
  );
};

const PropertyModal = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    area: '',
    property_type: 'APARTMENT',
    description: '',
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0] || null;
    setImageFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      // Build multipart form so the image file is sent as an upload.
      const fd = new FormData();
      fd.append('name', formData.name);
      fd.append('address', formData.address);
      fd.append('city', formData.city);
      if (formData.area) fd.append('area', formData.area);
      fd.append('property_type', formData.property_type);
      if (formData.description) fd.append('description', formData.description);
      if (imageFile) fd.append('image', imageFile);
      await propertiesAPI.create(fd);
      onSuccess();
    } catch (err) {
      alert(err.response?.data?.image?.[0] || 'Failed to create property. Please try again.');
      console.error('Error creating property:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-[#003152] to-[#003333] p-6">
          <h2 className="text-2xl font-bold text-white">Add New Property</h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Image upload */}
          <div>
            <label className="block text-sm font-medium text-[#003333] mb-2">
              Property Image
            </label>
            <div className="flex items-center gap-4">
              <label className="flex-1 cursor-pointer flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-[#99CC33] transition-colors">
                <svg className="w-5 h-5 text-[#003333]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-sm text-[#003333]">
                  {imageFile ? imageFile.name : 'Choose an image (JPG/PNG)'}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
              {imagePreview && (
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="h-20 w-28 object-cover rounded-lg border border-gray-300"
                />
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#003333] mb-2">
              Property Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#99CC33] focus:border-transparent"
              placeholder="e.g., Sunset Apartments"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#003333] mb-2">
              Address *
            </label>
            <input
              type="text"
              required
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#99CC33] focus:border-transparent"
              placeholder="Street address"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#003333] mb-2">
                City *
              </label>
              <input
                type="text"
                required
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#99CC33] focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#003333] mb-2">
                Area / Neighbourhood
              </label>
              <input
                type="text"
                value={formData.area}
                onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#99CC33] focus:border-transparent"
                placeholder="e.g., Magomeni"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#003333] mb-2">
                Property Type *
              </label>
              <select
                required
                value={formData.property_type}
                onChange={(e) => setFormData({ ...formData, property_type: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#99CC33] focus:border-transparent"
              >
                <option value="APARTMENT">Apartment</option>
                <option value="HOUSE">House</option>
                <option value="ROOM">Room</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#003333] mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#99CC33] focus:border-transparent"
              placeholder="Describe your property..."
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={submitting}
              className={`flex-1 py-3 rounded-lg font-semibold transition-colors ${
                submitting
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-[#99CC33] text-[#003152] hover:bg-[#88BB22]'
              }`}
            >
              {submitting ? 'Creating...' : 'Create Property'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-gray-200 text-[#003333] rounded-lg hover:bg-gray-300 font-semibold transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const UnitModal = ({ propertyId, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    property: propertyId,
    unit_number: '',
    bedrooms: '',
    bathrooms: '',
    square_feet: '',
    rent_amount: '',
    status: 'AVAILABLE',
    description: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await unitsAPI.create(formData);
      onSuccess();
    } catch (err) {
      alert('Failed to create unit. Please try again.');
      console.error('Error creating unit:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-[#003152] to-[#003333] p-6">
          <h2 className="text-2xl font-bold text-white">Add New Unit</h2>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#003333] mb-2">
              Unit Number *
            </label>
            <input
              type="text"
              required
              value={formData.unit_number}
              onChange={(e) => setFormData({ ...formData, unit_number: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#99CC33] focus:border-transparent"
              placeholder="e.g., 101, A1"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#003333] mb-2">
                Bedrooms *
              </label>
              <input
                type="number"
                required
                min="0"
                value={formData.bedrooms}
                onChange={(e) => setFormData({ ...formData, bedrooms: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#99CC33] focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#003333] mb-2">
                Bathrooms *
              </label>
              <input
                type="number"
                required
                min="0"
                step="0.5"
                value={formData.bathrooms}
                onChange={(e) => setFormData({ ...formData, bathrooms: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#99CC33] focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#003333] mb-2">
                Square Feet *
              </label>
              <input
                type="number"
                required
                min="0"
                value={formData.square_feet}
                onChange={(e) => setFormData({ ...formData, square_feet: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#99CC33] focus:border-transparent"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#003333] mb-2">
                Monthly Rent *
              </label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={formData.rent_amount}
                onChange={(e) => setFormData({ ...formData, rent_amount: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#99CC33] focus:border-transparent"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#003333] mb-2">
                Status *
              </label>
              <select
                required
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#99CC33] focus:border-transparent"
              >
                <option value="AVAILABLE">Available</option>
                <option value="OCCUPIED">Occupied</option>
                <option value="MAINTENANCE">Maintenance</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#003333] mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#99CC33] focus:border-transparent"
              placeholder="Unit features and amenities..."
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={submitting}
              className={`flex-1 py-3 rounded-lg font-semibold transition-colors ${
                submitting
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-[#99CC33] text-[#003152] hover:bg-[#88BB22]'
              }`}
            >
              {submitting ? 'Creating...' : 'Create Unit'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-gray-200 text-[#003333] rounded-lg hover:bg-gray-300 font-semibold transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const PropertyListItem = ({ property, isSelected, onSelect, onDelete }) => {
  return (
    <div
      className={`p-4 cursor-pointer transition-colors ${
        isSelected ? 'bg-[#ADDFF1] bg-opacity-30' : 'hover:bg-gray-50'
      }`}
      onClick={onSelect}
    >
      {property.image && (
        <img
          src={property.image}
          alt={property.name}
          className="h-24 w-full object-cover rounded-lg mb-3 border border-gray-200"
        />
      )}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="font-semibold text-[#003152] mb-1">{property.name}</h3>
          <p className="text-sm text-[#003333] mb-2">
            {property.city} • {property.property_type}
          </p>
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span>{property.total_units || 0} units</span>
            <span className="text-green-600">{(property.total_units || 0) - (property.available_units || 0)} occupied</span>
          </div>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="text-red-500 hover:text-red-700 p-1"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  );
};

const UnitCard = ({ unit, onDelete }) => {
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'available':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'occupied':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="font-bold text-[#003152] text-lg">Unit {unit.unit_number}</h4>
          <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold border mt-1 ${getStatusColor(unit.status)}`}>
            {unit.status}
          </span>
        </div>
        <button
          onClick={onDelete}
          className="text-red-500 hover:text-red-700 p-1"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-[#003333]">Bedrooms:</span>
          <span className="font-semibold text-[#003152]">{unit.bedrooms || 'N/A'}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[#003333]">Bathrooms:</span>
          <span className="font-semibold text-[#003152]">{unit.bathrooms || 'N/A'}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[#003333]">Size:</span>
          <span className="font-semibold text-[#003152]">{unit.square_feet || 'N/A'} sq ft</span>
        </div>
        <div className="flex items-center justify-between pt-2 border-t border-gray-300">
          <span className="text-[#003333]">Rent:</span>
          <span className="font-bold text-[#003152] text-lg">{unit.rent} TZS/mo</span>
        </div>
      </div>
    </div>
  );
};

export default Properties;
