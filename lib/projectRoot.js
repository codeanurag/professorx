'use strict';
const path = require('node:path');
const { spawnSync } = require('node:child_process');
function resolveProjectRoot(cwd = process.cwd()) {
  const resolved = path.resolve(cwd);
  const r = spawnSync('git', ['rev-parse', '--show-toplevel'], { cwd: resolved, encoding: 'utf8' });
  return r.status === 0 ? path.resolve(r.stdout.trim()) : resolved;
}
module.exports = { resolveProjectRoot };
