import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useLang } from '../../context/LanguageAndAccessibilityContext';
import { User, Phone, Lock, MapPin, Wheat, CreditCard, ShieldCheck, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import Emblem from '../../components/common/Emblem';

export const FarmerRegister = () => {
  const { registerFarmer } = useAuth();
  const { showToast } = useToast();
  const { t, lang } = useLang();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    password: '',
    confirmPassword: '',
    aadhaarLast4: '',
    state: 'Uttar Pradesh',
    district: 'Ghaziabad',
    village: '',
    address: '',
    landAcres: '2.5',
    primaryCrop: 'Paddy (Rice)',
    estimatedQuantityQuintals: '50',
    accountNumber: '',
    ifscCode: '',
    declaration: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      showToast('Please enter Farmer Full Name', 'warning');
      return;
    }
    if (!formData.mobile || formData.mobile.length !== 10) {
      showToast('Please enter a valid 10-digit mobile number', 'warning');
      return;
    }
    if (!formData.password || formData.password.length < 6) {
      showToast('Password must be at least 6 characters', 'warning');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      showToast('Passwords do not match', 'error');
      return;
    }
    if (!formData.declaration) {
      showToast('Please check the official declaration to proceed', 'warning');
      return;
    }

    setLoading(true);
    try {
      await registerFarmer({
        name: formData.name,
        mobile: formData.mobile,
        password: formData.password,
        state: formData.state,
        district: formData.district,
        village: formData.village,
        address: formData.address,
        landAcres: Number(formData.landAcres) || 0,
        primaryCrop: formData.primaryCrop,
        estimatedQuantityQuintals: Number(formData.estimatedQuantityQuintals) || 0,
        bankDetails: {
          accountNumber: formData.accountNumber,
          ifscCode: formData.ifscCode,
        },
      });

      showToast('Farmer registered successfully! Please login with your mobile and password.', 'success');
      navigate('/login');
    } catch (err) {
      // In case backend is partially implemented or returns error, provide friendly feedback
      showToast(err.message || 'Registration failed. Please check your data and try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Official Government Form Card */}
      <div className="bg-white border border-slate-300 rounded shadow-gov overflow-hidden">
        {/* Form Header */}
        <div className="bg-[#0b2545] text-white p-5 border-b-2 border-gov-saffron flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Emblem className="w-8 h-10 text-white" />
            <div>
              <h2 className="text-lg font-bold">
                {lang === 'hi' ? 'किसान पंजीकरण प्रपत्र (Form-1A)' : 'Farmer Registration Form (Form-1A)'}
              </h2>
              <p className="text-xs text-slate-300">
                National Digital Procurement & Direct Benefit Transfer (DBT) Enrolment
              </p>
            </div>
          </div>
          <span className="hidden sm:inline-block text-[11px] bg-[#134074] text-amber-300 px-2.5 py-1 rounded border border-blue-400/30">
            Govt. Authorized Portal
          </span>
        </div>

        {/* Security & Authenticity Banner */}
        <div className="bg-amber-50 border-b border-amber-200 px-5 py-2.5 text-xs text-amber-900 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-amber-700 flex-shrink-0" />
          <span>
            <strong>Official Notice:</strong> All details provided will be verified against state land records (Khasra/Khatauni) for MSP procurement.
          </span>
        </div>

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Section 1: Personal & Login Details */}
          <div>
            <h3 className="text-xs font-bold text-gov-navy uppercase tracking-wider border-b border-slate-200 pb-1.5 mb-3 flex items-center gap-1.5">
              <User className="w-4 h-4 text-gov-blue" />
              1. Personal & Account Credentials (व्यक्तिगत विवरण)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Farmer Full Name (नाम)*
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Ramesh Singh"
                  required
                  className="w-full text-xs p-2.5 border border-slate-300 rounded focus:border-gov-blue focus:ring-1 focus:ring-gov-blue"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Mobile Number (मोबाइल नंबर)*
                </label>
                <input
                  type="tel"
                  name="mobile"
                  maxLength="10"
                  value={formData.mobile}
                  onChange={handleChange}
                  placeholder="10-digit mobile number"
                  required
                  className="w-full text-xs p-2.5 border border-slate-300 rounded focus:border-gov-blue focus:ring-1 focus:ring-gov-blue"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Aadhaar Card Last 4 Digits
                </label>
                <input
                  type="text"
                  name="aadhaarLast4"
                  maxLength="4"
                  value={formData.aadhaarLast4}
                  onChange={handleChange}
                  placeholder="XXXX (Optional)"
                  className="w-full text-xs p-2.5 border border-slate-300 rounded focus:border-gov-blue focus:ring-1 focus:ring-gov-blue"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Create Password (पासवर्ड)*
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Min. 6 characters"
                  required
                  className="w-full text-xs p-2.5 border border-slate-300 rounded focus:border-gov-blue focus:ring-1 focus:ring-gov-blue"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Confirm Password (पासवर्ड पुष्टि)*
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Re-enter password"
                  required
                  className="w-full text-xs p-2.5 border border-slate-300 rounded focus:border-gov-blue focus:ring-1 focus:ring-gov-blue"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Address & Location Details */}
          <div>
            <h3 className="text-xs font-bold text-gov-navy uppercase tracking-wider border-b border-slate-200 pb-1.5 mb-3 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-gov-blue" />
              2. Address & Mandi Jurisdiction (पता व स्थान विवरण)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  State (राज्य)*
                </label>
                <select
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded bg-white focus:border-gov-blue focus:ring-1 focus:ring-gov-blue"
                >
                  <option value="Uttar Pradesh">Uttar Pradesh</option>
                  <option value="Haryana">Haryana</option>
                  <option value="Punjab">Punjab</option>
                  <option value="Madhya Pradesh">Madhya Pradesh</option>
                  <option value="Rajasthan">Rajasthan</option>
                  <option value="Bihar">Bihar</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  District (ज़िला)*
                </label>
                <select
                  name="district"
                  value={formData.district}
                  onChange={handleChange}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded bg-white focus:border-gov-blue focus:ring-1 focus:ring-gov-blue"
                >
                  <option value="Ghaziabad">Ghaziabad</option>
                  <option value="Meerut">Meerut</option>
                  <option value="Gautam Buddha Nagar">Gautam Buddha Nagar</option>
                  <option value="Hapur">Hapur</option>
                  <option value="Bulandshahr">Bulandshahr</option>
                  <option value="Karnal">Karnal</option>
                  <option value="Ambala">Ambala</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Village / Gram Panchayat (गाँव / पंचायत)*
                </label>
                <input
                  type="text"
                  name="village"
                  value={formData.village}
                  onChange={handleChange}
                  placeholder="Village name"
                  required
                  className="w-full text-xs p-2.5 border border-slate-300 rounded focus:border-gov-blue focus:ring-1 focus:ring-gov-blue"
                />
              </div>

              <div className="md:col-span-3">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Residential Address (पूर्ण पता)
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="House / Plot / Post Office details"
                  className="w-full text-xs p-2.5 border border-slate-300 rounded focus:border-gov-blue focus:ring-1 focus:ring-gov-blue"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Agricultural & Crop Details */}
          <div>
            <h3 className="text-xs font-bold text-gov-navy uppercase tracking-wider border-b border-slate-200 pb-1.5 mb-3 flex items-center gap-1.5">
              <Wheat className="w-4 h-4 text-gov-green" />
              3. Crop & Land Holding Details (फसल व भूमि विवरण)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Primary Crop for Procurement (प्रमुख फसल)*
                </label>
                <select
                  name="primaryCrop"
                  value={formData.primaryCrop}
                  onChange={handleChange}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded bg-white focus:border-gov-blue focus:ring-1 focus:ring-gov-blue"
                >
                  <option value="Paddy (Rice)">Paddy / धान (Grade A)</option>
                  <option value="Wheat">Wheat / गेहूँ (Sharbati/Common)</option>
                  <option value="Mustard / Rapeseed">Mustard / सरसों</option>
                  <option value="Cotton">Cotton / कपास</option>
                  <option value="Gram (Chana)">Gram / चना</option>
                  <option value="Maize">Maize / मक्का</option>
                  <option value="Soybean">Soybean / सोयाबीन</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Total Land Holding (भूमि - एकड़ में)*
                </label>
                <input
                  type="number"
                  step="0.1"
                  name="landAcres"
                  value={formData.landAcres}
                  onChange={handleChange}
                  placeholder="e.g. 2.5"
                  required
                  className="w-full text-xs p-2.5 border border-slate-300 rounded focus:border-gov-blue focus:ring-1 focus:ring-gov-blue"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Estimated Produce for Sale (मात्रा - क्विंटल में)*
                </label>
                <input
                  type="number"
                  name="estimatedQuantityQuintals"
                  value={formData.estimatedQuantityQuintals}
                  onChange={handleChange}
                  placeholder="e.g. 50 Quintals"
                  required
                  className="w-full text-xs p-2.5 border border-slate-300 rounded focus:border-gov-blue focus:ring-1 focus:ring-gov-blue"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Bank DBT Details for MSP Payout */}
          <div>
            <h3 className="text-xs font-bold text-gov-navy uppercase tracking-wider border-b border-slate-200 pb-1.5 mb-3 flex items-center gap-1.5">
              <CreditCard className="w-4 h-4 text-gov-blue" />
              4. Bank Details for Direct Benefit Transfer (DBT बैंक खाता)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Bank Account Number (खाता संख्या)*
                </label>
                <input
                  type="text"
                  name="accountNumber"
                  value={formData.accountNumber}
                  onChange={handleChange}
                  placeholder="Bank Account Number (Aadhaar linked)"
                  className="w-full text-xs p-2.5 border border-slate-300 rounded focus:border-gov-blue focus:ring-1 focus:ring-gov-blue"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Bank IFSC Code (आईएफएससी कोड)*
                </label>
                <input
                  type="text"
                  name="ifscCode"
                  value={formData.ifscCode}
                  onChange={handleChange}
                  placeholder="e.g. SBIN0001234"
                  className="w-full text-xs p-2.5 border border-slate-300 rounded uppercase focus:border-gov-blue focus:ring-1 focus:ring-gov-blue"
                />
              </div>
            </div>
          </div>

          {/* Section 5: Official Declaration Checkbox */}
          <div className="bg-slate-50 border border-slate-300 p-4 rounded text-xs space-y-2">
            <label className="flex items-start gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                name="declaration"
                checked={formData.declaration}
                onChange={handleChange}
                className="mt-0.5 w-4 h-4 text-gov-navy rounded border-slate-400 focus:ring-gov-blue"
              />
              <span className="text-slate-800 leading-snug">
                <strong>स्व-घोषणा / Declaration:</strong> I hereby declare that the crop details and land holdings provided above are true to my knowledge and produce belongs to my cultivated land. I agree to comply with government moisture and quality grading standards at the procurement centre.
              </span>
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-slate-200">
            <Link
              to="/login"
              className="text-xs text-gov-blue font-bold hover:underline"
            >
              ← Already registered? Go to Login
            </Link>

            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-gov-navy text-white text-xs font-bold rounded shadow hover:bg-gov-dark transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Submitting Application to Portal...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 text-amber-300" />
                  <span>Submit Farmer Registration (पंजीकरण जमा करें)</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FarmerRegister;
