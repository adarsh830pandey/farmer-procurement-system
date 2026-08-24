import React, { useState, useEffect } from 'react';
import { useToast } from '../../context/ToastContext';
import paymentService from '../../api/paymentService';
import StatusBadge from '../../components/common/StatusBadge';
import Modal from '../../components/common/Modal';
import {
  CreditCard,
  Search,
  CheckCircle2,
  Clock,
  Printer,
  RefreshCw,
  Edit,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import Emblem from '../../components/common/Emblem';

export const PaymentManagement = () => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const [payments, setPayments] = useState([
    {
      id: 'PAY-2026-08-9921',
      farmer: 'Ramesh Singh',
      mobile: '9876543210',
      accountNumber: 'XXXXXX4920',
      amount: 132000,
      status: 'PAYMENT_PROCESSING',
      date: '28 Aug 2026',
      transactionId: 'PFMS2026082800921',
      slipNo: 'MW-9912',
      quantity: 60,
    },
    {
      id: 'PAY-2026-08-9920',
      farmer: 'Harish Chandra',
      mobile: '9654321098',
      accountNumber: 'XXXXXX1190',
      amount: 110000,
      status: 'PAID',
      date: '28 Aug 2026',
      transactionId: 'PFMS2026082800889',
      slipNo: 'MW-9911',
      quantity: 50,
    },
    {
      id: 'PAY-2026-08-9919',
      farmer: 'Manoj Kumar',
      mobile: '9543210987',
      accountNumber: 'XXXXXX7721',
      amount: 154000,
      status: 'PAID',
      date: '28 Aug 2026',
      transactionId: 'PFMS2026082800812',
      slipNo: 'MW-9910',
      quantity: 70,
    },
    {
      id: 'PAY-2026-08-9918',
      farmer: 'Baldev Yadav',
      mobile: '9812345670',
      accountNumber: 'XXXXXX3301',
      amount: 99000,
      status: 'PAYMENT_PENDING',
      date: '28 Aug 2026',
      transactionId: 'PENDING_VALIDATION',
      slipNo: 'MW-9909',
      quantity: 45,
    },
  ]);

  const [editPayment, setEditPayment] = useState(null);
  const [newStatus, setNewStatus] = useState('PAID');
  const [newTxnId, setNewTxnId] = useState('');

  const handleOpenEdit = (p) => {
    setEditPayment(p);
    setNewStatus(p.status);
    setNewTxnId(p.transactionId === 'PENDING_VALIDATION' ? `PFMS-DBT-${Date.now().toString().slice(-8)}` : p.transactionId);
  };

  const handleUpdatePayment = (e) => {
    e.preventDefault();
    if (!editPayment) return;

    setPayments((prev) =>
      prev.map((p) =>
        p.id === editPayment.id
          ? { ...p, status: newStatus, transactionId: newTxnId }
          : p
      )
    );

    showToast(`Payment status for ${editPayment.farmer} updated to ${newStatus}`, 'success');
    setEditPayment(null);
  };

  const filteredPayments = payments.filter((p) => {
    const matchesFilter = statusFilter === 'ALL' || p.status === statusFilter;
    const matchesSearch =
      p.farmer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.mobile.includes(searchTerm) ||
      p.id.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-300 rounded shadow-gov p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
          <div>
            <h2 className="text-lg font-bold text-gov-navy flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-gov-green" />
              Direct Benefit Transfer (DBT) & PFMS Payment Management
            </h2>
            <p className="text-xs text-slate-500">
              Department of Agriculture & State Treasury Payout Reconciliation
            </p>
          </div>

          <button
            onClick={() => window.print()}
            className="px-3 py-1.5 bg-gov-navy text-white text-xs font-bold rounded shadow flex items-center gap-1 no-print"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Payout Statement</span>
          </button>
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 p-3 rounded border border-slate-200 text-xs no-print">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-bold text-slate-700">Filter Status:</span>
            {['ALL', 'PAID', 'PAYMENT_PROCESSING', 'PAYMENT_PENDING'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 rounded text-[11px] font-semibold border ${
                  statusFilter === st
                    ? 'bg-gov-navy text-white border-gov-navy font-bold'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                }`}
              >
                {st.replace('PAYMENT_', '')}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search Farmer, Mobile, ID..."
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded focus:border-gov-blue focus:ring-1 focus:ring-gov-blue bg-white"
            />
          </div>
        </div>

        {/* Table (Section 14 Table requirement) */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border border-slate-300">
            <thead className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300 uppercase text-[10px]">
              <tr>
                <th className="p-3 border-r border-slate-300">Farmer & Account</th>
                <th className="p-3 border-r border-slate-300">Slip No & Date</th>
                <th className="p-3 border-r border-slate-300 text-right">Quantity</th>
                <th className="p-3 border-r border-slate-300 text-right">Amount (₹)</th>
                <th className="p-3 border-r border-slate-300 text-center">Payment Status</th>
                <th className="p-3 border-r border-slate-300">Transaction ID</th>
                <th className="p-3 text-center no-print">Update</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-medium">
              {filteredPayments.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50">
                  <td className="p-3 border-r border-slate-200">
                    <span className="font-bold text-slate-900 block">{p.farmer}</span>
                    <span className="text-[10px] text-slate-500">{p.mobile} | A/C: {p.accountNumber}</span>
                  </td>
                  <td className="p-3 border-r border-slate-200">
                    <span className="font-mono text-slate-800 font-bold">{p.slipNo}</span>
                    <span className="text-[10px] text-slate-500 block">{p.date}</span>
                  </td>
                  <td className="p-3 border-r border-slate-200 text-right font-bold">
                    {p.quantity} Qtl
                  </td>
                  <td className="p-3 border-r border-slate-200 text-right font-black text-gov-green text-sm">
                    ₹ {p.amount.toLocaleString('en-IN')}
                  </td>
                  <td className="p-3 border-r border-slate-200 text-center">
                    <StatusBadge status={p.status} />
                  </td>
                  <td className="p-3 border-r border-slate-200 font-mono text-[11px] text-slate-700">
                    {p.transactionId}
                  </td>
                  <td className="p-3 text-center no-print">
                    <button
                      onClick={() => handleOpenEdit(p)}
                      className="p-1.5 bg-slate-100 text-gov-navy border border-slate-300 rounded hover:bg-slate-200"
                      title="Update Payment & UTR"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Payment Status Modal */}
      <Modal
        isOpen={!!editPayment}
        onClose={() => setEditPayment(null)}
        title={`Update DBT Payout - ${editPayment?.farmer}`}
      >
        <form onSubmit={handleUpdatePayment} className="space-y-4 text-xs">
          <div>
            <span className="text-slate-500 block">Farmer Name:</span>
            <strong className="text-slate-900">{editPayment?.farmer} ({editPayment?.mobile})</strong>
          </div>
          <div>
            <span className="text-slate-500 block">Total Payout Amount:</span>
            <strong className="text-gov-green text-sm font-mono">₹ {editPayment?.amount?.toLocaleString('en-IN')}</strong>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Select Payout Status*
            </label>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded font-bold bg-white"
            >
              <option value="PAID">PAID (DBT Transferred)</option>
              <option value="PAYMENT_PROCESSING">PAYMENT_PROCESSING (Under PFMS)</option>
              <option value="PAYMENT_PENDING">PAYMENT_PENDING</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              PFMS Transaction ID / Bank UTR Number*
            </label>
            <input
              type="text"
              value={newTxnId}
              onChange={(e) => setNewTxnId(e.target.value)}
              required
              className="w-full p-2 border border-slate-300 rounded font-mono font-bold uppercase"
            />
          </div>

          <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setEditPayment(null)}
              className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-gov-navy text-white rounded font-bold hover:bg-gov-dark shadow"
            >
              Save Payment Update
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default PaymentManagement;
