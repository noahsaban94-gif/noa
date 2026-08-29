import React from 'react';
import { 
  LayoutDashboard, 
  MessageSquare, 
  CalendarDays, 
  FileCheck2, 
  Smartphone,
  Layers,
  Sparkles
} from 'lucide-react';

interface NavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  pendingOrdersCount?: number;
  unreconciledDocsCount?: number;
}

export const Navigation: React.FC<NavigationProps> = ({ 
  activeTab, 
  setActiveTab,
  pendingOrdersCount = 2,
  unreconciledDocsCount = 1
}) => {
  const navItems = [
    {
      id: 'dashboard',
      label: 'דשבורד מבצעי',
      icon: LayoutDashboard,
      badge: null,
      color: 'cyan'
    },
    {
      id: 'chat',
      label: 'וואטסאפ & נועה AI',
      icon: MessageSquare,
      badge: 'חי',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
    },
    {
      id: 'matrix',
      label: 'לוח שיבוץ ומטריצה',
      icon: CalendarDays,
      badge: pendingOrdersCount > 0 ? `${pendingOrdersCount}` : null,
      badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
    },
    {
      id: 'ocr',
      label: 'תעודות משלוח ו-OCR',
      icon: FileCheck2,
      badge: unreconciledDocsCount > 0 ? `${unreconciledDocsCount}` : null,
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30'
    },
    {
      id: 'driver',
      label: 'מצב נהג PWA',
      icon: Smartphone,
      badge: 'שטח',
      badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30'
    }
  ];

  return (
    <div className="bg-[#0f172a]/90 backdrop-blur-md border-b border-slate-800 sticky top-[69px] z-30 px-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between overflow-x-auto no-scrollbar py-2">
        <nav className="flex items-center gap-1.5 sm:gap-2">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 whitespace-nowrap ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-600/20 to-teal-600/20 text-cyan-300 border border-cyan-500/40 shadow-sm shadow-cyan-950'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
                {item.badge && (
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full border ${item.badgeColor || 'bg-slate-800 text-slate-300 border-slate-700'}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};
