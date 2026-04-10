let audioCtx = null;

function initAudio() {
    if (audioCtx) return;
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
}

function playSound(type) {
    try {
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        let frequency = 440;
        let duration = 0.2;
        if (type === 'card') {
            frequency = 523.25;
            duration = 0.15;
        } else if (type === 'move') {
            frequency = 659.25;
            duration = 0.12;
        } else if (type === 'toast') {
            frequency = 293.66;
            duration = 0.3;
        } else if (type === 'win') {
            frequency = 783.99;
            duration = 0.4;
        } else {
            frequency = 440;
            duration = 0.2;
        }
        oscillator.frequency.value = frequency;
        gainNode.gain.value = 0.15;
        oscillator.start();
        gainNode.gain.exponentialRampToValueAtTime(0.00001, audioCtx.currentTime + duration);
        oscillator.stop(audioCtx.currentTime + duration);
    } catch (e) {
        console.log("Audio not supported");
    }
}

function spawnSplash(x, y) {
    const splashes = ["💧", "🌊", "💦", "✨"];
    for (let i = 0; i < 6; i++) {
        setTimeout(() => {
            const el = document.createElement("div");
            el.className = "splash-particle";
            el.innerText = splashes[Math.floor(Math.random() * splashes.length)];
            el.style.left = (x || 50) + (Math.random() - 0.5) * 100 + "px";
            el.style.top = (y || 50) + (Math.random() - 0.5) * 80 + "px";
            document.body.appendChild(el);
            setTimeout(() => el.remove(), 600);
        }, i * 40);
    }
}

const darkModeToggle = document.getElementById('darkModeToggle');
let isDark = localStorage.getItem('tikiDarkMode') === 'true';
if (isDark) {
    document.body.classList.add('dark');
    darkModeToggle.innerHTML = '☀️ Light Mode';
}
darkModeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark');
    isDark = document.body.classList.contains('dark');
    localStorage.setItem('tikiDarkMode', isDark);
    darkModeToggle.innerHTML = isDark ? '☀️ Light Mode' : '🌙 Dark Mode';
});

const TIKI_PROFILES = [{
        id: 0,
        name: "Honu",
        emoji: "🐢",
        color: "#9ACD6E"
    },
    {
        id: 1,
        name: "Mano",
        emoji: "🦈",
        color: "#76B5D9"
    },
    {
        id: 2,
        name: "Lani",
        emoji: "⭐",
        color: "#F5D76E"
    },
    {
        id: 3,
        name: "Nalu",
        emoji: "🌊",
        color: "#6EC8D4"
    },
    {
        id: 4,
        name: "Pua",
        emoji: "🌸",
        color: "#F5B0CB"
    },
    {
        id: 5,
        name: "Koa",
        emoji: "🪨",
        color: "#D4B483"
    },
    {
        id: 6,
        name: "Mele",
        emoji: "🎵",
        color: "#C6A2FF"
    },
    {
        id: 7,
        name: "Ahi",
        emoji: "🐟",
        color: "#9ACD6E"
    },
    {
        id: 8,
        name: "Kai",
        emoji: "🔥",
        color: "#FFB347"
    }
];

const DEFAULT_EMOJIS = ["🧙", "🧝", "🌸", "🦅", "🐺", "🦉", "🐍", "🌊"];

let game = {
    totem: [],
    eliminated: [],
    players: [],
    tokenOwner: {},
    currentPlayerIdx: 0,
    turnCount: 0,
    selectedCardObj: null,
    waitingForTarget: false,
    gameActive: false,
    roundFinished: false,
    animating: false
};

let currentPlayerCount = 2;
let customPlayerNames = JSON.parse(localStorage.getItem('tikiPlayerNames') || '[]');
let isAIMode = false;

const setupPage = document.getElementById('setupPage');
const gamePage = document.getElementById('gamePage');
const playersNamesContainer = document.getElementById('playersNamesContainer');
let selectedCount = 2;

function updateNameInputs() {
    playersNamesContainer.innerHTML = '';
    let numPlayers = (selectedCount === 'ai') ? 1 : parseInt(selectedCount);
    for (let i = 0; i < numPlayers; i++) {
        const defaultName = i === 0 ? "Koa Warrior" : i === 1 ? "Nalu Seer" : i === 2 ? "Lani Sage" : `Tribe Elder ${i + 1}`;
        const defaultEmoji = DEFAULT_EMOJIS[i % DEFAULT_EMOJIS.length];
        const savedName = customPlayerNames[i] || defaultName;
        const div = document.createElement('div');
        div.className = 'player-name-input';
        div.innerHTML = `
        <div class="avatar-small">${defaultEmoji}</div>
        <input type="text" id="playerName_${i}" placeholder="Enter name..." value="${savedName}" maxlength="25">
      `;
        playersNamesContainer.appendChild(div);
    }
}

document.querySelectorAll('.count-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.count-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        selectedCount = btn.dataset.count;
        isAIMode = (selectedCount === 'ai');
        updateNameInputs();
    });
});
document.querySelector('.count-btn[data-count="2"]').classList.add('active');
updateNameInputs();

function getPlayerNames() {
    const names = [];
    let numPlayers = (selectedCount === 'ai') ? 1 : parseInt(selectedCount);
    for (let i = 0; i < numPlayers; i++) {
        const input = document.getElementById(`playerName_${i}`);
        let name = input ? input.value.trim() : '';
        if (name === '') {
            name = i === 0 ? "Koa Warrior" : i === 1 ? "Nalu Seer" : i === 2 ? "Lani Sage" : `Tribe Elder ${i + 1}`;
        }
        names.push(name);
    }
    if (isAIMode) {
        names.push("🤖 AI Spirit");
    }
    const humanNames = isAIMode ? names.slice(0, -1) : names;
    localStorage.setItem('tikiPlayerNames', JSON.stringify(humanNames));
    return names;
}

function createHand() {
    return [{
            type: "up",
            val: 1,
            label: "⬆️ UP 1",
            icon: "🔼",
            id: `u1_${Math.random()}`,
            used: false
        },
        {
            type: "up",
            val: 1,
            label: "⬆️ UP 1",
            icon: "🔼",
            id: `u1b_${Math.random()}`,
            used: false
        },
        {
            type: "up",
            val: 2,
            label: "⏫ UP 2",
            icon: "⏫",
            id: `u2_${Math.random()}`,
            used: false
        },
        {
            type: "up",
            val: 2,
            label: "⏫ UP 2",
            icon: "⏫",
            id: `u2b_${Math.random()}`,
            used: false
        },
        {
            type: "up",
            val: 3,
            label: "🚀 UP 3",
            icon: "🚀",
            id: `u3_${Math.random()}`,
            used: false
        },
        {
            type: "topple",
            val: 0,
            label: "💥 TOPPLE",
            icon: "🌀",
            id: `top_${Math.random()}`,
            used: false
        },
        {
            type: "toast",
            val: 0,
            label: "💀 TOAST",
            icon: "🔥",
            id: `toast_${Math.random()}`,
            used: false
        }
    ];
}

function assignSecretTikis(playerCount, allTikiIds) {
    let shuffled = [...allTikiIds];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    const assignments = [];
    for (let p = 0; p < playerCount; p++) {
        let secrets = [];
        for (let s = 0; s < 3; s++) {
            let tikiId = shuffled[(p * 3 + s) % allTikiIds.length];
            let needed = 1,
                pts = 9;
            if (s === 1) {
                needed = 2;
                pts = 5;
            }
            if (s === 2) {
                needed = 3;
                pts = 2;
            }
            secrets.push({
                tikiId,
                pts,
                needed,
                label: s === 0 ? "👑 Top1" : s === 1 ? "🥈 Top2" : "🥉 Top3"
            });
        }
        assignments.push(secrets);
    }
    return assignments;
}

async function applyCardActionWithAnimation(card, targetTikiId) {
    const currentTotem = game.totem;

    if (card.type !== "toast") {
        const idx = currentTotem.indexOf(targetTikiId);
        if (idx === -1) {
            setStatus("❌ Tiki vanished!", "#ff8866");
            return false;
        }

        if (card.type === "up") {
            let newPos = idx - card.val;
            if (newPos < 0) {
                setStatus(`⚠️ Can't move up ${card.val}`, "#ffaa66");
                return false;
            }

            const container = document.getElementById("totemStack");
            const slots = container.children;
            if (slots[idx]) {
                slots[idx].classList.add('tiki-slide-up');
                await new Promise(resolve => setTimeout(resolve, 300));
                slots[idx].classList.remove('tiki-slide-up');
            }

            const [moved] = currentTotem.splice(idx, 1);
            currentTotem.splice(newPos, 0, moved);

            spawnParticles(["⬆️", "🌱", "🍃"], 8);
            spawnSplash(50, 50);
            playSound('move');
            setStatus(`${TIKI_PROFILES[targetTikiId].name} moves UP ${card.val}!`, "#aaffaa");
            return true;

        } else if (card.type === "topple") {
            const container = document.getElementById("totemStack");
            const slots = container.children;
            if (slots[idx]) {
                slots[idx].classList.add('tiki-topple');
                await new Promise(resolve => setTimeout(resolve, 400));
                slots[idx].classList.remove('tiki-topple');
            }

            const [moved] = currentTotem.splice(idx, 1);
            currentTotem.push(moved);

            spawnParticles(["💥", "🌀", "🌊"], 12);
            spawnSplash(50, 70);
            playSound('move');
            setStatus(`${TIKI_PROFILES[targetTikiId].name} TOPPLES to bottom!`, "#ffbb77");
            return true;
        }
    } else if (card.type === "toast") {
        if (currentTotem.length === 0) return false;

        const container = document.getElementById("totemStack");
        const slots = container.children;
        const lastIdx = slots.length - 1;
        if (slots[lastIdx]) {
            slots[lastIdx].classList.add('tiki-toast');
            await new Promise(resolve => setTimeout(resolve, 400));
        }

        const toastedId = currentTotem.pop();
        game.eliminated.push(toastedId);

        spawnParticles(["💀", "🔥", "☠️"], 15);
        spawnSplash(50, 80);
        playSound('toast');
        setStatus(`🔥 ${TIKI_PROFILES[toastedId].name} is TOASTED!`, "#ff7777");
        return true;
    }
    return false;
}

async function aiTurn() {
    if (!isAIMode) return;
    if (!game.gameActive || game.roundFinished || game.animating) return;
    const currentPlayer = game.players[game.currentPlayerIdx];
    if (!currentPlayer.name.includes("AI")) return;

    await new Promise(resolve => setTimeout(resolve, 600));
    if (!game.gameActive || game.roundFinished || game.animating) return;

    const availableCards = currentPlayer.hand.filter(c => !c.used);
    if (availableCards.length === 0) {
        await finishTurn();
        return;
    }

    const hasUsedCards = game.players.some(p => p.hand.some(c => c.used));
    let eligibleCards = availableCards;
    if (!hasUsedCards) {
        eligibleCards = availableCards.filter(c => c.type !== "toast");
        if (eligibleCards.length === 0) eligibleCards = availableCards;
    }

    const randomCard = eligibleCards[Math.floor(Math.random() * eligibleCards.length)];

    if (randomCard.type === "toast") {
        await playCard(randomCard);
    } else {
        game.selectedCardObj = randomCard;
        game.waitingForTarget = true;
        renderFull();
        setStatus(`🤖 AI ${currentPlayer.name} chooses a card...`, "#FFB347");

        await new Promise(resolve => setTimeout(resolve, 500));
        if (!game.waitingForTarget || !game.selectedCardObj) return;

        const validTiki = game.totem.find(tikiId => {
            const idx = game.totem.indexOf(tikiId);
            if (randomCard.type === "up") {
                return idx - randomCard.val >= 0;
            }
            return true;
        });

        if (validTiki !== undefined) {
            await onTikiClicked(validTiki);
        } else {
            game.selectedCardObj = null;
            game.waitingForTarget = false;
            renderFull();
            await finishTurn();
        }
    }
}

function initGame(playerNames) {
    initAudio();
    let pCount = playerNames.length;
    let allIds = [0, 1, 2, 3, 4, 5, 6, 7, 8];
    for (let i = allIds.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [allIds[i], allIds[j]] = [allIds[j], allIds[i]];
    }
    const tokenOwner = {};
    allIds.forEach((tid, idx) => {
        tokenOwner[tid] = idx % pCount;
    });
    const secretAssign = assignSecretTikis(pCount, allIds);
    const players = [];
    for (let i = 0; i < pCount; i++) {
        players.push({
            id: i,
            name: playerNames[i],
            emoji: DEFAULT_EMOJIS[i % DEFAULT_EMOJIS.length],
            color: ["#E09D32", "#3F9EB3", "#E68369", "#9BC158"][i % 4],
            score: 0,
            hand: createHand(),
            secretTikis: secretAssign[i]
        });
    }
    game = {
        totem: [...allIds],
        eliminated: [],
        players,
        tokenOwner,
        currentPlayerIdx: 0,
        turnCount: 0,
        selectedCardObj: null,
        waitingForTarget: false,
        gameActive: true,
        roundFinished: false,
        animating: false
    };
    applyBlurEffect();
    renderFull();
    setStatus(`🌴 ${game.players[0].name}'s turn — choose a spirit card.`, "#FFA559");

    if (isAIMode && game.players[0].name.includes("AI")) {
        setTimeout(() => aiTurn(), 500);
    }
}

function setStatus(msg, colorHint = "#f5b642") {
    const el = document.getElementById("statusMsg");
    if (el) {
        el.innerHTML = `✨ ${msg} ✨`;
        el.style.borderLeftColor = colorHint;
        el.style.borderRightColor = colorHint;
    }
}

async function finishTurn() {
    game.turnCount++;
    let allUsed = game.players.every(p => p.hand.every(c => c.used === true));
    let totemLeft = game.totem.length;
    if (totemLeft <= 3 || allUsed || game.turnCount >= 12) {
        endRoundScoring();
        return;
    }
    game.currentPlayerIdx = (game.currentPlayerIdx + 1) % game.players.length;
    game.waitingForTarget = false;
    game.selectedCardObj = null;
    applyBlurEffect();
    renderFull();
    setStatus(`🌀 ${game.players[game.currentPlayerIdx].name}'s turn — select a card.`, "#FFB347");

    if (isAIMode && game.players[game.currentPlayerIdx].name.includes("AI")) {
        setTimeout(() => aiTurn(), 500);
    }
}

async function playCard(card) {
    if (!game.gameActive || game.roundFinished || game.animating) return;
    if (card.used) {
        setStatus("Card already used!", "#cc8888");
        return;
    }
    playSound('card');
    const anyCardUsed = game.players.some(p => p.hand.some(c => c.used));
    if (card.type === "toast" && !anyCardUsed) {
        setStatus("⚠️ Toast cannot be first move!", "#ffaa77");
        return;
    }

    game.animating = true;

    if (card.type === "toast") {
        const success = await applyCardActionWithAnimation(card, null);
        if (success) {
            card.used = true;
            await finishTurn();
        }
        game.animating = false;
        renderFull();
        return;
    }

    game.selectedCardObj = card;
    game.waitingForTarget = true;
    game.animating = false;
    renderFull();
    setStatus(`🔮 ${game.players[game.currentPlayerIdx].name}: click a tiki on the totem!`, "#FFB347");
}

async function onTikiClicked(tikiId) {
    if (!game.gameActive || game.roundFinished || game.animating) return;
    if (!game.waitingForTarget || !game.selectedCardObj) {
        setStatus("⚡ Choose a card from your hand first!", "#ffbb88");
        return;
    }
    const card = game.selectedCardObj;
    game.animating = true;
    const success = await applyCardActionWithAnimation(card, tikiId);
    if (success) {
        card.used = true;
        game.selectedCardObj = null;
        game.waitingForTarget = false;
        game.animating = false;
        await finishTurn();
    } else {
        game.animating = false;
        game.waitingForTarget = true;
    }
    renderFull();
}

function endRoundScoring() {
    game.roundFinished = true;
    game.gameActive = false;
    for (let p of game.players) {
        let points = 0;
        for (let secret of p.secretTikis) {
            const pos = game.totem.indexOf(secret.tikiId);
            if (pos !== -1 && pos < secret.needed) points += secret.pts;
        }
        p.score += points;
    }
    const sorted = [...game.players].sort((a, b) => b.score - a.score);
    const winner = sorted[0];
    playSound('win');
    const overlay = document.getElementById("gameOverlay");
    document.getElementById("overlayTitle").innerHTML = `🏆 ${winner.name} is TIKI MASTER! 🏆`;
    let rankHtml = `<div style="text-align:left; margin:12px 0;">`;
    sorted.forEach((p, i) => {
        const medal = i === 0 ? "👑" : i === 1 ? "🥈" : "🥉";
        rankHtml += `<div style="display:flex; justify-content:space-between; background:#fef3e2; margin:8px; padding:8px; border-radius:28px;"><span>${medal} ${p.emoji} ${p.name}</span><span style="font-weight:bold;">${p.score} pts</span></div>`;
    });
    rankHtml += `</div><div style="font-size:13px;">🌴 FINAL TOTEM: ${game.totem.map(id => TIKI_PROFILES[id].emoji).join(' → ')}</div>`;
    document.getElementById("rankingList").innerHTML = rankHtml;
    document.getElementById("overlayText").innerHTML = "🔥 The volcano has spoken! 🔥";
    overlay.classList.remove("hidden");
    renderFull();
}

function cancelSelection() {
    if (game.waitingForTarget) {
        game.selectedCardObj = null;
        game.waitingForTarget = false;
        renderFull();
        setStatus(`✖ Cancelled. ${game.players[game.currentPlayerIdx].name}'s turn.`, "#ffaa77");
    }
}

function applyBlurEffect() {
    const wrapper = document.getElementById("playersContainer");
    if (!wrapper) return;
    if (game.gameActive && !game.roundFinished) wrapper.classList.add("blur-others");
    else wrapper.classList.remove("blur-others");
}

function renderTotem() {
    const container = document.getElementById("totemStack");
    if (!container) return;
    container.innerHTML = "";
    game.totem.forEach((tikiId, idx) => {
        const tiki = TIKI_PROFILES[tikiId];
        const rankLabel = idx === 0 ? "👑" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : `${idx + 1}`;
        const slot = document.createElement("div");
        slot.className = "tiki-totem-slot";
        slot.innerHTML = `<div class="rank-icon">${rankLabel}</div><div class="tiki-figure" style="background:${tiki.color}33; border-color:${tiki.color};">${tiki.emoji}</div><div class="tiki-name">${tiki.name}<span class="owner-dot" style="background:${game.players[game.tokenOwner[tikiId]]?.color || '#aaa'}" title="${game.players[game.tokenOwner[tikiId]]?.name}"></span></div>`;
        const figDiv = slot.querySelector(".tiki-figure");
        if (game.waitingForTarget && !game.roundFinished && game.gameActive && !game.animating) {
            figDiv.classList.add("selectable");
            figDiv.onclick = (e) => {
                e.stopPropagation();
                onTikiClicked(tikiId);
            };
        } else {
            figDiv.onclick = null;
        }
        container.appendChild(slot);
    });
    if (game.eliminated.length) {
        let deadDiv = document.createElement("div");
        deadDiv.style.cssText = "text-align:center;margin-top:12px;font-size:12px;";
        deadDiv.innerText = "💀 ELIMINATED 💀";
        container.appendChild(deadDiv);
        game.eliminated.forEach(eid => {
            const t = TIKI_PROFILES[eid];
            let d = document.createElement("div");
            d.className = "tiki-totem-slot";
            d.style.opacity = "0.5";
            d.innerHTML = `<div class="rank-icon">⚰️</div><div class="tiki-figure">${t.emoji}</div><div class="tiki-name" style="text-decoration:line-through;">${t.name}</div>`;
            container.appendChild(d);
        });
    }
}

function renderPlayersAndSecrets() {
    const container = document.getElementById("playersContainer");
    if (!container) return;
    container.innerHTML = "";
    game.players.forEach((p, idx) => {
        const isActive = idx === game.currentPlayerIdx && !game.roundFinished && game.gameActive;
        const cardDiv = document.createElement("div");
        cardDiv.className = `player-card ${isActive ? "active" : ""}`;
        let secretHtml = `<div class="secret-tiki-badge">`;
        p.secretTikis.forEach(sec => {
            const tiki = TIKI_PROFILES[sec.tikiId];
            const pos = game.totem.indexOf(sec.tikiId);
            const achieved = pos !== -1 && pos < sec.needed;
            secretHtml += `<div class="secret-chip ${achieved ? "scored" : ""}">${tiki.emoji} ${tiki.name} <span style="color:#8aac5a;">+${sec.pts}</span> <span style="font-size:9px;">${sec.label}</span></div>`;
        });
        secretHtml += `</div>`;
        cardDiv.innerHTML = `
        <div class="player-head">
          <div class="avatar" style="border-color:${p.color}">${p.emoji}</div>
          <div class="player-name" style="color:${p.color}">${p.name}</div>
          <div class="score-badge">${p.score}</div>
          ${isActive ? '<div class="turn-indicator">⚡ ACTIVE ⚡</div>' : ""}
        </div>
        <div>🎴 ${p.hand.filter(c => !c.used).length} cards left</div>
        ${secretHtml}
      `;
        container.appendChild(cardDiv);
    });
    const turnCounter = document.getElementById("turnCounter");
    if (turnCounter) turnCounter.innerHTML = `${game.turnCount} / 12`;
    const progressFill = document.getElementById("turnProgressFill");
    if (progressFill) progressFill.style.width = `${Math.min(100, (game.turnCount / 12) * 100)}%`;
}

function renderActionPanel() {
    const panel = document.getElementById("actionPanel");
    if (!panel) return;
    if (!game.gameActive || game.roundFinished) {
        panel.innerHTML = `<div style="text-align:center; padding:20px;">🏁 GAME OVER — START NEW RITUAL 🏁</div>`;
        return;
    }
    const player = game.players[game.currentPlayerIdx];
    if (isAIMode && player.name.includes("AI")) {
        panel.innerHTML = `<div style="text-align:center; padding:20px;">🤖 AI is thinking... 🧠</div>`;
        return;
    }
    let cardsHtml = `<div class="hand-cards">`;
    player.hand.forEach(card => {
        const selected = game.selectedCardObj?.id === card.id;
        const disabled = card.used || game.animating || game.waitingForTarget;
        cardsHtml += `<div class="action-card ${selected ? "selected" : ""} ${disabled ? "disabled" : ""}" ${!disabled ? `onclick="playCardWrapper('${card.id}')"` : ""}><span class="card-icon-big">${card.icon}</span><div>${card.label}</div></div>`;
    });
    cardsHtml += `</div>`;
    if (game.waitingForTarget) cardsHtml += `<button class="btn-cancel" onclick="cancelSelectionWrapper()">✖ CANCEL SELECTION ✖</button>`;
    panel.innerHTML = cardsHtml + `<div style="margin-top:12px; font-size:12px; text-align:center;">🎯 Secret idols score at round end</div>`;
}

function playCardWrapper(cardId) {
    if (game.gameActive && !game.roundFinished) {
        const p = game.players[game.currentPlayerIdx];
        const card = p.hand.find(c => c.id === cardId);
        if (card) playCard(card);
    }
}

function cancelSelectionWrapper() {
    cancelSelection();
}

function renderFull() {
    renderTotem();
    renderPlayersAndSecrets();
    renderActionPanel();
    applyBlurEffect();
}

function spawnParticles(emojis, count) {
    for (let i = 0; i < count; i++) {
        setTimeout(() => {
            const el = document.createElement("div");
            el.className = "particle-burst";
            el.innerText = emojis[Math.floor(Math.random() * emojis.length)];
            el.style.left = 30 + Math.random() * 60 + "%";
            el.style.top = "45%";
            document.body.appendChild(el);
            setTimeout(() => el.remove(), 900);
        }, i * 50);
    }
}

function startGame() {
    const playerNames = getPlayerNames();
    initGame(playerNames);
    setupPage.classList.add('hidden');
    setupPage.classList.remove('active');
    gamePage.classList.remove('hidden');
    gamePage.classList.add('active');
}

function backToSetup() {
    gamePage.classList.add('hidden');
    gamePage.classList.remove('active');
    setupPage.classList.remove('hidden');
    setupPage.classList.add('active');
    const overlay = document.getElementById("gameOverlay");
    overlay.classList.add("hidden");
}

function newGameWithCount() {
    const playerNames = getPlayerNames();
    initGame(playerNames);
    document.getElementById("gameOverlay").classList.add("hidden");
}

function showRules() {
    const overlay = document.getElementById("gameOverlay");
    document.getElementById("overlayTitle").innerHTML = "📜 TIKI LORE";
    document.getElementById("rankingList").innerHTML = `<div style="text-align:left;">🌟 <b>Goal:</b> Maneuver secret Tikis to top positions.<br>🔼 <b>Up (1/2/3):</b> Move any tiki upward.<br>💥 <b>Topple:</b> Send a tiki to the bottom.<br>💀 <b>Toast:</b> Remove the bottom tiki permanently!<br>🎴 <b>Secret Tikis:</b> Score 9/5/2 pts if top 1/2/3.<br>🏆 Round ends when ≤3 tikis or cards exhausted.</div>`;
    document.getElementById("overlayText").innerHTML = "🌀 Summon the volcano spirits!";
    overlay.classList.remove("hidden");
    document.getElementById("closeOverlayBtn").onclick = () => {
        overlay.classList.add("hidden");
    };
}

document.getElementById("startGameBtn").onclick = startGame;
document.getElementById("newGameBtn").onclick = newGameWithCount;
document.getElementById("rulesBtn").onclick = showRules;
document.getElementById("backToSetupBtn").onclick = backToSetup;
document.getElementById("closeOverlayBtn").onclick = () => {
    document.getElementById("gameOverlay").classList.add("hidden");
    newGameWithCount()
};