# Action-classification backfill — review artifact

Supporting artifact for the catalog-wide `classification` backfill PR (PR B; the Gmail pilot was
activepieces#14913). **Not meant to be merged** — this branch exists so the PR can link the
review trail.

- `RUBRIC.md` — the classification rubric every wave applied, including the 13 approved rulings.
- `wave-0.jsonl … wave-12.jsonl` — one row per action/trigger: piece, item, kind, tag,
  confidence, rationale, source evidence (`file:line`), flags (`arbitrary-op`, `multiplex`),
  the independent rule-scan verdict, agreement, and review status. Rows Ibrahim overrode
  carry the original agent verdict in `agent_tag`.

1,374 accepted rows across 83 pieces (wave 0 = Gmail, shipped in #14913; waves 1–12 = the 82
pieces in PR B). 2 rows are `status: "skipped"` (Todos, Video AI — cloud-only, no source in repo).

## Extension 3 — waves 17–18 (2026-09-27, PIE-570)

`wave-17.jsonl` (878 rows, 106 pieces) and `wave-18.jsonl` (1,046 rows, 100 pieces): the top 200
untagged pieces ranked by usage summed across all published versions, plus the untagged actions
in jira-cloud, salesforce, quickbooks-desktop-conductor, clay, formio and typeform. Rows from
factory triggers carry a `factory` field; they collapse onto one `classification` line per
`createTrigger` callsite in the PR. `RUBRIC.md` gains the wave-17, wave-18 and wave-19 rulings (9 new).

`wave-19.jsonl` (282 rows): the 27 untagged pieces with a real usage of 1; zagomail's 10 rows are `status: "skipped"` (deprecated since #15452), so 26 pieces ship.
