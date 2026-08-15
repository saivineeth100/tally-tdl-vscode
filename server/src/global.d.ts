// Polyfill for Symbol.dispose and Symbol.asyncDispose
// Required for 'using' keyword support in environments that don't have these symbols globally defined.

declare global {
    interface SymbolConstructor {
        readonly dispose: unique symbol;
        readonly asyncDispose: unique symbol;
    }
}

interface Disposable {
    [Symbol.dispose](): void;
}

interface AsyncDisposable {
    [Symbol.asyncDispose](): PromiseLike<void>;
}

export { };
