(() => {
  if (document.querySelector(".chat-widget-root")) return;
  const root = document.createElement("div");
  root.className = "chat-widget-root";
  root.innerHTML = `<button class="chat-launcher" type="button" aria-label="Open messages"><span>▰</span><b class="chat-unread hidden">0</b></button><section class="chat-panel hidden" aria-label="Messages"><header class="chat-panel-header"><div><span class="pixel-label">// PRIVATE SIGNAL</span><h2>MESSAGES</h2></div><button class="chat-close" type="button" aria-label="Close messages">×</button></header><div class="chat-search-wrap"><input class="chat-search" type="search" placeholder="Search messages/users..." aria-label="Search messages and users"></div><div class="chat-body"><div class="chat-conversations"></div><div class="chat-thread hidden"><header class="chat-thread-header"><button class="chat-back" type="button" aria-label="Back to conversations">←</button><span class="chat-avatar">--</span><div><strong class="chat-contact-name">CONTACT</strong><small class="chat-contact-status">OFFLINE</small></div><button class="chat-thread-close" type="button" aria-label="Close conversation">×</button></header><div class="chat-messages"></div><div class="chat-typing hidden">CONTACT IS TYPING...</div><form class="chat-compose"><button class="chat-attach" type="button" aria-label="Attach image">+</button><input class="chat-input" type="text" maxlength="1000" placeholder="Type a message..." autocomplete="off"><button class="chat-send" type="submit">SEND</button></form></div></div><p class="chat-status" role="status"></p></section>`;
  document.body.appendChild(root);

  const launcher = root.querySelector(".chat-launcher");
  const panel = root.querySelector(".chat-panel");
  const close = root.querySelector(".chat-close");
  const back = root.querySelector(".chat-back");
  const threadClose = root.querySelector(".chat-thread-close");
  const conversations = root.querySelector(".chat-conversations");
  const thread = root.querySelector(".chat-thread");
  const messages = root.querySelector(".chat-messages");
  const compose = root.querySelector(".chat-compose");
  const input = root.querySelector(".chat-input");
  const search = root.querySelector(".chat-search");
  const status = root.querySelector(".chat-status");
  const unread = root.querySelector(".chat-unread");
 const configured = true;
  let db = null;
  let user = null;
  let activeConversation = null;
  let subscription = null;
  let conversationData = [];

  function setStatus(message, error = false) { status.textContent = message; status.className = `chat-status${error ? " error" : ""}`; }
  function toggle(open) { panel.classList.toggle("hidden", !open); if (open && !configured) setStatus("MESSAGING NEEDS SUPABASE CONFIGURATION.", true); if (open && configured) loadConversations(); }
  function avatar(name = "--") { return name.slice(0, 2).toUpperCase(); }
  function renderConversations(items = conversationData) {
    if (!items.length) { conversations.innerHTML = `<div class="chat-empty">NO CONVERSATIONS YET.<br>ADD A FRIEND TO START CHATTING.</div>`; return; }
    conversations.innerHTML = items.map((item) => `<button class="chat-conversation" type="button" data-id="${item.id}"><span class="chat-avatar">${avatar(item.name)}</span><span class="chat-conversation-copy"><strong>${item.name}</strong><small>${item.last_message || "No messages yet"}</small></span><time>${item.last_time || ""}</time>${item.unread ? `<b class="chat-row-unread">${item.unread}</b>` : ""}</button>`).join("");
  }
  function renderMessages(items) {
    messages.innerHTML = items.length ? items.map((item) => `<article class="chat-message ${item.sender_id === user?.id ? "own" : "incoming"}"><p>${escapeHtml(item.message_text)}</p><small>${new Date(item.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}${item.read_at ? " // READ" : ""}</small></article>`).join("") : `<div class="chat-empty">NO SIGNALS YET. SAY HELLO.</div>`;
    messages.scrollTop = messages.scrollHeight;
  }
  function escapeHtml(value) { return String(value).replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[character])); }
  async function ensureUser() { const sessionResult = await db.auth.getSession(); user = sessionResult.data.session?.user || (await db.auth.signInAnonymously()).data.session.user; return user; }
  async function loadConversations() {
    try { await ensureUser(); const result = await db.rpc("list_my_conversations"); if (result.error) throw result.error; conversationData = result.data || []; renderConversations(); setStatus(""); } catch (error) { setStatus(error.message, true); }
  }
  async function openConversation(id) {
    if (!db) return;
    try { activeConversation = conversationData.find((item) => item.id === id); if (!activeConversation) return; thread.classList.remove("hidden"); conversations.classList.add("hidden"); root.querySelector(".chat-contact-name").textContent = activeConversation.name; root.querySelector(".chat-contact-status").textContent = activeConversation.online ? "ONLINE" : `LAST SEEN ${activeConversation.last_seen || "RECENTLY"}`; root.querySelector(".chat-avatar").textContent = avatar(activeConversation.name); const result = await db.rpc("list_conversation_messages", { p_conversation_id: id }); if (result.error) throw result.error; renderMessages(result.data || []); await db.rpc("mark_conversation_read", { p_conversation_id: id }); subscribeToConversation(id); } catch (error) { setStatus(error.message, true); }
  }
  function subscribeToConversation(id) { if (subscription) db.removeChannel(subscription); subscription = db.channel(`chat-${id}`).on("postgres_changes", { event: "INSERT", schema: "public", table: "social_messages", filter: `conversation_id=eq.${id}` }, () => openConversation(id)).subscribe(); }
  compose.addEventListener("submit", async (event) => { event.preventDefault(); const message = input.value.trim(); if (!message || !activeConversation || !db) return; try { const result = await db.rpc("send_social_message", { p_conversation_id: activeConversation.id, p_message_text: message }); if (result.error) throw result.error; input.value = ""; await openConversation(activeConversation.id); } catch (error) { setStatus(error.message, true); } });
  conversations.addEventListener("click", (event) => { const row = event.target.closest("[data-id]"); if (row) openConversation(row.dataset.id); });
  search.addEventListener("input", () => { const query = search.value.toLowerCase(); renderConversations(conversationData.filter((item) => item.name.toLowerCase().includes(query) || (item.last_message || "").toLowerCase().includes(query))); });
  launcher.addEventListener("click", () => toggle(panel.classList.contains("hidden"))); close.addEventListener("click", () => toggle(false)); back.addEventListener("click", () => { thread.classList.add("hidden"); conversations.classList.remove("hidden"); activeConversation = null; }); threadClose.addEventListener("click", () => { thread.classList.add("hidden"); conversations.classList.remove("hidden"); activeConversation = null; });
  window.openAniviaChat = (conversationId) => { toggle(true); if (conversationId) openConversation(conversationId); };
  if (configured) loadConversations();
})();
