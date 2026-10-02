'use strict';
const fs = require('node:fs'); const path = require('node:path');
const { resolveProjectRoot } = require('../projectRoot'); const { defaults, loadState, saveState } = require('../state');
const { git, snapshotTree, protectCheckpoint } = require('../gitDiff'); const { codexDetected, installHooks } = require('../agentTargets');
function addIgnore(root) {
  const file = path.join(root, '.gitignore'); const existing = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '';
  const lines = existing ? existing.split(/\r?\n/) : []; const wanted = ['.professorx/', '.claude/settings.local.json', '.codex/hooks.json'];
  for (const line of wanted) if (!lines.includes(line)) lines.push(line);
  fs.writeFileSync(file, `${lines.join('\n').replace(/\n*$/, '\n')}`);
}
function init(cwd = process.cwd(), force = false, env = process.env) {
  const root = resolveProjectRoot(cwd); const top = git(root, ['rev-parse', '--show-toplevel'], { allowFailure: true });
  if (top.status !== 0) throw new Error('professorx init must run inside a Git working tree.');
  const prior = !force && loadState(root); const state = prior || defaults();
  const head = git(root, ['rev-parse', '--verify', 'HEAD'], { allowFailure: true });
  const checkpoint = head.status === 0 ? head.stdout.trim() : snapshotTree(root);
  state.checkpointRef = checkpoint; protectCheckpoint(root, checkpoint); saveState(root, state); addIgnore(root);
  const script = path.resolve(__dirname, '../../bin/professorx.js');
  installHooks(path.join(root, '.claude', 'settings.local.json'), script);
  const codex = codexDetected(root, env);
  if (codex) installHooks(path.join(root, '.codex', 'hooks.json'), script);
  return { root, codex };
}
module.exports = { init, addIgnore };
