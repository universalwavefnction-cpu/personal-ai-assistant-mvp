const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type"
};

const products = {
  test: {
    amount: "4000.00",
    label: "Тестовая версия - 4 000 ₽, ограниченный лимит"
  },
  regular: {
    amount: "8000.00",
    label: "Обычная версия - 8 000 ₽, пакет токенов включен"
  },
  demo: {
    amount: "1.00",
    label: "Тестовый платёж 1 ₽ (проверка флоу)"
  }
};

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json; charset=utf-8"
    }
  });
}

function clean(value, maxLength) {
  return String(value || "").trim().slice(0, maxLength);
}

function getAuthHeader(env) {
  return `Basic ${btoa(`${env.YOOKASSA_SHOP_ID}:${env.YOOKASSA_SECRET_KEY}`)}`;
}

async function sendTelegram(env, text) {
  if (!env.TELEGRAM_BOT_TOKEN || !env.TELEGRAM_ADMIN_CHAT_ID) {
    throw new Error("Telegram lead bot is not configured");
  }

  const telegramResponse = await fetch(
    `https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: env.TELEGRAM_ADMIN_CHAT_ID,
        text,
        disable_web_page_preview: true
      })
    }
  );

  if (!telegramResponse.ok) {
    throw new Error("Telegram delivery failed");
  }
}

export async function onRequestOptions() {
  return new Response(null, { headers: corsHeaders });
}

export async function onRequestPost({ request, env }) {
  if (!env.YOOKASSA_SHOP_ID || !env.YOOKASSA_SECRET_KEY) {
    return json({ ok: false, error: "YooKassa is not configured" }, 500);
  }

  let payload;
  try {
    payload = await request.json();
  } catch {
    return json({ ok: false, error: "Invalid JSON" }, 400);
  }

  const paymentId = clean(payload.paymentId, 120);
  const name = clean(payload.name, 80);
  const telegram = clean(payload.telegram, 80);
  const reason = clean(payload.reason, 1800);
  const leadId = clean(payload.leadId, 80);
  const productKey = products[payload.product] ? payload.product : "test";
  const product = products[productKey];

  if (!paymentId || !name || !telegram || !reason) {
    return json({ ok: false, error: "Payment id, name, Telegram and reason are required" }, 400);
  }

  const yookassaResponse = await fetch(`https://api.yookassa.ru/v3/payments/${encodeURIComponent(paymentId)}`, {
    method: "GET",
    headers: {
      Authorization: getAuthHeader(env),
      "Content-Type": "application/json"
    }
  });

  let payment;
  try {
    payment = await yookassaResponse.json();
  } catch {
    return json({ ok: false, error: "YooKassa returned a non-JSON response" }, 502);
  }

  if (!yookassaResponse.ok) {
    return json({ ok: false, error: "YooKassa payment lookup failed", details: payment }, 502);
  }

  if (payment.status !== "succeeded" || payment.paid !== true) {
    return json({ ok: false, error: "Payment is not succeeded yet", status: payment.status }, 409);
  }

  if (payment.amount?.value !== product.amount || payment.amount?.currency !== "RUB") {
    return json({ ok: false, error: "Payment amount does not match selected product" }, 409);
  }

  const text = [
    "Оплаченная заявка на личного AI-ассистента",
    "",
    `ID заявки: ${leadId || "нет"}`,
    `ЮKassa payment_id: ${paymentId}`,
    `Имя: ${name}`,
    `Telegram: ${telegram}`,
    `Версия: ${product.label}`,
    `Сумма: ${payment.amount.value} ${payment.amount.currency}`,
    `Зачем нужен бот: ${reason}`,
    "",
    "Оплата проверена через ЮKassa: status=succeeded."
  ].join("\n");

  try {
    await sendTelegram(env, text);
  } catch (error) {
    return json({ ok: false, error: error.message }, 502);
  }

  return json({ ok: true, status: payment.status });
}
