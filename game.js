(function () {
  const SKINS = {
    default: {
      name: 'Default Duck',
      images: {
        hungry: 'images/normal/hungry.png',
        normal: 'images/normal/normal.png',
        overfed: 'images/normal/overfed.png',
        dead: 'images/normal/dead.png',
        fitness: 'images/normal/fitness.png',
      },
    },
    crypto: {
      name: 'Crypto Duck',
      images: {
        hungry: 'images/cryptoduck/hungry.png',
        normal: 'images/cryptoduck/normal.png',
        overfed: 'images/cryptoduck/overfed.png',
        dead: 'images/cryptoduck/dead.png',
        fitness: 'images/cryptoduck/fitness.png',
      },
    },
    cyborg: {
      name: 'Cyborg Duck',
      images: {
        hungry: 'images/cyborg/cyborg_hungry.png',
        normal: 'images/cyborg/cyborg_normal.png',
        overfed: 'images/cyborg/cyborg_overfed.png',
        dead: 'images/cyborg/cyborg_dead.png',
        fitness: 'images/cyborg/cyborg_fitness.png',
      },
    },
    silver: {
      name: 'Silver Duck',
      images: {
        hungry: 'images/silver/silver_hungry.png',
        normal: 'images/silver/silver_normal.png',
        overfed: 'images/silver/silver_overfed.png',
        dead: 'images/silver/silver_dead.png',
        fitness: 'images/silver/silver_fitness.png',
      },
    },
  };

  const UPGRADES = [
    // Level 1 (from player level 1)
    { id: 'helmet', name: 'Safety Helmet', icon: '🛡️', baseCost: 100, effect: () => (game.deathChance *= 0.9), description: 'Reduces death chance by 10%.', maxPurchases: 5, level: 1 },
    { id: 'energy-drink', name: 'Energy Drink', icon: '⚡', baseCost: 150, effect: () => (game.energyRegen *= 1.1), description: 'Boosts energy regen by 10%.', maxPurchases: 5, level: 1 },
    { id: 'coin-boost', name: 'Coin Boost', icon: '🪙', baseCost: 200, effect: () => (game.coinsPerFeed *= 1.1), description: 'Increases coins per feed by 10%.', maxPurchases: 5, level: 1 },
    // Level 2 (from player level 3)
    { id: 'duck-bank', name: 'Duck Bank', icon: '🏦', baseCost: 300, effect: () => (game.coinsPerFeed *= 1.1), description: 'Increases coins per feed by 10%.', maxPurchases: 5, level: 2 },
    { id: 'xp-boost', name: 'XP Boost', icon: '📈', baseCost: 250, effect: () => (game.xpPerFeed *= 1.1), description: 'Increases XP per feed by 10%.', maxPurchases: 5, level: 2 },
    { id: 'lucky-charm', name: 'Lucky Charm', icon: '🍀', baseCost: 400, effect: () => (game.eventChance += 0.02), description: 'Increases event chance by 2%.', maxPurchases: 5, level: 2 },
    // Level 3 (from player level 5)
    { id: 'energy-core', name: 'Energy Core', icon: '🔋', baseCost: 500, effect: () => (game.energyRegen *= 1.1), description: 'Boosts energy regen by 10%.', maxPurchases: 5, level: 3 },
    { id: 'gem-detector', name: 'Gem Detector', icon: '💎', baseCost: 600, effect: () => (game.gemChance += 0.01), description: 'Increases gem chance by 1%.', maxPurchases: 5, level: 3 },
    { id: 'super-feeder', name: 'Super Feeder', icon: '🥖', baseCost: 1000, effect: () => (game.xpPerFeed *= 1.1), description: 'Increases XP per feed by 10%.', maxPurchases: 5, level: 3 },
  ];

  const GEM_UPGRADES = [
    { id: 'crypto-duck', name: 'Crypto Duck Skin', icon: '🦆', cost: 15, effect: () => { game.upgrades.push('crypto-duck'); queueNotification('Crypto Duck skin unlocked! Check skins 🦆'); }, description: 'Unlocks cool Crypto Duck skin.', repeatable: false },
    { id: 'cyborg-duck', name: 'Cyborg Duck Skin', icon: '🤖', cost: 15, effect: () => { game.upgrades.push('cyborg-duck'); queueNotification('Cyborg Duck skin unlocked! Check skins 🤖'); }, description: 'Unlocks futuristic Cyborg Duck skin.', repeatable: false },
    { id: 'silver-duck', name: 'Silver Duck Skin', icon: '✨', cost: 15, effect: () => { game.upgrades.push('silver-duck'); queueNotification('Silver Duck skin unlocked! Check skins ✨'); }, description: 'Unlocks shiny Silver Duck skin.', repeatable: false },
    { id: 'energy-boost', name: 'Full Energy', icon: '⚡', cost: 3, effect: () => (game.energy = 100), description: 'Fully restores energy.', repeatable: true },
    { id: 'xp-buff', name: 'XP Buff (1h)', icon: '📈', cost: 5, effect: () => {
        game.xpBuffStart = Date.now();
        game.xpMultiplier *= 2;
        setTimeout(() => {
          game.xpMultiplier /= 2;
          delete game.xpBuffStart;
          queueNotification('XP Buff ended! 📈');
          updateGame();
        }, 3600000);
      }, description: 'Doubles XP gain for 1 hour.', repeatable: true },
  ];

  const ACHIEVEMENTS = [
    { id: 'feed-10', name: 'Bread Lover', icon: '🥖', condition: () => game.stats.feeds >= 10, reward: { coins: 100, gems: 1 }, secret: false },
    { id: 'level-3', name: 'Rising Star', icon: '📈', condition: () => game.level >= 3, reward: { coins: 200, gems: 2 }, secret: false },
    { id: 'workout-5', name: 'Fitness Fan', icon: '💪', condition: () => game.stats.workouts >= 5, reward: { coins: 150, gems: 1 }, secret: false },
    { id: 'coin-1000', name: 'Coin Collector', icon: '🪙', condition: () => game.coins >= 1000, reward: { coins: 300, gems: 3 }, secret: false },
    { id: 'event-5', name: 'Event Pro', icon: '🎉', condition: () => game.stats.successfulEvents >= 5, reward: { coins: 200, gems: 2 }, secret: false },
    { id: 'level-10', name: 'Duck Legend', icon: '🏆', condition: () => game.level >= 10, reward: { coins: 1000, gems: 5 }, secret: false },
    { id: 'gem-10', name: 'Gem Hunter', icon: '💎', condition: () => game.gems >= 10, reward: { coins: 500, gems: 3 }, secret: false },
    { id: 'immortal-duck', name: 'Immortal Duck', icon: '🛡️', condition: () => game.stats.noDeathDays >= 7, reward: { coins: 500, gems: 5 }, secret: true },
    { id: 'event-master', name: 'Event Master', icon: '🌟', condition: () => game.stats.successfulEvents >= 10, reward: { coins: 750, gems: 7 }, secret: true },
    { id: 'coin-hoarder', name: 'Coin Hoarder', icon: '💰', condition: () => game.coins >= 5000, reward: { coins: 1000, gems: 10 }, secret: true },
  ];

  const QUESTS = [
    { id: 'feed-2', name: 'Quick Snack', icon: '🥖', condition: () => game.stats.dailyFeeds >= 2, reward: { coins: 50, gems: 1 }, reset: 'daily' },
    { id: 'workout-1', name: 'Morning Workout', icon: '💪', condition: () => game.stats.dailyWorkouts >= 1, reward: { coins: 75, gems: 1 }, reset: 'daily' },
    { id: 'hide-1', name: 'Treasure Hunt', icon: '🌳', condition: () => game.stats.dailyHides >= 1, reward: { coins: 100, gems: 1 }, reset: 'daily' },
    { id: 'event-1', name: 'Event Master', icon: '🎉', condition: () => game.stats.dailySuccessfulEvents >= 1, reward: { coins: 150, gems: 2 }, reset: 'daily' },
    { id: 'coin-200', name: 'Coin Rush', icon: '🪙', condition: () => game.stats.dailyCoins >= 200, reward: { coins: 200, gems: 2 }, reset: 'daily' },
    { id: 'no-death', name: 'Safe Day', icon: '🛡️', condition: () => game.stats.noDeathDays >= 1, reward: { coins: 100, gems: 1 }, reset: 'daily' },
  ];

  const POSITIVE_EVENTS = [
    { trigger: 'feed', text: 'Duck found a shiny coin in the crumbs!', effect: () => { game.coins += 50; queueNotification('🪙 +50 coins'); showCoinAnimation(); } },
    { trigger: 'feed', text: 'Duck got tips for a cool tweet!', effect: () => { game.coins += 30; queueNotification('🪙 +30 coins'); showCoinAnimation(); } },
    { trigger: 'feed', text: 'Duck learned a new trick!', effect: () => { game.xp += 20; queueNotification('📈 +20 XP'); checkLevelUp(); } },
    { trigger: 'feed', text: 'Duck found a rare gem!', effect: () => { game.gems += 1; queueNotification('💎 +1 gem'); } },
    { trigger: 'fitness', text: 'Duck set a fitness record!', effect: () => { game.xp += 25; queueNotification('📈 +25 XP'); checkLevelUp(); } },
    { trigger: 'fitness', text: 'Duck won a prize at the gym!', effect: () => { game.coins += 40; queueNotification('🪙 +40 coins'); showCoinAnimation(); } },
  ];

  const NEGATIVE_EVENTS = [
    { trigger: 'feed', text: 'Duck ate bad bread!', effect: () => { game.energy *= 0.9; queueNotification('⚡ -10% energy'); } },
    { trigger: 'feed', text: 'Duck lost some coins!', effect: () => { game.coins = Math.max(0, game.coins - 20); queueNotification('🪙 -20 coins'); } },
    { trigger: 'fitness', text: 'Duck pulled a wing!', effect: () => { game.energy *= 0.9; queueNotification('⚡ -10% energy'); } },
  ];

  const EPIC_EVENTS = [
    { trigger: 'feed', text: 'Duck found a crypto vault!', effect: () => { game.coins += 500; game.gems += 5; queueNotification('🪙 +500 coins, 💎 +5 gems'); showCoinAnimation(); } },
    { trigger: 'fitness', text: 'Duck won a fitness championship!', effect: () => { game.xp += 50; game.gems += 3; queueNotification('📈 +50 XP, 💎 +3 gems'); checkLevelUp(); } },
  ];

  const CHOICE_EVENTS = [
    {
      trigger: 'feed',
      text: 'Duck found a risky deal! Take it or skip?',
      option1: {
        text: 'Take Deal',
        success: () => { game.coins += 100; queueNotification('🪙 Deal paid off! +100 coins'); showCoinAnimation(); game.stats.successfulEvents++; game.stats.dailySuccessfulEvents++; },
        failure: () => { game.coins = Math.max(0, game.coins - 50); queueNotification('🪙 Deal failed! -50 coins'); },
      },
      option2: {
        text: 'Skip',
        success: () => { game.xp += 15; queueNotification('📈 Safe choice! +15 XP'); checkLevelUp(); game.stats.successfulEvents++; game.stats.dailySuccessfulEvents++; },
        failure: () => { game.energy *= 0.9; queueNotification('⚡ Missed chance! -10% energy'); },
      },
    },
    {
      trigger: 'fitness',
      text: 'Duck sees a tough workout plan! Try or skip?',
      option1: {
        text: 'Try',
        success: () => { game.xp += 30; queueNotification('📈 Success! +30 XP'); checkLevelUp(); game.stats.successfulEvents++; game.stats.dailySuccessfulEvents++; },
        failure: () => { game.energy *= 0.8; queueNotification('⚡ Too tough! -20% energy'); },
      },
      option2: {
        text: 'Skip',
        success: () => { game.coins += 50; queueNotification('🪙 Saved energy, got coins! +50 coins'); showCoinAnimation(); game.stats.successfulEvents++; game.stats.dailySuccessfulEvents++; },
        failure: () => { game.xp = Math.max(0, game.xp - 10); queueNotification('📈 Missed gains! -10 XP'); checkLevelUp(); },
      },
    },
  ];

  const EVENT_WEIGHTS = { positive: 0.5, negative: 0.3, epic: 0.1, choice: 0.1 };

  let game = {
    state: 'hungry',
    stage: 'Baby',
    level: 1,
    xp: 0,
    xpNeeded: 100,
    coins: 50,
    gems: 0,
    energy: 100,
    deathChance: 0.2,
    coinsPerFeed: 15,
    xpPerFeed: 15,
    energyRegen: 100 / 600, // 10 minutes
    fitnessTime: 2,
    eventChance: 0.3,
    gemChance: 0.03,
    upgrades: [],
    upgradeCounts: {}, // Tracks purchase count per upgrade
    achievements: [],
    pendingAchievements: [],
    quests: [],
    pendingQuests: [],
    stats: {
      feeds: 0,
      workouts: 0,
      newDucks: 0,
      deaths: 0,
      dailyFeeds: 0,
      dailyWorkouts: 0,
      dailyCoins: 0,
      dailyHides: 0,
      dailySuccessfulEvents: 0,
      successfulEvents: 0,
      noDeathDays: 0,
      hides: 0,
      lastDay: new Date().toDateString(),
    },
    lastUpdate: Date.now(),
    lastHide: 0,
    fitnessEnd: 0,
    xpMultiplier: 1,
    firstOverfed: false,
    selectedSkin: 'default',
    tutorialSeen: false,
    tutorialStep: 0,
    freeRevives: 3,
  };

  const DOM = {
    duckImage: document.getElementById('duck-image'),
    stageDisplay: document.getElementById('stage-display'),
    levelDisplay: document.getElementById('level-display'),
    coinsDisplay: document.getElementById('coins-display'),
    gemsDisplay: document.getElementById('gems-display'),
    deathsDisplay: document.getElementById('deaths-display'),
    xpDisplay: document.getElementById('xp-display'),
    xpNeeded: document.getElementById('xp-needed'),
    energyDisplay: document.getElementById('energy-display'),
    xpBar: document.getElementById('xp-bar')?.firstChild,
    energyBar: document.getElementById('energy-bar')?.firstChild,
    feedButton: document.getElementById('feed-button'),
    fitnessButton: document.getElementById('fitness-button'),
    hideButton: document.getElementById('hide-button'),
    reviveButton: document.getElementById('revive-button'),
    buyDuckButton: document.getElementById('buy-duck-button'),
    log: document.getElementById('log'),
    modal: document.getElementById('modal'),
    modalText: document.getElementById('modal-text'),
    modalOption1: document.getElementById('modal-option1'),
    modalOption2: document.getElementById('modal-option2'),
    modalNext: document.getElementById('modal-next'),
    modalDone: document.getElementById('modal-done'),
    shopItems: document.getElementById('shop-items'),
    achievementsList: document.getElementById('achievements-list'),
    questsList: document.getElementById('quests-list'),
    helpButton: document.getElementById('help-button'),
    gameContainer: document.getElementById('game-container'),
    hideGameBox: document.getElementById('hide-game-box'),
  };

  let audioCtx;
  try {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  } catch (e) {
    console.warn('AudioContext not supported:', e);
  }

  function playSound(frequency, type = 'sine', duration = 0.1) {
    if (!audioCtx) return;
    try {
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      oscillator.type = type;
      oscillator.frequency.setValueAtTime(frequency, audioCtx.currentTime);
      gainNode.gain.setValueAtTime(0.5, audioCtx.currentTime);
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + duration);
    } catch (e) {
      console.warn('Failed to play sound:', e);
    }
  }

  function playEpicSound() {
    playSound(1200, 'triangle', 0.3);
    setTimeout(() => playSound(1400, 'triangle', 0.3), 100);
  }

  function playDeathSound() {
    playSound(200, 'sine', 0.5);
  }

  let notificationQueue = [];
  function queueNotification(message) {
    notificationQueue.push(message);
    if (notificationQueue.length === 1) showNextNotification();
  }

  function showNextNotification() {
    if (notificationQueue.length === 0 || !DOM.log) return;
    const entry = document.createElement('div');
    entry.textContent = notificationQueue[0];
    DOM.log.prepend(entry);
    while (DOM.log.children.length > 5) DOM.log.removeChild(DOM.log.lastChild);
    notificationQueue.shift();
    setTimeout(showNextNotification, 2000);
  }

  let eventQueue = [];
  function queueEvent(text, option1Text, option1Action, option2Text, option2Action) {
    eventQueue.push({ text, option1Text, option1Action, option2Text, option2Action });
    if (eventQueue.length === 1 && (!DOM.modal || DOM.modal.style.display !== 'block')) showNextEvent();
  }

  function showNextEvent() {
    if (eventQueue.length === 0 || !DOM.modal || !DOM.modalText || !DOM.modalOption1 || !DOM.modalOption2) return;
    const evt = eventQueue[0];
    DOM.modalText.textContent = evt.text;
    DOM.modalOption1.textContent = evt.option1Text;
    DOM.modalOption1.onclick = () => {
      DOM.modal.style.display = 'none';
      evt.option1Action();
      eventQueue.shift();
      showNextEvent();
    };
    if (evt.option2Text) {
      DOM.modalOption2.textContent = evt.option2Text;
      DOM.modalOption2.onclick = () => {
        DOM.modal.style.display = 'none';
        evt.option2Action();
        eventQueue.shift();
        showNextEvent();
      };
      DOM.modalOption2.style.display = 'inline';
    } else {
      DOM.modalOption2.style.display = 'none';
    }
    DOM.modalOption1.style.display = 'inline';
    DOM.modalNext.style.display = 'none';
    DOM.modalDone.style.display = 'none';
    DOM.modal.style.display = 'block';
  }

  function showCoinAnimation() {
    if (!DOM.gameContainer) return;
    const coin = document.createElement('div');
    coin.className = 'coin-animation';
    coin.textContent = '🪙';
    coin.style.left = `${Math.random() * (DOM.gameContainer.offsetWidth - 15)}px`;
    DOM.gameContainer.appendChild(coin);
    setTimeout(() => coin.remove(), 1000);
  }

  function showTutorial() {
    if (!DOM.modal || !DOM.modalText) return;
    game.tutorialSeen = true;
    game.tutorialStep = 0;
    updateTutorial();
  }

  function updateTutorial() {
    if (!DOM.modalText || !DOM.modalNext || !DOM.modalDone) return;
    const steps = [
      `🦆 Hi, I'm Duckie! Feed me with "Feed 🥖" to earn coins and XP. But beware — too much bread makes me chubby! 😅`,
      `💪 When I'm overfed, use "Workout 💪" to get me back in shape and earn more XP. Keep an eye on my health!`,
      `🌳 Try "Find Coin 🌳" every 5 minutes for surprises. Check out Shop, Achievements, and Quests for more fun!`,
    ];
    DOM.modalText.textContent = steps[game.tutorialStep];
    DOM.modalOption1.style.display = 'none';
    DOM.modalOption2.style.display = 'none';
    DOM.modalNext.style.display = game.tutorialStep < steps.length - 1 ? 'inline' : 'none';
    DOM.modalDone.style.display = game.tutorialStep === steps.length - 1 ? 'inline' : 'none';
    DOM.modal.style.display = 'block';
  }

  function showHelp() {
    if (!DOM.modalText || !DOM.modalDone) return;
    DOM.modalText.textContent = `Quick Tips:\n- Feed 🥖 to earn coins/XP, but overfeeding risks death.\n- Workout 💪 when overfed to stay fit.\n- Find coins 🌳 every 5 minutes for bonuses.\n- Unlock cool items in the shop as you level up!\n- Complete quests and achievements for rewards!`;
    DOM.modalOption1.style.display = 'none';
    DOM.modalOption2.style.display = 'none';
    DOM.modalNext.style.display = 'none';
    DOM.modalDone.style.display = 'inline';
    DOM.modal.style.display = 'block';
  }

  function checkLevelUp() {
    while (game.xp >= game.xpNeeded) {
      game.level++;
      game.xp -= game.xpNeeded;
      game.xpNeeded = Math.round(game.xpNeeded * 1.5);
      queueEvent(`Level up! Now ${game.level} 🎉`, 'OK', updateGame);
      queueNotification(`Level up! Now ${game.level} 🎉`);
      playSound(1100, 'sawtooth', 0.2);

      if (game.level >= 5 && game.stage === 'Baby') {
        game.stage = 'Adult';
        queueEvent('Duck grew into an Adult! 🦆', 'OK', updateGame);
        queueNotification('Duck grew into an Adult! 🦆');
      } else if (game.level >= 10 && game.stage === 'Adult') {
        game.stage = 'Legend';
        queueEvent('Duck became a Legend! 🦆', 'OK', updateGame);
        queueNotification('Duck became a Legend! 🦆');
      }
    }
  }

  function checkDailyLogin() {
    const today = new Date().toDateString();
    if (game.stats.lastDay !== today) {
      game.gems += 1;
      game.coins += 50;
      queueNotification('Daily login bonus: +1 gem, +50 coins! 🎁');
      game.stats.lastDay = today;
      resetDailyStats();
    }
  }

  function resetDailyStats() {
    game.stats.dailyFeeds = 0;
    game.stats.dailyWorkouts = 0;
    game.stats.dailyCoins = 0;
    game.stats.dailyHides = 0;
    game.stats.dailySuccessfulEvents = 0;
    game.quests = game.quests.filter(q => !QUESTS.find(quest => quest.id === q && quest.reset === 'daily'));
    game.pendingQuests = [];
  }

  function updateGame() {
    if (!DOM.stageDisplay || !DOM.levelDisplay || !DOM.coinsDisplay || !DOM.gemsDisplay || !DOM.deathsDisplay || !DOM.xpDisplay || !DOM.xpNeeded || !DOM.energyDisplay || !DOM.xpBar || !DOM.energyBar) {
      console.error('Missing required DOM elements');
      return;
    }

    const now = Date.now();
    const delta = (now - game.lastUpdate) / 1000;
    game.energy = Math.min(100, game.energy + delta * game.energyRegen);
    game.lastUpdate = now;

    if (game.xpBuffStart && Date.now() >= game.xpBuffStart + 3600000) {
      game.xpMultiplier /= 2;
      delete game.xpBuffStart;
      queueNotification('XP Buff ended! 📈');
    }

    if (game.fitnessEnd && now >= game.fitnessEnd) {
      game.state = 'hungry';
      game.fitnessEnd = 0;
      game.xpMultiplier = 1;
      queueNotification('Duck finished workout! 🦆');
      if (DOM.fitnessButton) DOM.fitnessButton.onclick = debounce(workoutDuck, 300);
    }

    const today = new Date().toDateString();
    if (game.stats.lastDay !== today) {
      game.stats.noDeathDays = game.state === 'dead' ? 0 : game.stats.noDeathDays + 1;
      checkDailyLogin();
    }

    DOM.stageDisplay.textContent = game.stage;
    DOM.levelDisplay.textContent = isFinite(game.level) ? game.level : 1;
    DOM.coinsDisplay.textContent = Math.floor(isFinite(game.coins) ? game.coins : 0);
    DOM.deathsDisplay.textContent = isFinite(game.stats.deaths) ? game.stats.deaths : 0;
    DOM.xpDisplay.textContent = Math.floor(isFinite(game.xp) ? game.xp : 0);
    DOM.xpNeeded.textContent = isFinite(game.xpNeeded) ? game.xpNeeded : 100;
    DOM.energyDisplay.textContent = Math.floor(isFinite(game.energy) ? game.energy : 0);
    DOM.energyBar.style.width = `${Math.min(100, Math.max(0, game.energy))}%`;
    DOM.xpBar.style.width = `${Math.min(100, (game.xp / game.xpNeeded) * 100)}%`;

    if (game.xpBuffStart) {
      const timeLeft = Math.max(0, 3600000 - (Date.now() - game.xpBuffStart)) / 1000;
      DOM.gemsDisplay.textContent = `${game.gems} 💎 (XP Buff: ${Math.floor(timeLeft / 60)}:${Math.floor(timeLeft % 60).toString().padStart(2, '0')})`;
    } else {
      DOM.gemsDisplay.textContent = isFinite(game.gems) ? game.gems : 0;
    }

    if (DOM.feedButton) DOM.feedButton.disabled = game.energy < 10 || game.state === 'dead' || game.fitnessEnd;
    if (DOM.fitnessButton) DOM.fitnessButton.disabled = game.state !== 'overfed' || game.energy < 25 || game.fitnessEnd;
    if (DOM.hideButton) {
      const timeLeft = Math.max(0, (game.lastHide + 300000 - Date.now()) / 1000);
      DOM.hideButton.textContent = timeLeft > 0 ? `Find Coin 🌳 (${Math.floor(timeLeft / 60)}:${Math.floor(timeLeft % 60).toString().padStart(2, '0')})` : 'Find Coin 🌳';
      DOM.hideButton.disabled = game.energy < 10 || game.state === 'dead' || timeLeft > 0;
    }
    if (DOM.reviveButton) {
      DOM.reviveButton.disabled = game.state !== 'dead' || game.freeRevives <= 0;
      DOM.reviveButton.textContent = `Revive Free (${game.freeRevives})`;
    }
    if (DOM.buyDuckButton) {
      DOM.buyDuckButton.style.display = game.state === 'dead' && game.freeRevives <= 0 ? 'inline' : 'none';
      DOM.buyDuckButton.disabled = game.state !== 'dead' || (game.coins < 100 && game.gems < 3);
    }
    updateDuckImage();
    updateShop();
    updateAchievements();
    updateQuests();
  }

  function updateDuckImage() {
    if (!DOM.duckImage) return;
    const state = game.fitnessEnd ? 'fitness' : game.state;
    const skin = SKINS[game.selectedSkin] || SKINS.default;
    const src = skin.images[state] || skin.images.hungry;
    if (DOM.duckImage.src !== src) {
      DOM.duckImage.src = src;
      DOM.duckImage.onerror = () => {
        DOM.duckImage.src = 'images/fallback.png';
        console.warn(`Failed to load image: ${src}`);
      };
    }
    DOM.duckImage.className = state;
  }

  function feedDuck() {
    if (game.energy < 10 || game.state === 'dead' || game.fitnessEnd) return;

    game.energy -= 10;
    let coinsEarned = game.coinsPerFeed;
    let xpEarned = game.xpPerFeed;
    if (game.state === 'overfed') {
      coinsEarned *= 1.5;
      xpEarned *= 1.5;
    }
    game.coins += coinsEarned;
    game.stats.dailyCoins += coinsEarned;
    game.xp += xpEarned * game.xpMultiplier;
    game.stats.feeds++;
    game.stats.dailyFeeds++;

    if (game.state === 'hungry') {
      game.state = 'normal';
    } else if (game.state === 'normal') {
      game.state = 'overfed';
      if (!game.firstOverfed) {
        queueEvent('Whoa! Too much bread — duck is chubby 😷. Try "Workout 💪" to get in shape!', 'OK', updateGame);
        game.firstOverfed = true;
      }
    } else if (game.state === 'overfed') {
      game.deathChance = Math.min(0.4, game.deathChance + 0.1);
      if (Math.random() < game.deathChance) {
        game.state = 'dead';
        game.coins *= 0.8; // Lose 20%
        game.stats.deaths++;
        game.stats.noDeathDays = 0;
        queueNotification('Duck died... 💔');
        playDeathSound();
      }
    }

    if (DOM.duckImage) {
      DOM.duckImage.classList.add('clickPulse');
      setTimeout(() => DOM.duckImage.classList.remove('clickPulse'), 200);
    }
    playSound(440);

    checkLevelUp();

    if (Math.random() < game.eventChance) {
      const rand = Math.random();
      let events;
      let soundFreq = 1000;
      if (rand < EVENT_WEIGHTS.epic) {
        events = EPIC_EVENTS.filter(e => e.trigger === 'feed');
        playEpicSound();
        const event = events[Math.floor(Math.random() * events.length)];
        queueEvent(event.text, 'OK', () => {
          event.effect();
          updateGame();
        });
      } else if (rand < EVENT_WEIGHTS.epic + EVENT_WEIGHTS.choice) {
        events = CHOICE_EVENTS.filter(e => e.trigger === 'feed');
        soundFreq = 600;
        const event = events[Math.floor(Math.random() * events.length)];
        queueEvent(
          event.text,
          event.option1.text,
          () => {
            Math.random() < 0.5 ? event.option1.success() : event.option1.failure();
            playSound(soundFreq);
            updateGame();
          },
          event.option2.text,
          () => {
            Math.random() < 0.5 ? event.option2.success() : event.option2.failure();
            playSound(soundFreq);
            updateGame();
          }
        );
      } else if (rand < EVENT_WEIGHTS.epic + EVENT_WEIGHTS.choice + EVENT_WEIGHTS.negative) {
        events = NEGATIVE_EVENTS.filter(e => e.trigger === 'feed');
        soundFreq = 300;
        const event = events[Math.floor(Math.random() * events.length)];
        queueEvent(
          event.text,
          'Accept',
          () => {
            event.effect();
            playSound(soundFreq);
            updateGame();
          },
          'Ignore',
          () => {
            game.energy = Math.max(0, game.energy - 5);
            queueNotification('Ignored event, -5 energy ⚡');
            playSound(300);
            updateGame();
          }
        );
      } else {
        events = POSITIVE_EVENTS.filter(e => e.trigger === 'feed');
        const event = events[Math.floor(Math.random() * events.length)];
        queueEvent(event.text, 'OK', () => {
          event.effect();
          playSound(soundFreq);
          updateGame();
        });
      }
    }

    if (Math.random() < game.gemChance) {
      game.gems++;
      queueEvent('Found a gem! 💎', 'OK', updateGame);
    }

    updateGame();
  }

  function workoutDuck() {
    if (game.state !== 'overfed' || game.energy < 25 || game.fitnessEnd) return;

    game.energy -= 25;
    game.xp += 20 * game.xpMultiplier;
    game.coins += 40;
    game.stats.dailyCoins += 40;
    game.stats.workouts++;
    game.stats.dailyWorkouts++;
    game.fitnessEnd = Date.now() + game.fitnessTime * 1000;
    game.xpMultiplier = 2;
    playSound(880);
    queueNotification('Duck is working out... 💪');

    let clicks = 0;
    if (DOM.fitnessButton) {
      DOM.fitnessButton.onclick = () => {
        clicks++;
        if (DOM.duckImage) {
          DOM.duckImage.classList.add('clickPulse');
          setTimeout(() => DOM.duckImage.classList.remove('clickPulse'), 200);
        }
      };
    }
    setTimeout(() => {
      if (clicks >= 10) {
        game.xp += 10;
        queueEvent('Great workout! +10 XP 🏋️', 'OK', updateGame);
        queueNotification('Mini-game success! +10 XP 📈');
      }
      checkLevelUp();
      updateGame();
    }, game.fitnessTime * 1000);

    checkLevelUp();

    if (Math.random() < game.eventChance) {
      const rand = Math.random();
      let events;
      let soundFreq = 1000;
      if (rand < EVENT_WEIGHTS.epic) {
        events = EPIC_EVENTS.filter(e => e.trigger === 'fitness');
        playEpicSound();
        const event = events[Math.floor(Math.random() * events.length)];
        queueEvent(event.text, 'OK', () => {
          event.effect();
          updateGame();
        });
      } else if (rand < EVENT_WEIGHTS.epic + EVENT_WEIGHTS.choice) {
        events = CHOICE_EVENTS.filter(e => e.trigger === 'fitness');
        soundFreq = 600;
        const event = events[Math.floor(Math.random() * events.length)];
        queueEvent(
          event.text,
          event.option1.text,
          () => {
            Math.random() < 0.5 ? event.option1.success() : event.option1.failure();
            playSound(soundFreq);
            updateGame();
          },
          event.option2.text,
          () => {
            Math.random() < 0.5 ? event.option2.success() : event.option2.failure();
            playSound(soundFreq);
            updateGame();
          }
        );
      } else if (rand < EVENT_WEIGHTS.epic + EVENT_WEIGHTS.choice + EVENT_WEIGHTS.negative) {
        events = NEGATIVE_EVENTS.filter(e => e.trigger === 'fitness');
        soundFreq = 300;
        const event = events[Math.floor(Math.random() * events.length)];
        queueEvent(
          event.text,
          'Accept',
          () => {
            event.effect();
            playSound(soundFreq);
            updateGame();
          },
          'Ignore',
          () => {
            game.energy = Math.max(0, game.energy - 5);
            queueNotification('Ignored event, -5 energy ⚡');
            playSound(300);
            updateGame();
          }
        );
      } else {
        events = POSITIVE_EVENTS.filter(e => e.trigger === 'fitness');
        const event = events[Math.floor(Math.random() * events.length)];
        queueEvent(event.text, 'OK', () => {
          event.effect();
          playSound(soundFreq);
          updateGame();
        });
      }
    }

    updateGame();
  }

  function playHideAndSeek() {
    if (game.energy < 10 || Date.now() < game.lastHide + 300000 || game.state === 'dead') return;

    queueEvent('Find the coin in the bushes in 5 seconds! 🌳', 'Start', () => {
      game.energy -= 10;
      if (DOM.hideButton) DOM.hideButton.style.display = 'none';
      DOM.hideGameBox.innerHTML = '';
      DOM.hideGameBox.style.display = 'flex';

      const bushCount = 3;
      const bushes = [];
      let gameEnded = false;

      for (let i = 0; i < bushCount; i++) {
        const bush = document.createElement('div');
        bush.className = 'bush';
        bush.textContent = '🌳';
        bush.style.cursor = 'pointer';
        DOM.hideGameBox.appendChild(bush);
        bushes.push(bush);
      }

      const winningBush = Math.floor(Math.random() * bushCount);
      bushes.forEach((bush, i) => {
        bush.onclick = () => {
          if (gameEnded) return;
          endGame(i === winningBush);
        };
      });

      const closeButton = document.createElement('div');
      closeButton.id = 'hide-game-close';
      closeButton.textContent = '✖';
      closeButton.style.cursor = 'pointer';
      DOM.hideGameBox.appendChild(closeButton);
      closeButton.onclick = () => {
        if (!gameEnded) endGame(false);
      };

      const timeout = setTimeout(() => endGame(false), 5000);

      function endGame(won) {
        if (gameEnded) return;
        gameEnded = true;
        clearTimeout(timeout);
        bushes.forEach(b => b.remove());
        closeButton.remove();
        DOM.hideGameBox.style.display = 'none';
        if (DOM.hideButton) DOM.hideButton.style.display = 'inline';

        if (won) {
          const rand = Math.random();
          if (rand < 0.5) {
            game.coins += 50;
            queueNotification('Found a coin! +50 🪙');
            showCoinAnimation();
            playSound(800, 'triangle', 0.2);
          } else if (rand < 0.8) {
            game.xp += 15;
            queueNotification('Found XP! +15 📈');
            playSound(900, 'triangle', 0.2);
          } else {
            queueNotification('Just leaves...');
            playSound(400, 'sine', 0.2);
          }
        } else {
          queueNotification('Found nothing...');
          playSound(400, 'sine', 0.2);
        }

        game.lastHide = Date.now();
        game.stats.hides++;
        game.stats.dailyHides++;
        checkLevelUp();
        updateGame();
      }
    });
  }

  function buyDuck() {
    if (game.state !== 'dead' || (game.coins < 100 && game.gems < 3)) return;
    if (game.gems >= 3) {
      game.gems -= 3;
    } else {
      game.coins -= 100;
    }
    game.state = 'hungry';
    game.deathChance = 0.2;
    game.stats.newDucks++;
    playSound(660);
    queueNotification('Bought a new duck! 🦆');
    updateGame();
  }

  function reviveFree() {
    if (game.state !== 'dead' || game.freeRevives <= 0) return;
    game.state = 'hungry';
    game.deathChance = 0.2;
    game.freeRevives--;
    game.stats.newDucks++;
    playSound(660);
    queueNotification('Duck revived for free! 🦆');
    updateGame();
  }

  function updateShop() {
    if (!DOM.shopItems) return;
    DOM.shopItems.innerHTML = `
      <h3>Coin Shop</h3>
      <p>You have: ${Math.floor(game.coins)} 🪙</p>
    `;

    [1, 2, 3].forEach(shopLevel => {
      const levelUnlocked = (shopLevel === 1 && game.level >= 1) || (shopLevel === 2 && game.level >= 3) || (shopLevel === 3 && game.level >= 5);
      const levelDiv = document.createElement('div');
      levelDiv.innerHTML = `<h4>Shop Level ${shopLevel}${levelUnlocked ? '' : ` (Unlocks at level ${shopLevel === 2 ? 3 : 5})`}</h4>`;
      if (!levelUnlocked) levelDiv.className = 'locked';

      UPGRADES.filter(u => u.level === shopLevel).forEach(upgrade => {
        const purchaseCount = game.upgradeCounts[upgrade.id] || 0;
        const maxed = purchaseCount >= upgrade.maxPurchases;
        const cost = Math.round(upgrade.baseCost * (1 + purchaseCount * 0.5));
        const canBuy = !maxed && Math.floor(game.coins) >= cost && levelUnlocked;
        const div = document.createElement('div');
        div.className = maxed ? 'purchased' : canBuy ? 'can-buy' : 'unavailable';

        const textSpan = document.createElement('span');
        textSpan.className = 'item-text';
        textSpan.textContent = `${upgrade.icon} ${upgrade.name} (${cost} 🪙) [${purchaseCount}/${upgrade.maxPurchases}]`;
        div.appendChild(textSpan);

        const descSpan = document.createElement('span');
        descSpan.className = 'item-description';
        descSpan.textContent = upgrade.description;
        div.appendChild(descSpan);

        if (!maxed && levelUnlocked) {
          const buyButton = document.createElement('button');
          buyButton.textContent = 'Buy';
          buyButton.disabled = !canBuy;
          buyButton.onclick = () => {
            if (Math.floor(game.coins) >= cost) {
              game.coins -= cost;
              game.upgradeCounts[upgrade.id] = (game.upgradeCounts[upgrade.id] || 0) + 1;
              upgrade.effect();
              queueNotification(`Bought: ${upgrade.name}! 🛒`);
              playSound(700);
              updateShop();
              updateGame();
            }
          };
          div.appendChild(buyButton);
        }
        levelDiv.appendChild(div);
      });
      DOM.shopItems.appendChild(levelDiv);
    });

    const gemShop = document.createElement('div');
    gemShop.innerHTML = `
      <h3>Gem Shop</h3>
      <p>You have: ${game.gems} 💎</p>
    `;
    GEM_UPGRADES.forEach(upgrade => {
      const owned = !upgrade.repeatable && game.upgrades.includes(upgrade.id);
      const canBuy = !owned && game.gems >= upgrade.cost;
      const div = document.createElement('div');
      div.className = owned ? 'purchased' : canBuy ? 'can-buy' : 'unavailable';

      const textSpan = document.createElement('span');
      textSpan.className = 'item-text';
      textSpan.textContent = `${upgrade.icon} ${upgrade.name} (${upgrade.cost} 💎)`;
      div.appendChild(textSpan);

      const descSpan = document.createElement('span');
      descSpan.className = 'item-description';
      descSpan.textContent = upgrade.description;
      div.appendChild(descSpan);

      if (!owned) {
        const buyButton = document.createElement('button');
        buyButton.textContent = 'Buy';
        buyButton.disabled = !canBuy;
        buyButton.onclick = () => {
          if (game.gems >= upgrade.cost) {
            game.gems -= upgrade.cost;
            upgrade.effect();
            queueNotification(`Bought: ${upgrade.name}! 💎`);
            playSound(700);
            updateShop();
            updateGame();
          }
        };
        div.appendChild(buyButton);
      }
      gemShop.appendChild(div);
    });

    const skinsSection = document.createElement('div');
    skinsSection.innerHTML = `
      <h3>Skins</h3>
      <p>Choose your favorite duck look!</p>
    `;
    Object.keys(SKINS).forEach(skinId => {
      const skin = SKINS[skinId];
      const isUnlocked = skinId === 'default' || game.upgrades.includes(`${skinId}-duck`);
      const isEquipped = game.selectedSkin === skinId;
      const div = document.createElement('div');
      div.className = isEquipped ? 'purchased' : isUnlocked ? 'can-buy' : 'unavailable';

      const textSpan = document.createElement('span');
      textSpan.className = 'item-text';
      textSpan.textContent = `${skin.name}${isEquipped ? ' (Equipped)' : ''}`;
      div.appendChild(textSpan);

      if (isUnlocked && !isEquipped) {
        const equipButton = document.createElement('button');
        equipButton.textContent = 'Equip';
        equipButton.onclick = () => {
          game.selectedSkin = skinId;
          queueNotification(`Equipped ${skin.name}! 🦆`);
          playSound(700);
          updateShop();
          updateDuckImage();
        };
        div.appendChild(equipButton);
      }
      skinsSection.appendChild(div);
    });

    DOM.shopItems.appendChild(gemShop);
    DOM.shopItems.appendChild(skinsSection);
  }

  function updateAchievements() {
    if (!DOM.achievementsList) return;
    DOM.achievementsList.innerHTML = '';
    ACHIEVEMENTS.forEach(ach => {
      if (ach.secret && !game.achievements.includes(ach.id) && !ach.condition()) return;
      const completed = game.achievements.includes(ach.id);
      const canClaim = !completed && ach.condition();
      const div = document.createElement('div');
      div.className = completed ? 'completed' : canClaim ? 'can-claim' : 'incomplete';

      const textSpan = document.createElement('span');
      textSpan.className = 'item-text';
      textSpan.textContent = `${ach.icon} ${ach.secret && !completed && !canClaim ? '???' : ach.name} (Reward: ${ach.reward.coins} 🪙, ${ach.reward.gems} 💎)`;
      div.appendChild(textSpan);

      if (canClaim) {
        const claimButton = document.createElement('button');
        claimButton.textContent = 'Claim';
        claimButton.onclick = () => {
          game.achievements.push(ach.id);
          game.coins += ach.reward.coins;
          game.gems += ach.reward.gems;
          game.stats.dailyCoins += ach.reward.coins;
          game.pendingAchievements = game.pendingAchievements.filter(id => id !== ach.id);
          queueNotification(`Achievement earned: ${ach.name}! 🏆`);
          playSound(800);
          updateAchievements();
          updateGame();
        };
        div.appendChild(claimButton);

        if (!game.pendingAchievements.includes(ach.id)) {
          game.pendingAchievements.push(ach.id);
          queueNotification(`New achievement unlocked: ${ach.name}! Check Achievements tab 🏆`);
        }
      }
      DOM.achievementsList.appendChild(div);
    });

    const hasPending = game.pendingAchievements.length > 0;
    const tabButton = document.querySelector('[data-tab="achievements-tab"]');
    if (tabButton) tabButton.classList.toggle('pending', hasPending);
  }

  function updateQuests() {
    if (!DOM.questsList) return;
    DOM.questsList.innerHTML = '';
    QUESTS.forEach(quest => {
      const completed = game.quests.includes(quest.id);
      const canClaim = !completed && quest.condition();
      const div = document.createElement('div');
      div.className = completed ? 'completed' : canClaim ? 'can-claim' : 'incomplete';

      const textSpan = document.createElement('span');
      textSpan.className = 'item-text';
      textSpan.textContent = `${quest.icon} ${quest.name} (Reward: ${quest.reward.coins} 🪙, ${quest.reward.gems} 💎)`;
      div.appendChild(textSpan);

      if (canClaim) {
        const claimButton = document.createElement('button');
        claimButton.textContent = 'Claim';
        claimButton.onclick = () => {
          game.quests.push(quest.id);
          game.coins += quest.reward.coins;
          game.gems += quest.reward.gems;
          game.stats.dailyCoins += quest.reward.coins;
          game.pendingQuests = game.pendingQuests.filter(id => id !== quest.id);
          queueNotification(`Quest completed: ${quest.name}! 📜`);
          playSound(800);
          updateQuests();
          updateGame();
        };
        div.appendChild(claimButton);

        if (!game.pendingQuests.includes(quest.id)) {
          game.pendingQuests.push(quest.id);
          queueNotification(`Quest completed: ${quest.name}! Check Quests tab 📜`);
        }
      }
      DOM.questsList.appendChild(div);
    });

    const hasPending = game.pendingQuests.length > 0;
    const tabButton = document.querySelector('[data-tab="quests-tab"]');
    if (tabButton) tabButton.classList.toggle('pending', hasPending);
  }

  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  if (DOM.feedButton) {
    DOM.feedButton.onclick = debounce(feedDuck, 300);
  }
  if (DOM.fitnessButton) {
    DOM.fitnessButton.onclick = debounce(workoutDuck, 300);
  }
  if (DOM.hideButton) {
    DOM.hideButton.onclick = debounce(playHideAndSeek, 300);
  }
  if (DOM.reviveButton) {
    DOM.reviveButton.onclick = debounce(reviveFree, 300);
  }
  if (DOM.buyDuckButton) {
    DOM.buyDuckButton.onclick = debounce(buyDuck, 300);
  }
  if (DOM.helpButton) {
    DOM.helpButton.onclick = () => {
      if (!game.tutorialSeen) {
        showTutorial();
      } else {
        showHelp();
      }
      playSound(600);
    };
  }

  document.querySelectorAll('.icon-button[data-tab]').forEach(button => {
    button.onclick = () => {
      if (button.classList.contains('active')) return;
      document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
      document.querySelectorAll('.icon-button').forEach(btn => btn.classList.remove('active'));
      const tabId = button.dataset.tab;
      const tab = document.getElementById(tabId);
      if (tab) {
        tab.classList.add('active');
        button.classList.add('active');
        playSound(500);
      }
      updateGame();
    };
  });

  if (DOM.modalNext) {
    DOM.modalNext.onclick = () => {
      game.tutorialStep++;
      updateTutorial();
    };
  }
  if (DOM.modalDone) {
    DOM.modalDone.onclick = () => {
      DOM.modal.style.display = 'none';
      updateGame();
    };
  }
  if (DOM.modalOption1) {
    DOM.modalOption1.onclick = () => {
      DOM.modal.style.display = 'none';
      eventQueue.shift();
      showNextEvent();
    };
  }
  if (DOM.modalOption2) {
    DOM.modalOption2.onclick = () => {
      DOM.modal.style.display = 'none';
      eventQueue.shift();
      showNextEvent();
    };
  }

  function initGame() {
    checkDailyLogin();
    if (!game.tutorialSeen) {
      showTutorial();
    }
    updateShop();
    updateAchievements();
    updateQuests();
    updateGame();
    setInterval(updateGame, 1000);
  }

  initGame();
})();