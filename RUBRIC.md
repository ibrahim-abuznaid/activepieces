# Classification Rubric — action tags

**Approved by Ibrahim 2026-08-19.** This is the rule every classifying agent applies, verbatim.
Amendments require Ibrahim's sign-off; when a rule changes, affected manifest rows re-run.

## Evidence rule

Classify from the `run()` body (for triggers: `onEnable`/`run`/polling logic) and the API call it
makes. Names and descriptions are hints, never evidence.

## Precedence — first match wins

1. **DESTRUCTIVE** — removes or disables external state; a retry cannot restore it.
   (delete, purge, revoke, cancel, archive, stop/teardown of a subscription or watch)
2. **WRITE** — creates or changes external state, recoverably. Sending counts: a sent
   email/message is WRITE, not DESTRUCTIVE — it adds state, it doesn't destroy any.
   (create, send, post, update, upsert, move, assign, tag)
3. **SEARCH** — reads by query or enumeration, zero-or-more results, no mutation.
   (list, search, find, query)
4. **READ** — reads a specific known resource or fixed state.
   (get, retrieve, describe, download)

## Special rules

- All **triggers** → `READ` (polling and webhook alike). Rationale: the badge answers "does this
  step change anything?", and the READ/SEARCH split is about how you address data, which is
  meaningless for an event you did not ask for.
- **AI/LLM inference or generation** with no artifact persisted to an external system → `READ`.
  "Generate and upload/store" → `WRITE`.
- **Pure in-flow transforms** (text/math/date/json/csv/crypto helpers, data mapper) → `READ`.
- **Store piece** (key-value storage): get → `READ` · put/append → `WRITE` · delete → `DESTRUCTIVE`.
- **Arbitrary-operation actions** (raw SQL, raw HTTP, caller-supplied method) → `WRITE`, matching
  the T2 factory default, and flagged `arbitrary-op` in the manifest so Ahmad can revisit
  WRITE-vs-DESTRUCTIVE once, globally.
- **Multiplex actions** (one action with an `operation` prop that can read *or* delete) → tag the
  worst case reachable; if unclear → REVIEW.
- Anything not decidable from source → **REVIEW** (Ibrahim's queue). Never guess.

## Wave-1 rulings (approved by Ibrahim 2026-08-20)

- A step's own **FLOW-scoped `context.store` bookkeeping** (pagination cursors, chat history) is
  not external state — only the Store piece's own actions follow the store rule. A cursor-driven
  "next batch" fetch reads a specific known resource → `READ`, not SEARCH.
  (Ruled on `get_next_rows` / `sheets_get_next_rows`.)
- **Multiplex actions whose destructive path is behind an explicit non-default opt-in** (e.g. an
  overwrite checkbox) → tag the **default path**; keep the `multiplex` flag so the worst case
  stays auditable. (Ruled on the Sheets insert-multiple-rows pair: WRITE, not DESTRUCTIVE.)
- **Removing a reversible marker** (unpin, unstar, unmute) → `WRITE`, not DESTRUCTIVE — the
  underlying resource survives and the inverse action restores the state.
  (Ruled on `unpin_message` / `telegram_unpin_message`.)

## Wave-2 rulings (approved by Ibrahim 2026-08-20)

- **Delete-then-reinsert "replace"** (an unconditional delete of the target range/body before
  inserting the new content) → `DESTRUCTIVE` — the removed content is gone and a retry cannot
  restore it. An **in-place replace** (e.g. a `replaceAllText`-style request, no delete step)
  stays `WRITE`. (Ruled on `replace_body_with_markdown` / `replace_section_with_markdown`
  vs `replace_all_text`.)
- **AP-internal sinks are not external persistence.** Output landing only in the flow's own
  file store (`context.files.write`) or flow-scoped `context.store` does not make an AI
  inference/generation action WRITE — it stays `READ`. (Extends the wave-1 `context.store`
  ruling; confirmed across OpenAI/Groq/Gemini image, TTS, and video generation.)
- The **reversible-marker rule extends to removing a participant or formatting from a surviving
  resource** (remove attendee, clear paragraph bullets, unmerge table cells) → `WRITE`, since the
  resource survives and an inverse action restores the state.
  (Ruled on `google_calendar_remove_attendee`, `delete_paragraph_bullets`, `unmerge_table_cells`.)

## Wave-3 rulings (approved by Ibrahim 2026-08-20)

- **Exact-unique-key lookups → `READ` regardless of transport.** An action that addresses one
  specific resource by an exact unique key (ID, email, handle, exact name) and returns a single
  result (or null/error) is `READ`, even when the implementation enumerates the collection and
  filters client-side — the addressing semantics, not the API mechanics, is what the badge
  answers. Fuzzy or non-unique matching (display names, name-contains) stays `SEARCH`.
  (Ruled on `airtable_find_table`, `get_group_by_handle`, `find_user_by_email` vs
  `find-user-by-handle` / `find_channel`.)
- **Erasing field values counts as wipe-content** — an update whose distinctive purpose is
  writing null/empty over existing values (`allowEmpty`-style overwrite) → `DESTRUCTIVE`
  under the wave-2 delete-then-reinsert rule; a normal update that strips empty inputs stays
  `WRITE`. (Ruled on `airtable_clean_record` vs `airtable_update_record`.)

## Wave-4 rulings (approved by Ibrahim 2026-08-20)

- **AP-internal flow control → `READ`.** Aborting, stopping, or failing the flow's own run
  (`context.run.stop()`, throwing to fail the run) touches no external system — the run is
  AP-internal state, like `context.store` and `context.files`. Extends the wave-2 AP-internal
  ruling. (Ruled on `stopFlow` / `failFlow`.)
- **The wave-1 default-path amendment requires a genuinely non-default opt-in** (a checkbox or
  flag that defaults off). When the destructive capability is an equal, first-class shape of the
  same caller-supplied payload (e.g. a schema patch where a `null` value drops a column and its
  data), the base multiplex rule applies: tag the worst case reachable → `DESTRUCTIVE`, keep the
  `multiplex` flag. (Ruled on `notion_update_database_schema`.)

## Wave-8 ruling (approved by Ibrahim 2026-08-20)

- **Launching an autonomous agent job → `WRITE`.** Starting an agentic job that can act on
  external systems beyond a fixed read (an agent that browses *and interacts* with pages, or
  runs caller-supplied code) is `WRITE`, aligned with the Apify run-actor treatment — even when
  its purpose is data gathering. Fixed read-only operations that merely create a job record as
  bookkeeping (scrape/crawl/map/extract) stay `READ`/`SEARCH`.
  (Ruled on `firecrawl/start_agent` — FIRE-1 can interact with pages — vs the rest of Firecrawl.)

## Wave-9 rulings (approved by Ibrahim 2026-08-20)

- **Update-with-optional-archive → default path.** An update action whose optional
  `active`-style checkbox (no default; only sent when explicitly set) can archive/disable the
  resource follows the wave-1 default-path amendment → `WRITE` + `multiplex`, even when the
  archived state is recoverable. (Ruled on stripe `update_price` / `update_product`, matching
  the wave-7 pipedrive `update-product` override.)
- **A dedicated disable action stays `DESTRUCTIVE`** even when the platform allows re-enabling —
  its sole purpose is taking the resource out of service (precedence-1 "disables"), unlike the
  reversible-marker WRITEs, which remove an annotation from a resource that keeps serving.
  (Ruled on stripe `deactivate_payment_link` / `deactivate_payment_link_ai` — kept DESTRUCTIVE.)

## Wave-10 ruling (approved by Ibrahim 2026-08-21)

- **Permission/access revocation → `DESTRUCTIVE`.** Deleting a permission grant (un-sharing a
  file, revoking a user's access) takes a capability out of service — precedence-1 "revoke" —
  even though a new grant can be re-created. This is access control, not participation: the
  wave-2 remove-participant WRITEs (remove attendee, remove from list, unlink, remove reaction)
  stand unchanged. (Ruled on google-drive `delete_permissions` / `drive_remove_permission`.)

## Wave-13/14 rulings (approved by Ibrahim 2026-08-21)

- **Storage-product pieces follow the Store rule.** When a piece's product IS the stored
  collection (the Queue piece, like the Store piece), its own actions are classified by what they
  do to that collection — append → `WRITE`, consuming pull (items removed and gone from the
  queue) → `DESTRUCTIVE`, clear → `DESTRUCTIVE`. The AP-internal `context.store` carve-out does
  not apply to the piece whose feature is that storage. (Ruled on `queue/pull-from-queue` —
  its own aiMetadata calls it "a destructive consume rather than a peek".)
- **Refunding a captured payment → `DESTRUCTIVE`.** A refund reverses the capture with no inverse
  action (nothing can un-refund); precedence-1 cancel/void, even though the order record
  survives. (Ruled on `webflow/refund_order`.)

## Wave-15/16 ruling (approved by Ibrahim 2026-08-22)

- **A dedicated unsubscribe action → `DESTRUCTIVE`.** Unsubscribing a contact is a disable action
  whose sole purpose is taking the subscription out of service (wave-9 dedicated-disable), even
  when the member record survives with a status flag and the platform allows re-subscribing.
  Distinct from removing a tag/marker from a still-subscribed member, which stays `WRITE`.
  (Ruled on `mailchimp/unsubscribe_email` and `campaign-monitor/unsubscribe_subscriber`,
  matching `sendfox/unsubscribe` shipped in wave 13.)

## Output per item

`tag` · `confidence` (high/med/low) · one-line rationale citing `file:line`.
