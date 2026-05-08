# Managed MVP Flow

This is the correct MVP flow if you want the client to click and receive a working Telegram assistant without touching BotFather or VPS.

## Client sees

```text
Landing
  -> clicks "Получить демо за 4 000 ₽"
  -> sends short request in Telegram
  -> pays 4 000 ₽
  -> sends one scenario
  -> receives bot link
  -> tests assistant in Telegram
  -> pays +8 000 ₽ if useful
  -> sends full materials
```

Client does not see:

- BotFather;
- VPS;
- SSH;
- Hermes;
- model providers;
- API keys;
- system services.

## You do behind the scenes

```text
Payment confirmed
  -> create Telegram bot in BotFather
  -> create isolated client profile on managed VPS
  -> configure Hermes
  -> connect model/provider
  -> connect bot token
  -> create small demo profile for one scenario
  -> log all model usage
  -> test demo
  -> send bot link
```

## How many bots?

One client gets one private Telegram bot.

Optional internal tools:

- one admin/support bot for your own notifications;
- one spreadsheet/CRM for client status.

Do not show the admin/support bot to clients.

## Infrastructure shape

For the first 3-5 clients:

```text
Your managed VPS
  client_001 Hermes profile -> Telegram bot A
  client_002 Hermes profile -> Telegram bot B
  client_003 Hermes profile -> Telegram bot C
```

Each client needs:

- separate bot token;
- separate Hermes profile/home;
- separate files/materials folder;
- separate Soul/profile prompt;
- separate logs where possible.
- separate usage ledger entries.

## Ownership language

For MVP:

```text
Первую версию я размещаю и обслуживаю сам, чтобы вы получили работающего Telegram-бота без технической настройки.
```

For later migration:

```text
Если вам нужен полный контроль, ассистента можно перенести на ваш сервер и передать Telegram-бота в ваше владение.
```

Telegram supports bot ownership transfer through BotFather, but treat this as a later handoff step, not part of first conversion.

## Important boundaries

- This is not instant SaaS provisioning yet.
- "Click and get working Telegram" means: pay and receive a working bot after manual setup.
- Public promise should be: "демо за 24 часа", not "готов мгновенно".
- Do not offer unlimited usage.
- Token/model usage must be metered and capped.
- Do not mix client files/profiles.
- Do not let a bot send external messages without confirmation.

## Recommended pricing for managed flow

```text
Демо-бот - 4 000 ₽
Полная настройка после демо - +8 000 ₽
Первый месяц managed-размещения включен.
Расход AI-модели оплачивается по фактическим токенам.
После первого месяца: сопровождение и размещение от 2 000-4 000 ₽/мес + usage.
```

For experts/teams:

```text
Custom Soul - от 40 000 ₽
Managed support - от 8 000 ₽/мес
```
