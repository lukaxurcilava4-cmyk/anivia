(() => {
  const CARDS = window.ANIVIA_CARDS || [];
  const BYID = Object.fromEntries(CARDS.map((c) => [c.id, c]));
  const ROUNDS = 5;
  const WINS_NEEDED = 3;
  const STARTER_SIZE = 12;
  const key = "aniviaCardCollection";

  const $ = (id) => document.getElementById(id);
  const el = { score: $("gcScore"), you: $("gcYou"), rival: $("gcRival"), round: $("gcRound"), info: $("gcInfo"), stage: $("gcStage"), yourStake: $("gcYourStake"), rivalStake: $("gcRivalStake"), arena: $("gcArena"), yourPlay: $("gcYourPlay"), rivalPlay: $("gcRivalPlay"), actions: $("gcActions"), message: $("gcMessage"), handTitle: $("gcHandTitle"), hand: $("gcHand") };

  const pickRandom = (list, n) => list.slice().sort(() => Math.random() - 0.5).slice(0, n);

  function loadCollection() {
    try {
      const saved = JSON.parse(localStorage.getItem(key));
      if (Array.isArray(saved)) {
        const valid = saved.filter((id) => BYID[id]);
        if (valid.length) return valid;
      }
    } catch { /* ignore */ }
    const starter = pickRandom(CARDS, STARTER_SIZE).map((c) => c.id);
    localStorage.setItem(key, JSON.stringify(starter));
    return starter;
  }
  const saveCollection = (list) => localStorage.setItem(key, JSON.stringify(list));

  let collection = loadCollection();
  let match = null;

  function cardHtml(card, extra = "") {
    const art = card.image ? `<img src="${card.image}" alt="">` : `<b>${card.glyph}</b>`;
    return `<div class="gc-card rarity-${card.rarity} ${extra}"><span class="gc-power">${card.power}</span><span class="gc-art">${art}</span><span class="gc-name">${card.name}</span><span class="gc-rar">${card.rarity.toUpperCase()}</span></div>`;
  }

  function setActions(buttons) {
    el.actions.innerHTML = "";
    buttons.forEach(({ label, onClick, secondary }) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = secondary ? "outline-button" : "main-button";
      b.textContent = label;
      b.addEventListener("click", onClick);
      el.actions.appendChild(b);
    });
  }

  function showHand(ids, title, onPick, disabledIds = []) {
    el.handTitle.textContent = title;
    el.hand.innerHTML = ids.map((id) => `<button type="button" class="gc-pick" data-id="${id}" ${disabledIds.includes(id) ? "disabled" : ""}>${cardHtml(BYID[id])}</button>`).join("");
    el.hand.onclick = (event) => {
      const btn = event.target.closest(".gc-pick");
      if (btn && !btn.disabled) onPick(btn.dataset.id);
    };
  }

  function resetUi() {
    el.score.hidden = true;
    el.stage.hidden = true;
    el.arena.hidden = true;
    el.message.textContent = "";
  }

  /* ---------- phase 1: choose stake ---------- */
  function startMenu() {
    match = null;
    resetUi();
    setActions([]);
    el.info.textContent = `Pick your most beloved card as your stake. Win 3 of 5 rounds to take your rival's stake. Lose and you lose yours. Collection: ${collection.length} cards.`;
    if (collection.length < ROUNDS + 1) {
      el.handTitle.textContent = "";
      el.hand.innerHTML = "";
      el.message.textContent = `YOU NEED AT LEAST ${ROUNDS + 1} CARDS TO PLAY.`;
      setActions([{ label: "RESET COLLECTION", onClick: () => { localStorage.removeItem(key); collection = loadCollection(); startMenu(); } }]);
      return;
    }
    showHand(collection, "CHOOSE YOUR STAKE CARD", proposeMatch);
  }

  function proposeMatch(stakeId) {
    // The CPU rival has its own cards and stakes one of its stronger ones.
    const rivalDeck = pickRandom(CARDS.filter((c) => c.id !== stakeId), STARTER_SIZE).map((c) => c.id);
    const top = rivalDeck.slice().sort((a, b) => BYID[b].power - BYID[a].power).slice(0, 3);
    const rivalStake = top[Math.floor(Math.random() * top.length)];
    match = { yourStake: stakeId, rivalStake, rivalDeck: rivalDeck.filter((id) => id !== rivalStake), yourUsed: [], rivalUsed: [], you: 0, rival: 0, round: 1, locked: false };

    el.hand.innerHTML = "";
    el.handTitle.textContent = "";
    el.stage.hidden = false;
    el.yourStake.innerHTML = cardHtml(BYID[stakeId]);
    el.rivalStake.innerHTML = cardHtml(BYID[rivalStake]);
    el.info.textContent = "Your rival stakes this card. Don't like it? Cancel and nothing is lost. Otherwise start the duel.";
    el.message.textContent = "";
    setActions([
      { label: "START DUEL", onClick: beginRounds },
      { label: "CANCEL GAME", onClick: startMenu, secondary: true }
    ]);
  }

  /* ---------- phase 2: five rounds ---------- */
  function beginRounds() {
    el.score.hidden = false;
    el.arena.hidden = false;
    setActions([]);
    nextRound();
  }

  function renderScore() {
    el.you.textContent = match.you;
    el.rival.textContent = match.rival;
    el.round.textContent = Math.min(match.round, ROUNDS);
  }

  function nextRound() {
    renderScore();
    match.locked = false;
    el.yourPlay.innerHTML = "";
    el.rivalPlay.innerHTML = "";
    el.yourPlay.className = "gc-empty";
    el.rivalPlay.className = "gc-empty";
    el.info.textContent = `Round ${match.round} of ${ROUNDS}: place a card. The stronger card wins. Each card can be used once.`;
    el.message.textContent = "";
    const hand = collection.filter((id) => id !== match.yourStake);
    showHand(hand, "PLAY A CARD", playRound, match.yourUsed);
  }

  function playRound(id) {
    if (!match || match.locked) return;
    match.locked = true;
    const available = match.rivalDeck.filter((c) => !match.rivalUsed.includes(c));
    const rivalId = available[Math.floor(Math.random() * available.length)];
    match.yourUsed.push(id);
    match.rivalUsed.push(rivalId);

    const yours = BYID[id];
    const theirs = BYID[rivalId];
    el.yourPlay.className = "";
    el.rivalPlay.className = "";
    el.yourPlay.innerHTML = cardHtml(yours);
    el.rivalPlay.innerHTML = cardHtml(theirs);

    let text;
    if (yours.power > theirs.power) { match.you += 1; text = `ROUND ${match.round}: YOU WIN! (${yours.power} vs ${theirs.power})`; el.yourPlay.firstChild.classList.add("won"); }
    else if (yours.power < theirs.power) { match.rival += 1; text = `ROUND ${match.round}: RIVAL WINS. (${yours.power} vs ${theirs.power})`; el.rivalPlay.firstChild.classList.add("won"); }
    else { text = `ROUND ${match.round}: DRAW. (${yours.power} vs ${theirs.power})`; }
    el.message.textContent = text;
    renderScore();

    // Ends as soon as someone reaches 3 wins, or after the 5th round.
    const over = match.round >= ROUNDS || match.you >= WINS_NEEDED || match.rival >= WINS_NEEDED;
    el.hand.querySelectorAll(".gc-pick").forEach((b) => { b.disabled = true; });
    if (over) setActions([{ label: "SEE RESULT", onClick: finish }]);
    else setActions([{ label: "NEXT ROUND →", onClick: () => { match.round += 1; setActions([]); nextRound(); } }]);
  }

  /* ---------- phase 3: result ---------- */
  function finish() {
    const won = match.you >= WINS_NEEDED;
    const lost = match.rival >= WINS_NEEDED;
    el.hand.innerHTML = "";
    el.handTitle.textContent = "";
    if (won) {
      collection = collection.concat(match.rivalStake);
      el.info.textContent = `YOU WON ${match.you}-${match.rival}! You take ${BYID[match.rivalStake].name} from your rival.`;
    } else if (lost) {
      collection = collection.filter((id) => id !== match.yourStake);
      el.info.textContent = `YOU LOST ${match.you}-${match.rival}. ${BYID[match.yourStake].name} goes to your rival.`;
    } else {
      el.info.textContent = `NO WINNER (${match.you}-${match.rival}). Both stakes are returned.`;
    }
    collection = [...new Set(collection)];
    saveCollection(collection);
    el.message.textContent = won ? "★ STAKE CAPTURED" : lost ? "STAKE LOST" : "STAKES RETURNED";
    setActions([{ label: "PLAY AGAIN", onClick: startMenu }]);
  }

  if (!CARDS.length) { el.info.textContent = "NO CARDS FOUND."; return; }
  startMenu();
})();
