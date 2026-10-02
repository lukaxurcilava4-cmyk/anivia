console.log("ANIVIA SYSTEM ONLINE");

window.ANIVIA_SUPABASE_CONFIG = window.ANIVIA_SUPABASE_CONFIG || { url: "https://twuqlrmdnjqgbdidjcpa.supabase.co/", anonKey: "sb_publishable_SEJuLJtNiNaR3f6N26VBWA_Tjv9i..." };
if (!document.querySelector('script[data-anivia-chat]')) {
  const chatScript = document.createElement("script");
  chatScript.src = "chat-widget.js";
  chatScript.dataset.aniviaChat = "true";
  document.body.appendChild(chatScript);
}

const aniviaTranslations = {
  es: { HOME: "INICIO", ANIME: "ANIME", GAMES: "JUEGOS", SHOP: "TIENDA", LEADERBOARD: "CLASIFICACION", SETTINGS: "AJUSTES", SEARCH: "BUSCAR", PROFILE: "PERFIL", "CREATE POST": "CREAR PUBLICACION", "FAN FEED": "FEED DE FANS", "RECENT SIGNALS": "SENALES RECIENTES", HOT: "POPULAR", NEW: "NUEVO", TOP: "TOP", PLAY: "JUGAR", "PLAY NOW": "JUGAR AHORA", "BACK TO GAMES": "VOLVER A JUEGOS", "GAME OVER": "FIN DEL JUEGO", RETRY: "REINTENTAR", SCORE: "PUNTUACION", BEST: "MEJOR", ONLINE: "EN LINEA", LOCKED: "BLOQUEADO", SPIN: "GIRO", "NINJA RUNNER": "CORREDOR NINJA", "ANIME DRAFT": "ANIME DRAFT", "ANIME QUIZ": "QUIZ ANIME", LANGUAGE: "IDIOMA", "REDUCE MOTION": "REDUCIR MOVIMIENTO", "CRT EFFECT": "EFECTO CRT", "GAME SOUND": "SONIDO DEL JUEGO", "SETTINGS SAVED.": "AJUSTES GUARDADOS.", CANCEL: "CANCELAR", POST: "PUBLICAR" },
  fr: { HOME: "ACCUEIL", ANIME: "ANIME", GAMES: "JEUX", SHOP: "BOUTIQUE", LEADERBOARD: "CLASSEMENT", SETTINGS: "PARAMETRES", SEARCH: "RECHERCHER", PROFILE: "PROFIL", "CREATE POST": "CREER UN POST", "FAN FEED": "FIL DES FANS", "RECENT SIGNALS": "SIGNAUX RECENTS", HOT: "POPULAIRE", NEW: "NOUVEAU", TOP: "TOP", PLAY: "JOUER", "PLAY NOW": "JOUER", "BACK TO GAMES": "RETOUR AUX JEUX", "GAME OVER": "PARTIE TERMINEE", RETRY: "REESSAYER", SCORE: "SCORE", BEST: "RECORD", ONLINE: "EN LIGNE", LOCKED: "VERROUILLE", SPIN: "ROUE", "NINJA RUNNER": "NINJA RUNNER", "ANIME DRAFT": "ANIME DRAFT", "ANIME QUIZ": "QUIZ ANIME", LANGUAGE: "LANGUE", "REDUCE MOTION": "REDUIRE LES MOUVEMENTS", "CRT EFFECT": "EFFET CRT", "GAME SOUND": "SON DU JEU", "SETTINGS SAVED.": "PARAMETRES ENREGISTRES.", CANCEL: "ANNULER", POST: "PUBLIER" },
  de: { HOME: "START", ANIME: "ANIME", GAMES: "SPIELE", SHOP: "SHOP", LEADERBOARD: "RANGLISTE", SETTINGS: "EINSTELLUNGEN", SEARCH: "SUCHEN", PROFILE: "PROFIL", "CREATE POST": "BEITRAG ERSTELLEN", "FAN FEED": "FAN-FEED", "RECENT SIGNALS": "NEUE SIGNALE", HOT: "BELIEBT", NEW: "NEU", TOP: "TOP", PLAY: "SPIELEN", "PLAY NOW": "JETZT SPIELEN", "BACK TO GAMES": "ZURUCK ZU SPIELEN", "GAME OVER": "SPIEL VORBEI", RETRY: "NOCHMAL", SCORE: "PUNKTE", BEST: "BESTE", ONLINE: "ONLINE", LOCKED: "GESPERRT", SPIN: "DREHEN", "NINJA RUNNER": "NINJA RUNNER", "ANIME DRAFT": "ANIME DRAFT", "ANIME QUIZ": "ANIME-QUIZ", LANGUAGE: "SPRACHE", "REDUCE MOTION": "BEWEGUNG REDUZIEREN", "CRT EFFECT": "CRT-EFFEKT", "GAME SOUND": "SPIELTON", "SETTINGS SAVED.": "EINSTELLUNGEN GESPEICHERT.", CANCEL: "ABBRECHEN", POST: "POSTEN" },
  it: { HOME: "HOME", ANIME: "ANIME", GAMES: "GIOCHI", SHOP: "NEGOZIO", LEADERBOARD: "CLASSIFICA", SETTINGS: "IMPOSTAZIONI", SEARCH: "CERCA", PROFILE: "PROFILO", "CREATE POST": "CREA POST", "FAN FEED": "FEED DEI FAN", "RECENT SIGNALS": "SEGNALI RECENTI", HOT: "CALDI", NEW: "NUOVI", TOP: "TOP", PLAY: "GIOCA", "PLAY NOW": "GIOCA ORA", "BACK TO GAMES": "TORNA AI GIOCHI", "GAME OVER": "GAME OVER", RETRY: "RIPROVA", SCORE: "PUNTEGGIO", BEST: "MIGLIORE", ONLINE: "ONLINE", LOCKED: "BLOCCATO", SPIN: "GIRA", "NINJA RUNNER": "NINJA RUNNER", "ANIME DRAFT": "ANIME DRAFT", "ANIME QUIZ": "QUIZ ANIME", LANGUAGE: "LINGUA", "REDUCE MOTION": "RIDUCI MOVIMENTO", "CRT EFFECT": "EFFETTO CRT", "GAME SOUND": "SUONO DI GIOCO", "SETTINGS SAVED.": "IMPOSTAZIONI SALVATE.", CANCEL: "ANNULLA", POST: "PUBBLICA" },
  pt: { HOME: "INICIO", ANIME: "ANIME", GAMES: "JOGOS", SHOP: "LOJA", LEADERBOARD: "CLASSIFICACAO", SETTINGS: "CONFIGURACOES", SEARCH: "PESQUISAR", PROFILE: "PERFIL", "CREATE POST": "CRIAR POST", "FAN FEED": "FEED DE FAS", "RECENT SIGNALS": "SINAIS RECENTES", HOT: "QUENTES", NEW: "NOVOS", TOP: "TOP", PLAY: "JOGAR", "PLAY NOW": "JOGAR AGORA", "BACK TO GAMES": "VOLTAR AOS JOGOS", "GAME OVER": "FIM DE JOGO", RETRY: "TENTAR NOVAMENTE", SCORE: "PONTUACAO", BEST: "MELHOR", ONLINE: "ONLINE", LOCKED: "BLOQUEADO", SPIN: "GIRAR", "NINJA RUNNER": "NINJA RUNNER", "ANIME DRAFT": "ANIME DRAFT", "ANIME QUIZ": "QUIZ ANIME", LANGUAGE: "IDIOMA", "REDUCE MOTION": "REDUZIR MOVIMENTO", "CRT EFFECT": "EFEITO CRT", "GAME SOUND": "SOM DO JOGO", "SETTINGS SAVED.": "CONFIGURACOES SALVAS.", CANCEL: "CANCELAR", POST: "PUBLICAR" },
  ja: { HOME: "ホーム", GAMES: "ゲーム", SHOP: "ショップ", LEADERBOARD: "ランキング", SETTINGS: "設定", SEARCH: "検索", PROFILE: "プロフィール", "CREATE POST": "投稿を作成", "FAN FEED": "ファンフィード", "RECENT SIGNALS": "最新シグナル", HOT: "人気", NEW: "新着", TOP: "トップ", PLAY: "プレイ", "PLAY NOW": "今すぐプレイ", "BACK TO GAMES": "ゲームに戻る", "GAME OVER": "ゲームオーバー", RETRY: "リトライ", SCORE: "スコア", BEST: "ベスト", ONLINE: "オンライン", LOCKED: "ロック中", SPIN: "スピン", "NINJA RUNNER": "ニンジャランナー", "ANIME DRAFT": "ANIME DRAFT", "ANIME QUIZ": "アニメクイズ", LANGUAGE: "言語", "REDUCE MOTION": "動きを減らす", "CRT EFFECT": "CRT効果", "GAME SOUND": "ゲーム音", "SETTINGS SAVED.": "設定を保存しました。", CANCEL: "キャンセル", POST: "投稿" },
  ko: { HOME: "홈", GAMES: "게임", SHOP: "상점", LEADERBOARD: "리더보드", SETTINGS: "설정", SEARCH: "검색", PROFILE: "프로필", "CREATE POST": "게시물 작성", "FAN FEED": "팬 피드", "RECENT SIGNALS": "최근 신호", HOT: "인기", NEW: "최신", TOP: "최고", PLAY: "플레이", "PLAY NOW": "지금 플레이", "BACK TO GAMES": "게임으로 돌아가기", "GAME OVER": "게임 오버", RETRY: "다시 시도", SCORE: "점수", BEST: "최고 기록", ONLINE: "온라인", LOCKED: "잠김", SPIN: "스핀", "NINJA RUNNER": "닌자 러너", "ANIME DRAFT": "ANIME DRAFT", "ANIME QUIZ": "애니 퀴즈", LANGUAGE: "언어", "REDUCE MOTION": "모션 줄이기", "CRT EFFECT": "CRT 효과", "GAME SOUND": "게임 사운드", "SETTINGS SAVED.": "설정이 저장되었습니다.", CANCEL: "취소", POST: "게시" },
  zh: { HOME: "首页", GAMES: "游戏", SHOP: "商店", LEADERBOARD: "排行榜", SETTINGS: "设置", SEARCH: "搜索", PROFILE: "个人资料", "CREATE POST": "创建帖子", "FAN FEED": "粉丝动态", "RECENT SIGNALS": "最新信号", HOT: "热门", NEW: "最新", TOP: "排行", PLAY: "开始游戏", "PLAY NOW": "立即游玩", "BACK TO GAMES": "返回游戏", "GAME OVER": "游戏结束", RETRY: "重试", SCORE: "分数", BEST: "最高分", ONLINE: "在线", LOCKED: "已锁定", SPIN: "旋转", "NINJA RUNNER": "忍者跑酷", "ANIME DRAFT": "ANIME DRAFT", "ANIME QUIZ": "动漫问答", LANGUAGE: "语言", "REDUCE MOTION": "减少动态", "CRT EFFECT": "CRT效果", "GAME SOUND": "游戏音效", "SETTINGS SAVED.": "设置已保存。", CANCEL: "取消", POST: "发布" },
  ar: { HOME: "الرئيسية", GAMES: "الألعاب", SHOP: "المتجر", LEADERBOARD: "لوحة المتصدرين", SETTINGS: "الإعدادات", SEARCH: "بحث", PROFILE: "الملف الشخصي", "CREATE POST": "إنشاء منشور", "FAN FEED": "موجز المعجبين", "RECENT SIGNALS": "الإشارات الأخيرة", HOT: "الأكثر شعبية", NEW: "جديد", TOP: "الأعلى", PLAY: "العب", "PLAY NOW": "العب الآن", "BACK TO GAMES": "العودة للألعاب", "GAME OVER": "انتهت اللعبة", RETRY: "إعادة المحاولة", SCORE: "النقاط", BEST: "الأفضل", ONLINE: "متصل", LOCKED: "مغلق", SPIN: "دوران", "NINJA RUNNER": "عداء النينجا", "ANIME DRAFT": "ANIME DRAFT", "ANIME QUIZ": "اختبار الأنمي", LANGUAGE: "اللغة", "REDUCE MOTION": "تقليل الحركة", "CRT EFFECT": "تأثير CRT", "GAME SOUND": "صوت اللعبة", "SETTINGS SAVED.": "تم حفظ الإعدادات.", CANCEL: "إلغاء", POST: "نشر" },
  tr: { HOME: "ANA SAYFA", GAMES: "OYUNLAR", SHOP: "MAGAZA", LEADERBOARD: "LIDERLIK", SETTINGS: "AYARLAR", SEARCH: "ARA", PROFILE: "PROFIL", "CREATE POST": "GONDERI OLUSTUR", "FAN FEED": "HAYRAN AKISI", "RECENT SIGNALS": "SON SINYALLER", HOT: "POPULER", NEW: "YENI", TOP: "ZIRVE", PLAY: "OYNA", "PLAY NOW": "SIMDI OYNA", "BACK TO GAMES": "OYUNLARA DON", "GAME OVER": "OYUN BITTI", RETRY: "TEKRAR DENE", SCORE: "PUAN", BEST: "EN IYI", ONLINE: "CEVRIMICI", LOCKED: "KILITLI", SPIN: "CEVIR", "NINJA RUNNER": "NINJA KOSUSU", "ANIME DRAFT": "ANIME DRAFT", "ANIME QUIZ": "ANIME TESTI", LANGUAGE: "DIL", "REDUCE MOTION": "HAREKETI AZALT", "CRT EFFECT": "CRT EFEKTI", "GAME SOUND": "OYUN SESI", "SETTINGS SAVED.": "AYARLAR KAYDEDILDI.", CANCEL: "IPTAL", POST: "PAYLAS" },
  ka: { HOME: "მთავარი", ANIME: "ანიმე", GAMES: "თამაშები", SHOP: "მაღაზია", LEADERBOARD: "რეიტინგი", SETTINGS: "პარამეტრები", SEARCH: "ძიება", PROFILE: "პროფილი", "CREATE POST": "პოსტის შექმნა", "FAN FEED": "ფანების არხი", "RECENT SIGNALS": "უახლესი სიგნალები", HOT: "პოპულარული", NEW: "ახალი", TOP: "ტოპი", PLAY: "თამაში", "PLAY NOW": "ითამაშე ახლა", "BACK TO GAMES": "თამაშებზე დაბრუნება", "GAME OVER": "თამაში დასრულდა", RETRY: "თავიდან ცდა", SCORE: "ქულა", BEST: "საუკეთესო", ONLINE: "ონლაინ", LOCKED: "ჩაკეტილი", SPIN: "დატრიალება", "NINJA RUNNER": "ნინძა მორბენალი", "ANIME DRAFT": "ANIME DRAFT", "ANIME QUIZ": "ანიმე ქვიზი", LANGUAGE: "ენა", "REDUCE MOTION": "მოძრაობის შემცირება", "CRT EFFECT": "CRT ეფექტი", "GAME SOUND": "თამაშის ხმა", "SETTINGS SAVED.": "პარამეტრები შენახულია.", CANCEL: "გაუქმება", POST: "გამოქვეყნება" },
  uk: { HOME: "ГОЛОВНА", GAMES: "ІГРИ", SHOP: "МАГАЗИН", LEADERBOARD: "РЕЙТИНГ", SETTINGS: "НАЛАШТУВАННЯ", SEARCH: "ПОШУК", PROFILE: "ПРОФІЛЬ", "CREATE POST": "СТВОРИТИ ДОПИС", "FAN FEED": "СТРІЧКА ФАНІВ", "RECENT SIGNALS": "ОСТАННІ СИГНАЛИ", HOT: "ПОПУЛЯРНЕ", NEW: "НОВЕ", TOP: "ТОП", PLAY: "ГРАТИ", "PLAY NOW": "ГРАТИ ЗАРАЗ", "BACK TO GAMES": "НАЗАД ДО ІГОР", "GAME OVER": "ГРУ ЗАВЕРШЕНО", RETRY: "ПОВТОРИТИ", SCORE: "РАХУНОК", BEST: "РЕКОРД", ONLINE: "ОНЛАЙН", LOCKED: "ЗАБЛОКОВАНО", SPIN: "ОБЕРТАННЯ", "NINJA RUNNER": "НІНДЗЯ-БІГУН", "ANIME DRAFT": "ANIME DRAFT", "ANIME QUIZ": "АНІМЕ ВІКТОРИНА", LANGUAGE: "МОВА", "REDUCE MOTION": "ЗМЕНШИТИ РУХ", "CRT EFFECT": "ЕФЕКТ CRT", "GAME SOUND": "ЗВУК ГРИ", "SETTINGS SAVED.": "НАЛАШТУВАННЯ ЗБЕРЕЖЕНО.", CANCEL: "СКАСУВАТИ", POST: "ОПУБЛІКУВАТИ" }
};

const aniviaExtraLabels = {
  es: { "Add coins": "Añadir monedas", Settings: "Ajustes", Profile: "Perfil", Search: "Buscar" },
  fr: { "Add coins": "Ajouter des pièces", Settings: "Paramètres", Profile: "Profil", Search: "Rechercher" },
  de: { "Add coins": "Münzen hinzufügen", Settings: "Einstellungen", Profile: "Profil", Search: "Suchen" },
  it: { "Add coins": "Aggiungi monete", Settings: "Impostazioni", Profile: "Profilo", Search: "Cerca" },
  pt: { "Add coins": "Adicionar moedas", Settings: "Configurações", Profile: "Perfil", Search: "Pesquisar" },
  ja: { "Add coins": "コインを追加", Settings: "設定", Profile: "プロフィール", Search: "検索" },
  ko: { "Add coins": "코인 추가", Settings: "설정", Profile: "프로필", Search: "검색" },
  zh: { "Add coins": "添加硬币", Settings: "设置", Profile: "个人资料", Search: "搜索" },
  ar: { "Add coins": "إضافة عملات", Settings: "الإعدادات", Profile: "الملف الشخصي", Search: "بحث" },
  tr: { "Add coins": "Jeton ekle", Settings: "Ayarlar", Profile: "Profil", Search: "Ara" },
  ka: { "Add coins": "მონეტების დამატება", Settings: "პარამეტრები", Profile: "პროფილი", Search: "ძიება" },
  uk: { "Add coins": "Додати монети", Settings: "Налаштування", Profile: "Профіль", Search: "Пошук" }
};
Object.entries(aniviaExtraLabels).forEach(([language, labels]) => Object.assign(aniviaTranslations[language], labels));

const aniviaSourceText = new WeakMap();
function applyInterfaceLanguage(language = localStorage.getItem("aniviaSetting_languageSetting") || "en") {
  const dictionary = aniviaTranslations[language] || {};
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  let node;
  while ((node = walker.nextNode())) {
    const source = aniviaSourceText.get(node) || node.nodeValue.trim();
    if (!source || source === "ANIVIA" || node.parentElement?.closest("script, style, option")) continue;
    if (!aniviaSourceText.has(node)) aniviaSourceText.set(node, source);
    const translated = dictionary[source] || dictionary[source.toUpperCase()];
    if (translated) node.nodeValue = node.nodeValue.replace(source, translated);
  }
  document.querySelectorAll("[aria-label]").forEach((element) => {
    const source = element.getAttribute("data-anivia-label") || element.getAttribute("aria-label");
    if (!source || source === "ANIVIA") return;
    element.setAttribute("data-anivia-label", source);
    element.setAttribute("aria-label", dictionary[source] || dictionary[source.toUpperCase()] || source);
  });
  document.documentElement.lang = language;
}
window.applyInterfaceLanguage = applyInterfaceLanguage;
applyInterfaceLanguage();
window.addEventListener("storage", (event) => {
  if (event.key === "aniviaSetting_languageSetting") applyInterfaceLanguage(event.newValue || "en");
});

if (!window.location.hash) {
  window.addEventListener("load", () => window.setTimeout(() => {
    document.documentElement.style.scrollBehavior = "auto";
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    window.scrollTo(0, 0);
  }, 40), { once: true });
}

function initializeCyberCityBackground() {
  if (document.body.classList.contains("runner-page") || document.body.classList.contains("home-page") || document.querySelector(".cyber-city-canvas")) return;

  const canvas = document.createElement("canvas");
  canvas.className = "cyber-city-canvas";
  canvas.setAttribute("aria-hidden", "true");
  document.body.prepend(canvas);
  const context = canvas.getContext("2d");
  const scene = { width: 0, height: 0, ratio: 1, time: 0, buildings: [], cars: [], rain: [], particles: [], steam: [], vehicles: [] };
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const palette = { sky: "#05030b", deep: "#090515", purple: "#8b00ff", violet: "#b84cff", blue: "#4c8dff", magenta: "#ff63d0", cyan: "#48e9ff", white: "#e8e2ff" };

  function random(min, max) { return min + Math.random() * (max - min); }
  function resize() {
    scene.width = window.innerWidth;
    scene.height = window.innerHeight;
    scene.ratio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = scene.width * scene.ratio;
    canvas.height = scene.height * scene.ratio;
    const pageZoom = Number.parseFloat(getComputedStyle(document.body).zoom || "1");
    canvas.style.width = `${scene.width / pageZoom}px`;
    canvas.style.height = `${scene.height / pageZoom}px`;
    context.setTransform(scene.ratio, 0, 0, scene.ratio, 0, 0);
    buildScene();
  }
  function buildScene() {
    scene.buildings = Array.from({ length: 34 }, (_, index) => ({ x: index / 34, width: random(0.025, 0.075), height: random(0.12, 0.42), depth: random(0.2, 1), hue: index % 3 }));
    scene.cars = Array.from({ length: 18 }, (_, index) => ({ lane: index % 2, x: random(-0.3, 1.2), y: random(0.72, 0.91), speed: random(0.018, 0.05), color: index % 3 ? palette.blue : palette.magenta }));
    scene.rain = Array.from({ length: 120 }, () => ({ x: Math.random(), y: Math.random(), speed: random(0.12, 0.3), length: random(5, 16), alpha: random(0.08, 0.28) }));
    scene.particles = Array.from({ length: 44 }, () => ({ x: Math.random(), y: random(0.18, 0.8), speed: random(0.004, 0.014), size: random(1, 2.5), alpha: random(0.15, 0.45) }));
    scene.steam = Array.from({ length: 8 }, (_, index) => ({ x: 0.08 + index * 0.12, y: random(0.77, 0.92), phase: random(0, 6) }));
    scene.vehicles = Array.from({ length: 3 }, (_, index) => ({ x: random(-0.2, 1), y: 0.2 + index * 0.12, speed: random(0.012, 0.026), phase: random(0, 6) }));
  }
  function drawBuilding(building, horizon, foreground = false) {
    const x = building.x * scene.width;
    const width = building.width * scene.width;
    const height = building.height * scene.height;
    const y = horizon - height;
    context.fillStyle = foreground ? "rgba(7, 4, 15, .92)" : `rgba(${20 + building.hue * 10}, ${8 + building.hue * 5}, ${32 + building.hue * 18}, ${0.55 + building.depth * 0.3})`;
    context.fillRect(x, y, width, height);
    context.fillStyle = building.hue === 1 ? "rgba(76, 141, 255, .45)" : "rgba(184, 76, 255, .38)";
    for (let windowY = y + 12; windowY < horizon - 8; windowY += 18) {
      if ((Math.floor(windowY) + Math.floor(x)) % 4 > 0) context.fillRect(x + 6, windowY, 3, 5);
      if (width > 34 && (Math.floor(windowY) + Math.floor(x)) % 3 > 0) context.fillRect(x + width - 12, windowY, 3, 5);
    }
    if (building.depth > 0.65) {
      context.strokeStyle = building.hue === 2 ? palette.cyan : palette.magenta;
      context.globalAlpha = 0.32 + Math.sin(scene.time * 1.4 + x) * 0.08;
      context.strokeRect(x + width * 0.2, y + height * 0.25, width * 0.55, 14);
      context.globalAlpha = 1;
    }
  }
  function drawCar(car, roadY) {
    const x = car.x * scene.width;
    const y = roadY + (car.y - 0.82) * scene.height;
    const scale = Math.max(0.45, (car.y - 0.68) * 2.2);
    const length = 32 * scale;
    context.fillStyle = "rgba(5, 2, 10, .9)";
    context.fillRect(x, y, length, 7 * scale);
    context.fillStyle = car.color;
    context.shadowColor = car.color;
    context.shadowBlur = 10 * scale;
    context.fillRect(car.lane ? x : x + length - 4, y + 2, 4, 3);
    context.fillStyle = palette.white;
    context.fillRect(car.lane ? x + length - 4 : x, y + 2, 3, 3);
    context.shadowBlur = 0;
  }
  function drawScene() {
    const width = scene.width;
    const height = scene.height;
    const horizon = height * 0.66;
    context.clearRect(0, 0, width, height);
    const sky = context.createLinearGradient(0, 0, 0, height);
    sky.addColorStop(0, palette.sky); sky.addColorStop(0.58, palette.deep); sky.addColorStop(1, "#020107");
    context.fillStyle = sky; context.fillRect(0, 0, width, height);
    context.fillStyle = "rgba(76, 141, 255, .08)"; context.fillRect(0, horizon - 90, width, 2);
    scene.buildings.filter((building) => building.depth < 0.72).forEach((building) => drawBuilding(building, horizon - 16));
    context.fillStyle = "rgba(8, 3, 17, .92)"; context.fillRect(0, horizon, width, height - horizon);
    context.fillStyle = "rgba(24, 9, 42, .95)"; context.beginPath(); context.moveTo(width * 0.44, horizon); context.lineTo(width * 0.56, horizon); context.lineTo(width * 0.92, height); context.lineTo(width * 0.08, height); context.closePath(); context.fill();
    scene.buildings.filter((building) => building.depth >= 0.72).forEach((building) => drawBuilding(building, horizon + 8, true));
    context.strokeStyle = "rgba(184, 76, 255, .18)"; context.lineWidth = 1;
    for (let line = 0; line < 7; line += 1) { context.beginPath(); context.moveTo(width * 0.5, horizon); context.lineTo(width * (0.12 + line * 0.13), height); context.stroke(); }
    for (let line = 1; line < 5; line += 1) { const y = horizon + Math.pow(line / 5, 1.8) * (height - horizon); context.beginPath(); context.moveTo(width * 0.08, y); context.lineTo(width * 0.92, y); context.stroke(); }
    scene.cars.forEach((car) => { car.x += (car.lane ? -1 : 1) * car.speed * (reducedMotion ? 0.25 : 1) / 60; if (car.x > 1.25) car.x = -0.25; if (car.x < -0.25) car.x = 1.25; drawCar(car, horizon); });
    scene.vehicles.forEach((vehicle) => { vehicle.x += vehicle.speed * (reducedMotion ? 0.25 : 1) / 60; if (vehicle.x > 1.2) vehicle.x = -0.2; const x = vehicle.x * width; const y = vehicle.y * height + Math.sin(scene.time + vehicle.phase) * 4; context.fillStyle = palette.cyan; context.shadowColor = palette.cyan; context.shadowBlur = 16; context.fillRect(x, y, 24, 2); context.fillStyle = palette.magenta; context.fillRect(x + 8, y + 3, 8, 2); context.shadowBlur = 0; });
    scene.steam.forEach((vent) => { const x = vent.x * width; const y = vent.y * height; context.strokeStyle = "rgba(216, 184, 255, .16)"; context.lineWidth = 3; context.beginPath(); context.moveTo(x, y); context.quadraticCurveTo(x - 10 + Math.sin(scene.time + vent.phase) * 8, y - 22, x + 8, y - 44); context.stroke(); });
    scene.particles.forEach((particle) => { particle.x += particle.speed * (reducedMotion ? 0.25 : 1) / 60; if (particle.x > 1.05) particle.x = -0.05; context.globalAlpha = particle.alpha; context.fillStyle = particle.x % 2 > 0.5 ? palette.violet : palette.cyan; context.fillRect(particle.x * width, particle.y * height, particle.size, particle.size); });
    scene.rain.forEach((drop) => { drop.y += drop.speed * (reducedMotion ? 0.25 : 1) / 60; if (drop.y > 1) drop.y = -0.05; context.globalAlpha = drop.alpha; context.strokeStyle = palette.lavender; context.beginPath(); context.moveTo(drop.x * width, drop.y * height); context.lineTo(drop.x * width - 2, drop.y * height + drop.length); context.stroke(); });
    context.globalAlpha = 1;
    const vignette = context.createRadialGradient(width / 2, height * 0.55, height * 0.12, width / 2, height * 0.55, width * 0.72);
    vignette.addColorStop(0, "rgba(0, 0, 0, .02)"); vignette.addColorStop(1, "rgba(0, 0, 0, .58)"); context.fillStyle = vignette; context.fillRect(0, 0, width, height);
  }
  function animate(timestamp) { const delta = Math.min(0.05, (timestamp - (animate.last || timestamp)) / 1000); animate.last = timestamp; scene.time += delta; drawScene(); requestAnimationFrame(animate); }
  resize();
  window.addEventListener("resize", resize);
  requestAnimationFrame(animate);
}

initializeCyberCityBackground();

const navButtons = document.querySelector(".nav-buttons");

const defaultScores = {
  you: 1250,
  opponent: 1480
};

function getScores() {
  try {
    return { ...defaultScores, ...JSON.parse(localStorage.getItem("aniviaScores") || "{}").scores };
  } catch (error) {
    return { ...defaultScores };
  }
}

function saveScores(scores) {
  localStorage.setItem("aniviaScores", JSON.stringify({ scores }));
}

function getSavedUser() {
  try {
    return JSON.parse(localStorage.getItem("aniviaUser") || "null");
  } catch (error) {
    return null;
  }
}

function updateMatchScore(winner) {
  const scores = getScores();
  const loser = winner === "you" ? "opponent" : "you";
  scores[winner] += 250;
  scores[loser] = Math.max(0, scores[loser] - 50);
  saveScores(scores);
  return scores;
}

const leaderboardList = document.getElementById("leaderboardList");

if (leaderboardList) {
  const scores = getScores();
  const players = Array.from({ length: 100 }, (_, index) => ({
    rank: index + 1,
    name: index === 0 ? "OPPONENT_07" : index === 1 ? "YOU" : `PLAYER ${index + 1}`,
    score: index === 0 ? scores.opponent : index === 1 ? scores.you : 32000 - index * 145 + (index % 7) * 18,
    badge: index < 3 ? ["A", "B", "C"][index] : ""
  }));

  leaderboardList.innerHTML = players
    .map((player) => {
      const eliteClass = player.rank <= 3 ? " elite" : "";
      const badge = player.badge ? `<span class="player-badge">${player.badge}</span>` : "";

      return `
        <div class="leaderboard-row${eliteClass}">
          <div class="rank-cell">#${player.rank}</div>
          <div class="player-cell">
            <span class="avatar">${player.rank <= 9 ? "0" + player.rank : player.rank}</span>
            <span class="player-name">${player.name}${badge}</span>
          </div>
          <div class="score-cell">${player.score.toLocaleString()}</div>
        </div>
      `;
    })
    .join("");
}

const playerGuessInput = document.getElementById("animeGuess");
const submitGuessBtn = document.getElementById("submitGuessBtn");
const chatMessages = document.getElementById("chatMessages");
const letterSlots = document.getElementById("letterSlots");
const letterKeyboard = document.getElementById("letterKeyboard");
const decisionModal = document.getElementById("decisionModal");
const decisionText = document.getElementById("decisionText");
const decisionYes = document.getElementById("decisionYes");
const decisionNo = document.getElementById("decisionNo");
const matchStartModal = document.getElementById("matchStartModal");
const matchStartForm = document.getElementById("matchStartForm");
const yourAnimeWord = document.getElementById("yourAnimeWord");
let yourAnime = "";

if (matchStartForm && matchStartModal && yourAnimeWord) {
  yourAnimeWord.focus();
  matchStartForm.addEventListener("submit", (event) => {
    event.preventDefault();
    yourAnime = sanitizeWord(yourAnimeWord.value);
    if (!yourAnime) return;

    matchStartModal.classList.add("hidden");
    addChatMessage("Your anime is locked in. The round can begin.", "system");
  });
}

const opponentWord = "NARUTO";
const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const revealedLetters = new Set();
const opponentScore = document.getElementById("opponentScore");
let turnLocked = false;
let guessingEnabled = false;
let pendingGuess = "";

function goToResult(winner) {
  window.location.href = `result.html?winner=${winner}`;
}

function sanitizeWord(word) {
  return (word || "").replace(/[^a-zA-Z]/g, "").toUpperCase();
}

function renderLetterSlots(word) {
  if (!letterSlots) return;

  const cleanWord = sanitizeWord(word);
  const amount = cleanWord.length || 1;
  const slots = Array.from({ length: amount }, (_, index) => {
    const currentLetter = cleanWord[index];
    const hasLetter = revealedLetters.has(currentLetter) || currentLetter === undefined;

    if (hasLetter && currentLetter) {
      return `<span class="letter-slot filled">${currentLetter}</span>`;
    }

    return '<span class="letter-slot letter-line"></span>';
  }).join("");

  letterSlots.innerHTML = slots;
}

function addChatMessage(message, type = "player") {
  if (!chatMessages) return;

  const bubble = document.createElement("div");
  bubble.className = `chat-bubble ${type}`;
  bubble.textContent = message;
  chatMessages.appendChild(bubble);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function revealMatchingLetters(letter) {
  const normalized = sanitizeWord(letter);

  if (!normalized) return;

  const matches = [...opponentWord].filter((char) => char === normalized);

  if (!matches.length) {
    return;
  }

  matches.forEach((match) => revealedLetters.add(match));
  renderLetterSlots(opponentWord);

  const allLettersFound = [...new Set(opponentWord)].every((char) => revealedLetters.has(char));
  if (allLettersFound) {
    setKeyboardState(false);
    addChatMessage("The word is complete. You win!", "system");
    setTimeout(() => goToResult("you"), 500);
  }
}

function addLetterToGuess(letter) {
  if (!playerGuessInput || turnLocked || !guessingEnabled) return;

  revealMatchingLetters(letter);
  playerGuessInput.focus();
}

function setKeyboardState(enabled) {
  guessingEnabled = enabled;
  if (!letterKeyboard) return;

  letterKeyboard.querySelectorAll(".keyboard-key").forEach((key) => {
    key.disabled = !enabled;
  });
}

if (letterKeyboard) {
  alphabet.forEach((letter) => {
    const key = document.createElement("button");
    key.type = "button";
    key.className = "keyboard-key";
    key.textContent = letter;
    key.setAttribute("aria-label", `Add letter ${letter}`);
    key.addEventListener("click", () => addLetterToGuess(letter));
    letterKeyboard.appendChild(key);
  });
  setKeyboardState(false);
}

function openDecisionModal(message) {
  if (!decisionModal || !decisionText) return;

  decisionText.textContent = message;
  decisionModal.classList.remove("hidden");
}

function closeDecisionModal() {
  if (!decisionModal) return;

  decisionModal.classList.add("hidden");
}

function submitGuessForApproval() {
  const playerGuess = sanitizeWord(playerGuessInput.value);

  if (!playerGuess) {
    playerGuessInput.focus();
    return;
  }

  pendingGuess = playerGuess;
  turnLocked = true;
  setKeyboardState(false);
  playerGuessInput.value = "";
  playerGuessInput.disabled = true;
  submitGuessBtn.disabled = true;
  addChatMessage(`You typed: ${playerGuess}`, "player");
  openDecisionModal(`Opponent: is “${playerGuess}” correct?`);
}

if (playerGuessInput && submitGuessBtn) {
  submitGuessBtn.addEventListener("click", submitGuessForApproval);
}

if (decisionYes && decisionNo) {
  decisionYes.addEventListener("click", () => {
    const accepted = false;
    closeDecisionModal();

    if (accepted) {
      addChatMessage("Opponent accepted the guess. You win!", "system");
      setTimeout(() => goToResult("you"), 500);
      return;
    }

    addChatMessage("Opponent reviewed the chat guess, but only the letter board can win the round.", "system");
    turnLocked = false;
    setKeyboardState(true);
    if (playerGuessInput) {
      playerGuessInput.disabled = false;
      playerGuessInput.focus();
    }
    if (submitGuessBtn) {
      submitGuessBtn.disabled = false;
    }
    pendingGuess = "";
  });

  decisionNo.addEventListener("click", () => {
    closeDecisionModal();
    addChatMessage("Opponent declined the guess.", "system");
    turnLocked = false;
    setKeyboardState(true);
    if (playerGuessInput) {
      playerGuessInput.disabled = false;
      playerGuessInput.focus();
    }
    if (submitGuessBtn) {
      submitGuessBtn.disabled = false;
    }
    pendingGuess = "";
  });
}

if (letterSlots) {
  renderLetterSlots(opponentWord);
}

if (opponentScore) {
  opponentScore.textContent = `${getScores().opponent.toLocaleString()} PTS`;
}

const bodyHasResultPage = document.body.classList.contains("result-page");

if (bodyHasResultPage) {
  const params = new URLSearchParams(window.location.search);
  const winner = params.get("winner") === "you" ? "you" : "opponent";

  const winnerNameEl = document.getElementById("winnerName");
  const loserNameEl = document.getElementById("loserName");
  const winnerRoleEl = document.getElementById("winnerRole");
  const loserRoleEl = document.getElementById("loserRole");
  const winnerScoreEl = document.getElementById("winnerScore");
  const loserScoreEl = document.getElementById("loserScore");
  const scoreKey = `anivia-match-${winner}`;
  const scores = sessionStorage.getItem(scoreKey) ? getScores() : updateMatchScore(winner);

  sessionStorage.setItem(scoreKey, "scored");

  if (winnerNameEl && loserNameEl && winnerRoleEl && loserRoleEl) {
    if (winner === "you") {
      winnerNameEl.textContent = "YOU";
      loserNameEl.textContent = "OPPONENT";
    } else {
      winnerNameEl.textContent = "OPPONENT";
      loserNameEl.textContent = "YOU";
    }

    winnerRoleEl.textContent = "WINNER";
    loserRoleEl.textContent = "LOSER";

    if (winnerScoreEl && loserScoreEl) {
      winnerScoreEl.textContent = `${scores[winner].toLocaleString()} PTS`;
      loserScoreEl.textContent = `${scores[winner === "you" ? "opponent" : "you"].toLocaleString()} PTS`;
    }
  }
}

const postModal = document.getElementById("postModal");
const openPostBtn = document.getElementById("openPostBtn");
const closePostBtn = document.getElementById("closePostBtn");
const postForm = document.getElementById("postForm");
const postImageInput = document.getElementById("postImage");
const postImagePreview = document.getElementById("postImagePreview");
const communityFeed = document.querySelector(".community-feed");

document.getElementById("composerShortcut")?.addEventListener("click", () => setPostModal(true));
document.getElementById("composerShortcut")?.addEventListener("keydown", (event) => { if (event.key === "Enter" || event.key === " ") setPostModal(true); });
postImageInput?.addEventListener("change", () => {
  postImagePreview.innerHTML = "";
  postImagePreview.classList.toggle("hidden", !postImageInput.files.length);
  [...postImageInput.files].slice(0, 6).forEach((file) => { const image = document.createElement("img"); image.src = URL.createObjectURL(file); image.alt = "Selected image preview"; postImagePreview.appendChild(image); });
});

function setPostModal(open) {
  if (!postModal) return;

  postModal.classList.toggle("hidden", !open);
}

if (openPostBtn && closePostBtn && postForm) {
  openPostBtn.addEventListener("click", () => setPostModal(true));
  closePostBtn.addEventListener("click", () => setPostModal(false));

  postForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const title = document.getElementById("postTitle").value.trim();
    const body = document.getElementById("postBody").value.trim();
    if (!title || !body || !communityFeed) return;
    const images = [...(postImageInput?.files || [])].slice(0, 6);

    const post = document.createElement("article");
    post.className = "community-post own-post";
    post.dataset.postId = `user-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    post.innerHTML = `
      <div class="vote-column">
        <button class="vote-button" type="button" aria-label="Upvote post">▲</button>
        <strong class="vote-count">1</strong>
        <button class="vote-button" type="button" aria-label="Downvote post">▼</button>
      </div>
      <div class="post-content">
        <div class="post-meta">r/ANIVIA // posted by <b>YOU</b> // just now</div>
        <h2></h2>
        <p></p>
        <div class="post-media hidden"></div>
        <div class="post-tags"><span>NEW POST</span></div>
        <div class="social-post-actions"><button class="comment-button" type="button">▱ 0 COMMENTS</button><button class="share-button" type="button">↗ SHARE</button><button class="save-button" type="button">☆ SAVE</button><button class="more-button" type="button">•••</button></div>
      </div>
    `;
    post.querySelector("h2").textContent = title;
    post.querySelector("p").textContent = body;
    if (images.length) { const media = post.querySelector(".post-media"); media.classList.remove("hidden"); images.forEach((file) => { const image = document.createElement("img"); image.src = URL.createObjectURL(file); image.alt = title; media.appendChild(image); }); }
    communityFeed.insertBefore(post, communityFeed.children[1]);
    preparePostComments(post, 0);
    postForm.reset();
    postImagePreview.innerHTML = "";
    postImagePreview.classList.add("hidden");
    setPostModal(false);
  });
}

function readPostComments(postId) {
  try {
    return JSON.parse(localStorage.getItem(`aniviaComments:${postId}`) || "[]");
  } catch (error) {
    return [];
  }
}

function savePostComments(postId, comments) {
  try {
    localStorage.setItem(`aniviaComments:${postId}`, JSON.stringify(comments));
  } catch (error) {
    return;
  }
}

function paintPostComments(post, list) {
  list.replaceChildren();
  const comments = readPostComments(post.dataset.postId);
  if (!comments.length) {
    const empty = document.createElement("p");
    empty.className = "comments-empty";
    empty.textContent = "NO REPLIES YET. START THE THREAD.";
    list.appendChild(empty);
  } else {
    comments.forEach((comment) => {
      const row = document.createElement("p");
      row.className = "post-comment";
      const author = document.createElement("b");
      author.textContent = "YOU";
      const text = document.createElement("span");
      text.textContent = comment;
      row.append(author, text);
      list.appendChild(row);
    });
  }

  const button = post.querySelector(".comment-button");
  const baseCount = Number(button.dataset.baseCount || 0);
  button.textContent = `▱ ${baseCount + comments.length} COMMENTS`;
}

function preparePostComments(post, index) {
  if (!post.dataset.postId) post.dataset.postId = `anivia-seed-${index + 1}`;
  const button = post.querySelector(".comment-button");
  if (!button) return;
  if (!button.dataset.baseCount) button.dataset.baseCount = String(Number((button.textContent.match(/\d+/) || [0])[0]));

  let panel = post.querySelector(".post-comments");
  if (!panel) {
    panel = document.createElement("section");
    panel.className = "post-comments hidden";
    panel.innerHTML = '<div class="comment-list"></div><form class="comment-form"><input class="comment-input" type="text" maxlength="240" placeholder="Write a reply..." aria-label="Write a reply" required><button class="comment-submit" type="submit">REPLY</button></form>';
    post.querySelector(".post-content").appendChild(panel);
  }
  if (post.classList.contains("own-post") && !post.querySelector(".delete-post-button")) {
    const actions = post.querySelector(".social-post-actions");
    if (actions) actions.appendChild(Object.assign(document.createElement("button"), { className: "delete-post-button", type: "button", textContent: "DELETE" }));
  }
  paintPostComments(post, panel.querySelector(".comment-list"));
}

if (communityFeed) {
  [...communityFeed.querySelectorAll(".community-post")].forEach(preparePostComments);

  communityFeed.addEventListener("click", (event) => {
    const voteButton = event.target.closest(".vote-button");
    const commentButton = event.target.closest(".comment-button");
    const deleteButton = event.target.closest(".delete-post-button");

    if (deleteButton) {
      const post = deleteButton.closest(".community-post");
      if (post) {
        try { localStorage.removeItem(`aniviaComments:${post.dataset.postId}`); } catch (error) { /* storage may be unavailable */ }
        post.remove();
      }
      return;
    }

    if (commentButton) {
      const post = commentButton.closest(".community-post");
      const panel = post?.querySelector(".post-comments");
      if (!panel) return;
      panel.classList.toggle("hidden");
      commentButton.setAttribute("aria-expanded", String(!panel.classList.contains("hidden")));
      if (!panel.classList.contains("hidden")) panel.querySelector(".comment-input")?.focus();
      return;
    }

    if (!voteButton) return;

    const voteColumn = voteButton.closest(".vote-column, .social-vote-column");
    const count = voteColumn.querySelector(".vote-count");
    const delta = voteButton.textContent.trim() === "▲" ? 1 : -1;
    count.textContent = Math.max(0, Number(count.textContent) + delta).toString();
    voteButton.classList.toggle("active");
  });

  communityFeed.addEventListener("submit", (event) => {
    const form = event.target.closest(".comment-form");
    if (!form) return;
    event.preventDefault();
    const input = form.querySelector(".comment-input");
    const text = input.value.trim();
    const post = form.closest(".community-post");
    if (!text || !post) return;
    const comments = readPostComments(post.dataset.postId);
    comments.push(text);
    savePostComments(post.dataset.postId, comments);
    paintPostComments(post, post.querySelector(".comment-list"));
    input.value = "";
  });

  communityFeed.addEventListener("click", async (event) => {
    const saveButton = event.target.closest(".save-button");
    const shareButton = event.target.closest(".share-button");
    const moreButton = event.target.closest(".more-button");
    if (saveButton) { saveButton.classList.toggle("active"); saveButton.textContent = saveButton.classList.contains("active") ? "★ SAVED" : "☆ SAVE"; }
    if (shareButton) { const post = shareButton.closest(".community-post"); const text = post?.querySelector("h2")?.textContent || "ANIVIA post"; if (navigator.share) await navigator.share({ title: text, url: location.href }); else { await navigator.clipboard?.writeText(location.href); shareButton.textContent = "✓ COPIED"; } }
    if (moreButton) window.alert("POST OPTIONS: REPORT // HIDE // BLOCK");
  });

  document.querySelectorAll(".feed-filter").forEach((filterButton) => {
    filterButton.addEventListener("click", () => {
      document.querySelectorAll(".feed-filter").forEach((button) => button.classList.remove("active"));
      filterButton.classList.add("active");

      const posts = [...communityFeed.querySelectorAll(".community-post")];
      if (filterButton.textContent.trim() === "TOP") {
        posts.sort((first, second) => Number(second.querySelector(".vote-count").textContent) - Number(first.querySelector(".vote-count").textContent));
      } else if (filterButton.textContent.trim() === "NEW") {
        posts.reverse();
      } else {
        posts.sort((first, second) => Number(second.querySelector(".vote-count").textContent) - Number(first.querySelector(".vote-count").textContent));
      }

      const toolbar = communityFeed.querySelector(".feed-toolbar");
      posts.forEach((post) => communityFeed.appendChild(post));
      communityFeed.prepend(toolbar);
    });
  });
}

const imageLightbox = document.createElement("div");
imageLightbox.className = "post-image-lightbox hidden";
imageLightbox.setAttribute("role", "dialog");
imageLightbox.setAttribute("aria-modal", "true");
imageLightbox.setAttribute("aria-label", "Expanded post image");
imageLightbox.innerHTML = '<button class="lightbox-close" type="button" aria-label="Close image">×</button><img alt="Expanded post image">';
document.body.appendChild(imageLightbox);
const lightboxImage = imageLightbox.querySelector("img");

function closeImageLightbox() {
  imageLightbox.classList.add("hidden");
  lightboxImage.removeAttribute("src");
  document.body.classList.remove("image-lightbox-open");
}

document.addEventListener("click", (event) => {
  const thumbnail = event.target.closest(".post-media img, .post-image-preview img");
  if (thumbnail) {
    lightboxImage.src = thumbnail.currentSrc || thumbnail.src;
    lightboxImage.alt = thumbnail.alt || "Expanded post image";
    imageLightbox.classList.remove("hidden");
    document.body.classList.add("image-lightbox-open");
    return;
  }

  if (event.target === imageLightbox || event.target.closest(".lightbox-close")) closeImageLightbox();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !imageLightbox.classList.contains("hidden")) closeImageLightbox();
});

document.querySelectorAll(".social-nav-item:not(a)").forEach((item) => item.addEventListener("click", () => { document.querySelectorAll(".social-nav-item").forEach((navItem) => navItem.classList.remove("active")); item.classList.add("active"); }));
document.querySelectorAll(".discovery-panel button").forEach((button) => button.addEventListener("click", () => { button.textContent = button.textContent === "JOIN" ? "JOINED" : "JOIN"; button.classList.toggle("active"); }));

function isPlayerLoggedIn() {
  return localStorage.getItem("aniviaLoggedIn") === "true" && Boolean(getSavedUser());
}

document.querySelectorAll(".profile-button").forEach((profileButton) => {
  profileButton.addEventListener("click", () => {
    window.location.href = isPlayerLoggedIn() ? "profile.html" : "auth.html";
  });
});

const authForm = document.getElementById("authForm");
const authSwitch = document.getElementById("authSwitch");
const authTitle = document.getElementById("authTitle");
const authSubtitle = document.getElementById("authSubtitle");
const authSwitchText = document.getElementById("authSwitchText");
const authSubmit = document.querySelector(".auth-submit");
const confirmPasswordWrap = document.getElementById("confirmPasswordWrap");
const confirmPassword = document.getElementById("confirmPassword");
const authStatus = document.getElementById("authStatus");
let signUpMode = false;

if (authForm && authSwitch && authTitle && authSubtitle && authSwitchText && authSubmit && confirmPasswordWrap) {
  authSwitch.addEventListener("click", () => {
    signUpMode = !signUpMode;
    authTitle.textContent = signUpMode ? "SIGN UP" : "LOGIN";
    authSubtitle.textContent = signUpMode ? "Create your player profile and enter the ANIVIA arena." : "Enter the arena and continue your ANIVIA run.";
    authSwitchText.textContent = signUpMode ? "Already a player?" : "New player?";
    authSwitch.textContent = signUpMode ? "LOGIN" : "SIGN UP";
    authSubmit.textContent = signUpMode ? "CREATE PROFILE" : "ENTER SYSTEM";
    confirmPasswordWrap.classList.toggle("hidden", !signUpMode);
    confirmPassword.required = signUpMode;
    authStatus.textContent = "";
  });

  authForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const email = document.getElementById("authEmail").value.trim().toLowerCase();
    const password = document.getElementById("authPassword").value;
    const savedUser = getSavedUser();

    authStatus.classList.remove("error");

    if (signUpMode && confirmPassword.value !== password) {
      authStatus.classList.add("error");
      authStatus.textContent = "PASSWORDS DO NOT MATCH.";
      return;
    }

    if (signUpMode) {
      localStorage.setItem("aniviaUser", JSON.stringify({ email, password }));
      localStorage.setItem("aniviaLoggedIn", "true");
      authStatus.textContent = "PROFILE CREATED. SWITCHING TO LOGIN...";
      authForm.reset();
      authSwitch.click();
      document.getElementById("authEmail").value = email;
      authStatus.textContent = "PROFILE CREATED. NOW LOGIN TO ENTER.";
      return;
    }

    if (!savedUser || savedUser.email !== email || savedUser.password !== password) {
      authStatus.classList.add("error");
      authStatus.textContent = "ACCESS DENIED. CHECK EMAIL AND PASSWORD.";
      return;
    }

    localStorage.setItem("aniviaLoggedIn", "true");
    authStatus.textContent = "ACCESS GRANTED. WELCOME BACK.";
  });
}

const profileEmail = document.getElementById("profileEmail");
const profileName = document.getElementById("profileName");
const profileScore = document.getElementById("profileScore");
const logoutButton = document.getElementById("logoutButton");
const nicknameInput = document.getElementById("nicknameInput");
const saveNickname = document.getElementById("saveNickname");
const profileAvatar = document.getElementById("profileAvatar");
const pfpPicker = document.getElementById("pfpPicker");
const profileUpdateStatus = document.getElementById("profileUpdateStatus");

function getProfileSettings() {
  try {
    return JSON.parse(localStorage.getItem("aniviaProfile") || "{}");
  } catch (error) {
    return {};
  }
}

function saveProfileSettings(settings) {
  localStorage.setItem("aniviaProfile", JSON.stringify(settings));
}

function showProfileUpdate(message) {
  if (!profileUpdateStatus) return;
  profileUpdateStatus.textContent = message;
}

if (profileEmail) {
  const savedUser = getSavedUser();
  const profile = getProfileSettings();
  profileEmail.textContent = savedUser?.email || "PLAYER";
  if (profileName) profileName.textContent = profile.nickname || "PLAYER";
  if (nicknameInput) nicknameInput.value = profile.nickname || "";
  if (profileAvatar) profileAvatar.textContent = profile.pfp || "YOU";
}

if (profileScore) {
  profileScore.textContent = getScores().you.toLocaleString();
}

if (logoutButton) {
  logoutButton.addEventListener("click", () => {
    localStorage.removeItem("aniviaLoggedIn");
    window.location.href = "auth.html";
  });
}

if (saveNickname && nicknameInput) {
  saveNickname.addEventListener("click", () => {
    const nickname = nicknameInput.value.trim().toUpperCase();
    if (!nickname) {
      showProfileUpdate("ENTER A NICKNAME FIRST.");
      return;
    }

    const profile = getProfileSettings();
    profile.nickname = nickname;
    saveProfileSettings(profile);
    if (profileName) profileName.textContent = nickname;
    showProfileUpdate("NICKNAME UPDATED.");
  });
}

if (profileAvatar && pfpPicker) {
  profileAvatar.addEventListener("click", () => {
    pfpPicker.classList.toggle("hidden");
    showProfileUpdate(pfpPicker.classList.contains("hidden") ? "" : "CHOOSE A NEW PROFILE PICTURE.");
  });
}

document.querySelectorAll(".pfp-option").forEach((option) => {
  option.addEventListener("click", () => {
    const profile = getProfileSettings();
    profile.pfp = option.dataset.pfp;
    saveProfileSettings(profile);
    if (profileAvatar) profileAvatar.textContent = profile.pfp;
    if (pfpPicker) pfpPicker.classList.add("hidden");
    showProfileUpdate("PROFILE PICTURE UPDATED.");
  });
});

const spinButton = document.getElementById("spinButton");
const spinWheel = document.getElementById("spinWheel");
const spinResult = document.getElementById("spinResult");
const spinMessage = document.getElementById("spinMessage");
const cardGrid = document.getElementById("cardGrid");
const allCardGrid = document.getElementById("allCardGrid");

const roomCode = document.getElementById("roomCode");
const opponentName = document.getElementById("opponentName");
const opponentState = document.getElementById("opponentState");
const matchStatus = document.getElementById("matchStatus");
const matchCountdown = document.getElementById("matchCountdown");

if (roomCode && opponentName && opponentState && matchStatus && matchCountdown) {
  const rivalNames = ["NEON_RONIN", "PIXEL_KAGE", "MOONFRAME", "DARK_SENPAI"];
  roomCode.textContent = `A${Math.floor(100 + Math.random() * 900)}`;
  const rival = rivalNames[Math.floor(Math.random() * rivalNames.length)];
  opponentName.textContent = rival;
  opponentState.textContent = "READY";
  matchStatus.textContent = "Rival connected. Room locked.";

  let count = 3;
  const countdownTimer = window.setInterval(() => {
    count -= 1;
    matchCountdown.textContent = count > 0 ? count.toString() : "GO";
    if (count <= 0) {
      window.clearInterval(countdownTimer);
      window.setTimeout(() => {
        window.location.href = "games.html";
      }, 500);
    }
  }, 900);
}

const quizModeLabel = document.getElementById("quizModeLabel");
const quizQuestion = document.getElementById("quizQuestion");
const quizAnswers = document.getElementById("quizAnswers");
const quizFeedback = document.getElementById("quizFeedback");

const quizModes = {
  character: {
    label: "CHARACTER QUIZ",
    question: "Which anime hero carries a straw hat?",
    answers: ["Naruto Uzumaki", "Monkey D. Luffy", "Ichigo Kurosaki", "Saitama"],
    correct: "Monkey D. Luffy"
  },
  opening: {
    label: "OPENING QUIZ",
    question: "Which series features the opening song ‘Gurenge’?",
    answers: ["Demon Slayer", "One Piece", "Bleach", "Jujutsu Kaisen"],
    correct: "Demon Slayer"
  },
  anime: {
    label: "ANIME QUIZ",
    question: "Which anime follows the mission to find the One Piece?",
    answers: ["Attack on Titan", "One Piece", "Death Note", "My Hero Academia"],
    correct: "One Piece"
  }
};

const quizMode = new URLSearchParams(window.location.search).get("mode") || "anime";
const activeQuiz = quizModes[quizMode] || quizModes.anime;

if (quizModeLabel && quizQuestion && quizAnswers && quizFeedback) {
  quizModeLabel.textContent = activeQuiz.label;
  quizQuestion.textContent = activeQuiz.question;
  quizAnswers.innerHTML = activeQuiz.answers.map((answer, index) => (
    `<button class="quiz-answer" type="button" data-answer="${answer}"><span>${String(index + 1).padStart(2, "0")}</span>${answer}</button>`
  )).join("");

  quizAnswers.addEventListener("click", (event) => {
    const answer = event.target.closest(".quiz-answer");
    if (!answer) return;

    const isCorrect = answer.dataset.answer === activeQuiz.correct;
    quizFeedback.textContent = isCorrect ? "CORRECT // SIGNAL CONFIRMED." : "WRONG ANSWER // TRY ANOTHER SIGNAL.";
    quizFeedback.classList.toggle("correct", isCorrect);
    answer.classList.toggle("correct", isCorrect);
    answer.classList.toggle("wrong", !isCorrect);
  });
}

const cardMarkup = Array.from({ length: 50 }, (_, index) => (
  index === 0
    ? '<span class="mini-card itachi-card" aria-label="Itachi, 30 percent drop chance"><img src="assets/itachi.jpg" alt="Itachi"><b>ITACHI</b><small>30% DROP</small></span>'
    : `<span class="mini-card" aria-label="Anime card ${index + 1}">${String(index + 1).padStart(2, "0")}</span>`
)).join("");

if (cardGrid) cardGrid.innerHTML = cardMarkup;
if (allCardGrid) allCardGrid.innerHTML = cardMarkup;

if (spinButton && spinWheel && spinResult && spinMessage) {
  const challenges = ["OPENING", "CHARACTER", "QUOTE", "VILLAIN", "POWER", "TRIVIA"];
  let spinCount = 0;

  spinButton.addEventListener("click", () => {
    spinButton.disabled = true;
    spinCount += 1;
    const selectedChallenge = challenges[(spinCount - 1) % challenges.length];
    spinWheel.style.transform = `rotate(${2160 + spinCount * 360}deg)`;
    spinResult.textContent = "SPINNING...";
    spinMessage.textContent = "Strong spin engaged. The anime signal is selecting your challenge.";

    setTimeout(() => {
      spinResult.textContent = selectedChallenge;
      spinMessage.textContent = `Your next challenge category is ${selectedChallenge}.`;
      spinButton.disabled = false;
    }, 3000);
  });
}

/* ---------- Site search ---------- */
(function initializeSiteSearch() {
  const index = [
    { type: "PAGE", title: "HOME", desc: "Main hub", url: "index.html", keys: "start landing main" },
    { type: "PAGE", title: "ANIME SIGNALS", desc: "Rankings, rates and upcoming anime", url: "anime.html", keys: "anime rankings rates upcoming" },
    { type: "PAGE", title: "GAMES", desc: "All multiplayer games", url: "games.html", keys: "play arcade" },
    { type: "PAGE", title: "SHOP", desc: "Retro cosmetics market", url: "shop.html", keys: "store buy market" },
    { type: "PAGE", title: "LEADERBOARD", desc: "Top players ranking", url: "leaderboard.html", keys: "rank scores top players" },
    { type: "PAGE", title: "FRIENDS", desc: "Friends and requests", url: "friends.html", keys: "social chat friend" },
    { type: "PAGE", title: "PROFILE", desc: "Your player profile", url: "profile.html", keys: "account avatar me" },
    { type: "PAGE", title: "SETTINGS", desc: "Site preferences", url: "settings.html", keys: "options config sound" },
    { type: "GAME", title: "ANIME IMPOSTER", desc: "Find the impostor who doesn't know the character", url: "anime-imposter.html", keys: "multiplayer social deduction spy" },
    { type: "GAME", title: "ANIME DRAFT", desc: "Draft your anime team and compete", url: "auction.html", keys: "auction bid team multiplayer" },
    { type: "GAME", title: "SPIN", desc: "Spin the arena for rewards", url: "spin.html", keys: "wheel cards rewards" },
    { type: "PAGE", title: "FAN ART", desc: "Share and like community fan art", url: "fanart.html", keys: "fanart fan art gallery drawings upload community" },
    { type: "PAGE", title: "CINEMA", desc: "Anime movies, trailers and watchlist", url: "cinema.html", keys: "cinema movies films trailers watchlist ghibli" },
    { type: "GAME", title: "CARD GAME", desc: "Stake a card, win 3 of 5 rounds", url: "card-game.html", keys: "cards duel stake battle collection" },
    { type: "GAME", title: "GUESS THE CITY", desc: "Guess the anime city", url: "guess-city.html", keys: "location geography" },
    { type: "SHOP", title: "BUY STAK", desc: "Top up your STAK balance", url: "shop.html?tab=packs", keys: "coins currency buy money stak" },
    { type: "SHOP", title: "PROFILE FRAMES", desc: "Avatar borders", url: "shop.html?tab=frames", keys: "avatar border cosmetic" },
    { type: "SHOP", title: "BADGES", desc: "Show off badges on your profile", url: "shop.html?tab=badges", keys: "badge cosmetic" },
    { type: "SHOP", title: "NICKNAME EFFECTS", desc: "Glowing name styles", url: "shop.html?tab=nicknames", keys: "nickname name cosmetic hacker" },
    { type: "SHOP", title: "PROFILE BACKGROUNDS", desc: "Profile backgrounds", url: "shop.html?tab=backgrounds", keys: "background cosmetic" },
    { type: "SHOP", title: "MY INVENTORY", desc: "Equip what you own", url: "shop.html?tab=inventory", keys: "owned equip items" },
    ...["JUJUTSU KAISEN", "ONE PIECE", "DEMON SLAYER", "BLEACH", "MY HERO ACADEMIA", "SOLO LEVELING", "CHAINSAW MAN", "SPY X FAMILY", "ONE PUNCH MAN"].map((name) => ({ type: "ANIME", title: name, desc: "View on Anime Signals", url: `anime.html?focus=${encodeURIComponent(name)}`, keys: "" }))
  ];
  const recentKey = "aniviaRecentSearches";
  const normalize = (value) => String(value || "").toLowerCase().replace(/[^a-z0-9 ]+/g, " ").replace(/\s+/g, " ").trim();
  const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const getRecent = () => { try { const list = JSON.parse(localStorage.getItem(recentKey) || "[]"); return Array.isArray(list) ? list.slice(0, 5) : []; } catch (error) { return []; } };
  const saveRecent = (term) => { const clean = term.trim(); if (!clean) return; localStorage.setItem(recentKey, JSON.stringify([clean, ...getRecent().filter((item) => item !== clean)].slice(0, 5))); };

  function score(item, tokens) {
    const title = normalize(item.title);
    const haystack = `${title} ${normalize(item.desc)} ${normalize(item.keys)} ${item.type.toLowerCase()}`;
    let total = 0;
    for (const token of tokens) {
      if (title === token) total += 100;
      else if (title.startsWith(token)) total += 60;
      else if (title.split(" ").some((word) => word.startsWith(token))) total += 40;
      else if (title.includes(token)) total += 25;
      else if (haystack.includes(token)) total += 10;
      else return 0;
    }
    return total;
  }

  const overlay = document.createElement("div");
  overlay.className = "site-search";
  overlay.hidden = true;
  overlay.innerHTML = `<div class="site-search-box" role="dialog" aria-modal="true" aria-label="Search ANIVIA">
    <div class="site-search-bar"><input type="search" class="site-search-input" placeholder="SEARCH ANIME, GAMES, SHOP, PAGES..." autocomplete="off" spellcheck="false" aria-label="Search"><button type="button" class="site-search-close" aria-label="Close search">ESC</button></div>
    <div class="site-search-results" role="listbox"></div>
    <div class="site-search-hint">↑ ↓ NAVIGATE &nbsp;•&nbsp; ENTER OPEN &nbsp;•&nbsp; / OR CTRL+K TO SEARCH</div></div>`;
  document.body.appendChild(overlay);
  const input = overlay.querySelector(".site-search-input");
  const resultsBox = overlay.querySelector(".site-search-results");
  let results = [];
  let active = 0;
  let lastFocus = null;

  function render() {
    const query = input.value.trim();
    const tokens = normalize(query).split(" ").filter(Boolean);
    if (!tokens.length) {
      const recent = getRecent();
      results = recent.length ? [] : index.filter((item) => item.type === "GAME").map((item) => ({ item }));
      resultsBox.innerHTML = (recent.length ? `<div class="site-search-label">RECENT</div>${recent.map((term) => `<button type="button" class="site-search-recent" data-term="${escapeHtml(term)}">↺ ${escapeHtml(term.toUpperCase())}</button>`).join("")}` : `<div class="site-search-label">POPULAR GAMES</div>`) + results.map((entry, i) => rowHtml(entry.item, i)).join("");
      active = 0;
      highlight();
      return;
    }
    results = [...index, ...postEntries()].map((item) => ({ item, score: score(item, tokens) })).filter((entry) => entry.score > 0).sort((a, b) => b.score - a.score || a.item.title.localeCompare(b.item.title)).slice(0, 12);
    active = 0;
    resultsBox.innerHTML = results.length ? results.map((entry, i) => rowHtml(entry.item, i)).join("") : `<div class="site-search-empty">NO RESULTS FOR "${escapeHtml(query.toUpperCase())}"</div>`;
    highlight();
  }
  function postEntries() { return [...document.querySelectorAll(".community-post")].map((el) => ({ type: "POST", title: (el.querySelector("h2") || el).textContent.trim().slice(0, 90), desc: "On this page", url: "#", keys: el.textContent, el })); }
  function rowHtml(item, i) { return `<a class="site-search-item" role="option" data-index="${i}" href="${item.url}"><span class="site-search-type">${item.type}</span><span class="site-search-text"><strong>${escapeHtml(item.title)}</strong><small>${escapeHtml(item.desc)}</small></span></a>`; }
  function highlight() {
    resultsBox.querySelectorAll(".site-search-item").forEach((el, i) => { el.classList.toggle("is-active", i === active); el.setAttribute("aria-selected", i === active ? "true" : "false"); });
    const current = resultsBox.querySelector(".site-search-item.is-active");
    if (current) current.scrollIntoView({ block: "nearest" });
  }
  function open() { lastFocus = document.activeElement; const bar = document.querySelector(".navbar"); if (bar) overlay.style.setProperty("--site-search-h", `${Math.round(bar.getBoundingClientRect().height)}px`); overlay.hidden = false; document.body.classList.add("site-search-open"); input.value = ""; render(); input.focus(); }
  function close() { overlay.hidden = true; document.body.classList.remove("site-search-open"); if (lastFocus && lastFocus.focus) lastFocus.focus(); }
  function go(entry) {
    if (!entry) return;
    saveRecent(input.value || entry.item.title);
    if (entry.item.el) { const post = entry.item.el; close(); post.classList.add("search-match"); post.scrollIntoView({ behavior: "smooth", block: "center" }); window.setTimeout(() => post.classList.remove("search-match"), 1800); return; }
    window.location.href = entry.item.url;
  }

  input.addEventListener("input", render);
  input.addEventListener("keydown", (event) => {
    const count = results.length;
    if (event.key === "ArrowDown" && count) { event.preventDefault(); active = (active + 1) % count; highlight(); }
    else if (event.key === "ArrowUp" && count) { event.preventDefault(); active = (active - 1 + count) % count; highlight(); }
    else if (event.key === "Enter") { event.preventDefault(); go(results[active]); }
  });
  resultsBox.addEventListener("click", (event) => {
    const recent = event.target.closest(".site-search-recent");
    if (recent) { input.value = recent.dataset.term; render(); input.focus(); return; }
    const link = event.target.closest(".site-search-item");
    if (link) { event.preventDefault(); go(results[Number(link.dataset.index)]); }
  });
  resultsBox.addEventListener("mousemove", (event) => { const link = event.target.closest(".site-search-item"); if (link && Number(link.dataset.index) !== active) { active = Number(link.dataset.index); highlight(); } });
  overlay.addEventListener("mousedown", (event) => { if (event.target === overlay) close(); });
  overlay.querySelector(".site-search-close").addEventListener("click", close);
  document.addEventListener("keydown", (event) => {
    const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement && document.activeElement.tagName) || (document.activeElement && document.activeElement.isContentEditable);
    if (event.key === "Escape" && !overlay.hidden) close();
    else if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") { event.preventDefault(); overlay.hidden ? open() : close(); }
    else if (event.key === "/" && !typing && overlay.hidden) { event.preventDefault(); open(); }
  });

  document.querySelectorAll(".nav-buttons").forEach((buttons) => {
    let button = buttons.querySelector('[aria-label="Search"]');
    if (!button) {
      button = document.createElement("button");
      button.type = "button";
      button.className = "icon-button";
      button.setAttribute("aria-label", "Search");
      button.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="5.5"></circle><path d="M16 16L21 21"></path></svg>';
      buttons.insertBefore(button, buttons.querySelector(".profile-button"));
    }
    button.addEventListener("click", (event) => { event.preventDefault(); open(); });
  });

  const focus = new URLSearchParams(window.location.search).get("focus");
  if (focus) {
    const target = normalize(focus);
    const match = [...document.querySelectorAll(".anime-ranking, .rate-feature, .upcoming-entry")].find((el) => normalize(el.textContent).includes(target));
    if (match) { match.classList.add("search-focus"); match.scrollIntoView({ block: "center", behavior: "smooth" }); }
  }
})();
