import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faTimes, faLeaf, faSignInAlt, faUserShield, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import { authService } from '../services/authService';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const checkAuthStatus = () => {
      setIsAuthenticated(authService.isAuthenticated());
      setIsAdmin(authService.isAdmin());
    };

    checkAuthStatus();
    // Check auth status on route change
    checkAuthStatus();
  }, [location]);

  const handleLogout = async () => {
    await authService.logout();
    setIsAuthenticated(false);
    setIsAdmin(false);
    setIsOpen(false);
  };

  const navigation = [
    { name: 'Ana Sayfa', href: '/', current: location.pathname === '/' },
    { name: 'Güneş Enerjisi', href: '/solar', current: location.pathname === '/solar' },
    { name: 'Rüzgar Enerjisi', href: '/wind', current: location.pathname === '/wind' },
    { name: 'Jeotermal Enerji', href: '/geothermal', current: location.pathname === '/geothermal' },
  ];

  return (
    <nav className="bg-gradient-to-r from-gray-900 to-gray-800 shadow-xl fixed w-full z-50 top-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="p-2 bg-gradient-to-r from-green-400 to-blue-500 rounded-xl group-hover:from-green-500 group-hover:to-blue-600 transition-all duration-300">
                <FontAwesomeIcon icon={faLeaf} className="text-white text-xl" />
              </div>
              <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500">
                Yenilenebilir Enerji
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                    item.current
                      ? 'text-white bg-gradient-to-r from-green-400 to-blue-500 shadow-lg'
                      : 'text-gray-300 hover:text-white hover:bg-gray-700'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                {isAdmin && (
                  <Link
                    to="/admin"
                    className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-300 shadow-lg"
                  >
                    <FontAwesomeIcon icon={faUserShield} className="mr-2" />
                    Admin Panel
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white font-medium rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-300 shadow-lg"
                >
                  <FontAwesomeIcon icon={faSignOutAlt} className="mr-2" />
                  Çıkış Yap
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-400 to-blue-500 text-white font-medium rounded-lg hover:from-green-500 hover:to-blue-600 transition-all duration-300 shadow-lg"
              >
                <FontAwesomeIcon icon={faSignInAlt} className="mr-2" />
                Admin Giriş
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white transition-colors duration-300"
            >
              <FontAwesomeIcon icon={isOpen ? faTimes : faBars} className="text-xl" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-gray-800 shadow-lg">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`block px-3 py-2 rounded-md text-base font-medium transition-colors duration-300 ${
                  item.current
                    ? 'text-white bg-gradient-to-r from-green-400 to-blue-500'
                    : 'text-gray-300 hover:text-white hover:bg-gray-700'
                }`}
                onClick={() => setIsOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            
            {/* Mobile Auth Buttons */}
            <div className="pt-4 border-t border-gray-700">
              {isAuthenticated ? (
                <>
                  {isAdmin && (
                    <Link
                      to="/admin"
                      className="block px-3 py-2 rounded-md text-base font-medium text-purple-400 hover:text-white hover:bg-gray-700 transition-colors duration-300"
                      onClick={() => setIsOpen(false)}
                    >
                      <FontAwesomeIcon icon={faUserShield} className="mr-2" />
                      Admin Panel
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-400 hover:text-white hover:bg-gray-700 transition-colors duration-300"
                  >
                    <FontAwesomeIcon icon={faSignOutAlt} className="mr-2" />
                    Çıkış Yap
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  className="block px-3 py-2 rounded-md text-base font-medium text-green-400 hover:text-white hover:bg-gray-700 transition-colors duration-300"
                  onClick={() => setIsOpen(false)}
                >
                  <FontAwesomeIcon icon={faSignInAlt} className="mr-2" />
                  Admin Giriş
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar; 