'use strict';
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const EMPTY_TREE = '4b825dc642cb6eb9a060e54bf8d69288fbee4904';
const CHECKPOINT_REF = 'refs/professorx/checkpoint';
function git(root, args, opts = {}) {
  const r = spawnSync('git', args, { cwd: root, encoding: 'utf8', maxBuffer: 32 * 1024 * 1024, env: { ...process.env, ...opts.env } });
  if (r.status !== 0 && !opts.allowFailure) throw new Error((r.stderr || `git ${args.join(' ')} failed`).trim());
  return { status: r.status, stdout: r.stdout || '', stderr: r.stderr || '' };
}
function refExists(root, ref) { return git(root, ['rev-parse', '--verify', `${ref}^{commit}`], { allowFailure: true }).status === 0; }
function protectCheckpoint(root, sha) { git(root, ['update-ref', CHECKPOINT_REF, sha], { allowFailure: true }); }
function snapshotTree(root) {
  const idx = path.join(os.tmpdir(), `professorx-index-${process.pid}-${Date.now()}-${Math.random().toString(16).slice(2)}`);
  try {
    const env = { GIT_INDEX_FILE: idx };
    git(root, ['read-tree', 'HEAD'], { env, allowFailure: true });
    git(root, ['add', '-A'], { env });
    const tree = git(root, ['write-tree'], { env }).stdout.trim();
    const head = git(root, ['rev-parse', '--verify', 'HEAD'], { allowFailure: true });
    const args = ['-c', 'user.name=ProfessorX local snapshot', '-c', 'user.email=professorx@local.invalid', 'commit-tree', tree];
    if (head.status === 0) args.push('-p', head.stdout.trim());
    args.push('-m', 'ProfessorX local snapshot');
    return git(root, args).stdout.trim();
  } finally { try { fs.unlinkSync(idx); } catch {} }
}
function ensureCheckpoint(root, state) {
  const candidate = state && state.checkpointRef && git(root, ['cat-file', '-e', `${state.checkpointRef}^{commit}`], { allowFailure: true }).status === 0 ? state.checkpointRef : (refExists(root, CHECKPOINT_REF) ? git(root, ['rev-parse', CHECKPOINT_REF]).stdout.trim() : null);
  if (candidate) { protectCheckpoint(root, candidate); return candidate; }
  const sha = snapshotTree(root); protectCheckpoint(root, sha); return sha;
}
function diffTrees(root, from, to, config = {}) {
  const args = ['diff', '--no-ext-diff', '--no-renames', '--numstat', from, to, '--', '.', ':(exclude).professorx/**', ':(exclude).claude/**', ':(exclude).codex/hooks.json'];
  for (const p of config.excludePatterns || []) args.push(`:(exclude)**/${p}`);
  const num = git(root, args).stdout.trim(); const files = []; let insertions = 0, deletions = 0;
  for (const line of num ? num.split('\n') : []) { const [a, d, name] = line.split('\t'); files.push(name); insertions += Number(a) || 0; deletions += Number(d) || 0; }
  const diffArgs = ['diff', '--no-ext-diff', '--no-renames', from, to, '--', '.', ':(exclude).professorx/**', ':(exclude).claude/**', ':(exclude).codex/hooks.json'];
  for (const p of config.excludePatterns || []) diffArgs.push(`:(exclude)**/${p}`);
  const full = git(root, diffArgs).stdout; const maxChars = 6000;
  return { filesChanged: files.slice(0, 20), fileCount: files.length, insertions, deletions, totalChangedLines: insertions + deletions, diff: full.slice(0, maxChars), truncated: full.length > maxChars, snapshotRef: to };
}
function captureDiff(root, state) {
  const base = ensureCheckpoint(root, state); const fresh = snapshotTree(root);
  if (base !== state.checkpointRef) { state.checkpointRef = base; protectCheckpoint(root, base); }
  return diffTrees(root, base, fresh, state.config);
}
module.exports = { EMPTY_TREE, CHECKPOINT_REF, git, snapshotTree, protectCheckpoint, ensureCheckpoint, diffTrees, captureDiff };
