/**
 * Old Escondido Community Yard Sale — registration receiver.
 *
 * Paste this into the Apps Script editor of the Google Sheet that should collect
 * registrations (Extensions → Apps Script), then deploy it as a Web App.
 * Full step-by-step is in README.md under "Wire up the form".
 *
 * The website POSTs the form to this script; this script appends a row.
 */

/** Tab the rows land in. Created automatically if it doesn't exist. */
const SHEET_NAME = 'Registrations';

/** Get an email on every registration. Set to '' to turn notifications off. */
const NOTIFY_EMAIL = 'GarageSaleOldEscondido@gmail.com';

const HEADERS = [
  'Registered at',
  'First name',
  'Last name',
  'Street address',
  'Email',
  'Mostly selling',
  'Wants event news',
  'Needs a yard sign',
  'Asked about selling their home',
];

function doPost(e) {
  // Two people submitting at the same instant would otherwise overwrite a row.
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const sheet = getSheet_();
    const p = (e && e.parameter) || {};
    const tick = (v) => (v ? 'Yes' : '');

    sheet.appendRow([
      new Date(),
      p.first || '',
      p.last || '',
      p.street || '',
      p.email || '',
      p.cat || '',
      tick(p.optin_events),
      tick(p.needs_yard_sign),
      tick(p.selling_interest),
    ]);

    notify_(p);
    return json_({ ok: true });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

/** Lets you open the deployed URL in a browser to confirm it is live. */
function doGet() {
  return HtmlService.createHtmlOutput(
    '<p style="font:16px system-ui">Old Escondido Yard Sale registration endpoint is live.</p>'
  );
}

function getSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) sheet = ss.insertSheet(SHEET_NAME);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.getRange(1, 1, 1, HEADERS.length)
      .setFontWeight('bold')
      .setBackground('#d7e8f6')
      .setFontColor('#0b5884');
    sheet.setFrozenRows(1);
    sheet.setColumnWidth(1, 160);
    sheet.setColumnWidth(4, 200);
    sheet.setColumnWidth(5, 220);
    sheet.setColumnWidth(6, 200);
  }
  return sheet;
}

function notify_(p) {
  if (!NOTIFY_EMAIL) return;
  try {
    MailApp.sendEmail({
      to: NOTIFY_EMAIL,
      subject: 'Yard sale registration — ' + (p.street || 'new address'),
      body: [
        (p.first || '') + ' ' + (p.last || ''),
        p.street || '',
        p.email || '',
        'Mostly selling: ' + (p.cat || '—'),
        '',
        'Wants event news: ' + (p.optin_events ? 'yes' : 'no'),
        'Needs a yard sign: ' + (p.needs_yard_sign ? 'yes' : 'no'),
        'Asked about selling their home: ' + (p.selling_interest ? 'yes' : 'no'),
      ].join('\n'),
    });
  } catch (err) {
    // A mail quota problem must never cost us the registration row.
    console.warn('notify failed: ' + err);
  }
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Run this once from the editor (Run → setup) to create the tab and headers
 * before your first real registration. Optional.
 */
function setup() {
  getSheet_();
  SpreadsheetApp.getUi().alert('Ready. The "' + SHEET_NAME + '" tab is set up.');
}
