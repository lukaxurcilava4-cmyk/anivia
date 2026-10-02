(() => {
  const supabaseConfig = { url: "https://YOUR-PROJECT.supabase.co", anonKey: "YOUR_SUPABASE_ANON_KEY" };
  const clientFactory = window.supabase?.createClient;
  const configured = clientFactory && !supabaseConfig.url.includes("YOUR-") && !supabaseConfig.anonKey.includes("YOUR_");
  const db = configured ? clientFactory(supabaseConfig.url, supabaseConfig.anonKey) : null;
  const list = document.getElementById("friendsList");
  const notice = document.getElementById("friendsNotice");
  const search = document.getElementById("friendSearch");
  const tabs = [...document.querySelectorAll(".friends-tab")];
  let view = "friends";
  let sessionUser = null;
  let realtimeChannel = null;

  const demoData = {
    friends: [
      { id: "demo-1", username: "NEON_SENPAI", level: 28, bio: "First episodes, final forms, neon nights.", status: "online", mutuals: 3, active: "Active now" },
      { id: "demo-2", username: "PIXEL_KAGE", level: 19, bio: "Anime games and impossible guesses.", status: "away", mutuals: 1, active: "12m ago" },
      { id: "demo-3", username: "MOONFRAME", level: 34, bio: "Openings, art, and midnight ramen.", status: "offline", mutuals: 5, active: "2h ago" }
    ],
    requests: [{ id: "demo-4", username: "CYBER_MIKA", level: 12, bio: "Looking for a co-op rival.", status: "online", mutuals: 2, active: "Active now" }],
    sent: [{ id: "demo-5", username: "NOVA_DAVID", level: 21, bio: "Hunter x Hunter archivist.", status: "offline", mutuals: 0, active: "Yesterday" }],
    notifications: [{ id: "notice-1", username: "CYBER_MIKA", text: "sent you a friend request", time: "2m ago" }]
  };

  function showNotice(message, error = false) { notice.textContent = message; notice.className = `friends-notice${error ? " error" : ""}`; }
  function currentItems() { return demoData[view] || []; }
  function render() {
    const query = (search.value || "").toLowerCase().trim();
    const items = currentItems().filter((item) => `${item.username} ${item.bio || item.text || ""}`.toLowerCase().includes(query));
    if (!items.length) { list.innerHTML = `<div class="friends-empty">NO SIGNALS IN THIS CHANNEL.</div>`; return; }
    list.innerHTML = items.map((item) => view === "notifications" ? `<article class="friend-notification-card"><span class="social-avatar">${item.username.slice(0, 2)}</span><div><strong>${item.username}</strong> <span>${item.text}</span><small>${item.time}</small></div><div class="friend-actions"><button class="main-button" data-action="accept" data-id="${item.id}" type="button">ACCEPT</button><button class="outline-button" data-action="decline" data-id="${item.id}" type="button">DECLINE</button></div></article>` : `<article class="friend-card"><div class="friend-card-top"><span class="social-avatar">${item.username.slice(0, 2)}</span><span class="friend-status ${item.status}">${item.status}</span></div><strong class="friend-name">${item.username}</strong><span class="friend-level">LVL ${item.level} // ${item.mutuals} MUTUAL FRIENDS</span><p>${item.bio}</p><small>LAST ACTIVE: ${item.active}</small><div class="friend-actions"><button class="outline-button" data-action="profile" data-id="${item.id}" type="button">VIEW PROFILE</button>${view === "friends" ? `<button class="outline-button" data-action="remove" data-id="${item.id}" type="button">REMOVE</button>` : view === "requests" ? `<button class="main-button" data-action="accept" data-id="${item.id}" type="button">ACCEPT</button><button class="outline-button" data-action="decline" data-id="${item.id}" type="button">DECLINE</button>` : `<button class="outline-button" data-action="cancel" data-id="${item.id}" type="button">CANCEL</button>`}</div></article>`).join("");
  }
  function updateCounts() { document.getElementById("friendCount").textContent = demoData.friends.length; document.getElementById("requestCount").textContent = demoData.requests.length; document.getElementById("sentCount").textContent = demoData.sent.length; document.getElementById("notificationCount").textContent = demoData.notifications.length; const badge = document.getElementById("friendNotificationBadge"); badge.textContent = demoData.notifications.length; badge.classList.toggle("hidden", !demoData.notifications.length); }
  async function ensureSession() { if (!db) return null; const result = await db.auth.getSession(); sessionUser = result.data.session?.user || (await db.auth.signInAnonymously()).data.session.user; return sessionUser; }
  async function performRemote(action, targetId) { if (!db) return false; await ensureSession(); const calls = { accept: () => db.rpc("accept_friend_request", { p_request_id: targetId }), decline: () => db.rpc("decline_friend_request", { p_request_id: targetId }), remove: () => db.rpc("remove_friend", { p_friend_id: targetId }), cancel: () => db.rpc("cancel_friend_request", { p_request_id: targetId }) }; const result = await calls[action](); if (result.error) throw result.error; return true; }
  async function action(action, id) { try { await performRemote(action, id); if (view === "requests" && action === "accept") demoData.friends.push(demoData.requests.find((item) => item.id === id)); if (["accept", "decline"].includes(action)) demoData.requests = demoData.requests.filter((item) => item.id !== id); if (action === "cancel") demoData.sent = demoData.sent.filter((item) => item.id !== id); if (action === "remove") demoData.friends = demoData.friends.filter((item) => item.id !== id); if (action === "accept") demoData.notifications = demoData.notifications.filter((item) => item.id !== id); updateCounts(); render(); showNotice(db ? "FRIEND STATUS UPDATED." : "DEMO ACTION COMPLETE. CONNECT SUPABASE FOR PERSISTENT FRIENDS."); } catch (error) { showNotice(error.message, true); } }
  document.querySelectorAll(".friends-tab").forEach((tab) => tab.addEventListener("click", () => { view = tab.dataset.view; tabs.forEach((item) => item.classList.toggle("active", item === tab)); render(); }));
  list.addEventListener("click", (event) => { const button = event.target.closest("[data-action]"); if (button) action(button.dataset.action, button.dataset.id); });
  search.addEventListener("input", render); document.getElementById("refreshFriends").addEventListener("click", () => { render(); showNotice("FRIEND SIGNALS REFRESHED."); });
  if (db) { db.channel("friend-events").on("postgres_changes", { event: "*", schema: "public", table: "social_friend_requests" }, () => { showNotice("FRIEND REQUESTS UPDATED IN REAL TIME."); render(); }).subscribe(); }
  updateCounts(); render();
  if (!configured) showNotice("DEMO MODE. ADD SUPABASE CONFIG TO ENABLE REAL FRIENDS.", true);
})();
