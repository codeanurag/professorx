'use strict';
const { loadState, saveState } = require('../state'); const { captureDiff } = require('../gitDiff');
function quiz(root) { const s = loadState(root); if (!s) throw new Error('ProfessorX is not initialized here.'); if (s.quizPending) throw new Error('A check-in is already pending.'); const d = captureDiff(root, s); if (!d.fileCount) throw new Error('No changes to review.'); s.quizPending = true; s.pendingQuizDiff = d; s.denyCount = 0; s.milestoneCount++; saveState(root, s); return d; }
module.exports = { quiz };
