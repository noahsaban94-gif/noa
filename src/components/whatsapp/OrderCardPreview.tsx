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
  Sparkles
} from 'lucide-react';
import { LogisticsOrder } from '../../types/logistics';
import { createMakePayload } from '../../lib/parser';

interface OrderCardPreviewProps {
  order: Partial<LogisticsOrder>;
  onDispatch: () => void;
  onAudioBriefing?: () => void;
}

export const OrderCardPreview: React.FC<OrderCardPreviewProps> = ({
  order,
  onDispatch,
  onAudioBriefing
}) => {
  const [copiedJson, setCopiedJson] = useState(false);
  const [showJson, setShowJson] = useState(false);

  const payload = createMakePayload(order);
  const dep = order.deposit || { palletsCount: 0, bigBagsCount: 0, isExempt: false };

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  return (
    <div className="my-2 p-3.5 rounded-2xl bg-slate-900/95 border border-cyan-500/30 text-slate-100 shadow-xl max-w-lg">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400">
            <Package className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-sm text-white font-mono">#{order.orderNumber || 'הזמנה חדשה'}</span>
              <span className="text-[10px] bg-cyan-950 text-cyan-300 px-2 py-0.5 rounded-full border border-cyan-800">
                פענוח נועה AI
              </span>
            </div>
            <span className="text-xs font-semibold text-cyan-300">{order.customerName || 'לקוח לא מוגדר'}</span>
          </div>
        </div>

        <span className={`px-2 py-0.5 text-[10px] font-bold rounded-lg ${
          order.warehouse === '1_TALMID' 
            ? 'bg-emerald-950 text-emerald-300 border border-emerald-700/50' 
            : 'bg-cyan-950 text-cyan-300 border border-cyan-700/50'
        }`}>
          {order.warehouse === '1_TALMID' ? '🏟️ התלמיד (1)' : '🏭 החרש (4)'}
        </span>
      </div>

      {/* Destination & Time */}
      <div className="grid grid-cols-2 gap-2 text-xs mb-3 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
        <div className="flex items-center gap-1.5 text-slate-300 truncate">
          <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
          <span className="truncate">{order.siteAddress || 'איסוף עצמי'}</span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-300">
          <Clock className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <span>{order.scheduledTime || '08:00'} ({order.timeSlot || 'סבב בוקר'})</span>
        </div>
      </div>

      {/* Materials List */}
      <div className="space-y-1.5 mb-3 text-xs">
        <span className="text-[11px] font-semibold text-slate-400 block">פירוט חומרים שנרמלו:</span>
        {(order.items || []).map((item, idx) => (
          <div key={idx} className="flex items-center justify-between py-1 px-2 rounded-lg bg-slate-950/40 border border-slate-800/80">
            <span className="text-slate-200">
              <span className="text-slate-500 font-mono ml-1.5">{item.sku}</span>
              {item.name}
            </span>
            <span className="font-bold text-cyan-300 font-mono whitespace-nowrap">
              {item.quantity} {item.unit}
            </span>
          </div>
        ))}
      </div>

      {/* Auto Deposit Calculation Card */}
      <div className="p-2.5 rounded-xl bg-amber-950/20 border border-amber-500/30 text-xs mb-3">
        <div className="flex items-center justify-between font-semibold text-amber-300 mb-1">
          <span className="flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-amber-400" />
            אימות פקדונות אוטומטי (נועה AI)
          </span>
          <span className="text-[10px] text-amber-400/80 font-mono">חוקי סבן</span>
        </div>

        <div className="flex items-center gap-3 text-[11px] text-slate-300">
          <div>
            <span>משטחי סבן (60060): </span>
            <span className="font-bold text-amber-300 font-mono">{dep.palletsCount} יח'</span>
          </div>
          <div>
            <span>בלות חול/סומסום (60002): </span>
            <span className="font-bold text-amber-300 font-mono">{dep.bigBagsCount} יח'</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center gap-2 pt-1">
        
        {/* Dispatch to Driver */}
        <button
          onClick={onDispatch}
          className="flex-1 px-3 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-emerald-950 transition active:scale-95"
        >
          <Send className="w-3.5 h-3.5" />
          <span>שיגור לנהג בוואטסאפ</span>
        </button>

        {/* Audio Briefing */}
        {onAudioBriefing && (
          <button
            onClick={onAudioBriefing}
            className="px-3 py-2 bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-500/40 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
            title="השמעת תדריך קולי לנהג (TTS)"
          >
            <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
            <span>תדריך קולי</span>
          </button>
        )}

        {/* JSON Schema */}
        <button
          onClick={() => setShowJson(!showJson)}
          className="px-2.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium border border-slate-700 transition"
          title="הצג JSON עבור Make.com / Sheets"
        >
          <Code className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Collapsible JSON Output */}
      {showJson && (
        <div className="mt-3 p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono relative">
          <button
            onClick={handleCopyJson}
            className="absolute top-2 left-2 px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[10px] flex items-center gap-1"
          >
            {copiedJson ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            <span>{copiedJson ? 'הועתק!' : 'העתק JSON'}</span>
          </button>
          <pre className="text-cyan-300 overflow-x-auto max-h-48 py-1">
            {JSON.stringify(payload, null, 2)}
          </pre>
        </div>
      )}

    </div>
  );
};
