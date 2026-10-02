(function () {
    var box = document.getElementById("faStrip");
    if (!box) return;
    var list = [];
    try { list = JSON.parse(localStorage.getItem("aniviaFanArt")) || []; } catch (e) {}
    list = list.filter(function (a) { return !(window.AniviaMod && AniviaMod.isHidden(a.id)); });
    list.sort(function (a, b) { return b.date - a.date; });
    if (!list.length) {
        box.innerHTML = '<a class="fa-strip-empty" href="fanart.html">NO FAN ART YET. UPLOAD THE FIRST ONE →</a>';
        return;
    }
    function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
    box.innerHTML = list.slice(0, 8).map(function (a) {
        return '<a class="fa-strip-item" href="fanart.html"><img src="' + a.img + '" alt="' + esc(a.title) + '"><span>' + esc(a.title) + '</span><small>♥ ' + a.likes.length + ' // ' + esc(a.artist || "ANON") + '</small></a>';
    }).join("");
})();