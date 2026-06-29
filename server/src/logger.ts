import { Connection } from 'vscode-languageserver';

export enum LogLevel {
    Error = 0,
    Warn = 1,
    Info = 2,
    Debug = 3,
    Trace = 4
}

export const isDebug = process.execArgv.some(arg => arg.startsWith('--inspect'));

export class Logger {
    private connection?: Connection;
    public level: LogLevel;

    constructor() {
        // Default to Info in production, Trace in debug mode
        this.level = isDebug ? LogLevel.Trace : LogLevel.Info;
    }

    setConnection(conn: Connection) {
        this.connection = conn;
    }

    setLevel(level: LogLevel) {
        this.level = level;
    }

    error(message: string) {
        if (this.level >= LogLevel.Error) {
            this.connection ? this.connection.console.error(message) : console.error(message);
        }
    }

    warn(message: string) {
        if (this.level >= LogLevel.Warn) {
            this.connection ? this.connection.console.warn(message) : console.warn(message);
        }
    }

    info(message: string) {
        if (this.level >= LogLevel.Info) {
            this.connection ? this.connection.console.info(message) : console.info(message);
        }
    }

    debug(message: string) {
        if (this.level >= LogLevel.Debug) {
            this.connection ? this.connection.console.log(message) : console.log(message);
        }
    }

    trace(message: string) {
        if (this.level >= LogLevel.Trace) {
            this.connection ? this.connection.console.log(message) : console.log(message);
        }
    }
}

export const logger = new Logger();
