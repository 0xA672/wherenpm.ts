import { execSync } from 'child_process';
import { homedir } from 'os';
import { resolve, join, dirname } from 'path';
import { existsSync, readFileSync, realpathSync } from 'fs';

let _pf: string | null = null;

export function getNpmPrefix(): string {
  if (_pf) return _pf;
  if (process.env.PREFIX) return _pf = process.env.PREFIX;

  try {
    const p = execSync('npm config get prefix', { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] }).trim();
    if (p) return _pf = p;
  } catch {}

  const h = homedir();
  if (h) {
    const pf = rdp(resolve(h, '.npmrc'));
    if (pf) return _pf = expand(pf);
  }

  const np = fnd();
  if (np) {
    const npmRoot = dirname(dirname(np));
    const globalEtcNpmrc = resolve(npmRoot, 'etc', 'npmrc');
    const pfFromEtc = rdp(globalEtcNpmrc);
    if (pfFromEtc) {
      return _pf = expand(pfFromEtc);
    }
    return _pf = npmRoot;
  }

  const { APPDATA, DESTDIR, OSTYPE } = process.env;
  const w = process.platform === 'win32' || OSTYPE === 'msys' || OSTYPE === 'cygwin';

  if (w) {
    return _pf = APPDATA ? join(APPDATA, 'npm') : dirname(process.execPath);// если нигде нету npm, гадаем, где он, по текущей ОС
  }

  let fb = dirname(dirname(process.execPath));// same as above, this is a best-effort guess for Unix
  if (DESTDIR) fb = join(DESTDIR, fb);
  return _pf = fb;
}

export function clear(): void {
  _pf = null;
}

export function to(): string {
  const prefix = getNpmPrefix();
  if (!prefix) {
    return 'echo npm prefix not found';
  }

  if (process.platform === 'win32') {
    return `cd /d "${prefix.replace(/"/g, '""')}"`;
  }

  return `cd "${prefix.replace(/"/g, '\\"')}"`;
}

function rdp(f: string): string | null {
  try {
    const c = readFileSync(f, 'utf8');
    const lines = c.split(/\r?\n/);
    for (const line of lines) {
      const t = line.trim();
      if (!t || t.startsWith('#') || t.startsWith(';')) continue;
      const eq = t.indexOf('=');
      if (eq === -1) continue;
      const k = t.slice(0, eq).trim();
      if (k !== 'prefix') continue;
      let v = t.slice(eq + 1).trim();
      const cmt = v.search(/[#;]/);
      if (cmt !== -1) v = v.slice(0, cmt).trim();
      return v.replace(/^['"]|['"]$/g, '');
    }
  } catch {}
  return null;
}

function expand(v: string): string {
  return v.replace(/\$\{?(\w+)\}?/g, (_, n) => process.env[n] || '');
}

function fnd(): string | null {
  try {
    const c = process.platform === 'win32' ? 'where npm' : 'which npm';
    const s = execSync(c, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] }).trim();
    const p = s.split('\n')[0];
    if (p) return realpathSync(p);
  } catch {}

  const cp = process.platform === 'win32'
    ? [join(process.env.ProgramFiles || 'C:\\Program Files', 'nodejs', 'npm.cmd'), join(process.env.ProgramFiles || 'C:\\Program Files', 'nodejs', 'npm')]
    : ['/usr/local/bin/npm', '/usr/bin/npm'];

  for (const p of cp) {
    try {
      if (existsSync(p)) return realpathSync(p);
    } catch {}
  }
  return null;
}
