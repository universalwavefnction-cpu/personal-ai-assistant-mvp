# Personal AI Assistant MVP

Static MVP package for selling a concierge setup of a personal AI assistant in Telegram.
Client-facing promise: the client pays, sends materials, and receives a working Telegram bot.
The client can bring their own AI provider subscription/API, or use the managed setup.
BotFather, VPS, Hermes, model routing, and profile setup stay behind the scenes.

Provider note:

```text
Доступны Claude, ChatGPT, Gemini и другие AI-модели с оплатой по токенам.
Также можно подключить вашу личную или бизнес-подписку.
```

## What is included

- `index.html` - Russian landing page.
- `styles.css` - premium, restrained visual system.
- `app.js` - Telegram lead form and launch-cost calculator.
- `docs/costs.md` - launch and operating cost calculation.
- `docs/managed-flow.md` - exact client-facing and behind-the-scenes flow.
- `docs/token-usage-billing.md` - token metering and usage billing rules.
- `docs/fulfillment-checklist.md` - internal setup checklist.
- `docs/onboarding-brief.md` - detailed client brief after payment.
- `docs/outbound.md` - first-sales scripts and lead plan.
- `docs/server-instruction.md` - internal VPS instruction, plus optional client-owned migration path.

## Local preview

Open this file in a browser:

```text
/Users/universal.wavefunction/personal-ai-assistant-mvp/index.html
```

No build step is required.

## Before publishing

1. Edit `app.js`.
2. Replace:

```js
const CONTACT_TELEGRAM = "your_username";
```

with your real Telegram username without `@`.

3. Replace placeholder brand text if you choose a public name.
4. Connect a real form later only after manual sales prove demand.

## Recommended MVP stack

- Landing: this static page on Cloudflare Pages, GitHub Pages, Netlify, or Tilda.
- Form: current no-backend Telegram draft, or Yandex Forms.
- Payment: manual invoice/payment link first.
- Fulfillment: manual Hermes setup on your managed VPS for the first month.
- Usage billing: `usage/usage.js` JSONL ledger at MVP stage.
- CRM: a simple spreadsheet.

## MVP offer

Primary:

```text
Личный AI-ассистент в Telegram одним кликом.
Без возни с подписками, VPN, серверами и настройками.
Под капотом - лучшие AI-модели с возможностью смены.
Кастомный бот прилетает рабочей ссылкой в течение нескольких часов.
Демо за 4 000 ₽. Если бот полезен - полная настройка +8 000 ₽ с токенами.
Готов за 24 часа после оплаты демо и получения сценария.
Первый месяц managed-размещения включен, расход AI-модели оплачивается по токенам.
```

Secondary:

```text
Custom Soul для эксперта или команды - от 40 000 ₽.
```

## Client-facing flow

```text
Landing -> request -> Telegram chat -> payment -> onboarding brief -> you create bot/server/profile -> client receives Telegram bot link.
```

The client does not need to touch BotFather or VPS for the MVP pilot.

## Token usage ledger

Log one request:

```bash
node usage/usage.js log --client client_001 --bot @demo_bot --model gpt-5.4-mini --input 1200 --output 450 --type text
```

Monthly summary:

```bash
node usage/usage.js summary --month 2026-05
```

Invoice text:

```bash
node usage/usage.js invoice --client client_001 --month 2026-05
```
