import { COMMON_SKUS } from './constants';
import { DepositCalculation, LogisticsOrder, OrderItem, WarehouseType } from '../types/logistics';

export function calculateDeposits(items: OrderItem[], isDirectDrop: boolean = false): DepositCalculation {
  if (isDirectDrop) {
    return {
      palletsCount: 0,
      bigBagsCount: 0,
      euroPalletsCount: 0,
      blockPalletsCount: 0,
      barrelsCount: 0,
      isExempt: true,
      exemptReason: 'הובלה ישירה ללא פקדונות',
      status: 'פטור'
    };
  }

  let totalBaggedWeightKg = 0;
  let totalBags = 0;
  let bigBagsCount = 0;
  let blockPalletsCount = 0;
  let euroPalletsCount = 0;
  let barrelsCount = 0;

  for (const item of items) {
    const sku = item.sku;
    const nameLower = (item.name || '').toLowerCase();
    const qty = item.quantity || 0;

    // Check big bags (בלות)
    if (sku === '60002' || nameLower.includes('בלה') || nameLower.includes('שק גדול') || sku === '11501' || sku === '11511' || sku === '11551' || sku === '11506' || sku === '11570') {
      if (sku !== '60002') {
        bigBagsCount += qty;
      }
    }

    // Check Euro pallets
    if (sku === '60018' || nameLower.includes('euro')) {
      euroPalletsCount += qty;
    }

    // Check block pallets
    if (sku === '60006' || nameLower.includes('בלוק')) {
      if (sku !== '60006') {
        // ~100 blocks per pallet
        blockPalletsCount += Math.ceil(qty / 100);
      }
    }

    // Check barrels
    if (sku === '60004' || nameLower.includes('חבית')) {
      barrelsCount += qty;
    }

    // Check standard 25kg bags (מלט, טיח, ריצופית, דבק, קלסימו)
    if (nameLower.includes('מלט') || nameLower.includes('טיח') || nameLower.includes('דבק') || nameLower.includes('ריצופית') || nameLower.includes('פלסטומר') || nameLower.includes('בטון מהיר') || nameLower.includes('25 ק"ג')) {
      totalBags += qty;
      totalBaggedWeightKg += qty * 25;
    }
  }

  // Pallet deposit (מק"ט 60060) auto-added above 20 bags (1 pallet per 40-50 bags, minimum 1 if >= 20 bags)
  let palletsCount = 0;
  if (totalBags >= 20) {
    palletsCount = Math.ceil(totalBags / 40);
  }

  let status: ' תקין' | 'יש בלות' | 'יש משטחים' | 'פטור' | 'דורש מעקב מנוף' | 'אי התאמה' = ' תקין';
  if (bigBagsCount > 0 && palletsCount > 0) {
    status = 'יש בלות';
  } else if (bigBagsCount > 0) {
    status = 'יש בלות';
  } else if (palletsCount > 0) {
    status = 'יש משטחים';
  }

  return {
    palletsCount,
    bigBagsCount,
    euroPalletsCount,
    blockPalletsCount,
    barrelsCount,
    isExempt: false,
    status
  };
}

export function generateWazeUrl(address: string, city?: string): string {
  const fullAddress = city && !address.includes(city) ? `${address}, ${city}` : address;
  return `https://waze.com/ul?q=${encodeURIComponent(fullAddress.trim())}&navigate=yes`;
}

export function parseFreeTextOrder(text: string): LogisticsOrder {
  const clean = text.trim();
  
  // Extract customer name
  let customerName = 'לקוח כללי';
  const custMatch = clean.match(/(?:תוציא ל|הזמנה ל|עבור |עבור לקוח |לכבוד |ל)(\b[^\d,\n]+?\b)(?=\s+(?:\d+|שקי|בלות|לוחות|מחר|היום|בכתובת|ברחוב|ב-|\n))/i);
  if (custMatch && custMatch[1]) {
    customerName = custMatch[1].replace(/(?:שלום|בבקשה|דחוף|ל)/g, '').trim();
  }

  // Extract address/city
  let siteAddress = 'איסוף עצמי / תיאום טלפוני';
  let city = 'מרכז';
  const addressMatch = clean.match(/(?:בכתובת|ברחוב|באתר|אל|ל-|ב-)\s*([א-ת0-9\s"'-]+?(?:כפר סבא|רעננה|הוד השרון|הרצליה|רמת השרון|תל אביב|פתח תקווה|בני ברק|מודיעין|אבן יהודה|נתניה|ראש העין|ראשון לציון|רמות השבים|קדימה|צורן|גבעתיים|רמת גן|יקום|עלי זהב|שומרון|עמק חפר|[א-ת\s]+))/i);
  
  if (addressMatch && addressMatch[1]) {
    siteAddress = addressMatch[1].trim();
  }

  const cities = ['כפר סבא', 'רעננה', 'הוד השרון', 'הרצליה', 'רמת השרון', 'תל אביב', 'פתח תקווה', 'בני ברק', 'מודיעין', 'אבן יהודה', 'נתניה', 'ראש העין', 'ראשון לציון', 'רמות השבים', 'קדימה', 'צורן', 'גבעתיים', 'רמת גן', 'יקום', 'עלי זהב'];
  for (const c of cities) {
    if (clean.includes(c)) {
      city = c;
      break;
    }
  }

  // Extract Items
  const items: OrderItem[] = [];
  
  // Cement
  const cementMatch = clean.match(/(\d+)\s*(?:שק|שקי|שקים)?\s*(?:של\s*)?מלט(?:\s*אפור|\s*לבן|\s*25)?/i);
  if (cementMatch) {
    const qty = parseInt(cementMatch[1], 10);
    items.push({
      sku: '10002',
      name: 'מלט אפור 25 ק"ג נשר',
      quantity: qty,
      unit: 'שק',
      category: 'cement'
    });
  }

  // Big bags of Tit / Sand / Sumsum
  const titMatch = clean.match(/(\d+)\s*(?:טיט\s*בלות|בלות\s*טיט|טיט\s*שק\s*גדול|שקי\s*טיט|טיט)/i);
  if (titMatch) {
    const qty = parseInt(titMatch[1], 10);
    items.push({
      sku: '11551',
      name: 'טיט שק גדול (בלה)',
      quantity: qty,
      unit: 'בלה',
      category: 'heavy_aggregate'
    });
  }

  const sandMatch = clean.match(/(\d+)\s*(?:חול\s*בלות|בלות\s*חול|חול\s*שק\s*גדול|חול\s*ים)/i);
  if (sandMatch) {
    const qty = parseInt(sandMatch[1], 10);
    items.push({
      sku: '11501',
      name: 'חול שק גדול (בלה)',
      quantity: qty,
      unit: 'בלה',
      category: 'heavy_aggregate'
    });
  }

  const sumsumMatch = clean.match(/(\d+)\s*(?:סומסום\s*בלות|בלות\s*סומסום|סומסום\s*שק\s*גדול|סומסום)/i);
  if (sumsumMatch) {
    const qty = parseInt(sumsumMatch[1], 10);
    items.push({
      sku: '11511',
      name: 'סומסום שק גדול (בלה)',
      quantity: qty,
      unit: 'בלה',
      category: 'heavy_aggregate'
    });
  }

  // Plaster / Gypsum
  const plasterMatch = clean.match(/(\d+)\s*(?:שקי\s*)?(?:טיח\s*גבס|MP75|טיח)/i);
  if (plasterMatch) {
    const qty = parseInt(plasterMatch[1], 10);
    items.push({
      sku: '14075',
      name: 'טיח גבס MP75 קנאוף שק 25 ק"ג',
      quantity: qty,
      unit: 'שק',
      category: 'plaster_drywall'
    });
  }

  // Drywall sheets
  const drywallMatch = clean.match(/(\d+)\s*(?:לוחות\s*גבס|גבס\s*לבן|גבס\s*ירוק|גבס\s*כחול)/i);
  if (drywallMatch) {
    const qty = parseInt(drywallMatch[1], 10);
    items.push({
      sku: '111260',
      name: 'לוח גבס לבן 260 12.5 מ"מ',
      quantity: qty,
      unit: 'לוח',
      category: 'plaster_drywall'
    });
  }

  // Blocks
  const blockMatch = clean.match(/(\d+)\s*(?:בלוקים|בלוק\s*10|בלוק\s*20|בלוק\s*איטונג)/i);
  if (blockMatch) {
    const qty = parseInt(blockMatch[1], 10);
    items.push({
      sku: '12010',
      name: 'בלוק בטון 10/20/40',
      quantity: qty,
      unit: 'יח\'',
      category: 'heavy_aggregate'
    });
  }

  // If no items matched specific regex, add generic item
  if (items.length === 0) {
    items.push({
      sku: '10002',
      name: 'מלט אפור 25 ק"ג',
      quantity: 40,
      unit: 'שק',
      category: 'cement'
    });
  }

  // Determine warehouse
  let warehouse: WarehouseType = '4_HARASH';
  const hasDrywallOrPaint = items.some(i => i.category === 'plaster_drywall' || i.category === 'paint' || i.category === 'hardware');
  const hasHeavy = items.some(i => i.category === 'heavy_aggregate' || i.category === 'cement' || i.category === 'iron');
  if (hasDrywallOrPaint && !hasHeavy) {
    warehouse = '1_TALMID';
  }

  // Calculate deposits
  const deposit = calculateDeposits(items);

  // Check crane requirement
  const isCraneRequired = clean.includes('מנוף') || deposit.bigBagsCount > 0 || deposit.palletsCount > 0 || items.some(i => i.quantity >= 20);

  const orderNum = '621' + Math.floor(1000 + Math.random() * 9000);

  return {
    id: `ord-${Date.now()}`,
    orderNumber: orderNum,
    customerName,
    siteAddress,
    city,
    warehouse,
    items,
    deposit,
    assignedDriver: 'hikmat',
    driverName: 'חכמת',
    status: 'pending_schedule',
    hasDeliveryNote: false,
    receivedAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
    scheduledTime: '08:00',
    timeSlot: '08:00 - 10:00',
    isCraneRequired,
    craneDescription: isCraneRequired ? 'נדרשת פריקת מנוף באתר' : 'הובלה ללא פריקה',
    wazeUrl: generateWazeUrl(siteAddress, city),
    notes: clean
  };
}

export function formatWhatsAppDispatchMessage(order: Partial<LogisticsOrder>): string {
  const itemsText = (order.items || [])
    .map((item, idx) => `${idx + 1}. 📦 מק"ט: ${item.sku} | ${item.name} | כמות: ${item.quantity} ${item.unit}`)
    .join('\n');

  const dep = order.deposit || { palletsCount: 0, bigBagsCount: 0, isExempt: false };
  const depositText = dep.isExempt 
    ? '✨ פקדונות: פטור' 
    : `📦 פקדונות: ${dep.bigBagsCount > 0 ? `${dep.bigBagsCount} בלות (60002)` : '0 בלות'} | ${dep.palletsCount > 0 ? `${dep.palletsCount} משטחים (60060)` : '0 משטחים'}`;

  const warehouseName = order.warehouse === '1_TALMID' ? '🏟️ 1️⃣(התלמיד)' : '🏭 4️⃣(החרש)';

  return `🚚 *סידור עבודה — ח. סבן חומרי בניין בע"מ*
━━━━━━━━━━━━━━━━━━
📋 *הזמנה:* #${order.orderNumber || 'חדשה'}
👤 *לקוח:* ${order.customerName || 'כללי'}
📍 *יעד:* ${order.siteAddress || ''} (${order.city || ''})
🏭 *מחסן יציאה:* ${warehouseName}
🕒 *שעת יעד:* ${order.scheduledTime || '08:00'} (${order.timeSlot || 'סבב בוקר'})
🏗️ *מנוף:* ${order.isCraneRequired ? '✅ נדרשת פריקת מנוף' : '❌ הובלה ללא פריקה'}

📦 *פירוט חומרים:*
${itemsText}

${depositText}

🧭 *ניווט ישיר ב-Waze:*
${order.wazeUrl || generateWazeUrl(order.siteAddress || '', order.city)}

באדיבות נועה AI ❤️ (יד ימינו של ראמי)`;
}

export function createMakePayload(order: Partial<LogisticsOrder>) {
  return {
    source: 'Noa_AI_Logistics_OS',
    timestamp: new Date().toISOString(),
    event: 'DISPATCH_ORDER',
    order: {
      order_id: order.id,
      order_number: order.orderNumber,
      customer: order.customerName,
      customer_number: order.customerNumber || '',
      destination: {
        address: order.siteAddress,
        city: order.city,
        waze_url: order.wazeUrl
      },
      warehouse: order.warehouse === '1_TALMID' ? '1_TALMID (Hatlamid)' : '4_HARASH (Haharash)',
      driver: {
        id: order.assignedDriver,
        name: order.driverName || 'חכמת',
        phone: order.driverPhone || '0508861080'
      },
      schedule: {
        slot: order.timeSlot,
        time: order.scheduledTime
      },
      materials: (order.items || []).map(i => ({
        sku: i.sku,
        description: i.name,
        qty: i.quantity,
        unit: i.unit
      })),
      deposits: {
        pallets_60060: order.deposit?.palletsCount || 0,
        big_bags_60002: order.deposit?.bigBagsCount || 0,
        euro_pallets_60018: order.deposit?.euroPalletsCount || 0,
        block_pallets_60006: order.deposit?.blockPalletsCount || 0,
        exempt: order.deposit?.isExempt || false
      },
      crane_required: order.isCraneRequired || false
    }
  };
}
