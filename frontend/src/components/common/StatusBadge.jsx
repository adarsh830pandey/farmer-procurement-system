import React from 'react';

/**
 * Official Government Status Badge Component
 */
export const StatusBadge = ({ status, className = '' }) => {
  const normalizedStatus = String(status || '').toUpperCase().trim();

  let label = status;
  let bgClass = 'bg-slate-100 text-slate-800 border-slate-300';

  switch (normalizedStatus) {
    case 'BOOKED':
    case 'SLOT_BOOKED':
      label = 'SLOT BOOKED';
      bgClass = 'bg-blue-50 text-blue-900 border-blue-300';
      break;
    case 'ARRIVED':
    case 'FARMER_ARRIVED':
      label = 'ARRIVED AT CENTRE';
      bgClass = 'bg-amber-50 text-amber-900 border-amber-300';
      break;
    case 'WAITING':
    case 'QUEUE_WAITING':
      label = 'WAITING IN QUEUE';
      bgClass = 'bg-amber-100 text-amber-900 border-amber-400';
      break;
    case 'CALLED':
      label = 'TOKEN CALLED';
      bgClass = 'bg-purple-100 text-purple-900 border-purple-400 animate-pulse';
      break;
    case 'IN_PROCUREMENT':
    case 'IN PROCUREMENT':
    case 'PROCESSING':
      label = 'IN PROCUREMENT';
      bgClass = 'bg-sky-100 text-sky-900 border-sky-400';
      break;
    case 'COMPLETED':
    case 'PROCURED':
      label = 'PROCUREMENT COMPLETED';
      bgClass = 'bg-emerald-50 text-emerald-900 border-emerald-400';
      break;
    case 'PAID':
    case 'PAYMENT_COMPLETED':
      label = 'PAYMENT COMPLETED (DBT)';
      bgClass = 'bg-emerald-100 text-emerald-950 border-emerald-500 font-bold';
      break;
    case 'PAYMENT_PROCESSING':
    case 'PROCESSING_PAYMENT':
      label = 'PAYMENT PROCESSING (PFMS)';
      bgClass = 'bg-amber-50 text-amber-900 border-amber-300';
      break;
    case 'PAYMENT_PENDING':
    case 'PENDING':
      label = 'PAYMENT PENDING';
      bgClass = 'bg-yellow-50 text-yellow-900 border-yellow-300';
      break;
    case 'CANCELLED':
      label = 'CANCELLED';
      bgClass = 'bg-red-50 text-red-900 border-red-300';
      break;
    default:
      label = status || 'N/A';
      break;
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded text-xs font-semibold border ${bgClass} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 opacity-75"></span>
      {label}
    </span>
  );
};

export default StatusBadge;
