// Small local records only. Never follow symlink components or overwrite in place.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

export const json = value => JSON.stringify(value, null, 2) + '\n';
export const hash = value => value === null ? null : crypto.createHash('sha256').update(value).digest('hex');
export function localPath(root, relative) {
  if (path.isAbsolute(relative) || relative.includes('\\') || relative.split('/').some(p => !p || p === '.' || p === '..'))
    throw new Error('unsafe_local_path');
  let current = fs.realpathSync(root);
  for (const part of relative.split('/')) {
    current = path.join(current, part);
    try { if (fs.lstatSync(current).isSymbolicLink()) throw new Error('symlink_local_path'); }
    catch (error) { if (error.code !== 'ENOENT') throw error; }
  }
  return current;
}
export function readLocal(root, relative, limit = 1_000_000) {
  let fd;
  try {
    fd = fs.openSync(localPath(root, relative), fs.constants.O_RDONLY | fs.constants.O_NOFOLLOW | fs.constants.O_NONBLOCK);
    const stat = fs.fstatSync(fd);
    if (!stat.isFile() || stat.size > limit) throw new Error('unsupported_local_record');
    const buffer = Buffer.alloc(limit + 1);
    let n = 0, count;
    while (n < buffer.length && (count = fs.readSync(fd, buffer, n, buffer.length - n, null))) n += count;
    if (n > limit || fs.fstatSync(fd).mtimeMs !== stat.mtimeMs) throw new Error('changed_or_oversize_record');
    return buffer.subarray(0, n);
  } catch (error) { if (error.code === 'ENOENT') return null; throw error; }
  finally { if (fd !== undefined) fs.closeSync(fd); }
}
export function writeLocal(root, relative, value, { exclusive = false } = {}) {
  const target = localPath(root, relative);
  if (value === null) { fs.rmSync(target, { force: true }); return; }
  if (Buffer.byteLength(value) > 1_000_000) throw new Error('oversize_local_record');
  fs.mkdirSync(path.dirname(target), { recursive: true, mode: 0o700 });
  const temporary = target + '.' + crypto.randomUUID();
  try {
    fs.writeFileSync(temporary, value, { flag: 'wx', mode: 0o600 });
    if (exclusive) { fs.linkSync(temporary, target); }
    else fs.renameSync(temporary, target);
  } finally { if (fs.existsSync(temporary)) fs.unlinkSync(temporary); }
}
