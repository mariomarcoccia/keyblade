import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import {
  detectLanguage,
  detectFramework,
  detectPackageManager,
  detectTestRunner,
  detectStack,
} from '../lib/stack-detector.js';

function createTempDir(): string {
  return mkdtempSync(join(tmpdir(), 'keyblade-test-'));
}

function writeJson(dir: string, name: string, data: unknown): void {
  writeFileSync(join(dir, name), JSON.stringify(data));
}

function writeFile(dir: string, name: string, content: string = ''): void {
  writeFileSync(join(dir, name), content);
}

describe('detectLanguage', () => {
  let dir: string;

  beforeEach(() => { dir = createTempDir(); });
  afterEach(() => { rmSync(dir, { recursive: true }); });

  it('detects typescript from tsconfig.json', () => {
    writeFile(dir, 'tsconfig.json');
    expect(detectLanguage(dir)).toBe('typescript');
  });

  it('detects javascript from package.json', () => {
    writeJson(dir, 'package.json', { name: 'test' });
    expect(detectLanguage(dir)).toBe('javascript');
  });

  it('detects python from requirements.txt', () => {
    writeFile(dir, 'requirements.txt');
    expect(detectLanguage(dir)).toBe('python');
  });

  it('detects python from pyproject.toml', () => {
    writeFile(dir, 'pyproject.toml');
    expect(detectLanguage(dir)).toBe('python');
  });

  it('detects go from go.mod', () => {
    writeFile(dir, 'go.mod');
    expect(detectLanguage(dir)).toBe('go');
  });

  it('detects rust from Cargo.toml', () => {
    writeFile(dir, 'Cargo.toml');
    expect(detectLanguage(dir)).toBe('rust');
  });

  it('returns unknown for empty dir', () => {
    expect(detectLanguage(dir)).toBe('unknown');
  });

  it('prefers typescript over javascript', () => {
    writeFile(dir, 'tsconfig.json');
    writeJson(dir, 'package.json', { name: 'test' });
    expect(detectLanguage(dir)).toBe('typescript');
  });
});

describe('detectFramework', () => {
  let dir: string;

  beforeEach(() => { dir = createTempDir(); });
  afterEach(() => { rmSync(dir, { recursive: true }); });

  it('detects nextjs', () => {
    writeJson(dir, 'package.json', { dependencies: { next: '14.0.0' } });
    expect(detectFramework(dir)).toBe('nextjs');
  });

  it('detects react', () => {
    writeJson(dir, 'package.json', { dependencies: { react: '18.0.0' } });
    expect(detectFramework(dir)).toBe('react');
  });

  it('detects express', () => {
    writeJson(dir, 'package.json', { dependencies: { express: '4.0.0' } });
    expect(detectFramework(dir)).toBe('express');
  });

  it('detects vue', () => {
    writeJson(dir, 'package.json', { dependencies: { vue: '3.0.0' } });
    expect(detectFramework(dir)).toBe('vue');
  });

  it('detects angular', () => {
    writeJson(dir, 'package.json', { dependencies: { '@angular/core': '17.0.0' } });
    expect(detectFramework(dir)).toBe('angular');
  });

  it('detects fastapi from requirements.txt', () => {
    writeFile(dir, 'requirements.txt', 'fastapi==0.100.0\nuvicorn');
    expect(detectFramework(dir)).toBe('fastapi');
  });

  it('detects django from requirements.txt', () => {
    writeFile(dir, 'requirements.txt', 'django==4.2.0');
    expect(detectFramework(dir)).toBe('django');
  });

  it('returns null for no framework', () => {
    writeJson(dir, 'package.json', { name: 'test' });
    expect(detectFramework(dir)).toBeNull();
  });

  it('returns null for empty dir', () => {
    expect(detectFramework(dir)).toBeNull();
  });
});

describe('detectPackageManager', () => {
  let dir: string;

  beforeEach(() => { dir = createTempDir(); });
  afterEach(() => { rmSync(dir, { recursive: true }); });

  it('detects npm from package-lock.json', () => {
    writeFile(dir, 'package-lock.json');
    expect(detectPackageManager(dir)).toBe('npm');
  });

  it('detects yarn from yarn.lock', () => {
    writeFile(dir, 'yarn.lock');
    expect(detectPackageManager(dir)).toBe('yarn');
  });

  it('detects pnpm from pnpm-lock.yaml', () => {
    writeFile(dir, 'pnpm-lock.yaml');
    expect(detectPackageManager(dir)).toBe('pnpm');
  });

  it('detects bun from bun.lockb', () => {
    writeFile(dir, 'bun.lockb');
    expect(detectPackageManager(dir)).toBe('bun');
  });

  it('detects pip from requirements.txt', () => {
    writeFile(dir, 'requirements.txt');
    expect(detectPackageManager(dir)).toBe('pip');
  });

  it('detects cargo from Cargo.toml', () => {
    writeFile(dir, 'Cargo.toml');
    expect(detectPackageManager(dir)).toBe('cargo');
  });

  it('detects go from go.mod', () => {
    writeFile(dir, 'go.mod');
    expect(detectPackageManager(dir)).toBe('go');
  });

  it('returns null for empty dir', () => {
    expect(detectPackageManager(dir)).toBeNull();
  });
});

describe('detectTestRunner', () => {
  let dir: string;

  beforeEach(() => { dir = createTempDir(); });
  afterEach(() => { rmSync(dir, { recursive: true }); });

  it('detects vitest', () => {
    writeJson(dir, 'package.json', { devDependencies: { vitest: '2.0.0' } });
    expect(detectTestRunner(dir)).toBe('vitest');
  });

  it('detects jest', () => {
    writeJson(dir, 'package.json', { devDependencies: { jest: '29.0.0' } });
    expect(detectTestRunner(dir)).toBe('jest');
  });

  it('detects pytest from conftest.py', () => {
    writeFile(dir, 'conftest.py');
    expect(detectTestRunner(dir)).toBe('pytest');
  });

  it('detects pytest from pytest.ini', () => {
    writeFile(dir, 'pytest.ini');
    expect(detectTestRunner(dir)).toBe('pytest');
  });

  it('returns null for empty dir', () => {
    expect(detectTestRunner(dir)).toBeNull();
  });
});

describe('detectStack', () => {
  let dir: string;

  beforeEach(() => { dir = createTempDir(); });
  afterEach(() => { rmSync(dir, { recursive: true }); });

  it('returns full stack config for typescript nextjs project', () => {
    writeFile(dir, 'tsconfig.json');
    writeJson(dir, 'package.json', {
      dependencies: { next: '14.0.0', react: '18.0.0' },
      devDependencies: { vitest: '2.0.0' },
    });
    writeFile(dir, 'package-lock.json');

    const stack = detectStack(dir);

    expect(stack.language).toBe('typescript');
    expect(stack.framework).toBe('nextjs');
    expect(stack.packageManager).toBe('npm');
    expect(stack.testRunner).toBe('vitest');
    expect(stack.detectedAt).toBeTruthy();
  });

  it('returns partial stack for minimal project', () => {
    const stack = detectStack(dir);

    expect(stack.language).toBe('unknown');
    expect(stack.framework).toBeNull();
    expect(stack.packageManager).toBeNull();
    expect(stack.testRunner).toBeNull();
  });
});
