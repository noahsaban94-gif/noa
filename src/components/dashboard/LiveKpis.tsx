import React from 'react';
import { 
  Package, 
  Truck, 
  Layers, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  ArrowUpRight,
  TrendingUp
} from 'lucide-react';
import { LogisticsOrder } from '../../types/logistics';

interface LiveKpisProps {
  orders: LogisticsOrder[];
  onFilterClick?: (status: string) => void;
}

export const LiveKpis: React.FC<LiveKpisProps> = ({ orders, onFilterClick }) => {
  const totalOrders = orders.length;
  const inSchedule = orders.filter(o => o.status === 'pending_schedule' || o.status === 'dispatched_whatsapp').length;
  const onTheWay = orders.filter(o => o.status === 'on_the_way' || o.status === 'loading').length;
  const delivered = orders.filter(o => o.status === 'delivered' || o.status === 'verified').length;
  const partialOrAlerts = orders.filter(o => o.status === 'partial_delivery' || o.status === 'pending_doc' || o.status === 'reset_review').length;

  // Deposit balances
  const totalOpenPallets = orders.reduce((sum, o) => sum + (o.deposit?.palletsCount || 0), 0);
  const totalOpenBigBags = orders.reduce((sum, o) => sum + (o.deposit?.bigBagsCount || 0), 0);

  const hikmatOrdersCount = orders.filter(o => o.assignedDriver === 'hikmat').length;
  const aliOrdersCount = orders.filter(o => o.assignedDriver === 'ali').length;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
      
      {/* 1. Active Deliveries */}
      <div 
        onClick={() => onFilterClick && onFilterClick('all')}
        className="glass-panel glass-panel-hover p-4 rounded-2xl cursor-pointer relative overflow-hidden group"
      >
        <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/10 rounded-full blur-2xl -mr-6 -mt-6 group-hover:bg-cyan-500/20 transition" />
        
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-400">סה"כ הזמנות פעילות</span>
          <div className="p-2 bg-cyan-500/15 text-cyan-400 rounded-xl">
            <Package className="w-5 h-5" />
          </div>
        </div>

        <div className="flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-extrabold text-white font-mono">{totalOrders}</span>
          <span className="text-xs font-medium text-emerald-400 flex items-center">
            <CheckCircle2 className="w-3.5 h-3.5 ml-1" />
            {delivered} סופקו
          </span>
        </div>

        <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800">
          <span>{inSchedule} בסידור</span>
          <span className="text-cyan-400 font-medium">{onTheWay} בדרך / בהעמסה</span>
        </div>
      </div>

      {/* 2. Scheduled Trucks & Drivers */}
      <div className="glass-panel glass-panel-hover p-4 rounded-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl -mr-6 -mt-6 group-hover:bg-emerald-500/20 transition" />
        
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-400">משאיות מנוף בשטח</span>
          <div className="p-2 bg-emerald-500/15 text-emerald-400 rounded-xl">
            <Truck className="w-5 h-5" />
          </div>
        </div>

        <div className="flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-extrabold text-white font-mono">2/2</span>
          <span className="text-xs font-medium text-cyan-400">חכמת + עלי</span>
        </div>

        <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800">
          <span className="text-cyan-300 font-mono">חכמת: {hikmatOrdersCount} יעדים</span>
          <span className="text-emerald-300 font-mono">עלי: {aliOrdersCount} יעדים</span>
        </div>
      </div>

      {/* 3. Open Pallet & Big-Bag Deposits Balance */}
      <div className="glass-panel glass-panel-hover p-4 rounded-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl -mr-6 -mt-6 group-hover:bg-amber-500/20 transition" />
        
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-400">יתרת פקדונות בשטח</span>
          <div className="p-2 bg-amber-500/15 text-amber-400 rounded-xl">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        <div className="flex items-baseline gap-3">
          <div>
            <span className="text-xl sm:text-2xl font-bold text-amber-300 font-mono">{totalOpenBigBags}</span>
            <span className="text-[11px] text-slate-400 mr-1">בלות (60002)</span>
          </div>
          <div className="text-slate-600">|</div>
          <div>
            <span className="text-xl sm:text-2xl font-bold text-amber-300 font-mono">{totalOpenPallets}</span>
            <span className="text-[11px] text-slate-400 mr-1">משטחים (60060)</span>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800">
          <span className="text-emerald-400">אימות אוטומטי מול קומקס</span>
          <span className="text-amber-400 font-medium">מעקב החזרות</span>
        </div>
      </div>

      {/* 4. Alerts, Discrepancies & Pending Notes */}
      <div className="glass-panel glass-panel-hover p-4 rounded-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/10 rounded-full blur-2xl -mr-6 -mt-6 group-hover:bg-rose-500/20 transition" />
        
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-400">חריגות ותעודות בהמתנה</span>
          <div className="p-2 bg-rose-500/15 text-rose-400 rounded-xl">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        <div className="flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-extrabold text-rose-300 font-mono">{partialOrAlerts}</span>
          <span className="text-xs font-medium text-rose-400">דורש טיפול סדרנות</span>
        </div>

        <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800">
          <span className="text-amber-400 font-medium">1 אספקה חלקית</span>
          <span className="text-slate-400">קבוצת חסון מגל</span>
        </div>
      </div>

    </div>
  );
};
