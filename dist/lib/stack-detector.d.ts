import { z } from 'zod';
export declare const StackConfigSchema: z.ZodObject<{
    language: z.ZodString;
    framework: z.ZodNullable<z.ZodString>;
    packageManager: z.ZodNullable<z.ZodString>;
    testRunner: z.ZodNullable<z.ZodString>;
    detectedAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    language: string;
    framework: string | null;
    packageManager: string | null;
    testRunner: string | null;
    detectedAt: string;
}, {
    language: string;
    framework: string | null;
    packageManager: string | null;
    testRunner: string | null;
    detectedAt: string;
}>;
export type StackConfig = z.infer<typeof StackConfigSchema>;
export declare function detectLanguage(dir: string): string;
export declare function detectFramework(dir: string): string | null;
export declare function detectPackageManager(dir: string): string | null;
export declare function detectTestRunner(dir: string): string | null;
export declare function detectStack(dir: string): StackConfig;
//# sourceMappingURL=stack-detector.d.ts.map