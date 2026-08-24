import React, { useState, useEffect } from 'react';
import { useToast } from '../../context/ToastContext';
import slotService from '../../api/slotService';
import Modal from '../../components/common/Modal';
import {
  Calendar,
  Plus,
  Trash2,
  Lock,
  Unlock,
  CheckCircle2,
  Clock,
  Sliders,
  Printer,
  RefreshCw,
} from 'lucide-react';

export const SlotManagement = () => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState('2026-08-28');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [newSlot, setNewSlot] = useState({
    time: '05:00 PM – 06:00 PM',
    capacity: 20,
  });

  const [slots, setSlots] = useState([
    { id: 'slot-1', time: '08:00 AM – 09:00 AM', totalCapacity: 20, bookedCount: 20, available: 0, status: 'FULL' },
    { id: 'slot-2', time: '09:00 AM – 10:00 AM', totalCapacity: 20, bookedCount: 18, available: 2, status: 'OPEN' },
    { id: 'slot-3', time: '10:00 AM – 11:00 AM', totalCapacity: 20, bookedCount: 8, available: 12, status: 'OPEN' },
    { id: 'slot-4', time: '11:00 AM – 12:00 PM', totalCapacity: 20, bookedCount: 11, available: 9, status: 'OPEN' },
    { id: 'slot-5', time: '12:00 PM – 01:00 PM', totalCapacity: 20, bookedCount: 5, available: 15, status: 'OPEN' },
    { id: 'slot-6', time: '02:00 PM – 03:00 PM', totalCapacity: 20, bookedCount: 7, available: 13, status: 'OPEN' },
    { id: 'slot-7', time: '03:00 PM – 04:00 PM', totalCapacity: 20, bookedCount: 4, available: 16, status: 'OPEN' },
    { id: 'slot-8', time: '04:00 PM – 05:00 PM', totalCapacity: 20, bookedCount: 2, available: 18, status: 'OPEN' },
  ]);

  const handleToggleStatus = (slotId) => {
    setSlots((prev) =>
      prev.map((s) => {
        if (s.id === slotId) {
          const nextStatus = s.status === 'OPEN' ? 'CLOSED' : 'OPEN';
          showToast(`Slot ${s.time} marked as ${nextStatus}`, 'info');
          return { ...s, status: nextStatus };
        }
        return s;
      })
    );
  };

  const handleDeleteSlot = (slotId) => {
    setSlots((prev) => prev.filter((s) => s.id !== slotId));
    showToast('Slot deleted from daily schedule', 'success');
  };

  const handleCreateSlot = (e) => {
    e.preventDefault();
    if (!newSlot.time.trim()) {
      showToast('Please specify slot time range', 'warning');
      return;
    }
    const created = {
      id: `slot-${Date.now()}`,
      time: newSlot.time,
      totalCapacity: Number(newSlot.capacity) || 20,
      bookedCount: 0,
      available: Number(newSlot.capacity) || 20,
      status: 'OPEN',
    };
    setSlots((prev) => [...prev, created]);
    setIsModalOpen(false);
    showToast('New procurement time slot added successfully', 'success');
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-300 rounded shadow-gov p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
          <div>
            <h2 className="text-lg font-bold text-gov-navy flex items-center gap-2">
              <Calendar className="w-5 h-5 text-gov-blue" />
              Procurement Slot & Quota Management
            </h2>
            <p className="text-xs text-slate-500">
              Configure weighbridge hourly throughput, maximum vehicle slots, and daily booking limits.
            </p>
          </div>

          <div className="flex items-center gap-2 no-print">
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-3.5 py-2 bg-gov-navy text-white text-xs font-bold rounded shadow hover:bg-gov-dark flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4 text-amber-300" />
              <span>Create New Time Slot</span>
            </button>
          </div>
        </div>

        {/* Date Selector */}
        <div className="flex items-center gap-3 bg-slate-50 p-3 rounded border border-slate-200 text-xs">
          <span className="font-bold text-slate-700">Configuring Schedule For Date:</span>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="p-1.5 border border-slate-300 rounded font-semibold text-xs bg-white"
          />
          <span className="text-[11px] text-slate-500">Total Mandi Capacity: 160 Vehicles / Day</span>
        </div>

        {/* Slot Grid Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border border-slate-300">
            <thead className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300 uppercase text-[10px]">
              <tr>
                <th className="p-3 border-r border-slate-300">Time Window</th>
                <th className="p-3 border-r border-slate-300 text-center">Max Capacity</th>
                <th className="p-3 border-r border-slate-300 text-center">Booked Vehicles</th>
                <th className="p-3 border-r border-slate-300 text-center">Available Capacity</th>
                <th className="p-3 border-r border-slate-300 text-center">Slot Status</th>
                <th className="p-3 text-center no-print">Admin Controls</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-medium">
              {slots.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50">
                  <td className="p-3 border-r border-slate-200 font-bold text-slate-900 flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    {s.time}
                  </td>
                  <td className="p-3 border-r border-slate-200 text-center font-semibold">
                    {s.totalCapacity} Slots
                  </td>
                  <td className="p-3 border-r border-slate-200 text-center font-bold text-gov-navy">
                    {s.bookedCount} Booked
                  </td>
                  <td className="p-3 border-r border-slate-200 text-center font-extrabold text-gov-green">
                    {s.available}
                  </td>
                  <td className="p-3 border-r border-slate-200 text-center">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                        s.status === 'FULL'
                          ? 'bg-red-100 text-red-800'
                          : s.status === 'CLOSED'
                          ? 'bg-slate-200 text-slate-700'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {s.status}
                    </span>
                  </td>
                  <td className="p-3 text-center space-x-2 no-print">
                    <button
                      onClick={() => handleToggleStatus(s.id)}
                      className={`px-2 py-1 rounded text-[11px] font-semibold border ${
                        s.status === 'CLOSED'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                          : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
                      }`}
                      title="Open / Close slot"
                    >
                      {s.status === 'CLOSED' ? (
                        <span className="flex items-center gap-1">
                          <Unlock className="w-3 h-3 text-emerald-600" />
                          Open
                        </span>
                      ) : (
                        <span className="flex items-center gap-1">
                          <Lock className="w-3 h-3 text-slate-500" />
                          Close
                        </span>
                      )}
                    </button>

                    <button
                      onClick={() => handleDeleteSlot(s.id)}
                      className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
                      title="Delete Slot"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal for Creating New Slot */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add New Daily Procurement Slot"
      >
        <form onSubmit={handleCreateSlot} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Time Window Range (e.g. 05:00 PM – 06:00 PM)*
            </label>
            <input
              type="text"
              value={newSlot.time}
              onChange={(e) => setNewSlot({ ...newSlot, time: e.target.value })}
              required
              className="w-full p-2 border border-slate-300 rounded focus:border-gov-blue focus:ring-1 focus:ring-gov-blue"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Slot Quota / Capacity (Vehicle Count)*
            </label>
            <input
              type="number"
              min="1"
              max="50"
              value={newSlot.capacity}
              onChange={(e) => setNewSlot({ ...newSlot, capacity: e.target.value })}
              required
              className="w-full p-2 border border-slate-300 rounded focus:border-gov-blue focus:ring-1 focus:ring-gov-blue"
            />
          </div>

          <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded font-semibold hover:bg-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-gov-navy text-white rounded font-bold hover:bg-gov-dark shadow"
            >
              Add Time Slot
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default SlotManagement;
