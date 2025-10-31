<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Study Planner Dashboard — Mission 99</title>
  <meta name="description" content="Study Planner Dashboard — Mission 99 by Swayam Mishra." />
  <!-- Link to external CSS file (paste CSS into style.css) -->
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <!-- ===== Header / Mission Bar ===== -->
  <header id="app-header" role="banner" aria-labelledby="app-title">
    <div style="display:flex;align-items:center;justify-content:space-between;gap:1rem;">
      <div style="display:flex;align-items:center;gap:12px;">
        <svg width="56" height="56" viewBox="0 0 64 64" aria-hidden="true" focusable="false"><rect x="0" y="0" width="64" height="64" rx="10" fill="#0b2a4a"></rect><text x="50%" y="58%" font-family="sans-serif" font-size="20" text-anchor="middle" fill="#ffffff">TM</text></svg>
        <div>
          <h1 id="app-title">Study Planner Dashboard</h1>
          <div id="mission-strip">Mission: <strong id="mission-title">Mission 99 : 75 HARD DAYS</strong></div>
        </div>
      </div>
      <div style="text-align:right;">
        <div id="quoteDisplay" aria-live="polite">“One small comeback can change the day.”</div>
        <div style="font-size:0.85rem;color:#666;margin-top:6px;">Founder: <strong>Swayam Mishra</strong></div>
      </div>
    </div>
  </header>

  <main id="main" role="main">
    <div id="layout">
      <section id="planner-editor" aria-labelledby="editor-heading">
        <h2 id="editor-heading">Add / Edit Daily Entry</h2>
        <form id="planner-form" autocomplete="off" novalidate>
          <fieldset>
            <div>
              <label for="entryDate">Date</label>
              <input id="entryDate" name="date" type="date" />
            </div>
            <div>
              <label for="wakeTime">Wake time</label>
              <input id="wakeTime" name="wakeTime" type="time" />
            </div>
            <div>
              <label for="sleepTime">Sleep time</label>
              <input id="sleepTime" name="sleepTime" type="time" />
            </div>
            <div>
              <label for="studyTarget">Planned study hours (today)</label>
              <input id="studyTarget" name="studyTarget" type="number" min="0" step="0.25" placeholder="e.g., 4" />
            </div>
            <div>
              <label for="breakInterval">Break interval (minutes)</label>
              <select id="breakInterval" name="breakInterval">
                <option value="25">25</option>
                <option value="30" selected>30</option>
                <option value="45">45</option>
                <option value="60">60</option>
              </select>
            </div>
            <div>
              <label for="schoolToggle">School today</label>
              <input id="schoolToggle" name="schoolToggle" type="checkbox" />
              <label for="schoolFrom">From</label>
              <input id="schoolFrom" name="schoolFrom" type="time" />
              <label for="schoolTo">To</label>
              <input id="schoolTo" name="schoolTo" type="time" />
            </div>
            <div>
              <label for="mealBreakfast">Breakfast time</label>
              <input id="mealBreakfast" name="mealBreakfast" type="time" />
            </div>
            <div>
              <label for="mealLunch">Lunch time</label>
              <input id="mealLunch" name="mealLunch" type="time" />
            </div>
            <div>
              <label for="mealDinner">Dinner time</label>
              <input id="mealDinner" name="mealDinner" type="time" />
            </div>
          </fieldset>

          <hr/>

          <fieldset>
            <legend>Tasks for the day</legend>
            <p class="muted">Add one task per row. Give a short target (e.g., "15 RD Questions", "4 pages").</p>
            <div id="tasksArea" aria-live="polite">
              <div class="task-row" data-index="0">
                <label>Subject</label>
                <select class="task-subject" name="subject-0"><option value="maths">Maths</option><option value="science">Science</option><option value="sst">SST</option><option value="hindi">Hindi</option><option value="english">English</option><option value="other">Other</option></select>
                <label>Task</label>
                <input class="task-desc" name="desc-0" type="text" placeholder="e.g., RD Sharma — 15 Qs" />
                <label>Target / estimate</label>
                <input class="task-target" name="target-0" type="text" placeholder="e.g., 15 Qs / 4 pages / 1 chapter" />
                <label>Est. hrs (opt)</label>
                <input class="task-hours" name="hours-0" type="number" step="0.25" min="0" placeholder="e.g., 1" />
                <button type="button" class="remove-task" aria-label="Remove this task">Remove</button>
              </div>
            </div>
            <div style="margin-top:0.75rem;"><button type="button" id="addTaskRowBtn">+ Add task row</button></div>
          </fieldset>

          <hr/>

          <fieldset>
            <legend>Resources (notes / files)</legend>
            <p class="muted">Attach study notes or links for the day (saved locally).</p>
            <input id="resourceUpload" type="file" accept=".pdf,.png,.jpg,.jpeg,.txt" multiple />
            <div id="resourcesList" aria-live="polite"></div>
          </fieldset>

          <div style="margin-top:0.75rem;">
            <button type="button" id="saveEntryBtn">Save Entry</button>
            <button type="button" id="clearEntryBtn">Clear</button>
            <label style="margin-left:8px;"><input id="autoSaveToggle" type="checkbox" /> Auto-save drafts</label>
          </div>
        </form>
      </section>

      <aside id="planner-dashboard" aria-labelledby="dashboard-heading">
        <h2 id="dashboard-heading">Saved Entries</h2>
        <p class="muted">Cards below show your saved daily entries. Click a card to load it into the editor.</p>

        <div id="controls" style="display:flex;gap:0.5rem;flex-wrap:wrap;margin:0.5rem 0;">
          <select id="filterRange">
            <option value="all">All</option>
            <option value="today">Today</option>
            <option value="week">This week</option>
            <option value="month">This month</option>
          </select>

          <select id="filterSubject">
            <option value="all">All subjects</option>
            <option value="maths">Maths</option>
            <option value="science">Science</option>
            <option value="sst">SST</option>
            <option value="hindi">Hindi</option>
            <option value="english">English</option>
          </select>

          <button type="button" id="refreshDashboardBtn">Refresh</button>
          <button type="button" id="exportAllBtn">Export All</button>
        </div>

        <div id="entriesList" aria-live="polite" style="display:flex;flex-direction:column;gap:0.75rem; max-height:520px; overflow:auto;">
          <!-- JS will populate entry cards here -->
        </div>

        <div id="quick-stats" style="margin-top:1rem;">
          <h3>Quick Summary</h3>
          <div>
            <div>Yesterday: <strong id="stat-prev-hours">—</strong> hrs</div>
            <div>This week avg: <strong id="stat-week-hours">—</strong> hrs/day</div>
            <div>Most studied: <strong id="stat-mfreq">—</strong></div>
            <div>Streak: <strong id="stat-streak">—</strong> days</div>
          </div>
          <div id="chartPlaceholder" style="margin-top:0.5rem;">
            <svg id="progressChart" width="100%" height="80" viewBox="0 0 400 80" preserveAspectRatio="none" role="img" aria-hidden="true"></svg>
          </div>
        </div>
      </aside>
    </div>

    <hr style="margin:1.25rem 0;" />

    <section id="generate-plan">
      <h2 id="generate-title">Generate Plan</h2>
      <p class="muted">Generate a schedule for a date based on your saved entries, yesterday's hours, and weekly patterns.</p>

      <div style="display:flex;gap:0.5rem;flex-wrap:wrap;align-items:center;">
        <label for="generateForDate">Generate for</label>
        <input id="generateForDate" type="date" />
        <button type="button" id="generatePlanBtn">Generate Plan</button>
        <button type="button" id="applyGeneratedBtn">Apply to Form</button>
        <button type="button" id="saveGeneratedBtn" class="ghost">Save Generated</button>
      </div>

      <div id="generatedPlanPreview" aria-live="polite" style="margin-top:0.75rem;">
        <p class="muted">No plan generated yet. Generated plan preview will appear here with timeslots, breaks and task assignments.</p>
      </div>
    </section>

    <hr style="margin:1.25rem 0;" />

    <section id="founder-note">
      <h3 id="founder-title">A short note</h3>
      <p id="founder-message">From the founder's desk — <strong>Swayam Mishra</strong>: "Consistency over intensity. Plan well, follow the plan, and adjust honestly. You're building a habit, not a one-day miracle."</p>
    </section>
  </main>

  <footer id="app-footer" role="contentinfo">
    <div><small class="muted">This HTML links to style.css and planner.js — add those files in the same folder.</small></div>
  </footer>

  <!-- Template for task row (required by planner.js) -->
  <template id="taskRowTemplate">
    <div class="task-row" role="group">
      <label>Subject</label>
      <select class="task-subject">
        <option value="">Select subject</option>
        <option value="maths">Maths</option>
        <option value="science">Science</option>
        <option value="sst">SST</option>
        <option value="hindi">Hindi</option>
        <option value="english">English</option>
        <option value="other">Other</option>
      </select>
      <label>Task</label>
      <input class="task-desc" type="text" placeholder="e.g., RD Sharma — 15 Qs" />
      <label>Target</label>
      <input class="task-target" type="text" placeholder="e.g., 15 Qs / 4 pages / 1 chapter" />
      <label>Est hrs</label>
      <input class="task-hours" type="number" step="0.25" min="0" />
      <button type="button" class="remove-task">Remove</button>
    </div>
  </template>

  <!-- Link to external JS file (paste JS into planner.js) -->
  <script src="planner.js" defer></script>
</body>
</html>
