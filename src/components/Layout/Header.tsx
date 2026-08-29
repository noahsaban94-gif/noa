import React, { useState, useEffect } from 'react';
import { 
  Truck, 
  MapPin, 
  Radio, 
  Wifi, 
  WifiOff, 
  Bell, 
  ShieldCheck, 
  RefreshCw,
  Sparkles,
  PhoneCall
} from 'lucide-react';
import { DRIVERS, NOA_AVATAR_URL } from '../../lib/constants';
import { getOfflineQueueCount, clearOfflineQueue } from '../../lib/storage';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onQuickOrderClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab, onQuickOrderClick }) => {
  const [offlineCount, setOfflineCount] = useState<number>(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showDriverModal, setShowDriverModal] = useState(false);

  useEffect(() => {
    setOfflineCount(getOfflineQueueCount());
    const handleQueueUpdate = () => {
      setOfflineCount(getOfflineQueueCount());
    };
    window.addEventListener('offline_queue_updated', handleQueueUpdate);
    return () => window.removeEventListener('offline_queue_updated', handleQueueUpdate);
  }, []);

  const handleSyncNow = () => {
    setIsSyncing(true);
    setTimeout(() => {
      clearOfflineQueue();
      setIsSyncing(false);
    }, 1200);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#0B0F17]/85 backdrop-blur-xl border-b border-slate-800/80 px-4 py-3 sm:px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        
        {/* Brand & Persona */}
        <div className="flex items-center justify-between w-full md:w-auto gap-3">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img 
                src={NOA_AVATAR_URL} 
                alt="נועה AI" 
                className="w-11 h-11 rounded-full object-cover ring-2 ring-cyan-500/60 shadow-lg shadow-cyan-500/20"
                referrerPolicy="no-referrer"
              />
              <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-[#0B0F17] rounded-full animate-pulse" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent">
                  סידור נועה AI
                </h1>
                <span className="text-[11px] font-semibold bg-cyan-950/80 text-cyan-300 border border-cyan-700/50 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-cyan-400" />
                  SabanOS
                </span>
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-1.5 font-medium">
                <span>ח. סבן חומרי בניין בע"מ</span>
                <span className="text-slate-600">•</span>
                <span className="text-cyan-400 font-normal">סדרנית ראשית ומנהלת תפעול</span>
              </p>
            </div>
          </div>

          {/* Quick Stats on Mobile */}
          <div className="flex md:hidden items-center gap-2">
            <button 
              onClick={() => setActiveTab('driver')}
              className="px-2.5 py-1.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-lg text-xs font-semibold flex items-center gap-1"
            >
              <Truck className="w-3.5 h-3.5" />
              <span>נהג</span>
            </button>
          </div>
        </div>

        {/* Driver Fleet Status live bar */}
        <div className="flex items-center flex-wrap justify-center gap-2 text-xs">
          {/* Hikmat */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-slate-200">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <div className="text-right">
              <div className="flex items-center gap-1 font-semibold text-cyan-300">
                <span>חכמת 🚚</span>
                <span className="text-[10px] text-slate-400 font-mono">({DRIVERS.hikmat.truckNumber})</span>
              </div>
              <span className="text-[10px] text-slate-400 block max-w-[130px] truncate">
                📍 {DRIVERS.hikmat.currentLocationName}
              </span>
            </div>
            <a 
              href={`tel:${DRIVERS.hikmat.phone}`} 
              className="p-1 hover:bg-cyan-500/20 text-cyan-400 rounded transition"
              title="חייג לחכמת"
            >
              <PhoneCall className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Ali */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-slate-200">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <div className="text-right">
              <div className="flex items-center gap-1 font-semibold text-emerald-300">
                <span>עלי 🚛</span>
                <span className="text-[10px] text-slate-400 font-mono">({DRIVERS.ali.truckNumber})</span>
              </div>
              <span className="text-[10px] text-slate-400 block max-w-[130px] truncate">
                📍 {DRIVERS.ali.currentLocationName}
              </span>
            </div>
            <a 
              href={`tel:${DRIVERS.ali.phone}`} 
              className="p-1 hover:bg-emerald-500/20 text-emerald-400 rounded transition"
              title="חייג לעלי"
            >
              <PhoneCall className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Actions & Offline Sync status */}
        <div className="flex items-center gap-2.5">
          {offlineCount > 0 ? (
            <button
              onClick={handleSyncNow}
              disabled={isSyncing}
              className="px-2.5 py-1.5 rounded-lg bg-amber-500/15 border border-amber-500/40 text-amber-300 text-xs font-medium flex items-center gap-1.5 hover:bg-amber-500/25 transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>🟠 {offlineCount} ממתין לסנכרון</span>
            </button>
          ) : (
            <div className="px-2.5 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-medium flex items-center gap-1.5">
              <Wifi className="w-3.5 h-3.5" />
              <span>🟢 מסונכרן</span>
            </div>
          )}

          <button
            onClick={() => setActiveTab('chat')}
            className="px-3 py-1.5 bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white rounded-lg text-xs font-semibold shadow-md shadow-cyan-900/30 flex items-center gap-1.5 transition active:scale-95"
          >
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            <span>פקודה לנועה AI</span>
          </button>
        </div>

      </div>
    </header>
  );
};
