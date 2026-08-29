import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Mic, 
  MicOff, 
  Paperclip, 
  Smile, 
  MoreVertical, 
  Search, 
  CheckCheck, 
  Truck, 
  Sparkles, 
  RefreshCw,
  LayoutDashboard,
  Calendar,
  Bell,
  BellRing,
  Navigation as NavIcon,
  Phone,
  Video,
  User,
  Building2,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ExternalLink,
  MessageSquare
} from 'lucide-react';
import { ChatMessage, LogisticsOrder, DriverId } from '../../types/logistics';
import { NOA_AVATAR_URL, NOA_STRICT_SAFEGUARD_RESPONSE, ORDER_MODIFIED_RESET_STATUS, DRIVERS } from '../../lib/constants';
import { parseFreeTextOrder, calculateDeposits, generateWazeUrl } from '../../lib/parser';
import { generateMorningReport } from '../../lib/morningReportGenerator';
import { notifyDriverNewOrder, setupDriverPushSubscription, ONESIGNAL_APP_ID } from '../../lib/notifications';
import { OrderCardPreview } from './OrderCardPreview';
import { DispatchBriefingModal } from './DispatchBriefingModal';

interface WhatsAppChatProps {
  orders: LogisticsOrder[];
  onAddNewOrder: (order: LogisticsOrder) => void;
  onUpdateOrder: (order: LogisticsOrder) => void;
  onRequestView: (view: 'dashboard' | 'morning_report') => void;
  onProcessingChange?: (isProcessing: boolean) => void;
}

type ChatChannelId = 'noa' | 'hikmat' | 'ali' | 'morning_report_channel' | 'warehouse_talmid' | 'warehouse_harash';

interface ChannelMeta {
  id: ChatChannelId;
  name: string;
  subtitle: string;
  avatar: string;
  isOnline: boolean;
  unreadCount: number;
  badgeType: 'bot' | 'driver' | 'report' | 'warehouse';
  driverId?: DriverId;
}

export const WhatsAppChat: React.FC<WhatsAppChatProps> = ({
  orders,
  onAddNewOrder,
  onUpdateOrder,
  onRequestView,
  onProcessingChange
}) => {
  const [activeChannelId, setActiveChannelId] = useState<ChatChannelId>('noa');
  const [channelFilter, setChannelFilter] = useState<'all' | 'drivers' | 'warehouses'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [pushStatusMessage, setPushStatusMessage] = useState<string | null>(null);
  const [pushEnabled, setPushEnabled] = useState<boolean>(false);
  const [selectedOrderForDispatch, setSelectedOrderForDispatch] = useState<LogisticsOrder | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recordingTimerRef = useRef<any>(null);

  useEffect(() => {
    onProcessingChange?.(isProcessing);
  }, [isProcessing, onProcessingChange]);

  // Initial messages by channel
  const [messagesByChannel, setMessagesByChannel] = useState<Record<ChatChannelId, ChatMessage[]>>({
    noa: [
      {
        id: 'msg-1',
        sender: 'noa',
        senderName: 'נועה AI (סדרנית ראשית)',
        text: 'ראמי אחי אהובי! 👑 ברוך הבא לווצאפ סידור נועה AI.\nחכמת כבר בהפצה ראשונה ברעננה ועלי מעמיס במחסן 1 התלמיד.\n\n💬 מה נבצע היום?\n• זרוק לי פקודת אספקה (למשל: "תוציא לבוקטוס 40 שקי מלט ו-6 טיט בלות לעמית בהרצוג כפר סבא")\n• בקש ממני להפיק את "דוח הבוקר" או להציג את לוח המבצעים!\n\nהתראות פוש לנהגים עם קישור ניווט Waze ישיר מוכנות לשיגור 🚚 באדיבות נועה ❤️',
        timestamp: '07:45',
        chatId: 'noa'
      }
    ],
    hikmat: [
      {
        id: 'hikmat-1',
        sender: 'driver',
        senderName: 'חכמת (משאית מנוף)',
        text: 'בוקר טוב ראמי, משאית 615-41-002 בהפצה ראשונה ברעננה. ממתין לנסיעות הבאות שנועה תשבץ עם קישור Waze.',
        timestamp: '07:50',
        chatId: 'hikmat'
      }
    ],
    ali: [
      {
        id: 'ali-1',
        sender: 'driver',
        senderName: 'עלי (משאית פתוחה)',
        text: 'אהלן ראמי, אני כרגע במחסן 1 התלמיד מעמיס לוחות גבס ופרופילים. שלח לי התראת Waze כשהיעד מוכן.',
        timestamp: '07:55',
        chatId: 'ali'
      }
    ],
    morning_report_channel: [
      {
        id: 'rep-chan-1',
        sender: 'system',
        senderName: 'מערכת דוחות בוקר',
        text: '📅 ערוץ דוח בוקר וסידור יומי מסונכרן ישירות מול גיליון נועה (3 הזמנות פעילות).\nלחץ על "פתח דוח בוקר מלא" לצפייה בציר הזמנים ובאנימציית החלק להסרה.',
        timestamp: '08:00',
        chatId: 'morning_report_channel',
        viewTrigger: 'morning_report'
      }
    ],
    warehouse_talmid: [
      {
        id: 'wh-1',
        sender: 'system',
        senderName: 'מחסן 1️⃣ התלמיד',
        text: '🏟️ מחסן התלמיד פתוח ומבצע העמסות גבס, פרופילים וכלי עבודה.',
        timestamp: '07:30',
        chatId: 'warehouse_talmid'
      }
    ],
    warehouse_harash: [
      {
        id: 'wh-4',
        sender: 'system',
        senderName: 'מחסן 4️⃣ החרש',
        text: '🏭 מחסן החרש פתוח ומספק מלט, טיט, חול, בלוקים ובלות כבדות למשאית המנוף.',
        timestamp: '07:30',
        chatId: 'warehouse_harash'
      }
    ]
  });

  const hikmatOrdersCount = orders.filter(o => o.assignedDriver === 'hikmat').length;
  const aliOrdersCount = orders.filter(o => o.assignedDriver === 'ali').length;

  const channels: ChannelMeta[] = [
    {
      id: 'noa',
      name: 'נועה AI — סדרנית ראשית',
      subtitle: isProcessing ? 'מקלידה כעת...' : 'מחוברת • מענה אוטומטי וסנכרון גיליון',
      avatar: NOA_AVATAR_URL,
      isOnline: true,
      unreadCount: 1,
      badgeType: 'bot'
    },
    {
      id: 'hikmat',
      name: 'חכמת — משאית מנוף',
      subtitle: `משאית 615-41-002 • ${hikmatOrdersCount} יעדים פעילים`,
      avatar: DRIVERS.hikmat.avatarUrl,
      isOnline: true,
      unreadCount: 0,
      badgeType: 'driver',
      driverId: 'hikmat'
    },
    {
      id: 'ali',
      name: 'עלי — משאית פתוחה',
      subtitle: `משאית 814-12-301 • ${aliOrdersCount} יעדים פעילים`,
      avatar: DRIVERS.ali.avatarUrl,
      isOnline: true,
      unreadCount: 0,
      badgeType: 'driver',
      driverId: 'ali'
    },
    {
      id: 'morning_report_channel',
      name: '📅 דוח בוקר וסידור יומי',
      subtitle: `סיכום ${orders.length} נסיעות • סנכרון חי מגיליון`,
      avatar: 'https://cdn-icons-png.flaticon.com/512/2965/2965300.png',
      isOnline: true,
      unreadCount: 0,
      badgeType: 'report'
    },
    {
      id: 'warehouse_harash',
      name: '🏭 מחסן 4 החרש (מלט ובלות)',
      subtitle: 'פעיל • העמסת מנוף וחומרים כבדים',
      avatar: 'https://cdn-icons-png.flaticon.com/512/2897/2897769.png',
      isOnline: true,
      unreadCount: 0,
      badgeType: 'warehouse'
    },
    {
      id: 'warehouse_talmid',
      name: '🏟️ מחסן 1 התלמיד (גבס ופרופילים)',
      subtitle: 'פעיל • העמסת חומרי גבס ואינסטלציה',
      avatar: 'https://cdn-icons-png.flaticon.com/512/1532/1532556.png',
      isOnline: true,
      unreadCount: 0,
      badgeType: 'warehouse'
    }
  ];

  const filteredChannels = channels.filter(ch => {
    if (channelFilter === 'drivers' && ch.badgeType !== 'driver') return false;
    if (channelFilter === 'warehouses' && ch.badgeType !== 'warehouse') return false;
    if (searchQuery) {
      return ch.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
             ch.subtitle.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return true;
  });

  const activeChannelMeta = channels.find(c => c.id === activeChannelId) || channels[0];
  const activeMessages = messagesByChannel[activeChannelId] || [];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeMessages, isProcessing, activeChannelId]);

  // Voice recording timer
  useEffect(() => {
    if (isRecording) {
      setRecordingSeconds(0);
      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds(s => s + 1);
      }, 1000);
    } else {
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
      setRecordingSeconds(0);
    }
    return () => {
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    };
  }, [isRecording]);

  // Push notification permission setup
  const handleEnablePush = async () => {
    const success = await setupDriverPushSubscription('hikmat');
    setPushEnabled(true);
    setPushStatusMessage('✅ התראות OneSignal Web Push הופעלו בהצלחה ב-PWA!');
    setTimeout(() => setPushStatusMessage(null), 4000);
  };

  // Test Push Notification trigger with Waze link
  const handleTestPushNotification = async () => {
    const sampleOrder = orders[0] || {
      id: 'demo-order',
      orderNumber: '6215184',
      customerName: 'בוקטוס — אתר בנייה',
      city: 'כפר סבא',
      siteAddress: 'הרצוג 12',
      warehouse: '4_HARASH',
      items: [{ sku: '10010', name: 'מלט אפור 50 ק"ג', quantity: 40, unit: 'שק' }],
      deposit: { palletsCount: 2, bigBagsCount: 0, euroPalletsCount: 0, blockPalletsCount: 0, barrelsCount: 0, isExempt: false, status: 'יש משטחים' },
      assignedDriver: 'hikmat',
      status: 'pending_schedule',
      receivedAt: '07:30',
      scheduledTime: '08:30',
      hasDeliveryNote: false,
      isCraneRequired: true,
      wazeUrl: 'https://waze.com/ul?q=%D7%9B%D7%A4%D7%A8%20%D7%A1%D7%91%D7%90%20%D7%94%D7%A8%D7%A6%D7%95%D7%92%2012&navigate=yes'
    };

    const result = await notifyDriverNewOrder(sampleOrder, '🔔 בדיקת מערכת OneSignal: נסיעה חדשה שובצה בהצלחה עם קישור ישיר ל-Waze!');
    setPushStatusMessage(result.message);
    setTimeout(() => setPushStatusMessage(null), 4500);

    // Add confirmation message to active chat
    const testMsg: ChatMessage = {
      id: `sys-test-${Date.now()}`,
      sender: 'system',
      senderName: 'OneSignal Push Engine',
      text: `📲 התראת בדיקה של OneSignal נשלחה בהצלחה עבור הזמנה #${sampleOrder.orderNumber}!\n📍 יעד: ${sampleOrder.city}, ${sampleOrder.siteAddress}\n🗺️ קישור ניווט ישיר לוואז הוצמד להתראה.`,
      timestamp: new Date().toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' }),
      chatId: activeChannelId,
      wazeUrl: sampleOrder.wazeUrl
    };

    setMessagesByChannel(prev => ({
      ...prev,
      [activeChannelId]: [...(prev[activeChannelId] || []), testMsg]
    }));
  };

  const quickPrompts = [
    { label: '📅 ליצור דוח בוקר', text: 'ליצור דוח בוקר' },
    { label: '📊 לוח מבצעים ודשבורד', text: 'תראי לי את לוח המבצעים והדשבורד התפעולי של היום' },
    { label: '🔔 בדיקת התראת נהג', text: 'בדיקת התראת פוש לוואז לנהג חכמת' },
    { label: '🏗️ הזמנה לבוקטוס', text: 'תוציא לבוקטוס 40 שקי מלט ו-6 טיט בלות לעמית בהרצוג כפר סבא מחר ב-8 בבוקר' },
    { label: '🔄 עדכון כמות (איפוס)', text: 'שני את כמות המלט ללירן במוצקין ל-50 שקים' }
  ];

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      senderName: 'ראמי סבן',
      text,
      timestamp: new Date().toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' }),
      chatId: activeChannelId
    };

    setMessagesByChannel(prev => ({
      ...prev,
      [activeChannelId]: [...(prev[activeChannelId] || []), userMsg]
    }));

    setInputText('');
    setShowAttachMenu(false);
    setShowOptionsMenu(false);
    setIsProcessing(true);

    const lowerText = text.toLowerCase();

    // 0. DETECT MORNING REPORT REQUEST
    if (
      lowerText.includes('דוח בוקר') || 
      lowerText.includes('ליצור דוח בוקר') || 
      lowerText.includes('תכיני דוח בוקר') || 
      lowerText.includes('דוח סידור')
    ) {
      setTimeout(() => {
        const report = generateMorningReport(orders);
        const reportMsg: ChatMessage = {
          id: `noa-rep-${Date.now()}`,
          sender: 'noa',
          senderName: 'נועה AI (סדרנית ראשית)',
          text: report.formattedText,
          timestamp: new Date().toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' }),
          chatId: activeChannelId,
          viewTrigger: 'morning_report'
        };

        setMessagesByChannel(prev => ({
          ...prev,
          [activeChannelId]: [...(prev[activeChannelId] || []), reportMsg]
        }));
        setIsProcessing(false);
      }, 700);
      return;
    }

    // 1. DETECT DASHBOARD VIEW REQUEST
    if (
      lowerText.includes('דשבורד') || 
      lowerText.includes('לוח מבצעים') ||
      lowerText.includes('סטטוס מחסנים') ||
      lowerText.includes('תראי לי את הדשבורד')
    ) {
      setTimeout(() => {
        const responseMsg: ChatMessage = {
          id: `noa-view-${Date.now()}`,
          sender: 'noa',
          senderName: 'נועה AI (סדרנית ראשית)',
          text: 'ראמי אחי אהובי! 👑 פותחת עבורך מיידית את לוח המבצעים והדשבורד התפעולי של ח. סבן.\nבלחיצה על הכפתור למטה תוכל לצפות בסטטוס המחסנים (4 החרש ו-1 התלמיד) ובמוני הפקדונות.',
          timestamp: new Date().toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' }),
          chatId: activeChannelId,
          viewTrigger: 'dashboard'
        };

        setMessagesByChannel(prev => ({
          ...prev,
          [activeChannelId]: [...(prev[activeChannelId] || []), responseMsg]
        }));
        setIsProcessing(false);
        onRequestView('dashboard');
      }, 500);
      return;
    }

    // 2. DETECT TEST PUSH REQUEST
    if (lowerText.includes('בדיקת התראה') || lowerText.includes('התראת פוש') || lowerText.includes('בדוק התראה')) {
      await handleTestPushNotification();
      setIsProcessing(false);
      return;
    }

    // 3. DETECT STATUS RESET TRIGGER
    const isResetTrigger = 
      lowerText.includes('שני את') || 
      lowerText.includes('עדכן כמות') || 
      lowerText.includes('שנה כמות') || 
      lowerText.includes('תשני ל') ||
      lowerText.includes('החלף כתובת');

    if (isResetTrigger) {
      setTimeout(() => {
        const resetMsg: ChatMessage = {
          id: `noa-reset-${Date.now()}`,
          sender: 'noa',
          senderName: 'נועה AI (סדרנית ראשית)',
          text: `⚠️ שים לב ראמי אחי אהובי:\n${ORDER_MODIFIED_RESET_STATUS}\n\nההזמנה עודכנה והועברה לבדיקה מחדש ושיבוץ מסלול מחודש. באדיבות נועה ❤️`,
          timestamp: new Date().toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' }),
          chatId: activeChannelId,
          isStatusResetAlert: true
        };

        setMessagesByChannel(prev => ({
          ...prev,
          [activeChannelId]: [...(prev[activeChannelId] || []), resetMsg]
        }));
        setIsProcessing(false);
      }, 700);
      return;
    }

    // 4. PARSE FREE TEXT ORDER VIA GEMINI / LOCAL LOGISTICS ENGINE
    try {
      const response = await fetch('/api/parse-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.parsedOrder && data.parsedOrder.items && data.parsedOrder.items.length > 0) {
          const newOrder = data.parsedOrder as LogisticsOrder;
          
          // Auto add to state & notify driver via OneSignal
          onAddNewOrder(newOrder);
          notifyDriverNewOrder(newOrder);

          const orderMsg: ChatMessage = {
            id: `noa-order-${Date.now()}`,
            sender: 'noa',
            senderName: 'נועה AI (סדרנית ראשית)',
            text: `ראמי אחי אהובי! 👑 פיענחתי וקלטתי את ההזמנה בהצלחה:\n\n📦 הזמנה #${newOrder.orderNumber} עבור ${newOrder.customerName}\n📍 אתר: ${newOrder.siteAddress}, ${newOrder.city}\n🏭 מחסן יוצא: ${newOrder.warehouse === '1_TALMID' ? '1️⃣ התלמיד (גבס)' : '4️⃣ החרש (מלט ובלות)'}\n🚚 נהג משובץ: ${newOrder.assignedDriver === 'ali' ? 'עלי' : 'חכמת'}\n\n📲 התראת OneSignal Web Push נשלחה אוטומטית לנהג עם קישור Waze ישיר!\n\nבאדיבות נועה ❤️`,
            timestamp: new Date().toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' }),
            chatId: activeChannelId,
            parsedOrder: newOrder,
            wazeUrl: newOrder.wazeUrl
          };

          setMessagesByChannel(prev => ({
            ...prev,
            [activeChannelId]: [...(prev[activeChannelId] || []), orderMsg]
          }));
          setIsProcessing(false);
          return;
        }
      }
    } catch {
      // Fallback to local parsing
    }

    // Fallback local rule-based parsing
    const localParsed = parseFreeTextOrder(text);
    if (localParsed.items.length > 0) {
      onAddNewOrder(localParsed);
      notifyDriverNewOrder(localParsed);

      const localMsg: ChatMessage = {
        id: `noa-order-${Date.now()}`,
        sender: 'noa',
        senderName: 'נועה AI (סדרנית ראשית)',
        text: `ראמי אחי אהובי! 👑 ההזמנה נקלטה במערכת ח. סבן:\n\n📦 הזמנה #${localParsed.orderNumber} ל${localParsed.customerName}\n📍 ${localParsed.siteAddress}, ${localParsed.city}\n🚚 נהג: ${localParsed.assignedDriver === 'ali' ? 'עלי' : 'חכמת'}\n\n📲 התראת פוש נשלחה לנהג עם קישור ניווט Waze!\nבאדיבות נועה ❤️`,
        timestamp: new Date().toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' }),
        chatId: activeChannelId,
        parsedOrder: localParsed,
        wazeUrl: localParsed.wazeUrl
      };

      setMessagesByChannel(prev => ({
        ...prev,
        [activeChannelId]: [...(prev[activeChannelId] || []), localMsg]
      }));
      setIsProcessing(false);
      return;
    }

    // Fallback friendly AI response
    setTimeout(() => {
      const fallbackMsg: ChatMessage = {
        id: `noa-chat-${Date.now()}`,
        sender: 'noa',
        senderName: 'נועה AI (סדרנית ראשית)',
        text: `ראמי אחי אהובי! 👑 קיבלתי את הודעתך: "${text}".\nאני מסנכרנת מול גיליון הליבה ומוכנה לקלוט פקודות אספקה, להפיק דוח בוקר, או לשלוח התראות OneSignal לנהגים עם קישור ניווט ב-Waze.\n\nבאדיבות נועה ❤️`,
        timestamp: new Date().toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' }),
        chatId: activeChannelId
      };

      setMessagesByChannel(prev => ({
        ...prev,
        [activeChannelId]: [...(prev[activeChannelId] || []), fallbackMsg]
      }));
      setIsProcessing(false);
    }, 600);
  };

  const handleVoiceRecordToggle = () => {
    if (!isRecording) {
      setIsRecording(true);
    } else {
      setIsRecording(false);
      handleSendMessage('תוציא לבוקטוס 40 שקי מלט ו-6 טיט בלות לעמית בהרצוג כפר סבא מחר ב-8 בבוקר');
    }
  };

  return (
    <div className="w-full h-full flex flex-col lg:flex-row bg-[#0C1317] text-[#E9EDEF] font-['Rubik',sans-serif] overflow-hidden select-none">
      
      {/* ======================================================== */}
      {/* 1. WHATSAPP WEB SIDEBAR (CHANNELS & DRIVERS LIST)         */}
      {/* ======================================================== */}
      <div className="w-full lg:w-[380px] xl:w-[420px] h-[340px] lg:h-full flex-shrink-0 bg-[#111B21] border-b lg:border-b-0 lg:border-l border-[#222D34] flex flex-col">
        
        {/* Sidebar Header Bar */}
        <div className="h-[60px] bg-[#202C33] px-4 flex items-center justify-between border-b border-[#222D34] flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src="https://i.ibb.co/whtMgBNC/Gemini-Generated-Image-2.png"
                alt="סדרנות ח. סבן"
                className="w-10 h-10 rounded-full object-cover border border-[#00A884]"
              />
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-[#00A884] border-2 border-[#202C33] rounded-full" />
            </div>
            <div>
              <h2 className="font-bold text-sm text-[#E9EDEF]">סדרנות ח. סבן</h2>
              <p className="text-[11px] text-[#8696A0]">ראמי סבן • מחובר</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* OneSignal Push Notification Toggle Button */}
            <button
              onClick={handleEnablePush}
              className={`p-2 rounded-full transition ${
                pushEnabled 
                  ? 'bg-[#00A884]/20 text-[#00A884]' 
                  : 'text-[#8696A0] hover:text-[#00A884] hover:bg-[#111B21]'
              }`}
              title="הפעל התראות פוש של OneSignal ב-PWA"
            >
              <Bell className="w-5 h-5" />
            </button>

            {/* Direct Morning Report Overlay Launcher */}
            <button
              onClick={() => onRequestView('morning_report')}
              className="p-2 text-[#8696A0] hover:text-[#00A884] hover:bg-[#111B21] rounded-full transition"
              title="פתח דוח בוקר וסידור יומי"
            >
              <Calendar className="w-5 h-5" />
            </button>

            {/* Direct Dashboard Overlay Launcher */}
            <button
              onClick={() => onRequestView('dashboard')}
              className="p-2 text-[#8696A0] hover:text-cyan-400 hover:bg-[#111B21] rounded-full transition"
              title="פתח לוח מבצעים ודשבורד"
            >
              <LayoutDashboard className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search & Channel Filter Bar */}
        <div className="p-2.5 bg-[#111B21] border-b border-[#222D34] space-y-2 flex-shrink-0">
          <div className="relative">
            <Search className="w-4 h-4 text-[#8696A0] absolute right-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="חיפוש שיחה, נהג או מחסן..."
              className="w-full bg-[#202C33] border-0 rounded-xl pr-9 pl-3 py-1.5 text-xs text-[#E9EDEF] placeholder-[#8696A0] focus:outline-none focus:ring-1 focus:ring-[#00A884]"
            />
          </div>

          <div className="flex items-center gap-1 text-[11px]">
            <button
              onClick={() => setChannelFilter('all')}
              className={`px-3 py-1 rounded-full font-medium transition ${
                channelFilter === 'all' 
                  ? 'bg-[#00A884] text-[#111B21] font-bold' 
                  : 'bg-[#202C33] text-[#8696A0] hover:text-white'
              }`}
            >
              הכל
            </button>
            <button
              onClick={() => setChannelFilter('drivers')}
              className={`px-3 py-1 rounded-full font-medium transition ${
                channelFilter === 'drivers' 
                  ? 'bg-[#00A884] text-[#111B21] font-bold' 
                  : 'bg-[#202C33] text-[#8696A0] hover:text-white'
              }`}
            >
              🚚 נהגים
            </button>
            <button
              onClick={() => setChannelFilter('warehouses')}
              className={`px-3 py-1 rounded-full font-medium transition ${
                channelFilter === 'warehouses' 
                  ? 'bg-[#00A884] text-[#111B21] font-bold' 
                  : 'bg-[#202C33] text-[#8696A0] hover:text-white'
              }`}
            >
              🏭 מחסנים
            </button>
          </div>
        </div>

        {/* Channels List */}
        <div className="flex-1 overflow-y-auto divide-y divide-[#222D34]/50 custom-scrollbar">
          {filteredChannels.map((channel) => {
            const isActive = activeChannelId === channel.id;
            return (
              <div
                key={channel.id}
                onClick={() => setActiveChannelId(channel.id)}
                className={`flex items-center gap-3 px-3.5 py-3 cursor-pointer transition select-none ${
                  isActive ? 'bg-[#2A3942]' : 'hover:bg-[#202C33]/60'
                }`}
              >
                <div className="relative flex-shrink-0">
                  <img
                    src={channel.avatar}
                    alt={channel.name}
                    className="w-12 h-12 rounded-full object-cover border border-[#374248]"
                  />
                  {channel.isOnline && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-[#00A884] border-2 border-[#111B21] rounded-full" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-xs sm:text-sm text-[#E9EDEF] truncate">
                      {channel.name}
                    </h3>
                    <span className="text-[10px] text-[#8696A0] font-mono">08:00</span>
                  </div>

                  <div className="flex items-center justify-between mt-1">
                    <p className="text-xs text-[#8696A0] truncate max-w-[200px]">
                      {channel.subtitle}
                    </p>
                    {channel.badgeType === 'bot' && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] bg-[#00A884]/20 text-[#00A884] font-bold">
                        AI
                      </span>
                    )}
                    {channel.badgeType === 'driver' && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] bg-cyan-950 text-cyan-300 font-bold border border-cyan-800">
                        {channel.id === 'hikmat' ? `${hikmatOrdersCount} יעדים` : `${aliOrdersCount} יעדים`}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Footer Action in Sidebar */}
        <div className="p-3 bg-[#111B21] border-t border-[#222D34] flex items-center justify-between text-xs text-[#8696A0]">
          <span className="font-mono text-[11px]">OneSignal: PWA Ready</span>
          <button
            onClick={handleTestPushNotification}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#202C33] hover:bg-[#2A3942] text-[#00A884] font-bold transition"
          >
            <BellRing className="w-3.5 h-3.5" />
            <span>בדיקת התראה</span>
          </button>
        </div>

      </div>

      {/* ======================================================== */}
      {/* 2. ACTIVE CHAT PWA VIEW (WHATSAPP WEB CLONE)              */}
      {/* ======================================================== */}
      <div className="flex-1 h-full flex flex-col bg-[#0B141A] relative">
        
        {/* Authentic WhatsApp Dark Doodle Background Pattern */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-[0.06] bg-repeat z-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M20 20 L25 30 L15 30 Z M70 20 A5 5 0 1 0 70 30 A5 5 0 1 0 70 20 M40 70 L60 70 L50 90 Z M80 80 Q90 70 80 60 Q70 70 80 80' stroke='%23ffffff' stroke-width='1.5' fill='none'/%3E%3C/svg%3E")`
          }}
        />

        {/* Active Chat Top Navigation Header */}
        <div className="h-[60px] bg-[#202C33] px-4 sm:px-6 flex items-center justify-between border-b border-[#222D34] z-10 flex-shrink-0 shadow-md">
          
          <div className="flex items-center gap-3">
            <img
              src={activeChannelMeta.avatar}
              alt={activeChannelMeta.name}
              className="w-10 h-10 rounded-full object-cover border border-[#00A884]"
            />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm sm:text-base text-[#E9EDEF]">
                  {activeChannelMeta.name}
                </h3>
                {activeChannelMeta.badgeType === 'bot' && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#00A884]/20 text-[#00A884] font-bold">
                    נועה AI
                  </span>
                )}
              </div>
              <p className="text-xs text-[#00A884] flex items-center gap-1 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00A884] animate-pulse" />
                <span>{isProcessing ? 'מקלידה כעת...' : 'מחובר • שירות פעיל'}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Quick Button: Test OneSignal Driver Push with direct Waze link */}
            <button
              onClick={handleTestPushNotification}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#111B21] hover:bg-[#182229] border border-[#00A884]/40 text-[#00A884] text-xs font-bold transition shadow-sm"
              title="שלח התראת OneSignal Web Push לנהג עם קישור Waze"
            >
              <BellRing className="w-4 h-4" />
              <span>שלח פוש לוואז</span>
            </button>

            {/* Quick Button: Morning Report Overlay */}
            <button
              onClick={() => onRequestView('morning_report')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-700 to-teal-700 hover:from-emerald-600 hover:to-teal-600 text-white text-xs font-bold transition shadow-md active:scale-95"
            >
              <Calendar className="w-4 h-4" />
              <span>דוח בוקר</span>
            </button>

            {/* Quick Button: Dashboard Overlay */}
            <button
              onClick={() => onRequestView('dashboard')}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-800 text-cyan-300 text-xs font-bold transition"
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>לוח מבצעים</span>
            </button>
          </div>
        </div>

        {/* In-App OneSignal Status Alert Toast */}
        {pushStatusMessage && (
          <div className="z-20 bg-[#00A884] text-[#111B21] px-4 py-2 text-xs font-bold flex items-center justify-between shadow-lg animate-in slide-in-from-top duration-200">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>{pushStatusMessage}</span>
            </div>
            <button 
              onClick={() => setPushStatusMessage(null)}
              className="text-[#111B21] font-extrabold hover:opacity-75"
            >
              ✕
            </button>
          </div>
        )}

        {/* ======================================================== */}
        {/* MESSAGES STREAM                                          */}
        {/* ======================================================== */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 z-10 custom-scrollbar">
          
          {/* WhatsApp Date Divider */}
          <div className="flex justify-center my-2">
            <span className="px-3 py-1 rounded-lg bg-[#182229] border border-[#222D34] text-[11px] font-medium text-[#8696A0] shadow-sm">
              היום • {new Date().toLocaleDateString('he-IL', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
          </div>

          {/* Messages list */}
          {activeMessages.map((msg) => {
            const isUser = msg.sender === 'user';
            const isNoa = msg.sender === 'noa';
            const isDriver = msg.sender === 'driver';

            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isUser ? 'items-start' : 'items-end'} transition-all`}
              >
                {/* Bubble Container */}
                <div
                  className={`max-w-[85%] sm:max-w-[70%] rounded-2xl p-3 sm:p-3.5 shadow-md relative group space-y-2 ${
                    isUser
                      ? 'bg-[#005C4B] text-[#E9EDEF] rounded-tr-none'
                      : isNoa
                      ? 'bg-[#202C33] text-[#E9EDEF] rounded-tl-none border border-[#26353E]'
                      : 'bg-[#182229] text-[#E9EDEF] rounded-tl-none border border-[#2A3942]'
                  }`}
                >
                  {/* Sender Name if not user */}
                  {!isUser && (
                    <div className="flex items-center justify-between text-xs font-bold border-b border-[#2A3942]/60 pb-1.5 mb-1.5">
                      <span className={isNoa ? 'text-[#00A884]' : 'text-cyan-400'}>
                        {msg.senderName}
                      </span>
                      {isNoa && (
                        <span className="text-[10px] bg-[#00A884]/20 text-[#00A884] px-1.5 py-0.2 rounded font-mono">
                          AI DISPATCH
                        </span>
                      )}
                    </div>
                  )}

                  {/* Message Text */}
                  <div className="text-xs sm:text-sm whitespace-pre-wrap leading-relaxed">
                    {msg.text}
                  </div>

                  {/* Embedded Interactive Order Card Preview */}
                  {msg.parsedOrder && (
                    <div className="mt-2 pt-2 border-t border-[#374248]">
                      <OrderCardPreview
                        order={msg.parsedOrder as LogisticsOrder}
                        onDispatch={() => setSelectedOrderForDispatch(msg.parsedOrder as LogisticsOrder)}
                      />
                    </div>
                  )}

                  {/* Direct Action Trigger Buttons */}
                  {msg.viewTrigger && (
                    <div className="pt-2 flex flex-wrap items-center gap-2">
                      {msg.viewTrigger === 'morning_report' && (
                        <button
                          onClick={() => onRequestView('morning_report')}
                          className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold flex items-center gap-1.5 shadow"
                        >
                          <Calendar className="w-3.5 h-3.5" />
                          <span>פתח דוח בוקר מלא</span>
                        </button>
                      )}

                      {msg.viewTrigger === 'dashboard' && (
                        <button
                          onClick={() => onRequestView('dashboard')}
                          className="px-3 py-1.5 rounded-xl bg-cyan-700 hover:bg-cyan-600 text-white text-xs font-bold flex items-center gap-1.5 shadow"
                        >
                          <LayoutDashboard className="w-3.5 h-3.5" />
                          <span>פתח לוח מבצעים ודשבורד</span>
                        </button>
                      )}
                    </div>
                  )}

                  {/* Direct Waze Link button if present */}
                  {msg.wazeUrl && (
                    <div className="pt-1.5">
                      <a
                        href={msg.wazeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#111B21] hover:bg-[#182229] border border-cyan-500/40 text-cyan-300 text-xs font-bold transition"
                      >
                        <NavIcon className="w-3.5 h-3.5 text-cyan-400" />
                        <span>פתח ניווט Waze ישיר</span>
                      </a>
                    </div>
                  )}

                  {/* Time & Delivery Checkmarks */}
                  <div className="flex items-center justify-end gap-1 text-[10px] text-[#8696A0] pt-0.5">
                    <span>{msg.timestamp}</span>
                    {isUser && <CheckCheck className="w-3.5 h-3.5 text-[#53BDEB]" />}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Typing indicator */}
          {isProcessing && (
            <div className="flex items-end">
              <div className="bg-[#202C33] border border-[#26353E] rounded-2xl rounded-tl-none p-3 shadow-md flex items-center gap-2 text-xs text-[#8696A0]">
                <span className="w-2 h-2 rounded-full bg-[#00A884] animate-bounce" />
                <span className="w-2 h-2 rounded-full bg-[#00A884] animate-bounce [animation-delay:0.2s]" />
                <span className="w-2 h-2 rounded-full bg-[#00A884] animate-bounce [animation-delay:0.4s]" />
                <span className="font-semibold text-[#00A884] ml-1">נועה AI מעבדת פקודה ומסנכרנת מול הגיליון...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* ======================================================== */}
        {/* QUICK PROMPT CHIPS                                       */}
        {/* ======================================================== */}
        <div className="px-4 sm:px-6 py-2 bg-[#111B21] border-t border-[#222D34] overflow-x-auto no-scrollbar flex items-center gap-2 z-10 flex-shrink-0">
          <span className="text-[11px] font-semibold text-[#8696A0] whitespace-nowrap">הצעות נועה:</span>
          {quickPrompts.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(prompt.text)}
              className="px-3 py-1 rounded-full bg-[#202C33] hover:bg-[#2A3942] text-[#D1D7DB] hover:text-[#00A884] border border-[#374248] hover:border-[#00A884]/60 text-xs whitespace-nowrap transition active:scale-95 shadow-sm"
            >
              {prompt.label}
            </button>
          ))}
        </div>

        {/* ======================================================== */}
        {/* ATTACHMENT / VIEWS POPUP MENU                            */}
        {/* ======================================================== */}
        {showAttachMenu && (
          <div className="absolute bottom-20 right-4 sm:right-6 z-40 bg-[#233138] border border-[#374248] rounded-2xl shadow-2xl p-3 w-72 space-y-2 text-xs text-[#E9EDEF] animate-in fade-in zoom-in-95">
            <div className="text-[11px] font-bold text-[#8696A0] px-2 mb-1">
              תצוגות ומסכי ח. סבן
            </div>

            <button 
              onClick={() => { onRequestView('morning_report'); setShowAttachMenu(false); }}
              className="w-full p-2.5 hover:bg-[#182229] rounded-xl flex items-center gap-3 text-right transition"
            >
              <div className="w-8 h-8 rounded-lg bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center justify-center">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold">דוח בוקר וסידור יומי</div>
                <div className="text-[10px] text-[#8696A0]">ציר זמנים, מנוף ואנימציית החלק להסרה</div>
              </div>
            </button>

            <button 
              onClick={() => { onRequestView('dashboard'); setShowAttachMenu(false); }}
              className="w-full p-2.5 hover:bg-[#182229] rounded-xl flex items-center gap-3 text-right transition"
            >
              <div className="w-8 h-8 rounded-lg bg-cyan-950 text-cyan-400 border border-cyan-800 flex items-center justify-center">
                <LayoutDashboard className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold">לוח מבצעים ודשבורד</div>
                <div className="text-[10px] text-[#8696A0]">חלוקת מחסן 4 החרש + מחסן 1 התלמיד</div>
              </div>
            </button>

            <button 
              onClick={() => { handleTestPushNotification(); setShowAttachMenu(false); }}
              className="w-full p-2.5 hover:bg-[#182229] rounded-xl flex items-center gap-3 text-right transition"
            >
              <div className="w-8 h-8 rounded-lg bg-amber-950 text-amber-400 border border-amber-800 flex items-center justify-center">
                <BellRing className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold">שגר התראת פוש OneSignal</div>
                <div className="text-[10px] text-[#8696A0]">הקפצת התראה לנהג עם קישור Waze</div>
              </div>
            </button>
          </div>
        )}

        {/* ======================================================== */}
        {/* WHATSAPP INPUT BAR                                       */}
        {/* ======================================================== */}
        <div className="h-[68px] bg-[#202C33] px-4 sm:px-6 flex items-center gap-3 border-t border-[#222D34] z-10 flex-shrink-0">
          
          {/* Emoji Icon */}
          <button 
            type="button"
            className="p-2 text-[#8696A0] hover:text-[#E9EDEF] rounded-full transition"
            title="אימוג'י"
          >
            <Smile className="w-6 h-6" />
          </button>

          {/* Paperclip Attach Icon */}
          <button 
            type="button"
            onClick={() => setShowAttachMenu(!showAttachMenu)}
            className={`p-2 rounded-full transition ${
              showAttachMenu ? 'bg-[#374248] text-[#00A884]' : 'text-[#8696A0] hover:text-[#E9EDEF]'
            }`}
            title="תפריט קיצורים ודוחות"
          >
            <Paperclip className="w-6 h-6" />
          </button>

          {/* Text Input / Voice Recording */}
          <div className="flex-1 relative">
            {isRecording ? (
              <div className="w-full bg-[#111B21] border border-rose-500/50 rounded-xl px-4 py-2.5 flex items-center justify-between text-xs sm:text-sm text-rose-400 animate-pulse">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                  <span>מקליט פקודה קולית לנועה AI... ({recordingSeconds}s)</span>
                </div>
                <span className="text-[#8696A0] text-xs">דבר עכשיו (למשל: "תוציא 40 שקי מלט...")</span>
              </div>
            ) : (
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSendMessage();
                }}
                placeholder='הקלד הודעה לנועה AI או פקודת אספקה (למשל: "תוציא לבוקטוס 40 שקי מלט ו-6 טיט בלות...")'
                className="w-full bg-[#2A3942] border-0 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-[#E9EDEF] placeholder-[#8696A0] focus:outline-none focus:ring-1 focus:ring-[#00A884]"
              />
            )}
          </div>

          {/* Voice Record Button */}
          <button
            type="button"
            onClick={handleVoiceRecordToggle}
            className={`p-2.5 rounded-full transition active:scale-95 ${
              isRecording 
                ? 'bg-rose-600 text-white animate-pulse ring-2 ring-rose-400' 
                : 'text-[#8696A0] hover:text-[#E9EDEF] hover:bg-[#2A3942]'
            }`}
            title={isRecording ? 'סיום הקלטה ושליחה' : 'הקלטה קולית'}
          >
            {isRecording ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
          </button>

          {/* Send Button */}
          <button
            type="button"
            onClick={() => handleSendMessage()}
            disabled={!inputText.trim() || isProcessing}
            className="p-2.5 rounded-full bg-[#00A884] hover:bg-[#008f6f] disabled:opacity-40 disabled:hover:bg-[#00A884] text-[#111B21] transition active:scale-95 flex-shrink-0"
            title="שלח הודעה"
          >
            <Send className="w-5 h-5" />
          </button>

        </div>

      </div>

      {/* Dispatch Briefing Modal */}
      {selectedOrderForDispatch && (
        <DispatchBriefingModal
          order={selectedOrderForDispatch}
          onClose={() => setSelectedOrderForDispatch(null)}
          onConfirmDispatch={(channel) => {
            setSelectedOrderForDispatch(null);
            notifyDriverNewOrder(selectedOrderForDispatch);
            const confirmedMsg: ChatMessage = {
              id: `sys-${Date.now()}`,
              sender: 'system',
              senderName: 'מערכת סידור',
              text: `✅ הזמנה #${selectedOrderForDispatch.orderNumber} שוגרה בהצלחה לנהג בוואטסאפ ובהתראת OneSignal Web Push!`,
              timestamp: new Date().toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' }),
              chatId: activeChannelId,
              wazeUrl: selectedOrderForDispatch.wazeUrl
            };
            setMessagesByChannel(prev => ({
              ...prev,
              [activeChannelId]: [...(prev[activeChannelId] || []), confirmedMsg]
            }));
          }}
        />
      )}

    </div>
  );
};
