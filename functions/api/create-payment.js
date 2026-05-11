const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type"
};

const products = {
  test: {
    amount: "4000.00",
    label: "Тестовая версия - 4 000 ₽, ограниченный лимит",
    description: "AI-бот Telegram: тестовая версия"
  },
  regular: {
    amount: "8000.00",
    label: "Обычная версия - 8 000 ₽, пакет токенов включен",
    description: "AI-бот Telegram: обычная версия с токенами"
  },
  demo: {
    amount: "1.00",
    label: "Тестовый платёж 1 ₽ (проверка флоу)",
    description: "Тест YooKassa: 1 ₽"
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

  const name = clean(payload.name, 80);
  const telegram = clean(payload.telegram, 80);
  const reason = clean(payload.reason, 1800);
  const productKey = products[payload.product] ? payload.product : "test";
  const product = products[productKey];
  const leadId = clean(payload.leadId, 80) || crypto.randomUUID();

  if (!name || !telegram || !reason) {
    return json({ ok: false, error: "Name, Telegram and reason are required" }, 400);
  }

  const origin = new URL(request.url).origin;
  let returnUrl = env.YOOKASSA_RETURN_URL || `${origin}/?payment=return`;
  // Allow callers to override the return path (e.g. /dev/) — same-origin only.
  const requestedReturnPath = clean(payload.returnPath, 80);
  if (requestedReturnPath && requestedReturnPath.startsWith("/") && !requestedReturnPath.startsWith("//")) {
    returnUrl = `${origin}${requestedReturnPath}${requestedReturnPath.includes("?") ? "&" : "?"}payment=return`;
  }
  const yookassaPayload = {
    amount: {
      value: product.amount,
      currency: "RUB"
    },
    capture: true,
    confirmation: {
      type: "redirect",
      return_url: returnUrl
    },
    description: product.description.slice(0, 128),
    metadata: {
      lead_id: leadId,
      product: productKey,
      telegram,
      name
    }
  };

  const yookassaResponse = await fetch("https://api.yookassa.ru/v3/payments", {
    method: "POST",
    headers: {
      Authorization: getAuthHeader(env),
      "Content-Type": "application/json",
      "Idempotence-Key": leadId
    },
    body: JSON.stringify(yookassaPayload)
  });

  let yookassaData;
  try {
    yookassaData = await yookassaResponse.json();
  } catch {
    return json({ ok: false, error: "YooKassa returned a non-JSON response" }, 502);
  }

  const confirmationUrl = yookassaData?.confirmation?.confirmation_url;
  if (!yookassaResponse.ok || !confirmationUrl || !yookassaData?.id) {
    return json({ ok: false, error: "YooKassa payment creation failed", details: yookassaData }, 502);
  }

  return json({
    ok: true,
    paymentId: yookassaData.id,
    confirmationUrl
  });
}
