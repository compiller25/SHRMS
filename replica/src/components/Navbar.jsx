import { Link, useLocation } from 'react-router-dom';
import logo from '../assets/logo.jpeg';

const tenantLinks = [
  { to: '/tenant', label: 'Dashboard' },
  { to: '/marketplace', label: 'Marketplace' },
  { to: '/tenant/applications', label: 'My Applications' },
  { to: '/tenant/rentals', label: 'My Rentals' },
  { to: '/tenant/payments', label: 'Payments' },
];

const landlordLinks = [
  { to: '/landlord', label: 'Dashboard' },
  { to: '/landlord/properties', label: 'Properties' },
  { to: '/landlord/agreements', label: 'Agreements' },
];

const Dropdown = ({ label, links, active }) => (
  <div className="relative group">
    <button
      className={`transition hover:text-lime-green py-1 ${active ? 'text-lime-green font-semibold' : ''}`}
    >
      {label} ▾
    </button>
    <div className="absolute left-0 top-full pt-2 hidden group-hover:block z-50">
      <div className="bg-white text-primary-blue rounded-lg shadow-xl py-2 w-48">
        {links.map((l) => (
          <Link
            key={l.to}
            to={l.to}
            className="block px-4 py-2 text-sm hover:bg-gray-100 hover:text-lime-green"
          >
            {l.label}
          </Link>
        ))}
      </div>
    </div>
  </div>
);

const Navbar = () => {
  const { pathname } = useLocation();
  const tenantActive = pathname.startsWith('/tenant') || pathname.startsWith('/marketplace');
  const landlordActive = pathname.startsWith('/landlord');

  return (
    <nav className="bg-primary-blue text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <Link to="/" className="flex items-center space-x-3">
            <img
              src={logo}
              alt="House Rental Logo"
              className="w-10 h-10 rounded-full object-cover"
            />
            <div>
              <div className="text-xl font-bold">House Rental</div>
              <div className="text-xs text-light-blue">Magomeni, Dar es Salaam</div>
            </div>
          </Link>

          <div className="hidden md:flex items-center space-x-6">
            <Link
              to="/"
              className={`transition hover:text-lime-green ${pathname === '/' ? 'text-lime-green font-semibold' : ''}`}
            >
              Home
            </Link>
            <Dropdown label="Tenant" links={tenantLinks} active={tenantActive} />
            <Dropdown label="Landlord" links={landlordLinks} active={landlordActive} />
            <Link
              to="/admin"
              className={`transition hover:text-lime-green ${pathname === '/admin' ? 'text-lime-green font-semibold' : ''}`}
            >
              Admin
            </Link>
          </div>

          {/* Mobile links */}
          <div className="flex md:hidden items-center space-x-4 text-sm">
            <Link to="/marketplace" className="hover:text-lime-green transition">
              Browse
            </Link>
            <Link to="/landlord" className="hover:text-lime-green transition">
              Landlord
            </Link>
            <Link to="/tenant" className="hover:text-lime-green transition">
              Tenant
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
