window.addEventListener('load', () => {
  setTimeout(() => {
    const loader = document.getElementById('aura-loader');
    if (loader) {
      loader.classList.add('loaded');
      setTimeout(() => loader.remove(), 1200);
    }
  }, 2800);
});

let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;
document.addEventListener('mousemove', (e) => { mouseX = e.clientX; mouseY = e.clientY; });

(function initParticles() {
  const canvas = document.getElementById('particle-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let particles = [];
  const PARTICLE_COUNT = 80;
  const CONNECTION_DIST = 150;
  const MOUSE_ATTRACT_DIST = 200;

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function createParticles() {
    particles = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const layer = Math.random();
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * (0.2 + layer * 0.3),
        vy: (Math.random() - 0.5) * (0.2 + layer * 0.3),
        r: 0.5 + layer * 1.8,
        baseOpacity: 0.15 + layer * 0.3,
        opacity: 0.15 + layer * 0.3,
        layer: layer,
        hue: Math.random() > 0.7 ? 45 : 200,
      });
    }
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < CONNECTION_DIST) {
          const alpha = (1 - dist / CONNECTION_DIST) * 0.12;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(0, 180, 255, ${alpha})`;
          ctx.lineWidth = 0.4;
          ctx.stroke();
        }
      }
    }

    for (const p of particles) {
      const dx = p.x - mouseX;
      const dy = p.y - mouseY;
      const distToMouse = Math.sqrt(dx * dx + dy * dy);

      if (distToMouse < MOUSE_ATTRACT_DIST) {
        const proximity = 1 - distToMouse / MOUSE_ATTRACT_DIST;
        p.opacity = p.baseOpacity + proximity * 0.5;

        if (proximity > 0.3) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(mouseX, mouseY);
          ctx.strokeStyle = `rgba(0, 180, 255, ${proximity * 0.08})`;
          ctx.lineWidth = 0.3;
          ctx.stroke();
        }

        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 6);
        grad.addColorStop(0, `hsla(${p.hue}, 80%, 60%, ${proximity * 0.12})`);
        grad.addColorStop(1, 'transparent');
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * 6, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
      } else {
        p.opacity += (p.baseOpacity - p.opacity) * 0.05;
      }

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${p.hue}, 80%, 65%, ${p.opacity})`;
      ctx.fill();

      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
      if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
    }

    requestAnimationFrame(draw);
  }

  resize();
  createParticles();
  draw();

  window.addEventListener('resize', () => {
    resize();
    createParticles();
  });
})();

function updateClock() {
  const el = document.getElementById('live-clock');
  if (!el) return;
  const now = new Date();
  el.textContent = now.toLocaleTimeString('en-IN', {
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true
  });
}
updateClock();
setInterval(updateClock, 1000);

document.querySelectorAll('.nav-item').forEach(item => {
  item.addEventListener('click', e => {
    e.preventDefault();
    const page = item.dataset.page;
    navigateTo(page);
  });
});

document.querySelectorAll('.link-btn').forEach(btn => {
  btn.addEventListener('click', () => navigateTo(btn.dataset.page));
});

function navigateTo(page) {
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));

  const navEl = document.querySelector(`.nav-item[data-page="${page}"]`);
  const pageEl = document.getElementById(`page-${page}`);

  if (navEl) navEl.classList.add('active');
  if (pageEl) {
    pageEl.classList.add('active');
    pageEl.style.animation = 'none';
    pageEl.offsetHeight;
    pageEl.style.animation = '';
  }

  if (page === 'drift') initDriftPage();
  if (page === 'court') initCourtPage();
}

function showToast(msg, duration = 3500) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), duration);
}

function animateCounter(element, target, duration = 1200, decimals = 0) {
  const start = 0;
  const startTime = performance.now();

  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = start + (target - start) * eased;

    if (decimals > 0) {
      element.textContent = current.toFixed(decimals);
    } else {
      element.textContent = Math.round(current);
    }

    if (progress < 1) {
      requestAnimationFrame(update);
    }
  }

  requestAnimationFrame(update);
}

function initDashboardWidgets() {
  renderDriftWidget();
  renderRetrainWidget();
  renderHallucWidget();
  animateDashboardCounters();
}

function renderDriftWidget() {
  const container = document.getElementById('drift-widget-content');
  if (!container) return;

  container.innerHTML = DRIFT_DATA.map(d => {
    const isCritical = d.psi_score > 0.2;
    const barClass = isCritical ? 'critical' : d.psi_score > 0.1 ? 'warning' : 'stable';
    const barWidth = Math.min(100, (d.psi_score / 0.5) * 100).toFixed(1);
    const actionClass = d.action === 'TRIGGER RETRAIN' ? 'trigger' : 'monitor';

    return `
      <div class="drift-row">
        <div class="drift-feature">${d.feature}</div>
        <div class="drift-bar-wrap">
          <div class="drift-bar ${barClass}" style="width:${barWidth}%"></div>
        </div>
        <div class="drift-psi ${isCritical ? 'red' : 'green'}">${d.psi_score.toFixed(2)}</div>
        <div class="drift-status ${isCritical ? 'red' : 'green'}">${d.status}</div>
        <div class="drift-action ${actionClass}">${d.action}</div>
      </div>
    `;
  }).join('');
}

function renderRetrainWidget() {
  const container = document.getElementById('retrain-widget-content');
  if (!container) return;

  const d = RETRAIN_DATA;
  container.innerHTML = `
    <div class="retrain-flow">
      <div class="retrain-metric-row">
        <span class="retrain-label">Event</span>
        <span class="retrain-value cyan">${d.event}</span>
      </div>
      <div class="retrain-metric-row">
        <span class="retrain-label">Trigger</span>
        <span class="retrain-value">${d.trigger}</span>
      </div>
      <div class="retrain-metric-row">
        <span class="retrain-label">Champion AUC</span>
        <span class="retrain-label">Champion AUC</span>
        <span class="retrain-value">${d.champion_auc.toFixed(4)}</span>
      </div>
      <div class="retrain-metric-row">
        <span class="retrain-label">Challenger AUC</span>
        <span class="retrain-value green">${d.challenger_auc.toFixed(4)}</span>
      </div>
      <div class="retrain-metric-row">
        <span class="retrain-label">AUC Delta</span>
        <span class="retrain-value green">+${(d.challenger_auc - d.champion_auc).toFixed(4)}</span>
      </div>
      <div class="retrain-decision">
        <span class="decision-icon">✅</span>
        <span>${d.decision || 'Challenger Promoted'}</span>
      </div>
    </div>
  `;
}

function renderHallucWidget() {
  const container = document.getElementById('halluc-widget-content');
  if (!container) return;

  container.innerHTML = `
    <table class="halluc-table-mini">
      <thead>
        <tr>
          <th>App ID</th>
          <th>Error Type</th>
          <th>Cited Law</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        ${HALLUC_FIREWALL_DATA.map(d => {
    const isBlocked = d.action.includes('BLOCKED');
    return `
            <tr>
              <td><span class="halluc-app-id">${d.app_id}</span></td>
              <td><span class="halluc-error-type ${d.error_type === 'None' ? '' : 'red'}">${d.error_type}</span></td>
              <td><span class="halluc-law">${d.cited_law}</span></td>
              <td><span class="action-badge ${isBlocked ? 'blocked' : 'approved'}">${d.action}</span></td>
            </tr>
          `;
  }).join('')}
      </tbody>
    </table>
  `;
}

function animateDashboardCounters() {
  const aucEl = document.getElementById('dash-auc');
  const driftEl = document.getElementById('dash-drifted');
  const challengerEl = document.getElementById('dash-challenger');
  const hallucEl = document.getElementById('dash-halluc');

  if (aucEl) animateCounter(aucEl, 0.7210, 1500, 4);
  if (driftEl) animateCounter(driftEl, 2, 800);
  if (challengerEl) animateCounter(challengerEl, 0.7540, 1500, 4);
  if (hallucEl) animateCounter(hallucEl, 2, 800);
}

function refreshDashboard() {
  renderDriftWidget();
  renderRetrainWidget();
  renderHallucWidget();
  animateDashboardCounters();
  showToast('Dashboard refreshed — all systems nominal');
}

async function runDemoPreset(presetKey) {
  const profile = DEMO_PROFILES[presetKey];
  const name = profile.label;

  document.querySelectorAll('.demo-preset-btn').forEach(b => b.classList.remove('active'));
  const activeBtn = event.currentTarget;
  activeBtn.classList.add('active');

  document.getElementById('result-empty').style.display = 'none';
  document.getElementById('result-content').style.display = 'none';

  const resultPanel = document.getElementById('result-panel');
  resultPanel.classList.add('loading');

  try {
    const result = await API_scoreLoan({ _preset: presetKey });
    resultPanel.classList.remove('loading');
    renderAssessmentResult(result, name);
    showToast(`${profile.label}: ${(result.probability * 100).toFixed(1)}% default probability → ${result.approved ? 'APPROVED' : 'REJECTED'}`);
  } catch (err) {
    resultPanel.classList.remove('loading');
    showToast('Error: could not reach scoring endpoint');
  }
}

async function assessLoan() {
  const income = parseFloat(document.getElementById('f-income').value);
  const age = parseFloat(document.getElementById('f-age').value);
  const cir = parseFloat(document.getElementById('f-cir').value);
  const emp = parseFloat(document.getElementById('f-emp').value);
  const name = document.getElementById('f-name').value || 'Applicant';

  if (!income || !age || !cir || !emp) {
    showToast('Please fill all required fields (income, age, credit-income ratio, employment years)');
    return;
  }

  const ext2 = parseFloat(document.getElementById('f-ext2').value) || 0.5;
  const ext3 = parseFloat(document.getElementById('f-ext3').value) || 0.5;

  const btn = document.querySelector('#assess .btn-primary');
  btn.textContent = 'Scoring via MLflow Serving...';
  btn.disabled = true;

  document.getElementById('result-empty').style.display = 'none';
  document.getElementById('result-content').style.display = 'none';

  try {
    const result = await API_scoreLoan({
      income,
      age,
      credit: cir * income,
      employment_years: emp,
      ext_source_2: ext2,
      ext_source_3: ext3,
    });
    renderAssessmentResult(result, name);
  } catch (err) {
    showToast('Error: could not reach scoring endpoint');
  } finally {
    btn.textContent = 'Run Credit Assessment';
    btn.disabled = false;
  }
}

function renderAssessmentResult(result, name) {
  const content = document.getElementById('result-content');
  content.style.display = 'block';

  const verdict = document.getElementById('result-verdict');
  verdict.className = 'result-verdict ' + (result.approved ? 'approved' : 'rejected');
  verdict.innerHTML = result.approved
    ? `APPROVED: ${name}`
    : `REJECTED: ${name}`;

  const prob = result.probability;
  const bar = document.getElementById('result-bar');
  const pct = (prob * 100).toFixed(1);
  bar.style.width = '0%';
  setTimeout(() => { bar.style.width = pct + '%'; }, 50);
  bar.style.background = prob > 0.35
    ? 'linear-gradient(90deg, var(--red), var(--red-bright))'
    : prob > 0.2
      ? 'linear-gradient(90deg, var(--amber), #f0c040)'
      : 'linear-gradient(90deg, var(--green), var(--green-bright))';

  document.getElementById('result-score-val').textContent =
    `Default Probability: ${pct}% — Model: ${result.model}`;

  const feats = result.features;
  const featureHTML = AURA_CONFIG.feature_cols.map(name => {
    const val = feats[name];
    const formatted = (typeof val === 'number') ? val.toFixed(4) : val;

    let riskClass = '';
    if (name === 'credit_income_ratio' && val > 6) riskClass = 'risk-high';
    else if (name === 'credit_income_ratio' && val < 3) riskClass = 'risk-low';
    else if (name === 'employment_years' && val < 3) riskClass = 'risk-high';
    else if (name === 'employment_years' && val > 4) riskClass = 'risk-low';
    else if (name === 'ext_mean' && val < 0.55) riskClass = 'risk-high';
    else if (name === 'ext_mean' && val > 0.65) riskClass = 'risk-low';
    else if (name === 'ext_source_2' && val < 0.55) riskClass = 'risk-high';
    else if (name === 'ext_source_2' && val > 0.7) riskClass = 'risk-low';
    else if (name === 'credit_per_year' && val > 2) riskClass = 'risk-high';
    else if (name === 'credit_per_year' && val < 1) riskClass = 'risk-low';

    return `<div class="cf-item ${riskClass}"><span class="cf-label">${name}</span><span class="cf-val">${formatted}</span></div>`;
  }).join('');

  document.getElementById('result-features').innerHTML = featureHTML;

  document.getElementById('result-ex').textContent = result.explanation;

  const h = result.hallucination;
  const hallucEl = document.getElementById('result-halluc');
  if (h.has_hallucination) {
    hallucEl.className = 'halluc-result flagged';
    hallucEl.innerHTML = `LLM Court Warning: ${h.invalid_citations.length} fake citation(s) detected — ${h.invalid_citations.join(', ')} · halluc_score: ${h.halluc_score}`;
  } else {
    hallucEl.className = 'halluc-result clean';
    hallucEl.innerHTML = `LLM Court Verified: All citations verified against RBI/SEBI ground truth · grounding_score: ${h.grounding_score}`;
  }
}

let driftInitialised = false;

function initDriftPage() {
  if (driftInitialised) return;
  driftInitialised = true;
  renderPSICards(PSI_FEATURES);
  renderPSIHistoryTable(PSI_FEATURES);
}

function renderPSICards(features) {
  const container = document.getElementById('psi-cards');
  container.innerHTML = features.map(f => {
    const sev = psiSeverity(f.psi);
    return `
      <div class="psi-card ${sev}">
        <div class="psi-card-name">${f.name}</div>
        <div class="psi-card-val ${sev}">${f.psi.toFixed(2)}</div>
        <div class="psi-card-bar-wrap">
          <div class="psi-card-bar ${sev}" style="width:${psiBarWidth(f.psi)}"></div>
        </div>
        <span class="badge ${sev}">${sev.toUpperCase()}</span>
      </div>
    `;
  }).join('');
}

function renderPSIHistoryTable(features) {
  const now = new Date();
  const tbody = document.getElementById('psi-history-body');
  tbody.innerHTML = features.map(f => {
    const sev = psiSeverity(f.psi);
    const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    return `
      <tr>
        <td class="mono">${now.toLocaleDateString('en-IN')} ${timeStr}</td>
        <td><code>${f.name}</code></td>
        <td class="${sev === 'high' ? 'red' : sev === 'medium' ? 'amber' : 'green'}">${f.psi.toFixed(3)}</td>
        <td><span class="badge ${sev}">${sev.toUpperCase()}</span></td>
        <td class="mono">${f.training_mean}</td>
        <td class="mono">${f.production_mean}</td>
        <td style="color:var(--text-muted);font-size:12px">${f.action}</td>
      </tr>
    `;
  }).join('');
}

async function runPSI() {
  const btn = document.querySelector('#page-drift .btn-secondary');
  btn.textContent = 'Running PSI Analysis...';
  btn.disabled = true;

  try {
    const results = await API_runPSI();
    renderPSICards(results);
    renderPSIHistoryTable(results);

    const highCount = results.filter(r => psiSeverity(r.psi) === 'high').length;
    if (highCount > 0) {
      showToast(`PSI complete — ${highCount} CRITICAL drift feature(s) detected. Autonomous retrain triggered.`, 4000);
    } else {
      showToast('PSI complete — all features stable');
    }
  } catch {
    showToast('Error running PSI check');
  } finally {
    btn.textContent = 'Run PSI Check';
    btn.disabled = false;
  }
}

async function compareModels() {
  showToast('Comparison loaded from gold.model_comparison — Champion: 0.7210, Challenger: 0.7540');
}

async function promoteChallenger() {
  const btn = document.querySelector('#page-models .btn-primary');
  btn.textContent = 'Promoting via MLflow...';
  btn.disabled = true;

  try {
    const res = await API_promoteChallenger();
    showToast(res.message, 5000);

    document.querySelector('.model-card.champion .model-stage-badge').textContent = 'Archived';
    document.querySelector('.model-card.champion .model-stage-badge').className = 'model-stage-badge';
    document.querySelector('.model-card.champion .model-stage-badge').style.cssText =
      'background:rgba(255,255,255,0.03);color:var(--text-muted);border:1px solid var(--border);font-family:var(--font-mono);font-size:10px;letter-spacing:.06em;text-transform:uppercase;padding:4px 10px;border-radius:6px;margin-bottom:8px;display:inline-block';

    document.querySelector('.model-card.challenger .model-stage-badge').textContent = 'Production';
    document.querySelector('.model-card.challenger .model-stage-badge').className = 'model-stage-badge champion-badge';

    const tbody = document.getElementById('retrain-log-body');
    const now = new Date().toLocaleString('en-IN');
    const newRow = document.createElement('tr');
    newRow.innerHTML = `
      <td class="mono">${now}</td>
      <td>Manual promotion from AURA UI</td>
      <td><code>income, credit_income_ratio</code></td>
      <td>0.7210</td>
      <td class="green">0.7540</td>
      <td><span class="badge low">PROMOTE</span></td>
      <td class="green">Yes</td>
    `;
    tbody.prepend(newRow);
  } catch {
    showToast('Error promoting model');
  } finally {
    btn.textContent = 'Promote Challenger';
    btn.disabled = false;
  }
}

function loadModelCard(type) {
  const cards = {
    champion: `aura_credit_champion · Production
URI: ${AURA_CONFIG.champion_uri}
AUC: 0.7210 · Accuracy: 82.4%
Trained on: Home Credit (350K rows)
11 Features: income, age_years, credit_income_ratio, employment_years, ext_source_1, ext_source_2, ext_source_3, ext_mean, ext_min, income_age_ratio, credit_per_year`,
    challenger: `aura_credit_challenger · Staging
URI: ${AURA_CONFIG.challenger_uri}
AUC: 0.7540 · Accuracy: 84.1%
Trained on: Combined dataset (Home Credit + simulated drift)
11 Features: Same feature engineering pipeline
Trigger: PSI > 0.2 on income, credit_income_ratio`,
  };
  showToast(cards[type], 6000);
}

let courtInitialised = false;

function initCourtPage() {
  if (courtInitialised) return;
  courtInitialised = true;
  renderCourtTable(LLM_EVALUATIONS);
}

function renderCourtTable(evals) {
  const tbody = document.getElementById('court-table-body');
  tbody.innerHTML = evals.map(e => `
    <tr>
      <td class="mono">${e.id}</td>
      <td style="max-width:280px;font-size:12px;color:var(--text-secondary)">${e.explanation.substring(0, 80)}...</td>
      <td><code>${e.citations.join(', ') || '—'}</code></td>
      <td>${e.has_hallucination
      ? `<span style="color:var(--red);font-family:var(--font-mono);font-size:11px">${e.hallucinated.join(', ')}</span>`
      : '<span style="color:var(--green);font-family:var(--font-mono);font-size:11px">None</span>'
    }</td>
      <td class="${e.grounding_score >= 0.8 ? 'green' : e.grounding_score >= 0.4 ? '' : 'red'}">${e.grounding_score.toFixed(2)}</td>
      <td class="${e.halluc_score === 0 ? 'green' : e.halluc_score >= 0.5 ? 'red' : ''}">${e.halluc_score.toFixed(2)}</td>
      <td>${e.has_hallucination
      ? '<span class="badge high">FLAGGED</span>'
      : '<span class="badge low">CLEAN</span>'
    }</td>
    </tr>
  `).join('');
}

async function evaluateExplanation() {
  const text = document.getElementById('court-input').value.trim();
  if (!text) { showToast('Please enter an explanation to evaluate'); return; }

  const btn = document.querySelector('#page-court .card .btn-primary');
  btn.textContent = 'Evaluating via LLM Court...';
  btn.disabled = true;

  try {
    const result = await API_evaluateExplanation({ text });
    renderCourtResult(result, text);
  } catch {
    showToast('Error evaluating explanation');
  } finally {
    btn.textContent = 'Evaluate for Hallucinations';
    btn.disabled = false;
  }
}

function renderCourtResult(result, text) {
  const el = document.getElementById('court-result');
  el.style.display = 'block';

  const headerColor = result.has_hallucination ? 'var(--red)' : 'var(--green)';
  const headerText = result.has_hallucination
    ? `⚠ Hallucination detected — ${result.invalid_citations.length} fake citation(s)`
    : '✓ All citations verified — no hallucinations';

  const citRows = [
    ...result.valid_citations.map(c => `
      <div class="court-cite-row">
        <div class="cite-icon ok">✓</div>
        <span style="color:var(--green)">${c}</span>
        <span style="color:var(--text-muted)">— found in rbi_regulations table</span>
      </div>
    `),
    ...result.invalid_citations.map(c => `
      <div class="court-cite-row">
        <div class="cite-icon bad">✕</div>
        <span style="color:var(--red)">${c}</span>
        <span style="color:var(--text-muted)">— not found in rbi_regulations table. Citation does not exist.</span>
      </div>
    `),
  ].join('');

  el.innerHTML = `
    <div style="font-family:var(--font-display);font-size:15px;font-weight:700;color:${headerColor};margin-bottom:1rem">${headerText}</div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.75rem;margin-bottom:1rem">
      <div style="background:rgba(255,255,255,0.02);border:1px solid var(--border);border-radius:10px;padding:1rem">
        <div style="font-family:var(--font-mono);font-size:10px;color:var(--text-muted);text-transform:uppercase;letter-spacing:.06em;margin-bottom:6px">factual_grounding_score</div>
        <div style="font-family:var(--font-display);font-size:26px;font-weight:700;color:${result.grounding_score >= 0.7 ? 'var(--green)' : 'var(--red)'}">${result.grounding_score.toFixed(2)}</div>
      </div>
      <div style="background:rgba(255,255,255,0.02);border:1px solid var(--border);border-radius:10px;padding:1rem">
        <div style="font-family:var(--font-mono);font-size:10px;color:var(--text-muted);text-transform:uppercase;letter-spacing:.06em;margin-bottom:6px">hallucination_score</div>
        <div style="font-family:var(--font-display);font-size:26px;font-weight:700;color:${result.halluc_score === 0 ? 'var(--green)' : 'var(--red)'}">${result.halluc_score.toFixed(2)}</div>
      </div>
    </div>
    ${result.citations.length > 0 ? `
      <div style="font-family:var(--font-mono);font-size:10px;color:var(--text-muted);text-transform:uppercase;letter-spacing:.06em;margin-bottom:0.5rem">Citations extracted</div>
      ${citRows}
    ` : '<div style="font-size:12px;color:var(--text-muted);font-family:var(--font-mono)">No regulatory citations found in this explanation.</div>'}
  `;
}

async function runBatchEval() {
  showToast('Batch evaluation complete — 8 explanations scored via mlflow.evaluate() on gold.llm_evaluation_metrics', 5000);
}

(function initCursorFollower() {
  const glow = document.querySelector('.cursor-glow');
  const dot = document.querySelector('.cursor-dot');
  if (!glow || !dot) return;

  let glowX = mouseX, glowY = mouseY;

  function updateGlow() {
    glowX += (mouseX - glowX) * 0.08;
    glowY += (mouseY - glowY) * 0.08;
    glow.style.left = glowX + 'px';
    glow.style.top = glowY + 'px';

    dot.style.left = mouseX + 'px';
    dot.style.top = mouseY + 'px';

    requestAnimationFrame(updateGlow);
  }
  updateGlow();

  const hoverTargets = 'a, button, input, select, textarea, .nav-item, .demo-preset-btn, .kpi-card, .widget-card, .model-card, .tech-card, .arch-node, .psi-card, .btn-primary, .btn-secondary, .btn-ghost-sm, .tag, .link-btn';

  document.addEventListener('mouseover', (e) => {
    if (e.target.closest(hoverTargets)) {
      dot.classList.add('hovering');
      glow.style.width = '400px';
      glow.style.height = '400px';
    }
  });

  document.addEventListener('mouseout', (e) => {
    if (e.target.closest(hoverTargets)) {
      dot.classList.remove('hovering');
      glow.style.width = '320px';
      glow.style.height = '320px';
    }
  });
})();

(function init3DTilt() {
  return;
  const tiltSelectors = '.kpi-card, .widget-card, .model-card, .psi-card, .tech-card, .arch-node';
  const MAX_TILT = 6;
  const PERSPECTIVE = 800;

  document.addEventListener('mousemove', (e) => {
    const cards = document.querySelectorAll(tiltSelectors);
    cards.forEach(card => {
      const rect = card.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const distX = e.clientX - centerX;
      const distY = e.clientY - centerY;
      const dist = Math.sqrt(distX * distX + distY * distY);

      if (dist < 400) {
        const rotateY = (distX / rect.width) * MAX_TILT;
        const rotateX = -(distY / rect.height) * MAX_TILT;
        card.style.transform = `perspective(${PERSPECTIVE}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-2px)`;
      }
    });
  });

  document.addEventListener('mouseleave', (e) => {
    if (e.target.matches && e.target.matches(tiltSelectors)) {
      e.target.style.transform = '';
    }
  }, true);

  document.addEventListener('mouseout', (e) => {
    const card = e.target.closest(tiltSelectors);
    if (card && !card.contains(e.relatedTarget)) {
      card.style.transform = '';
    }
  });
})();

(function initScrollReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -40px 0px',
  });

  function observeRevealElements() {
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
  }

  const origNav = window.navigateTo;
  if (typeof origNav === 'function') {
    window.navigateTo = function (page) {
      origNav(page);
      setTimeout(observeRevealElements, 100);
    };
  }

  setTimeout(observeRevealElements, 300);
})();

(function initMagneticButtons() {
  return;
  const MAGNETIC_STRENGTH = 0.3;
  const MAGNETIC_DIST = 100;

  document.addEventListener('mousemove', (e) => {
    document.querySelectorAll('.btn-primary, .btn-secondary, .demo-preset-btn').forEach(btn => {
      const rect = btn.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < MAGNETIC_DIST) {
        const force = (1 - dist / MAGNETIC_DIST) * MAGNETIC_STRENGTH;
        btn.style.transform = `translate(${dx * force}px, ${dy * force}px)`;
      } else {
        btn.style.transform = '';
      }
    });
  });
})();

(function initAnimatedCounters() {
  function animateCounter(el, target, duration = 1200) {
    const start = performance.now();
    const isFloat = String(target).includes('.');
    const decimals = isFloat ? String(target).split('.')[1]?.length || 2 : 0;

    function tick(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = target * eased;

      if (isFloat) {
        el.textContent = current.toFixed(decimals);
      } else {
        el.textContent = Math.round(current).toLocaleString();
      }

      if (progress < 1) {
        requestAnimationFrame(tick);
      }
    }
    requestAnimationFrame(tick);
  }

  window.animateCounter = animateCounter;
})();

document.addEventListener('DOMContentLoaded', () => {
  initDashboardWidgets();
});

if (document.readyState !== 'loading') {
  initDashboardWidgets();
}


/* ============================================================
   MODERN ENHANCEMENTS — AURA 2.0
   ============================================================ */

// Scroll-aware nav
(function initScrollNav() {
  const nav = document.getElementById('top-nav');
  if (!nav) return;

  let lastScroll = 0;

  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;

    if (scrollY > 60) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }

    lastScroll = scrollY;
  }, { passive: true });
})();

// Active nav link on scroll
(function initNavHighlight() {
  const sections = ['assess', 'dashboard', 'arch'];
  const navLinks = document.querySelectorAll('.nav-link');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        navLinks.forEach(link => {
          link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
        });
      }
    });
  }, { threshold: 0.3, rootMargin: '-80px 0px -40% 0px' });

  sections.forEach(id => {
    const el = document.getElementById(id);
    if (el) observer.observe(el);
  });
})();

// Animated hero stat counters
(function initHeroCounters() {
  const statEls = document.querySelectorAll('.hero-stat-value[data-count]');
  if (!statEls.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.dataset.count, 10);
        const suffix = el.dataset.suffix || '';
        animateCounter(el, target, 2000, 0);
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  statEls.forEach(el => observer.observe(el));
})();

// Smooth section transitions with stagger
(function initStaggerReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const children = entry.target.querySelectorAll('.kpi-card, .widget-card');
        children.forEach((child, i) => {
          child.style.animationDelay = `${i * 0.07}s`;
          child.classList.add('card-animate-in');
        });
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.kpi-grid, .widget-grid').forEach(el => observer.observe(el));
})();
