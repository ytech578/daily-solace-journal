const fs = require('fs');
let content = fs.readFileSync('src/services/email.service.ts', 'utf8');
content = content.replace(/\\`/g, '`');
content = content.replace(/\\\$/g, '$');
fs.writeFileSync('src/services/email.service.ts', content);
