import * as path from 'path';
import * as v8 from 'v8';
import * as fs from 'fs';
import * as os from 'os';
import { TdlMetadata } from './tdlMetaData';

export default async function setup() {
    console.log('Global Setup: Loading and parsing TDL metadata (this happens once)...');
    const metadataPath = path.join(__dirname, '..', 'data');
    const md = new TdlMetadata(metadataPath, "7.0");
    await md.load();
    const buffer = v8.serialize(md);
    
    const cachePath = path.join(os.tmpdir(), 'tdl-metadata-cache.bin');
    fs.writeFileSync(cachePath, buffer);
    console.log(`Global Setup: Metadata serialized and cached to ${cachePath}`);
}
