import { Scheduler } from '../ports/scheduler';

export class NodeScheduler implements Scheduler {
    setTimeout(callback: () => void, ms: number): unknown {
        return setTimeout(callback, ms);
    }

    clearTimeout(token: unknown): void {
        clearTimeout(token as NodeJS.Timeout);
    }
}
