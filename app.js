/**
 * SPATIAL HORIZONS — INTERACTIVE ENGINE
 * AR & VR in Next-Gen Tourism | 2026
 */

(function () {
  'use strict';

  // --- State Architecture ---
  const state = {
    currentSlide: 1,
    totalSlides: 10,
    mode: 'presentation', // 'presentation' or 'scroll'
    soundEnabled: false,
    autoplay: false,
    autoplayTimer: null,
    autoplayInterval: 8000,
    autoplayStart: 0,
    audioCtx: null,
    ambientOsc: null,
    ambientGain: null,
  };

  const slideNames = [
    "1. TITLE // SPATIAL HORIZONS",
    "2. INTRODUCTION // AR vs VR PARADIGMS",
    "3. EVOLUTION // CHRONOLOGY 1968–2027+",
    "4. TECHNOLOGIES // SPATIAL ARCHITECTURE",
    "5. IMPORTANCE // STRATEGIC VALUE",
    "6. APPLICATIONS // FIELD DEPLOYMENTS",
    "7. AR vs VR // DIRECT BENCHMARK",
    "8. IMPACT // BENEFITS & CHALLENGES",
    "9. FUTURE SCOPE // HORIZON 2030+",
    "10. CONCLUSION // SYNTHESIS 2050"
  ];

  // Tech Ecosystem Dataset
  const techData = {
    slam: {
      id: "PILLAR 01 // POSE ESTIMATION",
      category: "ALGORITHMIC BACKBONE",
      title: "Simultaneous Localization & Mapping (SLAM)",
      desc: "Visual-Inertial SLAM continuously constructs a 3D geometric map of unmapped environments while simultaneously tracking the traveler's precise 6DoF position without relying on GPS, enabling seamless indoor museum and underground tomb navigation.",
      metric1: "1000 Hz (Inertial) / 60 Hz (Visual)",
      metric2: "< 1.2 cm Drift over 500m",
      metric3: "Dynamic Keypoint Rejection",
      pipe: ["RAW CAM + IMU", "ORB-SLAM3 FRONTEND", "BUNDLE ADJUSTMENT", "ANCHORED AR HOLOGRAM"]
    },
    imu: {
      id: "PILLAR 02 // SENSOR FUSION",
      category: "HARDWARE TELEMETRY",
      title: "IMU + Multi-Camera Stereo Array",
      desc: "High-rate 1000Hz 6-axis accelerometers and gyroscopes tightly coupled with stereoscopic wide-angle tracking cameras, delivering jitter-free orientation updates during rapid head movements.",
      metric1: "1000 Hz Inertial Sampling",
      metric2: "Sub-Millimeter Rotational Error",
      metric3: "Zero-Drift Extended Kalman Filtering",
      pipe: ["ACCEL + GYRO", "OPTICAL STEREO POSE", "EXTENDED KALMAN FILTER", "6DoF POSE MATRIX"]
    },
    lidar: {
      id: "PILLAR 03 // SURFACE RECONSTRUCTION",
      category: "PHOTON SENSING",
      title: "Direct LiDAR & Time-of-Flight Sensors",
      desc: "Nanosecond pulsed laser arrays measure exact time-of-flight to physical surfaces, creating instant millimeter-accurate topological meshes in extreme Mediterranean sunlight where optical cameras fail.",
      metric1: "1.2 Million Points / Second",
      metric2: "±2 mm Precision @ 5m",
      metric3: "Outdoor Sun Occlusion Resistant",
      pipe: ["PULSED LASER EMISSION", "ToF DETECTOR", "INSTANT POINT CLOUD", "PHYSICAL OCCLUSION MESH"]
    },
    photogrammetry: {
      id: "PILLAR 04 // VOLUMETRIC CAPTURE",
      category: "GEOMETRIC ARCHIVAL",
      title: "Multi-View Photogrammetric Scanning",
      desc: "Triangulating hundreds of overlapping high-resolution camera frames to generate dense geometry and 8K PBR material maps of historical statues, temple reliefs, and archaeological digs.",
      metric1: "Over 50 Million Polygons",
      metric2: "8K PBR Texture Resolution",
      metric3: "Structural Archival Quality",
      pipe: ["DRONE MULTI-VIEW", "FEATURE MATCHING (SIFT)", "DENSE RECONSTRUCTION", "PBR TEXTURED ASSET"]
    },
    nerf: {
      id: "PILLAR 05 // NEURAL RENDERING",
      category: "DEEP LEARNING",
      title: "Neural Radiance Fields (NeRF)",
      desc: "Representing tourist sites as continuous volumetric 5D neural functions (spatial location x,y,z + viewing angle θ,φ), capturing complex specular reflections, marble translucency, and sunlight flares.",
      metric1: "Continuous 5D Scene Field",
      metric2: "Zero Polygon Aliasing",
      metric3: "View-Dependent Specular Lighting",
      pipe: ["MULTI-VIEW INPUT", "MLP DENSITY TRAINING", "VOLUME RAY MARCHING", "PHOTOREALISTIC SYNTHESIS"]
    },
    "3dgs": {
      id: "PILLAR 06 // REAL-TIME RASTERIZATION",
      category: "SPATIAL REVOLUTION",
      title: "3D Gaussian Splatting (3DGS)",
      desc: "Replacing neural ray-marching with millions of anisotropic 3D ellipsoidal Gaussians. Enables real-time 120 FPS rasterization of full architectural monuments on standalone mobile headsets, eliminating cybersickness.",
      metric1: "120+ FPS on Mobile Silicon",
      metric2: "Over 3 Million Splats",
      metric3: "< 2ms GPU Render Pass",
      pipe: ["POINT INITIALIZATION", "GAUSSIAN OPTIMIZATION", "TILE-BASED RASTERIZER", "120 FPS STEREO FRAME"]
    },
    "5gmec": {
      id: "PILLAR 07 // DISTRIBUTED COMPUTE",
      category: "EDGE CLOUD ARCHITECTURE",
      title: "5G mmWave & Multi-Access Edge Computing (MEC)",
      desc: "Offloading heavy Gaussian rendering to cellular edge servers located <10km from the tourist site. Renders gigabyte scenes and streams stereoscopic video packets to 60-gram glasses with <15ms roundtrip latency.",
      metric1: "15.6 ms Motion-to-Photon Budget",
      metric2: "> 1 Gbps Ultra-Reliable Low Latency",
      metric3: "85% Headset Weight Reduction",
      pipe: ["HEADSET POSE UPLINK", "MEC EDGE RENDER GPU", "HEVC ENCODE + STREAM", "ASYNCHRONOUS TIMEWARP"]
    }
  };

  // --- DOM Elements ---
  const body = document.getElementById('app-body');
  const hudHeader = document.getElementById('hud-header');
  const currSlideSpan = document.getElementById('hud-curr-slide');
  const progressBar = document.getElementById('global-progress-bar');
  const autoplayLine = document.getElementById('autoplay-timer-line');
  const footerSecName = document.getElementById('footer-active-section-name');
  const navLinks = document.querySelectorAll('.nav-btn');
  const slideDots = document.querySelectorAll('.s-dot');
  const sections = document.querySelectorAll('.section-stage');

  // Controls
  const btnModePres = document.getElementById('btn-mode-presentation');
  const btnModeScroll = document.getElementById('btn-mode-scroll');
  const btnPrev = document.getElementById('hud-prev-slide');
  const btnNext = document.getElementById('hud-next-slide');
  const btnSound = document.getElementById('btn-sound-toggle');
  const btnAutoplay = document.getElementById('btn-autoplay');
  const btnOverview = document.getElementById('btn-overview-grid');
  const btnFullscreen = document.getElementById('btn-fullscreen');
  const audioPill = document.getElementById('audio-pill-floating');
  const audioLabel = document.getElementById('audio-status-label');

  // Modals
  const overviewModal = document.getElementById('overview-modal');
  const btnCloseOverview = document.getElementById('btn-close-overview');
  const aiSimModal = document.getElementById('ai-sim-modal');
  const btnCloseAiSim = document.getElementById('btn-close-ai-sim');
  const btnTestAiSim = document.getElementById('btn-test-ai-sim');
  const hapticSimModal = document.getElementById('haptic-sim-modal');
  const btnCloseHapticSim = document.getElementById('btn-close-haptic-sim');
  const btnTestHapticSim = document.getElementById('btn-test-haptic-sim');

  // ==========================================================================
  // WEB AUDIO API SYNTHESIZER (Pure Client-Side Sound Engine)
  // ==========================================================================
  function initAudio() {
    if (!state.audioCtx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      state.audioCtx = new AudioCtx();
    }
    if (state.audioCtx.state === 'suspended') {
      state.audioCtx.resume();
    }
  }

  function playChime(freq = 587.33, type = 'sine', duration = 0.15) {
    if (!state.soundEnabled || !state.audioCtx) return;
    try {
      const osc = state.audioCtx.createOscillator();
      const gain = state.audioCtx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, state.audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.5, state.audioCtx.currentTime + duration);

      gain.gain.setValueAtTime(0.08, state.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, state.audioCtx.currentTime + duration);

      osc.connect(gain);
      gain.connect(state.audioCtx.destination);

      osc.start();
      osc.stop(state.audioCtx.currentTime + duration);
    } catch (e) {
      console.warn("Audio error:", e);
    }
  }

  function playSlideWhoosh() {
    if (!state.soundEnabled || !state.audioCtx) return;
    try {
      const osc = state.audioCtx.createOscillator();
      const gain = state.audioCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(140, state.audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(40, state.audioCtx.currentTime + 0.35);

      gain.gain.setValueAtTime(0.12, state.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, state.audioCtx.currentTime + 0.35);

      osc.connect(gain);
      gain.connect(state.audioCtx.destination);

      osc.start();
      osc.stop(state.audioCtx.currentTime + 0.35);
    } catch (e) {}
  }

  function toggleSound(forceState) {
    initAudio();
    state.soundEnabled = forceState !== undefined ? forceState : !state.soundEnabled;

    const onIcon = btnSound.querySelector('.sound-on-icon');
    const offIcon = btnSound.querySelector('.sound-off-icon');

    if (state.soundEnabled) {
      onIcon.classList.remove('hidden');
      offIcon.classList.add('hidden');
      audioPill.classList.add('playing');
      audioLabel.textContent = 'SPATIAL AUDIO: ON';
      playChime(880, 'sine', 0.2);
    } else {
      onIcon.classList.add('hidden');
      offIcon.classList.remove('hidden');
      audioPill.classList.remove('playing');
      audioLabel.textContent = 'SPATIAL AUDIO: MUTED';
    }
  }

  // ==========================================================================
  // SLIDE & STAGE NAVIGATION
  // ==========================================================================
  function goToSlide(targetSlide, triggerWhoosh = true) {
    if (targetSlide < 1) targetSlide = 1;
    if (targetSlide > state.totalSlides) targetSlide = state.totalSlides;

    state.currentSlide = targetSlide;

    // Update Telemetry & Indicators
    currSlideSpan.textContent = String(targetSlide).padStart(2, '0');
    progressBar.style.width = `${(targetSlide / state.totalSlides) * 100}%`;
    footerSecName.textContent = slideNames[targetSlide - 1];

    // Nav bar active button
    navLinks.forEach(btn => {
      const t = parseInt(btn.getAttribute('data-target'), 10);
      btn.classList.toggle('active', t === targetSlide);
    });

    // Dots active state
    slideDots.forEach(dot => {
      const idx = parseInt(dot.getAttribute('data-dot-index'), 10);
      dot.classList.toggle('active', idx === targetSlide);
    });

    if (state.mode === 'presentation') {
      sections.forEach(sec => {
        const idx = parseInt(sec.getAttribute('data-slide-index'), 10);
        sec.classList.toggle('slide-active', idx === targetSlide);
      });
      if (triggerWhoosh) playSlideWhoosh();
    } else {
      // Scroll mode
      const sec = document.getElementById(`section-${targetSlide}`);
      if (sec) {
        sec.scrollIntoView({ behavior: 'smooth' });
      }
    }

    resetAutoplayTimer();
  }

  function nextSlide() {
    if (state.currentSlide < state.totalSlides) {
      goToSlide(state.currentSlide + 1);
    } else {
      goToSlide(1); // loop back
    }
  }

  function prevSlide() {
    if (state.currentSlide > 1) {
      goToSlide(state.currentSlide - 1);
    }
  }

  // ==========================================================================
  // MODE SWITCHING: PRESENTATION DECK vs CONTINUOUS SCROLL
  // ==========================================================================
  function setMode(newMode) {
    state.mode = newMode;
    if (newMode === 'presentation') {
      body.classList.remove('mode-scroll');
      body.classList.add('mode-presentation');
      btnModePres.classList.add('active');
      btnModeScroll.classList.remove('active');
      goToSlide(state.currentSlide, false);
    } else {
      body.classList.remove('mode-presentation');
      body.classList.add('mode-scroll');
      btnModeScroll.classList.add('active');
      btnModePres.classList.remove('active');
      sections.forEach(s => s.classList.add('slide-active'));
      const activeSec = document.getElementById(`section-${state.currentSlide}`);
      if (activeSec) activeSec.scrollIntoView({ behavior: 'smooth' });
    }
    playChime(660, 'sine', 0.1);
  }

  // ==========================================================================
  // AUTOPLAY ENGINE
  // ==========================================================================
  function resetAutoplayTimer() {
    if (!state.autoplay) {
      autoplayLine.style.width = '0%';
      return;
    }
    state.autoplayStart = performance.now();
  }

  function toggleAutoplay() {
    state.autoplay = !state.autoplay;
    const playIcon = btnAutoplay.querySelector('.play-icon');
    const pauseIcon = btnAutoplay.querySelector('.pause-icon');

    if (state.autoplay) {
      playIcon.classList.add('hidden');
      pauseIcon.classList.remove('hidden');
      resetAutoplayTimer();
      runAutoplayLoop();
    } else {
      playIcon.classList.remove('hidden');
      pauseIcon.classList.add('hidden');
      autoplayLine.style.width = '0%';
    }
    playChime(750, 'sine', 0.1);
  }

  function runAutoplayLoop() {
    if (!state.autoplay) return;
    const elapsed = performance.now() - state.autoplayStart;
    const pct = Math.min(100, (elapsed / state.autoplayInterval) * 100);
    autoplayLine.style.width = `${pct}%`;

    if (elapsed >= state.autoplayInterval) {
      nextSlide();
    } else {
      requestAnimationFrame(runAutoplayLoop);
    }
  }

  // ==========================================================================
  // FULLSCREEN TOGGLE
  // ==========================================================================
  function toggleFullscreen() {
    const expand = btnFullscreen.querySelector('.fs-expand');
    const shrink = btnFullscreen.querySelector('.fs-shrink');
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      expand.classList.add('hidden');
      shrink.classList.remove('hidden');
    } else {
      document.exitFullscreen().catch(() => {});
      expand.classList.remove('hidden');
      shrink.classList.add('hidden');
    }
  }

  // ==========================================================================
  // 3D SPATIAL CANVAS (Constellation / Particle Field)
  // ==========================================================================
  function initSpatialCanvas() {
    const canvas = document.getElementById('spatial-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    let mouseX = width / 2;
    let mouseY = height / 2;

    const numNodes = Math.floor(Math.min(width, height) / 14);
    const nodes = [];

    for (let i = 0; i < numNodes; i++) {
      nodes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.45,
        vy: (Math.random() - 0.5) * 0.45,
        radius: Math.random() * 1.8 + 0.8,
        color: Math.random() > 0.4 ? 'rgba(0, 240, 255,' : 'rgba(0, 245, 160,'
      });
    }

    window.addEventListener('resize', () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    });

    window.addEventListener('mousemove', e => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    });

    function draw() {
      ctx.clearRect(0, 0, width, height);

      // Draw connections
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];
        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 110) {
            const alpha = (1 - dist / 110) * 0.18;
            ctx.strokeStyle = `rgba(0, 240, 255, ${alpha})`;
            ctx.lineWidth = 0.7;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      // Update & Draw Nodes
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        n.x += n.vx;
        n.y += n.vy;

        if (n.x < 0) n.x = width;
        if (n.x > width) n.x = 0;
        if (n.y < 0) n.y = height;
        if (n.y > height) n.y = 0;

        // Subtle mouse pull
        const mdx = mouseX - n.x;
        const mdy = mouseY - n.y;
        const mdist = Math.sqrt(mdx * mdx + mdy * mdy);
        if (mdist < 140) {
          n.x -= (mdx / mdist) * 0.6;
          n.y -= (mdy / mdist) * 0.6;
        }

        ctx.fillStyle = `${n.color} 0.65)`;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      requestAnimationFrame(draw);
    }
    draw();
  }

  // ==========================================================================
  // FLOATING AR RETICLE FOLLOWER
  // ==========================================================================
  function initReticleFollower() {
    const reticle = document.getElementById('ar-pointer-reticle');
    const coords = document.getElementById('reticle-coords');
    if (!reticle) return;

    let targetX = window.innerWidth * 0.65;
    let targetY = window.innerHeight * 0.45;
    let currentX = targetX;
    let currentY = targetY;

    window.addEventListener('mousemove', e => {
      // only active when on slide 1
      if (state.currentSlide === 1) {
        targetX = e.clientX;
        targetY = e.clientY;
        const lat = (37.9715 + (e.clientY / window.innerHeight - 0.5) * 0.05).toFixed(4);
        const lng = (23.7257 + (e.clientX / window.innerWidth - 0.5) * 0.05).toFixed(4);
        if (coords) coords.textContent = `${lat}° N, ${lng}° E`;
      }
    });

    function updateReticle() {
      currentX += (targetX - currentX) * 0.15;
      currentY += (targetY - currentY) * 0.15;
      reticle.style.left = `${currentX}px`;
      reticle.style.top = `${currentY}px`;
      requestAnimationFrame(updateReticle);
    }
    updateReticle();
  }

  // ==========================================================================
  // REALITY SPECTRUM SLIDER (Section 2)
  // ==========================================================================
  function initRealitySlider() {
    const slider = document.getElementById('reality-blend-slider');
    const panelAr = document.getElementById('intro-panel-ar');
    const panelVr = document.getElementById('intro-panel-vr');
    if (!slider) return;

    slider.addEventListener('input', e => {
      const val = parseInt(e.target.value, 10);
      // AR panel focus if < 50, VR panel focus if > 50
      if (panelAr && panelVr) {
        if (val < 45) {
          panelAr.style.borderColor = 'var(--cyan)';
          panelAr.style.boxShadow = '0 0 30px rgba(0,240,255,0.3)';
          panelVr.style.borderColor = 'var(--border-subtle)';
          panelVr.style.boxShadow = 'none';
        } else if (val > 55) {
          panelVr.style.borderColor = 'var(--magenta)';
          panelVr.style.boxShadow = '0 0 30px rgba(217,70,239,0.3)';
          panelAr.style.borderColor = 'var(--border-subtle)';
          panelAr.style.boxShadow = 'none';
        } else {
          panelAr.style.borderColor = 'var(--border-cyan)';
          panelVr.style.borderColor = 'var(--border-magenta)';
        }
      }
    });
  }

  // ==========================================================================
  // TIMELINE ERA FILTERS & SCROLL (Section 3)
  // ==========================================================================
  function initTimeline() {
    const eraChips = document.querySelectorAll('.era-chip');
    const nodes = document.querySelectorAll('.timeline-node');
    const track = document.getElementById('timeline-scroll-track');

    eraChips.forEach(chip => {
      chip.addEventListener('click', () => {
        eraChips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        const era = chip.getAttribute('data-era');

        nodes.forEach(node => {
          if (era === 'all' || node.getAttribute('data-era') === era) {
            node.style.display = 'flex';
            node.style.opacity = '1';
          } else {
            node.style.opacity = '0.2';
          }
        });
        playChime(500, 'sine', 0.08);
      });
    });

    // Horizontal mouse-wheel support
    if (track) {
      track.addEventListener('wheel', e => {
        if (e.deltaY !== 0) {
          e.preventDefault();
          track.scrollLeft += e.deltaY;
        }
      });
    }
  }

  // ==========================================================================
  // TECH ECOSYSTEM INSPECTOR (Section 4)
  // ==========================================================================
  function initTechEcosystem() {
    const techChips = document.querySelectorAll('.tech-node-chip');
    const inspId = document.getElementById('insp-tech-id');
    const inspCat = document.getElementById('insp-category');
    const inspTitle = document.getElementById('insp-title');
    const inspDesc = document.getElementById('insp-desc');
    const metric1 = document.getElementById('insp-metric-1');
    const metric2 = document.getElementById('insp-metric-2');
    const metric3 = document.getElementById('insp-metric-3');

    techChips.forEach(chip => {
      chip.addEventListener('click', () => {
        techChips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');

        const techKey = chip.getAttribute('data-tech');
        const d = techData[techKey];
        if (!d) return;

        inspId.textContent = d.id;
        inspCat.textContent = d.category;
        inspTitle.textContent = d.title;
        inspDesc.textContent = d.desc;
        metric1.textContent = d.metric1;
        metric2.textContent = d.metric2;
        metric3.textContent = d.metric3;

        playChime(620, 'sine', 0.1);
      });
    });
  }

  // ==========================================================================
  // APPLICATION CARDS FILTER (Section 6)
  // ==========================================================================
  function initAppFilters() {
    const appTabs = document.querySelectorAll('.app-tab');
    const appCards = document.querySelectorAll('.app-card');

    appTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        appTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const filter = tab.getAttribute('data-app-filter');

        appCards.forEach(card => {
          const cat = card.getAttribute('data-app-cat');
          if (filter === 'all' || cat === filter) {
            card.style.display = 'flex';
            card.style.opacity = '1';
          } else {
            card.style.display = 'none';
          }
        });
        playChime(540, 'sine', 0.08);
      });
    });
  }

  // ==========================================================================
  // 3D PERSPECTIVE TILT ON HOVER
  // ==========================================================================
  function initTiltCards() {
    const tiltCards = document.querySelectorAll('.tilt-card');
    tiltCards.forEach(card => {
      const maxTilt = parseFloat(card.getAttribute('data-tilt-intensity')) || 10;

      card.addEventListener('mousemove', e => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const tiltX = -((y - centerY) / centerY) * maxTilt;
        const tiltY = ((x - centerX) / centerX) * maxTilt;

        card.style.transform = `perspective(1000px) rotateX(${tiltX.toFixed(2)}deg) rotateY(${tiltY.toFixed(2)}deg) translateY(-4px)`;
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0)';
      });
    });
  }

  // ==========================================================================
  // AI GUIDE "LUNA" QUERY SIMULATOR (Section 9)
  // ==========================================================================
  function initAiSimulator() {
    const chatFeed = document.getElementById('ai-chat-feed');
    const input = document.getElementById('ai-user-input');
    const sendBtn = document.getElementById('ai-send-btn');
    const sampleBtns = document.querySelectorAll('.sq-btn');

    if (!btnTestAiSim) return;

    btnTestAiSim.addEventListener('click', () => {
      aiSimModal.classList.add('active');
      playChime(700, 'sine', 0.12);
    });

    btnCloseAiSim.addEventListener('click', () => {
      aiSimModal.classList.remove('active');
    });

    const aiKnowledge = {
      "colosseum": "In 80 AD, the Flavian Amphitheatre held over 50,000 spectators with a massive retractable velarium canvas roof. Our spatial reconstruction overlays the marble seating tiers and underground hypogeum elevators onto the current stone ruins.",
      "3dgs": "3D Gaussian Splatting represents the monument using 2.4M explicit 3D Gaussians rasterized via high-speed GPU sorting. Unlike NeRF's neural ray-tracing, 3DGS achieves 120 FPS on mobile chips, holding motion-to-photon latency under 11.2ms to eliminate cybersickness.",
      "food": "Cross-referencing real-time tourist density sensors: Trattoria Da Enzo (380m south-west) currently has zero wait time and 98% authentic local culinary reviews.",
      "default": "I am synthesizing spatial LiDAR telemetry, historical archival models, and real-time transit feeds for your coordinates. Every landmark here is registered to open spatial anchor protocols."
    };

    function postMessage(text, isUser = false) {
      const msgDiv = document.createElement('div');
      msgDiv.className = `chat-msg ${isUser ? 'user-msg' : 'ai-msg'}`;
      msgDiv.innerHTML = `<div class="msg-bubble">${text}</div>`;
      chatFeed.appendChild(msgDiv);
      chatFeed.scrollTop = chatFeed.scrollHeight;
    }

    function handleSend(userText) {
      if (!userText.trim()) return;
      postMessage(userText, true);
      input.value = '';
      playChime(600, 'sine', 0.08);

      setTimeout(() => {
        const lower = userText.toLowerCase();
        let reply = aiKnowledge.default;
        if (lower.includes('colosseum') || lower.includes('80 ad')) reply = aiKnowledge.colosseum;
        else if (lower.includes('gaussian') || lower.includes('3dgs') || lower.includes('cybersickness')) reply = aiKnowledge['3dgs'];
        else if (lower.includes('food') || lower.includes('trattoria') || lower.includes('gelato')) reply = aiKnowledge.food;

        postMessage(reply, false);
        playChime(850, 'sine', 0.15);
      }, 500);
    }

    sendBtn.addEventListener('click', () => handleSend(input.value));
    input.addEventListener('keydown', e => {
      if (e.key === 'Enter') handleSend(input.value);
    });

    sampleBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const q = btn.getAttribute('data-query');
        handleSend(q);
      });
    });
  }

  // ==========================================================================
  // HAPTIC WAVEFORM SIMULATOR (Section 9)
  // ==========================================================================
  function initHapticSimulator() {
    if (!btnTestHapticSim) return;
    const canvas = document.getElementById('haptic-waveform-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const presetBtns = document.querySelectorAll('.h-preset-btn');
    const freqEl = document.getElementById('ht-freq');
    const tempEl = document.getElementById('ht-temp');
    const forceEl = document.getElementById('ht-force');

    let activeWave = 'niagara';
    let phase = 0;
    let animId = null;

    btnTestHapticSim.addEventListener('click', () => {
      hapticSimModal.classList.add('active');
      renderHapticWave();
      playChime(500, 'triangle', 0.15);
    });

    btnCloseHapticSim.addEventListener('click', () => {
      hapticSimModal.classList.remove('active');
      if (animId) cancelAnimationFrame(animId);
    });

    presetBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        presetBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        activeWave = btn.getAttribute('data-wave');

        if (activeWave === 'niagara') {
          freqEl.textContent = '240 Hz (Fine Mist)';
          tempEl.textContent = '16.4°C (Active Cool)';
          forceEl.textContent = '4.2 N (Moderate)';
        } else if (activeWave === 'marble') {
          freqEl.textContent = '80 Hz (Coarse Texture)';
          tempEl.textContent = '21.0°C (Ambient Ambient)';
          forceEl.textContent = '8.6 N (Rigid Friction)';
        } else if (activeWave === 'desert') {
          freqEl.textContent = '15 Hz (Low Thermal Pulse)';
          tempEl.textContent = '38.5°C (Infrared Warm)';
          forceEl.textContent = '1.2 N (Thermal Only)';
        } else {
          freqEl.textContent = '360 Hz (Thrust Pulse)';
          tempEl.textContent = '24.0°C (Neutral)';
          forceEl.textContent = '14.8 N (High Thrust)';
        }
        playChime(440, 'triangle', 0.1);
      });
    });

    function renderHapticWave() {
      ctx.fillStyle = '#03060f';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.lineWidth = 2.5;
      ctx.strokeStyle = activeWave === 'desert' ? '#ffb703' : activeWave === 'marble' ? '#00f5a0' : '#00f0ff';
      ctx.beginPath();

      phase += 0.08;
      const centerY = canvas.height / 2;

      for (let x = 0; x < canvas.width; x++) {
        let y = centerY;
        if (activeWave === 'niagara') {
          y += Math.sin(x * 0.05 + phase) * 35 + Math.cos(x * 0.12 - phase) * 15;
        } else if (activeWave === 'marble') {
          y += (Math.sin(x * 0.08 + phase) > 0 ? 30 : -30) + Math.sin(x * 0.2) * 8;
        } else if (activeWave === 'desert') {
          y += Math.sin(x * 0.02 + phase) * 45;
        } else {
          y += Math.sin(x * 0.15 + phase) * 50 * (Math.sin(x * 0.01) + 1);
        }

        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      animId = requestAnimationFrame(renderHapticWave);
    }
  }

  // ==========================================================================
  // OVERVIEW MATRIX MODAL
  // ==========================================================================
  function initOverviewModal() {
    if (!btnOverview) return;
    const cards = document.querySelectorAll('.om-card');

    btnOverview.addEventListener('click', () => {
      overviewModal.classList.add('active');
      playChime(640, 'sine', 0.1);
    });

    btnCloseOverview.addEventListener('click', () => {
      overviewModal.classList.remove('active');
    });

    cards.forEach(card => {
      card.addEventListener('click', () => {
        const jumpIdx = parseInt(card.getAttribute('data-jump-index'), 10);
        overviewModal.classList.remove('active');
        goToSlide(jumpIdx);
      });
    });
  }

  // ==========================================================================
  // KEYBOARD SHORTCUTS
  // ==========================================================================
  function initKeyboard() {
    window.addEventListener('keydown', e => {
      // Ignore if user is typing in chat input
      if (document.activeElement && document.activeElement.tagName === 'INPUT') return;

      switch (e.key) {
        case 'ArrowRight':
        case 'PageDown':
        case ' ':
          e.preventDefault();
          nextSlide();
          break;
        case 'ArrowLeft':
        case 'PageUp':
          e.preventDefault();
          prevSlide();
          break;
        case 'Home':
          e.preventDefault();
          goToSlide(1);
          break;
        case 'End':
          e.preventDefault();
          goToSlide(state.totalSlides);
          break;
        case 'f':
        case 'F':
          toggleFullscreen();
          break;
        case 's':
        case 'S':
          toggleSound();
          break;
        case 'p':
        case 'P':
          toggleAutoplay();
          break;
        case 'o':
        case 'O':
          overviewModal.classList.toggle('active');
          break;
        case 'Escape':
          overviewModal.classList.remove('active');
          aiSimModal.classList.remove('active');
          hapticSimModal.classList.remove('active');
          break;
        default:
          // Check for 1-9 direct jump
          if (e.key >= '1' && e.key <= '9') {
            goToSlide(parseInt(e.key, 10));
          } else if (e.key === '0') {
            goToSlide(10);
          }
          break;
      }
    });
  }

  // ==========================================================================
  // EVENT LISTENERS & BOOTSTRAP
  // ==========================================================================
  function initEventListeners() {
    // Mode switcher
    btnModePres.addEventListener('click', () => setMode('presentation'));
    btnModeScroll.addEventListener('click', () => setMode('scroll'));

    // Arrows
    btnPrev.addEventListener('click', prevSlide);
    btnNext.addEventListener('click', nextSlide);

    // Audio & Tools
    btnSound.addEventListener('click', () => toggleSound());
    audioPill.addEventListener('click', () => toggleSound());
    btnAutoplay.addEventListener('click', toggleAutoplay);
    btnFullscreen.addEventListener('click', toggleFullscreen);

    // Nav Bar Buttons
    navLinks.forEach(btn => {
      btn.addEventListener('click', () => {
        const target = parseInt(btn.getAttribute('data-target'), 10);
        goToSlide(target);
      });
    });

    // Bottom Dots
    slideDots.forEach(dot => {
      dot.addEventListener('click', () => {
        const target = parseInt(dot.getAttribute('data-dot-index'), 10);
        goToSlide(target);
      });
    });

    // Hero Action Buttons
    const heroBtnBegin = document.getElementById('hero-btn-begin');
    const heroBtnDeck = document.getElementById('hero-btn-deck');
    if (heroBtnBegin) heroBtnBegin.addEventListener('click', () => goToSlide(2));
    if (heroBtnDeck) heroBtnDeck.addEventListener('click', () => overviewModal.classList.add('active'));

    // Hero Lens Mode Switcher
    const lensAr = document.getElementById('lens-opt-ar');
    const lensVr = document.getElementById('lens-opt-vr');
    const heroImg = document.getElementById('hero-img');
    if (lensAr && lensVr) {
      lensAr.addEventListener('click', () => {
        lensAr.classList.add('active');
        lensVr.classList.remove('active');
        if (heroImg) heroImg.style.filter = 'brightness(0.85) contrast(1.05)';
        playChime(700, 'sine', 0.1);
      });
      lensVr.addEventListener('click', () => {
        lensVr.classList.add('active');
        lensAr.classList.remove('active');
        if (heroImg) heroImg.style.filter = 'hue-rotate(240deg) saturate(1.4) brightness(0.9)';
        playChime(420, 'sine', 0.15);
      });
    }

    // Conclusion Actions
    const btnRestart = document.getElementById('btn-restart-presentation');
    const btnTechOver = document.getElementById('btn-open-tech-overview');
    const btnConcSound = document.getElementById('btn-toggle-sound-conc');
    if (btnRestart) btnRestart.addEventListener('click', () => goToSlide(1));
    if (btnTechOver) btnTechOver.addEventListener('click', () => overviewModal.classList.add('active'));
    if (btnConcSound) btnConcSound.addEventListener('click', () => toggleSound());

    // Scroll spy when in scroll mode
    window.addEventListener('scroll', () => {
      if (state.mode !== 'scroll') return;
      const scrollPos = window.scrollY + window.innerHeight / 3;

      sections.forEach(sec => {
        const top = sec.offsetTop;
        const height = sec.offsetHeight;
        const idx = parseInt(sec.getAttribute('data-slide-index'), 10);

        if (scrollPos >= top && scrollPos < top + height) {
          if (state.currentSlide !== idx) {
            state.currentSlide = idx;
            currSlideSpan.textContent = String(idx).padStart(2, '0');
            progressBar.style.width = `${(idx / state.totalSlides) * 100}%`;
            footerSecName.textContent = slideNames[idx - 1];

            navLinks.forEach(b => {
              const t = parseInt(b.getAttribute('data-target'), 10);
              b.classList.toggle('active', t === idx);
            });
            slideDots.forEach(d => {
              const t = parseInt(d.getAttribute('data-dot-index'), 10);
              d.classList.toggle('active', t === idx);
            });
          }
        }
      });
    });
  }

  // Initialize all subsystems
  window.addEventListener('DOMContentLoaded', () => {
    initSpatialCanvas();
    initReticleFollower();
    initRealitySlider();
    initTimeline();
    initTechEcosystem();
    initAppFilters();
    initTiltCards();
    initAiSimulator();
    initHapticSimulator();
    initOverviewModal();
    initKeyboard();
    initEventListeners();
    goToSlide(1, false);
  });

})();
