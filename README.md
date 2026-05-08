# Personal AI Assistant MVP

Static MVP package for selling a concierge setup of a personal AI assistant in Telegram.
Client-facing promise: the client pays, sends materials, and receives a working Telegram bot.
The client can bring their own AI provider subscription/API, or use the managed setup.
BotFather, VPS, Hermes, model routing, and profile setup stay behind the scenes.

Provider note:

```text
Тестовая версия за 4 000 ₽ проверяет, что бот работает.
Обычная версия за 8 000 ₽ идет с пакетом токенов.
```

## What is included

- `index.html` - Russian landing page.
- `styles.css` - premium, restrained visual system.
- `app.js` - onboarding form that saves the lead locally, opens the Lava.top payment link, then sends the lead after a success return.
- `functions/api/lead.js` - Cloudflare Pages Function that sends paid leads to your Telegram bot.
- `docs/costs.md` - launch and operating cost calculation.
- `docs/managed-flow.md` - exact client-facing and behind-the-scenes flow.
- `docs/token-usage-billing.md` - token metering and usage billing rules.
- `docs/fulfillment-checklist.md` - internal setup checklist.
- `docs/onboarding-brief.md` - detailed client brief after payment.
- `docs/outbound.md` - first-sales scripts and lead plan.
- `docs/avito-listing.md` - ready Avito listing, chat replies, and visual guidance.
- `docs/server-instruction.md` - internal VPS instruction, plus optional client-owned migration path.

## Local preview

Open this file in a browser:

```text
/Users/universal.wavefunction/personal-ai-assistant-mvp/index.html
```

No build step is required.

## Before publishing

1. Create a Telegram bot through `@BotFather`.
2. Deploy the repo to Cloudflare Pages.
3. Add Cloudflare Pages environment variables:

```text
TELEGRAM_BOT_TOKEN=token from BotFather
TELEGRAM_ADMIN_CHAT_ID=your Telegram chat id
```

4. Payment uses fixed Lava.top product links in `app.js`:

```js
const LAVA_TOP_PAYMENT_LINKS = {
  test: "https://app.lava.top/products/20feaa87-334b-4dde-9e0c-f8701ae2afbc",
  regular: "https://app.lava.top/products/9d62b40c-52b6-4ff9-80b5-17adb3b6b0fc"
};
```

5. Telegram contact is configured in `app.js`:

```js
const CONTACT_TELEGRAM = "universal_wavefunction";
```

6. In Lava.top, set the success return URL for both products to:

```text
https://wavebotai.ru/?payment=success
```

Optional failed-payment return:

```text
https://wavebotai.ru/?payment=fail
```

7. Replace placeholder brand text if you choose a public name.

## Recommended MVP stack

- Landing: this static page on Cloudflare Pages, GitHub Pages, Netlify, or Tilda.
- Form: short brief before payment, saved in the browser until payment success return.
- Payment: direct Lava.top product links for the 4 000 ₽ test version and 8 000 ₽ regular version.
- Post-payment lead: when Lava.top returns to `?payment=success`, the saved brief is sent to Telegram through `/api/lead`.
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
Тестовая версия за 4 000 ₽ с ограниченным лимитом.
Обычная версия за 8 000 ₽ с включенным пакетом токенов.
Готов за 24 часа после оплаты выбранной версии и получения сценария.
Первый месяц managed-размещения включен, расход AI-модели оплачивается по токенам.
```

Secondary:

```text
Custom Soul для эксперта или команды - от 40 000 ₽.
```

## Client-facing flow

```text
Landing -> short brief -> Lava.top payment -> success return -> paid lead arrives in Telegram -> onboarding brief if needed -> you create bot/server/profile -> client receives Telegram bot link.
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
