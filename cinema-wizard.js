(function () {
    var form = document.getElementById("cnUpForm");
    if (!form) return;
    var $ = function (id) { return document.getElementById(id); };
    var step = 0, TITLES = ["UPLOAD VIDEOS", "DETAILS", "TICKET & RIGHTS", "CHECKS & PUBLISH"];
    var panels = form.querySelectorAll(".cn-step"), dots = $("wizSteps").children;
    var previewUrls = {};

    function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
    function mb(f) { return (f.size / 1048576).toFixed(1) + " MB"; }

    function show(n) {
        step = n;
        Array.prototype.forEach.call(panels, function (p, i) { p.hidden = i !== n; });
        Array.prototype.forEach.call(dots, function (d, i) { d.className = i === n ? "on" : i < n ? "done" : ""; });
        $("wizTitle").textContent = TITLES[n];
        $("wizBack").hidden = n === 0;
        $("wizNext").hidden = n === 3;
        $("upSubmit").hidden = n !== 3;
        $("wizMsg").textContent = "";
        if (n === 2) earn();
        if (n === 3) summary();
        form.scrollTop = 0;
    }

    function earn() {
        var p = Math.floor(Number($("upPrice").value)) || 0;
        $("upEarn").textContent = p >= 10 && p <= 5000
            ? "VIEWERS PAY " + p + " STAK // YOU EARN " + Math.floor(p * 0.9) + " STAK PER TICKET (10% PLATFORM FEE)"
            : "ENTER A PRICE BETWEEN 10 AND 5000 STAK.";
    }

    function summary() {
        var g = Array.prototype.filter.call($("upGenres").querySelectorAll("input"), function (i) { return i.checked; }).map(function (i) { return i.value; });
        var poster = previewUrls.upPoster;
        $("upSummary").innerHTML = (poster ? '<img src="' + poster + '" alt="">' : "") +
            "<div><b>" + esc($("upTitle").value) + "</b><small>BY " + esc($("upCreator").value) + " // " + esc(g.join(" / ")) + "</small>" +
            "<small>TICKET " + esc($("upPrice").value) + " STAK // FILM " + mb($("upVideo").files[0]) + " // TRAILER " + mb($("upTrailer").files[0]) + "</small></div>";
    }

    function validate(n) {
        if (n === 0) {
            if (!$("upVideo").files[0]) return "ADD THE FULL ANIMATION.";
            if (!$("upTrailer").files[0]) return "ADD THE FREE TRAILER.";
            if (!$("upPoster").files[0]) return "ADD A POSTER.";
        }
        if (n === 1) {
            if (!$("upTitle").value.trim()) return "ENTER A TITLE.";
            if (!$("upDesc").value.trim()) return "ENTER A DESCRIPTION.";
            if (!$("upCreator").value.trim()) return "ENTER A CHANNEL NAME.";
            var c = $("upGenres").querySelectorAll("input:checked").length;
            if (c < 1 || c > 3) return "PICK 1 TO 3 GENRES.";
        }
        if (n === 2) {
            var p = Math.floor(Number($("upPrice").value));
            if (!(p >= 10 && p <= 5000)) return "TICKET PRICE MUST BE 10 - 5000 STAK.";
            if (!["upT1", "upT2", "upT3", "upT4"].every(function (i) { return $(i).checked; })) return "ACCEPT ALL TERMS AND DECLARATIONS.";
            var s = $("upSign").value.trim();
            if (s.split(/\s+/).length < 2 || s.length < 5) return "TYPE YOUR FULL LEGAL NAME TO SIGN.";
        }
        return "";
    }

    function next() {
        var err = validate(step);
        if (err) { $("wizMsg").textContent = err; return; }
        show(step + 1);
    }
    $("wizNext").onclick = next;
    $("wizBack").onclick = function () { show(step - 1); };
    form.addEventListener("keydown", function (e) {
        if (e.key === "Enter" && e.target.tagName !== "TEXTAREA" && e.target.tagName !== "BUTTON") {
            e.preventDefault();
            if (step < 3) next();
        }
    });

    /* drop zones */
    function preview(zone) {
        var input = zone.querySelector("input"), f = input.files[0], el = zone.querySelector(".cn-prev"), note = zone.querySelector("em");
        if (previewUrls[input.id]) { URL.revokeObjectURL(previewUrls[input.id]); delete previewUrls[input.id]; }
        zone.classList.toggle("has", !!f);
        if (!f) { el.removeAttribute("src"); note.textContent = ""; return; }
        previewUrls[input.id] = URL.createObjectURL(f);
        el.src = previewUrls[input.id];
        note.textContent = f.name + " (" + mb(f) + ")";
    }
    Array.prototype.forEach.call(form.querySelectorAll(".cn-drop"), function (zone) {
        var input = zone.querySelector("input");
        input.addEventListener("change", function () { preview(zone); });
        ["dragenter", "dragover"].forEach(function (ev) { zone.addEventListener(ev, function (e) { e.preventDefault(); zone.classList.add("over"); }); });
        ["dragleave", "drop"].forEach(function (ev) { zone.addEventListener(ev, function () { zone.classList.remove("over"); }); });
        zone.addEventListener("drop", function (e) {
            e.preventDefault();
            if (!e.dataTransfer.files.length) return;
            input.files = e.dataTransfer.files;
            preview(zone);
        });
    });

    /* counters and price */
    Array.prototype.forEach.call(form.querySelectorAll(".cn-count"), function (c) {
        var f = $(c.dataset.for);
        function upd() { c.textContent = f.value.length + " / " + f.maxLength; }
        f.addEventListener("input", upd);
        form.addEventListener("reset", function () { setTimeout(upd, 0); });
        upd();
    });
    $("upPrice").addEventListener("input", earn);

    function reset() {
        setTimeout(function () {
            Array.prototype.forEach.call(form.querySelectorAll(".cn-drop"), preview);
            show(0);
        }, 0);
    }
    form.addEventListener("reset", reset);
    $("cnUpOpen").addEventListener("click", function () { form.reset(); });
    show(0);
})();
