const CONTACT_TELEGRAM = "your_username";
const LAVA_TOP_PAYMENT_LINKS = {
  test: "https://app.lava.top/products/20feaa87-334b-4dde-9e0c-f8701ae2afbc",
  regular: "https://app.lava.top/products/9d62b40c-52b6-4ff9-80b5-17adb3b6b0fc"
};

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

telegramContactLinks.forEach((link) => {
  if (CONTACT_TELEGRAM !== "your_username") {
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
  const name = String(formData.get("name")).trim();
  const telegram = String(formData.get("telegram")).trim();
  const product = String(formData.get("product")).trim();
  const reason = String(formData.get("reason")).trim();
  const submitButton = leadForm.querySelector("button[type='submit']");
  const productLabel = product === "regular"
    ? "Обычная версия - 8 000 ₽, пакет токенов включен"
    : "Тестовая версия - 4 000 ₽, ограниченный лимит";

  const text = [
    "Заявка на личного AI-ассистента",
    "",
    `Имя: ${name}`,
    `Telegram: ${telegram}`,
    `Версия: ${productLabel}`,
    `Зачем нужен бот: ${reason}`,
    "",
    "Хочу получить AI-бота. Понимаю разницу: тестовая версия проверяет, что бот работает, а обычная версия идет с пакетом токенов."
  ].join("\n");

  submitButton.disabled = true;
  submitButton.textContent = "Отправляю...";
  leadStatus.textContent = "Отправляю заявку и открываю оплату...";

  try {
    await fetch("/api/lead", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      keepalive: true,
      body: JSON.stringify({ name, telegram, product, reason, text })
    });
  } catch (error) {
    try {
      await navigator.clipboard.writeText(text);
    } catch {}
  }

  leadStatus.textContent = "Открываю оплату Lava.top...";
  leadForm.reset();
  window.location.href = getPaymentUrl(product);
});
