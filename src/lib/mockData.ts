import { DeliveryNoteDoc, LogisticsOrder } from '../types/logistics';
import { generateWazeUrl } from './parser';

export const INITIAL_ORDERS: LogisticsOrder[] = [
  {
    id: 'ord-6215184',
    orderNumber: '6215184',
    customerNumber: '618204',
    customerName: 'בן ענבר פרויקטים בע"מ',
    siteAddress: 'דרך המשי 12, רעננה',
    city: 'רעננה',
    warehouse: '1_TALMID',
    items: [
      { sku: '111200', name: 'לוח גבס לבן 200 ע 12.50', quantity: 50, unit: 'לוח', category: 'plaster_drywall' },
      { sku: '9570300', name: 'ניצב 70/300 0.5', quantity: 30, unit: 'יח\'', category: 'plaster_drywall' },
      { sku: '8570300', name: 'מסלול 70/300 0.5', quantity: 20, unit: 'יח\'', category: 'plaster_drywall' },
      { sku: '15090', name: 'רוקבונד 28 ק"ג', quantity: 5, unit: 'שק', category: 'plaster_drywall' },
      { sku: '818060', name: 'הובלה ללא פריקה רעננה', quantity: 1, unit: 'הובלה', category: 'heavy_aggregate' }
    ],
    deposit: {
      palletsCount: 0,
      bigBagsCount: 0,
      euroPalletsCount: 0,
      blockPalletsCount: 0,
      barrelsCount: 0,
      isExempt: true,
      exemptReason: 'הובלה ללא פריקה גבס',
      status: 'פטור'
    },
    assignedDriver: 'ali',
    driverName: 'עלי',
    driverPhone: '050-886-0896',
    status: 'pending_schedule',
    receivedAt: '2026-08-28 07:15',
    scheduledTime: '08:00',
    timeSlot: 'סבב 1 (07:30 - 09:30)',
    hasDeliveryNote: false,
    isCraneRequired: false,
    wazeUrl: generateWazeUrl('דרך המשי 12, רעננה'),
    driveFolderUrl: 'https://drive.google.com/drive/folders/1JGNbTlmB5yBH_cLOApKTvE39CEL6roFF',
    distanceKm: 5.2,
    notes: 'סבב 1 — מחסן 1️⃣(התלמיד) — איסוזו עלי'
  },
  {
    id: 'ord-6215180',
    orderNumber: '6215180',
    customerNumber: '601945',
    customerName: 'קראמה אסאמה',
    siteAddress: 'רוטשילד 45, כפר סבא',
    city: 'כפר סבא',
    warehouse: '4_HARASH',
    items: [
      { sku: '11501', name: 'חול שק גדול (בלה)', quantity: 3, unit: 'בלה', category: 'heavy_aggregate' },
      { sku: '11511', name: 'סומסום שק גדול (בלה)', quantity: 2, unit: 'בלה', category: 'heavy_aggregate' },
      { sku: '10002', name: 'מלט אפור 25 ק"ג נשר', quantity: 30, unit: 'שק', category: 'cement' },
      { sku: '18055', name: 'הובלת מנוף כ"ס-רעננה', quantity: 1, unit: 'הובלה', category: 'heavy_aggregate' },
      { sku: '60002', name: 'שק גדול פקדון', quantity: 5, unit: 'פקדון', category: 'deposit' },
      { sku: '60060', name: 'משטח סבן פקדון', quantity: 1, unit: 'פקדון', category: 'deposit' }
    ],
    deposit: {
      palletsCount: 1,
      bigBagsCount: 5,
      euroPalletsCount: 0,
      blockPalletsCount: 0,
      barrelsCount: 0,
      isExempt: false,
      status: 'יש בלות'
    },
    assignedDriver: 'hikmat',
    driverName: 'חכמת',
    driverPhone: '050-886-1080',
    status: 'pending_schedule',
    receivedAt: '2026-08-28 07:30',
    scheduledTime: '09:00',
    timeSlot: 'סבב 1 (07:30 - 09:30)',
    hasDeliveryNote: false,
    isCraneRequired: true,
    craneDescription: 'מרצדס מנוף פריקה קומה 1',
    wazeUrl: generateWazeUrl('רוטשילד 45, כפר סבא'),
    driveFolderUrl: 'https://drive.google.com/drive/folders/1JGNbTlmB5yBH_cLOApKTvE39CEL6roFF',
    distanceKm: 4.8,
    notes: 'סבב 1 — מחסן 4️⃣(החרש) — חכמת מנוף'
  },
  {
    id: 'ord-6215178',
    orderNumber: '6215178',
    customerNumber: '602115',
    customerName: 'בזלת מזר בע"מ',
    siteAddress: 'שדה בוקר 17, גבעתיים',
    city: 'גבעתיים',
    warehouse: '4_HARASH',
    items: [
      { sku: '112200', name: 'לוח גבס ירוק 200 ע 12.50', quantity: 6, unit: 'לוח', category: 'plaster_drywall' },
      { sku: '111200', name: 'לוח גבס לבן 200 ע 12.50', quantity: 40, unit: 'לוח', category: 'plaster_drywall' },
      { sku: '9570300', name: 'ניצב 70/300 0.5', quantity: 20, unit: 'יח\'', category: 'plaster_drywall' },
      { sku: '8570300', name: 'מסלול 70/300 0.5', quantity: 16, unit: 'יח\'', category: 'plaster_drywall' },
      { sku: '11550', name: 'טיט שק 25 ק"ג', quantity: 50, unit: 'שק', category: 'heavy_aggregate' },
      { sku: '11500', name: 'חול שק 25 ק"ג', quantity: 40, unit: 'שק', category: 'heavy_aggregate' },
      { sku: '11510', name: 'סומסום שק 25 ק"ג', quantity: 30, unit: 'שק', category: 'heavy_aggregate' },
      { sku: '18060', name: 'הובלת מנוף גבעתיים', quantity: 1, unit: 'הובלה', category: 'heavy_aggregate' },
      { sku: '60060', name: 'משטח סבן פקדון', quantity: 3, unit: 'פקדון', category: 'deposit' }
    ],
    deposit: {
      palletsCount: 3,
      bigBagsCount: 0,
      euroPalletsCount: 0,
      blockPalletsCount: 0,
      barrelsCount: 0,
      isExempt: false,
      status: 'יש משטחים'
    },
    assignedDriver: 'hikmat',
    driverName: 'חכמת',
    driverPhone: '050-886-1080',
    status: 'pending_schedule',
    receivedAt: '2026-08-28 07:45',
    scheduledTime: '10:30',
    timeSlot: 'סבב 2 (10:30 - 12:30)',
    hasDeliveryNote: false,
    isCraneRequired: true,
    craneDescription: 'משאית מנוף גבעתיים קומה 2',
    wazeUrl: generateWazeUrl('שדה בוקר 17, גבעתיים'),
    driveFolderUrl: 'https://drive.google.com/drive/folders/1CARwoXMPEODCVCAWHZZEK_a1jAi-kSIY',
    distanceKm: 20.7,
    notes: 'סבב 2 — מחסן 4️⃣(החרש) — חכמת מנוף'
  }
];

export const SAMPLE_DELIVERY_NOTES: DeliveryNoteDoc[] = [
  {
    id: 'doc-6714899',
    orderNumber: '6214939',
    customerName: 'בוקטוס שלום — בי"ס הרצוג כ"ס',
    date: '2026-08-17',
    driverName: 'חכמת (משאית 615-41-002)',
    truckNumber: '615-41-002',
    imageUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1000&auto=format&fit=crop&q=80',
    reconciliationStatus: 'full_match',
    items: [
      { sku: '11551', description: 'טיט שק גדול (בלה)', orderedQty: 6, suppliedQty: 6, unit: 'בלה', status: 'match' },
      { sku: '10002', description: 'מלט אפור 25 ק"ג', orderedQty: 40, suppliedQty: 40, unit: 'שק', status: 'match' },
      { sku: '14075', description: 'טיח גבס MP75', orderedQty: 10, suppliedQty: 10, unit: 'שק', status: 'match' },
      { sku: '60002', description: 'שק גדול פקדון', orderedQty: 6, suppliedQty: 6, unit: 'יח\'', status: 'match' },
      { sku: '60060', description: 'משטח סבן פקדון', orderedQty: 1, suppliedQty: 1, unit: 'יח\'', status: 'match' }
    ],
    returnedPallets: 1,
    returnedBigBags: 4,
    creditMemoGenerated: true,
    creditMemoAmount: 330,
    signatureCaptured: true,
    customerSignerName: 'שלום בוקטוס'
  },
  {
    id: 'doc-6714590',
    orderNumber: '6214942',
    customerName: 'קבוצת חסון — קיבוץ מגל',
    date: '2026-08-18',
    driverName: 'חכמת',
    truckNumber: '615-41-002',
    imageUrl: 'https://images.unsplash.com/photo-1607344645866-009c320c5ab8?w=1000&auto=format&fit=crop&q=80',
    reconciliationStatus: 'approved_shortage',
    items: [
      { sku: '11501', description: 'חול שק גדול', orderedQty: 4, suppliedQty: 2, unit: 'בלה', status: 'shortage', notes: 'אושר חוסר 2 בלות — תואם זיכוי' },
      { sku: '11511', description: 'סומסום שק גדול', orderedQty: 1, suppliedQty: 1, unit: 'בלה', status: 'match' },
      { sku: '11551', description: 'טיט שק גדול', orderedQty: 1, suppliedQty: 1, unit: 'בלה', status: 'match' },
      { sku: '10002', description: 'מלט אפור 25 ק"ג', orderedQty: 20, suppliedQty: 20, unit: 'שק', status: 'match' },
      { sku: '15109', description: 'דבק 109 25 ק"ג', orderedQty: 10, suppliedQty: 10, unit: 'שק', status: 'match' },
      { sku: '60002', description: 'שק גדול פקדון', orderedQty: 6, suppliedQty: 4, unit: 'יח\'', status: 'deposit_mismatch', depositDifference: -2 }
    ],
    returnedPallets: 0,
    returnedBigBags: 2,
    creditMemoGenerated: true,
    creditMemoAmount: 180,
    signatureCaptured: true,
    customerSignerName: 'יוסי חסון'
  }
];
