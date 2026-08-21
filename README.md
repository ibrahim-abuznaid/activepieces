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
