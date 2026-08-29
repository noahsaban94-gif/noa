import React from 'react';
import { 
  Clock, 
  Truck, 
  MapPin, 
  CheckCircle2, 
  Navigation as NavIcon, 
  ExternalLink,
  ChevronLeft,
  PhoneCall
} from 'lucide-react';
import { LogisticsOrder } from '../../types/logistics';
import { DRIVERS, TIME_SLOTS } from '../../lib/constants';

interface FleetTimelineProps {
  orders: LogisticsOrder[];
  onOrderClick?: (order: LogisticsOrder) => void;
}

export const FleetTimeline: React.FC<FleetTimelineProps> = ({ orders, onOrderClick }) => {
  const hikmatOrders = orders.filter(o => o.assignedDriver === 'hikmat');
  const aliOrders = orders.filter(o => o.assignedDriver === 'ali');

  return (
    <div className="glass-panel p-4 sm:p-5 rounded-2xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">ציר זמנים וסבבי חלוקה יומיים (07:00–17:00)</h3>
            <p className="text-xs text-slate-400">מעקב סבבים חי לפי שעות ומשאיות ח. סבן</p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5 text-cyan-300">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
            <span>חכמת ({hikmatOrders.length} יעדים)</span>
          </div>
          <div className="flex items-center gap-1.5 text-emerald-300">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            <span>עלי ({aliOrders.length} יעדים)</span>
          </div>
        </div>
      </div>

      {/* Hourly Grid */}
      <div className="space-y-3">
        {TIME_SLOTS.map((slot, idx) => {
          const slotOrders = orders.filter(o => o.timeSlot === slot || (!o.timeSlot && idx === 0));
          
          return (
            <div key={slot} className="flex flex-col md:flex-row items-start md:items-center gap-3 p-2.5 rounded-xl bg-slate-900/50 border border-slate-800/80 hover:border-slate-700 transition">
              
              {/* Time Badge */}
              <div className="min-w-[110px] flex items-center gap-1.5 text-xs font-mono font-bold text-slate-300 bg-slate-950 px-2.5 py-1.5 rounded-lg border border-slate-800">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                <span>{slot}</span>
              </div>

              {/* Assigned Missions in this slot */}
              <div className="flex-1 flex flex-wrap items-center gap-2 w-full">
                {slotOrders.length === 0 ? (
                  <span className="text-xs text-slate-500 italic pr-2">חלון זמן פנוי לשיבוץ</span>
                ) : (
                  slotOrders.map(order => {
                    const isHikmat = order.assignedDriver === 'hikmat';
                    const isDelivered = order.status === 'delivered' || order.status === 'verified';
                    
                    return (
                      <div
                        key={order.id}
                        onClick={() => onOrderClick && onOrderClick(order)}
                        className={`flex items-center justify-between gap-3 px-3 py-2 rounded-xl text-xs cursor-pointer transition flex-1 min-w-[220px] max-w-md ${
                          isHikmat 
                            ? 'bg-cyan-950/40 border border-cyan-500/30 hover:border-cyan-400 text-slate-200' 
                            : 'bg-emerald-950/40 border border-emerald-500/30 hover:border-emerald-400 text-slate-200'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${isDelivered ? 'bg-slate-500' : isHikmat ? 'bg-cyan-400 animate-pulse' : 'bg-emerald-400 animate-pulse'}`} />
                          <div>
                            <div className="font-bold text-white flex items-center gap-1.5">
                              <span>#{order.orderNumber}</span>
                              <span className="text-slate-300 font-normal truncate max-w-[130px]">{order.customerName}</span>
                            </div>
                            <span className="text-[11px] text-slate-400 block truncate max-w-[180px]">
                              📍 {order.siteAddress}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <a
                            href={order.wazeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="p-1.5 bg-slate-900 hover:bg-cyan-500/20 text-cyan-400 rounded-lg border border-slate-700 transition"
                            title="פתח ב-Waze"
                          >
                            <NavIcon className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
};
