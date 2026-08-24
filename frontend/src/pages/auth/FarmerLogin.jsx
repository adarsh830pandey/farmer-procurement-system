import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useLang } from '../../context/LanguageAndAccessibilityContext';
import { Phone, Lock, LogIn, ShieldCheck, AlertCircle, RefreshCw, Loader2, UserPlus } from 'lucide-react';
import Emblem from '../../components/common/Emblem';

export const FarmerLogin = () => {
  const { loginFarmer } = useAuth();
  const { showToast } = useToast();
  const { t, lang } = useLang();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [captchaInput, setCaptchaInput] = useState('');
  const [captchaCode, setCaptchaCode] = useState('7K9M');
  const [loading, setLoading] = useState(false);

  const from = location.state?.from?.pathname || '/farmer/dashboard';

  const refreshCaptcha = () => {
    const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
    let result = '';
    for (let i = 0; i < 4; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaCode(result);
    setCaptchaInput('');
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!mobile || mobile.length !== 10) {
      showToast('Please enter your 10-digit registered mobile number', 'warning');
      return;
    }
    if (!password) {
      showToast('Please enter your password', 'warning');
      return;
    }
    if (captchaInput.toUpperCase() !== captchaCode) {
      showToast('Incorrect Captcha code entered. Please try again.', 'error');
      refreshCaptcha();
      return;
    }

    setLoading(true);
    try {
      await loginFarmer({ mobile, password });
      showToast('Logged in successfully to Kisan Portal', 'success');
      navigate(from, { replace: true });
    } catch (err) {
      // In case backend is partially initialized or in development mode, provide clear error message
      showToast(err.message || 'Login failed. Please verify your mobile number and password.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-10">
      {/* Official Government Login Card */}
      <div className="bg-white border border-slate-300 rounded shadow-gov overflow-hidden">
        {/* Header */}
        <div className="bg-[#0b2545] text-white p-5 border-b-2 border-gov-saffron text-center">
          <Emblem className="w-9 h-11 text-white mx-auto mb-2" />
          <h2 className="text-base font-bold">
            {lang === 'hi' ? 'किसान आधिकारिक लॉगिन' : 'Farmer Portal Login'}
          </h2>
          <p className="text-xs text-slate-300 mt-0.5">
            Ministry of Agriculture & Farmers Welfare, Govt of India
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleLogin} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Registered Mobile Number (पंजीकृत मोबाइल नंबर)*
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="tel"
                maxLength="10"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                placeholder="10-digit mobile number"
                required
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded focus:border-gov-blue focus:ring-1 focus:ring-gov-blue bg-slate-50"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Password (पासवर्ड)*
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                required
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded focus:border-gov-blue focus:ring-1 focus:ring-gov-blue bg-slate-50"
              />
            </div>
          </div>

          {/* Government Portal Security Captcha */}
          <div className="pt-1">
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Security Code / Captcha (सुरक्षा कोड)*
            </label>
            <div className="flex items-center gap-3">
              <div className="bg-slate-200 border border-slate-400 px-4 py-1.5 rounded font-mono font-bold tracking-widest text-base text-slate-800 select-none line-through">
                {captchaCode}
              </div>
              <button
                type="button"
                onClick={refreshCaptcha}
                className="p-2 border border-slate-300 rounded text-slate-600 hover:bg-slate-100"
                title="Refresh Captcha"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              <input
                type="text"
                maxLength="4"
                value={captchaInput}
                onChange={(e) => setCaptchaInput(e.target.value)}
                placeholder="Enter code"
                required
                className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded uppercase font-mono font-bold focus:border-gov-blue focus:ring-1 focus:ring-gov-blue"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-gov-navy text-white text-xs font-bold rounded shadow hover:bg-gov-dark transition-colors flex items-center justify-center gap-2 border border-gov-navy disabled:opacity-50 mt-4"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Authenticating Credentials...</span>
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4 text-amber-300" />
                <span>{t('farmerLogin')}</span>
              </>
            )}
          </button>

          {/* Links & Help */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-xs">
            <Link
              to="/register"
              className="text-gov-blue font-bold hover:underline flex items-center gap-1"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>New Farmer? Register</span>
            </Link>

            <a
              href="#forgot"
              onClick={(e) => {
                e.preventDefault();
                showToast('To reset password, contact your District Agriculture Officer or call Kisan Call Center 1800-180-1551.', 'info');
              }}
              className="text-slate-600 hover:underline"
            >
              Forgot Password?
            </a>
          </div>
        </form>

        {/* Security Declaration Footer */}
        <div className="bg-slate-50 border-t border-slate-200 p-3 text-center text-[11px] text-slate-600 flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-gov-green" />
          <span>Your information is protected and used only for providing procurement services.</span>
        </div>
      </div>
    </div>
  );
};

export default FarmerLogin;
