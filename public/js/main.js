(function () {
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.querySelector(".nav");
  var yil = document.getElementById("yil");

  if (yil) {
    yil.textContent = String(new Date().getFullYear());
  }

  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });

    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        nav.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  var stat = document.querySelector(".stat-number[data-count]");
  if (stat && "IntersectionObserver" in window) {
    var target = parseInt(stat.getAttribute("data-count"), 10);
    var done = false;
    var obs = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          if (!e.isIntersecting || done) return;
          done = true;
          var start = 0;
          var duration = 3000;
          var t0 = null;
          function tick(now) {
            if (!t0) t0 = now;
            var p = Math.min((now - t0) / duration, 1);
            var eased = 1 - Math.pow(1 - p, 3);
            stat.textContent = String(Math.round(start + (target - start) * eased));
            if (p < 1) requestAnimationFrame(tick);
          }
          requestAnimationFrame(tick);
        });
      },
      { threshold: 0.3 }
    );
    obs.observe(stat.closest(".stat-item") || stat);
  }

  var form = document.getElementById("contactForm");
  var formNote = document.getElementById("formNote");
  var modal = document.getElementById("statusModal");
  var modalText = document.getElementById("statusModalText");
  var modalOk = document.getElementById("statusModalOk");

  function openModal(message) {
    if (!modal) return;
    if (modalText && message) modalText.textContent = message;
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    if (modalOk) modalOk.focus();
  }

  function closeModal() {
    if (!modal) return;
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
  }

  if (modal) {
    modal.addEventListener("click", function (e) {
      if (e.target && e.target.hasAttribute && e.target.hasAttribute("data-modal-close")) {
        closeModal();
      }
    });
  }

  if (modalOk) {
    modalOk.addEventListener("click", function () {
      closeModal();
    });
  }

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeModal();
  });

  if (form) {
    form.addEventListener("submit", async function (e) {
      e.preventDefault();

      var fd = new FormData(form);
      var payload = {
        ad: String(fd.get("ad") || "").trim(),
        soyad: String(fd.get("soyad") || "").trim(),
        email: String(fd.get("email") || "").trim(),
        mesaj: String(fd.get("mesaj") || "").trim(),
        pageUrl: window.location.href,
      };

      if (!payload.ad || !payload.soyad || !payload.email || !payload.mesaj) {
        if (formNote) formNote.textContent = "Lütfen tüm zorunlu alanları doldurun.";
        return;
      }

      var btn = form.querySelector("button[type='submit']");
      var oldText = btn ? btn.textContent : "";
      if (btn) {
        btn.disabled = true;
        btn.textContent = "Gönderiliyor…";
      }
      if (formNote) formNote.textContent = "Mesajınız iletiliyor…";

      try {
        var r = await fetch("/api/contact", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        var data = await r.json().catch(function () {
          return {};
        });

        if (!r.ok || !data.ok) {
          var msg = (data && data.error) || "Gönderim başarısız. Lütfen tekrar deneyin.";
          if (formNote) formNote.textContent = msg;
          return;
        }

        form.reset();
        if (formNote) formNote.textContent = "Teşekkürler! Mesajınız iletildi.";
        openModal("Teşekkürler! Mesajınız başarıyla iletildi.");
      } catch (err) {
        if (formNote) formNote.textContent = "Ağ hatası. Lütfen tekrar deneyin.";
      } finally {
        if (btn) {
          btn.disabled = false;
          btn.textContent = oldText || "Gönder";
        }
      }
    });
  }
})();

