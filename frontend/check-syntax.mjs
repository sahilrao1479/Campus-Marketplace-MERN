/**
 * Scan each JSX/JS file for syntax errors using esbuild
 */
import { transform } from 'esbuild';
import { readdir, readFile } from 'fs/promises';
import { join, relative } from 'path';

const srcDir = new URL('./src', import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1');

async function getFiles(dir) {
    const entries = await readdir(dir, { withFileTypes: true });
    const files = [];
    for (const entry of entries) {
        const full = join(dir, entry.name);
        if (entry.isDirectory()) {
            files.push(...await getFiles(full));
        } else if (/\.(jsx|js|tsx|ts)$/.test(entry.name)) {
            files.push(full);
        }
    }
    return files;
}

const files = await getFiles(srcDir);

let anyError = false;
for (const file of files) {
    try {
        const code = await readFile(file, 'utf8');
        await transform(code, {
            loader: file.endsWith('x') ? 'jsx' : 'js',
            jsx: 'automatic',
        });
    } catch (e) {
        anyError = true;
        console.log(`\n❌ ERROR in ${relative(srcDir, file)}`);
        if (e.errors) {
            e.errors.forEach(err => {
                console.log(`  Line ${err.location?.line}: ${err.text}`);
            });
        } else {
            console.log(' ', e.message?.slice(0, 300));
        }
    }
}

if (!anyError) console.log('✅ All files parse cleanly!');
