(function () {
    var REASONS = [
        ["nsfw", "NSFW / SEXUAL CONTENT"],
        ["hate", "HATE SPEECH"],
        ["bully", "BULLYING / HARASSMENT"],
        ["copyright", "COPYRIGHT INFRINGEMENT"],
        ["spam", "SPAM / SCAM"],
        ["other", "SOMETHING ELSE"]
    ];
    var TERMS = {
        nsfw: ["porn", "pron", "porno", "nsfw", "hentai", "nude", "nudes", "rule34", "onlyfans", "erotic", "blowjob", "handjob", "milf", "boobs", "dick pic", "sex video", "sex tape"],
        hate: ["nigger", "nigga", "faggot", "fag", "retard", "retarded", "tranny", "kike", "chink", "spic", "white power", "heil hitler", "kill all", "gas the"],
        bully: ["kys", "kill yourself", "go die", "neck yourself", "nobody likes you", "you are worthless", "youre worthless", "you are ugly", "youre ugly", "you are trash", "youre trash"]
    };
    var LABEL = { nsfw: "NSFW CONTENT", hate: "HATE SPEECH", bully: "BULLYING" };
    var LEET = { "0": "o", "1": "i", "3": "e", "4": "a", "5": "s", "7": "t", "@": "a", "$": "s", "!": "i" };

    function norm(s) {
        s = String(s).toLowerCase().replace(/[01345 7@$!]/g, function (c) { return LEET[c] || c; });
        s = s.replace(/[^a-z\s]/g, "").replace(/\s+/g, " ");
        return " " + s.replace(/([a-z])\1+/g, "$1") + " ";
    }
    var compiled = Object.keys(TERMS).map(function (k) {
        return { kind: k, list: TERMS[k].map(function (t) { return " " + norm(t).trim() + " "; }) };
    });

    function check(text) {
        var n = norm(text);
        for (var i = 0; i < compiled.length; i++) {
            for (var j = 0; j < compiled[i].list.length; j++) {
                if (n.indexOf(compiled[i].list[j]) > -1) return { kind: compiled[i].kind, message: "BLOCKED: " + LABEL[compiled[i].kind] + " IS NOT ALLOWED ON ANIVIA." };
            }
        }
        return null;
    }

    function read(key) { try { return JSON.parse(localStorage.getItem(key)) || []; } catch (e) { return []; } }
    function write(key, v) { try { localStorage.setItem(key, JSON.stringify(v)); } catch (e) { /* storage unavailable */ } }

    function hidden() { return read("aniviaHiddenItems"); }
    function hide(id) { var h = hidden(); if (h.indexOf(id) < 0) { h.push(id); write("aniviaHiddenItems", h); } }
    function unhide(id) { write("aniviaHiddenItems", hidden().filter(function (x) { return x !== id; })); }
    function blocked() { return read("aniviaBlockedUsers"); }

    function sendReport(id, type, reason) {
        var r = read("aniviaReports");
        r.push({ id: id, type: type, reason: reason, date: Date.now() });
        write("aniviaReports", r);
        hide(id);
    }

    var modal;
    function open(html) {
        if (modal) modal.remove();
        modal = document.createElement("div");
        modal.className = "mod-modal";
        modal.innerHTML = '<div class="mod-box">' + html + '<button type="button" class="mod-close">CANCEL</button></div>';
        modal.addEventListener("click", function (e) { if (e.target === modal || e.target.classList.contains("mod-close")) close(); });
        document.body.appendChild(modal);
        return modal;
    }
    function close() { if (modal) { modal.remove(); modal = null; } }

    function pickReason(done) {
        var m = open('<h3>REPORT: WHAT\'S WRONG?</h3>' + REASONS.map(function (r) {
            return '<button type="button" class="mod-opt" data-r="' + r[0] + '">' + r[1] + '</button>';
        }).join(""));
        m.addEventListener("click", function (e) {
            var b = e.target.closest("[data-r]");
            if (!b) return;
            close();
            done(b.dataset.r);
            toast("REPORT SENT. THANKS FOR KEEPING ANIVIA SAFE.");
        });
    }

    function toast(msg) {
        var t = document.createElement("div");
        t.className = "mod-toast";
        t.textContent = msg;
        document.body.appendChild(t);
        setTimeout(function () { t.remove(); }, 2800);
    }

    window.AniviaMod = { check: check, pickReason: pickReason, sendReport: sendReport, isHidden: function (id) { return hidden().indexOf(id) > -1; }, toast: toast };

    var feed = document.querySelector(".community-feed");
    if (!feed) return;

    function authorOf(post) {
        var b = post.querySelector(".social-post-author b");
        return b ? b.textContent.trim() : "";
    }

    function collapse(post, text, undo) {
        if (post.previousElementSibling && post.previousElementSibling.classList.contains("mod-note")) return;
        var note = document.createElement("div");
        note.className = "mod-note";
        note.innerHTML = "<span></span><button type=\"button\">UNDO</button>";
        note.firstChild.textContent = text;
        note.lastChild.onclick = function () { undo(); note.remove(); post.classList.remove("mod-gone"); };
        post.parentNode.insertBefore(note, post);
        post.classList.add("mod-gone");
    }

    function applyAll() {
        var h = hidden(), bl = blocked();
        feed.querySelectorAll(".community-post").forEach(function (post) {
            var id = post.dataset.postId, who = authorOf(post);
            if (id && h.indexOf(id) > -1) collapse(post, "POST HIDDEN", function () { unhide(id); });
            else if (who && bl.indexOf(who) > -1) collapse(post, "POST FROM BLOCKED USER " + who, function () { write("aniviaBlockedUsers", blocked().filter(function (x) { return x !== who; })); });
        });
    }

    document.addEventListener("click", function (e) {
        var more = e.target.closest(".more-button");
        if (!more) return;
        e.stopPropagation();
        var post = more.closest(".community-post");
        if (!post || post.classList.contains("own-post")) { toast("YOU CAN DELETE YOUR OWN POSTS WITH THE DELETE BUTTON."); return; }
        var id = post.dataset.postId, who = authorOf(post);
        var m = open('<h3>POST OPTIONS</h3><button type="button" class="mod-opt" data-a="report">⚑ REPORT POST</button><button type="button" class="mod-opt" data-a="hide">HIDE POST</button>' + (who ? '<button type="button" class="mod-opt" data-a="block">BLOCK ' + who.replace(/[<>&"]/g, "") + '</button>' : ""));
        m.addEventListener("click", function (ev) {
            var b = ev.target.closest("[data-a]");
            if (!b) return;
            close();
            if (b.dataset.a === "report") pickReason(function (reason) { sendReport(id, "post", reason); applyAll(); });
            if (b.dataset.a === "hide") { hide(id); applyAll(); }
            if (b.dataset.a === "block") { var bl = blocked(); bl.push(who); write("aniviaBlockedUsers", bl); applyAll(); toast("BLOCKED " + who); }
        });
    }, true);

    function guard(e, text) {
        var bad = check(text);
        if (!bad) return false;
        e.preventDefault();
        e.stopImmediatePropagation();
        toast(bad.message);
        return true;
    }

    document.addEventListener("submit", function (e) {
        if (e.target.id === "postForm") {
            guard(e, document.getElementById("postTitle").value + " " + document.getElementById("postBody").value);
        } else if (e.target.classList && e.target.classList.contains("comment-form")) {
            guard(e, e.target.querySelector(".comment-input").value);
        }
    }, true);

    applyAll();
})();
