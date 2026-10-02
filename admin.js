(function () {
    var $ = function (id) { return document.getElementById(id); };
    var st = window.aniviaStak;
    function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
    function rpc(name, args) {
        return st.getClient().then(function (c) { return c.rpc(name, args); }).then(function (r) {
            if (r.error) throw new Error((r.error.message.match(/[A-Z_]{6,}/) || ["REQUEST_FAILED"])[0]);
            return r.data;
        });
    }
    function load() {
        Promise.all([rpc("cinema_admin_queue"), rpc("cinema_admin_payouts")]).then(function (d) {
            $("adMsg").textContent = "SIGNED IN AS ADMIN.";
            $("adFilms").innerHTML = d[0].length ? d[0].map(function (f) {
                var reasons = (f.reports || []).join(", ") || "none";
                return '<div class="cn-row" data-id="' + f.id + '"><div><b>' + esc(f.title) + '</b><small>BY ' + esc(f.creator) + ' // ' + esc(f.status).toUpperCase() + ' // REPORTS: ' + esc(reasons) + '</small></div>' +
                    '<button type="button" class="outline-button" data-film="restore">RESTORE</button> <button type="button" class="outline-button" data-film="block">BLOCK</button></div>';
            }).join("") : '<p class="shop-status">NOTHING TO REVIEW.</p>';
            $("adPayouts").innerHTML = d[1].length ? d[1].map(function (p) {
                return '<div class="cn-row" data-pid="' + p.id + '"><div><b>' + p.amount + ' STAK</b><small>' + esc(p.contact) + ' // ' + esc(p.created_at.slice(0, 10)) + '</small></div>' +
                    '<button type="button" class="outline-button" data-pay="paid">MARK PAID</button> <button type="button" class="outline-button" data-pay="rejected">REJECT + REFUND</button></div>';
            }).join("") : '<p class="shop-status">NO PENDING PAYOUTS.</p>';
        }).catch(function (e) {
            $("adMsg").textContent = e.message === "FORBIDDEN" ? "ACCESS DENIED. YOUR ACCOUNT IS NOT IN cinema_admins." : "COULD NOT LOAD. " + e.message;
            $("adFilms").innerHTML = ""; $("adPayouts").innerHTML = "";
        });
    }
    document.addEventListener("click", function (e) {
        var b = e.target, row = b.closest && b.closest(".cn-row");
        if (!row) return;
        var p;
        if (b.dataset.film) {
            if (b.dataset.film === "block" && !confirm("Block this film permanently?")) return;
            p = rpc("cinema_admin_review", { p_film_id: row.dataset.id, p_action: b.dataset.film });
        } else if (b.dataset.pay) {
            if (!confirm(b.dataset.pay === "paid" ? "Confirm you sent this payment?" : "Reject and refund the creator?")) return;
            p = rpc("cinema_admin_payout_set", { p_id: Number(row.dataset.pid), p_status: b.dataset.pay });
        } else return;
        p.then(load).catch(function (err) { $("adMsg").textContent = "FAILED: " + err.message; });
    });
    if (!st || !st.online) $("adMsg").textContent = "ADMIN NEEDS SUPABASE. FILL IN THE CONFIG IN script.js FIRST.";
    else load();
})();