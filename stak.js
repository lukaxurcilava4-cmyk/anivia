/* STAK coin system: wallet, shop, inventory and cosmetics.
   Uses Supabase (RPCs + Stripe Checkout edge function) when configured, otherwise a local demo mode. */
(() => {
  const PACKS = [
    { id: "pack-1500", stak: 1500, price: "$10", label: "STARTER" },
    { id: "pack-2500", stak: 2500, price: "$15", label: "POPULAR", bonus: "+11% value" },
    { id: "pack-10000", stak: 10000, price: "$50", label: "LEGEND", bonus: "+33% value" }
  ];

  const ITEMS = [
    { id: "frame-neon", kind: "frame", name: "NEON SIGNAL", description: "Bright neon city-signal avatar border.", price: 250, rarity: "common" },
    { id: "frame-sakura", kind: "frame", name: "SAKURA GLOW", description: "Soft pink petal glow around your avatar.", price: 400, rarity: "rare" },
    { id: "frame-glitch", kind: "frame", name: "GLITCH PIXEL", description: "Animated glitch border with retro pixels.", price: 500, rarity: "rare" },
    { id: "frame-gold", kind: "frame", name: "CYBER GOLD", description: "Solid gold arcade champion border.", price: 800, rarity: "epic" },
    { id: "frame-flame", kind: "frame", name: "FLAME AURA", description: "Burning aura for true legends.", price: 1200, rarity: "legendary" },
    { id: "badge-early", kind: "badge", name: "EARLY PLAYER", description: "Show you were here at the start.", price: 150, rarity: "common", glyph: "◆" },
    { id: "badge-otaku", kind: "badge", name: "OTAKU", description: "For fans who never skip an opening.", price: 200, rarity: "common", glyph: "♥" },
    { id: "badge-draft", kind: "badge", name: "DRAFT KING", description: "Rule the Anime Draft arena.", price: 300, rarity: "rare", glyph: "♛" },
    { id: "badge-hunter", kind: "badge", name: "IMPOSTER HUNTER", description: "Sniff out every Anime Imposter.", price: 300, rarity: "rare", glyph: "?" },
    { id: "badge-vip", kind: "badge", name: "VIP", description: "Golden VIP badge next to your name.", price: 1000, rarity: "legendary", glyph: "★" },
    { id: "nick-hacker", kind: "nickname", name: "HACKER TAG", description: "Glowing retro frame around your nickname.", price: 600, rarity: "rare" },
    { id: "nick-neon", kind: "nickname", name: "NEON TUBE", description: "Pink neon tube nickname glow.", price: 450, rarity: "rare" },
    { id: "bg-cyber", kind: "background", name: "CYBER CITY", description: "Living neon city profile background.", price: 400, rarity: "rare" },
    { id: "bg-grid", kind: "background", name: "RETRO GRID", description: "Black and purple synthwave grid background.", price: 350, rarity: "common" }
  ];
  const ITEM_MAP = Object.fromEntries(ITEMS.map((item) => [item.id, item]));

  const TABS = [
    { id: "packs", label: "BUY STAK" },
    { id: "frames", label: "FRAMES", kind: "frame" },
    { id: "badges", label: "BADGES", kind: "badge" },
    { id: "nicknames", label: "NICKNAMES", kind: "nickname" },
    { id: "backgrounds", label: "BACKGROUNDS", kind: "background" },
    { id: "inventory", label: "INVENTORY" }
  ];

  const KIND_LABEL = { frame: "PROFILE FRAME", badge: "BADGE", nickname: "NICKNAME FX", background: "PROFILE BACKGROUND" };
  const ERRORS = {
    NOT_ENOUGH_STAK: "NOT ENOUGH STAK. TOP UP FIRST.",
    ALREADY_OWNED: "YOU ALREADY OWN THIS ITEM.",
    ITEM_NOT_FOUND: "ITEM NOT FOUND.",
    NOT_OWNED: "YOU DON'T OWN THIS ITEM.",
    BADGE_LIMIT: "MAX 3 BADGES EQUIPPED. UNEQUIP ONE FIRST.",
    NOT_AUTHENTICATED: "SIGN-IN FAILED. RELOAD THE PAGE.",
    PAYMENTS_NOT_CONFIGURED: "PAYMENTS ARE NOT SET UP YET.",
    CHECKOUT_FAILED: "COULD NOT START CHECKOUT. TRY AGAIN."
  };

  const cacheKey = "aniviaStakCache";
  const demoKey = "aniviaStakDemo";
  const config = window.ANIVIA_SUPABASE_CONFIG || {};
  const online = Boolean(config.url && config.anonKey && !/YOUR-PROJECT|YOUR_SUPABASE/.test(config.url + config.anonKey));

  const fmt = (n) => Number(n || 0).toLocaleString();
  const esc = (value) => String(value).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const starSvg = '<img class="stak-star" src="assets/pk-big.png" alt="" aria-hidden="true">';

  let state = { balance: 0, inventory: [] };
  let client = null;
  const listeners = [];

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const el = document.createElement("script");
      el.src = src;
      el.onload = resolve;
      el.onerror = reject;
      document.head.appendChild(el);
    });
  }

  async function getClient() {
    if (client) return client;
    if (!window.supabase) await loadScript("https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2");
    client = window.supabase.createClient(config.url, config.anonKey);
    const { data } = await client.auth.getSession();
    if (!data.session) {
      const { error } = await client.auth.signInAnonymously();
      if (error) throw new Error("NOT_AUTHENTICATED");
    }
    return client;
  }

  function demoLoad() {
    try { return JSON.parse(localStorage.getItem(demoKey)) || { balance: 0, inventory: [] }; } catch { return { balance: 0, inventory: [] }; }
  }
  function demoSave(next) { localStorage.setItem(demoKey, JSON.stringify(next)); return next; }

  function setState(next) {
    state = { balance: Number(next.balance) || 0, inventory: next.inventory || [] };
    if (online) localStorage.setItem(cacheKey, JSON.stringify(state));
    applyCosmetics();
    listeners.forEach((fn) => fn(state));
  }

  async function rpc(name, args) {
    const c = await getClient();
    const { data, error } = await c.rpc(name, args);
    if (error) throw new Error((error.message.match(/[A-Z_]{6,}/) || ["REQUEST_FAILED"])[0]);
    return data;
  }

  async function refresh() {
    if (!online) return setState(demoLoad());
    return setState(await rpc("stak_get_state"));
  }

  async function buy(itemId) {
    const item = ITEM_MAP[itemId];
    if (!item) throw new Error("ITEM_NOT_FOUND");
    if (!online) {
      const demo = demoLoad();
      if (demo.inventory.some((e) => e.item_id === itemId)) throw new Error("ALREADY_OWNED");
      if (demo.balance < item.price) throw new Error("NOT_ENOUGH_STAK");
      demo.balance -= item.price;
      demo.inventory.push({ item_id: itemId, equipped: false });
      return setState(demoSave(demo));
    }
    return setState(await rpc("stak_purchase_item", { p_item_id: itemId }));
  }

  async function equip(itemId, equipped) {
    const item = ITEM_MAP[itemId];
    if (!item) throw new Error("ITEM_NOT_FOUND");
    if (!online) {
      const demo = demoLoad();
      const entry = demo.inventory.find((e) => e.item_id === itemId);
      if (!entry) throw new Error("NOT_OWNED");
      if (equipped) {
        if (item.kind === "badge") {
          const count = demo.inventory.filter((e) => e.equipped && ITEM_MAP[e.item_id]?.kind === "badge" && e.item_id !== itemId).length;
          if (count >= 3) throw new Error("BADGE_LIMIT");
        } else {
          demo.inventory.forEach((e) => { if (ITEM_MAP[e.item_id]?.kind === item.kind) e.equipped = false; });
        }
      }
      entry.equipped = Boolean(equipped);
      return setState(demoSave(demo));
    }
    return setState(await rpc("stak_set_equipped", { p_item_id: itemId, p_equipped: Boolean(equipped) }));
  }

  async function checkout(packId) {
    if (!PACKS.some((p) => p.id === packId)) throw new Error("ITEM_NOT_FOUND");
    if (!online) throw new Error("PAYMENTS_NOT_CONFIGURED");
    const c = await getClient();
    const { data, error } = await c.functions.invoke("stak-checkout", { body: { packId } });
    if (error || !data?.url) throw new Error(data?.error || "CHECKOUT_FAILED");
    localStorage.setItem("aniviaStakBefore", String(state.balance));
    window.location.href = data.url;
  }

  // Demo only: free test STAK so the shop can be tried without Supabase/Stripe.
  function demoGrant(amount) {
    const demo = demoLoad();
    demo.balance += amount;
    setState(demoSave(demo));
  }

  const isOwned = (id) => state.inventory.some((e) => e.item_id === id);
  const isEquipped = (id) => state.inventory.some((e) => e.item_id === id && e.equipped);

  /* ---------- cosmetics on profile ---------- */
  function applyCosmetics() {
    const avatar = document.getElementById("profileAvatar");
    const name = document.getElementById("profileName");
    const card = document.querySelector(".profile-card");
    if (!avatar && !name) return;
    const equipped = state.inventory.filter((e) => e.equipped).map((e) => ITEM_MAP[e.item_id]).filter(Boolean);
    const pick = (kind) => equipped.find((i) => i.kind === kind);
    const strip = (el, prefix) => { el.className = el.className.replace(new RegExp(`\\bstak-${prefix}-\\S+`, "g"), "").trim(); };

    if (avatar) {
      strip(avatar, "frame");
      const frame = pick("frame");
      if (frame) avatar.classList.add(`stak-${frame.id}`);
    }
    if (name) {
      strip(name, "nick");
      const nick = pick("nickname");
      if (nick) name.classList.add(`stak-${nick.id}`);
      let badges = document.getElementById("stakBadges");
      if (!badges) {
        badges = document.createElement("div");
        badges.id = "stakBadges";
        badges.className = "stak-badges";
        name.insertAdjacentElement("afterend", badges);
      }
      badges.innerHTML = equipped.filter((i) => i.kind === "badge").map((i) => `<span class="stak-badge rarity-${i.rarity}" title="${esc(i.name)}"><b>${esc(i.glyph)}</b>${esc(i.name)}</span>`).join("");
    }
    if (card) {
      strip(card, "bg");
      const bg = pick("background");
      if (bg) card.classList.add(`stak-${bg.id}`);
    }
  }

  /* ---------- UI helpers ---------- */
  function preview(item) {
    if (item.kind === "frame") return `<div class="stak-avatar stak-${item.id}">YOU</div>`;
    if (item.kind === "badge") return `<span class="stak-badge big rarity-${item.rarity}"><b>${esc(item.glyph)}</b>${esc(item.name)}</span>`;
    if (item.kind === "nickname") return `<span class="stak-nick-sample stak-${item.id}">PLAYER</span>`;
    return `<div class="stak-bg-sample stak-${item.id}"></div>`;
  }

  const priceTag = (price) => `<span class="stak-price">${starSvg}<b>${fmt(price)}</b></span>`;

  function actionButton(item) {
    if (!isOwned(item.id)) return `<button class="shop-buy" type="button" data-buy="${item.id}">BUY // ${fmt(item.price)} STAK</button>`;
    const on = isEquipped(item.id);
    return `<button class="shop-buy owned" type="button" data-equip="${item.id}" data-on="${on ? 1 : 0}">${on ? "UNEQUIP" : "EQUIP"}</button>`;
  }

  function itemCard(item) {
    return `<article class="shop-item stak-item rarity-${item.rarity}">
      <a class="shop-item-art stak-art" href="shop-item.html?item=${item.id}" aria-label="View ${esc(item.name)}">${preview(item)}</a>
      <span class="shop-item-type">${KIND_LABEL[item.kind]} // ${item.rarity.toUpperCase()}</span>
      <h2>${esc(item.name)}</h2>
      <p>${esc(item.description)}</p>
      ${isOwned(item.id) ? '<span class="stak-owned">✓ OWNED</span>' : priceTag(item.price)}
      ${actionButton(item)}
    </article>`;
  }

  function packCard(pack) {
    return `<article class="shop-item stak-pack">
      <div class="shop-item-art stak-art stak-pack-art">${starSvg}<strong>${fmt(pack.stak)}</strong></div>
      <span class="shop-item-type">${pack.label}${pack.bonus ? " // " + pack.bonus : ""}</span>
      <h2>${fmt(pack.stak)} STAK</h2>
      <button class="shop-buy" type="button" data-pack="${pack.id}">BUY // ${pack.price}</button>
    </article>`;
  }

  async function run(button, action, okMessage, setStatus) {
    button.disabled = true;
    try {
      await action();
      setStatus(okMessage, false);
    } catch (error) {
      setStatus(ERRORS[error.message] || "SOMETHING WENT WRONG. TRY AGAIN.", true);
      button.disabled = false;
    }
  }

  function bindActions(root, setStatus) {
    root.querySelectorAll("[data-buy]").forEach((b) => b.addEventListener("click", () => run(b, () => buy(b.dataset.buy), "PURCHASED. EQUIP IT NOW.", setStatus)));
    root.querySelectorAll("[data-equip]").forEach((b) => b.addEventListener("click", () => run(b, () => equip(b.dataset.equip, b.dataset.on !== "1"), b.dataset.on === "1" ? "UNEQUIPPED." : "EQUIPPED.", setStatus)));
    root.querySelectorAll("[data-pack]").forEach((b) => b.addEventListener("click", () => run(b, () => checkout(b.dataset.pack), "REDIRECTING TO SECURE CHECKOUT...", setStatus)));
  }

  /* ---------- shop page ---------- */
  function initShop() {
    const panel = document.getElementById("stakPanel");
    if (!panel) return;
    const tabsEl = document.getElementById("stakTabs");
    const statusEl = document.getElementById("shopStatus");
    const balanceEl = document.getElementById("stakBalance");
    const params = new URLSearchParams(location.search);
    let tab = TABS.some((t) => t.id === params.get("tab")) ? params.get("tab") : "packs";

    const setStatus = (message, isError) => {
      statusEl.textContent = message;
      statusEl.classList.toggle("error", Boolean(isError));
    };

    function render() {
      balanceEl.textContent = fmt(state.balance);
      tabsEl.innerHTML = TABS.map((t) => `<button type="button" role="tab" class="stak-tab${t.id === tab ? " active" : ""}" data-tab="${t.id}" aria-selected="${t.id === tab}">${t.label}</button>`).join("");
      tabsEl.querySelectorAll("[data-tab]").forEach((b) => b.addEventListener("click", () => { tab = b.dataset.tab; setStatus("", false); render(); }));

      let html = "";
      if (tab === "packs") {
        html = `<div class="shop-grid">${PACKS.map(packCard).join("")}</div>`;
        if (!online) {
          html += `<div class="stak-demo"><strong>DEMO MODE</strong><span>Online payments aren't connected yet. This is a local test wallet on this device only.</span><button class="shop-buy" type="button" id="stakDemoGrant">GET 1,000 TEST STAK (FREE)</button></div>`;
        }
      } else if (tab === "inventory") {
        const owned = state.inventory.map((e) => ITEM_MAP[e.item_id]).filter(Boolean);
        html = owned.length ? `<div class="shop-grid">${owned.map(itemCard).join("")}</div>` : `<p class="stak-empty">YOUR INVENTORY IS EMPTY. <a href="shop.html?tab=frames">BROWSE THE SHOP</a></p>`;
      } else {
        const kind = TABS.find((t) => t.id === tab).kind;
        html = `<div class="shop-grid">${ITEMS.filter((i) => i.kind === kind).map(itemCard).join("")}</div>`;
      }
      panel.innerHTML = html;
      bindActions(panel, setStatus);
      const grant = document.getElementById("stakDemoGrant");
      if (grant) grant.addEventListener("click", () => { demoGrant(1000); setStatus("ADDED 1,000 TEST STAK.", false); });
    }

    listeners.push(render);
    render();

    if (params.get("stak") === "success") {
      setStatus("PAYMENT RECEIVED. UPDATING YOUR BALANCE...", false);
      const before = Number(localStorage.getItem("aniviaStakBefore") || 0);
      let tries = 0;
      const poll = async () => {
        tries += 1;
        try { await refresh(); } catch { /* retry */ }
        if (state.balance > before) {
          localStorage.removeItem("aniviaStakBefore");
          setStatus("STAK ADDED TO YOUR WALLET. ENJOY!", false);
        } else if (tries < 12) {
          setTimeout(poll, 2500);
        } else {
          setStatus("PAYMENT IS PROCESSING. YOUR STAK WILL APPEAR SHORTLY.", false);
        }
      };
      poll();
    } else if (params.get("stak") === "cancelled") {
      setStatus("CHECKOUT CANCELLED. NO CHARGE WAS MADE.", false);
    }
  }

  /* ---------- item page ---------- */
  function initItemPage() {
    const title = document.getElementById("itemTitle");
    const buyButton = document.getElementById("itemBuy");
    if (!title || !buyButton) return;
    const item = ITEM_MAP[new URLSearchParams(location.search).get("item")];
    const status = document.getElementById("itemStatus");
    if (!item) { title.textContent = "ITEM NOT FOUND"; buyButton.hidden = true; return; }

    document.getElementById("itemType").textContent = `${KIND_LABEL[item.kind]} // ${item.rarity.toUpperCase()}`;
    title.textContent = item.name;
    document.getElementById("itemDescription").textContent = item.description;
    document.getElementById("itemPreview").innerHTML = preview(item);
    document.getElementById("itemPrice").textContent = `${fmt(item.price)} STAK`;
    const balance = document.getElementById("itemBalance");

    const setStatus = (message, isError) => { status.textContent = message; status.classList.toggle("error", Boolean(isError)); };
    function render() {
      if (balance) balance.textContent = fmt(state.balance);
      buyButton.disabled = false;
      if (!isOwned(item.id)) { buyButton.textContent = "BUY ITEM"; buyButton.onclick = () => run(buyButton, () => buy(item.id), "PURCHASED!", setStatus); return; }
      const on = isEquipped(item.id);
      buyButton.textContent = on ? "UNEQUIP" : "EQUIP";
      buyButton.onclick = () => run(buyButton, () => equip(item.id, !on), on ? "UNEQUIPPED." : "EQUIPPED.", setStatus);
    }
    listeners.push(render);
    render();
  }

  /* ---------- profile page ---------- */
  function initProfile() {
    const card = document.querySelector(".profile-card");
    if (!card || !document.getElementById("profileName") || document.getElementById("stakProfileBar")) return;
    const bar = document.createElement("div");
    bar.id = "stakProfileBar";
    bar.className = "stak-profile-bar";
    bar.innerHTML = `<span class="stak-pill">${starSvg}<b id="stakProfileBalance">0</b> STAK</span><a class="stak-link" href="shop.html?tab=packs">BUY STAK</a><a class="stak-link" href="shop.html?tab=inventory">INVENTORY</a>`;
    card.appendChild(bar);
    listeners.push((s) => { document.getElementById("stakProfileBalance").textContent = fmt(s.balance); });
  }

  async function spend(amount) {
    if (!online) {
      const demo = demoLoad();
      if (demo.balance < amount) throw new Error("NOT_ENOUGH_STAK");
      demo.balance -= amount;
      return setState(demoSave(demo));
    }
    throw new Error("TICKETS_NOT_CONFIGURED");
  }

  window.aniviaStak = { refresh, buy, equip, checkout, spend, getClient, getState: () => state, online };

  if (online) { try { state = JSON.parse(localStorage.getItem(cacheKey)) || state; } catch { /* ignore */ } } else { state = demoLoad(); }

  const start = () => {
    initShop();
    initItemPage();
    initProfile();
    applyCosmetics();
    listeners.forEach((fn) => fn(state));
    refresh().catch(() => {});
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else start();
})();
