const CONTACT_TELEGRAM = "your_username";

const leadForm = document.getElementById("leadForm");
const leadStatus = document.getElementById("leadStatus");
const telegramDemoVideo = document.getElementById("telegramDemoVideo");

if (telegramDemoVideo) {
  const phoneFrame = telegramDemoVideo.closest(".phone-frame");

  telegramDemoVideo.addEventListener("loadeddata", () => {
    phoneFrame?.classList.add("has-demo-video");
    telegramDemoVideo.play().catch(() => {});
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
  const reason = String(formData.get("reason")).trim();
  const submitButton = leadForm.querySelector("button[type='submit']");

  const text = [
    "Заявка на личного AI-ассистента",
    "",
    `Имя: ${name}`,
    `Telegram: ${telegram}`,
    `Зачем нужен бот: ${reason}`,
    "",
    "Хочу собрать демо за 4 000 ₽. Понимаю, что в демо есть ограниченный лимит токенов для теста. Если подойдет, готов обсудить полную настройку за 8 000 ₽ с включенным пакетом токенов."
  ].join("\n");

  submitButton.disabled = true;
  submitButton.textContent = "Отправляю...";
  leadStatus.textContent = "Отправляю заявку в Telegram...";

  try {
    const response = await fetch("/api/lead", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, telegram, reason, text })
    });

    if (!response.ok) {
      throw new Error("Lead endpoint is not available");
    }

    leadStatus.textContent = "Заявка отправлена. Я напишу вам в Telegram.";
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
    submitButton.textContent = "Отправить заявку в Telegram";
  }
});
