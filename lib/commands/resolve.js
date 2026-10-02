'use strict';
const { loadState, saveState } = require('../state'); const { snapshotTree, protectCheckpoint } = require('../gitDiff'); const { appendCheckin } = require('../checkinsLog');
function resolve(root, opts) {
  const s = loadState(root); if (!s) throw new Error('ProfessorX is not initialized here.');
  if (!['pass', 'fail'].includes(opts.result)) throw new Error('--result must be pass or fail.');
  if (opts.result === 'fail' && !(opts.topic || '').trim()) throw new Error('--topic is required when resolving a failed check-in.');
  if (!s.quizPending) return 'No check-in is pending; nothing changed.';
  const timestamp = new Date().toISOString(); const topic = (opts.topic || '').trim();
  if (opts.result === 'fail' && topic) { let t = s.topics.find(x => x.topic.toLowerCase() === topic.toLowerCase()); if (!t) { t = { topic, misses: 0, lastMissed: null, lastReviewed: null }; s.topics.push(t); } t.misses++; t.lastMissed = timestamp; }
  if (opts.result === 'pass' && topic) { const t = s.topics.find(x => x.topic.toLowerCase() === topic.toLowerCase()); if (t) t.lastReviewed = timestamp; }
  const captured = s.pendingQuizDiff || {}; const sha = snapshotTree(root); protectCheckpoint(root, sha); s.checkpointRef = sha; s.quizPending = false; s.pendingQuizDiff = null; s.denyCount = 0; saveState(root, s);
  if (!opts.summary) process.stderr.write('Warning: --summary was omitted; the audit record will have an empty summary.\n');
  appendCheckin(root, { timestamp, result: opts.result, topic: topic || null, summary: opts.summary || '', files: captured.filesChanged || [] });
  return `Check-in resolved: ${opts.result}.`;
}
module.exports = { resolve };
