import { useState } from 'react';
import { useStore, availableUnits, minRent } from '../store/StoreContext';
import StatusBadge from '../components/StatusBadge';
import { AREAS, formatTZS } from '../data/mockData';

const emptyProperty = {
  name: '', property_type: 'apartment', area: 'Magomeni',
  address: '', description: '', amenities: '',
};

const emptyUnit = { unit_number: '', bedrooms: 2, bathrooms: 1, rent_amount: 300000 };

const LandlordProperties = () => {
  const { state, dispatch } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyProperty);
  const [unitDrafts, setUnitDrafts] = useState([{ ...emptyUnit }]);
  const [managingUnits, setManagingUnits] = useState(null);
  const [unitForm, setUnitForm] = useState(emptyUnit);
  const [editingUnit, setEditingUnit] = useState(null);

  const openAdd = () => {
    setEditing(null);
    setForm(emptyProperty);
    setUnitDrafts([{ ...emptyUnit }]);
    setShowForm(true);
  };

  const openEdit = (p) => {
    setEditing(p.id);
    setForm({
      name: p.name, property_type: p.property_type, area: p.area,
      address: p.address, description: p.description, amenities: p.amenities,
    });
    setUnitDrafts([]);
    setShowForm(true);
  };

  const saveProperty = (e) => {
    e.preventDefault();
    if (editing) {
      dispatch({ type: 'UPDATE_PROPERTY', payload: { id: editing, data: form } });
    } else {
      const units = unitDrafts
        .filter((u) => u.unit_number.trim() && Number(u.rent_amount) > 0)
        .map((u) => ({ ...u, bedrooms: Number(u.bedrooms), bathrooms: Number(u.bathrooms), rent_amount: Number(u.rent_amount) }));
      if (units.length === 0) {
        alert('Add at least one unit with a number and rent amount.');
        return;
      }
      dispatch({ type: 'ADD_PROPERTY', payload: { ...form, units } });
    }
    setShowForm(false);
  };

  const saveUnit = (e) => {
    e.preventDefault();
    if (!managingUnits) return;
    const data = {
      ...unitForm,
      bedrooms: Number(unitForm.bedrooms),
      bathrooms: Number(unitForm.bathrooms),
      rent_amount: Number(unitForm.rent_amount),
    };
    if (editingUnit) {
      dispatch({ type: 'UPDATE_UNIT', payload: { propertyId: managingUnits, unitId: editingUnit, data } });
    } else {
      dispatch({ type: 'ADD_UNIT', payload: { propertyId: managingUnits, unit: data } });
    }
    setUnitForm(emptyUnit);
    setEditingUnit(null);
  };

  const managed = managingUnits ? state.properties.find((p) => p.id === managingUnits) : null;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex flex-wrap justify-between items-end gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-[#003152] mb-2">My Properties</h1>
            <p className="text-[#003333]">Add listings, edit details, and manage units</p>
          </div>
          <button
            onClick={openAdd}
            className="px-5 py-2.5 bg-[#99CC33] text-[#003152] font-semibold rounded-lg hover:bg-[#88BB22]"
          >
            + Add Property
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {state.properties.map((p) => (
            <div key={p.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="flex">
                <img src={p.image} alt={p.name} className="w-32 sm:w-44 object-cover" />
                <div className="p-4 flex-1">
                  <h3 className="font-bold text-[#003152] text-lg">{p.name}</h3>
                  <p className="text-sm text-gray-500">📍 {p.area} • <span className="capitalize">{p.property_type}</span></p>
                  <p className="text-sm text-[#003333] mt-1">
                    {p.units.length} units • {availableUnits(p).length} available • from {formatTZS(minRent(p))}
                  </p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    <button
                      onClick={() => { setManagingUnits(p.id); setUnitForm(emptyUnit); setEditingUnit(null); }}
                      className="px-3 py-1.5 bg-[#003152] text-white text-sm rounded-lg hover:bg-[#003333]"
                    >
                      Units
                    </button>
                    <button
                      onClick={() => openEdit(p)}
                      className="px-3 py-1.5 bg-gray-200 text-[#003333] text-sm rounded-lg hover:bg-gray-300"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm(`Delete "${p.name}" and its pending applications?`)) {
                          dispatch({ type: 'DELETE_PROPERTY', payload: { id: p.id } });
                        }
                      }}
                      className="px-3 py-1.5 bg-red-100 text-red-700 text-sm rounded-lg hover:bg-red-200"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Property form modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center p-4 z-50 overflow-y-auto">
          <form onSubmit={saveProperty} className="bg-white rounded-xl shadow-2xl p-6 sm:p-8 w-full max-w-2xl my-8">
            <h3 className="text-xl font-bold text-[#003152] mb-4">
              {editing ? 'Edit Property' : 'Add New Property'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="md:col-span-2">
                <label className="label">Property name</label>
                <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field" placeholder="e.g. Magomeni Modern Apartments" />
              </div>
              <div>
                <label className="label">Type</label>
                <select value={form.property_type} onChange={(e) => setForm({ ...form, property_type: e.target.value })} className="input-field">
                  <option value="apartment">Apartment</option>
                  <option value="house">House</option>
                  <option value="room">Room</option>
                </select>
              </div>
              <div>
                <label className="label">Area</label>
                <select value={form.area} onChange={(e) => setForm({ ...form, area: e.target.value })} className="input-field">
                  {AREAS.map((a) => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="label">Address</label>
                <input required value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="input-field" />
              </div>
              <div className="md:col-span-2">
                <label className="label">Description</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input-field" rows={3} />
              </div>
              <div className="md:col-span-2">
                <label className="label">Amenities</label>
                <input value={form.amenities} onChange={(e) => setForm({ ...form, amenities: e.target.value })} className="input-field" placeholder="Water, Electricity, Parking…" />
              </div>
            </div>

            {!editing && (
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-bold text-[#003152]">Units</h4>
                  <button type="button" onClick={() => setUnitDrafts([...unitDrafts, { ...emptyUnit }])} className="text-sm text-[#99CC33] font-semibold">
                    + Add unit
                  </button>
                </div>
                {unitDrafts.map((u, i) => (
                  <div key={i} className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-2">
                    <input placeholder="No." value={u.unit_number} onChange={(e) => setUnitDrafts(unitDrafts.map((x, j) => j === i ? { ...x, unit_number: e.target.value } : x))} className="input-field" />
                    <input type="number" min="0" placeholder="Beds" value={u.bedrooms} onChange={(e) => setUnitDrafts(unitDrafts.map((x, j) => j === i ? { ...x, bedrooms: e.target.value } : x))} className="input-field" />
                    <input type="number" min="0" placeholder="Baths" value={u.bathrooms} onChange={(e) => setUnitDrafts(unitDrafts.map((x, j) => j === i ? { ...x, bathrooms: e.target.value } : x))} className="input-field" />
                    <input type="number" min="0" placeholder="Rent TZS" value={u.rent_amount} onChange={(e) => setUnitDrafts(unitDrafts.map((x, j) => j === i ? { ...x, rent_amount: e.target.value } : x))} className="input-field" />
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-3">
              <button type="button" onClick={() => setShowForm(false)} className="flex-1 px-4 py-2 bg-gray-200 text-[#003333] rounded-lg hover:bg-gray-300 font-medium">
                Cancel
              </button>
              <button type="submit" className="flex-1 px-4 py-2 bg-[#99CC33] text-[#003152] rounded-lg hover:bg-[#88BB22] font-bold">
                {editing ? 'Save Changes' : 'Publish Property'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Units modal */}
      {managed && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl p-6 sm:p-8 w-full max-w-2xl my-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-[#003152]">Units — {managed.name}</h3>
              <button onClick={() => setManagingUnits(null)} className="text-gray-500 hover:text-gray-800 text-xl">✕</button>
            </div>

            <div className="space-y-2 mb-6">
              {managed.units.map((u) => (
                <div key={u.id} className="flex flex-wrap justify-between items-center border rounded-lg px-4 py-2.5 gap-2">
                  <div>
                    <span className="font-bold text-[#003152]">Unit {u.unit_number}</span>
                    <span className="text-sm text-gray-500 ml-2">{u.bedrooms} bed • {u.bathrooms} bath • {formatTZS(u.rent_amount)}/mo</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={u.status} />
                    <button
                      onClick={() => { setEditingUnit(u.id); setUnitForm({ unit_number: u.unit_number, bedrooms: u.bedrooms, bathrooms: u.bathrooms, rent_amount: u.rent_amount }); }}
                      className="text-sm px-3 py-1 bg-gray-200 rounded-lg hover:bg-gray-300"
                    >
                      Edit
                    </button>
                    <select
                      value={u.status}
                      onChange={(e) => dispatch({ type: 'UPDATE_UNIT', payload: { propertyId: managed.id, unitId: u.id, data: { status: e.target.value } } })}
                      className="text-sm border rounded-lg px-2 py-1"
                    >
                      <option value="AVAILABLE">AVAILABLE</option>
                      <option value="OCCUPIED">OCCUPIED</option>
                    </select>
                    <button
                      onClick={() => dispatch({ type: 'DELETE_UNIT', payload: { propertyId: managed.id, unitId: u.id } })}
                      className="text-sm px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={saveUnit} className="border-t pt-4">
              <h4 className="font-bold text-[#003152] mb-2">{editingUnit ? 'Edit Unit' : 'Add Unit'}</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
                <input required placeholder="No." value={unitForm.unit_number} onChange={(e) => setUnitForm({ ...unitForm, unit_number: e.target.value })} className="input-field" />
                <input type="number" min="0" placeholder="Beds" value={unitForm.bedrooms} onChange={(e) => setUnitForm({ ...unitForm, bedrooms: e.target.value })} className="input-field" />
                <input type="number" min="0" placeholder="Baths" value={unitForm.bathrooms} onChange={(e) => setUnitForm({ ...unitForm, bathrooms: e.target.value })} className="input-field" />
                <input type="number" min="0" placeholder="Rent TZS" value={unitForm.rent_amount} onChange={(e) => setUnitForm({ ...unitForm, rent_amount: e.target.value })} className="input-field" />
              </div>
              <button type="submit" className="px-5 py-2 bg-[#003152] text-white rounded-lg hover:bg-[#003333] font-medium text-sm">
                {editingUnit ? 'Save Unit' : 'Add Unit'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LandlordProperties;
