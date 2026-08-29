import { LogisticsOrder } from '../types/logistics';

export interface MorningReportSummary {
  totalOrders: number;
  harashCount: number;
  talmidCount: number;
  craneCount: number;
  truckCount: number;
  hikmatOrders: LogisticsOrder[];
  aliOrders: LogisticsOrder[];
  otherOrders: LogisticsOrder[];
  dateStr: string;
  formattedText: string;
}

/**
 * Calculates order weight in tons or kg
 */
export function getOrderWeightString(order: LogisticsOrder): string {
  if (order.totalWeightKg && order.totalWeightKg > 0) {
    const tons = (order.totalWeightKg / 1000).toFixed(1);
    return `(משקל: ${tons} טון)`;
  }

  // Calculate from items if available
  let calculatedKg = 0;
  if (order.items && order.items.length > 0) {
    for (const item of order.items) {
      const name = (item.name || '').toLowerCase();
      const qty = item.quantity || 1;
      if (name.includes('מלט') || name.includes('טיח') || name.includes('דבק') || name.includes('25 ק"ג')) {
        calculatedKg += qty * 25;
      } else if (name.includes('שק גדול') || name.includes('בלה') || name.includes('חול') || name.includes('סומסום') || name.includes('טיט')) {
        calculatedKg += qty * 600; // ~600kg per big bag
      } else if (name.includes('בלוק')) {
        calculatedKg += qty * 15;
      } else if (name.includes('גבס') || name.includes('לוח')) {
        calculatedKg += qty * 28;
      } else {
        calculatedKg += qty * 20;
      }
    }
  }

  if (calculatedKg > 0) {
    const tons = (calculatedKg / 1000).toFixed(1);
    return `(משקל: ${tons} טון)`;
  }

  if (order.isCraneRequired) {
    return `(${order.warehouse === '1_TALMID' ? 'התלמיד 1' : 'החרש'})+עבודת מנוף (ללא משקל)`;
  }

  return `(${order.warehouse === '1_TALMID' ? 'התלמיד 1' : 'החרש'})`;
}

/**
 * Generates estimated distance & time if available
 */
export function getOrderDistanceTimeString(order: LogisticsOrder): string {
  if (order.distanceKm && order.distanceKm > 0) {
    const km = order.distanceKm.toFixed(1);
    const mins = Math.max(5, Math.round(order.distanceKm * 1.6));
    return `🚚 מרחק: ${km} ק"מ | ⏱️ זמן: כ-${mins} דקות`;
  }

  // City based estimations from Harash warehouse
  const city = (order.city || '').toLowerCase();
  if (city.includes('רעננה')) return `🚚 מרחק: 5.0 ק"מ | ⏱️ זמן: כ-7 דקות`;
  if (city.includes('הרצליה')) return `🚚 מרחק: 9.0 ק"מ | ⏱️ זמן: כ-15 דקות`;
  if (city.includes('כפר סבא')) return `🚚 מרחק: 4.5 ק"מ | ⏱️ זמן: כ-8 דקות`;
  if (city.includes('הוד השרון')) return `🚚 מרחק: 6.0 ק"מ | ⏱️ זמן: כ-10 דקות`;
  if (city.includes('אבן יהודה')) return `🚚 מרחק: 14.0 ק"מ | ⏱️ זמן: כ-18 דקות`;
  if (city.includes('נתניה')) return `🚚 מרחק: 22.0 ק"מ | ⏱️ זמן: כ-25 דקות`;
  if (city.includes('תל אביב')) return `🚚 מרחק: 18.0 ק"מ | ⏱️ זמן: כ-24 דקות`;
  
  return '';
}

/**
 * Formats a single line item for morning report
 */
export function formatMorningReportLine(order: LogisticsOrder): string {
  const time = order.scheduledTime || '08:00';
  const orderNum = order.orderNumber || order.id;
  const custName = order.customerName || 'לקוח';
  const weightStr = getOrderWeightString(order);
  const distTimeStr = getOrderDistanceTimeString(order);

  if (distTimeStr) {
    return `${time} | 📦 ${orderNum}: ${custName} ${weightStr} ${distTimeStr}`;
  }
  return `${time} | 📦 ${orderNum}: ${custName} ${weightStr}`;
}

/**
 * Builds the complete structured Morning Report
 */
export function generateMorningReport(orders: LogisticsOrder[], customDate?: Date): MorningReportSummary {
  // If customDate not given, default to tomorrow's morning or current date
  const targetDate = customDate || new Date(Date.now() + 24 * 60 * 60 * 1000);
  const day = String(targetDate.getDate()).padStart(2, '0');
  const month = String(targetDate.getMonth() + 1).padStart(2, '0');
  const year = targetDate.getFullYear();
  const dateStr = `${day}/${month}/${year}`;

  const validOrders = orders.filter(o => o.status !== 'cancelled');

  const hikmatOrders = validOrders.filter(o => o.assignedDriver === 'hikmat');
  const aliOrders = validOrders.filter(o => o.assignedDriver === 'ali');
  const otherOrders = validOrders.filter(o => o.assignedDriver !== 'hikmat' && o.assignedDriver !== 'ali');

  // Sort orders by scheduledTime
  const sortByTime = (a: LogisticsOrder, b: LogisticsOrder) => {
    const timeA = a.scheduledTime || '08:00';
    const timeB = b.scheduledTime || '08:00';
    return timeA.localeCompare(timeB);
  };

  hikmatOrders.sort(sortByTime);
  aliOrders.sort(sortByTime);
  otherOrders.sort(sortByTime);

  let harashCount = 0;
  let talmidCount = 0;
  let craneCount = 0;
  let truckCount = 0;

  for (const o of validOrders) {
    if (o.warehouse === '1_TALMID') {
      talmidCount++;
    } else {
      harashCount++;
    }

    if (o.isCraneRequired || o.assignedDriver === 'hikmat') {
      craneCount++;
    } else {
      truckCount++;
    }
  }

  // Build the text message matching the user's exact specification
  const lines: string[] = [];

  lines.push(`📅 *דוח בוקר - ח. סבן | ${dateStr}*`);
  lines.push('');

  // 1. Hikmat (Crane)
  lines.push('👤 חכמת (מנוף 🏗️):');
  if (hikmatOrders.length > 0) {
    for (const ord of hikmatOrders) {
      lines.push(formatMorningReportLine(ord));
    }
  } else {
    lines.push('07:00 | אין נסיעות משובצות כרגע');
  }
  lines.push('');

  // 2. Ali (Truck)
  lines.push('👤 עלי (משאית 🚛):');
  if (aliOrders.length > 0) {
    for (const ord of aliOrders) {
      lines.push(formatMorningReportLine(ord));
    }
  } else {
    lines.push('08:00 | אין נסיעות משובצות כרגע');
  }
  lines.push('');

  // 3. Other drivers / Self pickup if any
  if (otherOrders.length > 0) {
    lines.push('👤 איסוף עצמי / משאיות חיצוניות 📦:');
    for (const ord of otherOrders) {
      lines.push(formatMorningReportLine(ord));
    }
    lines.push('');
  }

  // Summary
  lines.push('📊 סיכום סידור:');
  lines.push('');
  lines.push(`סה"כ הזמנות: ${validOrders.length}`);
  lines.push(`📦 מהמחסנים: החרש (${harashCount}) | התלמיד (${talmidCount})`);
  lines.push(`🚛 סוגי הובלה: מנוף (${craneCount}) | משאית (${truckCount})`);
  lines.push('');
  lines.push('סידור נעים, שיהיה לנו בוקר טוב! ✨');

  const formattedText = lines.join('\n');

  return {
    totalOrders: validOrders.length,
    harashCount,
    talmidCount,
    craneCount,
    truckCount,
    hikmatOrders,
    aliOrders,
    otherOrders,
    dateStr,
    formattedText
  };
}
