import React, { useState } from 'react';
import { motion, PanInfo } from 'motion/react';
import { LogisticsOrder } from '../../types/logistics';
import { MapPin, Navigation, Trash2, GripVertical, AlertTriangle } from 'lucide-react';

interface SwipeableMorningOrderItemProps {
  order: LogisticsOrder;
  driverType: 'hikmat' | 'ali' | 'other';
  onDelete: (order: LogisticsOrder) => void;
}

export const SwipeableMorningOrderItem: React.FC<SwipeableMorningOrderItemProps> = ({
  order,
  driverType,
  onDelete
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);

  const isHikmat = driverType === 'hikmat';
  const isAli = driverType === 'ali';

  // Badge styles
  const timeBadgeColor = isHikmat
    ? 'bg-cyan-900/70 text-cyan-300 border-cyan-800'
    : isAli
    ? 'bg-emerald-900/70 text-emerald-300 border-emerald-800'
    : 'bg-amber-900/70 text-amber-300 border-amber-800';

  const defaultTime = isHikmat ? '09:00' : '08:00';

  const handleDrag = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    setDragOffset(info.offset.x);
  };

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    // Left drag threshold: -90px or fast swipe to left
    if (info.offset.x < -90 || info.velocity.x < -450) {
      triggerDelete();
    } else {
      setDragOffset(0);
    }
  };

  const triggerDelete = () => {
    setIsDeleting(true);
    setTimeout(() => {
      onDelete(order);
    }, 220);
  };

  const isSwipeTriggered = dragOffset < -70;

  return (
    <div className="relative overflow-hidden rounded-2xl select-none group">
      {/* Background Action Layer (Revealed on swipe left) */}
      <div 
        className={`absolute inset-0 rounded-2xl flex items-center justify-end px-5 transition-colors duration-200 ${
          isSwipeTriggered 
            ? 'bg-rose-600 text-white shadow-inner' 
            : 'bg-rose-950/80 text-rose-300 border border-rose-800/60'
        }`}
      >
        <div className="flex items-center gap-2 font-bold text-xs">
          <span>{isSwipeTriggered ? 'שחרר להסרה מיידית!' : 'החלק להסרת נסיעה'}</span>
          <div className={`p-2 rounded-xl ${isSwipeTriggered ? 'bg-white/20 scale-110' : 'bg-rose-900/60'} transition transform`}>
            <Trash2 className="w-4 h-4 text-white" />
          </div>
        </div>
      </div>

      {/* Foreground Draggable Card */}
      <motion.div
        layout
        drag="x"
        dragConstraints={{ left: -140, right: 0 }}
        dragElastic={0.15}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        animate={isDeleting ? { x: -350, opacity: 0, scale: 0.95 } : { x: 0, opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 350, damping: 28 }}
        className="relative z-10 p-3.5 rounded-2xl bg-[#16222A] hover:bg-[#1a2a35] border border-[#26353E] cursor-grab active:cursor-grabbing space-y-2.5 transition-colors"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Drag Handle Icon for Desktop clarity */}
            <div className="text-slate-600 group-hover:text-slate-400 transition cursor-grab">
              <GripVertical className="w-3.5 h-3.5" />
            </div>

            <span className={`px-2 py-0.5 rounded-md font-mono font-bold text-xs border ${timeBadgeColor}`}>
              {order.scheduledTime || defaultTime}
            </span>
            <span className="font-bold text-white text-xs">#{order.orderNumber}</span>
            <span className="text-slate-200 font-semibold text-xs truncate max-w-[170px] sm:max-w-[220px]">
              {order.customerName}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-950/80 text-amber-300 border border-amber-800">
              {order.warehouse === '1_TALMID' ? '🏟️ התלמיד 1' : '🏭 החרש 4'}
            </span>

            {/* Quick delete button for desktop / mouse fallback */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                triggerDelete();
              }}
              title="הסר נסיעה זו מדוח הבוקר"
              className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg bg-slate-800/80 hover:bg-rose-950 hover:text-rose-400 text-slate-400 transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
          <span className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-slate-500" />
            <span>{order.siteAddress}, {order.city}</span>
          </span>

          {order.wazeUrl && (
            <a
              href={order.wazeUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className={`flex items-center gap-1 font-semibold ${
                isHikmat ? 'text-cyan-400 hover:text-cyan-300' : 'text-emerald-400 hover:text-emerald-300'
              }`}
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>נווט ב-Waze</span>
            </a>
          )}
        </div>

        {/* Items brief */}
        <div className="text-[11px] text-slate-300 bg-slate-900/60 p-2 rounded-xl border border-slate-800">
          <span className="text-slate-400 font-bold ml-1">מוצרים:</span>
          {(order.items || []).map(i => `${i.quantity} ${i.name}`).join(' | ') || 'פריטים כלליים'}
        </div>

        {/* Crane requirement if present */}
        {order.isCraneRequired && (
          <div className="text-[11px] text-cyan-400 bg-cyan-950/40 px-2.5 py-1 rounded-lg border border-cyan-900/50 flex items-center gap-1.5">
            <span>🏗️</span>
            <span>{order.craneDescription || 'נדרשת פריקת מנוף באתר הלקוח'}</span>
          </div>
        )}
      </motion.div>
    </div>
  );
};
