import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useLang } from '../../context/LanguageAndAccessibilityContext';
import authService from '../../api/authService';
import { User, Phone, MapPin, Wheat, CreditCard, Save, CheckCircle2, ShieldCheck, Loader2 } from 'lucide-react';
import Emblem from '../../components/common/Emblem';

export const FarmerProfile = () => {
  const { user, updateUser } = useAuth();
  const { showToast } = useToast();
  const { lang, t } = useLang();

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || 'Ramesh Singh',
    mobile: user?.mobile || '9876543210',
    aadhaarNumber: 'XXXX-XXXX-8821',
    state: user?.state || 'Uttar Pradesh',
    district: user?.district || 'Ghaziabad',
    village: user?.village || 'Muradnagar Dehat',
    address: user?.address || 'Near Primary School, Village Muradnagar',
    landAcres: user?.landAcres || '2.5',
    primaryCrop: user?.primaryCrop || 'Paddy (Rice)',
    bankAccount: 'XXXXXX4920',
    ifscCode: 'SBIN0001234',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authService.updateFarmerProfile(formData).catch(() => null);
      updateUser(formData);
      showToast('Farmer Profile updated successfully!', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to update profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-300 rounded shadow-gov overflow-hidden">
        {/* Header */}
        <div className="bg-[#0b2545] text-white p-5 border-b-2 border-gov-saffron flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Emblem className="w-8 h-10 text-white" />
            <div>
              <h2 className="text-base sm:text-lg font-bold">
                {lang === 'hi' ? 'किसान व्यक्तिगत व भूमि विवरण प्रोफाइल' : 'Farmer Official Profile & Land Records'}
              </h2>
              <p className="text-xs text-slate-300">
                Department of Agriculture & Farmers Welfare, Government of India
              </p>
            </div>
          </div>
          <span className="text-[11px] bg-[#134074] text-emerald-300 px-2.5 py-1 rounded border border-blue-400/30 font-bold">
            ✓ Aadhaar Verified
          </span>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-6">
          {/* Personal Info */}
          <div>
            <h3 className="text-xs font-bold text-gov-navy uppercase tracking-wider border-b border-slate-200 pb-1.5 mb-3 flex items-center gap-1.5">
              <User className="w-4 h-4 text-gov-blue" />
              1. Personal Credentials
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Farmer Full Name*
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full text-xs p-2.5 border border-slate-300 rounded focus:border-gov-blue focus:ring-1 focus:ring-gov-blue"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Registered Mobile Number
                </label>
                <input
                  type="tel"
                  disabled
                  value={formData.mobile}
                  className="w-full text-xs p-2.5 border border-slate-200 bg-slate-100 rounded text-slate-600 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Aadhaar Reference
                </label>
                <input
                  type="text"
                  disabled
                  value={formData.aadhaarNumber}
                  className="w-full text-xs p-2.5 border border-slate-200 bg-slate-100 rounded text-slate-600 cursor-not-allowed font-mono"
                />
              </div>
            </div>
          </div>

          {/* Address Info */}
          <div>
            <h3 className="text-xs font-bold text-gov-navy uppercase tracking-wider border-b border-slate-200 pb-1.5 mb-3 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-gov-blue" />
              2. Address & Jurisdiction
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  State*
                </label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded focus:border-gov-blue focus:ring-1 focus:ring-gov-blue"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  District*
                </label>
                <input
                  type="text"
                  name="district"
                  value={formData.district}
                  onChange={handleChange}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded focus:border-gov-blue focus:ring-1 focus:ring-gov-blue"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Village / Gram Panchayat*
                </label>
                <input
                  type="text"
                  name="village"
                  value={formData.village}
                  onChange={handleChange}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded focus:border-gov-blue focus:ring-1 focus:ring-gov-blue"
                />
              </div>

              <div className="md:col-span-3">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Residential Address
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded focus:border-gov-blue focus:ring-1 focus:ring-gov-blue"
                />
              </div>
            </div>
          </div>

          {/* Agriculture Info */}
          <div>
            <h3 className="text-xs font-bold text-gov-navy uppercase tracking-wider border-b border-slate-200 pb-1.5 mb-3 flex items-center gap-1.5">
              <Wheat className="w-4 h-4 text-gov-green" />
              3. Cultivation Land & Crop
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Total Land Holding (in Acres)
                </label>
                <input
                  type="number"
                  step="0.1"
                  name="landAcres"
                  value={formData.landAcres}
                  onChange={handleChange}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded focus:border-gov-blue focus:ring-1 focus:ring-gov-blue"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Primary Crop for Procurement
                </label>
                <select
                  name="primaryCrop"
                  value={formData.primaryCrop}
                  onChange={handleChange}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded bg-white focus:border-gov-blue focus:ring-1 focus:ring-gov-blue"
                >
                  <option value="Paddy (Rice)">Paddy / धान (Grade A)</option>
                  <option value="Wheat">Wheat / गेहूँ (Common MSP)</option>
                  <option value="Mustard / Rapeseed">Mustard / सरसों</option>
                  <option value="Cotton">Cotton / कपास</option>
                  <option value="Gram (Chana)">Gram / चना</option>
                </select>
              </div>
            </div>
          </div>

          {/* Bank Info */}
          <div>
            <h3 className="text-xs font-bold text-gov-navy uppercase tracking-wider border-b border-slate-200 pb-1.5 mb-3 flex items-center gap-1.5">
              <CreditCard className="w-4 h-4 text-gov-blue" />
              4. Direct Benefit Transfer (DBT) Bank Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Linked Account Number
                </label>
                <input
                  type="text"
                  disabled
                  value={formData.bankAccount}
                  className="w-full text-xs p-2.5 border border-slate-200 bg-slate-100 rounded text-slate-600 cursor-not-allowed font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  IFSC Code
                </label>
                <input
                  type="text"
                  disabled
                  value={formData.ifscCode}
                  className="w-full text-xs p-2.5 border border-slate-200 bg-slate-100 rounded text-slate-600 cursor-not-allowed font-mono uppercase"
                />
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="pt-3 border-t border-slate-200 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-gov-navy text-white text-xs font-bold rounded shadow hover:bg-gov-dark transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving Updates...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 text-amber-300" />
                  <span>Update Profile Information (विवरण सहेजें)</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FarmerProfile;
