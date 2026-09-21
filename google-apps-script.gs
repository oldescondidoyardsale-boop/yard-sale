/**
 * Old Escondido Community Yard Sale — registration receiver.
 *
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │ PASTE THIS AS THE *ENTIRE* CONTENTS OF Code.gs                          │
 * │                                                                         │
 * │ In the Apps Script editor, click Code.gs, press Ctrl+A / Cmd+A to       │
 * │ select everything, DELETE it, then paste this whole file in its place.  │
 * │ Do not leave a URL, a filename, or any other text in the file — Apps    │
 * │ Script runs every line, and one stray word breaks the whole endpoint    │
 * │ with an error like "ReferenceError: google is not defined".             │
 * │                                                                         │
 * │ Then: Deploy → Manage deployments → pencil → Version: New version →    │
 * │ Deploy. Saving alone does NOT update the live URL.                      │
 * └─────────────────────────────────────────────────────────────────────────┘
 *
 * The website POSTs the form to this script; this script appends a row.
 */

/** Tab the rows land in. Created automatically if it doesn't exist. */
const SHEET_NAME = 'Registrations';

/**
 * Only needed if this script is NOT attached to a Sheet — i.e. you created it at
 * script.google.com instead of via Extensions → Apps Script inside the Sheet.
 * Paste the long id from your Sheet's URL between the quotes:
 * docs.google.com/spreadsheets/d/THIS_PART_HERE/edit
 * Leave it empty if the script lives inside the Sheet.
 */
const SPREADSHEET_ID = '';

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
  let detail;
  try {
    const sheet = getSheet_();
    detail = 'Connected to "' + sheet.getParent().getName() + '" → tab "' +
      sheet.getName() + '". Rows so far: ' + Math.max(0, sheet.getLastRow() - 1) + '.';
  } catch (err) {
    detail = 'NOT connected to a Sheet yet: ' + err;
  }
  return HtmlService.createHtmlOutput(
    '<p style="font:16px system-ui">Old Escondido Yard Sale registration endpoint is live.</p>' +
    '<p style="font:14px system-ui;color:#555">' + detail + '</p>'
  );
}

function getSheet_() {
  const ss = SPREADSHEET_ID
    ? SpreadsheetApp.openById(SPREADSHEET_ID)
    : SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) {
    throw new Error(
      'No spreadsheet. This script is not attached to a Sheet — either recreate ' +
      'it from the Sheet via Extensions → Apps Script, or set SPREADSHEET_ID at ' +
      'the top of this file.'
    );
  }
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
  const sheet = getSheet_();
  const msg = 'Ready. "' + SHEET_NAME + '" tab is set up in "' +
    sheet.getParent().getName() + '".';
  console.log(msg);
  // getUi() only exists when the editor is opened from the Sheet; never let a
  // missing dialog make a successful setup look like a failure.
  try { SpreadsheetApp.getUi().alert(msg); } catch (err) {}
}
