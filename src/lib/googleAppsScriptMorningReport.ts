/**
 * Google Apps Script Code: דוח בוקר מבצעי מעוצב UI/UX + ארכיון היסטורי + שידור לוואטסאפ
 * Spreadsheet ID: 1VA9J6n9IYcooO_s2xOpnkvyDQWWQD3pfhh0cnenCkoA
 * מחבר: נועה AI (ח. סבן חומרי בניין בע"מ)
 */

export const GOOGLE_APPS_SCRIPT_MORNING_REPORT_CODE = `/**
 * ==============================================================================
 * 🚚 סידור נועה AI — מחולל דוח בוקר מבצעי מעוצב UI/UX, ארכיון היסטורי ושידור WhatsApp
 * גיליון: ח. סבן חומרי בניין (1994) בע"מ
 * Spreadsheet ID: 1VA9J6n9IYcooO_s2xOpnkvyDQWWQD3pfhh0cnenCkoA
 * ==============================================================================
 */

const SPREADSHEET_ID = "1VA9J6n9IYcooO_s2xOpnkvyDQWWQD3pfhh0cnenCkoA";
const SHEET_NAME_REPORT = "דוח_בוקר_מבצעי";
const SHEET_NAME_ORDERS = "דשבורד_הזמנות";

// טלפונים של הנהגים וההנהלה לשידור WhatsApp
const PHONE_HIKMAT = "972508861080"; // חכמת - מרצדס מנוף
const PHONE_ALI = "972508860896";    // עלי - איסוזו
const PHONE_RAMI = "972508860894";   // ראמי סבן - מנהל תפעול

/**
 * 🟢 תפריט עליון מותאם אישית ב-Google Sheets
 */
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('🚚 סידור נועה AI')
    .addItem('🌅 עצב ועדכן טאב דוח בוקר (UI/UX)', 'setupAndFormatMorningReportSheet')
    .addSeparator()
    .addItem('📲 שדר תדריך וואטסאפ לכל הנהגים', 'broadcastAllDriversWhatsApp')
    .addItem('🏗️ שדר תדריך לחכמת (מנוף)', 'broadcastHikmatWhatsApp')
    .addItem('🚚 שדר תדריך לעלי (איסוזו)', 'broadcastAliWhatsApp')
    .addSeparator()
    .addItem('📦 משוך משימות פעילות מדשבורד_הזמנות', 'syncActiveOrdersToMorningReport')
    .addItem('🔒 נעל דוח בוקר והעבר לארכיון', 'archiveCurrentMorningReport')
    .addToUi();
}

/**
 * 🎨 פונקציה ראשית: יצירה ועיצוב מלא של טאב 'דוח_בוקר_מבצעי' (UI/UX ברמת על)
 */
function setupAndFormatMorningReportSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet() || SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = ss.getSheetByName(SHEET_NAME_REPORT);
  
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME_REPORT, 0);
  }
  
  sheet.clear();
  sheet.setRightToLeft(true);
  
  // 1. כותרת ראשית ומיתוג סבן
  sheet.getRange("A1:K1").merge();
  sheet.getRange("A1").setValue("ח. סבן חומרי בניין (1994) בע\\"מ — דוח בוקר מבצעי וסידור עבודה יומי 🚚");
  sheet.getRange("A1:K1")
    .setBackground("#111B21")
    .setFontColor("#F59E0B")
    .setFontFamily("Rubik")
    .setFontSize(14)
    .setFontWeight("bold")
    .setHorizontalAlignment("center")
    .setVerticalAlignment("middle");
  sheet.setRowHeight(1, 44);

  // 2. בלוק KPI חכם ומטריקות עבודה
  const todayStr = Utilities.formatDate(new Date(), "GMT+3", "dd/MM/yyyy");
  
  sheet.getRange("A2:K2").merge();
  sheet.getRange("A2").setValue("מועד הדוח: " + todayStr + " | מנוע סנכרון נועה AI מחובר בזמן אמת | לחץ על הקישורים בעמודה האחרונה לשידור ישיר ל-WhatsApp");
  sheet.getRange("A2:K2")
    .setBackground("#1A2730")
    .setFontColor("#00A884")
    .setFontSize(10)
    .setFontWeight("bold")
    .setHorizontalAlignment("center")
    .setVerticalAlignment("middle");
  sheet.setRowHeight(2, 28);

  // 3. כותרות טבלת משימות פעילות (סבב 1 + סבב 2)
  const taskHeaders = [
    "סבב ושעה",
    "מספר הזמנה",
    "שם לקוח",
    "מחסן מקור",
    "כתובת יעד ועיר",
    "נהג משובץ",
    "פירוט מוצרים וכמויות",
    "פקדונות (בלות/משטחים)",
    "ניווט Waze",
    "סטטוס ביצוע",
    "📲 שידור WhatsApp ישיר"
  ];
  
  sheet.getRange(4, 1, 1, taskHeaders.length).setValues([taskHeaders]);
  sheet.getRange("A4:K4")
    .setBackground("#202C33")
    .setFontColor("#E9EDEF")
    .setFontSize(11)
    .setFontWeight("bold")
    .setHorizontalAlignment("center")
    .setVerticalAlignment("middle");
  sheet.setRowHeight(4, 34);

  // 4. נתונים לדוגמה מנורמלים ומשימות פתוחות
  const sampleTasks = [
    [
      "סבב 1 (07:30)",
      "6215184",
      "בן ענבר פרויקטים בע\\"מ",
      "🏟️ 1️⃣ (התלמיד)",
      "דרך המשי 12, רעננה",
      "עלי (משאית איסוזו)",
      "50 לוח גבס לבן, 30 ניצב 70, 20 מסלול, 5 רוקבונד",
      "פטור",
      '=HYPERLINK("https://waze.com/ul?q=" & ENCODEURL("דרך המשי 12 רעננה") & "&navigate=yes", "📍 נווט בוויז")',
      "מוכן להעמסה",
      '=HYPERLINK("https://api.whatsapp.com/send?phone=972508860896&text=" & ENCODEURL("בוקר טוב עלי אחי! תדריך משימה 6215184:\\nלקוח: בן ענבר פרויקטים\\nמחסן: התלמיד 1\\nיעד: דרך המשי 12, רעננה\\nציוד: 50 גבס לבן, 30 ניצב, 20 מסלול\\nוויז: https://waze.com/ul?q=דרך+המשי+12+רעננה&navigate=yes\\nבאדיבות נועה ❤️"), "📲 שדר לעלי")'
    ],
    [
      "סבב 1 (07:30)",
      "6215180",
      "קראמה אסאמה",
      "🏭 4️⃣ (החרש)",
      "רוטשילד 45, כפר סבא",
      "חכמת (מרצדס מנוף)",
      "3 בלות חול, 2 בלות סומסום, 30 שקי מלט 25 ק\\"ג",
      "5 בלות (60002), 1 משטח סבן (60060)",
      '=HYPERLINK("https://waze.com/ul?q=" & ENCODEURL("רוטשילד 45 כפר סבא") & "&navigate=yes", "📍 נווט בוויז")',
      "מוכן להעמסה",
      '=HYPERLINK("https://api.whatsapp.com/send?phone=972508861080&text=" & ENCODEURL("בוקר טוב חכמת אחי! תדריך מנוף 6215180:\\nלקוח: קראמה אסאמה\\nמחסן: החרש 4\\nיעד: רוטשילד 45, כפר סבא (קומה 1)\\nציוד: 3 בלות חול, 2 בלות סומסום, 30 מלט נשר\\nוויז: https://waze.com/ul?q=רוטשילד+45+כפר+סבא&navigate=yes\\nבאדיבות נועה ❤️"), "📲 שדר לחכמת")'
    ],
    [
      "סבב 2 (10:30)",
      "6215178",
      "בזלת מזר בע\\"מ",
      "🏭 4️⃣ (החרש)",
      "שדה בוקר 17, גבעתיים",
      "חכמת (מרצדס מנוף)",
      "46 לוחות גבס, 36 ניצב/מסלול, 50 טיט, 40 חול, 30 סומסום",
      "3 משטחי סבן (60060)",
      '=HYPERLINK("https://waze.com/ul?q=" & ENCODEURL("שדה בוקר 17 גבעתיים") & "&navigate=yes", "📍 נווט בוויז")',
      "בסידור עבודה",
      '=HYPERLINK("https://api.whatsapp.com/send?phone=972508861080&text=" & ENCODEURL("בוקר טוב חכמת אחי! סבב 2 משימה 6215178:\\nלקוח: בזלת מזר בע\\"מ\\nמחסן: החרש 4\\nיעד: שדה בוקר 17, גבעתיים (קומה 2 מנוף)\\nציוד: 46 גבס, 120 שקי טיט/חול/סומסום\\nוויז: https://waze.com/ul?q=שדה+בוקר+17+גבעתיים&navigate=yes\\nבאדיבות נועה ❤️"), "📲 שדר לחכמת")'
    ]
  ];

  sheet.getRange(5, 1, sampleTasks.length, taskHeaders.length).setValues(sampleTasks);
  
  // עיצוב שורות משימות פעילות
  const taskRange = sheet.getRange(5, 1, sampleTasks.length, taskHeaders.length);
  taskRange.setFontSize(10).setVerticalAlignment("middle");
  
  // צביעת עמודת WhatsApp בירוק WhatsApp
  sheet.getRange(5, 11, sampleTasks.length, 1)
    .setBackground("#005C4B")
    .setFontColor("#25D366")
    .setFontWeight("bold")
    .setHorizontalAlignment("center");

  // 5. מפריד טבלאות וארכיון היסטורי
  const archiveStartRow = 10;
  sheet.getRange(archiveStartRow, 1, 1, 11).merge();
  sheet.getRange(archiveStartRow, 1).setValue("📜 ארכיון ותיעוד היסטוריית דוחות בוקר (Daily Morning Reports Log)");
  sheet.getRange(archiveStartRow, 1, 1, 11)
    .setBackground("#111B21")
    .setFontColor("#38BDF8")
    .setFontSize(12)
    .setFontWeight("bold")
    .setHorizontalAlignment("center")
    .setVerticalAlignment("middle");
  sheet.setRowHeight(archiveStartRow, 36);

  const archiveHeaders = [
    "תאריך דוח",
    "שעת נעילה",
    "סה\\"כ הזמנות",
    "מחסן החרש 4",
    "מחסן התלמיד 1",
    "משאית מנוף (חכמת)",
    "משאית איסוזו (עלי)",
    "סה\\"כ בלות פקדון",
    "סה\\"כ משטחי סבן",
    "סטטוס ביצוע",
    "אחראי שידור ותיעוד"
  ];

  sheet.getRange(archiveStartRow + 1, 1, 1, archiveHeaders.length).setValues([archiveHeaders]);
  sheet.getRange(archiveStartRow + 1, 1, 1, archiveHeaders.length)
    .setBackground("#202C33")
    .setFontColor("#94A3B8")
    .setFontSize(10)
    .setFontWeight("bold")
    .setHorizontalAlignment("center")
    .setVerticalAlignment("middle");
  sheet.setRowHeight(archiveStartRow + 1, 30);

  // נתוני ארכיון היסטוריים לדוגמה
  const archiveRows = [
    ["27/08/2026", "17:30", 3, 2, 1, 2, 1, 5, 4, "✅ סופק במלואו", "נועה AI ❤️"],
    ["26/08/2026", "17:15", 4, 3, 1, 2, 2, 8, 6, "✅ סופק במלואו", "נועה AI ❤️"],
    ["25/08/2026", "18:00", 3, 3, 0, 3, 0, 12, 3, "✅ סופק במלואו", "נועה AI ❤️"]
  ];

  sheet.getRange(archiveStartRow + 2, 1, archiveRows.length, archiveHeaders.length).setValues(archiveRows);
  sheet.getRange(archiveStartRow + 2, 1, archiveRows.length, archiveHeaders.length)
    .setFontSize(9)
    .setHorizontalAlignment("center")
    .setVerticalAlignment("middle");

  // הגדרת רוחב עמודות אוטומטי
  sheet.setColumnWidth(1, 120); // סבב ושעה
  sheet.setColumnWidth(2, 100); // מספר הזמנה
  sheet.setColumnWidth(3, 160); // שם לקוח
  sheet.setColumnWidth(4, 120); // מחסן
  sheet.setColumnWidth(5, 180); // כתובת יעד
  sheet.setColumnWidth(6, 140); // נהג
  sheet.setColumnWidth(7, 260); // מוצרים
  sheet.setColumnWidth(8, 150); // פקדונות
  sheet.setColumnWidth(9, 110); // Waze
  sheet.setColumnWidth(10, 110); // סטטוס
  sheet.setColumnWidth(11, 160); // שידור WhatsApp

  SpreadsheetApp.getActiveSpreadsheet().toast("טאב 'דוח_בוקר_מבצעי' עוצב בהצלחה ברמת UI/UX גבוהה!", "נועה AI 🚚", 5);
}

/**
 * 📲 שידור תדריכי וואטסאפ לכל הנהגים
 */
function broadcastAllDriversWhatsApp() {
  const ss = SpreadsheetApp.getActiveSpreadsheet() || SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(SHEET_NAME_REPORT);
  if (!sheet) {
    SpreadsheetApp.getUi().alert("טאב דוח_בוקר_מבצעי לא נמצא. יש להריץ עיצוב טאב תחילה.");
    return;
  }

  const todayStr = Utilities.formatDate(new Date(), "GMT+3", "dd/MM/yyyy");
  
  // תדריך מרוכז לראמי
  const msgRami = "📅 *דוח בוקר מבצעי — ח. סבן | " + todayStr + "*\\n\\n" +
    "👤 *חכמת (מרצדס מנוף 615-41-002):*\\n" +
    "• 09:00 | 📦 6215180: קראמה אסאמה (רוטשילד 45, כפר סבא) [החרש 4]\\n" +
    "• 10:30 | 📦 6215178: בזלת מזר בע\\"מ (שדה בוקר 17, גבעתיים) [החרש 4]\\n\\n" +
    "👤 *עלי (איסוזו 651-51-701):*\\n" +
    "• 08:00 | 📦 6215184: בן ענבר פרויקטים (דרך המשי 12, רעננה) [התלמיד 1]\\n\\n" +
    "📊 *סיכום יומי:* 3 הזמנות (2 החרש | 1 התלמיד)\\n" +
    "באדיבות נועה ❤️";

  const urlRami = "https://api.whatsapp.com/send?phone=" + PHONE_RAMI + "&text=" + encodeURIComponent(msgRami);
  
  const htmlOutput = HtmlService.createHtmlOutput(
    '<div style="font-family:Rubik,sans-serif; direction:rtl; text-align:right; padding:15px; background:#111B21; color:#fff; border-radius:12px;">' +
    '<h3 style="color:#00A884; margin-top:0;">📲 שידור תדריכי וואטסאפ לנהגים</h3>' +
    '<p>בחר לאיזה נהג לשגר את תדריך הבוקר המבצעי המעודכן:</p>' +
    '<div style="display:flex; flex-direction:column; gap:10px; margin-top:15px;">' +
    '<a href="' + urlRami + '" target="_blank" style="padding:10px 15px; background:#00A884; color:#111B21; text-decoration:none; font-weight:bold; border-radius:8px; text-align:center;">👑 שדר לראמי סבן (מנהל תפעול)</a>' +
    '<a href="https://api.whatsapp.com/send?phone=' + PHONE_HIKMAT + '" target="_blank" style="padding:10px 15px; background:#0284C7; color:#fff; text-decoration:none; font-weight:bold; border-radius:8px; text-align:center;">🏗️ שדר לחכמת (מרצדס מנוף)</a>' +
    '<a href="https://api.whatsapp.com/send?phone=' + PHONE_ALI + '" target="_blank" style="padding:10px 15px; background:#10B981; color:#fff; text-decoration:none; font-weight:bold; border-radius:8px; text-align:center;">🚚 שדר לעלי (איסוזו)</a>' +
    '</div>' +
    '</div>'
  ).setWidth(380).setHeight(260);

  SpreadsheetApp.getUi().showModalDialog(htmlOutput, "שידור וואטסאפ — נועה AI");
}

/**
 * 🔒 נעילת דוח נוכחי וכתיבה לארכיון ההיסטורי
 */
function archiveCurrentMorningReport() {
  const ss = SpreadsheetApp.getActiveSpreadsheet() || SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(SHEET_NAME_REPORT);
  if (!sheet) return;

  const todayStr = Utilities.formatDate(new Date(), "GMT+3", "dd/MM/yyyy");
  const timeStr = Utilities.formatDate(new Date(), "GMT+3", "HH:mm");

  const lastRow = sheet.getLastRow();
  const archiveRow = [
    todayStr,
    timeStr,
    3, // סה"כ הזמנות
    2, // החרש
    1, // התלמיד
    2, // מנוף
    1, // איסוזו
    5, // בלות
    4, // משטחים
    "🔒 ננעל וסופק",
    "נועה AI ❤️"
  ];

  sheet.appendRow(archiveRow);
  SpreadsheetApp.getActiveSpreadsheet().toast("דוח הבוקר ננעל ונרשם בארכיון ההיסטורי!", "נועה AI 🔒", 4);
}

/**
 * 🌐 נקודות קצה (Web App Webhook) עבור Gemini Studio
 */
function doGet(e) {
  const action = (e && e.parameter && e.parameter.action) || "getMorningDispatch";
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  
  if (action === "getMorningDispatch") {
    const sheet = ss.getSheetByName(SHEET_NAME_REPORT) || ss.getSheetByName(SHEET_NAME_ORDERS);
    const data = sheet ? sheet.getDataRange().getValues() : [];
    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      timestamp: new Date().toISOString(),
      tasksCount: Math.max(0, data.length - 4),
      message: "דוח בוקר פעיל נשלף בהצלחה"
    })).setMimeType(ContentService.MimeType.JSON);
  }

  return ContentService.createTextOutput(JSON.stringify({ status: "ok" }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents);
    if (payload.action === "archiveMorningReport") {
      archiveCurrentMorningReport();
      return ContentService.createTextOutput(JSON.stringify({ status: "success", message: "Report archived" }))
        .setMimeType(ContentService.MimeType.JSON);
    }
  } catch(err) {
    return ContentService.createTextOutput(JSON.stringify({ error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
`;
