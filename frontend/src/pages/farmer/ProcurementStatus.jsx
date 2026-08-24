import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLang } from '../../context/LanguageAndAccessibilityContext';
import procurementService from '../../api/procurementService';
import StatusBadge from '../../components/common/StatusBadge';
import {
  CheckCircle2,
  Clock,
  Circle,
  FileText,
  ShieldCheck,
  Scale,
  CreditCard,
  Building2,
  Printer,
  ChevronRight,
} from 'lucide-react';
import Emblem from '../../components/common/Emblem';

export const ProcurementStatus = () => {
  const { user } = useAuth();
  const { lang, t } = useLang();

  const [loading, setLoading] = useState(false);

  // 7-Stage Official Government Procurement Journey (Section 12 of prompt)
  const stages = [
    {
      id: 1,
      title: 'Slot Booked',
      hiTitle: 'स्लॉट बुक हुआ',
      status: 'completed', // completed | current | upcoming
      timestamp: '26 Aug 2026, 02:30 PM',
      desc: 'Online procurement slot confirmed. Token A102 generated for APMC Muradnagar.',
      officer: 'Online Portal Server',
    },
    {
      id: 2,
      title: 'Farmer Arrived',
      hiTitle: 'किसान का आगमन',
      status: 'completed',
      timestamp: '28 Aug 2026, 09:45 AM',
      desc: 'Vehicle UP14-AB-1234 reported at Gate #2. Biometric and Aadhaar verified.',
      officer: 'Gate Inspector S. Sharma',
    },
    {
      id: 3,
      title: 'Queue Waiting',
      hiTitle: 'कतार में प्रतीक्षारत',
      status: 'completed',
      timestamp: '28 Aug 2026, 10:00 AM',
      desc: 'Assigned to Electronic Weighbridge #2 queue. Position #7.',
      officer: 'Queue Marshall Desk',
    },
    {
      id: 4,
      title: 'Procurement In Progress',
      hiTitle: 'तौल एवं गुणवत्ता जांच प्रगति पर',
      status: 'current',
      timestamp: '28 Aug 2026, 10:35 AM',
      desc: 'Grain sampling & Moisture testing completed (11.8% - Grade A Passed). Gross weighment active.',
      officer: 'Quality Grader & Weighing Officer',
    },
    {
      id: 5,
      title: 'Procurement Completed',
      hiTitle: 'खरीद पूर्ण (तौल पर्ची जारी)',
      status: 'upcoming',
      timestamp: 'Pending Tare Weighment',
      desc: 'Tare weight calculation and digital weighment slip (J-Form) generation.',
      officer: 'Mandi In-Charge',
    },
    {
      id: 6,
      title: 'Payment Processing',
      hiTitle: 'भुगतान प्रक्रियाधीन (PFMS)',
      status: 'upcoming',
      timestamp: 'Within 24 Hours of Weighment',
      desc: 'Batch submitted to Public Financial Management System (PFMS) for bank DBT validation.',
      officer: 'State Civil Supplies Treasury',
    },
    {
      id: 7,
      title: 'Payment Completed',
      hiTitle: 'भुगतान संपन्न (बैंक खाते में DBT)',
      status: 'upcoming',
      timestamp: 'Direct Benefit Transfer',
      desc: 'Total MSP amount credited directly to Aadhaar linked bank account.',
      officer: 'Reserve Bank / PFMS Direct',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Official Journey Container */}
      <div className="bg-white border border-slate-300 rounded shadow-gov p-6 sm:p-8 space-y-6">
        {/* Header */}
        <div className="border-b-2 border-slate-200 pb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Emblem className="w-8 h-10 text-gov-navy" />
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                Government of India | Department of Agriculture
              </span>
              <h2 className="text-lg font-bold text-gov-navy leading-tight">
                {lang === 'hi' ? '7-चरणीय खरीद प्रक्रिया स्थिति' : '7-Stage Official Procurement Journey'}
              </h2>
              <p className="text-xs text-slate-600">
                Token: <strong>A102</strong> | Centre: <strong>APMC Mandi Yard, Muradnagar</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <StatusBadge status="IN_PROCUREMENT" />
            <button
              onClick={() => window.print()}
              className="px-3 py-1.5 bg-slate-100 text-slate-700 text-xs font-semibold rounded hover:bg-slate-200 border border-slate-300 flex items-center gap-1 no-print"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Status</span>
            </button>
          </div>
        </div>

        {/* 7-Stage Official Stepper (Section 12 of prompt) */}
        <div className="space-y-4">
          {stages.map((st, idx) => {
            const isCompleted = st.status === 'completed';
            const isCurrent = st.status === 'current';
            const isUpcoming = st.status === 'upcoming';

            return (
              <div
                key={st.id}
                className={`border rounded p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all ${
                  isCurrent
                    ? 'border-gov-blue bg-blue-50/70 ring-1 ring-gov-blue shadow-sm'
                    : isCompleted
                    ? 'border-emerald-200 bg-emerald-50/40'
                    : 'border-slate-200 bg-slate-50 opacity-70'
                }`}
              >
                {/* Left Step Indicator & Title */}
                <div className="flex items-start gap-3.5">
                  <div className="mt-0.5 flex-shrink-0">
                    {isCompleted && (
                      <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                        ✓
                      </div>
                    )}
                    {isCurrent && (
                      <div className="w-6 h-6 rounded-full bg-gov-blue text-white flex items-center justify-center font-bold text-xs ring-4 ring-blue-200 animate-pulse">
                        ●
                      </div>
                    )}
                    {isUpcoming && (
                      <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center font-bold text-xs">
                        ○
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono font-bold text-slate-500">
                        Stage {st.id}:
                      </span>
                      <h4 className="text-sm font-bold text-slate-900">
                        {lang === 'hi' ? st.hiTitle : st.title}
                      </h4>
                      {isCurrent && (
                        <span className="bg-gov-blue text-white text-[10px] font-bold px-2 py-0.5 rounded">
                          CURRENT STAGE
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                      {st.desc}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Action Officer: <strong>{st.officer}</strong>
                    </p>
                  </div>
                </div>

                {/* Right Timestamp / Stage Badge */}
                <div className="text-right flex-shrink-0 sm:pl-4">
                  <span className="text-xs font-semibold text-slate-700 block">
                    {st.timestamp}
                  </span>
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider ${
                      isCompleted
                        ? 'text-emerald-700'
                        : isCurrent
                        ? 'text-gov-blue'
                        : 'text-slate-400'
                    }`}
                  >
                    {isCompleted ? '✓ Completed' : isCurrent ? '● Active' : '○ Pending'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Quality Assessment & Weighment Verification Box */}
        <div className="border border-slate-300 rounded p-4 bg-slate-50">
          <h3 className="text-xs font-bold text-gov-navy uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Scale className="w-4 h-4 text-gov-blue" />
            Quality Grader & Moisture Analysis Certificate (Live Sample)
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="bg-white p-2.5 rounded border border-slate-200">
              <span className="text-[10px] text-slate-500 uppercase">Moisture Content</span>
              <p className="font-bold text-emerald-700 mt-0.5">11.8% (Allowed: &lt;14%)</p>
            </div>
            <div className="bg-white p-2.5 rounded border border-slate-200">
              <span className="text-[10px] text-slate-500 uppercase">Foreign Matter</span>
              <p className="font-bold text-slate-800 mt-0.5">0.4% (Standard)</p>
            </div>
            <div className="bg-white p-2.5 rounded border border-slate-200">
              <span className="text-[10px] text-slate-500 uppercase">Quality Grade</span>
              <p className="font-bold text-gov-navy mt-0.5">FAQ Grade A (Passed)</p>
            </div>
            <div className="bg-white p-2.5 rounded border border-slate-200">
              <span className="text-[10px] text-slate-500 uppercase">Applicable MSP</span>
              <p className="font-bold text-gov-green mt-0.5">₹ 2,200 / Quintal</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProcurementStatus;
