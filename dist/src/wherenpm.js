"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNpmPrefix = getNpmPrefix;
const child_process_1 = require("child_process");
const os_1 = require("os");
const path_1 = require("path");
const fs_1 = require("fs");
function getNpmPrefix() {
    try {
        const p = (0, child_process_1.execSync)('npm config get prefix', { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] }).trim();
        if (p)
            return p;
    }
    catch { }
    if (process.env.PREFIX)
        return process.env.PREFIX;
    const h = (0, os_1.homedir)();
    if (h) {
        const pf = rdp((0, path_1.resolve)(h, '.npmrc'));
        if (pf)
            return pf;
    }
    const np = fnd();
    if (np) {
        const pf = rdp((0, path_1.resolve)(np, '..', '..', 'npmrc'));
        if (pf)
            return pf;
    }
    const { APPDATA, DESTDIR, OSTYPE } = process.env;
    const w = process.platform === 'win32' || OSTYPE === 'msys' || OSTYPE === 'cygwin';
    if (w)
        return APPDATA ? (0, path_1.join)(APPDATA, 'npm') : (0, path_1.dirname)(process.execPath);
    let fb = (0, path_1.dirname)((0, path_1.dirname)(process.execPath));
    if (DESTDIR)
        fb = (0, path_1.join)(DESTDIR, fb);
    return fb;
}
function rdp(f) {
    try {
        const c = (0, fs_1.readFileSync)(f, 'utf8');
        const m = c.match(/^\s*prefix\s*=\s*(.+)$/m);
        if (m?.[1])
            return m[1].trim().replace(/^['"]|['"]$/g, '');
    }
    catch { }
    return null;
}
function fnd() {
    try {
        const c = process.platform === 'win32' ? 'where npm' : 'which npm';
        const s = (0, child_process_1.execSync)(c, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] }).trim();
        return s.split('\n')[0] || null;
    }
    catch { }
    const cp = process.platform === 'win32' ? [(0, path_1.join)(process.env.ProgramFiles || 'C:\\Program Files', 'nodejs', 'npm.cmd'), (0, path_1.join)(process.env.ProgramFiles || 'C:\\Program Files', 'nodejs', 'npm')] : ['/usr/local/bin/npm', '/usr/bin/npm'];
    for (const p of cp)
        if ((0, fs_1.existsSync)(p))
            return p;
    return null;
}
