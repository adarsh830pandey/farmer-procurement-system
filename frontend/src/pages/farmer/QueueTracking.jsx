import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useLang } from '../../context/LanguageAndAccessibilityContext';
import queueService from '../../api/queueService';
import StatusBadge from '../../components/common/StatusBadge';
import {
  Users,
  RefreshCw,
  Clock,
  Building2,
  AlertCircle,
  Bell,
  Scale,
  CheckCircle2,
  Radio,
} from 'lucide-react';
import Emblem from '../../components/common/Emblem';

export const QueueTracking = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const { lang, t } = useLang();
  const location = useLocation();

  // Query parameter token if searched from homepage
  const queryParams = new URLSearchParams(location.search);
  const searchToken = queryParams.get('token');

  const [loading, setLoading] = useState(false);
  const [pollingActive, setPollingActive] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date().toLocaleTimeString('en-IN'));

  // Live Queue state
  const [queueData, setQueueData] = useState({
    tokenNumber: searchToken || 'A102',
    currentServingToken: 'A095',
    farmersAhead: 6,
    estimatedWaitMinutes: 35,
    status: 'WAITING',
    centreName: 'APMC Mandi Yard, Muradnagar (Weighbridge #2)',
    gateNumber: 'Gate 2A',
    slotTime: '10:00 AM – 11:00 AM',
    date: '28 August 2026',
    crop: 'Paddy / धान (Grade A)',
  });

  const pollTimerRef = useRef(null);

  useEffect(() => {
    fetchQueueStatus();

    // Auto-polling interval: 6 seconds
    if (pollingActive) {
      pollTimerRef.current = setInterval(() => {
        fetchQueueStatus(true);
      }, 6000);
    }

    return () => {
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
    };
  }, [pollingActive]);

  const fetchQueueStatus = async (isBackground = false) => {
    if (!isBackground) setLoading(true);
    try {
      const res = await queueService.getMyQueueStatus().catch(() => null);
      if (res?.queue) {
        setQueueData((prev) => ({
          ...prev,
          ...res.queue,
        }));
      }
      setLastUpdated(new Date().toLocaleTimeString('en-IN'));
    } catch (err) {
      console.warn('Queue sync error:', err);
    } finally {
      if (!isBackground) setLoading(false);
    }
  };

  const handleManualRefresh = () => {
    fetchQueueStatus(false);
    showToast('Queue status refreshed with live Mandi server', 'info', 2000);
  };

  return (
    <div className="space-y-6">
      {/* Official Government Queue Display Card */}
      <div className="bg-white border-2 border-gov-navy rounded shadow-gov overflow-hidden">
        {/* Header */}
        <div className="bg-[#0b2545] text-white p-5 border-b-2 border-gov-saffron flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Emblem className="w-8 h-10 text-white" />
            <div>
              <h2 className="text-base sm:text-lg font-bold">
                {lang === 'hi' ? 'लाइव मंडी कतार एवं टोकन स्थिति' : 'Live Mandi Queue & Token Tracking'}
              </h2>
              <p className="text-xs text-slate-300">
                Real-Time Weighbridge Electronic Queue Management System
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-[#134074] text-emerald-300 px-2.5 py-1 rounded border border-blue-400/30">
              <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              Live Server Feed
            </span>

            <button
              onClick={handleManualRefresh}
              className="p-1.5 bg-white text-gov-navy rounded hover:bg-slate-100 transition-colors"
              title="Refresh Queue"
              aria-label="Refresh Queue Data"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Center & Location Strip */}
        <div className="bg-slate-100 border-b border-slate-300 px-5 py-2 text-xs flex flex-wrap items-center justify-between gap-2 text-slate-700">
          <div>
            Centre: <strong>{queueData.centreName}</strong> ({queueData.gateNumber})
          </div>
          <div>
            Slot Time: <strong>{queueData.slotTime}</strong> | Date: <strong>{queueData.date}</strong>
          </div>
        </div>

        {/* Core Queue Visual Display (Prominently styled as per Section 11) */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Main Numbers Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Box 1: Your Token */}
            <div className="bg-gov-ice border-2 border-gov-blue rounded p-6 text-center shadow-sm">
              <span className="text-xs font-bold text-gov-blue uppercase tracking-wider block">
                {lang === 'hi' ? 'आपका टोकन नंबर' : 'Your Allotted Token'}
              </span>
              <div className="text-4xl sm:text-5xl font-black text-gov-navy font-mono my-2 tracking-tight">
                {queueData.tokenNumber}
              </div>
              <div className="mt-2">
                <StatusBadge status={queueData.status} className="text-xs px-3 py-1 font-bold" />
              </div>
            </div>

            {/* Box 2: Current Token Being Served */}
            <div className="bg-amber-50 border-2 border-amber-400 rounded p-6 text-center shadow-sm">
              <span className="text-xs font-bold text-amber-900 uppercase tracking-wider block">
                {lang === 'hi' ? 'वर्तमान में सेवाधीन टोकन' : 'Current Token Being Served'}
              </span>
              <div className="text-4xl sm:text-5xl font-black text-amber-950 font-mono my-2 tracking-tight">
                {queueData.currentServingToken}
              </div>
              <span className="inline-block text-xs font-bold text-amber-900 bg-amber-200/80 px-2.5 py-0.5 rounded">
                At Electronic Weighbridge #2
              </span>
            </div>
          </div>

          {/* Key Queue Metrics (Farmers Ahead & Estimated Time) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-slate-50 border border-slate-300 p-4 rounded text-center">
              <span className="text-xs text-slate-500 font-semibold uppercase block">
                Farmers Ahead of You (आगे शेष किसान)
              </span>
              <p className="text-2xl font-black text-gov-navy mt-1">
                {queueData.farmersAhead} Farmers
              </p>
              <span className="text-[11px] text-slate-500">Tokens A096 to A101</span>
            </div>

            <div className="bg-slate-50 border border-slate-300 p-4 rounded text-center">
              <span className="text-xs text-slate-500 font-semibold uppercase block">
                Estimated Waiting Time (अनुमानित प्रतीक्षा समय)
              </span>
              <p className="text-2xl font-black text-amber-800 mt-1">
                ~ {queueData.estimatedWaitMinutes} Minutes
              </p>
              <span className="text-[11px] text-slate-500">Approx. 5-6 mins per tractor weighment</span>
            </div>
          </div>

          {/* Farmer Advisory Notification (Section 11 requirement) */}
          <div className="bg-blue-50 border border-blue-300 p-4 rounded text-xs text-blue-950 flex items-start gap-3">
            <Bell className="w-5 h-5 text-gov-blue mt-0.5 flex-shrink-0 animate-bounce" />
            <div className="space-y-0.5">
              <h4 className="font-bold text-gov-navy text-xs">
                {lang === 'hi' ? 'महत्वपूर्ण सूचना (Farmer Advisory):' : 'Important Advisory for Farmers:'}
              </h4>
              <p className="leading-relaxed">
                "Please remain available near Gate #2 with your produce vehicle. You will be notified via SMS and portal announcement when your token is called for moisture analysis & weighbridge entry."
              </p>
            </div>
          </div>

          {/* Polling & Sync Status Footer */}
          <div className="pt-3 border-t border-slate-200 flex flex-wrap items-center justify-between text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>Auto-refresh active (Last sync: {lastUpdated})</span>
            </div>

            <button
              onClick={() => setPollingActive(!pollingActive)}
              className="text-gov-blue font-semibold hover:underline"
            >
              {pollingActive ? 'Pause Auto-refresh' : 'Resume Auto-refresh'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QueueTracking;
