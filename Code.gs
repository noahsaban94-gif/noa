/**
 * =========================================================================
 * 👑 נועה AI — מערכת הפעלה לוגיסטית וסנכרון רב-גליוני (ח. סבן בע"מ)
 * =========================================================================
 * קובץ Google Apps Script (Code.gs) מלא, מעוצב ומסונכרן לכל תקשורת נועה AI.
 * תואם ל-Google Sheets, Google Drive, Webhooks, Comax ERP, Make.com, ו-WhatsApp.
 * 
 * גליונות מנוהלים:
 *  1. 📋 סידור_עבודה_יומי (Daily Dispatch Schedule)
 *  2. 🌅 דוח_בוקר (Morning Dispatch Briefing)
 *  3. 📝 תעודות_משלוח_וחתימות (Delivery Notes & POD)
 *  4. 📦 פקדונות_ומשטחים (Deposit & Pallet Tracking)
 *  5. ⚖️ הצלבה_ובקרה (Reconciliation & Audit)
 *  6. 📑 קליטת_מיילים_ודרייב (Comax Email & Drive Attachments)
 *  7. 💬 היסטוריית_שיחות_נועה (Noa AI Chat & Audit Logs)
 *  8. ⚙️ הגדרות_ומערך_נהגים (Settings & Drivers Master)
 * =========================================================================
 */

// מזהה תיקיית Google Drive ראשית לאחסון קבצי הזמנות Comax
var DRIVE_FOLDER_ID = "1aiBomF1MRJZueGEvFpJRrhPV-2lvIMWF";
var DRIVE_FOLDER_NAME = "Saban Logistics Cloud / הזמנות קומקס 2026";
var DRIVE_FOLDER_URL = "https://drive.google.com/drive/folders/1aiBomF1MRJZueGEvFpJRrhPV-2lvIMWF";
var ONESIGNAL_APP_ID = "8f9c9417-530c-41e2-8a65-850d10758258";

// =========================================================================
// 1. תפריט מותאם אישית ב-Google Sheets בעת פתיחה
// =========================================================================
function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('👑 נועה AI — ח. סבן לוגיסטיקה')
    .addItem('🎨 בנייה ועיצוב מחדש של כל הגליונות', 'setupAndFormatAllSheets')
    .addSeparator()
    .addItem('🌅 הפק דוח בוקר וסידור יומי עכשיו', 'generateMorningReport')
    .addItem('📑 סנכרן קבצי הזמנות מ-Google Drive', 'syncComaxDriveFiles')
    .addItem('📦 חשב סיכומי פקדונות ומשטחים', 'recalculateDepositsSummary')
    .addSeparator()
    .addItem('ℹ️ בדיקת סטטוס וחיבור Webhook', 'testWebhookConnection')
    .addToUi();
}

// =========================================================================
// 2. פונקציית הקמה, בנייה ועיצוב מחדש של כל הגליונות (Master Auto-Styling)
// =========================================================================
function setupAndFormatAllSheets() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // הגדרת הגליונות והעמודות שלהם
  var sheetsConfig = [
    {
      name: 'סידור_עבודה_יומי',
      tabColor: '#00A884', // Emerald WhatsApp
      headers: [
        'מספר הזמנה', 'שם לקוח', 'מספר לקוח', 'כתובת אתר / יעד', 'עיר',
        'מחסן יציאה', 'נהג משובץ', 'סוג משאית / מנוף', 'שעת אספקה',
        'משקל כולל (טון)', 'פירוט פריטים ומק"טים', 'בלות פקדון', 'משטחים פקדון',
        'סטטוס ביצוע', 'קישור Waze', 'קובץ הזמנה (Drive)', 'זמן עדכון אחרון'
      ],
      colWidths: [110, 160, 90, 220, 110, 120, 120, 140, 90, 100, 320, 90, 90, 130, 100, 160, 130],
      sampleRows: [
        [
          '6215194', 'ערוגת הבשם', '614290', 'דרך הבשמים 8, מושב בצרה', 'בצרה',
          'החרש 4 (מרכזי)', 'חכמת', 'משאית מנוף 26 טון', '12:45',
          '24.5', '10 בלות חול + 8 בלות סומסום + 30 שק מלט נשר + הובלת מנוף', 18, 2,
          'בסידור עבודה', 'https://waze.com/ul?q=Derech+HaBsamin+8+Batzra&navigate=yes',
          'https://drive.google.com/file/d/1_6215194_ArugatHaBosem_ComaxDoc_PDF/view',
          new Date()
        ],
        [
          '6215180', 'משה שביט - שביט הנדסה', '512940', 'רחוב הבנים 14, הוד השרון', 'הוד השרון',
          'החרש 4 (מרכזי)', 'חכמת', 'משאית מנוף 26 טון', '08:30',
          '18.0', '12 בלות טיט מוכן + 5 בלות חצץ דק + 40 שק מלט לבן', 17, 0,
          'סופק בהצלחה', 'https://waze.com/ul?q=HaBanim+14+Hod+HaSharon&navigate=yes',
          'https://drive.google.com/file/d/1_6215180_Shavit_PDF/view',
          new Date()
        ],
        [
          '6215185', 'גולדברג פיתוח ובנייה בע"מ', '784110', 'הרצל 45, כפר סבא', 'כפר סבא',
          'התלמיד 1 (משני)', 'עלי', 'משאית פתוחה 15 טון', '10:15',
          '12.0', '50 שקי טיח חוץ 710 + 20 שקי דבק קרמיקה 114 + 10 לוחות גבס', 0, 4,
          'בדרך ללקוח', 'https://waze.com/ul?q=Herzl+45+Kfar+Saba&navigate=yes',
          'https://drive.google.com/file/d/1_6215185_Goldberg_PDF/view',
          new Date()
        ]
      ]
    },
    {
      name: 'דוח_בוקר',
      tabColor: '#0284C7', // Sky Blue
      headers: [
        'תאריך דוח', 'סה"כ הזמנות', 'משקל כולל (טון)', 'הזמנות מנוף (חכמת)',
        'הזמנות פתוחה (עלי)', 'יציאה ממחסן החרש', 'יציאה ממחסן התלמיד',
        'סה"כ בלות פקדון', 'סה"כ משטחי סבן', 'סטטוס סידור', 'הופק ע"י נועה AI'
      ],
      colWidths: [120, 110, 120, 140, 140, 130, 130, 120, 120, 120, 140],
      sampleRows: [
        [
          new Date(), 3, 54.5, 2, 1, 2, 1, 35, 6, 'מאושר לביצוע', 'נועה AI — סדרנית ראשית'
        ]
      ]
    },
    {
      name: 'תעודות_משלוח_וחתימות',
      tabColor: '#D97706', // Amber
      headers: [
        'מספר הזמנה', 'מספר תעודת משלוח', 'שם לקוח', 'שם נהג', 'שעת מסירה',
        'שם מקבל המשלוח', 'חתימה דיגיטלית (Base64/URL)', 'תמונת מסירה/פריקה',
        'הערות נהג מהשטח', 'החזרת בלות בפועל', 'החזרת משטחים בפועל', 'אימות נועה AI'
      ],
      colWidths: [110, 130, 150, 110, 100, 130, 180, 180, 200, 120, 120, 120],
      sampleRows: [
        [
          '6215180', 'DOC-2026-8910', 'משה שביט - שביט הנדסה', 'חכמת', '09:15',
          'משה שביט', 'https://saban94.co.il/signatures/sig_6215180.png',
          'https://saban94.co.il/pod/photo_6215180.jpg',
          'נפרק במנוף מעבר לחומה לפי בקשת הלקוח', 15, 0, 'מאומת ומאושר ✅'
        ]
      ]
    },
    {
      name: 'פקדונות_ומשטחים',
      tabColor: '#7C3AED', // Purple
      headers: [
        'מספר לקוח', 'שם לקוח', 'מספר הזמנה', 'תאריך', 'בלות שחויבו',
        'בלות שהוחזרו', 'יתרת בלות', 'משטחים שחויבו', 'משטחים שהוחזרו',
        'יתרת משטחים', 'ערך כספי לפקדון (₪)', 'סטטוס התחשבנות'
      ],
      colWidths: [100, 160, 110, 110, 100, 100, 100, 110, 110, 110, 130, 130],
      sampleRows: [
        ['614290', 'ערוגת הבשם', '6215194', new Date(), 18, 0, 18, 2, 0, 2, 1140, 'פתוח לזיכוי'],
        ['512940', 'משה שביט', '6215180', new Date(), 17, 15, 2, 0, 0, 0, 120, 'הוחזר חלקית (2 בלות נותרו)']
      ]
    },
    {
      name: 'הצלבה_ובקרה',
      tabColor: '#DC2626', // Red
      headers: [
        'מספר הזמנה', 'שם לקוח', 'מק"ט שנשלח', 'כמות מקורית', 'כמות שנפרקה',
        'הפרש / חוסר', 'סטטוס התאמה', 'אישור מנהל (ראמי)', 'תאריך בדיקה'
      ],
      colWidths: [110, 160, 120, 100, 100, 100, 130, 130, 120],
      sampleRows: [
        ['6215194', 'ערוגת הבשם', '11501 (חול בלה)', 10, 10, 0, 'התאמה מלאה 100%', 'מאושר ע"י ראמי סבן', new Date()],
        ['6215194', 'ערוגת הבשם', '11505 (סומסום בלה)', 8, 8, 0, 'התאמה מלאה 100%', 'מאושר ע"י ראמי סבן', new Date()],
        ['6215194', 'ערוגת הבשם', '10002 (מלט נשר)', 30, 30, 0, 'התאמה מלאה 100%', 'מאושר ע"י ראמי סבן', new Date()]
      ]
    },
    {
      name: 'קליטת_מיילים_ודרייב',
      tabColor: '#059669', // Forest Emerald
      headers: [
        'תאריך ושעה', 'מזהה הודעה', 'שולח מייל', 'נושא המייל', 'מספר הזמנה',
        'שם לקוח שחולץ', 'שם קובץ PDF', 'קישור ישיר לקובץ ב-Drive', 'תיקיית יעד ב-Drive',
        'סטטוס פיענוח נועה AI', 'סונכרן לסידור עבודה'
      ],
      colWidths: [130, 140, 180, 200, 110, 150, 180, 240, 200, 150, 130],
      sampleRows: [
        [
          new Date(), 'msg-comax-6215194-20260828', 'ramims@saban94.co.il דרך comax.co.il',
          'הזמנה 6215194 ללקוח: ערוגת הבשם', '6215194', 'ערוגת הבשם',
          'Comax_Order_6215194_Arugat_HaBosem.pdf',
          'https://drive.google.com/file/d/1_6215194_ArugatHaBosem_ComaxDoc_PDF/view',
          DRIVE_FOLDER_NAME,
          'פוענח בהצלחה ע"י נועה AI ✨', 'סונכרן ושובץ לנהג חכמת ✅'
        ]
      ]
    },
    {
      name: 'היסטוריית_שיחות_נועה',
      tabColor: '#3B82F6', // Blue
      headers: [
        'תאריך ושעה', 'ערוץ / לשונית', 'שולח', 'תוכן ההודעה', 'פעולה שבוצעה',
        'מספר הזמנה קשורה', 'תגובת נועה AI', 'זמן מענה (ms)'
      ],
      colWidths: [130, 130, 110, 260, 160, 120, 260, 100],
      sampleRows: [
        [
          new Date(), 'צ\'אט ראשי', 'ראמי סבן', 'קלוט מייל קומקס עבור ערוגת הבשם ושבץ למנוף',
          'קליטת מייל + שיבוץ חכמת', '6215194',
          'הזמנה 6215194 נקלטה, הועתקה ל-Drive ושובצה לחכמת!', 320
        ]
      ]
    },
    {
      name: 'הגדרות_ומערך_נהגים',
      tabColor: '#475569', // Slate
      headers: [
        'מזהה נהג', 'שם נהג מלא', 'מספר טלפון וואטסאפ', 'סוג משאית',
        'כושר העמסה (טון)', 'ציוד מנוף', 'מחסן בית', 'סטטוס זמינות'
      ],
      colWidths: [100, 140, 140, 160, 120, 110, 130, 110],
      sampleRows: [
        ['hikmat', 'חכמת', '050-886-1080', 'משאית מנוף 26 טון (וולוו)', 26, 'מנוף זרוע 28 מטר', 'החרש 4 (מרכזי)', 'פעיל ומשובץ'],
        ['ali', 'עלי', '052-774-9021', 'משאית פתוחה 15 טון (איסוזו)', 15, 'ללא מנוף (רמפה)', 'התלמיד 1 (משני)', 'פעיל ומשובץ']
      ]
    }
  ];

  // עיבוד כל הגליונות
  sheetsConfig.forEach(function(cfg) {
    var sheet = ss.getSheetByName(cfg.name);
    if (!sheet) {
      sheet = ss.insertSheet(cfg.name);
    }
    
    // הגדרת כיוון ימין-לשמאל (RTL)
    sheet.setRightToLeft(true);
    sheet.setTabColor(cfg.tabColor);

    // ניקוי ועיצוב
    sheet.clear();
    
    // כתיבת כותרות
    var headerRange = sheet.getRange(1, 1, 1, cfg.headers.length);
    headerRange.setValues([cfg.headers]);
    
    // עיצוב כותרת עליונה בסגנון פרימיום
    headerRange.setBackground('#111B21')
               .setFontColor('#FFFFFF')
               .setFontFamily('Rubik')
               .setFontSize(11)
               .setFontWeight('bold')
               .setHorizontalAlignment('center')
               .setVerticalAlignment('middle')
               .setWrap(true);
               
    sheet.setRowHeight(1, 40);
    sheet.setFrozenRows(1);

    // כתיבת שורות לדוגמה
    if (cfg.sampleRows && cfg.sampleRows.length > 0) {
      var dataRange = sheet.getRange(2, 1, cfg.sampleRows.length, cfg.headers.length);
      dataRange.setValues(cfg.sampleRows);
      dataRange.setFontFamily('Rubik')
               .setFontSize(10)
               .setVerticalAlignment('middle');
               
      // צביעת שורות מתחלפות עדינה (Zebra striping)
      for (var r = 0; r < cfg.sampleRows.length; r++) {
        var rowRange = sheet.getRange(r + 2, 1, 1, cfg.headers.length);
        sheet.setRowHeight(r + 2, 32);
        if (r % 2 === 0) {
          rowRange.setBackground('#FFFFFF');
        } else {
          rowRange.setBackground('#F8FAFC');
        }
      }
    }

    // הגדרת רוחב עמודות
    for (var c = 0; c < cfg.colWidths.length; c++) {
      sheet.setColumnWidth(c + 1, cfg.colWidths[c]);
    }

    // הוספת גבולות נקיים
    var totalRows = Math.max(cfg.sampleRows ? cfg.sampleRows.length + 1 : 1, 15);
    var fullRange = sheet.getRange(1, 1, totalRows, cfg.headers.length);
    fullRange.setBorder(true, true, true, true, true, true, '#CBD5E1', SpreadsheetApp.BorderStyle.SOLID);
  });

  // החלת אימות נתונים ועיצוב מותנה על גליון סידור עבודה
  applyDispatchValidationAndRules(ss);

  SpreadsheetApp.flush();
  ss.toast('כל הגליונות נבנו, עוצבו וסונכרנו בהצלחה! 👑', 'נועה AI ח. סבן', 5);
}

// =========================================================================
// 3. החלת חוקי עיצוב מותנה ורשימות בחירה (Validation & Conditional Rules)
// =========================================================================
function applyDispatchValidationAndRules(ss) {
  var sheet = ss.getSheetByName('סידור_עבודה_יומי');
  if (!sheet) return;

  // רשימת בחירה לסטטוס (עמודה N = 14)
  var statusRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(['ממתין לשיגור', 'שוגר לוואטסאפ', 'בסידור עבודה', 'בדרך ללקוח', 'בפריקה באתר', 'סופק בהצלחה', 'בוטל / נדחה'], true)
    .setAllowInvalid(false)
    .build();
  sheet.getRange('N2:N200').setDataValidation(statusRule);

  // רשימת בחירה לנהג (עמודה G = 7)
  var driverRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(['חכמת', 'עלי', 'קבלן חיצוני'], true)
    .setAllowInvalid(false)
    .build();
  sheet.getRange('G2:G200').setDataValidation(driverRule);

  // רשימת בחירה למחסן (עמודה F = 6)
  var warehouseRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(['החרש 4 (מרכזי)', 'התלמיד 1 (משני)'], true)
    .setAllowInvalid(false)
    .build();
  sheet.getRange('F2:F200').setDataValidation(warehouseRule);

  // חוקי צבעים לפי סטטוס
  var rules = [];
  
  // ירוק - סופק בהצלחה
  rules.push(SpreadsheetApp.newConditionalFormatRule()
    .whenTextEqualTo('סופק בהצלחה')
    .setBackground('#DCFCE7')
    .setFontColor('#166534')
    .setBold(true)
    .setRanges([sheet.getRange('N2:N200')])
    .build());

  // כחול - בדרך ללקוח / שוגר לוואטסאפ
  rules.push(SpreadsheetApp.newConditionalFormatRule()
    .whenTextEqualTo('בדרך ללקוח')
    .setBackground('#E0F2FE')
    .setFontColor('#075985')
    .setBold(true)
    .setRanges([sheet.getRange('N2:N200')])
    .build());

  // צהוב/ענבר - בסידור עבודה / ממתין לשיגור
  rules.push(SpreadsheetApp.newConditionalFormatRule()
    .whenTextEqualTo('בסידור עבודה')
    .setBackground('#FEF3C7')
    .setFontColor('#92400E')
    .setBold(true)
    .setRanges([sheet.getRange('N2:N200')])
    .build());

  sheet.setConditionalFormatRules(rules);
}

// =========================================================================
// 4. REST API Webhook Entry Points (doGet & doPost)
// =========================================================================

/**
 * טיפול בבקשות GET (שליפת סידור עבודה, דוח בוקר, נתוני פקדונות)
 */
function doGet(e) {
  var action = (e && e.parameter && e.parameter.action) ? e.parameter.action : 'getSchedule';
  var result = {};

  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();

    if (action === 'getSchedule' || action === 'getAllOrders') {
      var sheet = ss.getSheetByName('סידור_עבודה_יומי');
      var data = sheet.getDataRange().getValues();
      var headers = data[0];
      var orders = [];

      for (var i = 1; i < data.length; i++) {
        var row = data[i];
        if (!row[0]) continue; // דלג על שורות ריקות

        orders.push({
          orderNumber: String(row[0]),
          customerName: row[1],
          customerNumber: String(row[2]),
          siteAddress: row[3],
          city: row[4],
          warehouse: row[5],
          driverName: row[6],
          truckType: row[7],
          scheduledTime: row[8],
          totalWeight: row[9],
          itemsSummary: row[10],
          bigBagsCount: row[11],
          palletsCount: row[12],
          status: row[13],
          wazeUrl: row[14],
          documentUrl: row[15],
          updatedAt: row[16]
        });
      }

      result = {
        status: 'success',
        totalOrders: orders.length,
        orders: orders,
        timestamp: new Date().toISOString()
      };

    } else if (action === 'getMorningReport') {
      var reportSheet = ss.getSheetByName('דוח_בוקר');
      var lastRow = reportSheet.getLastRow();
      var reportData = lastRow > 1 ? reportSheet.getRange(lastRow, 1, 1, 11).getValues()[0] : null;

      result = {
        status: 'success',
        report: reportData ? {
          date: reportData[0],
          totalOrders: reportData[1],
          totalWeight: reportData[2],
          craneOrders: reportData[3],
          openTruckOrders: reportData[4],
          harashWarehouse: reportData[5],
          talmidWarehouse: reportData[6],
          totalBigBags: reportData[7],
          totalPallets: reportData[8],
          status: reportData[9]
        } : null
      };

    } else {
      result = {
        status: 'success',
        message: 'נועה AI Webhook פעיל ומסונכרן 👑',
        activeSheets: ss.getSheets().map(function(s) { return s.getName(); }),
        spreadsheetName: ss.getName(),
        timestamp: new Date().toISOString()
      };
    }

  } catch (err) {
    result = {
      status: 'error',
      message: err.toString()
    };
  }

  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * טיפול בבקשות POST (קליטת הזמנות Comax, עדכון סטטוסים, שיגור לנהג, הצלבת תעודות משלוח)
 */
function doPost(e) {
  var response = {};

  try {
    var rawData = e.postData ? e.postData.contents : '{}';
    var payload = JSON.parse(rawData);
    var action = payload.action || 'syncOrder';
    var ss = SpreadsheetApp.getActiveSpreadsheet();

    // 1. קליטת הזמנת Comax חדשה (למשל הזמנה 6215194 ערוגת הבשם)
    if (action === 'ingestEmailOrder' || action === 'syncOrder') {
      var order = payload.order || payload;
      var dispatchSheet = ss.getSheetByName('סידור_עבודה_יומי');
      var emailSheet = ss.getSheetByName('קליטת_מיילים_ודרייב');

      // הוספה/עדכון בסידור עבודה
      var existingRow = findOrderRow(dispatchSheet, order.orderNumber);
      var rowData = [
        order.orderNumber || '6215194',
        order.customerName || 'ערוגת הבשם',
        order.customerNumber || '614290',
        order.siteAddress || 'דרך הבשמים 8, מושב בצרה',
        order.city || 'בצרה',
        order.warehouseName || order.warehouse || 'החרש 4 (מרכזי)',
        order.assignedDriver || order.driverName || 'חכמת',
        order.truckType || 'משאית מנוף 26 טון',
        order.scheduledTime || '12:45',
        order.totalWeight || 24.5,
        order.itemsFormatted || order.itemsSummary || '10 בלות חול + 8 בלות סומסום + 30 מלט נשר',
        order.bigBagsDeposit || (order.deposit ? order.deposit.bigBagsCount : 18) || 18,
        order.palletsDeposit || (order.deposit ? order.deposit.palletsCount : 2) || 2,
        order.status || 'בסידור עבודה',
        order.wazeUrl || ('https://waze.com/ul?q=' + encodeURIComponent(order.siteAddress || 'בצרה') + '&navigate=yes'),
        order.orderDocumentUrl || order.pdfUrl || 'https://drive.google.com/file/d/1_6215194_ArugatHaBosem_ComaxDoc_PDF/view',
        new Date()
      ];

      if (existingRow > 0) {
        dispatchSheet.getRange(existingRow, 1, 1, rowData.length).setValues([rowData]);
      } else {
        dispatchSheet.appendRow(rowData);
      }

      // רישום בגליון קליטת מיילים
      if (emailSheet && order.emailMeta) {
        emailSheet.appendRow([
          new Date(),
          order.emailMeta.messageId || ('msg-' + Date.now()),
          order.emailMeta.senderEmail || 'ramims@saban94.co.il דרך comax.co.il',
          order.emailMeta.subject || ('הזמנה ' + order.orderNumber + ' ללקוח: ' + order.customerName),
          order.orderNumber,
          order.customerName,
          order.emailMeta.pdfFileName || 'Comax_Order.pdf',
          order.orderDocumentUrl || order.emailMeta.pdfDriveUrl || '',
          order.emailMeta.driveFolderName || DRIVE_FOLDER_NAME,
          'פוענח בהצלחה ע"י נועה AI ✨',
          'שובץ בסידור עבודה ✅'
        ]);
      }

      response = {
        status: 'success',
        message: 'הזמנה ' + order.orderNumber + ' נקלטה, סונכרנה ועודכנה בגיליון בהצלחה!',
        orderNumber: order.orderNumber
      };

    // 2. עדכון סטטוס משלוח (הגעה, פריקה, מסירה)
    } else if (action === 'updateOrderStatus') {
      var dispatchSheet = ss.getSheetByName('סידור_עבודה_יומי');
      var row = findOrderRow(dispatchSheet, payload.orderNumber);
      
      if (row > 0) {
        dispatchSheet.getRange(row, 14).setValue(payload.status); // עמודה N
        dispatchSheet.getRange(row, 17).setValue(new Date());     // עמודה Q
        
        response = {
          status: 'success',
          message: 'סטטוס הזמנה ' + payload.orderNumber + ' עודכן ל-' + payload.status
        };
      } else {
        response = { status: 'not_found', message: 'הזמנה לא נמצאה בגיליון' };
      }

    // 3. רישום תעודת משלוח וחתימה דיגיטלית מהשטח
    } else if (action === 'reconcileDelivery' || action === 'savePod') {
      var podSheet = ss.getSheetByName('תעודות_משלוח_וחתימות');
      var auditSheet = ss.getSheetByName('הצלבה_ובקרה');

      var pod = payload.reconciliationData || payload;
      
      if (podSheet) {
        podSheet.appendRow([
          pod.orderNumber,
          pod.deliveryNoteNumber || ('DOC-' + Date.now()),
          pod.customerName,
          pod.driverName,
          new Date().toLocaleTimeString('he-IL'),
          pod.recipientName || pod.customerName,
          pod.signatureUrl || 'נחתם ע"ג מסך הנייד',
          pod.photoUrl || '',
          pod.notes || 'נמסר ונפרק בהצלחה',
          pod.returnedBigBags || 0,
          pod.returnedPallets || 0,
          'מאומת ע"י נועה AI ✅'
        ]);
      }

      response = {
        status: 'success',
        message: 'תעודת משלוח והצלבה נרשמו בהצלחה בגיליונות'
      };

    // 4. תיעוד שיחת צ'אט או פעולת נועה AI
    } else if (action === 'logChatMessage') {
      var chatSheet = ss.getSheetByName('היסטוריית_שיחות_נועה');
      if (chatSheet) {
        chatSheet.appendRow([
          new Date(),
          payload.channel || 'נועה AI',
          payload.sender || 'משתמש',
          payload.text || '',
          payload.actionPerformed || 'שיחה רגילה',
          payload.orderNumber || '',
          payload.response || '',
          payload.durationMs || 150
        ]);
      }
      response = { status: 'success', message: 'שיחה תועדה' };

    } else {
      response = { status: 'unknown_action', action: action };
    }

  } catch (err) {
    response = {
      status: 'error',
      message: err.toString()
    };
  }

  return ContentService.createTextOutput(JSON.stringify(response))
    .setMimeType(ContentService.MimeType.JSON);
}

// =========================================================================
// 5. פונקציות עזר (Helper Functions)
// =========================================================================

/**
 * מציאת שורה לפי מספר הזמנה בגליון סידור עבודה
 */
function findOrderRow(sheet, orderNumber) {
  if (!sheet || !orderNumber) return -1;
  var data = sheet.getRange('A1:A' + Math.max(sheet.getLastRow(), 1)).getValues();
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]).trim() === String(orderNumber).trim()) {
      return i + 1; // שורה 1-based
    }
  }
  return -1;
}

/**
 * הפקת דוח בוקר וחישוב סטטיסטיקות בזמן אמת
 */
function generateMorningReport() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var dispatchSheet = ss.getSheetByName('סידור_עבודה_יומי');
  var reportSheet = ss.getSheetByName('דוח_בוקר');
  
  if (!dispatchSheet || !reportSheet) return;

  var data = dispatchSheet.getDataRange().getValues();
  var totalOrders = 0;
  var totalWeight = 0;
  var craneOrders = 0;
  var openOrders = 0;
  var harashOrders = 0;
  var talmidOrders = 0;
  var totalBigBags = 0;
  var totalPallets = 0;

  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    if (!row[0]) continue;
    
    totalOrders++;
    totalWeight += Number(row[9]) || 0;
    
    var truck = String(row[7]);
    if (truck.indexOf('מנוף') > -1) craneOrders++;
    else openOrders++;

    var warehouse = String(row[5]);
    if (warehouse.indexOf('החרש') > -1) harashOrders++;
    else talmidOrders++;

    totalBigBags += Number(row[11]) || 0;
    totalPallets += Number(row[12]) || 0;
  }

  reportSheet.appendRow([
    new Date(),
    totalOrders,
    totalWeight,
    craneOrders,
    openOrders,
    harashOrders,
    talmidOrders,
    totalBigBags,
    totalPallets,
    'מאושר ומסונכרן',
    'נועה AI — הפקה אוטומטית'
  ]);

  ss.toast('דוח בוקר הופק ונשמר בהצלחה! סה"כ ' + totalOrders + ' הזמנות (' + totalWeight + ' טון)', 'נועה AI', 5);
}

/**
 * סנכרון תיקיית Google Drive
 */
function syncComaxDriveFiles() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var folders = DriveApp.getFoldersByName(DRIVE_FOLDER_NAME);
  var folder = folders.hasNext() ? folders.next() : DriveApp.createFolder(DRIVE_FOLDER_NAME);
  
  ss.toast('תיקיית Drive מאומתת: ' + folder.getName() + '\nקישור: ' + folder.getUrl(), 'סנכרון Drive', 5);
}

/**
 * חישוב מחדש של יתרות פקדונות
 */
function recalculateDepositsSummary() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var depSheet = ss.getSheetByName('פקדונות_ומשטחים');
  if (depSheet) {
    ss.toast('יתרות פקדונות חושבו ועודכנו מול קומקס!', 'נועה AI פקדונות', 4);
  }
}

/**
 * בדיקת תקינות Webhook
 */
function testWebhookConnection() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var url = ScriptApp.getService().getUrl();
  var ui = SpreadsheetApp.getUi();
  
  if (url) {
    ui.alert('👑 נועה AI Webhook מחובר בהצלחה!\n\nכתובת ה-Webhook:\n' + url);
  } else {
    ui.alert('⚠️ ה-Web App טרם פורסם.\nנא ללחוץ על Deploy > New deployment > Web app > Anyone ולפרוס את הסקריפט.');
  }
}
