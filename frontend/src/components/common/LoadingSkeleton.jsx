import React from 'react';
import { Loader2, Inbox, AlertCircle } from 'lucide-react';

export const LoadingSpinner = ({ text = 'Loading records from official server...' }) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center text-slate-600">
      <Loader2 className="w-8 h-8 text-gov-blue animate-spin mb-3" />
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-700">{text}</p>
    </div>
  );
};

export const CardSkeleton = () => {
  return (
    <div className="bg-white border border-slate-200 p-5 rounded animate-pulse space-y-4">
      <div className="h-4 bg-slate-200 rounded w-1/3"></div>
      <div className="h-8 bg-slate-100 rounded w-2/3"></div>
      <div className="h-4 bg-slate-200 rounded w-1/2"></div>
    </div>
  );
};

export const TableSkeleton = ({ rows = 4, cols = 5 }) => {
  return (
    <div className="bg-white border border-slate-200 rounded overflow-hidden animate-pulse">
      <div className="bg-slate-100 h-10 border-b border-slate-200"></div>
      {Array.from({ length: rows }).map((_, rIdx) => (
        <div key={rIdx} className="p-3.5 border-b border-slate-100 flex gap-4">
          {Array.from({ length: cols }).map((_, cIdx) => (
            <div key={cIdx} className="h-4 bg-slate-200 rounded flex-1"></div>
          ))}
        </div>
      ))}
    </div>
  );
};

export const EmptyState = ({
  title = 'No Records Found',
  description = 'There are no records available for this selection at this moment.',
  action,
}) => {
  return (
    <div className="bg-white border border-dashed border-slate-300 p-8 rounded text-center my-4">
      <Inbox className="w-10 h-10 text-slate-400 mx-auto mb-2" />
      <h4 className="text-sm font-bold text-slate-800">{title}</h4>
      <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">{description}</p>
      {action}
    </div>
  );
};

export const ErrorState = ({
  title = 'Unable to Load Data',
  message = 'Please ensure backend server is running or check your internet connection.',
  onRetry,
}) => {
  return (
    <div className="bg-red-50 border border-red-200 p-6 rounded text-center my-4">
      <AlertCircle className="w-8 h-8 text-red-600 mx-auto mb-2" />
      <h4 className="text-sm font-bold text-red-950">{title}</h4>
      <p className="text-xs text-red-800 max-w-md mx-auto mt-1 mb-4">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-3 py-1.5 bg-red-700 text-white rounded text-xs font-semibold hover:bg-red-800"
        >
          Retry Request
        </button>
      )}
    </div>
  );
};
