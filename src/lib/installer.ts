import { existsSync, mkdirSync, readdirSync, statSync, copyFileSync, readFileSync, writeFileSync, chmodSync } from 'node:fs';
import { join, relative, extname, basename } from 'node:path';
import { detectStack } from './stack-detector.js';
import type { StackConfig } from './stack-detector.js';

export interface InstallOptions {
  targetDir: string;
  configSourceDir: string;
  force?: boolean;
}

export interface InstallResult {
  filesInstalled: number;
  configPath: string;
  stackConfig: StackConfig;
  settingsInstalled: boolean;
}

function copyRecursive(src: string, dest: string, baseDir: string): number {
  let count = 0;
  const stats = statSync(src);

  if (stats.isDirectory()) {
    if (!existsSync(dest)) {
      mkdirSync(dest, { recursive: true });
    }
    for (const file of readdirSync(src)) {
      // Skip settings-template.json — handled separately
      if (file === 'settings-template.json') continue;
      count += copyRecursive(join(src, file), join(dest, file), baseDir);
    }
  } else {
    copyFileSync(src, dest);
    // Preserve executable permission for shell scripts
    if (extname(src) === '.sh') {
      chmodSync(dest, 0o755);
    }
    const rel = relative(baseDir, dest);
    console.log(`  + ${rel}`);
    count++;
  }
  return count;
}

function installSettings(configSourceDir: string, claudeDir: string): boolean {
  const templatePath = join(configSourceDir, 'settings-template.json');
  const settingsPath = join(claudeDir, 'settings.json');

  if (!existsSync(templatePath)) {
    return false;
  }

  if (existsSync(settingsPath)) {
    // Do not overwrite existing settings.json — user may have customized it
    console.log(`  ~ settings.json (skipped, already exists)`);
    return false;
  }

  const template = readFileSync(templatePath, 'utf-8');
  writeFileSync(settingsPath, template);
  console.log(`  + settings.json (from template)`);
  return true;
}

export function install(options: InstallOptions): InstallResult {
  const { targetDir, configSourceDir, force } = options;
  const claudeDir = join(targetDir, '.claude');
  const keybladeDir = join(targetDir, '.keyblade');

  if (existsSync(claudeDir) && !force) {
    throw new Error('.claude/ already exists. Use --force to overwrite.');
  }

  mkdirSync(claudeDir, { recursive: true });
  mkdirSync(keybladeDir, { recursive: true });

  const stack = detectStack(targetDir);

  const configPath = join(keybladeDir, 'config.json');
  writeFileSync(configPath, JSON.stringify(stack, null, 2) + '\n');
  console.log(`  + .keyblade/config.json`);

  const filesInstalled = copyRecursive(configSourceDir, claudeDir, claudeDir);
  const settingsInstalled = installSettings(configSourceDir, claudeDir);

  return {
    filesInstalled: filesInstalled + 1 + (settingsInstalled ? 1 : 0),
    configPath,
    stackConfig: stack,
    settingsInstalled,
  };
}
