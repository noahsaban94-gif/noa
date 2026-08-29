import React, { useState } from 'react';
import { 
  X, 
  Send, 
  Volume2, 
  VolumeX, 
  Navigation as NavIcon, 
  Copy, 
  Check, 
  ExternalLink, 
  Radio, 
  Sparkles,
  PhoneCall,
  Loader2
} from 'lucide-react';
import { LogisticsOrder } from '../../types/logistics';
import { formatWhatsAppDispatchMessage } from '../../lib/parser';
import { DRIVERS } from '../../lib/constants';

interface DispatchBriefingModalProps {
  order: LogisticsOrder;
  onClose: () => void;
  onConfirmDispatch: (channel: string) => void;
}

export const DispatchBriefingModal: React.FC<DispatchBriefingModalProps> = ({
  order,
  onClose,
  onConfirmDispatch
}) => {
  const [copied, setCopied] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioLoading, setAudioLoading] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState<'hikmat' | 'ali' | 'external'>(
    (order.assignedDriver as any) || 'hikmat'
  );

  const formattedMsg = formatWhatsAppDispatchMessage({
    ...order,
    assignedDriver: selectedDriver,
    driverName: DRIVERS[selectedDriver]?.name
  });

  const handleCopy = () => {
    navigator.clipboard.writeText(formattedMsg);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePlayTTS = () => {
    if (isPlayingAudio) {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setIsPlayingAudio(false);
      return;
    }

    setAudioLoading(true);
    const briefingSpeech = `תדריך נהג עבור ${DRIVERS[selectedDriver]?.name || 'הנהג'}. הזמנה ${order.orderNumber} עבור ${order.customerName}. יעד: ${order.siteAddress}, ${order.city}. מחסן יציאה: ${order.warehouse === '1_TALMID' ? 'התלמיד 1' : 'החרש 4'}. פקדונות: ${order.deposit?.bigBagsCount ?? 0} בלות, ו-${order.deposit?.palletsCount ?? 0} משטחים. סע בזהירות אהובי! באדיבות נועה סבן.`;

    if ('speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(briefingSpeech);
        utterance.lang = 'he-IL';
        utterance.rate = 1.0;
        utterance.pitch = 1.05;

        utterance.onstart = () => {
          setAudioLoading(false);
          setIsPlayingAudio(true);
        };
        utterance.onend = () => {
          setIsPlayingAudio(false);
          setAudioLoading(false);
        };
        utterance.onerror = () => {
          setIsPlayingAudio(false);
          setAudioLoading(false);
        };

        window.speechSynthesis.speak(utterance);
      } catch (err) {
        console.warn('Speech synthesis error:', err);
        setIsPlayingAudio(false);
        setAudioLoading(false);
      }
    } else {
      setAudioLoading(false);
      setIsPlayingAudio(false);
    }
  };

  const handleSendViaWhatsAppWeb = () => {
    const driverPhone = DRIVERS[selectedDriver]?.phone.replace(/[^0-9]/g, '');
    const intlPhone = driverPhone.startsWith('0') ? `972${driverPhone.slice(1)}` : driverPhone;
    const waUrl = `https://api.whatsapp.com/send?phone=${intlPhone}&text=${encodeURIComponent(formattedMsg)}`;
    window.open(waUrl, '_blank');
    onConfirmDispatch('whatsapp_web');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="bg-slate-900 border border-cyan-500/40 rounded-3xl w-full max-w-xl max-h-[90vh] flex flex-col shadow-2xl shadow-cyan-950/50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white">שיגור תדריך מבצעי לנהג</h3>
              <p className="text-xs text-slate-400">הזמנה #{order.orderNumber} • {order.customerName}</p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1 text-xs sm:text-sm">
          
          {/* Driver Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">בחר נהג לשיגור:</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setSelectedDriver('hikmat')}
                className={`p-3 rounded-xl border text-right transition flex items-center justify-between ${
                  selectedDriver === 'hikmat'
                    ? 'bg-cyan-950/80 border-cyan-400 text-cyan-200 shadow-md shadow-cyan-950'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="font-bold text-white flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-cyan-400" />
                    <span>חכמת 🚚</span>
                  </div>
                  <span className="text-[11px] text-slate-400">משאית 1 (615-41-002)</span>
                </div>
                {selectedDriver === 'hikmat' && <Check className="w-4 h-4 text-cyan-400" />}
              </button>

              <button
                type="button"
                onClick={() => setSelectedDriver('ali')}
                className={`p-3 rounded-xl border text-right transition flex items-center justify-between ${
                  selectedDriver === 'ali'
                    ? 'bg-emerald-950/80 border-emerald-400 text-emerald-200 shadow-md shadow-emerald-950'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="font-bold text-white flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span>עלי 🚛</span>
                  </div>
                  <span className="text-[11px] text-slate-400">משאית 2 (734-12-301)</span>
                </div>
                {selectedDriver === 'ali' && <Check className="w-4 h-4 text-emerald-400" />}
              </button>
            </div>
          </div>

          {/* Formatted WhatsApp Message Preview */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-300">תצוגה מקדימה של הודעת WhatsApp:</label>
              <button
                onClick={handleCopy}
                className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 bg-slate-800/80 px-2 py-0.5 rounded-lg"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'הועתק ללוח!' : 'העתק טקסט'}</span>
              </button>
            </div>
            
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-slate-200 font-sans text-xs whitespace-pre-line leading-relaxed max-h-56 overflow-y-auto">
              {formattedMsg}
            </div>
          </div>

          {/* Quick Links: Waze + Audio Briefing */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
            <a
              href={order.wazeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 flex items-center justify-center gap-2 transition"
            >
              <NavIcon className="w-4 h-4 text-cyan-400" />
              <span>בדוק מסלול ב-Waze</span>
            </a>

            <button
              onClick={handlePlayTTS}
              disabled={audioLoading}
              className="px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center justify-center gap-2 transition"
            >
              {audioLoading ? (
                <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
              ) : isPlayingAudio ? (
                <VolumeX className="w-4 h-4 text-rose-400" />
              ) : (
                <Volume2 className="w-4 h-4 text-emerald-400" />
              )}
              <span>{isPlayingAudio ? 'עצור תדריך קולי' : 'השמע תדריך קולי (TTS)'}</span>
            </button>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            ביטול
          </button>

          <button
            onClick={handleSendViaWhatsAppWeb}
            className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 shadow-lg shadow-emerald-950 transition active:scale-95"
          >
            <Send className="w-4 h-4" />
            <span>פתח בוואטסאפ ל-{DRIVERS[selectedDriver]?.name}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
