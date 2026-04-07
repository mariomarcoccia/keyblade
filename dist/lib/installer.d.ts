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
export declare function install(options: InstallOptions): InstallResult;
//# sourceMappingURL=installer.d.ts.map