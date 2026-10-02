'use strict';
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

function codexDetected(root, env = process.env) {
  if (fs.existsSync(path.join(root, '.codex'))) return true;
  const home = env.HOME || env.USERPROFILE || '';
  if (home && (fs.existsSync(path.join(home, '.codex', 'config.toml')) || fs.existsSync(path.join(home, '.codex', 'hooks.json')))) return true;
  const probe = spawnSync(process.platform === 'win32' ? 'where' : 'which', ['codex'], { encoding: 'utf8', env });
  return probe.status === 0;
}

function hookDefinitions(script) {
  const cmd = `${JSON.stringify(process.execPath)} ${JSON.stringify(script)} hook`;
  const entries = [
    ['Stop', '', `${cmd} stop-hook`],
    ['PreToolUse', 'apply_patch|Edit|Write|MultiEdit|NotebookEdit|Bash', `${cmd} pre-tool-use`],
    ['UserPromptSubmit', '', `${cmd} user-prompt-submit`],
    ['SessionStart', '', `${cmd} session-start`]
  ];
  return entries.map(([event, matcher, command]) => ({ event, matcher, handler: { type: 'command', command } }));
}

function commandBelongs(handler, script) {
  const c = typeof handler === 'string' ? handler : handler && handler.command;
  return typeof c === 'string' && (c.includes(script) || /(?:^|[\\/])professorx\.js["']?\s+hook\s+(?:pre-tool-use|stop-hook|user-prompt-submit|session-start)(?:\s|$)/i.test(c));
}

function installHooks(file, script) {
  const config = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : {};
  config.hooks ||= {};
  for (const def of hookDefinitions(script)) {
    const groups = config.hooks[def.event] ||= [];
    let group = groups.find(g => (g.matcher || '') === def.matcher);
    if (!group) { group = { hooks: [] }; if (def.matcher) group.matcher = def.matcher; groups.push(group); }
    group.hooks ||= [];
    group.hooks = group.hooks.filter(h => !commandBelongs(h, script));
    group.hooks.push(def.handler);
  }
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(config, null, 2)}\n`);
}

function uninstallHooks(file) {
  if (!fs.existsSync(file)) return;
  const config = JSON.parse(fs.readFileSync(file, 'utf8'));
  for (const [event, groups] of Object.entries(config.hooks || {})) {
    const kept = groups.map(group => ({ ...group, hooks: (group.hooks || []).filter(h => !commandBelongs(h, 'professorx')) })).filter(g => g.hooks.length);
    if (kept.length) config.hooks[event] = kept; else delete config.hooks[event];
  }
  if (!Object.keys(config.hooks || {}).length) delete config.hooks;
  fs.writeFileSync(file, `${JSON.stringify(config, null, 2)}\n`);
}
module.exports = { codexDetected, hookDefinitions, installHooks, uninstallHooks };
