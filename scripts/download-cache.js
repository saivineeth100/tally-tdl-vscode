/**
 * Script to download and extract metadata cache (.bin files) and samples.
 * Zero-dependency, cross-platform, utilizes Node.js native fetch and child processes.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const os = require('os');
const { Readable } = require('stream');
const { finished } = require('stream/promises');

// Configuration: supported versions
const VERSIONS = ['7.0'];

// Root workspace directories
const WORKSPACE_ROOT = path.join(__dirname, '..');
const SERVER_DATA_DIR = path.join(WORKSPACE_ROOT, 'server', 'data');
const SAMPLES_ROOT_DIR = path.join(WORKSPACE_ROOT, 'samples');
const TEMP_DIR = path.join(WORKSPACE_ROOT, '.tmp');

async function downloadFile(url, destPath) {
    console.log(`Downloading: ${url} -> ${destPath}`);
    let res = await fetch(url);
    if (!res.ok) {
        throw new Error(`Failed to download ${url}: HTTP status ${res.status} ${res.statusText}`);
    }

    const contentType = res.headers.get('content-type') || '';
    if (contentType.includes('text/html')) {
        const text = await res.text();
        const confirmMatch = text.match(/name="confirm"\s+value="([^"]+)"/);
        const uuidMatch = text.match(/name="uuid"\s+value="([^"]+)"/);

        if (confirmMatch && uuidMatch) {
            const confirm = confirmMatch[1];
            const uuid = uuidMatch[1];
            let confirmedUrl = res.url;
            if (confirmedUrl.includes('?')) {
                confirmedUrl += `&confirm=${confirm}&uuid=${uuid}`;
            } else {
                confirmedUrl += `?confirm=${confirm}&uuid=${uuid}`;
            }
            console.log(`Google Drive large file virus scan page detected. Retrying download with confirmation tokens...`);
            res = await fetch(confirmedUrl);
            if (!res.ok) {
                throw new Error(`Failed to download confirmed URL ${confirmedUrl}: HTTP status ${res.status} ${res.statusText}`);
            }
        } else {
            console.warn(`Response is HTML but Google Drive confirmation tokens were not found.`);
        }
    }

    const fileStream = fs.createWriteStream(destPath);
    await finished(Readable.fromWeb(res.body).pipe(fileStream));
}

/**
 * Extracts a zip archive to a destination directory, unwrapping a single parent folder if present.
 */
function extractZip(zipPath, destDir) {
    const tempExtractDir = path.join(TEMP_DIR, `extract_${path.basename(destDir)}_${Date.now()}`);
    fs.mkdirSync(tempExtractDir, { recursive: true });

    console.log(`Extracting: ${zipPath} -> ${tempExtractDir}`);
    try {
        if (os.platform() === 'win32') {
            try {
                console.log(`Extracting with native tar.exe (fast)...`);
                execSync(`tar -xf "${zipPath}" -C "${tempExtractDir}"`, { stdio: 'inherit' });
            } catch (tarErr) {
                console.warn(`tar.exe failed or not found, falling back to PowerShell Expand-Archive (slow): ${tarErr.message}`);
                execSync(`powershell -Command "Expand-Archive -Path '${zipPath}' -DestinationPath '${tempExtractDir}' -Force"`, { stdio: 'inherit' });
            }
        } else {
            try {
                execSync(`unzip -o "${zipPath}" -d "${tempExtractDir}"`, { stdio: 'inherit' });
            } catch (err) {
                console.log(`unzip command failed or not found, trying tar: ${err.message}`);
                execSync(`tar -xf "${zipPath}" -C "${tempExtractDir}"`, { stdio: 'inherit' });
            }
        }
    } catch (error) {
        fs.rmSync(tempExtractDir, { recursive: true, force: true });
        throw new Error(`Extraction failed for ${zipPath}: ${error.message}`);
    }

    // Determine target location to move extracted files
    let sourceDir = tempExtractDir;
    const entries = fs.readdirSync(tempExtractDir);
    // Unwrap a single parent directory (e.g. "Samples/" or "7.0/") if it contains everything
    if (entries.length === 1 && fs.statSync(path.join(tempExtractDir, entries[0])).isDirectory()) {
        sourceDir = path.join(tempExtractDir, entries[0]);
    }

    fs.mkdirSync(destDir, { recursive: true });
    const items = fs.readdirSync(sourceDir);
    for (const item of items) {
        const srcItem = path.join(sourceDir, item);
        const destItem = path.join(destDir, item);
        if (fs.existsSync(destItem)) {
            fs.rmSync(destItem, { recursive: true, force: true });
        }
        fs.renameSync(srcItem, destItem);
    }

    // Clean up temporary extraction folder
    fs.rmSync(tempExtractDir, { recursive: true, force: true });
}

/**
 * Resolves the configuration URLs for a given version from environment variables.
 */
function getUrlsForVersion(version) {
    const versionClean = version.replace(/\./g, '_');
    const versionMajor = version.split('.')[0];
    
    const envKeys = [
        versionClean,             // e.g. "7_0"
        versionMajor,             // e.g. "7"
        `v${versionClean}`,        // e.g. "v7_0"
        `v${versionMajor}`         // e.g. "v7"
    ];

    let cacheUrl = null;
    let samplesUrl = null;

    for (const key of envKeys) {
        if (process.env[`META_CACHE_URL_${key}`]) {
            cacheUrl = process.env[`META_CACHE_URL_${key}`];
        }
        if (process.env[`SAMPLES_URL_${key}`]) {
            samplesUrl = process.env[`SAMPLES_URL_${key}`];
        }
    }

    return { cacheUrl, samplesUrl };
}

async function main() {
    fs.mkdirSync(TEMP_DIR, { recursive: true });

    try {
        for (const version of VERSIONS) {
            console.log(`\n========================================`);
            console.log(`Processing Version: ${version}`);
            console.log(`========================================`);

            const { cacheUrl, samplesUrl } = getUrlsForVersion(version);
            const tasks = [];

            // 1. Process Meta Cache Task
            if (cacheUrl) {
                tasks.push((async () => {
                    const cacheZipPath = path.join(TEMP_DIR, `cache_${version}.zip`);
                    try {
                        await downloadFile(cacheUrl, cacheZipPath);
                        // Extract directly into server/data
                        fs.mkdirSync(SERVER_DATA_DIR, { recursive: true });
                        extractZip(cacheZipPath, SERVER_DATA_DIR);
                        console.log(`Successfully downloaded and placed meta cache for version ${version}.`);
                    } catch (err) {
                        console.error(`Error processing meta cache for version ${version}:`, err);
                        process.exitCode = 1;
                    } finally {
                        if (fs.existsSync(cacheZipPath)) {
                            try { fs.unlinkSync(cacheZipPath); } catch (e) {}
                        }
                    }
                })());
            } else {
                console.log(`[Skip] No meta cache URL provided for version ${version}.`);
            }

            // 2. Process Samples Task
            if (samplesUrl) {
                tasks.push((async () => {
                    const samplesZipPath = path.join(TEMP_DIR, `samples_${version}.zip`);
                    const destSamplesDir = path.join(SAMPLES_ROOT_DIR, version);
                    try {
                        await downloadFile(samplesUrl, samplesZipPath);
                        extractZip(samplesZipPath, destSamplesDir);
                        console.log(`Successfully downloaded and placed samples for version ${version}.`);
                    } catch (err) {
                        console.error(`Error processing samples for version ${version}:`, err);
                        process.exitCode = 1;
                    } finally {
                        if (fs.existsSync(samplesZipPath)) {
                            try { fs.unlinkSync(samplesZipPath); } catch (e) {}
                        }
                    }
                })());
            } else {
                console.log(`[Skip] No samples URL provided for version ${version}.`);
            }

            if (tasks.length > 0) {
                await Promise.all(tasks);
            }
        }
    } finally {
        // Always clean up temp directory if empty or at the end
        if (fs.existsSync(TEMP_DIR)) {
            try {
                fs.rmSync(TEMP_DIR, { recursive: true, force: true });
            } catch (err) {
                // Ignore cleanup error
            }
        }
    }
}

main().catch(err => {
    console.error('Fatal execution error:', err);
    process.exit(1);
});
