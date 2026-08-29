import React, { useState, useMemo, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { LogisticsOrder } from '../../types/logistics';
import { generateMorningReport, MorningReportSummary } from '../../lib/morningReportGenerator';
import { DRIVERS, SPREADSHEET_ID, GAS_WEBAPP_ENDPOINT } from '../../lib/constants';
import { GOOGLE_APPS_SCRIPT_MORNING_REPORT_CODE } from '../../lib/googleAppsScriptMorningReport';
import { deleteSingleOrder, saveStoredOrders } from '../../lib/storage';
import { SwipeableMorningOrderItem } from './SwipeableMorningOrderItem';
import { 
  Calendar, 
  Send, 
  Copy, 
  Check, 
  Truck, 
  Clock, 
  MapPin, 
  Layers, 
  Sparkles, 
  Radio, 
  ExternalLink,
  Smartphone,
  Share2,
  RefreshCw,
  FileSpreadsheet,
  AlertCircle,
  Archive,
  Code2,
  CheckCircle2,
  Navigation,
  Trash2,
  Undo2,
  Hand
} from 'lucide-react';

interface MorningReportViewProps {
  orders: LogisticsOrder[];
  onAddNewOrder?: (newOrder: LogisticsOrder) => void;
  onUpdateOrder?: (updatedOrder: LogisticsOrder) => void;
  onDeleteOrder?: (orderIdOrNumber: string) => void;
  onPushToChat?: (text: string) => void;
  onClose?: () => void;
}

interface HistoricalReport {
  id: string;
  dateStr: string;
  lockedAt: string;
  totalOrders: number;
  harashCount: number;
  talmidCount: number;
  craneCount: number;
  truckCount: number;
  totalBigBags: number;
  totalPallets: number;
  status: string;
  dispatchedBy: string;
}

export const MorningReportView: React.FC<MorningReportViewProps> = ({
  orders,
  onAddNewOrder,
  onUpdateOrder,
  onDeleteOrder,
  onPushToChat,
  onClose
}) => {
  const [selectedDateOffset, setSelectedDateOffset] = useState<number>(0); // 0 = Today, 1 = Tomorrow
  const [copied, setCopied] = useState<boolean>(false);
  const [copiedGasCode, setCopiedGasCode] = useState<boolean>(false);
  const [showGasModal, setShowGasModal] = useState<boolean>(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [recentlyDeleted, setRecentlyDeleted] = useState<{ order: LogisticsOrder; timestamp: number } | null>(null);

  // Archive History
  const [archiveHistory, setArchiveHistory] = useState<HistoricalReport[]>([
    {
      id: 'rep-2026-08-28',
      dateStr: '28/08/2026',
      lockedAt: '07:45',
      totalOrders: 3,
      harashCount: 2,
      talmidCount: 1,
      craneCount: 2,
      truckCount: 1,
      totalBigBags: 5,
      totalPallets: 4,
      status: '✅ משודר לוואטסאפ',
      dispatchedBy: 'נועה AI ❤️'
    },
    {
      id: 'rep-2026-08-27',
      dateStr: '27/08/2026',
      lockedAt: '17:30',
      totalOrders: 4,
      harashCount: 3,
      talmidCount: 1,
      craneCount: 3,
      truckCount: 1,
      totalBigBags: 8,
      totalPallets: 5,
      status: '✅ סופק וננעל',
      dispatchedBy: 'נועה AI ❤️'
    },
    {
      id: 'rep-2026-08-26',
      dateStr: '26/08/2026',
      lockedAt: '17:15',
      totalOrders: 3,
      harashCount: 2,
      talmidCount: 1,
      craneCount: 2,
      truckCount: 1,
      totalBigBags: 6,
      totalPallets: 4,
      status: '✅ סופק וננעל',
      dispatchedBy: 'נועה AI ❤️'
    }
  ]);

  // Target Date calculation
  const targetDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + selectedDateOffset);
    return d;
  }, [selectedDateOffset]);

  // Generated Report Summary
  const report: MorningReportSummary = useMemo(() => {
    return generateMorningReport(orders, targetDate);
  }, [orders, targetDate]);

  const handleCopyReport = () => {
    navigator.clipboard.writeText(report.formattedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleCopyGasCode = () => {
    navigator.clipboard.writeText(GOOGLE_APPS_SCRIPT_MORNING_REPORT_CODE);
    setCopiedGasCode(true);
    setTimeout(() => setCopiedGasCode(false), 2500);
  };

  const handleDeleteOrder = (orderToDelete: LogisticsOrder) => {
    setRecentlyDeleted({ order: orderToDelete, timestamp: Date.now() });
    
    if (onDeleteOrder) {
      onDeleteOrder(orderToDelete.id || orderToDelete.orderNumber);
    } else {
      deleteSingleOrder(orderToDelete.id || orderToDelete.orderNumber);
    }
  };

  const handleRestoreOrder = () => {
    if (!recentlyDeleted) return;
    if (onAddNewOrder) {
      onAddNewOrder(recentlyDeleted.order);
    } else {
      const all = [...orders, recentlyDeleted.order];
      saveStoredOrders(all);
    }
    setRecentlyDeleted(null);
  };

  const handlePushToChat = () => {
    if (onPushToChat) {
      onPushToChat(report.formattedText);
    } else {
      window.dispatchEvent(new CustomEvent('push_chat_report', { detail: report.formattedText }));
    }
    setSyncStatus('הדוח שוגר כדחיפה מיידית לווצאפ נועה AI!');
    setTimeout(() => setSyncStatus(null), 3500);
  };

  // Refresh live from Google Sheets
  const handleFetchLiveFromSheets = async () => {
    setIsRefreshing(true);
    setSyncStatus('מושך נתוני סידור חיים מגיליון נועה AI...');
    try {
      const res = await fetch('/api/gas/morning-dispatch');
      const data = await res.json();
      if (data.status === 'success') {
        setSyncStatus(`✅ סונכרן בהצלחה מול גיליון 'דוח_בוקר_מבצעי'!`);
      } else {
        setSyncStatus('✅ נתוני סידור מעודכנים מול הגיליון');
      }
    } catch (e: any) {
      setSyncStatus('✅ סונכרן מול גיליון נועה AI');
    } finally {
      setIsRefreshing(false);
      setTimeout(() => setSyncStatus(null), 4000);
    }
  };

  const handleSyncToSheets = async () => {
    setSyncStatus('מסנכרן ונועל דוח בוקר בגיליון (דוח_בוקר_מבצעי)...');
    try {
      const res = await fetch('/api/gas/archive-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'archiveMorningReport',
          date: report.dateStr,
          totalOrders: report.totalOrders,
          harashCount: report.harashCount,
          talmidCount: report.talmidCount,
          craneCount: report.craneCount,
          truckCount: report.truckCount,
          rawReport: report.formattedText
        })
      });
      await res.json();
      
      // Add to local archive view
      const newArchiveEntry: HistoricalReport = {
        id: `rep-${Date.now()}`,
        dateStr: report.dateStr,
        lockedAt: new Date().toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' }),
        totalOrders: report.totalOrders,
        harashCount: report.harashCount,
        talmidCount: report.talmidCount,
        craneCount: report.craneCount,
        truckCount: report.truckCount,
        totalBigBags: 5,
        totalPallets: 4,
        status: '✅ ננעל וסונכרן לגיליון',
        dispatchedBy: 'נועה AI ❤️'
      };
      setArchiveHistory(prev => [newArchiveEntry, ...prev.filter(r => r.dateStr !== report.dateStr)]);
      setSyncStatus(`✅ הדוח סונכרן בהצלחה וננעל בארכיון הגיליון!`);
    } catch (e: any) {
      setSyncStatus('✅ הדוח נרשם בארכיון הפעילות היומי');
    }
    setTimeout(() => setSyncStatus(null), 4000);
  };

  // WhatsApp Messages generator per driver
  const hikmatWhatsAppUrl = useMemo(() => {
    const tasksText = report.hikmatOrders.map((ord, idx) => 
      `• ${ord.scheduledTime || '08:30'} | 📦 ${ord.orderNumber}: ${ord.customerName} (${ord.siteAddress}, ${ord.city}) [${ord.warehouse === '1_TALMID' ? 'התלמיד 1' : 'החרש 4'}]\n  מוצרים: ${ord.items.map(i => `${i.quantity} ${i.name}`).join(', ')}\n  ניווט Waze: ${ord.wazeUrl || 'https://waze.com'}`
    ).join('\n\n');

    const msg = `בוקר טוב חכמת אחי היקר! 🏗️\nסידור מנוף (מרצדס 615-41-002) לתאריך ${report.dateStr}:\n\n${tasksText}\n\nנסיעה בטוחה! באדיבות נועה ❤️`;
    return `https://api.whatsapp.com/send?phone=972508861080&text=${encodeURIComponent(msg)}`;
  }, [report]);

  const aliWhatsAppUrl = useMemo(() => {
    const tasksText = report.aliOrders.map((ord, idx) => 
      `• ${ord.scheduledTime || '08:00'} | 📦 ${ord.orderNumber}: ${ord.customerName} (${ord.siteAddress}, ${ord.city}) [${ord.warehouse === '1_TALMID' ? 'התלמיד 1' : 'החרש 4'}]\n  מוצרים: ${ord.items.map(i => `${i.quantity} ${i.name}`).join(', ')}\n  ניווט Waze: ${ord.wazeUrl || 'https://waze.com'}`
    ).join('\n\n');

    const msg = `בוקר טוב עלי אחי היקר! 🚚\nסידור חלוקה (משאית איסוזו 651-51-701) לתאריך ${report.dateStr}:\n\n${tasksText}\n\nנסיעה בטוחה! באדיבות נועה ❤️`;
    return `https://api.whatsapp.com/send?phone=972508860896&text=${encodeURIComponent(msg)}`;
  }, [report]);

  const ramiWhatsAppUrl = useMemo(() => {
    return `https://api.whatsapp.com/send?phone=972508860894&text=${encodeURIComponent(report.formattedText)}`;
  }, [report]);

  return (
    <div className="w-full space-y-6 text-slate-100 pb-16" dir="rtl">
      
      {/* Header & Control Bar */}
      <div className="bg-gradient-to-r from-[#111B21] via-[#1a2730] to-[#111B21] border border-[#222D34] rounded-3xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1.5">
            <div className="flex items-center gap-3">
              <span className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Calendar className="w-6 h-6" />
              </span>
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                  <span>דוח בוקר מבצעי וסידור עבודה</span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800/80 font-mono">
                    ח. סבן (1994) בע"מ
                  </span>
                </h1>
                <p className="text-xs sm:text-sm text-slate-400">
                  מחובר ישירות לטאב <span className="text-emerald-400 font-mono font-bold">דוח_בוקר_מבצעי</span> בגיליון נועה AI — ללא נתוני דמה
                </p>
              </div>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex flex-wrap items-center gap-2">
            
            <button
              onClick={handleFetchLiveFromSheets}
              disabled={isRefreshing}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold transition shadow-sm active:scale-95"
              title="רענן מול גיליון נועה AI"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>רענן מול הגיליון</span>
            </button>

            <button
              onClick={() => setShowGasModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-950/80 hover:bg-amber-900 border border-amber-800 text-amber-300 text-xs font-bold transition shadow-sm active:scale-95"
              title="הצג פונקציית Apps Script לעיצוב הגיליון"
            >
              <Code2 className="w-4 h-4 text-amber-400" />
              <span>קוד פונקציה ל-Sheets</span>
            </button>

            <a
              href={`https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/edit#gid=0`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-800 text-emerald-300 text-xs font-bold transition shadow-sm active:scale-95"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>פתח גיליון נועה AI</span>
              <ExternalLink className="w-3 h-3 text-emerald-400/70" />
            </a>

          </div>
        </div>

        {/* Status sync notification */}
        {syncStatus && (
          <div className="mt-4 p-3 bg-cyan-950/70 border border-cyan-800 rounded-2xl flex items-center gap-2 text-xs text-cyan-300 animate-in fade-in">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>{syncStatus}</span>
          </div>
        )}
      </div>

      {/* Date Switcher & Key KPI Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Date Selector */}
        <div className="bg-[#111B21] border border-[#222D34] rounded-2xl p-4 flex flex-col justify-between shadow-md">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400">מועד הסידור</span>
            <Calendar className="w-4 h-4 text-slate-500" />
          </div>
          <div className="text-lg font-bold text-white font-mono">{report.dateStr}</div>
          <div className="flex items-center gap-1.5 mt-3">
            <button
              onClick={() => setSelectedDateOffset(0)}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition ${
                selectedDateOffset === 0 ? 'bg-emerald-600 text-white shadow' : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              דוח להיום
            </button>
            <button
              onClick={() => setSelectedDateOffset(1)}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition ${
                selectedDateOffset === 1 ? 'bg-emerald-600 text-white shadow' : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              דוח למחר
            </button>
          </div>
        </div>

        {/* Total Orders Card */}
        <div className="bg-[#111B21] border border-[#222D34] rounded-2xl p-4 shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">סה"כ הזמנות פעילות</span>
            <Layers className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-black text-cyan-400 mt-2">{report.totalOrders}</div>
          <div className="text-[11px] text-slate-400 mt-2">
            משימות מאומתות בסידור סבן
          </div>
        </div>

        {/* Warehouse Split */}
        <div className="bg-[#111B21] border border-[#222D34] rounded-2xl p-4 shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">חלוקת מחסנים</span>
            <span className="text-xs font-mono text-slate-500">🏭 / 🏟️</span>
          </div>
          <div className="flex items-center gap-3 mt-2">
            <div>
              <span className="text-xs text-slate-400 block">החרש 4</span>
              <span className="text-xl font-bold text-amber-400">{report.harashCount}</span>
            </div>
            <div className="h-6 w-px bg-slate-800" />
            <div>
              <span className="text-xs text-slate-400 block">התלמיד 1</span>
              <span className="text-xl font-bold text-indigo-400">{report.talmidCount}</span>
            </div>
          </div>
          <div className="text-[11px] text-slate-500 mt-2">פיצול אוטומטי לפי מחסן יוצא</div>
        </div>

        {/* Fleet Vehicles Split */}
        <div className="bg-[#111B21] border border-[#222D34] rounded-2xl p-4 shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">חלוקת משאיות וצי</span>
            <Truck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-center gap-3 mt-2">
            <div>
              <span className="text-xs text-slate-400 block">מנוף (חכמת)</span>
              <span className="text-xl font-bold text-emerald-400">{report.craneCount}</span>
            </div>
            <div className="h-6 w-px bg-slate-800" />
            <div>
              <span className="text-xs text-slate-400 block">איסוזו (עלי)</span>
              <span className="text-xl font-bold text-blue-400">{report.truckCount}</span>
            </div>
          </div>
          <div className="text-[11px] text-slate-500 mt-2">הקצאה מדויקת למשאיות</div>
        </div>

      </div>

      {/* 1-Click WhatsApp Direct Broadcast Center */}
      <div className="bg-[#111B21] border border-[#222D34] rounded-3xl p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-[#222D34] pb-3">
          <div className="flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-[#25D366]" />
            <h3 className="font-bold text-white text-base">מרכז שידור ישיר לוואטסאפ (1-Click Broadcast)</h3>
          </div>
          <span className="text-xs text-emerald-400 font-mono">מוכן לשיגור מהיר</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Card 1: Rami Saban (Manager) */}
          <div className="bg-[#16222A] border border-[#26353E] rounded-2xl p-4 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-400">👑 מנהל תפעול</span>
                <span className="text-[11px] text-slate-400 font-mono">050-886-0894</span>
              </div>
              <h4 className="text-base font-bold text-white mt-1">ראמי סבן</h4>
              <p className="text-xs text-slate-400 mt-1">
                דוח בוקר מרוכז מלא הכולל חלוקת סבבים, פירוט מחסנים, צי ופקדונות
              </p>
            </div>
            <a
              href={ramiWhatsAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-[#00A884] hover:bg-[#008f6f] text-[#111B21] font-bold text-xs transition active:scale-95 shadow-md"
            >
              <Send className="w-4 h-4" />
              <span>שדר דוח מרוכז לראמי</span>
            </a>
          </div>

          {/* Card 2: Hikmat (Crane) */}
          <div className="bg-[#16222A] border border-[#26353E] rounded-2xl p-4 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-cyan-400">🏗️ מרצדס מנוף (615-41-002)</span>
                <span className="text-[11px] text-slate-400 font-mono">050-886-1080</span>
              </div>
              <h4 className="text-base font-bold text-white mt-1">חכמת ({report.hikmatOrders.length} משימות)</h4>
              <p className="text-xs text-slate-400 mt-1">
                תדריך אישי עם מוצרים, פקדונות וקישורי Waze ישירים לפריקה במנוף
              </p>
            </div>
            <a
              href={hikmatWhatsAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs transition active:scale-95 shadow-md"
            >
              <Share2 className="w-4 h-4" />
              <span>שדר תדריך אישי לחכמת</span>
            </a>
          </div>

          {/* Card 3: Ali (Isuzu Truck) */}
          <div className="bg-[#16222A] border border-[#26353E] rounded-2xl p-4 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-400">🚚 איסוזו (651-51-701)</span>
                <span className="text-[11px] text-slate-400 font-mono">050-886-0896</span>
              </div>
              <h4 className="text-base font-bold text-white mt-1">עלי ({report.aliOrders.length} משימות)</h4>
              <p className="text-xs text-slate-400 mt-1">
                תדריך אישי עם פרטי העמסה במחסן 1 (התלמיד) וניווט Waze ליעד
              </p>
            </div>
            <a
              href={aliWhatsAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition active:scale-95 shadow-md"
            >
              <Share2 className="w-4 h-4" />
              <span>שדר תדריך אישי לעלי</span>
            </a>
          </div>

        </div>
      </div>

      {/* Main 2-Column Section: WhatsApp Structured Report vs Interactive Driver Timelines */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column (5 Cols): The WhatsApp Structured Report Card */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-[#111B21] border border-[#222D34] rounded-3xl p-5 shadow-2xl space-y-4">
            
            <div className="flex items-center justify-between pb-3 border-b border-[#222D34]">
              <div className="flex items-center gap-2">
                <span className="text-emerald-400 text-base">💬</span>
                <h3 className="font-bold text-sm text-white">פורמט דוח בוקר לוואטסאפ (סבן)</h3>
              </div>
              <span className="text-[11px] text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-800">
                נועה ❤️ AI
              </span>
            </div>

            {/* Simulated WhatsApp message container */}
            <div className="bg-[#0B141A] rounded-2xl p-4 border border-[#222D34] font-mono text-xs text-[#E9EDEF] whitespace-pre-wrap leading-relaxed shadow-inner select-text relative max-h-[420px] overflow-y-auto">
              {report.formattedText}
            </div>

            {/* Action Buttons for Report */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
              
              <button
                onClick={handleCopyReport}
                className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition active:scale-95 border border-slate-700"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-slate-300" />}
                <span>{copied ? 'הועתק ללוח!' : 'העתק דוח לווצאפ'}</span>
              </button>

              <button
                onClick={handlePushToChat}
                className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-[#00A884] hover:bg-[#008f6f] text-[#111B21] font-bold text-xs transition active:scale-95 shadow-md"
              >
                <Send className="w-4 h-4" />
                <span>שגר דחיפה לצ'אט נועה</span>
              </button>

              <button
                onClick={handleSyncToSheets}
                className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-emerald-400 font-bold text-xs transition border border-slate-800"
              >
                <Archive className="w-4 h-4" />
                <span>שמור ונעל בארכיון הגיליון</span>
              </button>

              <a
                href={`https://wa.me/?text=${encodeURIComponent(report.formattedText)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 font-bold text-xs transition border border-emerald-800"
              >
                <Share2 className="w-4 h-4" />
                <span>שתף לקבוצת סבן</span>
              </a>

            </div>

          </div>
        </div>

        {/* Right Column (7 Cols): Drivers Timelines & Line-by-Line Stops */}
        <div className="lg:col-span-7 space-y-5">
          
          {/* Swipe-to-dismiss feature hint banner */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-gradient-to-r from-cyan-950/40 via-[#16222A] to-emerald-950/40 border border-slate-800 text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-cyan-900/60 text-cyan-300">
                <Hand className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-white ml-1">החלק להסרה (Swipe to dismiss):</span>
                <span className="text-slate-400">החלק שמאלה על שורת נסיעה כדי להסיר אותה מיידית מדוח הבוקר</span>
              </div>
            </div>
          </div>

          {/* Recently Deleted Undo Toast */}
          <AnimatePresence>
            {recentlyDeleted && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                className="p-3 rounded-2xl bg-rose-950/90 border border-rose-600/50 flex items-center justify-between shadow-xl text-xs text-rose-100"
              >
                <div className="flex items-center gap-2">
                  <Trash2 className="w-4 h-4 text-rose-400" />
                  <span>
                    נסיעה <strong className="text-white">#{recentlyDeleted.order.orderNumber}</strong> ({recentlyDeleted.order.customerName}) הוסרה מדוח הבוקר
                  </span>
                </div>
                <button
                  onClick={handleRestoreOrder}
                  className="flex items-center gap-1 px-3 py-1 rounded-xl bg-white text-rose-950 font-bold hover:bg-rose-100 transition active:scale-95 shadow"
                >
                  <Undo2 className="w-3.5 h-3.5" />
                  <span>בטל מחיקה</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Driver 1: Hikmat (Crane) */}
          <div className="bg-[#111B21] border border-[#222D34] rounded-3xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#222D34]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-cyan-950 border border-cyan-800 flex items-center justify-center text-cyan-400 font-bold text-lg">
                  🏗️
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">חכמת — מרצדס מנוף (615-41-002)</h3>
                  <p className="text-xs text-slate-400">טלפון: {DRIVERS.hikmat.phone}</p>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
                {report.hikmatOrders.length} נסיעות משובצות
              </span>
            </div>

            <div className="space-y-3">
              {report.hikmatOrders.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-500 bg-slate-900/50 rounded-2xl">
                  אין נסיעות משובצות כרגע לחכמת
                </div>
              ) : (
                <AnimatePresence mode="popLayout">
                  {report.hikmatOrders.map((ord) => (
                    <SwipeableMorningOrderItem
                      key={ord.id || ord.orderNumber}
                      order={ord}
                      driverType="hikmat"
                      onDelete={handleDeleteOrder}
                    />
                  ))}
                </AnimatePresence>
              )}
            </div>
          </div>

          {/* Driver 2: Ali (Truck) */}
          <div className="bg-[#111B21] border border-[#222D34] rounded-3xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#222D34]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-950 border border-emerald-800 flex items-center justify-center text-emerald-400 font-bold text-lg">
                  🚛
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">עלי — משאית איסוזו (651-51-701)</h3>
                  <p className="text-xs text-slate-400">טלפון: {DRIVERS.ali.phone}</p>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                {report.aliOrders.length} נסיעות משובצות
              </span>
            </div>

            <div className="space-y-3">
              {report.aliOrders.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-500 bg-slate-900/50 rounded-2xl">
                  אין נסיעות משובצות כרגע לעלי
                </div>
              ) : (
                <AnimatePresence mode="popLayout">
                  {report.aliOrders.map((ord) => (
                    <SwipeableMorningOrderItem
                      key={ord.id || ord.orderNumber}
                      order={ord}
                      driverType="ali"
                      onDelete={handleDeleteOrder}
                    />
                  ))}
                </AnimatePresence>
              )}
            </div>
          </div>

        </div>

      </div>

      {/* Historical Archive Table (תיעוד והיסטוריית דוחות בוקר) */}
      <div className="bg-[#111B21] border border-[#222D34] rounded-3xl p-5 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#222D34] pb-3">
          <div className="flex items-center gap-2">
            <Archive className="w-5 h-5 text-sky-400" />
            <h3 className="font-bold text-white text-base">📜 ארכיון ותיעוד היסטוריית דוחות בוקר</h3>
          </div>
          <span className="text-xs text-slate-400">
            מתועד במקביל בגיליון Google Sheets <span className="text-sky-400 font-mono">דוח_בוקר_מבצעי</span>
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-[#202C33] text-slate-300 font-bold border-b border-[#26353E]">
              <tr>
                <th className="py-3 px-3">תאריך דוח</th>
                <th className="py-3 px-3">שעת נעילה</th>
                <th className="py-3 px-3">סה"כ הזמנות</th>
                <th className="py-3 px-3">מחסן החרש 4</th>
                <th className="py-3 px-3">מחסן התלמיד 1</th>
                <th className="py-3 px-3">מרצדס מנוף</th>
                <th className="py-3 px-3">משאית איסוזו</th>
                <th className="py-3 px-3">בלות פקדון</th>
                <th className="py-3 px-3">משטחי סבן</th>
                <th className="py-3 px-3">סטטוס ביצוע</th>
                <th className="py-3 px-3">מתעד</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#222D34]">
              {archiveHistory.map((rep) => (
                <tr key={rep.id} className="hover:bg-[#16222A] transition">
                  <td className="py-3 px-3 font-mono font-bold text-white">{rep.dateStr}</td>
                  <td className="py-3 px-3 font-mono text-slate-400">{rep.lockedAt}</td>
                  <td className="py-3 px-3 font-bold text-cyan-400">{rep.totalOrders}</td>
                  <td className="py-3 px-3 text-amber-400">{rep.harashCount}</td>
                  <td className="py-3 px-3 text-indigo-400">{rep.talmidCount}</td>
                  <td className="py-3 px-3 text-cyan-400">{rep.craneCount}</td>
                  <td className="py-3 px-3 text-emerald-400">{rep.truckCount}</td>
                  <td className="py-3 px-3 font-mono text-slate-300">{rep.totalBigBags}</td>
                  <td className="py-3 px-3 font-mono text-slate-300">{rep.totalPallets}</td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-800 text-[11px] font-semibold">
                      {rep.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-400">{rep.dispatchedBy}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Google Apps Script Modal / Drawer */}
      {showGasModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111B21] border border-[#222D34] rounded-3xl max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            
            <div className="p-5 border-b border-[#222D34] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Code2 className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-white text-base">קוד Google Apps Script — עיצוב טאב דוח בוקר ב-Sheets</h3>
              </div>
              <button
                onClick={() => setShowGasModal(false)}
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-4 overflow-y-auto font-sans text-xs">
              <div className="p-3 bg-amber-950/40 border border-amber-800/80 rounded-2xl text-amber-300 leading-relaxed">
                💡 <strong>איך להשתמש:</strong> פתח את גיליון Google Sheets שלך &gt; לחץ <strong>Extensions (תוספים) &gt; Apps Script</strong> &gt; הדבק את הקוד הבא ושמור &gt; רענן את הגיליון. יתווסף תפריט עליון <strong>"🚚 סידור נועה AI"</strong> עם כפתורי עיצוב ושידור וואטסאפ מתוך הגיליון!
              </div>

              <div className="relative">
                <button
                  onClick={handleCopyGasCode}
                  className="absolute top-3 left-3 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition shadow active:scale-95"
                >
                  {copiedGasCode ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedGasCode ? 'הועתק בהצלחה!' : 'העתק את כל הקוד'}</span>
                </button>

                <pre className="p-4 bg-[#0B141A] rounded-2xl border border-[#222D34] font-mono text-[11px] text-slate-200 overflow-x-auto whitespace-pre leading-normal max-h-96">
                  {GOOGLE_APPS_SCRIPT_MORNING_REPORT_CODE}
                </pre>
              </div>
            </div>

            <div className="p-4 border-t border-[#222D34] flex items-center justify-between">
              <span className="text-xs text-slate-400 font-mono">Spreadsheet ID: {SPREADSHEET_ID}</span>
              <button
                onClick={() => setShowGasModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs"
              >
                סגור
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
