import React, { useState } from 'react';
import { 
  Mail, 
  FolderOpen, 
  FileText, 
  Download, 
  ExternalLink, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  Sparkles, 
  RefreshCw, 
  Truck, 
  MapPin, 
  Send, 
  Navigation as NavIcon, 
  Plus, 
  Eye, 
  Filter, 
  Search,
  Check,
  Copy,
  AlertCircle
} from 'lucide-react';
import { LogisticsOrder } from '../../types/logistics';
import { PhysicalOrderDocumentCard } from './PhysicalOrderDocumentCard';
import { ARUGAT_HABOSEM_ORDER, ARUGAT_HABOSEM_EMAIL_META, listenAndIngestEmailOrder } from '../../lib/emailOrderIngestion';

interface OrderFilesViewProps {
  orders: LogisticsOrder[];
  onAddNewOrder: (order: LogisticsOrder) => void;
  onUpdateOrder: (order: LogisticsOrder) => void;
  onSelectOrderForChat?: (order: LogisticsOrder) => void;
}

export const OrderFilesView: React.FC<OrderFilesViewProps> = ({
  orders,
  onAddNewOrder,
  onUpdateOrder,
  onSelectOrderForChat
}) => {
  const [isListening, setIsListening] = useState(false);
  const [listenerStep, setListenerStep] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFileForModal, setSelectedFileForModal] = useState<LogisticsOrder | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Filter orders that have file attachments or email metadata
  const fileOrders = orders.filter(o => {
    const hasDoc = o.orderDocumentUrl || o.emailMeta || o.driveFolderUrl || o.orderNumber === '6215194';
    if (!hasDoc) return false;
    if (searchQuery) {
      return (
        o.orderNumber.includes(searchQuery) ||
        o.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.siteAddress.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.city.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return true;
  });

  const handleRunEmailListener = async () => {
    setIsListening(true);
    setListenerStep(1);

    // Step 1: Incoming Email Detected
    setTimeout(() => {
      setListenerStep(2);
    }, 900);

    // Step 2: AI Parsing by Noa
    setTimeout(() => {
      setListenerStep(3);
    }, 1800);

    // Step 3: Google Drive Upload & Link Extraction
    setTimeout(() => {
      setListenerStep(4);
    }, 2700);

    // Step 4: Dispatch to State & Storage
    setTimeout(async () => {
      const result = await listenAndIngestEmailOrder();
      onAddNewOrder(result.order);
      setListenerStep(5);
      setIsListening(false);
      setToastMessage('הזמנה 6215194 (ערוגת הבשם) נקלטה במלואה, הועתקה ל-Drive ושובצה לנהג חכמת! 🎉');
      setTimeout(() => setToastMessage(null), 5000);
    }, 3600);
  };

  return (
    <div dir="rtl" className="w-full h-full flex flex-col bg-[#0B0F17] text-slate-100 font-sans overflow-y-auto p-4 sm:p-6 space-y-6">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 left-4 right-4 sm:left-auto sm:right-6 sm:w-96 z-50 bg-emerald-950 border-2 border-emerald-500 rounded-2xl p-4 shadow-2xl animate-in fade-in slide-in-from-top duration-300 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <p className="text-xs font-bold text-emerald-100">{toastMessage}</p>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-emerald-400 hover:text-white text-xs">✕</button>
        </div>
      )}

      {/* 1. Header & Live Email Listener Control */}
      <div className="rounded-2xl bg-gradient-to-br from-[#111B21] via-slate-900 to-slate-950 border-2 border-emerald-500/40 p-4 sm:p-6 shadow-xl relative overflow-hidden">
        
        {/* Glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shrink-0 shadow-lg">
              <Mail className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg sm:text-xl font-bold text-white tracking-wide">
                  מאזין מיילים & קבצי הזמנות קומקס
                </h2>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  האזנה פעילה 24/7
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 mt-1">
                סריקה וחילוץ טפסי הזמנה מ-<strong>ramims@saban94.co.il (דרך comax.co.il)</strong> • העתקה אוטומטית ל-Google Drive
              </p>
            </div>
          </div>

          {/* Trigger Listener Button */}
          <button
            onClick={handleRunEmailListener}
            disabled={isListening}
            className={`w-full md:w-auto px-5 py-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-lg transition active:scale-95 ${
              isListening
                ? 'bg-emerald-950 text-emerald-300 border border-emerald-600 cursor-wait'
                : 'bg-[#00A884] hover:bg-[#008f6f] text-[#111B21] hover:shadow-emerald-500/20'
            }`}
          >
            {isListening ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" />
                <span>מאזין ומחלץ מייל קומקס...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-[#111B21]" />
                <span>האזן וקלוט מייל קומקס (הזמנה 6215194)</span>
              </>
            )}
          </button>
        </div>

        {/* Live Step Progression Pipeline (if active) */}
        {isListening && (
          <div className="mt-5 p-4 rounded-xl bg-slate-950/80 border border-emerald-500/40 space-y-3 animate-in fade-in">
            <h4 className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>תהליך קליטת מייל קומקס ע"י נועה AI בזמן אמת:</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs">
              <div className={`p-2.5 rounded-lg border flex items-center gap-2 transition ${
                listenerStep >= 1 ? 'bg-emerald-950/60 border-emerald-600 text-emerald-200' : 'bg-slate-900 border-slate-800 text-slate-500'
              }`}>
                <span className="font-mono font-bold">{listenerStep > 1 ? '✅' : '1.'}</span>
                <span>קבלת מייל מ-Comax (6215194)</span>
              </div>

              <div className={`p-2.5 rounded-lg border flex items-center gap-2 transition ${
                listenerStep >= 2 ? 'bg-emerald-950/60 border-emerald-600 text-emerald-200' : 'bg-slate-900 border-slate-800 text-slate-500'
              }`}>
                <span className="font-mono font-bold">{listenerStep > 2 ? '✅' : '2.'}</span>
                <span>חילוץ מוצרים & פקדונות</span>
              </div>

              <div className={`p-2.5 rounded-lg border flex items-center gap-2 transition ${
                listenerStep >= 3 ? 'bg-emerald-950/60 border-emerald-600 text-emerald-200' : 'bg-slate-900 border-slate-800 text-slate-500'
              }`}>
                <span className="font-mono font-bold">{listenerStep > 3 ? '✅' : '3.'}</span>
                <span>העתקה ל-Drive & חילוץ קישור</span>
              </div>

              <div className={`p-2.5 rounded-lg border flex items-center gap-2 transition ${
                listenerStep >= 4 ? 'bg-emerald-950/60 border-emerald-600 text-emerald-200' : 'bg-slate-900 border-slate-800 text-slate-500'
              }`}>
                <span className="font-mono font-bold">{listenerStep >= 5 ? '✅' : '4.'}</span>
                <span>שיבוץ לנהג חכמת (מנוף)</span>
              </div>
            </div>
          </div>
        )}

        {/* Drive Main Sync Folder Bar */}
        <div className="mt-4 pt-4 border-t border-slate-800/80 flex items-center justify-between flex-wrap gap-2 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <FolderOpen className="w-4 h-4 text-amber-400" />
            <span>תיקיית דרייב ראשית: <strong className="text-slate-200">Google Drive / Saban Logistics Cloud / הזמנות קומקס 2026</strong></span>
          </div>

          <a
            href="https://drive.google.com/drive/folders/1aiBomF1MRJZueGEvFpJRrhPV-2lvIMWF"
            target="_blank"
            rel="noopener noreferrer"
            className="text-amber-400 hover:underline flex items-center gap-1 font-semibold"
          >
            <span>פתח תיקיית Drive חיצונית</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* 2. Search & Counter */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="חיפוש לפי מספר הזמנה, שם לקוח, או יעד..."
            className="w-full bg-[#111B21] border border-slate-800 rounded-xl pr-10 pl-4 py-2.5 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="text-xs text-slate-400 font-mono">
          נמצאו <strong className="text-white">{fileOrders.length}</strong> מסמכי הזמנה מקוריים
        </div>
      </div>

      {/* 3. Render Ingested Orders & Physical Documents */}
      <div className="space-y-6">
        
        {/* If Order #6215194 exists, prominently feature its Physical Document Card */}
        {fileOrders.some(o => o.orderNumber === '6215194') && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                <span>הזמנה נקלטה אחרונה מהמייל: #6215194 (ערוגת הבשם)</span>
              </h3>
              <span className="text-xs text-slate-400 font-mono">קומקס ERP • בצרה</span>
            </div>

            {fileOrders
              .filter(o => o.orderNumber === '6215194')
              .map(order => (
                <PhysicalOrderDocumentCard
                  key={`featured-${order.id}`}
                  order={order}
                  emailMeta={order.emailMeta || ARUGAT_HABOSEM_EMAIL_META}
                  onDispatch={() => {
                    const updated = { ...order, status: 'dispatched_whatsapp' as const };
                    onUpdateOrder(updated);
                    setToastMessage(`הזמנה #${order.orderNumber} שוגרה בהצלחה לוואטסאפ של נהג חכמת! 🚚`);
                    setTimeout(() => setToastMessage(null), 4000);
                  }}
                />
              ))}
          </div>
        )}

        {/* Other Orders with attached Documents */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-slate-300 flex items-center gap-2">
            <FileText className="w-4 h-4 text-sky-400" />
            <span>כלל קבצי ההזמנות והמסמכים בארכיון</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {fileOrders.map(order => (
              <div 
                key={`archive-file-${order.id}`}
                className="p-4 rounded-2xl bg-[#111B21] border border-slate-800 hover:border-slate-700 transition space-y-3 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 pb-2.5 border-b border-slate-800">
                    <div>
                      <span className="font-mono text-xs font-bold text-emerald-400">#{order.orderNumber}</span>
                      <h4 className="text-sm font-bold text-white mt-0.5">{order.customerName}</h4>
                      <p className="text-xs text-slate-400">{order.siteAddress}, {order.city}</p>
                    </div>

                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                      {order.warehouse === '4_HARASH' ? '🏭 4 החרש' : '🏟️ 1 התלמיד'}
                    </span>
                  </div>

                  <div className="my-2.5 space-y-1 text-xs text-slate-300">
                    <div className="flex items-center justify-between text-slate-400">
                      <span>נהג משובץ:</span>
                      <span className="text-sky-300 font-medium">{order.driverName || 'חכמת'}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-400">
                      <span>פריטים:</span>
                      <span>{order.items?.length || 0} מק"טים</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-400">
                      <span>פקדונות:</span>
                      <span className="text-amber-400 font-mono">
                        בלות: {order.deposit?.bigBagsCount || 0} | משטחים: {order.deposit?.palletsCount || 0}
                      </span>
                    </div>
                  </div>
                </div>

                {/* File Links & Actions */}
                <div className="pt-2.5 border-t border-slate-800 flex items-center justify-between gap-2 flex-wrap">
                  <a
                    href={order.orderDocumentUrl || order.driveFolderUrl || 'https://drive.google.com'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center justify-center gap-1.5 border border-slate-700 transition"
                  >
                    <FileText className="w-3.5 h-3.5 text-emerald-400" />
                    <span>צפה במסמך</span>
                  </a>

                  {order.wazeUrl && (
                    <a
                      href={order.wazeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1 border border-slate-700 transition"
                    >
                      <NavIcon className="w-3.5 h-3.5 text-sky-400 fill-current" />
                      <span>Waze</span>
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
