'use strict';
const { loadState, saveState } = require('../state'); const { captureDiff } = require('../gitDiff');
function stopHook(root) {
  const s = loadState(root); if (!s || s.quizPending) return null;
  const previousCheckpoint = s.checkpointRef;
  const d = captureDiff(root, s);
  if (previousCheckpoint !== s.checkpointRef) { saveState(root, s); return null; }
  if (d.totalChangedLines >= s.config.lineThreshold || d.fileCount >= s.config.fileThreshold) { s.quizPending = true; s.pendingQuizDiff = d; s.denyCount = 0; s.milestoneCount++; saveState(root, s); }
  return null;
}
module.exports = { stopHook };
