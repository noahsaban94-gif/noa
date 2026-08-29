export type WarehouseType = '4_HARASH' | '1_TALMID' | 'EXTERNAL';

export type DriverId = 'hikmat' | 'ali' | 'external' | 'unassigned';

export type OrderStatus = 
  | 'pending_schedule'    // בסידור עבודה / שיבוץ ממתין
  | 'dispatched_whatsapp' // שוגר בוואטסאפ / שודר ל-Make
  | 'loading'             // בהעמסה
  | 'on_the_way'          // בנסיעה / בדרך
  | 'delivered'           // סופק במלואו / נפרק
  | 'partial_delivery'    // אספקה חלקית
  | 'pending_doc'         // ממתין לתעודה חתומה
  | 'verified'            // מאושר
  | 'reset_review'        // מועד האספקה מתאפס - בבדיקה מחדש
  | 'cancelled';          // מבוטל

export interface OrderItem {
  sku: string;
  name: string;
  quantity: number;
  unit: string;
  category?: 'heavy_aggregate' | 'cement' | 'plaster_drywall' | 'hardware' | 'paint' | 'iron' | 'deposit';
}

export interface DepositCalculation {
  palletsCount: number;      // מק"ט 60060 (מעל 20 שקים / משטח)
  bigBagsCount: number;      // מק"ט 60002 (בלות חול, סומסום, טיט)
  euroPalletsCount: number;  // מק"ט 60018
  blockPalletsCount: number; // מק"ט 60006
  barrelsCount: number;      // מק"ט 60004
  isExempt: boolean;         // פטור
  exemptReason?: string;
  status: ' תקין' | 'יש בלות' | 'יש משטחים' | 'פטור' | 'דורש מעקב מנוף' | 'אי התאמה';
}

export interface OrderEmailMeta {
  messageId?: string;
  senderEmail: string;
  senderName: string;
  recipientEmail: string;
  subject: string;
  sentAt: string;
  systemOrigin: string; // e.g. "comax.co.il"
  securityInfo?: string; // "הצפנה סטנדרטית (TLS)"
  importanceNote?: string; // "אנחנו סבורים שההודעה הזו חשובה."
  pdfFileName?: string;
  pdfFileSize?: string;
  pdfDriveUrl?: string;
  driveFolderUrl?: string;
  driveFolderName?: string;
  rawBody?: string;
}

export interface LogisticsOrder {
  id: string;
  orderNumber: string;
  customerNumber?: string;
  customerName: string;
  siteAddress: string;
  city: string;
  warehouse: WarehouseType;
  items: OrderItem[];
  deposit: DepositCalculation;
  assignedDriver: DriverId;
  driverName?: string;
  status: OrderStatus;
  receivedAt: string;
  scheduledTime?: string;     // e.g. "08:30"
  timeSlot?: string;          // e.g. "08:00-10:00"
  deliveryNoteId?: string;
  hasDeliveryNote: boolean;
  isCraneRequired: boolean;
  craneDescription?: string;
  wazeUrl: string;
  clientPhone?: string;
  driverPhone?: string;
  driveFolderUrl?: string;
  notes?: string;
  totalWeightKg?: number;
  returnedPallets?: number;
  returnedBags?: number;
  signedNoteImageUrl?: string;
  signedAt?: string;
  distanceKm?: number;
  // Comax & Email Ingestion properties
  emailMeta?: OrderEmailMeta;
  orderDocumentUrl?: string;
  orderDocumentName?: string;
  orderDocumentType?: 'comax_pdf' | 'signed_delivery_note' | 'invoice';
}

export interface DriverInfo {
  id: DriverId;
  name: string;
  title: string;
  truckNumber: string;
  truckType: string;
  maxTonnage: number;
  phone: string;
  color: 'cyan' | 'emerald' | 'amber';
  hexColor: string;
  status: 'active' | 'loading' | 'on_route' | 'idle';
  currentLocationName: string;
  activeOrdersCount: number;
  avatarUrl: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'noa' | 'driver' | 'system';
  senderName: string;
  text: string;
  timestamp: string;
  parsedOrder?: Partial<LogisticsOrder>;
  hasAudio?: boolean;
  audioUrl?: string;
  wazeUrl?: string;
  whatsappShareUrl?: string;
  chatId?: string;
  isStatusResetAlert?: boolean;
  viewTrigger?: 'dashboard' | 'morning_report' | 'order_files';
  isEmailIngestionCard?: boolean;
  orderEmailMeta?: OrderEmailMeta;
}

export interface CanvasAnnotation {
  id: string;
  type: 'pen' | 'circle' | 'highlight' | 'signature' | 'text';
  color: string;
  size: number;
  points?: { x: number; y: number }[];
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  text?: string;
  timestamp: number;
}

export interface ReconciliationItem {
  sku: string;
  description: string;
  orderedQty: number;
  suppliedQty: number;
  unit: string;
  status: 'match' | 'shortage' | 'damaged' | 'deposit_mismatch';
  depositDifference?: number;
  notes?: string;
}

export interface DeliveryNoteDoc {
  id: string;
  orderNumber: string;
  customerName: string;
  date: string;
  driverName: string;
  truckNumber: string;
  imageUrl: string;
  reconciliationStatus: 'full_match' | 'approved_shortage' | 'deposit_mismatch' | 'pending';
  items: ReconciliationItem[];
  returnedPallets: number;
  returnedBigBags: number;
  creditMemoGenerated: boolean;
  creditMemoAmount?: number;
  signatureCaptured: boolean;
  customerSignerName?: string;
}
