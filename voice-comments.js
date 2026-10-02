(function () {
    var feed = document.querySelector(".community-feed");
    if (!feed) return;
    var MAX = 30;
    var rec = null;

    function key(id) { return "aniviaVoice:" + id; }
    function read(id) { try { return JSON.parse(localStorage.getItem(key(id))) || []; } catch (e) { return []; } }
    function write(id, list) { try { localStorage.setItem(key(id), JSON.stringify(list)); return true; } catch (e) { return false; } }
    function toast(m) { if (window.AniviaMod) AniviaMod.toast(m); }

    function paint(post) {
        var box = post.querySelector(".voice-list");
        if (!box) return;
        box.replaceChildren();
        read(post.dataset.postId).forEach(function (v) {
            if (window.AniviaMod && AniviaMod.isHidden(v.id)) return;
            var row = document.createElement("div");
            row.className = "voice-item";
            var who = document.createElement("b");
            who.textContent = "YOU";
            var audio = document.createElement("audio");
            audio.controls = true;
            audio.preload = "none";
            audio.src = v.audio;
            var del = document.createElement("button");
            del.type = "button";
            del.className = "voice-del";
            del.dataset.vid = v.id;
            del.textContent = "DELETE";
            row.append(who, audio, del);
            box.appendChild(row);
        });
    }

    function enhance(post) {
        var panel = post.querySelector(".post-comments");
        if (!panel || panel.querySelector(".voice-bar")) return;
        var bar = document.createElement("div");
        bar.className = "voice-bar";
        bar.innerHTML = '<button type="button" class="voice-rec">🎤 VOICE REPLY</button><span class="voice-status"></span>';
        var list = document.createElement("div");
        list.className = "voice-list";
        panel.appendChild(bar);
        panel.appendChild(list);
        paint(post);
    }

    function stop() { if (rec && rec.state !== "inactive") rec.stop(); }

    function start(post, btn) {
        if (!navigator.mediaDevices || !window.MediaRecorder) { toast("VOICE RECORDING IS NOT SUPPORTED IN THIS BROWSER."); return; }
        navigator.mediaDevices.getUserMedia({ audio: true }).then(function (stream) {
            var chunks = [], t0 = Date.now();
            var status = btn.parentNode.querySelector(".voice-status");
            rec = new MediaRecorder(stream);
            rec.ondataavailable = function (e) { if (e.data.size) chunks.push(e.data); };
            var timer = setInterval(function () {
                var s = Math.floor((Date.now() - t0) / 1000);
                status.textContent = "● REC " + s + "s / " + MAX + "s";
                if (s >= MAX) stop();
            }, 250);
            rec.onstop = function () {
                clearInterval(timer);
                stream.getTracks().forEach(function (t) { t.stop(); });
                btn.textContent = "🎤 VOICE REPLY";
                btn.classList.remove("on");
                status.textContent = "";
                var blob = new Blob(chunks, { type: rec.mimeType || "audio/webm" });
                rec = null;
                if (Date.now() - t0 < 700 || !blob.size) { toast("RECORDING TOO SHORT."); return; }
                var fr = new FileReader();
                fr.onload = function () {
                    var list = read(post.dataset.postId);
                    list.push({ id: "v" + Date.now(), audio: fr.result, date: Date.now() });
                    if (!write(post.dataset.postId, list)) { toast("STORAGE FULL. DELETE OLD VOICE REPLIES."); return; }
                    paint(post);
                };
                fr.readAsDataURL(blob);
            };
            rec.start();
            btn.textContent = "■ STOP & POST";
            btn.classList.add("on");
        }).catch(function () { toast("MICROPHONE ACCESS DENIED."); });
    }

    feed.addEventListener("click", function (e) {
        var post = e.target.closest(".community-post");
        if (!post) return;
        var del = e.target.closest(".voice-del");
        if (del) {
            write(post.dataset.postId, read(post.dataset.postId).filter(function (v) { return v.id !== del.dataset.vid; }));
            paint(post);
            return;
        }
        var btn = e.target.closest(".voice-rec");
        if (!btn) return;
        if (rec) stop(); else start(post, btn);
    });

    function all() { feed.querySelectorAll(".community-post").forEach(enhance); }
    all();
    new MutationObserver(all).observe(feed, { childList: true });
})();
