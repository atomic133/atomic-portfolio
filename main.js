/**
 * ATOMIC MINECRAFT DEVELOPER PORTFOLIO — CORE SCRIPT
 * Custom 16x16 Netherite Sword Cursor, Canvas FX Engine,
 * Live Packet Oscilloscope, Theme Controller, and Hotbar Interaction
 */

(function () {
  'use strict';

  /* ==========================================================================
     1. 16×16 ENCHANTED NETHERITE SWORD CURSOR & GLINT ENGINE
     ========================================================================== */
  const swordCanvas = document.getElementById('swordCanvas');
  const sCtx = swordCanvas.getContext('2d');

  const NETHERITE_SWORD_16x16 = [
    "OOO.............",
    "OHLO............",
    "OLMCO...........",
    ".OCMLO..........",
    "..OLMCO.........",
    "...OCMLO...OO...",
    "....OLMCO.OGGO..",
    ".....OCMLOGAGO..",
    "......OLMGAGO...",
    ".......OGAGO....",
    "......OGAGOWO...",
    ".....OGGO.OHWO..",
    ".....OO....OHWO.",
    "............OPAO",
    ".............APA",
    ".............OAO"
  ];

  let glintOffset = 0;

  function getThemeColors() {
    const style = getComputedStyle(document.documentElement);
    return {
      atomic: style.getPropertyValue('--atomic').trim() || '#8b5cf6',
      atomicCore: style.getPropertyValue('--atomic-core').trim() || '#c4b5fd',
      atomicRgb: style.getPropertyValue('--atomic-rgb').trim() || '139, 92, 246',
      gold: style.getPropertyValue('--gold').trim() || '#ca8a04',
      goldRgb: style.getPropertyValue('--gold-rgb').trim() || '202, 138, 4'
    };
  }

  function renderEnchantedSword() {
    sCtx.clearRect(0, 0, 16, 16);
    const theme = getThemeColors();

    const palette = {
      'O': '#18141c', // Dark Netherite Outline
      'H': '#5e5266', // Edge Highlight
      'L': '#3f3746', // Mid Netherite Body
      'C': '#2a242f', // Core Dark Netherite
      'M': theme.atomic, // Center Fuller Channel (Dynamic Accent)
      'G': theme.gold,   // Muted Weathered Gold Guard
      'A': theme.atomicCore, // Core Guard Inset
      'W': '#3d281c', // Wood/Leather Grip Wrap
      'P': '#2e1d3a'  // Pommel Cap
    };

    for (let r = 0; r < 16; r++) {
      for (let c = 0; c < 16; c++) {
        const pixel = NETHERITE_SWORD_16x16[r][c];
        if (pixel === '.') continue;

        sCtx.fillStyle = palette[pixel] || '#18141c';
        sCtx.fillRect(c, r, 1, 1);

        // Enchantment glint diagonal sweep
        const wave = Math.sin((r + c) * 0.55 - glintOffset);
        if (wave > 0.78) {
          sCtx.fillStyle = 'rgba(255, 255, 255, 0.42)';
          sCtx.fillRect(c, r, 1, 1);
        } else if (wave > 0.52) {
          sCtx.fillStyle = `rgba(${theme.atomicRgb}, 0.28)`;
          sCtx.fillRect(c, r, 1, 1);
        }
      }
    }

    glintOffset += 0.085;
    requestAnimationFrame(renderEnchantedSword);
  }
  renderEnchantedSword();

  /* ==========================================================================
     2. CURSOR TRACKING, SLASH PARTICLES & INTERACTION
     ========================================================================== */
  const swordCursor = document.getElementById('sword-cursor');
  const mcTooltip = document.getElementById('mc-tooltip');
  const ttTitle = document.getElementById('tt-title');
  const ttEnch = document.getElementById('tt-ench');
  const ttLore = document.getElementById('tt-lore');

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    swordCursor.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;

    // Tooltip position with viewport clamp
    let ttX = mouseX + 22;
    let ttY = mouseY + 22;
    if (ttX + 290 > window.innerWidth) ttX = mouseX - 290;
    if (ttY + 90 > window.innerHeight) ttY = mouseY - 90;

    mcTooltip.style.transform = `translate3d(${ttX}px, ${ttY}px, 0)`;

    // Cursor spark trail
    if (Math.random() > 0.52) {
      createSpark(mouseX + 6, mouseY + 6, (Math.random() - 0.5) * 1.5, (Math.random() - 0.5) * 1.5 + 0.4);
    }
  });

  window.addEventListener('mousedown', (e) => {
    swordCursor.classList.add('swing');
    spawnSlashArc(e.clientX, e.clientY, false);
    spikeOscilloscope();
    setTimeout(() => swordCursor.classList.remove('swing'), 140);
  });

  /* Tooltip hover binding */
  function bindTooltips() {
    document.querySelectorAll('[data-tt]').forEach((el) => {
      el.addEventListener('mouseenter', () => {
        swordCursor.classList.add('hovering');
        ttTitle.textContent = el.getAttribute('data-tt') || '';
        ttEnch.textContent = el.getAttribute('data-ench') || '';
        ttLore.textContent = el.getAttribute('data-lore') || '';
        mcTooltip.classList.add('visible');
      });

      el.addEventListener('mouseleave', () => {
        swordCursor.classList.remove('hovering');
        mcTooltip.classList.remove('visible');
      });
    });
  }
  bindTooltips();

  /* ==========================================================================
     3. LIVE BACKGROUND CANVAS ENGINE (#fxCanvas)
     Rising Enchantment Table Runes, Sparks & Slash Arcs
     ========================================================================== */
  const fxCanvas = document.getElementById('fxCanvas');
  const fxCtx = fxCanvas.getContext('2d');
  let cw = 0, ch = 0;

  function resizeFxCanvas() {
    cw = fxCanvas.width = window.innerWidth;
    ch = fxCanvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resizeFxCanvas);
  resizeFxCanvas();

  const RUNE_GLYPHS = ['ᔑ', '∷', 'ᓵ', '↸', 'ᒷ', '⎓', '⊣', '⍑', '╎', '⋮', 'ꖌ', 'ꖎ'];
  const runes = [];
  const sparks = [];
  const slashes = [];
  const cosmicMotes = [];

  for (let i = 0; i < 32; i++) {
    runes.push({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vy: -(Math.random() * 0.45 + 0.2),
      char: RUNE_GLYPHS[Math.floor(Math.random() * RUNE_GLYPHS.length)],
      alpha: Math.random() * 0.35 + 0.15,
      size: Math.floor(Math.random() * 4 + 12)
    });
  }

  // Atmospheric Cosmic Motes (Glow Particles)
  for (let i = 0; i < 36; i++) {
    cosmicMotes.push({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.4,
      vy: -(Math.random() * 0.3 + 0.1),
      radius: Math.random() * 2.5 + 1.2,
      baseAlpha: Math.random() * 0.45 + 0.15,
      pulseSpeed: Math.random() * 0.03 + 0.015,
      phase: Math.random() * Math.PI * 2
    });
  }

  function createSpark(x, y, vx, vy, size, alpha) {
    sparks.push({
      x,
      y,
      vx: vx || (Math.random() - 0.5) * 2,
      vy: vy || (Math.random() - 0.5) * 2,
      size: size || Math.random() * 3 + 1.5,
      alpha: alpha || 0.75
    });
  }

  function spawnSlashArc(x, y, isUltimate) {
    slashes.push({
      x,
      y,
      angle: (Math.random() - 0.5) * 1.2 - 0.4,
      radius: isUltimate ? 240 : 70,
      alpha: 0.9,
      lineWidth: isUltimate ? 6 : 3
    });

    const sparkCount = isUltimate ? 34 : 12;
    for (let i = 0; i < sparkCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * (isUltimate ? 8.5 : 4.5) + 1.5;
      createSpark(x, y, Math.cos(angle) * speed, Math.sin(angle) * speed, Math.random() * 3.5 + 1.5, 0.85);
    }
  }

  function renderFxLoop() {
    fxCtx.clearRect(0, 0, cw, ch);
    const theme = getThemeColors();

    // Ambient Cursor Radial Spotlight
    const spotlightGrad = fxCtx.createRadialGradient(mouseX, mouseY, 0, mouseX, mouseY, 190);
    spotlightGrad.addColorStop(0, `rgba(${theme.atomicRgb}, 0.08)`);
    spotlightGrad.addColorStop(0.6, `rgba(${theme.atomicRgb}, 0.03)`);
    spotlightGrad.addColorStop(1, 'transparent');
    fxCtx.fillStyle = spotlightGrad;
    fxCtx.fillRect(0, 0, cw, ch);

    // 1. Drifting Luminous Cosmic Motes
    cosmicMotes.forEach((m) => {
      m.x += m.vx;
      m.y += m.vy;
      m.phase += m.pulseSpeed;

      if (m.y < -10) {
        m.y = ch + 10;
        m.x = Math.random() * cw;
      }
      if (m.x < -10) m.x = cw + 10;
      if (m.x > cw + 10) m.x = -10;

      const currentAlpha = m.baseAlpha + Math.sin(m.phase) * 0.15;
      fxCtx.save();
      fxCtx.beginPath();
      fxCtx.arc(m.x, m.y, m.radius, 0, Math.PI * 2);
      fxCtx.fillStyle = `rgba(${theme.atomicRgb}, ${Math.max(0.05, currentAlpha)})`;
      fxCtx.shadowColor = `rgb(${theme.atomicRgb})`;
      fxCtx.shadowBlur = 8;
      fxCtx.fill();
      fxCtx.restore();
    });

    // 2. Rising Enchantment Runes with Glow Bloom
    fxCtx.save();
    fxCtx.shadowColor = `rgb(${theme.atomicRgb})`;
    fxCtx.shadowBlur = 12;

    runes.forEach((r) => {
      r.y += r.vy;
      if (r.y < -20) {
        r.y = ch + 20;
        r.x = Math.random() * cw;
        r.char = RUNE_GLYPHS[Math.floor(Math.random() * RUNE_GLYPHS.length)];
      }
      fxCtx.font = `${r.size}px monospace`;
      fxCtx.fillStyle = `rgba(${theme.atomicRgb}, ${r.alpha})`;
      fxCtx.fillText(r.char, r.x, r.y);
    });
    fxCtx.restore();


    // 2. Trailing Sparks
    for (let i = sparks.length - 1; i >= 0; i--) {
      const p = sparks[i];
      p.x += p.vx;
      p.y += p.vy;
      p.alpha -= 0.032;
      fxCtx.fillStyle = `rgba(${theme.atomicRgb}, ${p.alpha})`;
      fxCtx.fillRect(p.x, p.y, p.size, p.size);
      if (p.alpha <= 0) sparks.splice(i, 1);
    }

    // 3. Sword Slash Arcs
    for (let i = slashes.length - 1; i >= 0; i--) {
      const s = slashes[i];
      s.radius += 5.2;
      s.alpha -= 0.08;
      fxCtx.save();
      fxCtx.translate(s.x, s.y);
      fxCtx.rotate(s.angle);
      fxCtx.beginPath();
      fxCtx.arc(0, 0, s.radius, -0.75, 0.75);
      fxCtx.strokeStyle = `rgba(244, 244, 245, ${s.alpha})`;
      fxCtx.lineWidth = s.lineWidth;
      fxCtx.shadowColor = `rgb(${theme.atomicRgb})`;
      fxCtx.shadowBlur = 12;
      fxCtx.stroke();
      fxCtx.restore();
      if (s.alpha <= 0) slashes.splice(i, 1);
    }

    requestAnimationFrame(renderFxLoop);
  }
  renderFxLoop();

  /* ==========================================================================
     4. REAL-TIME DISCORD GATEWAY / PACKET TELEMETRY CANVAS
     ========================================================================== */
  const scopeCanvas = document.getElementById('discordScope') || document.getElementById('packetScope');
  const scopeCtx = scopeCanvas ? scopeCanvas.getContext('2d') : null;
  const pktCountEl = document.getElementById('pktCount');
  const gatewayPingEl = document.getElementById('gatewayPing');
  let scopePhase = 0;
  let scopeAmp = 1;

  function spikeOscilloscope() {
    scopeAmp = 2.8;
    if (pktCountEl) {
      const spiked = Math.floor(1750 + Math.random() * 650);
      pktCountEl.textContent = `${spiked.toLocaleString()}/s`;
    }
    if (gatewayPingEl) {
      const ping = Math.floor(12 + Math.random() * 6);
      gatewayPingEl.textContent = `${ping}ms GATEWAY`;
      setTimeout(() => {
        if (gatewayPingEl) gatewayPingEl.textContent = '24ms GATEWAY';
      }, 1200);
    }
  }

  function renderOscilloscope() {
    if (!scopeCanvas || !scopeCtx) return;
    scopeCanvas.width = scopeCanvas.clientWidth;
    scopeCanvas.height = scopeCanvas.clientHeight;
    const w = scopeCanvas.width;
    const h = scopeCanvas.height;
    const theme = getThemeColors();

    scopeCtx.clearRect(0, 0, w, h);
    scopeCtx.beginPath();

    for (let x = 0; x < w; x++) {
      const y = h / 2 + Math.sin(x * 0.045 + scopePhase) * 11 * scopeAmp * Math.sin(x * 0.012 - scopePhase * 0.5);
      if (x === 0) scopeCtx.moveTo(x, y);
      else scopeCtx.lineTo(x, y);
    }

    scopeCtx.strokeStyle = `rgba(${theme.atomicRgb}, 0.88)`;
    scopeCtx.lineWidth = 1.9;
    scopeCtx.stroke();

    scopePhase += 0.12;
    scopeAmp += (1 - scopeAmp) * 0.06;

    // Settle packet rate counter back to baseline
    if (pktCountEl && scopeAmp < 1.08 && Math.random() > 0.88) {
      const baseline = 1420 + Math.floor((Math.random() - 0.5) * 30);
      pktCountEl.textContent = `${baseline.toLocaleString()}/s`;
    }

    requestAnimationFrame(renderOscilloscope);
  }
  if (scopeCanvas) renderOscilloscope();


  /* ==========================================================================
     5. "I... AM... ATOMIC" INTRO & REPLAY CONTROLLER
     ========================================================================== */
  const introEl = document.getElementById('atomic-intro');
  const chantText = document.getElementById('chantText');
  const atomicSphere = document.getElementById('atomicSphere');

  function castAtomic() {
    introEl.classList.remove('done');
    chantText.className = 'atomic-chant';
    atomicSphere.className = 'atomic-sphere';
    chantText.textContent = 'I... AM...';

    setTimeout(() => {
      chantText.classList.add('show');
    }, 90);

    setTimeout(() => {
      chantText.textContent = 'ATOMIC.';
      chantText.classList.add('nuke-text');
    }, 620);

    setTimeout(() => {
      atomicSphere.classList.add('detonate');
    }, 1000);

    setTimeout(() => {
      introEl.classList.add('done');
      document.body.classList.add('shaking');
      spawnSlashArc(window.innerWidth / 2, window.innerHeight / 2, true);
      setTimeout(() => document.body.classList.remove('shaking'), 500);
    }, 1480);
  }
  window.castAtomic = castAtomic;

  window.addEventListener('DOMContentLoaded', () => {
    castAtomic();
  });

  /* ==========================================================================
     6. THEME SWITCHER CONTROLLER (3 MUTED DARK MODES)
     ========================================================================== */
  function setMode(mode) {
    document.documentElement.setAttribute('data-mode', mode);
    localStorage.setItem('atomic_theme', mode);

    document.querySelectorAll('.mode-btn').forEach((btn) => {
      if (btn.getAttribute('data-theme') === mode) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }
  window.setMode = setMode;

  // Restore saved theme
  const savedTheme = localStorage.getItem('atomic_theme') || 'atomic-violet';
  setMode(savedTheme);

  /* ==========================================================================
     7. 3D CARD PERSPECTIVE TILT (MAX 3 DEG)
     ========================================================================== */
  document.querySelectorAll('.tilt-card').forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      const rotX = (-y / rect.height) * 3;
      const rotY = (x / rect.width) * 3;
      card.style.transform = `perspective(1000px) rotateX(${rotX}deg) rotateY(${rotY}deg)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
    });
  });

  /* ==========================================================================
     8. MINECRAFT TOAST NOTIFICATIONS & DISCORD CLIPBOARD
     ========================================================================== */
  const toastEl = document.getElementById('mc-toast');
  let toastTimer = null;

  function showToast(message) {
    if (!toastEl) return;
    toastEl.textContent = message;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toastEl.classList.remove('show');
    }, 2400);
  }
  window.showToast = showToast;

  function copyDiscordTag() {
    const tag = "ATOMIC_oDEV";
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(tag).then(() => {
        showToast("COPIED DISCORD TAG: " + tag);
      }).catch(() => {
        showToast("DISCORD TAG: " + tag);
      });
    } else {
      showToast("DISCORD TAG: " + tag);
    }
  }
  window.copyDiscordTag = copyDiscordTag;

  function copyEmail() {
    const email = "atomicstore7717@gmail.com";
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(email).then(() => {
        showToast("COPIED EMAIL: " + email);
      }).catch(() => {
        showToast("EMAIL: " + email);
      });
    } else {
      showToast("EMAIL: " + email);
    }
  }
  window.copyEmail = copyEmail;


  /* ==========================================================================
     9. LIVE CAIRO, EGYPT REAL-TIME CLOCK (GMT+2 / GMT+3)
     ========================================================================== */
  function updateCairoClock() {
    const clockEl = document.getElementById('cairoTime');
    if (!clockEl) return;

    try {
      const now = new Date();
      const options = {
        timeZone: 'Africa/Cairo',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      };
      const cairoTimeString = new Intl.DateTimeFormat('en-US', options).format(now);
      clockEl.textContent = cairoTimeString;
    } catch (e) {
      clockEl.textContent = new Date().toLocaleTimeString();
    }
  }
  setInterval(updateCairoClock, 1000);
  updateCairoClock();

  /* ==========================================================================
     10. 9-SLOT MINECRAFT HOTBAR & KEYBOARD NAVIGATION (1-9)
     ========================================================================== */
  const hotbarSlots = document.querySelectorAll('.hb-slot');
  const themeList = ['atomic-violet', 'atomic-blue', 'blood-moon'];

  function cycleTheme() {
    const current = document.documentElement.getAttribute('data-mode') || 'atomic-violet';
    const nextIdx = (themeList.indexOf(current) + 1) % themeList.length;
    setMode(themeList[nextIdx]);
    showToast("SWITCHED THEME: " + themeList[nextIdx].toUpperCase().replace('-', ' '));
  }
  window.cycleTheme = cycleTheme;

  function selectHotbarSlot(index) {
    if (index < 0 || index >= hotbarSlots.length) return;
    hotbarSlots.forEach((s) => s.classList.remove('selected'));
    const slot = hotbarSlots[index];
    slot.classList.add('selected');

    // Trigger action based on slot index
    switch (index) {
      case 0: // Slot 1: Home (Scroll to Top)
        window.scrollTo({ top: 0, behavior: 'smooth' });
        showToast("HOTBAR [1]: HOME");
        break;
      case 1: // Slot 2: Stack (Scroll to Bento Grid)
        document.getElementById('sec-stack')?.scrollIntoView({ behavior: 'smooth' });
        showToast("HOTBAR [2]: TECH STACK");
        break;
      case 2: // Slot 3: Projects (Scroll to Featured Projects)
        document.getElementById('sec-projects')?.scrollIntoView({ behavior: 'smooth' });
        showToast("HOTBAR [3]: FEATURED PROJECTS");
        break;
      case 3: // Slot 4: Philosophy / Architecture
        document.getElementById('sec-philosophy')?.scrollIntoView({ behavior: 'smooth' });
        showToast("HOTBAR [4]: ARCHITECTURE PHILOSOPHY");
        break;
      case 4: // Slot 5: Contact Station & Discord
        document.getElementById('sec-contact')?.scrollIntoView({ behavior: 'smooth' });
        showToast("HOTBAR [5]: CONTACT & COMMISSIONS");
        break;
      case 5: // Slot 6: Replay Atomic Intro
        castAtomic();
        showToast("HOTBAR [6]: I AM ATOMIC");
        break;
      case 6: // Slot 7: Discord Experiences (Opens in New Tab)
        window.open('discord.html', '_blank');
        showToast("HOTBAR [7]: OPENING DISCORD EXPERIENCES");
        break;
      case 7: // Slot 8: Cycle Theme
        cycleTheme();
        break;
      case 8: // Slot 9: Cairo, Egypt Badges / Clock
        document.getElementById('cairoClockBox')?.scrollIntoView({ behavior: 'smooth' });
        showToast("HOTBAR [9]: CAIRO, EGYPT");
        break;
    }
  }

  hotbarSlots.forEach((slot, idx) => {
    slot.addEventListener('click', () => {
      selectHotbarSlot(idx);
    });
  });

  window.addEventListener('keydown', (e) => {
    // Ignore input if user happens to be typing in an input
    if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) return;
    const keyNum = parseInt(e.key, 10);
    if (keyNum >= 1 && keyNum <= 9) {
      selectHotbarSlot(keyNum - 1);
    }
  });

})();

