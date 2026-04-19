import { execSync } from 'child_process';
import { homedir } from 'os';
import { resolve, join, dirname } from 'path';
import { existsSync, readFileSync } from 'fs';

export function getNpmPrefix(): string {
  try {
    const p = execSync('npm config get prefix', { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] }).trim();
    if (p) return p;
  } catch {}

  if (process.env.PREFIX) return process.env.PREFIX;

  const h = homedir();
  if (h) {
    const pf = rdp(resolve(h, '.npmrc'));
    if (pf) return pf;
  }

  const np = fnd();
  if (np) {
    const gn = resolve(dirname(dirname(np)), 'etc', 'npmrc');
    const pf = rdp(gn);
    if (pf) return pf;
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
    const m = c.match(/^\s*prefix\s*=\s*(.+)$/m);
    if (m?.[1]) return m[1].trim().replace(/^['"]|['"]$/g, '');
  } catch {}
  return null;
}

function fnd(): string | null {
  try {
    const c = process.platform === 'win32' ? 'where npm' : 'which npm';
    const s = execSync(c, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] }).trim();
    return s.split('\n')[0] || null;
  } catch {}

  const cp = process.platform === 'win32'
    ? [join(process.env.ProgramFiles || 'C:\\Program Files', 'nodejs', 'npm.cmd'), join(process.env.ProgramFiles || 'C:\\Program Files', 'nodejs', 'npm')]
    : ['/usr/local/bin/npm', '/usr/bin/npm'];

  for (const p of cp) if (existsSync(p)) return p;
  return null;
}
