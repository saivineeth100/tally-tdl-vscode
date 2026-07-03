/**
 * Controls debounce and deferred work. 
 * Production uses Node timers. Tests use a deterministic scheduler and explicitly flush queued work.
 */
export interface Scheduler {
    setTimeout(callback: () => void, ms: number): unknown;
    clearTimeout(token: unknown): void;
}
