(function () {
    var FEE = 0.1;
    var GENRES = ["Action", "Adventure", "Comedy", "Drama", "Family", "Fantasy", "Horror", "Romance", "Sci-Fi", "Thriller"];
    var $ = function (id) { return document.getElementById(id); };
    var urls = {};
    var current = null;
    var mode = "trailer";

    /* ---------- storage ---------- */
    var dbp;
    function db() {
        if (!dbp) dbp = new Promise(function (res, rej) {
            var r = indexedDB.open("aniviaCinema", 1);
            r.onupgradeneeded = function () { r.result.createObjectStore("films", { keyPath: "id" }); };
            r.onsuccess = function () { res(r.result); };
            r.onerror = function () { rej(r.error); };
        });
        return dbp;
    }
    function tx(mode, fn) {
        return db().then(function (d) {
            return new Promise(function (res, rej) {
                var t = d.transaction("films", mode), req = fn(t.objectStore("films"));
                t.oncomplete = function () { res(req && req.result); };
                t.onerror = t.onabort = function () { rej(t.error); };
            });
        });
    }
    function jget(k) { try { return JSON.parse(localStorage.getItem(k)) || {}; } catch (e) { return {}; } }
    function jset(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* storage unavailable */ } }
    var REMOTE = !!(window.aniviaStak && aniviaStak.online);
    var uid = null, tickets = {};
    function sb() { return aniviaStak.getClient(); }
    function rpc(name, args) {
        return sb().then(function (c) { return c.rpc(name, args); }).then(function (r) {
            if (r.error) throw new Error((r.error.message.match(/[A-Z_]{6,}/) || ["REQUEST_FAILED"])[0]);
            return r.data;
        });
    }
    function me() {
        if (REMOTE) return uid || "pending";
        var id = localStorage.getItem("aniviaCreatorId");
        if (!id) { id = "c" + Math.random().toString(36).slice(2, 10); localStorage.setItem("aniviaCreatorId", id); }
        return id;
    }
    function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
    function say(el, msg) { el.textContent = msg; }
    function toast(m) { if (window.AniviaMod) AniviaMod.toast(m); }
    function errText(e) {
        var m = (e && e.message) || "";
        if (m === "NOT_ENOUGH_STAK") return "NOT ENOUGH STAK. BUY MORE IN THE SHOP.";
        var map = {
            ALREADY_OWNED: "YOU ALREADY HAVE THIS TICKET.", OWN_FILM: "THIS IS YOUR OWN FILM.", FILM_NOT_FOUND: "THIS FILM IS NO LONGER AVAILABLE.",
            NOT_AUTHENTICATED: "SIGN-IN FAILED. RELOAD THE PAGE.", ACCOUNT_REQUIRED: "CREATE A FULL ACCOUNT FIRST.",
            UPLOAD_LIMIT: "UPLOAD LIMIT REACHED (10 PER DAY).", CONTENT_NOT_ALLOWED: "BLOCKED: NSFW, HATE OR BULLYING IS NOT ALLOWED.",
            BELOW_MINIMUM: "BELOW THE PAYOUT MINIMUM.", NOT_ENOUGH_EARNINGS: "NOT ENOUGH EARNINGS.", CONTACT_REQUIRED: "ENTER A VALID PAYOUT CONTACT.",
            FILE_MISSING: "UPLOAD FAILED. TRY AGAIN."
        };
        return map[m] || "SOMETHING WENT WRONG. TRY AGAIN.";
    }

    /* ---------- catalog ---------- */
    var recs = {};
    function toMovie(r) {
        if (!urls[r.id]) urls[r.id] = r.posterUrl || URL.createObjectURL(r.poster);
        return { id: r.id, comm: true, t: r.title, y: new Date(r.date).getFullYear(), d: r.creator, g: r.genres, s: r.desc, price: r.price, posterUrl: urls[r.id], owner: r.owner, c: ["#7b2cff", "#16c7b8"] };
    }
    function loadRemote() {
        return sb().then(function (c) {
            return c.auth.getUser().then(function (u) {
                uid = u.data.user && u.data.user.id;
                return Promise.all([c.from("cinema_films").select("*").order("created_at", { ascending: false }), c.from("cinema_tickets").select("film_id")]);
            }).then(function (rs) {
                if (rs[0].error) throw rs[0].error;
                tickets = {};
                (rs[1].data || []).forEach(function (t) { tickets[t.film_id] = 1; });
                recs = {};
                var list = rs[0].data.filter(function (f) { return f.status === "live" || f.owner === uid; });
                list.forEach(function (f) {
                    var pb = function (p) { return c.storage.from("cinema-public").getPublicUrl(p).data.publicUrl; };
                    recs[f.id] = { id: f.id, title: f.title, desc: f.description, creator: f.creator_name, genres: f.genres, price: f.price, owner: f.owner, date: Date.parse(f.created_at), status: f.status, videoPath: f.video_path, posterUrl: pb(f.poster_path), trailerUrl: pb(f.trailer_path) };
                });
                window.CNComm = list.filter(function (f) { return f.status === "live"; }).map(function (f) { return toMovie(recs[f.id]); });
                if (window.CNRender) CNRender();
            });
        }).catch(function () { window.CNComm = []; });
    }
    function loadAll() {
        if (REMOTE) return loadRemote();
        return tx("readonly", function (s) { return s.getAll(); }).then(function (list) {
            recs = {};
            list.sort(function (a, b) { return b.date - a.date; });
            list.forEach(function (r) { recs[r.id] = r; });
            window.CNComm = list.map(toMovie);
            if (window.CNRender) CNRender();
        }).catch(function () { window.CNComm = []; });
    }
    function owns(m) { return m.owner === me() || !!(REMOTE ? tickets : jget("aniviaTickets"))[m.id]; }

    /* ---------- film modal ---------- */
    function setSrc(src, label) {
        var v = $("cnVideo");
        v.src = src;
        v.load();
        say($("cnVideoLabel"), label);
    }
    function setVideo(blob, label) {
        if (urls.video) URL.revokeObjectURL(urls.video);
        urls.video = URL.createObjectURL(blob);
        setSrc(urls.video, label);
    }
    function showTrailer() {
        var r = recs[current.id];
        if (REMOTE) setSrc(r.trailerUrl, "FREE TRAILER"); else setVideo(r.trailer, "FREE TRAILER");
    }
    function refreshButtons() {
        var m = current, own = owns(m);
        $("cnFilmBuy").textContent = own ? (mode === "full" ? "✓ TICKET OWNED" : "▶ WATCH FULL FILM") : "🎟 BUY TICKET · " + m.price + " STAK";
        $("cnFilmBuy").disabled = own && mode === "full";
        $("cnFilmTrailer").hidden = mode !== "full";
        $("cnFilmReport").hidden = m.owner === me();
    }
    function open(m) {
        current = m; mode = "trailer";
        say($("cnFilmTitle"), m.t + " (" + m.y + ")");
        say($("cnFilmMeta"), "BY " + m.d.toUpperCase() + " // " + m.g.join(" / ").toUpperCase() + " // TICKET " + m.price + " STAK");
        say($("cnFilmDesc"), m.s);
        say($("cnFilmMsg"), "");
        showTrailer();
        refreshButtons();
        $("cnFilm").hidden = false;
    }
    function closeFilm() {
        var v = $("cnVideo");
        v.pause(); v.removeAttribute("src"); v.load();
        $("cnFilm").hidden = true; current = null;
    }
    function watchFull() {
        var m = current;
        if (REMOTE) {
            say($("cnFilmMsg"), "LOADING FILM...");
            return sb().then(function (c) { return c.storage.from("cinema-films").createSignedUrl(recs[m.id].videoPath, 3600); }).then(function (r) {
                if (current !== m) return;
                if (r.error || !r.data) { say($("cnFilmMsg"), "COULD NOT LOAD THE FILM. TRY AGAIN."); return; }
                mode = "full";
                setSrc(r.data.signedUrl, "FULL FILM");
                say($("cnFilmMsg"), "");
                $("cnVideo").play().catch(function () {});
                refreshButtons();
            });
        }
        mode = "full";
        setVideo(recs[m.id].video, "FULL FILM");
        $("cnVideo").play().catch(function () {});
        refreshButtons();
    }
    function buyTicket() {
        var m = current;
        if (owns(m)) { watchFull(); return; }
        if (!window.aniviaStak) { say($("cnFilmMsg"), "STAK WALLET IS NOT AVAILABLE."); return; }
        var btn = $("cnFilmBuy");
        btn.disabled = true;
        say($("cnFilmMsg"), "PROCESSING...");
        var paid = REMOTE ? rpc("cinema_buy_ticket", { p_film_id: m.id }).then(function () { tickets[m.id] = 1; return aniviaStak.refresh(); }) : aniviaStak.spend(m.price).then(function () {
            var t = jget("aniviaTickets"); t[m.id] = Date.now(); jset("aniviaTickets", t);
            var led = jget("aniviaStudio"), e = led[m.id] || { sold: 0, earned: 0 };
            e.sold += 1; e.earned += Math.floor(m.price * (1 - FEE)); led[m.id] = e; jset("aniviaStudio", led);
        });
        paid.then(function () {
            say($("cnFilmMsg"), "TICKET BOUGHT. ENJOY THE FILM!");
            btn.disabled = false;
            watchFull();
        }).catch(function (e) {
            btn.disabled = false;
            say($("cnFilmMsg"), errText(e));
        });
    }

    $("cnFilmBuy").onclick = buyTicket;
    $("cnFilmTrailer").onclick = function () { mode = "trailer"; showTrailer(); refreshButtons(); };
    $("cnFilmClose").onclick = closeFilm;
    $("cnFilm").onclick = function (e) { if (e.target === this) closeFilm(); };
    $("cnFilmReport").onclick = function () {
        var m = current;
        AniviaMod.pickReason(function (reason) {
            if (REMOTE) rpc("cinema_report", { p_film_id: m.id, p_reason: reason }).then(loadAll).catch(function () { toast("COULD NOT SEND THE REPORT."); });
            else AniviaMod.sendReport(m.id, "film", reason);
            closeFilm();
            if (window.CNRender) CNRender();
        });
    };

    /* ---------- studio ---------- */
    function row(r, st) {
        var img = REMOTE ? r.posterUrl : urls[r.id];
        return '<div class="cn-row" data-id="' + r.id + '"><img src="' + img + '" alt=""><div><b>' + esc(r.title) + (st && st.status && st.status !== "live" ? " (" + st.status.toUpperCase() + ")" : "") + '</b><small>' + r.price + ' STAK // ' + st.sold + ' SOLD // ' + st.earned + ' EARNED</small></div><button type="button" class="outline-button" data-del="1">DELETE</button></div>';
    }
    function drawStudio(films, sold, earned, extra) {
        $("cnStudio").innerHTML = '<div class="cn-stats"><div><b>' + films.length + '</b><small>FILMS</small></div><div><b>' + sold + '</b><small>TICKETS SOLD</small></div><div><b>' + earned + '</b><small>EARNED (STAK, AFTER ' + (FEE * 100) + '% FEE)</small></div></div>' +
            (films.length ? "" : '<p class="shop-status">YOU HAVE NOT UPLOADED ANYTHING YET. PRESS + UPLOAD ANIMATION.</p>') +
            films.join("") + extra;
    }
    function renderStudio() {
        if (REMOTE) {
            rpc("cinema_studio_stats").then(function (s) {
                var sold = 0;
                var rows = s.films.map(function (f) {
                    sold += f.sold;
                    var base = recs[f.id] || { id: f.id, title: f.title, price: f.price, posterUrl: "" };
                    return row(base, f);
                });
                var extra = '<p class="cn-m-meta">AVAILABLE TO WITHDRAW: <b>' + s.balance + ' STAK</b> // MINIMUM PAYOUT ' + s.payout_min + ' STAK</p>' +
                    '<button type="button" class="outline-button" id="cnPayout" data-min="' + s.payout_min + '" data-bal="' + s.balance + '">REQUEST PAYOUT</button>' +
                    '<p class="cn-m-meta">PAYOUTS ARE REVIEWED AND SENT MANUALLY.</p>';
                drawStudio(rows, sold, s.lifetime, extra);
            }).catch(function (err) { $("cnStudio").innerHTML = '<p class="shop-status">' + errText(err) + "</p>"; });
            return;
        }
        var mine = Object.keys(recs).map(function (k) { return recs[k]; }).filter(function (r) { return r.owner === me(); });
        var led = jget("aniviaStudio"), sold = 0, earned = 0;
        mine.forEach(function (r) { var e = led[r.id] || { sold: 0, earned: 0 }; sold += e.sold; earned += e.earned; });
        drawStudio(mine.map(function (r) { return row(r, led[r.id] || { sold: 0, earned: 0 }); }), sold, earned, '<p class="cn-m-meta">LOCAL DEMO MODE. CONNECT SUPABASE FOR REAL TICKETS AND PAYOUTS.</p>');
    }
    $("cnStudio").onclick = function (e) {
        if (e.target.id === "cnPayout") {
            var min = Number(e.target.dataset.min), bal = Number(e.target.dataset.bal);
            if (bal < min) { toast("YOU NEED AT LEAST " + min + " STAK TO REQUEST A PAYOUT."); return; }
            var amount = Number(prompt("How many STAK to withdraw? (" + min + " - " + bal + ")", String(bal)));
            if (!amount) return;
            var contact = prompt("Where should we send the payment? (PayPal email or other contact)");
            if (!contact) return;
            rpc("cinema_request_payout", { p_amount: amount, p_contact: contact }).then(function () { toast("PAYOUT REQUESTED."); renderStudio(); }).catch(function (err) { toast(errText(err)); });
            return;
        }
        var r = e.target.closest(".cn-row");
        if (!r || !e.target.dataset.del) return;
        if (!confirm("Delete this film? Ticket holders keep access for 30 days.")) return;
        var done = REMOTE ? rpc("cinema_delete_film", { p_film_id: r.dataset.id }) : tx("readwrite", function (s) { return s.delete(r.dataset.id); });
        done.then(loadAll).then(renderStudio).catch(function (err) { toast(errText(err)); });
    };

    /* ---------- upload ---------- */
    $("upGenres").innerHTML = '<span>GENRES (PICK 1-3)</span>' + GENRES.map(function (g) { return '<label class="cn-chip"><input type="checkbox" value="' + g + '"> ' + g + "</label>"; }).join("");

    function meta(file) {
        return new Promise(function (res, rej) {
            var v = document.createElement("video"), u = URL.createObjectURL(file);
            v.preload = "metadata";
            v.onloadedmetadata = function () {
                var w = v.videoWidth;
                function done() { var d = v.duration; URL.revokeObjectURL(u); isFinite(d) && w ? res({ d: d, w: w }) : rej(); }
                if (v.duration === Infinity) { v.onseeked = done; v.currentTime = 1e101; } else done();
            };
            v.onerror = function () { URL.revokeObjectURL(u); rej(); };
            v.src = u;
        });
    }
    function posterBlob(file) {
        return new Promise(function (res, rej) {
            var img = new Image(), u = URL.createObjectURL(file);
            img.onload = function () {
                URL.revokeObjectURL(u);
                if (img.width < 400 || img.height < img.width) { rej(new Error("POSTER MUST BE PORTRAIT AND AT LEAST 400PX WIDE.")); return; }
                var W = 600, H = 900, c = document.createElement("canvas");
                c.width = W; c.height = H;
                var s = Math.max(W / img.width, H / img.height), w = img.width * s, h = img.height * s;
                c.getContext("2d").drawImage(img, (W - w) / 2, (H - h) / 2, w, h);
                c.toBlob(function (b) { b ? res(b) : rej(new Error("POSTER COULD NOT BE PROCESSED.")); }, "image/jpeg", 0.85);
            };
            img.onerror = function () { URL.revokeObjectURL(u); rej(new Error("POSTER IS NOT A VALID IMAGE.")); };
            img.src = u;
        });
    }

    function showChecks(list) {
        $("upChecks").innerHTML = list.map(function (c) { return '<li class="' + c.s + '">' + (c.s === "ok" ? "✓ " : c.s === "bad" ? "✗ " : "… ") + esc(c.t) + "</li>"; }).join("");
    }

    function closeUpload() { $("cnUpload").hidden = true; $("cnUpForm").reset(); $("upChecks").innerHTML = ""; $("upSubmit").disabled = false; }
    $("cnUpOpen").onclick = function () {
        $("upCreator").value = localStorage.getItem("aniviaCreatorName") || "";
        $("cnUpload").hidden = false;
    };
    $("upCancel").onclick = closeUpload;

    $("cnUpForm").onsubmit = function (e) {
        e.preventDefault();
        var btn = $("upSubmit");
        var title = $("upTitle").value.trim(), desc = $("upDesc").value.trim(), creator = $("upCreator").value.trim();
        var price = Math.floor(Number($("upPrice").value)), sign = $("upSign").value.trim();
        var genres = Array.prototype.filter.call($("upGenres").querySelectorAll("input"), function (i) { return i.checked; }).map(function (i) { return i.value; });
        var poster = $("upPoster").files[0], trailer = $("upTrailer").files[0], video = $("upVideo").files[0];
        var checks = [], out = {};
        function step(t) { var c = { t: t, s: "run" }; checks.push(c); showChecks(checks); return c; }
        function ok(c) { c.s = "ok"; showChecks(checks); }
        function fail(c, why) { c.t = why; c.s = "bad"; showChecks(checks); btn.disabled = false; }

        btn.disabled = true;
        var chain = Promise.resolve();
        function run(label, fn) {
            chain = chain.then(function () {
                var c = step(label);
                return Promise.resolve().then(fn).then(function () { ok(c); }, function (err) { fail(c, (err && err.message) || label + " FAILED"); throw err || new Error(label); });
            });
        }

        run("Agreements accepted and signed", function () {
            if (!["upT1", "upT2", "upT3", "upT4"].every(function (i) { return $(i).checked; })) throw new Error("YOU MUST ACCEPT ALL TERMS AND DECLARATIONS.");
            if (sign.split(/\s+/).length < 2 || sign.length < 5) throw new Error("TYPE YOUR FULL LEGAL NAME (FIRST AND LAST) TO SIGN.");
        });
        run("Details and ticket price", function () {
            if (genres.length < 1 || genres.length > 3) throw new Error("PICK 1 TO 3 GENRES.");
            if (!(price >= 10 && price <= 5000)) throw new Error("TICKET PRICE MUST BE 10 - 5000 STAK.");
            if (!poster || !trailer || !video) throw new Error("POSTER, TRAILER AND FULL FILM ARE ALL REQUIRED.");
        });
        run("Content check (no NSFW, hate or bullying)", function () {
            var bad = window.AniviaMod && AniviaMod.check(title + " " + desc + " " + creator);
            if (bad) throw new Error(bad.message);
        });
        run("Poster", function () { return posterBlob(poster).then(function (b) { out.poster = b; }); });
        run("Free trailer (max 120s, 60MB)", function () {
            if (trailer.size > 60 * 1048576) throw new Error("TRAILER IS OVER 60MB.");
            return meta(trailer).then(function (m) { if (m.d > 120) throw new Error("TRAILER IS LONGER THAN 120 SECONDS."); out.trailerDur = m.d; }, function (e) { throw e || new Error("TRAILER CANNOT BE PLAYED. USE MP4 OR WEBM."); });
        });
        run("Full animation (playable, max 250MB)", function () {
            if (video.size > 250 * 1048576) throw new Error("FILM IS OVER 250MB.");
            return meta(video).then(function (m) {
                if (m.d < 30) throw new Error("FILM MUST BE AT LEAST 30 SECONDS.");
                if (m.d <= (out.trailerDur || 0)) throw new Error("FILM MUST BE LONGER THAN ITS TRAILER.");
                out.duration = m.d;
            }, function (e) { throw e || new Error("FILM CANNOT BE PLAYED. USE MP4 OR WEBM."); });
        });
        if (REMOTE) {
            run("Uploading files (large films can take a few minutes)", function () {
                return sb().then(function (c) {
                    return c.auth.getUser().then(function (u) {
                        uid = u.data.user.id;
                        out.id = (window.crypto && crypto.randomUUID) ? crypto.randomUUID() : "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (ch) { var r = Math.random() * 16 | 0; return (ch === "x" ? r : (r & 3 | 8)).toString(16); });
                        var base = uid + "/" + out.id + "/", ext = function (f) { return f.type === "video/webm" ? "webm" : "mp4"; };
                        out.paths = { poster: base + "poster.jpg", trailer: base + "trailer." + ext(trailer), video: base + "film." + ext(video) };
                        out.uploaded = [];
                        function up(bucket, path, blob, type) {
                            return c.storage.from(bucket).upload(path, blob, { contentType: type, upsert: false }).then(function (r) {
                                if (r.error) throw new Error("UPLOAD FAILED: " + r.error.message.toUpperCase());
                                out.uploaded.push([bucket, path]);
                            });
                        }
                        return up("cinema-public", out.paths.poster, out.poster, "image/jpeg")
                            .then(function () { return up("cinema-public", out.paths.trailer, trailer, trailer.type); })
                            .then(function () { return up("cinema-films", out.paths.video, video, video.type); });
                    });
                }).catch(function (err) { return cleanup(out).then(function () { throw err; }); });
            });
        }
        function cleanup(o) {
            if (!o.uploaded || !o.uploaded.length) return Promise.resolve();
            return sb().then(function (c) {
                return Promise.all(o.uploaded.map(function (u) { return c.storage.from(u[0]).remove([u[1]]); }));
            }).catch(function () {});
        }
        run("Publishing", function () {
            if (REMOTE) {
                return rpc("cinema_publish", {
                    p_id: out.id, p_title: title, p_desc: desc, p_creator: creator, p_genres: genres, p_price: price,
                    p_poster: out.paths.poster, p_trailer: out.paths.trailer, p_video: out.paths.video,
                    p_duration: Math.floor(out.duration), p_signed_name: sign, p_accepted: true, p_version: "2026-10"
                }).catch(function (err) { return cleanup(out).then(function () { throw new Error(errText(err)); }); });
            }
            var rec = {
                id: "f" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
                title: title, desc: desc, creator: creator, genres: genres, price: price, owner: me(), date: Date.now(),
                poster: out.poster, trailer: trailer, video: video, duration: out.duration,
                agreement: { version: "2026-10", signedName: sign, signedAt: Date.now() }
            };
            return tx("readwrite", function (s) { return s.put(rec); }).catch(function () { throw new Error("NOT ENOUGH BROWSER STORAGE FOR THIS FILE."); });
        });
        chain.then(function () {
            localStorage.setItem("aniviaCreatorName", creator);
            return loadAll();
        }).then(function () {
            toast("YOUR ANIMATION IS LIVE!");
            setTimeout(closeUpload, 900);
        }).catch(function () { /* failure already shown in the checklist */ });
    };

    loadAll();
    window.CNStudio = { open: open, renderStudio: renderStudio };
    if (window.aniviaStak) aniviaStak.refresh().catch(function () {});
})();
