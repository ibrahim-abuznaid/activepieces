# FlowPilot

FlowPilot is a code-only copilot that translates natural language into fully configured ActivePieces flows.

## Getting Started

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Build the CLI**

   ```bash
   npx nx build flowpilot-cli
   ```

3. **Set environment variables**

   ```bash
   export AP_BASE_URL="https://your-activepieces.example/api"
   export AP_API_TOKEN="<api-token>"
   export AP_PROJECT_ID="<project-id>"
   export AP_ENVIRONMENT="production" # optional
   ```

   > Never commit secrets. The CLI reads values from the environment and avoids logging sensitive data.

## Core Packages

- `@flowpilot/activepieces-client` — typed REST client with retry handling.
- `@flowpilot/flow-builder` — idempotent plan-to-operations executor.
- `@flowpilot/planner` — prompt-to-plan translator using live piece metadata.
- `@flowpilot/cli` — command line entry point for planning, building, enabling, and simulating flows.

## Demo Flows

The repository ships with ready-to-run demonstrations:

1. **Trello → Slack Notification**
2. **Webhook → Code → Email**

Generate updated plans and run the builder with the `demo.sh` helper:

```bash
./demo.sh
```

The script writes enriched plans to `examples/`. Review the placeholders, fill in IDs, then build:

```bash
node dist/apps/cli/index.js build --plan examples/trello-to-slack.plan.json
node dist/apps/cli/index.js build --plan examples/webhook-code-email.plan.json
```

Add `--dry-run` to preview the API operations without mutating the workspace.

## Useful Commands

```bash
node dist/apps/cli/index.js list-pieces
node dist/apps/cli/index.js plan "Describe your automation"
node dist/apps/cli/index.js build --plan path/to/plan.json --dry-run
node dist/apps/cli/index.js enable --flow <flow-id>
node dist/apps/cli/index.js simulate --flow <flow-id>
```

## Testing

Run unit tests for the planner and builder layers:

```bash
npx nx test flowpilot-planner
npx nx test flowpilot-flow-builder
```

The planner tests assert JSON serialization and schema compliance, while the builder suite verifies deterministic sequencing and placeholder detection.
