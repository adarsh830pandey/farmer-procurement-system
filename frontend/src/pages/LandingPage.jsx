import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLang } from '../context/LanguageAndAccessibilityContext';
import {
  Calendar,
  Users,
  CreditCard,
  FileText,
  Building2,
  PhoneCall,
  Search,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Bell,
  Scale,
  Sparkles,
  ChevronRight,
} from 'lucide-react';

export const LandingPage = () => {
  const { t, lang } = useLang();
  const navigate = useNavigate();
  const [trackToken, setTrackToken] = useState('');

  const handleTrackSubmit = (e) => {
    e.preventDefault();
    if (trackToken.trim()) {
      navigate(`/farmer/queue?token=${encodeURIComponent(trackToken.trim())}`);
    }
  };

  const services = [
    {
      title: lang === 'hi' ? 'किसान पंजीकरण' : 'Farmer Registration',
      desc: lang === 'hi' ? 'नया किसान खाता बनाएं एवं भूमि विवरण जोड़ें' : 'Register new farmer profile & link crop land details',
      link: '/register',
      icon: Users,
      badge: 'Step 1',
    },
    {
      title: lang === 'hi' ? 'खरीद स्लॉट बुक करें' : 'Book Procurement Slot',
      desc: lang === 'hi' ? 'नजदीकी केंद्र व समय चुनकर टोकन प्राप्त करें' : 'Select nearby Mandi centre & date for online token',
      link: '/farmer/book-slot',
      icon: Calendar,
      badge: 'Step 2',
    },
    {
      title: lang === 'hi' ? 'कतार स्थिति जांचें' : 'Check Queue Status',
      desc: lang === 'hi' ? 'लाइव टोकन नंबर व अनुमानित प्रतीक्षा समय' : 'Live serving token & estimated waiting time tracker',
      link: '/farmer/queue',
      icon: Scale,
      badge: 'Real-time',
    },
    {
      title: lang === 'hi' ? 'खरीद की स्थिति' : 'Procurement Status',
      desc: lang === 'hi' ? 'तौल, गुणवत्ता जांच एवं आवक रसीद देखें' : 'Monitor 7-stage mandi weighment & gate-pass status',
      link: '/farmer/status',
      icon: FileText,
      badge: 'Tracking',
    },
    {
      title: lang === 'hi' ? 'भुगतान स्थिति (DBT)' : 'Payment Status',
      desc: lang === 'hi' ? 'सीधे बैंक खाते में न्यूनतम समर्थन मूल्य (MSP)' : 'Verify Direct Benefit Transfer (DBT) & PFMS status',
      link: '/farmer/payments',
      icon: CreditCard,
      badge: 'Direct Bank',
    },
    {
      title: lang === 'hi' ? 'रसीद डाउनलोड करें' : 'Download Receipt',
      desc: lang === 'hi' ? 'आधिकारिक तौल पर्ची एवं भुगतान पावती' : 'Download authenticated gate-pass & payment invoices',
      link: '/farmer/payments',
      icon: FileText,
      badge: 'PDF Print',
    },
    {
      title: lang === 'hi' ? 'खरीद केंद्र खोजें' : 'Find Procurement Centre',
      desc: lang === 'hi' ? 'जिलेवार अधिकृत मंडी एवं पैक्स केंद्र सूची' : 'Search government authorized APMC / Mandi centers',
      link: '/#centres',
      icon: Building2,
      badge: 'Directory',
    },
    {
      title: lang === 'hi' ? 'सहायता एवं समर्थन' : 'Help & Support',
      desc: lang === 'hi' ? 'टोल-फ्री किसान कॉल सेंटर 1800-180-1551' : 'Toll-free helpline and center officer directory',
      link: '/#help',
      icon: PhoneCall,
      badge: '24x7 Help',
    },
  ];

  const steps = [
    {
      step: '01',
      title: lang === 'hi' ? 'पंजीकरण' : 'Register',
      desc: lang === 'hi' ? 'आधार एवं मोबाइल से किसान खाता बनाएं' : 'Create farmer profile with mobile & land details',
    },
    {
      step: '02',
      title: lang === 'hi' ? 'केंद्र चयन' : 'Select Centre',
      desc: lang === 'hi' ? 'अपने जिले का अधिकृत खरीद केंद्र चुनें' : 'Choose your nearest government procurement mandi',
    },
    {
      step: '03',
      title: lang === 'hi' ? 'स्लॉट बुक करें' : 'Book Slot',
      desc: lang === 'hi' ? 'सुविधाजनक तारीख एवं समय का टोकन पाएं' : 'Select date, time slot & download booking pass',
    },
    {
      step: '04',
      title: lang === 'hi' ? 'कतार ट्रैक करें' : 'Track Queue',
      desc: lang === 'hi' ? 'केंद्र पर अपनी बारी की लाइव स्थिति देखें' : 'Monitor live queue position & wait time digitally',
    },
    {
      step: '05',
      title: lang === 'hi' ? 'भुगतान प्राप्त करें' : 'Receive Payment',
      desc: lang === 'hi' ? 'तौल उपरांत सीधा बैंक खाते में DBT भुगतान' : 'Direct MSP bank transfer directly via PFMS/DBT',
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Government Official Notice Strip */}
      <div className="bg-amber-100 border-y border-amber-300 px-4 py-2 text-xs text-amber-950">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="bg-gov-saffronDark text-white px-2 py-0.5 rounded font-bold text-[10px] uppercase flex items-center gap-1">
              <Bell className="w-3 h-3" />
              {t('noticeHeader')}
            </span>
            <span className="font-medium">
              {t('noticeText')}
            </span>
          </div>
          <a href="#notices" className="text-gov-blue font-bold hover:underline">
            {t('viewAllNotices')} →
          </a>
        </div>
      </div>

      {/* 2. Hero Section (Government Portal Framed) */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="bg-white border border-slate-300 rounded shadow-gov overflow-hidden grid grid-cols-1 lg:grid-cols-12">
          {/* Left Column: Mission & Core CTA */}
          <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-center border-b lg:border-b-0 lg:border-r border-slate-200">
            <div className="inline-flex items-center gap-2 bg-gov-ice text-gov-blue px-3 py-1 rounded text-xs font-bold border border-slate-300 w-fit mb-4">
              <ShieldCheck className="w-4 h-4 text-gov-green" />
              <span>Government of India Digital Agriculture Initiative</span>
            </div>

            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gov-navy leading-tight tracking-tight">
              {lang === 'hi' ? 'डिजिटल किसान खरीद एवं कतार प्रबंधन पोर्टल' : 'Digital Farmer Procurement Portal'}
            </h2>

            <p className="mt-3 text-slate-700 text-sm sm:text-base leading-relaxed">
              {lang === 'hi'
                ? 'न्यूनतम समर्थन मूल्य (MSP) पर फसलों की सुगम बिक्री हेतु अग्रिम स्लॉट बुकिंग, लाइव कतार ट्रैकिंग एवं पारदर्शी डिजिटल भुगतान प्रणाली।'
                : 'Book procurement slots, track your queue, monitor procurement status, and receive payment updates digitally with zero middlemen.'}
            </p>

            {/* Primary Action Buttons */}
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link
                to="/farmer/book-slot"
                className="px-5 py-2.5 bg-gov-navy text-white text-sm font-bold rounded shadow hover:bg-gov-dark transition-colors flex items-center gap-2 border border-gov-navy"
              >
                <Calendar className="w-4 h-4 text-amber-300" />
                <span>{t('bookSlot')}</span>
              </Link>

              <Link
                to="/login"
                className="px-5 py-2.5 bg-gov-green text-white text-sm font-bold rounded shadow hover:bg-gov-greenDark transition-colors flex items-center gap-2"
              >
                <Users className="w-4 h-4" />
                <span>{t('farmerLogin')}</span>
              </Link>

              <Link
                to="/register"
                className="px-4 py-2.5 bg-slate-100 text-slate-800 text-sm font-semibold rounded hover:bg-slate-200 transition-colors border border-slate-300"
              >
                <span>{t('farmerRegister')}</span>
              </Link>
            </div>

            {/* Quick Application / Token Tracker Input Box */}
            <form onSubmit={handleTrackSubmit} className="mt-6 pt-5 border-t border-slate-200">
              <label htmlFor="token-search" className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
                {lang === 'hi' ? 'टोकन / स्लॉट पावती तुरंत ट्रैक करें:' : 'Quick Application / Token Search:'}
              </label>
              <div className="flex max-w-md gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    id="token-search"
                    type="text"
                    value={trackToken}
                    onChange={(e) => setTrackToken(e.target.value)}
                    placeholder="Enter Token (e.g. A102) or Mobile No"
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded focus:border-gov-blue focus:ring-1 focus:ring-gov-blue bg-slate-50"
                  />
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gov-blue text-white text-xs font-bold rounded hover:bg-gov-navy transition-colors whitespace-nowrap"
                >
                  {t('trackApplication')}
                </button>
              </div>
            </form>
          </div>

          {/* Right Column: Official Procurement Visual Illustration & National Highlights */}
          <div className="lg:col-span-5 bg-[#eef4f8] p-6 sm:p-8 flex flex-col justify-between">
            <div className="bg-white p-5 rounded border border-slate-300 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="text-xs font-bold text-gov-navy uppercase tracking-wider">
                  {lang === 'hi' ? 'आज का खरीद सारांश (Live)' : "Today's Mandi Summary"}
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                  Active Now
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
                  <p className="text-[11px] text-slate-600 font-medium">Centres Operational</p>
                  <p className="text-lg font-extrabold text-gov-navy">4,820+</p>
                </div>
                <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
                  <p className="text-[11px] text-slate-600 font-medium">Slots Booked Today</p>
                  <p className="text-lg font-extrabold text-gov-green">64,250</p>
                </div>
                <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
                  <p className="text-[11px] text-slate-600 font-medium">Avg. Mandi Wait Time</p>
                  <p className="text-lg font-extrabold text-gov-saffronDark">28 Mins</p>
                </div>
                <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
                  <p className="text-[11px] text-slate-600 font-medium">Direct DBT Transferred</p>
                  <p className="text-lg font-extrabold text-gov-blue">₹ 142.6 Cr</p>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 p-2.5 rounded text-[11px] text-amber-900 leading-snug">
                <strong>Transparent MSP Guarantee:</strong> All produce weighed electronically on authenticated weighbridges with instant SMS confirmation.
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-300 text-center">
              <p className="text-xs text-slate-600">
                Are you a Procurement Centre Officer?{' '}
                <Link to="/admin/login" className="text-gov-blue font-bold hover:underline">
                  Login to Admin Desk →
                </Link>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Citizen / Farmer Services Section */}
      <section id="services" className="max-w-7xl mx-auto px-4 pt-4">
        <div className="border-b-2 border-gov-navy pb-2 mb-6 flex flex-wrap items-end justify-between gap-2">
          <div>
            <h3 className="text-xl sm:text-2xl font-bold text-gov-navy leading-tight">
              {lang === 'hi' ? 'नागरिक / किसान सेवाएं' : 'Citizen / Farmer Services'}
            </h3>
            <p className="text-xs text-slate-600 mt-0.5">
              Access all official procurement facilities and queue updates online
            </p>
          </div>
          <span className="text-xs text-slate-500 font-semibold bg-slate-100 px-2.5 py-1 rounded border border-slate-300">
            8 Direct Services Available
          </span>
        </div>

        {/* 8 Clean Rectangular Government Service Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {services.map((srv, idx) => {
            const Icon = srv.icon;
            return (
              <Link
                key={idx}
                to={srv.link}
                className="bg-white border border-slate-300 hover:border-gov-blue rounded p-4 shadow-gov hover:shadow-md transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded bg-gov-ice text-gov-navy flex items-center justify-center group-hover:bg-gov-navy group-hover:text-white transition-colors">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200">
                      {srv.badge}
                    </span>
                  </div>
                  <h4 className="font-bold text-sm text-gov-navy group-hover:text-gov-blue transition-colors">
                    {srv.title}
                  </h4>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    {srv.desc}
                  </p>
                </div>

                <div className="mt-4 pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-gov-blue">
                  <span>Access Service</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 4. How It Works (Clean 5-Step Timeline) */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-4 pt-6">
        <div className="bg-white border border-slate-300 rounded shadow-gov p-6 sm:p-8">
          <div className="border-b border-slate-200 pb-3 mb-6">
            <h3 className="text-xl font-bold text-gov-navy">
              {lang === 'hi' ? 'सरल 5-चरणीय खरीद प्रक्रिया' : 'How It Works: 5 Simple Steps'}
            </h3>
            <p className="text-xs text-slate-600 mt-0.5">
              Transparent, hassle-free procedure from slot booking to bank payout
            </p>
          </div>

          {/* Desktop Horizontal & Mobile Vertical Stepper */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
            {steps.map((item, idx) => (
              <div
                key={idx}
                className="bg-[#f8fafc] border border-slate-200 rounded p-4 relative flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-lg font-black text-gov-navy font-mono">
                      {item.step}
                    </span>
                    <span className="w-6 h-6 rounded-full bg-gov-ice text-gov-navy flex items-center justify-center font-bold text-xs border border-slate-300">
                      ✓
                    </span>
                  </div>
                  <h4 className="font-bold text-sm text-gov-navy mb-1">
                    {item.title}
                  </h4>
                  <p className="text-xs text-slate-600 leading-normal">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Procurement Centres Directory & Helpline Banner */}
      <section id="centres" className="max-w-7xl mx-auto px-4 pt-4">
        <div className="bg-[#0b2545] text-white rounded p-6 sm:p-8 border-2 border-gov-saffron grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          <div className="md:col-span-2 space-y-2">
            <h3 className="text-lg sm:text-xl font-bold text-white">
              {lang === 'hi' ? 'क्या आप नजदीकी खरीद केंद्र खोजना चाहते हैं?' : 'Need Help Locating Your Designated Mandi?'}
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              District APMC Mandis, Primary Agricultural Credit Societies (PACS), and State Civil Supplies Centres are integrated with real-time biometric and electronic weighbridges.
            </p>
            <div className="pt-2 flex flex-wrap gap-3">
              <Link
                to="/farmer/book-slot"
                className="px-4 py-2 bg-gov-saffron text-slate-950 font-bold text-xs rounded hover:bg-amber-400 transition-colors"
              >
                View Center Availability →
              </Link>
              <a
                href="tel:18001801551"
                className="px-4 py-2 bg-white/10 text-white font-semibold text-xs rounded hover:bg-white/20 border border-white/30 flex items-center gap-1.5"
              >
                <PhoneCall className="w-3.5 h-3.5 text-emerald-400" />
                <span>Call Kisan Desk: 1800-180-1551</span>
              </a>
            </div>
          </div>

          <div className="bg-[#134074] p-4 rounded border border-blue-400/30 text-xs space-y-2">
            <h4 className="font-bold text-amber-300 uppercase tracking-wider text-[11px]">
              Document Checklist for Mandi Visit:
            </h4>
            <ul className="space-y-1 text-slate-200 text-[11px]">
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                <span>Printed Booking Slip / SMS Token</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                <span>Aadhaar Card (Original/Photocopy)</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                <span>Bank Passbook for DBT Account Verification</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                <span>Land Revenue Record (Khasra / Khatauni)</span>
              </li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
