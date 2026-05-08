# MVP Cost Calculation

Date checked: 2026-05-08.

This version assumes the client does not touch BotFather, VPS, API keys, or Hermes.

Client-facing flow:

```text
Client clicks -> pays 4 000 ₽ -> sends one scenario -> receives demo bot link -> pays +8 000 ₽ for full setup if useful.
```

Usage rule:

```text
Model usage is metered by tokens and billed separately after the included demo limit.
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
Демо-бот: 4 000 ₽
Полная настройка после демо: +8 000 ₽
Первый месяц managed-размещения включен.
Расход AI-модели оплачивается отдельно по токенам.
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
Demo: up to 20 messages or 100 ₽ provider-cost ceiling.
Full setup: default 500 ₽/month usage cap unless client approves more.
```

If client hits cap:

```text
Вы достигли месячного лимита usage. Могу пополнить лимит или переключить ассистента на более дешевую модель.
```

## Revenue math

One client who converts:

| Item | Amount |
|---|---:|
| Demo | 4 000 ₽ |
| Full setup | 8 000 ₽ |
| Total setup revenue | 11 000 ₽ |
| Approx VPS share for first month, if 5 clients on one VPS | -212 ₽ |
| Example model usage buffer, billed separately if above demo limit | 0 ₽ net target |
| Gross before tax/time | about 10 788 ₽ |

If you sell 10 demos and 4 convert:

| Item | Amount |
|---|---:|
| 10 demos x 4 000 ₽ | 40 000 ₽ |
| 4 conversions x 8 000 ₽ | 32 000 ₽ |
| Total revenue | 62 000 ₽ |
| Recommended launch cash cost | -7 731 ₽ |
| Gross before tax/time | 54 269 ₽ |

If conversion is weak, the demo payments still help cover validation cost.

## Client-facing wording

```text
Демо стоит 4 000 ₽: я собираю бота под один ваш сценарий и отправляю рабочую ссылку. Если демо полезно, полная настройка стоит +8 000 ₽ с токенами. Использование модели считается отдельно по токенам, с месячным лимитом, чтобы не было неожиданных расходов.
```

## Sources

- REG.RU `.ru/.рф` domain promo: https://www.reg.ru/company/promotions/20202174
- REG.RU April 2026 price note: https://www.reg.ru/company/news/12897
- Timeweb Cloud VPS pricing: https://timeweb.cloud/services/cloud-servers
- Tilda RU pricing: https://tilda.cc/ru/pricing/
- OpenAI API pricing: https://openai.com/api/pricing/
- Yandex Forms: https://yandex.cloud/services/forms
- Cloudflare Pages pricing: https://www.cloudflare.com/developer-platform/products/pages/
