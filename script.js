/* script.js — Task Manager (vanilla JS)
   By: (implicitly) me. For: Swayam Mishra.
   Paste as `script.js` and keep it deferred in index.html.
*/
/* ===== Mission 99 Dashboard — JavaScript ===== */

// Daily Quotes (20 total)
const quotes = [
  "Discipline beats motivation — always.",
  "Small steps, big results.",
  "Grind in silence, shine in boards.",
  "Your books are your gym today.",
  "No shortcuts, just smart work.",
  "Doubt kills more dreams than failure ever will.",
  "Consistency creates miracles.",
  "The harder you work, the luckier you get.",
  "Be proud of your effort, not just your marks.",
  "Mission 99: You’re building legacy, not scores.",
  "Every chapter is one brick in your success.",
  "If you rest now, you’ll rust later.",
  "The future thanks the focused you.",
  "Your goal should scare you a little.",
  "Marks fade, discipline stays forever.",
  "Stay hungry, stay humble.",
  "Hard work: because talent isn’t enough.",
  "You don’t need perfect days, just persistent ones.",
  "99% mindset, 1% excuses.",
  "Focus beats anxiety. Always."
];

// Display random daily quote
function showDailyQuote() {
  const quoteBox = document.querySelector('.quote-box');
  if (quoteBox) {
    const quote = quotes[Math.floor(Math.random() * quotes.length)];
    quoteBox.textContent = `"${quote}"`;
  }
}

// Initialize Dashboard Data
let tasks = JSON.parse(localStorage.getItem('mission99_tasks')) || [];

// Add Entry Function
function addEntry(subject, task, hours, day) {
  const entry = {
    subject,
    task,
    hours: Number(hours),
    day,
    date: new Date().toLocaleDateString()
  };
  tasks.push(entry);
  localStorage.setItem('mission99_tasks', JSON.stringify(tasks));
  renderDashboard();
}

// Render Dashboard
function renderDashboard() {
  const container = document.querySelector('#dashboardEntries');
  if (!container) return;
  container.innerHTML = '';

  if (tasks.length === 0) {
    container.innerHTML = '<p>No tasks added yet.</p>';
    return;
  }

  tasks.forEach((t, i) => {
    const card = document.createElement('div');
    card.classList.add('card');
    card.innerHTML = `
      <h3>${t.subject}</h3>
      <p><strong>Task:</strong> ${t.task}</p>
      <p><strong>Hours:</strong> ${t.hours}</p>
      <p><strong>Day:</strong> ${t.day}</p>
      <p class="small">${t.date}</p>
      <button onclick="deleteEntry(${i})">Delete</button>
    `;
    container.appendChild(card);
  });

  updateStats();
}

// Delete Entry
function deleteEntry(index) {
  tasks.splice(index, 1);
  localStorage.setItem('mission99_tasks', JSON.stringify(tasks));
  renderDashboard();
}

// Update previous day hours + weekly average
function updateStats() {
  const prevDay = document.querySelector('#prevDayHours');
  const weeklyAvg = document.querySelector('#weeklyAvg');

  if (!prevDay || !weeklyAvg) return;

  let total = 0;
  let today = new Date().toLocaleDateString();
  let yesterdayHours = 0;

  tasks.forEach(t => {
    total += t.hours;
    if (t.date !== today) yesterdayHours += t.hours;
  });

  const avg = (total / 7).toFixed(1);
  prevDay.textContent = `${yesterdayHours} hrs`;
  weeklyAvg.textContent = `${avg} hrs/day`;
}

// Generate Plan Button
function generatePlan() {
  const output = document.querySelector('#generatedPlan');
  if (!output) return;

  if (tasks.length === 0) {
    output.innerHTML = `<p>Add a few study entries first!</p>`;
    return;
  }

  // Simple AI-like suggestion logic
  const suggestion = [];
  const bySubject = {};

  tasks.forEach(t => {
    if (!bySubject[t.subject]) bySubject[t.subject] = 0;
    bySubject[t.subject] += t.hours;
  });

  for (const [sub, hrs] of Object.entries(bySubject)) {
    if (sub.toLowerCase().includes('math')) {
      suggestion.push(`${sub}: 15 RD Sharma questions or revision.`);
    } else if (sub.toLowerCase().includes('sci')) {
      suggestion.push(`${sub}: Revise 4 pages or complete one topic.`);
    } else if (sub.toLowerCase().includes('sst')) {
      suggestion.push(`${sub}: Complete one chapter + 10 Q&A practice.`);
    } else if (sub.toLowerCase().includes('eng') || sub.toLowerCase().includes('hin')) {
      suggestion.push(`${sub}: Read 2 pages or write one paragraph.`);
    } else {
      suggestion.push(`${sub}: Focus on next pending topic for 1 hour.`);
    }
  }

  output.innerHTML = `
    <h3>Suggested Plan</h3>
    <ul>${suggestion.map(s => `<li>${s}</li>`).join('')}</ul>
  `;
}

// Add event listener to form (if exists)
document.addEventListener('DOMContentLoaded', () => {
  showDailyQuote();
  renderDashboard();

  const form = document.querySelector('#entryForm');
  if (form) {
    form.addEventListener('submit', e => {
      e.preventDefault();
      const subject = document.querySelector('#subject').value;
      const task = document.querySelector('#task').value;
      const hours = document.querySelector('#hours').value;
      const day = document.querySelector('#day').value;
      addEntry(subject, task, hours, day);
      form.reset();
    });
  }

  const genBtn = document.querySelector('#generatePlan');
  if (genBtn) genBtn.addEventListener('click', generatePlan);
});

/* ============================no 
   CONFIG & STORAGE
   ============================ */
const DB_KEY = 'tm_db_v1';
const HISTORY_DAYS_FOR_SUGGEST = 21; // how many past days to analyze
const STREAK_LOOKBACK = 30; // days to compute streaks

// helpers for dates
const todayStr = () => {
  const d = new Date();
  return d.toISOString().slice(0, 10); // YYYY-MM-DD
};
const dayBefore = (dateStr, days = 1) => {
  const d = new Date(dateStr + 'T00:00:00');
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
};

// init DB structure
function defaultDB() {
  return {
    lastLocalDate: todayStr(),
    tasksByDate: {
      // "2025-10-28": [ {id, text, category, time, done, createdAt, completedAt} ]
    },
    // metadata for analytics
    meta: {
      // optional: future settings
    }
  };
}
/* study-planner.js
   Vanilla JS for Study Planner (Mission 99 style)
   - Works with the HTML block provided earlier (IDs and data-day-* attributes)
   - Persists to localStorage under key: "ss_study_planner_v1"
   - Author: your obedient code monkey
*/

/* ============================
   Config & DB
   ============================ */
const DB_KEY = 'ss_study_planner_v1';

const defaultDB = () => ({
  config: {
    missionName: 'Mission 99 :75 HARD DAYS',
    studyTarget: 4,      // hours expected per day
    breakLen: 0.5,       // hours between breaks
    wakeTime: '',
    sleepTime: '',
    schoolEnabled: false,
    schoolFrom: '',
    schoolTo: ''
  },
  weekly: {
    monday:  { subjects: '', primary: '', suggest: '' },
    tuesday: { subjects: '', primary: '', suggest: '' },
    wednesday:{ subjects: '', primary: '', suggest: '' },
    thursday:{ subjects: '', primary: '', suggest: '' },
    friday:  { subjects: '', primary: '', suggest: '' },
    saturday:{ subjects: '', primary: '', suggest: '' },
    sunday:  { subjects: '', primary: '', suggest: '' }
  },
  savedPlans: [],  // {id, name, dateSaved, snapshot}
  quotes: Array(20).fill(''), // 20 slots
  history: { dailyStudyHours: {} } // { "2025-10-29": 3.5, ... }
});

let DB = null;

/* ============================
   Utilities
   ============================ */
const $ = sel => document.querySelector(sel);
const $$ = sel => Array.from(document.querySelectorAll(sel));
const todayStr = (d = new Date()) => d.toISOString().slice(0,10); // YYYY-MM-DD
const dayBefore = (dateStr, n=1) => {
  const dt = new Date(dateStr + 'T00:00:00');
  dt.setDate(dt.getDate() - n);
  return dt.toISOString().slice(0,10);
};
const uid = (prefix='id_') => prefix + Math.random().toString(36).slice(2,9);
const safeNum = v => (isNaN(Number(v)) ? 0 : Number(v));

/* ============================
   Load / Save DB
   ============================ */
function loadDB() {
  try {
    const raw = localStorage.getItem(DB_KEY);
    DB = raw ? JSON.parse(raw) : defaultDB();
  } catch (e) {
    console.warn('Planner DB parse error, resetting', e);
    DB = defaultDB();
  }
  // ensure shape
  if (!DB.config) DB.config = defaultDB().config;
  if (!DB.weekly) DB.weekly = defaultDB().weekly;
  if (!DB.quotes || !Array.isArray(DB.quotes)) DB.quotes = defaultDB().quotes;
  if (!DB.history) DB.history = defaultDB().history;
  if (!DB.savedPlans) DB.savedPlans = [];
  saveDB();
}

function saveDB() {
  try {
    localStorage.setItem(DB_KEY, JSON.stringify(DB));
  } catch(e) {
    console.error('Failed saving DB', e);
  }
}

/* ============================
   DOM Sync: render DB into inputs
   ============================ */
function renderConfigToUI() {
  $('#missionInput').value = DB.config.missionName || '';
  $('#studyTarget').value = DB.config.studyTarget ?? 4;
  $('#breakLen').value = DB.config.breakLen ?? 0.5;
  $('#wakeTime').value = DB.config.wakeTime || '';
  $('#sleepTime').value = DB.config.sleepTime || '';
  $('#schoolToggle').checked = !!DB.config.schoolEnabled;
  $('#schoolFrom').value = DB.config.schoolFrom || '';
  $('#schoolTo').value = DB.config.schoolTo || '';
  $('#missionName').textContent = DB.config.missionName || 'Mission';
}

function readUIToConfig() {
  DB.config.missionName = $('#missionInput').value.trim() || 'Mission 99 :75 HARD DAYS';
  DB.config.studyTarget = safeNum($('#studyTarget').value) || 0;
  DB.config.breakLen = safeNum($('#breakLen').value) || 0.5;
  DB.config.wakeTime = $('#wakeTime').value || '';
  DB.config.sleepTime = $('#sleepTime').value || '';
  DB.config.schoolEnabled = !!$('#schoolToggle').checked;
  DB.config.schoolFrom = $('#schoolFrom').value || '';
  DB.config.schoolTo = $('#schoolTo').value || '';
  saveDB();
  renderConfigToUI();
}

/* Weekly inputs */
function renderWeeklyToUI() {
  $$('[data-day-subjects]').forEach(input => {
    const day = input.getAttribute('data-day-subjects');
    if (DB.weekly[day]) input.value = DB.weekly[day].subjects || '';
  });
  $$('[data-day-primary]').forEach(input => {
    const day = input.getAttribute('data-day-primary');
    if (DB.weekly[day]) input.value = DB.weekly[day].primary || '';
  });
  $$('[data-day-suggest]').forEach(input => {
    const day = input.getAttribute('data-day-suggest');
    if (DB.weekly[day]) input.value = DB.weekly[day].suggest || '';
  });
}

function readUIToWeekly() {
  $$('[data-day-subjects]').forEach(input => {
    const day = input.getAttribute('data-day-subjects');
    DB.weekly[day] = DB.weekly[day] || {};
    DB.weekly[day].subjects = input.value.trim();
  });
  $$('[data-day-primary]').forEach(input => {
    const day = input.getAttribute('data-day-primary');
    DB.weekly[day] = DB.weekly[day] || {};
    DB.weekly[day].primary = input.value.trim();
  });
  $$('[data-day-suggest]').forEach(input => {
    const day = input.getAttribute('data-day-suggest');
    DB.weekly[day] = DB.weekly[day] || {};
    DB.weekly[day].suggest = input.value.trim();
  });
  saveDB();
}

/* ============================
   Quotes
   ============================ */
function loadQuotesToUI() {
  const inputs = $$('.quote-input');
  inputs.forEach(inp => {
    const idx = Number(inp.getAttribute('data-quote-index'));
    inp.value = DB.quotes[idx] || '';
  });
}

function saveQuotesFromUI() {
  const inputs = $$('.quote-input');
  inputs.forEach(inp => {
    const idx = Number(inp.getAttribute('data-quote-index'));
    DB.quotes[idx] = inp.value.trim();
  });
  saveDB();
  alert('Quotes saved.');
}

function showTodaysQuote() {
  const qEl = $('#quoteDisplay');
  if (!qEl) return;
  const qs = DB.quotes.filter(s => s && s.trim().length);
  if (!qs.length) {
    qEl.innerHTML = '<p class="muted">No quotes saved yet. Add a few in Manage stored quotes.</p>';
    return;
  }
  // rotate deterministically by date: dayNumber % qs.length
  const d = new Date();
  const dayNum = Math.floor(d.getTime() / (1000*60*60*24));
  const idx = dayNum % qs.length;
  qEl.innerHTML = `<blockquote style="margin:0">${escapeHTML(qs[idx])}</blockquote>`;
}

/* ============================
   Estimate durations from target strings
   - very heuristic, documented assumptions below
   ============================ */
/*
  Assumptions used by estimateDurationFromTarget(target):
  - If target contains "page" or "pages": assume 12 minutes per page (0.2 hr)
  - If target contains "question" or "qs" or numeric followed by "q": assume 6 minutes per question (0.1 hr)
  - If target contains "chapter" => assume 1.5 hours per chapter
  - If target contains "test" or "mock" => assume 2 hours
  - If target contains "hour" or "hrs" numeric => use directly
  - If target empty or unknown => fallback to equal-splitting of studyTarget across tasks
*/
function estimateDurationFromTarget(targetStr) {
  if (!targetStr) return 0;
  const s = targetStr.toLowerCase();
  // direct hours mention
  const hrMatch = s.match(/(\d+(\.\d+)?)\s*(h|hr|hrs|hour|hours)/);
  if (hrMatch) return Number(hrMatch[1]);

  // pages
  const pagesMatch = s.match(/(\d+)\s*(page|pages|pgs)/);
  if (pagesMatch) {
    const pages = Number(pagesMatch[1]);
    return +(pages * 0.2).toFixed(2); // 12 minutes/page
  }

  // questions
  const qsMatch = s.match(/(\d+)\s*(q|qs|questions|ques)/);
  if (qsMatch) {
    const q = Number(qsMatch[1]);
    return +(q * 0.1).toFixed(2); // 6 minutes/question
  }

  // "15 RD Questions" pattern with numeric somewhere
  const genericNum = s.match(/(\d+)\b/);
  if (genericNum && /question|q|qs/.test(s)) {
    const q = Number(genericNum[1]);
    return +(q * 0.1).toFixed(2);
  }

  if (s.includes('chapter')) return 1.5;
  if (s.includes('test') || s.includes('mock')) return 2;
  if (s.includes('practice')) return 1; // fallback
  // fallback: 0 (will later be evenly distributed)
  return 0;
}

/* ============================
   Generate Today's Plan
   - creates task rows in #daily-task-list
   - computes scheduledHours, breaksCount
   - uses DB.config.studyTarget if tasks don't specify durations
   ============================ */
function clearDailyTaskListUI() {
  const parent = $('#daily-task-list');
  if (parent) parent.innerHTML = '';
}

function generateTodayPlan(forDate = todayStr()) {
  // refresh UI config + weekly from inputs
  readUIToConfig();
  readUIToWeekly();

  const weekday = (new Date(forDate)).toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
  const w = DB.weekly[weekday] || { subjects: '', primary: '', suggest: '' };

  // build tasks: prefer explicit weekly.primary list (split by newline or / or ; or comma)
  let tasks = [];
  if (w.primary && w.primary.trim()) {
    // split by newline or ' / ' or ' , ' or ';'
    const parts = w.primary.split(/\r?\n|\/|;|,/).map(s => s.trim()).filter(Boolean);
    tasks = parts.map(p => ({ subjectGuess: extractSubjectFromText(p), desc: p, duration: estimateDurationFromTarget(p) }));
  } else if (w.subjects && w.subjects.trim()) {
    // split subjects and create placeholder tasks
    const subs = w.subjects.split(',').map(s => s.trim()).filter(Boolean);
    tasks = subs.map(s => ({ subjectGuess: s, desc: `Study ${s}`, duration: 0 }));
  } else {
    // fallback: create one task for "Study"
    tasks = [{ subjectGuess: 'Study', desc: 'General study', duration: 0 }];
  }

  // If none of the tasks have durations, we will split studyTarget evenly
  let totalSpecifiedHours = tasks.reduce((acc, t) => acc + (t.duration || 0), 0);
  const targetHours = safeNum(DB.config.studyTarget);
  if (totalSpecifiedHours === 0 && targetHours > 0) {
    const each = +(targetHours / tasks.length).toFixed(2);
    tasks = tasks.map(t => ({ ...t, duration: each }));
    totalSpecifiedHours = each * tasks.length;
  } else if (totalSpecifiedHours < targetHours && targetHours > 0) {
    // distribute remaining proportionally among 0-duration tasks
    const remaining = Math.max(0, targetHours - totalSpecifiedHours);
    const zeroCount = tasks.filter(t => !t.duration).length;
    if (zeroCount > 0) {
      const addPer = +(remaining / zeroCount).toFixed(2);
      tasks = tasks.map(t => t.duration ? t : ({ ...t, duration: addPer }));
      totalSpecifiedHours = tasks.reduce((acc, t) => acc + (t.duration || 0), 0);
    }
  }

  // compute breaks: use breakLen field
  const breakLen = safeNum(DB.config.breakLen) || 0.5;
  const breaksCount = Math.floor((totalSpecifiedHours / breakLen) || 0);

  // now render tasks into DOM
  clearDailyTaskListUI();
  const parent = $('#daily-task-list');
  tasks.forEach((t, idx) => {
    const node = document.createElement('div');
    node.className = 'task-row';
    node.innerHTML = `
      <label>Subject</label>
      <input class="task-subject" value="${escapeHTML(t.subjectGuess || '')}" />
      <input class="task-desc" value="${escapeHTML(t.desc || '')}" />
      <select class="task-type">
        <option value="chapter">Complete chapter</option>
        <option value="pages">Pages</option>
        <option value="questions">Questions practice</option>
        <option value="other">Other</option>
      </select>
      <input class="task-target" value="${t.duration ? t.duration + ' hr' : ''}" />
      <button class="btn tiny ghost remove-task" data-idx="${idx}">Remove</button>
    `;
    parent.appendChild(node);
  });

  // wire remove buttons
  parent.querySelectorAll('.remove-task').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.target.closest('.task-row').remove();
      // recompute summary after a short breath
      setTimeout(renderPlanSummary, 80);
    });
  });

  // final summary render
  renderPlanSummary();
  // Save today's scheduled hours to history
  DB.history.dailyStudyHours[forDate] = +(totalSpecifiedHours.toFixed(2));
  saveDB();
  renderSavedPlansList();
}

/* helper to extract subject from a primary string */
function extractSubjectFromText(text) {
  if (!text) return '';
  const s = text.toLowerCase();
  if (s.includes('math')) return 'Maths';
  if (s.includes('sci') || s.includes('chem') || s.includes('bio') || s.includes('science')) return 'Science';
  if (s.includes('sst') || s.includes('soc') || s.includes('history') || s.includes('geo')) return 'SST';
  if (s.includes('hindi')) return 'Hindi';
  if (s.includes('english')) return 'English';
  return text.split(/[-:–—\|]/)[0].slice(0, 20); // fallback short label
}

/* ============================
   Render plan summary (uses daily-task-list to compute total)
   ============================ */
function renderPlanSummary(forDate = todayStr()) {
  // compute scheduled hours by summing durations in generated task rows (task-target may contain "X hr" or numeric)
  const parent = $('#daily-task-list');
  let total = 0;
  if (parent) {
    parent.querySelectorAll('.task-row').forEach(row => {
      const target = row.querySelector('.task-target')?.value || '';
      // try to parse hr pattern
      let n = 0;
      const hrMatch = target.match(/(\d+(\.\d+)?)\s*(h|hr|hrs|hour|hours)/);
      if (hrMatch) n = Number(hrMatch[1]);
      else {
        // try simple number
        const num = target.match(/(\d+(\.\d+)?)/);
        if (num) n = Number(num[1]);
      }
      total += n;
    });
  }

  // fallback to config studyTarget if total 0
  if (total === 0) total = safeNum(DB.config.studyTarget) || 0;

  // breaks
  const breakLen = safeNum(DB.config.breakLen) || 0.5;
  const breaksCount = Math.floor(total / breakLen);

  // previous day and last week avg
  const prev = DB.history.dailyStudyHours[dayBefore(forDate,1)] ?? 0;
  // compute last 7 days average
  let sum7 = 0, cnt7 = 0;
  for (let i=1;i<=7;i++) {
    const d = dayBefore(forDate, i);
    if (DB.history.dailyStudyHours[d] !== undefined) {
      sum7 += Number(DB.history.dailyStudyHours[d]);
      cnt7++;
    }
  }
  const lastWeekAvg = cnt7 ? +(sum7 / cnt7).toFixed(2) : 0;

  // render into outputs
  $('#scheduledHours').textContent = total.toFixed(2);
  $('#previousDayHours').textContent = (prev ?? 0).toFixed(2);
  $('#lastWeekAvg').textContent = (lastWeekAvg ?? 0).toFixed(2);

  $('#statTodayTotal')?.textContent = total.toFixed(2);
  $('#statBreaks')?.textContent = breaksCount;
  $('#statPrevDay')?.textContent = (prev ?? 0).toFixed(2);
  $('#stat7DayAvg')?.textContent = (lastWeekAvg ?? 0).toFixed(2);

  // update history record for today to match total (keeps analytics consistent)
  DB.history.dailyStudyHours[forDate] = +(total.toFixed(2));
  saveDB();
}

/* ============================
   Saved Plans UI
   ============================ */
function renderSavedPlansList() {
  const container = $('#savedPlansList');
  if (!container) return;
  container.innerHTML = '';
  if (!DB.savedPlans || DB.savedPlans.length === 0) {
    container.textContent = 'No saved plans yet.';
    return;
  }
  DB.savedPlans.slice().reverse().forEach(p => {
    const el = document.createElement('div');
    el.style.display = 'flex';
    el.style.gap = '8px';
    el.style.alignItems = 'center';
    el.style.marginBottom = '6px';
    el.innerHTML = `<strong style="min-width:180px">${escapeHTML(p.name)}</strong>
      <span class="muted">${p.dateSaved}</span>
      <div style="margin-left:auto;display:flex;gap:6px">
        <button class="btn ghost load-plan" data-id="${p.id}">Load</button>
        <button class="btn tiny export-plan" data-id="${p.id}">Export</button>
        <button class="btn tiny ghost delete-plan" data-id="${p.id}">Delete</button>
      </div>`;
    container.appendChild(el);
  });
  // wire buttons
  container.querySelectorAll('.load-plan').forEach(b => b.addEventListener('click', (e) =>{
    const id = b.getAttribute('data-id');
    const rec = DB.savedPlans.find(x => x.id === id);
    if (!rec) return alert('Plan not found');
    // restore snapshot into DB and UI
    DB = { ...DB, ...rec.snapshot }; // careful but fine for this demo
    saveDB();
    renderAll();
  }));
  container.querySelectorAll('.export-plan').forEach(b => b.addEventListener('click', (e) => {
    const id = b.getAttribute('data-id');
    const rec = DB.savedPlans.find(x => x.id === id);
    if (!rec) return alert('Plan not found');
    const blob = new Blob([JSON.stringify(rec.snapshot, null, 2)], {type:'application/json'});
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `planner-${rec.name.replace(/\s+/g,'_')}.json`; a.click();
  }));
  container.querySelectorAll('.delete-plan').forEach(b => b.addEventListener('click', (e) => {
    const id = b.getAttribute('data-id');
    if (!confirm('Delete this saved plan?')) return;
    DB.savedPlans = DB.savedPlans.filter(x => x.id !== id);
    saveDB();
    renderSavedPlansList();
  }));
}

/* ============================
   Buttons / Actions
   ============================ */
function saveCurrentPlanAsSnapshot() {
  // read UI inputs into DB first
  readUIToConfig();
  readUIToWeekly();
  const snapshot = JSON.parse(JSON.stringify(DB));
  const name = prompt('Name for saved plan (e.g., 29 Oct Mission)', DB.config.missionName || 'Plan');
  if (!name) return;
  const rec = { id: uid('plan_'), name: name.slice(0,60), dateSaved: todayStr(), snapshot };
  DB.savedPlans.push(rec);
  saveDB();
  renderSavedPlansList();
  alert('Plan saved locally.');
}

function loadPlannerFromLocal() {
  if (!confirm('This will overwrite current inputs with saved DB content. Continue?')) return;
  loadDB();
  renderAll();
  alert('Planner loaded from local storage.');
}

function clearPlannerLocal() {
  if (!confirm('Clear saved planner data (this clears local DB)?')) return;
  DB = defaultDB();
  saveDB();
  renderAll();
  alert('Planner cleared.');
}

function exportPlannerDB() {
  const payload = JSON.stringify(DB, null, 2);
  const blob = new Blob([payload], {type:'application/json'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `study-planner-backup-${todayStr()}.json`;
  a.click();
}

function importPlannerFile(file) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const parsed = JSON.parse(e.target.result);
      if (!parsed || typeof parsed !== 'object') throw new Error('Invalid file');
      if (!confirm('Importing will override current planner data. Continue?')) return;
      DB = parsed;
      saveDB();
      renderAll();
      alert('Import complete.');
    } catch (err) {
      alert('Failed to import file: ' + err.message);
    }
  };
  reader.readAsText(file);
}

/* ============================
   Helpers: escapeHTML
   ============================ */
function escapeHTML(s) {
  if (!s && s !== 0) return '';
  return String(s).replace(/[&<>"]/g, ch => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;' }[ch]));
}

/* ============================
   Render everything (UI)
   ============================ */
function renderAll() {
  renderConfigToUI();
  renderWeeklyToUI();
  loadQuotesToUI();
  renderSavedPlansList();
  generateTodayPlan(todayStr());
  showTodaysQuote();
}

/* ============================
   Wire up event listeners
   ============================ */
function wireEvents() {
  // config inputs -> live save
  $('#missionInput')?.addEventListener('change', () => { readUIToConfig(); });
  $('#studyTarget')?.addEventListener('change', () => { readUIToConfig(); generateTodayPlan(); });
  $('#breakLen')?.addEventListener('change', () => { readUIToConfig(); renderPlanSummary(); });
  $('#wakeTime')?.addEventListener('change', () => { readUIToConfig(); });
  $('#sleepTime')?.addEventListener('change', () => { readUIToConfig(); });

  // weekly fields auto-save on blur
  $$('[data-day-subjects],[data-day-primary],[data-day-suggest]').forEach(inp => {
    inp.addEventListener('blur', () => { readUIToWeekly(); });
  });

  // save/load/clear/export/import buttons
  $('#savePlannerBtn')?.addEventListener('click', saveCurrentPlanAsSnapshot);
  $('#loadPlannerBtn')?.addEventListener('click', loadPlannerFromLocal);
  $('#clearPlannerBtn')?.addEventListener('click', clearPlannerLocal);
  $('#exportPlannerBtn')?.addEventListener('click', exportPlannerDB);
  $('#importPlannerFile')?.addEventListener('change', (e) => {
    const f = e.target.files[0];
    importPlannerFile(f);
  });

  // quotes
  $('#saveQuotesBtn')?.addEventListener('click', saveQuotesFromUI);
  $('#randomQuoteBtn')?.addEventListener('click', showTodaysQuote);

  // quote quick show on page load already called in renderAll

  // Save mission as local snapshot
  $('#savePlannerBtn')?.addEventListener('dblclick', saveCurrentPlanAsSnapshot); // convenience

  // preview & actions if present
  $('#previewMissionBtn')?.addEventListener('click', () => generateTodayPlan());
  $('#saveAsTodayBtn')?.addEventListener('click', () => {
    readUIToConfig();
    readUIToWeekly();
    // store today snapshot under savedPlans with name "Today - mission"
    const name = `Today - ${DB.config.missionName || 'Plan'} - ${todayStr()}`;
    DB.savedPlans.push({ id: uid('plan_'), name, dateSaved: todayStr(), snapshot: JSON.parse(JSON.stringify(DB)) });
    saveDB();
    alert('Saved plan as a saved-plan for quick load.');
    renderSavedPlansList();
  });

  // edit / export mission buttons in mission card if exist (IDs in mission.html)
  $('#editMissionBtn')?.addEventListener('click', () => {
    // scroll to editor section if exists
    const editor = $('#missionForm') || $('#study-planner');
    if (editor) editor.scrollIntoView({behavior:'smooth'});
  });
  $('#exportMissionBtn')?.addEventListener('click', exportPlannerDB);

  $('#activateMissionBtn')?.addEventListener('click', () => {
    // subtle animation or confirmation
    alert('Mission activated for today — stay focused. Good luck, Swayam.');
  });

  // initial mission name update
  $('#missionInput')?.addEventListener('input', () => { $('#missionName').textContent = $('#missionInput').value || 'Mission'; });
}

/* ============================
   Boot
   ============================ */
document.addEventListener('DOMContentLoaded', () => {
  loadDB();
  wireEvents();
  renderAll();
});
/* ============================
   UTILITIES
   ============================ */
const $ = sel => document.querySelector(sel);
const $$ = sel => Array.from(document.querySelectorAll(sel));
const escapeHTML = s => String(s).replace(/[&<>"]/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;' }[c]));

const uid = (prefix = '') => prefix + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

function downloadJSON(filename, obj) {
  const data = "data:application/json;charset=utf-8," + encodeURIComponent(JSON.stringify(obj, null, 2));
  const a = document.createElement('a');
  a.href = data;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

/* ============================
   DB LOAD/SAVE + ROLLOVER
   ============================ */
let DB = null;

function loadDB() {
  try {
    const raw = localStorage.getItem(DB_KEY);
    DB = raw ? JSON.parse(raw) : defaultDB();
  } catch (e) {
    console.warn('DB parse error, resetting DB.', e);
    DB = defaultDB();
  }
  // ensure keys
  if (!DB.tasksByDate) DB.tasksByDate = {};
  if (!DB.lastLocalDate) DB.lastLocalDate = todayStr();
  dailyRolloverIfNeeded();
}

function saveDB() {
  localStorage.setItem(DB_KEY, JSON.stringify(DB));
}

/* If the saved DB's lastLocalDate is older than todayStr(),
   carry over unfinished tasks and mark lastLocalDate = today.
*/
function dailyRolloverIfNeeded() {
  const savedDate = DB.lastLocalDate;
  const t = todayStr();
  if (savedDate === t) return;

  // For all dates between savedDate (exclusive) and today (inclusive) we could run scheduled jobs.
  // For now: carry unfinished tasks from savedDate to today.
  const prevTasks = DB.tasksByDate[savedDate] || [];
  const unfinished = prevTasks.filter(tsk => !tsk.done);

  // ensure today's array
  DB.tasksByDate[t] = DB.tasksByDate[t] || [];

  // add unfinished tasks to today if not duplicate (same text, same category)
  unfinished.forEach(u => {
    const exists = DB.tasksByDate[t].some(existing =>
      existing.text === u.text && existing.category === u.category && !existing.done
    );
    if (!exists) {
      // create new copy with new id and createdAt
      const copy = { ...u, id: uid('t_'), createdAt: Date.now() };
      delete copy.completedAt; // not completed yet
      DB.tasksByDate[t].push(copy);
    }
  });

  // update lastLocalDate
  DB.lastLocalDate = t;
  saveDB();
}

/* ============================
   Task CRUD + Helpers
   ============================ */
function getTasksFor(dateStr = todayStr()) {
  DB.tasksByDate[dateStr] = DB.tasksByDate[dateStr] || [];
  return DB.tasksByDate[dateStr];
}

function addTask({ text, category = 'general', time = '' }) {
  if (!text || !text.trim()) return null;
  const task = {
    id: uid('t_'),
    text: text.trim(),
    category,
    time: time || '',
    done: false,
    createdAt: Date.now()
  };
  getTasksFor().push(task);
  saveDB();
  renderAll();
  return task;
}

function deleteTask(taskId, date = todayStr()) {
  DB.tasksByDate[date] = getTasksFor(date).filter(t => t.id !== taskId);
  saveDB();
  renderAll();
}

function toggleDone(taskId, date = todayStr()) {
  const tasks = getTasksFor(date);
  const t = tasks.find(x => x.id === taskId);
  if (!t) return;
  t.done = !t.done;
  t.completedAt = t.done ? Date.now() : null;
  saveDB();
  renderAll();
}

function editTask(taskId, { text, category, time }, date = todayStr()) {
  const tasks = getTasksFor(date);
  const t = tasks.find(x => x.id === taskId);
  if (!t) return;
  if (text !== undefined) t.text = text.trim();
  if (category !== undefined) t.category = category;
  if (time !== undefined) t.time = time;
  saveDB();
  renderAll();
}

function clearCompleted(date = todayStr()) {
  DB.tasksByDate[date] = getTasksFor(date).filter(t => !t.done);
  saveDB();
  renderAll();
}

/* ============================
   SUGGESTIONS (no AI: frequency based)
   ============================ */

function computeSuggestions() {
  // look back HISTORY_DAYS_FOR_SUGGEST days and count normalized task titles
  const counts = {};
  const now = todayStr();
  for (let i = 0; i < HISTORY_DAYS_FOR_SUGGEST; i++) {
    const day = dayBefore(now, i);
    const tasks = DB.tasksByDate[day] || [];
    tasks.forEach(t => {
      const key = t.text.toLowerCase().replace(/\s+/g, ' ').trim();
      counts[key] = (counts[key] || 0) + (t.done ? 2 : 1); // weight completed higher
    });
  }
  // convert to sorted array
  const sorted = Object.entries(counts)
    .map(([text, c]) => ({ text, count: c }))
    .sort((a, b) => b.count - a.count);
  // return top 8 suggestions
  return sorted.slice(0, 8);
}

/* ============================
   STREAKS (consecutive completions)
   ============================ */

function computeStreaks() {
  // For each unique normalized text that appears in last STREAK_LOOKBACK days,
  // compute consecutive days (ending today) where it was present AND marked done.
  const seenTexts = new Set();
  const now = todayStr();
  for (let i = 0; i < STREAK_LOOKBACK; i++) {
    const d = dayBefore(now, i);
    (DB.tasksByDate[d] || []).forEach(t => {
      seenTexts.add(t.text.toLowerCase().replace(/\s+/g, ' ').trim());
    });
  }
  const streaks = [];
  seenTexts.forEach(textKey => {
    let streak = 0;
    for (let i = 0; i < STREAK_LOOKBACK; i++) {
      const d = dayBefore(now, i);
      const dayTasks = DB.tasksByDate[d] || [];
      const foundDone = dayTasks.some(t => t.text.toLowerCase().replace(/\s+/g, ' ').trim() === textKey && t.done);
      if (foundDone) streak++;
      else break;
    }
    if (streak > 0) streaks.push({ text: textKey, streak });
  });
  // sort by streak desc
  return streaks.sort((a, b) => b.streak - a.streak).slice(0, 8);
}

/* ============================
   RENDERING
   ============================ */

function renderSuggestions() {
  const list = $('#suggestList');
  if (!list) return;
  const suggestions = computeSuggestions();
  list.innerHTML = '';
  if (suggestions.length === 0) {
    list.innerHTML = '<div class="muted">No suggestions yet — add tasks for a few days and they will show up here.</div>';
    return;
  }
  suggestions.forEach(s => {
    const btn = document.createElement('button');
    btn.className = 'btn ghost suggestion';
    btn.type = 'button';
    btn.textContent = `${s.text} (${s.count})`;
    btn.addEventListener('click', () => {
      // fill quick input & add
      $('#taskInput').value = s.text;
      $('#taskCategory').value = 'general';
      $('#taskTime').value = '';
      $('#taskInput').focus();
    });
    list.appendChild(btn);
  });
}

function renderStreaks() {
  const el = $('#streaks');
  if (!el) return;
  const st = computeStreaks();
  if (st.length === 0) {
    el.innerHTML = '<div class="muted">No streaks yet. Build one.</div>';
    return;
  }
  el.innerHTML = `<strong>Streaks</strong>: ` + st.map(s => `${escapeHTML(s.text)} <span class="pill">${s.streak}d</span>`).join(' · ');
}

function renderTasksList(filterCategory = 'all') {
  const ul = $('#taskList');
  if (!ul) return;
  const tasks = getTasksFor();
  // optionally filter
  const filtered = filterCategory === 'all' ? tasks : tasks.filter(t => t.category === filterCategory);
  // sort by time then createdAt
  filtered.sort((a, b) => {
    if (a.time && b.time) return a.time.localeCompare(b.time);
    if (a.time && !b.time) return -1;
    if (!a.time && b.time) return 1;
    return a.createdAt - b.createdAt;
  });

  ul.innerHTML = '';
  if (filtered.length === 0) {
    $('#emptyState').style.display = 'block';
    return;
  } else {
    $('#emptyState').style.display = 'none';
  }

  filtered.forEach(t => {
    const li = document.createElement('li');
    li.className = 'task-item';
    li.dataset.id = t.id;
    li.innerHTML = `
      <div class="task-left">
        <input type="checkbox" class="task-check" ${t.done ? 'checked' : ''} aria-label="Mark task done" />
      </div>
      <div class="task-center">
        <div class="task-text ${t.done ? 'done' : ''}">${escapeHTML(t.text)}</div>
        <div class="task-meta muted">${escapeHTML(t.category)} ${t.time ? ' • ' + escapeHTML(t.time) : ''}</div>
      </div>
      <div class="task-right">
        <button class="btn tiny edit">Edit</button>
        <button class="btn tiny delete">Delete</button>
      </div>
    `;
    // events
    li.querySelector('.task-check').addEventListener('change', () => toggleDone(t.id));
    li.querySelector('.edit').addEventListener('click', () => {
      // simple edit using prompt for now for speed
      const newText = prompt('Edit task text', t.text);
      if (newText === null) return; // cancel
      const newCategory = prompt('Category (study, fitness, content, spiritual, general)', t.category) || t.category;
      const newTime = prompt('Time (HH:MM) or blank', t.time || '') || '';
      editTask(t.id, { text: newText, category: newCategory, time: newTime });
    });
    li.querySelector('.delete').addEventListener('click', () => {
      if (confirm('Delete this task?')) deleteTask(t.id);
    });
    ul.appendChild(li);
  });
}
// ===== Task Manager JavaScript =====

// Get elements
const taskInput = document.getElementById("taskInput");
const addTaskBtn = document.getElementById("addTaskBtn");
const taskList = document.getElementById("taskList");

// Add task when button clicked
addTaskBtn.addEventListener("click", addTask);

// Add task when Enter key pressed
taskInput.addEventListener("keypress", function (e) {
  if (e.key === "Enter") {
    addTask();
  }
});

// Function to add a new task
function addTask() {
  const taskText = taskInput.value.trim();
  if (taskText === "") {
    alert("Please enter a task!");
    return;
  }

  const li = document.createElement("li");
  li.textContent = taskText;

  // Toggle complete on click
  li.addEventListener("click", function () {
    li.classList.toggle("completed");
  });

  // Delete button
  const deleteBtn = document.createElement("button");
  deleteBtn.textContent = "Delete";
  deleteBtn.style.marginLeft = "10px";
  deleteBtn.style.background = "#ff4d4d";
  deleteBtn.style.color = "white";
  deleteBtn.style.border = "none";
  deleteBtn.style.borderRadius = "5px";
  deleteBtn.style.padding = "5px 10px";
  deleteBtn.style.cursor = "pointer";

  deleteBtn.addEventListener("click", function (e) {
    e.stopPropagation(); // prevent strike-through when deleting
    li.remove();
  });

  li.appendChild(deleteBtn);
  taskList.appendChild(li);
  taskInput.value = "";
}

// Optional: completed task style
const style = document.createElement("style");
style.innerHTML = `
  .completed {
    text-decoration: line-through;
    color: gray;
    opacity: 0.7;
  }
`;
document.head.appendChild(style);
/* ============================
   BIND UI
   ============================ */

function bindUI() {
  // Add task form
  const form = $('#taskForm');
  if (form) {
    form.addEventListener('submit', (ev) => {
      ev.preventDefault();
      const text = $('#taskInput').value;
      const category = $('#taskCategory').value || 'general';
      const time = $('#taskTime').value || '';
      if (!text || !text.trim()) {
        alert('Please enter a task.');
        return;
      }
      addTask({ text, category, time });
      // clear input but keep category
      $('#taskInput').value = '';
      $('#taskTime').value = '';
      $('#taskInput').focus();
    });
  }

  // Suggest button (manual quick-suggest)
  $('#suggestBtn')?.addEventListener('click', () => {
    const s = computeSuggestions();
    if (!s || s.length === 0) {
      alert('No suggestions available yet.');
      return;
    }
    // open a simple chooser (prompt of top 5)
    const top = s.slice(0, 5).map((x, i) => `${i + 1}. ${x.text} (${x.count})`).join('\n');
    const pick = prompt(`Choose suggestion number:\n${top}\n\nEnter 1-${Math.min(5, s.length)}`, '1');
    const idx = Number(pick) - 1;
    if (isNaN(idx) || idx < 0 || idx >= s.length) return;
    $('#taskInput').value = s[idx].text;
    $('#taskInput').focus();
  });

  // Filter category
  $('#filterCategory')?.addEventListener('change', () => {
    renderTasksList($('#filterCategory').value || 'all');
  });

  // Clear completed
  $('#clearCompleted')?.addEventListener('click', () => {
    if (!confirm('Clear completed tasks for today?')) return;
    clearCompleted();
  });

  // Export & Import
  $('#exportBtn')?.addEventListener('click', () => {
    downloadJSON(`taskmanager-backup-${todayStr()}.json`, DB);
  });
  $('#importFile')?.addEventListener('change', (ev) => {
    const f = ev.target.files[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target.result);
        if (!parsed.tasksByDate) { alert('Invalid file'); return; }
        if (!confirm('This will replace your current local data. Continue?')) return;
        DB = parsed;
        saveDB();
        renderAll();
        alert('Import complete.');
      } catch (err) {
        alert('Could not parse file.');
      }
    };
    reader.readAsText(f);
  });

  // Export by keyboard (Ctrl+E) for power users
  window.addEventListener('keydown', (ev) => {
    if ((ev.ctrlKey || ev.metaKey) && ev.key.toLowerCase() === 'e') {
      ev.preventDefault();
      downloadJSON(`taskmanager-backup-${todayStr()}.json`, DB);
    }
  });
}
// ===== Task Manager JavaScript =====

// Get elements
const taskInput = document.getElementById("taskInput");
const addTaskBtn = document.getElementById("addTaskBtn");
const taskList = document.getElementById("taskList");

// Add task when button clicked
addTaskBtn.addEventListener("click", addTask);

// Add task when Enter key pressed
taskInput.addEventListener("keypress", function (e) {
  if (e.key === "Enter") {
    addTask();
  }
});

// Function to add a new task
function addTask() {
  const taskText = taskInput.value.trim();
  if (taskText === "") {
    alert("Please enter a task!");
    return;
  }

  const li = document.createElement("li");
  li.textContent = taskText;

  // Toggle complete on click
  li.addEventListener("click", function () {
    li.classList.toggle("completed")
  });

  // Delete button
  const deleteBtn = document.createElement("button");
  deleteBtn.textContent = "Delete";
  deleteBtn.style.marginLeft = "10px";
  deleteBtn.style.background = "#ff4d4d";
  deleteBtn.style.color = "white";
  deleteBtn.style.border = "none";
  deleteBtn.style.borderRadius = "5px";
  deleteBtn.style.padding = "5px 10px";
  deleteBtn.style.cursor = "pointer";

  deleteBtn.addEventListener("click", function (e) {
    e.stopPropagation(); // prevent strike-through when deleting
    li.remove();
  });

  li.appendChild(deleteBtn);
  taskList.appendChild(li);
  taskInput.value = "";
}

// Optional: completed task style
const style = document.createElement("style");
style.innerHTML = `
  .completed {
    text-decoration: line-through;
    color: gray;
    opacity: 0.7;
  }
`;
document.head.appendChild(style);
/* ============================
   MAIN RENDER ENTRY
   ============================ */

function renderAll() {
  renderSuggestions();
  renderStreaks();
  const filter = $('#filterCategory') ? $('#filterCategory').value : 'all';
  renderTasksList(filter);
}

/* ============================
   BOOT
   ============================ */
document.addEventListener('DOMContentLoaded', () => {
  loadDB();
  bindUI();
  renderAll();

  // small UI nicety: focus on task input
  const input = $('#taskInput');
  if (input) input.focus();
});
