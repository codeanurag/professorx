'use strict';
const fs = require('node:fs');
const path = require('node:path');
function appendCheckin(root, entry) { const dir = path.join(root, '.professorx'); fs.mkdirSync(dir, { recursive: true }); fs.appendFileSync(path.join(dir, 'checkins.jsonl'), `${JSON.stringify(entry)}\n`); }
function readCheckins(root) { const f = path.join(root, '.professorx', 'checkins.jsonl'); if (!fs.existsSync(f)) return []; return fs.readFileSync(f, 'utf8').split(/\r?\n/).filter(Boolean).map(line => JSON.parse(line)); }
module.exports = { appendCheckin, readCheckins };
