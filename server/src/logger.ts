import { Connection } from 'vscode-languageserver';
import { ServiceLogger } from './ports/serviceLogger';

export enum LogLevel {
    Error = 0,
    Warn = 1,
    Info = 2,
    Debug = 3,
    Trace = 4
}

export const isDebug = process.execArgv.some(arg => arg.startsWith('--inspect'));

export class Logger implements ServiceLogger {
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

    error(message: string, ...args: any[]) {
        if (this.level >= LogLevel.Error) {
            const msg = args.length ? `${message} ${args.join(' ')}` : message;
            this.connection ? this.connection.console.error(msg) : console.error(msg);
        }
    }

    warn(message: string, ...args: any[]) {
        if (this.level >= LogLevel.Warn) {
            const msg = args.length ? `${message} ${args.join(' ')}` : message;
            this.connection ? this.connection.console.warn(msg) : console.warn(msg);
        }
    }

    info(message: string, ...args: any[]) {
        if (this.level >= LogLevel.Info) {
            const msg = args.length ? `${message} ${args.join(' ')}` : message;
            this.connection ? this.connection.console.info(msg) : console.info(msg);
        }
    }

    debug(message: string, ...args: any[]) {
        if (this.level >= LogLevel.Debug) {
            const msg = args.length ? `${message} ${args.join(' ')}` : message;
            this.connection ? this.connection.console.debug(msg) : console.log(msg);
        }
    }

    trace(message: string, ...args: any[]) {
        if (this.level >= LogLevel.Trace) {
            const msg = args.length ? `${message} ${args.join(' ')}` : message;
            this.connection ? this.connection.console.log(msg) : console.log(msg);
        }
    }
}

export const logger = new Logger();
