import { TdlMetadata } from "../tdlMetaData";

let _metadata: TdlMetadata | undefined;

export function setMetadata(m: TdlMetadata): void {
    _metadata = m;
}

export function getMetadata(): TdlMetadata | undefined {
    return _metadata;
}

export function requireMetadata(): TdlMetadata {
    if (!_metadata) {
        throw new Error('Metadata not loaded');
    }
    return _metadata;
}
