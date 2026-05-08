const CONTACT_TELEGRAM = "your_username";

const leadForm = document.getElementById("leadForm");
const requestResult = document.getElementById("requestResult");
const requestText = document.getElementById("requestText");
const telegramLink = document.getElementById("telegramLink");
const copyRequest = document.getElementById("copyRequest");
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

  const text = [
    "Заявка на личного AI-ассистента",
    "",
    `Имя: ${name}`,
    `Telegram: ${telegram}`,
    `Зачем нужен бот: ${reason}`,
    "",
    "Хочу собрать демо за 4 000 ₽. Понимаю, что рабочая ссылка гарантируется в течение 24 часов, обычно быстрее. Если подойдет, готов обсудить полную настройку за +8 000 ₽ с токенами."
  ].join("\n");

  requestText.textContent = text;
  telegramLink.href = `https://t.me/${CONTACT_TELEGRAM}`;
  requestResult.hidden = false;

  try {
    await navigator.clipboard.writeText(text);
    copyRequest.textContent = "Скопировано";
  } catch {
    copyRequest.textContent = "Скопировать";
  }
});

copyRequest.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(requestText.textContent);
    copyRequest.textContent = "Скопировано";
  } catch {
    copyRequest.textContent = "Выделите текст вручную";
  }
});
