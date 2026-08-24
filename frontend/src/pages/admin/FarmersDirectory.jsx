import React, { useState } from 'react';
import { useToast } from '../../context/ToastContext';
import {
  Users,
  Search,
  Building2,
  Phone,
  Printer,
  CheckCircle2,
  Wheat,
  MapPin,
} from 'lucide-react';
import Emblem from '../../components/common/Emblem';

export const FarmersDirectory = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const [farmers] = useState([
    { id: 'KP-2026-8821', name: 'Ramesh Singh', mobile: '9876543210', village: 'Muradnagar Dehat', district: 'Ghaziabad', landAcres: 2.5, crop: 'Paddy (Rice)', estProduce: 60, status: 'VERIFIED' },
    { id: 'KP-2026-8822', name: 'Baldev Yadav', mobile: '9812345670', village: 'Rawli Kalan', district: 'Ghaziabad', landAcres: 3.0, crop: 'Paddy (Rice)', estProduce: 45, status: 'VERIFIED' },
    { id: 'KP-2026-8823', name: 'Sukhwinder Gill', mobile: '9789012345', village: 'Surana', district: 'Ghaziabad', landAcres: 5.2, crop: 'Paddy (Rice)', estProduce: 80, status: 'VERIFIED' },
    { id: 'KP-2026-8824', name: 'Harish Chandra', mobile: '9654321098', village: 'Niwari', district: 'Ghaziabad', landAcres: 1.8, crop: 'Paddy (Rice)', estProduce: 50, status: 'VERIFIED' },
    { id: 'KP-2026-8825', name: 'Manoj Kumar', mobile: '9543210987', village: 'Bhojpur', district: 'Ghaziabad', landAcres: 4.0, crop: 'Paddy (Rice)', estProduce: 70, status: 'VERIFIED' },
    { id: 'KP-2026-8826', name: 'Pritam Lal', mobile: '9711223344', village: 'Patla', district: 'Ghaziabad', landAcres: 2.2, crop: 'Paddy (Rice)', estProduce: 50, status: 'VERIFIED' },
  ]);

  const filteredFarmers = farmers.filter(
    (f) =>
      f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.mobile.includes(searchTerm) ||
      f.village.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-300 rounded shadow-gov p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
          <div>
            <h2 className="text-lg font-bold text-gov-navy flex items-center gap-2">
              <Users className="w-5 h-5 text-gov-blue" />
              Registered Farmers Jurisdiction Database
            </h2>
            <p className="text-xs text-slate-500">
              Aadhaar & Land Records Verified Farmers Enrolled in APMC Muradnagar Centre
            </p>
          </div>

          <button
            onClick={() => window.print()}
            className="px-3 py-1.5 bg-gov-navy text-white text-xs font-bold rounded shadow flex items-center gap-1 no-print"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Farmer Roll</span>
          </button>
        </div>

        {/* Search */}
        <div className="flex justify-between items-center bg-slate-50 p-3 rounded border border-slate-200 no-print">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by Name, Mobile, Village..."
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded focus:border-gov-blue focus:ring-1 focus:ring-gov-blue bg-white"
            />
          </div>
          <span className="text-xs text-slate-600 font-semibold hidden sm:inline">
            Total Farmers: <strong>{farmers.length}</strong>
          </span>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border border-slate-300">
            <thead className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300 uppercase text-[10px]">
              <tr>
                <th className="p-3 border-r border-slate-300">Farmer ID</th>
                <th className="p-3 border-r border-slate-300">Farmer Name</th>
                <th className="p-3 border-r border-slate-300">Mobile No.</th>
                <th className="p-3 border-r border-slate-300">Village & District</th>
                <th className="p-3 border-r border-slate-300 text-right">Land Holding</th>
                <th className="p-3 border-r border-slate-300">Registered Crop</th>
                <th className="p-3 border-r border-slate-300 text-right">Est. Produce</th>
                <th className="p-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-medium">
              {filteredFarmers.map((f) => (
                <tr key={f.id} className="hover:bg-slate-50">
                  <td className="p-3 border-r border-slate-200 font-mono font-bold text-gov-navy">
                    {f.id}
                  </td>
                  <td className="p-3 border-r border-slate-200 font-bold text-slate-900">
                    {f.name}
                  </td>
                  <td className="p-3 border-r border-slate-200 font-mono">
                    {f.mobile}
                  </td>
                  <td className="p-3 border-r border-slate-200">
                    {f.village}, {f.district}
                  </td>
                  <td className="p-3 border-r border-slate-200 text-right font-semibold">
                    {f.landAcres} Acres
                  </td>
                  <td className="p-3 border-r border-slate-200">
                    {f.crop}
                  </td>
                  <td className="p-3 border-r border-slate-200 text-right font-bold text-slate-900">
                    {f.estProduce} Qtl
                  </td>
                  <td className="p-3 text-center">
                    <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      ✓ {f.status}
                    </span>
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

export default FarmersDirectory;
