
/* script.js
 * Preparation Meter logic (for the simple HTML scaffold)
 * - interactive subject sliders replacing <progress>
 * - gauge canvas and animation
 * - predicted score & AI comment
 *
 * Author: generated for Swayam Mishra
 * Date: 2025
 */

// ---------- Auto-filled user data (edit here or via window.PrepMeter.userData) ----------
const userData = {
  name: "Swayam Mishra",
  targetMarks: 99,             // % goal
  currentPercent: 82,          // approximate current overall %
  dailyStudyGoalHrs: 6,        // desired hours/day
  weeklyAverageHrs: 6,         // actual average hours/day
  subjects: {
    Maths: 85,
    Science: 75,
    English: 70,
    SST: 65
  },
  consistencyPercent: 83,      // how much of weekly target you hit (0-100)
  examDate: "March 2026"
};

// expose so you can tweak in console: window.PrepMeter.userData.currentPercent = 90; window.PrepMeter.render();
window.PrepMeter = { userData };

// ---------- Utility helpers ----------
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const to1 = v => Math.round(v * 10) / 10; // round to 1 decimal

function predictedRange(data) {
  // same logic as our earlier versions — small, interpretable projection
  const base = data.currentPercent;
  const consistencyBoost = (data.consistencyPercent - 72) * 0.12; // small scaling
  const hourBoost = (data.weeklyAverageHrs - 5.5) * 0.9; // each hour roughly helps
  const low = clamp(base + consistencyBoost + hourBoost - 1.2, 0, 100);
  const high = clamp(base + consistencyBoost + hourBoost + 2.2, 0, 100);
  return { low: to1(low), high: to1(high) };
}

// ---------- DOM helpers & element creation ----------
function $(sel) { return document.querySelector(sel); }
function create(tag, opts = {}) {
  const el = document.createElement(tag);
  if (opts.class) el.className = opts.class;
  if (opts.html) el.innerHTML = opts.html;
  if (opts.text) el.textContent = opts.text;
  if (opts.attrs) Object.entries(opts.attrs).forEach(([k,v]) => el.setAttribute(k,v));
  return el;
}

// ---------- Build the enhanced UI (gauge, sliders, meta info) ----------
function prepareUI() {
  const container = document.querySelector('.container') || document.body;
  // guard: if we've already injected, avoid duplication
  if (container.querySelector('.prep-enhanced')) return;

  const enhanced = create('div', { class: 'prep-enhanced' });
  enhanced.style.marginTop = '14px';
  enhanced.style.display = 'grid';
  enhanced.style.gridTemplateColumns = '320px 1fr';
  enhanced.style.gap = '14px';
  enhanced.style.alignItems = 'start';

  // LEFT: Gauge + basic stats
  const left = create('div');
  left.style.padding = '12px';
  left.style.borderRadius = '10px';
  left.style.background = 'linear-gradient(180deg, rgba(255,255,255,0.02), rgba(0,0,0,0.04))';
  left.style.boxShadow = '0 8px 20px rgba(0,0,0,0.45)';
  left.style.color = '#eaf6ff';

  // Gauge canvas
  const canvas = create('canvas', { attrs: { width: 260, height: 260 } });
  canvas.style.display = 'block';
  canvas.style.background = 'transparent';
  canvas.style.borderRadius = '50%';
  canvas.style.margin = '0 auto 10px';
  left.appendChild(canvas);

  // center big percent & small away text
  const pctWrap = create('div');
  pctWrap.style.textAlign = 'center';
  pctWrap.style.marginBottom = '8px';
  const big = create('div', { class: 'bigPct', text: userData.currentPercent + '%' });
  big.style.fontSize = '28px';
  big.style.fontWeight = '700';
  const small = create('div', { class: '
