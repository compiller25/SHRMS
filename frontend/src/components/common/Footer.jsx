import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../../assets/images/logo.jpeg';

const Footer = () => {
  return (
    <footer className="bg-dark-teal text-white mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Logo and Description */}
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <img 
                src={logo} 
                alt="House Rental Logo" 
                className="w-10 h-10 rounded-full object-cover"
              />
              <div>
                <div className="text-lg font-bold">House Rental</div>
                <div className="text-xs text-light-blue">Magomeni, Dar es Salaam</div>
              </div>
            </div>
            <p className="text-sm text-gray-300">
              Modern property management platform serving the Magomeni community
              with trust, efficiency, and accessibility.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-lg mb-4 text-lime-green">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/marketplace" className="hover:text-lime-green transition">
                  Browse Properties
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-lime-green transition">
                  Register
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-lime-green transition">
                  Login
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-semibold text-lg mb-4 text-lime-green">Contact Us</h3>
            <ul className="space-y-2 text-sm">
              <li>📍 Magomeni, Dar es Salaam, Tanzania</li>
              <li>📞 +255 712 345 678</li>
              <li>✉️ info@smartrental.co.tz</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-primary-blue mt-8 pt-6 text-center text-sm text-gray-300">
          <p>&copy; 2026 House Rental System. All rights reserved.</p>
          <p className="mt-2">
            Developed for Dar es Salaam Institute of Technology
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
