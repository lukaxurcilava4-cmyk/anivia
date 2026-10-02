(function () {
    var MOVIES = [
        { id: "spirited-away", t: "Spirited Away", y: 2001, d: "Hayao Miyazaki", g: ["Fantasy", "Family"], s: "A girl wanders into a spirit world and must work in a bathhouse to free her parents.", c: ["#7b2cff", "#16c7b8"] },
        { id: "your-name", t: "Your Name", y: 2016, d: "Makoto Shinkai", g: ["Romance", "Fantasy"], s: "Two strangers mysteriously swap bodies and search for each other across time.", c: ["#ff5c8a", "#4a2cff"] },
        { id: "akira", t: "Akira", y: 1988, d: "Katsuhiro Otomo", g: ["Sci-Fi", "Action"], s: "In a neon Neo-Tokyo, a biker gang leader faces a secret psychic experiment.", c: ["#ff2c3c", "#2a0a3a"] },
        { id: "princess-mononoke", t: "Princess Mononoke", y: 1997, d: "Hayao Miyazaki", g: ["Fantasy", "Adventure"], s: "A prince caught in a war between forest gods and an iron-making town.", c: ["#1d8a4a", "#0a2a1a"] },
        { id: "weathering-with-you", t: "Weathering With You", y: 2019, d: "Makoto Shinkai", g: ["Romance", "Fantasy"], s: "A runaway meets a girl who can control the weather in endless rainy Tokyo.", c: ["#3aa0ff", "#1a1a5a"] },
        { id: "a-silent-voice", t: "A Silent Voice", y: 2016, d: "Naoko Yamada", g: ["Drama"], s: "A former bully seeks redemption with the deaf girl he once tormented.", c: ["#ffb35c", "#7b2cff"] },
        { id: "ghost-in-the-shell", t: "Ghost in the Shell", y: 1995, d: "Mamoru Oshii", g: ["Sci-Fi", "Action"], s: "A cyborg agent hunts a mysterious hacker who blurs the line between human and machine.", c: ["#16c7b8", "#0a0a2a"] },
        { id: "demon-slayer-mugen-train", t: "Demon Slayer: Mugen Train", y: 2020, d: "Haruo Sotozaki", g: ["Action", "Fantasy"], s: "Tanjiro and the Flame Hashira board a train haunted by a demon.", c: ["#ff7a2c", "#5a0a1a"] },
        { id: "jujutsu-kaisen-0", t: "Jujutsu Kaisen 0", y: 2021, d: "Sunghoo Park", g: ["Action", "Fantasy"], s: "Yuta Okkotsu is bound to a powerful curse and enrolls at Jujutsu High.", c: ["#2c5cff", "#1a0a3a"] },
        { id: "perfect-blue", t: "Perfect Blue", y: 1997, d: "Satoshi Kon", g: ["Thriller", "Drama"], s: "A pop idol turned actress is haunted by a stalker and her own identity.", c: ["#4a2cff", "#c02cff"] },
        { id: "howls-moving-castle", t: "Howl's Moving Castle", y: 2004, d: "Hayao Miyazaki", g: ["Fantasy", "Romance"], s: "A cursed young woman finds shelter in a wizard's walking castle.", c: ["#ffcc5c", "#2c7bff"] },
        { id: "my-neighbor-totoro", t: "My Neighbor Totoro", y: 1988, d: "Hayao Miyazaki", g: ["Family", "Fantasy"], s: "Two sisters meet gentle forest spirits in the countryside.", c: ["#5cc02c", "#1a5a3a"] },
        { id: "grave-of-the-fireflies", t: "Grave of the Fireflies", y: 1988, d: "Isao Takahata", g: ["Drama"], s: "Two siblings struggle to survive in the final months of World War II.", c: ["#c08a2c", "#1a1a1a"] },
        { id: "the-boy-and-the-heron", t: "The Boy and the Heron", y: 2023, d: "Hayao Miyazaki", g: ["Fantasy", "Adventure"], s: "A grieving boy follows a talking heron into a strange world.", c: ["#2c8aff", "#3a1a5a"] },
        { id: "suzume", t: "Suzume", y: 2022, d: "Makoto Shinkai", g: ["Adventure", "Fantasy"], s: "A teenager closes mysterious doors that unleash disasters across Japan.", c: ["#ff5c5c", "#2c3aff"] },
        { id: "five-centimeters", t: "5 Centimeters per Second", y: 2007, d: "Makoto Shinkai", g: ["Romance", "Drama"], s: "Three chapters follow two childhood friends drifting apart over the years.", c: ["#ffaacc", "#5c7bff"] }
    ];

    var $ = function (id) { return document.getElementById(id); };
    var gen = "ALL", q = "", view = "all", sortBy = "year";
    function allMovies() { return (window.CNComm || []).concat(MOVIES); }

    function load(k) { try { return JSON.parse(localStorage.getItem(k)) || {}; } catch (e) { return {}; } }
    function save(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* storage unavailable */ } }
    function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
    function trailer(m) { return "https://www.youtube.com/results?search_query=" + encodeURIComponent(m.t + " " + m.y + " official trailer"); }

    var genres = ["ALL", "Comedy", "Horror"];
    MOVIES.forEach(function (m) { m.g.forEach(function (x) { if (genres.indexOf(x) < 0) genres.push(x); }); });
    $("cnGenres").innerHTML = genres.map(function (g) { return '<button type="button" data-g="' + g + '"' + (g === gen ? ' class="active"' : "") + ">" + g.toUpperCase() + "</button>"; }).join("");

    function stars(n) { var s = ""; for (var i = 1; i <= 5; i++) s += '<button type="button" class="cn-star' + (i <= n ? " on" : "") + '" data-star="' + i + '" aria-label="Rate ' + i + '">★</button>'; return s; }

    function render() {
        var wl = load("aniviaWatchlist"), rt = load("aniviaCinemaRatings");
        if (view === "studio") { $("cnGrid").hidden = true; $("cnEmpty").hidden = true; $("cnStudio").hidden = false; if (window.CNStudio) CNStudio.renderStudio(); return; }
        $("cnGrid").hidden = false; $("cnStudio").hidden = true;
        var list = allMovies().filter(function (m) {
            if (m.comm && window.AniviaMod && AniviaMod.isHidden(m.id)) return false;
            if (gen !== "ALL" && m.g.indexOf(gen) < 0) return false;
            if (view === "watchlist" && !wl[m.id]) return false;
            if (q && (m.t + " " + m.d + " " + m.g.join(" ")).toLowerCase().indexOf(q) < 0) return false;
            return true;
        });
        list.sort(function (a, b) {
            if (sortBy === "rating") return (rt[b.id] || 0) - (rt[a.id] || 0);
            if (sortBy === "az") return a.t.localeCompare(b.t);
            return b.y - a.y;
        });
        $("cnEmpty").hidden = list.length > 0;
        $("cnEmpty").textContent = view === "watchlist" ? "YOUR WATCHLIST IS EMPTY. ADD MOVIES WITH THE + BUTTON." : "NO MOVIES MATCH.";
        $("cnGrid").innerHTML = list.map(function (m) {
            return '<article class="cn-card" data-id="' + m.id + '">' +
                '<div class="cn-poster" style="background:' + (m.posterUrl ? "linear-gradient(transparent 55%,rgba(0,0,0,.85)),url(" + m.posterUrl + ") center/cover" : "linear-gradient(160deg," + m.c[0] + "," + m.c[1] + ")") + '"><span class="cn-year">' + (m.comm ? "🎟 " + m.price + " STAK" : m.y) + '</span><b>' + esc(m.t) + '</b>' +
                '<button type="button" class="cn-wl' + (wl[m.id] ? " on" : "") + '" data-wl="1" aria-label="Toggle watchlist">' + (wl[m.id] ? "✓" : "+") + '</button></div>' +
                '<div class="cn-info"><small>' + esc(m.d) + " // " + m.g.join(" / ").toUpperCase() + '</small><div class="cn-stars">' + stars(rt[m.id] || 0) + '</div></div></article>';
        }).join("");
    }

    function openModal(m) {
        var rt = load("aniviaCinemaRatings"), wl = load("aniviaWatchlist");
        var box = $("cnModal");
        box.querySelector(".cn-m-poster").style.background = "linear-gradient(160deg," + m.c[0] + "," + m.c[1] + ")";
        box.querySelector(".cn-m-poster").textContent = m.t;
        box.querySelector("h2").textContent = m.t + " (" + m.y + ")";
        box.querySelector(".cn-m-meta").textContent = "DIRECTOR: " + m.d.toUpperCase() + " // " + m.g.join(" / ").toUpperCase();
        box.querySelector(".cn-m-sum").textContent = m.s;
        box.querySelector(".cn-m-trailer").href = trailer(m);
        var b = box.querySelector(".cn-m-wl");
        b.dataset.id = m.id;
        b.textContent = wl[m.id] ? "✓ IN WATCHLIST" : "+ ADD TO WATCHLIST";
        box.hidden = false;
    }

    $("cnGenres").onclick = function (e) {
        var b = e.target.closest("button"); if (!b) return;
        gen = b.dataset.g;
        Array.prototype.forEach.call(this.children, function (x) { x.classList.toggle("active", x === b); });
        render();
    };
    $("cnView").onclick = function (e) {
        var b = e.target.closest("button"); if (!b) return;
        view = b.dataset.v;
        Array.prototype.forEach.call(this.children, function (x) { x.classList.toggle("active", x === b); });
        render();
    };
    $("cnSort").onchange = function () { sortBy = this.value; render(); };
    $("cnSearch").oninput = function () { q = this.value.trim().toLowerCase(); render(); };

    $("cnGrid").onclick = function (e) {
        var card = e.target.closest(".cn-card"); if (!card) return;
        var id = card.dataset.id;
        if (e.target.dataset.wl) {
            var wl = load("aniviaWatchlist"); if (wl[id]) delete wl[id]; else wl[id] = 1;
            save("aniviaWatchlist", wl); render();
        } else if (e.target.dataset.star) {
            var rt = load("aniviaCinemaRatings"), n = Number(e.target.dataset.star);
            if (rt[id] === n) delete rt[id]; else rt[id] = n;
            save("aniviaCinemaRatings", rt); render();
        } else {
            var m = allMovies().filter(function (x) { return x.id === id; })[0];
            if (m && m.comm) CNStudio.open(m); else if (m) openModal(m);
        }
    };
    $("cnModal").onclick = function (e) {
        if (e.target === this || e.target.classList.contains("cn-m-close")) { this.hidden = true; return; }
        var b = e.target.closest(".cn-m-wl");
        if (b) {
            var wl = load("aniviaWatchlist"), id = b.dataset.id;
            if (wl[id]) delete wl[id]; else wl[id] = 1;
            save("aniviaWatchlist", wl);
            b.textContent = wl[id] ? "✓ IN WATCHLIST" : "+ ADD TO WATCHLIST";
            render();
        }
    };

    var feat = MOVIES[Math.floor(Date.now() / 86400000) % MOVIES.length];
    $("cnFeat").style.background = "linear-gradient(rgba(0,0,0,.45),rgba(0,0,0,.45)),linear-gradient(120deg," + feat.c[0] + "," + feat.c[1] + ")";
    $("cnFeatTitle").textContent = feat.t;
    $("cnFeatSum").textContent = feat.s;
    $("cnFeatBtn").onclick = function () { openModal(feat); };

    window.CNRender = render;
    render();
})();
