'use strict';
const { loadState, saveState } = require('../state'); const { buildQuizInstruction } = require('../promptTemplate'); const { snapshotTree, protectCheckpoint } = require('../gitDiff');
const FILE_TOOLS = new Set(['apply_patch', 'Edit', 'Write', 'MultiEdit', 'NotebookEdit']);
function shellModifies(command) {
  const c = String(command || '');
  const clean = c.match(/\bgit\s+clean\b([^;&|]*)/i);
  if (clean && !/(?:^|\s)(?:-n\b|--dry-run\b)/i.test(clean[1])) return true;
  return /(?:^|[;&|\s])(?:rm|mv|cp|install|mkdir|touch|chmod|chown|ln|truncate|dd|tee)\s/i.test(c) || /\bsed\s+-[a-z]*i[a-z]*(?:\s|$)/i.test(c) || /\b(?:npm|pnpm|yarn)\s+(?:install|ci|add|remove|uninstall)\b/i.test(c) || /\bgit\s+(?:rm|mv|apply)\b/i.test(c) && !/\bgit\s+apply\s+--check\b/i.test(c) || /\bgit\s+checkout\s+--(?:\s|$)/i.test(c) || /\bgit\s+reset\s+--hard\b/i.test(c) || />>?(?!&\d)/.test(c);
}
function isModifying(input) { const name = input.tool_name || input.name || ''; if (FILE_TOOLS.has(name)) return true; if (name === 'Bash' || name === 'bash') return shellModifies(input.tool_input?.command || input.command); return false; }
function preToolUse(root, input) {
  const s = loadState(root); if (!s || !s.quizPending || !isModifying(input)) return null;
  s.denyCount = (s.denyCount || 0) + 1;
  if (s.denyCount >= 12) {
    const sha = snapshotTree(root); protectCheckpoint(root, sha); s.checkpointRef = sha; s.quizPending = false; s.pendingQuizDiff = null; s.denyCount = 0; saveState(root, s);
    return { systemMessage: 'ProfessorX automatically closed a check-in after repeated blocked edits so work can continue.' };
  }
  saveState(root, s);
  return { hookSpecificOutput: { hookEventName: 'PreToolUse', permissionDecision: 'deny', permissionDecisionReason: 'A ProfessorX check-in must be resolved before editing.', additionalContext: buildQuizInstruction({ diff: s.pendingQuizDiff, topics: s.topics }) } };
}
module.exports = { preToolUse, isModifying, shellModifies };
