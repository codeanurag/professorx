'use strict';
const fs = require('node:fs');
const path = require('node:path');
const defaults = () => ({ version: 2, checkpointRef: null, quizPending: false, pendingQuizDiff: null, denyCount: 0, milestoneCount: 0, topics: [], config: { lineThreshold: 60, fileThreshold: 3, excludePatterns: ['package-lock.json', 'pnpm-lock.yaml', 'yarn.lock'] } });
function stateDir(root) { return path.join(root, '.professorx'); }
function loadState(root) {
  const file = path.join(stateDir(root), 'state.json');
  if (!fs.existsSync(file)) return null;
  const loaded = JSON.parse(fs.readFileSync(file, 'utf8'));
  return { ...defaults(), ...loaded, config: { ...defaults().config, ...(loaded.config || {}) }, topics: Array.isArray(loaded.topics) ? loaded.topics : [] };
}
function saveState(root, state) {
  const dir = stateDir(root); fs.mkdirSync(dir, { recursive: true });
  const file = path.join(dir, 'state.json'); const tmp = `${file}.${process.pid}.${Date.now()}.tmp`;
  fs.writeFileSync(tmp, `${JSON.stringify(state, null, 2)}\n`); fs.renameSync(tmp, file);
}
module.exports = { defaults, stateDir, loadState, saveState };
