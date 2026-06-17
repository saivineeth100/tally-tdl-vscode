export interface TallyTDLSettings {
    diagnostics?: {
        enable?: boolean;
        treatWarningsAsErrors?: boolean;
        hideWarnings?: boolean;
        severity?: Record<string, string>;
    };
    [key: string]: any;
}

let globalSettings: TallyTDLSettings = {};

export function updateSettings(newSettings: TallyTDLSettings) {
    globalSettings = newSettings;
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
