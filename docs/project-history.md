# Project History

Last updated: 2026-05-12

This document preserves the product and implementation history of the personal AI assistant landing page. It is intentionally written without API keys, bot tokens, shop secrets, or private payment credentials.

## Current State

- Repository: `https://github.com/universalwavefnction-cpu/personal-ai-assistant-mvp`
- Live domain: `https://wavebotai.ru/`
- Hosting: Cloudflare Pages, auto-deploying from GitHub `main`.
- Product: a personal AI assistant in Telegram, delivered as a working bot link.
- Main offer:
  - test version: `4 000 ₽`, limited test usage;
  - regular version: `8 000 ₽`, token package included.
- Payment flow: form first, then payment, then Telegram lead delivery only after payment verification.
- Analytics: Yandex.Metrika counter `109144424` with funnel goals in `app.js`.

## Product Direction

The project started as a minimum-investment concierge MVP for Russian-speaking clients who want an AI assistant in Telegram without dealing with servers, BotFather, VPNs, model providers, or agent setup.

The positioning moved from a narrow business assistant to a broader personal AI assistant:

```text
Личный AI-ассистент в Telegram одним кликом.
```

The public message avoids technical terms such as Hermes, VPS, systemd, OAuth, orchestration, and model plumbing. The client-facing promise is simple: fill a short brief, pay, and receive a working Telegram bot.

The product is not positioned as "the best AI" or a fake autonomous employee. It is framed as a useful Telegram-based assistant that can understand voice, work with files, help write, research, code, create websites, and gradually fit the user's context.

## Landing Page Evolution

The first version was a simple Russian landing page with a semi-manual funnel. After several iterations, the visual direction became:

- Telegram-adjacent, not Telegram-branded;
- dark hero with a real iPhone-style Telegram demo;
- cream/light sections for trust and readability;
- less hype, less crypto-like, less aggressive brightness;
- clear product copy focused on "one-click Telegram bot";
- no public mention of the client needing to buy a server or create a Telegram bot.

The hero video went through several fixes:

- real screen recording was added as `assets/telegram-demo.mp4`;
- autoplay was removed;
- the video starts only after the user clicks play;
- native controls allow seeking, volume, and fullscreen;
- the video pauses when scrolled out of view;
- the iPhone frame and demo proportions were repeatedly adjusted.

## Offer And Pricing Decisions

The early pricing idea was a small upfront demo payment and a larger final payment. The final MVP split became two separate products:

```text
Тестовая версия — 4 000 ₽, ограниченный лимит.
Обычная версия — 8 000 ₽, пакет токенов включен.
```

The difference is intentionally simple:

- `4 000 ₽`: test bot, one scenario, limited usage, enough to prove that the bot works.
- `8 000 ₽`: regular bot, tokens included, more serious first setup.

Business/custom work is not the main landing-page product. It is handled as a contact path:

```text
Если у вас бизнес, команда или нужна глубокая Custom Soul-настройка, напишите отдельно.
```

The user can also bring their own AI provider subscription/API when technically possible.

## Payment Flow History

Several payment approaches were explored:

1. Manual Telegram/payment-link flow.
2. Lava Business invoice/API direction.
3. Lava.top product-link flow.
4. YooKassa API redirect flow.

The current implementation uses YooKassa because it supports a stricter flow:

```text
landing form
-> /api/create-payment
-> YooKassa confirmation page
-> return to site
-> /api/check-payment
-> Telegram lead is sent only if payment is succeeded
```

This replaced earlier behavior where the form could open Telegram before payment. That was rejected because the desired flow is: the user fills the form, clicks pay, pays, and only then the paid application reaches Telegram.

Current payment files:

- `functions/api/create-payment.js` creates YooKassa payments server-side.
- `functions/api/check-payment.js` checks payment status and sends the paid lead to Telegram.
- `app.js` stores the pending lead locally until the payment return, then asks the backend to verify payment.

Required Cloudflare environment variables:

```text
TELEGRAM_BOT_TOKEN
TELEGRAM_ADMIN_CHAT_ID
YOOKASSA_SHOP_ID
YOOKASSA_SECRET_KEY
YOOKASSA_RETURN_URL
```

No real secret values should be committed.

## Analytics History

Yandex.Metrika was added for basic validation. The earlier counter was replaced by the current active counter:

```text
109144424
```

Current funnel goals in `app.js` include:

- `cta_click`;
- `pricing_choice`;
- `telegram_contact`;
- `form_started`;
- `payment_initiated`;
- `payment_success`.

## Lead And Contact Rules

The main payment form should not send the client to Telegram before payment.

The support/contact link is allowed under the payment block for questions:

```text
@universal_wavefunction
```

This contact is separate from the primary submit action.

## Avito Package

An Avito package was created to promote the MVP without paid ads:

- `docs/avito-listing.md` contains the listing text, moderation-safe short version, first replies, and visual plan.
- `assets/avito-cover.png` contains the generated Avito cover.
- A copy was also exported to Downloads as `avito-ai-bot-telegram-thumbnail.png`.

The Avito positioning:

```text
Личный AI-бот в Telegram за 24 часа
```

It keeps the two-product distinction clear:

- `4 000 ₽`: test version with limited usage.
- `8 000 ₽`: regular version with token package included.

## Usage Billing

Token usage is part of the MVP economics. The project includes a lightweight usage ledger:

- `usage/usage.js`;
- `usage/pricing.json`;
- `docs/token-usage-billing.md`.

The current rule:

```text
В тестовой версии есть небольшой лимит, чтобы проверить работу.
В обычной версии пакет токенов включен сразу.
Когда пакет заканчивается, его можно пополнить через Telegram.
```

The MVP can start with manual or semi-manual usage logging and later move into automated per-client dashboards.

## Deployment Notes

Cloudflare Pages is the deployment target. The root site was promoted from the stronger `/dev/` design after visual iteration.

Important deployment detail: if the payment flow appears to open Telegram or use old wording, check cache-busted asset versions and Cloudflare deployment status before rewriting the flow. This happened during iteration when stale JavaScript made the live behavior look older than the repo.

## Known Limitations

- Payment verification currently depends on the user returning to the site after YooKassa payment. A YooKassa webhook would make Telegram delivery more robust.
- Actual payment and bot tokens are configured in Cloudflare, not stored in the repo.
- Metrika confirms tracking code and goals in the site, but real dashboard statistics must be checked inside Yandex.Metrika.
- First client fulfillment is still concierge/manual by design.
- Reviews/case studies still need to be collected from the first users.

## Next Recommended Steps

1. Add a YooKassa webhook for payment success so Telegram delivery does not depend only on return-page behavior.
2. Run one real low-risk end-to-end payment test in production.
3. Collect first three testimonials/screenshots in exchange for the MVP price.
4. Publish the Avito listing using `assets/avito-cover.png`.
5. Add a simple fulfillment checklist per paid lead so no request is missed.
6. Keep the product narrow until real customer objections show what the next tier should be.
