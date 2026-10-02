'use strict';
async function readJsonStdin(stream = process.stdin) {
  let text = '';
  for await (const chunk of stream) text += chunk;
  if (!text.trim()) return {};
  const value = JSON.parse(text);
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Hook input must be one JSON object');
  return value;
}
module.exports = { readJsonStdin };
