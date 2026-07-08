import { Diagnostic, DiagnosticSeverity } from 'vscode-languageserver';
import { FormattingRules, mergeFormattingRules } from '../features/formatting/formattingRules';

export interface TallyTDLSettings {
    diagnostics?: {
        enable?: boolean;
        treatWarningsAsErrors?: boolean;
        hideWarnings?: boolean;
        severity?: Record<string, string>;
    };
    targetVersion?: string;
    formatting?: Partial<FormattingRules>;
    [key: string]: any;
}

import { logger, LogLevel, isDebug } from '../logger';

let globalSettings: TallyTDLSettings = {};

export function updateSettings(newSettings: TallyTDLSettings) {
    globalSettings = newSettings;
    
    // Update logger level
    if (globalSettings.logLevel) {
        if (isDebug && globalSettings.logLevel.toLowerCase() === 'info') {
            logger.setLevel(LogLevel.Trace);
        } else {
            switch (globalSettings.logLevel.toLowerCase()) {
                case 'error': logger.setLevel(LogLevel.Error); break;
                case 'warn': logger.setLevel(LogLevel.Warn); break;
                case 'info': logger.setLevel(LogLevel.Info); break;
                case 'debug': logger.setLevel(LogLevel.Debug); break;
                case 'trace': logger.setLevel(LogLevel.Trace); break;
            }
        }
    }
}

export function getSettings(): TallyTDLSettings {
    return globalSettings;
}

export function getFormattingRules(): FormattingRules {
    return mergeFormattingRules(globalSettings.formatting ?? {});
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

export function filterDiagnostics(diagnostics: Diagnostic[]): Diagnostic[] {
    const treatAsError = shouldTreatWarningsAsErrors();
    const hideWarnings = shouldHideWarnings();

    return isDiagnosticsEnabled() ? diagnostics.filter(d => {
        if (d.code && typeof d.code === 'string') {
            const setting = getDiagnosticSeverity(d.code);
            if (setting === 'none') return false;
            if (setting === 'error') d.severity = DiagnosticSeverity.Error;
            if (setting === 'warning') d.severity = DiagnosticSeverity.Warning;
            if (setting === 'information') d.severity = DiagnosticSeverity.Information;
            if (setting === 'hint') d.severity = DiagnosticSeverity.Hint;
        }

        if (d.severity === DiagnosticSeverity.Warning) {
            if (treatAsError) {
                d.severity = DiagnosticSeverity.Error;
            } else if (hideWarnings) {
                return false;
            }
        }
        return true;
    }) : [];
}
