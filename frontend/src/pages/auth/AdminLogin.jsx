import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { ShieldCheck, Lock, User, LogIn, Loader2, Building2 } from 'lucide-react';
import Emblem from '../../components/common/Emblem';

export const AdminLogin = () => {
  const { loginAdmin } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [centreCode, setCentreCode] = useState('MANDI-GZB-01');
  const [loading, setLoading] = useState(false);

  const handleAdminLogin = async (e) => {
    e.preventDefault();

    if (!username.trim()) {
      showToast('Please enter Officer User ID / Email', 'warning');
      return;
    }
    if (!password) {
      showToast('Please enter Admin Password', 'warning');
      return;
    }

    setLoading(true);
    try {
      await loginAdmin({ username, password, centreCode });
      showToast('Officer login authorized successfully', 'success');
      navigate('/admin/dashboard');
    } catch (err) {
      showToast(err.message || 'Authentication failed. Please verify Officer credentials.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-10">
      <div className="bg-white border-2 border-gov-navy rounded shadow-gov overflow-hidden">
        <div className="bg-[#0b2545] text-white p-5 border-b-2 border-gov-saffron text-center">
          <Emblem className="w-9 h-11 text-white mx-auto mb-2" />
          <h2 className="text-base font-bold uppercase tracking-wider">
            Procurement Centre Administration
          </h2>
          <p className="text-xs text-amber-300 font-semibold mt-0.5">
            Mandi / PACS Officer & In-Charge Portal
          </p>
        </div>

        <div className="bg-slate-100 border-b border-slate-300 px-4 py-2 text-xs text-slate-700 font-medium text-center">
          Restricted Access: For Authorized Government Personnel Only
        </div>

        <form onSubmit={handleAdminLogin} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Procurement Centre / Mandi Code*
            </label>
            <div className="relative">
              <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={centreCode}
                onChange={(e) => setCentreCode(e.target.value)}
                placeholder="e.g. MANDI-GZB-01"
                required
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded uppercase font-mono focus:border-gov-blue focus:ring-1 focus:ring-gov-blue bg-slate-50"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Officer User ID / Email*
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Officer Username / Email"
                required
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded focus:border-gov-blue focus:ring-1 focus:ring-gov-blue bg-slate-50"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Security Password*
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

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-gov-navy text-white text-xs font-bold rounded shadow hover:bg-gov-dark transition-colors flex items-center justify-center gap-2 border border-gov-navy disabled:opacity-50 mt-4"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Verifying Officer Token...</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4 text-amber-300" />
                <span>Secure Officer Login</span>
              </>
            )}
          </button>

          <div className="pt-2 text-center">
            <Link to="/login" className="text-xs text-slate-600 hover:text-gov-blue underline">
              ← Return to Farmer Portal Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
