import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Emblem from './Emblem';
import { useAuth } from '../../context/AuthContext';
import { useLang } from '../../context/LanguageAndAccessibilityContext';
import { User, LogOut, ShieldCheck, HelpCircle, PhoneCall } from 'lucide-react';

export const GovernmentHeader = () => {
  const { user, isAuthenticated, isFarmer, isAdmin, logout } = useAuth();
  const { lang, setLang, fontSize, setFontSize, t } = useLang();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="w-full bg-white border-b border-gov-border select-none no-print">
      {/* 1. Indian Tricolor Hairline Stripe */}
      <div className="h-1 w-full grid grid-cols-3">
        <div className="bg-[#FF9933]"></div>
        <div className="bg-white"></div>
        <div className="bg-[#138808]"></div>
      </div>

      {/* 2. Top Utility Strip (Govt of India, Accessibility & Language) */}
      <div className="bg-[#f1f5f9] text-slate-700 text-xs border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 py-1 flex flex-wrap items-center justify-between gap-2">
          {/* Left: Official Government of India Tag */}
          <div className="flex items-center gap-3 font-semibold text-slate-800">
            <span>{t('govIndia')}</span>
            <span className="text-slate-400">|</span>
            <span className="hidden sm:inline text-slate-600 font-normal">
              {lang === 'hi' ? 'कृषि एवं किसान कल्याण मंत्रालय' : 'Ministry of Agriculture & Farmers Welfare'}
            </span>
          </div>

          {/* Right: Accessibility Controls & Language Toggle */}
          <div className="flex items-center gap-3">
            {/* Skip to main content anchor for screen readers */}
            <a
              href="#main-content"
              className="text-gov-blue hover:underline hidden md:inline font-medium"
            >
              {t('skipToContent')}
            </a>

            <span className="text-slate-300 hidden md:inline">|</span>

            {/* Font Size Adjusters */}
            <div className="flex items-center gap-1 bg-white px-1.5 py-0.5 rounded border border-slate-300">
              <span className="text-[10px] text-slate-500 mr-1 hidden sm:inline">Font:</span>
              <button
                onClick={() => setFontSize('sm')}
                className={`px-1 rounded font-bold ${fontSize === 'sm' ? 'bg-gov-blue text-white' : 'text-slate-700 hover:bg-slate-100'}`}
                title="Decrease Font Size"
                aria-label="Decrease Font Size"
              >
                A-
              </button>
              <button
                onClick={() => setFontSize('md')}
                className={`px-1 rounded font-bold ${fontSize === 'md' ? 'bg-gov-blue text-white' : 'text-slate-700 hover:bg-slate-100'}`}
                title="Default Font Size"
                aria-label="Default Font Size"
              >
                A
              </button>
              <button
                onClick={() => setFontSize('lg')}
                className={`px-1 rounded font-bold ${fontSize === 'lg' ? 'bg-gov-blue text-white' : 'text-slate-700 hover:bg-slate-100'}`}
                title="Increase Font Size"
                aria-label="Increase Font Size"
              >
                A+
              </button>
            </div>

            <span className="text-slate-300">|</span>

            {/* Language Switcher */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setLang('hi')}
                className={`px-2 py-0.5 rounded text-xs font-semibold ${lang === 'hi' ? 'bg-gov-navy text-white' : 'text-slate-700 hover:text-gov-navy'}`}
              >
                हिन्दी
              </button>
              <button
                onClick={() => setLang('en')}
                className={`px-2 py-0.5 rounded text-xs font-semibold ${lang === 'en' ? 'bg-gov-navy text-white' : 'text-slate-700 hover:text-gov-navy'}`}
              >
                English
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Main Brand & Identity Header */}
      <div className="max-w-7xl mx-auto px-4 py-3 sm:py-4 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Left: National Emblem + Portal Title */}
        <Link to="/" className="flex items-center gap-3 sm:gap-4 text-left group">
          <Emblem className="w-9 h-11 sm:w-11 sm:h-14 flex-shrink-0" />
          <div className="border-l border-slate-300 pl-3 sm:pl-4">
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gov-navy leading-tight tracking-tight">
              {t('portalTitle')}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 font-medium leading-normal mt-0.5">
              {t('portalSubtitle')}
            </p>
            <p className="text-[11px] text-gov-green font-semibold hidden sm:block">
              {t('ministry')}
            </p>
          </div>
        </Link>

        {/* Right: Auth Action Buttons / User Status */}
        <div className="flex items-center flex-wrap justify-center gap-2 sm:gap-3">
          {isAuthenticated ? (
            <div className="flex items-center gap-3 bg-gov-ice p-1.5 sm:p-2 rounded border border-slate-300">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gov-blue text-white flex items-center justify-center font-bold text-sm">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="text-left leading-tight pr-2">
                  <p className="text-xs font-bold text-gov-navy">{user?.name || 'Authorized User'}</p>
                  <p className="text-[10px] text-slate-500 capitalize">
                    {isFarmer ? 'Kisan (Farmer)' : 'Procurement Officer'}
                  </p>
                </div>
              </div>

              <Link
                to={isFarmer ? '/farmer/dashboard' : '/admin/dashboard'}
                className="text-xs font-semibold px-2.5 py-1.5 bg-white border border-slate-300 text-gov-navy rounded hover:bg-slate-50"
              >
                {t('dashboard')}
              </Link>

              <button
                onClick={handleLogout}
                className="text-xs font-semibold px-2.5 py-1.5 bg-red-600 text-white rounded hover:bg-red-700 flex items-center gap-1"
                title="Logout from portal"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>{t('logout')}</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="text-xs sm:text-sm font-semibold px-3 py-1.5 bg-gov-navy text-white rounded border border-gov-navy hover:bg-gov-dark transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <User className="w-4 h-4" />
                <span>{t('farmerLogin')}</span>
              </Link>

              <Link
                to="/register"
                className="text-xs sm:text-sm font-semibold px-3 py-1.5 bg-white text-gov-green border border-gov-green rounded hover:bg-gov-greenLight transition-colors"
              >
                <span>{t('farmerRegister')}</span>
              </Link>

              <Link
                to="/admin/login"
                className="text-xs sm:text-sm font-semibold px-2.5 py-1.5 bg-slate-100 text-slate-700 border border-slate-300 rounded hover:bg-slate-200 transition-colors flex items-center gap-1"
                title="Procurement Centre Officer Login"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-gov-blue" />
                <span>{t('adminLogin')}</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default GovernmentHeader;
