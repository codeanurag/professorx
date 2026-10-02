'use strict';
function buildQuizInstruction(data) {
  const d = data || {}; const changes = d.diff || {};
  const n = Math.max(2, Math.min(8, 3 + Math.floor((changes.totalChangedLines || 0) / 50)));
  const topics = (d.topics || []).filter(t => t.misses > 0).map(t => `${t.topic} (${t.misses} miss${t.misses === 1 ? '' : 'es'})`);
  return `A ProfessorX comprehension check-in is open. Ask ${n} question(s), one at a time, about code literally present in the captured diff below. Never ask about the blocked future change. End each turn after one question and wait for the real user's reply; never batch questions or answer for the user. Ask about rationale, behavior, edge cases, or failure modes rather than trivia or yes/no facts. Give a short affirmation for a correct or close answer. If an answer is wrong or uncertain, explain the concept plainly with one simple analogy. Revisit previously missed topics only when relevant to this diff. After the final answer, run exactly one resolution command, always including --summary: professorx resolve --result pass --summary "<what was asked and answered>" OR professorx resolve --result fail --topic "<short specific topic>" --summary "<what was asked and answered>". Attempt no further file editing or modifying shell command until resolution.

Changed files: ${(changes.filesChanged || []).join(', ') || 'none'}
Change counts: ${changes.insertions || 0} insertions, ${changes.deletions || 0} deletions, ${changes.fileCount || 0} files
Previously missed topics relevant to this check-in: ${topics.join(', ') || 'none identified'}
Captured diff${changes.truncated ? ' (TRUNCATED at 6,000 characters)' : ''}:
${changes.diff || '(empty)'}`;
}
module.exports = { buildQuizInstruction };
