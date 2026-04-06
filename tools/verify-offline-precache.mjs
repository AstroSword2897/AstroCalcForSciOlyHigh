/**
 * Verifies every path in sw.js PRECACHE_RESOURCES exists on disk.
 * Run: node tools/verify-offline-precache.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const swPath = path.join(root, 'sw.js');
const sw = fs.readFileSync(swPath, 'utf8');
const m = sw.match(/const PRECACHE_RESOURCES = \[([\s\S]*?)\];/);
if (!m) {
    console.error('Could not parse PRECACHE_RESOURCES from sw.js');
    process.exit(1);
}
const body = m[1];
const paths = [...body.matchAll(/'([^']+)'/g)].map((x) => x[1]);

let missing = [];
for (const p of paths) {
    if (p === './') {
        if (!fs.existsSync(path.join(root, 'index.html'))) missing.push(p + ' (index.html)');
        continue;
    }
    const rel = p.replace(/^\.\//, '');
    const full = path.join(root, rel);
    if (!fs.existsSync(full)) missing.push(p);
}

if (missing.length) {
    console.error('Missing precache files:\n', missing.join('\n'));
    process.exit(1);
}

console.log('OK: all', paths.length, 'precache paths exist on disk.');
