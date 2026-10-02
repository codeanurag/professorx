'use strict';
const path = require('node:path'); const { uninstallHooks } = require('../agentTargets');
function uninstall(root) { for (const f of ['.claude/settings.local.json', '.codex/hooks.json']) uninstallHooks(path.join(root, f)); return 'ProfessorX hooks removed. Local data remains in .professorx/. To remove it manually: rm -rf .professorx'; }
module.exports = { uninstall };
