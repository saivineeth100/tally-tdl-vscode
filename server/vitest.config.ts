
import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        globals: true,
        environment: 'node',
        setupFiles: ['./src/test-setup.ts'], // Load metadata once before all tests
        include: ['src/**/*.test.ts'],
    },
});
