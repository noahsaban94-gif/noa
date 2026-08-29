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
  Code2, 
  Clock, 
  Phone, 
  Truck, 
  Boxes,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { LogisticsOrder } from '../../types/logistics';
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

  const driverKey = order.assignedDriver as 'hikmat' | 'ali' | undefined;
  const driverInfo = driverKey && DRIVERS[driverKey] ? DRIVERS[driverKey] : null;
  const isTalmid = order.warehouse === '1_TALMID';
  const isCrane = order.isCraneRequired || order.assignedDriver === 'hikmat';

  const getStatusBadge = () => {
    const baseClass = "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border";
    switch (order.status) {
      case 'on_the_way':
        return <span className={`${baseClass} bg-amber-500/10 text-amber-400 border-amber-500/20`}>🚚 בדרך ליעד</span>;
      case 'loading':
        return <span className={`${baseClass} bg-blue-500/10 text-blue-400 border-blue-500/20`}>⏳ בהעמסה במחסן</span>;
      case 'delivered':
        return <span className={`${baseClass} bg-emerald-500/10 text-emerald-400 border-emerald-500/20`}>✅ סופק ונפרק</span>;
      case 'dispatched_whatsapp':
        return <span className={`${baseClass} bg-teal-500/10 text-teal-400 border-teal-500/20`}>📲 שוגר לוואטסאפ</span>;
      default:
        return <span className={`${baseClass} bg-slate-500/10 text-slate-400 border-slate-500/20`}>📋 ממתין בסידור</span>;
    }
  };

  return (
    <div 
      dir="rtl"
      className="group relative my-3 w-full max-w-xl rounded-2xl bg-slate-900/90 dark:bg-[#111b21]/95 text-slate-100 border border-slate-800 shadow-xl backdrop-blur-xl transition-all duration-200 hover:border-slate-700 hover:shadow-2xl overflow-hidden font-sans"
    >
      {/* פילטר צד עדין לפי סוג מחסן */}
      <div className={`absolute top-0 right-0 w-1.5 h-full ${isTalmid ? 'bg-emerald-500' : 'bg-sky-500'}`} />

      <div className="p-4 sm:p-5">
        
        {/* כותרת עליונה */}
        <div className="flex items-start justify-between gap-3 pb-3.5 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
              isCrane ? 'bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/20' : 'bg-slate-800 text-slate-300 ring-1 ring-slate-700'
            }`}>
              {isCrane ? <Truck className="w-5 h-5" /> : <Package className="w-5 h-5" />}
            </div>
            
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-sm font-bold text-white tracking-wider">
                  #{order.orderNumber || 'חדש'}
                </span>
                {getStatusBadge()}
              </div>
              <h3 className="text-sm font-semibold text-slate-200 mt-0.5">
                {order.customerName || 'לקוח ללא שם'}
              </h3>
            </div>
          </div>

          <div className="flex flex-col items-end gap-1.5 shrink-0">
            <span className="px-2.5 py-1 text-[11px] font-semibold rounded-md bg-slate-800/80 text-slate-300 border border-slate-700/80">
              {isTalmid ? '🏟️ התלמיד (1)' : '🏭 החרש (4)'}
            </span>
            {isCrane && (
              <span className="px-2 py-0.5 text-[10px] font-medium rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                מנוף נדרש
              </span>
            )}
          </div>
        </div>

        {/* גריד פרטי אספקה ושיבוץ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-3.5 p-3 rounded-xl bg-slate-950/50 border border-slate-800/60">
          
          <div className="flex items-center gap-2.5">
            <MapPin className="w-4 h-4 text-rose-400 shrink-0" />
            <div className="min-w-0">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block">יעד פריקה</span>
              <span className="text-xs font-medium text-slate-200 truncate block">{order.siteAddress || order.city || 'איסוף עצמי'}</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <Truck className="w-4 h-4 text-sky-400 shrink-0" />
            <div className="min-w-0">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block">נהג משובץ</span>
              <span className="text-xs font-medium text-sky-300 truncate block">
                {driverInfo ? `${driverInfo.name} • ${driverInfo.truckType}` : (order.driverName || 'טרם שובץ')}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <Clock className="w-4 h-4 text-amber-400 shrink-0" />
            <div className="min-w-0">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block">מועד אספקה</span>
              <span className="text-xs font-medium text-slate-200 truncate block">
                {order.scheduledTime || '08:00'} ({order.timeSlot || 'בוקר'})
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
            <div className="min-w-0">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block">איש קשר באתר</span>
              <a href={`tel:${order.clientPhone}`} className="text-xs font-medium text-emerald-400 hover:underline truncate block font-mono">
                {order.clientPhone || 'לא סופק'}
              </a>
            </div>
          </div>
        </div>

        {/* פירוט חומרים */}
        <div className="space-y-2 mb-3.5">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5 font-medium">
              <Boxes className="w-3.5 h-3.5 text-slate-400" />
              מפרט חומרים ({order.items?.length || 0})
            </span>
            {order.distanceKm && (
              <span className="text-[11px] font-mono text-slate-500">מרחק: {order.distanceKm} ק״מ</span>
            )}
          </div>

          <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
            {(order.items || []).map((item, idx) => (
              <div 
                key={idx} 
                className="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-950/30 border border-slate-800 hover:border-slate-700/80 transition"
              >
                <span className="text-xs text-slate-300 truncate max-w-[260px]">
                  <span className="font-mono text-slate-500 ml-1.5 text-[10px]">{item.sku}</span>
                  {item.name}
                </span>
                <span className="font-mono text-xs font-bold text-slate-200 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                  {item.quantity} {item.unit}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* סיכום פקדונות (נועה AI) */}
        <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800 mb-4">
          <div className="flex items-center justify-between text-xs font-medium text-slate-300 mb-2">
            <span className="flex items-center gap-1.5 text-slate-400">
              <Layers className="w-3.5 h-3.5 text-amber-400" />
              אימות פקדונות (נועה AI)
            </span>
            <span className="text-[10px] text-slate-500 font-mono">חוקי סבן</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs">
              <span className="text-slate-400 text-[11px]">משטחי סבן:</span>
              <span className="font-mono font-bold text-amber-400">{dep.palletsCount || 0}</span>
            </div>
            <div className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs">
              <span className="text-slate-400 text-[11px]">בלות חול/סומסום:</span>
              <span className="font-mono font-bold text-amber-400">{dep.bigBagsCount || 0}</span>
            </div>
          </div>
        </div>

        {/* סרגל פעולות ראשי */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
          
          {/* ניווט Waze */}
          {order.wazeUrl && (
            <a
              href={order.wazeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 border border-slate-700 transition active:scale-[0.98]"
            >
              <NavIcon className="w-3.5 h-3.5 text-sky-400 fill-current" />
              <span>Waze</span>
            </a>
          )}

          {/* שיגור לוואטסאפ (כפתור ראשי מודגש) */}
          {onDispatch && (
            <button
              onClick={onDispatch}
              className="flex-1 px-3 py-2 bg-[#00a884] hover:bg-[#02906f] text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm transition active:scale-[0.98]"
            >
              <Send className="w-3.5 h-3.5" />
              <span>שגר לוואטסאפ</span>
            </button>
          )}

          {/* תדריך קולי */}
          {onAudioBriefing && (
            <button
              onClick={onAudioBriefing}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-xl transition active:scale-[0.98]"
              title="תדריך קולי"
            >
              <Volume2 className="w-4 h-4 text-slate-300" />
            </button>
          )}

          {/* צפייה במבנה JSON */}
          <button
            onClick={() => setShowJson(!showJson)}
            className={`p-2 rounded-xl border transition active:scale-[0.98] ${
              showJson 
                ? 'bg-slate-700 text-white border-slate-600' 
                : 'bg-slate-800 hover:bg-slate-700 text-slate-400 border-slate-700'
            }`}
            title="הצג JSON"
          >
            <Code2 className="w-4 h-4" />
          </button>
        </div>

        {/* מודול JSON מתקפל */}
        {showJson && (
          <div className="mt-3 p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800/80 text-slate-400">
              <span className="text-[11px]">Payload (Make / Sheets)</span>
              <button
                onClick={handleCopyJson}
                className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[10px] flex items-center gap-1 transition"
              >
                {copiedJson ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedJson ? 'הועתק' : 'העתק'}</span>
              </button>
            </div>
            <pre className="text-slate-300 text-[11px] overflow-x-auto max-h-40 leading-relaxed">
              {JSON.stringify(payload, null, 2)}
            </pre>
          </div>
        )}

      </div>
    </div>
  );
};
