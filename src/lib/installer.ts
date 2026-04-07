import { existsSync, mkdirSync, readdirSync, statSync, copyFileSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';
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
}

function copyRecursive(src: string, dest: string, baseDir: string): number {
  let count = 0;
  const stats = statSync(src);

  if (stats.isDirectory()) {
    if (!existsSync(dest)) {
      mkdirSync(dest, { recursive: true });
    }
    for (const file of readdirSync(src)) {
      count += copyRecursive(join(src, file), join(dest, file), baseDir);
    }
  } else {
    copyFileSync(src, dest);
    const rel = relative(baseDir, dest);
    console.log(`  + ${rel}`);
    count++;
  }
  return count;
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

  return {
    filesInstalled: filesInstalled + 1,
    configPath,
    stackConfig: stack,
  };
}
