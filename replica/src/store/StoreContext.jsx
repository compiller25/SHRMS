import { createContext, useContext, useEffect, useMemo, useReducer } from 'react';
import { PROPERTIES, APPLICATIONS, PAYMENTS, PROPERTY_IMAGE_POOL } from '../data/mockData';

const STORAGE_KEY = 'smrs-replica-state-v1';

const todayISO = () => new Date().toISOString().slice(0, 10);
const inDays = (n) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
};

function seed() {
  return {
    properties: PROPERTIES.map((p) => ({ ...p, units: p.units.map((u) => ({ ...u })) })),
    applications: APPLICATIONS.map((a) => ({
      ...a,
      phone: '',
      moveInDate: a.date,
      leaseDuration: '12',
      reason: '',
    })),
    payments: PAYMENTS.map((p) => ({ ...p, dueDate: p.date })),
    seq: { application: 100, payment: 100, property: 100, unit: 1000 },
  };
}

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return seed();
    const parsed = JSON.parse(raw);
    if (!parsed.properties || !parsed.applications || !parsed.payments) return seed();
    return parsed;
  } catch {
    return seed();
  }
}

function imageFor(type, id) {
  const pool = PROPERTY_IMAGE_POOL[type] || PROPERTY_IMAGE_POOL.apartment;
  return pool[id % pool.length];
}

function reducer(state, action) {
  switch (action.type) {
    case 'APPLY': {
      const { propertyId, unitId, applicant, phone, moveInDate, leaseDuration } = action.payload;
      const property = state.properties.find((p) => p.id === propertyId);
      const unit = property?.units.find((u) => u.id === unitId);
      if (!property || !unit || unit.status !== 'AVAILABLE') return state;
      const id = state.seq.application + 1;
      return {
        ...state,
        seq: { ...state.seq, application: id },
        applications: [
          {
            id,
            applicant,
            phone,
            propertyId,
            property: property.name,
            unit: unit.unit_number,
            unitId: unit.id,
            rent: unit.rent_amount,
            moveInDate,
            leaseDuration,
            status: 'APPLIED',
            date: todayISO(),
            reason: '',
          },
          ...state.applications,
        ],
      };
    }
    case 'WITHDRAW': {
      return {
        ...state,
        applications: state.applications.filter((a) => a.id !== action.payload.id),
      };
    }
    case 'DECIDE': {
      const { id, decision, reason } = action.payload;
      return {
        ...state,
        applications: state.applications.map((a) =>
          a.id === id ? { ...a, status: decision, reason: reason || '' } : a,
        ),
      };
    }
    case 'ACTIVATE': {
      const app = state.applications.find((a) => a.id === action.payload.id);
      if (!app) return state;
      const payId = state.seq.payment + 1;
      return {
        ...state,
        seq: { ...state.seq, payment: payId },
        properties: state.properties.map((p) =>
          p.id === app.propertyId
            ? { ...p, units: p.units.map((u) => (u.id === app.unitId ? { ...u, status: 'OCCUPIED' } : u)) }
            : p,
        ),
        applications: state.applications.map((a) => (a.id === app.id ? { ...a, status: 'ACTIVE' } : a)),
        payments: [
          {
            id: payId,
            tenant: app.applicant,
            property: app.property,
            unit: app.unit,
            amount: app.rent,
            status: 'PENDING',
            date: todayISO(),
            dueDate: inDays(30),
            method: 'M-Pesa',
          },
          ...state.payments,
        ],
      };
    }
    case 'TERMINATE': {
      const app = state.applications.find((a) => a.id === action.payload.id);
      if (!app) return state;
      return {
        ...state,
        properties: state.properties.map((p) =>
          p.id === app.propertyId
            ? { ...p, units: p.units.map((u) => (u.id === app.unitId ? { ...u, status: 'AVAILABLE' } : u)) }
            : p,
        ),
        applications: state.applications.map((a) =>
          a.id === app.id ? { ...a, status: 'TERMINATED' } : a,
        ),
      };
    }
    case 'PAY': {
      const { id, method } = action.payload;
      return {
        ...state,
        payments: state.payments.map((p) =>
          p.id === id ? { ...p, status: 'PAID', method, date: todayISO() } : p,
        ),
      };
    }
    case 'ADD_PROPERTY': {
      const id = state.seq.property + 1;
      const data = action.payload;
      let unitSeq = state.seq.unit;
      const units = data.units.map((u) => ({ ...u, id: ++unitSeq, status: 'AVAILABLE' }));
      return {
        ...state,
        seq: { ...state.seq, property: id, unit: unitSeq },
        properties: [
          ...state.properties,
          {
            id,
            name: data.name,
            property_type: data.property_type,
            area: data.area,
            city: 'Dar es Salaam',
            address: data.address,
            description: data.description,
            amenities: data.amenities,
            image: imageFor(data.property_type, id),
            units,
          },
        ],
      };
    }
    case 'UPDATE_PROPERTY': {
      const { id, data } = action.payload;
      return {
        ...state,
        properties: state.properties.map((p) => (p.id === id ? { ...p, ...data } : p)),
      };
    }
    case 'DELETE_PROPERTY': {
      const { id } = action.payload;
      return {
        ...state,
        properties: state.properties.filter((p) => p.id !== id),
        applications: state.applications.filter(
          (a) => !(a.propertyId === id && ['APPLIED', 'APPROVED'].includes(a.status)),
        ),
      };
    }
    case 'ADD_UNIT': {
      const { propertyId, unit } = action.payload;
      const id = state.seq.unit + 1;
      return {
        ...state,
        seq: { ...state.seq, unit: id },
        properties: state.properties.map((p) =>
          p.id === propertyId ? { ...p, units: [...p.units, { ...unit, id, status: 'AVAILABLE' }] } : p,
        ),
      };
    }
    case 'UPDATE_UNIT': {
      const { propertyId, unitId, data } = action.payload;
      return {
        ...state,
        properties: state.properties.map((p) =>
          p.id === propertyId
            ? { ...p, units: p.units.map((u) => (u.id === unitId ? { ...u, ...data } : u)) }
            : p,
        ),
      };
    }
    case 'DELETE_UNIT': {
      const { propertyId, unitId } = action.payload;
      return {
        ...state,
        properties: state.properties.map((p) =>
          p.id === propertyId ? { ...p, units: p.units.filter((u) => u.id !== unitId) } : p,
        ),
      };
    }
    case 'RESET':
      return seed();
    default:
      return state;
  }
}

const StoreContext = createContext(null);

export function StoreProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, undefined, load);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* storage unavailable — state still works in memory */
    }
  }, [state]);

  const value = useMemo(() => ({ state, dispatch }), [state]);
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}

// Derived helpers
export const availableUnits = (p) => p.units.filter((u) => u.status === 'AVAILABLE');
export const minRent = (p) =>
  p.units.length ? Math.min(...p.units.map((u) => Number(u.rent_amount))) : 0;
