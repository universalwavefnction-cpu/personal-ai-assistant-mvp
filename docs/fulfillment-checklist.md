# Fulfillment Checklist

Internal checklist for delivering the MVP manually.

## 0. Lead qualification

- [ ] Receive short form: name, Telegram, one-line reason.
- [ ] Reply in Telegram within 24 hours.
- [ ] Confirm this is a good pilot use case:
  - files/notes exist;
  - user has repeated writing/thinking/search tasks;
  - user understands this is not an autonomous agent;
  - user understands the first month is managed by you;
  - user understands long-term hosting/model/support can become a monthly plan or be migrated to their own infrastructure.
- [ ] Offer either:
  - Demo bot: 4 000 ₽;
  - Full setup after working demo link: +8 000 ₽;
  - Custom Soul for expert/team: priced separately, from 40 000 ₽.

## 1. Payment

- [ ] Send payment method/link/invoice.
- [ ] Confirm payment manually.
- [ ] Send post-payment brief from `docs/onboarding-brief.md`.
- [ ] For demo: set delivery clock to 24 hours after one scenario is received.
- [ ] For full setup: set delivery clock to 2 days after materials are received.

## 2. Materials intake

- [ ] Collect up to 10 materials for Personal tier.
- [ ] Ask for 3 priority scenarios.
- [ ] Ask for tone examples:
  - one good answer;
  - one bad answer;
  - preferred level of directness.
- [ ] Confirm safety boundaries:
  - medical/legal/financial topics require disclaimers;
  - no sending messages without confirmation;
  - no irreversible actions.

## 3. Server

- [ ] For MVP pilot, use your managed VPS so the client does not buy a server.
- [ ] Create a separate OS user, container, or isolated Hermes home for each client.
- [ ] Keep client files, tokens, logs, and profile separate.
- [ ] Track per-client usage manually.
- [ ] Log token usage through `usage/usage.js` after every model call or at least once per day from logs.
- [ ] Set default usage cap:
  - demo: 20 messages or 100 ₽ provider-cost ceiling;
  - full setup: 500 ₽ monthly usage ceiling until client approves more.
- [ ] If client requests full ownership later:
  - send `docs/server-instruction.md`;
  - migrate bot/profile/files to client-owned VPS;
  - transfer Telegram bot ownership if appropriate.
- [ ] Update packages.
- [ ] Configure basic firewall.
- [ ] Record bot username, server location, profile path, provider, renewal date, and support status in private CRM.

## 4. Hermes profile

- [ ] Install or update Hermes Agent.
- [ ] Create isolated client profile/home.
- [ ] Configure model provider/API key.
- [ ] Confirm provider works with a simple text prompt.
- [ ] Configure memory/material retrieval according to what Hermes currently supports.
- [ ] Do not mix client profiles or tokens.

## 5. Telegram bot

- [ ] For MVP pilot, you create the bot through BotFather.
- [ ] Set bot name, description, and profile picture if needed.
- [ ] Store token only in server env/config.
- [ ] Configure Telegram gateway/polling/webhook according to deployment.
- [ ] Test `/start`.
- [ ] Confirm only intended users can access it if allowlisting is available.
- [ ] If client later needs ownership, transfer the bot through BotFather after migration.

## 6. Personal Soul

Create a profile file or prompt with:

- [ ] Who the user is.
- [ ] What the assistant helps with.
- [ ] Tone and communication style.
- [ ] Preferred output formats.
- [ ] Key projects/materials.
- [ ] What the assistant should ask before assuming.
- [ ] What the assistant should never do.
- [ ] How to handle uncertainty.
- [ ] How to treat personal memory:
  - connected files;
  - saved profile;
  - recent conversation context;
  - no promise to remember everything forever.

## 7. Test scenarios

Run at least 3 tests:

- [ ] File/notes question.
- [ ] Voice note to structured answer.
- [ ] Writing task in user's tone.

For each:

- [ ] Save before/after prompt.
- [ ] Note what failed.
- [ ] Adjust Soul/profile or materials.
- [ ] Retest once.

## 8. Handoff

Send client:

- [ ] Telegram bot link.
- [ ] 5 example prompts.
- [ ] What it can do.
- [ ] What it cannot do.
- [ ] How to send new materials.
- [ ] How to report bad behavior.
- [ ] Support window: 7 days of small adjustments.

## 9. Case study request

For discounted early clients:

- [ ] Ask permission for anonymized case.
- [ ] Ask for one screenshot.
- [ ] Ask for one quote.
- [ ] Write case study:
  - client type;
  - initial pain;
  - materials connected;
  - 3 scenarios;
  - result;
  - what changed after testing.
