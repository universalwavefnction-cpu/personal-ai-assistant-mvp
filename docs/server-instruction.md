# VPS Instruction

For MVP sales, do not show this to the client by default. The client should click, pay, send materials, and receive a working Telegram bot.

Use this document internally for your managed server, or later if a client wants to migrate to client-owned infrastructure.

## Recommended minimum

- Ubuntu 22.04 or 24.04.
- 2 GB RAM minimum.
- 30-40 GB disk.
- Public IPv4.
- SSH access.

Example planning reference:

```text
Timeweb Cloud Cloud MSK 40:
2 CPU, 2 GB RAM, 40 GB NVMe, around 882 ₽/month.
```

## Client-facing migration wording

```text
В пилотной версии я размещаю ассистента сам, чтобы вы получили работающего бота без технической настройки.

Если позже вы хотите полный контроль над инфраструктурой, можно перенести ассистента на ваш VPS. Тогда сервер будет оформлен на вас, а бот, файлы и ключи будут находиться в вашей инфраструктуре.
```

## What to ask from the client

Only for migration or premium client-owned setup:

- Provider name.
- Server IP.
- SSH username.
- Temporary password or SSH key access.
- Confirmation that billing is on client's side.
- AI provider/API key if they already have one.
- Telegram bot token from BotFather, or approval for guided creation.

## Security note

Do not ask the client to paste permanent passwords into public chats.

Recommended:

- temporary SSH password;
- temporary user;
- password rotation after setup;
- never commit tokens to git;
- store bot/API keys only in server env/config.
