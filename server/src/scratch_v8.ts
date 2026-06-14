import * as v8 from 'v8';
import * as path from 'path';
import { TdlMetadata } from './tdlMetaData';

async function test() {
    console.time('Load from scratch');
    const md = new TdlMetadata(path.resolve(__dirname, '../data'), '7.0');
    await md.load();
    console.timeEnd('Load from scratch');

    console.time('Serialize');
    const buffer = v8.serialize(md);
    console.timeEnd('Serialize');

    console.time('Deserialize');
    const md2 = v8.deserialize(buffer);
    Object.setPrototypeOf(md2, TdlMetadata.prototype);
    console.timeEnd('Deserialize');

    console.log('Original keys:', md.existingDefinitions.size);
    console.log('Deserialized keys:', md2.existingDefinitions.size);

    console.log('Original findFunction test:', !!md.findFunction('ExtractString'));
    console.log('findFunction test:', !!md2.findFunction('ExtractString'));
}

test().catch(console.error);
