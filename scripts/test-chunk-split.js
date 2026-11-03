const fs = require('fs');

function splitIntoSqlChunks(id, field, fullString, maxChunkLen = 30000) {
  if (!fullString) return [];
  const statements = [];
  // First chunk sets the field
  const first = fullString.substring(0, maxChunkLen);
  statements.push(`UPDATE stories SET ${field} = '${first.replace(/'/g, "''")}' WHERE id = '${id}';`);
  
  // Subsequent chunks append with ||
  for (let i = maxChunkLen; i < fullString.length; i += maxChunkLen) {
    const slice = fullString.substring(i, i + maxChunkLen);
    statements.push(`UPDATE stories SET ${field} = ${field} || '${slice.replace(/'/g, "''")}' WHERE id = '${id}';`);
  }
  return statements;
}

const testStatements = splitIntoSqlChunks('story_om_lay', 'content_html', 'a'.repeat(85000));
console.log('Generated statements:', testStatements.length);
testStatements.forEach((s, idx) => console.log(`Statement ${idx+1} length: ${s.length}`));
