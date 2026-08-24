import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import queueService from '../../api/queueService';
import StatusBadge from '../../components/common/StatusBadge';
import { LoadingSpinner } from '../../components/common/LoadingSkeleton';
import {
  Users,
  Search,
  RefreshCw,
  Phone,
  CheckCircle2,
  AlertCircle,
  Play,
  Check,
  Building2,
  Printer,
  Megaphone,
} from 'lucide-react';
import Emblem from '../../components/common/Emblem';

export const QueueManagement = () => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const [queueList, setQueueList] = useState([
    { token: 'A102', farmer: 'Ramesh Singh', mobile: '9876543210', slot: '10:00 AM - 11:00 AM', quantity: 60, status: 'WAITING', crop: 'Paddy Grade A', vehicle: 'UP14-AB-1234', weighbridge: 'WB-02' },
    { token: 'A103', farmer: 'Baldev Yadav', mobile: '9812345670', slot: '10:00 AM - 11:00 AM', quantity: 45, status: 'CALLED', crop: 'Paddy Grade A', vehicle: 'HR26-C-9812', weighbridge: 'WB-02' },
    { token: 'A104', farmer: 'Pritam Lal', mobile: '9711223344', slot: '10:00 AM - 11:00 AM', quantity: 50, status: 'WAITING', crop: 'Paddy Grade A', vehicle: 'UP14-K-4421', weighbridge: 'WB-02' },
    { token: 'A095', farmer: 'Sukhwinder Gill', mobile: '9789012345', slot: '09:00 AM - 10:00 AM', quantity: 80, status: 'IN_PROCUREMENT', crop: 'Paddy Grade A', vehicle: 'PB10-M-0091', weighbridge: 'WB-01' },
    { token: 'A094', farmer: 'Harish Chandra', mobile: '9654321098', slot: '09:00 AM - 10:00 AM', quantity: 50, status: 'COMPLETED', crop: 'Paddy Grade A', vehicle: 'UP14-X-9988', weighbridge: 'WB-01' },
    { token: 'A093', farmer: 'Manoj Kumar', mobile: '9543210987', slot: '09:00 AM - 10:00 AM', quantity: 70, status: 'COMPLETED', crop: 'Paddy Grade A', vehicle: 'UP16-Z-1122', weighbridge: 'WB-01' },
  ]);

  useEffect(() => {
    fetchQueue();
  }, []);

  const fetchQueue = async () => {
    setLoading(true);
    try {
      const res = await queueService.getAdminQueue().catch(() => null);
      if (res?.queue?.length > 0) {
        setQueueList(res.queue);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (token, newStatus) => {
    try {
      await queueService.updateTokenStatus(token, newStatus).catch(() => null);
      setQueueList((prev) =>
        prev.map((item) => (item.token === token ? { ...item, status: newStatus } : item))
      );
      showToast(`Token ${token} status changed to ${newStatus}`, 'success');
    } catch (e) {
      showToast('Status update failed', 'error');
    }
  };

  const filteredQueue = queueList.filter((item) => {
    const matchesFilter = filterStatus === 'ALL' || item.status === filterStatus;
    const matchesSearch =
      item.token.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.farmer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.mobile.includes(searchTerm);
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Container */}
      <div className="bg-white border border-slate-300 rounded shadow-gov p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
          <div>
            <h2 className="text-lg font-bold text-gov-navy flex items-center gap-2">
              <Users className="w-5 h-5 text-gov-blue" />
              Mandi Queue & Token Master Console
            </h2>
            <p className="text-xs text-slate-500">
              Electronic token queue monitoring and weighbridge gate dispatch for Today
            </p>
          </div>

          <div className="flex items-center gap-2 no-print">
            <button
              onClick={fetchQueue}
              className="px-3 py-1.5 bg-slate-100 text-slate-700 text-xs font-semibold rounded hover:bg-slate-200 border border-slate-300 flex items-center gap-1"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh Queue</span>
            </button>
            <button
              onClick={() => window.print()}
              className="px-3 py-1.5 bg-gov-navy text-white text-xs font-bold rounded shadow hover:bg-gov-dark flex items-center gap-1"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Queue Sheet</span>
            </button>
          </div>
        </div>

        {/* Filter & Search Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 p-3 rounded border border-slate-200 text-xs no-print">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-bold text-slate-700">Filter Status:</span>
            {['ALL', 'WAITING', 'CALLED', 'IN_PROCUREMENT', 'COMPLETED'].map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-2.5 py-1 rounded text-[11px] font-semibold border ${
                  filterStatus === st
                    ? 'bg-gov-navy text-white border-gov-navy font-bold'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search Token, Farmer, Mobile..."
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded focus:border-gov-blue focus:ring-1 focus:ring-gov-blue bg-white"
            />
          </div>
        </div>

        {/* Queue Table (Section 14 Table requirement) */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border border-slate-300">
            <thead className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300 uppercase text-[10px]">
              <tr>
                <th className="p-3 border-r border-slate-300">Token</th>
                <th className="p-3 border-r border-slate-300">Farmer Name & Mobile</th>
                <th className="p-3 border-r border-slate-300">Produce & Vehicle</th>
                <th className="p-3 border-r border-slate-300">Allotted Slot</th>
                <th className="p-3 border-r border-slate-300 text-right">Est. Quantity</th>
                <th className="p-3 border-r border-slate-300 text-center">Queue Status</th>
                <th className="p-3 text-center no-print">Officer Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-medium">
              {filteredQueue.map((item) => (
                <tr key={item.token} className="hover:bg-slate-50">
                  <td className="p-3 border-r border-slate-200 font-mono font-extrabold text-gov-navy text-sm">
                    {item.token}
                  </td>
                  <td className="p-3 border-r border-slate-200">
                    <span className="font-bold text-slate-900 block">{item.farmer}</span>
                    <span className="text-[10px] text-slate-500 flex items-center gap-1">
                      <Phone className="w-3 h-3 text-slate-400" />
                      {item.mobile}
                    </span>
                  </td>
                  <td className="p-3 border-r border-slate-200">
                    <span className="text-slate-800 block">{item.crop}</span>
                    <span className="text-[10px] text-slate-500 font-mono">{item.vehicle}</span>
                  </td>
                  <td className="p-3 border-r border-slate-200 font-semibold text-slate-700">
                    {item.slot}
                  </td>
                  <td className="p-3 border-r border-slate-200 text-right font-bold">
                    {item.quantity} Qtl
                  </td>
                  <td className="p-3 border-r border-slate-200 text-center">
                    <StatusBadge status={item.status} />
                  </td>
                  <td className="p-3 text-center no-print space-x-1 whitespace-nowrap">
                    {item.status === 'WAITING' && (
                      <button
                        onClick={() => handleUpdateStatus(item.token, 'CALLED')}
                        className="px-2.5 py-1 bg-purple-700 text-white rounded text-[11px] font-bold hover:bg-purple-800 inline-flex items-center gap-1 shadow-sm"
                      >
                        <Megaphone className="w-3 h-3 text-amber-300" />
                        <span>Call Farmer</span>
                      </button>
                    )}
                    {item.status === 'CALLED' && (
                      <button
                        onClick={() => handleUpdateStatus(item.token, 'IN_PROCUREMENT')}
                        className="px-2.5 py-1 bg-gov-blue text-white rounded text-[11px] font-bold hover:bg-gov-navy inline-flex items-center gap-1 shadow-sm"
                      >
                        <Play className="w-3 h-3 text-emerald-300" />
                        <span>Start Weighment</span>
                      </button>
                    )}
                    {item.status === 'IN_PROCUREMENT' && (
                      <button
                        onClick={() => handleUpdateStatus(item.token, 'COMPLETED')}
                        className="px-2.5 py-1 bg-emerald-700 text-white rounded text-[11px] font-bold hover:bg-emerald-800 inline-flex items-center gap-1 shadow-sm"
                      >
                        <Check className="w-3 h-3" />
                        <span>Mark Completed</span>
                      </button>
                    )}
                    {item.status === 'COMPLETED' && (
                      <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-1 rounded border border-emerald-300">
                        ✓ Procurement Done
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default QueueManagement;
