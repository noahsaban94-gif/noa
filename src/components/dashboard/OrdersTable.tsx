import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Navigation as NavIcon, 
  Share2, 
  ExternalLink, 
  FileText, 
  Edit3, 
  Check, 
  AlertCircle,
  Truck,
  MessageSquare,
  Sparkles,
  Download
} from 'lucide-react';
import { LogisticsOrder, OrderStatus } from '../../types/logistics';
import { DRIVERS, WAREHOUSES, ORDER_MODIFIED_RESET_STATUS } from '../../lib/constants';
import { formatWhatsAppDispatchMessage } from '../../lib/parser';

interface OrdersTableProps {
  orders: LogisticsOrder[];
  onUpdateOrder: (order: LogisticsOrder) => void;
  onOpenOrderModal: (order: LogisticsOrder) => void;
  onDispatchWhatsApp: (order: LogisticsOrder) => void;
}

export const OrdersTable: React.FC<OrdersTableProps> = ({
  orders,
  onUpdateOrder,
  onOpenOrderModal,
  onDispatchWhatsApp
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [warehouseFilter, setWarehouseFilter] = useState<string>('all');
  const [driverFilter, setDriverFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [editingOrderId, setEditingOrderId] = useState<string | null>(null);
  const [editNotes, setEditNotes] = useState<string>('');

  const filteredOrders = orders.filter(order => {
    const matchSearch = 
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.siteAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.city.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchWarehouse = warehouseFilter === 'all' || order.warehouse === warehouseFilter;
    const matchDriver = driverFilter === 'all' || order.assignedDriver === driverFilter;
    const matchStatus = statusFilter === 'all' || order.status === statusFilter;

    return matchSearch && matchWarehouse && matchDriver && matchStatus;
  });

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'delivered':
      case 'verified':
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-500/40">✅ סופק במלואו</span>;
      case 'on_the_way':
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-cyan-950 text-cyan-300 border border-cyan-500/40 animate-pulse">🚚 בדרך ליעד</span>;
      case 'loading':
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-950 text-blue-300 border border-blue-500/40">📦 בהעמסה</span>;
      case 'dispatched_whatsapp':
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-teal-950 text-teal-300 border border-teal-500/40">📲 שוגר בוואטסאפ</span>;
      case 'partial_delivery':
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-950 text-amber-300 border border-amber-500/40">⚠️ אספקה חלקית</span>;
      case 'reset_review':
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-950 text-rose-300 border border-rose-500/40">🔄 בבדיקה מחדש</span>;
      case 'pending_doc':
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-purple-950 text-purple-300 border border-purple-500/40">📄 ממתין לתעודה</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-800 text-slate-300 border border-slate-700">⏳ בסידור עבודה</span>;
    }
  };

  const handleEditSave = (order: LogisticsOrder) => {
    const updated: LogisticsOrder = {
      ...order,
      notes: editNotes,
      status: 'reset_review' // Strict rule: Any change resets the status!
    };
    onUpdateOrder(updated);
    setEditingOrderId(null);
  };

  const exportCsv = () => {
    const headers = ['מספר הזמנה', 'שם לקוח', 'מחסן', 'כתובת', 'עיר', 'נהג משויך', 'סטטוס', 'פקדון בלות', 'פקדון משטחים'];
    const rows = filteredOrders.map(o => [
      o.orderNumber,
      `"${o.customerName}"`,
      o.warehouse === '1_TALMID' ? '1 (התלמיד)' : '4 (החרש)',
      `"${o.siteAddress}"`,
      o.city,
      o.driverName || 'חכמת',
      o.status,
      o.deposit?.bigBagsCount ?? 0,
      o.deposit?.palletsCount ?? 0
    ]);
    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Saban_Orders_Dispatch_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="glass-panel p-4 sm:p-5 rounded-2xl">
      
      {/* Top Filter Bar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 mb-4">
        
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="חיפוש לפי מספר הזמנה, לקוח (בוקטוס, ערן אזולאי...), עיר או רחוב..."
            className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl pr-9 pl-4 py-2 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          
          {/* Warehouse */}
          <select
            value={warehouseFilter}
            onChange={(e) => setWarehouseFilter(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:border-cyan-500 outline-none"
          >
            <option value="all">כל המחסנים</option>
            <option value="4_HARASH">🏭 מחסן 4 (החרש)</option>
            <option value="1_TALMID">🏟️ מחסן 1 (התלמיד)</option>
          </select>

          {/* Driver */}
          <select
            value={driverFilter}
            onChange={(e) => setDriverFilter(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:border-cyan-500 outline-none"
          >
            <option value="all">כל הנהגים</option>
            <option value="hikmat">חכמת 🚚 (Cyan)</option>
            <option value="ali">עלי 🚛 (Emerald)</option>
            <option value="external">מוביל חיצוני (Amber)</option>
          </select>

          {/* Status */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:border-cyan-500 outline-none"
          >
            <option value="all">כל הסטטוסים</option>
            <option value="pending_schedule">בסידור עבודה</option>
            <option value="on_the_way">בנסיעה</option>
            <option value="delivered">סופק במלואו</option>
            <option value="partial_delivery">אספקה חלקית</option>
            <option value="reset_review">בבדיקה מחדש</option>
          </select>

          {/* Export CSV */}
          <button
            onClick={exportCsv}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition"
            title="ייצא לאקסל / Sheets"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>CSV</span>
          </button>
        </div>
      </div>

      {/* Orders Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-800">
        <table className="w-full text-right text-xs">
          <thead className="bg-slate-950/90 text-slate-400 font-semibold border-b border-slate-800">
            <tr>
              <th className="py-3 px-3">מספר הזמנה</th>
              <th className="py-3 px-3">שם לקוח / פרויקט</th>
              <th className="py-3 px-3">מחסן יוצא</th>
              <th className="py-3 px-3">כתובת יעד</th>
              <th className="py-3 px-3">פירוט מוצרים</th>
              <th className="py-3 px-3">פקדונות</th>
              <th className="py-3 px-3">נהג משויך</th>
              <th className="py-3 px-3">סטטוס</th>
              <th className="py-3 px-3 text-center">פעולות שיגור</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 bg-slate-900/30">
            {filteredOrders.map(order => {
              const isHikmat = order.assignedDriver === 'hikmat';
              const isEditing = editingOrderId === order.id;

              return (
                <tr 
                  key={order.id}
                  className="hover:bg-slate-800/40 transition group cursor-pointer"
                  onClick={() => onOpenOrderModal(order)}
                >
                  
                  {/* Order Number & Time */}
                  <td className="py-3 px-3 font-mono font-bold text-white whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <span className="text-cyan-400">#{order.orderNumber}</span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-normal block font-sans">
                      {order.receivedAt?.slice(5)}
                    </span>
                  </td>

                  {/* Customer */}
                  <td className="py-3 px-3 font-semibold text-slate-100">
                    <div className="max-w-[160px] truncate" title={order.customerName}>
                      {order.customerName}
                    </div>
                    {order.customerNumber && (
                      <span className="text-[10px] text-slate-500 font-mono">לקוח: {order.customerNumber}</span>
                    )}
                  </td>

                  {/* Warehouse */}
                  <td className="py-3 px-3 whitespace-nowrap">
                    <span className={`px-2 py-0.5 rounded-lg text-[11px] font-bold ${
                      order.warehouse === '1_TALMID' 
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-700/40' 
                        : 'bg-cyan-950 text-cyan-300 border border-cyan-700/40'
                    }`}>
                      {order.warehouse === '1_TALMID' ? '🏟️ 1️⃣(התלמיד)' : '🏭 4️⃣(החרש)'}
                    </span>
                  </td>

                  {/* Address */}
                  <td className="py-3 px-3 text-slate-300 max-w-[170px]">
                    <div className="truncate" title={order.siteAddress}>
                      {order.siteAddress}
                    </div>
                    <span className="text-[10px] text-slate-500">{order.city}</span>
                  </td>

                  {/* Items summary */}
                  <td className="py-3 px-3 text-slate-400 max-w-[200px]">
                    <div className="truncate" title={(order.items || []).map(i => `${i.name} (${i.quantity})`).join(', ')}>
                      {(order.items || []).slice(0, 2).map(i => `${i.name} (${i.quantity} ${i.unit})`).join(' • ')}
                      {(order.items || []).length > 2 && ` +${order.items.length - 2} נוספים`}
                    </div>
                  </td>

                  {/* Deposit status */}
                  <td className="py-3 px-3 whitespace-nowrap">
                    {order.deposit?.isExempt ? (
                      <span className="text-slate-400 text-[11px]">פטור</span>
                    ) : (
                      <div className="text-[11px] space-y-0.5">
                        {(order.deposit?.bigBagsCount ?? 0) > 0 && (
                          <span className="inline-block bg-amber-950/60 text-amber-300 px-1.5 py-0.2 rounded border border-amber-700/40 ml-1">
                            {order.deposit.bigBagsCount} בלות
                          </span>
                        )}
                        {(order.deposit?.palletsCount ?? 0) > 0 && (
                          <span className="inline-block bg-amber-950/60 text-amber-300 px-1.5 py-0.2 rounded border border-amber-700/40">
                            {order.deposit.palletsCount} משטח
                          </span>
                        )}
                        {(order.deposit?.bigBagsCount ?? 0) === 0 && (order.deposit?.palletsCount ?? 0) === 0 && (
                          <span className="text-emerald-400">תקין</span>
                        )}
                      </div>
                    )}
                  </td>

                  {/* Driver */}
                  <td className="py-3 px-3 whitespace-nowrap">
                    <span className={`px-2 py-0.5 rounded-lg text-[11px] font-semibold ${
                      isHikmat ? 'bg-cyan-950 text-cyan-300 border border-cyan-600/40' : 'bg-emerald-950 text-emerald-300 border border-emerald-600/40'
                    }`}>
                      {order.driverName || 'חכמת/עלי'}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="py-3 px-3 whitespace-nowrap">
                    {getStatusBadge(order.status)}
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-3 text-center whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-center gap-1.5">
                      
                      {/* Waze */}
                      <a
                        href={order.wazeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 bg-slate-800 hover:bg-cyan-600/20 text-cyan-400 rounded-lg border border-slate-700 transition"
                        title="נווט ב-Waze"
                      >
                        <NavIcon className="w-3.5 h-3.5" />
                      </a>

                      {/* WhatsApp Dispatch */}
                      <button
                        onClick={() => onDispatchWhatsApp(order)}
                        className="p-1.5 bg-emerald-950/60 hover:bg-emerald-600/30 text-emerald-400 rounded-lg border border-emerald-700/40 transition"
                        title="שגר תדריך וואטסאפ לנהג"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                      </button>

                      {/* Edit (triggers status reset) */}
                      <button
                        onClick={() => {
                          const newQty = prompt(`שינוי כמות עבור ${order.customerName} (שינוי יאפס את הסטטוס):`, '50');
                          if (newQty) {
                            const updated: LogisticsOrder = {
                              ...order,
                              status: 'reset_review',
                              notes: `עודכנה כמות ל-${newQty} שקים ע"י ראמי (${new Date().toLocaleTimeString('he-IL')})`
                            };
                            onUpdateOrder(updated);
                            alert(`שינוי נשמר! ${ORDER_MODIFIED_RESET_STATUS}`);
                          }
                        }}
                        className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition"
                        title="עדכן פרטים (מאפס סטטוס)"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>

                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
        <span>מציג {filteredOrders.length} מתוך {orders.length} הזמנות</span>
        <span className="text-cyan-400">ח. סבן חומרי בניין בע"מ — מערכת סדרנות חכמה</span>
      </div>

    </div>
  );
};
