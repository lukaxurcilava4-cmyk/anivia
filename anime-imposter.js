(() => {
  const config = window.ANIVIA_SUPABASE_CONFIG || {};
  const clientFactory = window.supabase?.createClient;
  const configured = Boolean(clientFactory && config.url && config.anonKey && !config.url.includes("YOUR-") && !config.anonKey.includes("YOUR_"));
  const db = configured ? clientFactory(config.url, config.anonKey) : null;
  const $ = (id) => document.getElementById(id);
  const home = $("homePanel");
  const roomPanel = $("roomPanel");
  const stage = $("gameStage");
  const notice = $("imposterNotice");
  let session = null;
  let roomId = null;
  let snapshot = null;
  let channel = null;
  let pollHandle = null;
  let clockHandle = null;
  let matchHandle = null;
  let matchCountdownHandle = null;
  let voteContinueHandle = null;
  let serverOffset = 0;
  let selectedVote = null;
  let lastWarningAt = "";
  let lastRenderSignature = "";
  let soundEnabled = localStorage.getItem("animeImposterSound") === "true";
  const phaseNames = {
    lobby: "LOBBY", role_reveal: "ROLE REVEAL", clue_phase: "CLUE PHASE",
    voting: "VOTING", revote: "REVOTE", vote_results: "VOTE RESULTS",
    final_guess: "FINAL GUESS", game_over: "RESULTS"
  };

  function say(message, kind = "") {
    notice.textContent = message;
    notice.className = `imposter-notice${kind ? ` ${kind}` : ""}`;
  }
  function userError(error) {
    const message = String(error?.message || "");
    const known = [
      "ROOM NOT FOUND", "ROOM FULL", "GAME ALREADY STARTED", "INVALID ROOM CODE",
      "NICKNAME ALREADY USED", "CONNECTION LOST", "NOT ENOUGH PLAYERS",
      "SESSION EXPIRED", "SERVER ERROR", "INVALID NICKNAME", "INVALID ROOM CAPACITY",
      "ONLY THE HOST CAN START", "ONLY THE HOST CAN KICK A PLAYER",
      "ONLY THE HOST CAN CLOSE THE ROOM", "ONLY THE HOST CAN RETURN TO LOBBY", "ACTION NOT AVAILABLE", "WAIT FOR YOUR TURN",
      "MATCH ALREADY FOUND",
      "YOUR TURN HAS EXPIRED", "CLUE PHASE HAS ENDED", "VOTING IS NOT OPEN",
      "VOTE REQUEST IS CLOSED", "VOTE ALREADY REQUESTED", "VOTE ALREADY LOCKED",
      "INVALID VOTE", "CHOOSE ONE OF THE TIED PLAYERS", "FINAL GUESS IS NOT OPEN",
      "ONLY THE IMPOSTOR CAN GUESS", "ENTER A CHARACTER NAME",
      "ENTER ONE WORD (1–24 LETTERS OR NUMBERS)", "ROOM CAPACITY", "ROOM FULL"
    ];
    const exact = known.find((item) => message.toUpperCase().includes(item));
    if (exact) return exact;
    if (/fetch|network|websocket|connection/i.test(message)) return "CONNECTION LOST // CHECK YOUR CONNECTION AND RETRY.";
    if (/anonymous|provider is disabled/i.test(message)) return "ENABLE ANONYMOUS AUTH IN SUPABASE TO PLAY.";
    return "SERVER ERROR // PLEASE TRY AGAIN.";
  }
  function node(tag, className, text) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
  }
  function actionButton(label, callback, className = "outline-button") {
    const button = node("button", className, label);
    button.type = "button";
    button.addEventListener("click", callback);
    return button;
  }
  function panelHeading(title, subtitle) {
    const heading = node("div");
    heading.append(node("h3", "", title), node("p", "", subtitle));
    return heading;
  }
  function nickname() {
    const value = $("nicknameInput").value.trim().replace(/\s+/g, " ");
    if (!/^[A-Za-z0-9_ -]{2,16}$/.test(value)) throw new Error("INVALID NICKNAME");
    localStorage.setItem("aniviaNickname", value);
    return value;
  }
  async function ensureSession() {
    if (!db) throw new Error("SERVER ERROR");
    if (session) return session;
    const current = await db.auth.getSession();
    if (current.error) throw current.error;
    session = current.data.session;
    if (!session) {
      const created = await db.auth.signInAnonymously();
      if (created.error) throw created.error;
      session = created.data.session;
    }
    if (!session) throw new Error("SESSION EXPIRED");
    return session;
  }
  async function rpc(name, args = {}) {
    await ensureSession();
    const result = await db.rpc(name, args);
    if (result.error) throw result.error;
    return result.data;
  }
  function updateSoundControl() {
    $("soundToggle").textContent = soundEnabled ? "SOUND ON" : "SOUND OFF";
    $("soundToggle").setAttribute("aria-pressed", String(soundEnabled));
  }
  function playTone(frequency = 620, duration = 0.08) {
    if (!soundEnabled) return;
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    const context = new AudioContextClass();
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = "square";
    oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(0.035, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + duration);
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start();
    oscillator.stop(context.currentTime + duration);
    oscillator.onended = () => context.close();
  }
  function stopRoomLoops() {
    if (pollHandle) clearInterval(pollHandle);
    if (clockHandle) clearInterval(clockHandle);
    if (channel) db?.removeChannel(channel);
    if (voteContinueHandle) clearTimeout(voteContinueHandle);
    pollHandle = null;
    clockHandle = null;
    channel = null;
    voteContinueHandle = null;
  }
  function startRoomLoops() {
    stopRoomLoops();
    channel = db.channel(`anime-imposter-${roomId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "anime_imposter_rooms", filter: `id=eq.${roomId}` }, refreshRoom)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "anime_imposter_players", filter: `room_id=eq.${roomId}` }, refreshRoom)
      .on("postgres_changes", { event: "DELETE", schema: "public", table: "anime_imposter_players", filter: `room_id=eq.${roomId}` }, refreshRoom)
      .subscribe();
    pollHandle = setInterval(refreshRoom, 2500);
    clockHandle = setInterval(renderClock, 1000);
  }
  async function enterRoom(id, successMessage = "CONNECTED TO ROOM.") {
    roomId = id;
    home.classList.add("hidden");
    roomPanel.classList.remove("hidden");
    startRoomLoops();
    await refreshRoom();
    say(successMessage, "success");
  }
  function signature(data) {
    return JSON.stringify({
      room: data.room, players: data.players, state: data.state, role: data.my_role,
      character: data.my_character, vote: data.my_vote, serverNow: undefined
    });
  }
  async function refreshRoom() {
    if (!roomId || !db) return;
    try {
      const result = await db.rpc("anime_imposter_state", { p_room_id: roomId });
      if (result.error) throw result.error;
      const data = result.data;
      if (!data?.room) throw new Error("ROOM NOT FOUND");
      serverOffset = new Date(data.server_now).getTime() - Date.now();
      const nextSignature = signature(data);
      const oldPhase = snapshot?.room?.phase;
      const oldTurn = snapshot?.state?.current_turn;
      snapshot = data;
      if (oldPhase && oldPhase !== data.room.phase) {
        if (data.room.phase === "clue_phase") playTone(740, 0.12);
        if (data.room.phase === "voting" || data.room.phase === "revote") playTone(560, 0.16);
        if (data.room.phase === "vote_results") playTone(460, 0.12);
        if (data.room.phase === "game_over") playTone(data.state.winner === "impostor" ? 380 : 920, 0.24);
      }
      if (oldTurn !== data.state.current_turn && data.state.current_turn === session?.user.id) playTone(880, 0.14);
      if (nextSignature !== lastRenderSignature) {
        lastRenderSignature = nextSignature;
        renderRoom();
      }
      if (data.room.phase === "vote_results" && !voteContinueHandle) {
        voteContinueHandle = setTimeout(() => {
          voteContinueHandle = null;
          perform("anime_imposter_resolve_votes", { p_room_id: roomId });
        }, 4500);
      } else if (data.room.phase !== "vote_results" && voteContinueHandle) {
        clearTimeout(voteContinueHandle);
        voteContinueHandle = null;
      }
    } catch (error) {
      if (String(error?.message || "").toUpperCase().includes("ROOM NOT FOUND")) {
        stopRoomLoops();
        roomId = null;
        snapshot = null;
        lastRenderSignature = "";
        roomPanel.classList.add("hidden");
        home.classList.remove("hidden");
      }
      say(userError(error), "error");
    }
  }
  function playerById(id) {
    return snapshot?.players?.find((player) => player.id === id);
  }
  function renderRoom() {
    if (!snapshot) return;
    const { room, players, state } = snapshot;
    $("roomTitle").textContent = `ROOM ${room.code}`;
    $("roomCodeDisplay").textContent = room.code;
    $("playerCount").textContent = `${players.length} / ${room.max_players} PLAYERS`;
    $("phaseLabel").textContent = phaseNames[room.phase] || room.phase.toUpperCase();
    renderPlayers();
    renderStage();
    renderClock();
  }
  function renderPlayers() {
    const list = $("playerList");
    list.replaceChildren();
    snapshot.players.forEach((player, index) => {
      const card = node("article", `imposter-player-card${player.id === session?.user.id ? " is-me" : ""}`);
      card.style.animationDelay = `${index * 55}ms`;
      card.append(node("span", "imposter-player-avatar", player.nickname.slice(0, 2).toUpperCase()));
      card.append(node("strong", "", player.nickname));
      const state = snapshot.room.phase === "role_reveal" ? (player.ready ? "READY" : "REVEALING ROLE")
        : player.connected ? "● CONNECTED" : "○ RECONNECTING";
      card.append(node("small", "", `${player.is_host ? "HOST // " : ""}${state}`));
      if (snapshot.room.host_id === session?.user.id && player.id !== session.user.id && snapshot.room.phase === "lobby") {
        card.append(actionButton("KICK", () => {
          if (window.confirm(`KICK ${player.nickname} FROM THE ROOM?`)) {
            perform("anime_imposter_leave", { p_room_id: roomId, p_target: player.id });
          }
        }, "text-button"));
      }
      list.append(card);
    });
  }
  function renderStage() {
    stage.replaceChildren();
    selectedVote = null;
    const phase = snapshot.room.phase;
    if (phase === "lobby") return renderLobby();
    if (phase === "role_reveal") return renderRoleReveal();
    if (phase === "clue_phase") return renderCluePhase();
    if (phase === "voting" || phase === "revote") return renderVoting();
    if (phase === "vote_results") return renderVoteResults();
    if (phase === "final_guess") return renderFinalGuess();
    if (phase === "game_over") return renderGameOver();
  }
  function renderLobby() {
    const isHost = snapshot.room.host_id === session?.user.id;
    const players = snapshot.players.length;
    stage.append(panelHeading("LOBBY", isHost ? "Share the invite code, then start when 3–4 players have joined." : "Waiting for the host to start the game."));
    const actions = node("div", "imposter-stage-actions");
    actions.append(actionButton("COPY CODE", copyCode));
    actions.append(actionButton("COPY INVITE LINK", copyInvite));
    if (isHost) {
      const start = actionButton("START GAME", () => perform("anime_imposter_start", { p_room_id: roomId }), "main-button");
      start.disabled = players < 3;
      actions.append(start);
      actions.append(actionButton("CLOSE ROOM", () => {
        if (window.confirm("CLOSE THIS ROOM FOR EVERYONE?")) perform("anime_imposter_close", { p_room_id: roomId }, true);
      }, "text-button"));
    } else {
      actions.append(node("p", "", "WAITING FOR HOST..."));
    }
    stage.append(actions);
    if (isHost && players < 3) stage.append(node("p", "", "NOT ENOUGH PLAYERS // MINIMUM 3"));
  }
  function renderRoleReveal() {
    const impostor = snapshot.my_role === "impostor";
    stage.append(panelHeading("YOUR ROLE", "Keep your screen private until everyone is ready."));
    const reveal = node("div", "imposter-role-card");
    reveal.append(node("small", "", "YOU ARE"));
    reveal.append(node("strong", "", impostor ? "THE IMPOSTOR" : "A PLAYER"));
    if (impostor) {
      reveal.append(node("p", "", "You do not know the character. Listen to the clues and blend in."));
    } else if (snapshot.my_character) {
      reveal.append(node("small", "", "YOUR CHARACTER"));
      reveal.append(node("strong", "", snapshot.my_character.name));
      reveal.append(node("em", "", snapshot.my_character.anime));
    }
    stage.append(reveal);
    const me = snapshot.players.find((player) => player.id === session?.user.id);
    if (me?.ready) stage.append(node("p", "", "READY // WAITING FOR EVERYONE"));
    else stage.append(actionButton("READY", () => perform("anime_imposter_ready", { p_room_id: roomId }), "main-button"));
  }
  function renderCluePhase() {
    const state = snapshot.state;
    const current = playerById(state.current_turn);
    stage.append(panelHeading("CLUE PHASE", "Give one word per turn. You can request an early vote once."));
    const clock = node("div", "imposter-timer");
    clock.id = "clueTimer";
    stage.append(clock);
    stage.append(node("p", "", `CURRENT PLAYER // ${current?.nickname || "WAITING"}`));
    const clues = node("div", "imposter-clues");
    state.clues.forEach((clue) => {
      const row = node("div", `imposter-clue${clue.player_id === state.current_turn ? " is-current" : ""}`);
      row.append(node("strong", "", clue.nickname), node("q", "", clue.word));
      clues.append(row);
    });
    if (!state.clues.length) clues.append(node("p", "", "NO CLUES YET // THE FIRST WORD IS THE HARDEST."));
    stage.append(clues);
    const isTurn = state.current_turn === session?.user.id;
    if (isTurn) {
      const form = node("form", "imposter-clue-form");
      const input = node("input", "imposter-word-input");
      input.id = "clueInput";
      input.name = "clue";
      input.type = "text";
      input.autocomplete = "off";
      input.maxLength = 24;
      input.pattern = "[A-Za-z0-9]{1,24}";
      input.required = true;
      input.setAttribute("aria-label", "Enter a one-word clue");
      input.placeholder = "ONE WORD";
      const submit = actionButton("SUBMIT CLUE", () => {}, "main-button");
      submit.type = "submit";
      form.append(input, submit);
      form.addEventListener("submit", (event) => {
        event.preventDefault();
        const word = input.value.trim();
        if (!/^[A-Za-z0-9]{1,24}$/.test(word)) return say("ONE WORD ONLY // 1–24 LETTERS OR NUMBERS.", "error");
        perform("anime_imposter_submit_clue", { p_room_id: roomId, p_word: word });
      });
      stage.append(form);
    } else {
      stage.append(node("p", "", `WAITING FOR ${current?.nickname || "THE NEXT PLAYER"}...`));
    }
    const voteRequests = Number(state.vote_request_count) || 0;
    const threshold = Math.floor(snapshot.players.length / 2) + 1;
    const requested = (state.vote_requests || []).includes(session?.user.id);
    const requestButton = actionButton(requested ? `VOTE REQUESTED ${voteRequests} / ${threshold}` : `REQUEST VOTE ${voteRequests} / ${threshold}`,
      () => perform("anime_imposter_request_vote", { p_room_id: roomId }));
    requestButton.disabled = requested;
    const actions = node("div", "imposter-stage-actions");
    actions.append(requestButton);
    stage.append(actions);
  }
  function renderVoting() {
    const state = snapshot.state;
    const tied = snapshot.room.phase === "revote";
    stage.append(panelHeading(tied ? "REVOTE // BREAK THE TIE" : "WHO IS THE IMPOSTOR?", "Select one player. Your vote stays hidden until every vote is locked."));
    stage.append(node("p", "", `VOTES CAST // ${state.votes_cast || 0} / ${snapshot.players.length}`));
    const grid = node("div", "imposter-vote-grid");
    snapshot.players.filter((player) => !tied || (state.tied_player_ids || []).includes(player.id)).forEach((player) => {
      const option = actionButton(player.nickname, () => {
        selectedVote = player.id;
        grid.querySelectorAll("button").forEach((button) => button.setAttribute("aria-pressed", String(button.dataset.playerId === selectedVote)));
        confirm.disabled = false;
      });
      option.className = "imposter-vote-option";
      option.dataset.playerId = player.id;
      option.setAttribute("aria-pressed", "false");
      grid.append(option);
    });
    stage.append(grid);
    const alreadyVoted = Boolean(snapshot.my_vote);
    const confirm = actionButton(alreadyVoted ? "VOTE LOCKED" : "CONFIRM VOTE", () => {
      if (selectedVote) perform("anime_imposter_vote", { p_room_id: roomId, p_target: selectedVote });
    }, "main-button");
    confirm.disabled = alreadyVoted;
    if (alreadyVoted) stage.append(node("p", "", "VOTE LOCKED // WAITING FOR OTHER PLAYERS"));
    stage.append(confirm);
  }
  function renderVoteResults() {
    stage.append(panelHeading("VOTES REVEALED", "All votes are now visible."));
    const results = node("div", "imposter-results");
    (snapshot.state.vote_results || []).forEach((vote) => results.append(node("div", "imposter-result-vote", `${vote.voter}  →  ${vote.target}`)));
    stage.append(results);
    if ((snapshot.state.tied_player_ids || []).length > 1) {
      stage.append(node("p", "", Number(snapshot.state.vote_stage) >= 1
        ? "REVOTE ALSO TIED // IMPOSTOR SURVIVES"
        : "TIE // REVOTE BETWEEN THE HIGHLIGHTED PLAYERS"));
    }
    stage.append(actionButton("CONTINUE", () => perform("anime_imposter_resolve_votes", { p_room_id: roomId }), "main-button"));
  }
  function renderFinalGuess() {
    stage.append(panelHeading("FINAL CHANCE", "The impostor escaped the vote. Can they name the character?"));
    if (snapshot.my_role !== "impostor") {
      stage.append(node("p", "", "THE IMPOSTOR IS MAKING THEIR FINAL GUESS..."));
      return;
    }
    const form = node("form", "imposter-guess-form");
    const input = node("input", "imposter-word-input");
    input.type = "text";
    input.maxLength = 80;
    input.autocomplete = "off";
    input.required = true;
    input.setAttribute("aria-label", "Guess the anime character");
    input.placeholder = "CHARACTER NAME";
    const submit = actionButton("SUBMIT FINAL GUESS", () => {}, "main-button");
    submit.type = "submit";
    form.append(input, submit);
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      if (!input.value.trim()) return;
      perform("anime_imposter_guess", { p_room_id: roomId, p_guess: input.value.trim() });
    });
    stage.append(form);
  }
  function renderGameOver() {
    const state = snapshot.state;
    const result = node("div", "imposter-role-card");
    result.append(node("small", "", "ROUND COMPLETE"));
    result.append(node("strong", "imposter-result-winner", state.result_message || "GAME OVER"));
    if (snapshot.revealed_character) {
      result.append(node("small", "", `THE CHARACTER WAS ${snapshot.revealed_character.name.toUpperCase()} // ${snapshot.revealed_character.anime.toUpperCase()}`));
    }
    if (snapshot.impostor_name) result.append(node("small", "", `THE IMPOSTOR WAS ${snapshot.impostor_name.toUpperCase()}`));
    stage.append(result);
    const votes = node("div", "imposter-results");
    (state.vote_results || []).forEach((vote) => votes.append(node("div", "imposter-result-vote", `${vote.voter}  →  ${vote.target}`)));
    stage.append(votes);
    const actions = node("div", "imposter-stage-actions");
    if (snapshot.room.host_id === session?.user.id) {
      actions.append(actionButton("PLAY AGAIN", () => perform("anime_imposter_again", { p_room_id: roomId, p_action: "play" }), "main-button"));
      actions.append(actionButton("RETURN TO LOBBY", () => perform("anime_imposter_again", { p_room_id: roomId, p_action: "lobby" })));
    } else {
      actions.append(node("p", "", "WAITING FOR THE HOST TO START ANOTHER ROUND."));
    }
    actions.append(actionButton("LEAVE GAME", leaveRoom, "text-button"));
    stage.append(actions);
  }
  function renderClock() {
    if (!snapshot || snapshot.room.phase !== "clue_phase") return;
    const state = snapshot.state;
    const turn = $("clueTimer");
    if (turn && state.turn_ends_at) {
      const seconds = Math.max(0, Math.ceil((new Date(state.turn_ends_at).getTime() - (Date.now() + serverOffset)) / 1000));
      turn.textContent = `TURN // ${seconds} SEC`;
      const warningAt = `${state.current_turn}:${seconds}`;
      if (seconds > 0 && seconds <= 5 && warningAt !== lastWarningAt) playTone(430, 0.07);
      lastWarningAt = seconds <= 5 ? warningAt : "";
    }
    const current = playerById(state.current_turn);
    if (current) $("phaseLabel").textContent = `CLUE PHASE // ${current.nickname.toUpperCase()} // ${state.game_ends_at ? Math.max(0, Math.ceil((new Date(state.game_ends_at).getTime() - (Date.now() + serverOffset)) / 1000)) : 0} SEC LEFT`;
  }
  async function perform(functionName, args, returnHomeOnSuccess = false) {
    try {
      await rpc(functionName, args);
      playTone(560, 0.07);
      if (returnHomeOnSuccess) {
        stopRoomLoops();
        roomId = null;
        snapshot = null;
        lastRenderSignature = "";
        roomPanel.classList.add("hidden");
        home.classList.remove("hidden");
      } else await refreshRoom();
    } catch (error) {
      say(userError(error), "error");
    }
  }
  async function createRoom() {
    try {
      const name = nickname();
      const room = await rpc("anime_imposter_create", {
        p_nickname: name,
        p_max_players: Number($("capacityInput").value),
        p_allow_final_guess: $("finalGuessInput").checked
      });
      await enterRoom(room.room_id, "ROOM CREATED // SHARE THE CODE WITH YOUR FRIENDS.");
    } catch (error) {
      say(userError(error), "error");
    }
  }
  async function joinRoom(codeValue = $("roomCodeInput").value) {
    try {
      const name = nickname();
      const id = await rpc("anime_imposter_join", { p_code: codeValue.trim().toUpperCase(), p_nickname: name });
      $("roomCodeInput").value = "";
      await enterRoom(id, "JOINED ROOM // WAITING FOR THE HOST.");
    } catch (error) {
      say(userError(error), "error");
    }
  }
  async function startMatchmaking() {
    try {
      const name = nickname();
      $("randomMatchButton").classList.add("hidden");
      $("cancelMatchButton").classList.remove("hidden");
      $("matchStatus").textContent = "SEARCHING FOR PLAYERS... // PREFER 4, START WITH 3";
      matchHandle = setInterval(async () => {
        try {
          const id = await rpc("anime_imposter_matchmake", {
            p_nickname: name,
            p_allow_final_guess: $("finalGuessInput").checked
          });
          if (id) {
            const queue = await rpc("anime_imposter_queue_count");
            beginMatchedRoom(id, queue.players_found);
            return;
          }
          const queue = await rpc("anime_imposter_queue_count");
          $("matchStatus").textContent = `PLAYERS FOUND // ${queue.players_found} / 4`;
        } catch (error) {
          clearInterval(matchHandle);
          matchHandle = null;
          $("randomMatchButton").classList.remove("hidden");
          $("cancelMatchButton").classList.add("hidden");
          say(userError(error), "error");
        }
      }, 2000);
      try {
        const id = await rpc("anime_imposter_matchmake", {
          p_nickname: name,
          p_allow_final_guess: $("finalGuessInput").checked
        });
        if (id) {
          $("cancelMatchButton").classList.add("hidden");
          const queue = await rpc("anime_imposter_queue_count");
          beginMatchedRoom(id, queue.players_found);
        }
      } catch (error) {
        clearInterval(matchHandle);
        matchHandle = null;
        $("randomMatchButton").classList.remove("hidden");
        $("cancelMatchButton").classList.add("hidden");
        say(userError(error), "error");
      }
    } catch (error) {
      say(userError(error), "error");
    }
  }
  function beginMatchedRoom(id, playerCount = 3) {
    if (matchCountdownHandle) return;
    if (matchHandle) clearInterval(matchHandle);
    matchHandle = null;
    $("cancelMatchButton").classList.add("hidden");
    $("matchStatus").textContent = `MATCH FOUND // ${playerCount} PLAYERS`;
    let seconds = 3;
    matchCountdownHandle = setInterval(async () => {
      seconds -= 1;
      $("matchStatus").textContent = seconds > 0 ? `GAME STARTING // ${seconds}` : "GAME STARTING...";
      if (seconds <= 0) {
        clearInterval(matchCountdownHandle);
        matchCountdownHandle = null;
        try {
          await enterRoom(id, "MATCH FOUND // GAME STARTING.");
          if (snapshot?.room.host_id === session.user.id && snapshot.room.phase === "lobby") {
            await perform("anime_imposter_start", { p_room_id: id });
          }
        } catch (error) { say(userError(error), "error"); }
      }
    }, 1000);
  }
  async function cancelMatchmaking() {
    if (matchHandle) clearInterval(matchHandle);
    if (matchCountdownHandle) clearInterval(matchCountdownHandle);
    matchHandle = null;
    matchCountdownHandle = null;
    try {
      await rpc("anime_imposter_cancel_match");
      $("randomMatchButton").classList.remove("hidden");
      $("cancelMatchButton").classList.add("hidden");
      $("matchStatus").textContent = "";
      say("MATCHMAKING CANCELLED.");
    } catch (error) {
      if (String(error?.message || "").toUpperCase().includes("MATCH ALREADY FOUND")) {
        try {
          const id = await rpc("anime_imposter_matchmake", {
            p_nickname: nickname(),
            p_allow_final_guess: $("finalGuessInput").checked
          });
          if (id) {
            const count = await rpc("anime_imposter_queue_count");
            beginMatchedRoom(id, count.players_found);
            return;
          }
        } catch (matchError) {
          say(userError(matchError), "error");
          return;
        }
      }
      say(userError(error), "error");
    }
  }
  async function leaveRoom() {
    if (!window.confirm("LEAVE THIS GAME?")) return;
    await perform("anime_imposter_leave", { p_room_id: roomId }, true);
  }
  async function copyCode() {
    try {
      await navigator.clipboard.writeText(snapshot.room.code);
      say("ROOM CODE COPIED.", "success");
    } catch (_) { say("COPY FAILED // SELECT THE ROOM CODE TO COPY IT.", "error"); }
  }
  async function copyInvite() {
    const url = new URL("anime-imposter.html", window.location.href);
    url.searchParams.set("room", snapshot.room.code);
    try {
      await navigator.clipboard.writeText(url.href);
      say("INVITE LINK COPIED.", "success");
    } catch (_) { say("COPY FAILED // SHARE THE ROOM CODE INSTEAD.", "error"); }
  }
  async function restoreRoom() {
    if (!configured) {
      say("ONLINE PLAY NEEDS SUPABASE CONFIGURATION. ADD THE PROJECT URL AND ANON KEY IN SCRIPT.JS.", "error");
      return;
    }
    try {
      await ensureSession();
      const rows = await db.from("anime_imposter_players").select("room_id,joined_at").eq("player_id", session.user.id).order("joined_at", { ascending: false }).limit(1);
      if (rows.error) throw rows.error;
      if (rows.data?.length) await enterRoom(rows.data[0].room_id, "RECONNECTED TO YOUR ROOM.");
      else {
        const queue = await db.from("anime_imposter_queue").select("room_id,nickname").eq("player_id", session.user.id).maybeSingle();
        if (queue.error) throw queue.error;
        if (queue.data) {
          $("nicknameInput").value = queue.data.nickname;
          localStorage.setItem("aniviaNickname", queue.data.nickname);
          if (queue.data.room_id) {
            const count = await rpc("anime_imposter_queue_count");
            beginMatchedRoom(queue.data.room_id, count.players_found);
          } else await startMatchmaking();
        }
      }
    } catch (error) {
      say(userError(error), "error");
    }
  }

  $("nicknameInput").value = localStorage.getItem("aniviaNickname") || "";
  $("createRoomButton").addEventListener("click", createRoom);
  $("joinRoomButton").addEventListener("click", () => joinRoom());
  $("randomMatchButton").addEventListener("click", startMatchmaking);
  $("cancelMatchButton").addEventListener("click", cancelMatchmaking);
  $("leaveRoomButton").addEventListener("click", leaveRoom);
  $("copyCodeButton").addEventListener("click", copyCode);
  $("copyInviteButton").addEventListener("click", copyInvite);
  $("soundToggle").addEventListener("click", () => {
    soundEnabled = !soundEnabled;
    localStorage.setItem("animeImposterSound", String(soundEnabled));
    updateSoundControl();
    if (soundEnabled) playTone();
  });
  $("howToPlayButton").addEventListener("click", () => {
    const expanded = $("howToPlayButton").getAttribute("aria-expanded") === "true";
    $("howToPlayButton").setAttribute("aria-expanded", String(!expanded));
    $("howToPlay").classList.toggle("hidden", expanded);
  });
  $("roomCodeInput").addEventListener("input", (event) => { event.target.value = event.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 5); });
  $("roomCodeInput").addEventListener("keydown", (event) => { if (event.key === "Enter") { event.preventDefault(); joinRoom(); } });
  updateSoundControl();

  const pathMatch = window.location.pathname.match(/\/join\/([A-Z2-9]{5})\/?$/i);
  const inviteCode = new URLSearchParams(window.location.search).get("room") || pathMatch?.[1];
  if (inviteCode) {
    $("roomCodeInput").value = inviteCode.toUpperCase();
    if (configured && $("nicknameInput").value.trim()) setTimeout(() => joinRoom(inviteCode), 0);
    else if (configured) say("INVITE READY // ENTER YOUR NICKNAME TO JOIN.");
  }
  if (!inviteCode) restoreRoom();
  window.addEventListener("beforeunload", stopRoomLoops);
})();
