'use strict';
const { loadState, saveState } = require('../state'); const { captureDiff } = require('../gitDiff');
function status(root) {
  const s = loadState(root); if (!s) throw new Error('ProfessorX is not initialized here. Run professorx init.');
  const previous = s.checkpointRef; const diff = captureDiff(root, s); if (previous !== s.checkpointRef) saveState(root, s);
  return `Checkpoint: ${(s.checkpointRef || 'none').slice(0, 12)}\nCheck-in pending: ${s.quizPending ? 'yes' : 'no'}\nMilestones: ${s.milestoneCount}\nCurrent changes: ${diff.totalChangedLines} lines across ${diff.fileCount} files (${diff.insertions} insertions, ${diff.deletions} deletions)\nThresholds: ${s.config.lineThreshold} lines or ${s.config.fileThreshold} files\nWeak topics: ${s.topics.length ? s.topics.map(t => `${t.topic} (${t.misses})`).join(', ') : 'none'}`;
}
module.exports = { status };
