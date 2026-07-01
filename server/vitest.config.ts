
import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
    resolve: {
        alias: {
            'tally-tdl-shared': path.resolve(__dirname, '../shared/out/index.js')
        }
    },
    test: {
        globals: true,
        environment: 'node',
        setupFiles: ['./src/__tests__/test-setup.ts'],
        include: ['src/**/__tests__/**/*.test.ts', 'src/**/*.test.ts'],
        exclude: ['out/**', 'node_modules/**', 'dist/**'],
        coverage: {
            provider: 'v8',
            reporter: ['text', 'lcov'],
            include: ['src/**/*.ts'],
            exclude: ['src/**/*.test.ts', 'src/test-setup.ts']
        }
    },
});
