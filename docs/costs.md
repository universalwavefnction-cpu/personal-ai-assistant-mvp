# MVP Cost Calculation

Date checked: 2026-05-08.

This version assumes the client does not touch BotFather, VPS, API keys, or Hermes.

Client-facing flow:

```text
Client clicks -> chooses test version or regular version -> pays 4 000 ₽ or 8 000 ₽ -> sends short brief -> receives Telegram bot link.
```

Usage rule:

```text
Test version has only limited test usage. Regular version includes a token package. Extra tokens are topped up separately after the included package is used.
```

## Current price inputs

| Item | Planning number |
|---|---:|
| `.ru/.рф` domain | 169 ₽ |
| Static hosting | 0 ₽ |
| Yandex Forms / Telegram draft form | 0 ₽ |
| Tilda Personal monthly, optional | 750 ₽ |
| Timeweb Cloud VPS Cloud MSK 40 | 882 ₽/month |
| Timeweb Cloud VPS Cloud MSK 50 | 1 062 ₽/month |
| Usage ledger | 0 ₽, local JSONL |

OpenAI API example prices in `usage/pricing.json`:

| Model | Input | Cached input | Output |
|---|---:|---:|---:|
| `gpt-5.4-mini` | $0.75 / 1M | $0.075 / 1M | $4.50 / 1M |
| `gpt-5.4` | $2.50 / 1M | $0.25 / 1M | $15.00 / 1M |
| `gpt-5.5` | $5.00 / 1M | $0.50 / 1M | $30.00 / 1M |

Before production, recheck prices and update `usage/pricing.json`.

## Recommended MVP spend under 10 000 ₽

| Cost | Amount |
|---|---:|
| Domain | 169 ₽ |
| Static hosting | 0 ₽ |
| Managed VPS, first month, Cloud MSK 50 | 1 062 ₽ |
| Demo/model usage buffer | 1 500 ₽ |
| Visual polish / template buffer | 1 000 ₽ |
| Manual outbound / small placements | 4 000 ₽ |
| **Launch cash cost** | **7 731 ₽** |

This leaves **2 269 ₽** inside a 10 000 ₽ validation budget.

## Client pricing

```text
Тестовая версия: 4 000 ₽, ограниченный тестовый лимит.
Обычная версия: 8 000 ₽, пакет токенов включен.
Первый месяц managed-размещения включен.
После включенного пакета токены пополняются отдельно.
После первого месяца: поддержка и размещение 2 000-4 000 ₽/мес + usage.
```

## Usage billing

Use `usage/usage.js`:

```bash
node usage/usage.js log --client client_001 --bot @demo_bot --model gpt-5.4-mini --input 1200 --output 450 --type text
node usage/usage.js summary --month 2026-05
node usage/usage.js invoice --client client_001 --month 2026-05
```

Default billing config:

| Field | Value |
|---|---:|
| USD/RUB rate | 100 |
| Markup | 2x provider cost |
| Minimum usage invoice | 100 ₽ |

Why markup:

- payment fees;
- failed retries;
- small-client admin overhead;
- support time;
- currency risk;
- margin.

## Caps

Do not let usage run without limits.

Recommended MVP caps:

```text
Test version: small fixed test limit.
Regular version: included token package, then top-up only after client approval.
```

If client hits cap:

```text
Вы достигли месячного лимита usage. Могу пополнить лимит или переключить ассистента на более дешевую модель.
```

## Revenue math

One regular client:

| Item | Amount |
|---|---:|
| Regular version | 8 000 ₽ |
| Approx VPS share for first month, if 5 clients on one VPS | -212 ₽ |
| Example included token package | -500 ₽ target cap |
| Gross before tax/time | about 7 288 ₽ |

If you sell 10 test versions and 4 regular versions:

| Item | Amount |
|---|---:|
| 10 test versions x 4 000 ₽ | 40 000 ₽ |
| 4 regular versions x 8 000 ₽ | 32 000 ₽ |
| Total revenue | 62 000 ₽ |
| Recommended launch cash cost | -7 731 ₽ |
| Gross before tax/time | 54 269 ₽ |

If demand is weak, test-version payments still help cover validation cost.

## Client-facing wording

```text
Есть две версии. Тестовая стоит 4 000 ₽ и нужна, чтобы проверить работу бота на ограниченном лимите. Обычная стоит 8 000 ₽: это запуск с пакетом токенов. Когда пакет заканчивается, токены можно пополнить через Telegram.
```

## Sources

- REG.RU `.ru/.рф` domain promo: https://www.reg.ru/company/promotions/20202174
- REG.RU April 2026 price note: https://www.reg.ru/company/news/12897
- Timeweb Cloud VPS pricing: https://timeweb.cloud/services/cloud-servers
- Tilda RU pricing: https://tilda.cc/ru/pricing/
- OpenAI API pricing: https://openai.com/api/pricing/
- Yandex Forms: https://yandex.cloud/services/forms
- Cloudflare Pages pricing: https://www.cloudflare.com/developer-platform/products/pages/
