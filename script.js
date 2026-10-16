/* Салон красоты «Люмьер» — интерактив демо-сайта */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var scrollMode = reduceMotion ? "auto" : "smooth";

  /* ---------- Мобильное меню ---------- */
  var header = document.getElementById("header");
  var burger = document.getElementById("burger");

  if (burger && header) {
    var closeMenu = function () {
      header.classList.remove("open");
      burger.setAttribute("aria-expanded", "false");
      burger.setAttribute("aria-label", "Открыть меню");
    };

    burger.addEventListener("click", function () {
      var open = header.classList.toggle("open");
      burger.setAttribute("aria-expanded", open ? "true" : "false");
      burger.setAttribute("aria-label", open ? "Закрыть меню" : "Открыть меню");
    });

    document.querySelectorAll(".nav-links a").forEach(function (link) {
      link.addEventListener("click", closeMenu);
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeMenu();
    });
  }

  /* ---------- Тень шапки при скролле ---------- */
  if (header) {
    var onScroll = function () {
      header.classList.toggle("scrolled", window.scrollY > 8);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ---------- Год в подвале ---------- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Кнопка «Наверх» ---------- */
  var toTop = document.getElementById("toTop");
  if (toTop) {
    var showOnScroll = function () {
      toTop.classList.toggle("show", window.scrollY > 480);
    };
    showOnScroll();
    window.addEventListener("scroll", showOnScroll, { passive: true });

    toTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: scrollMode });
      var logo = document.querySelector(".header .logo");
      if (logo) logo.focus({ preventScroll: true });
    });
  }

  /* ---------- Подсветка формы при клике на «Записаться» ---------- */
  var bookingCard = document.querySelector("#booking .booking-card");
  document.querySelectorAll('a[href="#booking"]').forEach(function (link) {
    link.addEventListener("click", function () {
      if (!bookingCard || reduceMotion) return;
      bookingCard.classList.remove("pulse");
      void bookingCard.offsetWidth;
      bookingCard.classList.add("pulse");
      window.setTimeout(function () {
        bookingCard.classList.remove("pulse");
      }, 1600);
    });
  });

  /* ---------- Форма записи ---------- */
  var form = document.getElementById("bookingForm");
  if (!form) return;

  var success = document.getElementById("success");
  var successTitle = document.getElementById("successTitle");
  var successText = document.getElementById("successText");
  var submitBtn = document.getElementById("submitBtn");
  var honeypot = document.getElementById("company");

  var fields = {
    name: {
      input: document.getElementById("name"),
      wrap: document.getElementById("fieldName"),
      check: function (v) {
        return v.trim().length >= 2;
      }
    },
    phone: {
      input: document.getElementById("phone"),
      wrap: document.getElementById("fieldPhone"),
      check: function (v) {
        return v.replace(/\D/g, "").length === 11;
      }
    },
    service: {
      input: document.getElementById("service"),
      wrap: document.getElementById("fieldService"),
      check: function (v) {
        return v !== "";
      }
    },
    time: {
      input: document.getElementById("time"),
      wrap: document.getElementById("fieldTime"),
      check: function (v) {
        return v !== "";
      }
    }
  };

  var agree = document.getElementById("agree");
  var checkboxWrap = document.getElementById("checkboxWrap");

  function setState(field, valid) {
    if (!field.wrap) return;
    field.wrap.classList.toggle("invalid", !valid);
    if (field.input) field.input.setAttribute("aria-invalid", valid ? "false" : "true");
  }

  /* ---------- Маска телефона: +7 (999) 999-99-99 ---------- */
  var phone = fields.phone.input;
  if (phone) {
    phone.addEventListener("input", function () {
      var d = phone.value.replace(/\D/g, "");
      if (d.charAt(0) === "8") d = "7" + d.slice(1);
      if (d.charAt(0) !== "7") d = "7" + d;
      d = d.slice(0, 11);

      var out = "";
      if (d.length > 0) out = "+7";
      if (d.length > 1) out += " (" + d.slice(1, 4);
      if (d.length >= 5) out += ") " + d.slice(4, 7);
      if (d.length >= 8) out += "-" + d.slice(7, 9);
      if (d.length >= 10) out += "-" + d.slice(9, 11);

      phone.value = out;
      if (fields.phone.check(out)) setState(fields.phone, true);
    });

    phone.addEventListener("focus", function () {
      if (!phone.value) phone.value = "+7";
    });

    phone.addEventListener("blur", function () {
      if (phone.value.replace(/\D/g, "").length < 5) phone.value = "";
    });
  }

  /* Живая проверка: показываем ошибку на blur, снимаем по мере исправления */
  Object.keys(fields).forEach(function (key) {
    var field = fields[key];
    if (!field.input) return;

    var liveEvent = field.input.tagName === "SELECT" ? "change" : "input";

    field.input.addEventListener(liveEvent, function () {
      if (field.check(field.input.value)) setState(field, true);
    });

    field.input.addEventListener("blur", function () {
      if (field.input.value !== "" || field.input.tagName === "SELECT") {
        setState(field, field.check(field.input.value));
      }
    });
  });

  if (agree && checkboxWrap) {
    agree.addEventListener("change", function () {
      checkboxWrap.classList.toggle("invalid", !agree.checked);
      agree.setAttribute("aria-invalid", agree.checked ? "false" : "true");
    });
  }

  function checkAgree() {
    if (!agree || !checkboxWrap) return true;
    var ok = agree.checked;
    checkboxWrap.classList.toggle("invalid", !ok);
    agree.setAttribute("aria-invalid", ok ? "false" : "true");
    return ok;
  }

  function setLoading(isLoading) {
    if (!submitBtn) return;
    submitBtn.classList.toggle("is-loading", isLoading);
    submitBtn.disabled = isLoading;
    form.setAttribute("aria-busy", isLoading ? "true" : "false");
  }

  function showSuccess(isBot) {
    if (!isBot && successText) {
      var phoneValue = fields.phone.input ? fields.phone.input.value : "";
      successText.textContent =
        "Спасибо, " +
        fields.name.input.value.trim() +
        "! Записали вас на «" +
        fields.service.input.value +
        "» в " +
        fields.time.input.value.split(" ")[0] +
        ". Перезвоним на " +
        phoneValue +
        " в течение 15 минут и подтвердим время.";
    }

    form.hidden = true;
    if (success) {
      success.classList.add("show");
      if (bookingCard) {
        bookingCard.scrollIntoView({ behavior: scrollMode, block: "center" });
      }
      if (successTitle) successTitle.focus({ preventScroll: true });
    }
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    /* Спам-бот заполнил скрытое поле — молча показываем «успех» */
    if (honeypot && honeypot.value.trim() !== "") {
      showSuccess(true);
      return;
    }

    var firstInvalid = null;

    Object.keys(fields).forEach(function (key) {
      var field = fields[key];
      if (!field.input) return;
      var ok = field.check(field.input.value);
      setState(field, ok);
      if (!ok && !firstInvalid) firstInvalid = field.input;
    });

    var agreeOk = checkAgree();
    if (!agreeOk && !firstInvalid) firstInvalid = agree;

    if (firstInvalid) {
      firstInvalid.focus({ preventScroll: true });
      firstInvalid.scrollIntoView({ behavior: scrollMode, block: "center" });
      return;
    }

    /* Демо-сайт: данные никуда не отправляются.
       Для рабочей версии здесь должен быть fetch() на бэкенд или CRM. */
    setLoading(true);
    window.setTimeout(function () {
      setLoading(false);
      showSuccess(false);
    }, 900);
  });

  var resetBtn = document.getElementById("resetBtn");
  if (resetBtn) {
    resetBtn.addEventListener("click", function () {
      form.reset();
      Object.keys(fields).forEach(function (key) {
        setState(fields[key], true);
      });
      if (checkboxWrap) checkboxWrap.classList.remove("invalid");
      form.hidden = false;
      if (success) success.classList.remove("show");
      setTimeout(function () {
        if (fields.name.input) fields.name.input.focus({ preventScroll: true });
        if (bookingCard) bookingCard.scrollIntoView({ behavior: scrollMode, block: "center" });
      }, 0);
    });
  }
})();
