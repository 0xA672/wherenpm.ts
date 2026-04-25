"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNpmPrefix = getNpmPrefix;
exports.clear = clear;
exports.to = to;
const child_process_1 = require("child_process");
const os_1 = require("os");
const path_1 = require("path");
const fs_1 = require("fs");
let _pf = null;
function getNpmPrefix() {
    if (_pf)
        return _pf;
    if (process.env.PREFIX)
        return _pf = process.env.PREFIX;
    try {
        const p = (0, child_process_1.execSync)('npm config get prefix', { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] }).trim();
        if (p)
            return _pf = p;
    }
    catch { }
    const h = (0, os_1.homedir)();
    if (h) {
        const pf = rdp((0, path_1.resolve)(h, '.npmrc'));
        if (pf)
            return _pf = expand(pf);
    }
    const np = fnd();
    if (np) {
        const npmRoot = (0, path_1.dirname)((0, path_1.dirname)(np));
        const globalEtcNpmrc = (0, path_1.resolve)(npmRoot, 'etc', 'npmrc');
        const pfFromEtc = rdp(globalEtcNpmrc);
        if (pfFromEtc) {
            return _pf = expand(pfFromEtc);
        }
        return _pf = npmRoot;
    }
    const { APPDATA, DESTDIR, OSTYPE } = process.env;
    const w = process.platform === 'win32' || OSTYPE === 'msys' || OSTYPE === 'cygwin';
    if (w) {
        return _pf = APPDATA ? (0, path_1.join)(APPDATA, 'npm') : (0, path_1.dirname)(process.execPath); // если нигде нету npm, гадаем, где он, по текущей ОС
    }
    let fb = (0, path_1.dirname)((0, path_1.dirname)(process.execPath)); // same as above, this is a best-effort guess for Unix
    if (DESTDIR)
        fb = (0, path_1.join)(DESTDIR, fb);
    return _pf = fb;
}
function clear() {
    _pf = null;
}
function to() {
    const prefix = getNpmPrefix();
    if (!prefix) {
        return 'echo npm prefix not found';
    }
    if (process.platform === 'win32') {
        return `cd /d "${prefix.replace(/"/g, '""')}"`;
    }
    return `cd "${prefix.replace(/"/g, '\\"')}"`;
}
function rdp(f) {
    try {
        const c = (0, fs_1.readFileSync)(f, 'utf8');
        const lines = c.split(/\r?\n/);
        for (const line of lines) {
            const t = line.trim();
            if (!t || t.startsWith('#') || t.startsWith(';'))
                continue;
            const eq = t.indexOf('=');
            if (eq === -1)
                continue;
            const k = t.slice(0, eq).trim();
            if (k !== 'prefix')
                continue;
            let v = t.slice(eq + 1).trim();
            const cmt = v.search(/[#;]/);
            if (cmt !== -1)
                v = v.slice(0, cmt).trim();
            return v.replace(/^['"]|['"]$/g, '');
        }
    }
    catch { }
    return null;
}
function expand(v) {
    return v.replace(/\$\{?(\w+)\}?/g, (_, n) => process.env[n] || '');
}
function fnd() {
    try {
        const c = process.platform === 'win32' ? 'where npm' : 'which npm';
        const s = (0, child_process_1.execSync)(c, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] }).trim();
        const p = s.split('\n')[0];
        if (p)
            return (0, fs_1.realpathSync)(p);
    }
    catch { }
    const cp = process.platform === 'win32'
        ? [(0, path_1.join)(process.env.ProgramFiles || 'C:\\Program Files', 'nodejs', 'npm.cmd'), (0, path_1.join)(process.env.ProgramFiles || 'C:\\Program Files', 'nodejs', 'npm')]
        : ['/usr/local/bin/npm', '/usr/bin/npm'];
    for (const p of cp) {
        try {
            if ((0, fs_1.existsSync)(p))
                return (0, fs_1.realpathSync)(p);
        }
        catch { }
    }
    return null;
}
