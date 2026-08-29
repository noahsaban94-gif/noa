import React, { useState } from 'react';
import { 
  FileText, 
  Mail, 
  FolderOpen, 
  Download, 
  ExternalLink, 
  CheckCircle2, 
  Truck, 
  MapPin, 
  Send, 
  Navigation as NavIcon, 
  ShieldCheck, 
  Copy, 
  Check, 
  Layers, 
  Eye, 
  EyeOff, 
  Clock, 
  Building2,
  Sparkles,
  QrCode,
  Share2
} from 'lucide-react';
import { LogisticsOrder, OrderEmailMeta } from '../../types/logistics';
import { DRIVERS } from '../../lib/constants';

interface PhysicalOrderDocumentCardProps {
  order: LogisticsOrder;
  emailMeta?: OrderEmailMeta;
  onDispatch?: () => void;
  onOpenPdfModal?: () => void;
}

export const PhysicalOrderDocumentCard: React.FC<PhysicalOrderDocumentCardProps> = ({
  order,
  emailMeta,
  onDispatch,
  onOpenPdfModal
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [showFullPdfPreview, setShowFullPdfPreview] = useState(true);
  const [dispatchedState, setDispatchedState] = useState(order.status === 'dispatched_whatsapp');

  const meta = emailMeta || order.emailMeta || {
    senderEmail: 'ramims@saban94.co.il דרך comax.co.il',
    senderName: 'ראמי סבן (קומקס ERP)',
    recipientEmail: 'rami.msarwa1@gmail.com',
    subject: `הזמנה ${order.orderNumber} ללקוח: ${order.customerName}`,
    sentAt: '28 באוג׳ 2026, 12:21',
    systemOrigin: 'em2358.comax.co.il',
    securityInfo: 'הצפנה סטנדרטית (TLS)',
    importanceNote: 'אנחנו סבורים שההודעה הזו חשובה.',
    pdfFileName: `Comax_Order_${order.orderNumber}_${order.customerName.replace(/\s+/g, '_')}.pdf`,
    pdfFileSize: '184 KB',
    pdfDriveUrl: order.orderDocumentUrl || 'https://drive.google.com/file/d/1_6215194_ArugatHaBosem_ComaxDoc_PDF/view',
    driveFolderUrl: order.driveFolderUrl || 'https://drive.google.com/drive/folders/1aiBomF1MRJZueGEvFpJRrhPV-2lvIMWF',
    driveFolderName: 'Google Drive / Saban Logistics Cloud / הזמנות קומקס 2026'
  };

  const handleCopyDriveLink = () => {
    navigator.clipboard.writeText(meta.pdfDriveUrl || 'https://drive.google.com');
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleQuickDispatch = () => {
    setDispatchedState(true);
    if (onDispatch) {
      onDispatch();
    }
  };

  const dep = order.deposit || { palletsCount: 2, bigBagsCount: 18, status: 'יש בלות' };
  const driverInfo = DRIVERS[order.assignedDriver as 'hikmat' | 'ali'] || DRIVERS.hikmat;

  return (
    <div 
      dir="rtl"
      className="my-4 w-full max-w-2xl rounded-2xl bg-[#0F172A] text-slate-100 border-2 border-emerald-500/40 shadow-2xl overflow-hidden font-sans transition-all duration-300 hover:border-emerald-400"
    >
      {/* 1. סרגל עליון: נתוני אימייל מקור וקומקס ERP */}
      <div className="bg-gradient-to-r from-emerald-950/90 via-slate-900 to-slate-900 p-3.5 sm:p-4 border-b border-emerald-500/30">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shrink-0">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 uppercase tracking-wider">
                  קליטת מייל קומקס אוטומטית
                </span>
                <span className="text-[11px] text-slate-400 font-mono">
                  {meta.sentAt}
                </span>
              </div>
              <h4 className="text-sm font-bold text-white mt-1 line-clamp-1">
                {meta.subject}
              </h4>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-900/60 text-emerald-300 border border-emerald-700/50">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              <span>TLS מאומת</span>
            </span>
          </div>
        </div>

        {/* מטא-דאטה מורחב של הודעת המייל */}
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
          <div className="truncate">
            <span className="text-slate-400 font-medium ml-1">מאת:</span>
            <span className="text-slate-200 font-mono">{meta.senderEmail}</span>
          </div>
          <div className="truncate">
            <span className="text-slate-400 font-medium ml-1">אל:</span>
            <span className="text-slate-200 font-mono">{meta.recipientEmail}</span>
          </div>
          <div className="truncate sm:col-span-2 text-slate-400 text-[11px] flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-amber-400 shrink-0" />
            <span>{meta.importanceNote} נסרק, חולץ ונשמר ע"י <strong>נועה AI</strong></span>
          </div>
        </div>
      </div>

      {/* 2. קנבס תצוגת מסמך הזמנה אמיתי פיזי (Physical Scanned Doc Card) */}
      <div className="p-4 sm:p-5 bg-gradient-to-b from-slate-900/90 to-slate-950">
        
        {/* ראש המסמך הפיזי של ח. סבן */}
        <div className="relative p-4 sm:p-5 rounded-xl bg-[#FAF9F5] text-slate-900 border-2 border-slate-300 shadow-md font-sans overflow-hidden">
          
          {/* רקע חותמת מים ואבטחה */}
          <div className="absolute top-3 left-3 opacity-15 rotate-[-15deg] pointer-events-none select-none">
            <div className="border-4 border-emerald-800 rounded-2xl p-3 text-center">
              <span className="text-2xl font-black text-emerald-800 block">ח. סבן</span>
              <span className="text-[10px] font-bold text-emerald-800 block">נבדק ואושר ע"י נועה AI</span>
            </div>
          </div>

          {/* לוגו וכותרת טופס רשמי */}
          <div className="flex items-start justify-between border-b-2 border-slate-800 pb-3 mb-3">
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                ח. סבן חומרי בניין (1994) בע"מ
              </h2>
              <p className="text-[11px] text-slate-600 font-medium">
                ח.פ: 511942851 | מחסן מרכזי 4 החרש, כפר סבא | טל: 09-7672224
              </p>
              <div className="inline-block mt-1 px-2 py-0.5 bg-slate-900 text-white font-bold text-[10px] rounded">
                טופס קליטת הזמנה מקורית — קומקס ERP
              </div>
            </div>

            <div className="text-left font-mono shrink-0">
              <div className="text-xs font-bold text-slate-800">הזמנה מס':</div>
              <div className="text-lg font-black text-emerald-700">#{order.orderNumber}</div>
              <div className="text-[10px] text-slate-500 font-bold tracking-widest mt-0.5">
                |||| ||| |||||||
              </div>
            </div>
          </div>

          {/* גריד פרטי הלקוח ואתר הפריקה */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs bg-slate-100 p-2.5 rounded-lg border border-slate-300 mb-3">
            <div>
              <span className="text-slate-500 text-[10px] block font-bold">שם הלקוח:</span>
              <span className="font-bold text-slate-900 text-sm">{order.customerName}</span>
              {order.customerNumber && (
                <span className="text-[10px] text-slate-500 block">מספר לקוח: {order.customerNumber}</span>
              )}
            </div>

            <div>
              <span className="text-slate-500 text-[10px] block font-bold">אתר פריקה:</span>
              <span className="font-bold text-slate-900">{order.siteAddress}</span>
              <span className="text-[10px] text-slate-600 block">{order.city}</span>
            </div>

            <div className="col-span-2 sm:col-span-1">
              <span className="text-slate-500 text-[10px] block font-bold">שיבוץ מחסן ונהג:</span>
              <span className="font-bold text-emerald-800 block">
                {order.warehouse === '4_HARASH' ? '🏭 4 החרש' : '🏟️ 1 התלמיד'} • {driverInfo.name}
              </span>
              <span className="text-[10px] text-amber-800 font-medium block">
                {order.isCraneRequired ? '⚡ פריקת מנוף 26 טון' : 'פריקה רגילה'}
              </span>
            </div>
          </div>

          {/* טבלת הפריטים המקורית שחולצה מהקובץ */}
          <div className="mb-3">
            <div className="text-xs font-bold text-slate-800 mb-1 flex items-center justify-between">
              <span>פירוט מוצרים ומק"טים שחולצו ({order.items.length} פריטים)</span>
              <span className="text-[10px] text-slate-500">משקל מוערך: ~24.5 טון</span>
            </div>

            <div className="border border-slate-300 rounded overflow-hidden">
              <table className="w-full text-xs text-right border-collapse">
                <thead>
                  <tr className="bg-slate-200 text-slate-700 font-bold border-b border-slate-300">
                    <th className="p-1.5">מק"ט</th>
                    <th className="p-1.5">תיאור המוצר</th>
                    <th className="p-1.5 text-center">כמות</th>
                    <th className="p-1.5 text-center">יחידה</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {order.items.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="p-1.5 font-mono text-slate-600 text-[11px]">{item.sku}</td>
                      <td className="p-1.5 font-semibold text-slate-900">{item.name}</td>
                      <td className="p-1.5 text-center font-bold font-mono text-slate-900">{item.quantity}</td>
                      <td className="p-1.5 text-center text-slate-600 text-[11px]">{item.unit}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* חישוב פקדונות אוטומטי ע"י נועה */}
          <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-between flex-wrap gap-2 text-xs">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-700" />
              <div>
                <span className="font-bold text-amber-950 block">חישוב פקדונות אוטומטי (נועה AI):</span>
                <span className="text-amber-800 text-[11px]">
                  בלות חול/סומסום: <strong>{dep.bigBagsCount}</strong> | משטחי סבן: <strong>{dep.palletsCount}</strong> (מעל 20 שקים = 2 משטחים)
                </span>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded bg-amber-200 text-amber-900 font-bold text-[10px]">
              תקין ומאושר
            </span>
          </div>
        </div>

        {/* 3. סנכרון תיקיית Google Drive ייעודית */}
        <div className="mt-3.5 p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs">
          <div className="flex items-center justify-between gap-2 flex-wrap pb-2 mb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <FolderOpen className="w-4 h-4 text-amber-400" />
              <div>
                <span className="text-slate-400 text-[11px] block">תיקייה ייעודית בדרייב:</span>
                <span className="font-bold text-slate-200">{meta.driveFolderName}</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <a
                href={meta.driveFolderUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-2.5 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-lg text-[11px] font-bold flex items-center gap-1 transition"
              >
                <FolderOpen className="w-3.5 h-3.5" />
                <span>פתח תיקיית Drive</span>
              </a>
            </div>
          </div>

          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <FileText className="w-4 h-4 text-emerald-400 shrink-0" />
              <div className="truncate">
                <span className="text-white font-mono font-medium truncate block">{meta.pdfFileName}</span>
                <span className="text-[10px] text-slate-500">{meta.pdfFileSize} • סנכרון הושלם</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={handleCopyDriveLink}
                className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[11px] flex items-center gap-1 transition"
                title="העתק קישור ישיר לקובץ"
              >
                {copiedLink ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedLink ? 'הועתק!' : 'העתק לינק'}</span>
              </button>

              <a
                href={meta.pdfDriveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[11px] font-bold flex items-center gap-1 shadow transition"
              >
                <Download className="w-3 h-3" />
                <span>צפה בקובץ מקור</span>
              </a>
            </div>
          </div>
        </div>

        {/* 4. סרגל פעולות מהיר לשיגור וניווט */}
        <div className="mt-3.5 pt-3 border-t border-slate-800 flex items-center gap-2 flex-wrap">
          
          {/* כפתור שיגור ראשי לנהג חכמת */}
          <button
            onClick={handleQuickDispatch}
            disabled={dispatchedState}
            className={`flex-1 min-w-[180px] py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-lg transition active:scale-95 ${
              dispatchedState 
                ? 'bg-emerald-950 text-emerald-300 border border-emerald-700 cursor-default'
                : 'bg-[#00A884] hover:bg-[#008f6f] text-[#111B21]'
            }`}
          >
            {dispatchedState ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>שוגר לנהג חכמת ולוואטסאפ ✅</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>שגר ישירות לנהג חכמת (משאית מנוף)</span>
              </>
            )}
          </button>

          {/* כפתור ניווט Waze */}
          {order.wazeUrl && (
            <a
              href={order.wazeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-medium flex items-center gap-1.5 border border-slate-700 transition"
            >
              <NavIcon className="w-3.5 h-3.5 text-sky-400 fill-current" />
              <span>Waze לבצרה</span>
            </a>
          )}
        </div>

      </div>
    </div>
  );
};
