#!/usr/bin/env node
import 'dotenv/config';

import chalk from 'chalk';
import { Command } from 'commander';
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

import {
  ApiError,
  createBackendFromEnv,
  IFlowBackend,
} from '@flowpilot/activepieces-client';
import {
  FlowBuilder,
  FlowPlan,
  MissingInputsError,
  flowPlanSchema,
} from '@flowpilot/flow-builder';
import {
  PieceCatalog,
  planFromPrompt,
} from '@flowpilot/planner';
import { PropertyType } from '@activepieces/pieces-framework';

interface BuildCommandOptions {
  plan: string;
  dryRun?: boolean;
}

const program = new Command();
program
  .name('flowpilot')
  .description('FlowPilot CLI for planning and building ActivePieces flows')
  .version('0.1.0');

async function loadPlanFile(planPath: string): Promise<FlowPlan> {
  const file = await readFile(planPath, 'utf8');
  const parsed = JSON.parse(file);
  return flowPlanSchema.parse(parsed);
}

async function savePlanFile(planPath: string, plan: FlowPlan) {
  const absolute = path.resolve(planPath);
  await writeFile(absolute, JSON.stringify(plan, null, 2) + '\n', 'utf8');
  console.log(chalk.green(`Saved plan to ${absolute}`));
}

function handleCliError(error: unknown) {
  if (error instanceof MissingInputsError) {
    console.error(chalk.red('Plan is missing required inputs:'));
    error.placeholders.forEach((field) => console.error(`  - ${field}`));
    process.exitCode = 1;
    return;
  }
  if (error instanceof ApiError) {
    console.error(
      chalk.red(
        `API request failed (${error.status}). ${
          typeof error.response === 'string'
            ? error.response
            : JSON.stringify(error.response)
        }`,
      ),
    );
    process.exitCode = 1;
    return;
  }
  console.error(chalk.red(String(error)));
  process.exitCode = 1;
}

program
  .command('list-pieces')
  .description('List available pieces')
  .option('-r, --refresh', 'Refresh cached metadata')
  .action(async (options: { refresh?: boolean }) => {
    const backend = createBackendFromEnv();
    const catalog = new PieceCatalog(backend);
    const pieces = await catalog.listPieces({ refresh: options.refresh });
    pieces.forEach((piece) => {
      console.log(`${piece.name}@${piece.version} — ${piece.displayName}`);
    });
  });

program
  .command('plan')
  .description('Generate a FlowPlan from natural language')
  .argument('<prompt...>', 'User prompt describing the automation')
  .option('-o, --output <file>', 'Output file path for the generated plan')
  .action(async (promptWords: string[], options: { output?: string }) => {
    const backend = createBackendFromEnv();
    const catalog = new PieceCatalog(backend);
    const prompt = promptWords.join(' ');
    const result = await planFromPrompt(prompt, catalog);
    if (options.output) {
      await savePlanFile(options.output, result.plan);
    } else {
      console.log(JSON.stringify(result.plan, null, 2));
    }
    if (result.checklist.length > 0) {
      console.log('\nChecklist:');
      result.checklist.forEach((item) => {
        console.log(` • ${item.field}${item.description ? ` — ${item.description}` : ''}`);
      });
    }
    if (result.notes.length > 0) {
      console.log('\nNotes:');
      result.notes.forEach((note) => console.log(` • ${note}`));
    }
  });

program
  .command('build')
  .description('Build a flow from a plan JSON file')
  .requiredOption('-p, --plan <file>', 'Path to the plan JSON file')
  .option('--dry-run', 'Preview operations without applying them')
  .action(async (options: BuildCommandOptions) => {
    const backend = createBackendFromEnv();
    const builder = new FlowBuilder(backend);
    const plan = await loadPlanFile(options.plan);
    const result = await builder.build(plan, { dryRun: options.dryRun });
    console.log(chalk.cyan(`Flow ID: ${result.flowId}`));
    console.log(chalk.cyan(`Created new flow: ${result.created}`));
    console.log(chalk.yellow(`${result.operations.length} operations planned`));
    result.operations.forEach((op, index) => {
      console.log(` ${index + 1}. ${op.label} (${op.operation.type})`);
    });
    if (options.dryRun) {
      console.log(chalk.magenta('Dry run complete — no API calls were executed.'));
    }
  });

program
  .command('enable')
  .description('Enable a flow by ID')
  .requiredOption('-f, --flow <id>', 'Flow identifier')
  .action(async (options: { flow: string }) => {
    const backend = createBackendFromEnv();
    await backend.flows.changeStatus(options.flow, 'ENABLED');
    console.log(chalk.green(`Flow ${options.flow} enabled`));
  });

program
  .command('simulate')
  .description('Print the current structure of a flow')
  .requiredOption('-f, --flow <id>', 'Flow identifier')
  .action(async (options: { flow: string }) => {
    const backend = createBackendFromEnv();
    const flow = await backend.flows.get(options.flow);
    console.log(JSON.stringify(flow, null, 2));
  });

program
  .command('load-options')
  .description('Load dynamic options for a piece property')
  .requiredOption('--piece <name>', 'Piece name')
  .requiredOption('--target <kind:name>', 'Target action or trigger, e.g. action:send_message')
  .requiredOption('--property <property>', 'Property name')
  .requiredOption('--flow <id>', 'Flow ID')
  .requiredOption('--version <versionId>', 'Flow version ID')
  .option('--search <value>', 'Search text to filter options')
  .action(
    async (
      options: {
        piece: string;
        target: string;
        property: string;
        flow: string;
        version: string;
        search?: string;
      },
    ) => {
      const backend = createBackendFromEnv();
      const [targetType, targetName] = options.target.split(':');
      if (!targetType || !targetName) {
        throw new Error('Target must be in the format <kind>:<name>');
      }
      const result = await backend.pieces.loadOptions(
        {
          pieceName: options.piece,
          pieceVersion: await resolvePieceVersion(backend, options.piece),
          actionOrTriggerName: targetName,
          propertyName: options.property,
          flowId: options.flow,
          flowVersionId: options.version,
          input: {},
          searchValue: options.search,
        },
        PropertyType.DROPDOWN,
      );
      console.log(JSON.stringify(result, null, 2));
    },
  );

program
  .command('add-code-step')
  .description('Append a code step to an existing plan file')
  .requiredOption('-p, --plan <file>', 'Plan file to modify')
  .requiredOption('-n, --name <name>', 'Step display name')
  .requiredOption('-c, --code <file>', 'Path to TypeScript/JavaScript file to embed')
  .option('-a, --after <stepName>', 'Insert after the specified step name')
  .option('--inputs <json>', 'JSON string of input bindings for the code step')
  .action(
    async (
      options: {
        plan: string;
        name: string;
        code: string;
        after?: string;
        inputs?: string;
      },
    ) => {
      const plan = await loadPlanFile(options.plan);
      const codePath = path.resolve(options.code);
      const source = await readFile(codePath, 'utf8');
      const inputs = options.inputs ? JSON.parse(options.inputs) : undefined;
      const codeStep = {
        kind: 'code' as const,
        name: options.name,
        language: 'ts' as const,
        sourceCode: source,
        inputs,
      } satisfies FlowPlan['steps'][number];
      if (options.after) {
        const index = plan.steps.findIndex((step) => step.name === options.after);
        if (index >= 0) {
          plan.steps.splice(index + 1, 0, codeStep);
        } else {
          plan.steps.push(codeStep);
        }
      } else {
        plan.steps.push(codeStep);
      }
      await savePlanFile(options.plan, plan);
    },
  );

program
  .addHelpCommand(true)
  .showHelpAfterError(true);

async function resolvePieceVersion(backend: IFlowBackend, piece: string) {
  const metadata = await backend.pieces.get(piece);
  return metadata.version;
}

program.parseAsync(process.argv).catch(handleCliError);
