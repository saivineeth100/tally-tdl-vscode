import { describe, it, expect, vi, beforeEach } from 'vitest';
import { checkTallyRunning, cleanupTempFiles } from '../../services/tallyClient';
import * as net from 'net';
import * as fs from 'fs';

vi.mock('net');
vi.mock('fs');
vi.mock('vscode', () => ({
    workspace: {
        getConfiguration: vi.fn().mockReturnValue({
            get: vi.fn().mockReturnValue(9000)
        })
    },
    window: {
        showErrorMessage: vi.fn(),
        showInformationMessage: vi.fn()
    }
}));

describe('tallyClient', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('checkTallyRunning', () => {
        it('returns true if connection is successful', async () => {
            const mockSocket = {
                setTimeout: vi.fn(),
                on: vi.fn((event, cb) => {
                    if (event === 'connect') {
                        cb();
                    }
                }),
                connect: vi.fn(),
                destroy: vi.fn()
            };
            vi.mocked(net.Socket).mockImplementation(function() { return mockSocket; } as any);

            const result = await checkTallyRunning(9000);
            expect(result).toBe(true);
            expect(mockSocket.destroy).toHaveBeenCalled();
        });

        it('returns false on timeout', async () => {
            const mockSocket = {
                setTimeout: vi.fn(),
                on: vi.fn((event, cb) => {
                    if (event === 'timeout') {
                        cb();
                    }
                }),
                connect: vi.fn(),
                destroy: vi.fn()
            };
            vi.mocked(net.Socket).mockImplementation(function() { return mockSocket; } as any);

            const result = await checkTallyRunning(9000);
            expect(result).toBe(false);
        });
    });

    describe('cleanupTempFiles', () => {
        it('removes all files in the responses directory and removes the directory', async () => {
            const mockFiles = ['file1.xml', 'file2.xml'];
            vi.mocked(fs.readdirSync).mockReturnValue(mockFiles as any);
            vi.mocked(fs.existsSync).mockReturnValue(true);
            
            vi.mocked(fs.unlinkSync).mockImplementation(vi.fn());
            vi.mocked(fs.rmdirSync).mockImplementation(vi.fn());

            cleanupTempFiles();

            expect(fs.readdirSync).toHaveBeenCalled();
            expect(fs.unlinkSync).toHaveBeenCalledTimes(2);
            expect(fs.rmdirSync).toHaveBeenCalledTimes(1);
        });
    });
});
