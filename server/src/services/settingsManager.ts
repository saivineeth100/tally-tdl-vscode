export interface TallyTDLSettings {
    diagnostics?: {
        enable?: boolean;
        treatWarningsAsErrors?: boolean;
        hideWarnings?: boolean;
        severity?: Record<string, string>;
    };
    targetVersion?: string;
    [key: string]: any;
}

import { logger, LogLevel } from '../logger';

let globalSettings: TallyTDLSettings = {};

export function updateSettings(newSettings: TallyTDLSettings) {
    globalSettings = newSettings;
    
    // Update logger level
    if (globalSettings.logLevel) {
        switch (globalSettings.logLevel.toLowerCase()) {
            case 'error': logger.setLevel(LogLevel.Error); break;
            case 'warn': logger.setLevel(LogLevel.Warn); break;
            case 'info': logger.setLevel(LogLevel.Info); break;
            case 'debug': logger.setLevel(LogLevel.Debug); break;
            case 'trace': logger.setLevel(LogLevel.Trace); break;
        }
    }
}

export function getSettings(): TallyTDLSettings {
    return globalSettings;
}

export function isDiagnosticsEnabled(): boolean {
    return globalSettings?.diagnostics?.enable !== false;
}

export function shouldTreatWarningsAsErrors(): boolean {
    return globalSettings?.diagnostics?.treatWarningsAsErrors === true;
}

export function shouldHideWarnings(): boolean {
    return globalSettings?.diagnostics?.hideWarnings === true;
}

export function getDiagnosticSeverity(code: string): string | undefined {
    return globalSettings?.diagnostics?.severity?.[code];
}
