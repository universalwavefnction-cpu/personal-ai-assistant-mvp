#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const DEFAULT_DATA_FILE = path.join(__dirname, "data", "usage-events.jsonl");
const DEFAULT_PRICING_FILE = path.join(__dirname, "pricing.json");

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function parseArgs(argv) {
  const args = {};
  for (let index = 0; index < argv.length; index += 1) {
    const item = argv[index];
    if (!item.startsWith("--")) continue;
    const key = item.slice(2);
    const next = argv[index + 1];
    if (!next || next.startsWith("--")) {
      args[key] = true;
    } else {
      args[key] = next;
      index += 1;
    }
  }
  return args;
}

function toNumber(value, fallback = 0) {
  if (value === undefined || value === null || value === "") return fallback;
  const next = Number(value);
  if (!Number.isFinite(next)) {
    throw new Error(`Expected a number, received: ${value}`);
  }
  return next;
}

function formatRub(value) {
  return `${Math.round(value).toLocaleString("ru-RU")} ₽`;
}

function getMonth(timestamp) {
  return new Date(timestamp).toISOString().slice(0, 7);
}

function getModelRate(pricing, model) {
  const rates = pricing.models[model];
  if (!rates) {
    const known = Object.keys(pricing.models).join(", ");
    throw new Error(`Unknown model "${model}". Add it to usage/pricing.json. Known: ${known}`);
  }
  return rates;
}

function priceTokens({ pricing, model, inputTokens, outputTokens, cachedInputTokens = 0 }) {
  const rate = getModelRate(pricing, model);
  const usdRub = toNumber(pricing.usd_rub_rate, 100);
  const markup = toNumber(pricing.markup_multiplier, 2);

  const inputUsd = (inputTokens / 1_000_000) * toNumber(rate.input_usd_per_million, 0);
  const outputUsd = (outputTokens / 1_000_000) * toNumber(rate.output_usd_per_million, 0);
  const cachedUsd = (cachedInputTokens / 1_000_000) * toNumber(rate.cached_input_usd_per_million, 0);
  const providerCostRub = (inputUsd + outputUsd + cachedUsd) * usdRub;
  const billableRub = providerCostRub * markup;

  return {
    provider_cost_rub: roundMoney(providerCostRub),
    billable_rub: roundMoney(billableRub),
    markup_multiplier: markup,
    usd_rub_rate: usdRub
  };
}

function roundMoney(value) {
  return Math.round(value * 100) / 100;
}

function ensureDataFile(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  if (!fs.existsSync(filePath)) fs.writeFileSync(filePath, "", "utf8");
}

function readEvents(filePath) {
  ensureDataFile(filePath);
  return fs
    .readFileSync(filePath, "utf8")
    .split("\n")
    .filter(Boolean)
    .map((line) => JSON.parse(line));
}

function appendEvent(filePath, event) {
  ensureDataFile(filePath);
  fs.appendFileSync(filePath, `${JSON.stringify(event)}\n`, "utf8");
}

function logUsage(args) {
  const pricing = readJson(args.pricing || DEFAULT_PRICING_FILE);
  const dataFile = args.data || DEFAULT_DATA_FILE;
  const model = args.model;
  if (!args.client) throw new Error("Missing --client");
  if (!model) throw new Error("Missing --model");

  const inputTokens = toNumber(args.input);
  const outputTokens = toNumber(args.output);
  const cachedInputTokens = toNumber(args.cached);
  const price = priceTokens({ pricing, model, inputTokens, outputTokens, cachedInputTokens });

  const event = {
    id: args.id || `usage_${Date.now()}_${Math.random().toString(16).slice(2, 8)}`,
    timestamp: args.timestamp || new Date().toISOString(),
    client_id: args.client,
    bot: args.bot || null,
    provider: args.provider || getModelRate(pricing, model).provider || null,
    model,
    request_type: args.type || "text",
    input_tokens: inputTokens,
    output_tokens: outputTokens,
    cached_input_tokens: cachedInputTokens,
    provider_cost_rub: price.provider_cost_rub,
    billable_rub: price.billable_rub,
    markup_multiplier: price.markup_multiplier,
    status: args.status || "success",
    note: args.note || null
  };

  appendEvent(dataFile, event);
  console.log(JSON.stringify(event, null, 2));
}

function summarize(args) {
  const dataFile = args.data || DEFAULT_DATA_FILE;
  const month = args.month || getMonth(new Date().toISOString());
  const clientFilter = args.client || null;
  const pricing = readJson(args.pricing || DEFAULT_PRICING_FILE);
  const events = readEvents(dataFile).filter((event) => {
    if (getMonth(event.timestamp) !== month) return false;
    if (clientFilter && event.client_id !== clientFilter) return false;
    return true;
  });

  const summaryByClient = new Map();
  for (const event of events) {
    const key = event.client_id;
    if (!summaryByClient.has(key)) {
      summaryByClient.set(key, {
        client_id: key,
        events: 0,
        input_tokens: 0,
        output_tokens: 0,
        cached_input_tokens: 0,
        provider_cost_rub: 0,
        billable_rub: 0,
        by_model: {}
      });
    }

    const summary = summaryByClient.get(key);
    summary.events += 1;
    summary.input_tokens += toNumber(event.input_tokens);
    summary.output_tokens += toNumber(event.output_tokens);
    summary.cached_input_tokens += toNumber(event.cached_input_tokens);
    summary.provider_cost_rub += toNumber(event.provider_cost_rub);
    summary.billable_rub += toNumber(event.billable_rub);

    const model = event.model || "unknown";
    if (!summary.by_model[model]) {
      summary.by_model[model] = { events: 0, input_tokens: 0, output_tokens: 0, billable_rub: 0 };
    }
    summary.by_model[model].events += 1;
    summary.by_model[model].input_tokens += toNumber(event.input_tokens);
    summary.by_model[model].output_tokens += toNumber(event.output_tokens);
    summary.by_model[model].billable_rub += toNumber(event.billable_rub);
  }

  const minimumInvoice = toNumber(pricing.minimum_invoice_rub, 0);
  const output = Array.from(summaryByClient.values()).map((summary) => ({
    ...summary,
    provider_cost_rub: roundMoney(summary.provider_cost_rub),
    billable_rub: roundMoney(summary.billable_rub),
    invoice_rub: Math.max(Math.ceil(summary.billable_rub), minimumInvoice)
  }));

  if (args.json) {
    console.log(JSON.stringify({ month, clients: output }, null, 2));
    return;
  }

  console.log(`Usage summary for ${month}`);
  if (clientFilter) console.log(`Client: ${clientFilter}`);
  if (output.length === 0) {
    console.log("No usage events.");
    return;
  }

  for (const summary of output) {
    console.log("");
    console.log(`Client: ${summary.client_id}`);
    console.log(`Events: ${summary.events}`);
    console.log(`Input tokens: ${summary.input_tokens.toLocaleString("ru-RU")}`);
    console.log(`Output tokens: ${summary.output_tokens.toLocaleString("ru-RU")}`);
    console.log(`Cached input: ${summary.cached_input_tokens.toLocaleString("ru-RU")}`);
    console.log(`Provider cost: ${formatRub(summary.provider_cost_rub)}`);
    console.log(`Billable usage: ${formatRub(summary.billable_rub)}`);
    console.log(`Invoice amount: ${formatRub(summary.invoice_rub)}`);
  }
}

function invoice(args) {
  if (!args.client) throw new Error("Missing --client");
  const month = args.month || getMonth(new Date().toISOString());
  const pricing = readJson(args.pricing || DEFAULT_PRICING_FILE);
  const dataFile = args.data || DEFAULT_DATA_FILE;
  const events = readEvents(dataFile).filter(
    (event) => event.client_id === args.client && getMonth(event.timestamp) === month
  );

  const totals = events.reduce(
    (acc, event) => {
      acc.events += 1;
      acc.input_tokens += toNumber(event.input_tokens);
      acc.output_tokens += toNumber(event.output_tokens);
      acc.cached_input_tokens += toNumber(event.cached_input_tokens);
      acc.provider_cost_rub += toNumber(event.provider_cost_rub);
      acc.billable_rub += toNumber(event.billable_rub);
      return acc;
    },
    { events: 0, input_tokens: 0, output_tokens: 0, cached_input_tokens: 0, provider_cost_rub: 0, billable_rub: 0 }
  );

  const minimumInvoice = toNumber(pricing.minimum_invoice_rub, 0);
  const invoiceAmount = Math.max(Math.ceil(totals.billable_rub), minimumInvoice);
  const text = [
    `Счет за использование AI-ассистента`,
    ``,
    `Клиент: ${args.client}`,
    `Период: ${month}`,
    `Запросов: ${totals.events}`,
    `Входные токены: ${totals.input_tokens.toLocaleString("ru-RU")}`,
    `Выходные токены: ${totals.output_tokens.toLocaleString("ru-RU")}`,
    `Кэшированные входные токены: ${totals.cached_input_tokens.toLocaleString("ru-RU")}`,
    `Расчетная себестоимость модели: ${formatRub(totals.provider_cost_rub)}`,
    `К оплате за usage: ${formatRub(invoiceAmount)}`,
    ``,
    `Расчет ведется по фактическому использованию модели. Если нужна детализация по запросам, я пришлю выгрузку.`
  ].join("\n");

  console.log(text);
}

function help() {
  console.log(`Usage ledger

Commands:
  log      Add one usage event
  summary  Show monthly usage summary
  invoice  Print client invoice text

Examples:
  node usage/usage.js log --client client_001 --bot @demo_bot --model gpt-5.4-mini --input 1200 --output 450 --type text
  node usage/usage.js summary --month 2026-05
  node usage/usage.js invoice --client client_001 --month 2026-05

Files:
  pricing: ${path.relative(ROOT, DEFAULT_PRICING_FILE)}
  data:    ${path.relative(ROOT, DEFAULT_DATA_FILE)}
`);
}

function main() {
  const [command, ...rest] = process.argv.slice(2);
  const args = parseArgs(rest);

  try {
    if (!command || command === "help" || command === "--help") return help();
    if (command === "log") return logUsage(args);
    if (command === "summary") return summarize(args);
    if (command === "invoice") return invoice(args);
    throw new Error(`Unknown command: ${command}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exitCode = 1;
  }
}

main();
