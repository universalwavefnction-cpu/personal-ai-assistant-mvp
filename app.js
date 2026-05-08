const CONTACT_TELEGRAM = "your_username";
const YOOMONEY_TEST_URL = "https://yoomoney.ru/to/YOUR_WALLET/4000";
const YOOMONEY_REGULAR_URL = "https://yoomoney.ru/to/YOUR_WALLET/8000";

const leadForm = document.getElementById("leadForm");
const leadStatus = document.getElementById("leadStatus");
const productSelect = document.getElementById("productSelect");
const telegramDemoVideo = document.getElementById("telegramDemoVideo");
const telegramContactLinks = document.querySelectorAll(".js-telegram-contact");
const productChoiceLinks = document.querySelectorAll(".js-product-choice");

function getPaymentUrl(product) {
  return product === "regular" ? YOOMONEY_REGULAR_URL : YOOMONEY_TEST_URL;
}

function hasConfiguredYooMoneyLink(product) {
  const url = getPaymentUrl(product);
  return url.startsWith("https://yoomoney.ru/") && !url.includes("YOUR_WALLET");
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

  telegramDemoVideo.addEventListener("error", () => {
    phoneFrame?.classList.remove("has-demo-video");
  });
}

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
  leadStatus.textContent = "Отправляю заявку в Telegram...";

  try {
    const response = await fetch("/api/lead", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, telegram, product, reason, text })
    });

    if (!response.ok) {
      throw new Error("Lead endpoint is not available");
    }

    if (hasConfiguredYooMoneyLink(product)) {
      leadStatus.textContent = "Заявка отправлена. Открываю оплату YooMoney...";
      window.location.href = getPaymentUrl(product);
    } else {
      leadStatus.textContent = "Заявка отправлена. Подключите YooMoney-ссылку в app.js перед публикацией.";
    }

    leadForm.reset();
  } catch (error) {
    try {
      await navigator.clipboard.writeText(text);
    } catch {}

    if (CONTACT_TELEGRAM !== "your_username") {
      window.open(`https://t.me/${CONTACT_TELEGRAM}`, "_blank", "noopener,noreferrer");
      leadStatus.textContent = "Открыл Telegram и скопировал текст заявки. Отправьте его мне в чат.";
    } else {
      leadStatus.textContent = "Серверная отправка еще не подключена. Укажите Telegram-контакт или подключите lead-бота.";
    }
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = "Отправить заявку и перейти к оплате";
  }
});
