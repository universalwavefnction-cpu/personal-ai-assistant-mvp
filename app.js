const CONTACT_TELEGRAM = "universal_wavefunction";
const LAVA_TOP_PAYMENT_LINKS = {
  test: "https://app.lava.top/products/20feaa87-334b-4dde-9e0c-f8701ae2afbc",
  regular: "https://app.lava.top/products/9d62b40c-52b6-4ff9-80b5-17adb3b6b0fc"
};
const PENDING_LEAD_KEY = "wavebotai_pending_paid_lead";
const SENT_LEAD_KEY = "wavebotai_sent_paid_lead";

const leadForm = document.getElementById("leadForm");
const leadStatus = document.getElementById("leadStatus");
const productSelect = document.getElementById("productSelect");
const telegramDemoVideo = document.getElementById("telegramDemoVideo");
const videoPlayOverlay = document.getElementById("videoPlayOverlay");
const telegramContactLinks = document.querySelectorAll(".js-telegram-contact");
const productChoiceLinks = document.querySelectorAll(".js-product-choice");

function getPaymentUrl(product) {
  return LAVA_TOP_PAYMENT_LINKS[product] || LAVA_TOP_PAYMENT_LINKS.test;
}

function getProductLabel(product) {
  return product === "regular"
    ? "Обычная версия - 8 000 ₽, пакет токенов включен"
    : "Тестовая версия - 4 000 ₽, ограниченный лимит";
}

function buildLeadPayload(formData) {
  const name = String(formData.get("name")).trim();
  const telegram = String(formData.get("telegram")).trim();
  const product = String(formData.get("product")).trim();
  const reason = String(formData.get("reason")).trim();
  const leadId = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const productLabel = getProductLabel(product);
  const text = [
    "Оплаченная заявка на личного AI-ассистента",
    "",
    `ID заявки: ${leadId}`,
    `Имя: ${name}`,
    `Telegram: ${telegram}`,
    `Версия: ${productLabel}`,
    `Зачем нужен бот: ${reason}`,
    "",
    "Клиент вернулся на сайт после успешной оплаты Lava.top."
  ].join("\n");

  return { leadId, name, telegram, product, reason, text, createdAt: new Date().toISOString() };
}

async function sendLeadToTelegram(lead) {
  const response = await fetch("/api/lead", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(lead)
  });

  if (!response.ok) {
    throw new Error("Lead endpoint failed");
  }
}

async function handlePaymentReturn() {
  const params = new URLSearchParams(window.location.search);
  const paymentStatus = params.get("payment");

  if (paymentStatus === "fail") {
    leadStatus.textContent = "Оплата не завершилась. Можно попробовать еще раз или написать @universal_wavefunction.";
    return;
  }

  if (paymentStatus !== "success") {
    return;
  }

  const rawLead = localStorage.getItem(PENDING_LEAD_KEY);
  if (!rawLead) {
    leadStatus.textContent = "Оплата прошла. Напишите @universal_wavefunction, чтобы я забрал задачу для настройки.";
    leadStatus.scrollIntoView({ behavior: "smooth", block: "center" });
    return;
  }

  const lead = JSON.parse(rawLead);
  const sentLeadId = localStorage.getItem(SENT_LEAD_KEY);

  if (sentLeadId === lead.leadId) {
    leadStatus.textContent = "Оплата прошла. Заявка уже отправлена мне в Telegram.";
    leadStatus.scrollIntoView({ behavior: "smooth", block: "center" });
    return;
  }

  leadStatus.textContent = "Оплата прошла. Отправляю заявку в Telegram...";
  leadStatus.scrollIntoView({ behavior: "smooth", block: "center" });

  try {
    await sendLeadToTelegram(lead);
    localStorage.setItem(SENT_LEAD_KEY, lead.leadId);
    localStorage.removeItem(PENDING_LEAD_KEY);
    leadStatus.textContent = "Оплата прошла. Заявка отправлена мне в Telegram, я напишу вам после проверки.";
  } catch (error) {
    leadStatus.textContent = "Оплата прошла, но автоотправка не сработала. Напишите @universal_wavefunction и пришлите задачу.";
  }
}

telegramContactLinks.forEach((link) => {
  if (CONTACT_TELEGRAM) {
    link.href = `https://t.me/${CONTACT_TELEGRAM}`;
  }
});

productChoiceLinks.forEach((link) => {
  link.addEventListener("click", () => {
    if (productSelect) {
      productSelect.value = link.dataset.product || "test";
    }
  });
});

if (telegramDemoVideo) {
  const phoneFrame = telegramDemoVideo.closest(".phone-frame");

  telegramDemoVideo.addEventListener("loadeddata", () => {
    phoneFrame?.classList.add("has-demo-video");
  });

  telegramDemoVideo.addEventListener("play", () => {
    phoneFrame?.classList.add("is-video-playing");
  });

  telegramDemoVideo.addEventListener("pause", () => {
    phoneFrame?.classList.remove("is-video-playing");
  });

  telegramDemoVideo.addEventListener("ended", () => {
    phoneFrame?.classList.remove("is-video-playing");
  });

  telegramDemoVideo.addEventListener("error", () => {
    phoneFrame?.classList.remove("has-demo-video");
  });

  if ("IntersectionObserver" in window && phoneFrame) {
    const videoVisibilityObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting && !telegramDemoVideo.paused) {
            telegramDemoVideo.pause();
          }
        });
      },
      { threshold: 0.12 }
    );

    videoVisibilityObserver.observe(phoneFrame);
  }
}

videoPlayOverlay?.addEventListener("click", () => {
  telegramDemoVideo?.play().catch(() => {});
});

const motionTargets = document.querySelectorAll(
  ".section-heading, .advantage-grid article, .case-grid article, .included-item, .price-card, .form-copy, .lead-form, .business-card, .faq-list details"
);

if ("IntersectionObserver" in window) {
  motionTargets.forEach((target, index) => {
    target.classList.add("motion-reveal");
    target.style.setProperty("--motion-delay", `${Math.min(index % 4, 3) * 55}ms`);
  });

  const motionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          motionObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.14 }
  );

  motionTargets.forEach((target) => motionObserver.observe(target));
} else {
  motionTargets.forEach((target) => target.classList.add("is-visible"));
}

leadForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const formData = new FormData(leadForm);
  const product = String(formData.get("product")).trim();
  const submitButton = leadForm.querySelector("button[type='submit']");
  const lead = buildLeadPayload(formData);

  submitButton.disabled = true;
  submitButton.textContent = "Открываю оплату...";
  localStorage.setItem(PENDING_LEAD_KEY, JSON.stringify(lead));
  leadStatus.textContent = "Открываю оплату Lava.top...";
  window.location.href = getPaymentUrl(product);
});

handlePaymentReturn();
