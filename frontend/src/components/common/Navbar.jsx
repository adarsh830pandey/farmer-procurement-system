import React, { useState } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLang } from '../../context/LanguageAndAccessibilityContext';
import { Menu, X, Home, Calendar, Users, Activity, CreditCard, User, Info, Building2, HelpCircle } from 'lucide-react';

export const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isAuthenticated, isFarmer, isAdmin } = useAuth();
  const { t, lang } = useLang();
  const location = useLocation();

  const isPublicPage = !location.pathname.startsWith('/farmer') && !location.pathname.startsWith('/admin');

  // Navigation Links for Public View
  const publicNavLinks = [
    { name: t('home'), path: '/' },
    { name: t('aboutUs'), path: '/#about' },
    { name: t('procurementCentres'), path: '/#centres' },
    { name: t('howItWorks'), path: '/#how-it-works' },
    { name: t('farmerServices'), path: '/#services' },
    { name: t('helpSupport'), path: '/#help' },
    { name: t('contactUs'), path: '/#contact' },
  ];

  // Navigation Links for Logged-in Farmer
  const farmerNavLinks = [
    { name: t('dashboard'), path: '/farmer/dashboard', icon: Home },
    { name: t('bookSlot'), path: '/farmer/book-slot', icon: Calendar },
    { name: t('myQueue'), path: '/farmer/queue', icon: Users },
    { name: t('procurementStatus'), path: '/farmer/status', icon: Activity },
    { name: t('payments'), path: '/farmer/payments', icon: CreditCard },
    { name: t('profile'), path: '/farmer/profile', icon: User },
  ];

  // Navigation Links for Logged-in Admin
  const adminNavLinks = [
    { name: 'Admin Dashboard', path: '/admin/dashboard', icon: Home },
    { name: 'Live Queue', path: '/admin/queue', icon: Users },
    { name: 'Slot Management', path: '/admin/slots', icon: Calendar },
    { name: 'Procurement Entry', path: '/admin/procurement', icon: Activity },
    { name: 'Payments (DBT)', path: '/admin/payments', icon: CreditCard },
    { name: 'Farmer Directory', path: '/admin/farmers', icon: Building2 },
  ];

  let currentNavLinks = publicNavLinks;
  if (isAuthenticated && isFarmer && !isPublicPage) {
    currentNavLinks = farmerNavLinks;
  } else if (isAuthenticated && isAdmin && !isPublicPage) {
    currentNavLinks = adminNavLinks;
  }

  return (
    <nav className="bg-gov-navy text-white shadow-md border-b-2 border-gov-saffron no-print sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-11">
          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center space-x-1">
            {currentNavLinks.map((item) => {
              const isAnchor = item.path.includes('#');
              const Icon = item.icon;

              if (isAnchor) {
                return (
                  <a
                    key={item.name}
                    href={item.path}
                    className="px-3 py-2 text-xs font-semibold text-slate-100 hover:bg-gov-blue hover:text-white rounded transition-colors"
                  >
                    {item.name}
                  </a>
                );
              }

              return (
                <NavLink
                  key={item.name}
                  to={item.path}
                  className={({ isActive }) =>
                    `px-3 py-2 text-xs font-semibold rounded flex items-center gap-1.5 transition-colors ${
                      isActive
                        ? 'bg-gov-saffron text-slate-950 font-bold'
                        : 'text-slate-100 hover:bg-gov-blue hover:text-white'
                    }`
                  }
                >
                  {Icon && <Icon className="w-3.5 h-3.5" />}
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </div>

          {/* Quick Notice Pill on Right (Desktop) */}
          <div className="hidden lg:flex items-center gap-2 text-xs text-amber-300 font-medium">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>{lang === 'hi' ? 'खरीद पोर्टल सक्रिय है' : 'Kisan Procurement Live'}</span>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex lg:hidden items-center justify-between w-full">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
              {isAuthenticated ? (isFarmer ? 'Farmer Portal' : 'Admin Portal') : 'Menu'}
            </span>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 rounded text-white hover:bg-gov-blue focus:outline-none"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Navigation */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-gov-blue py-2 px-1 space-y-1">
            {currentNavLinks.map((item) => {
              const isAnchor = item.path.includes('#');
              const Icon = item.icon;

              if (isAnchor) {
                return (
                  <a
                    key={item.name}
                    href={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 text-sm font-medium text-slate-100 hover:bg-gov-blue rounded"
                  >
                    {item.name}
                  </a>
                );
              }

              return (
                <NavLink
                  key={item.name}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `block px-3 py-2 text-sm font-medium rounded flex items-center gap-2 ${
                      isActive
                        ? 'bg-gov-saffron text-slate-950 font-bold'
                        : 'text-slate-100 hover:bg-gov-blue'
                    }`
                  }
                >
                  {Icon && <Icon className="w-4 h-4" />}
                  <span>{item.name}</span>
                </NavLink>
              );
            })}

            {!isAuthenticated && (
              <div className="pt-2 border-t border-slate-700 flex flex-col gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 bg-gov-saffron text-slate-950 font-bold text-center rounded text-sm"
                >
                  {t('farmerLogin')}
                </Link>
                <Link
                  to="/admin/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 bg-gov-blue text-white text-center rounded text-sm border border-slate-600"
                >
                  {t('adminLogin')}
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
