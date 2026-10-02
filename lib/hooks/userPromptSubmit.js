'use strict';
const { loadState } = require('../state');
function userPromptSubmit(root) { const s = loadState(root); if (!s || !s.quizPending) return null; const additionalContext = 'Continue the remaining ProfessorX questions one at a time and wait for the real user reply after each. After the final answer, run exactly one resolve command with --summary before editing: professorx resolve --result pass --summary "<what was asked and answered>" or professorx resolve --result fail --topic "<short specific topic>" --summary "<what was asked and answered>".'; return { hookSpecificOutput: { hookEventName: 'UserPromptSubmit', additionalContext } }; }
module.exports = { userPromptSubmit };
