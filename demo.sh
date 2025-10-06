#!/usr/bin/env bash
set -euo pipefail

if ! command -v node >/dev/null 2>&1; then
  echo "Node.js is required to run FlowPilot" >&2
  exit 1
fi

SCRIPT_DIR=$(cd "$(dirname "$0")" && pwd)
CLI="$SCRIPT_DIR/dist/apps/cli/index.js"
if [ ! -f "$CLI" ]; then
  echo "Building FlowPilot CLI..."
  npx nx build flowpilot-cli >/dev/null
fi

export AP_BASE_URL="${AP_BASE_URL:-https://app.activepieces.com}" # replace with your instance
export AP_API_TOKEN="${AP_API_TOKEN:-<YOUR_TOKEN_HERE>}"
export AP_PROJECT_ID="${AP_PROJECT_ID:-<YOUR_PROJECT_ID>}"

if [[ "$AP_API_TOKEN" == *"<YOUR_TOKEN_HERE>"* ]]; then
  echo "Please export AP_BASE_URL, AP_API_TOKEN, and AP_PROJECT_ID before running the demo." >&2
  exit 1
fi

node "$CLI" plan "When a Trello card is created in list 'Incoming', post its title to Slack #ops" --output "$SCRIPT_DIR/examples/trello-to-slack.plan.json"
node "$CLI" plan "Webhook trigger captures text, convert to uppercase in code, then send an email" --output "$SCRIPT_DIR/examples/webhook-code-email.plan.json"

echo "Generated plans in the examples/ directory. Update placeholders and run:" >&2
echo "  node $CLI build --plan examples/trello-to-slack.plan.json" >&2
echo "  node $CLI build --plan examples/webhook-code-email.plan.json" >&2
