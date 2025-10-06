# FlowPilot

FlowPilot is a code-only copilot that translates natural language into fully configured ActivePieces flows.

## Getting Started

### 1. Prerequisites

- Node.js 20+ and npm (ships with Node). Using [nvm](https://github.com/nvm-sh/nvm) makes switching versions easy.
- Docker Engine + Docker Compose (Desktop or CLI) to run a local ActivePieces stack.

### 2. Clone the repository

```bash
git clone https://github.com/activepieces/activepieces.git
cd activepieces
```

### 3. Bootstrap dependencies

Install the workspace packages and build the FlowPilot CLI:

```bash
npm install
npx nx build flowpilot-cli
```

### 4. Run ActivePieces locally (optional but recommended)

FlowPilot needs an ActivePieces backend to talk to. You can point it at a hosted environment, or run one locally:

1. Copy the sample environment file and fill in the secrets:

   ```bash
   cp .env.example .env
   # generate strong random values for the blanks, e.g.:
   openssl rand -hex 16 # for AP_ENCRYPTION_KEY and AP_JWT_SECRET
   openssl rand -hex 16 # for AP_API_KEY (optional)
   ```

2. Start the dockerised stack (API, Postgres, Redis):

   ```bash
   docker compose up -d
   ```

   The API becomes available at `http://localhost:8080`. Keep the containers running while you use FlowPilot.

3. Open the ActivePieces UI at `http://localhost:8080`, create an account, and generate an **API Key** from **Settings → API Keys**.

4. From **Projects**, note the **Project ID** you want FlowPilot to manage (usually visible in the browser URL or the project settings pane).

### 5. Configure FlowPilot environment variables

Export the connection details before running any CLI commands (replace placeholders with the values from step 4):

```bash
export AP_BASE_URL="http://localhost:8080/api"
export AP_API_TOKEN="<your-api-key>"
export AP_PROJECT_ID="<your-project-id>"
export AP_ENVIRONMENT="development" # optional, used for logging tags
```

> Never commit secrets. The CLI reads values from the environment and avoids logging sensitive data. You can also store them in a `.env.local` file and load with `dotenv-cli` if preferred.

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
