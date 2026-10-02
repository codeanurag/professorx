'use strict';
const { loadState } = require('../state');
function topics(root, due = false) { const s = loadState(root); if (!s) throw new Error('ProfessorX is not initialized here.'); let list = s.topics.slice(); if (due) list = list.filter(t => t.misses > 0); list.sort((a,b) => b.misses - a.misses || (a.lastReviewed || '') .localeCompare(b.lastReviewed || '')); return list.length ? list.map(t => `${t.topic} — ${t.misses} miss${t.misses === 1 ? '' : 'es'}; last missed ${t.lastMissed || 'never'}; last reviewed ${t.lastReviewed || 'never'}`).join('\n') : 'No topics to show.'; }
module.exports = { topics };
