/**
 * LCGC Leads — standalone Apps Script for the public Budget Estimator's lead capture.
 *
 * ⚠️ This is SEPARATE from Len's planner / customer-records backend, by design.
 *    Different Google Sheet, different deployment, different /exec URL. Public lead
 *    capture and private customer records are different risk profiles — if this
 *    endpoint gets spammed it must never touch the planner's data.
 *
 * SETUP (one time):
 *   1. Create a new Google Sheet named "LCGC Leads".
 *   2. Extensions → Apps Script. Delete the stub, paste this whole file, Save.
 *   3. Run setupSheet() once (pick it in the function dropdown → Run). Authorize when asked.
 *   4. Deploy → New deployment → type "Web app":
 *        Execute as: Me
 *        Who has access: Anyone
 *      → Deploy → copy the Web app URL (ends in /exec).
 *   5. Paste that URL into LEADS_ENDPOINT at the top of the estimator JS
 *      (LCGC_Budget_Estimator.html), then redeploy the site.
 *   6. Submit a test lead from the live estimator → confirm a row appears AND the
 *      notification email reaches Len (check spam; whitelist if on Outlook/M365).
 *
 * Re-deploy note: editing this script does NOT change the live behavior until you
 * Deploy → Manage deployments → edit → new version. (Same gotcha as the planner.)
 */

var SHEET_NAME = 'Leads';
var NOTIFY_TO  = 'LCovington@lcgeneralcontracting.com';  // Len — the live lead recipient (primary)
var NOTIFY_CC  = 'lcnascar18@icloud.com,eugene@atscale-advisors.com,jfields@lcgeneralcontracting.com'; // CC per Len: his personal, Eugene, jfields@
var DEDUPE_MIN = 2;                                       // ignore an identical email re-sent within N minutes

// Column order is STABLE: estimator columns first (unchanged), then the homepage
// columns appended at the end. Both lead sources write all 16 columns — fields that
// don't apply to a given source are left blank/0. Never reorder; only append.
var HEADERS = ['timestamp','name','email','build_type','total_budget','oop_pct',
               'oop_dollars','construction_only','cost_per_sqft','est_sqft','source','user_agent',
               'phone','project_type','budget_range','message'];

/**
 * Run once after pasting (and re-run after a schema change). Creates the Leads tab and
 * writes/refreshes the header row. Safe to re-run: it only rewrites row 1 (labels),
 * never touches data rows — so it upgrades an existing sheet to new columns in place.
 */
function setupSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
  sh.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]).setFontWeight('bold');
  sh.setFrozenRows(1);
  return 'ok';
}

/** Health check — visiting the /exec URL in a browser returns this. */
function doGet() {
  return _json({ ok: true, service: 'lcgc-leads' });
}

/** Lead intake. */
function doPost(e) {
  try {
    var data = JSON.parse((e && e.postData && e.postData.contents) || '{}');

    // 1) Honeypot — a bot filled the hidden "company" field. Silently accept, write nothing.
    if (data.company) return _json({ ok: true, bot: true });

    // 2) Validate — must have a plausible email.
    var email = String(data.email || '').trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return _json({ ok: false, error: 'invalid_email' });

    // 3) Serialize appends so concurrent submits can't collide.
    var lock = LockService.getScriptLock();
    lock.waitLock(20000);
    try {
      var ss = SpreadsheetApp.getActiveSpreadsheet();
      var sh = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
      if (sh.getLastRow() === 0) setupSheet();

      // 4) Dedupe — drop an identical email re-submitted within DEDUPE_MIN minutes (double-click / retry).
      var now = new Date();
      var last = sh.getLastRow();
      if (last > 1) {
        var look = Math.min(5, last - 1);
        var rows = sh.getRange(last - look + 1, 1, look, 3).getValues(); // timestamp, name, email
        for (var i = 0; i < rows.length; i++) {
          var ts = rows[i][0], em = String(rows[i][2] || '').trim().toLowerCase();
          if (em === email.toLowerCase() && ts instanceof Date && (now - ts) < DEDUPE_MIN * 60 * 1000) {
            return _json({ ok: true, deduped: true });
          }
        }
      }

      // 5) Append the lead. (The row is the asset — this happens before the email.)
      //    Estimator leads fill the build_* columns; homepage leads fill phone/project/
      //    budget/message. The unused columns for each source stay blank/0.
      sh.appendRow([
        now,
        String(data.name || '').slice(0, 120),
        email,
        String(data.build_type || ''),
        Number(data.total_budget || 0),
        Number(data.oop_pct || 0),
        Number(data.oop_dollars || 0),
        Number(data.construction_only || 0),
        Number(data.cost_per_sqft || 0),
        Number(data.est_sqft || 0),
        String(data.source || 'estimator'),
        String(data.user_agent || '').slice(0, 300),
        String(data.phone || '').slice(0, 40),
        String(data.project_type || '').slice(0, 80),
        String(data.budget_range || '').slice(0, 60),
        String(data.message || '').slice(0, 2000)
      ]);
    } finally {
      lock.releaseLock();
    }

    // 6) Notify Len. Wrapped so a mail failure (e.g. daily quota) never fails the request —
    //    the row is already saved.
    try { _notify(data, email); } catch (mailErr) { /* swallow on purpose */ }

    return _json({ ok: true });
  } catch (err) {
    return _json({ ok: false, error: String(err) });
  }
}

function _notify(d, email) {
  var subject, body;

  if (String(d.source || '') === 'homepage') {
    // Homepage "Request a Free Estimate" form.
    subject = 'New LCGC estimate request — ' + (d.name || email) +
              (d.project_type ? ' (' + d.project_type + ')' : '');
    body =
      'New free-estimate request from the LCGC website:\n\n' +
      'Name:          ' + (d.name || '(not given)') + '\n' +
      'Phone:         ' + (d.phone || '(not given)') + '\n' +
      'Email:         ' + email + '\n\n' +
      'Project Type:  ' + (d.project_type || '(not given)') + '\n' +
      'Budget:        ' + (d.budget_range || 'Not sure yet') + '\n\n' +
      'About the project:\n' + (d.message || '(none provided)') + '\n\n' +
      'Reply to this email to reach them directly: ' + email;
  } else {
    // Budget Estimator lead (default).
    subject = 'New LCGC lead — ' + (d.name || email) +
              ' (' + _money(d.total_budget) + ', ~' + _num(d.est_sqft) + ' sqft)';
    body =
      'New lead from the LCGC Budget Estimator:\n\n' +
      'Name:               ' + (d.name || '(not given)') + '\n' +
      'Email:              ' + email + '\n\n' +
      'Build Type:         ' + (d.build_type || '') + '\n' +
      'Total Budget:       ' + _money(d.total_budget) + '\n' +
      'Overhead & Profit:  ' + _num(d.oop_pct) + '% (' + _money(d.oop_dollars) + ')\n' +
      'Construction Only:  ' + _money(d.construction_only) + '\n' +
      'Cost / SQFT:        ' + _money(d.cost_per_sqft) + '\n' +
      'Estimated Home:     ' + _num(d.est_sqft) + ' sqft\n\n' +
      'Reply to this email to reach them directly: ' + email;
  }

  MailApp.sendEmail({ to: NOTIFY_TO, cc: NOTIFY_CC, replyTo: email, subject: subject, body: body });
}

function _json(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}
function _money(n) { return '$' + Number(n || 0).toLocaleString('en-US'); }
function _num(n)   { return Number(n || 0).toLocaleString('en-US'); }
