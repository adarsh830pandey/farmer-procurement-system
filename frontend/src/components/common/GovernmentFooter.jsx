import React from 'react';
import { useLang } from '../../context/LanguageAndAccessibilityContext';
import { Phone, Mail, MapPin, ExternalLink, Shield, Info, HeartHandshake } from 'lucide-react';
import Emblem from './Emblem';

export const GovernmentFooter = () => {
  const { t, lang } = useLang();

  return (
    <footer className="bg-[#0b2545] text-slate-200 text-xs border-t-4 border-gov-saffron no-print">
      {/* 1. Main Footer Grid */}
      <div className="max-w-7xl mx-auto px-4 py-8 sm:py-10 grid grid-cols-1 md:grid-cols-4 gap-6 sm:gap-8">
        {/* Col 1: Ministry Info & Mission */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Emblem className="w-8 h-10 text-white" />
            <div>
              <h3 className="font-bold text-white text-sm leading-tight">
                {t('portalTitle')}
              </h3>
              <p className="text-[11px] text-slate-300">
                {t('ministry')}
              </p>
            </div>
          </div>
          <p className="text-slate-300 text-[11px] leading-relaxed">
            {lang === 'hi'
              ? 'डिजिटल भारत पहल के अंतर्गत किसानों के लिए पारदर्शी खरीद, ऑनलाइन स्लॉट बुकिंग एवं त्वरित कतार प्रबंधन का आधिकारिक राष्ट्रीय मंच।'
              : 'Official national digital procurement platform enabling transparent MSP procurement, automated slot booking, and queue management for Indian farmers under Digital India.'}
          </p>
          <div className="pt-1">
            <span className="inline-block bg-[#134074] text-amber-300 px-2.5 py-1 rounded text-[11px] font-semibold border border-blue-400/30">
              🇮🇳 An Initiative of Government of India
            </span>
          </div>
        </div>

        {/* Col 2: Important Links */}
        <div className="space-y-2">
          <h4 className="font-bold text-amber-400 uppercase text-xs tracking-wider border-b border-slate-700 pb-1.5">
            {lang === 'hi' ? 'महत्वपूर्ण लिंक' : 'Important Links'}
          </h4>
          <ul className="space-y-1.5 text-slate-300">
            <li>
              <a href="/" className="hover:text-white hover:underline flex items-center gap-1">
                <span>{t('home')}</span>
              </a>
            </li>
            <li>
              <a href="/#about" className="hover:text-white hover:underline">
                {t('aboutUs')}
              </a>
            </li>
            <li>
              <a href="/#services" className="hover:text-white hover:underline">
                {t('farmerServices')}
              </a>
            </li>
            <li>
              <a href="/#centres" className="hover:text-white hover:underline">
                {t('procurementCentres')}
              </a>
            </li>
            <li>
              <a href="/#how-it-works" className="hover:text-white hover:underline">
                {t('howItWorks')}
              </a>
            </li>
            <li>
              <a href="/#help" className="hover:text-white hover:underline">
                {t('helpSupport')}
              </a>
            </li>
          </ul>
        </div>

        {/* Col 3: Portal Policies & Allied Portals */}
        <div className="space-y-2">
          <h4 className="font-bold text-amber-400 uppercase text-xs tracking-wider border-b border-slate-700 pb-1.5">
            {lang === 'hi' ? 'वेबसाइट नीतियां व संबंधित पोर्टल' : 'Policies & Portals'}
          </h4>
          <ul className="space-y-1.5 text-slate-300">
            <li>
              <a href="#privacy" className="hover:text-white hover:underline">
                Privacy Policy (गोपनीयता नीति)
              </a>
            </li>
            <li>
              <a href="#terms" className="hover:text-white hover:underline">
                Terms & Conditions (नियम व शर्तें)
              </a>
            </li>
            <li>
              <a href="#accessibility" className="hover:text-white hover:underline">
                Accessibility Statement (सुगमता विवरण)
              </a>
            </li>
            <li>
              <a href="https://enam.gov.in" target="_blank" rel="noreferrer" className="hover:text-white hover:underline flex items-center gap-1">
                <span>e-NAM Portal</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </a>
            </li>
            <li>
              <a href="https://pmkisan.gov.in" target="_blank" rel="noreferrer" className="hover:text-white hover:underline flex items-center gap-1">
                <span>PM-Kisan Samman Nidhi</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </a>
            </li>
            <li>
              <a href="https://agmarknet.gov.in" target="_blank" rel="noreferrer" className="hover:text-white hover:underline flex items-center gap-1">
                <span>Agmarknet Mandi Prices</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </a>
            </li>
          </ul>
        </div>

        {/* Col 4: Official Helpline & Helpdesk */}
        <div className="space-y-3">
          <h4 className="font-bold text-amber-400 uppercase text-xs tracking-wider border-b border-slate-700 pb-1.5">
            {lang === 'hi' ? 'किसान सहायता केंद्र / संपर्क' : 'Farmer Helpdesk & Contact'}
          </h4>
          <div className="space-y-2 text-slate-300">
            <div className="flex items-start gap-2 bg-[#134074]/60 p-2.5 rounded border border-blue-500/20">
              <Phone className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-[11px] font-medium text-slate-200">Toll-Free Kisan Call Centre:</p>
                <p className="text-sm font-bold text-white tracking-wide">1800-180-1551</p>
                <p className="text-[10px] text-slate-300">6:00 AM to 10:00 PM (All 7 Days)</p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Mail className="w-3.5 h-3.5 text-slate-400 mt-0.5 flex-shrink-0" />
              <p className="text-[11px]">support.procure-agri@gov.in</p>
            </div>

            <div className="flex items-start gap-2">
              <MapPin className="w-3.5 h-3.5 text-slate-400 mt-0.5 flex-shrink-0" />
              <p className="text-[11px]">Krishi Bhavan, Dr. Rajendra Prasad Road, New Delhi - 110001</p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Official Statutory Copyright & Technical Attribution Strip */}
      <div className="bg-[#081c33] text-slate-400 text-[11px] border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col md:flex-row items-center justify-between gap-2 text-center md:text-left">
          <p>
            {t('footerCopyright')}
          </p>
          <div className="flex items-center gap-4 text-slate-400 text-[10px]">
            <span>Last Updated: 24 August 2026</span>
            <span>|</span>
            <span>Total Portal Visitors: 1,482,920</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default GovernmentFooter;
