import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import logo from '../../assets/images/logo.jpeg';
import { LayoutDashboard, Search, LogOut } from 'lucide-react';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getDashboardLink = () => {
    if (user?.role === 'LANDLORD') return '/landlord/dashboard';
    if (user?.role === 'TENANT') return '/tenant/dashboard';
    if (user?.role === 'ADMIN') return '/admin/dashboard';
    return '/';
  };

  return (
    <nav className="bg-primary-blue text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
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

          {/* Navigation Links */}
          <div className="flex items-center space-x-6">
            {!isAuthenticated ? (
              <>
                <Link to="/" className="hover:text-lime-green transition">
                  Home
                </Link>
                <Link to="/marketplace" className="hover:text-lime-green transition">
                  Browse Properties
                </Link>
                <Link to="/login" className="hover:text-lime-green transition">
                  Login
                </Link>
                <Link 
                  to="/register" 
                  className="bg-lime-green text-white px-4 py-2 rounded-lg hover:bg-opacity-90 transition"
                >
                  Register
                </Link>
              </>
            ) : (
              <>
                <Link to={getDashboardLink()} className="hover:text-lime-green transition">
                  Dashboard
                </Link>
                {user?.role === 'TENANT' && (
                  <Link to="/tenant/marketplace" className="hover:text-lime-green transition">
                    Marketplace
                  </Link>
                )}
                <div className="flex items-center space-x-4">
                  <div className="text-sm">
                    <div className="font-semibold">{user?.first_name} {user?.last_name}</div>
                    <div className="text-xs text-lime-green">{user?.role}</div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="bg-dark-teal px-4 py-2 rounded-lg hover:bg-opacity-80 transition"
                  >
                    Logout
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
