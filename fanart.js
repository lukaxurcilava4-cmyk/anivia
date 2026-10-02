(function () {
    var KEY = "aniviaFanArt";
    var ME = "aniviaFanArtMe";
    var $ = function (id) { return document.getElementById(id); };
    var sort = "new";
    var dataUrl = "";

    function load() {
        try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch (e) { return []; }
    }
    function save(list) {
        try { localStorage.setItem(KEY, JSON.stringify(list)); return true; } catch (e) { return false; }
    }
    function me() {
        var id = localStorage.getItem(ME);
        if (!id) { id = "u" + Math.random().toString(36).slice(2, 10); localStorage.setItem(ME, id); }
        return id;
    }
    function esc(s) {
        return String(s).replace(/[&<>"']/g, function (c) {
            return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
        });
    }

    function render() {
        var list = load(), uid = me(), q = $("faSearch").value.trim().toLowerCase();
        list = list.filter(function (a) { return !(window.AniviaMod && AniviaMod.isHidden(a.id)); });
        if (sort === "mine") list = list.filter(function (a) { return a.owner === uid; });
        if (q) list = list.filter(function (a) { return (a.title + " " + a.anime + " " + a.artist).toLowerCase().indexOf(q) > -1; });
        list.sort(function (a, b) {
            return sort === "top" ? b.likes.length - a.likes.length : b.date - a.date;
        });
        $("faEmpty").hidden = list.length > 0;
        $("faGrid").innerHTML = list.map(function (a) {
            var liked = a.likes.indexOf(uid) > -1;
            return '<article class="fa-card" data-id="' + a.id + '">' +
                '<img src="' + a.img + '" alt="' + esc(a.title) + '" data-view="1">' +
                '<div class="fa-meta"><b>' + esc(a.title) + '</b>' +
                '<span>' + esc(a.anime || "ORIGINAL") + ' // BY ' + esc(a.artist || "ANON") + '</span>' +
                '<div class="fa-row"><button type="button" class="fa-like' + (liked ? " on" : "") + '" data-like="1">♥ ' + a.likes.length + '</button>' +
                (a.owner === uid ? '<button type="button" class="fa-del" data-del="1">DELETE</button>' : '<button type="button" class="fa-del" data-report="1">⚑ REPORT</button>') +
                '</div></div></article>';
        }).join("");
    }

    function shrink(file, cb) {
        var reader = new FileReader();
        reader.onload = function () {
            var img = new Image();
            img.onload = function () {
                var max = 900, r = Math.min(1, max / Math.max(img.width, img.height));
                var c = document.createElement("canvas");
                c.width = Math.round(img.width * r); c.height = Math.round(img.height * r);
                c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
                cb(c.toDataURL("image/jpeg", 0.8));
            };
            img.onerror = function () { cb(""); };
            img.src = reader.result;
        };
        reader.readAsDataURL(file);
    }

    function closeModal() {
        $("faModal").hidden = true;
        $("faForm").reset();
        $("faPreview").hidden = true;
        $("faMsg").textContent = "";
        dataUrl = "";
    }

    $("faOpen").onclick = function () {
        $("faArtist").value = localStorage.getItem("aniviaFanArtName") || "";
        $("faModal").hidden = false;
    };
    $("faCancel").onclick = closeModal;
    $("faModal").onclick = function (e) { if (e.target === this) closeModal(); };

    $("faFile").onchange = function () {
        var f = this.files[0];
        if (!f) return;
        shrink(f, function (url) {
            dataUrl = url;
            $("faPreview").src = url;
            $("faPreview").hidden = !url;
            $("faMsg").textContent = url ? "" : "COULD NOT READ THAT IMAGE.";
        });
    };

    $("faForm").onsubmit = function (e) {
        e.preventDefault();
        if (!dataUrl) { $("faMsg").textContent = "CHOOSE AN IMAGE FIRST."; return; }
        var list = load();
        var artist = $("faArtist").value.trim();
        var bad = AniviaMod.check($("faTitle").value + " " + $("faAnime").value + " " + artist);
        if (bad) { $("faMsg").textContent = bad.message; return; }
        list.push({
            id: "a" + Date.now(), img: dataUrl, title: $("faTitle").value.trim(),
            anime: $("faAnime").value.trim(), artist: artist, owner: me(), likes: [], date: Date.now()
        });
        if (!save(list)) { $("faMsg").textContent = "STORAGE FULL. DELETE SOME ART FIRST."; return; }
        if (artist) localStorage.setItem("aniviaFanArtName", artist);
        closeModal();
        render();
    };

    $("faGrid").onclick = function (e) {
        var card = e.target.closest(".fa-card");
        if (!card) return;
        var list = load(), a = list.filter(function (x) { return x.id === card.dataset.id; })[0];
        if (!a) return;
        if (e.target.dataset.like) {
            var i = a.likes.indexOf(me());
            if (i > -1) a.likes.splice(i, 1); else a.likes.push(me());
            save(list); render();
        } else if (e.target.dataset.report) {
            AniviaMod.pickReason(function (reason) { AniviaMod.sendReport(a.id, "art", reason); render(); });
        } else if (e.target.dataset.del) {
            if (!confirm("Delete this art?")) return;
            save(list.filter(function (x) { return x.id !== a.id; })); render();
        } else if (e.target.dataset.view) {
            var box = $("faLight");
            box.querySelector("img").src = a.img;
            box.querySelector("p").textContent = a.title;
            box.hidden = false;
        }
    };
    $("faLight").onclick = function () { this.hidden = true; };

    $("faFilters").onclick = function (e) {
        var b = e.target.closest("button");
        if (!b) return;
        sort = b.dataset.sort;
        Array.prototype.forEach.call(this.children, function (x) { x.classList.toggle("active", x === b); });
        render();
    };
    $("faSearch").oninput = render;

    render();
})();
