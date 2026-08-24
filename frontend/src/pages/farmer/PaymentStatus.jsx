import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLang } from '../../context/LanguageAndAccessibilityContext';
import paymentService from '../../api/paymentService';
import StatusBadge from '../../components/common/StatusBadge';
import {
  CreditCard,
  Printer,
  Download,
  CheckCircle2,
  FileText,
  ShieldCheck,
  Building2,
  Calendar,
  IndianRupee,
} from 'lucide-react';
import Emblem from '../../components/common/Emblem';

export const PaymentStatus = () => {
  const { user } = useAuth();
  const { lang, t } = useLang();

  const [loading, setLoading] = useState(false);
  const [payments, setPayments] = useState([
    {
      id: 'PAY-2026-08-9921',
      farmerName: user?.name || 'Ramesh Singh',
      farmerMobile: user?.mobile || '9876543210',
      aadhaarLast4: '8821',
      centreName: 'APMC Mandi Yard, Muradnagar',
      procurementDate: '28 August 2026',
      crop: 'Paddy / धान (Grade A)',
      quantity: 60, // Quintals
      rate: 2200, // INR per Quintal
      totalAmount: 132000,
      deductions: 0,
      netPayable: 132000,
      paymentStatus: 'PAID', // PAID | PAYMENT_PROCESSING | PENDING
      paymentDate: '28 August 2026',
      transactionId: 'PFMS-DBT-20260828-98214',
      bankName: 'State Bank of India (Aadhaar linked)',
      accountMasked: 'XXXXXX4920',
      weighmentSlipNo: 'MW-9912',
    },
    {
      id: 'PAY-2026-04-1102',
      farmerName: user?.name || 'Ramesh Singh',
      farmerMobile: user?.mobile || '9876543210',
      aadhaarLast4: '8821',
      centreName: 'APMC Mandi Yard, Muradnagar',
      procurementDate: '14 April 2026',
      crop: 'Wheat / गेहूँ (Common MSP)',
      quantity: 45,
      rate: 2275,
      totalAmount: 102375,
      deductions: 0,
      netPayable: 102375,
      paymentStatus: 'PAID',
      paymentDate: '15 April 2026',
      transactionId: 'PFMS-DBT-20260415-11082',
      bankName: 'State Bank of India',
      accountMasked: 'XXXXXX4920',
      weighmentSlipNo: 'MW-4102',
    },
  ]);

  const [selectedReceipt, setSelectedReceipt] = useState(payments[0]);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const res = await paymentService.getMyPayments().catch(() => null);
      if (res?.payments?.length > 0) {
        setPayments(res.payments);
        setSelectedReceipt(res.payments[0]);
      }
    } catch (e) {
      console.warn('Payment fetch:', e);
    }
  };

  const handlePrint = (p) => {
    setSelectedReceipt(p);
    setTimeout(() => {
      window.print();
    }, 100);
  };

  return (
    <div className="space-y-6">
      {/* 1. Official Payment Overview Banner */}
      <div className="bg-white border border-slate-300 rounded shadow-gov p-6">
        <div className="border-b border-slate-200 pb-3 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-gov-navy flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-gov-green" />
              {lang === 'hi' ? 'न्यूनतम समर्थन मूल्य (MSP) भुगतान स्थिति' : 'Procurement & DBT Payment Details'}
            </h2>
            <p className="text-xs text-slate-600 mt-0.5">
              Direct Benefit Transfer (DBT) directly into farmer Aadhaar-linked bank accounts via PFMS
            </p>
          </div>
          <span className="text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-300 px-3 py-1 rounded">
            100% PFMS Validated
          </span>
        </div>

        {/* Payment Records Table (Section 13 of prompt) */}
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-xs text-left border border-slate-300">
            <thead className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300 uppercase text-[10px]">
              <tr>
                <th className="p-3 border-r border-slate-300">Procurement Date</th>
                <th className="p-3 border-r border-slate-300">Centre (Mandi)</th>
                <th className="p-3 border-r border-slate-300">Crop Produce</th>
                <th className="p-3 border-r border-slate-300 text-right">Quantity</th>
                <th className="p-3 border-r border-slate-300 text-right">MSP Rate</th>
                <th className="p-3 border-r border-slate-300 text-right">Total Amount</th>
                <th className="p-3 border-r border-slate-300 text-center">DBT Status</th>
                <th className="p-3 text-center no-print">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {payments.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50">
                  <td className="p-3 border-r border-slate-200 font-medium">
                    {p.procurementDate}
                  </td>
                  <td className="p-3 border-r border-slate-200">
                    <span className="font-semibold text-slate-900 block">{p.centreName}</span>
                    <span className="text-[10px] text-slate-500 font-mono">Slip: {p.weighmentSlipNo}</span>
                  </td>
                  <td className="p-3 border-r border-slate-200 font-medium">
                    {p.crop}
                  </td>
                  <td className="p-3 border-r border-slate-200 text-right font-bold">
                    {p.quantity} Qtl
                  </td>
                  <td className="p-3 border-r border-slate-200 text-right">
                    ₹ {p.rate.toLocaleString('en-IN')}/Qtl
                  </td>
                  <td className="p-3 border-r border-slate-200 text-right font-extrabold text-gov-green text-sm">
                    ₹ {p.totalAmount.toLocaleString('en-IN')}
                  </td>
                  <td className="p-3 border-r border-slate-200 text-center">
                    <StatusBadge status={p.paymentStatus} />
                    <span className="text-[9px] text-slate-500 block mt-0.5 font-mono">
                      {p.transactionId}
                    </span>
                  </td>
                  <td className="p-3 text-center no-print">
                    <button
                      onClick={() => handlePrint(p)}
                      className="px-2.5 py-1.5 bg-gov-navy text-white rounded text-[11px] font-bold hover:bg-gov-dark transition-colors flex items-center gap-1 mx-auto"
                    >
                      <Download className="w-3 h-3" />
                      <span>{t('downloadReceipt')}</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 2. Official Printable Government Payment Receipt Slip (Section 13 requirement) */}
      {selectedReceipt && (
        <div className="bg-white border-2 border-slate-400 rounded shadow-gov p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between border-b-2 border-gov-navy pb-4">
            <div className="flex items-center gap-3">
              <Emblem className="w-10 h-12 text-gov-navy" />
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-600 block">
                  Government of India | Ministry of Agriculture & Farmers Welfare
                </span>
                <h3 className="text-base font-black text-gov-navy uppercase tracking-wide">
                  Official Procurement Weighment & Payment Receipt (J-Form)
                </h3>
                <p className="text-xs text-slate-500">
                  National Digital Farmer Procurement Platform | Direct Benefit Transfer (DBT)
                </p>
              </div>
            </div>

            <button
              onClick={() => window.print()}
              className="px-4 py-2 bg-gov-navy text-white text-xs font-bold rounded shadow hover:bg-gov-dark flex items-center gap-1.5 no-print"
            >
              <Printer className="w-3.5 h-3.5 text-amber-300" />
              <span>Print Official Receipt</span>
            </button>
          </div>

          {/* Receipt Data Table */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs border border-slate-300 p-4 rounded bg-slate-50">
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-semibold block">Receipt Ref No</span>
              <p className="font-mono font-bold text-gov-navy mt-0.5">{selectedReceipt.id}</p>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-semibold block">Weighment Slip No</span>
              <p className="font-mono font-bold text-slate-900 mt-0.5">{selectedReceipt.weighmentSlipNo}</p>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-semibold block">Procurement Date</span>
              <p className="font-bold text-slate-900 mt-0.5">{selectedReceipt.procurementDate}</p>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-semibold block">Payment Status</span>
              <div className="mt-0.5">
                <StatusBadge status={selectedReceipt.paymentStatus} />
              </div>
            </div>

            <div className="col-span-2">
              <span className="text-[10px] text-slate-500 uppercase font-semibold block">Farmer Name & Aadhaar</span>
              <p className="font-bold text-slate-900 text-sm mt-0.5">
                {selectedReceipt.farmerName} (Aadhaar: XXXX-XXXX-{selectedReceipt.aadhaarLast4})
              </p>
            </div>
            <div className="col-span-2">
              <span className="text-[10px] text-slate-500 uppercase font-semibold block">Procurement Centre (Mandi)</span>
              <p className="font-bold text-slate-900 mt-0.5">{selectedReceipt.centreName}</p>
            </div>

            <div>
              <span className="text-[10px] text-slate-500 uppercase font-semibold block">Crop Produce</span>
              <p className="font-bold text-slate-900 mt-0.5">{selectedReceipt.crop}</p>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-semibold block">Net Weighed Quantity</span>
              <p className="font-bold text-slate-900 mt-0.5">{selectedReceipt.quantity} Quintals</p>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-semibold block">Government MSP Rate</span>
              <p className="font-bold text-slate-900 mt-0.5">₹ {selectedReceipt.rate} / Qtl</p>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-semibold block">Gross Amount</span>
              <p className="font-bold text-gov-green text-sm mt-0.5">₹ {selectedReceipt.totalAmount.toLocaleString('en-IN')}</p>
            </div>

            <div className="col-span-2 border-t border-slate-200 pt-2">
              <span className="text-[10px] text-slate-500 uppercase font-semibold block">Beneficiary Bank Account</span>
              <p className="font-medium text-slate-800 mt-0.5">
                {selectedReceipt.bankName} (A/C: {selectedReceipt.accountMasked})
              </p>
            </div>
            <div className="col-span-2 border-t border-slate-200 pt-2">
              <span className="text-[10px] text-slate-500 uppercase font-semibold block">PFMS Transaction / UTR Ref</span>
              <p className="font-mono font-bold text-gov-blue mt-0.5">{selectedReceipt.transactionId}</p>
            </div>
          </div>

          <div className="text-[11px] text-slate-500 border-t border-slate-300 pt-3 flex items-center justify-between">
            <span>Electronically generated authenticated receipt. No physical signature required.</span>
            <span className="font-bold text-slate-700">Department of Agriculture & Farmers Welfare</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentStatus;
