# Token Usage Billing

Goal: clients should pay for model usage instead of you silently absorbing unlimited token costs.

## Product rule

Client-facing pricing:

```text
Тестовая версия: 4 000 ₽, ограниченный тестовый лимит.
Обычная версия: 8 000 ₽, пакет токенов включен.
После включенного пакета токены пополняются отдельно.
```

Better wording:

```text
В тестовой версии есть небольшой лимит, чтобы проверить работу. В обычной версии пакет токенов включен сразу. Когда пакет заканчивается, его можно пополнить через Telegram.
```

Do not say "unlimited".

## Recommended MVP billing

For first clients:

- Demo payment: **4 000 ₽**.
- Regular version: **8 000 ₽** with included token package.
- First month hosting: included.
- Model usage: metered internally.
- Minimum monthly usage invoice: **100 ₽** while testing.
- Later minimum invoice: **300-500 ₽** after you have stable demand.
- Monthly managed support: **2 000-4 000 ₽/month** after first month, separate from tokens.

## Client-facing explanation

```text
Ассистент работает на AI-модели, а модели оплачиваются по токенам. Токены - это объем текста, который ассистент читает и пишет.

Я показываю расход в конце месяца: сколько было запросов, сколько токенов ушло и сколько это стоит. Чтобы не было сюрпризов, можно поставить лимит, например 500 ₽/мес.
```

## How to meter usage

Every model response usually returns a `usage` object from the provider. After each Hermes/model call, log:

- client id;
- bot username;
- provider;
- model;
- input tokens;
- output tokens;
- cached input tokens if available;
- request type: text, voice, file, image;
- timestamp.

The MVP package includes a dependency-free JSONL ledger:

```text
usage/usage.js
usage/pricing.json
usage/data/usage-events.jsonl
```

## Commands

Log one request:

```bash
node usage/usage.js log \
  --client client_001 \
  --bot @ivan_ai_bot \
  --model gpt-5.4-mini \
  --input 1200 \
  --output 450 \
  --type text
```

Show monthly summary:

```bash
node usage/usage.js summary --month 2026-05
```

Create invoice text:

```bash
node usage/usage.js invoice --client client_001 --month 2026-05
```

## Example output

```text
Счет за использование AI-ассистента

Клиент: client_001
Период: 2026-05
Запросов: 184
Входные токены: 420 000
Выходные токены: 96 000
Расчетная себестоимость модели: 85 ₽
К оплате за usage: 170 ₽
```

The default markup multiplier is `2x`, configured in `usage/pricing.json`. This covers payment fees, failed calls, support overhead, and margin.

## Price configuration

Edit:

```text
usage/pricing.json
```

Important fields:

- `usd_rub_rate`: explicit exchange rate for reproducible invoices;
- `markup_multiplier`: your billing multiplier;
- `minimum_invoice_rub`: minimum monthly usage invoice;
- `models`: provider/model token prices.

OpenAI API examples are included for:

- `gpt-5.4-mini`;
- `gpt-5.4`;
- `gpt-5.5`.

Before production, recheck model prices and update this file.

## Integration point

Wherever your Hermes wrapper receives a provider response, add:

```js
const usage = response.usage || {};

await logUsage({
  client: clientId,
  bot: botUsername,
  model: modelName,
  input: usage.input_tokens || usage.prompt_tokens || 0,
  output: usage.output_tokens || usage.completion_tokens || 0,
  cached: usage.cached_input_tokens || usage.cache_read_input_tokens || 0,
  type: requestType
});
```

If you cannot hook into Hermes yet, start with manual logging from server logs once per day. Exact automation can come after the first paid clients.

## Limits

Use caps so the MVP cannot run away:

```text
Демо: до 20 сообщений или 100 ₽ usage-себестоимости.
Полная настройка: лимит usage по умолчанию 500 ₽/мес, можно поднять вручную.
```

If client hits the limit:

```text
Вы достигли месячного лимита usage. Могу пополнить лимит или переключить ассистента на более дешевую модель.
```

## Why not expose exact provider cost only?

Charge `provider cost x markup`, not raw cost. Raw provider cost does not include:

- failed retries;
- payment commissions;
- your support time;
- monitoring;
- server overhead;
- currency risk;
- small-client admin overhead.

For MVP, `2x` is reasonable. If support load is high, move to:

```text
2 000-4 000 ₽/мес managed support + usage at 1.5x-2x provider cost.
```
