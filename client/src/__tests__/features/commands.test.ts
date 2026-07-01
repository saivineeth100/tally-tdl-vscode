import { describe, it, expect, vi } from 'vitest';
import { registerCommands } from '../../features/commands';
import * as vscode from 'vscode';

vi.mock('vscode', () => {
    return {
        commands: {
            registerCommand: vi.fn((name, cb) => {
                return { dispose: vi.fn() };
            })
        },
        window: {
            showErrorMessage: vi.fn()
        },
        workspace: {
            getConfiguration: vi.fn()
        }
    };
});

describe('commands', () => {
    it('registers expected commands', () => {
        const mockContext = {
            subscriptions: []
        };
        const mockOutputChannel = {} as any;
        const mockGetDefaultClient = vi.fn();
        const mockGetClients = vi.fn();
        const mockGetOuterMostWorkspaceFolder = vi.fn();
        const mockRestartServers = vi.fn();

        registerCommands(
            mockContext as any,
            mockOutputChannel,
            mockGetDefaultClient,
            mockGetClients,
            mockGetOuterMostWorkspaceFolder,
            mockRestartServers
        );

        // Verify that commands.registerCommand was called multiple times
        expect(vscode.commands.registerCommand).toHaveBeenCalled();
        
        // Find which commands were registered
        const registeredCommands = vi.mocked(vscode.commands.registerCommand).mock.calls.map(call => call[0]);
        
        expect(registeredCommands).toContain('tally-tdl.runCurrentFile');
        expect(registeredCommands).toContain('tally-tdl.restartServer');
        expect(registeredCommands).toContain('tally-tdl.setupTallyPath');
    });
});
