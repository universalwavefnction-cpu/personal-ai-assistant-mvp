const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type"
};

const products = {
  test: {
    amount: 4000,
    label: "Тестовая версия - 4 000 ₽, ограниченный лимит",
    comment: "AI-бот Telegram: тестовая версия"
  },
  regular: {
    amount: 8000,
    label: "Обычная версия - 8 000 ₽, пакет токенов включен",
    comment: "AI-бот Telegram: обычная версия с токенами"
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

function getPaymentUrlFromLava(data) {
  const candidates = [
    data?.data?.url,
    data?.data?.paymentUrl,
    data?.data?.payment_url,
    data?.data?.payUrl,
    data?.data?.pay_url,
    data?.data?.link,
    data?.data?.invoice?.url,
    data?.url,
    data?.paymentUrl,
    data?.payment_url,
    data?.payUrl,
    data?.pay_url,
    data?.link
  ];

  return candidates.find((value) => typeof value === "string" && value.startsWith("http")) || "";
}

async function hmacSha256Hex(secret, body) {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(body));

  return Array.from(new Uint8Array(signature))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

async function sendLeadToTelegram(env, text) {
  if (!env.TELEGRAM_BOT_TOKEN || !env.TELEGRAM_ADMIN_CHAT_ID) {
    return;
  }

  try {
    await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: env.TELEGRAM_ADMIN_CHAT_ID,
        text,
        disable_web_page_preview: true
      })
    });
  } catch {}
}

export async function onRequestOptions() {
  return new Response(null, { headers: corsHeaders });
}

export async function onRequestPost({ request, env }) {
  if (!env.LAVA_SECRET_KEY || !env.LAVA_SHOP_ID) {
    return json({ ok: false, error: "Lava payment is not configured" }, 500);
  }

  let payload;
  try {
    payload = await request.json();
  } catch {
    return json({ ok: false, error: "Invalid JSON" }, 400);
  }

  const name = clean(payload.name, 80);
  const telegram = clean(payload.telegram, 80);
  const reason = clean(payload.reason, 1800);
  const productKey = products[payload.product] ? payload.product : "test";
  const product = products[productKey];

  if (!name || !telegram || !reason) {
    return json({ ok: false, error: "Name, Telegram and reason are required" }, 400);
  }

  const origin = new URL(request.url).origin;
  const orderId = `ai-${Date.now()}-${crypto.randomUUID().slice(0, 8)}`;
  const successUrl = env.LAVA_SUCCESS_URL || `${origin}/?payment=success&order=${encodeURIComponent(orderId)}`;
  const failUrl = env.LAVA_FAIL_URL || `${origin}/?payment=fail&order=${encodeURIComponent(orderId)}`;
  const leadText = clean(payload.text, 3500) || [
    "Заявка на личного AI-ассистента",
    "",
    `Имя: ${name}`,
    `Telegram: ${telegram}`,
    `Версия: ${product.label}`,
    `Зачем нужен бот: ${reason}`
  ].join("\n");

  const lavaPayload = {
    shopId: env.LAVA_SHOP_ID,
    sum: product.amount,
    orderId,
    successUrl,
    failUrl,
    expire: 300,
    customFields: JSON.stringify({ name, telegram, product: productKey, orderId }).slice(0, 500),
    comment: product.comment
  };

  if (env.LAVA_HOOK_URL) {
    lavaPayload.hookUrl = env.LAVA_HOOK_URL;
  }

  const body = JSON.stringify(lavaPayload);
  const signature = await hmacSha256Hex(env.LAVA_SECRET_KEY, body);
  const lavaResponse = await fetch("https://api.lava.ru/business/invoice/create", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Signature: signature
    },
    body
  });

  let lavaData;
  try {
    lavaData = await lavaResponse.json();
  } catch {
    return json({ ok: false, error: "Lava returned a non-JSON response" }, 502);
  }

  if (!lavaResponse.ok || lavaData?.status === false) {
    return json({ ok: false, error: "Lava invoice creation failed", details: lavaData }, 502);
  }

  const paymentUrl = getPaymentUrlFromLava(lavaData);
  if (!paymentUrl) {
    return json({ ok: false, error: "Lava response does not include a payment URL", details: lavaData }, 502);
  }

  await sendLeadToTelegram(env, [
    leadText,
    "",
    `Lava orderId: ${orderId}`,
    `Сумма: ${product.amount} ₽`,
    `Ссылка оплаты: ${paymentUrl}`
  ].join("\n"));

  return json({ ok: true, paymentUrl, orderId });
}
