(() => {
  const { createClient } = window.supabase || {};
  const CONFIG = {url: "https://twuqlrmdnjqgbdidjcpa.supabase.co/", anonKey: "sb_publishable_SEJuLJtNiNaR3f6N26VBWA_Tjv9i..." };
  const configured = createClient && !CONFIG.url.includes("YOUR-") && !CONFIG.anonKey.includes("YOUR_");
  const db = configured ? createClient(CONFIG.url, CONFIG.anonKey) : null;
  const $ = (id) => document.getElementById(id);
  const screens = { home: $("auctionHome"), room: $("roomPanel"), auction: $("auctionPanel"), result: $("resultPanel") };
  const notice = $("auctionNotice");
  const anime = [
    ["naruto", "NARUTO", "#f07832", ["Naruto Uzumaki", "Sasuke Uchiha", "Itachi Uchiha", "Madara Uchiha", "Kakashi Hatake", "Minato Namikaze", "Hashirama Senju", "Might Guy", "Pain", "Gaara"]],
    ["one-piece", "ONE PIECE", "#4c8dff", ["Monkey D. Luffy", "Roronoa Zoro", "Shanks", "Marshall D. Teach", "Gol D. Roger", "Kaido", "Trafalgar Law", "Sanji", "Whitebeard", "Nico Robin"]],
    ["bleach", "BLEACH", "#d8b8ff", ["Ichigo Kurosaki", "Sosuke Aizen", "Yhwach", "Kenpachi Zaraki", "Byakuya Kuchiki", "Kisuke Urahara", "Genryusai Yamamoto", "Toshiro Hitsugaya", "Ulquiorra", "Rukia Kuchiki"]],
    ["dragon-ball", "DRAGON BALL", "#ffd45c", ["Goku", "Vegeta", "Gohan", "Broly", "Frieza", "Beerus", "Jiren", "Piccolo", "Cell", "Majin Buu"]],
    ["jujutsu-kaisen", "JUJUTSU KAISEN", "#ff63d0", ["Satoru Gojo", "Ryomen Sukuna", "Yuta Okkotsu", "Toji Fushiguro", "Yuji Itadori", "Megumi Fushiguro", "Maki Zenin", "Mahito", "Kenjaku", "Nanami"]],
    ["demon-slayer", "DEMON SLAYER", "#48e9a0", ["Tanjiro Kamado", "Nezuko Kamado", "Yoriichi Tsugikuni", "Muzan Kibutsuji", "Giyu Tomioka", "Kyojuro Rengoku", "Tengen Uzui", "Shinobu Kocho", "Akaza", "Zenitsu Agatsuma"]],
    ["black-clover", "BLACK CLOVER", "#a9c8ff", ["Asta", "Yuno", "Yami Sukehiro", "Julius Novachrono", "Mereoleona", "Noelle Silva", "Liebe", "Dante Zogratis", "Nacht Faust", "Luck Voltia"]],
    ["attack-on-titan", "ATTACK ON TITAN", "#ff9f7a", ["Eren Yeager", "Mikasa Ackerman", "Levi Ackerman", "Armin Arlert", "Erwin Smith", "Reiner Braun", "Annie Leonhart", "Zeke Yeager", "Hange Zoe", "Historia Reiss"]],
    ["my-hero", "MY HERO ACADEMIA", "#8effc7", ["Izuku Midoriya", "All Might", "Katsuki Bakugo", "Shoto Todoroki", "Tomura Shigaraki", "Endeavor", "Hawks", "Dabi", "Mirko", "Ochaco Uraraka"]],
    ["hunter-x-hunter", "HUNTER X HUNTER", "#c4a0ff", ["Gon Freecss", "Killua Zoldyck", "Kurapika", "Hisoka", "Meruem", "Chrollo Lucilfer", "Isaac Netero", "Illumi Zoldyck", "Leorio", "Biscuit Krueger"]]
  ];
  const powerSeeds = [78, 82, 91, 98, 87, 94, 96, 88, 90, 84];
  let session = null;
  let room = null;
  let channel = null;
  let timerHandle = null;
  let matchmakingTimer = null;

  function say(message, kind = "") { notice.textContent = message; notice.className = `auction-notice ${kind}`; }
  function show(name) { Object.values(screens).forEach((screen) => screen.classList.add("hidden")); screens[name].classList.remove("hidden"); }
  function code() { return Array.from({ length: 6 }, () => "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"[Math.floor(Math.random() * 31)]).join(""); }
  function cleanName() { return (localStorage.getItem("aniviaNickname") || "PLAYER_" + Math.floor(100 + Math.random() * 900)).slice(0, 16).toUpperCase(); }
  function getAnime(id) { return anime.find((entry) => entry[0] === id) || anime[0]; }
  function playerSlot() { return room.players.find((player) => player.id === session.user.id); }
  function opponentSlot() { return room.players.find((player) => player.id !== session.user.id); }
  function makeCharacter(animeId, name, index) { return { id: `${animeId}-${index}`, name, power: 74 + ((index * 7 + animeId.length * 3) % 25) }; }
  function buildPool(animeId) { return getAnime(animeId)[3].map((name, index) => makeCharacter(animeId, name, index)); }

  async function ensureSession() {
    if (!db) throw new Error("Supabase is not configured. Add your project URL and anon key in auction.js.");
    if (session) return session;
    const result = await db.auth.getSession();
    session = result.data.session;
    if (!session) session = (await db.auth.signInAnonymously()).data.session;
    return session;
  }

  async function persist() {
    room.state.players = room.players;
    const result = await db.from("auction_rooms").update({ state: room.state, status: room.status, anime_id: room.animeId }).eq("id", room.id);
    if (result.error) throw result.error;
  }

  function subscribe() {
    if (channel) db.removeChannel(channel);
    channel = db.channel(`auction-room-${room.id}`).on("postgres_changes", { event: "UPDATE", schema: "public", table: "auction_rooms", filter: `id=eq.${room.id}` }, (payload) => {
      room.state = payload.new.state;
      room.players = room.state.players || room.players;
      room.status = payload.new.status;
      room.animeId = payload.new.anime_id;
      render();
    }).subscribe();
  }

  async function createRoom() {
    try {
      await ensureSession();
      const id = crypto.randomUUID();
      room = { id, code: code(), status: "waiting", animeId: null, players: [{ id: session.user.id, name: cleanName(), ready: false, balance: 20, team: [] }], state: { round: 0, characters: [], current: null, bid: 0, leader: null, passed: [] } };
      const result = await db.from("auction_rooms").insert({ id: room.id, code: room.code, host_id: session.user.id, status: room.status, state: room.state, anime_id: null });
      if (result.error) throw result.error;
      const playerResult = await db.from("auction_players").insert({ room_id: room.id, player_id: session.user.id, name: room.players[0].name, slot: 1 });
      if (playerResult.error) throw playerResult.error;
      subscribe(); render(); say("ROOM CREATED. SHARE THE CODE WITH YOUR FRIEND.", "success");
    } catch (error) { say(error.message, "error"); }
  }

  async function joinRoom() {
    const entered = window.prompt("ENTER ROOM CODE");
    if (!entered) return;
    try {
      await ensureSession();
      const found = await db.from("auction_rooms").select("*").eq("code", entered.trim().toUpperCase()).maybeSingle();
      if (found.error) throw found.error;
      if (!found.data) throw new Error("ROOM NOT FOUND");
      if (found.data.status !== "waiting") throw new Error("MATCH ALREADY IN PROGRESS");
      room = { id: found.data.id, code: found.data.code, status: found.data.status, animeId: found.data.anime_id, players: [], state: found.data.state };
      const players = await db.from("auction_players").select("*").eq("room_id", room.id).order("slot");
      if (players.error) throw players.error;
      if (players.data.length >= 2) throw new Error("ROOM IS FULL");
      room.players = players.data.map((player) => ({ id: player.player_id, name: player.name, ready: player.ready, balance: 20, team: [] }));
      room.players.push({ id: session.user.id, name: cleanName(), ready: false, balance: 20, team: [] });
      const playerResult = await db.from("auction_players").insert({ room_id: room.id, player_id: session.user.id, name: cleanName(), slot: 2 });
      if (playerResult.error) throw playerResult.error;
      await persist(); subscribe(); render(); say("CONNECTED. WAITING FOR THE HOST.", "success");
    } catch (error) { say(error.message, "error"); }
  }

  async function toggleReady() {
    if (!room) return;
    const player = playerSlot();
    player.ready = !player.ready;
    await db.from("auction_players").update({ ready: player.ready }).eq("room_id", room.id).eq("player_id", player.id);
    const latest = await db.from("auction_players").select("*").eq("room_id", room.id).order("slot");
    room.players = latest.data.map((entry) => ({ id: entry.player_id, name: entry.name, ready: entry.ready, balance: 20, team: [] }));
    room.status = room.players.length === 2 && room.players.every((entry) => entry.ready) ? "ready" : "waiting";
    await persist(); render();
  }

  async function selectAnime(animeId) {
    if (!room || room.players[0].id !== session.user.id || room.status !== "ready") return;
    room.animeId = animeId;
    room.status = "starting";
    room.state.characters = shuffle(buildPool(animeId)).slice(0, 5);
    await persist(); render();
  }

  async function startAuction() {
    if (!room || room.players[0].id !== session.user.id || !room.animeId) return;
    room.status = "in_game";
    room.state.round = 1;
    room.state.current = room.state.characters[0];
    room.state.bid = 0;
    room.state.leader = null;
    room.state.passed = [];
    room.players.forEach((player) => { player.balance = 20; player.team = []; });
    await persist(); render();
  }

  function shuffle(items) { return [...items].sort(() => Math.random() - 0.5); }
  function render() {
    if (!room) return;
    if (room.status === "in_game") renderAuction(); else if (room.status === "finished") renderResults(); else renderRoom();
  }
  function renderRoom() {
    show("room");
    $("roomCodeDisplay").textContent = room.code;
    $("playerOneName").textContent = room.players[0]?.name || "WAITING";
    $("playerTwoName").textContent = room.players[1]?.name || "WAITING";
    $("playerOneState").textContent = room.players[0]?.ready ? "● READY" : "○ WAITING";
    $("playerTwoState").textContent = room.players[1]?.ready ? "● READY" : "○ WAITING";
    $("readyButton").textContent = playerSlot()?.ready ? "NOT READY" : "READY";
    $("animeSelection").classList.toggle("hidden", room.status !== "ready" && room.status !== "starting");
    $("startAuctionButton").classList.toggle("hidden", !(room.status === "starting" && room.players[0]?.id === session.user.id));
    $("animeSelectedLabel").textContent = room.animeId ? getAnime(room.animeId)[1] : "NOT SELECTED";
    renderAnimeGrid();
  }
  function renderAnimeGrid() {
    $("animeGrid").innerHTML = anime.map(([id, name, color]) => `<button class="anime-card ${room.animeId === id ? "selected" : ""}" data-anime="${id}" style="--anime-accent:${color}"><span>// UNIVERSE</span><strong>${name}</strong><small>${getAnime(id)[3][0]} // ${getAnime(id)[3][1]}</small></button>`).join("");
  }
  function renderAuction() {
    show("auction");
    const current = room.state.current;
    const me = playerSlot(); const other = opponentSlot();
    $("auctionRound").textContent = `ROUND ${room.state.round} / 5`;
    $("auctionAnimeName").textContent = getAnime(room.animeId)[1];
    $("auctionCharacterName").textContent = current?.name || "WAITING...";
    $("auctionCharacterAnime").textContent = getAnime(room.animeId)[1];
    $("auctionCharacterArt").textContent = current ? current.name.split(" ").map((part) => part[0]).join("").slice(0, 3) : "?";
    $("auctionCurrentBid").textContent = room.state.bid;
    $("auctionCurrentLeader").textContent = room.state.leader ? (room.players.find((player) => player.id === room.state.leader)?.name || "PLAYER") : "NO BIDS";
    $("auctionPlayerOneName").textContent = room.players[0]?.name || "PLAYER 1";
    $("auctionPlayerTwoName").textContent = room.players[1]?.name || "PLAYER 2";
    $("auctionPlayerOneBalance").textContent = room.players[0]?.balance ?? 20;
    $("auctionPlayerTwoBalance").textContent = room.players[1]?.balance ?? 20;
    $("auctionPlayerOneTeam").textContent = room.players[0]?.team.length || 0;
    $("auctionPlayerTwoTeam").textContent = room.players[1]?.team.length || 0;
    $("passButton").disabled = room.state.passed.includes(me.id);
    document.querySelectorAll("[data-bid]").forEach((button) => { button.disabled = room.state.passed.includes(me.id) || (room.state.bid + Number(button.dataset.bid)) > me.balance; });
    $("auctionFeed").textContent = `YOU HAVE $${me.balance}. BIDS ARE VIRTUAL CURRENCY ONLY.`;
    if (!timerHandle) startTimer();
  }
  function startTimer() { let remaining = 20; $("auctionTimer").textContent = remaining; timerHandle = setInterval(async () => { remaining -= 1; $("auctionTimer").textContent = Math.max(0, remaining); if (remaining <= 0) { clearInterval(timerHandle); timerHandle = null; await settleRound(); } }, 1000); }
  async function bid(amount) { const me = playerSlot(); const next = room.state.bid + amount; if (room.state.passed.includes(me.id) || next > me.balance) return say("BID EXCEEDS YOUR MATCH BALANCE.", "error"); room.state.bid = next; room.state.leader = me.id; await persist(); renderAuction(); }
  async function pass() { const me = playerSlot(); if (!room.state.passed.includes(me.id)) room.state.passed.push(me.id); if (room.state.passed.length === 2) return settleRound(); await persist(); renderAuction(); }
  async function settleRound() { const winner = room.players.find((player) => player.id === room.state.leader); if (winner && room.state.bid > 0) { winner.balance -= room.state.bid; winner.team.push({ ...room.state.current, price: room.state.bid }); } room.state.round += 1; room.state.passed = []; room.state.bid = 0; room.state.leader = null; if (room.state.round > 5) { room.status = "finished"; room.state.current = null; } else room.state.current = room.state.characters[room.state.round - 1]; await persist(); render(); }
  function renderResults() { show("result"); const one = room.players[0]; const two = room.players[1]; $("resultAnime").textContent = getAnime(room.animeId)[1]; $("resultPlayerOneName").textContent = one.name; $("resultPlayerTwoName").textContent = two.name; $("resultPlayerOneTeam").innerHTML = teamHtml(one.team); $("resultPlayerTwoTeam").innerHTML = teamHtml(two.team); const onePower = one.team.reduce((sum, character) => sum + character.power, 0); const twoPower = two.team.reduce((sum, character) => sum + character.power, 0); $("resultPlayerOnePower").textContent = onePower; $("resultPlayerTwoPower").textContent = twoPower; $("resultWinner").textContent = onePower === twoPower ? "DRAW // SAME POWER" : `${onePower > twoPower ? one.name : two.name} WINS!`; }
  function teamHtml(team) { return team.length ? team.map((character) => `<div class="result-character"><span>${character.name}</span><small>$${character.price} // POWER ${character.power}</small></div>`).join("") : "<div class=\"result-character\">NO SALE</div>"; }
  async function randomMatch() {
    try {
      await ensureSession();
      const result = await db.rpc("auction_find_match", { p_name: cleanName() });
      if (result.error) throw result.error;
      $("randomMatchButton").classList.add("hidden");
      $("cancelMatchButton").classList.remove("hidden");
      say("SEARCHING FOR OPPONENT...", "loading");
      matchmakingTimer = setInterval(async () => {
        const queued = await db.from("auction_queue").select("room_id").eq("player_id", session.user.id).maybeSingle();
        if (queued.data?.room_id) {
          clearInterval(matchmakingTimer);
          matchmakingTimer = null;
          await loadRoom(queued.data.room_id);
        }
      }, 1800);
    } catch (error) { say(error.message, "error"); }
  }

  async function loadRoom(roomId) {
    const found = await db.from("auction_rooms").select("*").eq("id", roomId).single();
    if (found.error) throw found.error;
    const players = await db.from("auction_players").select("*").eq("room_id", roomId).order("slot");
    room = { id: found.data.id, code: found.data.code, status: found.data.status, animeId: found.data.anime_id, players: players.data.map((player) => ({ id: player.player_id, name: player.name, ready: player.ready, balance: 20, team: [] })), state: found.data.state };
    room.players = room.state.players || room.players;
    $("cancelMatchButton").classList.add("hidden");
    subscribe();
    render();
    say("MATCH FOUND. READY UP.", "success");
  }
  function resultText() { return `ANIME DRAFT\nAnime: ${getAnime(room.animeId)[1]}\n\n${room.players.map((player) => `${player.name}:\n${player.team.map((character) => `${character.name} - $${character.price}`).join("\n")}\nTotal Power: ${player.team.reduce((sum, character) => sum + character.power, 0)}`).join("\n\n")}\n\n${$("resultWinner").textContent}`; }

  $("createRoomButton").addEventListener("click", createRoom);
  $("joinRoomButton").addEventListener("click", joinRoom);
  $("randomMatchButton").addEventListener("click", randomMatch);
  $("cancelMatchButton").addEventListener("click", async () => { if (matchmakingTimer) clearInterval(matchmakingTimer); matchmakingTimer = null; if (db && session) await db.from("auction_queue").delete().eq("player_id", session.user.id); $("cancelMatchButton").classList.add("hidden"); $("randomMatchButton").classList.remove("hidden"); say("MATCHMAKING CANCELLED."); });
  $("howToPlayButton").addEventListener("click", () => $("howToPlay").classList.toggle("hidden"));
  $("readyButton").addEventListener("click", toggleReady);
  $("startAuctionButton").addEventListener("click", startAuction);
  $("copyRoomButton").addEventListener("click", () => navigator.clipboard?.writeText(room.code));
  $("leaveRoomButton").addEventListener("click", () => { if (window.confirm("Are you sure you want to leave?")) window.location.reload(); });
  $("auctionLeaveButton").addEventListener("click", () => { if (window.confirm("Are you sure you want to leave?")) window.location.reload(); });
  $("animeGrid").addEventListener("click", (event) => { const card = event.target.closest("[data-anime]"); if (card) selectAnime(card.dataset.anime); });
  document.querySelectorAll("[data-bid]").forEach((button) => button.addEventListener("click", () => bid(Number(button.dataset.bid))));
  $("customBidButton").addEventListener("click", () => { const amount = Number($("customBidInput").value); const increment = amount - room.state.bid; if (!Number.isInteger(amount) || increment <= 0) return say("CUSTOM BID MUST BE ABOVE THE CURRENT BID.", "error"); bid(increment); });
  $("passButton").addEventListener("click", pass);
  $("copyResultButton").addEventListener("click", () => navigator.clipboard?.writeText(resultText()));
  $("shareResultButton").addEventListener("click", () => navigator.share ? navigator.share({ title: "ANIME DRAFT", text: resultText() }) : navigator.clipboard?.writeText(resultText()));
  $("rematchButton").addEventListener("click", () => { room.status = "ready"; room.state = { round: 0, characters: [], current: null, bid: 0, leader: null, passed: [] }; room.players.forEach((player) => { player.ready = false; player.balance = 20; player.team = []; }); persist().then(render); });
  if (!configured) say("ONLINE MODE NEEDS SUPABASE CONFIGURATION. ADD YOUR URL AND ANON KEY IN AUCTION.JS.", "error");
})();
