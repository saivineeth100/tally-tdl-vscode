import { DiagnosticSeverity } from "vscode-languageserver-types";

export interface DiagnosticRule {
    code: string;
    defaultSeverity: DiagnosticSeverity;
    messageFormat: string;
    description: string;
}

export function formatDiagnosticMessage(rule: DiagnosticRule, ...args: any[]): string {
    let msg = rule.messageFormat;
    for (let i = 0; i < args.length; i++) {
        msg = msg.replace(`{${i}}`, String(args[i]));
    }
    return msg;
}

export function createDiagnostic(rule: DiagnosticRule, range: { start: any, end: any }, ...args: any[]) {
    if (!rule) {
        console.trace("createDiagnostic called with undefined rule!");
        throw new Error("Rule is undefined!");
    }
    return {
        severity: rule.defaultSeverity,
        range: range,
        message: formatDiagnosticMessage(rule, ...args),
        code: rule.code,
        source: 'tdl'
    };
}

export function createDiagnosticWithData<T>(
    rule: DiagnosticRule,
    range: { start: any, end: any },
    data: T,
    ...args: any[]
) {
    const diag = createDiagnostic(rule, range, ...args) as ReturnType<typeof createDiagnostic> & { data: T };
    diag.data = data;
    return diag;
}
