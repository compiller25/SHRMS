import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useStore, availableUnits } from '../store/StoreContext';
import { formatTZS } from '../data/mockData';

const PropertyDetail = () => {
  const { id } = useParams();
  const { state, dispatch } = useStore();
  const property = state.properties.find((p) => String(p.id) === String(id));

  const [selectedUnit, setSelectedUnit] = useState(null);
  const [form, setForm] = useState({
    applicant: '',
    phone: '',
    move_in_date: new Date().toISOString().slice(0, 10),
    lease_duration: '12',
    terms_accepted: false,
  });
  const [submitted, setSubmitted] = useState(false);

  if (!property) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <h2 className="text-2xl font-bold text-[#003152] mb-4">Property not found</h2>
          <Link to="/marketplace" className="text-[#99CC33] font-semibold">
            ← Back to Marketplace
          </Link>
        </div>
      </div>
    );
  }

  const units = availableUnits(property);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedUnit || !form.terms_accepted || !form.applicant.trim() || !form.phone.trim()) return;
    dispatch({
      type: 'APPLY',
      payload: {
        propertyId: property.id,
        unitId: selectedUnit.id,
        applicant: form.applicant.trim(),
        phone: form.phone.trim(),
        moveInDate: form.move_in_date,
        leaseDuration: form.lease_duration,
      },
    });
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <Link to="/marketplace" className="inline-block mb-6 text-[#003152] font-semibold hover:text-[#99CC33]">
          ← Back to Marketplace
        </Link>

        {/* Header */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
          <img src={property.image} alt={property.name} className="w-full h-72 sm:h-96 object-cover" />
          <div className="p-6 sm:p-8">
            <span className="inline-block bg-[#003152] text-white px-3 py-1 rounded-full text-sm font-semibold mb-3">
              📍 {property.area}, {property.city}
            </span>
            <h1 className="text-3xl sm:text-4xl font-bold text-[#003152] mb-2">{property.name}</h1>
            <p className="text-[#003333] mb-4">{property.address}</p>
            <p className="text-gray-600 mb-4">{property.description}</p>
            <div className="flex flex-wrap gap-2">
              <span className="capitalize bg-[#ADDFF1] px-3 py-1 rounded text-sm">{property.property_type}</span>
              <span className="bg-gray-100 px-3 py-1 rounded text-sm">{property.amenities}</span>
            </div>
          </div>
        </div>

        {/* Units */}
        <div className="bg-white rounded-lg shadow-md p-6 sm:p-8 mb-8">
          <h2 className="text-2xl font-bold text-[#003152] mb-4">Available Units</h2>
          {units.length === 0 ? (
            <p className="text-gray-500">All units in this property are currently occupied. Check back soon.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {units.map((unit) => (
                <button
                  key={unit.id}
                  onClick={() => { setSelectedUnit(unit); setSubmitted(false); }}
                  className={`text-left border-2 rounded-lg p-4 transition ${
                    selectedUnit?.id === unit.id
                      ? 'border-[#99CC33] bg-lime-50'
                      : 'border-gray-200 hover:border-[#ADDFF1]'
                  }`}
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-[#003152] text-lg">Unit {unit.unit_number}</span>
                    <span className="bg-[#99CC33] text-[#003152] px-2 py-0.5 rounded-full text-xs font-semibold">
                      AVAILABLE
                    </span>
                  </div>
                  <p className="text-sm text-[#003333]">
                    {unit.bedrooms} bed • {unit.bathrooms} bath
                  </p>
                  <p className="text-xl font-bold text-[#003152] mt-1">
                    {formatTZS(unit.rent_amount)}<span className="text-sm font-normal">/mo</span>
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Application */}
        {selectedUnit && (
          <div className="bg-white rounded-lg shadow-md p-6 sm:p-8">
            <h2 className="text-2xl font-bold text-[#003152] mb-4">
              Apply for Unit {selectedUnit.unit_number}
            </h2>
            {submitted ? (
              <div className="bg-green-50 border border-green-200 text-green-800 px-6 py-8 rounded-lg text-center">
                <div className="text-4xl mb-3">✅</div>
                <h3 className="text-xl font-bold mb-2">Application submitted!</h3>
                <p className="mb-4">
                  Your application for Unit {selectedUnit.unit_number} has been sent to the landlord.
                  Track its progress under{' '}
                  <Link to="/tenant/applications" className="font-semibold underline">
                    My Applications
                  </Link>
                  .
                </p>
                <button
                  onClick={() => { setSubmitted(false); setSelectedUnit(null); }}
                  className="px-6 py-2 bg-[#003152] text-white rounded-lg hover:bg-[#003333] font-medium"
                >
                  Apply for another unit
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label">Full name</label>
                  <input
                    type="text"
                    required
                    value={form.applicant}
                    onChange={(e) => setForm({ ...form, applicant: e.target.value })}
                    placeholder="e.g. Amina Juma"
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="label">Phone number</label>
                  <input
                    type="tel"
                    required
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="e.g. +255 713 000 000"
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="label">Move-in date</label>
                  <input
                    type="date"
                    required
                    value={form.move_in_date}
                    onChange={(e) => setForm({ ...form, move_in_date: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="label">Lease duration</label>
                  <select
                    value={form.lease_duration}
                    onChange={(e) => setForm({ ...form, lease_duration: e.target.value })}
                    className="input-field"
                  >
                    <option value="6">6 months</option>
                    <option value="12">12 months</option>
                    <option value="24">24 months</option>
                  </select>
                </div>
                <label className="md:col-span-2 flex items-start gap-2 text-sm text-[#003333]">
                  <input
                    type="checkbox"
                    checked={form.terms_accepted}
                    onChange={(e) => setForm({ ...form, terms_accepted: e.target.checked })}
                    className="mt-1"
                  />
                  I accept the rental terms and conditions
                </label>
                <div className="md:col-span-2">
                  <button type="submit" className="btn-secondary">
                    Submit Application
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PropertyDetail;
