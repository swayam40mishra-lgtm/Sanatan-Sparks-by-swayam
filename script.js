document.addEventListener("DOMContentLoaded", () => {
  const introScreen = document.getElementById("introScreen");
  const boardBtn = document.getElementById("boardBtn");
  const mainContent = document.getElementById("mainContent");
  const page = document.getElementById("page");
  const hero = document.querySelector(".hero");
  const introTitle = document.querySelector(".intro-card h1");
  const introCard = document.querySelector(".intro-card");
  const revealItems = document.querySelectorAll(".reveal");
  const stations = Array.from(document.querySelectorAll(".station"));

  if (!introScreen || !boardBtn || !mainContent || !page) return;

  /* ---------- injected premium UI ---------- */
  const style = document.createElement("style");
  style.textContent = `
    .journey-progress{
      position:fixed;
      top:14px;
      left:50%;
      transform:translateX(-50%);
      z-index:9999;
      width:min(920px, 92vw);
      padding:12px 14px;
      border-radius:18px;
      background:rgba(255,255,255,0.72);
      border:1px solid rgba(123,92,246,0.16);
      box-shadow:0 14px 36px rgba(109,40,217,0.14);
      backdrop-filter:blur(16px);
      opacity:0;
      pointer-events:none;
      transition:opacity .4s ease, transform .4s ease;
    }

    .journey-progress.show{
      opacity:1;
      pointer-events:auto;
    }

    .journey-progress-top{
      display:flex;
      align-items:center;
      justify-content:space-between;
      gap:12px;
      margin-bottom:10px;
      flex-wrap:wrap;
    }

    .journey-progress-title{
      font-weight:800;
      color:#3a2362;
      letter-spacing:-.2px;
      font-size:.98rem;
    }

    .journey-progress-status{
      font-weight:700;
      color:#6d28d9;
      font-size:.92rem;
    }

    .journey-progress-track{
      width:100%;
      height:10px;
      border-radius:999px;
      background:rgba(139,92,246,0.12);
      overflow:hidden;
      position:relative;
    }

    .journey-progress-fill{
      height:100%;
      width:0%;
      border-radius:999px;
      background:linear-gradient(90deg, #8b5cf6, #c084fc);
      box-shadow:0 0 18px rgba(139,92,246,0.3);
      transition:width .45s ease;
    }

    .journey-progress-sub{
      margin-top:8px;
      color:#66567f;
      font-size:.9rem;
      line-height:1.45;
    }

    .route-ticket{
      margin-top:18px;
      padding:16px 16px 14px;
      border-radius:22px;
      background:
        radial-gradient(circle at top left, rgba(255,255,255,0.9), transparent 28%),
        linear-gradient(180deg, rgba(255,255,255,0.9), rgba(255,255,255,0.68));
      border:1px solid rgba(123,92,246,0.16);
      box-shadow:0 16px 30px rgba(109,40,217,0.10);
      position:relative;
      overflow:hidden;
    }

    .route-ticket::after{
      content:"BOARDING PASS";
      position:absolute;
      top:14px;
      right:-30px;
      transform:rotate(18deg);
      font-size:.72rem;
      font-weight:800;
      letter-spacing:2px;
      color:rgba(109,40,217,0.15);
    }

    .ticket-label{
      display:inline-flex;
      align-items:center;
      gap:8px;
      padding:8px 12px;
      border-radius:999px;
      background:rgba(139,92,246,0.12);
      color:#6d28d9;
      font-weight:800;
      font-size:.88rem;
      margin-bottom:10px;
    }

    .ticket-route{
      font-size:1.02rem;
      font-weight:800;
      color:#39235f;
      line-height:1.5;
      margin-bottom:6px;
    }

    .ticket-sub{
      color:#66567f;
      line-height:1.65;
      font-size:.95rem;
    }

    .route-mini{
      display:flex;
      flex-wrap:wrap;
      gap:8px;
      margin-top:12px;
    }

    .route-mini span{
      padding:7px 10px;
      border-radius:999px;
      background:rgba(255,255,255,0.76);
      border:1px solid rgba(123,92,246,0.12);
      color:#5b4779;
      font-weight:700;
      font-size:.84rem;
    }

    .station.active .station-card{
      border-color:rgba(139,92,246,0.34);
      box-shadow:0 18px 40px rgba(139,92,246,0.16);
      transform:translateY(-2px);
    }

    .station.active .station-icon{
      background:linear-gradient(135deg, rgba(139,92,246,0.26), rgba(192,132,252,0.26));
      transform:scale(1.06);
    }

    .station.complete .station-card{
      border-color:rgba(139,92,246,0.20);
    }

    .train.boost{
      animation:moveTrain .9s ease-in-out 1, bounceTrain .8s ease-in-out 1;
    }

    @keyframes bounceTrain{
      0%,100%{ transform:translateY(0); }
      50%{ transform:translateY(-7px); }
    }

    .particles-canvas{
      position:fixed;
      inset:0;
      pointer-events:none;
      z-index:0;
      opacity:.9;
    }

    .hero.highlight{
      box-shadow:0 22px 60px rgba(109,40,217,0.22);
      border-color:rgba(139,92,246,0.22);
    }

    .final-stamp{
      display:inline-flex;
      align-items:center;
      justify-content:center;
      margin-top:18px;
      padding:12px 16px;
      border-radius:16px;
      background:linear-gradient(135deg, #8b5cf6, #c084fc);
      color:white;
      font-weight:900;
      letter-spacing:1px;
      box-shadow:0 16px 28px rgba(139,92,246,0.22);
      animation:stampPop .7s ease both;
    }

    @keyframes stampPop{
      from{ transform:scale(.7) rotate(-8deg); opacity:0; }
      to{ transform:scale(1) rotate(0deg); opacity:1; }
    }

    @media (max-width: 700px){
      .journey-progress{
        top:10px;
        padding:10px 12px;
        border-radius:16px;
      }

      .journey-progress-title{
        font-size:.92rem;
      }

      .journey-progress-status,
      .journey-progress-sub{
        font-size:.84rem;
      }

      .route-ticket{
        padding:14px 14px 12px;
        border-radius:18px;
      }
    }
  `;
  document.head.appendChild(style);

  const progress = document.createElement("div");
  progress.className = "journey-progress";
  progress.innerHTML = `
    <div class="journey-progress-top">
      <div class="journey-progress-title">🚆 Muskan Express Live Route</div>
      <div class="journey-progress-status" id="progressStatus">Boarded • Waiting to depart</div>
    </div>
    <div class="journey-progress-track">
      <div class="journey-progress-fill" id="progressFill"></div>
    </div>
    <div class="journey-progress-sub" id="progressSub">
      Destination locked: 12 June 2026
    </div>
  `;
  page.prepend(progress);

  const ticket = document.createElement("aside");
  ticket.className = "route-ticket";
  ticket.innerHTML = `
    <div class="ticket-label">🎫 Journey Ticket</div>
    <div class="ticket-route">13 May → 12 June • Muskan Express</div>
    <div class="ticket-sub">
      Route type: First hello → 3-hour platform stop → confession junction → red signals → green signal → destination reached
    </div>
    <div class="route-mini">
      <span>Lavender Route</span>
      <span>Memory Train</span>
      <span>Special Line</span>
    </div>
  `;
  const heroText = document.querySelector(".hero-text");
  if (heroText) heroText.appendChild(ticket);

  /* ---------- canvas particles ---------- */
  const canvas = document.createElement("canvas");
  canvas.className = "particles-canvas";
  document.body.appendChild(canvas);

  const ctx = canvas.getContext("2d");
  let cw = 0;
  let ch = 0;
  let rafId = null;
  const particles = [];

  function resizeCanvas() {
    cw = canvas.width = window.innerWidth;
    ch = canvas.height = window.innerHeight;
  }

  function random(min, max) {
    return Math.random() * (max - min) + min;
  }

  function seedParticles(count = 42) {
    particles.length = 0;
    for (let i = 0; i < count; i++) {
      particles.push({
        x: random(0, cw),
        y: random(0, ch),
        r: random(1.2, 3.4),
        vy: random(0.18, 0.65),
        vx: random(-0.22, 0.22),
        alpha: random(0.12, 0.42),
        pulse: random(0.008, 0.022)
      });
    }
  }

  function drawParticles() {
    ctx.clearRect(0, 0, cw, ch);

    for (const p of particles) {
      p.y -= p.vy;
      p.x += p.vx;
      p.alpha += p.pulse;

      if (p.alpha > 0.5 || p.alpha < 0.1) p.pulse *= -1;

      if (p.y < -10) {
        p.y = ch + 10;
        p.x = random(0, cw);
      }

      if (p.x < -10) p.x = cw + 10;
      if (p.x > cw + 10) p.x = -10;

      ctx.beginPath();
      ctx.fillStyle = `rgba(139, 92, 246, ${p.alpha})`;
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }

    rafId = requestAnimationFrame(drawParticles);
  }

  resizeCanvas();
  seedParticles();
  drawParticles();

  window.addEventListener("resize", () => {
    resizeCanvas();
    seedParticles();
  });

  /* ---------- intro typewriter ---------- */
  function typeWriter(el, text, speed = 55) {
    if (!el) return Promise.resolve();
    el.textContent = "";
    let i = 0;

    return new Promise((resolve) => {
      const tick = () => {
        el.textContent += text.charAt(i);
        i += 1;
        if (i < text.length) {
          setTimeout(tick, speed);
        } else {
          resolve();
        }
      };
      tick();
    });
  }

  /* ---------- reveal helpers ---------- */
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) entry.target.classList.add("visible");
    });
  }, { threshold: 0.16 });

  revealItems.forEach((item) => revealObserver.observe(item));

  const stationObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const station = entry.target;
      if (entry.isIntersecting) {
        station.classList.add("show", "active");
        const prev = station.previousElementSibling;
        if (prev && prev.classList && prev.classList.contains("station")) {
          prev.classList.add("complete");
          prev.classList.remove("active");
        }
      } else {
        station.classList.remove("active");
      }
    });
  }, { threshold: 0.45 });

  stations.forEach((station) => stationObserver.observe(station));

  /* ---------- progress tracker ---------- */
  const progressFill = document.getElementById("progressFill");
  const progressStatus = document.getElementById("progressStatus");
  const progressSub = document.getElementById("progressSub");

  function updateProgress() {
    if (!stations.length) return;

    const viewportCenter = window.innerHeight * 0.55;
    let activeIndex = 0;

    stations.forEach((station, index) => {
      const rect = station.getBoundingClientRect();
      if (rect.top <= viewportCenter) activeIndex = index;
    });

    const pct = Math.round(((activeIndex + 1) / stations.length) * 100);
    if (progressFill) progressFill.style.width = `${pct}%`;

    const activeStation = stations[activeIndex];
    const title = activeStation?.querySelector(".station-head h4")?.textContent?.trim() || "Boarded";
    const date = activeStation?.querySelector(".station-head span")?.textContent?.trim() || "Waiting to depart";

    if (progressStatus) progressStatus.textContent = `Current stop: ${title}`;
    if (progressSub) progressSub.textContent = `${date} • Route progress ${pct}%`;

    if (progress) progress.classList.add("show");
  }

  window.addEventListener("scroll", updateProgress, { passive: true });
  window.addEventListener("resize", updateProgress);
  setTimeout(updateProgress, 250);

  /* ---------- board the train ---------- */
  boardBtn.addEventListener("click", async () => {
    boardBtn.disabled = true;
    boardBtn.textContent = "Departing...";

    if (introTitle) {
      await typeWriter(introTitle, "Muskan Express");
    }

    introScreen.style.transition = "opacity .65s ease, transform .65s ease";
    introScreen.style.opacity = "0";
    introScreen.style.transform = "scale(0.985)";

    if (hero) hero.classList.add("highlight");

    const train = document.querySelector(".train");
    if (train) {
      train.classList.add("boost");
      setTimeout(() => train.classList.remove("boost"), 950);
    }

    setTimeout(() => {
      introScreen.style.display = "none";
      mainContent.style.display = "block";
      mainContent.style.opacity = "0";
      mainContent.style.transition = "opacity .7s ease";

      requestAnimationFrame(() => {
        mainContent.style.opacity = "1";
      });

      progress.classList.add("show");

      revealItems.forEach((item, index) => {
        setTimeout(() => item.classList.add("visible"), index * 120);
      });

      updateProgress();

      const finalCard = document.querySelector(".final-card");
      if (finalCard && !document.querySelector(".final-stamp")) {
        const stamp = document.createElement("div");
        stamp.className = "final-stamp";
        stamp.textContent = "DESTINATION REACHED";
        finalCard.appendChild(stamp);
      }
    }, 650);
  });

  /* ---------- small auto-reveal on load ---------- */
  setTimeout(() => {
    introScreen.style.opacity = "1";
    introScreen.style.transform = "none";
  }, 60);
});
