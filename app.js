/**
 * Aleatorizador - Core Application Logic
 */

document.addEventListener('DOMContentLoaded', () => {
  // === Audio System (Web Audio API) ===
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  
  function playClickSound(freq = 600, duration = 0.08) {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + duration);
    
    gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);
    
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    osc.start();
    osc.stop(audioCtx.currentTime + duration);
  }

  function playPopSound() {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const bufferSize = audioCtx.sampleRate * 0.4;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    
    const noise = audioCtx.createBufferSource();
    noise.buffer = buffer;
    
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, audioCtx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(50, audioCtx.currentTime + 0.35);
    
    const gain = audioCtx.createGain();
    gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.38);
    
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(audioCtx.destination);
    
    noise.start();
    noise.stop(audioCtx.currentTime + 0.4);
    
    const osc = audioCtx.createOscillator();
    const oscGain = audioCtx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(120, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(30, audioCtx.currentTime + 0.3);
    
    oscGain.gain.setValueAtTime(0.4, audioCtx.currentTime);
    oscGain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
    
    osc.connect(oscGain);
    oscGain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.3);
  }

  function playFanfareSound() {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const now = audioCtx.currentTime;
    const notes = [261.63, 329.63, 392.00, 523.25]; // C4, E4, G4, C5
    notes.forEach((freq, idx) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.1);
      
      gain.gain.setValueAtTime(0.12, now + idx * 0.1);
      gain.gain.setValueAtTime(0.12, now + idx * 0.1 + 0.2);
      gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.1 + 0.35);
      
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(now + idx * 0.1);
      osc.stop(now + idx * 0.1 + 0.4);
    });
  }

  function playTickTick(totalTicks = 20, speed = 80) {
    let tickCount = 0;
    const interval = setInterval(() => {
      playClickSound(800, 0.03);
      tickCount++;
      if (tickCount >= totalTicks) clearInterval(interval);
    }, speed);
  }

  // === Dynamic Confetti Canvas ===
  function triggerConfetti(parentElement) {
    const canvas = document.createElement('canvas');
    canvas.className = 'confetti-canvas';
    parentElement.appendChild(canvas);
    
    const ctx = canvas.getContext('2d');
    let width = canvas.width = parentElement.offsetWidth;
    let height = canvas.height = parentElement.offsetHeight;
    
    const colors = [
      '#8b5cf6', '#06b6d4', '#ec4899', '#14b8a6', '#f97316', '#eab308'
    ];
    
    const particles = Array.from({ length: 80 }).map(() => ({
      x: width / 2,
      y: height / 2 - 20,
      vx: (Math.random() - 0.5) * 12,
      vy: (Math.random() - 0.7) * 15 - 5,
      r: Math.random() * 6 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      opacity: 1,
      damp: 0.98,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 10
    }));
    
    let animId;
    function update() {
      ctx.clearRect(0, 0, width, height);
      let alive = false;
      
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.35; // gravity
        p.vx *= p.damp;
        p.rotation += p.rotationSpeed;
        p.opacity -= 0.015;
        
        if (p.opacity > 0) {
          alive = true;
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotation * Math.PI / 180);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = p.opacity;
          
          if (Math.random() > 0.5) {
            ctx.fillRect(-p.r, -p.r, p.r * 2, p.r * 1.5);
          } else {
            ctx.beginPath();
            ctx.arc(0, 0, p.r, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.restore();
        }
      });
      
      if (alive) {
        animId = requestAnimationFrame(update);
      } else {
        canvas.remove();
      }
    }
    update();
  }

  // =============================================================
  // TRANSLATION ENGINE & DICTIONARY
  // =============================================================
  let currentLanguage = 'es'; // default

  const translations = {
    es: {
      home_title: 'Aleatorizador',
      
      tab_ruleta_title: 'Ruleta',
      tab_ruleta_desc: 'Añade opciones y haz girar la ruleta con físicas realistas de desaceleración.',
      
      tab_numeros_title: 'Generador de Números',
      tab_numeros_desc: 'Establece un rango numérico y genera números con animación de odómetro digital.',
      
      tab_fichas_title: 'Tablero de Fichas',
      tab_fichas_desc: 'Mezcla fichas interactivas en el tablero y voltéalas en 3D para revelar información.',
      
      tab_maquina_title: 'Máquina de Pelotas',
      tab_maquina_desc: 'Gira la manivela para dispensar pelotas de colores y romperlas en 3 clics.',
      
      tab_grupos_title: 'Generador de Grupos',
      tab_grupos_desc: 'Agrupa integrantes al azar de forma balanceada y equitativa.',
      
      btn_back_to_menu: 'Regresar al Menú',
      btn_reset: 'Reiniciar',
      btn_continue: 'Continuar',
      label_add_options: 'Añadir Opciones (una por renglón)',
      
      ruleta_config_title: 'Configuración de Ruleta',
      btn_spin: 'Girar (10s)',
      btn_hide_option: 'Ocultar Ganador',
      btn_reset_options: 'Reiniciar Opciones',
      active_options_count: 'Opciones Activas',
      ready_to_spin: '¿Listo para girar?',
      spinning: 'Girando...',
      winner_label: 'Ganador',
      
      numeros_config_title: 'Configuración de Rango',
      label_min: 'Mínimo',
      label_max: 'Máximo',
      checkbox_customize: 'Personalizar',
      label_custom_numbers: 'Números (uno por renglón)',
      checkbox_repeat: 'Repetir números',
      btn_generate: 'Generar',
      digital_prefix: 'NÚMERO GENERADO',
      status_initial: 'Ingresa un rango y haz clic en Generar',
      status_generated: 'Generado correctamente dentro del rango',
      history_title: 'Historial de Generados',
      generated_label: 'Generado',
      error_range_exhausted: '¡Todos los números del rango han sido agotados! Haz clic en Reiniciar.',
      
      fichas_config_title: 'Configuración de Fichas',
      label_reveal_behavior: 'Comportamiento al Revelar',
      radio_repeat_fichas: 'Repetir opciones',
      radio_hide_fichas: 'Ocultar una vez reveladas',
      btn_shuffle_fichas: 'Mezclar (5s)',
      btn_reset_fichas: 'Reiniciar Fichas',
      active_fichas_count: 'Fichas Activas',
      lock_message: "Haz clic en 'Mezclar' para empezar",
      focused_card_hint: 'Haz clic para revelar',
      card_label: 'Ficha',
      
      maquina_config_title: 'Opciones de la Máquina',
      radio_repeat_maquina: 'Repetir opciones',
      radio_hide_maquina: 'Ocultar una vez salida',
      btn_dispense: 'Girar Manivela',
      btn_reset_maquina: 'Reiniciar Pelotas',
      active_maquina_count: 'Pelotas Disponibles',
      machine_instructions_initial: '¡Agrega opciones, gira la manivela para dispensar una pelota y ábrela!',
      ball_dropped_message: '¡Ha salido una pelota! Haz clic en ella para agrietarla y abrirla.',
      ball_crack_1_message: '¡Sigue haciendo clic para romperla!',
      ball_crack_2_message: '¡Un clic más!',
      ball_won_message: '¡Felicidades! Has ganado: ',
      
      groups_config_title: 'Configuración de Grupos',
      label_group_names: 'Nombres de Integrantes (uno por renglón)',
      label_group_count: 'Cantidad de Grupos',
      checkbox_add_topics: 'Agregar temas',
      label_group_topics: 'Temas (uno por renglón)',
      btn_generate_groups: 'Generar Grupos',
      empty_state_groups: 'Completa la configuración lateral y haz clic en "Generar Grupos" para ver la distribución aquí.',
      group_card_members: 'miembros',
      group_title_label: 'Grupo',
      group_topic_label: 'Tema'
    },
    en: {
      home_title: 'Randomizer',
      
      tab_ruleta_title: 'Roulette Wheel',
      tab_ruleta_desc: 'Add options and spin the wheel with realistic deceleration physics.',
      
      tab_numeros_title: 'Number Generator',
      tab_numeros_desc: 'Set a numeric range and generate numbers with digital odometer animation.',
      
      tab_fichas_title: 'Card Board',
      tab_fichas_desc: 'Shuffle interactive cards on the board and flip them in 3D to reveal info.',
      
      tab_maquina_title: 'Ball Machine',
      tab_maquina_desc: 'Turn the crank to dispense colorful balls and crack them open in 3 clicks.',
      
      tab_grupos_title: 'Groups Generator',
      tab_grupos_desc: 'Group members randomly in a balanced and equitable way.',
      
      btn_back_to_menu: 'Back to Menu',
      btn_reset: 'Reset',
      btn_continue: 'Continue',
      label_add_options: 'Add Options (one per line)',
      
      ruleta_config_title: 'Roulette Settings',
      btn_spin: 'Spin (10s)',
      btn_hide_option: 'Hide Winner',
      btn_reset_options: 'Reset Options',
      active_options_count: 'Active Options',
      ready_to_spin: 'Ready to spin?',
      spinning: 'Spinning...',
      winner_label: 'Winner',
      
      numeros_config_title: 'Range Settings',
      label_min: 'Minimum',
      label_max: 'Maximum',
      checkbox_customize: 'Customize',
      label_custom_numbers: 'Numbers (one per line)',
      checkbox_repeat: 'Repeat numbers',
      btn_generate: 'Generate',
      digital_prefix: 'NUMBER GENERATED',
      status_initial: 'Enter a range and click Generate',
      status_generated: 'Successfully generated within range',
      history_title: 'Generated History',
      generated_label: 'Generated',
      error_range_exhausted: 'All numbers in the range have been exhausted! Click Reset.',
      
      fichas_config_title: 'Card Settings',
      label_reveal_behavior: 'Reveal Behavior',
      radio_repeat_fichas: 'Repeat options',
      radio_hide_fichas: 'Hide once revealed',
      btn_shuffle_fichas: 'Shuffle (5s)',
      btn_reset_fichas: 'Reset Cards',
      active_fichas_count: 'Active Cards',
      lock_message: "Click 'Shuffle' to start",
      focused_card_hint: 'Click to reveal',
      card_label: 'Card',
      
      maquina_config_title: 'Machine Settings',
      radio_repeat_maquina: 'Repeat options',
      radio_hide_maquina: 'Hide once chosen',
      btn_dispense: 'Turn Crank',
      btn_reset_maquina: 'Reset Balls',
      active_maquina_count: 'Available Balls',
      machine_instructions_initial: 'Add options, turn the crank to dispense a ball and open it!',
      ball_dropped_message: 'A ball came out! Click it to crack and open it.',
      ball_crack_1_message: 'Keep clicking to break it!',
      ball_crack_2_message: 'One more click!',
      ball_won_message: 'Congratulations! You won: ',
      
      groups_config_title: 'Groups Settings',
      label_group_names: 'Member Names (one per line)',
      label_group_count: 'Number of Groups',
      checkbox_add_topics: 'Add topics',
      label_group_topics: 'Topics (one per line)',
      btn_generate_groups: 'Generate Groups',
      empty_state_groups: 'Complete the configuration sidebar and click "Generate Groups" to see the distribution here.',
      group_card_members: 'members',
      group_title_label: 'Group',
      group_topic_label: 'Topic'
    }
  };

  function translateDOM() {
    const dict = translations[currentLanguage];
    
    // Find all translate tags
    document.querySelectorAll('[data-translate]').forEach(el => {
      const key = el.getAttribute('data-translate');
      if (dict[key]) {
        // If it's a textarea or input, we modify placeholder
        if (el.tagName === 'TEXTAREA' || el.tagName === 'INPUT') {
          el.setAttribute('placeholder', dict[key]);
        } else {
          el.textContent = dict[key];
        }
      }
    });

    // Special Dynamic UI Element Translators
    if (!isSpinning && lastWinningOption === null) {
      rouletteResult.querySelector('span').textContent = dict.ready_to_spin;
    } else if (lastWinningOption !== null) {
      rouletteResult.innerHTML = `${dict.winner_label}: <strong style="color:var(--accent-pink)">${lastWinningOption}</strong>`;
    }

    if (numbersHistory.length === 0) {
      numbersStatusText.textContent = dict.status_initial;
    }
  }

  // Toggle buttons
  const langEsBtn = document.getElementById('lang-es');
  const langEnBtn = document.getElementById('lang-en');

  langEsBtn.addEventListener('click', () => {
    currentLanguage = 'es';
    langEsBtn.classList.add('active');
    langEnBtn.classList.remove('active');
    translateDOM();
    playClickSound(450, 0.05);
    
    // Refresh modules
    drawRoulette();
    renderCardsBoard(isBoardMixed);
  });

  langEnBtn.addEventListener('click', () => {
    currentLanguage = 'en';
    langEnBtn.classList.add('active');
    langEsBtn.classList.remove('active');
    translateDOM();
    playClickSound(450, 0.05);
    
    // Refresh modules
    drawRoulette();
    renderCardsBoard(isBoardMixed);
  });


  // =============================================================
  // HOME MENU / ROUTING LOGIC
  // =============================================================
  const menuCards = document.querySelectorAll('.menu-card');
  const viewTabs = document.querySelectorAll('.view-tab');
  const btnBackHomes = document.querySelectorAll('.btn-back-home');

  menuCards.forEach(card => {
    card.addEventListener('click', () => {
      const targetTab = card.getAttribute('data-target');
      playClickSound(400, 0.05);
      switchTab(targetTab);
    });
  });

  btnBackHomes.forEach(btn => {
    btn.addEventListener('click', () => {
      playClickSound(300, 0.05);
      switchTab('home');
    });
  });

  function switchTab(tabName) {
    viewTabs.forEach(tab => {
      if (tab.id === `tab-${tabName}`) {
        tab.style.display = tabName === 'home' ? 'flex' : 'flex';
        setTimeout(() => {
          tab.classList.add('active');
        }, 50);
      } else {
        tab.classList.remove('active');
        setTimeout(() => {
          tab.style.display = 'none';
        }, 300);
      }
    });
  }

  // =============================================================
  // MODULE 1: RULETA
  // =============================================================
  const rouletteCanvas = document.getElementById('roulette-canvas');
  const rCtx = rouletteCanvas.getContext('2d');
  const rouletteResult = document.getElementById('roulette-result');
  const rouletteOptionsInput = document.getElementById('roulette-options-input');
  const btnSpin = document.getElementById('btn-spin');
  const btnHideOption = document.getElementById('btn-hide-option');
  const btnResetOptions = document.getElementById('btn-reset-options');
  const ruletaActiveCount = document.getElementById('ruleta-active-count');
  const ruletaActiveList = document.getElementById('ruleta-active-list');

  let ruletaAllOptions = ['Fresa', 'Plátano', 'Manzana', 'Naranja', 'Uva', 'Sandía', 'Mango'];
  let ruletaActiveOptions = [...ruletaAllOptions];
  let ruletaHiddenOptions = [];
  let currentAngle = 0;
  let isSpinning = false;
  let lastWinningOption = null;

  const sliceColors = [
    'hsl(263, 85%, 60%)',
    'hsl(185, 90%, 45%)',
    'hsl(323, 85%, 55%)',
    'hsl(160, 80%, 42%)',
    'hsl(28, 95%, 50%)',
    'hsl(198, 90%, 50%)',
    'hsl(285, 80%, 55%)',
    'hsl(48, 95%, 48%)'
  ];

  function drawRoulette() {
    const size = rouletteCanvas.width;
    const center = size / 2;
    const radius = center - 12;
    
    rCtx.clearRect(0, 0, size, size);
    
    const count = ruletaActiveOptions.length;
    if (count === 0) {
      rCtx.save();
      rCtx.translate(center, center);
      rCtx.fillStyle = 'rgba(255,255,255,0.05)';
      rCtx.beginPath();
      rCtx.arc(0, 0, radius, 0, Math.PI * 2);
      rCtx.fill();
      
      rCtx.fillStyle = 'var(--text-muted)';
      rCtx.font = 'bold 18px Outfit';
      rCtx.textAlign = 'center';
      const labelText = currentLanguage === 'es' ? 'Sin opciones activas' : 'No active options';
      rCtx.fillText(labelText, 0, 8);
      rCtx.restore();
      return;
    }

    const arcSize = (Math.PI * 2) / count;

    rCtx.save();
    rCtx.translate(center, center);
    rCtx.rotate(currentAngle);

    for (let i = 0; i < count; i++) {
      const angle = i * arcSize;
      rCtx.fillStyle = sliceColors[i % sliceColors.length];
      
      rCtx.beginPath();
      rCtx.moveTo(0, 0);
      rCtx.arc(0, 0, radius, angle, angle + arcSize);
      rCtx.closePath();
      rCtx.fill();
      
      rCtx.strokeStyle = 'rgba(0, 0, 0, 0.25)';
      rCtx.lineWidth = 1.5;
      rCtx.stroke();
      
      rCtx.save();
      rCtx.rotate(angle + arcSize / 2);
      rCtx.fillStyle = 'white';
      rCtx.font = 'bold 15px Outfit';
      rCtx.textAlign = 'right';
      
      let text = ruletaActiveOptions[i];
      if (text.length > 12) text = text.substring(0, 10) + '...';
      
      rCtx.fillText(text, radius - 25, 6);
      rCtx.restore();
    }
    rCtx.restore();
  }

  function updateActiveBadges() {
    ruletaActiveCount.textContent = ruletaActiveOptions.length;
    ruletaActiveList.innerHTML = '';
    
    ruletaAllOptions.forEach(opt => {
      const li = document.createElement('li');
      li.className = 'badge-item';
      if (!ruletaActiveOptions.includes(opt)) {
        li.classList.add('hidden-badge');
      }
      li.textContent = opt;
      ruletaActiveList.appendChild(li);
    });
  }

  function parseRouletteInput() {
    const text = rouletteOptionsInput.value;
    const parsed = text.split('\n')
                       .map(line => line.trim())
                       .filter(line => line.length > 0);
    if (parsed.length > 0) {
      ruletaAllOptions = parsed;
      ruletaActiveOptions = [...ruletaAllOptions];
      ruletaHiddenOptions = [];
      lastWinningOption = null;
      btnHideOption.disabled = true;
      updateActiveBadges();
      drawRoulette();
    }
  }

  rouletteOptionsInput.value = ruletaAllOptions.join('\n');
  rouletteOptionsInput.addEventListener('input', parseRouletteInput);

  function getAngleFactor(t) {
    if (t < 0.3) {
      return (t * t * t) / 0.27;
    } else if (t < 0.7) {
      return 0.1 + (t - 0.3);
    } else {
      let u = (t - 0.7) / 0.3;
      return 0.5 + 0.075 - 0.075 * Math.pow(1 - u, 4);
    }
  }

  function spinRoulette() {
    if (isSpinning || ruletaActiveOptions.length === 0) return;
    
    isSpinning = true;
    btnSpin.disabled = true;
    btnHideOption.disabled = true;
    btnResetOptions.disabled = true;
    rouletteOptionsInput.disabled = true;
    
    rouletteResult.classList.remove('pulse');
    const spinningLabel = translations[currentLanguage].spinning;
    rouletteResult.innerHTML = `<span>${spinningLabel}</span>`;
    
    const N = ruletaActiveOptions.length;
    const winningIndex = Math.floor(Math.random() * N);
    lastWinningOption = ruletaActiveOptions[winningIndex];
    
    const sectorWidth = (2 * Math.PI) / N;
    const targetSectorCenter = winningIndex * sectorWidth + sectorWidth / 2;
    const spins = 12 + Math.floor(Math.random() * 5);
    const startAngle = currentAngle % (2 * Math.PI);
    const targetAngle = -Math.PI / 2 - targetSectorCenter + 2 * Math.PI * spins;
    const totalRotation = targetAngle - startAngle;
    
    const duration = 10000; // 10 seconds
    const startTime = performance.now();
    let lastTickAngle = 0;

    function animate(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      const normFactor = getAngleFactor(progress) / 0.575;
      currentAngle = startAngle + totalRotation * normFactor;
      
      drawRoulette();
      
      const currentTickValue = Math.floor(currentAngle / (Math.PI * 2 / N));
      if (currentTickValue !== lastTickAngle) {
        playClickSound(700, 0.02);
        lastTickAngle = currentTickValue;
      }
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        isSpinning = false;
        btnSpin.disabled = false;
        btnHideOption.disabled = false;
        btnResetOptions.disabled = false;
        rouletteOptionsInput.disabled = false;
        
        const winnerPrefix = translations[currentLanguage].winner_label;
        rouletteResult.innerHTML = `${winnerPrefix}: <strong style="color:var(--accent-pink)">${lastWinningOption}</strong>`;
        rouletteResult.classList.add('pulse');
        
        playFanfareSound();
        triggerConfetti(document.getElementById('tab-ruleta').querySelector('.visual-container'));
      }
    }
    requestAnimationFrame(animate);
  }

  btnSpin.addEventListener('click', spinRoulette);

  btnHideOption.addEventListener('click', () => {
    if (!lastWinningOption) return;
    
    ruletaActiveOptions = ruletaActiveOptions.filter(opt => opt !== lastWinningOption);
    ruletaHiddenOptions.push(lastWinningOption);
    lastWinningOption = null;
    btnHideOption.disabled = true;
    
    updateActiveBadges();
    drawRoulette();
    playClickSound(300, 0.08);
  });

  btnResetOptions.addEventListener('click', () => {
    ruletaActiveOptions = [...ruletaAllOptions];
    ruletaHiddenOptions = [];
    lastWinningOption = null;
    btnHideOption.disabled = true;
    updateActiveBadges();
    drawRoulette();
    playClickSound(500, 0.06);
  });

  updateActiveBadges();
  drawRoulette();


  // =============================================================
  // MODULE 2: GENERADOR DE NÚMEROS
  // =============================================================
  const numMinInput = document.getElementById('num-min');
  const numMaxInput = document.getElementById('num-max');
  const checkboxRepeat = document.getElementById('checkbox-repeat');
  const btnGenerateNumber = document.getElementById('btn-generate-number');
  const btnResetNumber = document.getElementById('btn-reset-number');
  const numberDisplay = document.getElementById('number-display');
  const numbersStatusText = document.getElementById('numbers-status-text');
  const numbersHistoryList = document.getElementById('numbers-history-list');
  const historyCountBadge = document.getElementById('history-count');
  const checkboxCustomize = document.getElementById('checkbox-customize');
  const rangeInputsGroup = document.getElementById('range-inputs-group');
  const customNumbersGroup = document.getElementById('custom-numbers-group');
  const customNumbersInput = document.getElementById('custom-numbers-input');

  let numbersHistory = [];

  // Default custom numbers template
  if (customNumbersInput) {
    customNumbersInput.value = "10\n20\n30\n40\n50";
  }

  if (checkboxCustomize) {
    checkboxCustomize.addEventListener('change', () => {
      playClickSound(400, 0.05);
      if (checkboxCustomize.checked) {
        rangeInputsGroup.style.display = 'none';
        customNumbersGroup.style.display = 'flex';
      } else {
        rangeInputsGroup.style.display = 'block';
        customNumbersGroup.style.display = 'none';
      }
    });
  }

  function generateRandomNumber() {
    const repeat = checkboxRepeat.checked;
    const dict = translations[currentLanguage];
    const customize = checkboxCustomize ? checkboxCustomize.checked : false;

    let numbersList = [];
    let min = 0;
    let max = 0;
    let rangeSize = 0;

    if (customize) {
      const text = customNumbersInput.value;
      numbersList = text.split('\n')
                        .map(line => line.trim())
                        .filter(line => line.length > 0)
                        .map(Number)
                        .filter(val => !isNaN(val));
      
      // Remove duplicate custom numbers
      numbersList = [...new Set(numbersList)];

      if (numbersList.length === 0) {
        alert(currentLanguage === 'es' ? 'Por favor, ingresa números válidos.' : 'Please enter valid numbers.');
        return;
      }

      if (!repeat) {
        const available = numbersList.filter(n => !numbersHistory.includes(n));
        if (available.length === 0) {
          numbersStatusText.innerHTML = `<span style="color:var(--accent-red)">${dict.error_range_exhausted}</span>`;
          playClickSound(180, 0.2);
          return;
        }
      }
    } else {
      min = parseInt(numMinInput.value, 10);
      max = parseInt(numMaxInput.value, 10);

      if (isNaN(min) || isNaN(max)) {
        alert(currentLanguage === 'es' ? 'Por favor, ingresa números válidos para los límites.' : 'Please enter valid limit numbers.');
        return;
      }
      
      if (min > max) {
        alert(currentLanguage === 'es' ? 'El valor mínimo no puede ser mayor que el valor máximo.' : 'Minimum value cannot be greater than maximum value.');
        return;
      }

      rangeSize = max - min + 1;
      
      if (!repeat && numbersHistory.length >= rangeSize) {
        numbersStatusText.innerHTML = `<span style="color:var(--accent-red)">${dict.error_range_exhausted}</span>`;
        playClickSound(180, 0.2);
        return;
      }
    }

    btnGenerateNumber.disabled = true;
    btnResetNumber.disabled = true;
    
    let count = 0;
    const ticks = 18;
    let speed = 40;
    let finalVal = 0;
    
    if (customize) {
      if (repeat) {
        finalVal = numbersList[Math.floor(Math.random() * numbersList.length)];
      } else {
        const available = numbersList.filter(n => !numbersHistory.includes(n));
        finalVal = available[Math.floor(Math.random() * available.length)];
      }
    } else {
      if (repeat) {
        finalVal = Math.floor(Math.random() * rangeSize) + min;
      } else {
        do {
          finalVal = Math.floor(Math.random() * rangeSize) + min;
        } while (numbersHistory.includes(finalVal));
      }
    }
    
    function spinOdometer() {
      let tempVal;
      if (customize) {
        tempVal = numbersList[Math.floor(Math.random() * numbersList.length)];
      } else {
        tempVal = Math.floor(Math.random() * rangeSize) + min;
      }
      numberDisplay.textContent = tempVal;
      playClickSound(800, 0.02);
      
      count++;
      if (count < ticks) {
        speed += 12;
        setTimeout(spinOdometer, speed);
      } else {
        numberDisplay.textContent = finalVal;
        numbersHistory.push(finalVal);
        
        historyCountBadge.textContent = numbersHistory.length;
        const li = document.createElement('li');
        li.className = 'history-item';
        li.innerHTML = `<span class="history-index">${dict.generated_label} #${numbersHistory.length}</span><span class="history-val">${finalVal}</span>`;
        numbersHistoryList.insertBefore(li, numbersHistoryList.firstChild);
        
        if (customize) {
          numbersStatusText.textContent = currentLanguage === 'es' ? 'Generado correctamente' : 'Successfully generated';
        } else {
          numbersStatusText.textContent = `${dict.status_generated} [${min}, ${max}]`;
        }
        
        btnGenerateNumber.disabled = false;
        btnResetNumber.disabled = false;
        playFanfareSound();
        triggerConfetti(document.getElementById('tab-numeros').querySelector('.visual-container'));
      }
    }
    spinOdometer();
  }

  btnGenerateNumber.addEventListener('click', generateRandomNumber);

  btnResetNumber.addEventListener('click', () => {
    numbersHistory = [];
    numberDisplay.textContent = '0';
    historyCountBadge.textContent = '0';
    numbersHistoryList.innerHTML = '';
    numbersStatusText.textContent = translations[currentLanguage].status_initial;
    playClickSound(400, 0.05);
  });


  // =============================================================
  // MODULE 3: FICHAS
  // =============================================================
  const cardsBoard = document.getElementById('cards-board');
  const cardsBoardWrapper = document.querySelector('.cards-board-wrapper');
  const fichasOptionsInput = document.getElementById('fichas-options-input');
  const btnShuffleCards = document.getElementById('btn-shuffle-cards');
  const btnResetCards = document.getElementById('btn-reset-cards');
  const fichasCountdown = document.getElementById('fichas-countdown');
  const fichasActiveCount = document.getElementById('fichas-active-count');
  const fichasActiveList = document.getElementById('fichas-active-list');
  
  const focusedCardBackdrop = document.getElementById('focused-card-backdrop');
  const focusedCard = document.getElementById('focused-card');
  const focusedCardText = document.getElementById('focused-card-text');
  const focusedCardLogo = document.getElementById('focused-card-logo');
  const btnContinueCard = document.getElementById('btn-continue-card');

  let fichasAllOptions = ['Ficha A', 'Ficha B', 'Ficha C', 'Ficha D', 'Ficha E', 'Ficha F', 'Ficha G', 'Ficha H'];
  let fichasActiveOptions = [...fichasAllOptions];
  let fichasRevealedOptions = [];
  let isShuffling = false;
  let isBoardMixed = false; // block selects until shuffle completes
  let clickedCardId = null;

  // Render cards board. If hasMixed is true, show indices on the face down card fronts instead of "?".
  function renderCardsBoard(hasMixed = false) {
    cardsBoard.innerHTML = '';
    let displayList = [...fichasActiveOptions];
    
    if (displayList.length === 0) {
      cardsBoard.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; color: var(--text-muted); font-size: 16px; padding: 40px;">
          ${currentLanguage === 'es' ? 'No hay fichas activas disponibles.' : 'No active cards available.'}
        </div>
      `;
      return;
    }
    
    const cardTextLabel = translations[currentLanguage].card_label;
    
    displayList.forEach((text, index) => {
      const card = document.createElement('div');
      card.className = 'card-item';
      card.dataset.index = index;
      card.dataset.text = text;
      
      // If mixed, show numbers like "1", "2", ... otherwise "?"
      const frontContent = hasMixed ? `${index + 1}` : `?`;
      
      card.innerHTML = `
        <div class="card-inner">
          <div class="card-front">
            <div class="card-logo">${frontContent}</div>
            <div class="card-hint">${cardTextLabel}</div>
          </div>
          <div class="card-back">
            <div class="card-text">${text}</div>
          </div>
        </div>
      `;
      
      card.addEventListener('click', () => {
        if (isShuffling || !isBoardMixed) return;
        selectCard(card, text, index);
      });
      
      cardsBoard.appendChild(card);
    });
  }

  function updateFichasActiveBadges() {
    fichasActiveCount.textContent = fichasActiveOptions.length;
    fichasActiveList.innerHTML = '';
    
    fichasAllOptions.forEach(opt => {
      const li = document.createElement('li');
      li.className = 'badge-item';
      if (!fichasActiveOptions.includes(opt)) {
        li.classList.add('hidden-badge');
      }
      li.textContent = opt;
      fichasActiveList.appendChild(li);
    });
  }

  function parseFichasInput() {
    const text = fichasOptionsInput.value;
    const parsed = text.split('\n')
                       .map(line => line.trim())
                       .filter(line => line.length > 0);
    if (parsed.length > 0) {
      fichasAllOptions = parsed;
      fichasActiveOptions = [...fichasAllOptions];
      fichasRevealedOptions = [];
      isBoardMixed = false;
      cardsBoardWrapper.classList.remove('unlocked');
      cardsBoard.classList.add('locked-state');
      updateFichasActiveBadges();
      renderCardsBoard(false);
    }
  }

  fichasOptionsInput.value = fichasAllOptions.join('\n');
  fichasOptionsInput.addEventListener('input', parseFichasInput);

  function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  function startShuffle() {
    if (isShuffling || fichasActiveOptions.length === 0) return;
    
    isShuffling = true;
    isBoardMixed = false;
    btnShuffleCards.disabled = true;
    btnResetCards.disabled = true;
    fichasOptionsInput.disabled = true;
    
    // Hide lock overlay during mix count down
    cardsBoardWrapper.classList.add('unlocked');
    cardsBoard.classList.remove('locked-state');
    
    // Physical Swap coordinates loop
    const cards = cardsBoard.querySelectorAll('.card-item');
    cards.forEach(card => {
      card.classList.add('position-shuffling');
      // Face down
      card.classList.remove('flipped');
      const logo = card.querySelector('.card-logo');
      if (logo) {
        logo.textContent = '?';
      }
    });
    
    let mixTick = 0;
    const mixInterval = setInterval(() => {
      cards.forEach(card => {
        // Translate randomly on 2D space to swap positions physically
        const randX = (Math.random() - 0.5) * 180;
        const randY = (Math.random() - 0.5) * 220;
        const randRot = (Math.random() - 0.5) * 90;
        card.style.transform = `translate(${randX}px, ${randY}px) rotate(${randRot}deg)`;
      });
      mixTick++;
      if (mixTick >= 12) clearInterval(mixInterval); // every 400ms during 5s
    }, 400);
    
    playTickTick(12, 400);

    // Shuffle countdown logic (5 seconds)
    fichasCountdown.style.display = 'block';
    let timeLeft = 5;
    fichasCountdown.textContent = timeLeft;
    
    const countTimer = setInterval(() => {
      timeLeft--;
      if (timeLeft > 0) {
        fichasCountdown.textContent = timeLeft;
        playClickSound(500, 0.05);
      } else {
        clearInterval(countTimer);
        clearInterval(mixInterval); // secure
        fichasCountdown.style.display = 'none';
        
        // Reset transforms
        cards.forEach(card => {
          card.style.transform = '';
          card.classList.remove('position-shuffling');
        });
        
        // Finalize shuffle
        fichasActiveOptions = shuffleArray([...fichasActiveOptions]);
        isBoardMixed = true;
        
        // Render board with numbers on fronts
        renderCardsBoard(true);
        
        // Verify unlocked state is active
        cardsBoardWrapper.classList.add('unlocked');
        cardsBoard.classList.remove('locked-state');
        
        isShuffling = false;
        btnShuffleCards.disabled = false;
        btnResetCards.disabled = false;
        fichasOptionsInput.disabled = false;
        playFanfareSound();
      }
    }, 1000);
  }

  btnShuffleCards.addEventListener('click', startShuffle);

  btnResetCards.addEventListener('click', () => {
    fichasActiveOptions = [...fichasAllOptions];
    fichasRevealedOptions = [];
    isBoardMixed = false;
    
    // Lock cards board
    cardsBoardWrapper.classList.remove('unlocked');
    cardsBoard.classList.add('locked-state');
    
    updateFichasActiveBadges();
    renderCardsBoard(false);
    playClickSound(500, 0.06);
  });

  function selectCard(cardElement, text, index) {
    clickedCardId = index;
    focusedCardText.textContent = text;
    
    // Focus card shows the corresponding mixed number on front
    focusedCardLogo.textContent = `${index + 1}`;
    
    focusedCard.classList.remove('flipped');
    btnContinueCard.style.display = 'none';
    
    focusedCardBackdrop.classList.add('active');
    playClickSound(500, 0.08);
  }

  focusedCard.addEventListener('click', (e) => {
    e.stopPropagation();
    if (focusedCard.classList.contains('flipped')) return;
    
    focusedCard.classList.add('flipped');
    playPopSound();
    btnContinueCard.style.display = 'block';
  });

  btnContinueCard.addEventListener('click', (e) => {
    e.stopPropagation();
    focusedCardBackdrop.classList.remove('active');
    playClickSound(400, 0.05);
    
    const mode = document.querySelector('input[name="fichas-mode"]:checked').value;
    if (mode === 'hide' && clickedCardId !== null) {
      const optionToRemove = fichasActiveOptions[clickedCardId];
      fichasActiveOptions.splice(clickedCardId, 1);
      fichasRevealedOptions.push(optionToRemove);
      updateFichasActiveBadges();
      // Render again using numbers
      renderCardsBoard(true);
    }
    
    clickedCardId = null;
  });

  focusedCardBackdrop.addEventListener('click', () => {
    if (focusedCard.classList.contains('flipped')) return;
    focusedCardBackdrop.classList.remove('active');
  });

  updateFichasActiveBadges();
  renderCardsBoard(false);


  // =============================================================
  // MODULE 4: MÁQUINA DE PELOTAS
  // =============================================================
  const maquinaOptionsInput = document.getElementById('maquina-options-input');
  const btnDispense = document.getElementById('btn-dispense');
  const btnResetMaquina = document.getElementById('btn-reset-maquina');
  const machineLever = document.getElementById('machine-lever');
  const ballsInsideContainer = document.getElementById('balls-inside-container');
  const dispensedBallArea = document.getElementById('dispensed-ball-area');
  const interactiveBall = document.getElementById('interactive-ball');
  const ballSprite = document.getElementById('ball-sprite');
  const ballCrack1 = document.getElementById('ball-crack-1');
  const ballCrack2 = document.getElementById('ball-crack-2');
  const ballSmoke = document.getElementById('ball-smoke');
  const ballRevealedOverlay = document.getElementById('ball-revealed-overlay');
  const ballRevealedText = document.getElementById('ball-revealed-text');
  const machineInstructions = document.getElementById('machine-instructions');
  const machineFocusedControls = document.getElementById('machine-focused-controls');
  const maquinaActiveCount = document.getElementById('maquina-active-count');
  const maquinaActiveList = document.getElementById('maquina-active-list');

  let maquinaAllOptions = ['Premio A', 'Premio B', 'Premio C', 'Premio D', 'Premio E', 'Premio F'];
  let maquinaActiveOptions = [...maquinaAllOptions];
  let isDispensing = false;
  let currentBallClickCount = 0;
  let activeDispensedOption = null;

  const ballGradients = [
    'radial-gradient(circle at 35% 35%, #ffd269 0%, #f97316 60%, #9a3412 100%)',
    'radial-gradient(circle at 35% 35%, #a5f3fc 0%, #06b6d4 60%, #0891b2 100%)',
    'radial-gradient(circle at 35% 35%, #fbcfe8 0%, #ec4899 60%, #9d174d 100%)',
    'radial-gradient(circle at 35% 35%, #c084fc 0%, #8b5cf6 60%, #5b21b6 100%)',
    'radial-gradient(circle at 35% 35%, #99f6e4 0%, #14b8a6 60%, #0f766e 100%)'
  ];

  function initFloatingBalls() {
    ballsInsideContainer.innerHTML = '';
    const numBalls = 14;
    for (let i = 0; i < numBalls; i++) {
      const ball = document.createElement('div');
      ball.className = 'floating-ball';
      
      const size = Math.random() * 8 + 26;
      const left = Math.random() * 80 + 10;
      const bottom = Math.random() * 45 + 5;
      const grad = ballGradients[i % ballGradients.length];
      
      ball.style.width = `${size}px`;
      ball.style.height = `${size}px`;
      ball.style.left = `${left}%`;
      ball.style.bottom = `${bottom}%`;
      ball.style.background = grad;
      
      ball.style.animation = `floatBall ${Math.random() * 3 + 2}s ease-in-out infinite alternate`;
      ball.style.animationDelay = `${Math.random() * 2}s`;
      
      ballsInsideContainer.appendChild(ball);
    }
  }

  function updateMaquinaActiveBadges() {
    maquinaActiveCount.textContent = maquinaActiveOptions.length;
    maquinaActiveList.innerHTML = '';
    
    maquinaAllOptions.forEach(opt => {
      const li = document.createElement('li');
      li.className = 'badge-item';
      if (!maquinaActiveOptions.includes(opt)) {
        li.classList.add('hidden-badge');
      }
      li.textContent = opt;
      maquinaActiveList.appendChild(li);
    });
  }

  function parseMaquinaInput() {
    const text = maquinaOptionsInput.value;
    const parsed = text.split('\n')
                       .map(line => line.trim())
                       .filter(line => line.length > 0);
    if (parsed.length > 0) {
      maquinaAllOptions = parsed;
      maquinaActiveOptions = [...maquinaAllOptions];
      updateMaquinaActiveBadges();
    }
  }

  maquinaOptionsInput.value = maquinaAllOptions.join('\n');
  maquinaOptionsInput.addEventListener('input', parseMaquinaInput);

  function dispenseBall() {
    if (isDispensing || maquinaActiveOptions.length === 0) return;
    
    isDispensing = true;
    btnDispense.disabled = true;
    btnResetMaquina.disabled = true;
    maquinaOptionsInput.disabled = true;
    
    const idx = Math.floor(Math.random() * maquinaActiveOptions.length);
    activeDispensedOption = maquinaActiveOptions[idx];
    
    // 1. Lever rotates
    machineLever.classList.add('spinning');
    playClickSound(300, 0.4);
    
    // 2. Shake AND move balls inside from side to side dynamically
    ballsInsideContainer.classList.add('mixing');
    
    setTimeout(() => {
      // 3. Open gate, let ball drop
      document.querySelector('.dispenser-gate').classList.add('open');
      
      // Stop dome mixing
      ballsInsideContainer.classList.remove('mixing');
      
      // Dispense ball visually
      interactiveBall.style.display = 'flex';
      interactiveBall.className = 'interactive-ball ball-dropping';
      
      currentBallClickCount = 0;
      ballCrack1.style.opacity = 0;
      ballCrack2.style.opacity = 0;
      ballSmoke.innerHTML = '';
      ballRevealedOverlay.classList.remove('show');
      machineFocusedControls.style.display = 'none';
      
      const randGrad = ballGradients[Math.floor(Math.random() * ballGradients.length)];
      ballSprite.style.background = randGrad;
      
      playPopSound();
      
      machineLever.classList.remove('spinning');
      machineInstructions.textContent = translations[currentLanguage].ball_dropped_message;
    }, 950);
  }

  interactiveBall.addEventListener('click', () => {
    if (currentBallClickCount >= 3 || !isDispensing) return;
    
    currentBallClickCount++;
    
    if (currentBallClickCount === 1) {
      ballSprite.classList.add('shake-mild');
      ballCrack1.style.opacity = 0.9;
      playClickSound(200, 0.1);
      machineInstructions.textContent = translations[currentLanguage].ball_crack_1_message;
      
      setTimeout(() => {
        ballSprite.classList.remove('shake-mild');
      }, 400);
      
    } else if (currentBallClickCount === 2) {
      ballSprite.classList.add('shake-heavy');
      ballCrack2.style.opacity = 0.9;
      playClickSound(150, 0.15);
      machineInstructions.textContent = translations[currentLanguage].ball_crack_2_message;
      
      setTimeout(() => {
        ballSprite.classList.remove('shake-heavy');
      }, 450);
      
    } else if (currentBallClickCount === 3) {
      playPopSound();
      playFanfareSound();
      
      ballSprite.style.opacity = 0;
      ballCrack1.style.opacity = 0;
      ballCrack2.style.opacity = 0;
      
      createSmokeParticles();
      
      ballRevealedText.textContent = activeDispensedOption;
      ballRevealedOverlay.classList.add('show');
      
      machineInstructions.textContent = `${translations[currentLanguage].ball_won_message}${activeDispensedOption}`;
      
      triggerConfetti(document.getElementById('tab-maquina').querySelector('.visual-container'));
      machineFocusedControls.style.display = 'block';
    }
  });

  function createSmokeParticles() {
    ballSmoke.innerHTML = '';
    const particleCount = 12;
    for (let i = 0; i < particleCount; i++) {
      const p = document.createElement('div');
      p.className = 'smoke-particle';
      
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.random() * 50 + 50;
      const x = Math.cos(angle) * dist;
      const y = Math.sin(angle) * dist;
      
      p.style.setProperty('--x', `${x}px`);
      p.style.setProperty('--y', `${y}px`);
      p.style.left = '40%';
      p.style.top = '40%';
      
      ballSmoke.appendChild(p);
    }
  }

  document.getElementById('btn-continue-machine').addEventListener('click', () => {
    interactiveBall.style.display = 'none';
    ballSprite.style.opacity = 1;
    machineFocusedControls.style.display = 'none';
    document.querySelector('.dispenser-gate').classList.remove('open');
    
    const mode = document.querySelector('input[name="maquina-mode"]:checked').value;
    if (mode === 'hide' && activeDispensedOption) {
      maquinaActiveOptions = maquinaActiveOptions.filter(opt => opt !== activeDispensedOption);
      updateMaquinaActiveBadges();
    }
    
    isDispensing = false;
    activeDispensedOption = null;
    btnDispense.disabled = false;
    btnResetMaquina.disabled = false;
    maquinaOptionsInput.disabled = false;
    machineInstructions.textContent = translations[currentLanguage].machine_instructions_initial;
    playClickSound(400, 0.05);
  });

  btnDispense.addEventListener('click', dispenseBall);

  btnResetMaquina.addEventListener('click', () => {
    maquinaActiveOptions = [...maquinaAllOptions];
    interactiveBall.style.display = 'none';
    ballSprite.style.opacity = 1;
    machineFocusedControls.style.display = 'none';
    document.querySelector('.dispenser-gate').classList.remove('open');
    isDispensing = false;
    activeDispensedOption = null;
    btnDispense.disabled = false;
    btnResetMaquina.disabled = false;
    maquinaOptionsInput.disabled = false;
    updateMaquinaActiveBadges();
    initFloatingBalls();
    machineInstructions.textContent = translations[currentLanguage].machine_instructions_initial;
    playClickSound(500, 0.06);
  });

  initFloatingBalls();
  updateMaquinaActiveBadges();


  // =============================================================
  // MODULE 5: GRUPOS
  // =============================================================
  const groupsNamesInput = document.getElementById('groups-names-input');
  const groupsCountInput = document.getElementById('groups-count');
  const btnGenerateGroups = document.getElementById('btn-generate-groups');
  const btnResetGroups = document.getElementById('btn-reset-groups');
  const groupsResults = document.getElementById('groups-results');
  const checkboxAddTopics = document.getElementById('checkbox-add-topics');
  const groupTopicsGroup = document.getElementById('group-topics-group');
  const groupTopicsInput = document.getElementById('group-topics-input');

  let defaultNames = [
    'Sofía', 'Alejandro', 'Valentina', 'Mateo', 'Camila', 
    'Santiago', 'Isabella', 'Sebastián', 'Mariana', 'Nicolás'
  ];

  let defaultTopics = [
    'Ciencia', 'Tecnología', 'Historia', 'Arte', 'Literatura', 'Geografía'
  ];
  
  groupsNamesInput.value = defaultNames.join('\n');
  if (groupTopicsInput) {
    groupTopicsInput.value = defaultTopics.join('\n');
  }

  if (checkboxAddTopics) {
    checkboxAddTopics.addEventListener('change', () => {
      playClickSound(400, 0.05);
      if (checkboxAddTopics.checked) {
        groupTopicsGroup.style.display = 'flex';
      } else {
        groupTopicsGroup.style.display = 'none';
      }
    });
  }

  function generateGroups() {
    const text = groupsNamesInput.value;
    const names = text.split('\n')
                      .map(line => line.trim())
                      .filter(line => line.length > 0);
                      
    const groupCount = parseInt(groupsCountInput.value, 10);
    
    if (names.length < 2) {
      alert(currentLanguage === 'es' ? 'Por favor, ingresa al menos 2 integrantes.' : 'Please enter at least 2 member names.');
      return;
    }
    
    if (isNaN(groupCount) || groupCount < 2) {
      alert(currentLanguage === 'es' ? 'La cantidad mínima de grupos a generar debe ser 2.' : 'The minimum amount of groups to generate is 2.');
      return;
    }

    if (groupCount > names.length) {
      alert(currentLanguage === 'es' ? 'La cantidad de grupos no puede ser mayor que la cantidad de integrantes.' : 'Group count cannot exceed member count.');
      return;
    }

    // Handle topics if option is selected
    let topics = [];
    const addTopics = checkboxAddTopics && checkboxAddTopics.checked;
    if (addTopics) {
      const topicsText = groupTopicsInput.value;
      topics = topicsText.split('\n')
                         .map(line => line.trim())
                         .filter(line => line.length > 0);
      
      if (topics.length === 0) {
        alert(currentLanguage === 'es' ? 'Por favor, ingresa al menos un tema.' : 'Please enter at least one topic.');
        return;
      }
    }

    playClickSound(300, 0.1);
    
    const shuffled = shuffleArray([...names]);
    const groups = Array.from({ length: groupCount }).map(() => []);
    
    shuffled.forEach((name, idx) => {
      const groupIdx = idx % groupCount;
      groups[groupIdx].push(name);
    });

    // Shuffle topics if active
    let shuffledTopics = [];
    if (addTopics) {
      shuffledTopics = shuffleArray([...topics]);
    }

    groupsResults.innerHTML = '';
    
    const membersSuffix = translations[currentLanguage].group_card_members;
    const groupPrefix = translations[currentLanguage].group_title_label;
    const topicLabel = translations[currentLanguage].group_topic_label;
    
    groups.forEach((members, idx) => {
      const card = document.createElement('div');
      card.className = 'group-card';
      
      const listItems = members.map(m => `
        <li class="group-member-item">
          <div class="group-member-avatar">${m.charAt(0).toUpperCase()}</div>
          <span>${m}</span>
        </li>
      `).join('');

      let topicHtml = '';
      if (addTopics) {
        const assignedTopic = shuffledTopics[idx % shuffledTopics.length];
        topicHtml = `
          <div class="group-topic">
            <span class="group-topic-label">${topicLabel}:</span>
            <span class="group-topic-name">${assignedTopic}</span>
          </div>
        `;
      }
      
      card.innerHTML = `
        <div class="group-header">
          <h3 class="group-title">${groupPrefix} ${idx + 1}</h3>
          <span class="group-badge">${members.length} ${membersSuffix}</span>
        </div>
        ${topicHtml}
        <ul class="group-members">
          ${listItems}
        </ul>
      `;
      
      groupsResults.appendChild(card);
    });

    playFanfareSound();
    // Confetti is disabled for groups generator!
  }

  btnGenerateGroups.addEventListener('click', generateGroups);

  btnResetGroups.addEventListener('click', () => {
    const dict = translations[currentLanguage];
    groupsResults.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">
          <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
          </svg>
        </div>
        <p data-translate="empty_state_groups">${dict.empty_state_groups}</p>
      </div>
    `;
    groupsNamesInput.value = defaultNames.join('\n');
    groupsCountInput.value = 2;
    if (checkboxAddTopics) {
      checkboxAddTopics.checked = false;
    }
    if (groupTopicsGroup) {
      groupTopicsGroup.style.display = 'none';
    }
    if (groupTopicsInput) {
      groupTopicsInput.value = defaultTopics.join('\n');
    }
    playClickSound(500, 0.06);
  });

});
