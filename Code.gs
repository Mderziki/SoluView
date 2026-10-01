/**
 * SoluView website form receiver for Google Apps Script.
 *
 * Setup:
 * 1. Open the Google Sheet with ID below, then Extensions > Apps Script.
 * 2. Replace the default Code.gs with this file.
 * 3. Run initialSetup(), then setupAllSheets(), and approve permissions.
 * 4. Deploy > New deployment > Web app.
 *    Execute as: Me. Who has access: Anyone.
 * 5. Copy the deployed /exec URL into solutions-form.js in the website.
 */

const SPREADSHEET_ID = '1MeINdWS0PRK83Jz9y9t6k52JhnmQkOuTTIO97mG4Tyc'
const FORM_TIMEZONE = 'Africa/Casablanca'
const scriptProp = PropertiesService.getScriptProperties()

const FORM_CONFIG = {
  project: {
    sheetName: 'project_requests',
    headers: ['Date', 'Time', 'FullName', 'Email', 'Category', 'Problem']
  },
  feedback: {
    sheetName: 'product_feedback',
    headers: ['Date', 'Time', 'FullName', 'Email', 'Category', 'Problem']
  }
}

function getSpreadsheetId_() {
  return scriptProp.getProperty('key') || SPREADSHEET_ID || null
}

function initialSetup() {
  let spreadsheet = null
  try { spreadsheet = SpreadsheetApp.getActiveSpreadsheet() } catch (error) {}
  if (!spreadsheet && SPREADSHEET_ID) spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID)
  if (!spreadsheet) throw new Error('Could not find the SoluView spreadsheet. Add the spreadsheet ID to SPREADSHEET_ID and run initialSetup() again.')
  scriptProp.setProperty('key', spreadsheet.getId())
  return spreadsheet.getId()
}

function setupAllSheets() {
  const spreadsheetId = getSpreadsheetId_()
  if (!spreadsheetId) throw new Error('Run initialSetup() first.')
  const spreadsheet = SpreadsheetApp.openById(spreadsheetId)
  Object.keys(FORM_CONFIG).forEach(function (formType) {
    const config = FORM_CONFIG[formType]
    let sheet = spreadsheet.getSheetByName(config.sheetName)
    if (!sheet) sheet = spreadsheet.insertSheet(config.sheetName)
    applyHeaders_(sheet, config.headers)
  })
}

function applyHeaders_(sheet, headers) {
  sheet.getRange(1, 1, 1, headers.length).setValues([headers])
  sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold')
  sheet.setFrozenRows(1)
  sheet.autoResizeColumns(1, headers.length)
}

function doGet() {
  return ContentService.createTextOutput(JSON.stringify({
    result: 'success',
    message: 'SoluView form receiver is running',
    sheets: Object.keys(FORM_CONFIG).map(function (type) { return FORM_CONFIG[type].sheetName })
  })).setMimeType(ContentService.MimeType.JSON)
}

function doPost(e) {
  const result = processSubmission_(getParams_(e))
  return postMessageResponse_(result)
}

function getParams_(e) {
  const params = {}
  if (e && e.parameter) Object.keys(e.parameter).forEach(function (key) { params[key] = e.parameter[key] })
  return params
}

function postMessageResponse_(payload) {
  const json = JSON.stringify(payload).replace(/</g, '\\u003c')
  return HtmlService.createHtmlOutput(
    '<!doctype html><html><body><script>' +
    '(function(d){try{window.top.postMessage(d,"*")}catch(e){}try{window.parent.postMessage(d,"*")}catch(e){}})(' + json + ');' +
    '</script></body></html>'
  ).setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
}

function processSubmission_(params) {
  const lock = LockService.getScriptLock()
  try {
    lock.waitLock(10000)
    const formType = String(params.formType || '').trim().toLowerCase()
    const config = FORM_CONFIG[formType]
    if (!config) return { result: 'error', error: 'Invalid form type.' }

    const fullName = clean_(params.FullName || params.name)
    const email = clean_(params.Email || params.email)
    const category = clean_(params.Category || params.category)
    const problem = clean_(params.Problem || params.problem || params.Description || params.details)
    if (!fullName || !email || !category || !problem) return { result: 'error', error: 'Please complete every required field.' }
    if (!isValidEmail_(email)) return { result: 'error', error: 'Please enter a valid email address.' }

    const spreadsheetId = getSpreadsheetId_()
    if (!spreadsheetId) return { result: 'error', error: 'Spreadsheet is not linked. Run initialSetup() in Apps Script.' }
    const spreadsheet = SpreadsheetApp.openById(spreadsheetId)
    let sheet = spreadsheet.getSheetByName(config.sheetName)
    if (!sheet) { sheet = spreadsheet.insertSheet(config.sheetName); applyHeaders_(sheet, config.headers) }
    if (sheet.getLastRow() === 0 || sheet.getRange(1, 1).getValue() === '') applyHeaders_(sheet, config.headers)

    const now = new Date()
    const date = Utilities.formatDate(now, FORM_TIMEZONE, 'MMM d, yyyy')
    const time = Utilities.formatDate(now, FORM_TIMEZONE, 'HH:mm:ss')
    if (isDuplicate_(sheet, fullName, email, category, problem, now)) return { result: 'error', error: 'This submission was already received. Please wait before submitting again.' }

    const nextRow = sheet.getLastRow() + 1
    sheet.getRange(nextRow, 1, 1, 6).setValues([[date, time, fullName, email, category, problem]])
    sheet.getRange(nextRow, 1, 1, 2).setNumberFormat('@')
    return { result: 'success', formType: formType, row: nextRow }
  } catch (error) {
    Logger.log(error.toString())
    return { result: 'error', error: 'Unable to save your submission. Please try again.' }
  } finally {
    if (lock.hasLock()) lock.releaseLock()
  }
}

function isDuplicate_(sheet, fullName, email, category, problem, now) {
  if (sheet.getLastRow() < 2) return false
  const rows = sheet.getRange(2, 1, sheet.getLastRow() - 1, 6).getValues()
  return rows.some(function (row) {
    const rowTimestamp = new Date(row[0] + ' ' + row[1]).getTime()
    return row[2] === fullName && row[3] === email && row[4] === category && row[5] === problem && !isNaN(rowTimestamp) && now.getTime() - rowTimestamp < 60000
  })
}

function clean_(value) { return String(value || '').trim() }
function isValidEmail_(email) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) }