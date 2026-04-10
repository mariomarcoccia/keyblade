import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, writeFileSync, existsSync, readFileSync, rmSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { install } from '../lib/installer.js';

function createTempDir(): string {
  return mkdtempSync(join(tmpdir(), 'keyblade-install-test-'));
}

function createMockConfig(dir: string): string {
  const configDir = join(dir, 'mock-config');
  mkdirSync(join(configDir, 'skills'), { recursive: true });
  mkdirSync(join(configDir, 'agents'), { recursive: true });
  mkdirSync(join(configDir, 'hooks'), { recursive: true });
  writeFileSync(join(configDir, 'CLAUDE.md'), '# Test');
  writeFileSync(join(configDir, 'ARCHITECTURE.md'), '# Architecture');
  writeFileSync(join(configDir, 'skills', 'build.md'), '# Build');
  writeFileSync(join(configDir, 'agents', 'code-reviewer.md'), '# Reviewer');
  writeFileSync(join(configDir, 'hooks', 'stop-guard.sh'), '#!/bin/bash\nexit 0');
  writeFileSync(
    join(configDir, 'settings-template.json'),
    JSON.stringify({ hooks: { Stop: [] } }),
  );
  return configDir;
}

describe('install', () => {
  let targetDir: string;
  let configDir: string;

  beforeEach(() => {
    targetDir = createTempDir();
    configDir = createMockConfig(createTempDir());
    writeFileSync(join(targetDir, 'tsconfig.json'), '{}');
    writeFileSync(
      join(targetDir, 'package.json'),
      JSON.stringify({
        dependencies: { next: '14.0.0' },
        devDependencies: { vitest: '2.0.0' },
      }),
    );
    writeFileSync(join(targetDir, 'package-lock.json'), '{}');
  });

  afterEach(() => {
    rmSync(targetDir, { recursive: true });
  });

  it('creates .claude directory with config files', () => {
    const result = install({ targetDir, configSourceDir: configDir });

    expect(existsSync(join(targetDir, '.claude'))).toBe(true);
    expect(existsSync(join(targetDir, '.claude', 'CLAUDE.md'))).toBe(true);
    expect(existsSync(join(targetDir, '.claude', 'ARCHITECTURE.md'))).toBe(true);
    expect(existsSync(join(targetDir, '.claude', 'skills', 'build.md'))).toBe(true);
    expect(existsSync(join(targetDir, '.claude', 'agents', 'code-reviewer.md'))).toBe(true);
    expect(existsSync(join(targetDir, '.claude', 'hooks', 'stop-guard.sh'))).toBe(true);
    expect(result.filesInstalled).toBeGreaterThan(0);
  });

  it('creates .keyblade/config.json with stack detection', () => {
    const result = install({ targetDir, configSourceDir: configDir });

    expect(existsSync(result.configPath)).toBe(true);
    const config = JSON.parse(readFileSync(result.configPath, 'utf-8'));
    expect(config.language).toBe('typescript');
    expect(config.framework).toBe('nextjs');
    expect(config.packageManager).toBe('npm');
    expect(config.testRunner).toBe('vitest');
    expect(config.detectedAt).toBeTruthy();
  });

  it('returns correct stack config', () => {
    const result = install({ targetDir, configSourceDir: configDir });

    expect(result.stackConfig.language).toBe('typescript');
    expect(result.stackConfig.framework).toBe('nextjs');
  });

  it('throws when .claude exists without force', () => {
    mkdirSync(join(targetDir, '.claude'), { recursive: true });

    expect(() => {
      install({ targetDir, configSourceDir: configDir });
    }).toThrow('.claude/ already exists');
  });

  it('overwrites when force is true', () => {
    mkdirSync(join(targetDir, '.claude'), { recursive: true });

    const result = install({ targetDir, configSourceDir: configDir, force: true });
    expect(result.filesInstalled).toBeGreaterThan(0);
  });

  it('installs settings.json from template', () => {
    const result = install({ targetDir, configSourceDir: configDir });

    const settingsPath = join(targetDir, '.claude', 'settings.json');
    expect(existsSync(settingsPath)).toBe(true);
    expect(result.settingsInstalled).toBe(true);

    const settings = JSON.parse(readFileSync(settingsPath, 'utf-8'));
    expect(settings.hooks).toBeDefined();
  });

  it('does not overwrite existing settings.json', () => {
    mkdirSync(join(targetDir, '.claude'), { recursive: true });
    const settingsPath = join(targetDir, '.claude', 'settings.json');
    writeFileSync(settingsPath, '{"custom": true}');

    const result = install({ targetDir, configSourceDir: configDir, force: true });

    const settings = JSON.parse(readFileSync(settingsPath, 'utf-8'));
    expect(settings.custom).toBe(true);
    expect(result.settingsInstalled).toBe(false);
  });

  it('does not copy settings-template.json as a regular file', () => {
    install({ targetDir, configSourceDir: configDir });

    expect(existsSync(join(targetDir, '.claude', 'settings-template.json'))).toBe(false);
  });
});
