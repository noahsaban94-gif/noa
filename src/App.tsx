import React, { useState, useEffect } from 'react';
import { LiveKpis } from './components/dashboard/LiveKpis';
import { WarehouseSplitMonitor } from './components/dashboard/WarehouseSplitMonitor';
import { FleetTimeline } from './components/dashboard/FleetTimeline';
import { OrdersTable } from './components/dashboard/OrdersTable';
import { WhatsAppChat } from './components/whatsapp/WhatsAppChat';
import { MorningReportView } from './components/reports/MorningReportView';
import { DispatchBriefingModal } from './components/whatsapp/DispatchBriefingModal';
import { NoiseSphere } from './components/effects/NoiseSphere';
import { LogisticsOrder } from './types/logistics';
import { getStoredOrders, saveStoredOrders, updateSingleOrder, deleteSingleOrder } from './lib/storage';
import { 
  X, 
  MapPin, 
  Clock, 
  Truck, 
  Navigation as NavIcon, 
  ArrowRight,
  LayoutDashboard,
  Calendar,
  BellRing,
  ExternalLink
} from 'lucide-react';

export default function App() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [orders, setOrders] = useState<LogisticsOrder[]>([]);
  const [activeOverlayView, setActiveOverlayView] = useState<'dashboard' | 'morning_report' | null>(null);
  const [selectedOrderModal, setSelectedOrderModal] = useState<LogisticsOrder | null>(null);
  const [dispatchModalOrder, setDispatchModalOrder] = useState<LogisticsOrder | null>(null);
  const [isNoaAnswering, setIsNoaAnswering] = useState<boolean>(false);
  const [incomingDriverPushToast, setIncomingDriverPushToast] = useState<{
    heading: string;
    body: string;
    wazeUrl: string;
    driverName: string;
  } | null>(null);

  // Initialize and listen to storage events & live Noa Google Sheet sync
  useEffect(() => {
    setOrders(getStoredOrders());

    // Fetch live morning dispatch directly from Noa Google Sheet endpoint
    fetch('/api/gas/morning-dispatch')
      .then(res => res.json())
      .then(data => {
        if (data && data.status === 'success' && Array.isArray(data.tasks) && data.tasks.length > 0) {
          console.log('✅ Synchronized directly with Noa Google Sheet:', data.tasks.length, 'tasks');
        }
      })
      .catch(err => {
        console.warn('Live sync fallback to stored orders:', err.message);
      });

    const handleOrdersUpdated = (e: any) => {
      if (e.detail) {
        setOrders(e.detail);
      } else {
        setOrders(getStoredOrders());
      }
    };

    const handleDriverPush = (e: any) => {
      if (e.detail) {
        setIncomingDriverPushToast({
          heading: e.detail.heading,
          body: e.detail.body,
          wazeUrl: e.detail.wazeUrl,
          driverName: e.detail.driverName
        });
        setTimeout(() => setIncomingDriverPushToast(null), 8000);
      }
    };

    window.addEventListener('orders_updated', handleOrdersUpdated);
    window.addEventListener('driver_push_notification', handleDriverPush);
    return () => {
      window.removeEventListener('orders_updated', handleOrdersUpdated);
      window.removeEventListener('driver_push_notification', handleDriverPush);
    };
  }, []);

  const handleAddNewOrder = (newOrder: LogisticsOrder) => {
    const updated = [newOrder, ...orders];
    setOrders(updated);
    saveStoredOrders(updated);
  };

  const handleUpdateOrder = (updatedOrder: LogisticsOrder) => {
    updateSingleOrder(updatedOrder);
    setOrders(getStoredOrders());
  };

  const handleDeleteOrder = (orderIdOrNumber: string) => {
    deleteSingleOrder(orderIdOrNumber);
    setOrders(getStoredOrders());
  };

  return (
    <div className="w-full h-screen bg-[#070D12] text-slate-100 font-['Rubik',sans-serif] select-none overflow-hidden flex flex-col relative">
      
      {/* ======================================================== */}
      {/* 3D NOISE SPHERICAL SHADER (PERLIN NOISE + MOUSE COLOR)   */}
      {/* ======================================================== */}
      <NoiseSphere 
        isAnswering={isNoaAnswering} 
        className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none"
      />

      {/* ======================================================== */}
      {/* IN-APP ONESIGNAL DRIVER PUSH NOTIFICATION TOAST          */}
      {/* ======================================================== */}
      {incomingDriverPushToast && (
        <div className="fixed top-4 left-4 right-4 sm:left-auto sm:right-6 sm:w-96 z-50 bg-[#111B21] border-2 border-[#00A884] rounded-2xl p-4 shadow-2xl animate-in slide-in-from-top-4 duration-300">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-[#00A884]/20 text-[#00A884]">
                <BellRing className="w-5 h-5 animate-bounce" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-white">{incomingDriverPushToast.heading}</h4>
                <p className="text-xs text-slate-300 mt-0.5 line-clamp-2">{incomingDriverPushToast.body}</p>
              </div>
            </div>
            <button
              onClick={() => setIncomingDriverPushToast(null)}
              className="text-slate-400 hover:text-white p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-3 flex items-center gap-2">
            <a
              href={incomingDriverPushToast.wazeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-2 px-3 bg-[#00A884] hover:bg-[#008f6f] text-[#111B21] font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition active:scale-95 shadow"
            >
              <NavIcon className="w-4 h-4" />
              <span>פתח ניווט Waze מיידי</span>
            </a>
            <button
              onClick={() => {
                setActiveOverlayView('morning_report');
                setIncomingDriverPushToast(null);
              }}
              className="py-2 px-3 bg-[#202C33] hover:bg-[#2A3942] text-slate-200 text-xs font-semibold rounded-xl transition"
            >
              צפה בדוח
            </button>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* PRIMARY FULLSCREEN WHATSAPP WEB CHAT VIEW */}
      {/* ======================================================== */}
      <div className="relative z-10 w-full h-full">
        <WhatsAppChat
          orders={orders}
          theme={theme}
          onToggleTheme={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
          onAddNewOrder={handleAddNewOrder}
          onUpdateOrder={handleUpdateOrder}
          onRequestView={(view) => setActiveOverlayView(view)}
          onProcessingChange={(answering) => setIsNoaAnswering(answering)}
        />
      </div>

      {/* ======================================================== */}
      {/* ON-DEMAND OVERLAY VIEW (Displayed upon request from Chat) */}
      {/* ======================================================== */}
      {activeOverlayView && (
        <div className="fixed inset-0 z-50 bg-[#0B0F17] flex flex-col animate-in fade-in duration-200">
          
          {/* Overlay Top Bar with Back to WhatsApp Button */}
          <div className="h-[60px] bg-[#111B21] border-b border-[#222D34] px-4 sm:px-6 flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setActiveOverlayView(null)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#00A884] hover:bg-[#008f6f] text-[#111B21] font-bold text-xs shadow-md transition active:scale-95"
              >
                <ArrowRight className="w-4 h-4" />
                <span>חזור לווצאפ נועה AI</span>
              </button>

              <div className="h-5 w-px bg-slate-800" />

              <div className="flex items-center gap-2">
                {activeOverlayView === 'dashboard' && <LayoutDashboard className="w-5 h-5 text-cyan-400" />}
                {activeOverlayView === 'morning_report' && <Calendar className="w-5 h-5 text-emerald-400" />}

                <span className="font-bold text-sm sm:text-base text-white">
                  {activeOverlayView === 'dashboard' && 'לוח מבצעים ודשבורד תפעולי — ח. סבן'}
                  {activeOverlayView === 'morning_report' && 'דוח בוקר וסידור יומי — ח. סבן (Swipe to Dismiss)'}
                </span>
              </div>
            </div>

            {/* Quick Switch View Buttons inside Overlay */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              <button 
                onClick={() => setActiveOverlayView('morning_report')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  activeOverlayView === 'morning_report' ? 'bg-emerald-900 text-emerald-300 border border-emerald-700' : 'text-emerald-400 hover:text-white bg-emerald-950/50'
                }`}
              >
                <span>📅</span>
                <span>דוח בוקר</span>
              </button>
              <button 
                onClick={() => setActiveOverlayView('dashboard')}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition flex items-center gap-1.5 ${
                  activeOverlayView === 'dashboard' ? 'bg-cyan-950 text-cyan-300 border border-cyan-800' : 'text-slate-400 hover:text-white'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>לוח מבצעים</span>
              </button>

              <button
                onClick={() => setActiveOverlayView(null)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition mr-1"
                title="סגור מסך וחזור לווצאפ"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Overlay Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 max-w-7xl w-full mx-auto">
            
            {/* VIEW 0: MORNING DISPATCH REPORT */}
            {activeOverlayView === 'morning_report' && (
              <div className="animate-in fade-in duration-200">
                <MorningReportView
                  orders={orders}
                  onAddNewOrder={handleAddNewOrder}
                  onUpdateOrder={handleUpdateOrder}
                  onDeleteOrder={handleDeleteOrder}
                  onClose={() => setActiveOverlayView(null)}
                />
              </div>
            )}

            {/* VIEW 1: LIVE DASHBOARD */}
            {activeOverlayView === 'dashboard' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <LiveKpis orders={orders} />
                <WarehouseSplitMonitor orders={orders} />
                <FleetTimeline 
                  orders={orders} 
                  onOrderClick={(order) => setSelectedOrderModal(order)}
                />
                <OrdersTable
                  orders={orders}
                  onUpdateOrder={handleUpdateOrder}
                  onOpenOrderModal={(order) => setSelectedOrderModal(order)}
                  onDispatchWhatsApp={(order) => setDispatchModalOrder(order)}
                />
              </div>
            )}

          </div>

        </div>
      )}

      {/* ======================================================== */}
      {/* SINGLE ORDER DETAILS MODAL */}
      {/* ======================================================== */}
      {selectedOrderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-cyan-500/40 rounded-3xl w-full max-w-lg max-h-[85vh] overflow-y-auto shadow-2xl p-5 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-cyan-400 font-mono font-bold text-lg">#{selectedOrderModal.orderNumber}</span>
                <span className="text-xs bg-cyan-950 text-cyan-300 border border-cyan-800 px-2 py-0.5 rounded-full">
                  {selectedOrderModal.warehouse === '1_TALMID' ? '🏟️ התלמיד 1' : '🏭 החרש 4'}
                </span>
              </div>
              <button 
                onClick={() => setSelectedOrderModal(null)}
                className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <h3 className="font-bold text-base text-white">{selectedOrderModal.customerName}</h3>
              <p className="text-xs text-slate-400">📍 {selectedOrderModal.siteAddress}, {selectedOrderModal.city}</p>
            </div>

            <div className="space-y-1.5 bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs">
              <span className="font-semibold text-slate-300 block mb-1">פירוט פריטים:</span>
              {(selectedOrderModal.items || []).map((item, idx) => (
                <div key={idx} className="flex items-center justify-between py-1 border-b border-slate-900 last:border-0">
                  <span className="text-slate-300">{item.name}</span>
                  <span className="font-mono font-bold text-cyan-300">{item.quantity} {item.unit}</span>
                </div>
              ))}
            </div>

            <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/30 text-xs space-y-1">
              <span className="font-bold text-amber-300">סטטוס פקדונות:</span>
              <div className="flex items-center justify-between text-slate-300">
                <span>משטחי סבן (60060):</span>
                <span className="font-mono font-bold text-amber-300">{selectedOrderModal.deposit?.palletsCount ?? 0} יח'</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span>בלות חול/סומסום (60002):</span>
                <span className="font-mono font-bold text-amber-300">{selectedOrderModal.deposit?.bigBagsCount ?? 0} יח'</span>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <a
                href={selectedOrderModal.wazeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition"
              >
                <NavIcon className="w-4 h-4 text-cyan-400" />
                <span>נווט ב-Waze</span>
              </a>

              <button
                onClick={() => {
                  setDispatchModalOrder(selectedOrderModal);
                  setSelectedOrderModal(null);
                }}
                className="flex-1 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-md transition"
              >
                <span>שגר לוואטסאפ</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* DISPATCH BRIEFING MODAL */}
      {/* ======================================================== */}
      {dispatchModalOrder && (
        <DispatchBriefingModal
          order={dispatchModalOrder}
          onClose={() => setDispatchModalOrder(null)}
          onConfirmDispatch={(channel) => {
            setDispatchModalOrder(null);
            handleUpdateOrder({ ...dispatchModalOrder, status: 'dispatched_whatsapp' });
          }}
        />
      )}

    </div>
  );
}
