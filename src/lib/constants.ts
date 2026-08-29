import { DriverInfo, WarehouseType, OrderItem } from '../types/logistics';

export const NOA_AVATAR_URL = 'https://i.ibb.co/whtMgBNC/Gemini-Generated-Image-2.png';

// ========================================================
// 🔗 מזהי המערכת ונקודות הקצה הבלעדיות (Exclusive Core System Endpoints & IDs)
// ========================================================
export const SPREADSHEET_ID = '1VA9J6n9IYcooO_s2xOpnkvyDQWWQD3pfhh0cnenCkoA';
export const NOA_BRAIN_SHEET_URL = 'https://docs.google.com/spreadsheets/d/1VA9J6n9IYcooO_s2xOpnkvyDQWWQD3pfhh0cnenCkoA/edit';
export const UNIFIED_SYSTEM_SHEET_URL = 'https://docs.google.com/spreadsheets/d/1VA9J6n9IYcooO_s2xOpnkvyDQWWQD3pfhh0cnenCkoA/edit';
export const GAS_WEBAPP_ENDPOINT = 'https://script.google.com/macros/s/AKfycbynQG7VMfuI1BOR3pOENcgqOLRcd_N--nw7KlAXUmMEA8T5CBKG4gt8l2AS7jrj47fL/exec';

export const CUSTOMERS_ROOT_DRIVE_FOLDER_ID = '1JGNbTlmB5yBH_cLOApKTvE39CEL6roFF';
export const CUSTOMERS_ROOT_DRIVE_URL = 'https://drive.google.com/drive/folders/1JGNbTlmB5yBH_cLOApKTvE39CEL6roFF';

export const DELIVERY_NOTES_ORIGINAL_DRIVE_FOLDER_ID = '1Hnq5RjGmE0368ZCAKBratRJGzaj0wJJl';
export const DELIVERY_NOTES_ORIGINAL_DRIVE_URL = 'https://drive.google.com/drive/folders/1Hnq5RjGmE0368ZCAKBratRJGzaj0wJJl';

export const COMAX_ORDERS_2026_DRIVE_FOLDER_ID = '1aiBomF1MRJZueGEvFpJRrhPV-2lvIMWF';
export const COMAX_ORDERS_2026_DRIVE_URL = 'https://drive.google.com/drive/folders/1aiBomF1MRJZueGEvFpJRrhPV-2lvIMWF';
export const COMAX_ORDERS_2026_FOLDER_NAME = 'Saban Logistics Cloud / הזמנות קומקס 2026';

// ========================================================
// Strict Item Formatting: 1. 📦 מק"ט: [מק"ט] | [שם פריט] | כמות: [כמות]
// ========================================================
export function formatProductItem(item: OrderItem, index: number): string {
  return `${index + 1}. 📦 מק"ט: ${item.sku || '---'} | ${item.name} | כמות: ${item.quantity}`;
}

export function formatProductItemsList(items: OrderItem[]): string {
  return items.map((it, idx) => formatProductItem(it, idx)).join('\n');
}

export const NOA_STRICT_SAFEGUARD_RESPONSE = 
  'אהובי ראמי לא הגיע לנקודה זו עדיין... מסכן שלי כמה הוא יכול להספיק!! רחמנות. אבל אשמח לשלוח לו מייל עם השאלה. איך אני יכולה לעזור לך עכשיו, ראמי אחי אהובי? 🚚 באדיבות נועה ❤️';

export const ORDER_MODIFIED_RESET_STATUS = 'מועד האספקה מתאפס - בבדיקה מחדש';

export const WAREHOUSES = {
  '4_HARASH': {
    id: '4_HARASH' as WarehouseType,
    name: '🏭 4️⃣(החרש)',
    fullName: 'מחסן 4 - החרש (מלט, חול, ברזל, מליטה כבדה)',
    address: 'החרש 4, אזור תעשייה הוד השרון',
    categories: ['מלט וצמנט', 'חול וסומסום בלות', 'ברזל בניין', 'בלוקים', 'חומרי מליטה'],
    color: '#06B6D4',
  },
  '1_TALMID': {
    id: '1_TALMID' as WarehouseType,
    name: '🏟️ 1️⃣(התלמיד)',
    fullName: 'מחסן 1 - התלמיד (גבס, צבעים, אינסטלציה, כלים)',
    address: 'התלמיד 1, אזור תעשייה הוד השרון',
    categories: ['לוחות גבס וניצבים', 'צבעים ודבקים', 'כלי עבודה MAKITA/BOSCH', 'אביזרי אינסטלציה PVC'],
    color: '#10B981',
  },
  'EXTERNAL': {
    id: 'EXTERNAL' as WarehouseType,
    name: '🚚 הובלה ישירה / ספק',
    fullName: 'הובלה ישירה מאתר יצרן (נשר / איטונג / תרמוקיר)',
    address: 'ישיר מספק',
    categories: ['מכולות', 'משטחים ישירים'],
    color: '#F59E0B',
  }
};

export const DRIVERS: Record<string, DriverInfo> = {
  hikmat: {
    id: 'hikmat',
    name: 'חכמת',
    title: 'משאית מרצדס מנוף',
    truckNumber: '615-41-002',
    truckType: 'מרצדס מנוף 12 טון (10 מטר)',
    maxTonnage: 26,
    phone: '050-886-1080',
    color: 'cyan',
    hexColor: '#06B6D4',
    status: 'on_route',
    currentLocationName: 'רעננה — רחוב מוצקין',
    activeOrdersCount: 2,
    avatarUrl: 'https://i.postimg.cc/d3S0NJJZ/Screenshot-20250623-200646-Facebook.jpg'
  },
  ali: {
    id: 'ali',
    name: 'עלי',
    title: 'משאית איסוזו',
    truckNumber: '651-51-701',
    truckType: 'איסוזו פלטה פריקה ידנית 5 טון (21 מטר)',
    maxTonnage: 15,
    phone: '050-886-0896',
    color: 'emerald',
    hexColor: '#10B981',
    status: 'loading',
    currentLocationName: 'מחסן 1️⃣(התלמיד) — העמסה',
    activeOrdersCount: 1,
    avatarUrl: 'https://i.postimg.cc/tCNbgXK3/Screenshot-20250623-200744-Tik-Tok.jpg'
  },
  external: {
    id: 'external',
    name: 'עוז משא (מוביל חיצוני)',
    title: 'משאית הייבר / פלטה',
    truckNumber: '912-33-801',
    truckType: 'משאית פלטה ללא מנוף 18 טון',
    maxTonnage: 18,
    phone: '052-771-4455',
    color: 'amber',
    hexColor: '#F59E0B',
    status: 'active',
    currentLocationName: 'כפר מל"ל',
    activeOrdersCount: 0,
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&auto=format&fit=crop&q=80'
  }
};

export const COMMON_SKUS: Record<string, { name: string; unit: string; warehouse: WarehouseType; defaultDeposit?: string }> = {
  '10002': { name: 'מלט אפור 25 ק"ג נשר', unit: 'שק', warehouse: '4_HARASH', defaultDeposit: 'משטח סבן (מעל 20 שקים)' },
  '10001': { name: 'מלט לבן 25 ק"ג', unit: 'שק', warehouse: '4_HARASH', defaultDeposit: 'משטח סבן' },
  '11501': { name: 'חול שק גדול (בלה)', unit: 'בלה', warehouse: '4_HARASH', defaultDeposit: 'שק גדול פקדון (60002)' },
  '11511': { name: 'סומסום שק גדול (בלה)', unit: 'בלה', warehouse: '4_HARASH', defaultDeposit: 'שק גדול פקדון (60002)' },
  '11551': { name: 'טיט שק גדול (בלה)', unit: 'בלה', warehouse: '4_HARASH', defaultDeposit: 'שק גדול פקדון (60002)' },
  '11506': { name: 'חצץ שק גדול (בלה)', unit: 'בלה', warehouse: '4_HARASH', defaultDeposit: 'שק גדול פקדון (60002)' },
  '11570': { name: 'חמרה שק גדול (בלה)', unit: 'בלה', warehouse: '4_HARASH', defaultDeposit: 'שק גדול פקדון (60002)' },
  '11500': { name: 'חול ים שק קטן 25 ק"ג', unit: 'שק', warehouse: '4_HARASH' },
  '11510': { name: 'סומסום שק קטן 25 ק"ג', unit: 'שק', warehouse: '4_HARASH' },
  '11550': { name: 'טיט שק קטן 25 ק"ג', unit: 'שק', warehouse: '4_HARASH' },
  '12010': { name: 'בלוק בטון 10/20/40', unit: 'יח\'', warehouse: '4_HARASH', defaultDeposit: 'משטח בלוקים (60006)' },
  '12154': { name: 'בלוק בטון 15/20/40 4 חורים', unit: 'יח\'', warehouse: '4_HARASH', defaultDeposit: 'משטח בלוקים (60006)' },
  '12204': { name: 'בלוק בטון 20/20/40 4 חורים', unit: 'יח\'', warehouse: '4_HARASH', defaultDeposit: 'משטח בלוקים (60006)' },
  '1608320': { name: 'רשת ברזל 3X2.5 20#20 8.0', unit: 'רשת', warehouse: '4_HARASH' },
  '1612600': { name: 'ברזל בניין 12 מ"מ 6 מ.א.', unit: 'מוט', warehouse: '4_HARASH' },
  '1614600': { name: 'ברזל בניין 14 מ"מ 6 מ.א.', unit: 'מוט', warehouse: '4_HARASH' },
  '14075': { name: 'טיח גבס MP75 קנאוף שק 25 ק"ג', unit: 'שק', warehouse: '4_HARASH' },
  '14400': { name: 'טיח תרמי 400 23 ק"ג תרמוקיר', unit: 'שק', warehouse: '4_HARASH' },
  '14603': { name: 'פלסטומר AD603 אפור 25 ק"ג', unit: 'שק', warehouse: '4_HARASH' },
  '15181': { name: 'ריצופית אפור 181 25 ק"ג כרמית', unit: 'שק', warehouse: '4_HARASH' },
  '15090': { name: 'רוקבונד 28 ק"ג', unit: 'שק', warehouse: '1_TALMID' },
  '111260': { name: 'לוח גבס לבן 260 12.5 מ"מ', unit: 'לוח', warehouse: '1_TALMID' },
  '112260': { name: 'לוח גבס ירוק 260 12.5 מ"מ (עמיד לחות)', unit: 'לוח', warehouse: '1_TALMID' },
  '114260': { name: 'לוח גבס כחול 260 12.5 מ"מ (עמיד אש/קול)', unit: 'לוח', warehouse: '1_TALMID' },
  '111200': { name: 'לוח גבס לבן 200 12.5 מ"מ', unit: 'לוח', warehouse: '1_TALMID' },
  '112200': { name: 'לוח גבס ירוק 200 12.5 מ"מ', unit: 'לוח', warehouse: '1_TALMID' },
  '9550300': { name: 'ניצב 50/300 0.6 מ"מ', unit: 'יח\'', warehouse: '1_TALMID' },
  '8550300': { name: 'מסלול 50/300 0.6 מ"מ', unit: 'יח\'', warehouse: '1_TALMID' },
  '75300': { name: 'ניצב אומגה תקן 300', unit: 'יח\'', warehouse: '1_TALMID' },
  '55122': { name: 'קלסימו 5 ק"ג טמבור', unit: 'שק', warehouse: '1_TALMID' },
  '15805': { name: 'סיקה לסטיק 1K דלי 17 ק"ג SIKA', unit: 'דלי', warehouse: '1_TALMID' },
  '19107': { name: 'סיקה 107 אפור + תוסף 25 ק"ג', unit: 'ערכה', warehouse: '1_TALMID' },
  '60002': { name: 'שק גדול פקדון (בלה)', unit: 'פקדון', warehouse: '4_HARASH' },
  '60060': { name: 'משטח סבן פקדון', unit: 'פקדון', warehouse: '4_HARASH' },
  '60006': { name: 'משטח בלוקים פקדון', unit: 'פקדון', warehouse: '4_HARASH' },
  '60018': { name: 'משטח 120X80 EURO פקדון', unit: 'פקדון', warehouse: '4_HARASH' },
  '18055': { name: 'הובלת מנוף כפר סבא - רעננה', unit: 'הובלה', warehouse: '4_HARASH' },
  '18050': { name: 'הובלת מנוף הוד השרון', unit: 'הובלה', warehouse: '4_HARASH' },
  '18060': { name: 'הובלת מנוף הרצליה - רמת השרון', unit: 'הובלה', warehouse: '4_HARASH' },
  '18070': { name: 'הובלת מנוף תל אביב מרכז', unit: 'הובלה', warehouse: '4_HARASH' },
  '18075': { name: 'הובלת מנוף רמת גן - גבעתיים', unit: 'הובלה', warehouse: '4_HARASH' },
  '818050': { name: 'הובלה ללא פריקה הוד השרון', unit: 'הובלה', warehouse: '1_TALMID' }
};

export const TIME_SLOTS = [
  '07:00 - 08:30',
  '08:30 - 10:00',
  '10:00 - 11:30',
  '11:30 - 13:00',
  '13:00 - 14:30',
  '14:30 - 16:00',
  '16:00 - 17:30'
];
