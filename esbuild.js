const esbuild = require('esbuild');

const watch = process.argv.includes('--watch');

/**
 * @type {import('esbuild').Plugin}
 */
const esbuildProblemMatcherPlugin = {
    name: 'esbuild-problem-matcher',
    setup(build) {
        build.onStart(() => {
            console.log('\r\nStarting compilation in watch mode...');
        });
        build.onEnd((result) => {
            result.errors.forEach(({ text, location }) => {
                console.error(`✘ [ERROR] ${text}`);
                if (location) {
                    console.error(`    ${location.file}:${location.line}:${location.column}:`);
                }
            });
            console.log(`Found ${result.errors.length} errors. Watching for file changes.`);
        });
    },
};

async function main() {
    const ctxClient = await esbuild.context({
        entryPoints: ['client/src/extension.ts'],
        bundle: true,
        format: 'cjs',
        minify: process.env.NODE_ENV === 'production',
        sourcemap: true,
        sourcesContent: false,
        platform: 'node',
        outfile: 'dist/extension.js',
        external: ['vscode'],
        alias: {
            'tally-tdl-shared': './shared/src/index.ts'
        },
        logLevel: 'silent',
        plugins: [esbuildProblemMatcherPlugin],
    });

    const ctxServer = await esbuild.context({
        entryPoints: ['server/src/server.ts'],
        bundle: true,
        format: 'cjs',
        minify: process.env.NODE_ENV === 'production',
        sourcemap: true,
        sourcesContent: false,
        platform: 'node',
        outfile: 'dist/server.js',
        alias: {
            'tally-tdl-shared': './shared/src/index.ts'
        },
        logLevel: 'silent',
        plugins: [{
            name: 'esbuild-server-error-logger',
            setup(build) {
                build.onEnd((result) => {
                    result.errors.forEach(({ text, location }) => {
                        console.error(`✘ [SERVER ERROR] ${text}`);
                        if (location) {
                            console.error(`    ${location.file}:${location.line}:${location.column}:`);
                        }
                    });
                });
            }
        }],
    });

    // Copy .bin files to dist/data before starting watch/build so it doesn't confuse VS Code problem matchers
    const fs = require('fs');
    const path = require('path');
    const srcDir = 'server/data';
    const destDir = 'dist/data';
    if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
    if (fs.existsSync(srcDir)) {
        const files = fs.readdirSync(srcDir);
        for (const file of files) {
            if (file.endsWith('.bin')) {
                fs.copyFileSync(path.join(srcDir, file), path.join(destDir, file));
            }
        }
    }

    if (watch) {
        await ctxClient.watch();
        await ctxServer.watch();
    } else {
        await ctxClient.rebuild();
        await ctxServer.rebuild();
        await ctxClient.dispose();
        await ctxServer.dispose();
    }
}

main().catch(e => {
    console.error(e);
    process.exit(1);
});
