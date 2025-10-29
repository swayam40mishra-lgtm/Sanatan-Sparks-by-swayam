/* script.js — Task Manager (vanilla JS)
   By: (implicitly) me. For: Swayam Mishra.
   Paste as `script.js` and keep it deferred in index.html.
*/

/* ============================
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
