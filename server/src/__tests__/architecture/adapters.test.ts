import { describe, it, expect, vi } from 'vitest';
import { NodeFileAccess } from '../../adapters/nodeFileAccess';
import { NodeScheduler } from '../../adapters/nodeScheduler';
import * as path from 'path';
import * as fs from 'fs';

describe('Production Adapters', () => {
    describe('NodeFileAccess', () => {
        const fileAccess = new NodeFileAccess();

        it('exists() returns true for existing files and false for non-existent ones', async () => {
            const currentFile = __filename;
            const missingFile = path.join(__dirname, 'does_not_exist.txt');

            expect(await fileAccess.exists(currentFile)).toBe(true);
            expect(await fileAccess.exists(missingFile)).toBe(false);
        });

        it('readFile() reads the file content correctly', async () => {
            const currentFile = __filename;
            const content = await fileAccess.readFile(currentFile, 'utf-8');
            expect(content).toContain('NodeFileAccess');
            expect(content).toContain('describe(');
        });

        it('stat() returns accurate file info', async () => {
            const currentFile = __filename;
            const stat = await fileAccess.stat(currentFile);
            
            expect(stat).toBeDefined();
            expect(stat!.isFile()).toBe(true);
            expect(stat!.isDirectory()).toBe(false);
            expect(stat!.size).toBeGreaterThan(0);
        });
    });

    describe('NodeScheduler', () => {
        it('schedules and clears timeouts correctly', async () => {
            const scheduler = new NodeScheduler();
            let triggered = false;
            
            // Should be cleared and never run
            const token = scheduler.setTimeout(() => { triggered = true; }, 10);
            scheduler.clearTimeout(token);
            
            // Wait a bit to ensure it didn't run
            await new Promise(resolve => setTimeout(resolve, 20));
            expect(triggered).toBe(false);
        });
    });
});
