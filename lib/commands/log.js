'use strict';
const { readCheckins } = require('../checkinsLog');
function log(root) { const entries = readCheckins(root); return entries.length ? entries.map(e => `${e.timestamp}  ${e.result.toUpperCase()}  ${e.topic || '(no topic)'}\n  ${e.summary || '(no summary)'}\n  Files: ${(e.files || []).join(', ') || 'none'}`).join('\n') : 'No resolved check-ins.'; }
module.exports = { log };
