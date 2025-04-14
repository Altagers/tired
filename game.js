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
  };

  const UPGRADES = [
    { id: 'helmet', name: 'Safety Helmet', icon: '🛡️', cost: 50, effect: () => (game.deathChance *= 0.5), description: 'Reduces death chance by 50%.', repeatable: false },
    { id: 'golden-duck', name: 'Golden Duck', icon: '🦆', cost: 100, effect: () => (game.coinsPerFeed *= 2), description: 'Doubles coins earned per feed.', repeatable: false },
    { id: 'energy-drink', name: 'Energy Drink', icon: '⚡', cost: 75, effect: () => (game.energyRegen *= 1.5), description: 'Boosts energy regen by 50%.', repeatable: false },
    { id: 'trainer', name: 'Personal Trainer', icon: '🏋️', cost: 150, effect: () => (game.fitnessTime *= 0.5), description: 'Halves workout time.', repeatable: false },
    { id: 'lucky-charm', name: 'Lucky Charm', icon: '🍀', cost: 200, effect: () => (game.eventChance = Math.min(1, game.eventChance + 0.05)), description: 'Increases event chance by 5%.', repeatable: false },
    { id: 'coin-magnet', name: 'Coin Magnet', icon: '🧲', cost: 250, effect: () => (game.coinsPerFeed *= 1.5), description: 'Boosts coins per feed by 50%.', repeatable: false },
    { id: 'xp-boost', name: 'XP Boost', icon: '📈', cost: 300, effect: () => (game.xpPerFeed *= 2), description: 'Doubles XP earned per feed.', repeatable: false },
    { id: 'gem-finder', name: 'Gem Finder', icon: '💎', cost: 500, effect: () => (game.gemChance += 0.05), description: 'Increases gem drop chance by 5%.', repeatable: false },
    { id: 'super-feeder', name: 'Super Feeder', icon: '🥖', cost: 500, effect: () => (game.xpPerFeed *= 1.5), description: 'Boosts XP per feed by 50%.', repeatable: false },
    { id: 'energy-pack', name: 'Energy Pack', icon: '🔋', cost: 100, effect: () => (game.energy = Math.min(100, game.energy + 50)), description: 'Restores 50 energy.', repeatable: true },
  ];

  const GEM_UPGRADES = [
    {
      id: 'exclusive-duck',
      name: 'Crypto Duck Skin',
      icon: '🦆',
      cost: 10,
      effect: () => {
        game.upgrades.push('exclusive-duck');
        queueNotification('Crypto Duck Skin unlocked! Check Skins section to equip 🦆');
      },
      description: 'Unlocks a cool crypto duck skin to equip.',
      repeatable: false,
    },
    { id: 'energy-boost', name: 'Full Energy', icon: '⚡', cost: 3, effect: () => (game.energy = 100), description: 'Fully restores energy.', repeatable: true },
    {
      id: 'xp-buff',
      name: 'XP Boost (1h)',
      icon: '📈',
      cost: 5,
      effect: () => {
        game.xpBuffStart = Date.now();
        game.xpMultiplier *= 2;
        setTimeout(() => {
          game.xpMultiplier /= 2;
          delete game.xpBuffStart;
          queueNotification('XP Boost expired! 📈');
          updateGame();
        }, 3600000);
      },
      description: 'Doubles XP gain for 1 hour.',
      repeatable: true,
    },
  ];

  const ACHIEVEMENTS = [
    { id: 'feed-5', name: 'Feed 5 Times', icon: '🥖', condition: () => game.stats.feeds >= 5, reward: { coins: 50, gems: 1 } },
    { id: 'level-2', name: 'Reach Level 2', icon: '📈', condition: () => game.level >= 2, reward: { coins: 100, gems: 2 } },
    { id: 'workout-3', name: 'Workout 3 Times', icon: '💪', condition: () => game.stats.workouts >= 3, reward: { coins: 75, gems: 1 } },
    { id: 'new-duck-1', name: 'Buy 1 Duck', icon: '🦆', condition: () => game.stats.newDucks >= 1, reward: { coins: 200, gems: 3 } },
    { id: 'feed-20', name: 'Feed 20 Times', icon: '🥖', condition: () => game.stats.feeds >= 20, reward: { coins: 100, gems: 2 } },
    { id: 'level-5', name: 'Reach Level 5', icon: '📈', condition: () => game.level >= 5, reward: { coins: 200, gems: 3 } },
    { id: 'master-ducks', name: 'Master of Ducks', icon: '🦆', condition: () => game.stats.newDucks >= 5, reward: { coins: 300, gems: 5 } },
    { id: 'rich-duck', name: 'Rich Duck', icon: '🪙', condition: () => game.coins >= 1000, reward: { coins: 200, gems: 3 } },
    { id: 'hide-5', name: 'Play Hide & Seek 5 Times', icon: '🌳', condition: () => game.stats.hides >= 5, reward: { coins: 100, gems: 2 } },
    { id: 'collect-10-gems', name: 'Collect 10 Gems', icon: '💎', condition: () => game.gems >= 10, reward: { coins: 150, gems: 3 } },
    { id: 'survive-5', name: 'Survive 5 Days', icon: '🛡️', condition: () => game.stats.noDeathDays >= 5, reward: { coins: 200, gems: 3 } },
    { id: 'level-10', name: 'Reach Level 10', icon: '📈', condition: () => game.level >= 10, reward: { coins: 300, gems: 5 } },
    { id: 'event-master', name: 'Trigger 10 Events', icon: '🎉', condition: () => game.stats.totalEvents >= 10, reward: { coins: 150, gems: 2 } },
    { id: 'fitness-10', name: 'Workout 10 Times', icon: '💪', condition: () => game.stats.workouts >= 10, reward: { coins: 150, gems: 2 } },
    { id: 'coin-5000', name: 'Collect 5000 Coins', icon: '🪙', condition: () => game.coins >= 5000, reward: { coins: 500, gems: 5 } },
  ];

  const QUESTS = [
    { id: 'feed-2', name: 'Feed 2 Times', icon: '🥖', condition: () => game.stats.dailyFeeds >= 2, reward: { coins: 75, gems: 1 }, reset: 'daily' },
    { id: 'workout-1', name: 'Workout 1 Time', icon: '💪', condition: () => game.stats.dailyWorkouts >= 1, reward: { coins: 50, gems: 1 }, reset: 'daily' },
    { id: 'level-up', name: 'Level Up', icon: '📈', condition: () => game.stats.levelUps >= 1, reward: { coins: 200, gems: 3 }, reset: 'daily' },
    { id: 'collect-200', name: 'Collect 200 Coins', icon: '🪙', condition: () => game.stats.dailyCoins >= 200, reward: { coins: 100, gems: 1 }, reset: 'daily' },
    { id: 'event-hunter', name: 'Trigger 5 Events', icon: '🎉', condition: () => game.stats.dailyEvents >= 5, reward: { coins: 150, gems: 2 }, reset: 'daily' },
    { id: 'workout-marathon', name: 'Workout 5 Times', icon: '💪', condition: () => game.stats.dailyWorkouts >= 5, reward: { coins: 200, gems: 3 }, reset: 'daily' },
    { id: 'no-death', name: 'Avoid Death Today', icon: '🛡️', condition: () => game.stats.noDeathDays >= 1, reward: { coins: 150, gems: 1 }, reset: 'daily' },
    { id: 'hide-1', name: 'Play Hide & Seek Once', icon: '🌳', condition: () => game.stats.dailyHides >= 1, reward: { coins: 50, gems: 1 }, reset: 'daily' },
    { id: 'collect-1000', name: 'Collect 1000 Coins', icon: '🪙', condition: () => game.stats.dailyCoins >= 1000, reward: { coins: 300, gems: 3 }, reset: 'daily' },
    { id: 'feed-10', name: 'Feed 10 Times', icon: '🥖', condition: () => game.stats.dailyFeeds >= 10, reward: { coins: 200, gems: 2 }, reset: 'daily' },
    { id: 'energy-100', name: 'Reach 100% Energy', icon: '⚡', condition: () => game.energy >= 100, reward: { coins: 50, gems: 1 }, reset: 'daily' },
  ];

  const POSITIVE_EVENTS = [
    { trigger: 'feed', text: 'Duckie found a Bitcoin in the bread crumbs!', effect: () => { game.coins += 50; queueNotification('🪙 +50 Coins'); showCoinAnimation(); } },
    { trigger: 'feed', text: 'Duckie tweeted about DOGE and got tips!', effect: () => { game.coins += 30; queueNotification('🪙 +30 Coins'); showCoinAnimation(); } },
    { trigger: 'feed', text: 'Duckie mined some ETH while pecking!', effect: () => { game.xp += 15; queueNotification('📈 +15 XP'); checkLevelUp(); } },
    { trigger: 'feed', text: 'Duckie sold an NFT of its quack!', effect: () => { game.gems += 1; queueNotification('💎 +1 Gem'); } },
    { trigger: 'feed', text: 'Duckie got airdropped some tokens!', effect: () => { game.coins += 40; queueNotification('🪙 +40 Coins'); showCoinAnimation(); } },
    { trigger: 'feed', text: 'Duckie joined a DeFi pool and earned yield!', effect: () => { game.energy += 10; queueNotification('⚡ +10 Energy'); } },
    { trigger: 'feed', text: 'Duckie went viral on Crypto Twitter!', effect: () => { game.xp += 20; queueNotification('📈 +20 XP'); checkLevelUp(); } },
    { trigger: 'feed', text: 'Duckie found a rare blockchain bug!', effect: () => { game.gems += 2; queueNotification('💎 +2 Gems'); } },
    { trigger: 'fitness', text: 'Duckie pumped iron and rugged the gym!', effect: () => { game.xp += 15; queueNotification('📈 +15 XP'); checkLevelUp(); } },
    { trigger: 'fitness', text: 'Duckie outran a bear market!', effect: () => { game.coins += 30; queueNotification('🪙 +30 Coins'); showCoinAnimation(); } },
    { trigger: 'fitness', text: 'Duckie lifted weights like a whale!', effect: () => { game.xp += 20; queueNotification('📈 +20 XP'); checkLevelUp(); } },
    { trigger: 'fitness', text: 'Duckie did yoga with Vitalik’s ducks!', effect: () => { game.gems += 1; queueNotification('💎 +1 Gem'); } },
    { trigger: 'feed', text: 'Duckie discovered a hidden wallet!', effect: () => { game.coins += 60; queueNotification('🪙 +60 Coins'); showCoinAnimation(); } },
    { trigger: 'feed', text: 'Duckie got a grant from a DAO!', effect: () => { game.gems += 2; queueNotification('💎 +2 Gems'); } },
    { trigger: 'feed', text: 'Duckie learned to code a smart contract!', effect: () => { game.xp += 25; queueNotification('📈 +25 XP'); checkLevelUp(); } },
    { trigger: 'feed', text: 'Duckie found a glitch in the matrix!', effect: () => { game.energy += 15; queueNotification('⚡ +15 Energy'); } },
    { trigger: 'fitness', text: 'Duckie set a new personal record!', effect: () => { game.xp += 30; queueNotification('📈 +30 XP'); checkLevelUp(); } },
    { trigger: 'fitness', text: 'Duckie won a fitness bounty!', effect: () => { game.coins += 50; queueNotification('🪙 +50 Coins'); showCoinAnimation(); } },
    { trigger: 'fitness', text: 'Duckie trained with a crypto bro!', effect: () => { game.energy += 10; queueNotification('⚡ +10 Energy'); } },
    { trigger: 'fitness', text: 'Duckie dodged a market crash!', effect: () => { game.gems += 1; queueNotification('💎 +1 Gem'); } },
    { trigger: 'feed', text: 'Duckie found an energy pond!', effect: () => { game.energy = Math.min(100, game.energy + 20); queueNotification('⚡ +20 Energy'); } },
  ];

  const NEGATIVE_EVENTS = [
    { trigger: 'feed', text: 'Duckie ate a scam token and got sick!', effect: () => { game.energy *= 0.9; queueNotification('⚡ -10% Energy'); } },
    { trigger: 'feed', text: 'Duckie fell for a phishing bread!', effect: () => { game.coins = Math.max(0, game.coins - 10); queueNotification('🪙 -10 Coins'); } },
    { trigger: 'feed', text: 'Duckie got rugpulled by stale bread!', effect: () => { game.xp = Math.max(0, game.xp - 10); queueNotification('📈 -10 XP'); checkLevelUp(); } },
    { trigger: 'feed', text: 'Duckie ate a 51% attack sandwich!', effect: () => { game.energy *= 0.85; queueNotification('⚡ -15% Energy'); } },
    { trigger: 'fitness', text: 'Duckie pulled a muscle chasing pumps!', effect: () => { game.energy *= 0.9; queueNotification('⚡ -10% Energy'); } },
    { trigger: 'fitness', text: 'Duckie tripped on a gas fee!', effect: () => { game.coins = Math.max(0, game.coins - 10); queueNotification('🪙 -10 Coins'); } },
    { trigger: 'fitness', text: 'Duckie got rekt lifting coins!', effect: () => { game.xp = Math.max(0, game.xp - 10); queueNotification('📈 -10 XP'); checkLevelUp(); } },
    { trigger: 'feed', text: 'Duckie got hacked by a fake airdrop!', effect: () => { game.coins = Math.max(0, game.coins - 15); queueNotification('🪙 -15 Coins'); } },
    { trigger: 'feed', text: 'Duckie ate expired crypto bread!', effect: () => { game.energy *= 0.85; queueNotification('⚡ -15% Energy'); } },
    { trigger: 'fitness', text: 'Duckie slipped during a bull run!', effect: () => { game.xp = Math.max(0, game.xp - 10); queueNotification('📈 -10 XP'); checkLevelUp(); } },
    { trigger: 'fitness', text: 'Duckie paid too much gas fees!', effect: () => { game.coins = Math.max(0, game.coins - 15); queueNotification('🪙 -15 Coins'); } },
    { trigger: 'fitness', text: 'Duckie overtrained and got tired!', effect: () => { game.energy *= 0.9; queueNotification('⚡ -10% Energy'); } },
  ];

  const EPIC_EVENTS = [
    { trigger: 'feed', text: 'Duckie hacked the blockchain!', effect: () => { game.coins += 500; game.gems += 5; queueNotification('🪙 +500 Coins, 💎 +5 Gems'); showCoinAnimation(); } },
    { trigger: 'feed', text: 'Duckie launched a memecoin!', effect: () => { game.coins += 1000; game.gems += 10; queueNotification('🪙 +1000 Coins, 💎 +10 Gems'); showCoinAnimation(); } },
    { trigger: 'fitness', text: 'Duckie won the Crypto Olympics!', effect: () => { game.xp += 50; game.gems += 5; queueNotification('📈 +50 XP, 💎 +5 Gems'); checkLevelUp(); } },
    { trigger: 'feed', text: 'Duckie became a crypto influencer!', effect: () => { game.coins += 750; game.gems += 7; queueNotification('🪙 +750 Coins, 💎 +7 Gems'); showCoinAnimation(); } },
    { trigger: 'fitness', text: 'Duckie conquered the DeFi arena!', effect: () => { game.xp += 75; game.gems += 8; queueNotification('📈 +75 XP, 💎 +8 Gems'); checkLevelUp(); } },
  ];

  const CHOICE_EVENTS = [
    {
      trigger: 'feed',
      text: 'Duckie found a shady crypto exchange! Swap tokens or hold?',
      option1: {
        text: 'Swap Tokens',
        success: () => { game.coins += 100; queueNotification('🪙 Swap paid off! +100 Coins'); showCoinAnimation(); },
        failure: () => { game.coins = Math.max(0, game.coins - 50); queueNotification('🪙 Swap failed! -50 Coins'); },
      },
      option2: {
        text: 'Hold',
        success: () => { game.xp += 20; queueNotification('📈 Holding was wise! +20 XP'); checkLevelUp(); },
        failure: () => { game.energy *= 0.9; queueNotification('⚡ Missed opportunity! -10% Energy'); },
      },
    },
    {
      trigger: 'feed',
      text: 'Duckie stumbled upon a crypto meetup! Join or skip?',
      option1: {
        text: 'Join Meetup',
        success: () => { game.gems += 2; queueNotification('💎 Networked like a pro! +2 Gems'); },
        failure: () => { game.energy *= 0.85; queueNotification('⚡ Party drained you! -15% Energy'); },
      },
      option2: {
        text: 'Skip',
        success: () => { game.coins += 30; queueNotification('🪙 Saved time, found coins! +30 Coins'); showCoinAnimation(); },
        failure: () => { game.xp = Math.max(0, game.xp - 10); queueNotification('📈 Missed knowledge! -10 XP'); checkLevelUp(); },
      },
    },
    {
      trigger: 'fitness',
      text: 'Duckie sees a risky trading bot! Invest or pass?',
      option1: {
        text: 'Invest',
        success: () => { game.coins += 150; queueNotification('🪙 Bot mooned! +150 Coins'); showCoinAnimation(); },
        failure: () => { game.coins = Math.max(0, game.coins - 75); queueNotification('🪙 Bot crashed! -75 Coins'); },
      },
      option2: {
        text: 'Pass',
        success: () => { game.energy += 10; queueNotification('⚡ Dodged a bullet! +10 Energy'); },
        failure: () => { game.gems = Math.max(0, game.gems - 1); queueNotification('💎 Missed a gem! -1 Gem'); },
      },
    },
    {
      trigger: 'fitness',
      text: 'Duckie found a crypto hackathon! Code or cheer?',
      option1: {
        text: 'Code',
        success: () => { game.xp += 30; queueNotification('📈 Coded a winner! +30 XP'); checkLevelUp(); },
        failure: () => { game.energy *= 0.8; queueNotification('⚡ Code didn’t compile! -20% Energy'); },
      },
      option2: {
        text: 'Cheer',
        success: () => { game.coins += 40; queueNotification('🪙 Cheered for coins! +40 Coins'); showCoinAnimation(); },
        failure: () => { game.xp = Math.max(0, game.xp - 15); queueNotification('📈 Cheering was boring! -15 XP'); checkLevelUp(); },
      },
    },
    {
      trigger: 'feed',
      text: 'Duckie got a mysterious NFT offer! Buy or ignore?',
      option1: {
        text: 'Buy NFT',
        success: () => { game.gems += 3; queueNotification('💎 NFT was rare! +3 Gems'); },
        failure: () => { game.coins = Math.max(0, game.coins - 60); queueNotification('🪙 NFT was a scam! -60 Coins'); },
      },
      option2: {
        text: 'Ignore',
        success: () => { game.energy += 15; queueNotification('⚡ Saved energy! +15 Energy'); },
        failure: () => { game.gems = Math.max(0, game.gems - 2); queueNotification('💎 Missed a gem! -2 Gems'); },
      },
    },
  ];

  const EVENT_WEIGHTS = { positive: 0.4, negative: 0.3, epic: 0.1, choice: 0.2 };

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
    energyRegen: 100 / 1800,
    fitnessTime: 2,
    eventChance: 0.3,
    gemChance: 0.02,
    upgrades: [],
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
      levelUps: 0,
      dailyCoins: 0,
      dailyEvents: 0,
      dailyHides: 0,
      totalEvents: 0,
      noDeathDays: 0,
      hides: 0,
      lastDay: new Date().toDateString(),
    },
    lastUpdate: Date.now(),
    lastHide: 0,
    fitnessEnd: 0,
    xpMultiplier: 1,
    evolved: false,
    passiveIncome: 0,
    freeRevives: 5,
    tutorialSeen: false,
    tutorialStep: 0,
    firstOverfed: false,
    selectedSkin: 'default',
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
    game.tutorialStep = 0;
    DOM.modal.style.display = 'none';
    updateTutorial();
  }

  function updateTutorial() {
    if (!DOM.modalText || !DOM.modalNext || !DOM.modalDone) return;
    const steps = [
      `🦆 Yo, I'm Duckie! Feed me bread with "Feed 🥖" to earn coins and XP. Don't overdo it or I'll get chubby! 😅`,
      `💪 When I'm too full, hit "Workout 💪" to slim me down and boost XP. Keep me fit, yo!`,
      `⚠️ Careful! Overfeeding can make me sick and risk death. 💀 Use "Revive Free" (5x) or buy a new Duckie. Check Achievements for rewards!`,
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
    DOM.modalText.textContent = `Quick Tips:\n- Energy recovers faster at low levels (30 min at start).\n- Feed 🥖 to earn coins/XP, but overfeeding risks death.\n- Workout 💪 when overfed to stay healthy.\n- Find Coin 🌳 every 5 min for bonuses.\n- Check Quests and Achievements for rewards!`;
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
      game.coinsPerFeed *= 1.1;
      game.xpPerFeed *= 1.1;
      game.stats.levelUps++;
      game.energyRegen = game.level <= 3 ? 100 / 1800 : game.level <= 6 ? 100 / 3600 : 100 / 7200;
      const levelText = `Level up! Now Level ${game.level} 🎉`;
      queueEvent(levelText, 'OK', updateGame);
      queueNotification(levelText);
      playSound(1100, 'sawtooth', 0.2);

      if (game.level >= 5 && game.stage === 'Baby') {
        game.stage = 'Adult';
        game.coinsPerFeed *= 1.2;
        queueEvent('Duckie grew into an Adult! +20% Coins 🦆', 'OK', updateGame);
        queueNotification('Duckie grew into an Adult! 🦆');
      } else if (game.level >= 10 && game.stage === 'Adult') {
        game.stage = 'Legend';
        game.passiveIncome = 10;
        queueEvent('Duckie became a Legend! Passive 10 coins/sec 🦆', 'OK', updateGame);
        queueNotification('Duckie became a Legend! 🦆');
      }
    }
  }

  function checkDailyLogin() {
    const today = new Date().toDateString();
    if (game.stats.lastDay !== today) {
      game.gems += 1;
      game.coins += 50;
      queueNotification('Daily login bonus: +1 Gem, +50 Coins! 🎁');
      game.stats.lastDay = today;
      resetDailyStats();
    }
  }

  function resetDailyStats() {
    game.stats.dailyFeeds = 0;
    game.stats.dailyWorkouts = 0;
    game.stats.levelUps = 0;
    game.stats.dailyCoins = 0;
    game.stats.dailyEvents = 0;
    game.stats.dailyHides = 0;
    game.quests = game.quests.filter(q => !QUESTS.find(quest => quest.id === q && quest.reset === 'daily'));
    game.pendingQuests = [];
    saveGame();
  }

  function saveGame() {
    try {
      localStorage.setItem('lifeOfDuckie', JSON.stringify(game));
    } catch (e) {
      console.warn('Failed to save game:', e);
    }
  }

  function loadGame() {
    try {
      const saved = localStorage.getItem('lifeOfDuckie');
      if (saved) {
        game = { ...game, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.warn('Failed to load game:', e);
    }
  }

  function updateGame() {
    if (!DOM.stageDisplay || !DOM.levelDisplay || !DOM.coinsDisplay || !DOM.gemsDisplay || !DOM.deathsDisplay || !DOM.xpDisplay || !DOM.xpNeeded || !DOM.energyDisplay || !DOM.xpBar || !DOM.energyBar) {
      console.error('Required DOM elements missing');
      return;
    }

    const now = Date.now();
    const delta = (now - game.lastUpdate) / 1000;
    if (delta > 3600) {
      console.warn('Time anomaly detected');
      game.lastUpdate = now;
      return;
    }

    game.energy = Math.min(100, game.energy + delta * game.energyRegen);
    game.coins += game.passiveIncome * delta;
    game.stats.dailyCoins += game.passiveIncome * delta;
    game.lastUpdate = now;

    if (game.xpBuffStart && Date.now() >= game.xpBuffStart + 3600000) {
      game.xpMultiplier /= 2;
      delete game.xpBuffStart;
      queueNotification('XP Boost expired! 📈');
    }

    if (game.fitnessEnd && now >= game.fitnessEnd) {
      game.state = 'hungry';
      game.fitnessEnd = 0;
      game.xpMultiplier = 1;
      game.deathChance = 0.2;
      queueNotification('Duckie finished working out! 🦆');
      if (DOM.fitnessButton) DOM.fitnessButton.onclick = debounce(workoutDuck, 300);
    }

    const today = new Date().toDateString();
    if (game.stats.lastDay !== today) {
      game.stats.noDeathDays = game.state === 'dead' ? 0 : game.stats.noDeathDays + 1;
      checkDailyLogin();
    }

    DOM.stageDisplay.textContent = game.stage;
    DOM.levelDisplay.textContent = game.level;
    DOM.coinsDisplay.textContent = Math.floor(game.coins);
    DOM.deathsDisplay.textContent = game.stats.deaths;
    DOM.xpDisplay.textContent = Math.floor(game.xp);
    DOM.xpNeeded.textContent = game.xpNeeded;
    DOM.energyDisplay.textContent = Math.floor(game.energy);
    DOM.energyBar.style.width = `${game.energy}%`;
    DOM.xpBar.style.width = `${(game.xp / game.xpNeeded) * 100}%`;

    if (game.xpBuffStart) {
      const timeLeft = Math.max(0, 3600000 - (Date.now() - game.xpBuffStart)) / 1000;
      DOM.gemsDisplay.textContent = `${game.gems} 💎 (XP Boost: ${Math.floor(timeLeft / 60)}:${Math.floor(timeLeft % 60).toString().padStart(2, '0')})`;
    } else {
      DOM.gemsDisplay.textContent = game.gems;
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
      DOM.reviveButton.textContent = `Revive Free (${game.freeRevives} left)`;
    }
    if (DOM.buyDuckButton) {
      DOM.buyDuckButton.style.display = game.state === 'dead' && game.freeRevives <= 0 ? 'inline' : 'none';
      DOM.buyDuckButton.disabled = game.state !== 'dead' || (game.coins < 100 && game.gems < 3);
    }
    updateDuckImage();
    updateShop();
    updateAchievements();
    updateQuests();
    saveGame();
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
    const coinsEarned = game.coinsPerFeed;
    game.coins += coinsEarned;
    game.stats.dailyCoins += coinsEarned;
    game.xp += game.xpPerFeed * game.xpMultiplier;
    game.stats.feeds++;
    game.stats.dailyFeeds++;

    if (game.state === 'hungry') {
      game.state = 'normal';
    } else if (game.state === 'normal') {
      game.state = 'overfed';
      if (!game.firstOverfed) {
        queueEvent('Careful! Overfeeding Duckie might make it sick! 😷 Try working out 💪 to keep it healthy.', 'OK', updateGame);
        game.firstOverfed = true;
      }
    } else if (game.state === 'overfed') {
      game.deathChance = Math.min(0.5, game.deathChance + 0.1);
      if (Math.random() < game.deathChance) {
        game.state = 'dead';
        game.coins *= 0.5;
        game.stats.deaths++;
        game.stats.noDeathDays = 0;
        queueNotification('Duckie passed away... 💔');
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
          game.stats.dailyEvents++;
          game.stats.totalEvents++;
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
            game.stats.dailyEvents++;
            game.stats.totalEvents++;
            playSound(soundFreq);
            updateGame();
          },
          event.option2.text,
          () => {
            Math.random() < 0.5 ? event.option2.success() : event.option2.failure();
            game.stats.dailyEvents++;
            game.stats.totalEvents++;
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
            game.stats.dailyEvents++;
            game.stats.totalEvents++;
            playSound(soundFreq);
            updateGame();
          },
          'Ignore',
          () => {
            game.energy = Math.max(0, game.energy - 5);
            game.stats.dailyEvents++;
            game.stats.totalEvents++;
            queueNotification('Ignored event, -5 Energy ⚡');
            playSound(300);
            updateGame();
          }
        );
      } else {
        events = POSITIVE_EVENTS.filter(e => e.trigger === 'feed');
        const event = events[Math.floor(Math.random() * events.length)];
        queueEvent(event.text, 'OK', () => {
          event.effect();
          game.stats.dailyEvents++;
          game.stats.totalEvents++;
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
    queueNotification('Duckie is working out... 💪');

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
          game.stats.dailyEvents++;
          game.stats.totalEvents++;
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
            game.stats.dailyEvents++;
            game.stats.totalEvents++;
            playSound(soundFreq);
            updateGame();
          },
          event.option2.text,
          () => {
            Math.random() < 0.5 ? event.option2.success() : event.option2.failure();
            game.stats.dailyEvents++;
            game.stats.totalEvents++;
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
            game.stats.dailyEvents++;
            game.stats.totalEvents++;
            playSound(soundFreq);
            updateGame();
          },
          'Ignore',
          () => {
            game.energy = Math.max(0, game.energy - 5);
            game.stats.dailyEvents++;
            game.stats.totalEvents++;
            queueNotification('Ignored event, -5 Energy ⚡');
            playSound(300);
            updateGame();
          }
        );
      } else {
        events = POSITIVE_EVENTS.filter(e => e.trigger === 'fitness');
        const event = events[Math.floor(Math.random() * events.length)];
        queueEvent(event.text, 'OK', () => {
          event.effect();
          game.stats.dailyEvents++;
          game.stats.totalEvents++;
          playSound(soundFreq);
          updateGame();
        });
      }
    }

    updateGame();
  }

  function playHideAndSeek() {
    if (game.energy < 10 || Date.now() < game.lastHide + 300000 || game.state === 'dead') {
      console.warn('Cannot start Hide & Seek: insufficient energy, cooldown active, or duck is dead');
      return;
    }

    if (!DOM.hideGameBox) {
      console.error('Hide game box not found (#hide-game-box)');
      queueNotification('Mini-game unavailable: game box missing');
      return;
    }

    queueEvent('Find the coin in a bush within 5 seconds! 🌳', 'Start', () => {
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
          queueNotification('Nothing found...');
          playSound(400, 'sine', 0.2);
        }

        game.lastHide = Date.now();
        game.stats.hides++;
        game.stats.dailyHides++;
        checkLevelUp();
        saveGame();
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
    game.xpMultiplier = 1;
    playSound(660);
    queueNotification('New Duckie bought! 🦆');
    updateGame();
  }

  function reviveFree() {
    if (game.state !== 'dead' || game.freeRevives <= 0) return;
    game.state = 'hungry';
    game.deathChance = 0.2;
    game.freeRevives--;
    game.stats.newDucks++;
    playSound(660);
    queueNotification('Duckie revived for free! 🦆');
    updateGame();
  }

  function updateShop() {
    if (!DOM.shopItems) {
      console.error('Shop items element not found');
      return;
    }
    DOM.shopItems.innerHTML = `
      <h3>Coin Shop</h3>
      <p>You have: ${Math.floor(game.coins)} 🪙</p>
    `;
    UPGRADES.forEach(upgrade => {
      const owned = !upgrade.repeatable && game.upgrades.includes(upgrade.id);
      const canBuy = !owned && Math.floor(game.coins) >= upgrade.cost;
      const div = document.createElement('div');
      div.className = owned ? 'purchased' : canBuy ? 'can-buy' : 'unavailable';

      const textSpan = document.createElement('span');
      textSpan.className = 'item-text';
      textSpan.textContent = `${upgrade.icon} ${upgrade.name} (${upgrade.cost} 🪙)`;
      div.appendChild(textSpan);

      const descSpan = document.createElement('span');
      descSpan.className = 'item-description';
      descSpan.textContent = upgrade.description;
      div.appendChild(descSpan);

      if (!owned) {
        const buyButton = document.createElement('button');
        buyButton.textContent = 'Buy';
        buyButton.setAttribute('aria-label', `Buy ${upgrade.name} for ${upgrade.cost} coins`);
        buyButton.disabled = !canBuy;
        buyButton.onclick = () => {
          if (Math.floor(game.coins) >= upgrade.cost) {
            console.log(`Purchased ${upgrade.name} for ${upgrade.cost} coins`);
            game.coins -= upgrade.cost;
            if (!upgrade.repeatable) game.upgrades.push(upgrade.id);
            upgrade.effect();
            queueNotification(`Bought ${upgrade.name}! 🛒`);
            playSound(700);
            saveGame();
            updateShop();
            updateGame();
          } else {
            queueNotification(`Not enough coins for ${upgrade.name}!`);
          }
        };
        div.appendChild(buyButton);
      }
      DOM.shopItems.appendChild(div);
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
        buyButton.setAttribute('aria-label', `Buy ${upgrade.name} for ${upgrade.cost} gems`);
        buyButton.disabled = !canBuy;
        buyButton.onclick = () => {
          if (game.gems >= upgrade.cost) {
            console.log(`Purchased ${upgrade.name} for ${upgrade.cost} gems`);
            game.gems -= upgrade.cost;
            upgrade.effect();
            queueNotification(`Bought ${upgrade.name}! 💎`);
            playSound(700);
            saveGame();
            updateShop();
            updateGame();
          } else {
            queueNotification(`Not enough gems for ${upgrade.name}!`);
          }
        };
        div.appendChild(buyButton);
      }
      gemShop.appendChild(div);
    });

    const skinsSection = document.createElement('div');
    skinsSection.innerHTML = `
      <h3>Skins</h3>
      <p>Equip your favorite Duckie look!</p>
    `;
    Object.keys(SKINS).forEach(skinId => {
      const skin = SKINS[skinId];
      const isUnlocked = skinId === 'default' || game.upgrades.includes('exclusive-duck');
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
        equipButton.setAttribute('aria-label', `Equip ${skin.name}`);
        equipButton.onclick = () => {
          console.log(`Equipped skin: ${skin.name}`);
          game.selectedSkin = skinId;
          queueNotification(`Equipped ${skin.name}! 🦆`);
          playSound(700);
          saveGame();
          updateShop();
          updateDuckImage();
          updateGame();
        };
        div.appendChild(equipButton);
      }
      skinsSection.appendChild(div);
    });

    DOM.shopItems.appendChild(gemShop);
    DOM.shopItems.appendChild(skinsSection);
  }

  function updateAchievements() {
    if (!DOM.achievementsList) {
      console.error('Achievements list element not found');
      return;
    }
    DOM.achievementsList.innerHTML = '';
    ACHIEVEMENTS.forEach(ach => {
      const completed = game.achievements.includes(ach.id);
      const canClaim = !completed && ach.condition();
      const div = document.createElement('div');
      div.className = completed ? 'completed' : canClaim ? 'can-claim' : 'incomplete';

      const textSpan = document.createElement('span');
      textSpan.className = 'item-text';
      textSpan.textContent = `${ach.icon} ${ach.name} (Reward: ${ach.reward.coins} 🪙, ${ach.reward.gems} 💎)`;
      div.appendChild(textSpan);

      if (canClaim) {
        const claimButton = document.createElement('button');
        claimButton.textContent = 'Claim';
        claimButton.setAttribute('aria-label', `Claim ${ach.name} reward`);
        claimButton.onclick = () => {
          console.log(`Claimed achievement ${ach.name}`);
          game.achievements.push(ach.id);
          game.coins += ach.reward.coins;
          game.gems += ach.reward.gems;
          game.stats.dailyCoins += ach.reward.coins;
          game.pendingAchievements = game.pendingAchievements.filter(id => id !== ach.id);
          queueNotification(`Achievement claimed: ${ach.name}! 🏆`);
          playSound(800);
          saveGame();
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
    if (!DOM.questsList) {
      console.error('Quests list element not found');
      return;
    }
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
        claimButton.setAttribute('aria-label', `Claim ${quest.name} reward`);
        claimButton.onclick = () => {
          console.log(`Claimed quest ${quest.name}`);
          game.quests.push(quest.id);
          game.coins += quest.reward.coins;
          game.gems += quest.reward.gems;
          game.stats.dailyCoins += quest.reward.coins;
          game.pendingQuests = game.pendingQuests.filter(id => id !== quest.id);
          queueNotification(`Quest claimed: ${quest.name}! 📜`);
          playSound(800);
          saveGame();
          updateQuests();
          updateGame();
        };
        div.appendChild(claimButton);

        if (!game.pendingQuests.includes(quest.id)) {
          game.pendingQuests.push(quest.id);
          queueNotification(`New quest completed: ${quest.name}! Check Quests tab 📜`);
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

  function init() {
    loadGame();
    checkDailyLogin();

    if (!game.tutorialSeen) {
      game.tutorialSeen = true;
      showTutorial();
    }

    if (DOM.feedButton) DOM.feedButton.onclick = debounce(feedDuck, 300);
    if (DOM.fitnessButton) DOM.fitnessButton.onclick = debounce(workoutDuck, 300);
    if (DOM.hideButton) DOM.hideButton.onclick = debounce(playHideAndSeek, 300);
    if (DOM.reviveButton) DOM.reviveButton.onclick = debounce(reviveFree, 300);
    if (DOM.buyDuckButton) DOM.buyDuckButton.onclick = debounce(buyDuck, 300);
    if (DOM.helpButton) DOM.helpButton.onclick = showHelp;
    if (DOM.modalNext) DOM.modalNext.onclick = () => {
      game.tutorialStep++;
      updateTutorial();
    };
    if (DOM.modalDone) DOM.modalDone.onclick = () => {
      DOM.modal.style.display = 'none';
      saveGame();
    };

    document.querySelectorAll('.icon-button').forEach(btn => {
      btn.onclick = () => {
        document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
        document.querySelectorAll('.icon-button').forEach(b => b.classList.remove('active'));
        const tabId = btn.dataset.tab;
        document.getElementById(tabId).classList.add('active');
        btn.classList.add('active');
      };
    });

    setInterval(updateGame, 1000);
    updateGame();
  }

  init();
})();