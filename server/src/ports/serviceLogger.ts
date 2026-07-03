/**
 * Provides logging capabilities for the language server.
 * Production routes through the LSP console adapter. Tests collect entries and remain quiet unless an assertion fails.
 */
export interface ServiceLogger {
    error(message: string, ...args: any[]): void;
    warn(message: string, ...args: any[]): void;
    info(message: string, ...args: any[]): void;
    debug(message: string, ...args: any[]): void;
    trace(message: string, ...args: any[]): void;
}
