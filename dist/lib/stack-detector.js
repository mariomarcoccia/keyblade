import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { z } from 'zod';
export const StackConfigSchema = z.object({
    language: z.string(),
    framework: z.string().nullable(),
    packageManager: z.string().nullable(),
    testRunner: z.string().nullable(),
    detectedAt: z.string(),
});
function fileExists(dir, name) {
    return existsSync(join(dir, name));
}
function readJsonSafe(filepath) {
    try {
        const content = readFileSync(filepath, 'utf-8');
        return JSON.parse(content);
    }
    catch {
        return null;
    }
}
export function detectLanguage(dir) {
    if (fileExists(dir, 'tsconfig.json'))
        return 'typescript';
    if (fileExists(dir, 'package.json'))
        return 'javascript';
    if (fileExists(dir, 'requirements.txt') || fileExists(dir, 'pyproject.toml'))
        return 'python';
    if (fileExists(dir, 'go.mod'))
        return 'go';
    if (fileExists(dir, 'Cargo.toml'))
        return 'rust';
    return 'unknown';
}
export function detectFramework(dir) {
    const pkg = readJsonSafe(join(dir, 'package.json'));
    if (pkg) {
        const deps = {
            ...pkg.dependencies,
            ...pkg.devDependencies,
        };
        if (deps['next'])
            return 'nextjs';
        if (deps['nuxt'])
            return 'nuxt';
        if (deps['@angular/core'])
            return 'angular';
        if (deps['svelte'] || deps['@sveltejs/kit'])
            return 'svelte';
        if (deps['vue'])
            return 'vue';
        if (deps['react'])
            return 'react';
        if (deps['express'])
            return 'express';
        if (deps['fastify'])
            return 'fastify';
        if (deps['hono'])
            return 'hono';
        if (deps['koa'])
            return 'koa';
    }
    const pyproject = readJsonSafe(join(dir, 'pyproject.toml'));
    if (fileExists(dir, 'requirements.txt')) {
        const reqs = readFileSync(join(dir, 'requirements.txt'), 'utf-8');
        if (reqs.includes('fastapi'))
            return 'fastapi';
        if (reqs.includes('django'))
            return 'django';
        if (reqs.includes('flask'))
            return 'flask';
    }
    if (pyproject) {
        const content = readFileSync(join(dir, 'pyproject.toml'), 'utf-8');
        if (content.includes('fastapi'))
            return 'fastapi';
        if (content.includes('django'))
            return 'django';
        if (content.includes('flask'))
            return 'flask';
    }
    return null;
}
export function detectPackageManager(dir) {
    if (fileExists(dir, 'bun.lockb') || fileExists(dir, 'bun.lock'))
        return 'bun';
    if (fileExists(dir, 'pnpm-lock.yaml'))
        return 'pnpm';
    if (fileExists(dir, 'yarn.lock'))
        return 'yarn';
    if (fileExists(dir, 'package-lock.json'))
        return 'npm';
    if (fileExists(dir, 'requirements.txt') || fileExists(dir, 'pyproject.toml'))
        return 'pip';
    if (fileExists(dir, 'go.mod'))
        return 'go';
    if (fileExists(dir, 'Cargo.toml'))
        return 'cargo';
    return null;
}
export function detectTestRunner(dir) {
    const pkg = readJsonSafe(join(dir, 'package.json'));
    if (pkg) {
        const deps = {
            ...pkg.dependencies,
            ...pkg.devDependencies,
        };
        if (deps['vitest'])
            return 'vitest';
        if (deps['jest'])
            return 'jest';
        if (deps['mocha'])
            return 'mocha';
        if (deps['ava'])
            return 'ava';
    }
    if (fileExists(dir, 'pytest.ini') || fileExists(dir, 'conftest.py'))
        return 'pytest';
    if (fileExists(dir, 'pyproject.toml')) {
        const content = readFileSync(join(dir, 'pyproject.toml'), 'utf-8');
        if (content.includes('pytest'))
            return 'pytest';
    }
    return null;
}
export function detectStack(dir) {
    return {
        language: detectLanguage(dir),
        framework: detectFramework(dir),
        packageManager: detectPackageManager(dir),
        testRunner: detectTestRunner(dir),
        detectedAt: new Date().toISOString(),
    };
}
//# sourceMappingURL=stack-detector.js.map