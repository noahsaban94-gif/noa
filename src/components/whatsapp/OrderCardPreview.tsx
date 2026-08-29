import React, { useState } from 'react';
import { 
  Package, 
  MapPin, 
  Layers, 
  Navigation as NavIcon, 
  Send, 
  Copy, 
  Check, 
  Volume2, 
  Code, 
  Building2,
  Clock,
  Sparkles,
  Phone,
  Truck,
  CheckCircle2,
  ExternalLink,
  Calendar,
  Eye,
  FileText,
  Boxes
} from 'lucide-react';
import { LogisticsOrder, DriverId } from '../../types/logistics';
import { createMakePayload } from '../../lib/parser';
import { DRIVERS } from '../../lib/constants';

interface OrderCardPreviewProps {
  order: Partial<LogisticsOrder>;
  onDispatch?: () => void;
  onAudioBriefing?: () => void;
  onViewDetails?: () => void;
  onUpdateStatus?: (newStatus: any) => void;
}

export const OrderCardPreview: React.FC<OrderCardPreviewProps> = ({
  order,
  onDispatch,
  onAudioBriefing,
  onViewDetails,
  onUpdateStatus
}) => {
  const [copiedJson, setCopiedJson] = useState(false);
  const [showJson, setShowJson] = useState(false);
  const [copiedWaze, setCopiedWaze] = useState(false);

  const payload = createMakePayload(order);
  const dep = order.deposit || { palletsCount: 0, bigBagsCount: 0, isExempt: false };

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  const handleCopyWaze = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedWaze(true);
    setTimeout(() => setCopiedWaze(false), 2000);
  };

  const driverKey = order.assignedDriver as 'hikmat' | 'ali' | undefined;
  const driverInfo = driverKey && DRIVERS[driverKey] ? DRIVERS[driverKey] : null;

  const isTalmid = order.warehouse === '1_TALMID';
  const isCrane = order.isCraneRequired || order.assignedDriver === 'hikmat';

  // Status mapping badge
  const getStatusBadge = () => {
    switch (order.status) {
      case 'on_the_way':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">🚚 בדרך ליעד</span>;
      case 'loading':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">⏳ בהעמסה במחסן</span>;
      case 'delivered':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">✅ סופק ונפרק</span>;
      case 'dispatched_whatsapp':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-500/20 text-teal-300 border border-teal-500/40">📲 שוגר לוואטסאפ</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">📋 ממתין בסידור</span>;
    }
  };

  return (
    <div className="my-2.5 p-4 rounded-2xl bg-gradient-to-br from-[#121B22] via-[#0F172A] to-[#121B22] border border-cyan-500/30 text-slate-100 shadow-2xl max-w-xl transition-all duration-300 hover:border-cyan-400/50">
      
      {/* Top Header with Order ID, Warehouse & Status */}
      <div className="flex items-start justify-between gap-2 pb-3 mb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className={`p-2.5 rounded-xl ${isCrane ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'}`}>
            <Package className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-extrabold text-sm sm:text-base text-white font-mono tracking-wide">
                #{order.orderNumber || 'הזמנה חדשה'}
              </span>
              {getStatusBadge()}
            </div>
            <h4 className="text-xs sm:text-sm font-bold text-cyan-300 mt-0.5">
              {order.customerName || 'לקוח לא מוגדר'}
            </h4>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1 shrink-0">
          <span className={`px-2.5 py-1 text-[11px] font-extrabold rounded-lg shadow-sm ${
            isTalmid 
              ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-600/50' 
              : 'bg-cyan-950/80 text-cyan-300 border border-cyan-600/50'
          }`}>
            {isTalmid ? '🏟️ מחסן 1 התלמיד' : '🏭 מחסן 4 החרש'}
          </span>
          {isCrane && (
            <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-amber-950/80 text-amber-300 border border-amber-700/50">
              🏗️ מנוף נדרש
            </span>
          )}
        </div>
      </div>

      {/* Destination, Driver, Time Info Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs mb-3.5 bg-slate-950/70 p-3 rounded-xl border border-slate-800/80">
        
        {/* Address */}
        <div className="flex items-center gap-2 text-slate-200">
          <MapPin className="w-4 h-4 text-rose-400 shrink-0" />
          <div className="min-w-0">
            <span className="text-[10px] text-slate-400 block font-medium">יעד פריקה:</span>
            <span className="font-semibold text-white truncate block">{order.siteAddress || order.city || 'איסוף עצמי'}</span>
          </div>
        </div>

        {/* Driver Assigned */}
        <div className="flex items-center gap-2 text-slate-200">
          <Truck className="w-4 h-4 text-cyan-400 shrink-0" />
          <div className="min-w-0">
            <span className="text-[10px] text-slate-400 block font-medium">נהג משובץ:</span>
            <span className="font-semibold text-cyan-200 truncate block">
              {driverInfo ? `${driverInfo.name} (${driverInfo.truckType})` : (order.driverName || 'חכמת / עלי')}
            </span>
          </div>
        </div>

        {/* Scheduled Slot */}
        <div className="flex items-center gap-2 text-slate-200">
          <Clock className="w-4 h-4 text-amber-400 shrink-0" />
          <div className="min-w-0">
            <span className="text-[10px] text-slate-400 block font-medium">מועד אספקה:</span>
            <span className="font-semibold text-white truncate block">
              {order.scheduledTime || '08:00'} • {order.timeSlot || 'סבב בוקר'}
            </span>
          </div>
        </div>

        {/* Customer / Site Contact */}
        <div className="flex items-center gap-2 text-slate-200">
          <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
          <div className="min-w-0">
            <span className="text-[10px] text-slate-400 block font-medium">איש קשר באתר:</span>
            <span className="font-semibold text-emerald-300 truncate block">
              {order.clientPhone || '050-886-0896'}
            </span>
          </div>
        </div>

      </div>

      {/* Materials List */}
      <div className="space-y-1.5 mb-3.5 text-xs">
        <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 mb-1">
          <span className="flex items-center gap-1">
            <Boxes className="w-3.5 h-3.5 text-cyan-400" />
            פירוט חומרים שנרמלו ({order.items?.length || 0} פריטים):
          </span>
          {order.distanceKm && (
            <span className="text-slate-400 font-mono text-[10px]">מרחק: {order.distanceKm} ק״מ</span>
          )}
        </div>

        <div className="space-y-1 max-h-36 overflow-y-auto custom-scrollbar pr-1">
          {(order.items || []).map((item, idx) => (
            <div key={idx} className="flex items-center justify-between py-1.5 px-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition">
              <span className="text-slate-200 text-xs truncate max-w-[240px]">
                <span className="text-slate-500 font-mono ml-1.5 text-[10px]">{item.sku}</span>
                {item.name}
              </span>
              <span className="font-bold text-cyan-300 font-mono text-xs whitespace-nowrap bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-900">
                {item.quantity} {item.unit}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Auto Deposit Calculation Card (Sabun Rules) */}
      <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/30 text-xs mb-3.5">
        <div className="flex items-center justify-between font-semibold text-amber-300 mb-1.5">
          <span className="flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-amber-400" />
            אימות פקדונות אוטומטי (נועה AI)
          </span>
          <span className="text-[10px] text-amber-400/80 font-mono bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-800/50">
            חוקי סבן
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300">
          <div className="p-1.5 bg-slate-950/40 rounded-lg border border-slate-800 flex items-center justify-between">
            <span className="text-slate-400">משטחי סבן (60060):</span>
            <span className="font-bold text-amber-300 font-mono">{dep.palletsCount || 0} יח'</span>
          </div>
          <div className="p-1.5 bg-slate-950/40 rounded-lg border border-slate-800 flex items-center justify-between">
            <span className="text-slate-400">בלות חול/סומסום (60002):</span>
            <span className="font-bold text-amber-300 font-mono">{dep.bigBagsCount || 0} יח'</span>
          </div>
        </div>
      </div>

      {/* Interactive Action Buttons */}
      <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-800/80">
        
        {/* Waze Direct Navigation Button */}
        {order.wazeUrl && (
          <a
            href={order.wazeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 min-w-[130px] px-3 py-2 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-sky-950 transition active:scale-95"
            title="פתח ניווט ישיר ב-Waze"
          >
            <NavIcon className="w-3.5 h-3.5 fill-current" />
            <span>נווט בוויז (Waze)</span>
          </a>
        )}

        {/* Dispatch to Driver (WhatsApp) */}
        {onDispatch && (
          <button
            onClick={onDispatch}
            className="flex-1 min-w-[130px] px-3 py-2 bg-gradient-to-r from-[#00A884] to-teal-600 hover:from-[#02b992] hover:to-teal-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-emerald-950 transition active:scale-95"
          >
            <Send className="w-3.5 h-3.5" />
            <span>שיגור לוואטסאפ</span>
          </button>
        )}

        {/* Audio Briefing TTS */}
        {onAudioBriefing && (
          <button
            onClick={onAudioBriefing}
            className="px-3 py-2 bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-500/40 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition active:scale-95"
            title="השמעת תדריך קולי לנהג (נועה AI TTS)"
          >
            <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">תדריך קולי</span>
          </button>
        )}

        {/* JSON Schema Make/Sheets */}
        <button
          onClick={() => setShowJson(!showJson)}
          className={`px-2.5 py-2 rounded-xl text-xs font-medium border transition ${
            showJson 
              ? 'bg-cyan-950 text-cyan-300 border-cyan-500/50' 
              : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
          }`}
          title="הצג JSON עבור Make.com / Sheets"
        >
          <Code className="w-3.5 h-3.5" />
        </button>

      </div>

      {/* Collapsible JSON Output */}
      {showJson && (
        <div className="mt-3 p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono relative animate-in fade-in duration-200">
          <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-slate-800 text-slate-400">
            <span>מבנה נתונים מסונכרן (Make / Sheets Payload):</span>
            <button
              onClick={handleCopyJson}
              className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[10px] flex items-center gap-1 transition"
            >
              {copiedJson ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copiedJson ? 'הועתק!' : 'העתק JSON'}</span>
            </button>
          </div>
          <pre className="text-cyan-300 overflow-x-auto max-h-48 py-1">
            {JSON.stringify(payload, null, 2)}
          </pre>
        </div>
      )}

    </div>
  );
};
