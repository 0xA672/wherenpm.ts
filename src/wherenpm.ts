import { execSync } from 'child_process';
import { homedir } from 'os';
import { resolve, join, dirname } from 'path';
import { existsSync, readFileSync, realpathSync } from 'fs';

export function getNpmPrefix(): string {
  try {
    const p = execSync('npm config get prefix', { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] }).trim();
    if (p) return p;
  } catch {}

  if (process.env.PREFIX) return process.env.PREFIX;

  const h = homedir();
  if (h) {
    const pf = rdp(resolve(h, '.npmrc'));
    if (pf) return expand(pf);
  }

  const np = fnd();
  if (np) {
    const builtin = resolve(dirname(dirname(np)), 'npmrc');
    const pf1 = rdp(builtin);
    if (pf1) {
      const globalEtc = resolve(pf1, 'etc', 'npmrc');
      const pf2 = rdp(globalEtc);
      return expand(pf2 || pf1);
    }
  }

  const { APPDATA, DESTDIR, OSTYPE } = process.env;
  const w = process.platform === 'win32' || OSTYPE === 'msys' || OSTYPE === 'cygwin';

  if (w) {
    return APPDATA ? join(APPDATA, 'npm') : dirname(process.execPath);
  }

  let fb = dirname(dirname(process.execPath));
  if (DESTDIR) fb = join(DESTDIR, fb);
  return fb;
}

function rdp(f: string): string | null {
  try {
    const c = readFileSync(f, 'utf8');
    let pf: string | null = null;
    const lines = c.split(/\r?\n/);
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#') || trimmed.startsWith(';')) continue;
      const eq = trimmed.indexOf('=');
      if (eq === -1) continue;
      let key = trimmed.slice(0, eq).trim();
      let val = trimmed.slice(eq + 1).trim();
      const cmt = val.search(/[#;]/);
      if (cmt !== -1) val = val.slice(0, cmt).trim();
      if (key === 'prefix') {
        pf = val.replace(/^['"]|['"]$/g, '');
        break;
      }
    }
    return pf;
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
