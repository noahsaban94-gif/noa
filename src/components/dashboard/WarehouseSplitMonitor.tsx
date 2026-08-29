import React from 'react';
import { Warehouse, Building2, Package, Truck, ArrowLeftRight, Check, AlertCircle } from 'lucide-react';
import { LogisticsOrder } from '../../types/logistics';
import { WAREHOUSES } from '../../lib/constants';

interface WarehouseSplitMonitorProps {
  orders: LogisticsOrder[];
  onSelectWarehouse?: (warehouseId: string) => void;
}

export const WarehouseSplitMonitor: React.FC<WarehouseSplitMonitorProps> = ({ orders, onSelectWarehouse }) => {
  const harashOrders = orders.filter(o => o.warehouse === '4_HARASH');
  const talmidOrders = orders.filter(o => o.warehouse === '1_TALMID');

  // Heavy products stats for Harash
  const harashCementBags = harashOrders.reduce((sum, o) => {
    return sum + (o.items || []).filter(i => i.name.includes('מלט') || i.category === 'cement').reduce((s, i) => s + i.quantity, 0);
  }, 0);

  const harashBigBags = harashOrders.reduce((sum, o) => sum + (o.deposit?.bigBagsCount || 0), 0);

  // Drywall / Tools stats for Talmid
  const talmidDrywallSheets = talmidOrders.reduce((sum, o) => {
    return sum + (o.items || []).filter(i => i.name.includes('גבס') || i.category === 'plaster_drywall').reduce((s, i) => s + i.quantity, 0);
  }, 0);

  const talmidToolsCount = talmidOrders.reduce((sum, o) => {
    return sum + (o.items || []).filter(i => !i.name.includes('גבס') && i.category !== 'plaster_drywall').reduce((s, i) => s + i.quantity, 0);
  }, 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      
      {/* 🏭 Warehouse 4 - Harash */}
      <div className="glass-panel p-4 sm:p-5 rounded-2xl border-cyan-500/30 relative overflow-hidden">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-lg border border-cyan-500/40">
              4️⃣
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">🏭 מחסן 4 — החרש</h3>
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-cyan-950 text-cyan-300 border border-cyan-700/50">
                  מליטה כבדה וברזל
                </span>
              </div>
              <p className="text-xs text-slate-400">רחוב החרש 4, א.ת. הוד השרון • מלט, חול, בלות, ברזל, בלוקים</p>
            </div>
          </div>
          <span className="text-xl font-extrabold text-cyan-400 font-mono">
            {harashOrders.length} <span className="text-xs font-normal text-slate-400">הזמנות</span>
          </span>
        </div>

        {/* Categories Breakdown */}
        <div className="grid grid-cols-3 gap-2 my-3.5">
          <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 text-center">
            <span className="text-[11px] text-slate-400 block">שקי מלט נשר</span>
            <span className="text-lg font-bold text-white font-mono">{harashCementBags}</span>
          </div>
          <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 text-center">
            <span className="text-[11px] text-slate-400 block">בלות חול/סומסום</span>
            <span className="text-lg font-bold text-cyan-300 font-mono">{harashBigBags}</span>
          </div>
          <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 text-center">
            <span className="text-[11px] text-slate-400 block">משאית מובילה</span>
            <span className="text-sm font-bold text-cyan-400">חכמת (מנוף 1)</span>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/80">
          <span className="flex items-center gap-1.5 text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            משטח טעינה פתוח למנוף
          </span>
          <span className="text-slate-400 text-[11px]">זמן העמסה ממוצע: 18 דק'</span>
        </div>
      </div>

      {/* 🏟️ Warehouse 1 - Talmid */}
      <div className="glass-panel p-4 sm:p-5 rounded-2xl border-emerald-500/30 relative overflow-hidden">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-lg border border-emerald-500/40">
              1️⃣
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">🏟️ מחסן 1 — התלמיד</h3>
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-950 text-emerald-300 border border-emerald-700/50">
                  גבס, צבעים וכלים
                </span>
              </div>
              <p className="text-xs text-slate-400">רחוב התלמיד 1, א.ת. הוד השרון • לוחות גבס, ניצבים, צבע, אינסטלציה</p>
            </div>
          </div>
          <span className="text-xl font-extrabold text-emerald-400 font-mono">
            {talmidOrders.length} <span className="text-xs font-normal text-slate-400">הזמנות</span>
          </span>
        </div>

        {/* Categories Breakdown */}
        <div className="grid grid-cols-3 gap-2 my-3.5">
          <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 text-center">
            <span className="text-[11px] text-slate-400 block">לוחות גבס / פרופילים</span>
            <span className="text-lg font-bold text-white font-mono">{talmidDrywallSheets}</span>
          </div>
          <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 text-center">
            <span className="text-[11px] text-slate-400 block">כלי עבודה ואינסטלציה</span>
            <span className="text-lg font-bold text-emerald-300 font-mono">{talmidToolsCount} יח'</span>
          </div>
          <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 text-center">
            <span className="text-[11px] text-slate-400 block">משאית מובילה</span>
            <span className="text-sm font-bold text-emerald-400">עלי (מנוף 2)</span>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/80">
          <span className="flex items-center gap-1.5 text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            מלקטים פעילים באולם
          </span>
          <span className="text-slate-400 text-[11px]">זמן ליקוט ממוצע: 12 דק'</span>
        </div>
      </div>

    </div>
  );
};
