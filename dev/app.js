/* wavebotai /dev/ — production flow: YooKassa + helpers. */

const PENDING_LEAD_KEY = "wavebotai_pending_paid_lead";
const SENT_LEAD_KEY = "wavebotai_sent_paid_lead";

const leadForm = document.getElementById("leadForm");
const leadStatus = document.getElementById("leadStatus");
const productSelect = document.getElementById("productSelect");
const productChoiceLinks = document.querySelectorAll(".js-product-choice");
const heroVideo = document.getElementById("heroVideo");
const heroVideoPlay = document.getElementById("heroVideoPlay");
const heroVideoFallback = document.getElementById("heroVideoFallback");
const phoneFrame = document.getElementById("phoneFrame");
const stickyCta = document.querySelector("[data-sticky-cta]");
const formSection = document.getElementById("request");

/* ---------- Product preselect on pricing-card click ---------- */
productChoiceLinks.forEach((link) => {
  link.addEventListener("click", () => {
    if (productSelect) productSelect.value = link.dataset.product || "test";
  });
});

/* ---------- Sticky CTA: hide when form is visible ---------- */
if (stickyCta && formSection && "IntersectionObserver" in window) {
  const stickyObs = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        stickyCta.classList.toggle("hidden", entry.isIntersecting);
      });
    },
    { threshold: 0.2 },
  );
  stickyObs.observe(formSection);
}

/* ---------- Hero video: autoplay-muted-loop with graceful fallback ---------- */
if (heroVideo) {
  let started = false;

  function showPlayButton() {
    if (heroVideoPlay) heroVideoPlay.classList.add("is-visible");
  }

  function hidePlayButton() {
    if (heroVideoPlay) heroVideoPlay.classList.remove("is-visible");
  }

  heroVideo.addEventListener("loadeddata", () => {
    phoneFrame?.classList.add("has-demo-video");
    if (!started) {
      const playAttempt = heroVideo.play();
      if (playAttempt && typeof playAttempt.then === "function") {
        playAttempt
          .then(() => {
            started = true;
            hidePlayButton();
          })
          .catch(() => {
            showPlayButton();
          });
      }
    }
  });

  heroVideo.addEventListener("playing", hidePlayButton);
  heroVideo.addEventListener("pause", () => {
    if (heroVideo.currentTime > 0 && !heroVideo.ended) showPlayButton();
  });

  heroVideo.addEventListener("error", () => {
    phoneFrame?.classList.add("video-failed");
    if (heroVideoFallback) heroVideoFallback.hidden = false;
    hidePlayButton();
  });

  heroVideoPlay?.addEventListener("click", () => {
    heroVideo.play().catch(() => {});
  });

  // Pause when off-screen to save bandwidth
  if ("IntersectionObserver" in window && phoneFrame) {
    const vis = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting && !heroVideo.paused) heroVideo.pause();
          else if (entry.isIntersecting && heroVideo.paused && !heroVideo.ended) {
            heroVideo.play().catch(() => {});
          }
        });
      },
      { threshold: 0.15 },
    );
    vis.observe(phoneFrame);
  }
}

/* ---------- Subtle scroll reveal (additive only) ---------- */
if ("IntersectionObserver" in window) {
  const targets = document.querySelectorAll(
    ".dialog-card, .capability-grid li, .price-card, .how-steps li, .business-card, .faq-list details, .proof-stat",
  );
  const reveal = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.style.transition = "opacity 480ms ease, transform 480ms ease";
          entry.target.style.opacity = "1";
          entry.target.style.transform = "translateY(0)";
          reveal.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 },
  );

  targets.forEach((target) => {
    target.style.opacity = "0.72";
    target.style.transform = "translateY(8px)";
    reveal.observe(target);
  });
}

/* ============================================================
   YooKassa payment flow (ported from live app.js)
   ============================================================ */

function getProductLabel(product) {
  return product === "regular"
    ? "Обычная версия - 8 000 ₽, пакет токенов включен"
    : "Тестовая версия - 4 000 ₽, ограниченный лимит";
}

function buildLeadPayload(formData) {
  const name = String(formData.get("name") ?? "").trim();
  const telegram = String(formData.get("telegram") ?? "").trim();
  const product = String(formData.get("product") ?? "").trim();
  const reason = String(formData.get("reason") ?? "").trim();
  const goals = formData.getAll("goal").join(", ");
  const leadId = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const productLabel = getProductLabel(product);

  const reasonBlock = reason || "—";
  const goalsBlock = goals || "—";

  const text = [
    "Оплаченная заявка на личного AI-ассистента",
    "",
    `ID заявки: ${leadId}`,
    `Имя: ${name}`,
    `Telegram: ${telegram}`,
    `Версия: ${productLabel}`,
    `Важно: ${goalsBlock}`,
    `Задача: ${reasonBlock}`,
    "",
    "Клиент вернулся на сайт после успешной оплаты.",
  ].join("\n");

  return {
    leadId,
    name,
    telegram,
    product,
    reason,
    goals,
    text,
    createdAt: new Date().toISOString(),
  };
}

async function createPayment(lead) {
  const response = await fetch("/api/create-payment", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(lead),
  });
  const result = await response.json().catch(() => ({}));

  if (!response.ok || !result.ok || !result.confirmationUrl || !result.paymentId) {
    throw new Error(result.error || "Payment endpoint failed");
  }

  return result;
}

async function checkPaymentAndSendLead(lead) {
  const response = await fetch("/api/check-payment", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(lead),
  });
  const result = await response.json().catch(() => ({}));

  if (!response.ok || !result.ok) {
    throw new Error(result.error || "Payment check failed");
  }

  return result;
}

async function handlePaymentReturn() {
  const params = new URLSearchParams(window.location.search);
  const paymentStatus = params.get("payment");

  if (paymentStatus === "fail") {
    if (leadStatus) leadStatus.textContent = "Оплата не завершилась. Можно попробовать ещё раз.";
    return;
  }

  if (paymentStatus !== "return") return;

  const rawLead = localStorage.getItem(PENDING_LEAD_KEY);
  if (!rawLead) {
    if (leadStatus) {
      leadStatus.textContent =
        "Вы вернулись после оплаты, но заявка не найдена. Заполните форму ещё раз или напишите мне вручную.";
      leadStatus.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    return;
  }

  let lead;
  try {
    lead = JSON.parse(rawLead);
  } catch {
    localStorage.removeItem(PENDING_LEAD_KEY);
    if (leadStatus) {
      leadStatus.textContent =
        "Не удалось восстановить заявку после оплаты. Заполните форму ещё раз или напишите мне вручную.";
      leadStatus.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    return;
  }

  const sentLeadId = localStorage.getItem(SENT_LEAD_KEY);
  if (sentLeadId === lead.leadId) {
    if (leadStatus) {
      leadStatus.textContent = "Оплата проверена. Заявка уже отправлена мне в Telegram.";
      leadStatus.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    return;
  }

  if (leadStatus) {
    leadStatus.textContent = "Проверяю оплату…";
    leadStatus.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  try {
    await checkPaymentAndSendLead(lead);
    localStorage.setItem(SENT_LEAD_KEY, lead.leadId);
    localStorage.removeItem(PENDING_LEAD_KEY);
    if (leadStatus) {
      leadStatus.textContent =
        "Оплата подтверждена. Заявка отправлена мне в Telegram, я напишу вам после проверки.";
    }
  } catch {
    if (leadStatus) {
      leadStatus.textContent =
        "Платёж пока не подтверждён или автоотправка не сработала. Попробуйте обновить страницу через минуту.";
    }
  }
}

if (leadForm) {
  leadForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const formData = new FormData(leadForm);
    const submitButton = leadForm.querySelector("button[type='submit']");
    const lead = buildLeadPayload(formData);

    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = "Создаю платёж…";
    }
    if (leadStatus) leadStatus.textContent = "Создаю платёж…";

    try {
      const payment = await createPayment(lead);
      localStorage.setItem(
        PENDING_LEAD_KEY,
        JSON.stringify({ ...lead, paymentId: payment.paymentId }),
      );
      if (leadStatus) leadStatus.textContent = "Открываю страницу оплаты…";
      window.location.href = payment.confirmationUrl;
    } catch {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.innerHTML = '<span>Перейти к оплате</span><span class="arrow" aria-hidden="true">→</span>';
      }
      if (leadStatus) {
        leadStatus.textContent = "Не удалось открыть оплату. Проверьте поля и попробуйте ещё раз.";
      }
    }
  });
}

handlePaymentReturn();
