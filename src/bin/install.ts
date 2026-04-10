#!/usr/bin/env node

import { existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createInterface } from 'node:readline';
import { install } from '../lib/installer.js';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

const args = process.argv.slice(2);
const showHelp = args.includes('--help') || args.includes('-h');
const force = args.includes('--force');

if (showHelp) {
  console.log(`
Usage: npx keyblade [options]

Options:
  --force     Overwrite existing .claude/ directory
  --help, -h  Show this help message

Installs Claude Code configuration to ./.claude/ and detects your stack.
`);
  process.exit(0);
}

function question(prompt: string): Promise<string> {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question(prompt, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

async function main(): Promise<void> {
  const targetDir = process.cwd();
  const configSourceDir = resolve(__dirname, '..', '..', 'config');

  console.log('\nkeyblade - Claude Code Setup\n');
  console.log('This will install to ./.claude/:');
  console.log('  - CLAUDE.md + ARCHITECTURE.md (rules and system docs)');
  console.log('  - skills/ (build, resolve, gate, deliberate)');
  console.log('  - agents/ (13 specialized subagents)');
  console.log('  - hooks/ (6 executable shell scripts)');
  console.log('  - commands/ (gate)');
  console.log('  - settings.json (hook configuration)');
  console.log('\nAlso generates .keyblade/config.json with stack detection.\n');

  const claudeDir = join(targetDir, '.claude');
  if (existsSync(claudeDir) && !force) {
    const answer = await question('.claude/ already exists. Overwrite? (y/N): ');
    if (answer.toLowerCase() !== 'y') {
      console.log('\nAborted. No changes made.');
      process.exit(0);
    }
  }

  const result = install({ targetDir, configSourceDir, force: true });

  console.log(`\nInstallation complete! ${result.filesInstalled} files installed.\n`);
  console.log('Stack detected:');
  console.log(`  Language:        ${result.stackConfig.language}`);
  console.log(`  Framework:       ${result.stackConfig.framework ?? 'none'}`);
  console.log(`  Package Manager: ${result.stackConfig.packageManager ?? 'none'}`);
  console.log(`  Test Runner:     ${result.stackConfig.testRunner ?? 'none'}`);
  console.log(`\nConfig saved to: ${result.configPath}\n`);
  console.log('Next steps:');
  console.log('  1. Open your project with Claude Code');
  console.log('  2. Try /build to create a new feature');
  console.log('  3. Try /resolve to fix a bug');
  console.log('  4. Try /gate before creating a PR\n');
}

main().catch((err: Error) => {
  console.error('Error:', err.message);
  process.exit(1);
});
