#!/usr/bin/env node
'use strict';
const path = require('node:path');
const { resolveProjectRoot } = require('../lib/projectRoot');
const { readJsonStdin } = require('../lib/stdin');
const { init } = require('../lib/commands/init'); const { status } = require('../lib/commands/status'); const { quiz } = require('../lib/commands/quiz'); const { resolve } = require('../lib/commands/resolve'); const { topics } = require('../lib/commands/topics'); const { log } = require('../lib/commands/log'); const { uninstall } = require('../lib/commands/uninstall');
const { preToolUse } = require('../lib/hooks/preToolUse'); const { stopHook } = require('../lib/hooks/stopHook'); const { userPromptSubmit } = require('../lib/hooks/userPromptSubmit'); const { sessionStart } = require('../lib/hooks/sessionStart');
function help() { return `ProfessorX — local-first comprehension checkpoints\n\nUsage: professorx <command>\n\nCommands:\n  init [--force]                          Install hooks and initialize local state\n  status                                  Show checkpoint and current changes\n  quiz                                    Open a check-in for current changes\n  resolve --result pass|fail [options]   Resolve a pending check-in\n  topics [--due]                          List weak topics\n  log                                     Show resolved check-ins\n  uninstall                               Remove ProfessorX hook handlers\n  hook <pre-tool-use|stop-hook|user-prompt-submit|session-start>  Internal hook entry point`; }
function options(args) { const out = {}; for (let i = 0; i < args.length; i++) if (args[i].startsWith('--')) { const key = args[i].slice(2); out[key] = args[i + 1] && !args[i + 1].startsWith('--') ? args[++i] : true; } return out; }
async function main(argv = process.argv.slice(2)) {
  const [command, ...args] = argv;
  if (!command || command === '--help' || command === '-h' || command === 'help') { process.stdout.write(`${help()}\n`); return; }
  if (command === 'hook') {
    const input = await readJsonStdin(); const cwd = input.cwd || process.cwd(); const root = resolveProjectRoot(cwd); const name = args[0];
    const out = name === 'pre-tool-use' ? preToolUse(root, input) : name === 'stop-hook' ? stopHook(root) : name === 'user-prompt-submit' ? userPromptSubmit(root) : name === 'session-start' ? sessionStart(root) : null;
    if (out) process.stdout.write(`${JSON.stringify(out)}\n`); return;
  }
  const root = resolveProjectRoot(process.cwd()); const opts = options(args); let out;
  if (command === 'init') { const result = init(process.cwd(), Boolean(opts.force)); out = `ProfessorX initialized at ${result.root}. State is local, thresholds are configurable in .professorx/state.json, and no branch or normal Git history is changed. Claude Code hooks installed.${result.codex ? ' Codex hooks installed. Run /hooks, review the project hook definitions, and trust them. Trust is hash-based, so review changed hook definitions again.' : ''}`; }
  else if (command === 'status') out = status(root);
  else if (command === 'quiz') { const d = quiz(root); out = `Check-in opened for ${d.fileCount} file(s), ${d.totalChangedLines} changed line(s).`; }
  else if (command === 'resolve') out = resolve(root, opts);
  else if (command === 'topics') out = topics(root, Boolean(opts.due));
  else if (command === 'log') out = log(root);
  else if (command === 'uninstall') out = uninstall(root);
  else throw new Error(`Unknown command: ${command}\n\n${help()}`);
  process.stdout.write(`${out}\n`);
}
main().catch(error => { process.stderr.write(`professorx: ${error.message}\n`); process.exitCode = 1; });
