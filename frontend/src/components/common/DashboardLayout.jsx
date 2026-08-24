import React from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLang } from '../../context/LanguageAndAccessibilityContext';
import {
  Home,
  Calendar,
  Users,
  Activity,
  CreditCard,
  User,
  LogOut,
  Building2,
  Sliders,
  FileSpreadsheet,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';

export const DashboardLayout = ({ children, role = 'farmer' }) => {
  const { user, logout } = useAuth();
  const { t, lang } = useLang();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const farmerNavItems = [
    { name: t('dashboard'), path: '/farmer/dashboard', icon: Home, desc: 'Portal Overview' },
    { name: t('bookSlot'), path: '/farmer/book-slot', icon: Calendar, desc: 'Procurement Booking' },
    { name: t('myQueue'), path: '/farmer/queue', icon: Users, desc: 'Live Token & Wait Time' },
    { name: t('procurementStatus'), path: '/farmer/status', icon: Activity, desc: '7-Stage Progress' },
    { name: t('payments'), path: '/farmer/payments', icon: CreditCard, desc: 'DBT Bank Payouts' },
    { name: t('profile'), path: '/farmer/profile', icon: User, desc: 'Land & Crop Info' },
  ];

  const adminNavItems = [
    { name: 'Admin Dashboard', path: '/admin/dashboard', icon: Home, desc: 'Centre Overview & Metrics' },
    { name: 'Live Queue Manager', path: '/admin/queue', icon: Users, desc: 'Call & Process Tokens' },
    { name: 'Slot Management', path: '/admin/slots', icon: Sliders, desc: 'Capacity & Time Slots' },
    { name: 'Procurement Entry', path: '/admin/procurement', icon: FileSpreadsheet, desc: 'Weighment & Quality' },
    { name: 'Payment (DBT) Status', path: '/admin/payments', icon: CreditCard, desc: 'PFMS & Transaction Log' },
    { name: 'Registered Farmers', path: '/admin/farmers', icon: Building2, desc: 'Farmer Database' },
  ];

  const navItems = role === 'admin' ? adminNavItems : farmerNavItems;

  return (
    <div className="min-h-screen bg-[#f4f7f9] flex flex-col">
      {/* 1. Identity & Breadcrumb Ribbon */}
      <div className="bg-white border-b border-slate-200 px-4 py-2 text-xs">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-slate-600">
            <span className="font-semibold text-gov-navy">Kisan Portal</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-medium text-slate-700 capitalize">
              {role === 'admin' ? 'Procurement Centre Administration' : 'Farmer Dashboard'}
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-gov-blue font-bold">
              {location.pathname.split('/').pop().replace('-', ' ').toUpperCase()}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-300">
              {role === 'admin' ? 'Centre ID: MANDI-DL-01' : `Farmer ID: ${user?.mobile ? 'KP-' + user.mobile.slice(-4) : 'KP-FARMER'}`}
            </span>
            <span className="text-emerald-700 font-semibold text-[11px] flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              Official Session Active
            </span>
          </div>
        </div>
      </div>

      {/* 2. Main Dashboard Content Grid */}
      <div className="max-w-7xl mx-auto px-4 py-6 w-full flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Sidebar */}
          <aside className="lg:col-span-1 space-y-4 no-print">
            {/* User Profile Card */}
            <div className="bg-white border border-slate-300 rounded shadow-gov p-4">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                <div className="w-11 h-11 bg-gov-navy text-white rounded flex items-center justify-center font-bold text-lg shadow-inner">
                  {user?.name ? user.name.charAt(0).toUpperCase() : (role === 'admin' ? 'A' : 'K')}
                </div>
                <div>
                  <h3 className="font-bold text-sm text-gov-navy leading-tight">
                    {user?.name || (role === 'admin' ? 'Centre In-Charge' : 'Registered Farmer')}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    {user?.mobile || user?.email || (role === 'admin' ? 'Officer ID: ADM-9821' : 'Mobile: 98765XXXXX')}
                  </p>
                  <p className="text-[10px] text-gov-green font-bold uppercase mt-0.5">
                    ✓ Verified by Aadhaar / Dept.
                  </p>
                </div>
              </div>

              {/* Navigation Menu */}
              <nav className="mt-3 space-y-1" aria-label="Dashboard Sidebar Navigation">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      className={({ isActive }) =>
                        `flex items-start gap-3 p-2.5 rounded text-xs transition-colors border ${
                          isActive
                            ? 'bg-gov-navy text-white border-gov-navy font-bold'
                            : 'text-slate-700 hover:bg-slate-100 border-transparent'
                        }`
                      }
                    >
                      <Icon className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <div className="leading-tight">
                        <div>{item.name}</div>
                        <div className="text-[10px] opacity-75 font-normal">{item.desc}</div>
                      </div>
                    </NavLink>
                  );
                })}

                <button
                  onClick={handleLogout}
                  className="w-full mt-3 flex items-center gap-2 p-2.5 rounded text-xs font-semibold text-red-700 hover:bg-red-50 border border-red-200 transition-colors text-left"
                >
                  <LogOut className="w-4 h-4 text-red-600" />
                  <span>{t('logout')}</span>
                </button>
              </nav>
            </div>

            {/* Helpline Box */}
            <div className="bg-amber-50 border border-amber-200 rounded p-3 text-xs text-amber-900">
              <h4 className="font-bold text-xs text-amber-950 flex items-center gap-1.5 mb-1">
                <ShieldCheck className="w-4 h-4 text-amber-700" />
                Mandi Support Desk
              </h4>
              <p className="text-[11px] leading-relaxed">
                For any issue with slot verification, biometric check, or weighment disputes, contact the Center In-Charge or dial 1800-180-1551.
              </p>
            </div>
          </aside>

          {/* Right Main Panel */}
          <main id="main-content" className="lg:col-span-3">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
